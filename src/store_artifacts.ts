import * as core from "@actions/core"
import * as artifact from '@actions/artifact'

export async function run_cli(resultfiles:any, debug:any) {

    //store output files as artifacts
    if ( debug == "true" ){
        core.info('#### DEBUG START ####')
        core.info('run_command.ts - Arifact')
        core.info('Artifact name : '+resultfiles)
        core.info('#### DEBUG END ####')
    }
    const artifactClient = artifact.create()
    const artifactName = 'Veracode Container IaC Secrets Scanning Results';
    const files = [resultfiles];
    
    const rootDirectory = process.cwd()
    const options = {
        continueOnError: true
    }
    const uploadResult = await artifactClient.uploadArtifact(artifactName, files, rootDirectory, options)

}