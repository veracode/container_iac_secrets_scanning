import * as core from "@actions/core"
import * as github from "@actions/github"
import { exec, execSync, spawn } from "child_process";

const vid = core.getInput("vid")
const vkey = core.getInput("vkey")

greet(vid,vkey)
function greet(vid:string, vkey:string){
//console.log(`'hello ${name}'`)
let exportCommandVID
let exportCommandVKEY
let curlCommandOutput
    
    try {
        
        exportCommandVID = execSync(`export VERACODE_API_KEY_ID=${vid}`);
        core.info('---- DEBUG OUTPUT START ----')
        core.info('---- Export installation VID '+ exportCommandVID)
        core.info('---- DEBUG OUTPUT END ----')
    } catch (ex:any){
        exportCommandVID = ex.stdout.toString()
    } 
    try {
        
        exportCommandVKEY = execSync(`export VERACODE_API_KEY_SECRET=${vkey}`);
        core.info('---- DEBUG OUTPUT START ----')
        core.info('---- Export installation VKEY '+ exportCommandVKEY)
        core.info('---- DEBUG OUTPUT END ----')
    } catch (ex:any){
        exportCommandVKEY = ex.stdout.toString()
    } 
    try {
        
        curlCommandOutput = execSync(`curl -fsS https://tools.veracode.com/veracode-cli/install | sh && ./veracode scan --source . --type directory --format table`);
        core.info('---- DEBUG OUTPUT START ----')
        core.info('---- Cli installation '+curlCommandOutput)
        core.info('---- DEBUG OUTPUT END ----')
    } catch (ex:any){
        curlCommandOutput = ex.stdout.toString()
    } 
}

