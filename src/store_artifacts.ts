import * as core from "@actions/core"
const { DefaultArtifactClient } = require('@actions/artifact');

export async function store_artifacts(resultfiles:any, debug:any) {

    //store output files as artifacts
    if ( debug == "true" ){
        core.info('#### DEBUG START ####')
        core.info('store_artifacts.ts - Arifact')
        core.info('Artifact name : '+resultfiles)
        core.info('#### DEBUG END ####')
    }
    
    const artifactName = 'Veracode Container IaC Secrets Scanning Results';
    //const files = [resultfiles];
    
    const rootDirectory = process.cwd()
    const options = {
        continueOnError: true
    }
    
    const artifactClient = new DefaultArtifactClient();
    const uploadResult = await artifactClient.uploadArtifact(artifactName, resultfiles, rootDirectory, options)

}