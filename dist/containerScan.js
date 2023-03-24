#!/usr/bin/env node
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runScan = void 0;
const core = __importStar(require("@actions/core"));
const artifact = __importStar(require("@actions/artifact"));
const child_process_1 = require("child_process");
const process_1 = require("process");
function runScan(vid, vkey, path, format, scanType, exportfile) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`'Path :  ${path}'`);
        let curlCommandOutput;
        try {
            let ext;
            process_1.env.VERACODE_API_KEY_ID = vid;
            process_1.env.VERACODE_API_KEY_SECRET = vkey;
            if (format == 'json')
                ext = '.json';
            if (format == 'table')
                ext = '.txt';
            if (format == 'cyclonedx')
                ext = '.xml';
            let scanCommand;
            if (exportfile = 'true') {
                scanCommand = `curl -fsS https://tools.veracode.com/veracode-cli/install | sh && ./veracode ${scanType} --source ${path} --type directory --format ${format} --output results${ext} `;
                core.info('Scan command : ' + scanCommand);
                curlCommandOutput = (0, child_process_1.execSync)(scanCommand);
                core.info(`${curlCommandOutput}`);
                //store output files as artifacts
                const artifactClient = artifact.create();
                const artifactName = 'Veracode Container Scanning Results';
                const files = [`results${ext}`];
                const rootDirectory = process.cwd();
                const options = {
                    continueOnError: true
                };
                const uploadResult = yield artifactClient.uploadArtifact(artifactName, files, rootDirectory, options);
            }
            else {
                curlCommandOutput = (0, child_process_1.execSync)(`curl -fsS https://tools.veracode.com/veracode-cli/install | sh && ./veracode ${scanType} --source ${path} --type directory --format ${format}`);
                core.info(`${curlCommandOutput}`);
            }
        }
        catch (ex) {
            curlCommandOutput = ex.stdout.toString();
        }
    });
}
exports.runScan = runScan;
