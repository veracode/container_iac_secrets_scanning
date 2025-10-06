import * as core from "@actions/core"
import * as artifact from '@actions/artifact'
import * as github from "@actions/github"
import { execSync } from "child_process";
import { env } from "process";
import { ContainerScan } from "./containerScan";

const vid = core.getInput("vid", {required:true})
const vkey = core.getInput("vkey", {required:true})
const token = core.getInput('github-token', {required: true} );
const command = core.getInput("command", {required:true})
const source = core.getInput("source", {required:true})
const format = core.getInput("format", {required:true})
const type = core.getInput("type", {required:true})
const debug = core.getInput("debug", {required:false})
const fail_build = core.getInput("fail_build", {required:false})
const fail_build_on_error= core.getInput("fail_build_on_error", {required:false})
const platformType = core.getInput("platformType", {required:false})

core.info('check if we run on a pull request')
let pullRequest:any = process.env.GITHUB_REF

 if ( debug == "true" ){
    core.info('#### DEBUG START ####')
    core.info('index.js')
    core.info(pullRequest)
    core.info(JSON.stringify(process.env))
    core.info('#### DEBUG END ####')
}
const isPR = pullRequest.indexOf("pull")

var pr_context:any
var pr_commentID:any

if ( isPR >= 1 ){
        core.info("This run is part of a PR, should add some PR links")
        pr_context = github.context
        pr_commentID = pr_context.payload.pull_request.number
}
else {
    if ( debug == "true" ){
        core.info('#### DEBUG START ####')
        core.info('index.js')
        core.info("isPR?: "+ isPR)
        core.info('#### DEBUG END ####')
    }
    core.info("We don't run on a PR")
}

const parameters = {
    vid: vid,
    vkey: vkey,
    token: token,
    command: command,
    source: source,
    format: format,
    type: type,
    debug: debug,
    fail_build: fail_build,
    pr_context: pr_context,
    isPR: isPR,
    pr_commentID: pr_commentID,
    fail_build_on_error:fail_build_on_error,
    platformType
}

ContainerScan(parameters)

