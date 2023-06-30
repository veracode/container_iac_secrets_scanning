import * as core from "@actions/core"
import * as artifact from '@actions/artifact'
import { execSync,exec } from "child_process";
import { env } from "process";
import * as fs from 'fs';

export async function run_cli(command:string, parameters:any) {

    //let scanCommand = `curl -fsS https://tools.veracode.com/veracode-cli/install | sh && ./veracode ${command} `
    let scanCommand = `./veracode ${command} `
    core.info('Scan command :' + scanCommand)
    let curlCommandOutput = execSync(scanCommand)

    if ( parameters.debug == "true" ){
        core.info('#### DEBUG START ####')
        core.info('run_command.ts - command output')
        core.info('command output : '+curlCommandOutput)
        core.info('#### DEBUG END ####')
      }
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