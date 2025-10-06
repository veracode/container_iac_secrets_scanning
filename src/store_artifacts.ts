import * as core from "@actions/core"
const { DefaultArtifactClient } = require('@actions/artifact');
const artifactV1 = require('@actions/artifact-v1');

export async function store_artifacts(resultfiles:any, debug:any, platformType: string) {

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
    
    let artifactClient;

    if (platformType === 'ENTERPRISE') {
        artifactClient = artifactV1.create();
        core.info(`Initialized the artifact object using version V1.`);
    } else {
        artifactClient = new DefaultArtifactClient();
        core.info(`Initialized the artifact object using version V2.`);
    }
    
    try {
        const uploadResult = await artifactClient.uploadArtifact(artifactName, resultfiles, rootDirectory, options)
    } catch (error: any) {
        core.info(`Error while creating the ${artifactName} artifact ${error}`);
    }
}