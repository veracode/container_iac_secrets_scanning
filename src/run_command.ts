import * as core from "@actions/core"
import * as artifact from '@actions/artifact'
import { execSync,exec } from "child_process";


export async function run_cli(command:string, debug:any, resultsfile:any, failBuildOnError:boolean) {

    //let scanCommand = `curl -fsS https://tools.veracode.com/veracode-cli/install | sh && ./veracode ${command} `
    try{
        let scanCommand = `../veracode-cli/veracode ${command} `
        core.info('Scan command :' + scanCommand)
        let curlCommandOutput = execSync(scanCommand)

        if ( debug == "true" ){
            core.info('#### DEBUG START ####')
            core.info('run_command.ts - command output')
            core.info('command output : '+curlCommandOutput)
            core.info('#### DEBUG END ####')
        }
        core.info(`${curlCommandOutput}`)
    }
    catch(error:any) {
        core.error('An error occurred while executing the scan command.');
        const stderr = error.stderr?.toString().trim() || 'No error message available.';

        core.error(`Error Message: ${stderr}`);
        if (failBuildOnError) {
            core.setFailed('Scan failed.');
        } else {
            core.error('Scan failed, but build will continue.');
        }
    }
}