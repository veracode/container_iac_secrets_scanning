import * as core from "@actions/core"
import { execSync, exec } from "child_process";

const runnerOS = process.env.RUNNER_OS;
export async function install_cli(parameters: any) {
  if (runnerOS == 'Windows') {
    const psCommand = `Set-ExecutionPolicy AllSigned -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://tools.veracode.com/veracode-cli/install.ps1'))`
    const curlCommandOutput = execSync(`powershell.exe -NoProfile -Command "${psCommand}"`, { stdio: 'inherit' })
    if (parameters.debug == "true") {
      core.info('#### DEBUG START ####')
      core.info('intall_cli.ts - command output')
      core.info('command output : ' + curlCommandOutput)
      core.info('#### DEBUG END ####')
    }
    core.info(`${curlCommandOutput}`)

  }
  else {
    let installCommand = `cd ..;mkdir veracode-cli; cd veracode-cli; curl -fsS https://tools.veracode.com/veracode-cli/install | sh`
    core.info('Install command :' + installCommand)
    let curlCommandOutput = execSync(installCommand)

    if (parameters.debug == "true") {
      core.info('#### DEBUG START ####')
      core.info('intall_cli.ts - command output')
      core.info('command output : ' + curlCommandOutput)
      core.info('#### DEBUG END ####')
    }
    core.info(`${curlCommandOutput}`)

  }
}