import * as core from "@actions/core"
import * as artifact from '@actions/artifact'
import { execSync,exec } from "child_process";


export async function run_cli(command:string, debug:any, resultsfile:any, failBuildOnError:boolean) {
    let scanCommand = `../veracode-cli/veracode ${command} `
    core.info('Scan command :' + scanCommand)
    //let scanCommand = `curl -fsS https://tools.veracode.com/veracode-cli/install | sh && ./veracode ${command} `
    try{
       
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
        
        core.error(`Error executing Veracode CLI: ${error.message}`);

        if (error.stdout) {
            core.error(`Command Output (stdout): ${error.stdout}`);
        }
        if (error.stderr) {
            core.error(`Command Error Output (stderr): ${error.stderr}`);
        }

        const failureMessage = `Veracode CLI scan failed. Exit code: ${error.status}, Command: ${scanCommand}`;
        if (failBuildOnError === true) {
            core.setFailed(failureMessage);
            core.info(`Note: Build failed due to break_build_on_error flag being set to true.`)
        } else {
            core.error(failureMessage);
        }
    }
}