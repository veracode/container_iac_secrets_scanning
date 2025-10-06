#!/usr/bin/env node
import * as core from "@actions/core"
import * as artifact from '@actions/artifact'
import * as github from "@actions/github"
import { execSync } from "child_process";
import { env } from "process";
import * as fs from 'fs';
import { run_cli } from "./run_command";
import { install_cli } from "./install_cli";
import { store_artifacts } from "./store_artifacts";

export async function ContainerScan(parameters:any) {

  //install the cli
  install_cli(parameters)

  env.VERACODE_API_KEY_ID= parameters.vid
  env.VERACODE_API_KEY_SECRET= parameters.vkey
  
  //run this when oputput is requires and we may create issues and/or PR decorations
  if ( parameters.command == "scan" ){

    let results_file = ""
    if ( parameters.format == "json" ){
      results_file = 'results.json'
    }
    else {
      results_file = 'results.txt'
    }

    //generate command to run
    let scanCommandOriginal = `${parameters.command} --source ${parameters.source} --type ${parameters.type} --format ${parameters.format} --output ${results_file}`
    
    if ( parameters.debug == "true" ){
      core.info('#### DEBUG START ####')
      core.info('containerScan.ts - original scan command')
      core.info(scanCommandOriginal)
      core.info('#### DEBUG END ####')
    }

    //create SBOM commands
    let sbom_cyclonedx_xml = `sbom --source ${parameters.source} --type ${parameters.type} --format cyclonedx-xml --output sbom_cyclonedx_xml.xml`
    let sbom_cyclonedx_xml_results_file = 'sbom_cyclonedx_xml.xml'

    let sbom_cyclonedx_json = `sbom --source ${parameters.source} --type ${parameters.type} --format cyclonedx-json --output sbom_cyclonedx_json.json`
    let sbom_cyclonedx_json_results_file = 'sbom_cyclonedx_json.json'

    let sbom_spdx_tag_value = `sbom --source ${parameters.source} --type ${parameters.type} --format spdx-tag-value --output sbom_spdx_tag_value.json`
    let sbom_spdx_tag_value_results_file = 'sbom_spdx_tag_value.json'

    let sbom_spdx_json = `sbom --source ${parameters.source} --type ${parameters.type} --format spdx-json --output sbom_spdx_json.json`
    let sbom_spdx_json_results_file = 'sbom_spdx_json.json'

    let sbom_github = `sbom --source ${parameters.source} --type ${parameters.type} --format github --output sbom_github.json`
    let sbom_github_results_file = 'sbom_github.json'


    //always run this to generate text output
    if ( parameters.format == "json" ){
      async function runParallelFunctions(): Promise<void> {
        //also run the scan to get text output
        let scanCommandText = `${parameters.command} --source ${parameters.source} --type ${parameters.type} --format table --output results.txt`
        const promises = [run_cli(scanCommandOriginal,parameters.debug,'results.json',parameters.fail_build_on_error), run_cli(scanCommandText,parameters.debug,'results.txt',parameters.fail_build_on_error), run_cli(sbom_cyclonedx_xml,parameters.debug,sbom_cyclonedx_xml_results_file,parameters.fail_build_on_error), run_cli(sbom_cyclonedx_json,parameters.debug,sbom_cyclonedx_json_results_file,parameters.fail_build_on_error), run_cli(sbom_spdx_tag_value,parameters.debug,sbom_spdx_tag_value_results_file,parameters.fail_build_on_error), run_cli(sbom_spdx_json,parameters.debug,sbom_spdx_json_results_file,parameters.fail_build_on_error), run_cli(sbom_github,parameters.debug,sbom_github_results_file,parameters.fail_build_on_error)];
        await Promise.all(promises);
        core.info('All functions completed in parallel');
      }

      //run all commands in parallel
      runParallelFunctions().catch((error) => {
        console.error('An error occurred:', error);
      });

      //store artifacts
      let files = ['results.json','results.txt','sbom_cyclonedx_xml.xml','sbom_cyclonedx_json.json','sbom_spdx_tag_value.json','sbom_spdx_json.json','sbom_github.json']
      let storeArtifacts = await store_artifacts(files,parameters.debug, parameters?.platformType)
    }
    else {
      async function runParallelFunctions(): Promise<void> {
        const promises = [run_cli(scanCommandOriginal,parameters.debug,'results.txt',parameters.fail_build_on_error), run_cli(sbom_cyclonedx_xml,parameters.debug,sbom_cyclonedx_xml_results_file,parameters.fail_build_on_error), run_cli(sbom_cyclonedx_json,parameters.debug,sbom_cyclonedx_json_results_file,parameters.fail_build_on_error), run_cli(sbom_spdx_tag_value,parameters.debug,sbom_spdx_tag_value_results_file,parameters.fail_build_on_error), run_cli(sbom_spdx_json,parameters.debug,sbom_spdx_json_results_file,parameters.fail_build_on_error), run_cli(sbom_github,parameters.debug,sbom_github_results_file,parameters.fail_build_on_error)];
        await Promise.all(promises);
        core.info('All functions completed in parallel');
      }

      //run all commands in parallel
      runParallelFunctions().catch((error) => {
        console.error('An error occurred:', error);
      });

      //store artifacts
      let files = ['results.txt','sbom_cyclonedx_xml.xml','sbom_cyclonedx_json.json','sbom_spdx_tag_value.json','sbom_spdx_json.json','sbom_github.json']
      let storeArtifacts = await store_artifacts(files,parameters.debug, parameters?.platformType)

    }



    

    
    //Start here for results outpout

    let results:any = ""

    if(fs.existsSync('results.txt')) {
      console.log(`Processing file: results.txt`);
      results = fs.readFileSync('results.txt', 'utf8');
    } else {
      throw `Unable to locate scan results file: results.txt`;
    }

    //creating the body for the comment
    let commentBody:string = '<pre>Veracode Container/IaC/Sercets Scan Summary\n'
    commentBody = commentBody+'\n<details><summary>details</summary><p>\n'
    commentBody = commentBody + results
    commentBody = commentBody+'\n</p></details>\n</pre>'

    core.info(results)

    if ( parameters.debug == "true" ){
      core.info('#### DEBUG START ####')
      core.info('containerScan.ts')
      core.info('comment Body')
      core.info(commentBody)
      core.info('#### DEBUG END ####')
    }

    if ( parameters.isPR >= 1 ){
      core.info("This run is part of a PR, should add some PR comment")

      try {
        const octokit = github.getOctokit(parameters.token);

        const context = github.context
        const repository:any = process.env.GITHUB_REPOSITORY
        const repo = repository.split("/");
        const commentID:any = context.payload.pull_request?.number;

        const { data: comment } = await octokit.rest.issues.createComment({
            owner: repo[0],
            repo: repo[1],
            issue_number: commentID,
            body: commentBody,
        });
        core.info('Adding scan results as comment to PR #'+commentID)
      } catch (error:any) {
          core.info(error);
      }
    }

    if ( parameters.fail_build == "true" ){
        //const policyPassed = commentBody.substring('"policy-passed":')
        const regex = /Policy\ Passed\ =\ false/g;
        //const policyPassed = commentBody.match(regex)
        const policyPassed:any = commentBody.search(regex)
        core.info('policyPassed: '+policyPassed)
        //const policyPassedString = policyPassed.split(":")

        if ( parameters.debug == "true" ){
          core.info('#### DEBUG START ####')
          core.info('containerScan.ts')
          core.info('full output string')
          core.info(commentBody)
          core.info('Fail Build?')
          core.info(policyPassed)
          core.info('#### DEBUG END ####')
        }

        if ( policyPassed > 1 ){
          core.info('Veracode Container Scanning failed')
          core.setFailed('Veracode Container Scanning failed')
        }
        else {
          core.info('Veracode Container Scanning passed')
        }
    }




  }
  else if ( parameters.command == "sbom" ){
    // This is where only the SBOM part is runnuing
    if ( parameters.debug == "true" ){
      core.info('#### DEBUG START ####')
      core.info('containerScan.ts')
      core.info('SBOM generation part')
      core.info('#### DEBUG END ####')
    }
    
    //set the correct filename based on the format
    let filename = ""
    if ( parameters.format == "cyclonedx-xml" ){
      filename = 'sbom_cyclonedx_xml.xml'
    }
    else if ( parameters.format == "cyclonedx-json" ){
      filename = 'sbom_cyclonedx_json.json'
    }
    else if ( parameters.format == "spdx-tag-value" ){
      filename = 'sbom_spdx_tag_value.json'
    }
    else if ( parameters.format == "spdx-json" ){
      filename = 'sbom_spdx_json.json'
    }
    else if ( parameters.format == "github" ){
      filename = 'sbom_github.json'
    }
    else { 
      filename = 'sbom.txt'
    }

    if ( parameters.debug == "true" ){
      core.info('#### DEBUG START ####')
      core.info('containerScan.ts')
      core.info('SBOM filename: '+filename)
      core.info('#### DEBUG END ####')
    }

    const resultFile = [filename]

    //generate command to run
    let scanCommandOriginal = `${parameters.command} --source ${parameters.source} --type ${parameters.type} --format ${parameters.format} --output ${filename}`
    run_cli(scanCommandOriginal,parameters.debug,filename,parameters.fail_build_on_error)
    let storeArtifacts = await store_artifacts(resultFile,parameters.debug, parameters?.platformType)

  }



}