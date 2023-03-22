import * as core from "@actions/core"
import * as github from "@actions/github"
import { exec, execSync, spawn } from "child_process";

const path = core.getInput("path")

greet(path)
function greet(path:string){
console.log(`'Path :  ${path}'`)
let curlCommandOutput
    try {
        
        curlCommandOutput = execSync(`curl -fsS https://tools.veracode.com/veracode-cli/install | sh && ./veracode scan --source ${path} --type directory --format table`);
        core.info('---- DEBUG OUTPUT START ----')
        core.info('---- Cli installation '+curlCommandOutput)
        core.info('---- DEBUG OUTPUT END ----')
    } catch (ex:any){
        curlCommandOutput = ex.stdout.toString()
    } 
}

