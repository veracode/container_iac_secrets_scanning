import * as core from "@actions/core"
import { exec, execSync, spawn } from "child_process";

const inputName = core.getInput("name")

greet(inputName)
function greet(name:string){
//console.log(`'hello ${name}'`)
let commandOutput
    try {
        commandOutput = execSync(`curl -fsS https://tools.veracode.com/veracode-cli/install | sh `);
        core.info('---- DEBUG OUTPUT START ----')
        core.info('---- Cli installation '+commandOutput)
        core.info('---- DEBUG OUTPUT END ----')
    } catch (ex:any){
        commandOutput = ex.stdout.toString()
    } 
}

