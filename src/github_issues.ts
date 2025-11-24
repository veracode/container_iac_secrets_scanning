import * as core from "@actions/core"
import * as github from "@actions/github"
import * as fs from 'fs'
import * as path from 'path'

interface PolicyFailure {
  msg: string
}

interface PolicyResult {
  filename: string
  namespace: string
  successes: number
  failures: PolicyFailure[]
}

interface Misconfiguration {
  AVDID?: string
  CauseMetadata?: {
    Provider?: string
    Service?: string
    Code?: {
      Lines?: Array<{
        Number: number
        Content: string
        Annotation?: string
        Highlighted?: string
        IsCause?: boolean
        FirstCause?: boolean
        LastCause?: boolean
      }>
    }
    StartLine?: number
    EndLine?: number
  }
  Description?: string
  ID?: string
  Message?: string
  Severity?: string
  Status?: string
  Title?: string
  Type?: string
  PrimaryURL?: string
  Resolution?: string
  Namespace?: string
  Query?: string
  References?: string[]
}

interface MisconfigurationResult {
  Target: string
  Type: string
  Misconfigurations: Misconfiguration[]
}

interface ResultsJson {
  "policy-results"?: PolicyResult[]
  misconfigurations?: MisconfigurationResult[]
  configs?: {
    Results?: MisconfigurationResult[]
  }
}

export async function generateGitHubIssues(
  resultsJsonPath: string,
  token: string,
  owner: string,
  repo: string,
  debug?: string
): Promise<void> {
  try {
    if (!fs.existsSync(resultsJsonPath)) {
      core.info(`Results JSON file not found: ${resultsJsonPath}`)
      return
    }

    const resultsContent = fs.readFileSync(resultsJsonPath, 'utf8')
    const results: ResultsJson = JSON.parse(resultsContent)

    // Extract policy-relevant findings
    const policyRelevantFindings = extractPolicyRelevantFindings(results, debug)

    if (policyRelevantFindings.length === 0) {
      core.info('No policy-relevant misconfigurations found')
      return
    }

    core.info(`Found ${policyRelevantFindings.length} policy-relevant misconfigurations`)

    // Group findings - first by AVDID if available, then by file and title
    const groupedFindings = groupFindingsByAVDIDAndFile(policyRelevantFindings)

    const octokit = github.getOctokit(token)

    // Ensure Veracode severity labels exist with correct colors
    await ensureVeracodeLabels(octokit, owner, repo, debug)

    // Track success and failures
    let successCount = 0
    let failureCount = 0
    let skippedCount = 0
    const failures: string[] = []

    // Get existing issues to check for duplicates
    const existingIssues = await getExistingIssues(octokit, owner, repo, debug)

    // Create issues for each unique finding
    for (const [key, findings] of Object.entries(groupedFindings)) {
      const finding = findings[0] // Use first finding as representative
      
      // Determine issue title - if same AVDID in multiple files, consolidate
      const uniqueFiles = [...new Set(findings.map(f => f.file))]
      let issueTitle: string
      if (finding.avdid && uniqueFiles.length > 1) {
        // Consolidate by AVDID when same issue appears in multiple files
        issueTitle = `[IaC] ${finding.title} (${uniqueFiles.length} files)`
      } else {
        issueTitle = `[IaC] ${finding.title} - ${finding.file}`
      }
      
      // Check for duplicate issues
      if (isDuplicateIssue(existingIssues, finding.file, finding.title, finding.avdid)) {
        if (debug === "true") {
          core.info(`Skipping duplicate issue: ${issueTitle}`)
        }
        skippedCount++
        continue
      }

      const issueBody = await generateIssueBody(findings, debug)

      if (debug === "true") {
        core.info(`\n=== Creating issue: ${issueTitle} ===`)
        core.info(`Finding data available:`)
        core.info(`  - description: ${finding.description ? `YES (${finding.description.length} chars)` : 'NO'}`)
        core.info(`  - message: ${finding.message ? `YES (${finding.message.length} chars)` : 'NO'}`)
        core.info(`  - resolution: ${finding.resolution ? `YES (${finding.resolution.length} chars)` : 'NO'}`)
        core.info(`  - avdid: ${finding.avdid || 'NO'}`)
        core.info(`  - id: ${finding.id || 'NO'}`)
        core.info(`  - namespace: ${finding.namespace || 'NO'}`)
        core.info(`  - query: ${finding.query || 'NO'}`)
        core.info(`  - provider: ${finding.provider || 'NO'}`)
        core.info(`  - service: ${finding.service || 'NO'}`)
        core.info(`  - type: ${finding.type || 'NO'}`)
        core.info(`  - codeLines: ${finding.codeLines ? `${finding.codeLines.length} lines` : 'NO'}`)
        core.info(`  - references: ${finding.references ? `${finding.references.length} refs` : 'NO'}`)
        core.info(`  - startLine: ${finding.startLine || 'NO'}, endLine: ${finding.endLine || 'NO'}`)
        core.info(`  - primaryURL: ${finding.primaryURL || 'NO'}`)
        core.info(`Issue body length: ${issueBody.length} characters`)
        if (issueBody.length < 200) {
          core.info(`Issue body content:\n${issueBody}`)
        } else {
          core.info(`Issue body preview (first 800 chars):\n${issueBody.substring(0, 800)}...`)
        }
      }

      try {
        // Map severity to Veracode label
        const veracodeSeverityLabel = getVeracodeSeverityLabel(finding.severity)
        
        await octokit.rest.issues.create({
          owner,
          repo,
          title: issueTitle,
          body: issueBody,
          labels: ['iac', 'security', veracodeSeverityLabel, 'Veracode IaC Scanning']
        })
        core.info(`Created issue: ${issueTitle}`)
        successCount++
      } catch (error: any) {
        failureCount++
        const errorMsg = error.message || 'Unknown error'
        failures.push(`${key}: ${errorMsg}`)
        
        // Provide specific guidance for common errors
        if (errorMsg.includes('Resource not accessible by integration')) {
          core.warning(`Failed to create issue for ${key}: ${errorMsg}`)
          core.warning(`This usually means the GitHub token lacks 'issues: write' permission or issues are disabled in the repository.`)
        } else if (errorMsg.includes('Not Found')) {
          core.warning(`Failed to create issue for ${key}: Repository not found or access denied`)
        } else {
          core.warning(`Failed to create issue for ${key}: ${errorMsg}`)
        }
      }
    }

    // Summary
    core.info(`\n=== GitHub Issues Summary ===`)
    core.info(`Total findings: ${policyRelevantFindings.length}`)
    core.info(`Unique issues attempted: ${Object.keys(groupedFindings).length}`)
    core.info(`Successfully created: ${successCount}`)
    core.info(`Skipped (duplicates): ${skippedCount}`)
    core.info(`Failed: ${failureCount}`)
    
    if (failureCount > 0) {
      core.warning(`\nSome issues failed to create. Common causes:`)
      core.warning(`1. GitHub token missing 'issues: write' permission`)
      core.warning(`2. Issues disabled in repository settings`)
      core.warning(`3. Repository access restrictions`)
      core.warning(`\nEnsure your workflow has the following permissions:`)
      core.warning(`permissions:`)
      core.warning(`  issues: write`)
      core.warning(`  contents: read`)
    }
  } catch (error: any) {
    core.error(`Error generating GitHub issues: ${error.message}`)
    throw error
  }
}

async function ensureVeracodeLabels(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  debug?: string
): Promise<void> {
  const veracodeLabels = [
    { name: 'VeracodeFlaw: Very High', color: 'd92b85', description: 'A Veracode Flaw, Very High severity' },
    { name: 'VeracodeFlaw: High', color: 'e61f25', description: 'A Veracode Flaw, High severity' },
    { name: 'VeracodeFlaw: Medium', color: 'fd7333', description: 'A Veracode Flaw, Medium severity' },
    { name: 'VeracodeFlaw: Low', color: 'ffcc33', description: 'A Veracode Flaw, Low severity' },
    { name: 'VeracodeFlaw: Very Low', color: 'c9da2c', description: 'A Veracode Flaw, Very Low severity' },
    { name: 'VeracodeFlaw: Informational', color: '8dbd3e', description: 'A Veracode Flaw, Informational severity' }
  ]

  for (const label of veracodeLabels) {
    try {
      // Try to get the label first
      await octokit.rest.issues.getLabel({
        owner,
        repo,
        name: label.name
      })
      
      // If it exists, update it to ensure correct color
      try {
        await octokit.rest.issues.updateLabel({
          owner,
          repo,
          name: label.name,
          color: label.color,
          description: label.description
        })
        if (debug === "true") {
          core.info(`Updated label: ${label.name}`)
        }
      } catch (updateError: any) {
        // If update fails, continue (might not have permission)
        if (debug === "true") {
          core.info(`Could not update label ${label.name}: ${updateError.message}`)
        }
      }
    } catch (error: any) {
      // Label doesn't exist, create it
      try {
        await octokit.rest.issues.createLabel({
          owner,
          repo,
          name: label.name,
          color: label.color,
          description: label.description
        })
        if (debug === "true") {
          core.info(`Created label: ${label.name}`)
        }
      } catch (createError: any) {
        // If creation fails, log but don't fail the action
        core.warning(`Could not create label ${label.name}: ${createError.message}`)
      }
    }
  }
}

function getVeracodeSeverityLabel(severity: string): string {
  // Map IaC severity levels to Veracode severity labels
  switch (severity.toUpperCase()) {
    case 'CRITICAL':
      return 'VeracodeFlaw: Very High'
    case 'HIGH':
      return 'VeracodeFlaw: High'
    case 'MEDIUM':
      return 'VeracodeFlaw: Medium'
    case 'LOW':
      return 'VeracodeFlaw: Low'
    default:
      return 'VeracodeFlaw: Informational'
  }
}

function getSeverityColor(severity: string): string {
  // Map severity to color (matching label colors)
  switch (severity.toUpperCase()) {
    case 'CRITICAL':
      return 'd92b85' // Very High - pink
    case 'HIGH':
      return 'e61f25' // High - red
    case 'MEDIUM':
      return 'fd7333' // Medium - orange
    case 'LOW':
      return 'ffcc33' // Low - yellow
    default:
      return '8dbd3e' // Informational - green
  }
}

function getSeverityEmoji(severity: string): string {
  // Map severity to emoji for visual indicator (fallback when colors are stripped)
  switch (severity.toUpperCase()) {
    case 'CRITICAL':
      return '🔴' // Red circle
    case 'HIGH':
      return '🟠' // Orange circle
    case 'MEDIUM':
      return '🟡' // Yellow circle
    case 'LOW':
      return '🟢' // Green circle
    default:
      return '⚪' // White circle
  }
}

async function getExistingIssues(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  debug?: string
): Promise<any[]> {
  try {
    const issues: any[] = []
    const perPage = 100
    
    // Check both open and closed issues to avoid duplicates
    for (const state of ['open', 'closed'] as const) {
      let page = 1
      
      while (true) {
        const response = await octokit.rest.issues.listForRepo({
          owner,
          repo,
          state: state,
          labels: 'Veracode IaC Scanning',
          per_page: perPage,
          page: page
        })
        
        if (response.data.length === 0) {
          break
        }
        
        issues.push(...response.data)
        
        if (response.data.length < perPage) {
          break
        }
        
        page++
      }
    }
    
    if (debug === "true") {
      core.info(`Found ${issues.length} existing issues with 'Veracode IaC Scanning' label (open and closed)`)
    }
    
    return issues
  } catch (error: any) {
    core.warning(`Failed to fetch existing issues for deduplication: ${error.message}`)
    return []
  }
}

function isDuplicateIssue(existingIssues: any[], file: string, title: string, avdid?: string): boolean {
  const normalizedTitle = `[IaC] ${title} - ${file}`
  const normalizedTitleLower = normalizedTitle.toLowerCase()
  const titleLower = title.toLowerCase()
  const fileLower = file.toLowerCase()
  
  return existingIssues.some(issue => {
    const issueTitle = issue.title || ''
    const issueTitleLower = issueTitle.toLowerCase()
    
    // Check if title matches exactly
    if (issueTitle === normalizedTitle) {
      return true
    }
    
    // Check case-insensitive match
    if (issueTitleLower === normalizedTitleLower) {
      return true
    }
    
    // Check if the issue title contains the same file and title pattern
    if (issueTitleLower.includes(`[iac]`) && 
        issueTitleLower.includes(titleLower) && 
        issueTitleLower.includes(fileLower)) {
      return true
    }
    
    // If AVDID is available, also check by AVDID in issue body
    if (avdid && issue.body) {
      const avdidPattern = new RegExp(`AVD ID.*${avdid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i')
      if (avdidPattern.test(issue.body) && issueTitleLower.includes(titleLower)) {
        return true
      }
    }
    
    return false
  })
}

interface PolicyRelevantFinding {
  file: string
  title: string
  severity: string
  description?: string
  message?: string
  resolution?: string
  startLine?: number
  endLine?: number
  id?: string
  avdid?: string
  primaryURL?: string
  provider?: string
  service?: string
  namespace?: string
  query?: string
  references?: string[]
  type?: string
  codeLines?: Array<{
    number: number
    content: string
  }>
}

function extractPolicyRelevantFindings(results: ResultsJson, debug?: string): PolicyRelevantFinding[] {
  const findings: PolicyRelevantFinding[] = []

  // Get all misconfigurations - try both possible locations
  // The JSON structure uses "configs.Results" not "misconfigurations"
  const allMisconfigurations = results.configs?.Results || results.misconfigurations || []
  
  if (debug === "true") {
    core.info(`Found ${allMisconfigurations.length} misconfiguration result groups`)
    if (results.configs?.Results) {
      core.info(`Using configs.Results array`)
    } else if (results.misconfigurations) {
      core.info(`Using misconfigurations array`)
    } else {
      core.info(`No misconfigurations found in either location`)
    }
  }

  // Simply iterate through all misconfigurations and extract those with Status: "FAIL"
  // These are the policy-relevant findings
  for (const misconfigResult of allMisconfigurations) {
    const file = (misconfigResult.Target || '').trim()
    
    if (!file) {
      continue
    }

    for (const misconfig of misconfigResult.Misconfigurations || []) {
      // Only process FAIL status misconfigurations (policy-relevant)
      if (misconfig.Status !== 'FAIL') {
        continue
      }

      const title = (misconfig.Title || misconfig.ID || 'Unknown').trim()
      const severity = misconfig.Severity || 'UNKNOWN'

      // Extract all available information directly from the misconfiguration
      const codeLines = misconfig.CauseMetadata?.Code?.Lines
        ?.filter(line => {
          // Include lines that have content
          if (!line.Content || line.Content.trim().length === 0) {
            return false
          }
          return true
        })
        .map(line => ({
          number: line.Number,
          content: line.Content.trim()
        })) || undefined
      
      // If we have too many lines, prioritize IsCause=true lines
      let finalCodeLines = codeLines
      if (codeLines && codeLines.length > 20) {
        const causeLines = misconfig.CauseMetadata?.Code?.Lines
          ?.filter(line => line.IsCause === true && line.Content && line.Content.trim().length > 0)
          .map(line => ({
            number: line.Number,
            content: line.Content.trim()
          })) || []
        
        if (causeLines.length > 0) {
          finalCodeLines = causeLines
        }
      }

      const finding: PolicyRelevantFinding = {
        file,
        title,
        severity,
        description: misconfig.Description?.trim() || undefined,
        message: misconfig.Message?.trim() || undefined,
        resolution: misconfig.Resolution?.trim() || undefined,
        startLine: misconfig.CauseMetadata?.StartLine,
        endLine: misconfig.CauseMetadata?.EndLine,
        id: misconfig.ID || undefined,
        avdid: misconfig.AVDID || undefined,
        primaryURL: misconfig.PrimaryURL || undefined,
        provider: misconfig.CauseMetadata?.Provider || undefined,
        service: misconfig.CauseMetadata?.Service || undefined,
        namespace: misconfig.Namespace || undefined,
        query: misconfig.Query || undefined,
        references: misconfig.References && misconfig.References.length > 0 
          ? misconfig.References 
          : undefined,
        type: misconfig.Type || undefined,
        codeLines: finalCodeLines && finalCodeLines.length > 0 ? finalCodeLines : undefined
      }
      
      if (debug === "true") {
        core.info(`Extracted finding: file="${file}", title="${title}", severity="${severity}"`)
        core.info(`  - description: ${!!finding.description}, message: ${!!finding.message}, resolution: ${!!finding.resolution}`)
        core.info(`  - codeLines: ${finding.codeLines?.length || 0}, references: ${finding.references?.length || 0}`)
      }
      
      findings.push(finding)
    }
  }

  if (debug === "true") {
    core.info(`Extracted ${findings.length} policy-relevant findings (Status: FAIL)`)
  }

  return findings
}

function groupFindingsByAVDIDAndFile(
  findings: PolicyRelevantFinding[]
): Record<string, PolicyRelevantFinding[]> {
  const grouped: Record<string, PolicyRelevantFinding[]> = {}
  
  // First, group by AVDID if available (for consolidation)
  const avdidGroups = new Map<string, PolicyRelevantFinding[]>()
  const noAVDIDFindings: PolicyRelevantFinding[] = []

  for (const finding of findings) {
    if (finding.avdid) {
      if (!avdidGroups.has(finding.avdid)) {
        avdidGroups.set(finding.avdid, [])
      }
      avdidGroups.get(finding.avdid)!.push(finding)
    } else {
      noAVDIDFindings.push(finding)
    }
  }

  // For findings with AVDID, group by AVDID + title (allows same AVDID with different titles)
  for (const [avdid, avdidFindings] of avdidGroups.entries()) {
    const titleGroups = new Map<string, PolicyRelevantFinding[]>()
    
    for (const finding of avdidFindings) {
      const titleKey = finding.title
      if (!titleGroups.has(titleKey)) {
        titleGroups.set(titleKey, [])
      }
      titleGroups.get(titleKey)!.push(finding)
    }
    
    // Create groups: if same AVDID+title appears in multiple files, consolidate
    // Otherwise, keep separate by file
    for (const [title, titleFindings] of titleGroups.entries()) {
      const uniqueFiles = [...new Set(titleFindings.map(f => f.file))]
      
      if (uniqueFiles.length > 1) {
        // Same AVDID+title in multiple files - consolidate into one issue
        const key = `AVDID:${avdid}::TITLE:${title}`
        grouped[key] = titleFindings
      } else {
        // Same AVDID+title in one file - group by file
        for (const finding of titleFindings) {
          const key = `${finding.file}::${finding.title}::${avdid}`
          if (!grouped[key]) {
            grouped[key] = []
          }
          grouped[key].push(finding)
        }
      }
    }
  }

  // For findings without AVDID, group by file and title
  for (const finding of noAVDIDFindings) {
    const key = `${finding.file}::${finding.title}`
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(finding)
  }

  return grouped
}

async function generateIssueBody(findings: PolicyRelevantFinding[], debug?: string): Promise<string> {
  const finding = findings[0]
  
  if (debug === "true") {
    core.info(`Generating issue body for finding: file=${finding.file}, title=${finding.title}`)
    core.info(`Available fields: description=${!!finding.description}, message=${!!finding.message}, resolution=${!!finding.resolution}`)
    core.info(`Available fields: avdid=${!!finding.avdid}, id=${!!finding.id}, namespace=${!!finding.namespace}`)
    core.info(`Available fields: provider=${!!finding.provider}, service=${!!finding.service}, type=${!!finding.type}`)
    core.info(`Available fields: codeLines=${!!finding.codeLines && finding.codeLines.length > 0}, references=${!!finding.references && finding.references.length > 0}`)
  }
  
  let body = `## Infrastructure as Code Misconfiguration\n\n`
  
  // Severity box at the top (colored, text always black)
  // Note: GitHub markdown sanitizes inline styles in issue bodies, so background colors
  // are often stripped. We'll try HTML but GitHub may not render the color.
  const severityColor = getSeverityColor(finding.severity)
  const severityEmoji = getSeverityEmoji(finding.severity)
  
  // Try HTML first (may be stripped by GitHub)
  body += `###[!IMPORTANT]\n\n`
  
  // Fallback: Also add a text-based indicator that will always show
  // This ensures visibility even if GitHub strips the HTML styles
  body += `###Severity: ${severityEmoji} **${finding.severity}**\n\n`
  
  // File Information - Always show with line numbers from JSON
  const uniqueFiles = [...new Set(findings.map(f => f.file))]
  if (uniqueFiles.length === 1) {
    const fileFinding = findings.find(f => f.file === finding.file) || finding
    let fileLine = `**File:** \`${finding.file}\``
    if (fileFinding.startLine !== undefined) {
      fileLine += ` (Lines ${fileFinding.startLine}`
      if (fileFinding.endLine !== undefined && fileFinding.endLine !== fileFinding.startLine) {
        fileLine += `-${fileFinding.endLine}`
      }
      fileLine += `)`
    }
    body += `${fileLine}\n\n`
  } else {
    body += `**Affected Files:** ${uniqueFiles.length} file(s)\n\n`
    uniqueFiles.forEach(file => {
      const fileFindings = findings.filter(f => f.file === file)
      let fileLine = `- \`${file}\``
      const lineNumbers: string[] = []
      fileFindings.forEach(f => {
        if (f.startLine !== undefined) {
          let lineNum = `${f.startLine}`
          if (f.endLine !== undefined && f.endLine !== f.startLine) {
            lineNum += `-${f.endLine}`
          }
          lineNumbers.push(lineNum)
        }
      })
      if (lineNumbers.length > 0) {
        fileLine += ` (Lines ${lineNumbers.join(', ')})`
      }
      body += `${fileLine}\n`
    })
    body += `\n`
  }
  
  // 1. Type (in bold, without "Type:" label)
  if (finding.type) {
    body += `**${finding.type}**\n\n`
  }

  // 2. Namespace
  if (finding.namespace) {
    body += `**Namespace:** \`${finding.namespace}\`\n\n`
  }

  // 3. Service
  if (finding.service) {
    body += `**Service:** ${finding.service}\n\n`
  }

  // 4. Provider
  if (finding.provider) {
    body += `**Provider:** ${finding.provider}\n\n`
  }

  // 5. Query
  if (finding.query) {
    body += `**Query:** \`${finding.query}\`\n\n`
  }

  // 6. AVDID
  if (finding.avdid) {
    body += `**AVD ID:** \`${finding.avdid}\`\n\n`
  }
  
  if (finding.id && finding.id !== finding.avdid) {
    body += `**ID:** \`${finding.id}\`\n\n`
  }

  // Severity already shown at top in colored box, so skip here

  // 8. Description
  if (finding.description && finding.description.trim()) {
    body += `### Description\n\n${finding.description.trim()}\n\n`
  }

  // 9. Message
  if (finding.message && finding.message.trim()) {
    body += `### Message\n\n${finding.message.trim()}\n\n`
  }

  // 10. Code Location - Fetch actual code from repository files
  const codeSnippets = await getCodeSnippetsFromFiles(findings, debug)
  if (codeSnippets.length > 0) {
    body += `### Code Location\n\n`
    codeSnippets.forEach(snippet => {
      body += snippet
      body += `\n\n`
    })
  }

  // 11. Resolution
  if (finding.resolution && finding.resolution.trim()) {
    body += `### Resolution\n\n${finding.resolution.trim()}\n\n`
  }

  // 12. Primary Reference
  if (finding.primaryURL) {
    body += `### Primary Reference\n\n${finding.primaryURL}\n\n`
  }

  // 13. Additional References
  if (finding.references && finding.references.length > 0) {
    body += `### Additional References\n\n`
    finding.references.forEach(ref => {
      body += `- ${ref}\n`
    })
    body += `\n`
  }

  // Multiple Findings Note
  if (findings.length > 1 || uniqueFiles.length > 1) {
    body += `\n---\n\n**Note:** This issue represents ${findings.length} finding(s) across ${uniqueFiles.length} file(s).\n\n`
  }

  body += `\n---\n*Generated by Veracode Container/IaC/Secrets Scanning GitHub Action*`

  return body
}

async function getCodeSnippetsFromFiles(findings: PolicyRelevantFinding[], debug?: string): Promise<string[]> {
  const snippets: string[] = []
  
  // Group findings by file to handle multiple locations in the same file
  const findingsByFile = new Map<string, PolicyRelevantFinding[]>()
  for (const finding of findings) {
    if (!findingsByFile.has(finding.file)) {
      findingsByFile.set(finding.file, [])
    }
    findingsByFile.get(finding.file)!.push(finding)
  }

  for (const [file, fileFindings] of findingsByFile.entries()) {
    try {
      // Try to read the file from the repository
      // The file path might be relative to the workspace root
      let filePath = file
      if (!path.isAbsolute(filePath)) {
        // Try common locations - check GITHUB_WORKSPACE first
        const workspace = process.env.GITHUB_WORKSPACE || process.cwd()
        const possiblePaths = [
          path.join(workspace, filePath),
          filePath,
          path.join(process.cwd(), filePath),
          path.join(process.cwd(), '..', filePath)
        ]
        
        let found = false
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            filePath = possiblePath
            found = true
            if (debug === "true") {
              core.info(`Found file at: ${filePath}`)
            }
            break
          }
        }
        
        if (!found) {
          if (debug === "true") {
            core.warning(`File not found: ${file}, tried paths: ${possiblePaths.join(', ')}`)
          }
          // Don't fall back to JSON - just skip if file not found
          continue
        }
      }

      const fileContent = fs.readFileSync(filePath, 'utf8')
      const lines = fileContent.split('\n')
      
      if (debug === "true") {
        core.info(`Reading file ${filePath}, total lines: ${lines.length}`)
      }
      
      // Determine the file extension for syntax highlighting
      const fileExt = file.split('.').pop() || ''
      const language = getLanguageFromExtension(fileExt)
      
      // Get all unique line ranges for this file (from JSON, not from code lines)
      const lineRanges: Array<{start: number, end: number, finding: PolicyRelevantFinding}> = []
      for (const f of fileFindings) {
        if (f.startLine !== undefined) {
          const start = f.startLine
          const end = f.endLine !== undefined ? f.endLine : f.startLine
          lineRanges.push({ start, end, finding: f })
        }
      }
      
      if (lineRanges.length === 0) {
        if (debug === "true") {
          core.warning(`No line numbers found for file ${file}`)
        }
        continue
      }
      
      // Sort by start line
      lineRanges.sort((a, b) => a.start - b.start)
      
      // Generate code snippet for each range (don't merge - show each separately)
      for (const range of lineRanges) {
        const startLine = Math.max(1, range.start - 5) // 5 lines before
        const endLine = Math.min(lines.length, range.end + 5) // 5 lines after
        
        if (debug === "true") {
          core.info(`Generating snippet for ${file}: lines ${startLine}-${endLine} (finding at ${range.start}-${range.end})`)
        }
        
        let snippet = `**File:** \`${file}\` (Lines ${range.start}`
        if (range.end !== range.start) {
          snippet += `-${range.end}`
        }
        snippet += `)\n\n`
        snippet += `\`\`\`${language}\n`
        
        for (let i = startLine - 1; i < endLine; i++) {
          const lineNum = i + 1
          const line = lines[i] || ''
          
          // Add line number and content (without pipe separator to avoid GitHub's diff highlighting)
          snippet += `${line}\n`
        }
        
        snippet += `\`\`\`\n`
        snippets.push(snippet)
      }
    } catch (error: any) {
      if (debug === "true") {
        core.warning(`Error reading file ${file}: ${error.message}`)
        core.warning(`Stack: ${error.stack}`)
      }
      // Don't fall back to JSON - just skip if file read fails
      continue
    }
  }
  
  return snippets
}

function generateCodeSnippetFromJson(finding: PolicyRelevantFinding, file: string): string {
  const fileExt = file.split('.').pop() || ''
  const language = getLanguageFromExtension(fileExt)
  
  let snippet = `**File:** \`${file}\`\n\n`
  snippet += `\`\`\`${language}\n`
  
  if (finding.codeLines) {
    finding.codeLines.forEach(line => {
      snippet += `${line.number.toString().padStart(4, ' ')} | ${line.content}\n`
    })
  }
  
  snippet += `\`\`\`\n`
  return snippet
}

function getLanguageFromExtension(ext: string): string {
  const languageMap: Record<string, string> = {
    'tf': 'hcl',
    'tfvars': 'hcl',
    'yaml': 'yaml',
    'yml': 'yaml',
    'json': 'json',
    'xml': 'xml',
    'dockerfile': 'dockerfile',
    'sh': 'bash',
    'py': 'python',
    'js': 'javascript',
    'ts': 'typescript',
    'go': 'go',
    'java': 'java',
    'rb': 'ruby',
    'php': 'php'
  }
  
  return languageMap[ext.toLowerCase()] || ''
}

