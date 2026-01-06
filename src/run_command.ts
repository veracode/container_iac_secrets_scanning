import * as core from "@actions/core"
import * as artifact from '@actions/artifact'
import { execSync, exec } from "child_process";
import path from "path";

const runnerOS = process.env.RUNNER_OS;
export async function run_cli(command: string, debug: any, resultsfile: any, failBuildOnError: boolean) {
    if (runnerOS == 'Windows') {
        const appdata = process.env.APPDATA ?? "";
        const cliPathVera = path.join(appdata, 'veracode')
        const cliPath = path.join(cliPathVera, 'veracode.exe');
        core.info(`CLI Path:${cliPath}, Command:${command} `)
        try {
            let curlCommandOutput = execSync(
                `${cliPath} ${command}`,
                { encoding: 'utf8', stdio: ['inherit', 'pipe', 'inherit'] }
            );

            if (debug == "true") {
                core.info('#### DEBUG START ####')
                core.info('run_command.ts - command output')
                core.info('command output : ' + curlCommandOutput)
                core.info('#### DEBUG END ####')
            }
            // Output the results to console
            if (curlCommandOutput) {
                core.info(curlCommandOutput)
            }
        }
        catch (error: any) {
            // Exit code 3 with standard output means policy violations found (normal completion)
            // This is not a failBuildOnError situation - policy evaluation will handle the decision
            const stdout = error.stdout ? (Buffer.isBuffer(error.stdout) ? error.stdout.toString('utf8') : error.stdout) : '';
            if (error.status === 3 && stdout && stdout.trim().length > 0) {
                if (debug == "true") {
                    core.info('#### DEBUG START ####')
                    core.info('run_command.ts - Exit code 3 with output (policy violations found)')
                    core.info('This is normal - policy evaluation will determine if workflow should fail')
                    core.info('#### DEBUG END ####')
                }
                // Output the results
                core.info(stdout)
                // Don't treat this as an error - return normally
                return;
            }
            
            // For other exit codes or exit code 3 without output, treat as error
            const failureMessage = `Veracode CLI scan failed. Exit code: ${error.status}, Command: ${command}`;
            const failBuildOnErrorBool = String(failBuildOnError).toLowerCase() === "true";
            if (failBuildOnErrorBool) {
                core.setFailed(failureMessage);
                core.info(`Note: Build failed due to break_build_on_error flag being set to true.`)
            } else {
                core.error(failureMessage);
            }
        }

    }
    else {

        let scanCommand = `../veracode-cli/veracode ${command}`
        core.info('Scan command :' + scanCommand)
        //let scanCommand = `curl -fsS https://tools.veracode.com/veracode-cli/install | sh && ./veracode ${command} `
        try {

            let curlCommandOutput = execSync(scanCommand, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'inherit'] })

            if (debug == "true") {
                core.info('#### DEBUG START ####')
                core.info('run_command.ts - command output')
                core.info('command output : ' + curlCommandOutput)
                core.info('#### DEBUG END ####')
            }
            if (curlCommandOutput) {
                core.info(curlCommandOutput)
            }
        } catch (error: any) {
            // Exit code 3 with standard output means policy violations found (normal completion)
            // This is not a failBuildOnError situation - policy evaluation will handle the decision
            const stdout = error.stdout ? (Buffer.isBuffer(error.stdout) ? error.stdout.toString('utf8') : error.stdout) : '';
            if (error.status === 3 && stdout && stdout.trim().length > 0) {
                if (debug == "true") {
                    core.info('#### DEBUG START ####')
                    core.info('run_command.ts - Exit code 3 with output (policy violations found)')
                    core.info('This is normal - policy evaluation will determine if workflow should fail')
                    core.info('#### DEBUG END ####')
                }
                // Output the results
                core.info(stdout)
                // Don't treat this as an error - return normally
                return;
            }
            
            // For other exit codes or exit code 3 without output, treat as error
            const failureMessage = `Veracode CLI scan failed. Exit code: ${error.status}, Command: ${scanCommand}`;
            const failBuildOnErrorBool = String(failBuildOnError).toLowerCase() === "true";
            if (failBuildOnErrorBool) {
                core.setFailed(failureMessage);
                core.info(`Note: Build failed due to break_build_on_error flag being set to true.`)
            } else {
                core.error(failureMessage);
            }
        }
    }
}