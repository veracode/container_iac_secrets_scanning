import * as core from "@actions/core"
import * as github from "@actions/github"
import { execSync } from "child_process";
import { env } from "process";

const vid = core.getInput("vid", {required:true})
const vkey = core.getInput("vkey", {required:true})
const path = core.getInput("path", {required:true})


ContainerScan(vid,vkey,path)
function ContainerScan(vid:string, vkey:string, path:string){
console.log(`'Path :  ${path}'`)
let curlCommandOutput
    try {
        process.env.VERACODE_API_KEY_ID= vid
        process.env.VERACODE_API_KEY_SECRET= vkey
        curlCommandOutput = execSync(`curl -fsS https://tools.veracode.com/veracode-cli/install | sh && ./veracode scan --source ${path} --type directory --format table`);
        core.info(`${curlCommandOutput}`)
        core.notice(`${curlCommandOutput}`)
    } catch (ex:any){
        curlCommandOutput = ex.stdout.toString()
    } 
}

