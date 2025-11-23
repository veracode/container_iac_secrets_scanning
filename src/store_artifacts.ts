import * as core from "@actions/core"
const { DefaultArtifactClient } = require('@actions/artifact');

// For GitHub Enterprise Server, we need to use v1 of the artifact client
// The npm alias @actions/artifact-v1 points to @actions/artifact@^1.1.1
let artifactV1: any = null;
try {
  // Try to require the v1 artifact client
  // Note: This uses an npm alias which should be resolved at install time
  artifactV1 = require('@actions/artifact-v1');
} catch (error: any) {
  core.warning(`Could not load artifact v1 client: ${error.message}. Enterprise Server support may be limited.`);
}

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
        if (artifactV1) {
            artifactClient = artifactV1.create();
            core.info(`Initialized the artifact object using version V1.`);
        } else {
            core.warning('Artifact v1 client not available. Falling back to v2 client for Enterprise Server.');
            artifactClient = new DefaultArtifactClient();
            core.info(`Initialized the artifact object using version V2 (fallback).`);
        }
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