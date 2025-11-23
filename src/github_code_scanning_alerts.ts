import * as core from "@actions/core"
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
  primaryURL?: string
}

export async function generateCodeScanningAlerts(
  resultsJsonPath: string,
  outputPath: string,
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
      // Create empty SARIF file
      const emptySarif = createEmptySarif()
      fs.writeFileSync(outputPath, JSON.stringify(emptySarif, null, 2))
      return
    }

    core.info(`Found ${policyRelevantFindings.length} policy-relevant misconfigurations`)

    // Generate SARIF file
    const sarif = generateSarif(policyRelevantFindings)

    // Write SARIF file
    fs.writeFileSync(outputPath, JSON.stringify(sarif, null, 2))
    core.info(`SARIF file generated: ${outputPath}`)
  } catch (error: any) {
    core.error(`Error generating code scanning alerts: ${error.message}`)
    throw error
  }
}

function extractPolicyRelevantFindings(results: ResultsJson): PolicyRelevantFinding[] {
  const findings: PolicyRelevantFinding[] = []

  // Get policy failures
  const policyFailures = results["policy-results"]?.[0]?.failures || []

  // Get all misconfigurations - try both possible locations
  // The JSON structure uses "configs.Results" not "misconfigurations"
  const allMisconfigurations = results.configs?.Results || results.misconfigurations || []

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
            id: misconfig.ID || misconfig.AVDID,
            primaryURL: misconfig.PrimaryURL
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

function generateSarif(findings: PolicyRelevantFinding[]): any {
  const sarif: any = {
    version: "2.1.0",
    $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: "Veracode Container/IaC/Secrets Scanning",
            version: "1.0.0",
            informationUri: "https://www.veracode.com",
            rules: [] as any[]
          }
        },
        results: [] as any[],
        artifacts: [] as any[]
      }
    ]
  }

  const rulesMap = new Map<string, any>()
  const artifactsMap = new Map<string, any>()

  for (const finding of findings) {
    // Create rule if not exists
    const ruleId = finding.id || finding.title
    if (!rulesMap.has(ruleId)) {
      const rule: any = {
        id: ruleId,
        name: finding.title,
        shortDescription: {
          text: finding.title
        },
        fullDescription: {
          text: finding.description || finding.title
        },
        defaultConfiguration: {
          level: mapSeverityToLevel(finding.severity)
        },
        helpUri: finding.primaryURL || undefined
      }

      if (finding.resolution) {
        rule.help = {
          text: finding.resolution
        }
      }

      rulesMap.set(ruleId, rule)
    }

    // Create artifact entry if not exists
    if (!artifactsMap.has(finding.file)) {
      artifactsMap.set(finding.file, {
        location: {
          uri: finding.file
        }
      })
    }

    // Create result
    const result: any = {
      ruleId: ruleId,
      message: {
        text: finding.message || finding.title
      },
      level: mapSeverityToLevel(finding.severity),
      locations: [
        {
          physicalLocation: {
            artifactLocation: {
              uri: finding.file
            },
            region: {
              startLine: finding.startLine || 1,
              endLine: finding.endLine || finding.startLine || 1
            }
          }
        }
      ]
    }

    if (finding.description) {
      result.message.text = `${finding.message || finding.title}\n\n${finding.description}`
    }

    sarif.runs[0].results.push(result)
  }

  // Add rules to tool driver
  sarif.runs[0].tool.driver.rules = Array.from(rulesMap.values())

  // Add artifacts
  sarif.runs[0].artifacts = Array.from(artifactsMap.values())

  return sarif
}

function mapSeverityToLevel(severity: string): string {
  switch (severity.toUpperCase()) {
    case 'CRITICAL':
      return 'error'
    case 'HIGH':
      return 'error'
    case 'MEDIUM':
      return 'warning'
    case 'LOW':
      return 'note'
    default:
      return 'warning'
  }
}

function createEmptySarif(): any {
  return {
    version: "2.1.0",
    $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: "Veracode Container/IaC/Secrets Scanning",
            version: "1.0.0",
            informationUri: "https://www.veracode.com"
          }
        },
        results: [],
        artifacts: []
      }
    ]
  }
}

