
import * as core from "@actions/core"
import { runScan } from "./containerScan"



const vid = core.getInput("vid", {required:true})
const vkey = core.getInput("vkey", {required:true})
const path = core.getInput("path", {required:true})
const format = core.getInput("format", {required:true})
const scanType = core.getInput("scanType", {required:true})
const exportfile = core.getInput("export", {required:true})

runScan(vid, vkey, path, format, scanType, exportfile)

