"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const child_process_1 = require("child_process");
const process_1 = require("process");
const vid = core.getInput("vid", { required: true });
const vkey = core.getInput("vkey", { required: true });
const path = core.getInput("path", { required: true });
const format = core.getInput("format", { required: true });
const scanType = core.getInput("scanType", { required: true });
const exportfile = core.getInput("export", { required: true });
ContainerScan(vid, vkey, path, format, scanType, exportfile);
async function ContainerScan(vid, vkey, path, format, scanType, exportfile) {
    console.log(`'Path :  ${path}'`);
    let curlCommandOutput;
    try {
        let ext;
        process_1.env.VERACODE_API_KEY_ID = vid;
        process_1.env.VERACODE_API_KEY_SECRET = vkey;
        if (format = 'json')
            ext = '.json';
        if (format = 'table')
            ext = '.txt';
        if (format = 'cyclonedx')
            ext = '.xml';
        if (exportfile = 'true') {
            curlCommandOutput = (0, child_process_1.execSync)(`curl -fsS https://tools.veracode.com/veracode-cli/install | sh && ./veracode ${scanType} --source ${path} --type directory --format ${format} --output results${ext} `);
            //store output files as artifacts
            const artifact = require('@actions/artifact');
            const artifactClient = artifact.create();
            const artifactName = 'Veracode Container Scanning Results';
            const files = `'results${ext}'`;
            const rootDirectory = process.cwd();
            const options = {
                continueOnError: true
            };
            const uploadResult = await artifactClient.uploadArtifact(artifactName, files, rootDirectory, options);
        }
        else {
            curlCommandOutput = (0, child_process_1.execSync)(`curl -fsS https://tools.veracode.com/veracode-cli/install | sh && ./veracode ${scanType} --source ${path} --type directory --format ${format}`);
        }
        core.info(`${curlCommandOutput}`);
        core.notice(`${curlCommandOutput}`);
    }
    catch (ex) {
        curlCommandOutput = ex.stdout.toString();
    }
}
