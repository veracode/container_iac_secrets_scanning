import * as core from "@actions/core"
import * as github from "@actions/github"
import * as fs from 'fs'

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
    const policyRelevantFindings = extractPolicyRelevantFindings(results)

    if (policyRelevantFindings.length === 0) {
      core.info('No policy-relevant misconfigurations found')
      return
    }

    core.info(`Found ${policyRelevantFindings.length} policy-relevant misconfigurations`)

    // Group findings by file and title to avoid duplicate issues
    const groupedFindings = groupFindingsByFileAndTitle(policyRelevantFindings)

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
      const issueTitle = `[IaC] ${finding.title} - ${finding.file}`
      
      // Check for duplicate issues
      if (isDuplicateIssue(existingIssues, finding.file, finding.title)) {
        if (debug === "true") {
          core.info(`Skipping duplicate issue: ${issueTitle}`)
        }
        skippedCount++
        continue
      }

      const issueBody = generateIssueBody(findings)

      if (debug === "true") {
        core.info(`Creating issue: ${issueTitle}`)
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

function isDuplicateIssue(existingIssues: any[], file: string, title: string): boolean {
  const normalizedTitle = `[IaC] ${title} - ${file}`
  
  return existingIssues.some(issue => {
    // Check if title matches exactly
    if (issue.title === normalizedTitle) {
      return true
    }
    
    // Also check if it's the same file and title (case-insensitive)
    const issueTitleLower = issue.title.toLowerCase()
    const normalizedTitleLower = normalizedTitle.toLowerCase()
    
    if (issueTitleLower === normalizedTitleLower) {
      return true
    }
    
    // Check if the issue title contains the same file and title pattern
    if (issueTitleLower.includes(`[iac]`) && 
        issueTitleLower.includes(title.toLowerCase()) && 
        issueTitleLower.includes(file.toLowerCase())) {
      return true
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

function extractPolicyRelevantFindings(results: ResultsJson): PolicyRelevantFinding[] {
  const findings: PolicyRelevantFinding[] = []

  // Get policy failures
  const policyFailures = results["policy-results"]?.[0]?.failures || []

  // Get all misconfigurations
  const allMisconfigurations = results.misconfigurations || []

  // Create a map of file -> title -> misconfiguration for quick lookup
  const misconfigMap = new Map<string, Map<string, Misconfiguration[]>>()

  for (const misconfigResult of allMisconfigurations) {
    const file = misconfigResult.Target
    if (!misconfigMap.has(file)) {
      misconfigMap.set(file, new Map())
    }
    const fileMap = misconfigMap.get(file)!

    for (const misconfig of misconfigResult.Misconfigurations || []) {
      const title = misconfig.Title || misconfig.ID || 'Unknown'
      if (!fileMap.has(title)) {
        fileMap.set(title, [])
      }
      fileMap.get(title)!.push(misconfig)
    }
  }

  // Parse policy failures and match with misconfigurations
  for (const failure of policyFailures) {
    // Policy failure format: "config.rego failed - Found {SEVERITY} issues in infrastructure as code: {file}: {title}"
    const match = failure.msg.match(/Found (CRITICAL|HIGH|MEDIUM|LOW) issues in infrastructure as code: ([^:]+): (.+)/)
    if (match) {
      const severity = match[1]
      const file = match[2].trim()
      const title = match[3].trim()

      // Find matching misconfiguration
      const fileMap = misconfigMap.get(file)
      if (fileMap) {
        const misconfigs = fileMap.get(title) || []
        if (misconfigs.length > 0) {
          const misconfig = misconfigs[0] // Use first match
          findings.push({
            file,
            title,
            severity,
            description: misconfig.Description,
            message: misconfig.Message,
            resolution: misconfig.Resolution,
            startLine: misconfig.CauseMetadata?.StartLine,
            endLine: misconfig.CauseMetadata?.EndLine,
            id: misconfig.ID,
            avdid: misconfig.AVDID,
            primaryURL: misconfig.PrimaryURL,
            provider: misconfig.CauseMetadata?.Provider,
            service: misconfig.CauseMetadata?.Service,
            namespace: misconfig.Namespace,
            query: misconfig.Query,
            references: misconfig.References,
            type: misconfig.Type,
            codeLines: misconfig.CauseMetadata?.Code?.Lines?.map(line => ({
              number: line.Number,
              content: line.Content
            }))
          })
        } else {
          // If no exact match, create finding from policy failure
          findings.push({
            file,
            title,
            severity
          })
        }
      } else {
        // If file not found in misconfigurations, create finding from policy failure
        findings.push({
          file,
          title,
          severity
        })
      }
    }
  }

  return findings
}

function groupFindingsByFileAndTitle(
  findings: PolicyRelevantFinding[]
): Record<string, PolicyRelevantFinding[]> {
  const grouped: Record<string, PolicyRelevantFinding[]> = {}

  for (const finding of findings) {
    const key = `${finding.file}::${finding.title}`
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(finding)
  }

  return grouped
}

function generateIssueBody(findings: PolicyRelevantFinding[]): string {
  const finding = findings[0]
  let body = `## Infrastructure as Code Misconfiguration\n\n`
  
  body += `**File:** \`${finding.file}\`\n\n`
  body += `**Severity:** ${finding.severity}\n\n`
  
  if (finding.id) {
    body += `**ID:** ${finding.id}\n\n`
  }

  if (finding.avdid) {
    body += `**AVD ID:** ${finding.avdid}\n\n`
  }

  if (finding.provider) {
    body += `**Provider:** ${finding.provider}\n\n`
  }

  if (finding.service) {
    body += `**Service:** ${finding.service}\n\n`
  }

  if (finding.type) {
    body += `**Type:** ${finding.type}\n\n`
  }

  if (finding.description) {
    body += `### Description\n\n${finding.description}\n\n`
  }

  if (finding.message) {
    body += `### Message\n\n${finding.message}\n\n`
  }

  if (finding.startLine !== undefined) {
    body += `**Location:** Lines ${finding.startLine}`
    if (finding.endLine !== undefined && finding.endLine !== finding.startLine) {
      body += `-${finding.endLine}`
    }
    body += `\n\n`
  }

  // Add code snippet if available
  if (finding.codeLines && finding.codeLines.length > 0) {
    body += `### Code Location\n\n\`\`\`\n`
    finding.codeLines.forEach(line => {
      body += `${line.number}: ${line.content}\n`
    })
    body += `\`\`\`\n\n`
  }

  if (finding.resolution) {
    body += `### Resolution\n\n${finding.resolution}\n\n`
  }

  if (finding.namespace) {
    body += `**Namespace:** \`${finding.namespace}\`\n\n`
  }

  if (finding.query) {
    body += `**Query:** \`${finding.query}\`\n\n`
  }

  if (finding.primaryURL) {
    body += `**Primary Reference:** ${finding.primaryURL}\n\n`
  }

  if (finding.references && finding.references.length > 0) {
    body += `### Additional References\n\n`
    finding.references.forEach(ref => {
      body += `- ${ref}\n`
    })
    body += `\n`
  }

  if (findings.length > 1) {
    body += `\n---\n\n*This issue represents ${findings.length} similar findings.*\n`
  }

  body += `\n---\n*Generated by Veracode Container/IaC/Secrets Scanning GitHub Action*`

  return body
}

