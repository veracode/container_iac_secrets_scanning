#!/usr/bin/env node
import * as core from "@actions/core"
import * as github from "@actions/github"
import { execSync } from "child_process";
import { env } from "process";
import * as fs from 'fs';
import { run_cli } from "./run_command";
import { install_cli } from "./install_cli";
import { store_artifacts } from "./store_artifacts";
import path from "path";

const runnerOS = process.env.RUNNER_OS;

async function download_policy(policyName: string, debug: any): Promise<string> {
  // URL encode the policy name (e.g., %26 for &, %2F for /)
  const encodedPolicyName = encodeURIComponent(policyName);
  const policyFileName = `${encodedPolicyName}.rego`;

  if (runnerOS == 'Windows') {
    const appdata = process.env.APPDATA ?? "";
    const cliPathVera = path.join(appdata, 'veracode');
    const cliPath = path.join(cliPathVera, 'veracode.exe');
    const policyCommand = `policy get ${encodedPolicyName}`;

    if (debug == "true") {
      core.info('#### DEBUG START ####');
      core.info('containerScan.ts - downloading policy');
      core.info(`Policy command: ${cliPath} ${policyCommand}`);
      core.info('#### DEBUG END ####');
    }

    try {
      execSync(`${cliPath} ${policyCommand}`, { stdio: 'inherit' });
      core.info(`Policy downloaded: ${policyFileName}`);
    } catch (error: any) {
      core.error(`Failed to download policy: ${error.message}`);
      throw error;
    }
  } else {
    const policyCommand = `policy get ${encodedPolicyName}`;
    const fullCommand = `../veracode-cli/veracode ${policyCommand}`;

    if (debug == "true") {
      core.info('#### DEBUG START ####');
      core.info('containerScan.ts - downloading policy');
      core.info(`Policy command: ${fullCommand}`);
      core.info('#### DEBUG END ####');
    }

    try {
      execSync(fullCommand, { stdio: 'inherit' });
      core.info(`Policy downloaded: ${policyFileName}`);
    } catch (error: any) {
      core.error(`Failed to download policy: ${error.message}`);
      throw error;
    }
  }

  return policyFileName;
}

export async function ContainerScan(parameters: any) {

  //install the cli
  install_cli(parameters)

  env.VERACODE_API_KEY_ID = parameters.vid
  env.VERACODE_API_KEY_SECRET = parameters.vkey
  const generate_sbom_output = parameters.generate_sbom_output !== 'false';

  //download policy if provided
  let policyFileName = "";
  if (parameters.policy && parameters.policy.trim() !== "") {
    try {
      policyFileName = await download_policy(parameters.policy, parameters.debug);
    } catch (error: any) {
      core.error(`Failed to download policy: ${error.message}`);
      throw error;
    }
  }

  // 'policy get' exits 0 even when the policy yields no IaC/container rules. In that case
  // no .rego file is written, and passing a missing file to the scan makes the CLI exit 0
  // without producing any results at all.
  const localPolicyFileName = `${parameters.policy}.rego`;
  if (!fs.existsSync(localPolicyFileName)) {
    core.warning('No matching IaC rules available in policy. Proceeding without policy evaluation.');
    policyFileName = "";
  } else {
    policyFileName = localPolicyFileName;
  }

  //run this when oputput is requires and we may create issues and/or PR decorations
  if (parameters.command == "scan") {

    //generate command to run
    const scanJsonCommand = `${parameters.command} --source ${parameters.source} --type ${parameters.type} --format json --output results.json --temp ./` + (policyFileName !== "" ? ` --policy ${policyFileName}` : '');
    const scanTextCommand = `${parameters.command} --source ${parameters.source} --type ${parameters.type} --format table --output results.txt --temp ./` + (policyFileName !== "" ? ` --policy ${policyFileName}` : '');

    if (parameters.debug == "true") {
      core.info('#### DEBUG START ####')
      core.info('containerScan.ts - original scan command')
      core.info(scanJsonCommand)
      core.info(scanTextCommand)
      core.info('#### DEBUG END ####')
    }

    const sbomConfigs = [
      { format: 'cyclonedx-xml', file: 'sbom_cyclonedx_xml.xml' },
      { format: 'cyclonedx-json', file: 'sbom_cyclonedx_json.json' },
      { format: 'spdx-tag-value', file: 'sbom_spdx_tag_value.json' },
      { format: 'spdx-json', file: 'sbom_spdx_json.json' },
      { format: 'github', file: 'sbom_github.json' }
    ];

    const buildSbomCommands = () =>
      sbomConfigs.map(({ format, file }) =>
        run_cli(
          `sbom --source ${parameters.source} --type ${parameters.type} --format ${format} --output ${file}`,
          parameters.debug,
          file,
          parameters.fail_build_on_error
        )
      );

    const commands: Promise<any>[] = [];

    if (parameters.format === 'json') {
      commands.push(run_cli(scanJsonCommand, parameters.debug, 'results.json', parameters.fail_build_on_error));
      commands.push(run_cli(scanTextCommand, parameters.debug, 'results.txt', parameters.fail_build_on_error));
    } else {
      commands.push(run_cli(scanTextCommand, parameters.debug, 'results.txt', parameters.fail_build_on_error));
    }

    if (generate_sbom_output) {
      commands.push(...buildSbomCommands());
    }

    async function runParallelFunctions(): Promise<void> {
      await Promise.all(commands);
      core.info('All functions completed in parallel');
    }

    runParallelFunctions().catch((error) => {
      console.error('An error occurred:', error);
    });

    const files = [
      parameters.format === 'json' ? 'results.json' : undefined,
      'results.txt',
      ...(generate_sbom_output ? sbomConfigs.map(c => c.file) : [])
    ].filter((file): file is string => !!file);

    await store_artifacts(files, parameters.debug, parameters.platformType);

    //Start here for results outpout

    let results: any = ""

    if (fs.existsSync('results.txt')) {
      console.log(`Processing file: results.txt`);
      results = fs.readFileSync('results.txt', 'utf8');
    } else {
      throw `Unable to locate scan results file: results.txt`;
    }

    //creating the body for the comment
    let commentBody: string = '<pre>Veracode Container/IaC/Sercets Scan Summary\n'
    commentBody = commentBody + '\n<details><summary>details</summary><p>\n'
    commentBody = commentBody + results
    commentBody = commentBody + '\n</p></details>\n</pre>'

    core.info(results)

    if (parameters.debug == "true") {
      core.info('#### DEBUG START ####')
      core.info('containerScan.ts')
      core.info('comment Body')
      core.info(commentBody)
      core.info('#### DEBUG END ####')
    }

    if (parameters.isPR >= 1) {
      core.info("This run is part of a PR, should add some PR comment")

      try {
        const baseUrl = process.env.GITHUB_API_URL || 'https://api.github.com';
        const octokit = github.getOctokit(parameters.token, { baseUrl });

        const context = github.context
        const repository: any = process.env.GITHUB_REPOSITORY
        const repo = repository.split("/");
        const commentID: any = context.payload.pull_request?.number;

        const { data: comment } = await octokit.rest.issues.createComment({
          owner: repo[0],
          repo: repo[1],
          issue_number: commentID,
          body: commentBody,
        });
        core.info('Adding scan results as comment to PR #' + commentID)
      } catch (error: any) {
        core.info(error);
      }
    }

    if (parameters.fail_build == "true") {
      // Check for policy failures - look for "Failed" in the Policy Status column
      // The new format has a table with "Policy Status │ ... │ Failed │ ..." pattern
      // We search for "│ Failed" or "Failed │" to find rows with failed policy status
      let policyFailed = false;

      if (policyFileName !== "") {
        // When policy is used, check for "Failed" in Policy Status column
        // The table format has " Failed        │" at the start of a line (after header)
        // Look for pattern like " Failed" at start of line (with leading space) or "│ Failed │"
        const regex = /^\s+Failed\s+│|│\s+Failed\s+│/gm;
        const matches = results.match(regex);
        policyFailed = matches !== null && matches.length > 0;

        if (parameters.debug == "true") {
          core.info('#### DEBUG START ####')
          core.info('containerScan.ts - Policy evaluation')
          core.info('Policy file: ' + policyFileName)
          core.info('Policy failures found: ' + (matches ? matches.length : 0))
          core.info('Fail Build? ' + policyFailed)
          core.info('#### DEBUG END ####')
        }
      } else {
        // Fallback to old format check for backward compatibility
        const regex = /Policy\ Passed\ =\ false/g;
        const policyPassed: any = commentBody.search(regex)
        policyFailed = policyPassed > 1;

        if (parameters.debug == "true") {
          core.info('#### DEBUG START ####')
          core.info('containerScan.ts - No policy specified, using legacy check')
          core.info('Policy Passed check result: ' + policyPassed)
          core.info('Fail Build? ' + policyFailed)
          core.info('#### DEBUG END ####')
        }
      }

      if (policyFailed) {
        core.info('Veracode Container Scanning failed')
        core.setFailed('Veracode Container Scanning failed')
      }
      else {
        core.info('Veracode Container Scanning passed')
      }
    }
  }
  else if (parameters.command == "sbom") {
    // This is where only the SBOM part is runnuing
    if (parameters.debug == "true") {
      core.info('#### DEBUG START ####')
      core.info('containerScan.ts')
      core.info('SBOM generation part')
      core.info('#### DEBUG END ####')
    }

    //set the correct filename based on the format
    let filename = ""
    if (parameters.format == "cyclonedx-xml") {
      filename = 'sbom_cyclonedx_xml.xml'
    }
    else if (parameters.format == "cyclonedx-json") {
      filename = 'sbom_cyclonedx_json.json'
    }
    else if (parameters.format == "spdx-tag-value") {
      filename = 'sbom_spdx_tag_value.json'
    }
    else if (parameters.format == "spdx-json") {
      filename = 'sbom_spdx_json.json'
    }
    else if (parameters.format == "github") {
      filename = 'sbom_github.json'
    }
    else {
      filename = 'sbom.txt'
    }

    if (parameters.debug == "true") {
      core.info('#### DEBUG START ####')
      core.info('containerScan.ts')
      core.info('SBOM filename: ' + filename)
      core.info('#### DEBUG END ####')
    }

    const resultFile = [filename]

    //generate command to run
    let scanCommandOriginal = `${parameters.command} --source ${parameters.source} --type ${parameters.type} --format ${parameters.format} --output ${filename}`
    run_cli(scanCommandOriginal, parameters.debug, filename, parameters.fail_build_on_error)
    let storeArtifacts = await store_artifacts(resultFile, parameters.debug, parameters?.platformType)

  }



}
