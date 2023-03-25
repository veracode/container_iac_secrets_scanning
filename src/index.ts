import * as core from "@actions/core"
import * as artifact from '@actions/artifact'
import * as github from "@actions/github"
import { execSync } from "child_process";
import { env } from "process";
import { ContainerScan } from "./containerScan";

const vid = core.getInput("vid", {required:true})
const vkey = core.getInput("vkey", {required:true})
const path = core.getInput("path", {required:true})
const format = core.getInput("format", {required:true})
const scanType = core.getInput("scanType", {required:true})
const exportfile = core.getInput("export", {required:true})

ContainerScan(vid, vkey, path, format, scanType, exportfile)

