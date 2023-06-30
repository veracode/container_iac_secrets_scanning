import * as core from "@actions/core"
import { execSync,exec } from "child_process";


export async function install_cli(parameters:any) {

    let installCommand = `curl -fsS https://tools.veracode.com/veracode-cli/install `
    core.info('Install command :' + installCommand)
    let curlCommandOutput = execSync(installCommand)

    if ( parameters.debug == "true" ){
        core.info('#### DEBUG START ####')
        core.info('intall_clid.ts - command output')
        core.info('command output : '+curlCommandOutput)
        core.info('#### DEBUG END ####')
      }
    core.info(`${curlCommandOutput}`)
}