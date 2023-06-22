#!/usr/bin/env node
import * as core from "@actions/core"
import * as artifact from '@actions/artifact'
import * as github from "@actions/github"
import { execSync } from "child_process";
import { env } from "process";
import * as fs from 'fs';

export async function ContainerScan(parameters:any) {
    let curlCommandOutput:any
        //try {
            let ext 
            env.VERACODE_API_KEY_ID= parameters.vid
            env.VERACODE_API_KEY_SECRET= parameters.vkey
            

            //check if format corresponds to the output file extension
            //do something

            let scanCommand
            if(parameters.output != '') {
                scanCommand = `curl -fsS https://tools.veracode.com/veracode-cli/install | sh && ./veracode ${parameters.command} --source ${parameters.source} --type ${parameters.type} --format ${parameters.format} --output ${parameters.output} `
                core.info('Scan command :' + scanCommand)
                curlCommandOutput = execSync(scanCommand)
                core.info(`${curlCommandOutput}`)
    
                //store output files as artifacts
                const artifactClient = artifact.create()
                const artifactName = 'Veracode Container Scanning Results';
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
            let commentBody:any = 'Veracode Scan Summary'
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
                const regex = /\"policy-passed\": (false|pass)/g;
                const policyPassed = commentBody.match(regex);
                const policyPassedString = policyPassed.split(":")

                if ( parameters.debug == "true" ){
                  core.info('#### DEBUG START ####')
                  core.info('containerScan.ts')
                  core.info('full output string')
                  //core.info(commentBody)
                  core.info('Fail Build?')
                  core.info(policyPassedString[1])
                  core.info('#### DEBUG END ####')
                }

                if ( policyPassedString[1] == "false" ){
                  core.info('Veracode Container Scanning failed')
                  core.setFailed('Veracode Container Scanning failed')
                }
                else {
                  core.info('Veracode Container Scanning passed')
                }
            }
        //} 
        //catch (ex:any){
        //    curlCommandOutput = ex.stdout.toString()
        //    core.info(`${curlCommandOutput}`)
        //} 

}