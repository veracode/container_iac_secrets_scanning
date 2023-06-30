#!/usr/bin/env node
import * as core from "@actions/core"
import * as artifact from '@actions/artifact'
import * as github from "@actions/github"
import { execSync } from "child_process";
import { env } from "process";
import * as fs from 'fs';
import { run_cli } from "./run_command";

export async function ContainerScan(parameters:any) {

  //install the cli
  let installCLI = execSync('curl -fsS https://tools.veracode.com/veracode-cli/install | sh && ./veracode configure')
  core.info('Install command :' + installCLI)

    //let curlCommandOutput:any
            env.VERACODE_API_KEY_ID= parameters.vid
            env.VERACODE_API_KEY_SECRET= parameters.vkey
            
            if ( parameters.command == "scan" ){
              //run this when oputput is requires and we may create issues and/or PR decoration


              //check if format corresponds to the output file extension
              if ( parameters.format == "table" && parameters.output == "results.json" ){
                core.info('You are trying to create text based output, but specified json to be the output. The output will be changed to a text file!')
                parameters.output = "results.txt"
                if ( parameters.debug == "true" ){
                  core.info('#### DEBUG START ####')
                  core.info('containerScan.ts - check for text output')
                  core.info(parameters.output)
                  core.info('#### DEBUG END ####')
                }
              }
              else if ( parameters.format == "json" && parameters.output != "results.json" ){
                core.info('You are trying to create json based output, but specified text to be the output. The output will be changed to a json file!')
                parameters.output = "results.json"
                if ( parameters.debug == "true" ){
                  core.info('#### DEBUG START ####')
                  core.info('containerScan.ts - check for json output')
                  core.info(parameters.output)
                  core.info('#### DEBUG END ####')
                }
              }

              //generate command to run
              let scanCommandOriginal = `${parameters.command} --source ${parameters.source} --type ${parameters.type} --format ${parameters.format} --output ${parameters.output}`
              
              if ( parameters.debug == "true" ){
                core.info('#### DEBUG START ####')
                core.info('containerScan.ts - original scan command')
                core.info(scanCommandOriginal)
                core.info('#### DEBUG END ####')
              }

              //run the original command
              //run_cli(scanCommand, parameters)


              //always run this to generate text output
              if ( parameters.output == "results.json" ){
                parameters.output = "results.txt"
                let scanCommandText = `${parameters.command} --source ${parameters.source} --type ${parameters.type} --format ${parameters.format} --output ${parameters.output}`
                //run_cli(scanCommand, parameters)
              }
              else {
                let scanCommandText = scanCommandOriginal
              }

              async function runParallelFunctions(): Promise<void> {
                let scanCommandText = `${parameters.command} --source ${parameters.source} --type ${parameters.type} --format ${parameters.format} --output ${parameters.output}`
                const promises = [run_cli(scanCommandOriginal,parameters), run_cli(scanCommandText,parameters)];
                await Promise.all(promises);
                console.log('Both functions completed in parallel');
              }

              runParallelFunctions().catch((error) => {
                console.error('An error occurred:', error);
              });

            }
            else if ( parameters.command == "sbom" ){

            }



            //check if format corresponds to the output file extension
            //do something


/*
            let scanCommand
            if(parameters.output != '') {
                scanCommand = `curl -fsS https://tools.veracode.com/veracode-cli/install | sh && ./veracode ${parameters.command} --source ${parameters.source} --type ${parameters.type} --format ${parameters.format} --output ${parameters.output} `
                core.info('Scan command :' + scanCommand)
                curlCommandOutput = execSync(scanCommand)
                core.info(`${curlCommandOutput}`)
    
                //store output files as artifacts
                const artifactClient = artifact.create()
                const artifactName = 'Veracode Container IaC Secrets Scanning Results';
                const files = [parameters.output];
                
                const rootDirectory = process.cwd()
                const options = {
                    continueOnError: true
                }
                const uploadResult = await artifactClient.uploadArtifact(artifactName, files, rootDirectory, options)
                
                }
            else{
                curlCommandOutput = execSync(`curl -fsS https://tools.veracode.com/veracode-cli/install | sh && ./veracode ${parameters.command} --source ${parameters.source} --type ${parameters.type} --format ${parameters.format}`)
                core.info(`${curlCommandOutput}`)
            }

            let results:any = ""

            if(fs.existsSync(parameters.output)) {
              console.log(`Processing file: ${parameters.output}`);
              results = fs.readFileSync(parameters.output, 'utf8');
            } else {
              throw `Unable to locate scan results file: ${parameters.output}`;
            }

            if ( parameters.debug == "true" ){
              core.info('#### DEBUG START ####')
              core.info('containerScan.ts')
              core.info('results')
              //core.info(results)
              core.info('#### DEBUG END ####')
            }

            //creating the body for the comment
            let commentBody:string = 'Veracode Container/IaC/Sercets Scan Summary'
            commentBody = commentBody+'---\n<details><summary>details</summary><p>\n---'
            commentBody = commentBody + results
            commentBody = commentBody+'---\n</p></details>\n==='

            if ( parameters.debug == "true" ){
              core.info('#### DEBUG START ####')
              core.info('containerScan.ts')
              core.info('comment Body')
              //core.info(commentBody)
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
                const regex = /\"policy-passed\": false/g;
                //const policyPassed = commentBody.match(regex)
                const policyPassed = commentBody.search(regex)
                core.info('policyPassed: '+policyPassed)
                //const policyPassedString = policyPassed.split(":")

                if ( parameters.debug == "true" ){
                  core.info('#### DEBUG START ####')
                  core.info('containerScan.ts')
                  core.info('full output string')
                  //core.info(commentBody)
                  core.info('Fail Build?')
                  //core.info(policyPassed)
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
*/
          

}