import * as core from "@actions/core"
import * as artifact from '@actions/artifact'
import { execSync,exec } from "child_process";


export async function run_cli(command:string, debug:any, resultsfile:any) {

    //let scanCommand = `curl -fsS https://tools.veracode.com/veracode-cli/install | sh && ./veracode ${command} `
    let scanCommand = `./veracode ${command} `
    core.info('Scan command :' + scanCommand)
    let curlCommandOutput = execSync(scanCommand)

    if ( debug == "true" ){
        core.info('#### DEBUG START ####')
        core.info('run_command.ts - command output')
        core.info('command output : '+curlCommandOutput)
        core.info('#### DEBUG END ####')
    }
    core.info(`${curlCommandOutput}`)

    //store output files as artifacts
    if ( debug == "true" ){
        core.info('#### DEBUG START ####')
        core.info('run_command.ts - Arifact')
        core.info('Artifact name : '+resultsfile)
        core.info('#### DEBUG END ####')
    }
    const artifactClient = artifact.create()
    const artifactName = 'Veracode Container IaC Secrets Scanning Results';
    const files = [resultsfile];
    
    const rootDirectory = process.cwd()
    const options = {
        continueOnError: true
    }
    const uploadResult = await artifactClient.uploadArtifact(artifactName, files, rootDirectory, options)

}