import * as core from "@actions/core"
import * as artifact from '@actions/artifact'
import * as github from "@actions/github"
import { execSync } from "child_process";
import { env } from "process";

const vid = core.getInput("vid", {required:true})
const vkey = core.getInput("vkey", {required:true})
const path = core.getInput("path", {required:true})
const format = core.getInput("format", {required:true})
const scanType = core.getInput("scanType", {required:true})
const exportfile = core.getInput("export", {required:true})

ContainerScan(vid, vkey, path, format, scanType, exportfile)

async function ContainerScan(vid:string, vkey:string, path:string, format:string, scanType:string, exportfile:string){
console.log(`'Path :  ${path}'`)
let curlCommandOutput
    try {
        let ext 
        env.VERACODE_API_KEY_ID= vid
        env.VERACODE_API_KEY_SECRET= vkey
        
        if(format=='json')
          ext='.json'
        if(format=='table')
          ext='.txt'
        if(format=='cyclonedx') 
          ext='.xml'
        let scanCommand
        if(exportfile='true') {
            scanCommand = `curl -fsS https://tools.veracode.com/veracode-cli/install | sh && ./veracode ${scanType} --source ${path} --type directory --format ${format} --output results${ext} `
            core.info('Scan command : ' + scanCommand)
            curlCommandOutput = execSync(scanCommand)
            core.info(`${curlCommandOutput}`)

            //store output files as artifacts
            const artifactClient = artifact.create()
            const artifactName = 'Veracode Container Scanning Results';
            const files = [`results${ext}`];
            
            const rootDirectory = process.cwd()
            const options = {
                continueOnError: true
            }
            const uploadResult = await artifactClient.uploadArtifact(artifactName, files, rootDirectory, options)
            
            }
        else{
            curlCommandOutput = execSync(`curl -fsS https://tools.veracode.com/veracode-cli/install | sh && ./veracode ${scanType} --source ${path} --type directory --format ${format}`)
            core.info(`${curlCommandOutput}`)
        }
    } 
    catch (ex:any){
        curlCommandOutput = ex.stdout.toString()
    } 
}

