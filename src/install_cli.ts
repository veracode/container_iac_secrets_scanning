import * as core from "@actions/core"
import { execSync,exec } from "child_process";


export async function install_cli(parameters:any) {

    let installCommand = `cd ..; curl -fsS https://tools.veracode.com/veracode-cli/install | sh`
    core.info('Install command :' + installCommand)
    let curlCommandOutput = execSync(installCommand)

    if ( parameters.debug == "true" ){
        core.info('#### DEBUG START ####')
        core.info('intall_cli.ts - command output')
        core.info('command output : '+curlCommandOutput)
        core.info('#### DEBUG END ####')
      }
    core.info(`${curlCommandOutput}`)

    //rename the veracode cli so it works on folders called veracode as well
    let renameCLI = `cd ..; mv veracode veracode-cli`
    core.info('Rename command :' + renameCLI)
    let renameCommandOutput = execSync(renameCLI)

    if ( parameters.debug == "true" ){
        core.info('#### DEBUG START ####')
        core.info('intall_cli.ts - rename CLI ')
        core.info('command output : '+renameCommandOutput)
        core.info('#### DEBUG END ####')
      }
    core.info(`${renameCommandOutput}`)
}