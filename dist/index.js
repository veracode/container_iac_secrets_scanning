/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@actions/artifact/lib/artifact-client.js":
/*!***************************************************************!*\
  !*** ./node_modules/@actions/artifact/lib/artifact-client.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.create = void 0;
const artifact_client_1 = __webpack_require__(/*! ./internal/artifact-client */ "./node_modules/@actions/artifact/lib/internal/artifact-client.js");
/**
 * Constructs an ArtifactClient
 */
function create() {
    return artifact_client_1.DefaultArtifactClient.create();
}
exports.create = create;
//# sourceMappingURL=artifact-client.js.map

/***/ }),

/***/ "./node_modules/@actions/artifact/lib/internal/artifact-client.js":
/*!************************************************************************!*\
  !*** ./node_modules/@actions/artifact/lib/internal/artifact-client.js ***!
  \************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DefaultArtifactClient = void 0;
const core = __importStar(__webpack_require__(/*! @actions/core */ "./node_modules/@actions/core/lib/core.js"));
const upload_specification_1 = __webpack_require__(/*! ./upload-specification */ "./node_modules/@actions/artifact/lib/internal/upload-specification.js");
const upload_http_client_1 = __webpack_require__(/*! ./upload-http-client */ "./node_modules/@actions/artifact/lib/internal/upload-http-client.js");
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/@actions/artifact/lib/internal/utils.js");
const path_and_artifact_name_validation_1 = __webpack_require__(/*! ./path-and-artifact-name-validation */ "./node_modules/@actions/artifact/lib/internal/path-and-artifact-name-validation.js");
const download_http_client_1 = __webpack_require__(/*! ./download-http-client */ "./node_modules/@actions/artifact/lib/internal/download-http-client.js");
const download_specification_1 = __webpack_require__(/*! ./download-specification */ "./node_modules/@actions/artifact/lib/internal/download-specification.js");
const config_variables_1 = __webpack_require__(/*! ./config-variables */ "./node_modules/@actions/artifact/lib/internal/config-variables.js");
const path_1 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'path'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
class DefaultArtifactClient {
    /**
     * Constructs a DefaultArtifactClient
     */
    static create() {
        return new DefaultArtifactClient();
    }
    /**
     * Uploads an artifact
     */
    uploadArtifact(name, files, rootDirectory, options) {
        return __awaiter(this, void 0, void 0, function* () {
            core.info(`Starting artifact upload
For more detailed logs during the artifact upload process, enable step-debugging: https://docs.github.com/actions/monitoring-and-troubleshooting-workflows/enabling-debug-logging#enabling-step-debug-logging`);
            path_and_artifact_name_validation_1.checkArtifactName(name);
            // Get specification for the files being uploaded
            const uploadSpecification = upload_specification_1.getUploadSpecification(name, rootDirectory, files);
            const uploadResponse = {
                artifactName: name,
                artifactItems: [],
                size: 0,
                failedItems: []
            };
            const uploadHttpClient = new upload_http_client_1.UploadHttpClient();
            if (uploadSpecification.length === 0) {
                core.warning(`No files found that can be uploaded`);
            }
            else {
                // Create an entry for the artifact in the file container
                const response = yield uploadHttpClient.createArtifactInFileContainer(name, options);
                if (!response.fileContainerResourceUrl) {
                    core.debug(response.toString());
                    throw new Error('No URL provided by the Artifact Service to upload an artifact to');
                }
                core.debug(`Upload Resource URL: ${response.fileContainerResourceUrl}`);
                core.info(`Container for artifact "${name}" successfully created. Starting upload of file(s)`);
                // Upload each of the files that were found concurrently
                const uploadResult = yield uploadHttpClient.uploadArtifactToFileContainer(response.fileContainerResourceUrl, uploadSpecification, options);
                // Update the size of the artifact to indicate we are done uploading
                // The uncompressed size is used for display when downloading a zip of the artifact from the UI
                core.info(`File upload process has finished. Finalizing the artifact upload`);
                yield uploadHttpClient.patchArtifactSize(uploadResult.totalSize, name);
                if (uploadResult.failedItems.length > 0) {
                    core.info(`Upload finished. There were ${uploadResult.failedItems.length} items that failed to upload`);
                }
                else {
                    core.info(`Artifact has been finalized. All files have been successfully uploaded!`);
                }
                core.info(`
The raw size of all the files that were specified for upload is ${uploadResult.totalSize} bytes
The size of all the files that were uploaded is ${uploadResult.uploadSize} bytes. This takes into account any gzip compression used to reduce the upload size, time and storage

Note: The size of downloaded zips can differ significantly from the reported size. For more information see: https://github.com/actions/upload-artifact#zipped-artifact-downloads \r\n`);
                uploadResponse.artifactItems = uploadSpecification.map(item => item.absoluteFilePath);
                uploadResponse.size = uploadResult.uploadSize;
                uploadResponse.failedItems = uploadResult.failedItems;
            }
            return uploadResponse;
        });
    }
    downloadArtifact(name, path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const downloadHttpClient = new download_http_client_1.DownloadHttpClient();
            const artifacts = yield downloadHttpClient.listArtifacts();
            if (artifacts.count === 0) {
                throw new Error(`Unable to find any artifacts for the associated workflow`);
            }
            const artifactToDownload = artifacts.value.find(artifact => {
                return artifact.name === name;
            });
            if (!artifactToDownload) {
                throw new Error(`Unable to find an artifact with the name: ${name}`);
            }
            const items = yield downloadHttpClient.getContainerItems(artifactToDownload.name, artifactToDownload.fileContainerResourceUrl);
            if (!path) {
                path = config_variables_1.getWorkSpaceDirectory();
            }
            path = path_1.normalize(path);
            path = path_1.resolve(path);
            // During upload, empty directories are rejected by the remote server so there should be no artifacts that consist of only empty directories
            const downloadSpecification = download_specification_1.getDownloadSpecification(name, items.value, path, (options === null || options === void 0 ? void 0 : options.createArtifactFolder) || false);
            if (downloadSpecification.filesToDownload.length === 0) {
                core.info(`No downloadable files were found for the artifact: ${artifactToDownload.name}`);
            }
            else {
                // Create all necessary directories recursively before starting any download
                yield utils_1.createDirectoriesForArtifact(downloadSpecification.directoryStructure);
                core.info('Directory structure has been setup for the artifact');
                yield utils_1.createEmptyFilesForArtifact(downloadSpecification.emptyFilesToCreate);
                yield downloadHttpClient.downloadSingleArtifact(downloadSpecification.filesToDownload);
            }
            return {
                artifactName: name,
                downloadPath: downloadSpecification.rootDownloadLocation
            };
        });
    }
    downloadAllArtifacts(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const downloadHttpClient = new download_http_client_1.DownloadHttpClient();
            const response = [];
            const artifacts = yield downloadHttpClient.listArtifacts();
            if (artifacts.count === 0) {
                core.info('Unable to find any artifacts for the associated workflow');
                return response;
            }
            if (!path) {
                path = config_variables_1.getWorkSpaceDirectory();
            }
            path = path_1.normalize(path);
            path = path_1.resolve(path);
            let downloadedArtifacts = 0;
            while (downloadedArtifacts < artifacts.count) {
                const currentArtifactToDownload = artifacts.value[downloadedArtifacts];
                downloadedArtifacts += 1;
                core.info(`starting download of artifact ${currentArtifactToDownload.name} : ${downloadedArtifacts}/${artifacts.count}`);
                // Get container entries for the specific artifact
                const items = yield downloadHttpClient.getContainerItems(currentArtifactToDownload.name, currentArtifactToDownload.fileContainerResourceUrl);
                const downloadSpecification = download_specification_1.getDownloadSpecification(currentArtifactToDownload.name, items.value, path, true);
                if (downloadSpecification.filesToDownload.length === 0) {
                    core.info(`No downloadable files were found for any artifact ${currentArtifactToDownload.name}`);
                }
                else {
                    yield utils_1.createDirectoriesForArtifact(downloadSpecification.directoryStructure);
                    yield utils_1.createEmptyFilesForArtifact(downloadSpecification.emptyFilesToCreate);
                    yield downloadHttpClient.downloadSingleArtifact(downloadSpecification.filesToDownload);
                }
                response.push({
                    artifactName: currentArtifactToDownload.name,
                    downloadPath: downloadSpecification.rootDownloadLocation
                });
            }
            return response;
        });
    }
}
exports.DefaultArtifactClient = DefaultArtifactClient;
//# sourceMappingURL=artifact-client.js.map

/***/ }),

/***/ "./node_modules/@actions/artifact/lib/internal/config-variables.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@actions/artifact/lib/internal/config-variables.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getRetentionDays = exports.getWorkSpaceDirectory = exports.getWorkFlowRunId = exports.getRuntimeUrl = exports.getRuntimeToken = exports.getDownloadFileConcurrency = exports.getInitialRetryIntervalInMilliseconds = exports.getRetryMultiplier = exports.getRetryLimit = exports.getUploadChunkSize = exports.getUploadFileConcurrency = void 0;
// The number of concurrent uploads that happens at the same time
function getUploadFileConcurrency() {
    return 2;
}
exports.getUploadFileConcurrency = getUploadFileConcurrency;
// When uploading large files that can't be uploaded with a single http call, this controls
// the chunk size that is used during upload
function getUploadChunkSize() {
    return 8 * 1024 * 1024; // 8 MB Chunks
}
exports.getUploadChunkSize = getUploadChunkSize;
// The maximum number of retries that can be attempted before an upload or download fails
function getRetryLimit() {
    return 5;
}
exports.getRetryLimit = getRetryLimit;
// With exponential backoff, the larger the retry count, the larger the wait time before another attempt
// The retry multiplier controls by how much the backOff time increases depending on the number of retries
function getRetryMultiplier() {
    return 1.5;
}
exports.getRetryMultiplier = getRetryMultiplier;
// The initial wait time if an upload or download fails and a retry is being attempted for the first time
function getInitialRetryIntervalInMilliseconds() {
    return 3000;
}
exports.getInitialRetryIntervalInMilliseconds = getInitialRetryIntervalInMilliseconds;
// The number of concurrent downloads that happens at the same time
function getDownloadFileConcurrency() {
    return 2;
}
exports.getDownloadFileConcurrency = getDownloadFileConcurrency;
function getRuntimeToken() {
    const token = process.env['ACTIONS_RUNTIME_TOKEN'];
    if (!token) {
        throw new Error('Unable to get ACTIONS_RUNTIME_TOKEN env variable');
    }
    return token;
}
exports.getRuntimeToken = getRuntimeToken;
function getRuntimeUrl() {
    const runtimeUrl = process.env['ACTIONS_RUNTIME_URL'];
    if (!runtimeUrl) {
        throw new Error('Unable to get ACTIONS_RUNTIME_URL env variable');
    }
    return runtimeUrl;
}
exports.getRuntimeUrl = getRuntimeUrl;
function getWorkFlowRunId() {
    const workFlowRunId = process.env['GITHUB_RUN_ID'];
    if (!workFlowRunId) {
        throw new Error('Unable to get GITHUB_RUN_ID env variable');
    }
    return workFlowRunId;
}
exports.getWorkFlowRunId = getWorkFlowRunId;
function getWorkSpaceDirectory() {
    const workspaceDirectory = process.env['GITHUB_WORKSPACE'];
    if (!workspaceDirectory) {
        throw new Error('Unable to get GITHUB_WORKSPACE env variable');
    }
    return workspaceDirectory;
}
exports.getWorkSpaceDirectory = getWorkSpaceDirectory;
function getRetentionDays() {
    return process.env['GITHUB_RETENTION_DAYS'];
}
exports.getRetentionDays = getRetentionDays;
//# sourceMappingURL=config-variables.js.map

/***/ }),

/***/ "./node_modules/@actions/artifact/lib/internal/crc64.js":
/*!**************************************************************!*\
  !*** ./node_modules/@actions/artifact/lib/internal/crc64.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * CRC64: cyclic redundancy check, 64-bits
 *
 * In order to validate that artifacts are not being corrupted over the wire, this redundancy check allows us to
 * validate that there was no corruption during transmission. The implementation here is based on Go's hash/crc64 pkg,
 * but without the slicing-by-8 optimization: https://cs.opensource.google/go/go/+/master:src/hash/crc64/crc64.go
 *
 * This implementation uses a pregenerated table based on 0x9A6C9329AC4BC9B5 as the polynomial, the same polynomial that
 * is used for Azure Storage: https://github.com/Azure/azure-storage-net/blob/cbe605f9faa01bfc3003d75fc5a16b2eaccfe102/Lib/Common/Core/Util/Crc64.cs#L27
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
// when transpile target is >= ES2020 (after dropping node 12) these can be changed to bigint literals - ts(2737)
const PREGEN_POLY_TABLE = [
    BigInt('0x0000000000000000'),
    BigInt('0x7F6EF0C830358979'),
    BigInt('0xFEDDE190606B12F2'),
    BigInt('0x81B31158505E9B8B'),
    BigInt('0xC962E5739841B68F'),
    BigInt('0xB60C15BBA8743FF6'),
    BigInt('0x37BF04E3F82AA47D'),
    BigInt('0x48D1F42BC81F2D04'),
    BigInt('0xA61CECB46814FE75'),
    BigInt('0xD9721C7C5821770C'),
    BigInt('0x58C10D24087FEC87'),
    BigInt('0x27AFFDEC384A65FE'),
    BigInt('0x6F7E09C7F05548FA'),
    BigInt('0x1010F90FC060C183'),
    BigInt('0x91A3E857903E5A08'),
    BigInt('0xEECD189FA00BD371'),
    BigInt('0x78E0FF3B88BE6F81'),
    BigInt('0x078E0FF3B88BE6F8'),
    BigInt('0x863D1EABE8D57D73'),
    BigInt('0xF953EE63D8E0F40A'),
    BigInt('0xB1821A4810FFD90E'),
    BigInt('0xCEECEA8020CA5077'),
    BigInt('0x4F5FFBD87094CBFC'),
    BigInt('0x30310B1040A14285'),
    BigInt('0xDEFC138FE0AA91F4'),
    BigInt('0xA192E347D09F188D'),
    BigInt('0x2021F21F80C18306'),
    BigInt('0x5F4F02D7B0F40A7F'),
    BigInt('0x179EF6FC78EB277B'),
    BigInt('0x68F0063448DEAE02'),
    BigInt('0xE943176C18803589'),
    BigInt('0x962DE7A428B5BCF0'),
    BigInt('0xF1C1FE77117CDF02'),
    BigInt('0x8EAF0EBF2149567B'),
    BigInt('0x0F1C1FE77117CDF0'),
    BigInt('0x7072EF2F41224489'),
    BigInt('0x38A31B04893D698D'),
    BigInt('0x47CDEBCCB908E0F4'),
    BigInt('0xC67EFA94E9567B7F'),
    BigInt('0xB9100A5CD963F206'),
    BigInt('0x57DD12C379682177'),
    BigInt('0x28B3E20B495DA80E'),
    BigInt('0xA900F35319033385'),
    BigInt('0xD66E039B2936BAFC'),
    BigInt('0x9EBFF7B0E12997F8'),
    BigInt('0xE1D10778D11C1E81'),
    BigInt('0x606216208142850A'),
    BigInt('0x1F0CE6E8B1770C73'),
    BigInt('0x8921014C99C2B083'),
    BigInt('0xF64FF184A9F739FA'),
    BigInt('0x77FCE0DCF9A9A271'),
    BigInt('0x08921014C99C2B08'),
    BigInt('0x4043E43F0183060C'),
    BigInt('0x3F2D14F731B68F75'),
    BigInt('0xBE9E05AF61E814FE'),
    BigInt('0xC1F0F56751DD9D87'),
    BigInt('0x2F3DEDF8F1D64EF6'),
    BigInt('0x50531D30C1E3C78F'),
    BigInt('0xD1E00C6891BD5C04'),
    BigInt('0xAE8EFCA0A188D57D'),
    BigInt('0xE65F088B6997F879'),
    BigInt('0x9931F84359A27100'),
    BigInt('0x1882E91B09FCEA8B'),
    BigInt('0x67EC19D339C963F2'),
    BigInt('0xD75ADABD7A6E2D6F'),
    BigInt('0xA8342A754A5BA416'),
    BigInt('0x29873B2D1A053F9D'),
    BigInt('0x56E9CBE52A30B6E4'),
    BigInt('0x1E383FCEE22F9BE0'),
    BigInt('0x6156CF06D21A1299'),
    BigInt('0xE0E5DE5E82448912'),
    BigInt('0x9F8B2E96B271006B'),
    BigInt('0x71463609127AD31A'),
    BigInt('0x0E28C6C1224F5A63'),
    BigInt('0x8F9BD7997211C1E8'),
    BigInt('0xF0F5275142244891'),
    BigInt('0xB824D37A8A3B6595'),
    BigInt('0xC74A23B2BA0EECEC'),
    BigInt('0x46F932EAEA507767'),
    BigInt('0x3997C222DA65FE1E'),
    BigInt('0xAFBA2586F2D042EE'),
    BigInt('0xD0D4D54EC2E5CB97'),
    BigInt('0x5167C41692BB501C'),
    BigInt('0x2E0934DEA28ED965'),
    BigInt('0x66D8C0F56A91F461'),
    BigInt('0x19B6303D5AA47D18'),
    BigInt('0x980521650AFAE693'),
    BigInt('0xE76BD1AD3ACF6FEA'),
    BigInt('0x09A6C9329AC4BC9B'),
    BigInt('0x76C839FAAAF135E2'),
    BigInt('0xF77B28A2FAAFAE69'),
    BigInt('0x8815D86ACA9A2710'),
    BigInt('0xC0C42C4102850A14'),
    BigInt('0xBFAADC8932B0836D'),
    BigInt('0x3E19CDD162EE18E6'),
    BigInt('0x41773D1952DB919F'),
    BigInt('0x269B24CA6B12F26D'),
    BigInt('0x59F5D4025B277B14'),
    BigInt('0xD846C55A0B79E09F'),
    BigInt('0xA72835923B4C69E6'),
    BigInt('0xEFF9C1B9F35344E2'),
    BigInt('0x90973171C366CD9B'),
    BigInt('0x1124202993385610'),
    BigInt('0x6E4AD0E1A30DDF69'),
    BigInt('0x8087C87E03060C18'),
    BigInt('0xFFE938B633338561'),
    BigInt('0x7E5A29EE636D1EEA'),
    BigInt('0x0134D92653589793'),
    BigInt('0x49E52D0D9B47BA97'),
    BigInt('0x368BDDC5AB7233EE'),
    BigInt('0xB738CC9DFB2CA865'),
    BigInt('0xC8563C55CB19211C'),
    BigInt('0x5E7BDBF1E3AC9DEC'),
    BigInt('0x21152B39D3991495'),
    BigInt('0xA0A63A6183C78F1E'),
    BigInt('0xDFC8CAA9B3F20667'),
    BigInt('0x97193E827BED2B63'),
    BigInt('0xE877CE4A4BD8A21A'),
    BigInt('0x69C4DF121B863991'),
    BigInt('0x16AA2FDA2BB3B0E8'),
    BigInt('0xF86737458BB86399'),
    BigInt('0x8709C78DBB8DEAE0'),
    BigInt('0x06BAD6D5EBD3716B'),
    BigInt('0x79D4261DDBE6F812'),
    BigInt('0x3105D23613F9D516'),
    BigInt('0x4E6B22FE23CC5C6F'),
    BigInt('0xCFD833A67392C7E4'),
    BigInt('0xB0B6C36E43A74E9D'),
    BigInt('0x9A6C9329AC4BC9B5'),
    BigInt('0xE50263E19C7E40CC'),
    BigInt('0x64B172B9CC20DB47'),
    BigInt('0x1BDF8271FC15523E'),
    BigInt('0x530E765A340A7F3A'),
    BigInt('0x2C608692043FF643'),
    BigInt('0xADD397CA54616DC8'),
    BigInt('0xD2BD67026454E4B1'),
    BigInt('0x3C707F9DC45F37C0'),
    BigInt('0x431E8F55F46ABEB9'),
    BigInt('0xC2AD9E0DA4342532'),
    BigInt('0xBDC36EC59401AC4B'),
    BigInt('0xF5129AEE5C1E814F'),
    BigInt('0x8A7C6A266C2B0836'),
    BigInt('0x0BCF7B7E3C7593BD'),
    BigInt('0x74A18BB60C401AC4'),
    BigInt('0xE28C6C1224F5A634'),
    BigInt('0x9DE29CDA14C02F4D'),
    BigInt('0x1C518D82449EB4C6'),
    BigInt('0x633F7D4A74AB3DBF'),
    BigInt('0x2BEE8961BCB410BB'),
    BigInt('0x548079A98C8199C2'),
    BigInt('0xD53368F1DCDF0249'),
    BigInt('0xAA5D9839ECEA8B30'),
    BigInt('0x449080A64CE15841'),
    BigInt('0x3BFE706E7CD4D138'),
    BigInt('0xBA4D61362C8A4AB3'),
    BigInt('0xC52391FE1CBFC3CA'),
    BigInt('0x8DF265D5D4A0EECE'),
    BigInt('0xF29C951DE49567B7'),
    BigInt('0x732F8445B4CBFC3C'),
    BigInt('0x0C41748D84FE7545'),
    BigInt('0x6BAD6D5EBD3716B7'),
    BigInt('0x14C39D968D029FCE'),
    BigInt('0x95708CCEDD5C0445'),
    BigInt('0xEA1E7C06ED698D3C'),
    BigInt('0xA2CF882D2576A038'),
    BigInt('0xDDA178E515432941'),
    BigInt('0x5C1269BD451DB2CA'),
    BigInt('0x237C997575283BB3'),
    BigInt('0xCDB181EAD523E8C2'),
    BigInt('0xB2DF7122E51661BB'),
    BigInt('0x336C607AB548FA30'),
    BigInt('0x4C0290B2857D7349'),
    BigInt('0x04D364994D625E4D'),
    BigInt('0x7BBD94517D57D734'),
    BigInt('0xFA0E85092D094CBF'),
    BigInt('0x856075C11D3CC5C6'),
    BigInt('0x134D926535897936'),
    BigInt('0x6C2362AD05BCF04F'),
    BigInt('0xED9073F555E26BC4'),
    BigInt('0x92FE833D65D7E2BD'),
    BigInt('0xDA2F7716ADC8CFB9'),
    BigInt('0xA54187DE9DFD46C0'),
    BigInt('0x24F29686CDA3DD4B'),
    BigInt('0x5B9C664EFD965432'),
    BigInt('0xB5517ED15D9D8743'),
    BigInt('0xCA3F8E196DA80E3A'),
    BigInt('0x4B8C9F413DF695B1'),
    BigInt('0x34E26F890DC31CC8'),
    BigInt('0x7C339BA2C5DC31CC'),
    BigInt('0x035D6B6AF5E9B8B5'),
    BigInt('0x82EE7A32A5B7233E'),
    BigInt('0xFD808AFA9582AA47'),
    BigInt('0x4D364994D625E4DA'),
    BigInt('0x3258B95CE6106DA3'),
    BigInt('0xB3EBA804B64EF628'),
    BigInt('0xCC8558CC867B7F51'),
    BigInt('0x8454ACE74E645255'),
    BigInt('0xFB3A5C2F7E51DB2C'),
    BigInt('0x7A894D772E0F40A7'),
    BigInt('0x05E7BDBF1E3AC9DE'),
    BigInt('0xEB2AA520BE311AAF'),
    BigInt('0x944455E88E0493D6'),
    BigInt('0x15F744B0DE5A085D'),
    BigInt('0x6A99B478EE6F8124'),
    BigInt('0x224840532670AC20'),
    BigInt('0x5D26B09B16452559'),
    BigInt('0xDC95A1C3461BBED2'),
    BigInt('0xA3FB510B762E37AB'),
    BigInt('0x35D6B6AF5E9B8B5B'),
    BigInt('0x4AB846676EAE0222'),
    BigInt('0xCB0B573F3EF099A9'),
    BigInt('0xB465A7F70EC510D0'),
    BigInt('0xFCB453DCC6DA3DD4'),
    BigInt('0x83DAA314F6EFB4AD'),
    BigInt('0x0269B24CA6B12F26'),
    BigInt('0x7D0742849684A65F'),
    BigInt('0x93CA5A1B368F752E'),
    BigInt('0xECA4AAD306BAFC57'),
    BigInt('0x6D17BB8B56E467DC'),
    BigInt('0x12794B4366D1EEA5'),
    BigInt('0x5AA8BF68AECEC3A1'),
    BigInt('0x25C64FA09EFB4AD8'),
    BigInt('0xA4755EF8CEA5D153'),
    BigInt('0xDB1BAE30FE90582A'),
    BigInt('0xBCF7B7E3C7593BD8'),
    BigInt('0xC399472BF76CB2A1'),
    BigInt('0x422A5673A732292A'),
    BigInt('0x3D44A6BB9707A053'),
    BigInt('0x759552905F188D57'),
    BigInt('0x0AFBA2586F2D042E'),
    BigInt('0x8B48B3003F739FA5'),
    BigInt('0xF42643C80F4616DC'),
    BigInt('0x1AEB5B57AF4DC5AD'),
    BigInt('0x6585AB9F9F784CD4'),
    BigInt('0xE436BAC7CF26D75F'),
    BigInt('0x9B584A0FFF135E26'),
    BigInt('0xD389BE24370C7322'),
    BigInt('0xACE74EEC0739FA5B'),
    BigInt('0x2D545FB4576761D0'),
    BigInt('0x523AAF7C6752E8A9'),
    BigInt('0xC41748D84FE75459'),
    BigInt('0xBB79B8107FD2DD20'),
    BigInt('0x3ACAA9482F8C46AB'),
    BigInt('0x45A459801FB9CFD2'),
    BigInt('0x0D75ADABD7A6E2D6'),
    BigInt('0x721B5D63E7936BAF'),
    BigInt('0xF3A84C3BB7CDF024'),
    BigInt('0x8CC6BCF387F8795D'),
    BigInt('0x620BA46C27F3AA2C'),
    BigInt('0x1D6554A417C62355'),
    BigInt('0x9CD645FC4798B8DE'),
    BigInt('0xE3B8B53477AD31A7'),
    BigInt('0xAB69411FBFB21CA3'),
    BigInt('0xD407B1D78F8795DA'),
    BigInt('0x55B4A08FDFD90E51'),
    BigInt('0x2ADA5047EFEC8728')
];
class CRC64 {
    constructor() {
        this._crc = BigInt(0);
    }
    update(data) {
        const buffer = typeof data === 'string' ? Buffer.from(data) : data;
        let crc = CRC64.flip64Bits(this._crc);
        for (const dataByte of buffer) {
            const crcByte = Number(crc & BigInt(0xff));
            crc = PREGEN_POLY_TABLE[crcByte ^ dataByte] ^ (crc >> BigInt(8));
        }
        this._crc = CRC64.flip64Bits(crc);
    }
    digest(encoding) {
        switch (encoding) {
            case 'hex':
                return this._crc.toString(16).toUpperCase();
            case 'base64':
                return this.toBuffer().toString('base64');
            default:
                return this.toBuffer();
        }
    }
    toBuffer() {
        return Buffer.from([0, 8, 16, 24, 32, 40, 48, 56].map(s => Number((this._crc >> BigInt(s)) & BigInt(0xff))));
    }
    static flip64Bits(n) {
        return (BigInt(1) << BigInt(64)) - BigInt(1) - n;
    }
}
exports["default"] = CRC64;
//# sourceMappingURL=crc64.js.map

/***/ }),

/***/ "./node_modules/@actions/artifact/lib/internal/download-http-client.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@actions/artifact/lib/internal/download-http-client.js ***!
  \*****************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DownloadHttpClient = void 0;
const fs = __importStar(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'fs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const core = __importStar(__webpack_require__(/*! @actions/core */ "./node_modules/@actions/core/lib/core.js"));
const zlib = __importStar(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'zlib'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/@actions/artifact/lib/internal/utils.js");
const url_1 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'url'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const status_reporter_1 = __webpack_require__(/*! ./status-reporter */ "./node_modules/@actions/artifact/lib/internal/status-reporter.js");
const perf_hooks_1 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'perf_hooks'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const http_manager_1 = __webpack_require__(/*! ./http-manager */ "./node_modules/@actions/artifact/lib/internal/http-manager.js");
const config_variables_1 = __webpack_require__(/*! ./config-variables */ "./node_modules/@actions/artifact/lib/internal/config-variables.js");
const requestUtils_1 = __webpack_require__(/*! ./requestUtils */ "./node_modules/@actions/artifact/lib/internal/requestUtils.js");
class DownloadHttpClient {
    constructor() {
        this.downloadHttpManager = new http_manager_1.HttpManager(config_variables_1.getDownloadFileConcurrency(), '@actions/artifact-download');
        // downloads are usually significantly faster than uploads so display status information every second
        this.statusReporter = new status_reporter_1.StatusReporter(1000);
    }
    /**
     * Gets a list of all artifacts that are in a specific container
     */
    listArtifacts() {
        return __awaiter(this, void 0, void 0, function* () {
            const artifactUrl = utils_1.getArtifactUrl();
            // use the first client from the httpManager, `keep-alive` is not used so the connection will close immediately
            const client = this.downloadHttpManager.getClient(0);
            const headers = utils_1.getDownloadHeaders('application/json');
            const response = yield requestUtils_1.retryHttpClientRequest('List Artifacts', () => __awaiter(this, void 0, void 0, function* () { return client.get(artifactUrl, headers); }));
            const body = yield response.readBody();
            return JSON.parse(body);
        });
    }
    /**
     * Fetches a set of container items that describe the contents of an artifact
     * @param artifactName the name of the artifact
     * @param containerUrl the artifact container URL for the run
     */
    getContainerItems(artifactName, containerUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            // the itemPath search parameter controls which containers will be returned
            const resourceUrl = new url_1.URL(containerUrl);
            resourceUrl.searchParams.append('itemPath', artifactName);
            // use the first client from the httpManager, `keep-alive` is not used so the connection will close immediately
            const client = this.downloadHttpManager.getClient(0);
            const headers = utils_1.getDownloadHeaders('application/json');
            const response = yield requestUtils_1.retryHttpClientRequest('Get Container Items', () => __awaiter(this, void 0, void 0, function* () { return client.get(resourceUrl.toString(), headers); }));
            const body = yield response.readBody();
            return JSON.parse(body);
        });
    }
    /**
     * Concurrently downloads all the files that are part of an artifact
     * @param downloadItems information about what items to download and where to save them
     */
    downloadSingleArtifact(downloadItems) {
        return __awaiter(this, void 0, void 0, function* () {
            const DOWNLOAD_CONCURRENCY = config_variables_1.getDownloadFileConcurrency();
            // limit the number of files downloaded at a single time
            core.debug(`Download file concurrency is set to ${DOWNLOAD_CONCURRENCY}`);
            const parallelDownloads = [...new Array(DOWNLOAD_CONCURRENCY).keys()];
            let currentFile = 0;
            let downloadedFiles = 0;
            core.info(`Total number of files that will be downloaded: ${downloadItems.length}`);
            this.statusReporter.setTotalNumberOfFilesToProcess(downloadItems.length);
            this.statusReporter.start();
            yield Promise.all(parallelDownloads.map((index) => __awaiter(this, void 0, void 0, function* () {
                while (currentFile < downloadItems.length) {
                    const currentFileToDownload = downloadItems[currentFile];
                    currentFile += 1;
                    const startTime = perf_hooks_1.performance.now();
                    yield this.downloadIndividualFile(index, currentFileToDownload.sourceLocation, currentFileToDownload.targetPath);
                    if (core.isDebug()) {
                        core.debug(`File: ${++downloadedFiles}/${downloadItems.length}. ${currentFileToDownload.targetPath} took ${(perf_hooks_1.performance.now() - startTime).toFixed(3)} milliseconds to finish downloading`);
                    }
                    this.statusReporter.incrementProcessedCount();
                }
            })))
                .catch(error => {
                throw new Error(`Unable to download the artifact: ${error}`);
            })
                .finally(() => {
                this.statusReporter.stop();
                // safety dispose all connections
                this.downloadHttpManager.disposeAndReplaceAllClients();
            });
        });
    }
    /**
     * Downloads an individual file
     * @param httpClientIndex the index of the http client that is used to make all of the calls
     * @param artifactLocation origin location where a file will be downloaded from
     * @param downloadPath destination location for the file being downloaded
     */
    downloadIndividualFile(httpClientIndex, artifactLocation, downloadPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let retryCount = 0;
            const retryLimit = config_variables_1.getRetryLimit();
            let destinationStream = fs.createWriteStream(downloadPath);
            const headers = utils_1.getDownloadHeaders('application/json', true, true);
            // a single GET request is used to download a file
            const makeDownloadRequest = () => __awaiter(this, void 0, void 0, function* () {
                const client = this.downloadHttpManager.getClient(httpClientIndex);
                return yield client.get(artifactLocation, headers);
            });
            // check the response headers to determine if the file was compressed using gzip
            const isGzip = (incomingHeaders) => {
                return ('content-encoding' in incomingHeaders &&
                    incomingHeaders['content-encoding'] === 'gzip');
            };
            // Increments the current retry count and then checks if the retry limit has been reached
            // If there have been too many retries, fail so the download stops. If there is a retryAfterValue value provided,
            // it will be used
            const backOff = (retryAfterValue) => __awaiter(this, void 0, void 0, function* () {
                retryCount++;
                if (retryCount > retryLimit) {
                    return Promise.reject(new Error(`Retry limit has been reached. Unable to download ${artifactLocation}`));
                }
                else {
                    this.downloadHttpManager.disposeAndReplaceClient(httpClientIndex);
                    if (retryAfterValue) {
                        // Back off by waiting the specified time denoted by the retry-after header
                        core.info(`Backoff due to too many requests, retry #${retryCount}. Waiting for ${retryAfterValue} milliseconds before continuing the download`);
                        yield utils_1.sleep(retryAfterValue);
                    }
                    else {
                        // Back off using an exponential value that depends on the retry count
                        const backoffTime = utils_1.getExponentialRetryTimeInMilliseconds(retryCount);
                        core.info(`Exponential backoff for retry #${retryCount}. Waiting for ${backoffTime} milliseconds before continuing the download`);
                        yield utils_1.sleep(backoffTime);
                    }
                    core.info(`Finished backoff for retry #${retryCount}, continuing with download`);
                }
            });
            const isAllBytesReceived = (expected, received) => {
                // be lenient, if any input is missing, assume success, i.e. not truncated
                if (!expected ||
                    !received ||
                    process.env['ACTIONS_ARTIFACT_SKIP_DOWNLOAD_VALIDATION']) {
                    core.info('Skipping download validation.');
                    return true;
                }
                return parseInt(expected) === received;
            };
            const resetDestinationStream = (fileDownloadPath) => __awaiter(this, void 0, void 0, function* () {
                destinationStream.close();
                // await until file is created at downloadpath; node15 and up fs.createWriteStream had not created a file yet
                yield new Promise(resolve => {
                    destinationStream.on('close', resolve);
                    if (destinationStream.writableFinished) {
                        resolve();
                    }
                });
                yield utils_1.rmFile(fileDownloadPath);
                destinationStream = fs.createWriteStream(fileDownloadPath);
            });
            // keep trying to download a file until a retry limit has been reached
            while (retryCount <= retryLimit) {
                let response;
                try {
                    response = yield makeDownloadRequest();
                }
                catch (error) {
                    // if an error is caught, it is usually indicative of a timeout so retry the download
                    core.info('An error occurred while attempting to download a file');
                    // eslint-disable-next-line no-console
                    console.log(error);
                    // increment the retryCount and use exponential backoff to wait before making the next request
                    yield backOff();
                    continue;
                }
                let forceRetry = false;
                if (utils_1.isSuccessStatusCode(response.message.statusCode)) {
                    // The body contains the contents of the file however calling response.readBody() causes all the content to be converted to a string
                    // which can cause some gzip encoded data to be lost
                    // Instead of using response.readBody(), response.message is a readableStream that can be directly used to get the raw body contents
                    try {
                        const isGzipped = isGzip(response.message.headers);
                        yield this.pipeResponseToFile(response, destinationStream, isGzipped);
                        if (isGzipped ||
                            isAllBytesReceived(response.message.headers['content-length'], yield utils_1.getFileSize(downloadPath))) {
                            return;
                        }
                        else {
                            forceRetry = true;
                        }
                    }
                    catch (error) {
                        // retry on error, most likely streams were corrupted
                        forceRetry = true;
                    }
                }
                if (forceRetry || utils_1.isRetryableStatusCode(response.message.statusCode)) {
                    core.info(`A ${response.message.statusCode} response code has been received while attempting to download an artifact`);
                    resetDestinationStream(downloadPath);
                    // if a throttled status code is received, try to get the retryAfter header value, else differ to standard exponential backoff
                    utils_1.isThrottledStatusCode(response.message.statusCode)
                        ? yield backOff(utils_1.tryGetRetryAfterValueTimeInMilliseconds(response.message.headers))
                        : yield backOff();
                }
                else {
                    // Some unexpected response code, fail immediately and stop the download
                    utils_1.displayHttpDiagnostics(response);
                    return Promise.reject(new Error(`Unexpected http ${response.message.statusCode} during download for ${artifactLocation}`));
                }
            }
        });
    }
    /**
     * Pipes the response from downloading an individual file to the appropriate destination stream while decoding gzip content if necessary
     * @param response the http response received when downloading a file
     * @param destinationStream the stream where the file should be written to
     * @param isGzip a boolean denoting if the content is compressed using gzip and if we need to decode it
     */
    pipeResponseToFile(response, destinationStream, isGzip) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve, reject) => {
                if (isGzip) {
                    const gunzip = zlib.createGunzip();
                    response.message
                        .on('error', error => {
                        core.error(`An error occurred while attempting to read the response stream`);
                        gunzip.close();
                        destinationStream.close();
                        reject(error);
                    })
                        .pipe(gunzip)
                        .on('error', error => {
                        core.error(`An error occurred while attempting to decompress the response stream`);
                        destinationStream.close();
                        reject(error);
                    })
                        .pipe(destinationStream)
                        .on('close', () => {
                        resolve();
                    })
                        .on('error', error => {
                        core.error(`An error occurred while writing a downloaded file to ${destinationStream.path}`);
                        reject(error);
                    });
                }
                else {
                    response.message
                        .on('error', error => {
                        core.error(`An error occurred while attempting to read the response stream`);
                        destinationStream.close();
                        reject(error);
                    })
                        .pipe(destinationStream)
                        .on('close', () => {
                        resolve();
                    })
                        .on('error', error => {
                        core.error(`An error occurred while writing a downloaded file to ${destinationStream.path}`);
                        reject(error);
                    });
                }
            });
            return;
        });
    }
}
exports.DownloadHttpClient = DownloadHttpClient;
//# sourceMappingURL=download-http-client.js.map

/***/ }),

/***/ "./node_modules/@actions/artifact/lib/internal/download-specification.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@actions/artifact/lib/internal/download-specification.js ***!
  \*******************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getDownloadSpecification = void 0;
const path = __importStar(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'path'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
/**
 * Creates a specification for a set of files that will be downloaded
 * @param artifactName the name of the artifact
 * @param artifactEntries a set of container entries that describe that files that make up an artifact
 * @param downloadPath the path where the artifact will be downloaded to
 * @param includeRootDirectory specifies if there should be an extra directory (denoted by the artifact name) where the artifact files should be downloaded to
 */
function getDownloadSpecification(artifactName, artifactEntries, downloadPath, includeRootDirectory) {
    // use a set for the directory paths so that there are no duplicates
    const directories = new Set();
    const specifications = {
        rootDownloadLocation: includeRootDirectory
            ? path.join(downloadPath, artifactName)
            : downloadPath,
        directoryStructure: [],
        emptyFilesToCreate: [],
        filesToDownload: []
    };
    for (const entry of artifactEntries) {
        // Ignore artifacts in the container that don't begin with the same name
        if (entry.path.startsWith(`${artifactName}/`) ||
            entry.path.startsWith(`${artifactName}\\`)) {
            // normalize all separators to the local OS
            const normalizedPathEntry = path.normalize(entry.path);
            // entry.path always starts with the artifact name, if includeRootDirectory is false, remove the name from the beginning of the path
            const filePath = path.join(downloadPath, includeRootDirectory
                ? normalizedPathEntry
                : normalizedPathEntry.replace(artifactName, ''));
            // Case insensitive folder structure maintained in the backend, not every folder is created so the 'folder'
            // itemType cannot be relied upon. The file must be used to determine the directory structure
            if (entry.itemType === 'file') {
                // Get the directories that we need to create from the filePath for each individual file
                directories.add(path.dirname(filePath));
                if (entry.fileLength === 0) {
                    // An empty file was uploaded, create the empty files locally so that no extra http calls are made
                    specifications.emptyFilesToCreate.push(filePath);
                }
                else {
                    specifications.filesToDownload.push({
                        sourceLocation: entry.contentLocation,
                        targetPath: filePath
                    });
                }
            }
        }
    }
    specifications.directoryStructure = Array.from(directories);
    return specifications;
}
exports.getDownloadSpecification = getDownloadSpecification;
//# sourceMappingURL=download-specification.js.map

/***/ }),

/***/ "./node_modules/@actions/artifact/lib/internal/http-manager.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@actions/artifact/lib/internal/http-manager.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpManager = void 0;
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/@actions/artifact/lib/internal/utils.js");
/**
 * Used for managing http clients during either upload or download
 */
class HttpManager {
    constructor(clientCount, userAgent) {
        if (clientCount < 1) {
            throw new Error('There must be at least one client');
        }
        this.userAgent = userAgent;
        this.clients = new Array(clientCount).fill(utils_1.createHttpClient(userAgent));
    }
    getClient(index) {
        return this.clients[index];
    }
    // client disposal is necessary if a keep-alive connection is used to properly close the connection
    // for more information see: https://github.com/actions/http-client/blob/04e5ad73cd3fd1f5610a32116b0759eddf6570d2/index.ts#L292
    disposeAndReplaceClient(index) {
        this.clients[index].dispose();
        this.clients[index] = utils_1.createHttpClient(this.userAgent);
    }
    disposeAndReplaceAllClients() {
        for (const [index] of this.clients.entries()) {
            this.disposeAndReplaceClient(index);
        }
    }
}
exports.HttpManager = HttpManager;
//# sourceMappingURL=http-manager.js.map

/***/ }),

/***/ "./node_modules/@actions/artifact/lib/internal/path-and-artifact-name-validation.js":
/*!******************************************************************************************!*\
  !*** ./node_modules/@actions/artifact/lib/internal/path-and-artifact-name-validation.js ***!
  \******************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.checkArtifactFilePath = exports.checkArtifactName = void 0;
const core_1 = __webpack_require__(/*! @actions/core */ "./node_modules/@actions/core/lib/core.js");
/**
 * Invalid characters that cannot be in the artifact name or an uploaded file. Will be rejected
 * from the server if attempted to be sent over. These characters are not allowed due to limitations with certain
 * file systems such as NTFS. To maintain platform-agnostic behavior, all characters that are not supported by an
 * individual filesystem/platform will not be supported on all fileSystems/platforms
 *
 * FilePaths can include characters such as \ and / which are not permitted in the artifact name alone
 */
const invalidArtifactFilePathCharacters = new Map([
    ['"', ' Double quote "'],
    [':', ' Colon :'],
    ['<', ' Less than <'],
    ['>', ' Greater than >'],
    ['|', ' Vertical bar |'],
    ['*', ' Asterisk *'],
    ['?', ' Question mark ?'],
    ['\r', ' Carriage return \\r'],
    ['\n', ' Line feed \\n']
]);
const invalidArtifactNameCharacters = new Map([
    ...invalidArtifactFilePathCharacters,
    ['\\', ' Backslash \\'],
    ['/', ' Forward slash /']
]);
/**
 * Scans the name of the artifact to make sure there are no illegal characters
 */
function checkArtifactName(name) {
    if (!name) {
        throw new Error(`Artifact name: ${name}, is incorrectly provided`);
    }
    for (const [invalidCharacterKey, errorMessageForCharacter] of invalidArtifactNameCharacters) {
        if (name.includes(invalidCharacterKey)) {
            throw new Error(`Artifact name is not valid: ${name}. Contains the following character: ${errorMessageForCharacter}
          
Invalid characters include: ${Array.from(invalidArtifactNameCharacters.values()).toString()}
          
These characters are not allowed in the artifact name due to limitations with certain file systems such as NTFS. To maintain file system agnostic behavior, these characters are intentionally not allowed to prevent potential problems with downloads on different file systems.`);
        }
    }
    core_1.info(`Artifact name is valid!`);
}
exports.checkArtifactName = checkArtifactName;
/**
 * Scans the name of the filePath used to make sure there are no illegal characters
 */
function checkArtifactFilePath(path) {
    if (!path) {
        throw new Error(`Artifact path: ${path}, is incorrectly provided`);
    }
    for (const [invalidCharacterKey, errorMessageForCharacter] of invalidArtifactFilePathCharacters) {
        if (path.includes(invalidCharacterKey)) {
            throw new Error(`Artifact path is not valid: ${path}. Contains the following character: ${errorMessageForCharacter}
          
Invalid characters include: ${Array.from(invalidArtifactFilePathCharacters.values()).toString()}
          
The following characters are not allowed in files that are uploaded due to limitations with certain file systems such as NTFS. To maintain file system agnostic behavior, these characters are intentionally not allowed to prevent potential problems with downloads on different file systems.
          `);
        }
    }
}
exports.checkArtifactFilePath = checkArtifactFilePath;
//# sourceMappingURL=path-and-artifact-name-validation.js.map

/***/ }),

/***/ "./node_modules/@actions/artifact/lib/internal/requestUtils.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@actions/artifact/lib/internal/requestUtils.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.retryHttpClientRequest = exports.retry = void 0;
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/@actions/artifact/lib/internal/utils.js");
const core = __importStar(__webpack_require__(/*! @actions/core */ "./node_modules/@actions/core/lib/core.js"));
const config_variables_1 = __webpack_require__(/*! ./config-variables */ "./node_modules/@actions/artifact/lib/internal/config-variables.js");
function retry(name, operation, customErrorMessages, maxAttempts) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = undefined;
        let statusCode = undefined;
        let isRetryable = false;
        let errorMessage = '';
        let customErrorInformation = undefined;
        let attempt = 1;
        while (attempt <= maxAttempts) {
            try {
                response = yield operation();
                statusCode = response.message.statusCode;
                if (utils_1.isSuccessStatusCode(statusCode)) {
                    return response;
                }
                // Extra error information that we want to display if a particular response code is hit
                if (statusCode) {
                    customErrorInformation = customErrorMessages.get(statusCode);
                }
                isRetryable = utils_1.isRetryableStatusCode(statusCode);
                errorMessage = `Artifact service responded with ${statusCode}`;
            }
            catch (error) {
                isRetryable = true;
                errorMessage = error.message;
            }
            if (!isRetryable) {
                core.info(`${name} - Error is not retryable`);
                if (response) {
                    utils_1.displayHttpDiagnostics(response);
                }
                break;
            }
            core.info(`${name} - Attempt ${attempt} of ${maxAttempts} failed with error: ${errorMessage}`);
            yield utils_1.sleep(utils_1.getExponentialRetryTimeInMilliseconds(attempt));
            attempt++;
        }
        if (response) {
            utils_1.displayHttpDiagnostics(response);
        }
        if (customErrorInformation) {
            throw Error(`${name} failed: ${customErrorInformation}`);
        }
        throw Error(`${name} failed: ${errorMessage}`);
    });
}
exports.retry = retry;
function retryHttpClientRequest(name, method, customErrorMessages = new Map(), maxAttempts = config_variables_1.getRetryLimit()) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield retry(name, method, customErrorMessages, maxAttempts);
    });
}
exports.retryHttpClientRequest = retryHttpClientRequest;
//# sourceMappingURL=requestUtils.js.map

/***/ }),

/***/ "./node_modules/@actions/artifact/lib/internal/status-reporter.js":
/*!************************************************************************!*\
  !*** ./node_modules/@actions/artifact/lib/internal/status-reporter.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StatusReporter = void 0;
const core_1 = __webpack_require__(/*! @actions/core */ "./node_modules/@actions/core/lib/core.js");
/**
 * Status Reporter that displays information about the progress/status of an artifact that is being uploaded or downloaded
 *
 * Variable display time that can be adjusted using the displayFrequencyInMilliseconds variable
 * The total status of the upload/download gets displayed according to this value
 * If there is a large file that is being uploaded, extra information about the individual status can also be displayed using the updateLargeFileStatus function
 */
class StatusReporter {
    constructor(displayFrequencyInMilliseconds) {
        this.totalNumberOfFilesToProcess = 0;
        this.processedCount = 0;
        this.largeFiles = new Map();
        this.totalFileStatus = undefined;
        this.displayFrequencyInMilliseconds = displayFrequencyInMilliseconds;
    }
    setTotalNumberOfFilesToProcess(fileTotal) {
        this.totalNumberOfFilesToProcess = fileTotal;
        this.processedCount = 0;
    }
    start() {
        // displays information about the total upload/download status
        this.totalFileStatus = setInterval(() => {
            // display 1 decimal place without any rounding
            const percentage = this.formatPercentage(this.processedCount, this.totalNumberOfFilesToProcess);
            core_1.info(`Total file count: ${this.totalNumberOfFilesToProcess} ---- Processed file #${this.processedCount} (${percentage.slice(0, percentage.indexOf('.') + 2)}%)`);
        }, this.displayFrequencyInMilliseconds);
    }
    // if there is a large file that is being uploaded in chunks, this is used to display extra information about the status of the upload
    updateLargeFileStatus(fileName, chunkStartIndex, chunkEndIndex, totalUploadFileSize) {
        // display 1 decimal place without any rounding
        const percentage = this.formatPercentage(chunkEndIndex, totalUploadFileSize);
        core_1.info(`Uploaded ${fileName} (${percentage.slice(0, percentage.indexOf('.') + 2)}%) bytes ${chunkStartIndex}:${chunkEndIndex}`);
    }
    stop() {
        if (this.totalFileStatus) {
            clearInterval(this.totalFileStatus);
        }
    }
    incrementProcessedCount() {
        this.processedCount++;
    }
    formatPercentage(numerator, denominator) {
        // toFixed() rounds, so use extra precision to display accurate information even though 4 decimal places are not displayed
        return ((numerator / denominator) * 100).toFixed(4).toString();
    }
}
exports.StatusReporter = StatusReporter;
//# sourceMappingURL=status-reporter.js.map

/***/ }),

/***/ "./node_modules/@actions/artifact/lib/internal/upload-gzip.js":
/*!********************************************************************!*\
  !*** ./node_modules/@actions/artifact/lib/internal/upload-gzip.js ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createGZipFileInBuffer = exports.createGZipFileOnDisk = void 0;
const fs = __importStar(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'fs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const zlib = __importStar(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'zlib'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const util_1 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'util'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const stat = util_1.promisify(fs.stat);
/**
 * GZipping certain files that are already compressed will likely not yield further size reductions. Creating large temporary gzip
 * files then will just waste a lot of time before ultimately being discarded (especially for very large files).
 * If any of these types of files are encountered then on-disk gzip creation will be skipped and the original file will be uploaded as-is
 */
const gzipExemptFileExtensions = [
    '.gzip',
    '.zip',
    '.tar.lz',
    '.tar.gz',
    '.tar.bz2',
    '.7z'
];
/**
 * Creates a Gzip compressed file of an original file at the provided temporary filepath location
 * @param {string} originalFilePath filepath of whatever will be compressed. The original file will be unmodified
 * @param {string} tempFilePath the location of where the Gzip file will be created
 * @returns the size of gzip file that gets created
 */
function createGZipFileOnDisk(originalFilePath, tempFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const gzipExemptExtension of gzipExemptFileExtensions) {
            if (originalFilePath.endsWith(gzipExemptExtension)) {
                // return a really large number so that the original file gets uploaded
                return Number.MAX_SAFE_INTEGER;
            }
        }
        return new Promise((resolve, reject) => {
            const inputStream = fs.createReadStream(originalFilePath);
            const gzip = zlib.createGzip();
            const outputStream = fs.createWriteStream(tempFilePath);
            inputStream.pipe(gzip).pipe(outputStream);
            outputStream.on('finish', () => __awaiter(this, void 0, void 0, function* () {
                // wait for stream to finish before calculating the size which is needed as part of the Content-Length header when starting an upload
                const size = (yield stat(tempFilePath)).size;
                resolve(size);
            }));
            outputStream.on('error', error => {
                // eslint-disable-next-line no-console
                console.log(error);
                reject;
            });
        });
    });
}
exports.createGZipFileOnDisk = createGZipFileOnDisk;
/**
 * Creates a GZip file in memory using a buffer. Should be used for smaller files to reduce disk I/O
 * @param originalFilePath the path to the original file that is being GZipped
 * @returns a buffer with the GZip file
 */
function createGZipFileInBuffer(originalFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            var e_1, _a;
            const inputStream = fs.createReadStream(originalFilePath);
            const gzip = zlib.createGzip();
            inputStream.pipe(gzip);
            // read stream into buffer, using experimental async iterators see https://github.com/nodejs/readable-stream/issues/403#issuecomment-479069043
            const chunks = [];
            try {
                for (var gzip_1 = __asyncValues(gzip), gzip_1_1; gzip_1_1 = yield gzip_1.next(), !gzip_1_1.done;) {
                    const chunk = gzip_1_1.value;
                    chunks.push(chunk);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (gzip_1_1 && !gzip_1_1.done && (_a = gzip_1.return)) yield _a.call(gzip_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            resolve(Buffer.concat(chunks));
        }));
    });
}
exports.createGZipFileInBuffer = createGZipFileInBuffer;
//# sourceMappingURL=upload-gzip.js.map

/***/ }),

/***/ "./node_modules/@actions/artifact/lib/internal/upload-http-client.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@actions/artifact/lib/internal/upload-http-client.js ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UploadHttpClient = void 0;
const fs = __importStar(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'fs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const core = __importStar(__webpack_require__(/*! @actions/core */ "./node_modules/@actions/core/lib/core.js"));
const tmp = __importStar(__webpack_require__(/*! tmp-promise */ "./node_modules/tmp-promise/index.js"));
const stream = __importStar(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'stream'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/@actions/artifact/lib/internal/utils.js");
const config_variables_1 = __webpack_require__(/*! ./config-variables */ "./node_modules/@actions/artifact/lib/internal/config-variables.js");
const util_1 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'util'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const url_1 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'url'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const perf_hooks_1 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'perf_hooks'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const status_reporter_1 = __webpack_require__(/*! ./status-reporter */ "./node_modules/@actions/artifact/lib/internal/status-reporter.js");
const http_client_1 = __webpack_require__(/*! @actions/http-client */ "./node_modules/@actions/http-client/lib/index.js");
const http_manager_1 = __webpack_require__(/*! ./http-manager */ "./node_modules/@actions/artifact/lib/internal/http-manager.js");
const upload_gzip_1 = __webpack_require__(/*! ./upload-gzip */ "./node_modules/@actions/artifact/lib/internal/upload-gzip.js");
const requestUtils_1 = __webpack_require__(/*! ./requestUtils */ "./node_modules/@actions/artifact/lib/internal/requestUtils.js");
const stat = util_1.promisify(fs.stat);
class UploadHttpClient {
    constructor() {
        this.uploadHttpManager = new http_manager_1.HttpManager(config_variables_1.getUploadFileConcurrency(), '@actions/artifact-upload');
        this.statusReporter = new status_reporter_1.StatusReporter(10000);
    }
    /**
     * Creates a file container for the new artifact in the remote blob storage/file service
     * @param {string} artifactName Name of the artifact being created
     * @returns The response from the Artifact Service if the file container was successfully created
     */
    createArtifactInFileContainer(artifactName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = {
                Type: 'actions_storage',
                Name: artifactName
            };
            // calculate retention period
            if (options && options.retentionDays) {
                const maxRetentionStr = config_variables_1.getRetentionDays();
                parameters.RetentionDays = utils_1.getProperRetention(options.retentionDays, maxRetentionStr);
            }
            const data = JSON.stringify(parameters, null, 2);
            const artifactUrl = utils_1.getArtifactUrl();
            // use the first client from the httpManager, `keep-alive` is not used so the connection will close immediately
            const client = this.uploadHttpManager.getClient(0);
            const headers = utils_1.getUploadHeaders('application/json', false);
            // Extra information to display when a particular HTTP code is returned
            // If a 403 is returned when trying to create a file container, the customer has exceeded
            // their storage quota so no new artifact containers can be created
            const customErrorMessages = new Map([
                [
                    http_client_1.HttpCodes.Forbidden,
                    'Artifact storage quota has been hit. Unable to upload any new artifacts'
                ],
                [
                    http_client_1.HttpCodes.BadRequest,
                    `The artifact name ${artifactName} is not valid. Request URL ${artifactUrl}`
                ]
            ]);
            const response = yield requestUtils_1.retryHttpClientRequest('Create Artifact Container', () => __awaiter(this, void 0, void 0, function* () { return client.post(artifactUrl, data, headers); }), customErrorMessages);
            const body = yield response.readBody();
            return JSON.parse(body);
        });
    }
    /**
     * Concurrently upload all of the files in chunks
     * @param {string} uploadUrl Base Url for the artifact that was created
     * @param {SearchResult[]} filesToUpload A list of information about the files being uploaded
     * @returns The size of all the files uploaded in bytes
     */
    uploadArtifactToFileContainer(uploadUrl, filesToUpload, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const FILE_CONCURRENCY = config_variables_1.getUploadFileConcurrency();
            const MAX_CHUNK_SIZE = config_variables_1.getUploadChunkSize();
            core.debug(`File Concurrency: ${FILE_CONCURRENCY}, and Chunk Size: ${MAX_CHUNK_SIZE}`);
            const parameters = [];
            // by default, file uploads will continue if there is an error unless specified differently in the options
            let continueOnError = true;
            if (options) {
                if (options.continueOnError === false) {
                    continueOnError = false;
                }
            }
            // prepare the necessary parameters to upload all the files
            for (const file of filesToUpload) {
                const resourceUrl = new url_1.URL(uploadUrl);
                resourceUrl.searchParams.append('itemPath', file.uploadFilePath);
                parameters.push({
                    file: file.absoluteFilePath,
                    resourceUrl: resourceUrl.toString(),
                    maxChunkSize: MAX_CHUNK_SIZE,
                    continueOnError
                });
            }
            const parallelUploads = [...new Array(FILE_CONCURRENCY).keys()];
            const failedItemsToReport = [];
            let currentFile = 0;
            let completedFiles = 0;
            let uploadFileSize = 0;
            let totalFileSize = 0;
            let abortPendingFileUploads = false;
            this.statusReporter.setTotalNumberOfFilesToProcess(filesToUpload.length);
            this.statusReporter.start();
            // only allow a certain amount of files to be uploaded at once, this is done to reduce potential errors
            yield Promise.all(parallelUploads.map((index) => __awaiter(this, void 0, void 0, function* () {
                while (currentFile < filesToUpload.length) {
                    const currentFileParameters = parameters[currentFile];
                    currentFile += 1;
                    if (abortPendingFileUploads) {
                        failedItemsToReport.push(currentFileParameters.file);
                        continue;
                    }
                    const startTime = perf_hooks_1.performance.now();
                    const uploadFileResult = yield this.uploadFileAsync(index, currentFileParameters);
                    if (core.isDebug()) {
                        core.debug(`File: ${++completedFiles}/${filesToUpload.length}. ${currentFileParameters.file} took ${(perf_hooks_1.performance.now() - startTime).toFixed(3)} milliseconds to finish upload`);
                    }
                    uploadFileSize += uploadFileResult.successfulUploadSize;
                    totalFileSize += uploadFileResult.totalSize;
                    if (uploadFileResult.isSuccess === false) {
                        failedItemsToReport.push(currentFileParameters.file);
                        if (!continueOnError) {
                            // fail fast
                            core.error(`aborting artifact upload`);
                            abortPendingFileUploads = true;
                        }
                    }
                    this.statusReporter.incrementProcessedCount();
                }
            })));
            this.statusReporter.stop();
            // done uploading, safety dispose all connections
            this.uploadHttpManager.disposeAndReplaceAllClients();
            core.info(`Total size of all the files uploaded is ${uploadFileSize} bytes`);
            return {
                uploadSize: uploadFileSize,
                totalSize: totalFileSize,
                failedItems: failedItemsToReport
            };
        });
    }
    /**
     * Asynchronously uploads a file. The file is compressed and uploaded using GZip if it is determined to save space.
     * If the upload file is bigger than the max chunk size it will be uploaded via multiple calls
     * @param {number} httpClientIndex The index of the httpClient that is being used to make all of the calls
     * @param {UploadFileParameters} parameters Information about the file that needs to be uploaded
     * @returns The size of the file that was uploaded in bytes along with any failed uploads
     */
    uploadFileAsync(httpClientIndex, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileStat = yield stat(parameters.file);
            const totalFileSize = fileStat.size;
            const isFIFO = fileStat.isFIFO();
            let offset = 0;
            let isUploadSuccessful = true;
            let failedChunkSizes = 0;
            let uploadFileSize = 0;
            let isGzip = true;
            // the file that is being uploaded is less than 64k in size to increase throughput and to minimize disk I/O
            // for creating a new GZip file, an in-memory buffer is used for compression
            // with named pipes the file size is reported as zero in that case don't read the file in memory
            if (!isFIFO && totalFileSize < 65536) {
                core.debug(`${parameters.file} is less than 64k in size. Creating a gzip file in-memory to potentially reduce the upload size`);
                const buffer = yield upload_gzip_1.createGZipFileInBuffer(parameters.file);
                // An open stream is needed in the event of a failure and we need to retry. If a NodeJS.ReadableStream is directly passed in,
                // it will not properly get reset to the start of the stream if a chunk upload needs to be retried
                let openUploadStream;
                if (totalFileSize < buffer.byteLength) {
                    // compression did not help with reducing the size, use a readable stream from the original file for upload
                    core.debug(`The gzip file created for ${parameters.file} did not help with reducing the size of the file. The original file will be uploaded as-is`);
                    openUploadStream = () => fs.createReadStream(parameters.file);
                    isGzip = false;
                    uploadFileSize = totalFileSize;
                }
                else {
                    // create a readable stream using a PassThrough stream that is both readable and writable
                    core.debug(`A gzip file created for ${parameters.file} helped with reducing the size of the original file. The file will be uploaded using gzip.`);
                    openUploadStream = () => {
                        const passThrough = new stream.PassThrough();
                        passThrough.end(buffer);
                        return passThrough;
                    };
                    uploadFileSize = buffer.byteLength;
                }
                const result = yield this.uploadChunk(httpClientIndex, parameters.resourceUrl, openUploadStream, 0, uploadFileSize - 1, uploadFileSize, isGzip, totalFileSize);
                if (!result) {
                    // chunk failed to upload
                    isUploadSuccessful = false;
                    failedChunkSizes += uploadFileSize;
                    core.warning(`Aborting upload for ${parameters.file} due to failure`);
                }
                return {
                    isSuccess: isUploadSuccessful,
                    successfulUploadSize: uploadFileSize - failedChunkSizes,
                    totalSize: totalFileSize
                };
            }
            else {
                // the file that is being uploaded is greater than 64k in size, a temporary file gets created on disk using the
                // npm tmp-promise package and this file gets used to create a GZipped file
                const tempFile = yield tmp.file();
                core.debug(`${parameters.file} is greater than 64k in size. Creating a gzip file on-disk ${tempFile.path} to potentially reduce the upload size`);
                // create a GZip file of the original file being uploaded, the original file should not be modified in any way
                uploadFileSize = yield upload_gzip_1.createGZipFileOnDisk(parameters.file, tempFile.path);
                let uploadFilePath = tempFile.path;
                // compression did not help with size reduction, use the original file for upload and delete the temp GZip file
                // for named pipes totalFileSize is zero, this assumes compression did help
                if (!isFIFO && totalFileSize < uploadFileSize) {
                    core.debug(`The gzip file created for ${parameters.file} did not help with reducing the size of the file. The original file will be uploaded as-is`);
                    uploadFileSize = totalFileSize;
                    uploadFilePath = parameters.file;
                    isGzip = false;
                }
                else {
                    core.debug(`The gzip file created for ${parameters.file} is smaller than the original file. The file will be uploaded using gzip.`);
                }
                let abortFileUpload = false;
                // upload only a single chunk at a time
                while (offset < uploadFileSize) {
                    const chunkSize = Math.min(uploadFileSize - offset, parameters.maxChunkSize);
                    const startChunkIndex = offset;
                    const endChunkIndex = offset + chunkSize - 1;
                    offset += parameters.maxChunkSize;
                    if (abortFileUpload) {
                        // if we don't want to continue in the event of an error, any pending upload chunks will be marked as failed
                        failedChunkSizes += chunkSize;
                        continue;
                    }
                    const result = yield this.uploadChunk(httpClientIndex, parameters.resourceUrl, () => fs.createReadStream(uploadFilePath, {
                        start: startChunkIndex,
                        end: endChunkIndex,
                        autoClose: false
                    }), startChunkIndex, endChunkIndex, uploadFileSize, isGzip, totalFileSize);
                    if (!result) {
                        // Chunk failed to upload, report as failed and do not continue uploading any more chunks for the file. It is possible that part of a chunk was
                        // successfully uploaded so the server may report a different size for what was uploaded
                        isUploadSuccessful = false;
                        failedChunkSizes += chunkSize;
                        core.warning(`Aborting upload for ${parameters.file} due to failure`);
                        abortFileUpload = true;
                    }
                    else {
                        // if an individual file is greater than 8MB (1024*1024*8) in size, display extra information about the upload status
                        if (uploadFileSize > 8388608) {
                            this.statusReporter.updateLargeFileStatus(parameters.file, startChunkIndex, endChunkIndex, uploadFileSize);
                        }
                    }
                }
                // Delete the temporary file that was created as part of the upload. If the temp file does not get manually deleted by
                // calling cleanup, it gets removed when the node process exits. For more info see: https://www.npmjs.com/package/tmp-promise#about
                core.debug(`deleting temporary gzip file ${tempFile.path}`);
                yield tempFile.cleanup();
                return {
                    isSuccess: isUploadSuccessful,
                    successfulUploadSize: uploadFileSize - failedChunkSizes,
                    totalSize: totalFileSize
                };
            }
        });
    }
    /**
     * Uploads a chunk of an individual file to the specified resourceUrl. If the upload fails and the status code
     * indicates a retryable status, we try to upload the chunk as well
     * @param {number} httpClientIndex The index of the httpClient being used to make all the necessary calls
     * @param {string} resourceUrl Url of the resource that the chunk will be uploaded to
     * @param {NodeJS.ReadableStream} openStream Stream of the file that will be uploaded
     * @param {number} start Starting byte index of file that the chunk belongs to
     * @param {number} end Ending byte index of file that the chunk belongs to
     * @param {number} uploadFileSize Total size of the file in bytes that is being uploaded
     * @param {boolean} isGzip Denotes if we are uploading a Gzip compressed stream
     * @param {number} totalFileSize Original total size of the file that is being uploaded
     * @returns if the chunk was successfully uploaded
     */
    uploadChunk(httpClientIndex, resourceUrl, openStream, start, end, uploadFileSize, isGzip, totalFileSize) {
        return __awaiter(this, void 0, void 0, function* () {
            // open a new stream and read it to compute the digest
            const digest = yield utils_1.digestForStream(openStream());
            // prepare all the necessary headers before making any http call
            const headers = utils_1.getUploadHeaders('application/octet-stream', true, isGzip, totalFileSize, end - start + 1, utils_1.getContentRange(start, end, uploadFileSize), digest);
            const uploadChunkRequest = () => __awaiter(this, void 0, void 0, function* () {
                const client = this.uploadHttpManager.getClient(httpClientIndex);
                return yield client.sendStream('PUT', resourceUrl, openStream(), headers);
            });
            let retryCount = 0;
            const retryLimit = config_variables_1.getRetryLimit();
            // Increments the current retry count and then checks if the retry limit has been reached
            // If there have been too many retries, fail so the download stops
            const incrementAndCheckRetryLimit = (response) => {
                retryCount++;
                if (retryCount > retryLimit) {
                    if (response) {
                        utils_1.displayHttpDiagnostics(response);
                    }
                    core.info(`Retry limit has been reached for chunk at offset ${start} to ${resourceUrl}`);
                    return true;
                }
                return false;
            };
            const backOff = (retryAfterValue) => __awaiter(this, void 0, void 0, function* () {
                this.uploadHttpManager.disposeAndReplaceClient(httpClientIndex);
                if (retryAfterValue) {
                    core.info(`Backoff due to too many requests, retry #${retryCount}. Waiting for ${retryAfterValue} milliseconds before continuing the upload`);
                    yield utils_1.sleep(retryAfterValue);
                }
                else {
                    const backoffTime = utils_1.getExponentialRetryTimeInMilliseconds(retryCount);
                    core.info(`Exponential backoff for retry #${retryCount}. Waiting for ${backoffTime} milliseconds before continuing the upload at offset ${start}`);
                    yield utils_1.sleep(backoffTime);
                }
                core.info(`Finished backoff for retry #${retryCount}, continuing with upload`);
                return;
            });
            // allow for failed chunks to be retried multiple times
            while (retryCount <= retryLimit) {
                let response;
                try {
                    response = yield uploadChunkRequest();
                }
                catch (error) {
                    // if an error is caught, it is usually indicative of a timeout so retry the upload
                    core.info(`An error has been caught http-client index ${httpClientIndex}, retrying the upload`);
                    // eslint-disable-next-line no-console
                    console.log(error);
                    if (incrementAndCheckRetryLimit()) {
                        return false;
                    }
                    yield backOff();
                    continue;
                }
                // Always read the body of the response. There is potential for a resource leak if the body is not read which will
                // result in the connection remaining open along with unintended consequences when trying to dispose of the client
                yield response.readBody();
                if (utils_1.isSuccessStatusCode(response.message.statusCode)) {
                    return true;
                }
                else if (utils_1.isRetryableStatusCode(response.message.statusCode)) {
                    core.info(`A ${response.message.statusCode} status code has been received, will attempt to retry the upload`);
                    if (incrementAndCheckRetryLimit(response)) {
                        return false;
                    }
                    utils_1.isThrottledStatusCode(response.message.statusCode)
                        ? yield backOff(utils_1.tryGetRetryAfterValueTimeInMilliseconds(response.message.headers))
                        : yield backOff();
                }
                else {
                    core.error(`Unexpected response. Unable to upload chunk to ${resourceUrl}`);
                    utils_1.displayHttpDiagnostics(response);
                    return false;
                }
            }
            return false;
        });
    }
    /**
     * Updates the size of the artifact from -1 which was initially set when the container was first created for the artifact.
     * Updating the size indicates that we are done uploading all the contents of the artifact
     */
    patchArtifactSize(size, artifactName) {
        return __awaiter(this, void 0, void 0, function* () {
            const resourceUrl = new url_1.URL(utils_1.getArtifactUrl());
            resourceUrl.searchParams.append('artifactName', artifactName);
            const parameters = { Size: size };
            const data = JSON.stringify(parameters, null, 2);
            core.debug(`URL is ${resourceUrl.toString()}`);
            // use the first client from the httpManager, `keep-alive` is not used so the connection will close immediately
            const client = this.uploadHttpManager.getClient(0);
            const headers = utils_1.getUploadHeaders('application/json', false);
            // Extra information to display when a particular HTTP code is returned
            const customErrorMessages = new Map([
                [
                    http_client_1.HttpCodes.NotFound,
                    `An Artifact with the name ${artifactName} was not found`
                ]
            ]);
            // TODO retry for all possible response codes, the artifact upload is pretty much complete so it at all costs we should try to finish this
            const response = yield requestUtils_1.retryHttpClientRequest('Finalize artifact upload', () => __awaiter(this, void 0, void 0, function* () { return client.patch(resourceUrl.toString(), data, headers); }), customErrorMessages);
            yield response.readBody();
            core.debug(`Artifact ${artifactName} has been successfully uploaded, total size in bytes: ${size}`);
        });
    }
}
exports.UploadHttpClient = UploadHttpClient;
//# sourceMappingURL=upload-http-client.js.map

/***/ }),

/***/ "./node_modules/@actions/artifact/lib/internal/upload-specification.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@actions/artifact/lib/internal/upload-specification.js ***!
  \*****************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getUploadSpecification = void 0;
const fs = __importStar(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'fs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const core_1 = __webpack_require__(/*! @actions/core */ "./node_modules/@actions/core/lib/core.js");
const path_1 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'path'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const path_and_artifact_name_validation_1 = __webpack_require__(/*! ./path-and-artifact-name-validation */ "./node_modules/@actions/artifact/lib/internal/path-and-artifact-name-validation.js");
/**
 * Creates a specification that describes how each file that is part of the artifact will be uploaded
 * @param artifactName the name of the artifact being uploaded. Used during upload to denote where the artifact is stored on the server
 * @param rootDirectory an absolute file path that denotes the path that should be removed from the beginning of each artifact file
 * @param artifactFiles a list of absolute file paths that denote what should be uploaded as part of the artifact
 */
function getUploadSpecification(artifactName, rootDirectory, artifactFiles) {
    // artifact name was checked earlier on, no need to check again
    const specifications = [];
    if (!fs.existsSync(rootDirectory)) {
        throw new Error(`Provided rootDirectory ${rootDirectory} does not exist`);
    }
    if (!fs.lstatSync(rootDirectory).isDirectory()) {
        throw new Error(`Provided rootDirectory ${rootDirectory} is not a valid directory`);
    }
    // Normalize and resolve, this allows for either absolute or relative paths to be used
    rootDirectory = path_1.normalize(rootDirectory);
    rootDirectory = path_1.resolve(rootDirectory);
    /*
       Example to demonstrate behavior
       
       Input:
         artifactName: my-artifact
         rootDirectory: '/home/user/files/plz-upload'
         artifactFiles: [
           '/home/user/files/plz-upload/file1.txt',
           '/home/user/files/plz-upload/file2.txt',
           '/home/user/files/plz-upload/dir/file3.txt'
         ]
       
       Output:
         specifications: [
           ['/home/user/files/plz-upload/file1.txt', 'my-artifact/file1.txt'],
           ['/home/user/files/plz-upload/file1.txt', 'my-artifact/file2.txt'],
           ['/home/user/files/plz-upload/file1.txt', 'my-artifact/dir/file3.txt']
         ]
    */
    for (let file of artifactFiles) {
        if (!fs.existsSync(file)) {
            throw new Error(`File ${file} does not exist`);
        }
        if (!fs.lstatSync(file).isDirectory()) {
            // Normalize and resolve, this allows for either absolute or relative paths to be used
            file = path_1.normalize(file);
            file = path_1.resolve(file);
            if (!file.startsWith(rootDirectory)) {
                throw new Error(`The rootDirectory: ${rootDirectory} is not a parent directory of the file: ${file}`);
            }
            // Check for forbidden characters in file paths that will be rejected during upload
            const uploadPath = file.replace(rootDirectory, '');
            path_and_artifact_name_validation_1.checkArtifactFilePath(uploadPath);
            /*
              uploadFilePath denotes where the file will be uploaded in the file container on the server. During a run, if multiple artifacts are uploaded, they will all
              be saved in the same container. The artifact name is used as the root directory in the container to separate and distinguish uploaded artifacts
      
              path.join handles all the following cases and would return 'artifact-name/file-to-upload.txt
                join('artifact-name/', 'file-to-upload.txt')
                join('artifact-name/', '/file-to-upload.txt')
                join('artifact-name', 'file-to-upload.txt')
                join('artifact-name', '/file-to-upload.txt')
            */
            specifications.push({
                absoluteFilePath: file,
                uploadFilePath: path_1.join(artifactName, uploadPath)
            });
        }
        else {
            // Directories are rejected by the server during upload
            core_1.debug(`Removing ${file} from rawSearchResults because it is a directory`);
        }
    }
    return specifications;
}
exports.getUploadSpecification = getUploadSpecification;
//# sourceMappingURL=upload-specification.js.map

/***/ }),

/***/ "./node_modules/@actions/artifact/lib/internal/utils.js":
/*!**************************************************************!*\
  !*** ./node_modules/@actions/artifact/lib/internal/utils.js ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.digestForStream = exports.sleep = exports.getProperRetention = exports.rmFile = exports.getFileSize = exports.createEmptyFilesForArtifact = exports.createDirectoriesForArtifact = exports.displayHttpDiagnostics = exports.getArtifactUrl = exports.createHttpClient = exports.getUploadHeaders = exports.getDownloadHeaders = exports.getContentRange = exports.tryGetRetryAfterValueTimeInMilliseconds = exports.isThrottledStatusCode = exports.isRetryableStatusCode = exports.isForbiddenStatusCode = exports.isSuccessStatusCode = exports.getApiVersion = exports.parseEnvNumber = exports.getExponentialRetryTimeInMilliseconds = void 0;
const crypto_1 = __importDefault(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'crypto'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const fs_1 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'fs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const core_1 = __webpack_require__(/*! @actions/core */ "./node_modules/@actions/core/lib/core.js");
const http_client_1 = __webpack_require__(/*! @actions/http-client */ "./node_modules/@actions/http-client/lib/index.js");
const auth_1 = __webpack_require__(/*! @actions/http-client/lib/auth */ "./node_modules/@actions/http-client/lib/auth.js");
const config_variables_1 = __webpack_require__(/*! ./config-variables */ "./node_modules/@actions/artifact/lib/internal/config-variables.js");
const crc64_1 = __importDefault(__webpack_require__(/*! ./crc64 */ "./node_modules/@actions/artifact/lib/internal/crc64.js"));
/**
 * Returns a retry time in milliseconds that exponentially gets larger
 * depending on the amount of retries that have been attempted
 */
function getExponentialRetryTimeInMilliseconds(retryCount) {
    if (retryCount < 0) {
        throw new Error('RetryCount should not be negative');
    }
    else if (retryCount === 0) {
        return config_variables_1.getInitialRetryIntervalInMilliseconds();
    }
    const minTime = config_variables_1.getInitialRetryIntervalInMilliseconds() * config_variables_1.getRetryMultiplier() * retryCount;
    const maxTime = minTime * config_variables_1.getRetryMultiplier();
    // returns a random number between the minTime (inclusive) and the maxTime (exclusive)
    return Math.trunc(Math.random() * (maxTime - minTime) + minTime);
}
exports.getExponentialRetryTimeInMilliseconds = getExponentialRetryTimeInMilliseconds;
/**
 * Parses a env variable that is a number
 */
function parseEnvNumber(key) {
    const value = Number(process.env[key]);
    if (Number.isNaN(value) || value < 0) {
        return undefined;
    }
    return value;
}
exports.parseEnvNumber = parseEnvNumber;
/**
 * Various utility functions to help with the necessary API calls
 */
function getApiVersion() {
    return '6.0-preview';
}
exports.getApiVersion = getApiVersion;
function isSuccessStatusCode(statusCode) {
    if (!statusCode) {
        return false;
    }
    return statusCode >= 200 && statusCode < 300;
}
exports.isSuccessStatusCode = isSuccessStatusCode;
function isForbiddenStatusCode(statusCode) {
    if (!statusCode) {
        return false;
    }
    return statusCode === http_client_1.HttpCodes.Forbidden;
}
exports.isForbiddenStatusCode = isForbiddenStatusCode;
function isRetryableStatusCode(statusCode) {
    if (!statusCode) {
        return false;
    }
    const retryableStatusCodes = [
        http_client_1.HttpCodes.BadGateway,
        http_client_1.HttpCodes.GatewayTimeout,
        http_client_1.HttpCodes.InternalServerError,
        http_client_1.HttpCodes.ServiceUnavailable,
        http_client_1.HttpCodes.TooManyRequests,
        413 // Payload Too Large
    ];
    return retryableStatusCodes.includes(statusCode);
}
exports.isRetryableStatusCode = isRetryableStatusCode;
function isThrottledStatusCode(statusCode) {
    if (!statusCode) {
        return false;
    }
    return statusCode === http_client_1.HttpCodes.TooManyRequests;
}
exports.isThrottledStatusCode = isThrottledStatusCode;
/**
 * Attempts to get the retry-after value from a set of http headers. The retry time
 * is originally denoted in seconds, so if present, it is converted to milliseconds
 * @param headers all the headers received when making an http call
 */
function tryGetRetryAfterValueTimeInMilliseconds(headers) {
    if (headers['retry-after']) {
        const retryTime = Number(headers['retry-after']);
        if (!isNaN(retryTime)) {
            core_1.info(`Retry-After header is present with a value of ${retryTime}`);
            return retryTime * 1000;
        }
        core_1.info(`Returned retry-after header value: ${retryTime} is non-numeric and cannot be used`);
        return undefined;
    }
    core_1.info(`No retry-after header was found. Dumping all headers for diagnostic purposes`);
    // eslint-disable-next-line no-console
    console.log(headers);
    return undefined;
}
exports.tryGetRetryAfterValueTimeInMilliseconds = tryGetRetryAfterValueTimeInMilliseconds;
function getContentRange(start, end, total) {
    // Format: `bytes start-end/fileSize
    // start and end are inclusive
    // For a 200 byte chunk starting at byte 0:
    // Content-Range: bytes 0-199/200
    return `bytes ${start}-${end}/${total}`;
}
exports.getContentRange = getContentRange;
/**
 * Sets all the necessary headers when downloading an artifact
 * @param {string} contentType the type of content being uploaded
 * @param {boolean} isKeepAlive is the same connection being used to make multiple calls
 * @param {boolean} acceptGzip can we accept a gzip encoded response
 * @param {string} acceptType the type of content that we can accept
 * @returns appropriate headers to make a specific http call during artifact download
 */
function getDownloadHeaders(contentType, isKeepAlive, acceptGzip) {
    const requestOptions = {};
    if (contentType) {
        requestOptions['Content-Type'] = contentType;
    }
    if (isKeepAlive) {
        requestOptions['Connection'] = 'Keep-Alive';
        // keep alive for at least 10 seconds before closing the connection
        requestOptions['Keep-Alive'] = '10';
    }
    if (acceptGzip) {
        // if we are expecting a response with gzip encoding, it should be using an octet-stream in the accept header
        requestOptions['Accept-Encoding'] = 'gzip';
        requestOptions['Accept'] = `application/octet-stream;api-version=${getApiVersion()}`;
    }
    else {
        // default to application/json if we are not working with gzip content
        requestOptions['Accept'] = `application/json;api-version=${getApiVersion()}`;
    }
    return requestOptions;
}
exports.getDownloadHeaders = getDownloadHeaders;
/**
 * Sets all the necessary headers when uploading an artifact
 * @param {string} contentType the type of content being uploaded
 * @param {boolean} isKeepAlive is the same connection being used to make multiple calls
 * @param {boolean} isGzip is the connection being used to upload GZip compressed content
 * @param {number} uncompressedLength the original size of the content if something is being uploaded that has been compressed
 * @param {number} contentLength the length of the content that is being uploaded
 * @param {string} contentRange the range of the content that is being uploaded
 * @returns appropriate headers to make a specific http call during artifact upload
 */
function getUploadHeaders(contentType, isKeepAlive, isGzip, uncompressedLength, contentLength, contentRange, digest) {
    const requestOptions = {};
    requestOptions['Accept'] = `application/json;api-version=${getApiVersion()}`;
    if (contentType) {
        requestOptions['Content-Type'] = contentType;
    }
    if (isKeepAlive) {
        requestOptions['Connection'] = 'Keep-Alive';
        // keep alive for at least 10 seconds before closing the connection
        requestOptions['Keep-Alive'] = '10';
    }
    if (isGzip) {
        requestOptions['Content-Encoding'] = 'gzip';
        requestOptions['x-tfs-filelength'] = uncompressedLength;
    }
    if (contentLength) {
        requestOptions['Content-Length'] = contentLength;
    }
    if (contentRange) {
        requestOptions['Content-Range'] = contentRange;
    }
    if (digest) {
        requestOptions['x-actions-results-crc64'] = digest.crc64;
        requestOptions['x-actions-results-md5'] = digest.md5;
    }
    return requestOptions;
}
exports.getUploadHeaders = getUploadHeaders;
function createHttpClient(userAgent) {
    return new http_client_1.HttpClient(userAgent, [
        new auth_1.BearerCredentialHandler(config_variables_1.getRuntimeToken())
    ]);
}
exports.createHttpClient = createHttpClient;
function getArtifactUrl() {
    const artifactUrl = `${config_variables_1.getRuntimeUrl()}_apis/pipelines/workflows/${config_variables_1.getWorkFlowRunId()}/artifacts?api-version=${getApiVersion()}`;
    core_1.debug(`Artifact Url: ${artifactUrl}`);
    return artifactUrl;
}
exports.getArtifactUrl = getArtifactUrl;
/**
 * Uh oh! Something might have gone wrong during either upload or download. The IHtttpClientResponse object contains information
 * about the http call that was made by the actions http client. This information might be useful to display for diagnostic purposes, but
 * this entire object is really big and most of the information is not really useful. This function takes the response object and displays only
 * the information that we want.
 *
 * Certain information such as the TLSSocket and the Readable state are not really useful for diagnostic purposes so they can be avoided.
 * Other information such as the headers, the response code and message might be useful, so this is displayed.
 */
function displayHttpDiagnostics(response) {
    core_1.info(`##### Begin Diagnostic HTTP information #####
Status Code: ${response.message.statusCode}
Status Message: ${response.message.statusMessage}
Header Information: ${JSON.stringify(response.message.headers, undefined, 2)}
###### End Diagnostic HTTP information ######`);
}
exports.displayHttpDiagnostics = displayHttpDiagnostics;
function createDirectoriesForArtifact(directories) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const directory of directories) {
            yield fs_1.promises.mkdir(directory, {
                recursive: true
            });
        }
    });
}
exports.createDirectoriesForArtifact = createDirectoriesForArtifact;
function createEmptyFilesForArtifact(emptyFilesToCreate) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const filePath of emptyFilesToCreate) {
            yield (yield fs_1.promises.open(filePath, 'w')).close();
        }
    });
}
exports.createEmptyFilesForArtifact = createEmptyFilesForArtifact;
function getFileSize(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = yield fs_1.promises.stat(filePath);
        core_1.debug(`${filePath} size:(${stats.size}) blksize:(${stats.blksize}) blocks:(${stats.blocks})`);
        return stats.size;
    });
}
exports.getFileSize = getFileSize;
function rmFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs_1.promises.unlink(filePath);
    });
}
exports.rmFile = rmFile;
function getProperRetention(retentionInput, retentionSetting) {
    if (retentionInput < 0) {
        throw new Error('Invalid retention, minimum value is 1.');
    }
    let retention = retentionInput;
    if (retentionSetting) {
        const maxRetention = parseInt(retentionSetting);
        if (!isNaN(maxRetention) && maxRetention < retention) {
            core_1.warning(`Retention days is greater than the max value allowed by the repository setting, reduce retention to ${maxRetention} days`);
            retention = maxRetention;
        }
    }
    return retention;
}
exports.getProperRetention = getProperRetention;
function sleep(milliseconds) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    });
}
exports.sleep = sleep;
function digestForStream(stream) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const crc64 = new crc64_1.default();
            const md5 = crypto_1.default.createHash('md5');
            stream
                .on('data', data => {
                crc64.update(data);
                md5.update(data);
            })
                .on('end', () => resolve({
                crc64: crc64.digest('base64'),
                md5: md5.digest('base64')
            }))
                .on('error', reject);
        });
    });
}
exports.digestForStream = digestForStream;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "./node_modules/@actions/core/lib/command.js":
/*!***************************************************!*\
  !*** ./node_modules/@actions/core/lib/command.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issue = exports.issueCommand = void 0;
const os = __importStar(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'os'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/@actions/core/lib/utils.js");
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ "./node_modules/@actions/core/lib/core.js":
/*!************************************************!*\
  !*** ./node_modules/@actions/core/lib/core.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getIDToken = exports.getState = exports.saveState = exports.group = exports.endGroup = exports.startGroup = exports.info = exports.notice = exports.warning = exports.error = exports.debug = exports.isDebug = exports.setFailed = exports.setCommandEcho = exports.setOutput = exports.getBooleanInput = exports.getMultilineInput = exports.getInput = exports.addPath = exports.setSecret = exports.exportVariable = exports.ExitCode = void 0;
const command_1 = __webpack_require__(/*! ./command */ "./node_modules/@actions/core/lib/command.js");
const file_command_1 = __webpack_require__(/*! ./file-command */ "./node_modules/@actions/core/lib/file-command.js");
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/@actions/core/lib/utils.js");
const os = __importStar(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'os'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const path = __importStar(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'path'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const oidc_utils_1 = __webpack_require__(/*! ./oidc-utils */ "./node_modules/@actions/core/lib/oidc-utils.js");
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        return file_command_1.issueFileCommand('ENV', file_command_1.prepareKeyValueMessage(name, val));
    }
    command_1.issueCommand('set-env', { name }, convertedVal);
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueFileCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.
 * Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
 * Returns an empty string if the value is not defined.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    if (options && options.trimWhitespace === false) {
        return val;
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Gets the values of an multiline input.  Each value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string[]
 *
 */
function getMultilineInput(name, options) {
    const inputs = getInput(name, options)
        .split('\n')
        .filter(x => x !== '');
    if (options && options.trimWhitespace === false) {
        return inputs;
    }
    return inputs.map(input => input.trim());
}
exports.getMultilineInput = getMultilineInput;
/**
 * Gets the input value of the boolean type in the YAML 1.2 "core schema" specification.
 * Support boolean input list: `true | True | TRUE | false | False | FALSE` .
 * The return value is also in boolean type.
 * ref: https://yaml.org/spec/1.2/spec.html#id2804923
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   boolean
 */
function getBooleanInput(name, options) {
    const trueValue = ['true', 'True', 'TRUE'];
    const falseValue = ['false', 'False', 'FALSE'];
    const val = getInput(name, options);
    if (trueValue.includes(val))
        return true;
    if (falseValue.includes(val))
        return false;
    throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}\n` +
        `Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
}
exports.getBooleanInput = getBooleanInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    const filePath = process.env['GITHUB_OUTPUT'] || '';
    if (filePath) {
        return file_command_1.issueFileCommand('OUTPUT', file_command_1.prepareKeyValueMessage(name, value));
    }
    process.stdout.write(os.EOL);
    command_1.issueCommand('set-output', { name }, utils_1.toCommandValue(value));
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function error(message, properties = {}) {
    command_1.issueCommand('error', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds a warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function warning(message, properties = {}) {
    command_1.issueCommand('warning', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Adds a notice issue
 * @param message notice issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function notice(message, properties = {}) {
    command_1.issueCommand('notice', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.notice = notice;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    const filePath = process.env['GITHUB_STATE'] || '';
    if (filePath) {
        return file_command_1.issueFileCommand('STATE', file_command_1.prepareKeyValueMessage(name, value));
    }
    command_1.issueCommand('save-state', { name }, utils_1.toCommandValue(value));
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
function getIDToken(aud) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield oidc_utils_1.OidcClient.getIDToken(aud);
    });
}
exports.getIDToken = getIDToken;
/**
 * Summary exports
 */
var summary_1 = __webpack_require__(/*! ./summary */ "./node_modules/@actions/core/lib/summary.js");
Object.defineProperty(exports, "summary", ({ enumerable: true, get: function () { return summary_1.summary; } }));
/**
 * @deprecated use core.summary
 */
var summary_2 = __webpack_require__(/*! ./summary */ "./node_modules/@actions/core/lib/summary.js");
Object.defineProperty(exports, "markdownSummary", ({ enumerable: true, get: function () { return summary_2.markdownSummary; } }));
/**
 * Path exports
 */
var path_utils_1 = __webpack_require__(/*! ./path-utils */ "./node_modules/@actions/core/lib/path-utils.js");
Object.defineProperty(exports, "toPosixPath", ({ enumerable: true, get: function () { return path_utils_1.toPosixPath; } }));
Object.defineProperty(exports, "toWin32Path", ({ enumerable: true, get: function () { return path_utils_1.toWin32Path; } }));
Object.defineProperty(exports, "toPlatformPath", ({ enumerable: true, get: function () { return path_utils_1.toPlatformPath; } }));
//# sourceMappingURL=core.js.map

/***/ }),

/***/ "./node_modules/@actions/core/lib/file-command.js":
/*!********************************************************!*\
  !*** ./node_modules/@actions/core/lib/file-command.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

// For internal use, subject to change.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.prepareKeyValueMessage = exports.issueFileCommand = void 0;
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'fs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const os = __importStar(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'os'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const uuid_1 = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/index.js");
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/@actions/core/lib/utils.js");
function issueFileCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueFileCommand = issueFileCommand;
function prepareKeyValueMessage(key, value) {
    const delimiter = `ghadelimiter_${uuid_1.v4()}`;
    const convertedValue = utils_1.toCommandValue(value);
    // These should realistically never happen, but just in case someone finds a
    // way to exploit uuid generation let's not allow keys or values that contain
    // the delimiter.
    if (key.includes(delimiter)) {
        throw new Error(`Unexpected input: name should not contain the delimiter "${delimiter}"`);
    }
    if (convertedValue.includes(delimiter)) {
        throw new Error(`Unexpected input: value should not contain the delimiter "${delimiter}"`);
    }
    return `${key}<<${delimiter}${os.EOL}${convertedValue}${os.EOL}${delimiter}`;
}
exports.prepareKeyValueMessage = prepareKeyValueMessage;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ "./node_modules/@actions/core/lib/oidc-utils.js":
/*!******************************************************!*\
  !*** ./node_modules/@actions/core/lib/oidc-utils.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OidcClient = void 0;
const http_client_1 = __webpack_require__(/*! @actions/http-client */ "./node_modules/@actions/http-client/lib/index.js");
const auth_1 = __webpack_require__(/*! @actions/http-client/lib/auth */ "./node_modules/@actions/http-client/lib/auth.js");
const core_1 = __webpack_require__(/*! ./core */ "./node_modules/@actions/core/lib/core.js");
class OidcClient {
    static createHttpClient(allowRetry = true, maxRetry = 10) {
        const requestOptions = {
            allowRetries: allowRetry,
            maxRetries: maxRetry
        };
        return new http_client_1.HttpClient('actions/oidc-client', [new auth_1.BearerCredentialHandler(OidcClient.getRequestToken())], requestOptions);
    }
    static getRequestToken() {
        const token = process.env['ACTIONS_ID_TOKEN_REQUEST_TOKEN'];
        if (!token) {
            throw new Error('Unable to get ACTIONS_ID_TOKEN_REQUEST_TOKEN env variable');
        }
        return token;
    }
    static getIDTokenUrl() {
        const runtimeUrl = process.env['ACTIONS_ID_TOKEN_REQUEST_URL'];
        if (!runtimeUrl) {
            throw new Error('Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable');
        }
        return runtimeUrl;
    }
    static getCall(id_token_url) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const httpclient = OidcClient.createHttpClient();
            const res = yield httpclient
                .getJson(id_token_url)
                .catch(error => {
                throw new Error(`Failed to get ID Token. \n 
        Error Code : ${error.statusCode}\n 
        Error Message: ${error.result.message}`);
            });
            const id_token = (_a = res.result) === null || _a === void 0 ? void 0 : _a.value;
            if (!id_token) {
                throw new Error('Response json body do not have ID Token field');
            }
            return id_token;
        });
    }
    static getIDToken(audience) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // New ID Token is requested from action service
                let id_token_url = OidcClient.getIDTokenUrl();
                if (audience) {
                    const encodedAudience = encodeURIComponent(audience);
                    id_token_url = `${id_token_url}&audience=${encodedAudience}`;
                }
                core_1.debug(`ID token url is ${id_token_url}`);
                const id_token = yield OidcClient.getCall(id_token_url);
                core_1.setSecret(id_token);
                return id_token;
            }
            catch (error) {
                throw new Error(`Error message: ${error.message}`);
            }
        });
    }
}
exports.OidcClient = OidcClient;
//# sourceMappingURL=oidc-utils.js.map

/***/ }),

/***/ "./node_modules/@actions/core/lib/path-utils.js":
/*!******************************************************!*\
  !*** ./node_modules/@actions/core/lib/path-utils.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toPlatformPath = exports.toWin32Path = exports.toPosixPath = void 0;
const path = __importStar(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'path'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
/**
 * toPosixPath converts the given path to the posix form. On Windows, \\ will be
 * replaced with /.
 *
 * @param pth. Path to transform.
 * @return string Posix path.
 */
function toPosixPath(pth) {
    return pth.replace(/[\\]/g, '/');
}
exports.toPosixPath = toPosixPath;
/**
 * toWin32Path converts the given path to the win32 form. On Linux, / will be
 * replaced with \\.
 *
 * @param pth. Path to transform.
 * @return string Win32 path.
 */
function toWin32Path(pth) {
    return pth.replace(/[/]/g, '\\');
}
exports.toWin32Path = toWin32Path;
/**
 * toPlatformPath converts the given path to a platform-specific path. It does
 * this by replacing instances of / and \ with the platform-specific path
 * separator.
 *
 * @param pth The path to platformize.
 * @return string The platform-specific path.
 */
function toPlatformPath(pth) {
    return pth.replace(/[/\\]/g, path.sep);
}
exports.toPlatformPath = toPlatformPath;
//# sourceMappingURL=path-utils.js.map

/***/ }),

/***/ "./node_modules/@actions/core/lib/summary.js":
/*!***************************************************!*\
  !*** ./node_modules/@actions/core/lib/summary.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.summary = exports.markdownSummary = exports.SUMMARY_DOCS_URL = exports.SUMMARY_ENV_VAR = void 0;
const os_1 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'os'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const fs_1 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'fs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const { access, appendFile, writeFile } = fs_1.promises;
exports.SUMMARY_ENV_VAR = 'GITHUB_STEP_SUMMARY';
exports.SUMMARY_DOCS_URL = 'https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary';
class Summary {
    constructor() {
        this._buffer = '';
    }
    /**
     * Finds the summary file path from the environment, rejects if env var is not found or file does not exist
     * Also checks r/w permissions.
     *
     * @returns step summary file path
     */
    filePath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._filePath) {
                return this._filePath;
            }
            const pathFromEnv = process.env[exports.SUMMARY_ENV_VAR];
            if (!pathFromEnv) {
                throw new Error(`Unable to find environment variable for $${exports.SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`);
            }
            try {
                yield access(pathFromEnv, fs_1.constants.R_OK | fs_1.constants.W_OK);
            }
            catch (_a) {
                throw new Error(`Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`);
            }
            this._filePath = pathFromEnv;
            return this._filePath;
        });
    }
    /**
     * Wraps content in an HTML tag, adding any HTML attributes
     *
     * @param {string} tag HTML tag to wrap
     * @param {string | null} content content within the tag
     * @param {[attribute: string]: string} attrs key-value list of HTML attributes to add
     *
     * @returns {string} content wrapped in HTML element
     */
    wrap(tag, content, attrs = {}) {
        const htmlAttrs = Object.entries(attrs)
            .map(([key, value]) => ` ${key}="${value}"`)
            .join('');
        if (!content) {
            return `<${tag}${htmlAttrs}>`;
        }
        return `<${tag}${htmlAttrs}>${content}</${tag}>`;
    }
    /**
     * Writes text in the buffer to the summary buffer file and empties buffer. Will append by default.
     *
     * @param {SummaryWriteOptions} [options] (optional) options for write operation
     *
     * @returns {Promise<Summary>} summary instance
     */
    write(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const overwrite = !!(options === null || options === void 0 ? void 0 : options.overwrite);
            const filePath = yield this.filePath();
            const writeFunc = overwrite ? writeFile : appendFile;
            yield writeFunc(filePath, this._buffer, { encoding: 'utf8' });
            return this.emptyBuffer();
        });
    }
    /**
     * Clears the summary buffer and wipes the summary file
     *
     * @returns {Summary} summary instance
     */
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.emptyBuffer().write({ overwrite: true });
        });
    }
    /**
     * Returns the current summary buffer as a string
     *
     * @returns {string} string of summary buffer
     */
    stringify() {
        return this._buffer;
    }
    /**
     * If the summary buffer is empty
     *
     * @returns {boolen} true if the buffer is empty
     */
    isEmptyBuffer() {
        return this._buffer.length === 0;
    }
    /**
     * Resets the summary buffer without writing to summary file
     *
     * @returns {Summary} summary instance
     */
    emptyBuffer() {
        this._buffer = '';
        return this;
    }
    /**
     * Adds raw text to the summary buffer
     *
     * @param {string} text content to add
     * @param {boolean} [addEOL=false] (optional) append an EOL to the raw text (default: false)
     *
     * @returns {Summary} summary instance
     */
    addRaw(text, addEOL = false) {
        this._buffer += text;
        return addEOL ? this.addEOL() : this;
    }
    /**
     * Adds the operating system-specific end-of-line marker to the buffer
     *
     * @returns {Summary} summary instance
     */
    addEOL() {
        return this.addRaw(os_1.EOL);
    }
    /**
     * Adds an HTML codeblock to the summary buffer
     *
     * @param {string} code content to render within fenced code block
     * @param {string} lang (optional) language to syntax highlight code
     *
     * @returns {Summary} summary instance
     */
    addCodeBlock(code, lang) {
        const attrs = Object.assign({}, (lang && { lang }));
        const element = this.wrap('pre', this.wrap('code', code), attrs);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML list to the summary buffer
     *
     * @param {string[]} items list of items to render
     * @param {boolean} [ordered=false] (optional) if the rendered list should be ordered or not (default: false)
     *
     * @returns {Summary} summary instance
     */
    addList(items, ordered = false) {
        const tag = ordered ? 'ol' : 'ul';
        const listItems = items.map(item => this.wrap('li', item)).join('');
        const element = this.wrap(tag, listItems);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML table to the summary buffer
     *
     * @param {SummaryTableCell[]} rows table rows
     *
     * @returns {Summary} summary instance
     */
    addTable(rows) {
        const tableBody = rows
            .map(row => {
            const cells = row
                .map(cell => {
                if (typeof cell === 'string') {
                    return this.wrap('td', cell);
                }
                const { header, data, colspan, rowspan } = cell;
                const tag = header ? 'th' : 'td';
                const attrs = Object.assign(Object.assign({}, (colspan && { colspan })), (rowspan && { rowspan }));
                return this.wrap(tag, data, attrs);
            })
                .join('');
            return this.wrap('tr', cells);
        })
            .join('');
        const element = this.wrap('table', tableBody);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds a collapsable HTML details element to the summary buffer
     *
     * @param {string} label text for the closed state
     * @param {string} content collapsable content
     *
     * @returns {Summary} summary instance
     */
    addDetails(label, content) {
        const element = this.wrap('details', this.wrap('summary', label) + content);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML image tag to the summary buffer
     *
     * @param {string} src path to the image you to embed
     * @param {string} alt text description of the image
     * @param {SummaryImageOptions} options (optional) addition image attributes
     *
     * @returns {Summary} summary instance
     */
    addImage(src, alt, options) {
        const { width, height } = options || {};
        const attrs = Object.assign(Object.assign({}, (width && { width })), (height && { height }));
        const element = this.wrap('img', null, Object.assign({ src, alt }, attrs));
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML section heading element
     *
     * @param {string} text heading text
     * @param {number | string} [level=1] (optional) the heading level, default: 1
     *
     * @returns {Summary} summary instance
     */
    addHeading(text, level) {
        const tag = `h${level}`;
        const allowedTag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)
            ? tag
            : 'h1';
        const element = this.wrap(allowedTag, text);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML thematic break (<hr>) to the summary buffer
     *
     * @returns {Summary} summary instance
     */
    addSeparator() {
        const element = this.wrap('hr', null);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML line break (<br>) to the summary buffer
     *
     * @returns {Summary} summary instance
     */
    addBreak() {
        const element = this.wrap('br', null);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML blockquote to the summary buffer
     *
     * @param {string} text quote text
     * @param {string} cite (optional) citation url
     *
     * @returns {Summary} summary instance
     */
    addQuote(text, cite) {
        const attrs = Object.assign({}, (cite && { cite }));
        const element = this.wrap('blockquote', text, attrs);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML anchor tag to the summary buffer
     *
     * @param {string} text link text/content
     * @param {string} href hyperlink
     *
     * @returns {Summary} summary instance
     */
    addLink(text, href) {
        const element = this.wrap('a', text, { href });
        return this.addRaw(element).addEOL();
    }
}
const _summary = new Summary();
/**
 * @deprecated use `core.summary`
 */
exports.markdownSummary = _summary;
exports.summary = _summary;
//# sourceMappingURL=summary.js.map

/***/ }),

/***/ "./node_modules/@actions/core/lib/utils.js":
/*!*************************************************!*\
  !*** ./node_modules/@actions/core/lib/utils.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toCommandProperties = exports.toCommandValue = void 0;
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
/**
 *
 * @param annotationProperties
 * @returns The command properties to send with the actual annotation command
 * See IssueCommandProperties: https://github.com/actions/runner/blob/main/src/Runner.Worker/ActionCommandManager.cs#L646
 */
function toCommandProperties(annotationProperties) {
    if (!Object.keys(annotationProperties).length) {
        return {};
    }
    return {
        title: annotationProperties.title,
        file: annotationProperties.file,
        line: annotationProperties.startLine,
        endLine: annotationProperties.endLine,
        col: annotationProperties.startColumn,
        endColumn: annotationProperties.endColumn
    };
}
exports.toCommandProperties = toCommandProperties;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "./node_modules/@actions/http-client/lib/auth.js":
/*!*******************************************************!*\
  !*** ./node_modules/@actions/http-client/lib/auth.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PersonalAccessTokenCredentialHandler = exports.BearerCredentialHandler = exports.BasicCredentialHandler = void 0;
class BasicCredentialHandler {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
    prepareRequest(options) {
        if (!options.headers) {
            throw Error('The request has no headers');
        }
        options.headers['Authorization'] = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;
    }
    // This handler cannot handle 401
    canHandleAuthentication() {
        return false;
    }
    handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
}
exports.BasicCredentialHandler = BasicCredentialHandler;
class BearerCredentialHandler {
    constructor(token) {
        this.token = token;
    }
    // currently implements pre-authorization
    // TODO: support preAuth = false where it hooks on 401
    prepareRequest(options) {
        if (!options.headers) {
            throw Error('The request has no headers');
        }
        options.headers['Authorization'] = `Bearer ${this.token}`;
    }
    // This handler cannot handle 401
    canHandleAuthentication() {
        return false;
    }
    handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
}
exports.BearerCredentialHandler = BearerCredentialHandler;
class PersonalAccessTokenCredentialHandler {
    constructor(token) {
        this.token = token;
    }
    // currently implements pre-authorization
    // TODO: support preAuth = false where it hooks on 401
    prepareRequest(options) {
        if (!options.headers) {
            throw Error('The request has no headers');
        }
        options.headers['Authorization'] = `Basic ${Buffer.from(`PAT:${this.token}`).toString('base64')}`;
    }
    // This handler cannot handle 401
    canHandleAuthentication() {
        return false;
    }
    handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
}
exports.PersonalAccessTokenCredentialHandler = PersonalAccessTokenCredentialHandler;
//# sourceMappingURL=auth.js.map

/***/ }),

/***/ "./node_modules/@actions/http-client/lib/index.js":
/*!********************************************************!*\
  !*** ./node_modules/@actions/http-client/lib/index.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* eslint-disable @typescript-eslint/no-explicit-any */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpClient = exports.isHttps = exports.HttpClientResponse = exports.HttpClientError = exports.getProxyUrl = exports.MediaTypes = exports.Headers = exports.HttpCodes = void 0;
const http = __importStar(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'http'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const https = __importStar(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'https'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const pm = __importStar(__webpack_require__(/*! ./proxy */ "./node_modules/@actions/http-client/lib/proxy.js"));
const tunnel = __importStar(__webpack_require__(/*! tunnel */ "./node_modules/tunnel/index.js"));
var HttpCodes;
(function (HttpCodes) {
    HttpCodes[HttpCodes["OK"] = 200] = "OK";
    HttpCodes[HttpCodes["MultipleChoices"] = 300] = "MultipleChoices";
    HttpCodes[HttpCodes["MovedPermanently"] = 301] = "MovedPermanently";
    HttpCodes[HttpCodes["ResourceMoved"] = 302] = "ResourceMoved";
    HttpCodes[HttpCodes["SeeOther"] = 303] = "SeeOther";
    HttpCodes[HttpCodes["NotModified"] = 304] = "NotModified";
    HttpCodes[HttpCodes["UseProxy"] = 305] = "UseProxy";
    HttpCodes[HttpCodes["SwitchProxy"] = 306] = "SwitchProxy";
    HttpCodes[HttpCodes["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    HttpCodes[HttpCodes["PermanentRedirect"] = 308] = "PermanentRedirect";
    HttpCodes[HttpCodes["BadRequest"] = 400] = "BadRequest";
    HttpCodes[HttpCodes["Unauthorized"] = 401] = "Unauthorized";
    HttpCodes[HttpCodes["PaymentRequired"] = 402] = "PaymentRequired";
    HttpCodes[HttpCodes["Forbidden"] = 403] = "Forbidden";
    HttpCodes[HttpCodes["NotFound"] = 404] = "NotFound";
    HttpCodes[HttpCodes["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    HttpCodes[HttpCodes["NotAcceptable"] = 406] = "NotAcceptable";
    HttpCodes[HttpCodes["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
    HttpCodes[HttpCodes["RequestTimeout"] = 408] = "RequestTimeout";
    HttpCodes[HttpCodes["Conflict"] = 409] = "Conflict";
    HttpCodes[HttpCodes["Gone"] = 410] = "Gone";
    HttpCodes[HttpCodes["TooManyRequests"] = 429] = "TooManyRequests";
    HttpCodes[HttpCodes["InternalServerError"] = 500] = "InternalServerError";
    HttpCodes[HttpCodes["NotImplemented"] = 501] = "NotImplemented";
    HttpCodes[HttpCodes["BadGateway"] = 502] = "BadGateway";
    HttpCodes[HttpCodes["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HttpCodes[HttpCodes["GatewayTimeout"] = 504] = "GatewayTimeout";
})(HttpCodes = exports.HttpCodes || (exports.HttpCodes = {}));
var Headers;
(function (Headers) {
    Headers["Accept"] = "accept";
    Headers["ContentType"] = "content-type";
})(Headers = exports.Headers || (exports.Headers = {}));
var MediaTypes;
(function (MediaTypes) {
    MediaTypes["ApplicationJson"] = "application/json";
})(MediaTypes = exports.MediaTypes || (exports.MediaTypes = {}));
/**
 * Returns the proxy URL, depending upon the supplied url and proxy environment variables.
 * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
 */
function getProxyUrl(serverUrl) {
    const proxyUrl = pm.getProxyUrl(new URL(serverUrl));
    return proxyUrl ? proxyUrl.href : '';
}
exports.getProxyUrl = getProxyUrl;
const HttpRedirectCodes = [
    HttpCodes.MovedPermanently,
    HttpCodes.ResourceMoved,
    HttpCodes.SeeOther,
    HttpCodes.TemporaryRedirect,
    HttpCodes.PermanentRedirect
];
const HttpResponseRetryCodes = [
    HttpCodes.BadGateway,
    HttpCodes.ServiceUnavailable,
    HttpCodes.GatewayTimeout
];
const RetryableHttpVerbs = ['OPTIONS', 'GET', 'DELETE', 'HEAD'];
const ExponentialBackoffCeiling = 10;
const ExponentialBackoffTimeSlice = 5;
class HttpClientError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'HttpClientError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, HttpClientError.prototype);
    }
}
exports.HttpClientError = HttpClientError;
class HttpClientResponse {
    constructor(message) {
        this.message = message;
    }
    readBody() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                let output = Buffer.alloc(0);
                this.message.on('data', (chunk) => {
                    output = Buffer.concat([output, chunk]);
                });
                this.message.on('end', () => {
                    resolve(output.toString());
                });
            }));
        });
    }
}
exports.HttpClientResponse = HttpClientResponse;
function isHttps(requestUrl) {
    const parsedUrl = new URL(requestUrl);
    return parsedUrl.protocol === 'https:';
}
exports.isHttps = isHttps;
class HttpClient {
    constructor(userAgent, handlers, requestOptions) {
        this._ignoreSslError = false;
        this._allowRedirects = true;
        this._allowRedirectDowngrade = false;
        this._maxRedirects = 50;
        this._allowRetries = false;
        this._maxRetries = 1;
        this._keepAlive = false;
        this._disposed = false;
        this.userAgent = userAgent;
        this.handlers = handlers || [];
        this.requestOptions = requestOptions;
        if (requestOptions) {
            if (requestOptions.ignoreSslError != null) {
                this._ignoreSslError = requestOptions.ignoreSslError;
            }
            this._socketTimeout = requestOptions.socketTimeout;
            if (requestOptions.allowRedirects != null) {
                this._allowRedirects = requestOptions.allowRedirects;
            }
            if (requestOptions.allowRedirectDowngrade != null) {
                this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
            }
            if (requestOptions.maxRedirects != null) {
                this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
            }
            if (requestOptions.keepAlive != null) {
                this._keepAlive = requestOptions.keepAlive;
            }
            if (requestOptions.allowRetries != null) {
                this._allowRetries = requestOptions.allowRetries;
            }
            if (requestOptions.maxRetries != null) {
                this._maxRetries = requestOptions.maxRetries;
            }
        }
    }
    options(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('OPTIONS', requestUrl, null, additionalHeaders || {});
        });
    }
    get(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('GET', requestUrl, null, additionalHeaders || {});
        });
    }
    del(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('DELETE', requestUrl, null, additionalHeaders || {});
        });
    }
    post(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('POST', requestUrl, data, additionalHeaders || {});
        });
    }
    patch(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('PATCH', requestUrl, data, additionalHeaders || {});
        });
    }
    put(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('PUT', requestUrl, data, additionalHeaders || {});
        });
    }
    head(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('HEAD', requestUrl, null, additionalHeaders || {});
        });
    }
    sendStream(verb, requestUrl, stream, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(verb, requestUrl, stream, additionalHeaders);
        });
    }
    /**
     * Gets a typed object from an endpoint
     * Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
     */
    getJson(requestUrl, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            const res = yield this.get(requestUrl, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    postJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = JSON.stringify(obj, null, 2);
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
            const res = yield this.post(requestUrl, data, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    putJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = JSON.stringify(obj, null, 2);
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
            const res = yield this.put(requestUrl, data, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    patchJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = JSON.stringify(obj, null, 2);
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
            const res = yield this.patch(requestUrl, data, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    /**
     * Makes a raw http request.
     * All other methods such as get, post, patch, and request ultimately call this.
     * Prefer get, del, post and patch
     */
    request(verb, requestUrl, data, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._disposed) {
                throw new Error('Client has already been disposed.');
            }
            const parsedUrl = new URL(requestUrl);
            let info = this._prepareRequest(verb, parsedUrl, headers);
            // Only perform retries on reads since writes may not be idempotent.
            const maxTries = this._allowRetries && RetryableHttpVerbs.includes(verb)
                ? this._maxRetries + 1
                : 1;
            let numTries = 0;
            let response;
            do {
                response = yield this.requestRaw(info, data);
                // Check if it's an authentication challenge
                if (response &&
                    response.message &&
                    response.message.statusCode === HttpCodes.Unauthorized) {
                    let authenticationHandler;
                    for (const handler of this.handlers) {
                        if (handler.canHandleAuthentication(response)) {
                            authenticationHandler = handler;
                            break;
                        }
                    }
                    if (authenticationHandler) {
                        return authenticationHandler.handleAuthentication(this, info, data);
                    }
                    else {
                        // We have received an unauthorized response but have no handlers to handle it.
                        // Let the response return to the caller.
                        return response;
                    }
                }
                let redirectsRemaining = this._maxRedirects;
                while (response.message.statusCode &&
                    HttpRedirectCodes.includes(response.message.statusCode) &&
                    this._allowRedirects &&
                    redirectsRemaining > 0) {
                    const redirectUrl = response.message.headers['location'];
                    if (!redirectUrl) {
                        // if there's no location to redirect to, we won't
                        break;
                    }
                    const parsedRedirectUrl = new URL(redirectUrl);
                    if (parsedUrl.protocol === 'https:' &&
                        parsedUrl.protocol !== parsedRedirectUrl.protocol &&
                        !this._allowRedirectDowngrade) {
                        throw new Error('Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.');
                    }
                    // we need to finish reading the response before reassigning response
                    // which will leak the open socket.
                    yield response.readBody();
                    // strip authorization header if redirected to a different hostname
                    if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
                        for (const header in headers) {
                            // header names are case insensitive
                            if (header.toLowerCase() === 'authorization') {
                                delete headers[header];
                            }
                        }
                    }
                    // let's make the request with the new redirectUrl
                    info = this._prepareRequest(verb, parsedRedirectUrl, headers);
                    response = yield this.requestRaw(info, data);
                    redirectsRemaining--;
                }
                if (!response.message.statusCode ||
                    !HttpResponseRetryCodes.includes(response.message.statusCode)) {
                    // If not a retry code, return immediately instead of retrying
                    return response;
                }
                numTries += 1;
                if (numTries < maxTries) {
                    yield response.readBody();
                    yield this._performExponentialBackoff(numTries);
                }
            } while (numTries < maxTries);
            return response;
        });
    }
    /**
     * Needs to be called if keepAlive is set to true in request options.
     */
    dispose() {
        if (this._agent) {
            this._agent.destroy();
        }
        this._disposed = true;
    }
    /**
     * Raw request.
     * @param info
     * @param data
     */
    requestRaw(info, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                function callbackForResult(err, res) {
                    if (err) {
                        reject(err);
                    }
                    else if (!res) {
                        // If `err` is not passed, then `res` must be passed.
                        reject(new Error('Unknown error'));
                    }
                    else {
                        resolve(res);
                    }
                }
                this.requestRawWithCallback(info, data, callbackForResult);
            });
        });
    }
    /**
     * Raw request with callback.
     * @param info
     * @param data
     * @param onResult
     */
    requestRawWithCallback(info, data, onResult) {
        if (typeof data === 'string') {
            if (!info.options.headers) {
                info.options.headers = {};
            }
            info.options.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
        }
        let callbackCalled = false;
        function handleResult(err, res) {
            if (!callbackCalled) {
                callbackCalled = true;
                onResult(err, res);
            }
        }
        const req = info.httpModule.request(info.options, (msg) => {
            const res = new HttpClientResponse(msg);
            handleResult(undefined, res);
        });
        let socket;
        req.on('socket', sock => {
            socket = sock;
        });
        // If we ever get disconnected, we want the socket to timeout eventually
        req.setTimeout(this._socketTimeout || 3 * 60000, () => {
            if (socket) {
                socket.end();
            }
            handleResult(new Error(`Request timeout: ${info.options.path}`));
        });
        req.on('error', function (err) {
            // err has statusCode property
            // res should have headers
            handleResult(err);
        });
        if (data && typeof data === 'string') {
            req.write(data, 'utf8');
        }
        if (data && typeof data !== 'string') {
            data.on('close', function () {
                req.end();
            });
            data.pipe(req);
        }
        else {
            req.end();
        }
    }
    /**
     * Gets an http agent. This function is useful when you need an http agent that handles
     * routing through a proxy server - depending upon the url and proxy environment variables.
     * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
     */
    getAgent(serverUrl) {
        const parsedUrl = new URL(serverUrl);
        return this._getAgent(parsedUrl);
    }
    _prepareRequest(method, requestUrl, headers) {
        const info = {};
        info.parsedUrl = requestUrl;
        const usingSsl = info.parsedUrl.protocol === 'https:';
        info.httpModule = usingSsl ? https : http;
        const defaultPort = usingSsl ? 443 : 80;
        info.options = {};
        info.options.host = info.parsedUrl.hostname;
        info.options.port = info.parsedUrl.port
            ? parseInt(info.parsedUrl.port)
            : defaultPort;
        info.options.path =
            (info.parsedUrl.pathname || '') + (info.parsedUrl.search || '');
        info.options.method = method;
        info.options.headers = this._mergeHeaders(headers);
        if (this.userAgent != null) {
            info.options.headers['user-agent'] = this.userAgent;
        }
        info.options.agent = this._getAgent(info.parsedUrl);
        // gives handlers an opportunity to participate
        if (this.handlers) {
            for (const handler of this.handlers) {
                handler.prepareRequest(info.options);
            }
        }
        return info;
    }
    _mergeHeaders(headers) {
        if (this.requestOptions && this.requestOptions.headers) {
            return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers || {}));
        }
        return lowercaseKeys(headers || {});
    }
    _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
        let clientHeader;
        if (this.requestOptions && this.requestOptions.headers) {
            clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
        }
        return additionalHeaders[header] || clientHeader || _default;
    }
    _getAgent(parsedUrl) {
        let agent;
        const proxyUrl = pm.getProxyUrl(parsedUrl);
        const useProxy = proxyUrl && proxyUrl.hostname;
        if (this._keepAlive && useProxy) {
            agent = this._proxyAgent;
        }
        if (this._keepAlive && !useProxy) {
            agent = this._agent;
        }
        // if agent is already assigned use that agent.
        if (agent) {
            return agent;
        }
        const usingSsl = parsedUrl.protocol === 'https:';
        let maxSockets = 100;
        if (this.requestOptions) {
            maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
        }
        // This is `useProxy` again, but we need to check `proxyURl` directly for TypeScripts's flow analysis.
        if (proxyUrl && proxyUrl.hostname) {
            const agentOptions = {
                maxSockets,
                keepAlive: this._keepAlive,
                proxy: Object.assign(Object.assign({}, ((proxyUrl.username || proxyUrl.password) && {
                    proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`
                })), { host: proxyUrl.hostname, port: proxyUrl.port })
            };
            let tunnelAgent;
            const overHttps = proxyUrl.protocol === 'https:';
            if (usingSsl) {
                tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
            }
            else {
                tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
            }
            agent = tunnelAgent(agentOptions);
            this._proxyAgent = agent;
        }
        // if reusing agent across request and tunneling agent isn't assigned create a new agent
        if (this._keepAlive && !agent) {
            const options = { keepAlive: this._keepAlive, maxSockets };
            agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
            this._agent = agent;
        }
        // if not using private agent and tunnel agent isn't setup then use global agent
        if (!agent) {
            agent = usingSsl ? https.globalAgent : http.globalAgent;
        }
        if (usingSsl && this._ignoreSslError) {
            // we don't want to set NODE_TLS_REJECT_UNAUTHORIZED=0 since that will affect request for entire process
            // http.RequestOptions doesn't expose a way to modify RequestOptions.agent.options
            // we have to cast it to any and change it directly
            agent.options = Object.assign(agent.options || {}, {
                rejectUnauthorized: false
            });
        }
        return agent;
    }
    _performExponentialBackoff(retryNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
            const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
            return new Promise(resolve => setTimeout(() => resolve(), ms));
        });
    }
    _processResponse(res, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const statusCode = res.message.statusCode || 0;
                const response = {
                    statusCode,
                    result: null,
                    headers: {}
                };
                // not found leads to null obj returned
                if (statusCode === HttpCodes.NotFound) {
                    resolve(response);
                }
                // get the result from the body
                function dateTimeDeserializer(key, value) {
                    if (typeof value === 'string') {
                        const a = new Date(value);
                        if (!isNaN(a.valueOf())) {
                            return a;
                        }
                    }
                    return value;
                }
                let obj;
                let contents;
                try {
                    contents = yield res.readBody();
                    if (contents && contents.length > 0) {
                        if (options && options.deserializeDates) {
                            obj = JSON.parse(contents, dateTimeDeserializer);
                        }
                        else {
                            obj = JSON.parse(contents);
                        }
                        response.result = obj;
                    }
                    response.headers = res.message.headers;
                }
                catch (err) {
                    // Invalid resource (contents not json);  leaving result obj null
                }
                // note that 3xx redirects are handled by the http layer.
                if (statusCode > 299) {
                    let msg;
                    // if exception/error in body, attempt to get better error
                    if (obj && obj.message) {
                        msg = obj.message;
                    }
                    else if (contents && contents.length > 0) {
                        // it may be the case that the exception is in the body message as string
                        msg = contents;
                    }
                    else {
                        msg = `Failed request: (${statusCode})`;
                    }
                    const err = new HttpClientError(msg, statusCode);
                    err.result = response.result;
                    reject(err);
                }
                else {
                    resolve(response);
                }
            }));
        });
    }
}
exports.HttpClient = HttpClient;
const lowercaseKeys = (obj) => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@actions/http-client/lib/proxy.js":
/*!********************************************************!*\
  !*** ./node_modules/@actions/http-client/lib/proxy.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.checkBypass = exports.getProxyUrl = void 0;
function getProxyUrl(reqUrl) {
    const usingSsl = reqUrl.protocol === 'https:';
    if (checkBypass(reqUrl)) {
        return undefined;
    }
    const proxyVar = (() => {
        if (usingSsl) {
            return process.env['https_proxy'] || process.env['HTTPS_PROXY'];
        }
        else {
            return process.env['http_proxy'] || process.env['HTTP_PROXY'];
        }
    })();
    if (proxyVar) {
        return new URL(proxyVar);
    }
    else {
        return undefined;
    }
}
exports.getProxyUrl = getProxyUrl;
function checkBypass(reqUrl) {
    if (!reqUrl.hostname) {
        return false;
    }
    const reqHost = reqUrl.hostname;
    if (isLoopbackAddress(reqHost)) {
        return true;
    }
    const noProxy = process.env['no_proxy'] || process.env['NO_PROXY'] || '';
    if (!noProxy) {
        return false;
    }
    // Determine the request port
    let reqPort;
    if (reqUrl.port) {
        reqPort = Number(reqUrl.port);
    }
    else if (reqUrl.protocol === 'http:') {
        reqPort = 80;
    }
    else if (reqUrl.protocol === 'https:') {
        reqPort = 443;
    }
    // Format the request hostname and hostname with port
    const upperReqHosts = [reqUrl.hostname.toUpperCase()];
    if (typeof reqPort === 'number') {
        upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
    }
    // Compare request host against noproxy
    for (const upperNoProxyItem of noProxy
        .split(',')
        .map(x => x.trim().toUpperCase())
        .filter(x => x)) {
        if (upperNoProxyItem === '*' ||
            upperReqHosts.some(x => x === upperNoProxyItem ||
                x.endsWith(`.${upperNoProxyItem}`) ||
                (upperNoProxyItem.startsWith('.') &&
                    x.endsWith(`${upperNoProxyItem}`)))) {
            return true;
        }
    }
    return false;
}
exports.checkBypass = checkBypass;
function isLoopbackAddress(host) {
    const hostLower = host.toLowerCase();
    return (hostLower === 'localhost' ||
        hostLower.startsWith('127.') ||
        hostLower.startsWith('[::1]') ||
        hostLower.startsWith('[0:0:0:0:0:0:0:1]'));
}
//# sourceMappingURL=proxy.js.map

/***/ }),

/***/ "./node_modules/balanced-match/index.js":
/*!**********************************************!*\
  !*** ./node_modules/balanced-match/index.js ***!
  \**********************************************/
/***/ ((module) => {

"use strict";

module.exports = balanced;
function balanced(a, b, str) {
  if (a instanceof RegExp) a = maybeMatch(a, str);
  if (b instanceof RegExp) b = maybeMatch(b, str);

  var r = range(a, b, str);

  return r && {
    start: r[0],
    end: r[1],
    pre: str.slice(0, r[0]),
    body: str.slice(r[0] + a.length, r[1]),
    post: str.slice(r[1] + b.length)
  };
}

function maybeMatch(reg, str) {
  var m = str.match(reg);
  return m ? m[0] : null;
}

balanced.range = range;
function range(a, b, str) {
  var begs, beg, left, right, result;
  var ai = str.indexOf(a);
  var bi = str.indexOf(b, ai + 1);
  var i = ai;

  if (ai >= 0 && bi > 0) {
    if(a===b) {
      return [ai, bi];
    }
    begs = [];
    left = str.length;

    while (i >= 0 && !result) {
      if (i == ai) {
        begs.push(i);
        ai = str.indexOf(a, i + 1);
      } else if (begs.length == 1) {
        result = [ begs.pop(), bi ];
      } else {
        beg = begs.pop();
        if (beg < left) {
          left = beg;
          right = bi;
        }

        bi = str.indexOf(b, i + 1);
      }

      i = ai < bi && ai >= 0 ? ai : bi;
    }

    if (begs.length) {
      result = [ left, right ];
    }
  }

  return result;
}


/***/ }),

/***/ "./node_modules/brace-expansion/index.js":
/*!***********************************************!*\
  !*** ./node_modules/brace-expansion/index.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var concatMap = __webpack_require__(/*! concat-map */ "./node_modules/concat-map/index.js");
var balanced = __webpack_require__(/*! balanced-match */ "./node_modules/balanced-match/index.js");

module.exports = expandTop;

var escSlash = '\0SLASH'+Math.random()+'\0';
var escOpen = '\0OPEN'+Math.random()+'\0';
var escClose = '\0CLOSE'+Math.random()+'\0';
var escComma = '\0COMMA'+Math.random()+'\0';
var escPeriod = '\0PERIOD'+Math.random()+'\0';

function numeric(str) {
  return parseInt(str, 10) == str
    ? parseInt(str, 10)
    : str.charCodeAt(0);
}

function escapeBraces(str) {
  return str.split('\\\\').join(escSlash)
            .split('\\{').join(escOpen)
            .split('\\}').join(escClose)
            .split('\\,').join(escComma)
            .split('\\.').join(escPeriod);
}

function unescapeBraces(str) {
  return str.split(escSlash).join('\\')
            .split(escOpen).join('{')
            .split(escClose).join('}')
            .split(escComma).join(',')
            .split(escPeriod).join('.');
}


// Basically just str.split(","), but handling cases
// where we have nested braced sections, which should be
// treated as individual members, like {a,{b,c},d}
function parseCommaParts(str) {
  if (!str)
    return [''];

  var parts = [];
  var m = balanced('{', '}', str);

  if (!m)
    return str.split(',');

  var pre = m.pre;
  var body = m.body;
  var post = m.post;
  var p = pre.split(',');

  p[p.length-1] += '{' + body + '}';
  var postParts = parseCommaParts(post);
  if (post.length) {
    p[p.length-1] += postParts.shift();
    p.push.apply(p, postParts);
  }

  parts.push.apply(parts, p);

  return parts;
}

function expandTop(str) {
  if (!str)
    return [];

  // I don't know why Bash 4.3 does this, but it does.
  // Anything starting with {} will have the first two bytes preserved
  // but *only* at the top level, so {},a}b will not expand to anything,
  // but a{},b}c will be expanded to [a}c,abc].
  // One could argue that this is a bug in Bash, but since the goal of
  // this module is to match Bash's rules, we escape a leading {}
  if (str.substr(0, 2) === '{}') {
    str = '\\{\\}' + str.substr(2);
  }

  return expand(escapeBraces(str), true).map(unescapeBraces);
}

function identity(e) {
  return e;
}

function embrace(str) {
  return '{' + str + '}';
}
function isPadded(el) {
  return /^-?0\d/.test(el);
}

function lte(i, y) {
  return i <= y;
}
function gte(i, y) {
  return i >= y;
}

function expand(str, isTop) {
  var expansions = [];

  var m = balanced('{', '}', str);
  if (!m || /\$$/.test(m.pre)) return [str];

  var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
  var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
  var isSequence = isNumericSequence || isAlphaSequence;
  var isOptions = m.body.indexOf(',') >= 0;
  if (!isSequence && !isOptions) {
    // {a},b}
    if (m.post.match(/,.*\}/)) {
      str = m.pre + '{' + m.body + escClose + m.post;
      return expand(str);
    }
    return [str];
  }

  var n;
  if (isSequence) {
    n = m.body.split(/\.\./);
  } else {
    n = parseCommaParts(m.body);
    if (n.length === 1) {
      // x{{a,b}}y ==> x{a}y x{b}y
      n = expand(n[0], false).map(embrace);
      if (n.length === 1) {
        var post = m.post.length
          ? expand(m.post, false)
          : [''];
        return post.map(function(p) {
          return m.pre + n[0] + p;
        });
      }
    }
  }

  // at this point, n is the parts, and we know it's not a comma set
  // with a single entry.

  // no need to expand pre, since it is guaranteed to be free of brace-sets
  var pre = m.pre;
  var post = m.post.length
    ? expand(m.post, false)
    : [''];

  var N;

  if (isSequence) {
    var x = numeric(n[0]);
    var y = numeric(n[1]);
    var width = Math.max(n[0].length, n[1].length)
    var incr = n.length == 3
      ? Math.abs(numeric(n[2]))
      : 1;
    var test = lte;
    var reverse = y < x;
    if (reverse) {
      incr *= -1;
      test = gte;
    }
    var pad = n.some(isPadded);

    N = [];

    for (var i = x; test(i, y); i += incr) {
      var c;
      if (isAlphaSequence) {
        c = String.fromCharCode(i);
        if (c === '\\')
          c = '';
      } else {
        c = String(i);
        if (pad) {
          var need = width - c.length;
          if (need > 0) {
            var z = new Array(need + 1).join('0');
            if (i < 0)
              c = '-' + z + c.slice(1);
            else
              c = z + c;
          }
        }
      }
      N.push(c);
    }
  } else {
    N = concatMap(n, function(el) { return expand(el, false) });
  }

  for (var j = 0; j < N.length; j++) {
    for (var k = 0; k < post.length; k++) {
      var expansion = pre + N[j] + post[k];
      if (!isTop || isSequence || expansion)
        expansions.push(expansion);
    }
  }

  return expansions;
}



/***/ }),

/***/ "./node_modules/concat-map/index.js":
/*!******************************************!*\
  !*** ./node_modules/concat-map/index.js ***!
  \******************************************/
/***/ ((module) => {

module.exports = function (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        var x = fn(xs[i], i);
        if (isArray(x)) res.push.apply(res, x);
        else res.push(x);
    }
    return res;
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};


/***/ }),

/***/ "./node_modules/events/events.js":
/*!***************************************!*\
  !*** ./node_modules/events/events.js ***!
  \***************************************/
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}


/***/ }),

/***/ "./node_modules/fs.realpath/index.js":
/*!*******************************************!*\
  !*** ./node_modules/fs.realpath/index.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = realpath
realpath.realpath = realpath
realpath.sync = realpathSync
realpath.realpathSync = realpathSync
realpath.monkeypatch = monkeypatch
realpath.unmonkeypatch = unmonkeypatch

var fs = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'fs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
var origRealpath = fs.realpath
var origRealpathSync = fs.realpathSync

var version = process.version
var ok = /^v[0-5]\./.test(version)
var old = __webpack_require__(/*! ./old.js */ "./node_modules/fs.realpath/old.js")

function newError (er) {
  return er && er.syscall === 'realpath' && (
    er.code === 'ELOOP' ||
    er.code === 'ENOMEM' ||
    er.code === 'ENAMETOOLONG'
  )
}

function realpath (p, cache, cb) {
  if (ok) {
    return origRealpath(p, cache, cb)
  }

  if (typeof cache === 'function') {
    cb = cache
    cache = null
  }
  origRealpath(p, cache, function (er, result) {
    if (newError(er)) {
      old.realpath(p, cache, cb)
    } else {
      cb(er, result)
    }
  })
}

function realpathSync (p, cache) {
  if (ok) {
    return origRealpathSync(p, cache)
  }

  try {
    return origRealpathSync(p, cache)
  } catch (er) {
    if (newError(er)) {
      return old.realpathSync(p, cache)
    } else {
      throw er
    }
  }
}

function monkeypatch () {
  fs.realpath = realpath
  fs.realpathSync = realpathSync
}

function unmonkeypatch () {
  fs.realpath = origRealpath
  fs.realpathSync = origRealpathSync
}


/***/ }),

/***/ "./node_modules/fs.realpath/old.js":
/*!*****************************************!*\
  !*** ./node_modules/fs.realpath/old.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var pathModule = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'path'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
var isWindows = process.platform === 'win32';
var fs = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'fs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

// JavaScript implementation of realpath, ported from node pre-v6

var DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);

function rethrow() {
  // Only enable in debug mode. A backtrace uses ~1000 bytes of heap space and
  // is fairly slow to generate.
  var callback;
  if (DEBUG) {
    var backtrace = new Error;
    callback = debugCallback;
  } else
    callback = missingCallback;

  return callback;

  function debugCallback(err) {
    if (err) {
      backtrace.message = err.message;
      err = backtrace;
      missingCallback(err);
    }
  }

  function missingCallback(err) {
    if (err) {
      if (process.throwDeprecation)
        throw err;  // Forgot a callback but don't know where? Use NODE_DEBUG=fs
      else if (!process.noDeprecation) {
        var msg = 'fs: missing callback ' + (err.stack || err.message);
        if (process.traceDeprecation)
          console.trace(msg);
        else
          console.error(msg);
      }
    }
  }
}

function maybeCallback(cb) {
  return typeof cb === 'function' ? cb : rethrow();
}

var normalize = pathModule.normalize;

// Regexp that finds the next partion of a (partial) path
// result is [base_with_slash, base], e.g. ['somedir/', 'somedir']
if (isWindows) {
  var nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
} else {
  var nextPartRe = /(.*?)(?:[\/]+|$)/g;
}

// Regex to find the device root, including trailing slash. E.g. 'c:\\'.
if (isWindows) {
  var splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
} else {
  var splitRootRe = /^[\/]*/;
}

exports.realpathSync = function realpathSync(p, cache) {
  // make p is absolute
  p = pathModule.resolve(p);

  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
    return cache[p];
  }

  var original = p,
      seenLinks = {},
      knownHard = {};

  // current character position in p
  var pos;
  // the partial path so far, including a trailing slash if any
  var current;
  // the partial path without a trailing slash (except when pointing at a root)
  var base;
  // the partial path scanned in the previous round, with slash
  var previous;

  start();

  function start() {
    // Skip over roots
    var m = splitRootRe.exec(p);
    pos = m[0].length;
    current = m[0];
    base = m[0];
    previous = '';

    // On windows, check that the root exists. On unix there is no need.
    if (isWindows && !knownHard[base]) {
      fs.lstatSync(base);
      knownHard[base] = true;
    }
  }

  // walk down the path, swapping out linked pathparts for their real
  // values
  // NB: p.length changes.
  while (pos < p.length) {
    // find the next part
    nextPartRe.lastIndex = pos;
    var result = nextPartRe.exec(p);
    previous = current;
    current += result[0];
    base = previous + result[1];
    pos = nextPartRe.lastIndex;

    // continue if not a symlink
    if (knownHard[base] || (cache && cache[base] === base)) {
      continue;
    }

    var resolvedLink;
    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
      // some known symbolic link.  no need to stat again.
      resolvedLink = cache[base];
    } else {
      var stat = fs.lstatSync(base);
      if (!stat.isSymbolicLink()) {
        knownHard[base] = true;
        if (cache) cache[base] = base;
        continue;
      }

      // read the link if it wasn't read before
      // dev/ino always return 0 on windows, so skip the check.
      var linkTarget = null;
      if (!isWindows) {
        var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
        if (seenLinks.hasOwnProperty(id)) {
          linkTarget = seenLinks[id];
        }
      }
      if (linkTarget === null) {
        fs.statSync(base);
        linkTarget = fs.readlinkSync(base);
      }
      resolvedLink = pathModule.resolve(previous, linkTarget);
      // track this, if given a cache.
      if (cache) cache[base] = resolvedLink;
      if (!isWindows) seenLinks[id] = linkTarget;
    }

    // resolve the link, then start over
    p = pathModule.resolve(resolvedLink, p.slice(pos));
    start();
  }

  if (cache) cache[original] = p;

  return p;
};


exports.realpath = function realpath(p, cache, cb) {
  if (typeof cb !== 'function') {
    cb = maybeCallback(cache);
    cache = null;
  }

  // make p is absolute
  p = pathModule.resolve(p);

  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
    return process.nextTick(cb.bind(null, null, cache[p]));
  }

  var original = p,
      seenLinks = {},
      knownHard = {};

  // current character position in p
  var pos;
  // the partial path so far, including a trailing slash if any
  var current;
  // the partial path without a trailing slash (except when pointing at a root)
  var base;
  // the partial path scanned in the previous round, with slash
  var previous;

  start();

  function start() {
    // Skip over roots
    var m = splitRootRe.exec(p);
    pos = m[0].length;
    current = m[0];
    base = m[0];
    previous = '';

    // On windows, check that the root exists. On unix there is no need.
    if (isWindows && !knownHard[base]) {
      fs.lstat(base, function(err) {
        if (err) return cb(err);
        knownHard[base] = true;
        LOOP();
      });
    } else {
      process.nextTick(LOOP);
    }
  }

  // walk down the path, swapping out linked pathparts for their real
  // values
  function LOOP() {
    // stop if scanned past end of path
    if (pos >= p.length) {
      if (cache) cache[original] = p;
      return cb(null, p);
    }

    // find the next part
    nextPartRe.lastIndex = pos;
    var result = nextPartRe.exec(p);
    previous = current;
    current += result[0];
    base = previous + result[1];
    pos = nextPartRe.lastIndex;

    // continue if not a symlink
    if (knownHard[base] || (cache && cache[base] === base)) {
      return process.nextTick(LOOP);
    }

    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
      // known symbolic link.  no need to stat again.
      return gotResolvedLink(cache[base]);
    }

    return fs.lstat(base, gotStat);
  }

  function gotStat(err, stat) {
    if (err) return cb(err);

    // if not a symlink, skip to the next path part
    if (!stat.isSymbolicLink()) {
      knownHard[base] = true;
      if (cache) cache[base] = base;
      return process.nextTick(LOOP);
    }

    // stat & read the link if not read before
    // call gotTarget as soon as the link target is known
    // dev/ino always return 0 on windows, so skip the check.
    if (!isWindows) {
      var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
      if (seenLinks.hasOwnProperty(id)) {
        return gotTarget(null, seenLinks[id], base);
      }
    }
    fs.stat(base, function(err) {
      if (err) return cb(err);

      fs.readlink(base, function(err, target) {
        if (!isWindows) seenLinks[id] = target;
        gotTarget(err, target);
      });
    });
  }

  function gotTarget(err, target, base) {
    if (err) return cb(err);

    var resolvedLink = pathModule.resolve(previous, target);
    if (cache) cache[base] = resolvedLink;
    gotResolvedLink(resolvedLink);
  }

  function gotResolvedLink(resolvedLink) {
    // resolve the link, then start over
    p = pathModule.resolve(resolvedLink, p.slice(pos));
    start();
  }
};


/***/ }),

/***/ "./node_modules/glob/common.js":
/*!*************************************!*\
  !*** ./node_modules/glob/common.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

exports.setopts = setopts
exports.ownProp = ownProp
exports.makeAbs = makeAbs
exports.finish = finish
exports.mark = mark
exports.isIgnored = isIgnored
exports.childrenIgnored = childrenIgnored

function ownProp (obj, field) {
  return Object.prototype.hasOwnProperty.call(obj, field)
}

var fs = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'fs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
var path = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'path'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
var minimatch = __webpack_require__(/*! minimatch */ "./node_modules/minimatch/minimatch.js")
var isAbsolute = __webpack_require__(/*! path-is-absolute */ "./node_modules/path-is-absolute/index.js")
var Minimatch = minimatch.Minimatch

function alphasort (a, b) {
  return a.localeCompare(b, 'en')
}

function setupIgnores (self, options) {
  self.ignore = options.ignore || []

  if (!Array.isArray(self.ignore))
    self.ignore = [self.ignore]

  if (self.ignore.length) {
    self.ignore = self.ignore.map(ignoreMap)
  }
}

// ignore patterns are always in dot:true mode.
function ignoreMap (pattern) {
  var gmatcher = null
  if (pattern.slice(-3) === '/**') {
    var gpattern = pattern.replace(/(\/\*\*)+$/, '')
    gmatcher = new Minimatch(gpattern, { dot: true })
  }

  return {
    matcher: new Minimatch(pattern, { dot: true }),
    gmatcher: gmatcher
  }
}

function setopts (self, pattern, options) {
  if (!options)
    options = {}

  // base-matching: just use globstar for that.
  if (options.matchBase && -1 === pattern.indexOf("/")) {
    if (options.noglobstar) {
      throw new Error("base matching requires globstar")
    }
    pattern = "**/" + pattern
  }

  self.silent = !!options.silent
  self.pattern = pattern
  self.strict = options.strict !== false
  self.realpath = !!options.realpath
  self.realpathCache = options.realpathCache || Object.create(null)
  self.follow = !!options.follow
  self.dot = !!options.dot
  self.mark = !!options.mark
  self.nodir = !!options.nodir
  if (self.nodir)
    self.mark = true
  self.sync = !!options.sync
  self.nounique = !!options.nounique
  self.nonull = !!options.nonull
  self.nosort = !!options.nosort
  self.nocase = !!options.nocase
  self.stat = !!options.stat
  self.noprocess = !!options.noprocess
  self.absolute = !!options.absolute
  self.fs = options.fs || fs

  self.maxLength = options.maxLength || Infinity
  self.cache = options.cache || Object.create(null)
  self.statCache = options.statCache || Object.create(null)
  self.symlinks = options.symlinks || Object.create(null)

  setupIgnores(self, options)

  self.changedCwd = false
  var cwd = process.cwd()
  if (!ownProp(options, "cwd"))
    self.cwd = cwd
  else {
    self.cwd = path.resolve(options.cwd)
    self.changedCwd = self.cwd !== cwd
  }

  self.root = options.root || path.resolve(self.cwd, "/")
  self.root = path.resolve(self.root)
  if (process.platform === "win32")
    self.root = self.root.replace(/\\/g, "/")

  // TODO: is an absolute `cwd` supposed to be resolved against `root`?
  // e.g. { cwd: '/test', root: __dirname } === path.join(__dirname, '/test')
  self.cwdAbs = isAbsolute(self.cwd) ? self.cwd : makeAbs(self, self.cwd)
  if (process.platform === "win32")
    self.cwdAbs = self.cwdAbs.replace(/\\/g, "/")
  self.nomount = !!options.nomount

  // disable comments and negation in Minimatch.
  // Note that they are not supported in Glob itself anyway.
  options.nonegate = true
  options.nocomment = true
  // always treat \ in patterns as escapes, not path separators
  options.allowWindowsEscape = false

  self.minimatch = new Minimatch(pattern, options)
  self.options = self.minimatch.options
}

function finish (self) {
  var nou = self.nounique
  var all = nou ? [] : Object.create(null)

  for (var i = 0, l = self.matches.length; i < l; i ++) {
    var matches = self.matches[i]
    if (!matches || Object.keys(matches).length === 0) {
      if (self.nonull) {
        // do like the shell, and spit out the literal glob
        var literal = self.minimatch.globSet[i]
        if (nou)
          all.push(literal)
        else
          all[literal] = true
      }
    } else {
      // had matches
      var m = Object.keys(matches)
      if (nou)
        all.push.apply(all, m)
      else
        m.forEach(function (m) {
          all[m] = true
        })
    }
  }

  if (!nou)
    all = Object.keys(all)

  if (!self.nosort)
    all = all.sort(alphasort)

  // at *some* point we statted all of these
  if (self.mark) {
    for (var i = 0; i < all.length; i++) {
      all[i] = self._mark(all[i])
    }
    if (self.nodir) {
      all = all.filter(function (e) {
        var notDir = !(/\/$/.test(e))
        var c = self.cache[e] || self.cache[makeAbs(self, e)]
        if (notDir && c)
          notDir = c !== 'DIR' && !Array.isArray(c)
        return notDir
      })
    }
  }

  if (self.ignore.length)
    all = all.filter(function(m) {
      return !isIgnored(self, m)
    })

  self.found = all
}

function mark (self, p) {
  var abs = makeAbs(self, p)
  var c = self.cache[abs]
  var m = p
  if (c) {
    var isDir = c === 'DIR' || Array.isArray(c)
    var slash = p.slice(-1) === '/'

    if (isDir && !slash)
      m += '/'
    else if (!isDir && slash)
      m = m.slice(0, -1)

    if (m !== p) {
      var mabs = makeAbs(self, m)
      self.statCache[mabs] = self.statCache[abs]
      self.cache[mabs] = self.cache[abs]
    }
  }

  return m
}

// lotta situps...
function makeAbs (self, f) {
  var abs = f
  if (f.charAt(0) === '/') {
    abs = path.join(self.root, f)
  } else if (isAbsolute(f) || f === '') {
    abs = f
  } else if (self.changedCwd) {
    abs = path.resolve(self.cwd, f)
  } else {
    abs = path.resolve(f)
  }

  if (process.platform === 'win32')
    abs = abs.replace(/\\/g, '/')

  return abs
}


// Return true, if pattern ends with globstar '**', for the accompanying parent directory.
// Ex:- If node_modules/** is the pattern, add 'node_modules' to ignore list along with it's contents
function isIgnored (self, path) {
  if (!self.ignore.length)
    return false

  return self.ignore.some(function(item) {
    return item.matcher.match(path) || !!(item.gmatcher && item.gmatcher.match(path))
  })
}

function childrenIgnored (self, path) {
  if (!self.ignore.length)
    return false

  return self.ignore.some(function(item) {
    return !!(item.gmatcher && item.gmatcher.match(path))
  })
}


/***/ }),

/***/ "./node_modules/glob/glob.js":
/*!***********************************!*\
  !*** ./node_modules/glob/glob.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// Approach:
//
// 1. Get the minimatch set
// 2. For each pattern in the set, PROCESS(pattern, false)
// 3. Store matches per-set, then uniq them
//
// PROCESS(pattern, inGlobStar)
// Get the first [n] items from pattern that are all strings
// Join these together.  This is PREFIX.
//   If there is no more remaining, then stat(PREFIX) and
//   add to matches if it succeeds.  END.
//
// If inGlobStar and PREFIX is symlink and points to dir
//   set ENTRIES = []
// else readdir(PREFIX) as ENTRIES
//   If fail, END
//
// with ENTRIES
//   If pattern[n] is GLOBSTAR
//     // handle the case where the globstar match is empty
//     // by pruning it out, and testing the resulting pattern
//     PROCESS(pattern[0..n] + pattern[n+1 .. $], false)
//     // handle other cases.
//     for ENTRY in ENTRIES (not dotfiles)
//       // attach globstar + tail onto the entry
//       // Mark that this entry is a globstar match
//       PROCESS(pattern[0..n] + ENTRY + pattern[n .. $], true)
//
//   else // not globstar
//     for ENTRY in ENTRIES (not dotfiles, unless pattern[n] is dot)
//       Test ENTRY against pattern[n]
//       If fails, continue
//       If passes, PROCESS(pattern[0..n] + item + pattern[n+1 .. $])
//
// Caveat:
//   Cache all stats and readdirs results to minimize syscall.  Since all
//   we ever care about is existence and directory-ness, we can just keep
//   `true` for files, and [children,...] for directories, or `false` for
//   things that don't exist.

module.exports = glob

var rp = __webpack_require__(/*! fs.realpath */ "./node_modules/fs.realpath/index.js")
var minimatch = __webpack_require__(/*! minimatch */ "./node_modules/minimatch/minimatch.js")
var Minimatch = minimatch.Minimatch
var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
var EE = (__webpack_require__(/*! events */ "./node_modules/events/events.js").EventEmitter)
var path = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'path'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
var assert = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'assert'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
var isAbsolute = __webpack_require__(/*! path-is-absolute */ "./node_modules/path-is-absolute/index.js")
var globSync = __webpack_require__(/*! ./sync.js */ "./node_modules/glob/sync.js")
var common = __webpack_require__(/*! ./common.js */ "./node_modules/glob/common.js")
var setopts = common.setopts
var ownProp = common.ownProp
var inflight = __webpack_require__(/*! inflight */ "./node_modules/inflight/inflight.js")
var util = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'util'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
var childrenIgnored = common.childrenIgnored
var isIgnored = common.isIgnored

var once = __webpack_require__(/*! once */ "./node_modules/once/once.js")

function glob (pattern, options, cb) {
  if (typeof options === 'function') cb = options, options = {}
  if (!options) options = {}

  if (options.sync) {
    if (cb)
      throw new TypeError('callback provided to sync glob')
    return globSync(pattern, options)
  }

  return new Glob(pattern, options, cb)
}

glob.sync = globSync
var GlobSync = glob.GlobSync = globSync.GlobSync

// old api surface
glob.glob = glob

function extend (origin, add) {
  if (add === null || typeof add !== 'object') {
    return origin
  }

  var keys = Object.keys(add)
  var i = keys.length
  while (i--) {
    origin[keys[i]] = add[keys[i]]
  }
  return origin
}

glob.hasMagic = function (pattern, options_) {
  var options = extend({}, options_)
  options.noprocess = true

  var g = new Glob(pattern, options)
  var set = g.minimatch.set

  if (!pattern)
    return false

  if (set.length > 1)
    return true

  for (var j = 0; j < set[0].length; j++) {
    if (typeof set[0][j] !== 'string')
      return true
  }

  return false
}

glob.Glob = Glob
inherits(Glob, EE)
function Glob (pattern, options, cb) {
  if (typeof options === 'function') {
    cb = options
    options = null
  }

  if (options && options.sync) {
    if (cb)
      throw new TypeError('callback provided to sync glob')
    return new GlobSync(pattern, options)
  }

  if (!(this instanceof Glob))
    return new Glob(pattern, options, cb)

  setopts(this, pattern, options)
  this._didRealPath = false

  // process each pattern in the minimatch set
  var n = this.minimatch.set.length

  // The matches are stored as {<filename>: true,...} so that
  // duplicates are automagically pruned.
  // Later, we do an Object.keys() on these.
  // Keep them as a list so we can fill in when nonull is set.
  this.matches = new Array(n)

  if (typeof cb === 'function') {
    cb = once(cb)
    this.on('error', cb)
    this.on('end', function (matches) {
      cb(null, matches)
    })
  }

  var self = this
  this._processing = 0

  this._emitQueue = []
  this._processQueue = []
  this.paused = false

  if (this.noprocess)
    return this

  if (n === 0)
    return done()

  var sync = true
  for (var i = 0; i < n; i ++) {
    this._process(this.minimatch.set[i], i, false, done)
  }
  sync = false

  function done () {
    --self._processing
    if (self._processing <= 0) {
      if (sync) {
        process.nextTick(function () {
          self._finish()
        })
      } else {
        self._finish()
      }
    }
  }
}

Glob.prototype._finish = function () {
  assert(this instanceof Glob)
  if (this.aborted)
    return

  if (this.realpath && !this._didRealpath)
    return this._realpath()

  common.finish(this)
  this.emit('end', this.found)
}

Glob.prototype._realpath = function () {
  if (this._didRealpath)
    return

  this._didRealpath = true

  var n = this.matches.length
  if (n === 0)
    return this._finish()

  var self = this
  for (var i = 0; i < this.matches.length; i++)
    this._realpathSet(i, next)

  function next () {
    if (--n === 0)
      self._finish()
  }
}

Glob.prototype._realpathSet = function (index, cb) {
  var matchset = this.matches[index]
  if (!matchset)
    return cb()

  var found = Object.keys(matchset)
  var self = this
  var n = found.length

  if (n === 0)
    return cb()

  var set = this.matches[index] = Object.create(null)
  found.forEach(function (p, i) {
    // If there's a problem with the stat, then it means that
    // one or more of the links in the realpath couldn't be
    // resolved.  just return the abs value in that case.
    p = self._makeAbs(p)
    rp.realpath(p, self.realpathCache, function (er, real) {
      if (!er)
        set[real] = true
      else if (er.syscall === 'stat')
        set[p] = true
      else
        self.emit('error', er) // srsly wtf right here

      if (--n === 0) {
        self.matches[index] = set
        cb()
      }
    })
  })
}

Glob.prototype._mark = function (p) {
  return common.mark(this, p)
}

Glob.prototype._makeAbs = function (f) {
  return common.makeAbs(this, f)
}

Glob.prototype.abort = function () {
  this.aborted = true
  this.emit('abort')
}

Glob.prototype.pause = function () {
  if (!this.paused) {
    this.paused = true
    this.emit('pause')
  }
}

Glob.prototype.resume = function () {
  if (this.paused) {
    this.emit('resume')
    this.paused = false
    if (this._emitQueue.length) {
      var eq = this._emitQueue.slice(0)
      this._emitQueue.length = 0
      for (var i = 0; i < eq.length; i ++) {
        var e = eq[i]
        this._emitMatch(e[0], e[1])
      }
    }
    if (this._processQueue.length) {
      var pq = this._processQueue.slice(0)
      this._processQueue.length = 0
      for (var i = 0; i < pq.length; i ++) {
        var p = pq[i]
        this._processing--
        this._process(p[0], p[1], p[2], p[3])
      }
    }
  }
}

Glob.prototype._process = function (pattern, index, inGlobStar, cb) {
  assert(this instanceof Glob)
  assert(typeof cb === 'function')

  if (this.aborted)
    return

  this._processing++
  if (this.paused) {
    this._processQueue.push([pattern, index, inGlobStar, cb])
    return
  }

  //console.error('PROCESS %d', this._processing, pattern)

  // Get the first [n] parts of pattern that are all strings.
  var n = 0
  while (typeof pattern[n] === 'string') {
    n ++
  }
  // now n is the index of the first one that is *not* a string.

  // see if there's anything else
  var prefix
  switch (n) {
    // if not, then this is rather simple
    case pattern.length:
      this._processSimple(pattern.join('/'), index, cb)
      return

    case 0:
      // pattern *starts* with some non-trivial item.
      // going to readdir(cwd), but not include the prefix in matches.
      prefix = null
      break

    default:
      // pattern has some string bits in the front.
      // whatever it starts with, whether that's 'absolute' like /foo/bar,
      // or 'relative' like '../baz'
      prefix = pattern.slice(0, n).join('/')
      break
  }

  var remain = pattern.slice(n)

  // get the list of entries.
  var read
  if (prefix === null)
    read = '.'
  else if (isAbsolute(prefix) ||
      isAbsolute(pattern.map(function (p) {
        return typeof p === 'string' ? p : '[*]'
      }).join('/'))) {
    if (!prefix || !isAbsolute(prefix))
      prefix = '/' + prefix
    read = prefix
  } else
    read = prefix

  var abs = this._makeAbs(read)

  //if ignored, skip _processing
  if (childrenIgnored(this, read))
    return cb()

  var isGlobStar = remain[0] === minimatch.GLOBSTAR
  if (isGlobStar)
    this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb)
  else
    this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb)
}

Glob.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar, cb) {
  var self = this
  this._readdir(abs, inGlobStar, function (er, entries) {
    return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb)
  })
}

Glob.prototype._processReaddir2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {

  // if the abs isn't a dir, then nothing can match!
  if (!entries)
    return cb()

  // It will only match dot entries if it starts with a dot, or if
  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
  var pn = remain[0]
  var negate = !!this.minimatch.negate
  var rawGlob = pn._glob
  var dotOk = this.dot || rawGlob.charAt(0) === '.'

  var matchedEntries = []
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i]
    if (e.charAt(0) !== '.' || dotOk) {
      var m
      if (negate && !prefix) {
        m = !e.match(pn)
      } else {
        m = e.match(pn)
      }
      if (m)
        matchedEntries.push(e)
    }
  }

  //console.error('prd2', prefix, entries, remain[0]._glob, matchedEntries)

  var len = matchedEntries.length
  // If there are no matched entries, then nothing matches.
  if (len === 0)
    return cb()

  // if this is the last remaining pattern bit, then no need for
  // an additional stat *unless* the user has specified mark or
  // stat explicitly.  We know they exist, since readdir returned
  // them.

  if (remain.length === 1 && !this.mark && !this.stat) {
    if (!this.matches[index])
      this.matches[index] = Object.create(null)

    for (var i = 0; i < len; i ++) {
      var e = matchedEntries[i]
      if (prefix) {
        if (prefix !== '/')
          e = prefix + '/' + e
        else
          e = prefix + e
      }

      if (e.charAt(0) === '/' && !this.nomount) {
        e = path.join(this.root, e)
      }
      this._emitMatch(index, e)
    }
    // This was the last one, and no stats were needed
    return cb()
  }

  // now test all matched entries as stand-ins for that part
  // of the pattern.
  remain.shift()
  for (var i = 0; i < len; i ++) {
    var e = matchedEntries[i]
    var newPattern
    if (prefix) {
      if (prefix !== '/')
        e = prefix + '/' + e
      else
        e = prefix + e
    }
    this._process([e].concat(remain), index, inGlobStar, cb)
  }
  cb()
}

Glob.prototype._emitMatch = function (index, e) {
  if (this.aborted)
    return

  if (isIgnored(this, e))
    return

  if (this.paused) {
    this._emitQueue.push([index, e])
    return
  }

  var abs = isAbsolute(e) ? e : this._makeAbs(e)

  if (this.mark)
    e = this._mark(e)

  if (this.absolute)
    e = abs

  if (this.matches[index][e])
    return

  if (this.nodir) {
    var c = this.cache[abs]
    if (c === 'DIR' || Array.isArray(c))
      return
  }

  this.matches[index][e] = true

  var st = this.statCache[abs]
  if (st)
    this.emit('stat', e, st)

  this.emit('match', e)
}

Glob.prototype._readdirInGlobStar = function (abs, cb) {
  if (this.aborted)
    return

  // follow all symlinked directories forever
  // just proceed as if this is a non-globstar situation
  if (this.follow)
    return this._readdir(abs, false, cb)

  var lstatkey = 'lstat\0' + abs
  var self = this
  var lstatcb = inflight(lstatkey, lstatcb_)

  if (lstatcb)
    self.fs.lstat(abs, lstatcb)

  function lstatcb_ (er, lstat) {
    if (er && er.code === 'ENOENT')
      return cb()

    var isSym = lstat && lstat.isSymbolicLink()
    self.symlinks[abs] = isSym

    // If it's not a symlink or a dir, then it's definitely a regular file.
    // don't bother doing a readdir in that case.
    if (!isSym && lstat && !lstat.isDirectory()) {
      self.cache[abs] = 'FILE'
      cb()
    } else
      self._readdir(abs, false, cb)
  }
}

Glob.prototype._readdir = function (abs, inGlobStar, cb) {
  if (this.aborted)
    return

  cb = inflight('readdir\0'+abs+'\0'+inGlobStar, cb)
  if (!cb)
    return

  //console.error('RD %j %j', +inGlobStar, abs)
  if (inGlobStar && !ownProp(this.symlinks, abs))
    return this._readdirInGlobStar(abs, cb)

  if (ownProp(this.cache, abs)) {
    var c = this.cache[abs]
    if (!c || c === 'FILE')
      return cb()

    if (Array.isArray(c))
      return cb(null, c)
  }

  var self = this
  self.fs.readdir(abs, readdirCb(this, abs, cb))
}

function readdirCb (self, abs, cb) {
  return function (er, entries) {
    if (er)
      self._readdirError(abs, er, cb)
    else
      self._readdirEntries(abs, entries, cb)
  }
}

Glob.prototype._readdirEntries = function (abs, entries, cb) {
  if (this.aborted)
    return

  // if we haven't asked to stat everything, then just
  // assume that everything in there exists, so we can avoid
  // having to stat it a second time.
  if (!this.mark && !this.stat) {
    for (var i = 0; i < entries.length; i ++) {
      var e = entries[i]
      if (abs === '/')
        e = abs + e
      else
        e = abs + '/' + e
      this.cache[e] = true
    }
  }

  this.cache[abs] = entries
  return cb(null, entries)
}

Glob.prototype._readdirError = function (f, er, cb) {
  if (this.aborted)
    return

  // handle errors, and cache the information
  switch (er.code) {
    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
    case 'ENOTDIR': // totally normal. means it *does* exist.
      var abs = this._makeAbs(f)
      this.cache[abs] = 'FILE'
      if (abs === this.cwdAbs) {
        var error = new Error(er.code + ' invalid cwd ' + this.cwd)
        error.path = this.cwd
        error.code = er.code
        this.emit('error', error)
        this.abort()
      }
      break

    case 'ENOENT': // not terribly unusual
    case 'ELOOP':
    case 'ENAMETOOLONG':
    case 'UNKNOWN':
      this.cache[this._makeAbs(f)] = false
      break

    default: // some unusual error.  Treat as failure.
      this.cache[this._makeAbs(f)] = false
      if (this.strict) {
        this.emit('error', er)
        // If the error is handled, then we abort
        // if not, we threw out of here
        this.abort()
      }
      if (!this.silent)
        console.error('glob error', er)
      break
  }

  return cb()
}

Glob.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar, cb) {
  var self = this
  this._readdir(abs, inGlobStar, function (er, entries) {
    self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb)
  })
}


Glob.prototype._processGlobStar2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {
  //console.error('pgs2', prefix, remain[0], entries)

  // no entries means not a dir, so it can never have matches
  // foo.txt/** doesn't match foo.txt
  if (!entries)
    return cb()

  // test without the globstar, and with every child both below
  // and replacing the globstar.
  var remainWithoutGlobStar = remain.slice(1)
  var gspref = prefix ? [ prefix ] : []
  var noGlobStar = gspref.concat(remainWithoutGlobStar)

  // the noGlobStar pattern exits the inGlobStar state
  this._process(noGlobStar, index, false, cb)

  var isSym = this.symlinks[abs]
  var len = entries.length

  // If it's a symlink, and we're in a globstar, then stop
  if (isSym && inGlobStar)
    return cb()

  for (var i = 0; i < len; i++) {
    var e = entries[i]
    if (e.charAt(0) === '.' && !this.dot)
      continue

    // these two cases enter the inGlobStar state
    var instead = gspref.concat(entries[i], remainWithoutGlobStar)
    this._process(instead, index, true, cb)

    var below = gspref.concat(entries[i], remain)
    this._process(below, index, true, cb)
  }

  cb()
}

Glob.prototype._processSimple = function (prefix, index, cb) {
  // XXX review this.  Shouldn't it be doing the mounting etc
  // before doing stat?  kinda weird?
  var self = this
  this._stat(prefix, function (er, exists) {
    self._processSimple2(prefix, index, er, exists, cb)
  })
}
Glob.prototype._processSimple2 = function (prefix, index, er, exists, cb) {

  //console.error('ps2', prefix, exists)

  if (!this.matches[index])
    this.matches[index] = Object.create(null)

  // If it doesn't exist, then just mark the lack of results
  if (!exists)
    return cb()

  if (prefix && isAbsolute(prefix) && !this.nomount) {
    var trail = /[\/\\]$/.test(prefix)
    if (prefix.charAt(0) === '/') {
      prefix = path.join(this.root, prefix)
    } else {
      prefix = path.resolve(this.root, prefix)
      if (trail)
        prefix += '/'
    }
  }

  if (process.platform === 'win32')
    prefix = prefix.replace(/\\/g, '/')

  // Mark this as a match
  this._emitMatch(index, prefix)
  cb()
}

// Returns either 'DIR', 'FILE', or false
Glob.prototype._stat = function (f, cb) {
  var abs = this._makeAbs(f)
  var needDir = f.slice(-1) === '/'

  if (f.length > this.maxLength)
    return cb()

  if (!this.stat && ownProp(this.cache, abs)) {
    var c = this.cache[abs]

    if (Array.isArray(c))
      c = 'DIR'

    // It exists, but maybe not how we need it
    if (!needDir || c === 'DIR')
      return cb(null, c)

    if (needDir && c === 'FILE')
      return cb()

    // otherwise we have to stat, because maybe c=true
    // if we know it exists, but not what it is.
  }

  var exists
  var stat = this.statCache[abs]
  if (stat !== undefined) {
    if (stat === false)
      return cb(null, stat)
    else {
      var type = stat.isDirectory() ? 'DIR' : 'FILE'
      if (needDir && type === 'FILE')
        return cb()
      else
        return cb(null, type, stat)
    }
  }

  var self = this
  var statcb = inflight('stat\0' + abs, lstatcb_)
  if (statcb)
    self.fs.lstat(abs, statcb)

  function lstatcb_ (er, lstat) {
    if (lstat && lstat.isSymbolicLink()) {
      // If it's a symlink, then treat it as the target, unless
      // the target does not exist, then treat it as a file.
      return self.fs.stat(abs, function (er, stat) {
        if (er)
          self._stat2(f, abs, null, lstat, cb)
        else
          self._stat2(f, abs, er, stat, cb)
      })
    } else {
      self._stat2(f, abs, er, lstat, cb)
    }
  }
}

Glob.prototype._stat2 = function (f, abs, er, stat, cb) {
  if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
    this.statCache[abs] = false
    return cb()
  }

  var needDir = f.slice(-1) === '/'
  this.statCache[abs] = stat

  if (abs.slice(-1) === '/' && stat && !stat.isDirectory())
    return cb(null, false, stat)

  var c = true
  if (stat)
    c = stat.isDirectory() ? 'DIR' : 'FILE'
  this.cache[abs] = this.cache[abs] || c

  if (needDir && c === 'FILE')
    return cb()

  return cb(null, c, stat)
}


/***/ }),

/***/ "./node_modules/glob/sync.js":
/*!***********************************!*\
  !*** ./node_modules/glob/sync.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = globSync
globSync.GlobSync = GlobSync

var rp = __webpack_require__(/*! fs.realpath */ "./node_modules/fs.realpath/index.js")
var minimatch = __webpack_require__(/*! minimatch */ "./node_modules/minimatch/minimatch.js")
var Minimatch = minimatch.Minimatch
var Glob = (__webpack_require__(/*! ./glob.js */ "./node_modules/glob/glob.js").Glob)
var util = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'util'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
var path = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'path'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
var assert = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'assert'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
var isAbsolute = __webpack_require__(/*! path-is-absolute */ "./node_modules/path-is-absolute/index.js")
var common = __webpack_require__(/*! ./common.js */ "./node_modules/glob/common.js")
var setopts = common.setopts
var ownProp = common.ownProp
var childrenIgnored = common.childrenIgnored
var isIgnored = common.isIgnored

function globSync (pattern, options) {
  if (typeof options === 'function' || arguments.length === 3)
    throw new TypeError('callback provided to sync glob\n'+
                        'See: https://github.com/isaacs/node-glob/issues/167')

  return new GlobSync(pattern, options).found
}

function GlobSync (pattern, options) {
  if (!pattern)
    throw new Error('must provide pattern')

  if (typeof options === 'function' || arguments.length === 3)
    throw new TypeError('callback provided to sync glob\n'+
                        'See: https://github.com/isaacs/node-glob/issues/167')

  if (!(this instanceof GlobSync))
    return new GlobSync(pattern, options)

  setopts(this, pattern, options)

  if (this.noprocess)
    return this

  var n = this.minimatch.set.length
  this.matches = new Array(n)
  for (var i = 0; i < n; i ++) {
    this._process(this.minimatch.set[i], i, false)
  }
  this._finish()
}

GlobSync.prototype._finish = function () {
  assert.ok(this instanceof GlobSync)
  if (this.realpath) {
    var self = this
    this.matches.forEach(function (matchset, index) {
      var set = self.matches[index] = Object.create(null)
      for (var p in matchset) {
        try {
          p = self._makeAbs(p)
          var real = rp.realpathSync(p, self.realpathCache)
          set[real] = true
        } catch (er) {
          if (er.syscall === 'stat')
            set[self._makeAbs(p)] = true
          else
            throw er
        }
      }
    })
  }
  common.finish(this)
}


GlobSync.prototype._process = function (pattern, index, inGlobStar) {
  assert.ok(this instanceof GlobSync)

  // Get the first [n] parts of pattern that are all strings.
  var n = 0
  while (typeof pattern[n] === 'string') {
    n ++
  }
  // now n is the index of the first one that is *not* a string.

  // See if there's anything else
  var prefix
  switch (n) {
    // if not, then this is rather simple
    case pattern.length:
      this._processSimple(pattern.join('/'), index)
      return

    case 0:
      // pattern *starts* with some non-trivial item.
      // going to readdir(cwd), but not include the prefix in matches.
      prefix = null
      break

    default:
      // pattern has some string bits in the front.
      // whatever it starts with, whether that's 'absolute' like /foo/bar,
      // or 'relative' like '../baz'
      prefix = pattern.slice(0, n).join('/')
      break
  }

  var remain = pattern.slice(n)

  // get the list of entries.
  var read
  if (prefix === null)
    read = '.'
  else if (isAbsolute(prefix) ||
      isAbsolute(pattern.map(function (p) {
        return typeof p === 'string' ? p : '[*]'
      }).join('/'))) {
    if (!prefix || !isAbsolute(prefix))
      prefix = '/' + prefix
    read = prefix
  } else
    read = prefix

  var abs = this._makeAbs(read)

  //if ignored, skip processing
  if (childrenIgnored(this, read))
    return

  var isGlobStar = remain[0] === minimatch.GLOBSTAR
  if (isGlobStar)
    this._processGlobStar(prefix, read, abs, remain, index, inGlobStar)
  else
    this._processReaddir(prefix, read, abs, remain, index, inGlobStar)
}


GlobSync.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar) {
  var entries = this._readdir(abs, inGlobStar)

  // if the abs isn't a dir, then nothing can match!
  if (!entries)
    return

  // It will only match dot entries if it starts with a dot, or if
  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
  var pn = remain[0]
  var negate = !!this.minimatch.negate
  var rawGlob = pn._glob
  var dotOk = this.dot || rawGlob.charAt(0) === '.'

  var matchedEntries = []
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i]
    if (e.charAt(0) !== '.' || dotOk) {
      var m
      if (negate && !prefix) {
        m = !e.match(pn)
      } else {
        m = e.match(pn)
      }
      if (m)
        matchedEntries.push(e)
    }
  }

  var len = matchedEntries.length
  // If there are no matched entries, then nothing matches.
  if (len === 0)
    return

  // if this is the last remaining pattern bit, then no need for
  // an additional stat *unless* the user has specified mark or
  // stat explicitly.  We know they exist, since readdir returned
  // them.

  if (remain.length === 1 && !this.mark && !this.stat) {
    if (!this.matches[index])
      this.matches[index] = Object.create(null)

    for (var i = 0; i < len; i ++) {
      var e = matchedEntries[i]
      if (prefix) {
        if (prefix.slice(-1) !== '/')
          e = prefix + '/' + e
        else
          e = prefix + e
      }

      if (e.charAt(0) === '/' && !this.nomount) {
        e = path.join(this.root, e)
      }
      this._emitMatch(index, e)
    }
    // This was the last one, and no stats were needed
    return
  }

  // now test all matched entries as stand-ins for that part
  // of the pattern.
  remain.shift()
  for (var i = 0; i < len; i ++) {
    var e = matchedEntries[i]
    var newPattern
    if (prefix)
      newPattern = [prefix, e]
    else
      newPattern = [e]
    this._process(newPattern.concat(remain), index, inGlobStar)
  }
}


GlobSync.prototype._emitMatch = function (index, e) {
  if (isIgnored(this, e))
    return

  var abs = this._makeAbs(e)

  if (this.mark)
    e = this._mark(e)

  if (this.absolute) {
    e = abs
  }

  if (this.matches[index][e])
    return

  if (this.nodir) {
    var c = this.cache[abs]
    if (c === 'DIR' || Array.isArray(c))
      return
  }

  this.matches[index][e] = true

  if (this.stat)
    this._stat(e)
}


GlobSync.prototype._readdirInGlobStar = function (abs) {
  // follow all symlinked directories forever
  // just proceed as if this is a non-globstar situation
  if (this.follow)
    return this._readdir(abs, false)

  var entries
  var lstat
  var stat
  try {
    lstat = this.fs.lstatSync(abs)
  } catch (er) {
    if (er.code === 'ENOENT') {
      // lstat failed, doesn't exist
      return null
    }
  }

  var isSym = lstat && lstat.isSymbolicLink()
  this.symlinks[abs] = isSym

  // If it's not a symlink or a dir, then it's definitely a regular file.
  // don't bother doing a readdir in that case.
  if (!isSym && lstat && !lstat.isDirectory())
    this.cache[abs] = 'FILE'
  else
    entries = this._readdir(abs, false)

  return entries
}

GlobSync.prototype._readdir = function (abs, inGlobStar) {
  var entries

  if (inGlobStar && !ownProp(this.symlinks, abs))
    return this._readdirInGlobStar(abs)

  if (ownProp(this.cache, abs)) {
    var c = this.cache[abs]
    if (!c || c === 'FILE')
      return null

    if (Array.isArray(c))
      return c
  }

  try {
    return this._readdirEntries(abs, this.fs.readdirSync(abs))
  } catch (er) {
    this._readdirError(abs, er)
    return null
  }
}

GlobSync.prototype._readdirEntries = function (abs, entries) {
  // if we haven't asked to stat everything, then just
  // assume that everything in there exists, so we can avoid
  // having to stat it a second time.
  if (!this.mark && !this.stat) {
    for (var i = 0; i < entries.length; i ++) {
      var e = entries[i]
      if (abs === '/')
        e = abs + e
      else
        e = abs + '/' + e
      this.cache[e] = true
    }
  }

  this.cache[abs] = entries

  // mark and cache dir-ness
  return entries
}

GlobSync.prototype._readdirError = function (f, er) {
  // handle errors, and cache the information
  switch (er.code) {
    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
    case 'ENOTDIR': // totally normal. means it *does* exist.
      var abs = this._makeAbs(f)
      this.cache[abs] = 'FILE'
      if (abs === this.cwdAbs) {
        var error = new Error(er.code + ' invalid cwd ' + this.cwd)
        error.path = this.cwd
        error.code = er.code
        throw error
      }
      break

    case 'ENOENT': // not terribly unusual
    case 'ELOOP':
    case 'ENAMETOOLONG':
    case 'UNKNOWN':
      this.cache[this._makeAbs(f)] = false
      break

    default: // some unusual error.  Treat as failure.
      this.cache[this._makeAbs(f)] = false
      if (this.strict)
        throw er
      if (!this.silent)
        console.error('glob error', er)
      break
  }
}

GlobSync.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar) {

  var entries = this._readdir(abs, inGlobStar)

  // no entries means not a dir, so it can never have matches
  // foo.txt/** doesn't match foo.txt
  if (!entries)
    return

  // test without the globstar, and with every child both below
  // and replacing the globstar.
  var remainWithoutGlobStar = remain.slice(1)
  var gspref = prefix ? [ prefix ] : []
  var noGlobStar = gspref.concat(remainWithoutGlobStar)

  // the noGlobStar pattern exits the inGlobStar state
  this._process(noGlobStar, index, false)

  var len = entries.length
  var isSym = this.symlinks[abs]

  // If it's a symlink, and we're in a globstar, then stop
  if (isSym && inGlobStar)
    return

  for (var i = 0; i < len; i++) {
    var e = entries[i]
    if (e.charAt(0) === '.' && !this.dot)
      continue

    // these two cases enter the inGlobStar state
    var instead = gspref.concat(entries[i], remainWithoutGlobStar)
    this._process(instead, index, true)

    var below = gspref.concat(entries[i], remain)
    this._process(below, index, true)
  }
}

GlobSync.prototype._processSimple = function (prefix, index) {
  // XXX review this.  Shouldn't it be doing the mounting etc
  // before doing stat?  kinda weird?
  var exists = this._stat(prefix)

  if (!this.matches[index])
    this.matches[index] = Object.create(null)

  // If it doesn't exist, then just mark the lack of results
  if (!exists)
    return

  if (prefix && isAbsolute(prefix) && !this.nomount) {
    var trail = /[\/\\]$/.test(prefix)
    if (prefix.charAt(0) === '/') {
      prefix = path.join(this.root, prefix)
    } else {
      prefix = path.resolve(this.root, prefix)
      if (trail)
        prefix += '/'
    }
  }

  if (process.platform === 'win32')
    prefix = prefix.replace(/\\/g, '/')

  // Mark this as a match
  this._emitMatch(index, prefix)
}

// Returns either 'DIR', 'FILE', or false
GlobSync.prototype._stat = function (f) {
  var abs = this._makeAbs(f)
  var needDir = f.slice(-1) === '/'

  if (f.length > this.maxLength)
    return false

  if (!this.stat && ownProp(this.cache, abs)) {
    var c = this.cache[abs]

    if (Array.isArray(c))
      c = 'DIR'

    // It exists, but maybe not how we need it
    if (!needDir || c === 'DIR')
      return c

    if (needDir && c === 'FILE')
      return false

    // otherwise we have to stat, because maybe c=true
    // if we know it exists, but not what it is.
  }

  var exists
  var stat = this.statCache[abs]
  if (!stat) {
    var lstat
    try {
      lstat = this.fs.lstatSync(abs)
    } catch (er) {
      if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
        this.statCache[abs] = false
        return false
      }
    }

    if (lstat && lstat.isSymbolicLink()) {
      try {
        stat = this.fs.statSync(abs)
      } catch (er) {
        stat = lstat
      }
    } else {
      stat = lstat
    }
  }

  this.statCache[abs] = stat

  var c = true
  if (stat)
    c = stat.isDirectory() ? 'DIR' : 'FILE'

  this.cache[abs] = this.cache[abs] || c

  if (needDir && c === 'FILE')
    return false

  return c
}

GlobSync.prototype._mark = function (p) {
  return common.mark(this, p)
}

GlobSync.prototype._makeAbs = function (f) {
  return common.makeAbs(this, f)
}


/***/ }),

/***/ "./node_modules/inflight/inflight.js":
/*!*******************************************!*\
  !*** ./node_modules/inflight/inflight.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var wrappy = __webpack_require__(/*! wrappy */ "./node_modules/wrappy/wrappy.js")
var reqs = Object.create(null)
var once = __webpack_require__(/*! once */ "./node_modules/once/once.js")

module.exports = wrappy(inflight)

function inflight (key, cb) {
  if (reqs[key]) {
    reqs[key].push(cb)
    return null
  } else {
    reqs[key] = [cb]
    return makeres(key)
  }
}

function makeres (key) {
  return once(function RES () {
    var cbs = reqs[key]
    var len = cbs.length
    var args = slice(arguments)

    // XXX It's somewhat ambiguous whether a new callback added in this
    // pass should be queued for later execution if something in the
    // list of callbacks throws, or if it should just be discarded.
    // However, it's such an edge case that it hardly matters, and either
    // choice is likely as surprising as the other.
    // As it happens, we do go ahead and schedule it for later execution.
    try {
      for (var i = 0; i < len; i++) {
        cbs[i].apply(null, args)
      }
    } finally {
      if (cbs.length > len) {
        // added more in the interim.
        // de-zalgo, just in case, but don't call again.
        cbs.splice(0, len)
        process.nextTick(function () {
          RES.apply(null, args)
        })
      } else {
        delete reqs[key]
      }
    }
  })
}

function slice (args) {
  var length = args.length
  var array = []

  for (var i = 0; i < length; i++) array[i] = args[i]
  return array
}


/***/ }),

/***/ "./node_modules/inherits/inherits_browser.js":
/*!***************************************************!*\
  !*** ./node_modules/inherits/inherits_browser.js ***!
  \***************************************************/
/***/ ((module) => {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}


/***/ }),

/***/ "./node_modules/minimatch/minimatch.js":
/*!*********************************************!*\
  !*** ./node_modules/minimatch/minimatch.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = minimatch
minimatch.Minimatch = Minimatch

var path = (function () { try { return __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'path'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())) } catch (e) {}}()) || {
  sep: '/'
}
minimatch.sep = path.sep

var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {}
var expand = __webpack_require__(/*! brace-expansion */ "./node_modules/brace-expansion/index.js")

var plTypes = {
  '!': { open: '(?:(?!(?:', close: '))[^/]*?)'},
  '?': { open: '(?:', close: ')?' },
  '+': { open: '(?:', close: ')+' },
  '*': { open: '(?:', close: ')*' },
  '@': { open: '(?:', close: ')' }
}

// any single thing other than /
// don't need to escape / when using new RegExp()
var qmark = '[^/]'

// * => any number of characters
var star = qmark + '*?'

// ** when dots are allowed.  Anything goes, except .. and .
// not (^ or / followed by one or two dots followed by $ or /),
// followed by anything, any number of times.
var twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?'

// not a ^ or / followed by a dot,
// followed by anything, any number of times.
var twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?'

// characters that need to be escaped in RegExp.
var reSpecials = charSet('().*{}+?[]^$\\!')

// "abc" -> { a:true, b:true, c:true }
function charSet (s) {
  return s.split('').reduce(function (set, c) {
    set[c] = true
    return set
  }, {})
}

// normalizes slashes.
var slashSplit = /\/+/

minimatch.filter = filter
function filter (pattern, options) {
  options = options || {}
  return function (p, i, list) {
    return minimatch(p, pattern, options)
  }
}

function ext (a, b) {
  b = b || {}
  var t = {}
  Object.keys(a).forEach(function (k) {
    t[k] = a[k]
  })
  Object.keys(b).forEach(function (k) {
    t[k] = b[k]
  })
  return t
}

minimatch.defaults = function (def) {
  if (!def || typeof def !== 'object' || !Object.keys(def).length) {
    return minimatch
  }

  var orig = minimatch

  var m = function minimatch (p, pattern, options) {
    return orig(p, pattern, ext(def, options))
  }

  m.Minimatch = function Minimatch (pattern, options) {
    return new orig.Minimatch(pattern, ext(def, options))
  }
  m.Minimatch.defaults = function defaults (options) {
    return orig.defaults(ext(def, options)).Minimatch
  }

  m.filter = function filter (pattern, options) {
    return orig.filter(pattern, ext(def, options))
  }

  m.defaults = function defaults (options) {
    return orig.defaults(ext(def, options))
  }

  m.makeRe = function makeRe (pattern, options) {
    return orig.makeRe(pattern, ext(def, options))
  }

  m.braceExpand = function braceExpand (pattern, options) {
    return orig.braceExpand(pattern, ext(def, options))
  }

  m.match = function (list, pattern, options) {
    return orig.match(list, pattern, ext(def, options))
  }

  return m
}

Minimatch.defaults = function (def) {
  return minimatch.defaults(def).Minimatch
}

function minimatch (p, pattern, options) {
  assertValidPattern(pattern)

  if (!options) options = {}

  // shortcut: comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    return false
  }

  return new Minimatch(pattern, options).match(p)
}

function Minimatch (pattern, options) {
  if (!(this instanceof Minimatch)) {
    return new Minimatch(pattern, options)
  }

  assertValidPattern(pattern)

  if (!options) options = {}

  pattern = pattern.trim()

  // windows support: need to use /, not \
  if (!options.allowWindowsEscape && path.sep !== '/') {
    pattern = pattern.split(path.sep).join('/')
  }

  this.options = options
  this.set = []
  this.pattern = pattern
  this.regexp = null
  this.negate = false
  this.comment = false
  this.empty = false
  this.partial = !!options.partial

  // make the set of regexps etc.
  this.make()
}

Minimatch.prototype.debug = function () {}

Minimatch.prototype.make = make
function make () {
  var pattern = this.pattern
  var options = this.options

  // empty patterns and comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    this.comment = true
    return
  }
  if (!pattern) {
    this.empty = true
    return
  }

  // step 1: figure out negation, etc.
  this.parseNegate()

  // step 2: expand braces
  var set = this.globSet = this.braceExpand()

  if (options.debug) this.debug = function debug() { console.error.apply(console, arguments) }

  this.debug(this.pattern, set)

  // step 3: now we have a set, so turn each one into a series of path-portion
  // matching patterns.
  // These will be regexps, except in the case of "**", which is
  // set to the GLOBSTAR object for globstar behavior,
  // and will not contain any / characters
  set = this.globParts = set.map(function (s) {
    return s.split(slashSplit)
  })

  this.debug(this.pattern, set)

  // glob --> regexps
  set = set.map(function (s, si, set) {
    return s.map(this.parse, this)
  }, this)

  this.debug(this.pattern, set)

  // filter out everything that didn't compile properly.
  set = set.filter(function (s) {
    return s.indexOf(false) === -1
  })

  this.debug(this.pattern, set)

  this.set = set
}

Minimatch.prototype.parseNegate = parseNegate
function parseNegate () {
  var pattern = this.pattern
  var negate = false
  var options = this.options
  var negateOffset = 0

  if (options.nonegate) return

  for (var i = 0, l = pattern.length
    ; i < l && pattern.charAt(i) === '!'
    ; i++) {
    negate = !negate
    negateOffset++
  }

  if (negateOffset) this.pattern = pattern.substr(negateOffset)
  this.negate = negate
}

// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
minimatch.braceExpand = function (pattern, options) {
  return braceExpand(pattern, options)
}

Minimatch.prototype.braceExpand = braceExpand

function braceExpand (pattern, options) {
  if (!options) {
    if (this instanceof Minimatch) {
      options = this.options
    } else {
      options = {}
    }
  }

  pattern = typeof pattern === 'undefined'
    ? this.pattern : pattern

  assertValidPattern(pattern)

  // Thanks to Yeting Li <https://github.com/yetingli> for
  // improving this regexp to avoid a ReDOS vulnerability.
  if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
    // shortcut. no need to expand.
    return [pattern]
  }

  return expand(pattern)
}

var MAX_PATTERN_LENGTH = 1024 * 64
var assertValidPattern = function (pattern) {
  if (typeof pattern !== 'string') {
    throw new TypeError('invalid pattern')
  }

  if (pattern.length > MAX_PATTERN_LENGTH) {
    throw new TypeError('pattern is too long')
  }
}

// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
Minimatch.prototype.parse = parse
var SUBPARSE = {}
function parse (pattern, isSub) {
  assertValidPattern(pattern)

  var options = this.options

  // shortcuts
  if (pattern === '**') {
    if (!options.noglobstar)
      return GLOBSTAR
    else
      pattern = '*'
  }
  if (pattern === '') return ''

  var re = ''
  var hasMagic = !!options.nocase
  var escaping = false
  // ? => one single character
  var patternListStack = []
  var negativeLists = []
  var stateChar
  var inClass = false
  var reClassStart = -1
  var classStart = -1
  // . and .. never match anything that doesn't start with .,
  // even when options.dot is set.
  var patternStart = pattern.charAt(0) === '.' ? '' // anything
  // not (start or / followed by . or .. followed by / or end)
  : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))'
  : '(?!\\.)'
  var self = this

  function clearStateChar () {
    if (stateChar) {
      // we had some state-tracking character
      // that wasn't consumed by this pass.
      switch (stateChar) {
        case '*':
          re += star
          hasMagic = true
        break
        case '?':
          re += qmark
          hasMagic = true
        break
        default:
          re += '\\' + stateChar
        break
      }
      self.debug('clearStateChar %j %j', stateChar, re)
      stateChar = false
    }
  }

  for (var i = 0, len = pattern.length, c
    ; (i < len) && (c = pattern.charAt(i))
    ; i++) {
    this.debug('%s\t%s %s %j', pattern, i, re, c)

    // skip over any that are escaped.
    if (escaping && reSpecials[c]) {
      re += '\\' + c
      escaping = false
      continue
    }

    switch (c) {
      /* istanbul ignore next */
      case '/': {
        // completely not allowed, even escaped.
        // Should already be path-split by now.
        return false
      }

      case '\\':
        clearStateChar()
        escaping = true
      continue

      // the various stateChar values
      // for the "extglob" stuff.
      case '?':
      case '*':
      case '+':
      case '@':
      case '!':
        this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c)

        // all of those are literals inside a class, except that
        // the glob [!a] means [^a] in regexp
        if (inClass) {
          this.debug('  in class')
          if (c === '!' && i === classStart + 1) c = '^'
          re += c
          continue
        }

        // if we already have a stateChar, then it means
        // that there was something like ** or +? in there.
        // Handle the stateChar, then proceed with this one.
        self.debug('call clearStateChar %j', stateChar)
        clearStateChar()
        stateChar = c
        // if extglob is disabled, then +(asdf|foo) isn't a thing.
        // just clear the statechar *now*, rather than even diving into
        // the patternList stuff.
        if (options.noext) clearStateChar()
      continue

      case '(':
        if (inClass) {
          re += '('
          continue
        }

        if (!stateChar) {
          re += '\\('
          continue
        }

        patternListStack.push({
          type: stateChar,
          start: i - 1,
          reStart: re.length,
          open: plTypes[stateChar].open,
          close: plTypes[stateChar].close
        })
        // negation is (?:(?!js)[^/]*)
        re += stateChar === '!' ? '(?:(?!(?:' : '(?:'
        this.debug('plType %j %j', stateChar, re)
        stateChar = false
      continue

      case ')':
        if (inClass || !patternListStack.length) {
          re += '\\)'
          continue
        }

        clearStateChar()
        hasMagic = true
        var pl = patternListStack.pop()
        // negation is (?:(?!js)[^/]*)
        // The others are (?:<pattern>)<type>
        re += pl.close
        if (pl.type === '!') {
          negativeLists.push(pl)
        }
        pl.reEnd = re.length
      continue

      case '|':
        if (inClass || !patternListStack.length || escaping) {
          re += '\\|'
          escaping = false
          continue
        }

        clearStateChar()
        re += '|'
      continue

      // these are mostly the same in regexp and glob
      case '[':
        // swallow any state-tracking char before the [
        clearStateChar()

        if (inClass) {
          re += '\\' + c
          continue
        }

        inClass = true
        classStart = i
        reClassStart = re.length
        re += c
      continue

      case ']':
        //  a right bracket shall lose its special
        //  meaning and represent itself in
        //  a bracket expression if it occurs
        //  first in the list.  -- POSIX.2 2.8.3.2
        if (i === classStart + 1 || !inClass) {
          re += '\\' + c
          escaping = false
          continue
        }

        // handle the case where we left a class open.
        // "[z-a]" is valid, equivalent to "\[z-a\]"
        // split where the last [ was, make sure we don't have
        // an invalid re. if so, re-walk the contents of the
        // would-be class to re-translate any characters that
        // were passed through as-is
        // TODO: It would probably be faster to determine this
        // without a try/catch and a new RegExp, but it's tricky
        // to do safely.  For now, this is safe and works.
        var cs = pattern.substring(classStart + 1, i)
        try {
          RegExp('[' + cs + ']')
        } catch (er) {
          // not a valid class!
          var sp = this.parse(cs, SUBPARSE)
          re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]'
          hasMagic = hasMagic || sp[1]
          inClass = false
          continue
        }

        // finish up the class.
        hasMagic = true
        inClass = false
        re += c
      continue

      default:
        // swallow any state char that wasn't consumed
        clearStateChar()

        if (escaping) {
          // no need
          escaping = false
        } else if (reSpecials[c]
          && !(c === '^' && inClass)) {
          re += '\\'
        }

        re += c

    } // switch
  } // for

  // handle the case where we left a class open.
  // "[abc" is valid, equivalent to "\[abc"
  if (inClass) {
    // split where the last [ was, and escape it
    // this is a huge pita.  We now have to re-walk
    // the contents of the would-be class to re-translate
    // any characters that were passed through as-is
    cs = pattern.substr(classStart + 1)
    sp = this.parse(cs, SUBPARSE)
    re = re.substr(0, reClassStart) + '\\[' + sp[0]
    hasMagic = hasMagic || sp[1]
  }

  // handle the case where we had a +( thing at the *end*
  // of the pattern.
  // each pattern list stack adds 3 chars, and we need to go through
  // and escape any | chars that were passed through as-is for the regexp.
  // Go through and escape them, taking care not to double-escape any
  // | chars that were already escaped.
  for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
    var tail = re.slice(pl.reStart + pl.open.length)
    this.debug('setting tail', re, pl)
    // maybe some even number of \, then maybe 1 \, followed by a |
    tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function (_, $1, $2) {
      if (!$2) {
        // the | isn't already escaped, so escape it.
        $2 = '\\'
      }

      // need to escape all those slashes *again*, without escaping the
      // one that we need for escaping the | character.  As it works out,
      // escaping an even number of slashes can be done by simply repeating
      // it exactly after itself.  That's why this trick works.
      //
      // I am sorry that you have to see this.
      return $1 + $1 + $2 + '|'
    })

    this.debug('tail=%j\n   %s', tail, tail, pl, re)
    var t = pl.type === '*' ? star
      : pl.type === '?' ? qmark
      : '\\' + pl.type

    hasMagic = true
    re = re.slice(0, pl.reStart) + t + '\\(' + tail
  }

  // handle trailing things that only matter at the very end.
  clearStateChar()
  if (escaping) {
    // trailing \\
    re += '\\\\'
  }

  // only need to apply the nodot start if the re starts with
  // something that could conceivably capture a dot
  var addPatternStart = false
  switch (re.charAt(0)) {
    case '[': case '.': case '(': addPatternStart = true
  }

  // Hack to work around lack of negative lookbehind in JS
  // A pattern like: *.!(x).!(y|z) needs to ensure that a name
  // like 'a.xyz.yz' doesn't match.  So, the first negative
  // lookahead, has to look ALL the way ahead, to the end of
  // the pattern.
  for (var n = negativeLists.length - 1; n > -1; n--) {
    var nl = negativeLists[n]

    var nlBefore = re.slice(0, nl.reStart)
    var nlFirst = re.slice(nl.reStart, nl.reEnd - 8)
    var nlLast = re.slice(nl.reEnd - 8, nl.reEnd)
    var nlAfter = re.slice(nl.reEnd)

    nlLast += nlAfter

    // Handle nested stuff like *(*.js|!(*.json)), where open parens
    // mean that we should *not* include the ) in the bit that is considered
    // "after" the negated section.
    var openParensBefore = nlBefore.split('(').length - 1
    var cleanAfter = nlAfter
    for (i = 0; i < openParensBefore; i++) {
      cleanAfter = cleanAfter.replace(/\)[+*?]?/, '')
    }
    nlAfter = cleanAfter

    var dollar = ''
    if (nlAfter === '' && isSub !== SUBPARSE) {
      dollar = '$'
    }
    var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast
    re = newRe
  }

  // if the re is not "" at this point, then we need to make sure
  // it doesn't match against an empty path part.
  // Otherwise a/* will match a/, which it should not.
  if (re !== '' && hasMagic) {
    re = '(?=.)' + re
  }

  if (addPatternStart) {
    re = patternStart + re
  }

  // parsing just a piece of a larger pattern.
  if (isSub === SUBPARSE) {
    return [re, hasMagic]
  }

  // skip the regexp for non-magical patterns
  // unescape anything in it, though, so that it'll be
  // an exact match against a file etc.
  if (!hasMagic) {
    return globUnescape(pattern)
  }

  var flags = options.nocase ? 'i' : ''
  try {
    var regExp = new RegExp('^' + re + '$', flags)
  } catch (er) /* istanbul ignore next - should be impossible */ {
    // If it was an invalid regular expression, then it can't match
    // anything.  This trick looks for a character after the end of
    // the string, which is of course impossible, except in multi-line
    // mode, but it's not a /m regex.
    return new RegExp('$.')
  }

  regExp._glob = pattern
  regExp._src = re

  return regExp
}

minimatch.makeRe = function (pattern, options) {
  return new Minimatch(pattern, options || {}).makeRe()
}

Minimatch.prototype.makeRe = makeRe
function makeRe () {
  if (this.regexp || this.regexp === false) return this.regexp

  // at this point, this.set is a 2d array of partial
  // pattern strings, or "**".
  //
  // It's better to use .match().  This function shouldn't
  // be used, really, but it's pretty convenient sometimes,
  // when you just want to work with a regex.
  var set = this.set

  if (!set.length) {
    this.regexp = false
    return this.regexp
  }
  var options = this.options

  var twoStar = options.noglobstar ? star
    : options.dot ? twoStarDot
    : twoStarNoDot
  var flags = options.nocase ? 'i' : ''

  var re = set.map(function (pattern) {
    return pattern.map(function (p) {
      return (p === GLOBSTAR) ? twoStar
      : (typeof p === 'string') ? regExpEscape(p)
      : p._src
    }).join('\\\/')
  }).join('|')

  // must match entire pattern
  // ending in a * or ** will make it less strict.
  re = '^(?:' + re + ')$'

  // can match anything, as long as it's not this.
  if (this.negate) re = '^(?!' + re + ').*$'

  try {
    this.regexp = new RegExp(re, flags)
  } catch (ex) /* istanbul ignore next - should be impossible */ {
    this.regexp = false
  }
  return this.regexp
}

minimatch.match = function (list, pattern, options) {
  options = options || {}
  var mm = new Minimatch(pattern, options)
  list = list.filter(function (f) {
    return mm.match(f)
  })
  if (mm.options.nonull && !list.length) {
    list.push(pattern)
  }
  return list
}

Minimatch.prototype.match = function match (f, partial) {
  if (typeof partial === 'undefined') partial = this.partial
  this.debug('match', f, this.pattern)
  // short-circuit in the case of busted things.
  // comments, etc.
  if (this.comment) return false
  if (this.empty) return f === ''

  if (f === '/' && partial) return true

  var options = this.options

  // windows: need to use /, not \
  if (path.sep !== '/') {
    f = f.split(path.sep).join('/')
  }

  // treat the test path as a set of pathparts.
  f = f.split(slashSplit)
  this.debug(this.pattern, 'split', f)

  // just ONE of the pattern sets in this.set needs to match
  // in order for it to be valid.  If negating, then just one
  // match means that we have failed.
  // Either way, return on the first hit.

  var set = this.set
  this.debug(this.pattern, 'set', set)

  // Find the basename of the path by looking for the last non-empty segment
  var filename
  var i
  for (i = f.length - 1; i >= 0; i--) {
    filename = f[i]
    if (filename) break
  }

  for (i = 0; i < set.length; i++) {
    var pattern = set[i]
    var file = f
    if (options.matchBase && pattern.length === 1) {
      file = [filename]
    }
    var hit = this.matchOne(file, pattern, partial)
    if (hit) {
      if (options.flipNegate) return true
      return !this.negate
    }
  }

  // didn't get any hits.  this is success if it's a negative
  // pattern, failure otherwise.
  if (options.flipNegate) return false
  return this.negate
}

// set partial to true to test if, for example,
// "/a/b" matches the start of "/*/b/*/d"
// Partial means, if you run out of file before you run
// out of pattern, then that's fine, as long as all
// the parts match.
Minimatch.prototype.matchOne = function (file, pattern, partial) {
  var options = this.options

  this.debug('matchOne',
    { 'this': this, file: file, pattern: pattern })

  this.debug('matchOne', file.length, pattern.length)

  for (var fi = 0,
      pi = 0,
      fl = file.length,
      pl = pattern.length
      ; (fi < fl) && (pi < pl)
      ; fi++, pi++) {
    this.debug('matchOne loop')
    var p = pattern[pi]
    var f = file[fi]

    this.debug(pattern, p, f)

    // should be impossible.
    // some invalid regexp stuff in the set.
    /* istanbul ignore if */
    if (p === false) return false

    if (p === GLOBSTAR) {
      this.debug('GLOBSTAR', [pattern, p, f])

      // "**"
      // a/**/b/**/c would match the following:
      // a/b/x/y/z/c
      // a/x/y/z/b/c
      // a/b/x/b/x/c
      // a/b/c
      // To do this, take the rest of the pattern after
      // the **, and see if it would match the file remainder.
      // If so, return success.
      // If not, the ** "swallows" a segment, and try again.
      // This is recursively awful.
      //
      // a/**/b/**/c matching a/b/x/y/z/c
      // - a matches a
      // - doublestar
      //   - matchOne(b/x/y/z/c, b/**/c)
      //     - b matches b
      //     - doublestar
      //       - matchOne(x/y/z/c, c) -> no
      //       - matchOne(y/z/c, c) -> no
      //       - matchOne(z/c, c) -> no
      //       - matchOne(c, c) yes, hit
      var fr = fi
      var pr = pi + 1
      if (pr === pl) {
        this.debug('** at the end')
        // a ** at the end will just swallow the rest.
        // We have found a match.
        // however, it will not swallow /.x, unless
        // options.dot is set.
        // . and .. are *never* matched by **, for explosively
        // exponential reasons.
        for (; fi < fl; fi++) {
          if (file[fi] === '.' || file[fi] === '..' ||
            (!options.dot && file[fi].charAt(0) === '.')) return false
        }
        return true
      }

      // ok, let's see if we can swallow whatever we can.
      while (fr < fl) {
        var swallowee = file[fr]

        this.debug('\nglobstar while', file, fr, pattern, pr, swallowee)

        // XXX remove this slice.  Just pass the start index.
        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
          this.debug('globstar found match!', fr, fl, swallowee)
          // found a match.
          return true
        } else {
          // can't swallow "." or ".." ever.
          // can only swallow ".foo" when explicitly asked.
          if (swallowee === '.' || swallowee === '..' ||
            (!options.dot && swallowee.charAt(0) === '.')) {
            this.debug('dot detected!', file, fr, pattern, pr)
            break
          }

          // ** swallows a segment, and continue.
          this.debug('globstar swallow a segment, and continue')
          fr++
        }
      }

      // no match was found.
      // However, in partial mode, we can't say this is necessarily over.
      // If there's more *pattern* left, then
      /* istanbul ignore if */
      if (partial) {
        // ran out of file
        this.debug('\n>>> no match, partial?', file, fr, pattern, pr)
        if (fr === fl) return true
      }
      return false
    }

    // something other than **
    // non-magic patterns just have to match exactly
    // patterns with magic have been turned into regexps.
    var hit
    if (typeof p === 'string') {
      hit = f === p
      this.debug('string match', p, f, hit)
    } else {
      hit = f.match(p)
      this.debug('pattern match', p, f, hit)
    }

    if (!hit) return false
  }

  // Note: ending in / means that we'll get a final ""
  // at the end of the pattern.  This can only match a
  // corresponding "" at the end of the file.
  // If the file ends in /, then it can only match a
  // a pattern that ends in /, unless the pattern just
  // doesn't have any more for it. But, a/b/ should *not*
  // match "a/b/*", even though "" matches against the
  // [^/]*? pattern, except in partial mode, where it might
  // simply not be reached yet.
  // However, a/b/ should still satisfy a/*

  // now either we fell off the end of the pattern, or we're done.
  if (fi === fl && pi === pl) {
    // ran out of pattern and filename at the same time.
    // an exact hit!
    return true
  } else if (fi === fl) {
    // ran out of file, but still had pattern left.
    // this is ok if we're doing the match as part of
    // a glob fs traversal.
    return partial
  } else /* istanbul ignore else */ if (pi === pl) {
    // ran out of pattern, still have file left.
    // this is only acceptable if we're on the very last
    // empty segment of a file with a trailing slash.
    // a/* should match a/b/
    return (fi === fl - 1) && (file[fi] === '')
  }

  // should be unreachable.
  /* istanbul ignore next */
  throw new Error('wtf?')
}

// replace stuff like \* with *
function globUnescape (s) {
  return s.replace(/\\(.)/g, '$1')
}

function regExpEscape (s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}


/***/ }),

/***/ "./node_modules/once/once.js":
/*!***********************************!*\
  !*** ./node_modules/once/once.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var wrappy = __webpack_require__(/*! wrappy */ "./node_modules/wrappy/wrappy.js")
module.exports = wrappy(once)
module.exports.strict = wrappy(onceStrict)

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  })
})

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  f.called = false
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  var name = fn.name || 'Function wrapped with `once`'
  f.onceError = name + " shouldn't be called more than once"
  f.called = false
  return f
}


/***/ }),

/***/ "./node_modules/path-is-absolute/index.js":
/*!************************************************!*\
  !*** ./node_modules/path-is-absolute/index.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


function posix(path) {
	return path.charAt(0) === '/';
}

function win32(path) {
	// https://github.com/nodejs/node/blob/b3fcc245fb25539909ef1d5eaa01dbf92e168633/lib/path.js#L56
	var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
	var result = splitDeviceRe.exec(path);
	var device = result[1] || '';
	var isUnc = Boolean(device && device.charAt(1) !== ':');

	// UNC paths are always absolute
	return Boolean(result[2] || isUnc);
}

module.exports = process.platform === 'win32' ? win32 : posix;
module.exports.posix = posix;
module.exports.win32 = win32;


/***/ }),

/***/ "./node_modules/rimraf/rimraf.js":
/*!***************************************!*\
  !*** ./node_modules/rimraf/rimraf.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const assert = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'assert'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
const path = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'path'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
const fs = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'fs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
let glob = undefined
try {
  glob = __webpack_require__(/*! glob */ "./node_modules/glob/glob.js")
} catch (_err) {
  // treat glob as optional.
}

const defaultGlobOpts = {
  nosort: true,
  silent: true
}

// for EMFILE handling
let timeout = 0

const isWindows = (process.platform === "win32")

const defaults = options => {
  const methods = [
    'unlink',
    'chmod',
    'stat',
    'lstat',
    'rmdir',
    'readdir'
  ]
  methods.forEach(m => {
    options[m] = options[m] || fs[m]
    m = m + 'Sync'
    options[m] = options[m] || fs[m]
  })

  options.maxBusyTries = options.maxBusyTries || 3
  options.emfileWait = options.emfileWait || 1000
  if (options.glob === false) {
    options.disableGlob = true
  }
  if (options.disableGlob !== true && glob === undefined) {
    throw Error('glob dependency not found, set `options.disableGlob = true` if intentional')
  }
  options.disableGlob = options.disableGlob || false
  options.glob = options.glob || defaultGlobOpts
}

const rimraf = (p, options, cb) => {
  if (typeof options === 'function') {
    cb = options
    options = {}
  }

  assert(p, 'rimraf: missing path')
  assert.equal(typeof p, 'string', 'rimraf: path should be a string')
  assert.equal(typeof cb, 'function', 'rimraf: callback function required')
  assert(options, 'rimraf: invalid options argument provided')
  assert.equal(typeof options, 'object', 'rimraf: options should be object')

  defaults(options)

  let busyTries = 0
  let errState = null
  let n = 0

  const next = (er) => {
    errState = errState || er
    if (--n === 0)
      cb(errState)
  }

  const afterGlob = (er, results) => {
    if (er)
      return cb(er)

    n = results.length
    if (n === 0)
      return cb()

    results.forEach(p => {
      const CB = (er) => {
        if (er) {
          if ((er.code === "EBUSY" || er.code === "ENOTEMPTY" || er.code === "EPERM") &&
              busyTries < options.maxBusyTries) {
            busyTries ++
            // try again, with the same exact callback as this one.
            return setTimeout(() => rimraf_(p, options, CB), busyTries * 100)
          }

          // this one won't happen if graceful-fs is used.
          if (er.code === "EMFILE" && timeout < options.emfileWait) {
            return setTimeout(() => rimraf_(p, options, CB), timeout ++)
          }

          // already gone
          if (er.code === "ENOENT") er = null
        }

        timeout = 0
        next(er)
      }
      rimraf_(p, options, CB)
    })
  }

  if (options.disableGlob || !glob.hasMagic(p))
    return afterGlob(null, [p])

  options.lstat(p, (er, stat) => {
    if (!er)
      return afterGlob(null, [p])

    glob(p, options.glob, afterGlob)
  })

}

// Two possible strategies.
// 1. Assume it's a file.  unlink it, then do the dir stuff on EPERM or EISDIR
// 2. Assume it's a directory.  readdir, then do the file stuff on ENOTDIR
//
// Both result in an extra syscall when you guess wrong.  However, there
// are likely far more normal files in the world than directories.  This
// is based on the assumption that a the average number of files per
// directory is >= 1.
//
// If anyone ever complains about this, then I guess the strategy could
// be made configurable somehow.  But until then, YAGNI.
const rimraf_ = (p, options, cb) => {
  assert(p)
  assert(options)
  assert(typeof cb === 'function')

  // sunos lets the root user unlink directories, which is... weird.
  // so we have to lstat here and make sure it's not a dir.
  options.lstat(p, (er, st) => {
    if (er && er.code === "ENOENT")
      return cb(null)

    // Windows can EPERM on stat.  Life is suffering.
    if (er && er.code === "EPERM" && isWindows)
      fixWinEPERM(p, options, er, cb)

    if (st && st.isDirectory())
      return rmdir(p, options, er, cb)

    options.unlink(p, er => {
      if (er) {
        if (er.code === "ENOENT")
          return cb(null)
        if (er.code === "EPERM")
          return (isWindows)
            ? fixWinEPERM(p, options, er, cb)
            : rmdir(p, options, er, cb)
        if (er.code === "EISDIR")
          return rmdir(p, options, er, cb)
      }
      return cb(er)
    })
  })
}

const fixWinEPERM = (p, options, er, cb) => {
  assert(p)
  assert(options)
  assert(typeof cb === 'function')

  options.chmod(p, 0o666, er2 => {
    if (er2)
      cb(er2.code === "ENOENT" ? null : er)
    else
      options.stat(p, (er3, stats) => {
        if (er3)
          cb(er3.code === "ENOENT" ? null : er)
        else if (stats.isDirectory())
          rmdir(p, options, er, cb)
        else
          options.unlink(p, cb)
      })
  })
}

const fixWinEPERMSync = (p, options, er) => {
  assert(p)
  assert(options)

  try {
    options.chmodSync(p, 0o666)
  } catch (er2) {
    if (er2.code === "ENOENT")
      return
    else
      throw er
  }

  let stats
  try {
    stats = options.statSync(p)
  } catch (er3) {
    if (er3.code === "ENOENT")
      return
    else
      throw er
  }

  if (stats.isDirectory())
    rmdirSync(p, options, er)
  else
    options.unlinkSync(p)
}

const rmdir = (p, options, originalEr, cb) => {
  assert(p)
  assert(options)
  assert(typeof cb === 'function')

  // try to rmdir first, and only readdir on ENOTEMPTY or EEXIST (SunOS)
  // if we guessed wrong, and it's not a directory, then
  // raise the original error.
  options.rmdir(p, er => {
    if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM"))
      rmkids(p, options, cb)
    else if (er && er.code === "ENOTDIR")
      cb(originalEr)
    else
      cb(er)
  })
}

const rmkids = (p, options, cb) => {
  assert(p)
  assert(options)
  assert(typeof cb === 'function')

  options.readdir(p, (er, files) => {
    if (er)
      return cb(er)
    let n = files.length
    if (n === 0)
      return options.rmdir(p, cb)
    let errState
    files.forEach(f => {
      rimraf(path.join(p, f), options, er => {
        if (errState)
          return
        if (er)
          return cb(errState = er)
        if (--n === 0)
          options.rmdir(p, cb)
      })
    })
  })
}

// this looks simpler, and is strictly *faster*, but will
// tie up the JavaScript thread and fail on excessively
// deep directory trees.
const rimrafSync = (p, options) => {
  options = options || {}
  defaults(options)

  assert(p, 'rimraf: missing path')
  assert.equal(typeof p, 'string', 'rimraf: path should be a string')
  assert(options, 'rimraf: missing options')
  assert.equal(typeof options, 'object', 'rimraf: options should be object')

  let results

  if (options.disableGlob || !glob.hasMagic(p)) {
    results = [p]
  } else {
    try {
      options.lstatSync(p)
      results = [p]
    } catch (er) {
      results = glob.sync(p, options.glob)
    }
  }

  if (!results.length)
    return

  for (let i = 0; i < results.length; i++) {
    const p = results[i]

    let st
    try {
      st = options.lstatSync(p)
    } catch (er) {
      if (er.code === "ENOENT")
        return

      // Windows can EPERM on stat.  Life is suffering.
      if (er.code === "EPERM" && isWindows)
        fixWinEPERMSync(p, options, er)
    }

    try {
      // sunos lets the root user unlink directories, which is... weird.
      if (st && st.isDirectory())
        rmdirSync(p, options, null)
      else
        options.unlinkSync(p)
    } catch (er) {
      if (er.code === "ENOENT")
        return
      if (er.code === "EPERM")
        return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er)
      if (er.code !== "EISDIR")
        throw er

      rmdirSync(p, options, er)
    }
  }
}

const rmdirSync = (p, options, originalEr) => {
  assert(p)
  assert(options)

  try {
    options.rmdirSync(p)
  } catch (er) {
    if (er.code === "ENOENT")
      return
    if (er.code === "ENOTDIR")
      throw originalEr
    if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")
      rmkidsSync(p, options)
  }
}

const rmkidsSync = (p, options) => {
  assert(p)
  assert(options)
  options.readdirSync(p).forEach(f => rimrafSync(path.join(p, f), options))

  // We only end up here once we got ENOTEMPTY at least once, and
  // at this point, we are guaranteed to have removed all the kids.
  // So, we know that it won't be ENOENT or ENOTDIR or anything else.
  // try really hard to delete stuff on windows, because it has a
  // PROFOUNDLY annoying habit of not closing handles promptly when
  // files are deleted, resulting in spurious ENOTEMPTY errors.
  const retries = isWindows ? 100 : 1
  let i = 0
  do {
    let threw = true
    try {
      const ret = options.rmdirSync(p, options)
      threw = false
      return ret
    } finally {
      if (++i < retries && threw)
        continue
    }
  } while (true)
}

module.exports = rimraf
rimraf.sync = rimrafSync


/***/ }),

/***/ "./node_modules/tmp-promise/index.js":
/*!*******************************************!*\
  !*** ./node_modules/tmp-promise/index.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { promisify } = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'util'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const tmp = __webpack_require__(/*! tmp */ "./node_modules/tmp/lib/tmp.js");

// file
module.exports.fileSync = tmp.fileSync;
const fileWithOptions = promisify((options, cb) =>
  tmp.file(options, (err, path, fd, cleanup) =>
    err ? cb(err) : cb(undefined, { path, fd, cleanup: promisify(cleanup) })
  )
);
module.exports.file = async (options) => fileWithOptions(options);

module.exports.withFile = async function withFile(fn, options) {
  const { path, fd, cleanup } = await module.exports.file(options);
  try {
    return await fn({ path, fd });
  } finally {
    await cleanup();
  }
};


// directory
module.exports.dirSync = tmp.dirSync;
const dirWithOptions = promisify((options, cb) =>
  tmp.dir(options, (err, path, cleanup) =>
    err ? cb(err) : cb(undefined, { path, cleanup: promisify(cleanup) })
  )
);
module.exports.dir = async (options) => dirWithOptions(options);

module.exports.withDir = async function withDir(fn, options) {
  const { path, cleanup } = await module.exports.dir(options);
  try {
    return await fn({ path });
  } finally {
    await cleanup();
  }
};


// name generation
module.exports.tmpNameSync = tmp.tmpNameSync;
module.exports.tmpName = promisify(tmp.tmpName);

module.exports.tmpdir = tmp.tmpdir;

module.exports.setGracefulCleanup = tmp.setGracefulCleanup;


/***/ }),

/***/ "./node_modules/tmp/lib/tmp.js":
/*!*************************************!*\
  !*** ./node_modules/tmp/lib/tmp.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*!
 * Tmp
 *
 * Copyright (c) 2011-2017 KARASZI Istvan <github@spam.raszi.hu>
 *
 * MIT Licensed
 */

/*
 * Module dependencies.
 */
const fs = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'fs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const os = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'os'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const path = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'path'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const crypto = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'crypto'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const _c = { fs: fs.constants, os: os.constants };
const rimraf = __webpack_require__(/*! rimraf */ "./node_modules/rimraf/rimraf.js");

/*
 * The working inner variables.
 */
const
  // the random characters to choose from
  RANDOM_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',

  TEMPLATE_PATTERN = /XXXXXX/,

  DEFAULT_TRIES = 3,

  CREATE_FLAGS = (_c.O_CREAT || _c.fs.O_CREAT) | (_c.O_EXCL || _c.fs.O_EXCL) | (_c.O_RDWR || _c.fs.O_RDWR),

  // constants are off on the windows platform and will not match the actual errno codes
  IS_WIN32 = os.platform() === 'win32',
  EBADF = _c.EBADF || _c.os.errno.EBADF,
  ENOENT = _c.ENOENT || _c.os.errno.ENOENT,

  DIR_MODE = 0o700 /* 448 */,
  FILE_MODE = 0o600 /* 384 */,

  EXIT = 'exit',

  // this will hold the objects need to be removed on exit
  _removeObjects = [],

  // API change in fs.rmdirSync leads to error when passing in a second parameter, e.g. the callback
  FN_RMDIR_SYNC = fs.rmdirSync.bind(fs),
  FN_RIMRAF_SYNC = rimraf.sync;

let
  _gracefulCleanup = false;

/**
 * Gets a temporary file name.
 *
 * @param {(Options|tmpNameCallback)} options options or callback
 * @param {?tmpNameCallback} callback the callback function
 */
function tmpName(options, callback) {
  const
    args = _parseArguments(options, callback),
    opts = args[0],
    cb = args[1];

  try {
    _assertAndSanitizeOptions(opts);
  } catch (err) {
    return cb(err);
  }

  let tries = opts.tries;
  (function _getUniqueName() {
    try {
      const name = _generateTmpName(opts);

      // check whether the path exists then retry if needed
      fs.stat(name, function (err) {
        /* istanbul ignore else */
        if (!err) {
          /* istanbul ignore else */
          if (tries-- > 0) return _getUniqueName();

          return cb(new Error('Could not get a unique tmp filename, max tries reached ' + name));
        }

        cb(null, name);
      });
    } catch (err) {
      cb(err);
    }
  }());
}

/**
 * Synchronous version of tmpName.
 *
 * @param {Object} options
 * @returns {string} the generated random name
 * @throws {Error} if the options are invalid or could not generate a filename
 */
function tmpNameSync(options) {
  const
    args = _parseArguments(options),
    opts = args[0];

  _assertAndSanitizeOptions(opts);

  let tries = opts.tries;
  do {
    const name = _generateTmpName(opts);
    try {
      fs.statSync(name);
    } catch (e) {
      return name;
    }
  } while (tries-- > 0);

  throw new Error('Could not get a unique tmp filename, max tries reached');
}

/**
 * Creates and opens a temporary file.
 *
 * @param {(Options|null|undefined|fileCallback)} options the config options or the callback function or null or undefined
 * @param {?fileCallback} callback
 */
function file(options, callback) {
  const
    args = _parseArguments(options, callback),
    opts = args[0],
    cb = args[1];

  // gets a temporary filename
  tmpName(opts, function _tmpNameCreated(err, name) {
    /* istanbul ignore else */
    if (err) return cb(err);

    // create and open the file
    fs.open(name, CREATE_FLAGS, opts.mode || FILE_MODE, function _fileCreated(err, fd) {
      /* istanbu ignore else */
      if (err) return cb(err);

      if (opts.discardDescriptor) {
        return fs.close(fd, function _discardCallback(possibleErr) {
          // the chance of getting an error on close here is rather low and might occur in the most edgiest cases only
          return cb(possibleErr, name, undefined, _prepareTmpFileRemoveCallback(name, -1, opts, false));
        });
      } else {
        // detachDescriptor passes the descriptor whereas discardDescriptor closes it, either way, we no longer care
        // about the descriptor
        const discardOrDetachDescriptor = opts.discardDescriptor || opts.detachDescriptor;
        cb(null, name, fd, _prepareTmpFileRemoveCallback(name, discardOrDetachDescriptor ? -1 : fd, opts, false));
      }
    });
  });
}

/**
 * Synchronous version of file.
 *
 * @param {Options} options
 * @returns {FileSyncObject} object consists of name, fd and removeCallback
 * @throws {Error} if cannot create a file
 */
function fileSync(options) {
  const
    args = _parseArguments(options),
    opts = args[0];

  const discardOrDetachDescriptor = opts.discardDescriptor || opts.detachDescriptor;
  const name = tmpNameSync(opts);
  var fd = fs.openSync(name, CREATE_FLAGS, opts.mode || FILE_MODE);
  /* istanbul ignore else */
  if (opts.discardDescriptor) {
    fs.closeSync(fd);
    fd = undefined;
  }

  return {
    name: name,
    fd: fd,
    removeCallback: _prepareTmpFileRemoveCallback(name, discardOrDetachDescriptor ? -1 : fd, opts, true)
  };
}

/**
 * Creates a temporary directory.
 *
 * @param {(Options|dirCallback)} options the options or the callback function
 * @param {?dirCallback} callback
 */
function dir(options, callback) {
  const
    args = _parseArguments(options, callback),
    opts = args[0],
    cb = args[1];

  // gets a temporary filename
  tmpName(opts, function _tmpNameCreated(err, name) {
    /* istanbul ignore else */
    if (err) return cb(err);

    // create the directory
    fs.mkdir(name, opts.mode || DIR_MODE, function _dirCreated(err) {
      /* istanbul ignore else */
      if (err) return cb(err);

      cb(null, name, _prepareTmpDirRemoveCallback(name, opts, false));
    });
  });
}

/**
 * Synchronous version of dir.
 *
 * @param {Options} options
 * @returns {DirSyncObject} object consists of name and removeCallback
 * @throws {Error} if it cannot create a directory
 */
function dirSync(options) {
  const
    args = _parseArguments(options),
    opts = args[0];

  const name = tmpNameSync(opts);
  fs.mkdirSync(name, opts.mode || DIR_MODE);

  return {
    name: name,
    removeCallback: _prepareTmpDirRemoveCallback(name, opts, true)
  };
}

/**
 * Removes files asynchronously.
 *
 * @param {Object} fdPath
 * @param {Function} next
 * @private
 */
function _removeFileAsync(fdPath, next) {
  const _handler = function (err) {
    if (err && !_isENOENT(err)) {
      // reraise any unanticipated error
      return next(err);
    }
    next();
  };

  if (0 <= fdPath[0])
    fs.close(fdPath[0], function () {
      fs.unlink(fdPath[1], _handler);
    });
  else fs.unlink(fdPath[1], _handler);
}

/**
 * Removes files synchronously.
 *
 * @param {Object} fdPath
 * @private
 */
function _removeFileSync(fdPath) {
  let rethrownException = null;
  try {
    if (0 <= fdPath[0]) fs.closeSync(fdPath[0]);
  } catch (e) {
    // reraise any unanticipated error
    if (!_isEBADF(e) && !_isENOENT(e)) throw e;
  } finally {
    try {
      fs.unlinkSync(fdPath[1]);
    }
    catch (e) {
      // reraise any unanticipated error
      if (!_isENOENT(e)) rethrownException = e;
    }
  }
  if (rethrownException !== null) {
    throw rethrownException;
  }
}

/**
 * Prepares the callback for removal of the temporary file.
 *
 * Returns either a sync callback or a async callback depending on whether
 * fileSync or file was called, which is expressed by the sync parameter.
 *
 * @param {string} name the path of the file
 * @param {number} fd file descriptor
 * @param {Object} opts
 * @param {boolean} sync
 * @returns {fileCallback | fileCallbackSync}
 * @private
 */
function _prepareTmpFileRemoveCallback(name, fd, opts, sync) {
  const removeCallbackSync = _prepareRemoveCallback(_removeFileSync, [fd, name], sync);
  const removeCallback = _prepareRemoveCallback(_removeFileAsync, [fd, name], sync, removeCallbackSync);

  if (!opts.keep) _removeObjects.unshift(removeCallbackSync);

  return sync ? removeCallbackSync : removeCallback;
}

/**
 * Prepares the callback for removal of the temporary directory.
 *
 * Returns either a sync callback or a async callback depending on whether
 * tmpFileSync or tmpFile was called, which is expressed by the sync parameter.
 *
 * @param {string} name
 * @param {Object} opts
 * @param {boolean} sync
 * @returns {Function} the callback
 * @private
 */
function _prepareTmpDirRemoveCallback(name, opts, sync) {
  const removeFunction = opts.unsafeCleanup ? rimraf : fs.rmdir.bind(fs);
  const removeFunctionSync = opts.unsafeCleanup ? FN_RIMRAF_SYNC : FN_RMDIR_SYNC;
  const removeCallbackSync = _prepareRemoveCallback(removeFunctionSync, name, sync);
  const removeCallback = _prepareRemoveCallback(removeFunction, name, sync, removeCallbackSync);
  if (!opts.keep) _removeObjects.unshift(removeCallbackSync);

  return sync ? removeCallbackSync : removeCallback;
}

/**
 * Creates a guarded function wrapping the removeFunction call.
 *
 * The cleanup callback is save to be called multiple times.
 * Subsequent invocations will be ignored.
 *
 * @param {Function} removeFunction
 * @param {string} fileOrDirName
 * @param {boolean} sync
 * @param {cleanupCallbackSync?} cleanupCallbackSync
 * @returns {cleanupCallback | cleanupCallbackSync}
 * @private
 */
function _prepareRemoveCallback(removeFunction, fileOrDirName, sync, cleanupCallbackSync) {
  let called = false;

  // if sync is true, the next parameter will be ignored
  return function _cleanupCallback(next) {

    /* istanbul ignore else */
    if (!called) {
      // remove cleanupCallback from cache
      const toRemove = cleanupCallbackSync || _cleanupCallback;
      const index = _removeObjects.indexOf(toRemove);
      /* istanbul ignore else */
      if (index >= 0) _removeObjects.splice(index, 1);

      called = true;
      if (sync || removeFunction === FN_RMDIR_SYNC || removeFunction === FN_RIMRAF_SYNC) {
        return removeFunction(fileOrDirName);
      } else {
        return removeFunction(fileOrDirName, next || function() {});
      }
    }
  };
}

/**
 * The garbage collector.
 *
 * @private
 */
function _garbageCollector() {
  /* istanbul ignore else */
  if (!_gracefulCleanup) return;

  // the function being called removes itself from _removeObjects,
  // loop until _removeObjects is empty
  while (_removeObjects.length) {
    try {
      _removeObjects[0]();
    } catch (e) {
      // already removed?
    }
  }
}

/**
 * Random name generator based on crypto.
 * Adapted from http://blog.tompawlak.org/how-to-generate-random-values-nodejs-javascript
 *
 * @param {number} howMany
 * @returns {string} the generated random name
 * @private
 */
function _randomChars(howMany) {
  let
    value = [],
    rnd = null;

  // make sure that we do not fail because we ran out of entropy
  try {
    rnd = crypto.randomBytes(howMany);
  } catch (e) {
    rnd = crypto.pseudoRandomBytes(howMany);
  }

  for (var i = 0; i < howMany; i++) {
    value.push(RANDOM_CHARS[rnd[i] % RANDOM_CHARS.length]);
  }

  return value.join('');
}

/**
 * Helper which determines whether a string s is blank, that is undefined, or empty or null.
 *
 * @private
 * @param {string} s
 * @returns {Boolean} true whether the string s is blank, false otherwise
 */
function _isBlank(s) {
  return s === null || _isUndefined(s) || !s.trim();
}

/**
 * Checks whether the `obj` parameter is defined or not.
 *
 * @param {Object} obj
 * @returns {boolean} true if the object is undefined
 * @private
 */
function _isUndefined(obj) {
  return typeof obj === 'undefined';
}

/**
 * Parses the function arguments.
 *
 * This function helps to have optional arguments.
 *
 * @param {(Options|null|undefined|Function)} options
 * @param {?Function} callback
 * @returns {Array} parsed arguments
 * @private
 */
function _parseArguments(options, callback) {
  /* istanbul ignore else */
  if (typeof options === 'function') {
    return [{}, options];
  }

  /* istanbul ignore else */
  if (_isUndefined(options)) {
    return [{}, callback];
  }

  // copy options so we do not leak the changes we make internally
  const actualOptions = {};
  for (const key of Object.getOwnPropertyNames(options)) {
    actualOptions[key] = options[key];
  }

  return [actualOptions, callback];
}

/**
 * Generates a new temporary name.
 *
 * @param {Object} opts
 * @returns {string} the new random name according to opts
 * @private
 */
function _generateTmpName(opts) {

  const tmpDir = opts.tmpdir;

  /* istanbul ignore else */
  if (!_isUndefined(opts.name))
    return path.join(tmpDir, opts.dir, opts.name);

  /* istanbul ignore else */
  if (!_isUndefined(opts.template))
    return path.join(tmpDir, opts.dir, opts.template).replace(TEMPLATE_PATTERN, _randomChars(6));

  // prefix and postfix
  const name = [
    opts.prefix ? opts.prefix : 'tmp',
    '-',
    process.pid,
    '-',
    _randomChars(12),
    opts.postfix ? '-' + opts.postfix : ''
  ].join('');

  return path.join(tmpDir, opts.dir, name);
}

/**
 * Asserts whether the specified options are valid, also sanitizes options and provides sane defaults for missing
 * options.
 *
 * @param {Options} options
 * @private
 */
function _assertAndSanitizeOptions(options) {

  options.tmpdir = _getTmpDir(options);

  const tmpDir = options.tmpdir;

  /* istanbul ignore else */
  if (!_isUndefined(options.name))
    _assertIsRelative(options.name, 'name', tmpDir);
  /* istanbul ignore else */
  if (!_isUndefined(options.dir))
    _assertIsRelative(options.dir, 'dir', tmpDir);
  /* istanbul ignore else */
  if (!_isUndefined(options.template)) {
    _assertIsRelative(options.template, 'template', tmpDir);
    if (!options.template.match(TEMPLATE_PATTERN))
      throw new Error(`Invalid template, found "${options.template}".`);
  }
  /* istanbul ignore else */
  if (!_isUndefined(options.tries) && isNaN(options.tries) || options.tries < 0)
    throw new Error(`Invalid tries, found "${options.tries}".`);

  // if a name was specified we will try once
  options.tries = _isUndefined(options.name) ? options.tries || DEFAULT_TRIES : 1;
  options.keep = !!options.keep;
  options.detachDescriptor = !!options.detachDescriptor;
  options.discardDescriptor = !!options.discardDescriptor;
  options.unsafeCleanup = !!options.unsafeCleanup;

  // sanitize dir, also keep (multiple) blanks if the user, purportedly sane, requests us to
  options.dir = _isUndefined(options.dir) ? '' : path.relative(tmpDir, _resolvePath(options.dir, tmpDir));
  options.template = _isUndefined(options.template) ? undefined : path.relative(tmpDir, _resolvePath(options.template, tmpDir));
  // sanitize further if template is relative to options.dir
  options.template = _isBlank(options.template) ? undefined : path.relative(options.dir, options.template);

  // for completeness' sake only, also keep (multiple) blanks if the user, purportedly sane, requests us to
  options.name = _isUndefined(options.name) ? undefined : _sanitizeName(options.name);
  options.prefix = _isUndefined(options.prefix) ? '' : options.prefix;
  options.postfix = _isUndefined(options.postfix) ? '' : options.postfix;
}

/**
 * Resolve the specified path name in respect to tmpDir.
 *
 * The specified name might include relative path components, e.g. ../
 * so we need to resolve in order to be sure that is is located inside tmpDir
 *
 * @param name
 * @param tmpDir
 * @returns {string}
 * @private
 */
function _resolvePath(name, tmpDir) {
  const sanitizedName = _sanitizeName(name);
  if (sanitizedName.startsWith(tmpDir)) {
    return path.resolve(sanitizedName);
  } else {
    return path.resolve(path.join(tmpDir, sanitizedName));
  }
}

/**
 * Sanitize the specified path name by removing all quote characters.
 *
 * @param name
 * @returns {string}
 * @private
 */
function _sanitizeName(name) {
  if (_isBlank(name)) {
    return name;
  }
  return name.replace(/["']/g, '');
}

/**
 * Asserts whether specified name is relative to the specified tmpDir.
 *
 * @param {string} name
 * @param {string} option
 * @param {string} tmpDir
 * @throws {Error}
 * @private
 */
function _assertIsRelative(name, option, tmpDir) {
  if (option === 'name') {
    // assert that name is not absolute and does not contain a path
    if (path.isAbsolute(name))
      throw new Error(`${option} option must not contain an absolute path, found "${name}".`);
    // must not fail on valid .<name> or ..<name> or similar such constructs
    let basename = path.basename(name);
    if (basename === '..' || basename === '.' || basename !== name)
      throw new Error(`${option} option must not contain a path, found "${name}".`);
  }
  else { // if (option === 'dir' || option === 'template') {
    // assert that dir or template are relative to tmpDir
    if (path.isAbsolute(name) && !name.startsWith(tmpDir)) {
      throw new Error(`${option} option must be relative to "${tmpDir}", found "${name}".`);
    }
    let resolvedPath = _resolvePath(name, tmpDir);
    if (!resolvedPath.startsWith(tmpDir))
      throw new Error(`${option} option must be relative to "${tmpDir}", found "${resolvedPath}".`);
  }
}

/**
 * Helper for testing against EBADF to compensate changes made to Node 7.x under Windows.
 *
 * @private
 */
function _isEBADF(error) {
  return _isExpectedError(error, -EBADF, 'EBADF');
}

/**
 * Helper for testing against ENOENT to compensate changes made to Node 7.x under Windows.
 *
 * @private
 */
function _isENOENT(error) {
  return _isExpectedError(error, -ENOENT, 'ENOENT');
}

/**
 * Helper to determine whether the expected error code matches the actual code and errno,
 * which will differ between the supported node versions.
 *
 * - Node >= 7.0:
 *   error.code {string}
 *   error.errno {number} any numerical value will be negated
 *
 * CAVEAT
 *
 * On windows, the errno for EBADF is -4083 but os.constants.errno.EBADF is different and we must assume that ENOENT
 * is no different here.
 *
 * @param {SystemError} error
 * @param {number} errno
 * @param {string} code
 * @private
 */
function _isExpectedError(error, errno, code) {
  return IS_WIN32 ? error.code === code : error.code === code && error.errno === errno;
}

/**
 * Sets the graceful cleanup.
 *
 * If graceful cleanup is set, tmp will remove all controlled temporary objects on process exit, otherwise the
 * temporary objects will remain in place, waiting to be cleaned up on system restart or otherwise scheduled temporary
 * object removals.
 */
function setGracefulCleanup() {
  _gracefulCleanup = true;
}

/**
 * Returns the currently configured tmp dir from os.tmpdir().
 *
 * @private
 * @param {?Options} options
 * @returns {string} the currently configured tmp dir
 */
function _getTmpDir(options) {
  return path.resolve(_sanitizeName(options && options.tmpdir || os.tmpdir()));
}

// Install process exit listener
process.addListener(EXIT, _garbageCollector);

/**
 * Configuration options.
 *
 * @typedef {Object} Options
 * @property {?boolean} keep the temporary object (file or dir) will not be garbage collected
 * @property {?number} tries the number of tries before give up the name generation
 * @property (?int) mode the access mode, defaults are 0o700 for directories and 0o600 for files
 * @property {?string} template the "mkstemp" like filename template
 * @property {?string} name fixed name relative to tmpdir or the specified dir option
 * @property {?string} dir tmp directory relative to the root tmp directory in use
 * @property {?string} prefix prefix for the generated name
 * @property {?string} postfix postfix for the generated name
 * @property {?string} tmpdir the root tmp directory which overrides the os tmpdir
 * @property {?boolean} unsafeCleanup recursively removes the created temporary directory, even when it's not empty
 * @property {?boolean} detachDescriptor detaches the file descriptor, caller is responsible for closing the file, tmp will no longer try closing the file during garbage collection
 * @property {?boolean} discardDescriptor discards the file descriptor (closes file, fd is -1), tmp will no longer try closing the file during garbage collection
 */

/**
 * @typedef {Object} FileSyncObject
 * @property {string} name the name of the file
 * @property {string} fd the file descriptor or -1 if the fd has been discarded
 * @property {fileCallback} removeCallback the callback function to remove the file
 */

/**
 * @typedef {Object} DirSyncObject
 * @property {string} name the name of the directory
 * @property {fileCallback} removeCallback the callback function to remove the directory
 */

/**
 * @callback tmpNameCallback
 * @param {?Error} err the error object if anything goes wrong
 * @param {string} name the temporary file name
 */

/**
 * @callback fileCallback
 * @param {?Error} err the error object if anything goes wrong
 * @param {string} name the temporary file name
 * @param {number} fd the file descriptor or -1 if the fd had been discarded
 * @param {cleanupCallback} fn the cleanup callback function
 */

/**
 * @callback fileCallbackSync
 * @param {?Error} err the error object if anything goes wrong
 * @param {string} name the temporary file name
 * @param {number} fd the file descriptor or -1 if the fd had been discarded
 * @param {cleanupCallbackSync} fn the cleanup callback function
 */

/**
 * @callback dirCallback
 * @param {?Error} err the error object if anything goes wrong
 * @param {string} name the temporary file name
 * @param {cleanupCallback} fn the cleanup callback function
 */

/**
 * @callback dirCallbackSync
 * @param {?Error} err the error object if anything goes wrong
 * @param {string} name the temporary file name
 * @param {cleanupCallbackSync} fn the cleanup callback function
 */

/**
 * Removes the temporary created file or directory.
 *
 * @callback cleanupCallback
 * @param {simpleCallback} [next] function to call whenever the tmp object needs to be removed
 */

/**
 * Removes the temporary created file or directory.
 *
 * @callback cleanupCallbackSync
 */

/**
 * Callback function for function composition.
 * @see {@link https://github.com/raszi/node-tmp/issues/57|raszi/node-tmp#57}
 *
 * @callback simpleCallback
 */

// exporting all the needed methods

// evaluate _getTmpDir() lazily, mainly for simplifying testing but it also will
// allow users to reconfigure the temporary directory
Object.defineProperty(module.exports, "tmpdir", ({
  enumerable: true,
  configurable: false,
  get: function () {
    return _getTmpDir();
  }
}));

module.exports.dir = dir;
module.exports.dirSync = dirSync;

module.exports.file = file;
module.exports.fileSync = fileSync;

module.exports.tmpName = tmpName;
module.exports.tmpNameSync = tmpNameSync;

module.exports.setGracefulCleanup = setGracefulCleanup;


/***/ }),

/***/ "./src/containerScan.ts":
/*!******************************!*\
  !*** ./src/containerScan.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
//#!/usr/bin/env node

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.runScan = void 0;
const core = __importStar(__webpack_require__(/*! @actions/core */ "./node_modules/@actions/core/lib/core.js"));
const artifact = __importStar(__webpack_require__(/*! @actions/artifact */ "./node_modules/@actions/artifact/lib/artifact-client.js"));
const child_process_1 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'child_process'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const process_1 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'process'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
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


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core = __importStar(__webpack_require__(/*! @actions/core */ "./node_modules/@actions/core/lib/core.js"));
const containerScan_1 = __webpack_require__(/*! ./containerScan */ "./src/containerScan.ts");
const vid = core.getInput("vid", { required: true });
const vkey = core.getInput("vkey", { required: true });
const path = core.getInput("path", { required: true });
const format = core.getInput("format", { required: true });
const scanType = core.getInput("scanType", { required: true });
const exportfile = core.getInput("export", { required: true });
(0, containerScan_1.runScan)(vid, vkey, path, format, scanType, exportfile);


/***/ }),

/***/ "./node_modules/tunnel/index.js":
/*!**************************************!*\
  !*** ./node_modules/tunnel/index.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/tunnel */ "./node_modules/tunnel/lib/tunnel.js");


/***/ }),

/***/ "./node_modules/tunnel/lib/tunnel.js":
/*!*******************************************!*\
  !*** ./node_modules/tunnel/lib/tunnel.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var net = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'net'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
var tls = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'tls'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
var http = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'http'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
var https = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'https'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
var events = __webpack_require__(/*! events */ "./node_modules/events/events.js");
var assert = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'assert'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
var util = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'util'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


exports.httpOverHttp = httpOverHttp;
exports.httpsOverHttp = httpsOverHttp;
exports.httpOverHttps = httpOverHttps;
exports.httpsOverHttps = httpsOverHttps;


function httpOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  return agent;
}

function httpsOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}

function httpOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  return agent;
}

function httpsOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}


function TunnelingAgent(options) {
  var self = this;
  self.options = options || {};
  self.proxyOptions = self.options.proxy || {};
  self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets;
  self.requests = [];
  self.sockets = [];

  self.on('free', function onFree(socket, host, port, localAddress) {
    var options = toOptions(host, port, localAddress);
    for (var i = 0, len = self.requests.length; i < len; ++i) {
      var pending = self.requests[i];
      if (pending.host === options.host && pending.port === options.port) {
        // Detect the request to connect same origin server,
        // reuse the connection.
        self.requests.splice(i, 1);
        pending.request.onSocket(socket);
        return;
      }
    }
    socket.destroy();
    self.removeSocket(socket);
  });
}
util.inherits(TunnelingAgent, events.EventEmitter);

TunnelingAgent.prototype.addRequest = function addRequest(req, host, port, localAddress) {
  var self = this;
  var options = mergeOptions({request: req}, self.options, toOptions(host, port, localAddress));

  if (self.sockets.length >= this.maxSockets) {
    // We are over limit so we'll add it to the queue.
    self.requests.push(options);
    return;
  }

  // If we are under maxSockets create a new one.
  self.createSocket(options, function(socket) {
    socket.on('free', onFree);
    socket.on('close', onCloseOrRemove);
    socket.on('agentRemove', onCloseOrRemove);
    req.onSocket(socket);

    function onFree() {
      self.emit('free', socket, options);
    }

    function onCloseOrRemove(err) {
      self.removeSocket(socket);
      socket.removeListener('free', onFree);
      socket.removeListener('close', onCloseOrRemove);
      socket.removeListener('agentRemove', onCloseOrRemove);
    }
  });
};

TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
  var self = this;
  var placeholder = {};
  self.sockets.push(placeholder);

  var connectOptions = mergeOptions({}, self.proxyOptions, {
    method: 'CONNECT',
    path: options.host + ':' + options.port,
    agent: false,
    headers: {
      host: options.host + ':' + options.port
    }
  });
  if (options.localAddress) {
    connectOptions.localAddress = options.localAddress;
  }
  if (connectOptions.proxyAuth) {
    connectOptions.headers = connectOptions.headers || {};
    connectOptions.headers['Proxy-Authorization'] = 'Basic ' +
        new Buffer(connectOptions.proxyAuth).toString('base64');
  }

  debug('making CONNECT request');
  var connectReq = self.request(connectOptions);
  connectReq.useChunkedEncodingByDefault = false; // for v0.6
  connectReq.once('response', onResponse); // for v0.6
  connectReq.once('upgrade', onUpgrade);   // for v0.6
  connectReq.once('connect', onConnect);   // for v0.7 or later
  connectReq.once('error', onError);
  connectReq.end();

  function onResponse(res) {
    // Very hacky. This is necessary to avoid http-parser leaks.
    res.upgrade = true;
  }

  function onUpgrade(res, socket, head) {
    // Hacky.
    process.nextTick(function() {
      onConnect(res, socket, head);
    });
  }

  function onConnect(res, socket, head) {
    connectReq.removeAllListeners();
    socket.removeAllListeners();

    if (res.statusCode !== 200) {
      debug('tunneling socket could not be established, statusCode=%d',
        res.statusCode);
      socket.destroy();
      var error = new Error('tunneling socket could not be established, ' +
        'statusCode=' + res.statusCode);
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    if (head.length > 0) {
      debug('got illegal response body from proxy');
      socket.destroy();
      var error = new Error('got illegal response body from proxy');
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    debug('tunneling connection has established');
    self.sockets[self.sockets.indexOf(placeholder)] = socket;
    return cb(socket);
  }

  function onError(cause) {
    connectReq.removeAllListeners();

    debug('tunneling socket could not be established, cause=%s\n',
          cause.message, cause.stack);
    var error = new Error('tunneling socket could not be established, ' +
                          'cause=' + cause.message);
    error.code = 'ECONNRESET';
    options.request.emit('error', error);
    self.removeSocket(placeholder);
  }
};

TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
  var pos = this.sockets.indexOf(socket)
  if (pos === -1) {
    return;
  }
  this.sockets.splice(pos, 1);

  var pending = this.requests.shift();
  if (pending) {
    // If we have pending requests and a socket gets closed a new one
    // needs to be created to take over in the pool for the one that closed.
    this.createSocket(pending, function(socket) {
      pending.request.onSocket(socket);
    });
  }
};

function createSecureSocket(options, cb) {
  var self = this;
  TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
    var hostHeader = options.request.getHeader('host');
    var tlsOptions = mergeOptions({}, self.options, {
      socket: socket,
      servername: hostHeader ? hostHeader.replace(/:.*$/, '') : options.host
    });

    // 0 is dummy port for v0.6
    var secureSocket = tls.connect(0, tlsOptions);
    self.sockets[self.sockets.indexOf(socket)] = secureSocket;
    cb(secureSocket);
  });
}


function toOptions(host, port, localAddress) {
  if (typeof host === 'string') { // since v0.10
    return {
      host: host,
      port: port,
      localAddress: localAddress
    };
  }
  return host; // for v0.11 or later
}

function mergeOptions(target) {
  for (var i = 1, len = arguments.length; i < len; ++i) {
    var overrides = arguments[i];
    if (typeof overrides === 'object') {
      var keys = Object.keys(overrides);
      for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
        var k = keys[j];
        if (overrides[k] !== undefined) {
          target[k] = overrides[k];
        }
      }
    }
  }
  return target;
}


var debug;
if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
  debug = function() {
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] === 'string') {
      args[0] = 'TUNNEL: ' + args[0];
    } else {
      args.unshift('TUNNEL:');
    }
    console.error.apply(console, args);
  }
} else {
  debug = function() {};
}
exports.debug = debug; // for test


/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NIL": () => (/* reexport safe */ _nil_js__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   "parse": () => (/* reexport safe */ _parse_js__WEBPACK_IMPORTED_MODULE_8__["default"]),
/* harmony export */   "stringify": () => (/* reexport safe */ _stringify_js__WEBPACK_IMPORTED_MODULE_7__["default"]),
/* harmony export */   "v1": () => (/* reexport safe */ _v1_js__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   "v3": () => (/* reexport safe */ _v3_js__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   "v4": () => (/* reexport safe */ _v4_js__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   "v5": () => (/* reexport safe */ _v5_js__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   "validate": () => (/* reexport safe */ _validate_js__WEBPACK_IMPORTED_MODULE_6__["default"]),
/* harmony export */   "version": () => (/* reexport safe */ _version_js__WEBPACK_IMPORTED_MODULE_5__["default"])
/* harmony export */ });
/* harmony import */ var _v1_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./v1.js */ "./node_modules/uuid/dist/esm-browser/v1.js");
/* harmony import */ var _v3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./v3.js */ "./node_modules/uuid/dist/esm-browser/v3.js");
/* harmony import */ var _v4_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./v4.js */ "./node_modules/uuid/dist/esm-browser/v4.js");
/* harmony import */ var _v5_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./v5.js */ "./node_modules/uuid/dist/esm-browser/v5.js");
/* harmony import */ var _nil_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./nil.js */ "./node_modules/uuid/dist/esm-browser/nil.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./version.js */ "./node_modules/uuid/dist/esm-browser/version.js");
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/esm-browser/validate.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/esm-browser/stringify.js");
/* harmony import */ var _parse_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./parse.js */ "./node_modules/uuid/dist/esm-browser/parse.js");










/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/md5.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/md5.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/*
 * Browser-compatible JavaScript MD5
 *
 * Modification of JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */
function md5(bytes) {
  if (typeof bytes === 'string') {
    var msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

    bytes = new Uint8Array(msg.length);

    for (var i = 0; i < msg.length; ++i) {
      bytes[i] = msg.charCodeAt(i);
    }
  }

  return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
}
/*
 * Convert an array of little-endian words to an array of bytes
 */


function md5ToHexEncodedArray(input) {
  var output = [];
  var length32 = input.length * 32;
  var hexTab = '0123456789abcdef';

  for (var i = 0; i < length32; i += 8) {
    var x = input[i >> 5] >>> i % 32 & 0xff;
    var hex = parseInt(hexTab.charAt(x >>> 4 & 0x0f) + hexTab.charAt(x & 0x0f), 16);
    output.push(hex);
  }

  return output;
}
/**
 * Calculate output length with padding and bit length
 */


function getOutputLength(inputLength8) {
  return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
}
/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */


function wordsToMd5(x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << len % 32;
  x[getOutputLength(len) - 1] = len;
  var a = 1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d = 271733878;

  for (var i = 0; i < x.length; i += 16) {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    a = md5ff(a, b, c, d, x[i], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  return [a, b, c, d];
}
/*
 * Convert an array bytes to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */


function bytesToWords(input) {
  if (input.length === 0) {
    return [];
  }

  var length8 = input.length * 8;
  var output = new Uint32Array(getOutputLength(length8));

  for (var i = 0; i < length8; i += 8) {
    output[i >> 5] |= (input[i / 8] & 0xff) << i % 32;
  }

  return output;
}
/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */


function safeAdd(x, y) {
  var lsw = (x & 0xffff) + (y & 0xffff);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 0xffff;
}
/*
 * Bitwise rotate a 32-bit number to the left.
 */


function bitRotateLeft(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}
/*
 * These functions implement the four basic operations the algorithm uses.
 */


function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}

function md5ff(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
}

function md5gg(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
}

function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}

function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (md5);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/nil.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/nil.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ('00000000-0000-0000-0000-000000000000');

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/parse.js":
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/parse.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/esm-browser/validate.js");


function parse(uuid) {
  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
    throw TypeError('Invalid UUID');
  }

  var v;
  var arr = new Uint8Array(16); // Parse ########-....-....-....-............

  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 0xff;
  arr[2] = v >>> 8 & 0xff;
  arr[3] = v & 0xff; // Parse ........-####-....-....-............

  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 0xff; // Parse ........-....-####-....-............

  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 0xff; // Parse ........-....-....-####-............

  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 0xff; // Parse ........-....-....-....-############
  // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)

  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000 & 0xff;
  arr[11] = v / 0x100000000 & 0xff;
  arr[12] = v >>> 24 & 0xff;
  arr[13] = v >>> 16 & 0xff;
  arr[14] = v >>> 8 & 0xff;
  arr[15] = v & 0xff;
  return arr;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (parse);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/regex.js":
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/regex.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/rng.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/rng.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rng)
/* harmony export */ });
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
    // find the complete implementation of crypto (msCrypto) on IE11.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/sha1.js":
/*!****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/sha1.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Adapted from Chris Veness' SHA1 code at
// http://www.movable-type.co.uk/scripts/sha1.html
function f(s, x, y, z) {
  switch (s) {
    case 0:
      return x & y ^ ~x & z;

    case 1:
      return x ^ y ^ z;

    case 2:
      return x & y ^ x & z ^ y & z;

    case 3:
      return x ^ y ^ z;
  }
}

function ROTL(x, n) {
  return x << n | x >>> 32 - n;
}

function sha1(bytes) {
  var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
  var H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];

  if (typeof bytes === 'string') {
    var msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

    bytes = [];

    for (var i = 0; i < msg.length; ++i) {
      bytes.push(msg.charCodeAt(i));
    }
  } else if (!Array.isArray(bytes)) {
    // Convert Array-like to Array
    bytes = Array.prototype.slice.call(bytes);
  }

  bytes.push(0x80);
  var l = bytes.length / 4 + 2;
  var N = Math.ceil(l / 16);
  var M = new Array(N);

  for (var _i = 0; _i < N; ++_i) {
    var arr = new Uint32Array(16);

    for (var j = 0; j < 16; ++j) {
      arr[j] = bytes[_i * 64 + j * 4] << 24 | bytes[_i * 64 + j * 4 + 1] << 16 | bytes[_i * 64 + j * 4 + 2] << 8 | bytes[_i * 64 + j * 4 + 3];
    }

    M[_i] = arr;
  }

  M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = (bytes.length - 1) * 8 & 0xffffffff;

  for (var _i2 = 0; _i2 < N; ++_i2) {
    var W = new Uint32Array(80);

    for (var t = 0; t < 16; ++t) {
      W[t] = M[_i2][t];
    }

    for (var _t = 16; _t < 80; ++_t) {
      W[_t] = ROTL(W[_t - 3] ^ W[_t - 8] ^ W[_t - 14] ^ W[_t - 16], 1);
    }

    var a = H[0];
    var b = H[1];
    var c = H[2];
    var d = H[3];
    var e = H[4];

    for (var _t2 = 0; _t2 < 80; ++_t2) {
      var s = Math.floor(_t2 / 20);
      var T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[_t2] >>> 0;
      e = d;
      d = c;
      c = ROTL(b, 30) >>> 0;
      b = a;
      a = T;
    }

    H[0] = H[0] + a >>> 0;
    H[1] = H[1] + b >>> 0;
    H[2] = H[2] + c >>> 0;
    H[3] = H[3] + d >>> 0;
    H[4] = H[4] + e >>> 0;
  }

  return [H[0] >> 24 & 0xff, H[0] >> 16 & 0xff, H[0] >> 8 & 0xff, H[0] & 0xff, H[1] >> 24 & 0xff, H[1] >> 16 & 0xff, H[1] >> 8 & 0xff, H[1] & 0xff, H[2] >> 24 & 0xff, H[2] >> 16 & 0xff, H[2] >> 8 & 0xff, H[2] & 0xff, H[3] >> 24 & 0xff, H[3] >> 16 & 0xff, H[3] >> 8 & 0xff, H[3] & 0xff, H[4] >> 24 & 0xff, H[4] >> 16 & 0xff, H[4] >> 8 & 0xff, H[4] & 0xff];
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (sha1);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/stringify.js":
/*!*********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/stringify.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/esm-browser/validate.js");

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

var byteToHex = [];

for (var i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (stringify);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v1.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v1.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist/esm-browser/rng.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/esm-browser/stringify.js");

 // **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;

var _clockseq; // Previous uuid creation time


var _lastMSecs = 0;
var _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || new Array(16);
  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189

  if (node == null || clockseq == null) {
    var seedBytes = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_0__["default"])();

    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }

    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


  var msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock

  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

  var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval


  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  } // Per 4.2.1.2 Throw error if too many uuids are requested


  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

  msecs += 12219292800000; // `time_low`

  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff; // `time_mid`

  var tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff; // `time_high_and_version`

  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

  b[i++] = clockseq & 0xff; // `node`

  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf || (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__["default"])(b);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v1);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v3.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v3.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _v35_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./v35.js */ "./node_modules/uuid/dist/esm-browser/v35.js");
/* harmony import */ var _md5_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./md5.js */ "./node_modules/uuid/dist/esm-browser/md5.js");


var v3 = (0,_v35_js__WEBPACK_IMPORTED_MODULE_0__["default"])('v3', 0x30, _md5_js__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v3);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v35.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v35.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DNS": () => (/* binding */ DNS),
/* harmony export */   "URL": () => (/* binding */ URL),
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/esm-browser/stringify.js");
/* harmony import */ var _parse_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./parse.js */ "./node_modules/uuid/dist/esm-browser/parse.js");



function stringToBytes(str) {
  str = unescape(encodeURIComponent(str)); // UTF8 escape

  var bytes = [];

  for (var i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }

  return bytes;
}

var DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
var URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(name, version, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === 'string') {
      value = stringToBytes(value);
    }

    if (typeof namespace === 'string') {
      namespace = (0,_parse_js__WEBPACK_IMPORTED_MODULE_0__["default"])(namespace);
    }

    if (namespace.length !== 16) {
      throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
    } // Compute hash of namespace and value, Per 4.3
    // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
    // hashfunc([...namespace, ... value])`


    var bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 0x0f | version;
    bytes[8] = bytes[8] & 0x3f | 0x80;

    if (buf) {
      offset = offset || 0;

      for (var i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }

      return buf;
    }

    return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__["default"])(bytes);
  } // Function#name is not settable on some platforms (#270)


  try {
    generateUUID.name = name; // eslint-disable-next-line no-empty
  } catch (err) {} // For CommonJS default export support


  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v4.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v4.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist/esm-browser/rng.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/esm-browser/stringify.js");



function v4(options, buf, offset) {
  options = options || {};
  var rnds = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_0__["default"])(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (var i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__["default"])(rnds);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v4);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v5.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v5.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _v35_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./v35.js */ "./node_modules/uuid/dist/esm-browser/v35.js");
/* harmony import */ var _sha1_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./sha1.js */ "./node_modules/uuid/dist/esm-browser/sha1.js");


var v5 = (0,_v35_js__WEBPACK_IMPORTED_MODULE_0__["default"])('v5', 0x50, _sha1_js__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v5);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/validate.js":
/*!********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/validate.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./regex.js */ "./node_modules/uuid/dist/esm-browser/regex.js");


function validate(uuid) {
  return typeof uuid === 'string' && _regex_js__WEBPACK_IMPORTED_MODULE_0__["default"].test(uuid);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (validate);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/version.js":
/*!*******************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/version.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/esm-browser/validate.js");


function version(uuid) {
  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
    throw TypeError('Invalid UUID');
  }

  return parseInt(uuid.substr(14, 1), 16);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (version);

/***/ }),

/***/ "./node_modules/wrappy/wrappy.js":
/*!***************************************!*\
  !*** ./node_modules/wrappy/wrappy.js ***!
  \***************************************/
/***/ ((module) => {

// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
module.exports = wrappy
function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k]
  })

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }
    var ret = fn.apply(this, args)
    var cb = args[args.length-1]
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k]
      })
    }
    return ret
  }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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REFBbUQ7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EscURBQXFEO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxZQUFZLGdDQUFnQztBQUM1QztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSwyQ0FBMkMsT0FBTztBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esb0JBQW9CLGdCQUFnQjtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBLElBQUk7QUFDSjtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIOzs7Ozs7Ozs7OztBQzdPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esa0JBQWtCLG9CQUFvQjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsb0JBQW9CLFNBQVM7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsU0FBUztBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixvQkFBb0I7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxrQkFBa0IsU0FBUztBQUMzQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7O0FDcnhCQTtBQUNBOztBQUVBLFNBQVMsbUJBQU8sQ0FBQyx3REFBYTtBQUM5QixnQkFBZ0IsbUJBQU8sQ0FBQyx3REFBVztBQUNuQztBQUNBLFdBQVcsMEVBQXlCO0FBQ3BDLFdBQVcsbUJBQU8sQ0FBQyxtSUFBTTtBQUN6QixXQUFXLG1CQUFPLENBQUMsbUlBQU07QUFDekIsYUFBYSxtQkFBTyxDQUFDLHFJQUFRO0FBQzdCLGlCQUFpQixtQkFBTyxDQUFDLGtFQUFrQjtBQUMzQyxhQUFhLG1CQUFPLENBQUMsa0RBQWE7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esa0JBQWtCLE9BQU87QUFDekI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrQkFBa0Isb0JBQW9CO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxvQkFBb0IsU0FBUztBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixTQUFTO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0Isb0JBQW9CO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsa0JBQWtCLFNBQVM7QUFDM0I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQ3JlQSxhQUFhLG1CQUFPLENBQUMsK0NBQVE7QUFDN0I7QUFDQSxXQUFXLG1CQUFPLENBQUMseUNBQU07O0FBRXpCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsU0FBUztBQUMvQjtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxrQkFBa0IsWUFBWTtBQUM5QjtBQUNBOzs7Ozs7Ozs7OztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQzFCQTtBQUNBOztBQUVBLDBCQUEwQixNQUFNLE9BQU8sbUJBQU8sQ0FBQyxtSUFBTSxJQUFJLGFBQWE7QUFDdEU7QUFDQTtBQUNBOztBQUVBO0FBQ0EsYUFBYSxtQkFBTyxDQUFDLGdFQUFpQjs7QUFFdEM7QUFDQSxTQUFTLHNDQUFzQztBQUMvQyxTQUFTLDBCQUEwQjtBQUNuQyxTQUFTLDBCQUEwQjtBQUNuQyxTQUFTLDBCQUEwQjtBQUNuQyxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EseUNBQXlDLElBQUk7O0FBRTdDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGdDQUFnQzs7QUFFaEMsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRyxJQUFJO0FBQ1A7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEscURBQXFEOztBQUVyRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsTUFBTTtBQUNOLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsS0FBSyxJQUFJO0FBQ1QsS0FBSyxHQUFHO0FBQ1IsS0FBSyxLQUFLO0FBQ1YsS0FBSyxJQUFJLElBQUksRUFBRTtBQUNmLEtBQUssSUFBSSxFQUFFLElBQUk7QUFDZjtBQUNBO0FBQ0EsS0FBSyxJQUFJLE9BQU8sSUFBSTtBQUNwQixLQUFLLEVBQUUsT0FBTyxFQUFFO0FBQ2hCO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsNkJBQTZCLFFBQVEsTUFBTTtBQUMzQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MsSUFBSTtBQUN4QztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE1BQU07QUFDTixNQUFNO0FBQ047O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxNQUFNO0FBQ04sSUFBSTs7QUFFSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLElBQUk7QUFDeEM7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLEVBQUUsRUFBRSxLQUFLO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUNBQXlDLFFBQVE7QUFDakQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixzQkFBc0I7QUFDdEM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsNkNBQTZDO0FBQzdDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUIsUUFBUTtBQUNqQztBQUNBO0FBQ0E7O0FBRUEsY0FBYyxnQkFBZ0I7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsTUFBTSw0Q0FBNEM7O0FBRWxEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSLFFBQVE7QUFDUjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxTQUFTO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsMkJBQTJCO0FBQzNCOzs7Ozs7Ozs7OztBQ2w3QkEsYUFBYSxtQkFBTyxDQUFDLCtDQUFRO0FBQzdCO0FBQ0EscUJBQXFCOztBQUVyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsR0FBRztBQUNILENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDekNhOztBQUViO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EseUNBQXlDLEVBQUU7QUFDM0M7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG9CQUFvQjtBQUNwQixvQkFBb0I7Ozs7Ozs7Ozs7O0FDbkJwQixlQUFlLG1CQUFPLENBQUMscUlBQVE7QUFDL0IsYUFBYSxtQkFBTyxDQUFDLG1JQUFNO0FBQzNCLFdBQVcsbUJBQU8sQ0FBQyxpSUFBSTtBQUN2QjtBQUNBO0FBQ0EsU0FBUyxtQkFBTyxDQUFDLHlDQUFNO0FBQ3ZCLEVBQUU7QUFDRjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTCxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLGtCQUFrQixvQkFBb0I7QUFDdEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxnREFBZ0QsU0FBUztBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDhCQUE4QixhQUFhOztBQUUzQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHNDQUFzQztBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esa0RBQWtEO0FBQ2xELDJDQUEyQztBQUMzQywyQ0FBMkM7QUFDM0MsMkNBQTJDO0FBQzNDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0M7QUFDcEM7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7OztBQUdBO0FBQ0Esa0NBQWtDO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZjs7QUFFQTtBQUNBLDBDQUEwQyxTQUFTO0FBQ25EO0FBQ0E7QUFDQTtBQUNBLDRDQUE0QyxZQUFZO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQSxhQUFhLFVBQVU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3ZRaUI7QUFDQTtBQUNBO0FBQ0E7QUFDRTtBQUNRO0FBQ0U7QUFDRTs7Ozs7Ozs7Ozs7Ozs7OztBQ1B0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1EQUFtRDs7QUFFbkQ7O0FBRUEsb0JBQW9CLGdCQUFnQjtBQUNwQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsa0JBQWtCLGNBQWM7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtCQUFrQixjQUFjO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxrQkFBa0IsYUFBYTtBQUMvQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLGlFQUFlLEdBQUc7Ozs7Ozs7Ozs7Ozs7OztBQ3RObEIsaUVBQWUsc0NBQXNDOzs7Ozs7Ozs7Ozs7Ozs7O0FDQWhCOztBQUVyQztBQUNBLE9BQU8sd0RBQVE7QUFDZjtBQUNBOztBQUVBO0FBQ0EsZ0NBQWdDOztBQUVoQztBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7O0FBRXJCO0FBQ0EscUJBQXFCOztBQUVyQjtBQUNBLHFCQUFxQjs7QUFFckI7QUFDQSxxQkFBcUI7QUFDckI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpRUFBZSxLQUFLOzs7Ozs7Ozs7Ozs7Ozs7QUNsQ3BCLGlFQUFlLGNBQWMsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLFVBQVUsR0FBRyx5Q0FBeUM7Ozs7Ozs7Ozs7Ozs7OztBQ0FwSTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2U7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxtREFBbUQ7O0FBRW5EOztBQUVBLG9CQUFvQixnQkFBZ0I7QUFDcEM7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsbUJBQW1CLFFBQVE7QUFDM0I7O0FBRUEsb0JBQW9CLFFBQVE7QUFDNUI7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxvQkFBb0IsU0FBUztBQUM3Qjs7QUFFQSxvQkFBb0IsUUFBUTtBQUM1QjtBQUNBOztBQUVBLHNCQUFzQixTQUFTO0FBQy9CO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxzQkFBc0IsVUFBVTtBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLGlFQUFlLElBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7QUMvRmtCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLGdCQUFnQixTQUFTO0FBQ3pCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwZ0JBQTBnQjtBQUMxZ0I7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBTyx3REFBUTtBQUNmO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxpRUFBZSxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7OztBQzdCRztBQUNZLENBQUM7QUFDeEM7QUFDQTtBQUNBOztBQUVBOztBQUVBLGVBQWU7OztBQUdmO0FBQ0Esb0JBQW9COztBQUVwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0ZBQWdGO0FBQ2hGO0FBQ0E7O0FBRUE7QUFDQSxzREFBc0QsK0NBQUc7O0FBRXpEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7O0FBR0Esd0VBQXdFO0FBQ3hFOztBQUVBLDRFQUE0RTs7QUFFNUUsOERBQThEOztBQUU5RDtBQUNBO0FBQ0EsSUFBSTtBQUNKOzs7QUFHQTtBQUNBO0FBQ0EsSUFBSTs7O0FBR0o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx3QkFBd0I7O0FBRXhCLDJCQUEyQjs7QUFFM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0I7O0FBRXRCO0FBQ0E7QUFDQSx1QkFBdUI7O0FBRXZCLG9DQUFvQzs7QUFFcEMsOEJBQThCOztBQUU5QixrQ0FBa0M7O0FBRWxDLDRCQUE0Qjs7QUFFNUIsa0JBQWtCLE9BQU87QUFDekI7QUFDQTs7QUFFQSxnQkFBZ0IseURBQVM7QUFDekI7O0FBRUEsaUVBQWUsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM5RlU7QUFDQTtBQUMzQixTQUFTLG1EQUFHLGFBQWEsK0NBQUc7QUFDNUIsaUVBQWUsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0hzQjtBQUNSOztBQUUvQjtBQUNBLDJDQUEyQzs7QUFFM0M7O0FBRUEsa0JBQWtCLGdCQUFnQjtBQUNsQztBQUNBOztBQUVBO0FBQ0E7O0FBRU87QUFDQTtBQUNQLDZCQUFlLG9DQUFVO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esa0JBQWtCLHFEQUFLO0FBQ3ZCOztBQUVBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsc0JBQXNCLFFBQVE7QUFDOUI7QUFDQTs7QUFFQTtBQUNBOztBQUVBLFdBQVcseURBQVM7QUFDcEIsSUFBSTs7O0FBR0o7QUFDQSw4QkFBOEI7QUFDOUIsSUFBSSxlQUFlOzs7QUFHbkI7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDL0QyQjtBQUNZOztBQUV2QztBQUNBO0FBQ0EsK0NBQStDLCtDQUFHLEtBQUs7O0FBRXZEO0FBQ0EsbUNBQW1DOztBQUVuQztBQUNBOztBQUVBLG9CQUFvQixRQUFRO0FBQzVCO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxTQUFTLHlEQUFTO0FBQ2xCOztBQUVBLGlFQUFlLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdkJVO0FBQ0U7QUFDN0IsU0FBUyxtREFBRyxhQUFhLGdEQUFJO0FBQzdCLGlFQUFlLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7QUNIYzs7QUFFL0I7QUFDQSxxQ0FBcUMsc0RBQVU7QUFDL0M7O0FBRUEsaUVBQWUsUUFBUTs7Ozs7Ozs7Ozs7Ozs7OztBQ05jOztBQUVyQztBQUNBLE9BQU8sd0RBQVE7QUFDZjtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsaUVBQWUsT0FBTzs7Ozs7Ozs7OztBQ1Z0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTtBQUNBLG9CQUFvQixpQkFBaUI7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7VUNoQ0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1VFTkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL0BhY3Rpb25zL2FydGlmYWN0L2xpYi9hcnRpZmFjdC1jbGllbnQuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9hcnRpZmFjdC9saWIvaW50ZXJuYWwvYXJ0aWZhY3QtY2xpZW50LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvQGFjdGlvbnMvYXJ0aWZhY3QvbGliL2ludGVybmFsL2NvbmZpZy12YXJpYWJsZXMuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9hcnRpZmFjdC9saWIvaW50ZXJuYWwvY3JjNjQuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9hcnRpZmFjdC9saWIvaW50ZXJuYWwvZG93bmxvYWQtaHR0cC1jbGllbnQuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9hcnRpZmFjdC9saWIvaW50ZXJuYWwvZG93bmxvYWQtc3BlY2lmaWNhdGlvbi5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL0BhY3Rpb25zL2FydGlmYWN0L2xpYi9pbnRlcm5hbC9odHRwLW1hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9hcnRpZmFjdC9saWIvaW50ZXJuYWwvcGF0aC1hbmQtYXJ0aWZhY3QtbmFtZS12YWxpZGF0aW9uLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvQGFjdGlvbnMvYXJ0aWZhY3QvbGliL2ludGVybmFsL3JlcXVlc3RVdGlscy5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL0BhY3Rpb25zL2FydGlmYWN0L2xpYi9pbnRlcm5hbC9zdGF0dXMtcmVwb3J0ZXIuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9hcnRpZmFjdC9saWIvaW50ZXJuYWwvdXBsb2FkLWd6aXAuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9hcnRpZmFjdC9saWIvaW50ZXJuYWwvdXBsb2FkLWh0dHAtY2xpZW50LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvQGFjdGlvbnMvYXJ0aWZhY3QvbGliL2ludGVybmFsL3VwbG9hZC1zcGVjaWZpY2F0aW9uLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvQGFjdGlvbnMvYXJ0aWZhY3QvbGliL2ludGVybmFsL3V0aWxzLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvQGFjdGlvbnMvY29yZS9saWIvY29tbWFuZC5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL0BhY3Rpb25zL2NvcmUvbGliL2NvcmUuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9jb3JlL2xpYi9maWxlLWNvbW1hbmQuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9jb3JlL2xpYi9vaWRjLXV0aWxzLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvQGFjdGlvbnMvY29yZS9saWIvcGF0aC11dGlscy5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL0BhY3Rpb25zL2NvcmUvbGliL3N1bW1hcnkuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9jb3JlL2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL0BhY3Rpb25zL2h0dHAtY2xpZW50L2xpYi9hdXRoLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvQGFjdGlvbnMvaHR0cC1jbGllbnQvbGliL2luZGV4LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvQGFjdGlvbnMvaHR0cC1jbGllbnQvbGliL3Byb3h5LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvYmFsYW5jZWQtbWF0Y2gvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9icmFjZS1leHBhbnNpb24vaW5kZXguanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9jb25jYXQtbWFwL2luZGV4LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL2ZzLnJlYWxwYXRoL2luZGV4LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvZnMucmVhbHBhdGgvb2xkLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvZ2xvYi9jb21tb24uanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9nbG9iL2dsb2IuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9nbG9iL3N5bmMuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9pbmZsaWdodC9pbmZsaWdodC5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9taW5pbWF0Y2gvbWluaW1hdGNoLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvb25jZS9vbmNlLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvcGF0aC1pcy1hYnNvbHV0ZS9pbmRleC5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL3JpbXJhZi9yaW1yYWYuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy90bXAtcHJvbWlzZS9pbmRleC5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL3RtcC9saWIvdG1wLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9zcmMvY29udGFpbmVyU2Nhbi50cyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvdHVubmVsL2luZGV4LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvdHVubmVsL2xpYi90dW5uZWwuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvbWQ1LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL25pbC5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9wYXJzZS5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9yZWdleC5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9ybmcuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvc2hhMS5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9zdHJpbmdpZnkuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjEuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjMuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjM1LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3Y0LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3Y1LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3ZhbGlkYXRlLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3ZlcnNpb24uanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy93cmFwcHkvd3JhcHB5LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmNyZWF0ZSA9IHZvaWQgMDtcbmNvbnN0IGFydGlmYWN0X2NsaWVudF8xID0gcmVxdWlyZShcIi4vaW50ZXJuYWwvYXJ0aWZhY3QtY2xpZW50XCIpO1xuLyoqXG4gKiBDb25zdHJ1Y3RzIGFuIEFydGlmYWN0Q2xpZW50XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICByZXR1cm4gYXJ0aWZhY3RfY2xpZW50XzEuRGVmYXVsdEFydGlmYWN0Q2xpZW50LmNyZWF0ZSgpO1xufVxuZXhwb3J0cy5jcmVhdGUgPSBjcmVhdGU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcnRpZmFjdC1jbGllbnQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19zZXRNb2R1bGVEZWZhdWx0KSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xufSkgOiBmdW5jdGlvbihvLCB2KSB7XG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xufSk7XG52YXIgX19pbXBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydFN0YXIpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkRlZmF1bHRBcnRpZmFjdENsaWVudCA9IHZvaWQgMDtcbmNvbnN0IGNvcmUgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcIkBhY3Rpb25zL2NvcmVcIikpO1xuY29uc3QgdXBsb2FkX3NwZWNpZmljYXRpb25fMSA9IHJlcXVpcmUoXCIuL3VwbG9hZC1zcGVjaWZpY2F0aW9uXCIpO1xuY29uc3QgdXBsb2FkX2h0dHBfY2xpZW50XzEgPSByZXF1aXJlKFwiLi91cGxvYWQtaHR0cC1jbGllbnRcIik7XG5jb25zdCB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG5jb25zdCBwYXRoX2FuZF9hcnRpZmFjdF9uYW1lX3ZhbGlkYXRpb25fMSA9IHJlcXVpcmUoXCIuL3BhdGgtYW5kLWFydGlmYWN0LW5hbWUtdmFsaWRhdGlvblwiKTtcbmNvbnN0IGRvd25sb2FkX2h0dHBfY2xpZW50XzEgPSByZXF1aXJlKFwiLi9kb3dubG9hZC1odHRwLWNsaWVudFwiKTtcbmNvbnN0IGRvd25sb2FkX3NwZWNpZmljYXRpb25fMSA9IHJlcXVpcmUoXCIuL2Rvd25sb2FkLXNwZWNpZmljYXRpb25cIik7XG5jb25zdCBjb25maWdfdmFyaWFibGVzXzEgPSByZXF1aXJlKFwiLi9jb25maWctdmFyaWFibGVzXCIpO1xuY29uc3QgcGF0aF8xID0gcmVxdWlyZShcInBhdGhcIik7XG5jbGFzcyBEZWZhdWx0QXJ0aWZhY3RDbGllbnQge1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdHMgYSBEZWZhdWx0QXJ0aWZhY3RDbGllbnRcbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlKCkge1xuICAgICAgICByZXR1cm4gbmV3IERlZmF1bHRBcnRpZmFjdENsaWVudCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVcGxvYWRzIGFuIGFydGlmYWN0XG4gICAgICovXG4gICAgdXBsb2FkQXJ0aWZhY3QobmFtZSwgZmlsZXMsIHJvb3REaXJlY3RvcnksIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvcmUuaW5mbyhgU3RhcnRpbmcgYXJ0aWZhY3QgdXBsb2FkXG5Gb3IgbW9yZSBkZXRhaWxlZCBsb2dzIGR1cmluZyB0aGUgYXJ0aWZhY3QgdXBsb2FkIHByb2Nlc3MsIGVuYWJsZSBzdGVwLWRlYnVnZ2luZzogaHR0cHM6Ly9kb2NzLmdpdGh1Yi5jb20vYWN0aW9ucy9tb25pdG9yaW5nLWFuZC10cm91Ymxlc2hvb3Rpbmctd29ya2Zsb3dzL2VuYWJsaW5nLWRlYnVnLWxvZ2dpbmcjZW5hYmxpbmctc3RlcC1kZWJ1Zy1sb2dnaW5nYCk7XG4gICAgICAgICAgICBwYXRoX2FuZF9hcnRpZmFjdF9uYW1lX3ZhbGlkYXRpb25fMS5jaGVja0FydGlmYWN0TmFtZShuYW1lKTtcbiAgICAgICAgICAgIC8vIEdldCBzcGVjaWZpY2F0aW9uIGZvciB0aGUgZmlsZXMgYmVpbmcgdXBsb2FkZWRcbiAgICAgICAgICAgIGNvbnN0IHVwbG9hZFNwZWNpZmljYXRpb24gPSB1cGxvYWRfc3BlY2lmaWNhdGlvbl8xLmdldFVwbG9hZFNwZWNpZmljYXRpb24obmFtZSwgcm9vdERpcmVjdG9yeSwgZmlsZXMpO1xuICAgICAgICAgICAgY29uc3QgdXBsb2FkUmVzcG9uc2UgPSB7XG4gICAgICAgICAgICAgICAgYXJ0aWZhY3ROYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgIGFydGlmYWN0SXRlbXM6IFtdLFxuICAgICAgICAgICAgICAgIHNpemU6IDAsXG4gICAgICAgICAgICAgICAgZmFpbGVkSXRlbXM6IFtdXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgdXBsb2FkSHR0cENsaWVudCA9IG5ldyB1cGxvYWRfaHR0cF9jbGllbnRfMS5VcGxvYWRIdHRwQ2xpZW50KCk7XG4gICAgICAgICAgICBpZiAodXBsb2FkU3BlY2lmaWNhdGlvbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb3JlLndhcm5pbmcoYE5vIGZpbGVzIGZvdW5kIHRoYXQgY2FuIGJlIHVwbG9hZGVkYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYW4gZW50cnkgZm9yIHRoZSBhcnRpZmFjdCBpbiB0aGUgZmlsZSBjb250YWluZXJcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHlpZWxkIHVwbG9hZEh0dHBDbGllbnQuY3JlYXRlQXJ0aWZhY3RJbkZpbGVDb250YWluZXIobmFtZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5maWxlQ29udGFpbmVyUmVzb3VyY2VVcmwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29yZS5kZWJ1ZyhyZXNwb25zZS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBVUkwgcHJvdmlkZWQgYnkgdGhlIEFydGlmYWN0IFNlcnZpY2UgdG8gdXBsb2FkIGFuIGFydGlmYWN0IHRvJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvcmUuZGVidWcoYFVwbG9hZCBSZXNvdXJjZSBVUkw6ICR7cmVzcG9uc2UuZmlsZUNvbnRhaW5lclJlc291cmNlVXJsfWApO1xuICAgICAgICAgICAgICAgIGNvcmUuaW5mbyhgQ29udGFpbmVyIGZvciBhcnRpZmFjdCBcIiR7bmFtZX1cIiBzdWNjZXNzZnVsbHkgY3JlYXRlZC4gU3RhcnRpbmcgdXBsb2FkIG9mIGZpbGUocylgKTtcbiAgICAgICAgICAgICAgICAvLyBVcGxvYWQgZWFjaCBvZiB0aGUgZmlsZXMgdGhhdCB3ZXJlIGZvdW5kIGNvbmN1cnJlbnRseVxuICAgICAgICAgICAgICAgIGNvbnN0IHVwbG9hZFJlc3VsdCA9IHlpZWxkIHVwbG9hZEh0dHBDbGllbnQudXBsb2FkQXJ0aWZhY3RUb0ZpbGVDb250YWluZXIocmVzcG9uc2UuZmlsZUNvbnRhaW5lclJlc291cmNlVXJsLCB1cGxvYWRTcGVjaWZpY2F0aW9uLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHNpemUgb2YgdGhlIGFydGlmYWN0IHRvIGluZGljYXRlIHdlIGFyZSBkb25lIHVwbG9hZGluZ1xuICAgICAgICAgICAgICAgIC8vIFRoZSB1bmNvbXByZXNzZWQgc2l6ZSBpcyB1c2VkIGZvciBkaXNwbGF5IHdoZW4gZG93bmxvYWRpbmcgYSB6aXAgb2YgdGhlIGFydGlmYWN0IGZyb20gdGhlIFVJXG4gICAgICAgICAgICAgICAgY29yZS5pbmZvKGBGaWxlIHVwbG9hZCBwcm9jZXNzIGhhcyBmaW5pc2hlZC4gRmluYWxpemluZyB0aGUgYXJ0aWZhY3QgdXBsb2FkYCk7XG4gICAgICAgICAgICAgICAgeWllbGQgdXBsb2FkSHR0cENsaWVudC5wYXRjaEFydGlmYWN0U2l6ZSh1cGxvYWRSZXN1bHQudG90YWxTaXplLCBuYW1lKTtcbiAgICAgICAgICAgICAgICBpZiAodXBsb2FkUmVzdWx0LmZhaWxlZEl0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29yZS5pbmZvKGBVcGxvYWQgZmluaXNoZWQuIFRoZXJlIHdlcmUgJHt1cGxvYWRSZXN1bHQuZmFpbGVkSXRlbXMubGVuZ3RofSBpdGVtcyB0aGF0IGZhaWxlZCB0byB1cGxvYWRgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvcmUuaW5mbyhgQXJ0aWZhY3QgaGFzIGJlZW4gZmluYWxpemVkLiBBbGwgZmlsZXMgaGF2ZSBiZWVuIHN1Y2Nlc3NmdWxseSB1cGxvYWRlZCFgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29yZS5pbmZvKGBcblRoZSByYXcgc2l6ZSBvZiBhbGwgdGhlIGZpbGVzIHRoYXQgd2VyZSBzcGVjaWZpZWQgZm9yIHVwbG9hZCBpcyAke3VwbG9hZFJlc3VsdC50b3RhbFNpemV9IGJ5dGVzXG5UaGUgc2l6ZSBvZiBhbGwgdGhlIGZpbGVzIHRoYXQgd2VyZSB1cGxvYWRlZCBpcyAke3VwbG9hZFJlc3VsdC51cGxvYWRTaXplfSBieXRlcy4gVGhpcyB0YWtlcyBpbnRvIGFjY291bnQgYW55IGd6aXAgY29tcHJlc3Npb24gdXNlZCB0byByZWR1Y2UgdGhlIHVwbG9hZCBzaXplLCB0aW1lIGFuZCBzdG9yYWdlXG5cbk5vdGU6IFRoZSBzaXplIG9mIGRvd25sb2FkZWQgemlwcyBjYW4gZGlmZmVyIHNpZ25pZmljYW50bHkgZnJvbSB0aGUgcmVwb3J0ZWQgc2l6ZS4gRm9yIG1vcmUgaW5mb3JtYXRpb24gc2VlOiBodHRwczovL2dpdGh1Yi5jb20vYWN0aW9ucy91cGxvYWQtYXJ0aWZhY3QjemlwcGVkLWFydGlmYWN0LWRvd25sb2FkcyBcXHJcXG5gKTtcbiAgICAgICAgICAgICAgICB1cGxvYWRSZXNwb25zZS5hcnRpZmFjdEl0ZW1zID0gdXBsb2FkU3BlY2lmaWNhdGlvbi5tYXAoaXRlbSA9PiBpdGVtLmFic29sdXRlRmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgIHVwbG9hZFJlc3BvbnNlLnNpemUgPSB1cGxvYWRSZXN1bHQudXBsb2FkU2l6ZTtcbiAgICAgICAgICAgICAgICB1cGxvYWRSZXNwb25zZS5mYWlsZWRJdGVtcyA9IHVwbG9hZFJlc3VsdC5mYWlsZWRJdGVtcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB1cGxvYWRSZXNwb25zZTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGRvd25sb2FkQXJ0aWZhY3QobmFtZSwgcGF0aCwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgZG93bmxvYWRIdHRwQ2xpZW50ID0gbmV3IGRvd25sb2FkX2h0dHBfY2xpZW50XzEuRG93bmxvYWRIdHRwQ2xpZW50KCk7XG4gICAgICAgICAgICBjb25zdCBhcnRpZmFjdHMgPSB5aWVsZCBkb3dubG9hZEh0dHBDbGllbnQubGlzdEFydGlmYWN0cygpO1xuICAgICAgICAgICAgaWYgKGFydGlmYWN0cy5jb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGZpbmQgYW55IGFydGlmYWN0cyBmb3IgdGhlIGFzc29jaWF0ZWQgd29ya2Zsb3dgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGFydGlmYWN0VG9Eb3dubG9hZCA9IGFydGlmYWN0cy52YWx1ZS5maW5kKGFydGlmYWN0ID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJ0aWZhY3QubmFtZSA9PT0gbmFtZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFhcnRpZmFjdFRvRG93bmxvYWQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBmaW5kIGFuIGFydGlmYWN0IHdpdGggdGhlIG5hbWU6ICR7bmFtZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGl0ZW1zID0geWllbGQgZG93bmxvYWRIdHRwQ2xpZW50LmdldENvbnRhaW5lckl0ZW1zKGFydGlmYWN0VG9Eb3dubG9hZC5uYW1lLCBhcnRpZmFjdFRvRG93bmxvYWQuZmlsZUNvbnRhaW5lclJlc291cmNlVXJsKTtcbiAgICAgICAgICAgIGlmICghcGF0aCkge1xuICAgICAgICAgICAgICAgIHBhdGggPSBjb25maWdfdmFyaWFibGVzXzEuZ2V0V29ya1NwYWNlRGlyZWN0b3J5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRoID0gcGF0aF8xLm5vcm1hbGl6ZShwYXRoKTtcbiAgICAgICAgICAgIHBhdGggPSBwYXRoXzEucmVzb2x2ZShwYXRoKTtcbiAgICAgICAgICAgIC8vIER1cmluZyB1cGxvYWQsIGVtcHR5IGRpcmVjdG9yaWVzIGFyZSByZWplY3RlZCBieSB0aGUgcmVtb3RlIHNlcnZlciBzbyB0aGVyZSBzaG91bGQgYmUgbm8gYXJ0aWZhY3RzIHRoYXQgY29uc2lzdCBvZiBvbmx5IGVtcHR5IGRpcmVjdG9yaWVzXG4gICAgICAgICAgICBjb25zdCBkb3dubG9hZFNwZWNpZmljYXRpb24gPSBkb3dubG9hZF9zcGVjaWZpY2F0aW9uXzEuZ2V0RG93bmxvYWRTcGVjaWZpY2F0aW9uKG5hbWUsIGl0ZW1zLnZhbHVlLCBwYXRoLCAob3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb25zLmNyZWF0ZUFydGlmYWN0Rm9sZGVyKSB8fCBmYWxzZSk7XG4gICAgICAgICAgICBpZiAoZG93bmxvYWRTcGVjaWZpY2F0aW9uLmZpbGVzVG9Eb3dubG9hZC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb3JlLmluZm8oYE5vIGRvd25sb2FkYWJsZSBmaWxlcyB3ZXJlIGZvdW5kIGZvciB0aGUgYXJ0aWZhY3Q6ICR7YXJ0aWZhY3RUb0Rvd25sb2FkLm5hbWV9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYWxsIG5lY2Vzc2FyeSBkaXJlY3RvcmllcyByZWN1cnNpdmVseSBiZWZvcmUgc3RhcnRpbmcgYW55IGRvd25sb2FkXG4gICAgICAgICAgICAgICAgeWllbGQgdXRpbHNfMS5jcmVhdGVEaXJlY3Rvcmllc0ZvckFydGlmYWN0KGRvd25sb2FkU3BlY2lmaWNhdGlvbi5kaXJlY3RvcnlTdHJ1Y3R1cmUpO1xuICAgICAgICAgICAgICAgIGNvcmUuaW5mbygnRGlyZWN0b3J5IHN0cnVjdHVyZSBoYXMgYmVlbiBzZXR1cCBmb3IgdGhlIGFydGlmYWN0Jyk7XG4gICAgICAgICAgICAgICAgeWllbGQgdXRpbHNfMS5jcmVhdGVFbXB0eUZpbGVzRm9yQXJ0aWZhY3QoZG93bmxvYWRTcGVjaWZpY2F0aW9uLmVtcHR5RmlsZXNUb0NyZWF0ZSk7XG4gICAgICAgICAgICAgICAgeWllbGQgZG93bmxvYWRIdHRwQ2xpZW50LmRvd25sb2FkU2luZ2xlQXJ0aWZhY3QoZG93bmxvYWRTcGVjaWZpY2F0aW9uLmZpbGVzVG9Eb3dubG9hZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGFydGlmYWN0TmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICBkb3dubG9hZFBhdGg6IGRvd25sb2FkU3BlY2lmaWNhdGlvbi5yb290RG93bmxvYWRMb2NhdGlvblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGRvd25sb2FkQWxsQXJ0aWZhY3RzKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IGRvd25sb2FkSHR0cENsaWVudCA9IG5ldyBkb3dubG9hZF9odHRwX2NsaWVudF8xLkRvd25sb2FkSHR0cENsaWVudCgpO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGFydGlmYWN0cyA9IHlpZWxkIGRvd25sb2FkSHR0cENsaWVudC5saXN0QXJ0aWZhY3RzKCk7XG4gICAgICAgICAgICBpZiAoYXJ0aWZhY3RzLmNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29yZS5pbmZvKCdVbmFibGUgdG8gZmluZCBhbnkgYXJ0aWZhY3RzIGZvciB0aGUgYXNzb2NpYXRlZCB3b3JrZmxvdycpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcGF0aCkge1xuICAgICAgICAgICAgICAgIHBhdGggPSBjb25maWdfdmFyaWFibGVzXzEuZ2V0V29ya1NwYWNlRGlyZWN0b3J5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRoID0gcGF0aF8xLm5vcm1hbGl6ZShwYXRoKTtcbiAgICAgICAgICAgIHBhdGggPSBwYXRoXzEucmVzb2x2ZShwYXRoKTtcbiAgICAgICAgICAgIGxldCBkb3dubG9hZGVkQXJ0aWZhY3RzID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChkb3dubG9hZGVkQXJ0aWZhY3RzIDwgYXJ0aWZhY3RzLmNvdW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudEFydGlmYWN0VG9Eb3dubG9hZCA9IGFydGlmYWN0cy52YWx1ZVtkb3dubG9hZGVkQXJ0aWZhY3RzXTtcbiAgICAgICAgICAgICAgICBkb3dubG9hZGVkQXJ0aWZhY3RzICs9IDE7XG4gICAgICAgICAgICAgICAgY29yZS5pbmZvKGBzdGFydGluZyBkb3dubG9hZCBvZiBhcnRpZmFjdCAke2N1cnJlbnRBcnRpZmFjdFRvRG93bmxvYWQubmFtZX0gOiAke2Rvd25sb2FkZWRBcnRpZmFjdHN9LyR7YXJ0aWZhY3RzLmNvdW50fWApO1xuICAgICAgICAgICAgICAgIC8vIEdldCBjb250YWluZXIgZW50cmllcyBmb3IgdGhlIHNwZWNpZmljIGFydGlmYWN0XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbXMgPSB5aWVsZCBkb3dubG9hZEh0dHBDbGllbnQuZ2V0Q29udGFpbmVySXRlbXMoY3VycmVudEFydGlmYWN0VG9Eb3dubG9hZC5uYW1lLCBjdXJyZW50QXJ0aWZhY3RUb0Rvd25sb2FkLmZpbGVDb250YWluZXJSZXNvdXJjZVVybCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZG93bmxvYWRTcGVjaWZpY2F0aW9uID0gZG93bmxvYWRfc3BlY2lmaWNhdGlvbl8xLmdldERvd25sb2FkU3BlY2lmaWNhdGlvbihjdXJyZW50QXJ0aWZhY3RUb0Rvd25sb2FkLm5hbWUsIGl0ZW1zLnZhbHVlLCBwYXRoLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBpZiAoZG93bmxvYWRTcGVjaWZpY2F0aW9uLmZpbGVzVG9Eb3dubG9hZC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29yZS5pbmZvKGBObyBkb3dubG9hZGFibGUgZmlsZXMgd2VyZSBmb3VuZCBmb3IgYW55IGFydGlmYWN0ICR7Y3VycmVudEFydGlmYWN0VG9Eb3dubG9hZC5uYW1lfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgdXRpbHNfMS5jcmVhdGVEaXJlY3Rvcmllc0ZvckFydGlmYWN0KGRvd25sb2FkU3BlY2lmaWNhdGlvbi5kaXJlY3RvcnlTdHJ1Y3R1cmUpO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCB1dGlsc18xLmNyZWF0ZUVtcHR5RmlsZXNGb3JBcnRpZmFjdChkb3dubG9hZFNwZWNpZmljYXRpb24uZW1wdHlGaWxlc1RvQ3JlYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgZG93bmxvYWRIdHRwQ2xpZW50LmRvd25sb2FkU2luZ2xlQXJ0aWZhY3QoZG93bmxvYWRTcGVjaWZpY2F0aW9uLmZpbGVzVG9Eb3dubG9hZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBhcnRpZmFjdE5hbWU6IGN1cnJlbnRBcnRpZmFjdFRvRG93bmxvYWQubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgZG93bmxvYWRQYXRoOiBkb3dubG9hZFNwZWNpZmljYXRpb24ucm9vdERvd25sb2FkTG9jYXRpb25cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5EZWZhdWx0QXJ0aWZhY3RDbGllbnQgPSBEZWZhdWx0QXJ0aWZhY3RDbGllbnQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcnRpZmFjdC1jbGllbnQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmdldFJldGVudGlvbkRheXMgPSBleHBvcnRzLmdldFdvcmtTcGFjZURpcmVjdG9yeSA9IGV4cG9ydHMuZ2V0V29ya0Zsb3dSdW5JZCA9IGV4cG9ydHMuZ2V0UnVudGltZVVybCA9IGV4cG9ydHMuZ2V0UnVudGltZVRva2VuID0gZXhwb3J0cy5nZXREb3dubG9hZEZpbGVDb25jdXJyZW5jeSA9IGV4cG9ydHMuZ2V0SW5pdGlhbFJldHJ5SW50ZXJ2YWxJbk1pbGxpc2Vjb25kcyA9IGV4cG9ydHMuZ2V0UmV0cnlNdWx0aXBsaWVyID0gZXhwb3J0cy5nZXRSZXRyeUxpbWl0ID0gZXhwb3J0cy5nZXRVcGxvYWRDaHVua1NpemUgPSBleHBvcnRzLmdldFVwbG9hZEZpbGVDb25jdXJyZW5jeSA9IHZvaWQgMDtcbi8vIFRoZSBudW1iZXIgb2YgY29uY3VycmVudCB1cGxvYWRzIHRoYXQgaGFwcGVucyBhdCB0aGUgc2FtZSB0aW1lXG5mdW5jdGlvbiBnZXRVcGxvYWRGaWxlQ29uY3VycmVuY3koKSB7XG4gICAgcmV0dXJuIDI7XG59XG5leHBvcnRzLmdldFVwbG9hZEZpbGVDb25jdXJyZW5jeSA9IGdldFVwbG9hZEZpbGVDb25jdXJyZW5jeTtcbi8vIFdoZW4gdXBsb2FkaW5nIGxhcmdlIGZpbGVzIHRoYXQgY2FuJ3QgYmUgdXBsb2FkZWQgd2l0aCBhIHNpbmdsZSBodHRwIGNhbGwsIHRoaXMgY29udHJvbHNcbi8vIHRoZSBjaHVuayBzaXplIHRoYXQgaXMgdXNlZCBkdXJpbmcgdXBsb2FkXG5mdW5jdGlvbiBnZXRVcGxvYWRDaHVua1NpemUoKSB7XG4gICAgcmV0dXJuIDggKiAxMDI0ICogMTAyNDsgLy8gOCBNQiBDaHVua3Ncbn1cbmV4cG9ydHMuZ2V0VXBsb2FkQ2h1bmtTaXplID0gZ2V0VXBsb2FkQ2h1bmtTaXplO1xuLy8gVGhlIG1heGltdW0gbnVtYmVyIG9mIHJldHJpZXMgdGhhdCBjYW4gYmUgYXR0ZW1wdGVkIGJlZm9yZSBhbiB1cGxvYWQgb3IgZG93bmxvYWQgZmFpbHNcbmZ1bmN0aW9uIGdldFJldHJ5TGltaXQoKSB7XG4gICAgcmV0dXJuIDU7XG59XG5leHBvcnRzLmdldFJldHJ5TGltaXQgPSBnZXRSZXRyeUxpbWl0O1xuLy8gV2l0aCBleHBvbmVudGlhbCBiYWNrb2ZmLCB0aGUgbGFyZ2VyIHRoZSByZXRyeSBjb3VudCwgdGhlIGxhcmdlciB0aGUgd2FpdCB0aW1lIGJlZm9yZSBhbm90aGVyIGF0dGVtcHRcbi8vIFRoZSByZXRyeSBtdWx0aXBsaWVyIGNvbnRyb2xzIGJ5IGhvdyBtdWNoIHRoZSBiYWNrT2ZmIHRpbWUgaW5jcmVhc2VzIGRlcGVuZGluZyBvbiB0aGUgbnVtYmVyIG9mIHJldHJpZXNcbmZ1bmN0aW9uIGdldFJldHJ5TXVsdGlwbGllcigpIHtcbiAgICByZXR1cm4gMS41O1xufVxuZXhwb3J0cy5nZXRSZXRyeU11bHRpcGxpZXIgPSBnZXRSZXRyeU11bHRpcGxpZXI7XG4vLyBUaGUgaW5pdGlhbCB3YWl0IHRpbWUgaWYgYW4gdXBsb2FkIG9yIGRvd25sb2FkIGZhaWxzIGFuZCBhIHJldHJ5IGlzIGJlaW5nIGF0dGVtcHRlZCBmb3IgdGhlIGZpcnN0IHRpbWVcbmZ1bmN0aW9uIGdldEluaXRpYWxSZXRyeUludGVydmFsSW5NaWxsaXNlY29uZHMoKSB7XG4gICAgcmV0dXJuIDMwMDA7XG59XG5leHBvcnRzLmdldEluaXRpYWxSZXRyeUludGVydmFsSW5NaWxsaXNlY29uZHMgPSBnZXRJbml0aWFsUmV0cnlJbnRlcnZhbEluTWlsbGlzZWNvbmRzO1xuLy8gVGhlIG51bWJlciBvZiBjb25jdXJyZW50IGRvd25sb2FkcyB0aGF0IGhhcHBlbnMgYXQgdGhlIHNhbWUgdGltZVxuZnVuY3Rpb24gZ2V0RG93bmxvYWRGaWxlQ29uY3VycmVuY3koKSB7XG4gICAgcmV0dXJuIDI7XG59XG5leHBvcnRzLmdldERvd25sb2FkRmlsZUNvbmN1cnJlbmN5ID0gZ2V0RG93bmxvYWRGaWxlQ29uY3VycmVuY3k7XG5mdW5jdGlvbiBnZXRSdW50aW1lVG9rZW4oKSB7XG4gICAgY29uc3QgdG9rZW4gPSBwcm9jZXNzLmVudlsnQUNUSU9OU19SVU5USU1FX1RPS0VOJ107XG4gICAgaWYgKCF0b2tlbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBnZXQgQUNUSU9OU19SVU5USU1FX1RPS0VOIGVudiB2YXJpYWJsZScpO1xuICAgIH1cbiAgICByZXR1cm4gdG9rZW47XG59XG5leHBvcnRzLmdldFJ1bnRpbWVUb2tlbiA9IGdldFJ1bnRpbWVUb2tlbjtcbmZ1bmN0aW9uIGdldFJ1bnRpbWVVcmwoKSB7XG4gICAgY29uc3QgcnVudGltZVVybCA9IHByb2Nlc3MuZW52WydBQ1RJT05TX1JVTlRJTUVfVVJMJ107XG4gICAgaWYgKCFydW50aW1lVXJsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGdldCBBQ1RJT05TX1JVTlRJTUVfVVJMIGVudiB2YXJpYWJsZScpO1xuICAgIH1cbiAgICByZXR1cm4gcnVudGltZVVybDtcbn1cbmV4cG9ydHMuZ2V0UnVudGltZVVybCA9IGdldFJ1bnRpbWVVcmw7XG5mdW5jdGlvbiBnZXRXb3JrRmxvd1J1bklkKCkge1xuICAgIGNvbnN0IHdvcmtGbG93UnVuSWQgPSBwcm9jZXNzLmVudlsnR0lUSFVCX1JVTl9JRCddO1xuICAgIGlmICghd29ya0Zsb3dSdW5JZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBnZXQgR0lUSFVCX1JVTl9JRCBlbnYgdmFyaWFibGUnKTtcbiAgICB9XG4gICAgcmV0dXJuIHdvcmtGbG93UnVuSWQ7XG59XG5leHBvcnRzLmdldFdvcmtGbG93UnVuSWQgPSBnZXRXb3JrRmxvd1J1bklkO1xuZnVuY3Rpb24gZ2V0V29ya1NwYWNlRGlyZWN0b3J5KCkge1xuICAgIGNvbnN0IHdvcmtzcGFjZURpcmVjdG9yeSA9IHByb2Nlc3MuZW52WydHSVRIVUJfV09SS1NQQUNFJ107XG4gICAgaWYgKCF3b3Jrc3BhY2VEaXJlY3RvcnkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmFibGUgdG8gZ2V0IEdJVEhVQl9XT1JLU1BBQ0UgZW52IHZhcmlhYmxlJyk7XG4gICAgfVxuICAgIHJldHVybiB3b3Jrc3BhY2VEaXJlY3Rvcnk7XG59XG5leHBvcnRzLmdldFdvcmtTcGFjZURpcmVjdG9yeSA9IGdldFdvcmtTcGFjZURpcmVjdG9yeTtcbmZ1bmN0aW9uIGdldFJldGVudGlvbkRheXMoKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52WydHSVRIVUJfUkVURU5USU9OX0RBWVMnXTtcbn1cbmV4cG9ydHMuZ2V0UmV0ZW50aW9uRGF5cyA9IGdldFJldGVudGlvbkRheXM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb25maWctdmFyaWFibGVzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuLyoqXG4gKiBDUkM2NDogY3ljbGljIHJlZHVuZGFuY3kgY2hlY2ssIDY0LWJpdHNcbiAqXG4gKiBJbiBvcmRlciB0byB2YWxpZGF0ZSB0aGF0IGFydGlmYWN0cyBhcmUgbm90IGJlaW5nIGNvcnJ1cHRlZCBvdmVyIHRoZSB3aXJlLCB0aGlzIHJlZHVuZGFuY3kgY2hlY2sgYWxsb3dzIHVzIHRvXG4gKiB2YWxpZGF0ZSB0aGF0IHRoZXJlIHdhcyBubyBjb3JydXB0aW9uIGR1cmluZyB0cmFuc21pc3Npb24uIFRoZSBpbXBsZW1lbnRhdGlvbiBoZXJlIGlzIGJhc2VkIG9uIEdvJ3MgaGFzaC9jcmM2NCBwa2csXG4gKiBidXQgd2l0aG91dCB0aGUgc2xpY2luZy1ieS04IG9wdGltaXphdGlvbjogaHR0cHM6Ly9jcy5vcGVuc291cmNlLmdvb2dsZS9nby9nby8rL21hc3RlcjpzcmMvaGFzaC9jcmM2NC9jcmM2NC5nb1xuICpcbiAqIFRoaXMgaW1wbGVtZW50YXRpb24gdXNlcyBhIHByZWdlbmVyYXRlZCB0YWJsZSBiYXNlZCBvbiAweDlBNkM5MzI5QUM0QkM5QjUgYXMgdGhlIHBvbHlub21pYWwsIHRoZSBzYW1lIHBvbHlub21pYWwgdGhhdFxuICogaXMgdXNlZCBmb3IgQXp1cmUgU3RvcmFnZTogaHR0cHM6Ly9naXRodWIuY29tL0F6dXJlL2F6dXJlLXN0b3JhZ2UtbmV0L2Jsb2IvY2JlNjA1ZjlmYWEwMWJmYzMwMDNkNzVmYzVhMTZiMmVhY2NmZTEwMi9MaWIvQ29tbW9uL0NvcmUvVXRpbC9DcmM2NC5jcyNMMjdcbiAqL1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLy8gd2hlbiB0cmFuc3BpbGUgdGFyZ2V0IGlzID49IEVTMjAyMCAoYWZ0ZXIgZHJvcHBpbmcgbm9kZSAxMikgdGhlc2UgY2FuIGJlIGNoYW5nZWQgdG8gYmlnaW50IGxpdGVyYWxzIC0gdHMoMjczNylcbmNvbnN0IFBSRUdFTl9QT0xZX1RBQkxFID0gW1xuICAgIEJpZ0ludCgnMHgwMDAwMDAwMDAwMDAwMDAwJyksXG4gICAgQmlnSW50KCcweDdGNkVGMEM4MzAzNTg5NzknKSxcbiAgICBCaWdJbnQoJzB4RkVEREUxOTA2MDZCMTJGMicpLFxuICAgIEJpZ0ludCgnMHg4MUIzMTE1ODUwNUU5QjhCJyksXG4gICAgQmlnSW50KCcweEM5NjJFNTczOTg0MUI2OEYnKSxcbiAgICBCaWdJbnQoJzB4QjYwQzE1QkJBODc0M0ZGNicpLFxuICAgIEJpZ0ludCgnMHgzN0JGMDRFM0Y4MkFBNDdEJyksXG4gICAgQmlnSW50KCcweDQ4RDFGNDJCQzgxRjJEMDQnKSxcbiAgICBCaWdJbnQoJzB4QTYxQ0VDQjQ2ODE0RkU3NScpLFxuICAgIEJpZ0ludCgnMHhEOTcyMUM3QzU4MjE3NzBDJyksXG4gICAgQmlnSW50KCcweDU4QzEwRDI0MDg3RkVDODcnKSxcbiAgICBCaWdJbnQoJzB4MjdBRkZERUMzODRBNjVGRScpLFxuICAgIEJpZ0ludCgnMHg2RjdFMDlDN0YwNTU0OEZBJyksXG4gICAgQmlnSW50KCcweDEwMTBGOTBGQzA2MEMxODMnKSxcbiAgICBCaWdJbnQoJzB4OTFBM0U4NTc5MDNFNUEwOCcpLFxuICAgIEJpZ0ludCgnMHhFRUNEMTg5RkEwMEJEMzcxJyksXG4gICAgQmlnSW50KCcweDc4RTBGRjNCODhCRTZGODEnKSxcbiAgICBCaWdJbnQoJzB4MDc4RTBGRjNCODhCRTZGOCcpLFxuICAgIEJpZ0ludCgnMHg4NjNEMUVBQkU4RDU3RDczJyksXG4gICAgQmlnSW50KCcweEY5NTNFRTYzRDhFMEY0MEEnKSxcbiAgICBCaWdJbnQoJzB4QjE4MjFBNDgxMEZGRDkwRScpLFxuICAgIEJpZ0ludCgnMHhDRUVDRUE4MDIwQ0E1MDc3JyksXG4gICAgQmlnSW50KCcweDRGNUZGQkQ4NzA5NENCRkMnKSxcbiAgICBCaWdJbnQoJzB4MzAzMTBCMTA0MEExNDI4NScpLFxuICAgIEJpZ0ludCgnMHhERUZDMTM4RkUwQUE5MUY0JyksXG4gICAgQmlnSW50KCcweEExOTJFMzQ3RDA5RjE4OEQnKSxcbiAgICBCaWdJbnQoJzB4MjAyMUYyMUY4MEMxODMwNicpLFxuICAgIEJpZ0ludCgnMHg1RjRGMDJEN0IwRjQwQTdGJyksXG4gICAgQmlnSW50KCcweDE3OUVGNkZDNzhFQjI3N0InKSxcbiAgICBCaWdJbnQoJzB4NjhGMDA2MzQ0OERFQUUwMicpLFxuICAgIEJpZ0ludCgnMHhFOTQzMTc2QzE4ODAzNTg5JyksXG4gICAgQmlnSW50KCcweDk2MkRFN0E0MjhCNUJDRjAnKSxcbiAgICBCaWdJbnQoJzB4RjFDMUZFNzcxMTdDREYwMicpLFxuICAgIEJpZ0ludCgnMHg4RUFGMEVCRjIxNDk1NjdCJyksXG4gICAgQmlnSW50KCcweDBGMUMxRkU3NzExN0NERjAnKSxcbiAgICBCaWdJbnQoJzB4NzA3MkVGMkY0MTIyNDQ4OScpLFxuICAgIEJpZ0ludCgnMHgzOEEzMUIwNDg5M0Q2OThEJyksXG4gICAgQmlnSW50KCcweDQ3Q0RFQkNDQjkwOEUwRjQnKSxcbiAgICBCaWdJbnQoJzB4QzY3RUZBOTRFOTU2N0I3RicpLFxuICAgIEJpZ0ludCgnMHhCOTEwMEE1Q0Q5NjNGMjA2JyksXG4gICAgQmlnSW50KCcweDU3REQxMkMzNzk2ODIxNzcnKSxcbiAgICBCaWdJbnQoJzB4MjhCM0UyMEI0OTVEQTgwRScpLFxuICAgIEJpZ0ludCgnMHhBOTAwRjM1MzE5MDMzMzg1JyksXG4gICAgQmlnSW50KCcweEQ2NkUwMzlCMjkzNkJBRkMnKSxcbiAgICBCaWdJbnQoJzB4OUVCRkY3QjBFMTI5OTdGOCcpLFxuICAgIEJpZ0ludCgnMHhFMUQxMDc3OEQxMUMxRTgxJyksXG4gICAgQmlnSW50KCcweDYwNjIxNjIwODE0Mjg1MEEnKSxcbiAgICBCaWdJbnQoJzB4MUYwQ0U2RThCMTc3MEM3MycpLFxuICAgIEJpZ0ludCgnMHg4OTIxMDE0Qzk5QzJCMDgzJyksXG4gICAgQmlnSW50KCcweEY2NEZGMTg0QTlGNzM5RkEnKSxcbiAgICBCaWdJbnQoJzB4NzdGQ0UwRENGOUE5QTI3MScpLFxuICAgIEJpZ0ludCgnMHgwODkyMTAxNEM5OUMyQjA4JyksXG4gICAgQmlnSW50KCcweDQwNDNFNDNGMDE4MzA2MEMnKSxcbiAgICBCaWdJbnQoJzB4M0YyRDE0RjczMUI2OEY3NScpLFxuICAgIEJpZ0ludCgnMHhCRTlFMDVBRjYxRTgxNEZFJyksXG4gICAgQmlnSW50KCcweEMxRjBGNTY3NTFERDlEODcnKSxcbiAgICBCaWdJbnQoJzB4MkYzREVERjhGMUQ2NEVGNicpLFxuICAgIEJpZ0ludCgnMHg1MDUzMUQzMEMxRTNDNzhGJyksXG4gICAgQmlnSW50KCcweEQxRTAwQzY4OTFCRDVDMDQnKSxcbiAgICBCaWdJbnQoJzB4QUU4RUZDQTBBMTg4RDU3RCcpLFxuICAgIEJpZ0ludCgnMHhFNjVGMDg4QjY5OTdGODc5JyksXG4gICAgQmlnSW50KCcweDk5MzFGODQzNTlBMjcxMDAnKSxcbiAgICBCaWdJbnQoJzB4MTg4MkU5MUIwOUZDRUE4QicpLFxuICAgIEJpZ0ludCgnMHg2N0VDMTlEMzM5Qzk2M0YyJyksXG4gICAgQmlnSW50KCcweEQ3NUFEQUJEN0E2RTJENkYnKSxcbiAgICBCaWdJbnQoJzB4QTgzNDJBNzU0QTVCQTQxNicpLFxuICAgIEJpZ0ludCgnMHgyOTg3M0IyRDFBMDUzRjlEJyksXG4gICAgQmlnSW50KCcweDU2RTlDQkU1MkEzMEI2RTQnKSxcbiAgICBCaWdJbnQoJzB4MUUzODNGQ0VFMjJGOUJFMCcpLFxuICAgIEJpZ0ludCgnMHg2MTU2Q0YwNkQyMUExMjk5JyksXG4gICAgQmlnSW50KCcweEUwRTVERTVFODI0NDg5MTInKSxcbiAgICBCaWdJbnQoJzB4OUY4QjJFOTZCMjcxMDA2QicpLFxuICAgIEJpZ0ludCgnMHg3MTQ2MzYwOTEyN0FEMzFBJyksXG4gICAgQmlnSW50KCcweDBFMjhDNkMxMjI0RjVBNjMnKSxcbiAgICBCaWdJbnQoJzB4OEY5QkQ3OTk3MjExQzFFOCcpLFxuICAgIEJpZ0ludCgnMHhGMEY1Mjc1MTQyMjQ0ODkxJyksXG4gICAgQmlnSW50KCcweEI4MjREMzdBOEEzQjY1OTUnKSxcbiAgICBCaWdJbnQoJzB4Qzc0QTIzQjJCQTBFRUNFQycpLFxuICAgIEJpZ0ludCgnMHg0NkY5MzJFQUVBNTA3NzY3JyksXG4gICAgQmlnSW50KCcweDM5OTdDMjIyREE2NUZFMUUnKSxcbiAgICBCaWdJbnQoJzB4QUZCQTI1ODZGMkQwNDJFRScpLFxuICAgIEJpZ0ludCgnMHhEMEQ0RDU0RUMyRTVDQjk3JyksXG4gICAgQmlnSW50KCcweDUxNjdDNDE2OTJCQjUwMUMnKSxcbiAgICBCaWdJbnQoJzB4MkUwOTM0REVBMjhFRDk2NScpLFxuICAgIEJpZ0ludCgnMHg2NkQ4QzBGNTZBOTFGNDYxJyksXG4gICAgQmlnSW50KCcweDE5QjYzMDNENUFBNDdEMTgnKSxcbiAgICBCaWdJbnQoJzB4OTgwNTIxNjUwQUZBRTY5MycpLFxuICAgIEJpZ0ludCgnMHhFNzZCRDFBRDNBQ0Y2RkVBJyksXG4gICAgQmlnSW50KCcweDA5QTZDOTMyOUFDNEJDOUInKSxcbiAgICBCaWdJbnQoJzB4NzZDODM5RkFBQUYxMzVFMicpLFxuICAgIEJpZ0ludCgnMHhGNzdCMjhBMkZBQUZBRTY5JyksXG4gICAgQmlnSW50KCcweDg4MTVEODZBQ0E5QTI3MTAnKSxcbiAgICBCaWdJbnQoJzB4QzBDNDJDNDEwMjg1MEExNCcpLFxuICAgIEJpZ0ludCgnMHhCRkFBREM4OTMyQjA4MzZEJyksXG4gICAgQmlnSW50KCcweDNFMTlDREQxNjJFRTE4RTYnKSxcbiAgICBCaWdJbnQoJzB4NDE3NzNEMTk1MkRCOTE5RicpLFxuICAgIEJpZ0ludCgnMHgyNjlCMjRDQTZCMTJGMjZEJyksXG4gICAgQmlnSW50KCcweDU5RjVENDAyNUIyNzdCMTQnKSxcbiAgICBCaWdJbnQoJzB4RDg0NkM1NUEwQjc5RTA5RicpLFxuICAgIEJpZ0ludCgnMHhBNzI4MzU5MjNCNEM2OUU2JyksXG4gICAgQmlnSW50KCcweEVGRjlDMUI5RjM1MzQ0RTInKSxcbiAgICBCaWdJbnQoJzB4OTA5NzMxNzFDMzY2Q0Q5QicpLFxuICAgIEJpZ0ludCgnMHgxMTI0MjAyOTkzMzg1NjEwJyksXG4gICAgQmlnSW50KCcweDZFNEFEMEUxQTMwRERGNjknKSxcbiAgICBCaWdJbnQoJzB4ODA4N0M4N0UwMzA2MEMxOCcpLFxuICAgIEJpZ0ludCgnMHhGRkU5MzhCNjMzMzM4NTYxJyksXG4gICAgQmlnSW50KCcweDdFNUEyOUVFNjM2RDFFRUEnKSxcbiAgICBCaWdJbnQoJzB4MDEzNEQ5MjY1MzU4OTc5MycpLFxuICAgIEJpZ0ludCgnMHg0OUU1MkQwRDlCNDdCQTk3JyksXG4gICAgQmlnSW50KCcweDM2OEJEREM1QUI3MjMzRUUnKSxcbiAgICBCaWdJbnQoJzB4QjczOENDOURGQjJDQTg2NScpLFxuICAgIEJpZ0ludCgnMHhDODU2M0M1NUNCMTkyMTFDJyksXG4gICAgQmlnSW50KCcweDVFN0JEQkYxRTNBQzlERUMnKSxcbiAgICBCaWdJbnQoJzB4MjExNTJCMzlEMzk5MTQ5NScpLFxuICAgIEJpZ0ludCgnMHhBMEE2M0E2MTgzQzc4RjFFJyksXG4gICAgQmlnSW50KCcweERGQzhDQUE5QjNGMjA2NjcnKSxcbiAgICBCaWdJbnQoJzB4OTcxOTNFODI3QkVEMkI2MycpLFxuICAgIEJpZ0ludCgnMHhFODc3Q0U0QTRCRDhBMjFBJyksXG4gICAgQmlnSW50KCcweDY5QzRERjEyMUI4NjM5OTEnKSxcbiAgICBCaWdJbnQoJzB4MTZBQTJGREEyQkIzQjBFOCcpLFxuICAgIEJpZ0ludCgnMHhGODY3Mzc0NThCQjg2Mzk5JyksXG4gICAgQmlnSW50KCcweDg3MDlDNzhEQkI4REVBRTAnKSxcbiAgICBCaWdJbnQoJzB4MDZCQUQ2RDVFQkQzNzE2QicpLFxuICAgIEJpZ0ludCgnMHg3OUQ0MjYxRERCRTZGODEyJyksXG4gICAgQmlnSW50KCcweDMxMDVEMjM2MTNGOUQ1MTYnKSxcbiAgICBCaWdJbnQoJzB4NEU2QjIyRkUyM0NDNUM2RicpLFxuICAgIEJpZ0ludCgnMHhDRkQ4MzNBNjczOTJDN0U0JyksXG4gICAgQmlnSW50KCcweEIwQjZDMzZFNDNBNzRFOUQnKSxcbiAgICBCaWdJbnQoJzB4OUE2QzkzMjlBQzRCQzlCNScpLFxuICAgIEJpZ0ludCgnMHhFNTAyNjNFMTlDN0U0MENDJyksXG4gICAgQmlnSW50KCcweDY0QjE3MkI5Q0MyMERCNDcnKSxcbiAgICBCaWdJbnQoJzB4MUJERjgyNzFGQzE1NTIzRScpLFxuICAgIEJpZ0ludCgnMHg1MzBFNzY1QTM0MEE3RjNBJyksXG4gICAgQmlnSW50KCcweDJDNjA4NjkyMDQzRkY2NDMnKSxcbiAgICBCaWdJbnQoJzB4QUREMzk3Q0E1NDYxNkRDOCcpLFxuICAgIEJpZ0ludCgnMHhEMkJENjcwMjY0NTRFNEIxJyksXG4gICAgQmlnSW50KCcweDNDNzA3RjlEQzQ1RjM3QzAnKSxcbiAgICBCaWdJbnQoJzB4NDMxRThGNTVGNDZBQkVCOScpLFxuICAgIEJpZ0ludCgnMHhDMkFEOUUwREE0MzQyNTMyJyksXG4gICAgQmlnSW50KCcweEJEQzM2RUM1OTQwMUFDNEInKSxcbiAgICBCaWdJbnQoJzB4RjUxMjlBRUU1QzFFODE0RicpLFxuICAgIEJpZ0ludCgnMHg4QTdDNkEyNjZDMkIwODM2JyksXG4gICAgQmlnSW50KCcweDBCQ0Y3QjdFM0M3NTkzQkQnKSxcbiAgICBCaWdJbnQoJzB4NzRBMThCQjYwQzQwMUFDNCcpLFxuICAgIEJpZ0ludCgnMHhFMjhDNkMxMjI0RjVBNjM0JyksXG4gICAgQmlnSW50KCcweDlERTI5Q0RBMTRDMDJGNEQnKSxcbiAgICBCaWdJbnQoJzB4MUM1MThEODI0NDlFQjRDNicpLFxuICAgIEJpZ0ludCgnMHg2MzNGN0Q0QTc0QUIzREJGJyksXG4gICAgQmlnSW50KCcweDJCRUU4OTYxQkNCNDEwQkInKSxcbiAgICBCaWdJbnQoJzB4NTQ4MDc5QTk4QzgxOTlDMicpLFxuICAgIEJpZ0ludCgnMHhENTMzNjhGMURDREYwMjQ5JyksXG4gICAgQmlnSW50KCcweEFBNUQ5ODM5RUNFQThCMzAnKSxcbiAgICBCaWdJbnQoJzB4NDQ5MDgwQTY0Q0UxNTg0MScpLFxuICAgIEJpZ0ludCgnMHgzQkZFNzA2RTdDRDREMTM4JyksXG4gICAgQmlnSW50KCcweEJBNEQ2MTM2MkM4QTRBQjMnKSxcbiAgICBCaWdJbnQoJzB4QzUyMzkxRkUxQ0JGQzNDQScpLFxuICAgIEJpZ0ludCgnMHg4REYyNjVENUQ0QTBFRUNFJyksXG4gICAgQmlnSW50KCcweEYyOUM5NTFERTQ5NTY3QjcnKSxcbiAgICBCaWdJbnQoJzB4NzMyRjg0NDVCNENCRkMzQycpLFxuICAgIEJpZ0ludCgnMHgwQzQxNzQ4RDg0RkU3NTQ1JyksXG4gICAgQmlnSW50KCcweDZCQUQ2RDVFQkQzNzE2QjcnKSxcbiAgICBCaWdJbnQoJzB4MTRDMzlEOTY4RDAyOUZDRScpLFxuICAgIEJpZ0ludCgnMHg5NTcwOENDRURENUMwNDQ1JyksXG4gICAgQmlnSW50KCcweEVBMUU3QzA2RUQ2OThEM0MnKSxcbiAgICBCaWdJbnQoJzB4QTJDRjg4MkQyNTc2QTAzOCcpLFxuICAgIEJpZ0ludCgnMHhEREExNzhFNTE1NDMyOTQxJyksXG4gICAgQmlnSW50KCcweDVDMTI2OUJENDUxREIyQ0EnKSxcbiAgICBCaWdJbnQoJzB4MjM3Qzk5NzU3NTI4M0JCMycpLFxuICAgIEJpZ0ludCgnMHhDREIxODFFQUQ1MjNFOEMyJyksXG4gICAgQmlnSW50KCcweEIyREY3MTIyRTUxNjYxQkInKSxcbiAgICBCaWdJbnQoJzB4MzM2QzYwN0FCNTQ4RkEzMCcpLFxuICAgIEJpZ0ludCgnMHg0QzAyOTBCMjg1N0Q3MzQ5JyksXG4gICAgQmlnSW50KCcweDA0RDM2NDk5NEQ2MjVFNEQnKSxcbiAgICBCaWdJbnQoJzB4N0JCRDk0NTE3RDU3RDczNCcpLFxuICAgIEJpZ0ludCgnMHhGQTBFODUwOTJEMDk0Q0JGJyksXG4gICAgQmlnSW50KCcweDg1NjA3NUMxMUQzQ0M1QzYnKSxcbiAgICBCaWdJbnQoJzB4MTM0RDkyNjUzNTg5NzkzNicpLFxuICAgIEJpZ0ludCgnMHg2QzIzNjJBRDA1QkNGMDRGJyksXG4gICAgQmlnSW50KCcweEVEOTA3M0Y1NTVFMjZCQzQnKSxcbiAgICBCaWdJbnQoJzB4OTJGRTgzM0Q2NUQ3RTJCRCcpLFxuICAgIEJpZ0ludCgnMHhEQTJGNzcxNkFEQzhDRkI5JyksXG4gICAgQmlnSW50KCcweEE1NDE4N0RFOURGRDQ2QzAnKSxcbiAgICBCaWdJbnQoJzB4MjRGMjk2ODZDREEzREQ0QicpLFxuICAgIEJpZ0ludCgnMHg1QjlDNjY0RUZEOTY1NDMyJyksXG4gICAgQmlnSW50KCcweEI1NTE3RUQxNUQ5RDg3NDMnKSxcbiAgICBCaWdJbnQoJzB4Q0EzRjhFMTk2REE4MEUzQScpLFxuICAgIEJpZ0ludCgnMHg0QjhDOUY0MTNERjY5NUIxJyksXG4gICAgQmlnSW50KCcweDM0RTI2Rjg5MERDMzFDQzgnKSxcbiAgICBCaWdJbnQoJzB4N0MzMzlCQTJDNURDMzFDQycpLFxuICAgIEJpZ0ludCgnMHgwMzVENkI2QUY1RTlCOEI1JyksXG4gICAgQmlnSW50KCcweDgyRUU3QTMyQTVCNzIzM0UnKSxcbiAgICBCaWdJbnQoJzB4RkQ4MDhBRkE5NTgyQUE0NycpLFxuICAgIEJpZ0ludCgnMHg0RDM2NDk5NEQ2MjVFNERBJyksXG4gICAgQmlnSW50KCcweDMyNThCOTVDRTYxMDZEQTMnKSxcbiAgICBCaWdJbnQoJzB4QjNFQkE4MDRCNjRFRjYyOCcpLFxuICAgIEJpZ0ludCgnMHhDQzg1NThDQzg2N0I3RjUxJyksXG4gICAgQmlnSW50KCcweDg0NTRBQ0U3NEU2NDUyNTUnKSxcbiAgICBCaWdJbnQoJzB4RkIzQTVDMkY3RTUxREIyQycpLFxuICAgIEJpZ0ludCgnMHg3QTg5NEQ3NzJFMEY0MEE3JyksXG4gICAgQmlnSW50KCcweDA1RTdCREJGMUUzQUM5REUnKSxcbiAgICBCaWdJbnQoJzB4RUIyQUE1MjBCRTMxMUFBRicpLFxuICAgIEJpZ0ludCgnMHg5NDQ0NTVFODhFMDQ5M0Q2JyksXG4gICAgQmlnSW50KCcweDE1Rjc0NEIwREU1QTA4NUQnKSxcbiAgICBCaWdJbnQoJzB4NkE5OUI0NzhFRTZGODEyNCcpLFxuICAgIEJpZ0ludCgnMHgyMjQ4NDA1MzI2NzBBQzIwJyksXG4gICAgQmlnSW50KCcweDVEMjZCMDlCMTY0NTI1NTknKSxcbiAgICBCaWdJbnQoJzB4REM5NUExQzM0NjFCQkVEMicpLFxuICAgIEJpZ0ludCgnMHhBM0ZCNTEwQjc2MkUzN0FCJyksXG4gICAgQmlnSW50KCcweDM1RDZCNkFGNUU5QjhCNUInKSxcbiAgICBCaWdJbnQoJzB4NEFCODQ2Njc2RUFFMDIyMicpLFxuICAgIEJpZ0ludCgnMHhDQjBCNTczRjNFRjA5OUE5JyksXG4gICAgQmlnSW50KCcweEI0NjVBN0Y3MEVDNTEwRDAnKSxcbiAgICBCaWdJbnQoJzB4RkNCNDUzRENDNkRBM0RENCcpLFxuICAgIEJpZ0ludCgnMHg4M0RBQTMxNEY2RUZCNEFEJyksXG4gICAgQmlnSW50KCcweDAyNjlCMjRDQTZCMTJGMjYnKSxcbiAgICBCaWdJbnQoJzB4N0QwNzQyODQ5Njg0QTY1RicpLFxuICAgIEJpZ0ludCgnMHg5M0NBNUExQjM2OEY3NTJFJyksXG4gICAgQmlnSW50KCcweEVDQTRBQUQzMDZCQUZDNTcnKSxcbiAgICBCaWdJbnQoJzB4NkQxN0JCOEI1NkU0NjdEQycpLFxuICAgIEJpZ0ludCgnMHgxMjc5NEI0MzY2RDFFRUE1JyksXG4gICAgQmlnSW50KCcweDVBQThCRjY4QUVDRUMzQTEnKSxcbiAgICBCaWdJbnQoJzB4MjVDNjRGQTA5RUZCNEFEOCcpLFxuICAgIEJpZ0ludCgnMHhBNDc1NUVGOENFQTVEMTUzJyksXG4gICAgQmlnSW50KCcweERCMUJBRTMwRkU5MDU4MkEnKSxcbiAgICBCaWdJbnQoJzB4QkNGN0I3RTNDNzU5M0JEOCcpLFxuICAgIEJpZ0ludCgnMHhDMzk5NDcyQkY3NkNCMkExJyksXG4gICAgQmlnSW50KCcweDQyMkE1NjczQTczMjI5MkEnKSxcbiAgICBCaWdJbnQoJzB4M0Q0NEE2QkI5NzA3QTA1MycpLFxuICAgIEJpZ0ludCgnMHg3NTk1NTI5MDVGMTg4RDU3JyksXG4gICAgQmlnSW50KCcweDBBRkJBMjU4NkYyRDA0MkUnKSxcbiAgICBCaWdJbnQoJzB4OEI0OEIzMDAzRjczOUZBNScpLFxuICAgIEJpZ0ludCgnMHhGNDI2NDNDODBGNDYxNkRDJyksXG4gICAgQmlnSW50KCcweDFBRUI1QjU3QUY0REM1QUQnKSxcbiAgICBCaWdJbnQoJzB4NjU4NUFCOUY5Rjc4NENENCcpLFxuICAgIEJpZ0ludCgnMHhFNDM2QkFDN0NGMjZENzVGJyksXG4gICAgQmlnSW50KCcweDlCNTg0QTBGRkYxMzVFMjYnKSxcbiAgICBCaWdJbnQoJzB4RDM4OUJFMjQzNzBDNzMyMicpLFxuICAgIEJpZ0ludCgnMHhBQ0U3NEVFQzA3MzlGQTVCJyksXG4gICAgQmlnSW50KCcweDJENTQ1RkI0NTc2NzYxRDAnKSxcbiAgICBCaWdJbnQoJzB4NTIzQUFGN0M2NzUyRThBOScpLFxuICAgIEJpZ0ludCgnMHhDNDE3NDhEODRGRTc1NDU5JyksXG4gICAgQmlnSW50KCcweEJCNzlCODEwN0ZEMkREMjAnKSxcbiAgICBCaWdJbnQoJzB4M0FDQUE5NDgyRjhDNDZBQicpLFxuICAgIEJpZ0ludCgnMHg0NUE0NTk4MDFGQjlDRkQyJyksXG4gICAgQmlnSW50KCcweDBENzVBREFCRDdBNkUyRDYnKSxcbiAgICBCaWdJbnQoJzB4NzIxQjVENjNFNzkzNkJBRicpLFxuICAgIEJpZ0ludCgnMHhGM0E4NEMzQkI3Q0RGMDI0JyksXG4gICAgQmlnSW50KCcweDhDQzZCQ0YzODdGODc5NUQnKSxcbiAgICBCaWdJbnQoJzB4NjIwQkE0NkMyN0YzQUEyQycpLFxuICAgIEJpZ0ludCgnMHgxRDY1NTRBNDE3QzYyMzU1JyksXG4gICAgQmlnSW50KCcweDlDRDY0NUZDNDc5OEI4REUnKSxcbiAgICBCaWdJbnQoJzB4RTNCOEI1MzQ3N0FEMzFBNycpLFxuICAgIEJpZ0ludCgnMHhBQjY5NDExRkJGQjIxQ0EzJyksXG4gICAgQmlnSW50KCcweEQ0MDdCMUQ3OEY4Nzk1REEnKSxcbiAgICBCaWdJbnQoJzB4NTVCNEEwOEZERkQ5MEU1MScpLFxuICAgIEJpZ0ludCgnMHgyQURBNTA0N0VGRUM4NzI4Jylcbl07XG5jbGFzcyBDUkM2NCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX2NyYyA9IEJpZ0ludCgwKTtcbiAgICB9XG4gICAgdXBkYXRlKGRhdGEpIHtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gdHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnID8gQnVmZmVyLmZyb20oZGF0YSkgOiBkYXRhO1xuICAgICAgICBsZXQgY3JjID0gQ1JDNjQuZmxpcDY0Qml0cyh0aGlzLl9jcmMpO1xuICAgICAgICBmb3IgKGNvbnN0IGRhdGFCeXRlIG9mIGJ1ZmZlcikge1xuICAgICAgICAgICAgY29uc3QgY3JjQnl0ZSA9IE51bWJlcihjcmMgJiBCaWdJbnQoMHhmZikpO1xuICAgICAgICAgICAgY3JjID0gUFJFR0VOX1BPTFlfVEFCTEVbY3JjQnl0ZSBeIGRhdGFCeXRlXSBeIChjcmMgPj4gQmlnSW50KDgpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jcmMgPSBDUkM2NC5mbGlwNjRCaXRzKGNyYyk7XG4gICAgfVxuICAgIGRpZ2VzdChlbmNvZGluZykge1xuICAgICAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICAgICAgICBjYXNlICdoZXgnOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmMudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRvQnVmZmVyKCkudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50b0J1ZmZlcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRvQnVmZmVyKCkge1xuICAgICAgICByZXR1cm4gQnVmZmVyLmZyb20oWzAsIDgsIDE2LCAyNCwgMzIsIDQwLCA0OCwgNTZdLm1hcChzID0+IE51bWJlcigodGhpcy5fY3JjID4+IEJpZ0ludChzKSkgJiBCaWdJbnQoMHhmZikpKSk7XG4gICAgfVxuICAgIHN0YXRpYyBmbGlwNjRCaXRzKG4pIHtcbiAgICAgICAgcmV0dXJuIChCaWdJbnQoMSkgPDwgQmlnSW50KDY0KSkgLSBCaWdJbnQoMSkgLSBuO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IENSQzY0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y3JjNjQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19zZXRNb2R1bGVEZWZhdWx0KSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xufSkgOiBmdW5jdGlvbihvLCB2KSB7XG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xufSk7XG52YXIgX19pbXBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydFN0YXIpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkRvd25sb2FkSHR0cENsaWVudCA9IHZvaWQgMDtcbmNvbnN0IGZzID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJmc1wiKSk7XG5jb25zdCBjb3JlID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJAYWN0aW9ucy9jb3JlXCIpKTtcbmNvbnN0IHpsaWIgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcInpsaWJcIikpO1xuY29uc3QgdXRpbHNfMSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xuY29uc3QgdXJsXzEgPSByZXF1aXJlKFwidXJsXCIpO1xuY29uc3Qgc3RhdHVzX3JlcG9ydGVyXzEgPSByZXF1aXJlKFwiLi9zdGF0dXMtcmVwb3J0ZXJcIik7XG5jb25zdCBwZXJmX2hvb2tzXzEgPSByZXF1aXJlKFwicGVyZl9ob29rc1wiKTtcbmNvbnN0IGh0dHBfbWFuYWdlcl8xID0gcmVxdWlyZShcIi4vaHR0cC1tYW5hZ2VyXCIpO1xuY29uc3QgY29uZmlnX3ZhcmlhYmxlc18xID0gcmVxdWlyZShcIi4vY29uZmlnLXZhcmlhYmxlc1wiKTtcbmNvbnN0IHJlcXVlc3RVdGlsc18xID0gcmVxdWlyZShcIi4vcmVxdWVzdFV0aWxzXCIpO1xuY2xhc3MgRG93bmxvYWRIdHRwQ2xpZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5kb3dubG9hZEh0dHBNYW5hZ2VyID0gbmV3IGh0dHBfbWFuYWdlcl8xLkh0dHBNYW5hZ2VyKGNvbmZpZ192YXJpYWJsZXNfMS5nZXREb3dubG9hZEZpbGVDb25jdXJyZW5jeSgpLCAnQGFjdGlvbnMvYXJ0aWZhY3QtZG93bmxvYWQnKTtcbiAgICAgICAgLy8gZG93bmxvYWRzIGFyZSB1c3VhbGx5IHNpZ25pZmljYW50bHkgZmFzdGVyIHRoYW4gdXBsb2FkcyBzbyBkaXNwbGF5IHN0YXR1cyBpbmZvcm1hdGlvbiBldmVyeSBzZWNvbmRcbiAgICAgICAgdGhpcy5zdGF0dXNSZXBvcnRlciA9IG5ldyBzdGF0dXNfcmVwb3J0ZXJfMS5TdGF0dXNSZXBvcnRlcigxMDAwKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyBhIGxpc3Qgb2YgYWxsIGFydGlmYWN0cyB0aGF0IGFyZSBpbiBhIHNwZWNpZmljIGNvbnRhaW5lclxuICAgICAqL1xuICAgIGxpc3RBcnRpZmFjdHMoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCBhcnRpZmFjdFVybCA9IHV0aWxzXzEuZ2V0QXJ0aWZhY3RVcmwoKTtcbiAgICAgICAgICAgIC8vIHVzZSB0aGUgZmlyc3QgY2xpZW50IGZyb20gdGhlIGh0dHBNYW5hZ2VyLCBga2VlcC1hbGl2ZWAgaXMgbm90IHVzZWQgc28gdGhlIGNvbm5lY3Rpb24gd2lsbCBjbG9zZSBpbW1lZGlhdGVseVxuICAgICAgICAgICAgY29uc3QgY2xpZW50ID0gdGhpcy5kb3dubG9hZEh0dHBNYW5hZ2VyLmdldENsaWVudCgwKTtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSB1dGlsc18xLmdldERvd25sb2FkSGVhZGVycygnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB5aWVsZCByZXF1ZXN0VXRpbHNfMS5yZXRyeUh0dHBDbGllbnRSZXF1ZXN0KCdMaXN0IEFydGlmYWN0cycsICgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHsgcmV0dXJuIGNsaWVudC5nZXQoYXJ0aWZhY3RVcmwsIGhlYWRlcnMpOyB9KSk7XG4gICAgICAgICAgICBjb25zdCBib2R5ID0geWllbGQgcmVzcG9uc2UucmVhZEJvZHkoKTtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGJvZHkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRmV0Y2hlcyBhIHNldCBvZiBjb250YWluZXIgaXRlbXMgdGhhdCBkZXNjcmliZSB0aGUgY29udGVudHMgb2YgYW4gYXJ0aWZhY3RcbiAgICAgKiBAcGFyYW0gYXJ0aWZhY3ROYW1lIHRoZSBuYW1lIG9mIHRoZSBhcnRpZmFjdFxuICAgICAqIEBwYXJhbSBjb250YWluZXJVcmwgdGhlIGFydGlmYWN0IGNvbnRhaW5lciBVUkwgZm9yIHRoZSBydW5cbiAgICAgKi9cbiAgICBnZXRDb250YWluZXJJdGVtcyhhcnRpZmFjdE5hbWUsIGNvbnRhaW5lclVybCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgLy8gdGhlIGl0ZW1QYXRoIHNlYXJjaCBwYXJhbWV0ZXIgY29udHJvbHMgd2hpY2ggY29udGFpbmVycyB3aWxsIGJlIHJldHVybmVkXG4gICAgICAgICAgICBjb25zdCByZXNvdXJjZVVybCA9IG5ldyB1cmxfMS5VUkwoY29udGFpbmVyVXJsKTtcbiAgICAgICAgICAgIHJlc291cmNlVXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ2l0ZW1QYXRoJywgYXJ0aWZhY3ROYW1lKTtcbiAgICAgICAgICAgIC8vIHVzZSB0aGUgZmlyc3QgY2xpZW50IGZyb20gdGhlIGh0dHBNYW5hZ2VyLCBga2VlcC1hbGl2ZWAgaXMgbm90IHVzZWQgc28gdGhlIGNvbm5lY3Rpb24gd2lsbCBjbG9zZSBpbW1lZGlhdGVseVxuICAgICAgICAgICAgY29uc3QgY2xpZW50ID0gdGhpcy5kb3dubG9hZEh0dHBNYW5hZ2VyLmdldENsaWVudCgwKTtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSB1dGlsc18xLmdldERvd25sb2FkSGVhZGVycygnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB5aWVsZCByZXF1ZXN0VXRpbHNfMS5yZXRyeUh0dHBDbGllbnRSZXF1ZXN0KCdHZXQgQ29udGFpbmVyIEl0ZW1zJywgKCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkgeyByZXR1cm4gY2xpZW50LmdldChyZXNvdXJjZVVybC50b1N0cmluZygpLCBoZWFkZXJzKTsgfSkpO1xuICAgICAgICAgICAgY29uc3QgYm9keSA9IHlpZWxkIHJlc3BvbnNlLnJlYWRCb2R5KCk7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShib2R5KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbmN1cnJlbnRseSBkb3dubG9hZHMgYWxsIHRoZSBmaWxlcyB0aGF0IGFyZSBwYXJ0IG9mIGFuIGFydGlmYWN0XG4gICAgICogQHBhcmFtIGRvd25sb2FkSXRlbXMgaW5mb3JtYXRpb24gYWJvdXQgd2hhdCBpdGVtcyB0byBkb3dubG9hZCBhbmQgd2hlcmUgdG8gc2F2ZSB0aGVtXG4gICAgICovXG4gICAgZG93bmxvYWRTaW5nbGVBcnRpZmFjdChkb3dubG9hZEl0ZW1zKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCBET1dOTE9BRF9DT05DVVJSRU5DWSA9IGNvbmZpZ192YXJpYWJsZXNfMS5nZXREb3dubG9hZEZpbGVDb25jdXJyZW5jeSgpO1xuICAgICAgICAgICAgLy8gbGltaXQgdGhlIG51bWJlciBvZiBmaWxlcyBkb3dubG9hZGVkIGF0IGEgc2luZ2xlIHRpbWVcbiAgICAgICAgICAgIGNvcmUuZGVidWcoYERvd25sb2FkIGZpbGUgY29uY3VycmVuY3kgaXMgc2V0IHRvICR7RE9XTkxPQURfQ09OQ1VSUkVOQ1l9YCk7XG4gICAgICAgICAgICBjb25zdCBwYXJhbGxlbERvd25sb2FkcyA9IFsuLi5uZXcgQXJyYXkoRE9XTkxPQURfQ09OQ1VSUkVOQ1kpLmtleXMoKV07XG4gICAgICAgICAgICBsZXQgY3VycmVudEZpbGUgPSAwO1xuICAgICAgICAgICAgbGV0IGRvd25sb2FkZWRGaWxlcyA9IDA7XG4gICAgICAgICAgICBjb3JlLmluZm8oYFRvdGFsIG51bWJlciBvZiBmaWxlcyB0aGF0IHdpbGwgYmUgZG93bmxvYWRlZDogJHtkb3dubG9hZEl0ZW1zLmxlbmd0aH1gKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzUmVwb3J0ZXIuc2V0VG90YWxOdW1iZXJPZkZpbGVzVG9Qcm9jZXNzKGRvd25sb2FkSXRlbXMubGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzUmVwb3J0ZXIuc3RhcnQoKTtcbiAgICAgICAgICAgIHlpZWxkIFByb21pc2UuYWxsKHBhcmFsbGVsRG93bmxvYWRzLm1hcCgoaW5kZXgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICB3aGlsZSAoY3VycmVudEZpbGUgPCBkb3dubG9hZEl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50RmlsZVRvRG93bmxvYWQgPSBkb3dubG9hZEl0ZW1zW2N1cnJlbnRGaWxlXTtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEZpbGUgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gcGVyZl9ob29rc18xLnBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLmRvd25sb2FkSW5kaXZpZHVhbEZpbGUoaW5kZXgsIGN1cnJlbnRGaWxlVG9Eb3dubG9hZC5zb3VyY2VMb2NhdGlvbiwgY3VycmVudEZpbGVUb0Rvd25sb2FkLnRhcmdldFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29yZS5pc0RlYnVnKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcmUuZGVidWcoYEZpbGU6ICR7Kytkb3dubG9hZGVkRmlsZXN9LyR7ZG93bmxvYWRJdGVtcy5sZW5ndGh9LiAke2N1cnJlbnRGaWxlVG9Eb3dubG9hZC50YXJnZXRQYXRofSB0b29rICR7KHBlcmZfaG9va3NfMS5wZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0VGltZSkudG9GaXhlZCgzKX0gbWlsbGlzZWNvbmRzIHRvIGZpbmlzaCBkb3dubG9hZGluZ2ApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdHVzUmVwb3J0ZXIuaW5jcmVtZW50UHJvY2Vzc2VkQ291bnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSkpXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBkb3dubG9hZCB0aGUgYXJ0aWZhY3Q6ICR7ZXJyb3J9YCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXR1c1JlcG9ydGVyLnN0b3AoKTtcbiAgICAgICAgICAgICAgICAvLyBzYWZldHkgZGlzcG9zZSBhbGwgY29ubmVjdGlvbnNcbiAgICAgICAgICAgICAgICB0aGlzLmRvd25sb2FkSHR0cE1hbmFnZXIuZGlzcG9zZUFuZFJlcGxhY2VBbGxDbGllbnRzKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERvd25sb2FkcyBhbiBpbmRpdmlkdWFsIGZpbGVcbiAgICAgKiBAcGFyYW0gaHR0cENsaWVudEluZGV4IHRoZSBpbmRleCBvZiB0aGUgaHR0cCBjbGllbnQgdGhhdCBpcyB1c2VkIHRvIG1ha2UgYWxsIG9mIHRoZSBjYWxsc1xuICAgICAqIEBwYXJhbSBhcnRpZmFjdExvY2F0aW9uIG9yaWdpbiBsb2NhdGlvbiB3aGVyZSBhIGZpbGUgd2lsbCBiZSBkb3dubG9hZGVkIGZyb21cbiAgICAgKiBAcGFyYW0gZG93bmxvYWRQYXRoIGRlc3RpbmF0aW9uIGxvY2F0aW9uIGZvciB0aGUgZmlsZSBiZWluZyBkb3dubG9hZGVkXG4gICAgICovXG4gICAgZG93bmxvYWRJbmRpdmlkdWFsRmlsZShodHRwQ2xpZW50SW5kZXgsIGFydGlmYWN0TG9jYXRpb24sIGRvd25sb2FkUGF0aCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgbGV0IHJldHJ5Q291bnQgPSAwO1xuICAgICAgICAgICAgY29uc3QgcmV0cnlMaW1pdCA9IGNvbmZpZ192YXJpYWJsZXNfMS5nZXRSZXRyeUxpbWl0KCk7XG4gICAgICAgICAgICBsZXQgZGVzdGluYXRpb25TdHJlYW0gPSBmcy5jcmVhdGVXcml0ZVN0cmVhbShkb3dubG9hZFBhdGgpO1xuICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IHV0aWxzXzEuZ2V0RG93bmxvYWRIZWFkZXJzKCdhcHBsaWNhdGlvbi9qc29uJywgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICAvLyBhIHNpbmdsZSBHRVQgcmVxdWVzdCBpcyB1c2VkIHRvIGRvd25sb2FkIGEgZmlsZVxuICAgICAgICAgICAgY29uc3QgbWFrZURvd25sb2FkUmVxdWVzdCA9ICgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjbGllbnQgPSB0aGlzLmRvd25sb2FkSHR0cE1hbmFnZXIuZ2V0Q2xpZW50KGh0dHBDbGllbnRJbmRleCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkIGNsaWVudC5nZXQoYXJ0aWZhY3RMb2NhdGlvbiwgaGVhZGVycyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIGNoZWNrIHRoZSByZXNwb25zZSBoZWFkZXJzIHRvIGRldGVybWluZSBpZiB0aGUgZmlsZSB3YXMgY29tcHJlc3NlZCB1c2luZyBnemlwXG4gICAgICAgICAgICBjb25zdCBpc0d6aXAgPSAoaW5jb21pbmdIZWFkZXJzKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgnY29udGVudC1lbmNvZGluZycgaW4gaW5jb21pbmdIZWFkZXJzICYmXG4gICAgICAgICAgICAgICAgICAgIGluY29taW5nSGVhZGVyc1snY29udGVudC1lbmNvZGluZyddID09PSAnZ3ppcCcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIEluY3JlbWVudHMgdGhlIGN1cnJlbnQgcmV0cnkgY291bnQgYW5kIHRoZW4gY2hlY2tzIGlmIHRoZSByZXRyeSBsaW1pdCBoYXMgYmVlbiByZWFjaGVkXG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBoYXZlIGJlZW4gdG9vIG1hbnkgcmV0cmllcywgZmFpbCBzbyB0aGUgZG93bmxvYWQgc3RvcHMuIElmIHRoZXJlIGlzIGEgcmV0cnlBZnRlclZhbHVlIHZhbHVlIHByb3ZpZGVkLFxuICAgICAgICAgICAgLy8gaXQgd2lsbCBiZSB1c2VkXG4gICAgICAgICAgICBjb25zdCBiYWNrT2ZmID0gKHJldHJ5QWZ0ZXJWYWx1ZSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIHJldHJ5Q291bnQrKztcbiAgICAgICAgICAgICAgICBpZiAocmV0cnlDb3VudCA+IHJldHJ5TGltaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihgUmV0cnkgbGltaXQgaGFzIGJlZW4gcmVhY2hlZC4gVW5hYmxlIHRvIGRvd25sb2FkICR7YXJ0aWZhY3RMb2NhdGlvbn1gKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvd25sb2FkSHR0cE1hbmFnZXIuZGlzcG9zZUFuZFJlcGxhY2VDbGllbnQoaHR0cENsaWVudEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJ5QWZ0ZXJWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQmFjayBvZmYgYnkgd2FpdGluZyB0aGUgc3BlY2lmaWVkIHRpbWUgZGVub3RlZCBieSB0aGUgcmV0cnktYWZ0ZXIgaGVhZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3JlLmluZm8oYEJhY2tvZmYgZHVlIHRvIHRvbyBtYW55IHJlcXVlc3RzLCByZXRyeSAjJHtyZXRyeUNvdW50fS4gV2FpdGluZyBmb3IgJHtyZXRyeUFmdGVyVmFsdWV9IG1pbGxpc2Vjb25kcyBiZWZvcmUgY29udGludWluZyB0aGUgZG93bmxvYWRgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHV0aWxzXzEuc2xlZXAocmV0cnlBZnRlclZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJhY2sgb2ZmIHVzaW5nIGFuIGV4cG9uZW50aWFsIHZhbHVlIHRoYXQgZGVwZW5kcyBvbiB0aGUgcmV0cnkgY291bnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhY2tvZmZUaW1lID0gdXRpbHNfMS5nZXRFeHBvbmVudGlhbFJldHJ5VGltZUluTWlsbGlzZWNvbmRzKHJldHJ5Q291bnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29yZS5pbmZvKGBFeHBvbmVudGlhbCBiYWNrb2ZmIGZvciByZXRyeSAjJHtyZXRyeUNvdW50fS4gV2FpdGluZyBmb3IgJHtiYWNrb2ZmVGltZX0gbWlsbGlzZWNvbmRzIGJlZm9yZSBjb250aW51aW5nIHRoZSBkb3dubG9hZGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgdXRpbHNfMS5zbGVlcChiYWNrb2ZmVGltZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29yZS5pbmZvKGBGaW5pc2hlZCBiYWNrb2ZmIGZvciByZXRyeSAjJHtyZXRyeUNvdW50fSwgY29udGludWluZyB3aXRoIGRvd25sb2FkYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCBpc0FsbEJ5dGVzUmVjZWl2ZWQgPSAoZXhwZWN0ZWQsIHJlY2VpdmVkKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gYmUgbGVuaWVudCwgaWYgYW55IGlucHV0IGlzIG1pc3NpbmcsIGFzc3VtZSBzdWNjZXNzLCBpLmUuIG5vdCB0cnVuY2F0ZWRcbiAgICAgICAgICAgICAgICBpZiAoIWV4cGVjdGVkIHx8XG4gICAgICAgICAgICAgICAgICAgICFyZWNlaXZlZCB8fFxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmVudlsnQUNUSU9OU19BUlRJRkFDVF9TS0lQX0RPV05MT0FEX1ZBTElEQVRJT04nXSkge1xuICAgICAgICAgICAgICAgICAgICBjb3JlLmluZm8oJ1NraXBwaW5nIGRvd25sb2FkIHZhbGlkYXRpb24uJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQoZXhwZWN0ZWQpID09PSByZWNlaXZlZDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCByZXNldERlc3RpbmF0aW9uU3RyZWFtID0gKGZpbGVEb3dubG9hZFBhdGgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvblN0cmVhbS5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIC8vIGF3YWl0IHVudGlsIGZpbGUgaXMgY3JlYXRlZCBhdCBkb3dubG9hZHBhdGg7IG5vZGUxNSBhbmQgdXAgZnMuY3JlYXRlV3JpdGVTdHJlYW0gaGFkIG5vdCBjcmVhdGVkIGEgZmlsZSB5ZXRcbiAgICAgICAgICAgICAgICB5aWVsZCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb25TdHJlYW0ub24oJ2Nsb3NlJywgcmVzb2x2ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXN0aW5hdGlvblN0cmVhbS53cml0YWJsZUZpbmlzaGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB5aWVsZCB1dGlsc18xLnJtRmlsZShmaWxlRG93bmxvYWRQYXRoKTtcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvblN0cmVhbSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGZpbGVEb3dubG9hZFBhdGgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBrZWVwIHRyeWluZyB0byBkb3dubG9hZCBhIGZpbGUgdW50aWwgYSByZXRyeSBsaW1pdCBoYXMgYmVlbiByZWFjaGVkXG4gICAgICAgICAgICB3aGlsZSAocmV0cnlDb3VudCA8PSByZXRyeUxpbWl0KSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlID0geWllbGQgbWFrZURvd25sb2FkUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgYW4gZXJyb3IgaXMgY2F1Z2h0LCBpdCBpcyB1c3VhbGx5IGluZGljYXRpdmUgb2YgYSB0aW1lb3V0IHNvIHJldHJ5IHRoZSBkb3dubG9hZFxuICAgICAgICAgICAgICAgICAgICBjb3JlLmluZm8oJ0FuIGVycm9yIG9jY3VycmVkIHdoaWxlIGF0dGVtcHRpbmcgdG8gZG93bmxvYWQgYSBmaWxlJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5jcmVtZW50IHRoZSByZXRyeUNvdW50IGFuZCB1c2UgZXhwb25lbnRpYWwgYmFja29mZiB0byB3YWl0IGJlZm9yZSBtYWtpbmcgdGhlIG5leHQgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICB5aWVsZCBiYWNrT2ZmKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgZm9yY2VSZXRyeSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICh1dGlsc18xLmlzU3VjY2Vzc1N0YXR1c0NvZGUocmVzcG9uc2UubWVzc2FnZS5zdGF0dXNDb2RlKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgYm9keSBjb250YWlucyB0aGUgY29udGVudHMgb2YgdGhlIGZpbGUgaG93ZXZlciBjYWxsaW5nIHJlc3BvbnNlLnJlYWRCb2R5KCkgY2F1c2VzIGFsbCB0aGUgY29udGVudCB0byBiZSBjb252ZXJ0ZWQgdG8gYSBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgLy8gd2hpY2ggY2FuIGNhdXNlIHNvbWUgZ3ppcCBlbmNvZGVkIGRhdGEgdG8gYmUgbG9zdFxuICAgICAgICAgICAgICAgICAgICAvLyBJbnN0ZWFkIG9mIHVzaW5nIHJlc3BvbnNlLnJlYWRCb2R5KCksIHJlc3BvbnNlLm1lc3NhZ2UgaXMgYSByZWFkYWJsZVN0cmVhbSB0aGF0IGNhbiBiZSBkaXJlY3RseSB1c2VkIHRvIGdldCB0aGUgcmF3IGJvZHkgY29udGVudHNcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzR3ppcHBlZCA9IGlzR3ppcChyZXNwb25zZS5tZXNzYWdlLmhlYWRlcnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgdGhpcy5waXBlUmVzcG9uc2VUb0ZpbGUocmVzcG9uc2UsIGRlc3RpbmF0aW9uU3RyZWFtLCBpc0d6aXBwZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzR3ppcHBlZCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQWxsQnl0ZXNSZWNlaXZlZChyZXNwb25zZS5tZXNzYWdlLmhlYWRlcnNbJ2NvbnRlbnQtbGVuZ3RoJ10sIHlpZWxkIHV0aWxzXzEuZ2V0RmlsZVNpemUoZG93bmxvYWRQYXRoKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JjZVJldHJ5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHJ5IG9uIGVycm9yLCBtb3N0IGxpa2VseSBzdHJlYW1zIHdlcmUgY29ycnVwdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JjZVJldHJ5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZm9yY2VSZXRyeSB8fCB1dGlsc18xLmlzUmV0cnlhYmxlU3RhdHVzQ29kZShyZXNwb25zZS5tZXNzYWdlLnN0YXR1c0NvZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvcmUuaW5mbyhgQSAke3Jlc3BvbnNlLm1lc3NhZ2Uuc3RhdHVzQ29kZX0gcmVzcG9uc2UgY29kZSBoYXMgYmVlbiByZWNlaXZlZCB3aGlsZSBhdHRlbXB0aW5nIHRvIGRvd25sb2FkIGFuIGFydGlmYWN0YCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc2V0RGVzdGluYXRpb25TdHJlYW0oZG93bmxvYWRQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgYSB0aHJvdHRsZWQgc3RhdHVzIGNvZGUgaXMgcmVjZWl2ZWQsIHRyeSB0byBnZXQgdGhlIHJldHJ5QWZ0ZXIgaGVhZGVyIHZhbHVlLCBlbHNlIGRpZmZlciB0byBzdGFuZGFyZCBleHBvbmVudGlhbCBiYWNrb2ZmXG4gICAgICAgICAgICAgICAgICAgIHV0aWxzXzEuaXNUaHJvdHRsZWRTdGF0dXNDb2RlKHJlc3BvbnNlLm1lc3NhZ2Uuc3RhdHVzQ29kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgID8geWllbGQgYmFja09mZih1dGlsc18xLnRyeUdldFJldHJ5QWZ0ZXJWYWx1ZVRpbWVJbk1pbGxpc2Vjb25kcyhyZXNwb25zZS5tZXNzYWdlLmhlYWRlcnMpKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB5aWVsZCBiYWNrT2ZmKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21lIHVuZXhwZWN0ZWQgcmVzcG9uc2UgY29kZSwgZmFpbCBpbW1lZGlhdGVseSBhbmQgc3RvcCB0aGUgZG93bmxvYWRcbiAgICAgICAgICAgICAgICAgICAgdXRpbHNfMS5kaXNwbGF5SHR0cERpYWdub3N0aWNzKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihgVW5leHBlY3RlZCBodHRwICR7cmVzcG9uc2UubWVzc2FnZS5zdGF0dXNDb2RlfSBkdXJpbmcgZG93bmxvYWQgZm9yICR7YXJ0aWZhY3RMb2NhdGlvbn1gKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUGlwZXMgdGhlIHJlc3BvbnNlIGZyb20gZG93bmxvYWRpbmcgYW4gaW5kaXZpZHVhbCBmaWxlIHRvIHRoZSBhcHByb3ByaWF0ZSBkZXN0aW5hdGlvbiBzdHJlYW0gd2hpbGUgZGVjb2RpbmcgZ3ppcCBjb250ZW50IGlmIG5lY2Vzc2FyeVxuICAgICAqIEBwYXJhbSByZXNwb25zZSB0aGUgaHR0cCByZXNwb25zZSByZWNlaXZlZCB3aGVuIGRvd25sb2FkaW5nIGEgZmlsZVxuICAgICAqIEBwYXJhbSBkZXN0aW5hdGlvblN0cmVhbSB0aGUgc3RyZWFtIHdoZXJlIHRoZSBmaWxlIHNob3VsZCBiZSB3cml0dGVuIHRvXG4gICAgICogQHBhcmFtIGlzR3ppcCBhIGJvb2xlYW4gZGVub3RpbmcgaWYgdGhlIGNvbnRlbnQgaXMgY29tcHJlc3NlZCB1c2luZyBnemlwIGFuZCBpZiB3ZSBuZWVkIHRvIGRlY29kZSBpdFxuICAgICAqL1xuICAgIHBpcGVSZXNwb25zZVRvRmlsZShyZXNwb25zZSwgZGVzdGluYXRpb25TdHJlYW0sIGlzR3ppcCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgeWllbGQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpc0d6aXApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZ3VuemlwID0gemxpYi5jcmVhdGVHdW56aXAoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcmUuZXJyb3IoYEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGF0dGVtcHRpbmcgdG8gcmVhZCB0aGUgcmVzcG9uc2Ugc3RyZWFtYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBndW56aXAuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uU3RyZWFtLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnBpcGUoZ3VuemlwKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcmUuZXJyb3IoYEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGF0dGVtcHRpbmcgdG8gZGVjb21wcmVzcyB0aGUgcmVzcG9uc2Ugc3RyZWFtYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvblN0cmVhbS5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5waXBlKGRlc3RpbmF0aW9uU3RyZWFtKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdjbG9zZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3JlLmVycm9yKGBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSB3cml0aW5nIGEgZG93bmxvYWRlZCBmaWxlIHRvICR7ZGVzdGluYXRpb25TdHJlYW0ucGF0aH1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcmUuZXJyb3IoYEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGF0dGVtcHRpbmcgdG8gcmVhZCB0aGUgcmVzcG9uc2Ugc3RyZWFtYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvblN0cmVhbS5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5waXBlKGRlc3RpbmF0aW9uU3RyZWFtKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdjbG9zZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3JlLmVycm9yKGBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSB3cml0aW5nIGEgZG93bmxvYWRlZCBmaWxlIHRvICR7ZGVzdGluYXRpb25TdHJlYW0ucGF0aH1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLkRvd25sb2FkSHR0cENsaWVudCA9IERvd25sb2FkSHR0cENsaWVudDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRvd25sb2FkLWh0dHAtY2xpZW50LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH0pO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKGsgIT09IFwiZGVmYXVsdFwiICYmIE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZ2V0RG93bmxvYWRTcGVjaWZpY2F0aW9uID0gdm9pZCAwO1xuY29uc3QgcGF0aCA9IF9faW1wb3J0U3RhcihyZXF1aXJlKFwicGF0aFwiKSk7XG4vKipcbiAqIENyZWF0ZXMgYSBzcGVjaWZpY2F0aW9uIGZvciBhIHNldCBvZiBmaWxlcyB0aGF0IHdpbGwgYmUgZG93bmxvYWRlZFxuICogQHBhcmFtIGFydGlmYWN0TmFtZSB0aGUgbmFtZSBvZiB0aGUgYXJ0aWZhY3RcbiAqIEBwYXJhbSBhcnRpZmFjdEVudHJpZXMgYSBzZXQgb2YgY29udGFpbmVyIGVudHJpZXMgdGhhdCBkZXNjcmliZSB0aGF0IGZpbGVzIHRoYXQgbWFrZSB1cCBhbiBhcnRpZmFjdFxuICogQHBhcmFtIGRvd25sb2FkUGF0aCB0aGUgcGF0aCB3aGVyZSB0aGUgYXJ0aWZhY3Qgd2lsbCBiZSBkb3dubG9hZGVkIHRvXG4gKiBAcGFyYW0gaW5jbHVkZVJvb3REaXJlY3Rvcnkgc3BlY2lmaWVzIGlmIHRoZXJlIHNob3VsZCBiZSBhbiBleHRyYSBkaXJlY3RvcnkgKGRlbm90ZWQgYnkgdGhlIGFydGlmYWN0IG5hbWUpIHdoZXJlIHRoZSBhcnRpZmFjdCBmaWxlcyBzaG91bGQgYmUgZG93bmxvYWRlZCB0b1xuICovXG5mdW5jdGlvbiBnZXREb3dubG9hZFNwZWNpZmljYXRpb24oYXJ0aWZhY3ROYW1lLCBhcnRpZmFjdEVudHJpZXMsIGRvd25sb2FkUGF0aCwgaW5jbHVkZVJvb3REaXJlY3RvcnkpIHtcbiAgICAvLyB1c2UgYSBzZXQgZm9yIHRoZSBkaXJlY3RvcnkgcGF0aHMgc28gdGhhdCB0aGVyZSBhcmUgbm8gZHVwbGljYXRlc1xuICAgIGNvbnN0IGRpcmVjdG9yaWVzID0gbmV3IFNldCgpO1xuICAgIGNvbnN0IHNwZWNpZmljYXRpb25zID0ge1xuICAgICAgICByb290RG93bmxvYWRMb2NhdGlvbjogaW5jbHVkZVJvb3REaXJlY3RvcnlcbiAgICAgICAgICAgID8gcGF0aC5qb2luKGRvd25sb2FkUGF0aCwgYXJ0aWZhY3ROYW1lKVxuICAgICAgICAgICAgOiBkb3dubG9hZFBhdGgsXG4gICAgICAgIGRpcmVjdG9yeVN0cnVjdHVyZTogW10sXG4gICAgICAgIGVtcHR5RmlsZXNUb0NyZWF0ZTogW10sXG4gICAgICAgIGZpbGVzVG9Eb3dubG9hZDogW11cbiAgICB9O1xuICAgIGZvciAoY29uc3QgZW50cnkgb2YgYXJ0aWZhY3RFbnRyaWVzKSB7XG4gICAgICAgIC8vIElnbm9yZSBhcnRpZmFjdHMgaW4gdGhlIGNvbnRhaW5lciB0aGF0IGRvbid0IGJlZ2luIHdpdGggdGhlIHNhbWUgbmFtZVxuICAgICAgICBpZiAoZW50cnkucGF0aC5zdGFydHNXaXRoKGAke2FydGlmYWN0TmFtZX0vYCkgfHxcbiAgICAgICAgICAgIGVudHJ5LnBhdGguc3RhcnRzV2l0aChgJHthcnRpZmFjdE5hbWV9XFxcXGApKSB7XG4gICAgICAgICAgICAvLyBub3JtYWxpemUgYWxsIHNlcGFyYXRvcnMgdG8gdGhlIGxvY2FsIE9TXG4gICAgICAgICAgICBjb25zdCBub3JtYWxpemVkUGF0aEVudHJ5ID0gcGF0aC5ub3JtYWxpemUoZW50cnkucGF0aCk7XG4gICAgICAgICAgICAvLyBlbnRyeS5wYXRoIGFsd2F5cyBzdGFydHMgd2l0aCB0aGUgYXJ0aWZhY3QgbmFtZSwgaWYgaW5jbHVkZVJvb3REaXJlY3RvcnkgaXMgZmFsc2UsIHJlbW92ZSB0aGUgbmFtZSBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHBhdGhcbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKGRvd25sb2FkUGF0aCwgaW5jbHVkZVJvb3REaXJlY3RvcnlcbiAgICAgICAgICAgICAgICA/IG5vcm1hbGl6ZWRQYXRoRW50cnlcbiAgICAgICAgICAgICAgICA6IG5vcm1hbGl6ZWRQYXRoRW50cnkucmVwbGFjZShhcnRpZmFjdE5hbWUsICcnKSk7XG4gICAgICAgICAgICAvLyBDYXNlIGluc2Vuc2l0aXZlIGZvbGRlciBzdHJ1Y3R1cmUgbWFpbnRhaW5lZCBpbiB0aGUgYmFja2VuZCwgbm90IGV2ZXJ5IGZvbGRlciBpcyBjcmVhdGVkIHNvIHRoZSAnZm9sZGVyJ1xuICAgICAgICAgICAgLy8gaXRlbVR5cGUgY2Fubm90IGJlIHJlbGllZCB1cG9uLiBUaGUgZmlsZSBtdXN0IGJlIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBkaXJlY3Rvcnkgc3RydWN0dXJlXG4gICAgICAgICAgICBpZiAoZW50cnkuaXRlbVR5cGUgPT09ICdmaWxlJykge1xuICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgZGlyZWN0b3JpZXMgdGhhdCB3ZSBuZWVkIHRvIGNyZWF0ZSBmcm9tIHRoZSBmaWxlUGF0aCBmb3IgZWFjaCBpbmRpdmlkdWFsIGZpbGVcbiAgICAgICAgICAgICAgICBkaXJlY3Rvcmllcy5hZGQocGF0aC5kaXJuYW1lKGZpbGVQYXRoKSk7XG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5LmZpbGVMZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQW4gZW1wdHkgZmlsZSB3YXMgdXBsb2FkZWQsIGNyZWF0ZSB0aGUgZW1wdHkgZmlsZXMgbG9jYWxseSBzbyB0aGF0IG5vIGV4dHJhIGh0dHAgY2FsbHMgYXJlIG1hZGVcbiAgICAgICAgICAgICAgICAgICAgc3BlY2lmaWNhdGlvbnMuZW1wdHlGaWxlc1RvQ3JlYXRlLnB1c2goZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3BlY2lmaWNhdGlvbnMuZmlsZXNUb0Rvd25sb2FkLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlTG9jYXRpb246IGVudHJ5LmNvbnRlbnRMb2NhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFBhdGg6IGZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzcGVjaWZpY2F0aW9ucy5kaXJlY3RvcnlTdHJ1Y3R1cmUgPSBBcnJheS5mcm9tKGRpcmVjdG9yaWVzKTtcbiAgICByZXR1cm4gc3BlY2lmaWNhdGlvbnM7XG59XG5leHBvcnRzLmdldERvd25sb2FkU3BlY2lmaWNhdGlvbiA9IGdldERvd25sb2FkU3BlY2lmaWNhdGlvbjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRvd25sb2FkLXNwZWNpZmljYXRpb24uanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkh0dHBNYW5hZ2VyID0gdm9pZCAwO1xuY29uc3QgdXRpbHNfMSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xuLyoqXG4gKiBVc2VkIGZvciBtYW5hZ2luZyBodHRwIGNsaWVudHMgZHVyaW5nIGVpdGhlciB1cGxvYWQgb3IgZG93bmxvYWRcbiAqL1xuY2xhc3MgSHR0cE1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKGNsaWVudENvdW50LCB1c2VyQWdlbnQpIHtcbiAgICAgICAgaWYgKGNsaWVudENvdW50IDwgMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGVyZSBtdXN0IGJlIGF0IGxlYXN0IG9uZSBjbGllbnQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVzZXJBZ2VudCA9IHVzZXJBZ2VudDtcbiAgICAgICAgdGhpcy5jbGllbnRzID0gbmV3IEFycmF5KGNsaWVudENvdW50KS5maWxsKHV0aWxzXzEuY3JlYXRlSHR0cENsaWVudCh1c2VyQWdlbnQpKTtcbiAgICB9XG4gICAgZ2V0Q2xpZW50KGluZGV4KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNsaWVudHNbaW5kZXhdO1xuICAgIH1cbiAgICAvLyBjbGllbnQgZGlzcG9zYWwgaXMgbmVjZXNzYXJ5IGlmIGEga2VlcC1hbGl2ZSBjb25uZWN0aW9uIGlzIHVzZWQgdG8gcHJvcGVybHkgY2xvc2UgdGhlIGNvbm5lY3Rpb25cbiAgICAvLyBmb3IgbW9yZSBpbmZvcm1hdGlvbiBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hY3Rpb25zL2h0dHAtY2xpZW50L2Jsb2IvMDRlNWFkNzNjZDNmZDFmNTYxMGEzMjExNmIwNzU5ZWRkZjY1NzBkMi9pbmRleC50cyNMMjkyXG4gICAgZGlzcG9zZUFuZFJlcGxhY2VDbGllbnQoaW5kZXgpIHtcbiAgICAgICAgdGhpcy5jbGllbnRzW2luZGV4XS5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMuY2xpZW50c1tpbmRleF0gPSB1dGlsc18xLmNyZWF0ZUh0dHBDbGllbnQodGhpcy51c2VyQWdlbnQpO1xuICAgIH1cbiAgICBkaXNwb3NlQW5kUmVwbGFjZUFsbENsaWVudHMoKSB7XG4gICAgICAgIGZvciAoY29uc3QgW2luZGV4XSBvZiB0aGlzLmNsaWVudHMuZW50cmllcygpKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3Bvc2VBbmRSZXBsYWNlQ2xpZW50KGluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuSHR0cE1hbmFnZXIgPSBIdHRwTWFuYWdlcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWh0dHAtbWFuYWdlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuY2hlY2tBcnRpZmFjdEZpbGVQYXRoID0gZXhwb3J0cy5jaGVja0FydGlmYWN0TmFtZSA9IHZvaWQgMDtcbmNvbnN0IGNvcmVfMSA9IHJlcXVpcmUoXCJAYWN0aW9ucy9jb3JlXCIpO1xuLyoqXG4gKiBJbnZhbGlkIGNoYXJhY3RlcnMgdGhhdCBjYW5ub3QgYmUgaW4gdGhlIGFydGlmYWN0IG5hbWUgb3IgYW4gdXBsb2FkZWQgZmlsZS4gV2lsbCBiZSByZWplY3RlZFxuICogZnJvbSB0aGUgc2VydmVyIGlmIGF0dGVtcHRlZCB0byBiZSBzZW50IG92ZXIuIFRoZXNlIGNoYXJhY3RlcnMgYXJlIG5vdCBhbGxvd2VkIGR1ZSB0byBsaW1pdGF0aW9ucyB3aXRoIGNlcnRhaW5cbiAqIGZpbGUgc3lzdGVtcyBzdWNoIGFzIE5URlMuIFRvIG1haW50YWluIHBsYXRmb3JtLWFnbm9zdGljIGJlaGF2aW9yLCBhbGwgY2hhcmFjdGVycyB0aGF0IGFyZSBub3Qgc3VwcG9ydGVkIGJ5IGFuXG4gKiBpbmRpdmlkdWFsIGZpbGVzeXN0ZW0vcGxhdGZvcm0gd2lsbCBub3QgYmUgc3VwcG9ydGVkIG9uIGFsbCBmaWxlU3lzdGVtcy9wbGF0Zm9ybXNcbiAqXG4gKiBGaWxlUGF0aHMgY2FuIGluY2x1ZGUgY2hhcmFjdGVycyBzdWNoIGFzIFxcIGFuZCAvIHdoaWNoIGFyZSBub3QgcGVybWl0dGVkIGluIHRoZSBhcnRpZmFjdCBuYW1lIGFsb25lXG4gKi9cbmNvbnN0IGludmFsaWRBcnRpZmFjdEZpbGVQYXRoQ2hhcmFjdGVycyA9IG5ldyBNYXAoW1xuICAgIFsnXCInLCAnIERvdWJsZSBxdW90ZSBcIiddLFxuICAgIFsnOicsICcgQ29sb24gOiddLFxuICAgIFsnPCcsICcgTGVzcyB0aGFuIDwnXSxcbiAgICBbJz4nLCAnIEdyZWF0ZXIgdGhhbiA+J10sXG4gICAgWyd8JywgJyBWZXJ0aWNhbCBiYXIgfCddLFxuICAgIFsnKicsICcgQXN0ZXJpc2sgKiddLFxuICAgIFsnPycsICcgUXVlc3Rpb24gbWFyayA/J10sXG4gICAgWydcXHInLCAnIENhcnJpYWdlIHJldHVybiBcXFxcciddLFxuICAgIFsnXFxuJywgJyBMaW5lIGZlZWQgXFxcXG4nXVxuXSk7XG5jb25zdCBpbnZhbGlkQXJ0aWZhY3ROYW1lQ2hhcmFjdGVycyA9IG5ldyBNYXAoW1xuICAgIC4uLmludmFsaWRBcnRpZmFjdEZpbGVQYXRoQ2hhcmFjdGVycyxcbiAgICBbJ1xcXFwnLCAnIEJhY2tzbGFzaCBcXFxcJ10sXG4gICAgWycvJywgJyBGb3J3YXJkIHNsYXNoIC8nXVxuXSk7XG4vKipcbiAqIFNjYW5zIHRoZSBuYW1lIG9mIHRoZSBhcnRpZmFjdCB0byBtYWtlIHN1cmUgdGhlcmUgYXJlIG5vIGlsbGVnYWwgY2hhcmFjdGVyc1xuICovXG5mdW5jdGlvbiBjaGVja0FydGlmYWN0TmFtZShuYW1lKSB7XG4gICAgaWYgKCFuYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQXJ0aWZhY3QgbmFtZTogJHtuYW1lfSwgaXMgaW5jb3JyZWN0bHkgcHJvdmlkZWRgKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBbaW52YWxpZENoYXJhY3RlcktleSwgZXJyb3JNZXNzYWdlRm9yQ2hhcmFjdGVyXSBvZiBpbnZhbGlkQXJ0aWZhY3ROYW1lQ2hhcmFjdGVycykge1xuICAgICAgICBpZiAobmFtZS5pbmNsdWRlcyhpbnZhbGlkQ2hhcmFjdGVyS2V5KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBcnRpZmFjdCBuYW1lIGlzIG5vdCB2YWxpZDogJHtuYW1lfS4gQ29udGFpbnMgdGhlIGZvbGxvd2luZyBjaGFyYWN0ZXI6ICR7ZXJyb3JNZXNzYWdlRm9yQ2hhcmFjdGVyfVxuICAgICAgICAgIFxuSW52YWxpZCBjaGFyYWN0ZXJzIGluY2x1ZGU6ICR7QXJyYXkuZnJvbShpbnZhbGlkQXJ0aWZhY3ROYW1lQ2hhcmFjdGVycy52YWx1ZXMoKSkudG9TdHJpbmcoKX1cbiAgICAgICAgICBcblRoZXNlIGNoYXJhY3RlcnMgYXJlIG5vdCBhbGxvd2VkIGluIHRoZSBhcnRpZmFjdCBuYW1lIGR1ZSB0byBsaW1pdGF0aW9ucyB3aXRoIGNlcnRhaW4gZmlsZSBzeXN0ZW1zIHN1Y2ggYXMgTlRGUy4gVG8gbWFpbnRhaW4gZmlsZSBzeXN0ZW0gYWdub3N0aWMgYmVoYXZpb3IsIHRoZXNlIGNoYXJhY3RlcnMgYXJlIGludGVudGlvbmFsbHkgbm90IGFsbG93ZWQgdG8gcHJldmVudCBwb3RlbnRpYWwgcHJvYmxlbXMgd2l0aCBkb3dubG9hZHMgb24gZGlmZmVyZW50IGZpbGUgc3lzdGVtcy5gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb3JlXzEuaW5mbyhgQXJ0aWZhY3QgbmFtZSBpcyB2YWxpZCFgKTtcbn1cbmV4cG9ydHMuY2hlY2tBcnRpZmFjdE5hbWUgPSBjaGVja0FydGlmYWN0TmFtZTtcbi8qKlxuICogU2NhbnMgdGhlIG5hbWUgb2YgdGhlIGZpbGVQYXRoIHVzZWQgdG8gbWFrZSBzdXJlIHRoZXJlIGFyZSBubyBpbGxlZ2FsIGNoYXJhY3RlcnNcbiAqL1xuZnVuY3Rpb24gY2hlY2tBcnRpZmFjdEZpbGVQYXRoKHBhdGgpIHtcbiAgICBpZiAoIXBhdGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBcnRpZmFjdCBwYXRoOiAke3BhdGh9LCBpcyBpbmNvcnJlY3RseSBwcm92aWRlZGApO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFtpbnZhbGlkQ2hhcmFjdGVyS2V5LCBlcnJvck1lc3NhZ2VGb3JDaGFyYWN0ZXJdIG9mIGludmFsaWRBcnRpZmFjdEZpbGVQYXRoQ2hhcmFjdGVycykge1xuICAgICAgICBpZiAocGF0aC5pbmNsdWRlcyhpbnZhbGlkQ2hhcmFjdGVyS2V5KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBcnRpZmFjdCBwYXRoIGlzIG5vdCB2YWxpZDogJHtwYXRofS4gQ29udGFpbnMgdGhlIGZvbGxvd2luZyBjaGFyYWN0ZXI6ICR7ZXJyb3JNZXNzYWdlRm9yQ2hhcmFjdGVyfVxuICAgICAgICAgIFxuSW52YWxpZCBjaGFyYWN0ZXJzIGluY2x1ZGU6ICR7QXJyYXkuZnJvbShpbnZhbGlkQXJ0aWZhY3RGaWxlUGF0aENoYXJhY3RlcnMudmFsdWVzKCkpLnRvU3RyaW5nKCl9XG4gICAgICAgICAgXG5UaGUgZm9sbG93aW5nIGNoYXJhY3RlcnMgYXJlIG5vdCBhbGxvd2VkIGluIGZpbGVzIHRoYXQgYXJlIHVwbG9hZGVkIGR1ZSB0byBsaW1pdGF0aW9ucyB3aXRoIGNlcnRhaW4gZmlsZSBzeXN0ZW1zIHN1Y2ggYXMgTlRGUy4gVG8gbWFpbnRhaW4gZmlsZSBzeXN0ZW0gYWdub3N0aWMgYmVoYXZpb3IsIHRoZXNlIGNoYXJhY3RlcnMgYXJlIGludGVudGlvbmFsbHkgbm90IGFsbG93ZWQgdG8gcHJldmVudCBwb3RlbnRpYWwgcHJvYmxlbXMgd2l0aCBkb3dubG9hZHMgb24gZGlmZmVyZW50IGZpbGUgc3lzdGVtcy5cbiAgICAgICAgICBgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuY2hlY2tBcnRpZmFjdEZpbGVQYXRoID0gY2hlY2tBcnRpZmFjdEZpbGVQYXRoO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGF0aC1hbmQtYXJ0aWZhY3QtbmFtZS12YWxpZGF0aW9uLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH0pO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKGsgIT09IFwiZGVmYXVsdFwiICYmIE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5yZXRyeUh0dHBDbGllbnRSZXF1ZXN0ID0gZXhwb3J0cy5yZXRyeSA9IHZvaWQgMDtcbmNvbnN0IHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbmNvbnN0IGNvcmUgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcIkBhY3Rpb25zL2NvcmVcIikpO1xuY29uc3QgY29uZmlnX3ZhcmlhYmxlc18xID0gcmVxdWlyZShcIi4vY29uZmlnLXZhcmlhYmxlc1wiKTtcbmZ1bmN0aW9uIHJldHJ5KG5hbWUsIG9wZXJhdGlvbiwgY3VzdG9tRXJyb3JNZXNzYWdlcywgbWF4QXR0ZW1wdHMpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIGxldCBzdGF0dXNDb2RlID0gdW5kZWZpbmVkO1xuICAgICAgICBsZXQgaXNSZXRyeWFibGUgPSBmYWxzZTtcbiAgICAgICAgbGV0IGVycm9yTWVzc2FnZSA9ICcnO1xuICAgICAgICBsZXQgY3VzdG9tRXJyb3JJbmZvcm1hdGlvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IGF0dGVtcHQgPSAxO1xuICAgICAgICB3aGlsZSAoYXR0ZW1wdCA8PSBtYXhBdHRlbXB0cykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHlpZWxkIG9wZXJhdGlvbigpO1xuICAgICAgICAgICAgICAgIHN0YXR1c0NvZGUgPSByZXNwb25zZS5tZXNzYWdlLnN0YXR1c0NvZGU7XG4gICAgICAgICAgICAgICAgaWYgKHV0aWxzXzEuaXNTdWNjZXNzU3RhdHVzQ29kZShzdGF0dXNDb2RlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEV4dHJhIGVycm9yIGluZm9ybWF0aW9uIHRoYXQgd2Ugd2FudCB0byBkaXNwbGF5IGlmIGEgcGFydGljdWxhciByZXNwb25zZSBjb2RlIGlzIGhpdFxuICAgICAgICAgICAgICAgIGlmIChzdGF0dXNDb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbUVycm9ySW5mb3JtYXRpb24gPSBjdXN0b21FcnJvck1lc3NhZ2VzLmdldChzdGF0dXNDb2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaXNSZXRyeWFibGUgPSB1dGlsc18xLmlzUmV0cnlhYmxlU3RhdHVzQ29kZShzdGF0dXNDb2RlKTtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBgQXJ0aWZhY3Qgc2VydmljZSByZXNwb25kZWQgd2l0aCAke3N0YXR1c0NvZGV9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGlzUmV0cnlhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc1JldHJ5YWJsZSkge1xuICAgICAgICAgICAgICAgIGNvcmUuaW5mbyhgJHtuYW1lfSAtIEVycm9yIGlzIG5vdCByZXRyeWFibGVgKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdXRpbHNfMS5kaXNwbGF5SHR0cERpYWdub3N0aWNzKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb3JlLmluZm8oYCR7bmFtZX0gLSBBdHRlbXB0ICR7YXR0ZW1wdH0gb2YgJHttYXhBdHRlbXB0c30gZmFpbGVkIHdpdGggZXJyb3I6ICR7ZXJyb3JNZXNzYWdlfWApO1xuICAgICAgICAgICAgeWllbGQgdXRpbHNfMS5zbGVlcCh1dGlsc18xLmdldEV4cG9uZW50aWFsUmV0cnlUaW1lSW5NaWxsaXNlY29uZHMoYXR0ZW1wdCkpO1xuICAgICAgICAgICAgYXR0ZW1wdCsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgICAgICAgdXRpbHNfMS5kaXNwbGF5SHR0cERpYWdub3N0aWNzKHJlc3BvbnNlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3VzdG9tRXJyb3JJbmZvcm1hdGlvbikge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoYCR7bmFtZX0gZmFpbGVkOiAke2N1c3RvbUVycm9ySW5mb3JtYXRpb259YCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgRXJyb3IoYCR7bmFtZX0gZmFpbGVkOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICB9KTtcbn1cbmV4cG9ydHMucmV0cnkgPSByZXRyeTtcbmZ1bmN0aW9uIHJldHJ5SHR0cENsaWVudFJlcXVlc3QobmFtZSwgbWV0aG9kLCBjdXN0b21FcnJvck1lc3NhZ2VzID0gbmV3IE1hcCgpLCBtYXhBdHRlbXB0cyA9IGNvbmZpZ192YXJpYWJsZXNfMS5nZXRSZXRyeUxpbWl0KCkpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICByZXR1cm4geWllbGQgcmV0cnkobmFtZSwgbWV0aG9kLCBjdXN0b21FcnJvck1lc3NhZ2VzLCBtYXhBdHRlbXB0cyk7XG4gICAgfSk7XG59XG5leHBvcnRzLnJldHJ5SHR0cENsaWVudFJlcXVlc3QgPSByZXRyeUh0dHBDbGllbnRSZXF1ZXN0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVxdWVzdFV0aWxzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5TdGF0dXNSZXBvcnRlciA9IHZvaWQgMDtcbmNvbnN0IGNvcmVfMSA9IHJlcXVpcmUoXCJAYWN0aW9ucy9jb3JlXCIpO1xuLyoqXG4gKiBTdGF0dXMgUmVwb3J0ZXIgdGhhdCBkaXNwbGF5cyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgcHJvZ3Jlc3Mvc3RhdHVzIG9mIGFuIGFydGlmYWN0IHRoYXQgaXMgYmVpbmcgdXBsb2FkZWQgb3IgZG93bmxvYWRlZFxuICpcbiAqIFZhcmlhYmxlIGRpc3BsYXkgdGltZSB0aGF0IGNhbiBiZSBhZGp1c3RlZCB1c2luZyB0aGUgZGlzcGxheUZyZXF1ZW5jeUluTWlsbGlzZWNvbmRzIHZhcmlhYmxlXG4gKiBUaGUgdG90YWwgc3RhdHVzIG9mIHRoZSB1cGxvYWQvZG93bmxvYWQgZ2V0cyBkaXNwbGF5ZWQgYWNjb3JkaW5nIHRvIHRoaXMgdmFsdWVcbiAqIElmIHRoZXJlIGlzIGEgbGFyZ2UgZmlsZSB0aGF0IGlzIGJlaW5nIHVwbG9hZGVkLCBleHRyYSBpbmZvcm1hdGlvbiBhYm91dCB0aGUgaW5kaXZpZHVhbCBzdGF0dXMgY2FuIGFsc28gYmUgZGlzcGxheWVkIHVzaW5nIHRoZSB1cGRhdGVMYXJnZUZpbGVTdGF0dXMgZnVuY3Rpb25cbiAqL1xuY2xhc3MgU3RhdHVzUmVwb3J0ZXIge1xuICAgIGNvbnN0cnVjdG9yKGRpc3BsYXlGcmVxdWVuY3lJbk1pbGxpc2Vjb25kcykge1xuICAgICAgICB0aGlzLnRvdGFsTnVtYmVyT2ZGaWxlc1RvUHJvY2VzcyA9IDA7XG4gICAgICAgIHRoaXMucHJvY2Vzc2VkQ291bnQgPSAwO1xuICAgICAgICB0aGlzLmxhcmdlRmlsZXMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMudG90YWxGaWxlU3RhdHVzID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmRpc3BsYXlGcmVxdWVuY3lJbk1pbGxpc2Vjb25kcyA9IGRpc3BsYXlGcmVxdWVuY3lJbk1pbGxpc2Vjb25kcztcbiAgICB9XG4gICAgc2V0VG90YWxOdW1iZXJPZkZpbGVzVG9Qcm9jZXNzKGZpbGVUb3RhbCkge1xuICAgICAgICB0aGlzLnRvdGFsTnVtYmVyT2ZGaWxlc1RvUHJvY2VzcyA9IGZpbGVUb3RhbDtcbiAgICAgICAgdGhpcy5wcm9jZXNzZWRDb3VudCA9IDA7XG4gICAgfVxuICAgIHN0YXJ0KCkge1xuICAgICAgICAvLyBkaXNwbGF5cyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgdG90YWwgdXBsb2FkL2Rvd25sb2FkIHN0YXR1c1xuICAgICAgICB0aGlzLnRvdGFsRmlsZVN0YXR1cyA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIC8vIGRpc3BsYXkgMSBkZWNpbWFsIHBsYWNlIHdpdGhvdXQgYW55IHJvdW5kaW5nXG4gICAgICAgICAgICBjb25zdCBwZXJjZW50YWdlID0gdGhpcy5mb3JtYXRQZXJjZW50YWdlKHRoaXMucHJvY2Vzc2VkQ291bnQsIHRoaXMudG90YWxOdW1iZXJPZkZpbGVzVG9Qcm9jZXNzKTtcbiAgICAgICAgICAgIGNvcmVfMS5pbmZvKGBUb3RhbCBmaWxlIGNvdW50OiAke3RoaXMudG90YWxOdW1iZXJPZkZpbGVzVG9Qcm9jZXNzfSAtLS0tIFByb2Nlc3NlZCBmaWxlICMke3RoaXMucHJvY2Vzc2VkQ291bnR9ICgke3BlcmNlbnRhZ2Uuc2xpY2UoMCwgcGVyY2VudGFnZS5pbmRleE9mKCcuJykgKyAyKX0lKWApO1xuICAgICAgICB9LCB0aGlzLmRpc3BsYXlGcmVxdWVuY3lJbk1pbGxpc2Vjb25kcyk7XG4gICAgfVxuICAgIC8vIGlmIHRoZXJlIGlzIGEgbGFyZ2UgZmlsZSB0aGF0IGlzIGJlaW5nIHVwbG9hZGVkIGluIGNodW5rcywgdGhpcyBpcyB1c2VkIHRvIGRpc3BsYXkgZXh0cmEgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHN0YXR1cyBvZiB0aGUgdXBsb2FkXG4gICAgdXBkYXRlTGFyZ2VGaWxlU3RhdHVzKGZpbGVOYW1lLCBjaHVua1N0YXJ0SW5kZXgsIGNodW5rRW5kSW5kZXgsIHRvdGFsVXBsb2FkRmlsZVNpemUpIHtcbiAgICAgICAgLy8gZGlzcGxheSAxIGRlY2ltYWwgcGxhY2Ugd2l0aG91dCBhbnkgcm91bmRpbmdcbiAgICAgICAgY29uc3QgcGVyY2VudGFnZSA9IHRoaXMuZm9ybWF0UGVyY2VudGFnZShjaHVua0VuZEluZGV4LCB0b3RhbFVwbG9hZEZpbGVTaXplKTtcbiAgICAgICAgY29yZV8xLmluZm8oYFVwbG9hZGVkICR7ZmlsZU5hbWV9ICgke3BlcmNlbnRhZ2Uuc2xpY2UoMCwgcGVyY2VudGFnZS5pbmRleE9mKCcuJykgKyAyKX0lKSBieXRlcyAke2NodW5rU3RhcnRJbmRleH06JHtjaHVua0VuZEluZGV4fWApO1xuICAgIH1cbiAgICBzdG9wKCkge1xuICAgICAgICBpZiAodGhpcy50b3RhbEZpbGVTdGF0dXMpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy50b3RhbEZpbGVTdGF0dXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGluY3JlbWVudFByb2Nlc3NlZENvdW50KCkge1xuICAgICAgICB0aGlzLnByb2Nlc3NlZENvdW50Kys7XG4gICAgfVxuICAgIGZvcm1hdFBlcmNlbnRhZ2UobnVtZXJhdG9yLCBkZW5vbWluYXRvcikge1xuICAgICAgICAvLyB0b0ZpeGVkKCkgcm91bmRzLCBzbyB1c2UgZXh0cmEgcHJlY2lzaW9uIHRvIGRpc3BsYXkgYWNjdXJhdGUgaW5mb3JtYXRpb24gZXZlbiB0aG91Z2ggNCBkZWNpbWFsIHBsYWNlcyBhcmUgbm90IGRpc3BsYXllZFxuICAgICAgICByZXR1cm4gKChudW1lcmF0b3IgLyBkZW5vbWluYXRvcikgKiAxMDApLnRvRml4ZWQoNCkudG9TdHJpbmcoKTtcbiAgICB9XG59XG5leHBvcnRzLlN0YXR1c1JlcG9ydGVyID0gU3RhdHVzUmVwb3J0ZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdGF0dXMtcmVwb3J0ZXIuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19zZXRNb2R1bGVEZWZhdWx0KSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xufSkgOiBmdW5jdGlvbihvLCB2KSB7XG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xufSk7XG52YXIgX19pbXBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydFN0YXIpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19hc3luY1ZhbHVlcyA9ICh0aGlzICYmIHRoaXMuX19hc3luY1ZhbHVlcykgfHwgZnVuY3Rpb24gKG8pIHtcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGk7XG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpW25dID0gb1tuXSAmJiBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2ID0gb1tuXSh2KSwgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgdi5kb25lLCB2LnZhbHVlKTsgfSk7IH07IH1cbiAgICBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCBkLCB2KSB7IFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGZ1bmN0aW9uKHYpIHsgcmVzb2x2ZSh7IHZhbHVlOiB2LCBkb25lOiBkIH0pOyB9LCByZWplY3QpOyB9XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5jcmVhdGVHWmlwRmlsZUluQnVmZmVyID0gZXhwb3J0cy5jcmVhdGVHWmlwRmlsZU9uRGlzayA9IHZvaWQgMDtcbmNvbnN0IGZzID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJmc1wiKSk7XG5jb25zdCB6bGliID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJ6bGliXCIpKTtcbmNvbnN0IHV0aWxfMSA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xuY29uc3Qgc3RhdCA9IHV0aWxfMS5wcm9taXNpZnkoZnMuc3RhdCk7XG4vKipcbiAqIEdaaXBwaW5nIGNlcnRhaW4gZmlsZXMgdGhhdCBhcmUgYWxyZWFkeSBjb21wcmVzc2VkIHdpbGwgbGlrZWx5IG5vdCB5aWVsZCBmdXJ0aGVyIHNpemUgcmVkdWN0aW9ucy4gQ3JlYXRpbmcgbGFyZ2UgdGVtcG9yYXJ5IGd6aXBcbiAqIGZpbGVzIHRoZW4gd2lsbCBqdXN0IHdhc3RlIGEgbG90IG9mIHRpbWUgYmVmb3JlIHVsdGltYXRlbHkgYmVpbmcgZGlzY2FyZGVkIChlc3BlY2lhbGx5IGZvciB2ZXJ5IGxhcmdlIGZpbGVzKS5cbiAqIElmIGFueSBvZiB0aGVzZSB0eXBlcyBvZiBmaWxlcyBhcmUgZW5jb3VudGVyZWQgdGhlbiBvbi1kaXNrIGd6aXAgY3JlYXRpb24gd2lsbCBiZSBza2lwcGVkIGFuZCB0aGUgb3JpZ2luYWwgZmlsZSB3aWxsIGJlIHVwbG9hZGVkIGFzLWlzXG4gKi9cbmNvbnN0IGd6aXBFeGVtcHRGaWxlRXh0ZW5zaW9ucyA9IFtcbiAgICAnLmd6aXAnLFxuICAgICcuemlwJyxcbiAgICAnLnRhci5seicsXG4gICAgJy50YXIuZ3onLFxuICAgICcudGFyLmJ6MicsXG4gICAgJy43eidcbl07XG4vKipcbiAqIENyZWF0ZXMgYSBHemlwIGNvbXByZXNzZWQgZmlsZSBvZiBhbiBvcmlnaW5hbCBmaWxlIGF0IHRoZSBwcm92aWRlZCB0ZW1wb3JhcnkgZmlsZXBhdGggbG9jYXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW5hbEZpbGVQYXRoIGZpbGVwYXRoIG9mIHdoYXRldmVyIHdpbGwgYmUgY29tcHJlc3NlZC4gVGhlIG9yaWdpbmFsIGZpbGUgd2lsbCBiZSB1bm1vZGlmaWVkXG4gKiBAcGFyYW0ge3N0cmluZ30gdGVtcEZpbGVQYXRoIHRoZSBsb2NhdGlvbiBvZiB3aGVyZSB0aGUgR3ppcCBmaWxlIHdpbGwgYmUgY3JlYXRlZFxuICogQHJldHVybnMgdGhlIHNpemUgb2YgZ3ppcCBmaWxlIHRoYXQgZ2V0cyBjcmVhdGVkXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUdaaXBGaWxlT25EaXNrKG9yaWdpbmFsRmlsZVBhdGgsIHRlbXBGaWxlUGF0aCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGZvciAoY29uc3QgZ3ppcEV4ZW1wdEV4dGVuc2lvbiBvZiBnemlwRXhlbXB0RmlsZUV4dGVuc2lvbnMpIHtcbiAgICAgICAgICAgIGlmIChvcmlnaW5hbEZpbGVQYXRoLmVuZHNXaXRoKGd6aXBFeGVtcHRFeHRlbnNpb24pKSB7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIGEgcmVhbGx5IGxhcmdlIG51bWJlciBzbyB0aGF0IHRoZSBvcmlnaW5hbCBmaWxlIGdldHMgdXBsb2FkZWRcbiAgICAgICAgICAgICAgICByZXR1cm4gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlucHV0U3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShvcmlnaW5hbEZpbGVQYXRoKTtcbiAgICAgICAgICAgIGNvbnN0IGd6aXAgPSB6bGliLmNyZWF0ZUd6aXAoKTtcbiAgICAgICAgICAgIGNvbnN0IG91dHB1dFN0cmVhbSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKHRlbXBGaWxlUGF0aCk7XG4gICAgICAgICAgICBpbnB1dFN0cmVhbS5waXBlKGd6aXApLnBpcGUob3V0cHV0U3RyZWFtKTtcbiAgICAgICAgICAgIG91dHB1dFN0cmVhbS5vbignZmluaXNoJywgKCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIC8vIHdhaXQgZm9yIHN0cmVhbSB0byBmaW5pc2ggYmVmb3JlIGNhbGN1bGF0aW5nIHRoZSBzaXplIHdoaWNoIGlzIG5lZWRlZCBhcyBwYXJ0IG9mIHRoZSBDb250ZW50LUxlbmd0aCBoZWFkZXIgd2hlbiBzdGFydGluZyBhbiB1cGxvYWRcbiAgICAgICAgICAgICAgICBjb25zdCBzaXplID0gKHlpZWxkIHN0YXQodGVtcEZpbGVQYXRoKSkuc2l6ZTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHNpemUpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgb3V0cHV0U3RyZWFtLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgICAgICByZWplY3Q7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5leHBvcnRzLmNyZWF0ZUdaaXBGaWxlT25EaXNrID0gY3JlYXRlR1ppcEZpbGVPbkRpc2s7XG4vKipcbiAqIENyZWF0ZXMgYSBHWmlwIGZpbGUgaW4gbWVtb3J5IHVzaW5nIGEgYnVmZmVyLiBTaG91bGQgYmUgdXNlZCBmb3Igc21hbGxlciBmaWxlcyB0byByZWR1Y2UgZGlzayBJL09cbiAqIEBwYXJhbSBvcmlnaW5hbEZpbGVQYXRoIHRoZSBwYXRoIHRvIHRoZSBvcmlnaW5hbCBmaWxlIHRoYXQgaXMgYmVpbmcgR1ppcHBlZFxuICogQHJldHVybnMgYSBidWZmZXIgd2l0aCB0aGUgR1ppcCBmaWxlXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUdaaXBGaWxlSW5CdWZmZXIob3JpZ2luYWxGaWxlUGF0aCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgdmFyIGVfMSwgX2E7XG4gICAgICAgICAgICBjb25zdCBpbnB1dFN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0ob3JpZ2luYWxGaWxlUGF0aCk7XG4gICAgICAgICAgICBjb25zdCBnemlwID0gemxpYi5jcmVhdGVHemlwKCk7XG4gICAgICAgICAgICBpbnB1dFN0cmVhbS5waXBlKGd6aXApO1xuICAgICAgICAgICAgLy8gcmVhZCBzdHJlYW0gaW50byBidWZmZXIsIHVzaW5nIGV4cGVyaW1lbnRhbCBhc3luYyBpdGVyYXRvcnMgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvcmVhZGFibGUtc3RyZWFtL2lzc3Vlcy80MDMjaXNzdWVjb21tZW50LTQ3OTA2OTA0M1xuICAgICAgICAgICAgY29uc3QgY2h1bmtzID0gW107XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGd6aXBfMSA9IF9fYXN5bmNWYWx1ZXMoZ3ppcCksIGd6aXBfMV8xOyBnemlwXzFfMSA9IHlpZWxkIGd6aXBfMS5uZXh0KCksICFnemlwXzFfMS5kb25lOykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaHVuayA9IGd6aXBfMV8xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBjaHVua3MucHVzaChjaHVuayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChnemlwXzFfMSAmJiAhZ3ppcF8xXzEuZG9uZSAmJiAoX2EgPSBnemlwXzEucmV0dXJuKSkgeWllbGQgX2EuY2FsbChnemlwXzEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNvbHZlKEJ1ZmZlci5jb25jYXQoY2h1bmtzKSk7XG4gICAgICAgIH0pKTtcbiAgICB9KTtcbn1cbmV4cG9ydHMuY3JlYXRlR1ppcEZpbGVJbkJ1ZmZlciA9IGNyZWF0ZUdaaXBGaWxlSW5CdWZmZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD11cGxvYWQtZ3ppcC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX3NldE1vZHVsZURlZmF1bHQpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XG59KTtcbnZhciBfX2ltcG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0U3RhcikgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChrICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuVXBsb2FkSHR0cENsaWVudCA9IHZvaWQgMDtcbmNvbnN0IGZzID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJmc1wiKSk7XG5jb25zdCBjb3JlID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJAYWN0aW9ucy9jb3JlXCIpKTtcbmNvbnN0IHRtcCA9IF9faW1wb3J0U3RhcihyZXF1aXJlKFwidG1wLXByb21pc2VcIikpO1xuY29uc3Qgc3RyZWFtID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJzdHJlYW1cIikpO1xuY29uc3QgdXRpbHNfMSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xuY29uc3QgY29uZmlnX3ZhcmlhYmxlc18xID0gcmVxdWlyZShcIi4vY29uZmlnLXZhcmlhYmxlc1wiKTtcbmNvbnN0IHV0aWxfMSA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xuY29uc3QgdXJsXzEgPSByZXF1aXJlKFwidXJsXCIpO1xuY29uc3QgcGVyZl9ob29rc18xID0gcmVxdWlyZShcInBlcmZfaG9va3NcIik7XG5jb25zdCBzdGF0dXNfcmVwb3J0ZXJfMSA9IHJlcXVpcmUoXCIuL3N0YXR1cy1yZXBvcnRlclwiKTtcbmNvbnN0IGh0dHBfY2xpZW50XzEgPSByZXF1aXJlKFwiQGFjdGlvbnMvaHR0cC1jbGllbnRcIik7XG5jb25zdCBodHRwX21hbmFnZXJfMSA9IHJlcXVpcmUoXCIuL2h0dHAtbWFuYWdlclwiKTtcbmNvbnN0IHVwbG9hZF9nemlwXzEgPSByZXF1aXJlKFwiLi91cGxvYWQtZ3ppcFwiKTtcbmNvbnN0IHJlcXVlc3RVdGlsc18xID0gcmVxdWlyZShcIi4vcmVxdWVzdFV0aWxzXCIpO1xuY29uc3Qgc3RhdCA9IHV0aWxfMS5wcm9taXNpZnkoZnMuc3RhdCk7XG5jbGFzcyBVcGxvYWRIdHRwQ2xpZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy51cGxvYWRIdHRwTWFuYWdlciA9IG5ldyBodHRwX21hbmFnZXJfMS5IdHRwTWFuYWdlcihjb25maWdfdmFyaWFibGVzXzEuZ2V0VXBsb2FkRmlsZUNvbmN1cnJlbmN5KCksICdAYWN0aW9ucy9hcnRpZmFjdC11cGxvYWQnKTtcbiAgICAgICAgdGhpcy5zdGF0dXNSZXBvcnRlciA9IG5ldyBzdGF0dXNfcmVwb3J0ZXJfMS5TdGF0dXNSZXBvcnRlcigxMDAwMCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmaWxlIGNvbnRhaW5lciBmb3IgdGhlIG5ldyBhcnRpZmFjdCBpbiB0aGUgcmVtb3RlIGJsb2Igc3RvcmFnZS9maWxlIHNlcnZpY2VcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYXJ0aWZhY3ROYW1lIE5hbWUgb2YgdGhlIGFydGlmYWN0IGJlaW5nIGNyZWF0ZWRcbiAgICAgKiBAcmV0dXJucyBUaGUgcmVzcG9uc2UgZnJvbSB0aGUgQXJ0aWZhY3QgU2VydmljZSBpZiB0aGUgZmlsZSBjb250YWluZXIgd2FzIHN1Y2Nlc3NmdWxseSBjcmVhdGVkXG4gICAgICovXG4gICAgY3JlYXRlQXJ0aWZhY3RJbkZpbGVDb250YWluZXIoYXJ0aWZhY3ROYW1lLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJhbWV0ZXJzID0ge1xuICAgICAgICAgICAgICAgIFR5cGU6ICdhY3Rpb25zX3N0b3JhZ2UnLFxuICAgICAgICAgICAgICAgIE5hbWU6IGFydGlmYWN0TmFtZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSByZXRlbnRpb24gcGVyaW9kXG4gICAgICAgICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnJldGVudGlvbkRheXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXhSZXRlbnRpb25TdHIgPSBjb25maWdfdmFyaWFibGVzXzEuZ2V0UmV0ZW50aW9uRGF5cygpO1xuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnMuUmV0ZW50aW9uRGF5cyA9IHV0aWxzXzEuZ2V0UHJvcGVyUmV0ZW50aW9uKG9wdGlvbnMucmV0ZW50aW9uRGF5cywgbWF4UmV0ZW50aW9uU3RyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnN0cmluZ2lmeShwYXJhbWV0ZXJzLCBudWxsLCAyKTtcbiAgICAgICAgICAgIGNvbnN0IGFydGlmYWN0VXJsID0gdXRpbHNfMS5nZXRBcnRpZmFjdFVybCgpO1xuICAgICAgICAgICAgLy8gdXNlIHRoZSBmaXJzdCBjbGllbnQgZnJvbSB0aGUgaHR0cE1hbmFnZXIsIGBrZWVwLWFsaXZlYCBpcyBub3QgdXNlZCBzbyB0aGUgY29ubmVjdGlvbiB3aWxsIGNsb3NlIGltbWVkaWF0ZWx5XG4gICAgICAgICAgICBjb25zdCBjbGllbnQgPSB0aGlzLnVwbG9hZEh0dHBNYW5hZ2VyLmdldENsaWVudCgwKTtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSB1dGlsc18xLmdldFVwbG9hZEhlYWRlcnMoJ2FwcGxpY2F0aW9uL2pzb24nLCBmYWxzZSk7XG4gICAgICAgICAgICAvLyBFeHRyYSBpbmZvcm1hdGlvbiB0byBkaXNwbGF5IHdoZW4gYSBwYXJ0aWN1bGFyIEhUVFAgY29kZSBpcyByZXR1cm5lZFxuICAgICAgICAgICAgLy8gSWYgYSA0MDMgaXMgcmV0dXJuZWQgd2hlbiB0cnlpbmcgdG8gY3JlYXRlIGEgZmlsZSBjb250YWluZXIsIHRoZSBjdXN0b21lciBoYXMgZXhjZWVkZWRcbiAgICAgICAgICAgIC8vIHRoZWlyIHN0b3JhZ2UgcXVvdGEgc28gbm8gbmV3IGFydGlmYWN0IGNvbnRhaW5lcnMgY2FuIGJlIGNyZWF0ZWRcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbUVycm9yTWVzc2FnZXMgPSBuZXcgTWFwKFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIGh0dHBfY2xpZW50XzEuSHR0cENvZGVzLkZvcmJpZGRlbixcbiAgICAgICAgICAgICAgICAgICAgJ0FydGlmYWN0IHN0b3JhZ2UgcXVvdGEgaGFzIGJlZW4gaGl0LiBVbmFibGUgdG8gdXBsb2FkIGFueSBuZXcgYXJ0aWZhY3RzJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBodHRwX2NsaWVudF8xLkh0dHBDb2Rlcy5CYWRSZXF1ZXN0LFxuICAgICAgICAgICAgICAgICAgICBgVGhlIGFydGlmYWN0IG5hbWUgJHthcnRpZmFjdE5hbWV9IGlzIG5vdCB2YWxpZC4gUmVxdWVzdCBVUkwgJHthcnRpZmFjdFVybH1gXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHlpZWxkIHJlcXVlc3RVdGlsc18xLnJldHJ5SHR0cENsaWVudFJlcXVlc3QoJ0NyZWF0ZSBBcnRpZmFjdCBDb250YWluZXInLCAoKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7IHJldHVybiBjbGllbnQucG9zdChhcnRpZmFjdFVybCwgZGF0YSwgaGVhZGVycyk7IH0pLCBjdXN0b21FcnJvck1lc3NhZ2VzKTtcbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSB5aWVsZCByZXNwb25zZS5yZWFkQm9keSgpO1xuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoYm9keSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb25jdXJyZW50bHkgdXBsb2FkIGFsbCBvZiB0aGUgZmlsZXMgaW4gY2h1bmtzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVwbG9hZFVybCBCYXNlIFVybCBmb3IgdGhlIGFydGlmYWN0IHRoYXQgd2FzIGNyZWF0ZWRcbiAgICAgKiBAcGFyYW0ge1NlYXJjaFJlc3VsdFtdfSBmaWxlc1RvVXBsb2FkIEEgbGlzdCBvZiBpbmZvcm1hdGlvbiBhYm91dCB0aGUgZmlsZXMgYmVpbmcgdXBsb2FkZWRcbiAgICAgKiBAcmV0dXJucyBUaGUgc2l6ZSBvZiBhbGwgdGhlIGZpbGVzIHVwbG9hZGVkIGluIGJ5dGVzXG4gICAgICovXG4gICAgdXBsb2FkQXJ0aWZhY3RUb0ZpbGVDb250YWluZXIodXBsb2FkVXJsLCBmaWxlc1RvVXBsb2FkLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCBGSUxFX0NPTkNVUlJFTkNZID0gY29uZmlnX3ZhcmlhYmxlc18xLmdldFVwbG9hZEZpbGVDb25jdXJyZW5jeSgpO1xuICAgICAgICAgICAgY29uc3QgTUFYX0NIVU5LX1NJWkUgPSBjb25maWdfdmFyaWFibGVzXzEuZ2V0VXBsb2FkQ2h1bmtTaXplKCk7XG4gICAgICAgICAgICBjb3JlLmRlYnVnKGBGaWxlIENvbmN1cnJlbmN5OiAke0ZJTEVfQ09OQ1VSUkVOQ1l9LCBhbmQgQ2h1bmsgU2l6ZTogJHtNQVhfQ0hVTktfU0laRX1gKTtcbiAgICAgICAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSBbXTtcbiAgICAgICAgICAgIC8vIGJ5IGRlZmF1bHQsIGZpbGUgdXBsb2FkcyB3aWxsIGNvbnRpbnVlIGlmIHRoZXJlIGlzIGFuIGVycm9yIHVubGVzcyBzcGVjaWZpZWQgZGlmZmVyZW50bHkgaW4gdGhlIG9wdGlvbnNcbiAgICAgICAgICAgIGxldCBjb250aW51ZU9uRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5jb250aW51ZU9uRXJyb3IgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlT25FcnJvciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHByZXBhcmUgdGhlIG5lY2Vzc2FyeSBwYXJhbWV0ZXJzIHRvIHVwbG9hZCBhbGwgdGhlIGZpbGVzXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXNUb1VwbG9hZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc291cmNlVXJsID0gbmV3IHVybF8xLlVSTCh1cGxvYWRVcmwpO1xuICAgICAgICAgICAgICAgIHJlc291cmNlVXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ2l0ZW1QYXRoJywgZmlsZS51cGxvYWRGaWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgcGFyYW1ldGVycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZS5hYnNvbHV0ZUZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZVVybDogcmVzb3VyY2VVcmwudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgbWF4Q2h1bmtTaXplOiBNQVhfQ0hVTktfU0laRSxcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVPbkVycm9yXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwYXJhbGxlbFVwbG9hZHMgPSBbLi4ubmV3IEFycmF5KEZJTEVfQ09OQ1VSUkVOQ1kpLmtleXMoKV07XG4gICAgICAgICAgICBjb25zdCBmYWlsZWRJdGVtc1RvUmVwb3J0ID0gW107XG4gICAgICAgICAgICBsZXQgY3VycmVudEZpbGUgPSAwO1xuICAgICAgICAgICAgbGV0IGNvbXBsZXRlZEZpbGVzID0gMDtcbiAgICAgICAgICAgIGxldCB1cGxvYWRGaWxlU2l6ZSA9IDA7XG4gICAgICAgICAgICBsZXQgdG90YWxGaWxlU2l6ZSA9IDA7XG4gICAgICAgICAgICBsZXQgYWJvcnRQZW5kaW5nRmlsZVVwbG9hZHMgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzUmVwb3J0ZXIuc2V0VG90YWxOdW1iZXJPZkZpbGVzVG9Qcm9jZXNzKGZpbGVzVG9VcGxvYWQubGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzUmVwb3J0ZXIuc3RhcnQoKTtcbiAgICAgICAgICAgIC8vIG9ubHkgYWxsb3cgYSBjZXJ0YWluIGFtb3VudCBvZiBmaWxlcyB0byBiZSB1cGxvYWRlZCBhdCBvbmNlLCB0aGlzIGlzIGRvbmUgdG8gcmVkdWNlIHBvdGVudGlhbCBlcnJvcnNcbiAgICAgICAgICAgIHlpZWxkIFByb21pc2UuYWxsKHBhcmFsbGVsVXBsb2Fkcy5tYXAoKGluZGV4KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGN1cnJlbnRGaWxlIDwgZmlsZXNUb1VwbG9hZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY3VycmVudEZpbGVQYXJhbWV0ZXJzID0gcGFyYW1ldGVyc1tjdXJyZW50RmlsZV07XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRGaWxlICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhYm9ydFBlbmRpbmdGaWxlVXBsb2Fkcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkSXRlbXNUb1JlcG9ydC5wdXNoKGN1cnJlbnRGaWxlUGFyYW1ldGVycy5maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IHBlcmZfaG9va3NfMS5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXBsb2FkRmlsZVJlc3VsdCA9IHlpZWxkIHRoaXMudXBsb2FkRmlsZUFzeW5jKGluZGV4LCBjdXJyZW50RmlsZVBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29yZS5pc0RlYnVnKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcmUuZGVidWcoYEZpbGU6ICR7Kytjb21wbGV0ZWRGaWxlc30vJHtmaWxlc1RvVXBsb2FkLmxlbmd0aH0uICR7Y3VycmVudEZpbGVQYXJhbWV0ZXJzLmZpbGV9IHRvb2sgJHsocGVyZl9ob29rc18xLnBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRUaW1lKS50b0ZpeGVkKDMpfSBtaWxsaXNlY29uZHMgdG8gZmluaXNoIHVwbG9hZGApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZEZpbGVTaXplICs9IHVwbG9hZEZpbGVSZXN1bHQuc3VjY2Vzc2Z1bFVwbG9hZFNpemU7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsRmlsZVNpemUgKz0gdXBsb2FkRmlsZVJlc3VsdC50b3RhbFNpemU7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGxvYWRGaWxlUmVzdWx0LmlzU3VjY2VzcyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxlZEl0ZW1zVG9SZXBvcnQucHVzaChjdXJyZW50RmlsZVBhcmFtZXRlcnMuZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRpbnVlT25FcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZhaWwgZmFzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvcmUuZXJyb3IoYGFib3J0aW5nIGFydGlmYWN0IHVwbG9hZGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFib3J0UGVuZGluZ0ZpbGVVcGxvYWRzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXR1c1JlcG9ydGVyLmluY3JlbWVudFByb2Nlc3NlZENvdW50KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzUmVwb3J0ZXIuc3RvcCgpO1xuICAgICAgICAgICAgLy8gZG9uZSB1cGxvYWRpbmcsIHNhZmV0eSBkaXNwb3NlIGFsbCBjb25uZWN0aW9uc1xuICAgICAgICAgICAgdGhpcy51cGxvYWRIdHRwTWFuYWdlci5kaXNwb3NlQW5kUmVwbGFjZUFsbENsaWVudHMoKTtcbiAgICAgICAgICAgIGNvcmUuaW5mbyhgVG90YWwgc2l6ZSBvZiBhbGwgdGhlIGZpbGVzIHVwbG9hZGVkIGlzICR7dXBsb2FkRmlsZVNpemV9IGJ5dGVzYCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVwbG9hZFNpemU6IHVwbG9hZEZpbGVTaXplLFxuICAgICAgICAgICAgICAgIHRvdGFsU2l6ZTogdG90YWxGaWxlU2l6ZSxcbiAgICAgICAgICAgICAgICBmYWlsZWRJdGVtczogZmFpbGVkSXRlbXNUb1JlcG9ydFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFzeW5jaHJvbm91c2x5IHVwbG9hZHMgYSBmaWxlLiBUaGUgZmlsZSBpcyBjb21wcmVzc2VkIGFuZCB1cGxvYWRlZCB1c2luZyBHWmlwIGlmIGl0IGlzIGRldGVybWluZWQgdG8gc2F2ZSBzcGFjZS5cbiAgICAgKiBJZiB0aGUgdXBsb2FkIGZpbGUgaXMgYmlnZ2VyIHRoYW4gdGhlIG1heCBjaHVuayBzaXplIGl0IHdpbGwgYmUgdXBsb2FkZWQgdmlhIG11bHRpcGxlIGNhbGxzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGh0dHBDbGllbnRJbmRleCBUaGUgaW5kZXggb2YgdGhlIGh0dHBDbGllbnQgdGhhdCBpcyBiZWluZyB1c2VkIHRvIG1ha2UgYWxsIG9mIHRoZSBjYWxsc1xuICAgICAqIEBwYXJhbSB7VXBsb2FkRmlsZVBhcmFtZXRlcnN9IHBhcmFtZXRlcnMgSW5mb3JtYXRpb24gYWJvdXQgdGhlIGZpbGUgdGhhdCBuZWVkcyB0byBiZSB1cGxvYWRlZFxuICAgICAqIEByZXR1cm5zIFRoZSBzaXplIG9mIHRoZSBmaWxlIHRoYXQgd2FzIHVwbG9hZGVkIGluIGJ5dGVzIGFsb25nIHdpdGggYW55IGZhaWxlZCB1cGxvYWRzXG4gICAgICovXG4gICAgdXBsb2FkRmlsZUFzeW5jKGh0dHBDbGllbnRJbmRleCwgcGFyYW1ldGVycykge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgZmlsZVN0YXQgPSB5aWVsZCBzdGF0KHBhcmFtZXRlcnMuZmlsZSk7XG4gICAgICAgICAgICBjb25zdCB0b3RhbEZpbGVTaXplID0gZmlsZVN0YXQuc2l6ZTtcbiAgICAgICAgICAgIGNvbnN0IGlzRklGTyA9IGZpbGVTdGF0LmlzRklGTygpO1xuICAgICAgICAgICAgbGV0IG9mZnNldCA9IDA7XG4gICAgICAgICAgICBsZXQgaXNVcGxvYWRTdWNjZXNzZnVsID0gdHJ1ZTtcbiAgICAgICAgICAgIGxldCBmYWlsZWRDaHVua1NpemVzID0gMDtcbiAgICAgICAgICAgIGxldCB1cGxvYWRGaWxlU2l6ZSA9IDA7XG4gICAgICAgICAgICBsZXQgaXNHemlwID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIHRoZSBmaWxlIHRoYXQgaXMgYmVpbmcgdXBsb2FkZWQgaXMgbGVzcyB0aGFuIDY0ayBpbiBzaXplIHRvIGluY3JlYXNlIHRocm91Z2hwdXQgYW5kIHRvIG1pbmltaXplIGRpc2sgSS9PXG4gICAgICAgICAgICAvLyBmb3IgY3JlYXRpbmcgYSBuZXcgR1ppcCBmaWxlLCBhbiBpbi1tZW1vcnkgYnVmZmVyIGlzIHVzZWQgZm9yIGNvbXByZXNzaW9uXG4gICAgICAgICAgICAvLyB3aXRoIG5hbWVkIHBpcGVzIHRoZSBmaWxlIHNpemUgaXMgcmVwb3J0ZWQgYXMgemVybyBpbiB0aGF0IGNhc2UgZG9uJ3QgcmVhZCB0aGUgZmlsZSBpbiBtZW1vcnlcbiAgICAgICAgICAgIGlmICghaXNGSUZPICYmIHRvdGFsRmlsZVNpemUgPCA2NTUzNikge1xuICAgICAgICAgICAgICAgIGNvcmUuZGVidWcoYCR7cGFyYW1ldGVycy5maWxlfSBpcyBsZXNzIHRoYW4gNjRrIGluIHNpemUuIENyZWF0aW5nIGEgZ3ppcCBmaWxlIGluLW1lbW9yeSB0byBwb3RlbnRpYWxseSByZWR1Y2UgdGhlIHVwbG9hZCBzaXplYCk7XG4gICAgICAgICAgICAgICAgY29uc3QgYnVmZmVyID0geWllbGQgdXBsb2FkX2d6aXBfMS5jcmVhdGVHWmlwRmlsZUluQnVmZmVyKHBhcmFtZXRlcnMuZmlsZSk7XG4gICAgICAgICAgICAgICAgLy8gQW4gb3BlbiBzdHJlYW0gaXMgbmVlZGVkIGluIHRoZSBldmVudCBvZiBhIGZhaWx1cmUgYW5kIHdlIG5lZWQgdG8gcmV0cnkuIElmIGEgTm9kZUpTLlJlYWRhYmxlU3RyZWFtIGlzIGRpcmVjdGx5IHBhc3NlZCBpbixcbiAgICAgICAgICAgICAgICAvLyBpdCB3aWxsIG5vdCBwcm9wZXJseSBnZXQgcmVzZXQgdG8gdGhlIHN0YXJ0IG9mIHRoZSBzdHJlYW0gaWYgYSBjaHVuayB1cGxvYWQgbmVlZHMgdG8gYmUgcmV0cmllZFxuICAgICAgICAgICAgICAgIGxldCBvcGVuVXBsb2FkU3RyZWFtO1xuICAgICAgICAgICAgICAgIGlmICh0b3RhbEZpbGVTaXplIDwgYnVmZmVyLmJ5dGVMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29tcHJlc3Npb24gZGlkIG5vdCBoZWxwIHdpdGggcmVkdWNpbmcgdGhlIHNpemUsIHVzZSBhIHJlYWRhYmxlIHN0cmVhbSBmcm9tIHRoZSBvcmlnaW5hbCBmaWxlIGZvciB1cGxvYWRcbiAgICAgICAgICAgICAgICAgICAgY29yZS5kZWJ1ZyhgVGhlIGd6aXAgZmlsZSBjcmVhdGVkIGZvciAke3BhcmFtZXRlcnMuZmlsZX0gZGlkIG5vdCBoZWxwIHdpdGggcmVkdWNpbmcgdGhlIHNpemUgb2YgdGhlIGZpbGUuIFRoZSBvcmlnaW5hbCBmaWxlIHdpbGwgYmUgdXBsb2FkZWQgYXMtaXNgKTtcbiAgICAgICAgICAgICAgICAgICAgb3BlblVwbG9hZFN0cmVhbSA9ICgpID0+IGZzLmNyZWF0ZVJlYWRTdHJlYW0ocGFyYW1ldGVycy5maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgaXNHemlwID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZEZpbGVTaXplID0gdG90YWxGaWxlU2l6ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBhIHJlYWRhYmxlIHN0cmVhbSB1c2luZyBhIFBhc3NUaHJvdWdoIHN0cmVhbSB0aGF0IGlzIGJvdGggcmVhZGFibGUgYW5kIHdyaXRhYmxlXG4gICAgICAgICAgICAgICAgICAgIGNvcmUuZGVidWcoYEEgZ3ppcCBmaWxlIGNyZWF0ZWQgZm9yICR7cGFyYW1ldGVycy5maWxlfSBoZWxwZWQgd2l0aCByZWR1Y2luZyB0aGUgc2l6ZSBvZiB0aGUgb3JpZ2luYWwgZmlsZS4gVGhlIGZpbGUgd2lsbCBiZSB1cGxvYWRlZCB1c2luZyBnemlwLmApO1xuICAgICAgICAgICAgICAgICAgICBvcGVuVXBsb2FkU3RyZWFtID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFzc1Rocm91Z2ggPSBuZXcgc3RyZWFtLlBhc3NUaHJvdWdoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXNzVGhyb3VnaC5lbmQoYnVmZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXNzVGhyb3VnaDtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkRmlsZVNpemUgPSBidWZmZXIuYnl0ZUxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0geWllbGQgdGhpcy51cGxvYWRDaHVuayhodHRwQ2xpZW50SW5kZXgsIHBhcmFtZXRlcnMucmVzb3VyY2VVcmwsIG9wZW5VcGxvYWRTdHJlYW0sIDAsIHVwbG9hZEZpbGVTaXplIC0gMSwgdXBsb2FkRmlsZVNpemUsIGlzR3ppcCwgdG90YWxGaWxlU2l6ZSk7XG4gICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY2h1bmsgZmFpbGVkIHRvIHVwbG9hZFxuICAgICAgICAgICAgICAgICAgICBpc1VwbG9hZFN1Y2Nlc3NmdWwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgZmFpbGVkQ2h1bmtTaXplcyArPSB1cGxvYWRGaWxlU2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgY29yZS53YXJuaW5nKGBBYm9ydGluZyB1cGxvYWQgZm9yICR7cGFyYW1ldGVycy5maWxlfSBkdWUgdG8gZmFpbHVyZWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBpc1N1Y2Nlc3M6IGlzVXBsb2FkU3VjY2Vzc2Z1bCxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bFVwbG9hZFNpemU6IHVwbG9hZEZpbGVTaXplIC0gZmFpbGVkQ2h1bmtTaXplcyxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTaXplOiB0b3RhbEZpbGVTaXplXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHRoZSBmaWxlIHRoYXQgaXMgYmVpbmcgdXBsb2FkZWQgaXMgZ3JlYXRlciB0aGFuIDY0ayBpbiBzaXplLCBhIHRlbXBvcmFyeSBmaWxlIGdldHMgY3JlYXRlZCBvbiBkaXNrIHVzaW5nIHRoZVxuICAgICAgICAgICAgICAgIC8vIG5wbSB0bXAtcHJvbWlzZSBwYWNrYWdlIGFuZCB0aGlzIGZpbGUgZ2V0cyB1c2VkIHRvIGNyZWF0ZSBhIEdaaXBwZWQgZmlsZVxuICAgICAgICAgICAgICAgIGNvbnN0IHRlbXBGaWxlID0geWllbGQgdG1wLmZpbGUoKTtcbiAgICAgICAgICAgICAgICBjb3JlLmRlYnVnKGAke3BhcmFtZXRlcnMuZmlsZX0gaXMgZ3JlYXRlciB0aGFuIDY0ayBpbiBzaXplLiBDcmVhdGluZyBhIGd6aXAgZmlsZSBvbi1kaXNrICR7dGVtcEZpbGUucGF0aH0gdG8gcG90ZW50aWFsbHkgcmVkdWNlIHRoZSB1cGxvYWQgc2l6ZWApO1xuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBhIEdaaXAgZmlsZSBvZiB0aGUgb3JpZ2luYWwgZmlsZSBiZWluZyB1cGxvYWRlZCwgdGhlIG9yaWdpbmFsIGZpbGUgc2hvdWxkIG5vdCBiZSBtb2RpZmllZCBpbiBhbnkgd2F5XG4gICAgICAgICAgICAgICAgdXBsb2FkRmlsZVNpemUgPSB5aWVsZCB1cGxvYWRfZ3ppcF8xLmNyZWF0ZUdaaXBGaWxlT25EaXNrKHBhcmFtZXRlcnMuZmlsZSwgdGVtcEZpbGUucGF0aCk7XG4gICAgICAgICAgICAgICAgbGV0IHVwbG9hZEZpbGVQYXRoID0gdGVtcEZpbGUucGF0aDtcbiAgICAgICAgICAgICAgICAvLyBjb21wcmVzc2lvbiBkaWQgbm90IGhlbHAgd2l0aCBzaXplIHJlZHVjdGlvbiwgdXNlIHRoZSBvcmlnaW5hbCBmaWxlIGZvciB1cGxvYWQgYW5kIGRlbGV0ZSB0aGUgdGVtcCBHWmlwIGZpbGVcbiAgICAgICAgICAgICAgICAvLyBmb3IgbmFtZWQgcGlwZXMgdG90YWxGaWxlU2l6ZSBpcyB6ZXJvLCB0aGlzIGFzc3VtZXMgY29tcHJlc3Npb24gZGlkIGhlbHBcbiAgICAgICAgICAgICAgICBpZiAoIWlzRklGTyAmJiB0b3RhbEZpbGVTaXplIDwgdXBsb2FkRmlsZVNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29yZS5kZWJ1ZyhgVGhlIGd6aXAgZmlsZSBjcmVhdGVkIGZvciAke3BhcmFtZXRlcnMuZmlsZX0gZGlkIG5vdCBoZWxwIHdpdGggcmVkdWNpbmcgdGhlIHNpemUgb2YgdGhlIGZpbGUuIFRoZSBvcmlnaW5hbCBmaWxlIHdpbGwgYmUgdXBsb2FkZWQgYXMtaXNgKTtcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkRmlsZVNpemUgPSB0b3RhbEZpbGVTaXplO1xuICAgICAgICAgICAgICAgICAgICB1cGxvYWRGaWxlUGF0aCA9IHBhcmFtZXRlcnMuZmlsZTtcbiAgICAgICAgICAgICAgICAgICAgaXNHemlwID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb3JlLmRlYnVnKGBUaGUgZ3ppcCBmaWxlIGNyZWF0ZWQgZm9yICR7cGFyYW1ldGVycy5maWxlfSBpcyBzbWFsbGVyIHRoYW4gdGhlIG9yaWdpbmFsIGZpbGUuIFRoZSBmaWxlIHdpbGwgYmUgdXBsb2FkZWQgdXNpbmcgZ3ppcC5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IGFib3J0RmlsZVVwbG9hZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIC8vIHVwbG9hZCBvbmx5IGEgc2luZ2xlIGNodW5rIGF0IGEgdGltZVxuICAgICAgICAgICAgICAgIHdoaWxlIChvZmZzZXQgPCB1cGxvYWRGaWxlU2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaHVua1NpemUgPSBNYXRoLm1pbih1cGxvYWRGaWxlU2l6ZSAtIG9mZnNldCwgcGFyYW1ldGVycy5tYXhDaHVua1NpemUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGFydENodW5rSW5kZXggPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZENodW5rSW5kZXggPSBvZmZzZXQgKyBjaHVua1NpemUgLSAxO1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgKz0gcGFyYW1ldGVycy5tYXhDaHVua1NpemU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhYm9ydEZpbGVVcGxvYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHdlIGRvbid0IHdhbnQgdG8gY29udGludWUgaW4gdGhlIGV2ZW50IG9mIGFuIGVycm9yLCBhbnkgcGVuZGluZyB1cGxvYWQgY2h1bmtzIHdpbGwgYmUgbWFya2VkIGFzIGZhaWxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkQ2h1bmtTaXplcyArPSBjaHVua1NpemU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSB5aWVsZCB0aGlzLnVwbG9hZENodW5rKGh0dHBDbGllbnRJbmRleCwgcGFyYW1ldGVycy5yZXNvdXJjZVVybCwgKCkgPT4gZnMuY3JlYXRlUmVhZFN0cmVhbSh1cGxvYWRGaWxlUGF0aCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0Q2h1bmtJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDogZW5kQ2h1bmtJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9DbG9zZTogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfSksIHN0YXJ0Q2h1bmtJbmRleCwgZW5kQ2h1bmtJbmRleCwgdXBsb2FkRmlsZVNpemUsIGlzR3ppcCwgdG90YWxGaWxlU2l6ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDaHVuayBmYWlsZWQgdG8gdXBsb2FkLCByZXBvcnQgYXMgZmFpbGVkIGFuZCBkbyBub3QgY29udGludWUgdXBsb2FkaW5nIGFueSBtb3JlIGNodW5rcyBmb3IgdGhlIGZpbGUuIEl0IGlzIHBvc3NpYmxlIHRoYXQgcGFydCBvZiBhIGNodW5rIHdhc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3VjY2Vzc2Z1bGx5IHVwbG9hZGVkIHNvIHRoZSBzZXJ2ZXIgbWF5IHJlcG9ydCBhIGRpZmZlcmVudCBzaXplIGZvciB3aGF0IHdhcyB1cGxvYWRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNVcGxvYWRTdWNjZXNzZnVsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWRDaHVua1NpemVzICs9IGNodW5rU2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcmUud2FybmluZyhgQWJvcnRpbmcgdXBsb2FkIGZvciAke3BhcmFtZXRlcnMuZmlsZX0gZHVlIHRvIGZhaWx1cmVgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFib3J0RmlsZVVwbG9hZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBhbiBpbmRpdmlkdWFsIGZpbGUgaXMgZ3JlYXRlciB0aGFuIDhNQiAoMTAyNCoxMDI0KjgpIGluIHNpemUsIGRpc3BsYXkgZXh0cmEgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHVwbG9hZCBzdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cGxvYWRGaWxlU2l6ZSA+IDgzODg2MDgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXR1c1JlcG9ydGVyLnVwZGF0ZUxhcmdlRmlsZVN0YXR1cyhwYXJhbWV0ZXJzLmZpbGUsIHN0YXJ0Q2h1bmtJbmRleCwgZW5kQ2h1bmtJbmRleCwgdXBsb2FkRmlsZVNpemUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIERlbGV0ZSB0aGUgdGVtcG9yYXJ5IGZpbGUgdGhhdCB3YXMgY3JlYXRlZCBhcyBwYXJ0IG9mIHRoZSB1cGxvYWQuIElmIHRoZSB0ZW1wIGZpbGUgZG9lcyBub3QgZ2V0IG1hbnVhbGx5IGRlbGV0ZWQgYnlcbiAgICAgICAgICAgICAgICAvLyBjYWxsaW5nIGNsZWFudXAsIGl0IGdldHMgcmVtb3ZlZCB3aGVuIHRoZSBub2RlIHByb2Nlc3MgZXhpdHMuIEZvciBtb3JlIGluZm8gc2VlOiBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS90bXAtcHJvbWlzZSNhYm91dFxuICAgICAgICAgICAgICAgIGNvcmUuZGVidWcoYGRlbGV0aW5nIHRlbXBvcmFyeSBnemlwIGZpbGUgJHt0ZW1wRmlsZS5wYXRofWApO1xuICAgICAgICAgICAgICAgIHlpZWxkIHRlbXBGaWxlLmNsZWFudXAoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBpc1N1Y2Nlc3M6IGlzVXBsb2FkU3VjY2Vzc2Z1bCxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bFVwbG9hZFNpemU6IHVwbG9hZEZpbGVTaXplIC0gZmFpbGVkQ2h1bmtTaXplcyxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTaXplOiB0b3RhbEZpbGVTaXplXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVwbG9hZHMgYSBjaHVuayBvZiBhbiBpbmRpdmlkdWFsIGZpbGUgdG8gdGhlIHNwZWNpZmllZCByZXNvdXJjZVVybC4gSWYgdGhlIHVwbG9hZCBmYWlscyBhbmQgdGhlIHN0YXR1cyBjb2RlXG4gICAgICogaW5kaWNhdGVzIGEgcmV0cnlhYmxlIHN0YXR1cywgd2UgdHJ5IHRvIHVwbG9hZCB0aGUgY2h1bmsgYXMgd2VsbFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBodHRwQ2xpZW50SW5kZXggVGhlIGluZGV4IG9mIHRoZSBodHRwQ2xpZW50IGJlaW5nIHVzZWQgdG8gbWFrZSBhbGwgdGhlIG5lY2Vzc2FyeSBjYWxsc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSByZXNvdXJjZVVybCBVcmwgb2YgdGhlIHJlc291cmNlIHRoYXQgdGhlIGNodW5rIHdpbGwgYmUgdXBsb2FkZWQgdG9cbiAgICAgKiBAcGFyYW0ge05vZGVKUy5SZWFkYWJsZVN0cmVhbX0gb3BlblN0cmVhbSBTdHJlYW0gb2YgdGhlIGZpbGUgdGhhdCB3aWxsIGJlIHVwbG9hZGVkXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0IFN0YXJ0aW5nIGJ5dGUgaW5kZXggb2YgZmlsZSB0aGF0IHRoZSBjaHVuayBiZWxvbmdzIHRvXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVuZCBFbmRpbmcgYnl0ZSBpbmRleCBvZiBmaWxlIHRoYXQgdGhlIGNodW5rIGJlbG9uZ3MgdG9cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdXBsb2FkRmlsZVNpemUgVG90YWwgc2l6ZSBvZiB0aGUgZmlsZSBpbiBieXRlcyB0aGF0IGlzIGJlaW5nIHVwbG9hZGVkXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0d6aXAgRGVub3RlcyBpZiB3ZSBhcmUgdXBsb2FkaW5nIGEgR3ppcCBjb21wcmVzc2VkIHN0cmVhbVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0b3RhbEZpbGVTaXplIE9yaWdpbmFsIHRvdGFsIHNpemUgb2YgdGhlIGZpbGUgdGhhdCBpcyBiZWluZyB1cGxvYWRlZFxuICAgICAqIEByZXR1cm5zIGlmIHRoZSBjaHVuayB3YXMgc3VjY2Vzc2Z1bGx5IHVwbG9hZGVkXG4gICAgICovXG4gICAgdXBsb2FkQ2h1bmsoaHR0cENsaWVudEluZGV4LCByZXNvdXJjZVVybCwgb3BlblN0cmVhbSwgc3RhcnQsIGVuZCwgdXBsb2FkRmlsZVNpemUsIGlzR3ppcCwgdG90YWxGaWxlU2l6ZSkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgLy8gb3BlbiBhIG5ldyBzdHJlYW0gYW5kIHJlYWQgaXQgdG8gY29tcHV0ZSB0aGUgZGlnZXN0XG4gICAgICAgICAgICBjb25zdCBkaWdlc3QgPSB5aWVsZCB1dGlsc18xLmRpZ2VzdEZvclN0cmVhbShvcGVuU3RyZWFtKCkpO1xuICAgICAgICAgICAgLy8gcHJlcGFyZSBhbGwgdGhlIG5lY2Vzc2FyeSBoZWFkZXJzIGJlZm9yZSBtYWtpbmcgYW55IGh0dHAgY2FsbFxuICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IHV0aWxzXzEuZ2V0VXBsb2FkSGVhZGVycygnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJywgdHJ1ZSwgaXNHemlwLCB0b3RhbEZpbGVTaXplLCBlbmQgLSBzdGFydCArIDEsIHV0aWxzXzEuZ2V0Q29udGVudFJhbmdlKHN0YXJ0LCBlbmQsIHVwbG9hZEZpbGVTaXplKSwgZGlnZXN0KTtcbiAgICAgICAgICAgIGNvbnN0IHVwbG9hZENodW5rUmVxdWVzdCA9ICgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjbGllbnQgPSB0aGlzLnVwbG9hZEh0dHBNYW5hZ2VyLmdldENsaWVudChodHRwQ2xpZW50SW5kZXgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCBjbGllbnQuc2VuZFN0cmVhbSgnUFVUJywgcmVzb3VyY2VVcmwsIG9wZW5TdHJlYW0oKSwgaGVhZGVycyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCByZXRyeUNvdW50ID0gMDtcbiAgICAgICAgICAgIGNvbnN0IHJldHJ5TGltaXQgPSBjb25maWdfdmFyaWFibGVzXzEuZ2V0UmV0cnlMaW1pdCgpO1xuICAgICAgICAgICAgLy8gSW5jcmVtZW50cyB0aGUgY3VycmVudCByZXRyeSBjb3VudCBhbmQgdGhlbiBjaGVja3MgaWYgdGhlIHJldHJ5IGxpbWl0IGhhcyBiZWVuIHJlYWNoZWRcbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGhhdmUgYmVlbiB0b28gbWFueSByZXRyaWVzLCBmYWlsIHNvIHRoZSBkb3dubG9hZCBzdG9wc1xuICAgICAgICAgICAgY29uc3QgaW5jcmVtZW50QW5kQ2hlY2tSZXRyeUxpbWl0ID0gKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0cnlDb3VudCsrO1xuICAgICAgICAgICAgICAgIGlmIChyZXRyeUNvdW50ID4gcmV0cnlMaW1pdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0aWxzXzEuZGlzcGxheUh0dHBEaWFnbm9zdGljcyhyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29yZS5pbmZvKGBSZXRyeSBsaW1pdCBoYXMgYmVlbiByZWFjaGVkIGZvciBjaHVuayBhdCBvZmZzZXQgJHtzdGFydH0gdG8gJHtyZXNvdXJjZVVybH1gKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBiYWNrT2ZmID0gKHJldHJ5QWZ0ZXJWYWx1ZSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIHRoaXMudXBsb2FkSHR0cE1hbmFnZXIuZGlzcG9zZUFuZFJlcGxhY2VDbGllbnQoaHR0cENsaWVudEluZGV4KTtcbiAgICAgICAgICAgICAgICBpZiAocmV0cnlBZnRlclZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvcmUuaW5mbyhgQmFja29mZiBkdWUgdG8gdG9vIG1hbnkgcmVxdWVzdHMsIHJldHJ5ICMke3JldHJ5Q291bnR9LiBXYWl0aW5nIGZvciAke3JldHJ5QWZ0ZXJWYWx1ZX0gbWlsbGlzZWNvbmRzIGJlZm9yZSBjb250aW51aW5nIHRoZSB1cGxvYWRgKTtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgdXRpbHNfMS5zbGVlcChyZXRyeUFmdGVyVmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYmFja29mZlRpbWUgPSB1dGlsc18xLmdldEV4cG9uZW50aWFsUmV0cnlUaW1lSW5NaWxsaXNlY29uZHMocmV0cnlDb3VudCk7XG4gICAgICAgICAgICAgICAgICAgIGNvcmUuaW5mbyhgRXhwb25lbnRpYWwgYmFja29mZiBmb3IgcmV0cnkgIyR7cmV0cnlDb3VudH0uIFdhaXRpbmcgZm9yICR7YmFja29mZlRpbWV9IG1pbGxpc2Vjb25kcyBiZWZvcmUgY29udGludWluZyB0aGUgdXBsb2FkIGF0IG9mZnNldCAke3N0YXJ0fWApO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCB1dGlsc18xLnNsZWVwKGJhY2tvZmZUaW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29yZS5pbmZvKGBGaW5pc2hlZCBiYWNrb2ZmIGZvciByZXRyeSAjJHtyZXRyeUNvdW50fSwgY29udGludWluZyB3aXRoIHVwbG9hZGApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gYWxsb3cgZm9yIGZhaWxlZCBjaHVua3MgdG8gYmUgcmV0cmllZCBtdWx0aXBsZSB0aW1lc1xuICAgICAgICAgICAgd2hpbGUgKHJldHJ5Q291bnQgPD0gcmV0cnlMaW1pdCkge1xuICAgICAgICAgICAgICAgIGxldCByZXNwb25zZTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IHlpZWxkIHVwbG9hZENodW5rUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgYW4gZXJyb3IgaXMgY2F1Z2h0LCBpdCBpcyB1c3VhbGx5IGluZGljYXRpdmUgb2YgYSB0aW1lb3V0IHNvIHJldHJ5IHRoZSB1cGxvYWRcbiAgICAgICAgICAgICAgICAgICAgY29yZS5pbmZvKGBBbiBlcnJvciBoYXMgYmVlbiBjYXVnaHQgaHR0cC1jbGllbnQgaW5kZXggJHtodHRwQ2xpZW50SW5kZXh9LCByZXRyeWluZyB0aGUgdXBsb2FkYCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluY3JlbWVudEFuZENoZWNrUmV0cnlMaW1pdCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgeWllbGQgYmFja09mZigpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQWx3YXlzIHJlYWQgdGhlIGJvZHkgb2YgdGhlIHJlc3BvbnNlLiBUaGVyZSBpcyBwb3RlbnRpYWwgZm9yIGEgcmVzb3VyY2UgbGVhayBpZiB0aGUgYm9keSBpcyBub3QgcmVhZCB3aGljaCB3aWxsXG4gICAgICAgICAgICAgICAgLy8gcmVzdWx0IGluIHRoZSBjb25uZWN0aW9uIHJlbWFpbmluZyBvcGVuIGFsb25nIHdpdGggdW5pbnRlbmRlZCBjb25zZXF1ZW5jZXMgd2hlbiB0cnlpbmcgdG8gZGlzcG9zZSBvZiB0aGUgY2xpZW50XG4gICAgICAgICAgICAgICAgeWllbGQgcmVzcG9uc2UucmVhZEJvZHkoKTtcbiAgICAgICAgICAgICAgICBpZiAodXRpbHNfMS5pc1N1Y2Nlc3NTdGF0dXNDb2RlKHJlc3BvbnNlLm1lc3NhZ2Uuc3RhdHVzQ29kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHV0aWxzXzEuaXNSZXRyeWFibGVTdGF0dXNDb2RlKHJlc3BvbnNlLm1lc3NhZ2Uuc3RhdHVzQ29kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29yZS5pbmZvKGBBICR7cmVzcG9uc2UubWVzc2FnZS5zdGF0dXNDb2RlfSBzdGF0dXMgY29kZSBoYXMgYmVlbiByZWNlaXZlZCwgd2lsbCBhdHRlbXB0IHRvIHJldHJ5IHRoZSB1cGxvYWRgKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluY3JlbWVudEFuZENoZWNrUmV0cnlMaW1pdChyZXNwb25zZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB1dGlsc18xLmlzVGhyb3R0bGVkU3RhdHVzQ29kZShyZXNwb25zZS5tZXNzYWdlLnN0YXR1c0NvZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHlpZWxkIGJhY2tPZmYodXRpbHNfMS50cnlHZXRSZXRyeUFmdGVyVmFsdWVUaW1lSW5NaWxsaXNlY29uZHMocmVzcG9uc2UubWVzc2FnZS5oZWFkZXJzKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogeWllbGQgYmFja09mZigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29yZS5lcnJvcihgVW5leHBlY3RlZCByZXNwb25zZS4gVW5hYmxlIHRvIHVwbG9hZCBjaHVuayB0byAke3Jlc291cmNlVXJsfWApO1xuICAgICAgICAgICAgICAgICAgICB1dGlsc18xLmRpc3BsYXlIdHRwRGlhZ25vc3RpY3MocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXBkYXRlcyB0aGUgc2l6ZSBvZiB0aGUgYXJ0aWZhY3QgZnJvbSAtMSB3aGljaCB3YXMgaW5pdGlhbGx5IHNldCB3aGVuIHRoZSBjb250YWluZXIgd2FzIGZpcnN0IGNyZWF0ZWQgZm9yIHRoZSBhcnRpZmFjdC5cbiAgICAgKiBVcGRhdGluZyB0aGUgc2l6ZSBpbmRpY2F0ZXMgdGhhdCB3ZSBhcmUgZG9uZSB1cGxvYWRpbmcgYWxsIHRoZSBjb250ZW50cyBvZiB0aGUgYXJ0aWZhY3RcbiAgICAgKi9cbiAgICBwYXRjaEFydGlmYWN0U2l6ZShzaXplLCBhcnRpZmFjdE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlVXJsID0gbmV3IHVybF8xLlVSTCh1dGlsc18xLmdldEFydGlmYWN0VXJsKCkpO1xuICAgICAgICAgICAgcmVzb3VyY2VVcmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnYXJ0aWZhY3ROYW1lJywgYXJ0aWZhY3ROYW1lKTtcbiAgICAgICAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSB7IFNpemU6IHNpemUgfTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnN0cmluZ2lmeShwYXJhbWV0ZXJzLCBudWxsLCAyKTtcbiAgICAgICAgICAgIGNvcmUuZGVidWcoYFVSTCBpcyAke3Jlc291cmNlVXJsLnRvU3RyaW5nKCl9YCk7XG4gICAgICAgICAgICAvLyB1c2UgdGhlIGZpcnN0IGNsaWVudCBmcm9tIHRoZSBodHRwTWFuYWdlciwgYGtlZXAtYWxpdmVgIGlzIG5vdCB1c2VkIHNvIHRoZSBjb25uZWN0aW9uIHdpbGwgY2xvc2UgaW1tZWRpYXRlbHlcbiAgICAgICAgICAgIGNvbnN0IGNsaWVudCA9IHRoaXMudXBsb2FkSHR0cE1hbmFnZXIuZ2V0Q2xpZW50KDApO1xuICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IHV0aWxzXzEuZ2V0VXBsb2FkSGVhZGVycygnYXBwbGljYXRpb24vanNvbicsIGZhbHNlKTtcbiAgICAgICAgICAgIC8vIEV4dHJhIGluZm9ybWF0aW9uIHRvIGRpc3BsYXkgd2hlbiBhIHBhcnRpY3VsYXIgSFRUUCBjb2RlIGlzIHJldHVybmVkXG4gICAgICAgICAgICBjb25zdCBjdXN0b21FcnJvck1lc3NhZ2VzID0gbmV3IE1hcChbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBodHRwX2NsaWVudF8xLkh0dHBDb2Rlcy5Ob3RGb3VuZCxcbiAgICAgICAgICAgICAgICAgICAgYEFuIEFydGlmYWN0IHdpdGggdGhlIG5hbWUgJHthcnRpZmFjdE5hbWV9IHdhcyBub3QgZm91bmRgXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAvLyBUT0RPIHJldHJ5IGZvciBhbGwgcG9zc2libGUgcmVzcG9uc2UgY29kZXMsIHRoZSBhcnRpZmFjdCB1cGxvYWQgaXMgcHJldHR5IG11Y2ggY29tcGxldGUgc28gaXQgYXQgYWxsIGNvc3RzIHdlIHNob3VsZCB0cnkgdG8gZmluaXNoIHRoaXNcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0geWllbGQgcmVxdWVzdFV0aWxzXzEucmV0cnlIdHRwQ2xpZW50UmVxdWVzdCgnRmluYWxpemUgYXJ0aWZhY3QgdXBsb2FkJywgKCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkgeyByZXR1cm4gY2xpZW50LnBhdGNoKHJlc291cmNlVXJsLnRvU3RyaW5nKCksIGRhdGEsIGhlYWRlcnMpOyB9KSwgY3VzdG9tRXJyb3JNZXNzYWdlcyk7XG4gICAgICAgICAgICB5aWVsZCByZXNwb25zZS5yZWFkQm9keSgpO1xuICAgICAgICAgICAgY29yZS5kZWJ1ZyhgQXJ0aWZhY3QgJHthcnRpZmFjdE5hbWV9IGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSB1cGxvYWRlZCwgdG90YWwgc2l6ZSBpbiBieXRlczogJHtzaXplfWApO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLlVwbG9hZEh0dHBDbGllbnQgPSBVcGxvYWRIdHRwQ2xpZW50O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXBsb2FkLWh0dHAtY2xpZW50LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH0pO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKGsgIT09IFwiZGVmYXVsdFwiICYmIE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZ2V0VXBsb2FkU3BlY2lmaWNhdGlvbiA9IHZvaWQgMDtcbmNvbnN0IGZzID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJmc1wiKSk7XG5jb25zdCBjb3JlXzEgPSByZXF1aXJlKFwiQGFjdGlvbnMvY29yZVwiKTtcbmNvbnN0IHBhdGhfMSA9IHJlcXVpcmUoXCJwYXRoXCIpO1xuY29uc3QgcGF0aF9hbmRfYXJ0aWZhY3RfbmFtZV92YWxpZGF0aW9uXzEgPSByZXF1aXJlKFwiLi9wYXRoLWFuZC1hcnRpZmFjdC1uYW1lLXZhbGlkYXRpb25cIik7XG4vKipcbiAqIENyZWF0ZXMgYSBzcGVjaWZpY2F0aW9uIHRoYXQgZGVzY3JpYmVzIGhvdyBlYWNoIGZpbGUgdGhhdCBpcyBwYXJ0IG9mIHRoZSBhcnRpZmFjdCB3aWxsIGJlIHVwbG9hZGVkXG4gKiBAcGFyYW0gYXJ0aWZhY3ROYW1lIHRoZSBuYW1lIG9mIHRoZSBhcnRpZmFjdCBiZWluZyB1cGxvYWRlZC4gVXNlZCBkdXJpbmcgdXBsb2FkIHRvIGRlbm90ZSB3aGVyZSB0aGUgYXJ0aWZhY3QgaXMgc3RvcmVkIG9uIHRoZSBzZXJ2ZXJcbiAqIEBwYXJhbSByb290RGlyZWN0b3J5IGFuIGFic29sdXRlIGZpbGUgcGF0aCB0aGF0IGRlbm90ZXMgdGhlIHBhdGggdGhhdCBzaG91bGQgYmUgcmVtb3ZlZCBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgZWFjaCBhcnRpZmFjdCBmaWxlXG4gKiBAcGFyYW0gYXJ0aWZhY3RGaWxlcyBhIGxpc3Qgb2YgYWJzb2x1dGUgZmlsZSBwYXRocyB0aGF0IGRlbm90ZSB3aGF0IHNob3VsZCBiZSB1cGxvYWRlZCBhcyBwYXJ0IG9mIHRoZSBhcnRpZmFjdFxuICovXG5mdW5jdGlvbiBnZXRVcGxvYWRTcGVjaWZpY2F0aW9uKGFydGlmYWN0TmFtZSwgcm9vdERpcmVjdG9yeSwgYXJ0aWZhY3RGaWxlcykge1xuICAgIC8vIGFydGlmYWN0IG5hbWUgd2FzIGNoZWNrZWQgZWFybGllciBvbiwgbm8gbmVlZCB0byBjaGVjayBhZ2FpblxuICAgIGNvbnN0IHNwZWNpZmljYXRpb25zID0gW107XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKHJvb3REaXJlY3RvcnkpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvdmlkZWQgcm9vdERpcmVjdG9yeSAke3Jvb3REaXJlY3Rvcnl9IGRvZXMgbm90IGV4aXN0YCk7XG4gICAgfVxuICAgIGlmICghZnMubHN0YXRTeW5jKHJvb3REaXJlY3RvcnkpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm92aWRlZCByb290RGlyZWN0b3J5ICR7cm9vdERpcmVjdG9yeX0gaXMgbm90IGEgdmFsaWQgZGlyZWN0b3J5YCk7XG4gICAgfVxuICAgIC8vIE5vcm1hbGl6ZSBhbmQgcmVzb2x2ZSwgdGhpcyBhbGxvd3MgZm9yIGVpdGhlciBhYnNvbHV0ZSBvciByZWxhdGl2ZSBwYXRocyB0byBiZSB1c2VkXG4gICAgcm9vdERpcmVjdG9yeSA9IHBhdGhfMS5ub3JtYWxpemUocm9vdERpcmVjdG9yeSk7XG4gICAgcm9vdERpcmVjdG9yeSA9IHBhdGhfMS5yZXNvbHZlKHJvb3REaXJlY3RvcnkpO1xuICAgIC8qXG4gICAgICAgRXhhbXBsZSB0byBkZW1vbnN0cmF0ZSBiZWhhdmlvclxuICAgICAgIFxuICAgICAgIElucHV0OlxuICAgICAgICAgYXJ0aWZhY3ROYW1lOiBteS1hcnRpZmFjdFxuICAgICAgICAgcm9vdERpcmVjdG9yeTogJy9ob21lL3VzZXIvZmlsZXMvcGx6LXVwbG9hZCdcbiAgICAgICAgIGFydGlmYWN0RmlsZXM6IFtcbiAgICAgICAgICAgJy9ob21lL3VzZXIvZmlsZXMvcGx6LXVwbG9hZC9maWxlMS50eHQnLFxuICAgICAgICAgICAnL2hvbWUvdXNlci9maWxlcy9wbHotdXBsb2FkL2ZpbGUyLnR4dCcsXG4gICAgICAgICAgICcvaG9tZS91c2VyL2ZpbGVzL3Bsei11cGxvYWQvZGlyL2ZpbGUzLnR4dCdcbiAgICAgICAgIF1cbiAgICAgICBcbiAgICAgICBPdXRwdXQ6XG4gICAgICAgICBzcGVjaWZpY2F0aW9uczogW1xuICAgICAgICAgICBbJy9ob21lL3VzZXIvZmlsZXMvcGx6LXVwbG9hZC9maWxlMS50eHQnLCAnbXktYXJ0aWZhY3QvZmlsZTEudHh0J10sXG4gICAgICAgICAgIFsnL2hvbWUvdXNlci9maWxlcy9wbHotdXBsb2FkL2ZpbGUxLnR4dCcsICdteS1hcnRpZmFjdC9maWxlMi50eHQnXSxcbiAgICAgICAgICAgWycvaG9tZS91c2VyL2ZpbGVzL3Bsei11cGxvYWQvZmlsZTEudHh0JywgJ215LWFydGlmYWN0L2Rpci9maWxlMy50eHQnXVxuICAgICAgICAgXVxuICAgICovXG4gICAgZm9yIChsZXQgZmlsZSBvZiBhcnRpZmFjdEZpbGVzKSB7XG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhmaWxlKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGaWxlICR7ZmlsZX0gZG9lcyBub3QgZXhpc3RgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWZzLmxzdGF0U3luYyhmaWxlKS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAvLyBOb3JtYWxpemUgYW5kIHJlc29sdmUsIHRoaXMgYWxsb3dzIGZvciBlaXRoZXIgYWJzb2x1dGUgb3IgcmVsYXRpdmUgcGF0aHMgdG8gYmUgdXNlZFxuICAgICAgICAgICAgZmlsZSA9IHBhdGhfMS5ub3JtYWxpemUoZmlsZSk7XG4gICAgICAgICAgICBmaWxlID0gcGF0aF8xLnJlc29sdmUoZmlsZSk7XG4gICAgICAgICAgICBpZiAoIWZpbGUuc3RhcnRzV2l0aChyb290RGlyZWN0b3J5KSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHJvb3REaXJlY3Rvcnk6ICR7cm9vdERpcmVjdG9yeX0gaXMgbm90IGEgcGFyZW50IGRpcmVjdG9yeSBvZiB0aGUgZmlsZTogJHtmaWxlfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGZvcmJpZGRlbiBjaGFyYWN0ZXJzIGluIGZpbGUgcGF0aHMgdGhhdCB3aWxsIGJlIHJlamVjdGVkIGR1cmluZyB1cGxvYWRcbiAgICAgICAgICAgIGNvbnN0IHVwbG9hZFBhdGggPSBmaWxlLnJlcGxhY2Uocm9vdERpcmVjdG9yeSwgJycpO1xuICAgICAgICAgICAgcGF0aF9hbmRfYXJ0aWZhY3RfbmFtZV92YWxpZGF0aW9uXzEuY2hlY2tBcnRpZmFjdEZpbGVQYXRoKHVwbG9hZFBhdGgpO1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgdXBsb2FkRmlsZVBhdGggZGVub3RlcyB3aGVyZSB0aGUgZmlsZSB3aWxsIGJlIHVwbG9hZGVkIGluIHRoZSBmaWxlIGNvbnRhaW5lciBvbiB0aGUgc2VydmVyLiBEdXJpbmcgYSBydW4sIGlmIG11bHRpcGxlIGFydGlmYWN0cyBhcmUgdXBsb2FkZWQsIHRoZXkgd2lsbCBhbGxcbiAgICAgICAgICAgICAgYmUgc2F2ZWQgaW4gdGhlIHNhbWUgY29udGFpbmVyLiBUaGUgYXJ0aWZhY3QgbmFtZSBpcyB1c2VkIGFzIHRoZSByb290IGRpcmVjdG9yeSBpbiB0aGUgY29udGFpbmVyIHRvIHNlcGFyYXRlIGFuZCBkaXN0aW5ndWlzaCB1cGxvYWRlZCBhcnRpZmFjdHNcbiAgICAgIFxuICAgICAgICAgICAgICBwYXRoLmpvaW4gaGFuZGxlcyBhbGwgdGhlIGZvbGxvd2luZyBjYXNlcyBhbmQgd291bGQgcmV0dXJuICdhcnRpZmFjdC1uYW1lL2ZpbGUtdG8tdXBsb2FkLnR4dFxuICAgICAgICAgICAgICAgIGpvaW4oJ2FydGlmYWN0LW5hbWUvJywgJ2ZpbGUtdG8tdXBsb2FkLnR4dCcpXG4gICAgICAgICAgICAgICAgam9pbignYXJ0aWZhY3QtbmFtZS8nLCAnL2ZpbGUtdG8tdXBsb2FkLnR4dCcpXG4gICAgICAgICAgICAgICAgam9pbignYXJ0aWZhY3QtbmFtZScsICdmaWxlLXRvLXVwbG9hZC50eHQnKVxuICAgICAgICAgICAgICAgIGpvaW4oJ2FydGlmYWN0LW5hbWUnLCAnL2ZpbGUtdG8tdXBsb2FkLnR4dCcpXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgc3BlY2lmaWNhdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgYWJzb2x1dGVGaWxlUGF0aDogZmlsZSxcbiAgICAgICAgICAgICAgICB1cGxvYWRGaWxlUGF0aDogcGF0aF8xLmpvaW4oYXJ0aWZhY3ROYW1lLCB1cGxvYWRQYXRoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBEaXJlY3RvcmllcyBhcmUgcmVqZWN0ZWQgYnkgdGhlIHNlcnZlciBkdXJpbmcgdXBsb2FkXG4gICAgICAgICAgICBjb3JlXzEuZGVidWcoYFJlbW92aW5nICR7ZmlsZX0gZnJvbSByYXdTZWFyY2hSZXN1bHRzIGJlY2F1c2UgaXQgaXMgYSBkaXJlY3RvcnlgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3BlY2lmaWNhdGlvbnM7XG59XG5leHBvcnRzLmdldFVwbG9hZFNwZWNpZmljYXRpb24gPSBnZXRVcGxvYWRTcGVjaWZpY2F0aW9uO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXBsb2FkLXNwZWNpZmljYXRpb24uanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGlnZXN0Rm9yU3RyZWFtID0gZXhwb3J0cy5zbGVlcCA9IGV4cG9ydHMuZ2V0UHJvcGVyUmV0ZW50aW9uID0gZXhwb3J0cy5ybUZpbGUgPSBleHBvcnRzLmdldEZpbGVTaXplID0gZXhwb3J0cy5jcmVhdGVFbXB0eUZpbGVzRm9yQXJ0aWZhY3QgPSBleHBvcnRzLmNyZWF0ZURpcmVjdG9yaWVzRm9yQXJ0aWZhY3QgPSBleHBvcnRzLmRpc3BsYXlIdHRwRGlhZ25vc3RpY3MgPSBleHBvcnRzLmdldEFydGlmYWN0VXJsID0gZXhwb3J0cy5jcmVhdGVIdHRwQ2xpZW50ID0gZXhwb3J0cy5nZXRVcGxvYWRIZWFkZXJzID0gZXhwb3J0cy5nZXREb3dubG9hZEhlYWRlcnMgPSBleHBvcnRzLmdldENvbnRlbnRSYW5nZSA9IGV4cG9ydHMudHJ5R2V0UmV0cnlBZnRlclZhbHVlVGltZUluTWlsbGlzZWNvbmRzID0gZXhwb3J0cy5pc1Rocm90dGxlZFN0YXR1c0NvZGUgPSBleHBvcnRzLmlzUmV0cnlhYmxlU3RhdHVzQ29kZSA9IGV4cG9ydHMuaXNGb3JiaWRkZW5TdGF0dXNDb2RlID0gZXhwb3J0cy5pc1N1Y2Nlc3NTdGF0dXNDb2RlID0gZXhwb3J0cy5nZXRBcGlWZXJzaW9uID0gZXhwb3J0cy5wYXJzZUVudk51bWJlciA9IGV4cG9ydHMuZ2V0RXhwb25lbnRpYWxSZXRyeVRpbWVJbk1pbGxpc2Vjb25kcyA9IHZvaWQgMDtcbmNvbnN0IGNyeXB0b18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJjcnlwdG9cIikpO1xuY29uc3QgZnNfMSA9IHJlcXVpcmUoXCJmc1wiKTtcbmNvbnN0IGNvcmVfMSA9IHJlcXVpcmUoXCJAYWN0aW9ucy9jb3JlXCIpO1xuY29uc3QgaHR0cF9jbGllbnRfMSA9IHJlcXVpcmUoXCJAYWN0aW9ucy9odHRwLWNsaWVudFwiKTtcbmNvbnN0IGF1dGhfMSA9IHJlcXVpcmUoXCJAYWN0aW9ucy9odHRwLWNsaWVudC9saWIvYXV0aFwiKTtcbmNvbnN0IGNvbmZpZ192YXJpYWJsZXNfMSA9IHJlcXVpcmUoXCIuL2NvbmZpZy12YXJpYWJsZXNcIik7XG5jb25zdCBjcmM2NF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2NyYzY0XCIpKTtcbi8qKlxuICogUmV0dXJucyBhIHJldHJ5IHRpbWUgaW4gbWlsbGlzZWNvbmRzIHRoYXQgZXhwb25lbnRpYWxseSBnZXRzIGxhcmdlclxuICogZGVwZW5kaW5nIG9uIHRoZSBhbW91bnQgb2YgcmV0cmllcyB0aGF0IGhhdmUgYmVlbiBhdHRlbXB0ZWRcbiAqL1xuZnVuY3Rpb24gZ2V0RXhwb25lbnRpYWxSZXRyeVRpbWVJbk1pbGxpc2Vjb25kcyhyZXRyeUNvdW50KSB7XG4gICAgaWYgKHJldHJ5Q291bnQgPCAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUmV0cnlDb3VudCBzaG91bGQgbm90IGJlIG5lZ2F0aXZlJyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHJldHJ5Q291bnQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZ192YXJpYWJsZXNfMS5nZXRJbml0aWFsUmV0cnlJbnRlcnZhbEluTWlsbGlzZWNvbmRzKCk7XG4gICAgfVxuICAgIGNvbnN0IG1pblRpbWUgPSBjb25maWdfdmFyaWFibGVzXzEuZ2V0SW5pdGlhbFJldHJ5SW50ZXJ2YWxJbk1pbGxpc2Vjb25kcygpICogY29uZmlnX3ZhcmlhYmxlc18xLmdldFJldHJ5TXVsdGlwbGllcigpICogcmV0cnlDb3VudDtcbiAgICBjb25zdCBtYXhUaW1lID0gbWluVGltZSAqIGNvbmZpZ192YXJpYWJsZXNfMS5nZXRSZXRyeU11bHRpcGxpZXIoKTtcbiAgICAvLyByZXR1cm5zIGEgcmFuZG9tIG51bWJlciBiZXR3ZWVuIHRoZSBtaW5UaW1lIChpbmNsdXNpdmUpIGFuZCB0aGUgbWF4VGltZSAoZXhjbHVzaXZlKVxuICAgIHJldHVybiBNYXRoLnRydW5jKE1hdGgucmFuZG9tKCkgKiAobWF4VGltZSAtIG1pblRpbWUpICsgbWluVGltZSk7XG59XG5leHBvcnRzLmdldEV4cG9uZW50aWFsUmV0cnlUaW1lSW5NaWxsaXNlY29uZHMgPSBnZXRFeHBvbmVudGlhbFJldHJ5VGltZUluTWlsbGlzZWNvbmRzO1xuLyoqXG4gKiBQYXJzZXMgYSBlbnYgdmFyaWFibGUgdGhhdCBpcyBhIG51bWJlclxuICovXG5mdW5jdGlvbiBwYXJzZUVudk51bWJlcihrZXkpIHtcbiAgICBjb25zdCB2YWx1ZSA9IE51bWJlcihwcm9jZXNzLmVudltrZXldKTtcbiAgICBpZiAoTnVtYmVyLmlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA8IDApIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuZXhwb3J0cy5wYXJzZUVudk51bWJlciA9IHBhcnNlRW52TnVtYmVyO1xuLyoqXG4gKiBWYXJpb3VzIHV0aWxpdHkgZnVuY3Rpb25zIHRvIGhlbHAgd2l0aCB0aGUgbmVjZXNzYXJ5IEFQSSBjYWxsc1xuICovXG5mdW5jdGlvbiBnZXRBcGlWZXJzaW9uKCkge1xuICAgIHJldHVybiAnNi4wLXByZXZpZXcnO1xufVxuZXhwb3J0cy5nZXRBcGlWZXJzaW9uID0gZ2V0QXBpVmVyc2lvbjtcbmZ1bmN0aW9uIGlzU3VjY2Vzc1N0YXR1c0NvZGUoc3RhdHVzQ29kZSkge1xuICAgIGlmICghc3RhdHVzQ29kZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBzdGF0dXNDb2RlID49IDIwMCAmJiBzdGF0dXNDb2RlIDwgMzAwO1xufVxuZXhwb3J0cy5pc1N1Y2Nlc3NTdGF0dXNDb2RlID0gaXNTdWNjZXNzU3RhdHVzQ29kZTtcbmZ1bmN0aW9uIGlzRm9yYmlkZGVuU3RhdHVzQ29kZShzdGF0dXNDb2RlKSB7XG4gICAgaWYgKCFzdGF0dXNDb2RlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXR1c0NvZGUgPT09IGh0dHBfY2xpZW50XzEuSHR0cENvZGVzLkZvcmJpZGRlbjtcbn1cbmV4cG9ydHMuaXNGb3JiaWRkZW5TdGF0dXNDb2RlID0gaXNGb3JiaWRkZW5TdGF0dXNDb2RlO1xuZnVuY3Rpb24gaXNSZXRyeWFibGVTdGF0dXNDb2RlKHN0YXR1c0NvZGUpIHtcbiAgICBpZiAoIXN0YXR1c0NvZGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCByZXRyeWFibGVTdGF0dXNDb2RlcyA9IFtcbiAgICAgICAgaHR0cF9jbGllbnRfMS5IdHRwQ29kZXMuQmFkR2F0ZXdheSxcbiAgICAgICAgaHR0cF9jbGllbnRfMS5IdHRwQ29kZXMuR2F0ZXdheVRpbWVvdXQsXG4gICAgICAgIGh0dHBfY2xpZW50XzEuSHR0cENvZGVzLkludGVybmFsU2VydmVyRXJyb3IsXG4gICAgICAgIGh0dHBfY2xpZW50XzEuSHR0cENvZGVzLlNlcnZpY2VVbmF2YWlsYWJsZSxcbiAgICAgICAgaHR0cF9jbGllbnRfMS5IdHRwQ29kZXMuVG9vTWFueVJlcXVlc3RzLFxuICAgICAgICA0MTMgLy8gUGF5bG9hZCBUb28gTGFyZ2VcbiAgICBdO1xuICAgIHJldHVybiByZXRyeWFibGVTdGF0dXNDb2Rlcy5pbmNsdWRlcyhzdGF0dXNDb2RlKTtcbn1cbmV4cG9ydHMuaXNSZXRyeWFibGVTdGF0dXNDb2RlID0gaXNSZXRyeWFibGVTdGF0dXNDb2RlO1xuZnVuY3Rpb24gaXNUaHJvdHRsZWRTdGF0dXNDb2RlKHN0YXR1c0NvZGUpIHtcbiAgICBpZiAoIXN0YXR1c0NvZGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdHVzQ29kZSA9PT0gaHR0cF9jbGllbnRfMS5IdHRwQ29kZXMuVG9vTWFueVJlcXVlc3RzO1xufVxuZXhwb3J0cy5pc1Rocm90dGxlZFN0YXR1c0NvZGUgPSBpc1Rocm90dGxlZFN0YXR1c0NvZGU7XG4vKipcbiAqIEF0dGVtcHRzIHRvIGdldCB0aGUgcmV0cnktYWZ0ZXIgdmFsdWUgZnJvbSBhIHNldCBvZiBodHRwIGhlYWRlcnMuIFRoZSByZXRyeSB0aW1lXG4gKiBpcyBvcmlnaW5hbGx5IGRlbm90ZWQgaW4gc2Vjb25kcywgc28gaWYgcHJlc2VudCwgaXQgaXMgY29udmVydGVkIHRvIG1pbGxpc2Vjb25kc1xuICogQHBhcmFtIGhlYWRlcnMgYWxsIHRoZSBoZWFkZXJzIHJlY2VpdmVkIHdoZW4gbWFraW5nIGFuIGh0dHAgY2FsbFxuICovXG5mdW5jdGlvbiB0cnlHZXRSZXRyeUFmdGVyVmFsdWVUaW1lSW5NaWxsaXNlY29uZHMoaGVhZGVycykge1xuICAgIGlmIChoZWFkZXJzWydyZXRyeS1hZnRlciddKSB7XG4gICAgICAgIGNvbnN0IHJldHJ5VGltZSA9IE51bWJlcihoZWFkZXJzWydyZXRyeS1hZnRlciddKTtcbiAgICAgICAgaWYgKCFpc05hTihyZXRyeVRpbWUpKSB7XG4gICAgICAgICAgICBjb3JlXzEuaW5mbyhgUmV0cnktQWZ0ZXIgaGVhZGVyIGlzIHByZXNlbnQgd2l0aCBhIHZhbHVlIG9mICR7cmV0cnlUaW1lfWApO1xuICAgICAgICAgICAgcmV0dXJuIHJldHJ5VGltZSAqIDEwMDA7XG4gICAgICAgIH1cbiAgICAgICAgY29yZV8xLmluZm8oYFJldHVybmVkIHJldHJ5LWFmdGVyIGhlYWRlciB2YWx1ZTogJHtyZXRyeVRpbWV9IGlzIG5vbi1udW1lcmljIGFuZCBjYW5ub3QgYmUgdXNlZGApO1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb3JlXzEuaW5mbyhgTm8gcmV0cnktYWZ0ZXIgaGVhZGVyIHdhcyBmb3VuZC4gRHVtcGluZyBhbGwgaGVhZGVycyBmb3IgZGlhZ25vc3RpYyBwdXJwb3Nlc2ApO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgY29uc29sZS5sb2coaGVhZGVycyk7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbmV4cG9ydHMudHJ5R2V0UmV0cnlBZnRlclZhbHVlVGltZUluTWlsbGlzZWNvbmRzID0gdHJ5R2V0UmV0cnlBZnRlclZhbHVlVGltZUluTWlsbGlzZWNvbmRzO1xuZnVuY3Rpb24gZ2V0Q29udGVudFJhbmdlKHN0YXJ0LCBlbmQsIHRvdGFsKSB7XG4gICAgLy8gRm9ybWF0OiBgYnl0ZXMgc3RhcnQtZW5kL2ZpbGVTaXplXG4gICAgLy8gc3RhcnQgYW5kIGVuZCBhcmUgaW5jbHVzaXZlXG4gICAgLy8gRm9yIGEgMjAwIGJ5dGUgY2h1bmsgc3RhcnRpbmcgYXQgYnl0ZSAwOlxuICAgIC8vIENvbnRlbnQtUmFuZ2U6IGJ5dGVzIDAtMTk5LzIwMFxuICAgIHJldHVybiBgYnl0ZXMgJHtzdGFydH0tJHtlbmR9LyR7dG90YWx9YDtcbn1cbmV4cG9ydHMuZ2V0Q29udGVudFJhbmdlID0gZ2V0Q29udGVudFJhbmdlO1xuLyoqXG4gKiBTZXRzIGFsbCB0aGUgbmVjZXNzYXJ5IGhlYWRlcnMgd2hlbiBkb3dubG9hZGluZyBhbiBhcnRpZmFjdFxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnRUeXBlIHRoZSB0eXBlIG9mIGNvbnRlbnQgYmVpbmcgdXBsb2FkZWRcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNLZWVwQWxpdmUgaXMgdGhlIHNhbWUgY29ubmVjdGlvbiBiZWluZyB1c2VkIHRvIG1ha2UgbXVsdGlwbGUgY2FsbHNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYWNjZXB0R3ppcCBjYW4gd2UgYWNjZXB0IGEgZ3ppcCBlbmNvZGVkIHJlc3BvbnNlXG4gKiBAcGFyYW0ge3N0cmluZ30gYWNjZXB0VHlwZSB0aGUgdHlwZSBvZiBjb250ZW50IHRoYXQgd2UgY2FuIGFjY2VwdFxuICogQHJldHVybnMgYXBwcm9wcmlhdGUgaGVhZGVycyB0byBtYWtlIGEgc3BlY2lmaWMgaHR0cCBjYWxsIGR1cmluZyBhcnRpZmFjdCBkb3dubG9hZFxuICovXG5mdW5jdGlvbiBnZXREb3dubG9hZEhlYWRlcnMoY29udGVudFR5cGUsIGlzS2VlcEFsaXZlLCBhY2NlcHRHemlwKSB7XG4gICAgY29uc3QgcmVxdWVzdE9wdGlvbnMgPSB7fTtcbiAgICBpZiAoY29udGVudFR5cGUpIHtcbiAgICAgICAgcmVxdWVzdE9wdGlvbnNbJ0NvbnRlbnQtVHlwZSddID0gY29udGVudFR5cGU7XG4gICAgfVxuICAgIGlmIChpc0tlZXBBbGl2ZSkge1xuICAgICAgICByZXF1ZXN0T3B0aW9uc1snQ29ubmVjdGlvbiddID0gJ0tlZXAtQWxpdmUnO1xuICAgICAgICAvLyBrZWVwIGFsaXZlIGZvciBhdCBsZWFzdCAxMCBzZWNvbmRzIGJlZm9yZSBjbG9zaW5nIHRoZSBjb25uZWN0aW9uXG4gICAgICAgIHJlcXVlc3RPcHRpb25zWydLZWVwLUFsaXZlJ10gPSAnMTAnO1xuICAgIH1cbiAgICBpZiAoYWNjZXB0R3ppcCkge1xuICAgICAgICAvLyBpZiB3ZSBhcmUgZXhwZWN0aW5nIGEgcmVzcG9uc2Ugd2l0aCBnemlwIGVuY29kaW5nLCBpdCBzaG91bGQgYmUgdXNpbmcgYW4gb2N0ZXQtc3RyZWFtIGluIHRoZSBhY2NlcHQgaGVhZGVyXG4gICAgICAgIHJlcXVlc3RPcHRpb25zWydBY2NlcHQtRW5jb2RpbmcnXSA9ICdnemlwJztcbiAgICAgICAgcmVxdWVzdE9wdGlvbnNbJ0FjY2VwdCddID0gYGFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbTthcGktdmVyc2lvbj0ke2dldEFwaVZlcnNpb24oKX1gO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gZGVmYXVsdCB0byBhcHBsaWNhdGlvbi9qc29uIGlmIHdlIGFyZSBub3Qgd29ya2luZyB3aXRoIGd6aXAgY29udGVudFxuICAgICAgICByZXF1ZXN0T3B0aW9uc1snQWNjZXB0J10gPSBgYXBwbGljYXRpb24vanNvbjthcGktdmVyc2lvbj0ke2dldEFwaVZlcnNpb24oKX1gO1xuICAgIH1cbiAgICByZXR1cm4gcmVxdWVzdE9wdGlvbnM7XG59XG5leHBvcnRzLmdldERvd25sb2FkSGVhZGVycyA9IGdldERvd25sb2FkSGVhZGVycztcbi8qKlxuICogU2V0cyBhbGwgdGhlIG5lY2Vzc2FyeSBoZWFkZXJzIHdoZW4gdXBsb2FkaW5nIGFuIGFydGlmYWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudFR5cGUgdGhlIHR5cGUgb2YgY29udGVudCBiZWluZyB1cGxvYWRlZFxuICogQHBhcmFtIHtib29sZWFufSBpc0tlZXBBbGl2ZSBpcyB0aGUgc2FtZSBjb25uZWN0aW9uIGJlaW5nIHVzZWQgdG8gbWFrZSBtdWx0aXBsZSBjYWxsc1xuICogQHBhcmFtIHtib29sZWFufSBpc0d6aXAgaXMgdGhlIGNvbm5lY3Rpb24gYmVpbmcgdXNlZCB0byB1cGxvYWQgR1ppcCBjb21wcmVzc2VkIGNvbnRlbnRcbiAqIEBwYXJhbSB7bnVtYmVyfSB1bmNvbXByZXNzZWRMZW5ndGggdGhlIG9yaWdpbmFsIHNpemUgb2YgdGhlIGNvbnRlbnQgaWYgc29tZXRoaW5nIGlzIGJlaW5nIHVwbG9hZGVkIHRoYXQgaGFzIGJlZW4gY29tcHJlc3NlZFxuICogQHBhcmFtIHtudW1iZXJ9IGNvbnRlbnRMZW5ndGggdGhlIGxlbmd0aCBvZiB0aGUgY29udGVudCB0aGF0IGlzIGJlaW5nIHVwbG9hZGVkXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudFJhbmdlIHRoZSByYW5nZSBvZiB0aGUgY29udGVudCB0aGF0IGlzIGJlaW5nIHVwbG9hZGVkXG4gKiBAcmV0dXJucyBhcHByb3ByaWF0ZSBoZWFkZXJzIHRvIG1ha2UgYSBzcGVjaWZpYyBodHRwIGNhbGwgZHVyaW5nIGFydGlmYWN0IHVwbG9hZFxuICovXG5mdW5jdGlvbiBnZXRVcGxvYWRIZWFkZXJzKGNvbnRlbnRUeXBlLCBpc0tlZXBBbGl2ZSwgaXNHemlwLCB1bmNvbXByZXNzZWRMZW5ndGgsIGNvbnRlbnRMZW5ndGgsIGNvbnRlbnRSYW5nZSwgZGlnZXN0KSB7XG4gICAgY29uc3QgcmVxdWVzdE9wdGlvbnMgPSB7fTtcbiAgICByZXF1ZXN0T3B0aW9uc1snQWNjZXB0J10gPSBgYXBwbGljYXRpb24vanNvbjthcGktdmVyc2lvbj0ke2dldEFwaVZlcnNpb24oKX1gO1xuICAgIGlmIChjb250ZW50VHlwZSkge1xuICAgICAgICByZXF1ZXN0T3B0aW9uc1snQ29udGVudC1UeXBlJ10gPSBjb250ZW50VHlwZTtcbiAgICB9XG4gICAgaWYgKGlzS2VlcEFsaXZlKSB7XG4gICAgICAgIHJlcXVlc3RPcHRpb25zWydDb25uZWN0aW9uJ10gPSAnS2VlcC1BbGl2ZSc7XG4gICAgICAgIC8vIGtlZXAgYWxpdmUgZm9yIGF0IGxlYXN0IDEwIHNlY29uZHMgYmVmb3JlIGNsb3NpbmcgdGhlIGNvbm5lY3Rpb25cbiAgICAgICAgcmVxdWVzdE9wdGlvbnNbJ0tlZXAtQWxpdmUnXSA9ICcxMCc7XG4gICAgfVxuICAgIGlmIChpc0d6aXApIHtcbiAgICAgICAgcmVxdWVzdE9wdGlvbnNbJ0NvbnRlbnQtRW5jb2RpbmcnXSA9ICdnemlwJztcbiAgICAgICAgcmVxdWVzdE9wdGlvbnNbJ3gtdGZzLWZpbGVsZW5ndGgnXSA9IHVuY29tcHJlc3NlZExlbmd0aDtcbiAgICB9XG4gICAgaWYgKGNvbnRlbnRMZW5ndGgpIHtcbiAgICAgICAgcmVxdWVzdE9wdGlvbnNbJ0NvbnRlbnQtTGVuZ3RoJ10gPSBjb250ZW50TGVuZ3RoO1xuICAgIH1cbiAgICBpZiAoY29udGVudFJhbmdlKSB7XG4gICAgICAgIHJlcXVlc3RPcHRpb25zWydDb250ZW50LVJhbmdlJ10gPSBjb250ZW50UmFuZ2U7XG4gICAgfVxuICAgIGlmIChkaWdlc3QpIHtcbiAgICAgICAgcmVxdWVzdE9wdGlvbnNbJ3gtYWN0aW9ucy1yZXN1bHRzLWNyYzY0J10gPSBkaWdlc3QuY3JjNjQ7XG4gICAgICAgIHJlcXVlc3RPcHRpb25zWyd4LWFjdGlvbnMtcmVzdWx0cy1tZDUnXSA9IGRpZ2VzdC5tZDU7XG4gICAgfVxuICAgIHJldHVybiByZXF1ZXN0T3B0aW9ucztcbn1cbmV4cG9ydHMuZ2V0VXBsb2FkSGVhZGVycyA9IGdldFVwbG9hZEhlYWRlcnM7XG5mdW5jdGlvbiBjcmVhdGVIdHRwQ2xpZW50KHVzZXJBZ2VudCkge1xuICAgIHJldHVybiBuZXcgaHR0cF9jbGllbnRfMS5IdHRwQ2xpZW50KHVzZXJBZ2VudCwgW1xuICAgICAgICBuZXcgYXV0aF8xLkJlYXJlckNyZWRlbnRpYWxIYW5kbGVyKGNvbmZpZ192YXJpYWJsZXNfMS5nZXRSdW50aW1lVG9rZW4oKSlcbiAgICBdKTtcbn1cbmV4cG9ydHMuY3JlYXRlSHR0cENsaWVudCA9IGNyZWF0ZUh0dHBDbGllbnQ7XG5mdW5jdGlvbiBnZXRBcnRpZmFjdFVybCgpIHtcbiAgICBjb25zdCBhcnRpZmFjdFVybCA9IGAke2NvbmZpZ192YXJpYWJsZXNfMS5nZXRSdW50aW1lVXJsKCl9X2FwaXMvcGlwZWxpbmVzL3dvcmtmbG93cy8ke2NvbmZpZ192YXJpYWJsZXNfMS5nZXRXb3JrRmxvd1J1bklkKCl9L2FydGlmYWN0cz9hcGktdmVyc2lvbj0ke2dldEFwaVZlcnNpb24oKX1gO1xuICAgIGNvcmVfMS5kZWJ1ZyhgQXJ0aWZhY3QgVXJsOiAke2FydGlmYWN0VXJsfWApO1xuICAgIHJldHVybiBhcnRpZmFjdFVybDtcbn1cbmV4cG9ydHMuZ2V0QXJ0aWZhY3RVcmwgPSBnZXRBcnRpZmFjdFVybDtcbi8qKlxuICogVWggb2ghIFNvbWV0aGluZyBtaWdodCBoYXZlIGdvbmUgd3JvbmcgZHVyaW5nIGVpdGhlciB1cGxvYWQgb3IgZG93bmxvYWQuIFRoZSBJSHR0dHBDbGllbnRSZXNwb25zZSBvYmplY3QgY29udGFpbnMgaW5mb3JtYXRpb25cbiAqIGFib3V0IHRoZSBodHRwIGNhbGwgdGhhdCB3YXMgbWFkZSBieSB0aGUgYWN0aW9ucyBodHRwIGNsaWVudC4gVGhpcyBpbmZvcm1hdGlvbiBtaWdodCBiZSB1c2VmdWwgdG8gZGlzcGxheSBmb3IgZGlhZ25vc3RpYyBwdXJwb3NlcywgYnV0XG4gKiB0aGlzIGVudGlyZSBvYmplY3QgaXMgcmVhbGx5IGJpZyBhbmQgbW9zdCBvZiB0aGUgaW5mb3JtYXRpb24gaXMgbm90IHJlYWxseSB1c2VmdWwuIFRoaXMgZnVuY3Rpb24gdGFrZXMgdGhlIHJlc3BvbnNlIG9iamVjdCBhbmQgZGlzcGxheXMgb25seVxuICogdGhlIGluZm9ybWF0aW9uIHRoYXQgd2Ugd2FudC5cbiAqXG4gKiBDZXJ0YWluIGluZm9ybWF0aW9uIHN1Y2ggYXMgdGhlIFRMU1NvY2tldCBhbmQgdGhlIFJlYWRhYmxlIHN0YXRlIGFyZSBub3QgcmVhbGx5IHVzZWZ1bCBmb3IgZGlhZ25vc3RpYyBwdXJwb3NlcyBzbyB0aGV5IGNhbiBiZSBhdm9pZGVkLlxuICogT3RoZXIgaW5mb3JtYXRpb24gc3VjaCBhcyB0aGUgaGVhZGVycywgdGhlIHJlc3BvbnNlIGNvZGUgYW5kIG1lc3NhZ2UgbWlnaHQgYmUgdXNlZnVsLCBzbyB0aGlzIGlzIGRpc3BsYXllZC5cbiAqL1xuZnVuY3Rpb24gZGlzcGxheUh0dHBEaWFnbm9zdGljcyhyZXNwb25zZSkge1xuICAgIGNvcmVfMS5pbmZvKGAjIyMjIyBCZWdpbiBEaWFnbm9zdGljIEhUVFAgaW5mb3JtYXRpb24gIyMjIyNcblN0YXR1cyBDb2RlOiAke3Jlc3BvbnNlLm1lc3NhZ2Uuc3RhdHVzQ29kZX1cblN0YXR1cyBNZXNzYWdlOiAke3Jlc3BvbnNlLm1lc3NhZ2Uuc3RhdHVzTWVzc2FnZX1cbkhlYWRlciBJbmZvcm1hdGlvbjogJHtKU09OLnN0cmluZ2lmeShyZXNwb25zZS5tZXNzYWdlLmhlYWRlcnMsIHVuZGVmaW5lZCwgMil9XG4jIyMjIyMgRW5kIERpYWdub3N0aWMgSFRUUCBpbmZvcm1hdGlvbiAjIyMjIyNgKTtcbn1cbmV4cG9ydHMuZGlzcGxheUh0dHBEaWFnbm9zdGljcyA9IGRpc3BsYXlIdHRwRGlhZ25vc3RpY3M7XG5mdW5jdGlvbiBjcmVhdGVEaXJlY3Rvcmllc0ZvckFydGlmYWN0KGRpcmVjdG9yaWVzKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgZm9yIChjb25zdCBkaXJlY3Rvcnkgb2YgZGlyZWN0b3JpZXMpIHtcbiAgICAgICAgICAgIHlpZWxkIGZzXzEucHJvbWlzZXMubWtkaXIoZGlyZWN0b3J5LCB7XG4gICAgICAgICAgICAgICAgcmVjdXJzaXZlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuZXhwb3J0cy5jcmVhdGVEaXJlY3Rvcmllc0ZvckFydGlmYWN0ID0gY3JlYXRlRGlyZWN0b3JpZXNGb3JBcnRpZmFjdDtcbmZ1bmN0aW9uIGNyZWF0ZUVtcHR5RmlsZXNGb3JBcnRpZmFjdChlbXB0eUZpbGVzVG9DcmVhdGUpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGVtcHR5RmlsZXNUb0NyZWF0ZSkge1xuICAgICAgICAgICAgeWllbGQgKHlpZWxkIGZzXzEucHJvbWlzZXMub3BlbihmaWxlUGF0aCwgJ3cnKSkuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuZXhwb3J0cy5jcmVhdGVFbXB0eUZpbGVzRm9yQXJ0aWZhY3QgPSBjcmVhdGVFbXB0eUZpbGVzRm9yQXJ0aWZhY3Q7XG5mdW5jdGlvbiBnZXRGaWxlU2l6ZShmaWxlUGF0aCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGNvbnN0IHN0YXRzID0geWllbGQgZnNfMS5wcm9taXNlcy5zdGF0KGZpbGVQYXRoKTtcbiAgICAgICAgY29yZV8xLmRlYnVnKGAke2ZpbGVQYXRofSBzaXplOigke3N0YXRzLnNpemV9KSBibGtzaXplOigke3N0YXRzLmJsa3NpemV9KSBibG9ja3M6KCR7c3RhdHMuYmxvY2tzfSlgKTtcbiAgICAgICAgcmV0dXJuIHN0YXRzLnNpemU7XG4gICAgfSk7XG59XG5leHBvcnRzLmdldEZpbGVTaXplID0gZ2V0RmlsZVNpemU7XG5mdW5jdGlvbiBybUZpbGUoZmlsZVBhdGgpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICB5aWVsZCBmc18xLnByb21pc2VzLnVubGluayhmaWxlUGF0aCk7XG4gICAgfSk7XG59XG5leHBvcnRzLnJtRmlsZSA9IHJtRmlsZTtcbmZ1bmN0aW9uIGdldFByb3BlclJldGVudGlvbihyZXRlbnRpb25JbnB1dCwgcmV0ZW50aW9uU2V0dGluZykge1xuICAgIGlmIChyZXRlbnRpb25JbnB1dCA8IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHJldGVudGlvbiwgbWluaW11bSB2YWx1ZSBpcyAxLicpO1xuICAgIH1cbiAgICBsZXQgcmV0ZW50aW9uID0gcmV0ZW50aW9uSW5wdXQ7XG4gICAgaWYgKHJldGVudGlvblNldHRpbmcpIHtcbiAgICAgICAgY29uc3QgbWF4UmV0ZW50aW9uID0gcGFyc2VJbnQocmV0ZW50aW9uU2V0dGluZyk7XG4gICAgICAgIGlmICghaXNOYU4obWF4UmV0ZW50aW9uKSAmJiBtYXhSZXRlbnRpb24gPCByZXRlbnRpb24pIHtcbiAgICAgICAgICAgIGNvcmVfMS53YXJuaW5nKGBSZXRlbnRpb24gZGF5cyBpcyBncmVhdGVyIHRoYW4gdGhlIG1heCB2YWx1ZSBhbGxvd2VkIGJ5IHRoZSByZXBvc2l0b3J5IHNldHRpbmcsIHJlZHVjZSByZXRlbnRpb24gdG8gJHttYXhSZXRlbnRpb259IGRheXNgKTtcbiAgICAgICAgICAgIHJldGVudGlvbiA9IG1heFJldGVudGlvbjtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmV0ZW50aW9uO1xufVxuZXhwb3J0cy5nZXRQcm9wZXJSZXRlbnRpb24gPSBnZXRQcm9wZXJSZXRlbnRpb247XG5mdW5jdGlvbiBzbGVlcChtaWxsaXNlY29uZHMpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1pbGxpc2Vjb25kcykpO1xuICAgIH0pO1xufVxuZXhwb3J0cy5zbGVlcCA9IHNsZWVwO1xuZnVuY3Rpb24gZGlnZXN0Rm9yU3RyZWFtKHN0cmVhbSkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjcmM2NCA9IG5ldyBjcmM2NF8xLmRlZmF1bHQoKTtcbiAgICAgICAgICAgIGNvbnN0IG1kNSA9IGNyeXB0b18xLmRlZmF1bHQuY3JlYXRlSGFzaCgnbWQ1Jyk7XG4gICAgICAgICAgICBzdHJlYW1cbiAgICAgICAgICAgICAgICAub24oJ2RhdGEnLCBkYXRhID0+IHtcbiAgICAgICAgICAgICAgICBjcmM2NC51cGRhdGUoZGF0YSk7XG4gICAgICAgICAgICAgICAgbWQ1LnVwZGF0ZShkYXRhKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLm9uKCdlbmQnLCAoKSA9PiByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICBjcmM2NDogY3JjNjQuZGlnZXN0KCdiYXNlNjQnKSxcbiAgICAgICAgICAgICAgICBtZDU6IG1kNS5kaWdlc3QoJ2Jhc2U2NCcpXG4gICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICAub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5leHBvcnRzLmRpZ2VzdEZvclN0cmVhbSA9IGRpZ2VzdEZvclN0cmVhbTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXV0aWxzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH0pO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKGsgIT09IFwiZGVmYXVsdFwiICYmIE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuaXNzdWUgPSBleHBvcnRzLmlzc3VlQ29tbWFuZCA9IHZvaWQgMDtcbmNvbnN0IG9zID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJvc1wiKSk7XG5jb25zdCB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG4vKipcbiAqIENvbW1hbmRzXG4gKlxuICogQ29tbWFuZCBGb3JtYXQ6XG4gKiAgIDo6bmFtZSBrZXk9dmFsdWUsa2V5PXZhbHVlOjptZXNzYWdlXG4gKlxuICogRXhhbXBsZXM6XG4gKiAgIDo6d2FybmluZzo6VGhpcyBpcyB0aGUgbWVzc2FnZVxuICogICA6OnNldC1lbnYgbmFtZT1NWV9WQVI6OnNvbWUgdmFsdWVcbiAqL1xuZnVuY3Rpb24gaXNzdWVDb21tYW5kKGNvbW1hbmQsIHByb3BlcnRpZXMsIG1lc3NhZ2UpIHtcbiAgICBjb25zdCBjbWQgPSBuZXcgQ29tbWFuZChjb21tYW5kLCBwcm9wZXJ0aWVzLCBtZXNzYWdlKTtcbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShjbWQudG9TdHJpbmcoKSArIG9zLkVPTCk7XG59XG5leHBvcnRzLmlzc3VlQ29tbWFuZCA9IGlzc3VlQ29tbWFuZDtcbmZ1bmN0aW9uIGlzc3VlKG5hbWUsIG1lc3NhZ2UgPSAnJykge1xuICAgIGlzc3VlQ29tbWFuZChuYW1lLCB7fSwgbWVzc2FnZSk7XG59XG5leHBvcnRzLmlzc3VlID0gaXNzdWU7XG5jb25zdCBDTURfU1RSSU5HID0gJzo6JztcbmNsYXNzIENvbW1hbmQge1xuICAgIGNvbnN0cnVjdG9yKGNvbW1hbmQsIHByb3BlcnRpZXMsIG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKCFjb21tYW5kKSB7XG4gICAgICAgICAgICBjb21tYW5kID0gJ21pc3NpbmcuY29tbWFuZCc7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb21tYW5kID0gY29tbWFuZDtcbiAgICAgICAgdGhpcy5wcm9wZXJ0aWVzID0gcHJvcGVydGllcztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB9XG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIGxldCBjbWRTdHIgPSBDTURfU1RSSU5HICsgdGhpcy5jb21tYW5kO1xuICAgICAgICBpZiAodGhpcy5wcm9wZXJ0aWVzICYmIE9iamVjdC5rZXlzKHRoaXMucHJvcGVydGllcykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY21kU3RyICs9ICcgJztcbiAgICAgICAgICAgIGxldCBmaXJzdCA9IHRydWU7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsID0gdGhpcy5wcm9wZXJ0aWVzW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbWRTdHIgKz0gJywnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY21kU3RyICs9IGAke2tleX09JHtlc2NhcGVQcm9wZXJ0eSh2YWwpfWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY21kU3RyICs9IGAke0NNRF9TVFJJTkd9JHtlc2NhcGVEYXRhKHRoaXMubWVzc2FnZSl9YDtcbiAgICAgICAgcmV0dXJuIGNtZFN0cjtcbiAgICB9XG59XG5mdW5jdGlvbiBlc2NhcGVEYXRhKHMpIHtcbiAgICByZXR1cm4gdXRpbHNfMS50b0NvbW1hbmRWYWx1ZShzKVxuICAgICAgICAucmVwbGFjZSgvJS9nLCAnJTI1JylcbiAgICAgICAgLnJlcGxhY2UoL1xcci9nLCAnJTBEJylcbiAgICAgICAgLnJlcGxhY2UoL1xcbi9nLCAnJTBBJyk7XG59XG5mdW5jdGlvbiBlc2NhcGVQcm9wZXJ0eShzKSB7XG4gICAgcmV0dXJuIHV0aWxzXzEudG9Db21tYW5kVmFsdWUocylcbiAgICAgICAgLnJlcGxhY2UoLyUvZywgJyUyNScpXG4gICAgICAgIC5yZXBsYWNlKC9cXHIvZywgJyUwRCcpXG4gICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJyUwQScpXG4gICAgICAgIC5yZXBsYWNlKC86L2csICclM0EnKVxuICAgICAgICAucmVwbGFjZSgvLC9nLCAnJTJDJyk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb21tYW5kLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH0pO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKGsgIT09IFwiZGVmYXVsdFwiICYmIE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5nZXRJRFRva2VuID0gZXhwb3J0cy5nZXRTdGF0ZSA9IGV4cG9ydHMuc2F2ZVN0YXRlID0gZXhwb3J0cy5ncm91cCA9IGV4cG9ydHMuZW5kR3JvdXAgPSBleHBvcnRzLnN0YXJ0R3JvdXAgPSBleHBvcnRzLmluZm8gPSBleHBvcnRzLm5vdGljZSA9IGV4cG9ydHMud2FybmluZyA9IGV4cG9ydHMuZXJyb3IgPSBleHBvcnRzLmRlYnVnID0gZXhwb3J0cy5pc0RlYnVnID0gZXhwb3J0cy5zZXRGYWlsZWQgPSBleHBvcnRzLnNldENvbW1hbmRFY2hvID0gZXhwb3J0cy5zZXRPdXRwdXQgPSBleHBvcnRzLmdldEJvb2xlYW5JbnB1dCA9IGV4cG9ydHMuZ2V0TXVsdGlsaW5lSW5wdXQgPSBleHBvcnRzLmdldElucHV0ID0gZXhwb3J0cy5hZGRQYXRoID0gZXhwb3J0cy5zZXRTZWNyZXQgPSBleHBvcnRzLmV4cG9ydFZhcmlhYmxlID0gZXhwb3J0cy5FeGl0Q29kZSA9IHZvaWQgMDtcbmNvbnN0IGNvbW1hbmRfMSA9IHJlcXVpcmUoXCIuL2NvbW1hbmRcIik7XG5jb25zdCBmaWxlX2NvbW1hbmRfMSA9IHJlcXVpcmUoXCIuL2ZpbGUtY29tbWFuZFwiKTtcbmNvbnN0IHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbmNvbnN0IG9zID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJvc1wiKSk7XG5jb25zdCBwYXRoID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJwYXRoXCIpKTtcbmNvbnN0IG9pZGNfdXRpbHNfMSA9IHJlcXVpcmUoXCIuL29pZGMtdXRpbHNcIik7XG4vKipcbiAqIFRoZSBjb2RlIHRvIGV4aXQgYW4gYWN0aW9uXG4gKi9cbnZhciBFeGl0Q29kZTtcbihmdW5jdGlvbiAoRXhpdENvZGUpIHtcbiAgICAvKipcbiAgICAgKiBBIGNvZGUgaW5kaWNhdGluZyB0aGF0IHRoZSBhY3Rpb24gd2FzIHN1Y2Nlc3NmdWxcbiAgICAgKi9cbiAgICBFeGl0Q29kZVtFeGl0Q29kZVtcIlN1Y2Nlc3NcIl0gPSAwXSA9IFwiU3VjY2Vzc1wiO1xuICAgIC8qKlxuICAgICAqIEEgY29kZSBpbmRpY2F0aW5nIHRoYXQgdGhlIGFjdGlvbiB3YXMgYSBmYWlsdXJlXG4gICAgICovXG4gICAgRXhpdENvZGVbRXhpdENvZGVbXCJGYWlsdXJlXCJdID0gMV0gPSBcIkZhaWx1cmVcIjtcbn0pKEV4aXRDb2RlID0gZXhwb3J0cy5FeGl0Q29kZSB8fCAoZXhwb3J0cy5FeGl0Q29kZSA9IHt9KSk7XG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBWYXJpYWJsZXNcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8qKlxuICogU2V0cyBlbnYgdmFyaWFibGUgZm9yIHRoaXMgYWN0aW9uIGFuZCBmdXR1cmUgYWN0aW9ucyBpbiB0aGUgam9iXG4gKiBAcGFyYW0gbmFtZSB0aGUgbmFtZSBvZiB0aGUgdmFyaWFibGUgdG8gc2V0XG4gKiBAcGFyYW0gdmFsIHRoZSB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuIE5vbi1zdHJpbmcgdmFsdWVzIHdpbGwgYmUgY29udmVydGVkIHRvIGEgc3RyaW5nIHZpYSBKU09OLnN0cmluZ2lmeVxuICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuZnVuY3Rpb24gZXhwb3J0VmFyaWFibGUobmFtZSwgdmFsKSB7XG4gICAgY29uc3QgY29udmVydGVkVmFsID0gdXRpbHNfMS50b0NvbW1hbmRWYWx1ZSh2YWwpO1xuICAgIHByb2Nlc3MuZW52W25hbWVdID0gY29udmVydGVkVmFsO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gcHJvY2Vzcy5lbnZbJ0dJVEhVQl9FTlYnXSB8fCAnJztcbiAgICBpZiAoZmlsZVBhdGgpIHtcbiAgICAgICAgcmV0dXJuIGZpbGVfY29tbWFuZF8xLmlzc3VlRmlsZUNvbW1hbmQoJ0VOVicsIGZpbGVfY29tbWFuZF8xLnByZXBhcmVLZXlWYWx1ZU1lc3NhZ2UobmFtZSwgdmFsKSk7XG4gICAgfVxuICAgIGNvbW1hbmRfMS5pc3N1ZUNvbW1hbmQoJ3NldC1lbnYnLCB7IG5hbWUgfSwgY29udmVydGVkVmFsKTtcbn1cbmV4cG9ydHMuZXhwb3J0VmFyaWFibGUgPSBleHBvcnRWYXJpYWJsZTtcbi8qKlxuICogUmVnaXN0ZXJzIGEgc2VjcmV0IHdoaWNoIHdpbGwgZ2V0IG1hc2tlZCBmcm9tIGxvZ3NcbiAqIEBwYXJhbSBzZWNyZXQgdmFsdWUgb2YgdGhlIHNlY3JldFxuICovXG5mdW5jdGlvbiBzZXRTZWNyZXQoc2VjcmV0KSB7XG4gICAgY29tbWFuZF8xLmlzc3VlQ29tbWFuZCgnYWRkLW1hc2snLCB7fSwgc2VjcmV0KTtcbn1cbmV4cG9ydHMuc2V0U2VjcmV0ID0gc2V0U2VjcmV0O1xuLyoqXG4gKiBQcmVwZW5kcyBpbnB1dFBhdGggdG8gdGhlIFBBVEggKGZvciB0aGlzIGFjdGlvbiBhbmQgZnV0dXJlIGFjdGlvbnMpXG4gKiBAcGFyYW0gaW5wdXRQYXRoXG4gKi9cbmZ1bmN0aW9uIGFkZFBhdGgoaW5wdXRQYXRoKSB7XG4gICAgY29uc3QgZmlsZVBhdGggPSBwcm9jZXNzLmVudlsnR0lUSFVCX1BBVEgnXSB8fCAnJztcbiAgICBpZiAoZmlsZVBhdGgpIHtcbiAgICAgICAgZmlsZV9jb21tYW5kXzEuaXNzdWVGaWxlQ29tbWFuZCgnUEFUSCcsIGlucHV0UGF0aCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb21tYW5kXzEuaXNzdWVDb21tYW5kKCdhZGQtcGF0aCcsIHt9LCBpbnB1dFBhdGgpO1xuICAgIH1cbiAgICBwcm9jZXNzLmVudlsnUEFUSCddID0gYCR7aW5wdXRQYXRofSR7cGF0aC5kZWxpbWl0ZXJ9JHtwcm9jZXNzLmVudlsnUEFUSCddfWA7XG59XG5leHBvcnRzLmFkZFBhdGggPSBhZGRQYXRoO1xuLyoqXG4gKiBHZXRzIHRoZSB2YWx1ZSBvZiBhbiBpbnB1dC5cbiAqIFVubGVzcyB0cmltV2hpdGVzcGFjZSBpcyBzZXQgdG8gZmFsc2UgaW4gSW5wdXRPcHRpb25zLCB0aGUgdmFsdWUgaXMgYWxzbyB0cmltbWVkLlxuICogUmV0dXJucyBhbiBlbXB0eSBzdHJpbmcgaWYgdGhlIHZhbHVlIGlzIG5vdCBkZWZpbmVkLlxuICpcbiAqIEBwYXJhbSAgICAgbmFtZSAgICAgbmFtZSBvZiB0aGUgaW5wdXQgdG8gZ2V0XG4gKiBAcGFyYW0gICAgIG9wdGlvbnMgIG9wdGlvbmFsLiBTZWUgSW5wdXRPcHRpb25zLlxuICogQHJldHVybnMgICBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gZ2V0SW5wdXQobmFtZSwgb3B0aW9ucykge1xuICAgIGNvbnN0IHZhbCA9IHByb2Nlc3MuZW52W2BJTlBVVF8ke25hbWUucmVwbGFjZSgvIC9nLCAnXycpLnRvVXBwZXJDYXNlKCl9YF0gfHwgJyc7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5yZXF1aXJlZCAmJiAhdmFsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW5wdXQgcmVxdWlyZWQgYW5kIG5vdCBzdXBwbGllZDogJHtuYW1lfWApO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnRyaW1XaGl0ZXNwYWNlID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgICByZXR1cm4gdmFsLnRyaW0oKTtcbn1cbmV4cG9ydHMuZ2V0SW5wdXQgPSBnZXRJbnB1dDtcbi8qKlxuICogR2V0cyB0aGUgdmFsdWVzIG9mIGFuIG11bHRpbGluZSBpbnB1dC4gIEVhY2ggdmFsdWUgaXMgYWxzbyB0cmltbWVkLlxuICpcbiAqIEBwYXJhbSAgICAgbmFtZSAgICAgbmFtZSBvZiB0aGUgaW5wdXQgdG8gZ2V0XG4gKiBAcGFyYW0gICAgIG9wdGlvbnMgIG9wdGlvbmFsLiBTZWUgSW5wdXRPcHRpb25zLlxuICogQHJldHVybnMgICBzdHJpbmdbXVxuICpcbiAqL1xuZnVuY3Rpb24gZ2V0TXVsdGlsaW5lSW5wdXQobmFtZSwgb3B0aW9ucykge1xuICAgIGNvbnN0IGlucHV0cyA9IGdldElucHV0KG5hbWUsIG9wdGlvbnMpXG4gICAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgICAgLmZpbHRlcih4ID0+IHggIT09ICcnKTtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnRyaW1XaGl0ZXNwYWNlID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gaW5wdXRzO1xuICAgIH1cbiAgICByZXR1cm4gaW5wdXRzLm1hcChpbnB1dCA9PiBpbnB1dC50cmltKCkpO1xufVxuZXhwb3J0cy5nZXRNdWx0aWxpbmVJbnB1dCA9IGdldE11bHRpbGluZUlucHV0O1xuLyoqXG4gKiBHZXRzIHRoZSBpbnB1dCB2YWx1ZSBvZiB0aGUgYm9vbGVhbiB0eXBlIGluIHRoZSBZQU1MIDEuMiBcImNvcmUgc2NoZW1hXCIgc3BlY2lmaWNhdGlvbi5cbiAqIFN1cHBvcnQgYm9vbGVhbiBpbnB1dCBsaXN0OiBgdHJ1ZSB8IFRydWUgfCBUUlVFIHwgZmFsc2UgfCBGYWxzZSB8IEZBTFNFYCAuXG4gKiBUaGUgcmV0dXJuIHZhbHVlIGlzIGFsc28gaW4gYm9vbGVhbiB0eXBlLlxuICogcmVmOiBodHRwczovL3lhbWwub3JnL3NwZWMvMS4yL3NwZWMuaHRtbCNpZDI4MDQ5MjNcbiAqXG4gKiBAcGFyYW0gICAgIG5hbWUgICAgIG5hbWUgb2YgdGhlIGlucHV0IHRvIGdldFxuICogQHBhcmFtICAgICBvcHRpb25zICBvcHRpb25hbC4gU2VlIElucHV0T3B0aW9ucy5cbiAqIEByZXR1cm5zICAgYm9vbGVhblxuICovXG5mdW5jdGlvbiBnZXRCb29sZWFuSW5wdXQobmFtZSwgb3B0aW9ucykge1xuICAgIGNvbnN0IHRydWVWYWx1ZSA9IFsndHJ1ZScsICdUcnVlJywgJ1RSVUUnXTtcbiAgICBjb25zdCBmYWxzZVZhbHVlID0gWydmYWxzZScsICdGYWxzZScsICdGQUxTRSddO1xuICAgIGNvbnN0IHZhbCA9IGdldElucHV0KG5hbWUsIG9wdGlvbnMpO1xuICAgIGlmICh0cnVlVmFsdWUuaW5jbHVkZXModmFsKSlcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgaWYgKGZhbHNlVmFsdWUuaW5jbHVkZXModmFsKSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYElucHV0IGRvZXMgbm90IG1lZXQgWUFNTCAxLjIgXCJDb3JlIFNjaGVtYVwiIHNwZWNpZmljYXRpb246ICR7bmFtZX1cXG5gICtcbiAgICAgICAgYFN1cHBvcnQgYm9vbGVhbiBpbnB1dCBsaXN0OiBcXGB0cnVlIHwgVHJ1ZSB8IFRSVUUgfCBmYWxzZSB8IEZhbHNlIHwgRkFMU0VcXGBgKTtcbn1cbmV4cG9ydHMuZ2V0Qm9vbGVhbklucHV0ID0gZ2V0Qm9vbGVhbklucHV0O1xuLyoqXG4gKiBTZXRzIHRoZSB2YWx1ZSBvZiBhbiBvdXRwdXQuXG4gKlxuICogQHBhcmFtICAgICBuYW1lICAgICBuYW1lIG9mIHRoZSBvdXRwdXQgdG8gc2V0XG4gKiBAcGFyYW0gICAgIHZhbHVlICAgIHZhbHVlIHRvIHN0b3JlLiBOb24tc3RyaW5nIHZhbHVlcyB3aWxsIGJlIGNvbnZlcnRlZCB0byBhIHN0cmluZyB2aWEgSlNPTi5zdHJpbmdpZnlcbiAqL1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbmZ1bmN0aW9uIHNldE91dHB1dChuYW1lLCB2YWx1ZSkge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gcHJvY2Vzcy5lbnZbJ0dJVEhVQl9PVVRQVVQnXSB8fCAnJztcbiAgICBpZiAoZmlsZVBhdGgpIHtcbiAgICAgICAgcmV0dXJuIGZpbGVfY29tbWFuZF8xLmlzc3VlRmlsZUNvbW1hbmQoJ09VVFBVVCcsIGZpbGVfY29tbWFuZF8xLnByZXBhcmVLZXlWYWx1ZU1lc3NhZ2UobmFtZSwgdmFsdWUpKTtcbiAgICB9XG4gICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUob3MuRU9MKTtcbiAgICBjb21tYW5kXzEuaXNzdWVDb21tYW5kKCdzZXQtb3V0cHV0JywgeyBuYW1lIH0sIHV0aWxzXzEudG9Db21tYW5kVmFsdWUodmFsdWUpKTtcbn1cbmV4cG9ydHMuc2V0T3V0cHV0ID0gc2V0T3V0cHV0O1xuLyoqXG4gKiBFbmFibGVzIG9yIGRpc2FibGVzIHRoZSBlY2hvaW5nIG9mIGNvbW1hbmRzIGludG8gc3Rkb3V0IGZvciB0aGUgcmVzdCBvZiB0aGUgc3RlcC5cbiAqIEVjaG9pbmcgaXMgZGlzYWJsZWQgYnkgZGVmYXVsdCBpZiBBQ1RJT05TX1NURVBfREVCVUcgaXMgbm90IHNldC5cbiAqXG4gKi9cbmZ1bmN0aW9uIHNldENvbW1hbmRFY2hvKGVuYWJsZWQpIHtcbiAgICBjb21tYW5kXzEuaXNzdWUoJ2VjaG8nLCBlbmFibGVkID8gJ29uJyA6ICdvZmYnKTtcbn1cbmV4cG9ydHMuc2V0Q29tbWFuZEVjaG8gPSBzZXRDb21tYW5kRWNobztcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJlc3VsdHNcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8qKlxuICogU2V0cyB0aGUgYWN0aW9uIHN0YXR1cyB0byBmYWlsZWQuXG4gKiBXaGVuIHRoZSBhY3Rpb24gZXhpdHMgaXQgd2lsbCBiZSB3aXRoIGFuIGV4aXQgY29kZSBvZiAxXG4gKiBAcGFyYW0gbWVzc2FnZSBhZGQgZXJyb3IgaXNzdWUgbWVzc2FnZVxuICovXG5mdW5jdGlvbiBzZXRGYWlsZWQobWVzc2FnZSkge1xuICAgIHByb2Nlc3MuZXhpdENvZGUgPSBFeGl0Q29kZS5GYWlsdXJlO1xuICAgIGVycm9yKG1lc3NhZ2UpO1xufVxuZXhwb3J0cy5zZXRGYWlsZWQgPSBzZXRGYWlsZWQ7XG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBMb2dnaW5nIENvbW1hbmRzXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vKipcbiAqIEdldHMgd2hldGhlciBBY3Rpb25zIFN0ZXAgRGVidWcgaXMgb24gb3Igbm90XG4gKi9cbmZ1bmN0aW9uIGlzRGVidWcoKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52WydSVU5ORVJfREVCVUcnXSA9PT0gJzEnO1xufVxuZXhwb3J0cy5pc0RlYnVnID0gaXNEZWJ1Zztcbi8qKlxuICogV3JpdGVzIGRlYnVnIG1lc3NhZ2UgdG8gdXNlciBsb2dcbiAqIEBwYXJhbSBtZXNzYWdlIGRlYnVnIG1lc3NhZ2VcbiAqL1xuZnVuY3Rpb24gZGVidWcobWVzc2FnZSkge1xuICAgIGNvbW1hbmRfMS5pc3N1ZUNvbW1hbmQoJ2RlYnVnJywge30sIG1lc3NhZ2UpO1xufVxuZXhwb3J0cy5kZWJ1ZyA9IGRlYnVnO1xuLyoqXG4gKiBBZGRzIGFuIGVycm9yIGlzc3VlXG4gKiBAcGFyYW0gbWVzc2FnZSBlcnJvciBpc3N1ZSBtZXNzYWdlLiBFcnJvcnMgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gc3RyaW5nIHZpYSB0b1N0cmluZygpXG4gKiBAcGFyYW0gcHJvcGVydGllcyBvcHRpb25hbCBwcm9wZXJ0aWVzIHRvIGFkZCB0byB0aGUgYW5ub3RhdGlvbi5cbiAqL1xuZnVuY3Rpb24gZXJyb3IobWVzc2FnZSwgcHJvcGVydGllcyA9IHt9KSB7XG4gICAgY29tbWFuZF8xLmlzc3VlQ29tbWFuZCgnZXJyb3InLCB1dGlsc18xLnRvQ29tbWFuZFByb3BlcnRpZXMocHJvcGVydGllcyksIG1lc3NhZ2UgaW5zdGFuY2VvZiBFcnJvciA/IG1lc3NhZ2UudG9TdHJpbmcoKSA6IG1lc3NhZ2UpO1xufVxuZXhwb3J0cy5lcnJvciA9IGVycm9yO1xuLyoqXG4gKiBBZGRzIGEgd2FybmluZyBpc3N1ZVxuICogQHBhcmFtIG1lc3NhZ2Ugd2FybmluZyBpc3N1ZSBtZXNzYWdlLiBFcnJvcnMgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gc3RyaW5nIHZpYSB0b1N0cmluZygpXG4gKiBAcGFyYW0gcHJvcGVydGllcyBvcHRpb25hbCBwcm9wZXJ0aWVzIHRvIGFkZCB0byB0aGUgYW5ub3RhdGlvbi5cbiAqL1xuZnVuY3Rpb24gd2FybmluZyhtZXNzYWdlLCBwcm9wZXJ0aWVzID0ge30pIHtcbiAgICBjb21tYW5kXzEuaXNzdWVDb21tYW5kKCd3YXJuaW5nJywgdXRpbHNfMS50b0NvbW1hbmRQcm9wZXJ0aWVzKHByb3BlcnRpZXMpLCBtZXNzYWdlIGluc3RhbmNlb2YgRXJyb3IgPyBtZXNzYWdlLnRvU3RyaW5nKCkgOiBtZXNzYWdlKTtcbn1cbmV4cG9ydHMud2FybmluZyA9IHdhcm5pbmc7XG4vKipcbiAqIEFkZHMgYSBub3RpY2UgaXNzdWVcbiAqIEBwYXJhbSBtZXNzYWdlIG5vdGljZSBpc3N1ZSBtZXNzYWdlLiBFcnJvcnMgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gc3RyaW5nIHZpYSB0b1N0cmluZygpXG4gKiBAcGFyYW0gcHJvcGVydGllcyBvcHRpb25hbCBwcm9wZXJ0aWVzIHRvIGFkZCB0byB0aGUgYW5ub3RhdGlvbi5cbiAqL1xuZnVuY3Rpb24gbm90aWNlKG1lc3NhZ2UsIHByb3BlcnRpZXMgPSB7fSkge1xuICAgIGNvbW1hbmRfMS5pc3N1ZUNvbW1hbmQoJ25vdGljZScsIHV0aWxzXzEudG9Db21tYW5kUHJvcGVydGllcyhwcm9wZXJ0aWVzKSwgbWVzc2FnZSBpbnN0YW5jZW9mIEVycm9yID8gbWVzc2FnZS50b1N0cmluZygpIDogbWVzc2FnZSk7XG59XG5leHBvcnRzLm5vdGljZSA9IG5vdGljZTtcbi8qKlxuICogV3JpdGVzIGluZm8gdG8gbG9nIHdpdGggY29uc29sZS5sb2cuXG4gKiBAcGFyYW0gbWVzc2FnZSBpbmZvIG1lc3NhZ2VcbiAqL1xuZnVuY3Rpb24gaW5mbyhtZXNzYWdlKSB7XG4gICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUobWVzc2FnZSArIG9zLkVPTCk7XG59XG5leHBvcnRzLmluZm8gPSBpbmZvO1xuLyoqXG4gKiBCZWdpbiBhbiBvdXRwdXQgZ3JvdXAuXG4gKlxuICogT3V0cHV0IHVudGlsIHRoZSBuZXh0IGBncm91cEVuZGAgd2lsbCBiZSBmb2xkYWJsZSBpbiB0aGlzIGdyb3VwXG4gKlxuICogQHBhcmFtIG5hbWUgVGhlIG5hbWUgb2YgdGhlIG91dHB1dCBncm91cFxuICovXG5mdW5jdGlvbiBzdGFydEdyb3VwKG5hbWUpIHtcbiAgICBjb21tYW5kXzEuaXNzdWUoJ2dyb3VwJywgbmFtZSk7XG59XG5leHBvcnRzLnN0YXJ0R3JvdXAgPSBzdGFydEdyb3VwO1xuLyoqXG4gKiBFbmQgYW4gb3V0cHV0IGdyb3VwLlxuICovXG5mdW5jdGlvbiBlbmRHcm91cCgpIHtcbiAgICBjb21tYW5kXzEuaXNzdWUoJ2VuZGdyb3VwJyk7XG59XG5leHBvcnRzLmVuZEdyb3VwID0gZW5kR3JvdXA7XG4vKipcbiAqIFdyYXAgYW4gYXN5bmNocm9ub3VzIGZ1bmN0aW9uIGNhbGwgaW4gYSBncm91cC5cbiAqXG4gKiBSZXR1cm5zIHRoZSBzYW1lIHR5cGUgYXMgdGhlIGZ1bmN0aW9uIGl0c2VsZi5cbiAqXG4gKiBAcGFyYW0gbmFtZSBUaGUgbmFtZSBvZiB0aGUgZ3JvdXBcbiAqIEBwYXJhbSBmbiBUaGUgZnVuY3Rpb24gdG8gd3JhcCBpbiB0aGUgZ3JvdXBcbiAqL1xuZnVuY3Rpb24gZ3JvdXAobmFtZSwgZm4pIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBzdGFydEdyb3VwKG5hbWUpO1xuICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgZm4oKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIGVuZEdyb3VwKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcbn1cbmV4cG9ydHMuZ3JvdXAgPSBncm91cDtcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFdyYXBwZXIgYWN0aW9uIHN0YXRlXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vKipcbiAqIFNhdmVzIHN0YXRlIGZvciBjdXJyZW50IGFjdGlvbiwgdGhlIHN0YXRlIGNhbiBvbmx5IGJlIHJldHJpZXZlZCBieSB0aGlzIGFjdGlvbidzIHBvc3Qgam9iIGV4ZWN1dGlvbi5cbiAqXG4gKiBAcGFyYW0gICAgIG5hbWUgICAgIG5hbWUgb2YgdGhlIHN0YXRlIHRvIHN0b3JlXG4gKiBAcGFyYW0gICAgIHZhbHVlICAgIHZhbHVlIHRvIHN0b3JlLiBOb24tc3RyaW5nIHZhbHVlcyB3aWxsIGJlIGNvbnZlcnRlZCB0byBhIHN0cmluZyB2aWEgSlNPTi5zdHJpbmdpZnlcbiAqL1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbmZ1bmN0aW9uIHNhdmVTdGF0ZShuYW1lLCB2YWx1ZSkge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gcHJvY2Vzcy5lbnZbJ0dJVEhVQl9TVEFURSddIHx8ICcnO1xuICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgICByZXR1cm4gZmlsZV9jb21tYW5kXzEuaXNzdWVGaWxlQ29tbWFuZCgnU1RBVEUnLCBmaWxlX2NvbW1hbmRfMS5wcmVwYXJlS2V5VmFsdWVNZXNzYWdlKG5hbWUsIHZhbHVlKSk7XG4gICAgfVxuICAgIGNvbW1hbmRfMS5pc3N1ZUNvbW1hbmQoJ3NhdmUtc3RhdGUnLCB7IG5hbWUgfSwgdXRpbHNfMS50b0NvbW1hbmRWYWx1ZSh2YWx1ZSkpO1xufVxuZXhwb3J0cy5zYXZlU3RhdGUgPSBzYXZlU3RhdGU7XG4vKipcbiAqIEdldHMgdGhlIHZhbHVlIG9mIGFuIHN0YXRlIHNldCBieSB0aGlzIGFjdGlvbidzIG1haW4gZXhlY3V0aW9uLlxuICpcbiAqIEBwYXJhbSAgICAgbmFtZSAgICAgbmFtZSBvZiB0aGUgc3RhdGUgdG8gZ2V0XG4gKiBAcmV0dXJucyAgIHN0cmluZ1xuICovXG5mdW5jdGlvbiBnZXRTdGF0ZShuYW1lKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52W2BTVEFURV8ke25hbWV9YF0gfHwgJyc7XG59XG5leHBvcnRzLmdldFN0YXRlID0gZ2V0U3RhdGU7XG5mdW5jdGlvbiBnZXRJRFRva2VuKGF1ZCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIHJldHVybiB5aWVsZCBvaWRjX3V0aWxzXzEuT2lkY0NsaWVudC5nZXRJRFRva2VuKGF1ZCk7XG4gICAgfSk7XG59XG5leHBvcnRzLmdldElEVG9rZW4gPSBnZXRJRFRva2VuO1xuLyoqXG4gKiBTdW1tYXJ5IGV4cG9ydHNcbiAqL1xudmFyIHN1bW1hcnlfMSA9IHJlcXVpcmUoXCIuL3N1bW1hcnlcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJzdW1tYXJ5XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBzdW1tYXJ5XzEuc3VtbWFyeTsgfSB9KTtcbi8qKlxuICogQGRlcHJlY2F0ZWQgdXNlIGNvcmUuc3VtbWFyeVxuICovXG52YXIgc3VtbWFyeV8yID0gcmVxdWlyZShcIi4vc3VtbWFyeVwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIm1hcmtkb3duU3VtbWFyeVwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gc3VtbWFyeV8yLm1hcmtkb3duU3VtbWFyeTsgfSB9KTtcbi8qKlxuICogUGF0aCBleHBvcnRzXG4gKi9cbnZhciBwYXRoX3V0aWxzXzEgPSByZXF1aXJlKFwiLi9wYXRoLXV0aWxzXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwidG9Qb3NpeFBhdGhcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHBhdGhfdXRpbHNfMS50b1Bvc2l4UGF0aDsgfSB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInRvV2luMzJQYXRoXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBwYXRoX3V0aWxzXzEudG9XaW4zMlBhdGg7IH0gfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJ0b1BsYXRmb3JtUGF0aFwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gcGF0aF91dGlsc18xLnRvUGxhdGZvcm1QYXRoOyB9IH0pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29yZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbi8vIEZvciBpbnRlcm5hbCB1c2UsIHN1YmplY3QgdG8gY2hhbmdlLlxudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH0pO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKGsgIT09IFwiZGVmYXVsdFwiICYmIE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMucHJlcGFyZUtleVZhbHVlTWVzc2FnZSA9IGV4cG9ydHMuaXNzdWVGaWxlQ29tbWFuZCA9IHZvaWQgMDtcbi8vIFdlIHVzZSBhbnkgYXMgYSB2YWxpZCBpbnB1dCB0eXBlXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55ICovXG5jb25zdCBmcyA9IF9faW1wb3J0U3RhcihyZXF1aXJlKFwiZnNcIikpO1xuY29uc3Qgb3MgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcIm9zXCIpKTtcbmNvbnN0IHV1aWRfMSA9IHJlcXVpcmUoXCJ1dWlkXCIpO1xuY29uc3QgdXRpbHNfMSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xuZnVuY3Rpb24gaXNzdWVGaWxlQ29tbWFuZChjb21tYW5kLCBtZXNzYWdlKSB7XG4gICAgY29uc3QgZmlsZVBhdGggPSBwcm9jZXNzLmVudltgR0lUSFVCXyR7Y29tbWFuZH1gXTtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGZpbmQgZW52aXJvbm1lbnQgdmFyaWFibGUgZm9yIGZpbGUgY29tbWFuZCAke2NvbW1hbmR9YCk7XG4gICAgfVxuICAgIGlmICghZnMuZXhpc3RzU3luYyhmaWxlUGF0aCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNaXNzaW5nIGZpbGUgYXQgcGF0aDogJHtmaWxlUGF0aH1gKTtcbiAgICB9XG4gICAgZnMuYXBwZW5kRmlsZVN5bmMoZmlsZVBhdGgsIGAke3V0aWxzXzEudG9Db21tYW5kVmFsdWUobWVzc2FnZSl9JHtvcy5FT0x9YCwge1xuICAgICAgICBlbmNvZGluZzogJ3V0ZjgnXG4gICAgfSk7XG59XG5leHBvcnRzLmlzc3VlRmlsZUNvbW1hbmQgPSBpc3N1ZUZpbGVDb21tYW5kO1xuZnVuY3Rpb24gcHJlcGFyZUtleVZhbHVlTWVzc2FnZShrZXksIHZhbHVlKSB7XG4gICAgY29uc3QgZGVsaW1pdGVyID0gYGdoYWRlbGltaXRlcl8ke3V1aWRfMS52NCgpfWA7XG4gICAgY29uc3QgY29udmVydGVkVmFsdWUgPSB1dGlsc18xLnRvQ29tbWFuZFZhbHVlKHZhbHVlKTtcbiAgICAvLyBUaGVzZSBzaG91bGQgcmVhbGlzdGljYWxseSBuZXZlciBoYXBwZW4sIGJ1dCBqdXN0IGluIGNhc2Ugc29tZW9uZSBmaW5kcyBhXG4gICAgLy8gd2F5IHRvIGV4cGxvaXQgdXVpZCBnZW5lcmF0aW9uIGxldCdzIG5vdCBhbGxvdyBrZXlzIG9yIHZhbHVlcyB0aGF0IGNvbnRhaW5cbiAgICAvLyB0aGUgZGVsaW1pdGVyLlxuICAgIGlmIChrZXkuaW5jbHVkZXMoZGVsaW1pdGVyKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgaW5wdXQ6IG5hbWUgc2hvdWxkIG5vdCBjb250YWluIHRoZSBkZWxpbWl0ZXIgXCIke2RlbGltaXRlcn1cImApO1xuICAgIH1cbiAgICBpZiAoY29udmVydGVkVmFsdWUuaW5jbHVkZXMoZGVsaW1pdGVyKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgaW5wdXQ6IHZhbHVlIHNob3VsZCBub3QgY29udGFpbiB0aGUgZGVsaW1pdGVyIFwiJHtkZWxpbWl0ZXJ9XCJgKTtcbiAgICB9XG4gICAgcmV0dXJuIGAke2tleX08PCR7ZGVsaW1pdGVyfSR7b3MuRU9MfSR7Y29udmVydGVkVmFsdWV9JHtvcy5FT0x9JHtkZWxpbWl0ZXJ9YDtcbn1cbmV4cG9ydHMucHJlcGFyZUtleVZhbHVlTWVzc2FnZSA9IHByZXBhcmVLZXlWYWx1ZU1lc3NhZ2U7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1maWxlLWNvbW1hbmQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuT2lkY0NsaWVudCA9IHZvaWQgMDtcbmNvbnN0IGh0dHBfY2xpZW50XzEgPSByZXF1aXJlKFwiQGFjdGlvbnMvaHR0cC1jbGllbnRcIik7XG5jb25zdCBhdXRoXzEgPSByZXF1aXJlKFwiQGFjdGlvbnMvaHR0cC1jbGllbnQvbGliL2F1dGhcIik7XG5jb25zdCBjb3JlXzEgPSByZXF1aXJlKFwiLi9jb3JlXCIpO1xuY2xhc3MgT2lkY0NsaWVudCB7XG4gICAgc3RhdGljIGNyZWF0ZUh0dHBDbGllbnQoYWxsb3dSZXRyeSA9IHRydWUsIG1heFJldHJ5ID0gMTApIHtcbiAgICAgICAgY29uc3QgcmVxdWVzdE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBhbGxvd1JldHJpZXM6IGFsbG93UmV0cnksXG4gICAgICAgICAgICBtYXhSZXRyaWVzOiBtYXhSZXRyeVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gbmV3IGh0dHBfY2xpZW50XzEuSHR0cENsaWVudCgnYWN0aW9ucy9vaWRjLWNsaWVudCcsIFtuZXcgYXV0aF8xLkJlYXJlckNyZWRlbnRpYWxIYW5kbGVyKE9pZGNDbGllbnQuZ2V0UmVxdWVzdFRva2VuKCkpXSwgcmVxdWVzdE9wdGlvbnMpO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0UmVxdWVzdFRva2VuKCkge1xuICAgICAgICBjb25zdCB0b2tlbiA9IHByb2Nlc3MuZW52WydBQ1RJT05TX0lEX1RPS0VOX1JFUVVFU1RfVE9LRU4nXTtcbiAgICAgICAgaWYgKCF0b2tlbikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmFibGUgdG8gZ2V0IEFDVElPTlNfSURfVE9LRU5fUkVRVUVTVF9UT0tFTiBlbnYgdmFyaWFibGUnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgfVxuICAgIHN0YXRpYyBnZXRJRFRva2VuVXJsKCkge1xuICAgICAgICBjb25zdCBydW50aW1lVXJsID0gcHJvY2Vzcy5lbnZbJ0FDVElPTlNfSURfVE9LRU5fUkVRVUVTVF9VUkwnXTtcbiAgICAgICAgaWYgKCFydW50aW1lVXJsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBnZXQgQUNUSU9OU19JRF9UT0tFTl9SRVFVRVNUX1VSTCBlbnYgdmFyaWFibGUnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcnVudGltZVVybDtcbiAgICB9XG4gICAgc3RhdGljIGdldENhbGwoaWRfdG9rZW5fdXJsKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IGh0dHBjbGllbnQgPSBPaWRjQ2xpZW50LmNyZWF0ZUh0dHBDbGllbnQoKTtcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IHlpZWxkIGh0dHBjbGllbnRcbiAgICAgICAgICAgICAgICAuZ2V0SnNvbihpZF90b2tlbl91cmwpXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBnZXQgSUQgVG9rZW4uIFxcbiBcbiAgICAgICAgRXJyb3IgQ29kZSA6ICR7ZXJyb3Iuc3RhdHVzQ29kZX1cXG4gXG4gICAgICAgIEVycm9yIE1lc3NhZ2U6ICR7ZXJyb3IucmVzdWx0Lm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IGlkX3Rva2VuID0gKF9hID0gcmVzLnJlc3VsdCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnZhbHVlO1xuICAgICAgICAgICAgaWYgKCFpZF90b2tlbikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUmVzcG9uc2UganNvbiBib2R5IGRvIG5vdCBoYXZlIElEIFRva2VuIGZpZWxkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaWRfdG9rZW47XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0SURUb2tlbihhdWRpZW5jZSkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBOZXcgSUQgVG9rZW4gaXMgcmVxdWVzdGVkIGZyb20gYWN0aW9uIHNlcnZpY2VcbiAgICAgICAgICAgICAgICBsZXQgaWRfdG9rZW5fdXJsID0gT2lkY0NsaWVudC5nZXRJRFRva2VuVXJsKCk7XG4gICAgICAgICAgICAgICAgaWYgKGF1ZGllbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuY29kZWRBdWRpZW5jZSA9IGVuY29kZVVSSUNvbXBvbmVudChhdWRpZW5jZSk7XG4gICAgICAgICAgICAgICAgICAgIGlkX3Rva2VuX3VybCA9IGAke2lkX3Rva2VuX3VybH0mYXVkaWVuY2U9JHtlbmNvZGVkQXVkaWVuY2V9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29yZV8xLmRlYnVnKGBJRCB0b2tlbiB1cmwgaXMgJHtpZF90b2tlbl91cmx9YCk7XG4gICAgICAgICAgICAgICAgY29uc3QgaWRfdG9rZW4gPSB5aWVsZCBPaWRjQ2xpZW50LmdldENhbGwoaWRfdG9rZW5fdXJsKTtcbiAgICAgICAgICAgICAgICBjb3JlXzEuc2V0U2VjcmV0KGlkX3Rva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWRfdG9rZW47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIG1lc3NhZ2U6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5PaWRjQ2xpZW50ID0gT2lkY0NsaWVudDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW9pZGMtdXRpbHMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19zZXRNb2R1bGVEZWZhdWx0KSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xufSkgOiBmdW5jdGlvbihvLCB2KSB7XG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xufSk7XG52YXIgX19pbXBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydFN0YXIpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy50b1BsYXRmb3JtUGF0aCA9IGV4cG9ydHMudG9XaW4zMlBhdGggPSBleHBvcnRzLnRvUG9zaXhQYXRoID0gdm9pZCAwO1xuY29uc3QgcGF0aCA9IF9faW1wb3J0U3RhcihyZXF1aXJlKFwicGF0aFwiKSk7XG4vKipcbiAqIHRvUG9zaXhQYXRoIGNvbnZlcnRzIHRoZSBnaXZlbiBwYXRoIHRvIHRoZSBwb3NpeCBmb3JtLiBPbiBXaW5kb3dzLCBcXFxcIHdpbGwgYmVcbiAqIHJlcGxhY2VkIHdpdGggLy5cbiAqXG4gKiBAcGFyYW0gcHRoLiBQYXRoIHRvIHRyYW5zZm9ybS5cbiAqIEByZXR1cm4gc3RyaW5nIFBvc2l4IHBhdGguXG4gKi9cbmZ1bmN0aW9uIHRvUG9zaXhQYXRoKHB0aCkge1xuICAgIHJldHVybiBwdGgucmVwbGFjZSgvW1xcXFxdL2csICcvJyk7XG59XG5leHBvcnRzLnRvUG9zaXhQYXRoID0gdG9Qb3NpeFBhdGg7XG4vKipcbiAqIHRvV2luMzJQYXRoIGNvbnZlcnRzIHRoZSBnaXZlbiBwYXRoIHRvIHRoZSB3aW4zMiBmb3JtLiBPbiBMaW51eCwgLyB3aWxsIGJlXG4gKiByZXBsYWNlZCB3aXRoIFxcXFwuXG4gKlxuICogQHBhcmFtIHB0aC4gUGF0aCB0byB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJuIHN0cmluZyBXaW4zMiBwYXRoLlxuICovXG5mdW5jdGlvbiB0b1dpbjMyUGF0aChwdGgpIHtcbiAgICByZXR1cm4gcHRoLnJlcGxhY2UoL1svXS9nLCAnXFxcXCcpO1xufVxuZXhwb3J0cy50b1dpbjMyUGF0aCA9IHRvV2luMzJQYXRoO1xuLyoqXG4gKiB0b1BsYXRmb3JtUGF0aCBjb252ZXJ0cyB0aGUgZ2l2ZW4gcGF0aCB0byBhIHBsYXRmb3JtLXNwZWNpZmljIHBhdGguIEl0IGRvZXNcbiAqIHRoaXMgYnkgcmVwbGFjaW5nIGluc3RhbmNlcyBvZiAvIGFuZCBcXCB3aXRoIHRoZSBwbGF0Zm9ybS1zcGVjaWZpYyBwYXRoXG4gKiBzZXBhcmF0b3IuXG4gKlxuICogQHBhcmFtIHB0aCBUaGUgcGF0aCB0byBwbGF0Zm9ybWl6ZS5cbiAqIEByZXR1cm4gc3RyaW5nIFRoZSBwbGF0Zm9ybS1zcGVjaWZpYyBwYXRoLlxuICovXG5mdW5jdGlvbiB0b1BsYXRmb3JtUGF0aChwdGgpIHtcbiAgICByZXR1cm4gcHRoLnJlcGxhY2UoL1svXFxcXF0vZywgcGF0aC5zZXApO1xufVxuZXhwb3J0cy50b1BsYXRmb3JtUGF0aCA9IHRvUGxhdGZvcm1QYXRoO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGF0aC11dGlscy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5zdW1tYXJ5ID0gZXhwb3J0cy5tYXJrZG93blN1bW1hcnkgPSBleHBvcnRzLlNVTU1BUllfRE9DU19VUkwgPSBleHBvcnRzLlNVTU1BUllfRU5WX1ZBUiA9IHZvaWQgMDtcbmNvbnN0IG9zXzEgPSByZXF1aXJlKFwib3NcIik7XG5jb25zdCBmc18xID0gcmVxdWlyZShcImZzXCIpO1xuY29uc3QgeyBhY2Nlc3MsIGFwcGVuZEZpbGUsIHdyaXRlRmlsZSB9ID0gZnNfMS5wcm9taXNlcztcbmV4cG9ydHMuU1VNTUFSWV9FTlZfVkFSID0gJ0dJVEhVQl9TVEVQX1NVTU1BUlknO1xuZXhwb3J0cy5TVU1NQVJZX0RPQ1NfVVJMID0gJ2h0dHBzOi8vZG9jcy5naXRodWIuY29tL2FjdGlvbnMvdXNpbmctd29ya2Zsb3dzL3dvcmtmbG93LWNvbW1hbmRzLWZvci1naXRodWItYWN0aW9ucyNhZGRpbmctYS1qb2Itc3VtbWFyeSc7XG5jbGFzcyBTdW1tYXJ5IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5fYnVmZmVyID0gJyc7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZpbmRzIHRoZSBzdW1tYXJ5IGZpbGUgcGF0aCBmcm9tIHRoZSBlbnZpcm9ubWVudCwgcmVqZWN0cyBpZiBlbnYgdmFyIGlzIG5vdCBmb3VuZCBvciBmaWxlIGRvZXMgbm90IGV4aXN0XG4gICAgICogQWxzbyBjaGVja3Mgci93IHBlcm1pc3Npb25zLlxuICAgICAqXG4gICAgICogQHJldHVybnMgc3RlcCBzdW1tYXJ5IGZpbGUgcGF0aFxuICAgICAqL1xuICAgIGZpbGVQYXRoKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2ZpbGVQYXRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbGVQYXRoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcGF0aEZyb21FbnYgPSBwcm9jZXNzLmVudltleHBvcnRzLlNVTU1BUllfRU5WX1ZBUl07XG4gICAgICAgICAgICBpZiAoIXBhdGhGcm9tRW52KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gZmluZCBlbnZpcm9ubWVudCB2YXJpYWJsZSBmb3IgJCR7ZXhwb3J0cy5TVU1NQVJZX0VOVl9WQVJ9LiBDaGVjayBpZiB5b3VyIHJ1bnRpbWUgZW52aXJvbm1lbnQgc3VwcG9ydHMgam9iIHN1bW1hcmllcy5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgeWllbGQgYWNjZXNzKHBhdGhGcm9tRW52LCBmc18xLmNvbnN0YW50cy5SX09LIHwgZnNfMS5jb25zdGFudHMuV19PSyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoX2EpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBhY2Nlc3Mgc3VtbWFyeSBmaWxlOiAnJHtwYXRoRnJvbUVudn0nLiBDaGVjayBpZiB0aGUgZmlsZSBoYXMgY29ycmVjdCByZWFkL3dyaXRlIHBlcm1pc3Npb25zLmApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZmlsZVBhdGggPSBwYXRoRnJvbUVudjtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9maWxlUGF0aDtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFdyYXBzIGNvbnRlbnQgaW4gYW4gSFRNTCB0YWcsIGFkZGluZyBhbnkgSFRNTCBhdHRyaWJ1dGVzXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnIEhUTUwgdGFnIHRvIHdyYXBcbiAgICAgKiBAcGFyYW0ge3N0cmluZyB8IG51bGx9IGNvbnRlbnQgY29udGVudCB3aXRoaW4gdGhlIHRhZ1xuICAgICAqIEBwYXJhbSB7W2F0dHJpYnV0ZTogc3RyaW5nXTogc3RyaW5nfSBhdHRycyBrZXktdmFsdWUgbGlzdCBvZiBIVE1MIGF0dHJpYnV0ZXMgdG8gYWRkXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBjb250ZW50IHdyYXBwZWQgaW4gSFRNTCBlbGVtZW50XG4gICAgICovXG4gICAgd3JhcCh0YWcsIGNvbnRlbnQsIGF0dHJzID0ge30pIHtcbiAgICAgICAgY29uc3QgaHRtbEF0dHJzID0gT2JqZWN0LmVudHJpZXMoYXR0cnMpXG4gICAgICAgICAgICAubWFwKChba2V5LCB2YWx1ZV0pID0+IGAgJHtrZXl9PVwiJHt2YWx1ZX1cImApXG4gICAgICAgICAgICAuam9pbignJyk7XG4gICAgICAgIGlmICghY29udGVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGA8JHt0YWd9JHtodG1sQXR0cnN9PmA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGA8JHt0YWd9JHtodG1sQXR0cnN9PiR7Y29udGVudH08LyR7dGFnfT5gO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBXcml0ZXMgdGV4dCBpbiB0aGUgYnVmZmVyIHRvIHRoZSBzdW1tYXJ5IGJ1ZmZlciBmaWxlIGFuZCBlbXB0aWVzIGJ1ZmZlci4gV2lsbCBhcHBlbmQgYnkgZGVmYXVsdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3VtbWFyeVdyaXRlT3B0aW9uc30gW29wdGlvbnNdIChvcHRpb25hbCkgb3B0aW9ucyBmb3Igd3JpdGUgb3BlcmF0aW9uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxTdW1tYXJ5Pn0gc3VtbWFyeSBpbnN0YW5jZVxuICAgICAqL1xuICAgIHdyaXRlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IG92ZXJ3cml0ZSA9ICEhKG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3B0aW9ucy5vdmVyd3JpdGUpO1xuICAgICAgICAgICAgY29uc3QgZmlsZVBhdGggPSB5aWVsZCB0aGlzLmZpbGVQYXRoKCk7XG4gICAgICAgICAgICBjb25zdCB3cml0ZUZ1bmMgPSBvdmVyd3JpdGUgPyB3cml0ZUZpbGUgOiBhcHBlbmRGaWxlO1xuICAgICAgICAgICAgeWllbGQgd3JpdGVGdW5jKGZpbGVQYXRoLCB0aGlzLl9idWZmZXIsIHsgZW5jb2Rpbmc6ICd1dGY4JyB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVtcHR5QnVmZmVyKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDbGVhcnMgdGhlIHN1bW1hcnkgYnVmZmVyIGFuZCB3aXBlcyB0aGUgc3VtbWFyeSBmaWxlXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7U3VtbWFyeX0gc3VtbWFyeSBpbnN0YW5jZVxuICAgICAqL1xuICAgIGNsZWFyKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW1wdHlCdWZmZXIoKS53cml0ZSh7IG92ZXJ3cml0ZTogdHJ1ZSB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgc3VtbWFyeSBidWZmZXIgYXMgYSBzdHJpbmdcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHN0cmluZyBvZiBzdW1tYXJ5IGJ1ZmZlclxuICAgICAqL1xuICAgIHN0cmluZ2lmeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2J1ZmZlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSWYgdGhlIHN1bW1hcnkgYnVmZmVyIGlzIGVtcHR5XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVufSB0cnVlIGlmIHRoZSBidWZmZXIgaXMgZW1wdHlcbiAgICAgKi9cbiAgICBpc0VtcHR5QnVmZmVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYnVmZmVyLmxlbmd0aCA9PT0gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVzZXRzIHRoZSBzdW1tYXJ5IGJ1ZmZlciB3aXRob3V0IHdyaXRpbmcgdG8gc3VtbWFyeSBmaWxlXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7U3VtbWFyeX0gc3VtbWFyeSBpbnN0YW5jZVxuICAgICAqL1xuICAgIGVtcHR5QnVmZmVyKCkge1xuICAgICAgICB0aGlzLl9idWZmZXIgPSAnJztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgcmF3IHRleHQgdG8gdGhlIHN1bW1hcnkgYnVmZmVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBjb250ZW50IHRvIGFkZFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2FkZEVPTD1mYWxzZV0gKG9wdGlvbmFsKSBhcHBlbmQgYW4gRU9MIHRvIHRoZSByYXcgdGV4dCAoZGVmYXVsdDogZmFsc2UpXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7U3VtbWFyeX0gc3VtbWFyeSBpbnN0YW5jZVxuICAgICAqL1xuICAgIGFkZFJhdyh0ZXh0LCBhZGRFT0wgPSBmYWxzZSkge1xuICAgICAgICB0aGlzLl9idWZmZXIgKz0gdGV4dDtcbiAgICAgICAgcmV0dXJuIGFkZEVPTCA/IHRoaXMuYWRkRU9MKCkgOiB0aGlzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBvcGVyYXRpbmcgc3lzdGVtLXNwZWNpZmljIGVuZC1vZi1saW5lIG1hcmtlciB0byB0aGUgYnVmZmVyXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7U3VtbWFyeX0gc3VtbWFyeSBpbnN0YW5jZVxuICAgICAqL1xuICAgIGFkZEVPTCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkUmF3KG9zXzEuRU9MKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBIVE1MIGNvZGVibG9jayB0byB0aGUgc3VtbWFyeSBidWZmZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2RlIGNvbnRlbnQgdG8gcmVuZGVyIHdpdGhpbiBmZW5jZWQgY29kZSBibG9ja1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYW5nIChvcHRpb25hbCkgbGFuZ3VhZ2UgdG8gc3ludGF4IGhpZ2hsaWdodCBjb2RlXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7U3VtbWFyeX0gc3VtbWFyeSBpbnN0YW5jZVxuICAgICAqL1xuICAgIGFkZENvZGVCbG9jayhjb2RlLCBsYW5nKSB7XG4gICAgICAgIGNvbnN0IGF0dHJzID0gT2JqZWN0LmFzc2lnbih7fSwgKGxhbmcgJiYgeyBsYW5nIH0pKTtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMud3JhcCgncHJlJywgdGhpcy53cmFwKCdjb2RlJywgY29kZSksIGF0dHJzKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkUmF3KGVsZW1lbnQpLmFkZEVPTCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGFuIEhUTUwgbGlzdCB0byB0aGUgc3VtbWFyeSBidWZmZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGl0ZW1zIGxpc3Qgb2YgaXRlbXMgdG8gcmVuZGVyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3JkZXJlZD1mYWxzZV0gKG9wdGlvbmFsKSBpZiB0aGUgcmVuZGVyZWQgbGlzdCBzaG91bGQgYmUgb3JkZXJlZCBvciBub3QgKGRlZmF1bHQ6IGZhbHNlKVxuICAgICAqXG4gICAgICogQHJldHVybnMge1N1bW1hcnl9IHN1bW1hcnkgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBhZGRMaXN0KGl0ZW1zLCBvcmRlcmVkID0gZmFsc2UpIHtcbiAgICAgICAgY29uc3QgdGFnID0gb3JkZXJlZCA/ICdvbCcgOiAndWwnO1xuICAgICAgICBjb25zdCBsaXN0SXRlbXMgPSBpdGVtcy5tYXAoaXRlbSA9PiB0aGlzLndyYXAoJ2xpJywgaXRlbSkpLmpvaW4oJycpO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy53cmFwKHRhZywgbGlzdEl0ZW1zKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkUmF3KGVsZW1lbnQpLmFkZEVPTCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGFuIEhUTUwgdGFibGUgdG8gdGhlIHN1bW1hcnkgYnVmZmVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N1bW1hcnlUYWJsZUNlbGxbXX0gcm93cyB0YWJsZSByb3dzXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7U3VtbWFyeX0gc3VtbWFyeSBpbnN0YW5jZVxuICAgICAqL1xuICAgIGFkZFRhYmxlKHJvd3MpIHtcbiAgICAgICAgY29uc3QgdGFibGVCb2R5ID0gcm93c1xuICAgICAgICAgICAgLm1hcChyb3cgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2VsbHMgPSByb3dcbiAgICAgICAgICAgICAgICAubWFwKGNlbGwgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2VsbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud3JhcCgndGQnLCBjZWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgeyBoZWFkZXIsIGRhdGEsIGNvbHNwYW4sIHJvd3NwYW4gfSA9IGNlbGw7XG4gICAgICAgICAgICAgICAgY29uc3QgdGFnID0gaGVhZGVyID8gJ3RoJyA6ICd0ZCc7XG4gICAgICAgICAgICAgICAgY29uc3QgYXR0cnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIChjb2xzcGFuICYmIHsgY29sc3BhbiB9KSksIChyb3dzcGFuICYmIHsgcm93c3BhbiB9KSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud3JhcCh0YWcsIGRhdGEsIGF0dHJzKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmpvaW4oJycpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMud3JhcCgndHInLCBjZWxscyk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuam9pbignJyk7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLndyYXAoJ3RhYmxlJywgdGFibGVCb2R5KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkUmF3KGVsZW1lbnQpLmFkZEVPTCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgY29sbGFwc2FibGUgSFRNTCBkZXRhaWxzIGVsZW1lbnQgdG8gdGhlIHN1bW1hcnkgYnVmZmVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWwgdGV4dCBmb3IgdGhlIGNsb3NlZCBzdGF0ZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IGNvbGxhcHNhYmxlIGNvbnRlbnRcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtTdW1tYXJ5fSBzdW1tYXJ5IGluc3RhbmNlXG4gICAgICovXG4gICAgYWRkRGV0YWlscyhsYWJlbCwgY29udGVudCkge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy53cmFwKCdkZXRhaWxzJywgdGhpcy53cmFwKCdzdW1tYXJ5JywgbGFiZWwpICsgY29udGVudCk7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZFJhdyhlbGVtZW50KS5hZGRFT0woKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBIVE1MIGltYWdlIHRhZyB0byB0aGUgc3VtbWFyeSBidWZmZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzcmMgcGF0aCB0byB0aGUgaW1hZ2UgeW91IHRvIGVtYmVkXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGFsdCB0ZXh0IGRlc2NyaXB0aW9uIG9mIHRoZSBpbWFnZVxuICAgICAqIEBwYXJhbSB7U3VtbWFyeUltYWdlT3B0aW9uc30gb3B0aW9ucyAob3B0aW9uYWwpIGFkZGl0aW9uIGltYWdlIGF0dHJpYnV0ZXNcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtTdW1tYXJ5fSBzdW1tYXJ5IGluc3RhbmNlXG4gICAgICovXG4gICAgYWRkSW1hZ2Uoc3JjLCBhbHQsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBjb25zdCBhdHRycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgKHdpZHRoICYmIHsgd2lkdGggfSkpLCAoaGVpZ2h0ICYmIHsgaGVpZ2h0IH0pKTtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMud3JhcCgnaW1nJywgbnVsbCwgT2JqZWN0LmFzc2lnbih7IHNyYywgYWx0IH0sIGF0dHJzKSk7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZFJhdyhlbGVtZW50KS5hZGRFT0woKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBIVE1MIHNlY3Rpb24gaGVhZGluZyBlbGVtZW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBoZWFkaW5nIHRleHRcbiAgICAgKiBAcGFyYW0ge251bWJlciB8IHN0cmluZ30gW2xldmVsPTFdIChvcHRpb25hbCkgdGhlIGhlYWRpbmcgbGV2ZWwsIGRlZmF1bHQ6IDFcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtTdW1tYXJ5fSBzdW1tYXJ5IGluc3RhbmNlXG4gICAgICovXG4gICAgYWRkSGVhZGluZyh0ZXh0LCBsZXZlbCkge1xuICAgICAgICBjb25zdCB0YWcgPSBgaCR7bGV2ZWx9YDtcbiAgICAgICAgY29uc3QgYWxsb3dlZFRhZyA9IFsnaDEnLCAnaDInLCAnaDMnLCAnaDQnLCAnaDUnLCAnaDYnXS5pbmNsdWRlcyh0YWcpXG4gICAgICAgICAgICA/IHRhZ1xuICAgICAgICAgICAgOiAnaDEnO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy53cmFwKGFsbG93ZWRUYWcsIHRleHQpO1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRSYXcoZWxlbWVudCkuYWRkRU9MKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gSFRNTCB0aGVtYXRpYyBicmVhayAoPGhyPikgdG8gdGhlIHN1bW1hcnkgYnVmZmVyXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7U3VtbWFyeX0gc3VtbWFyeSBpbnN0YW5jZVxuICAgICAqL1xuICAgIGFkZFNlcGFyYXRvcigpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMud3JhcCgnaHInLCBudWxsKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkUmF3KGVsZW1lbnQpLmFkZEVPTCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGFuIEhUTUwgbGluZSBicmVhayAoPGJyPikgdG8gdGhlIHN1bW1hcnkgYnVmZmVyXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7U3VtbWFyeX0gc3VtbWFyeSBpbnN0YW5jZVxuICAgICAqL1xuICAgIGFkZEJyZWFrKCkge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy53cmFwKCdicicsIG51bGwpO1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRSYXcoZWxlbWVudCkuYWRkRU9MKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gSFRNTCBibG9ja3F1b3RlIHRvIHRoZSBzdW1tYXJ5IGJ1ZmZlclxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgcXVvdGUgdGV4dFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaXRlIChvcHRpb25hbCkgY2l0YXRpb24gdXJsXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7U3VtbWFyeX0gc3VtbWFyeSBpbnN0YW5jZVxuICAgICAqL1xuICAgIGFkZFF1b3RlKHRleHQsIGNpdGUpIHtcbiAgICAgICAgY29uc3QgYXR0cnMgPSBPYmplY3QuYXNzaWduKHt9LCAoY2l0ZSAmJiB7IGNpdGUgfSkpO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy53cmFwKCdibG9ja3F1b3RlJywgdGV4dCwgYXR0cnMpO1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRSYXcoZWxlbWVudCkuYWRkRU9MKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gSFRNTCBhbmNob3IgdGFnIHRvIHRoZSBzdW1tYXJ5IGJ1ZmZlclxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgbGluayB0ZXh0L2NvbnRlbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaHJlZiBoeXBlcmxpbmtcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtTdW1tYXJ5fSBzdW1tYXJ5IGluc3RhbmNlXG4gICAgICovXG4gICAgYWRkTGluayh0ZXh0LCBocmVmKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLndyYXAoJ2EnLCB0ZXh0LCB7IGhyZWYgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZFJhdyhlbGVtZW50KS5hZGRFT0woKTtcbiAgICB9XG59XG5jb25zdCBfc3VtbWFyeSA9IG5ldyBTdW1tYXJ5KCk7XG4vKipcbiAqIEBkZXByZWNhdGVkIHVzZSBgY29yZS5zdW1tYXJ5YFxuICovXG5leHBvcnRzLm1hcmtkb3duU3VtbWFyeSA9IF9zdW1tYXJ5O1xuZXhwb3J0cy5zdW1tYXJ5ID0gX3N1bW1hcnk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdW1tYXJ5LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuLy8gV2UgdXNlIGFueSBhcyBhIHZhbGlkIGlucHV0IHR5cGVcbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnkgKi9cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMudG9Db21tYW5kUHJvcGVydGllcyA9IGV4cG9ydHMudG9Db21tYW5kVmFsdWUgPSB2b2lkIDA7XG4vKipcbiAqIFNhbml0aXplcyBhbiBpbnB1dCBpbnRvIGEgc3RyaW5nIHNvIGl0IGNhbiBiZSBwYXNzZWQgaW50byBpc3N1ZUNvbW1hbmQgc2FmZWx5XG4gKiBAcGFyYW0gaW5wdXQgaW5wdXQgdG8gc2FuaXRpemUgaW50byBhIHN0cmluZ1xuICovXG5mdW5jdGlvbiB0b0NvbW1hbmRWYWx1ZShpbnB1dCkge1xuICAgIGlmIChpbnB1dCA9PT0gbnVsbCB8fCBpbnB1dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyB8fCBpbnB1dCBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgfVxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShpbnB1dCk7XG59XG5leHBvcnRzLnRvQ29tbWFuZFZhbHVlID0gdG9Db21tYW5kVmFsdWU7XG4vKipcbiAqXG4gKiBAcGFyYW0gYW5ub3RhdGlvblByb3BlcnRpZXNcbiAqIEByZXR1cm5zIFRoZSBjb21tYW5kIHByb3BlcnRpZXMgdG8gc2VuZCB3aXRoIHRoZSBhY3R1YWwgYW5ub3RhdGlvbiBjb21tYW5kXG4gKiBTZWUgSXNzdWVDb21tYW5kUHJvcGVydGllczogaHR0cHM6Ly9naXRodWIuY29tL2FjdGlvbnMvcnVubmVyL2Jsb2IvbWFpbi9zcmMvUnVubmVyLldvcmtlci9BY3Rpb25Db21tYW5kTWFuYWdlci5jcyNMNjQ2XG4gKi9cbmZ1bmN0aW9uIHRvQ29tbWFuZFByb3BlcnRpZXMoYW5ub3RhdGlvblByb3BlcnRpZXMpIHtcbiAgICBpZiAoIU9iamVjdC5rZXlzKGFubm90YXRpb25Qcm9wZXJ0aWVzKS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICB0aXRsZTogYW5ub3RhdGlvblByb3BlcnRpZXMudGl0bGUsXG4gICAgICAgIGZpbGU6IGFubm90YXRpb25Qcm9wZXJ0aWVzLmZpbGUsXG4gICAgICAgIGxpbmU6IGFubm90YXRpb25Qcm9wZXJ0aWVzLnN0YXJ0TGluZSxcbiAgICAgICAgZW5kTGluZTogYW5ub3RhdGlvblByb3BlcnRpZXMuZW5kTGluZSxcbiAgICAgICAgY29sOiBhbm5vdGF0aW9uUHJvcGVydGllcy5zdGFydENvbHVtbixcbiAgICAgICAgZW5kQ29sdW1uOiBhbm5vdGF0aW9uUHJvcGVydGllcy5lbmRDb2x1bW5cbiAgICB9O1xufVxuZXhwb3J0cy50b0NvbW1hbmRQcm9wZXJ0aWVzID0gdG9Db21tYW5kUHJvcGVydGllcztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXV0aWxzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlBlcnNvbmFsQWNjZXNzVG9rZW5DcmVkZW50aWFsSGFuZGxlciA9IGV4cG9ydHMuQmVhcmVyQ3JlZGVudGlhbEhhbmRsZXIgPSBleHBvcnRzLkJhc2ljQ3JlZGVudGlhbEhhbmRsZXIgPSB2b2lkIDA7XG5jbGFzcyBCYXNpY0NyZWRlbnRpYWxIYW5kbGVyIHtcbiAgICBjb25zdHJ1Y3Rvcih1c2VybmFtZSwgcGFzc3dvcmQpIHtcbiAgICAgICAgdGhpcy51c2VybmFtZSA9IHVzZXJuYW1lO1xuICAgICAgICB0aGlzLnBhc3N3b3JkID0gcGFzc3dvcmQ7XG4gICAgfVxuICAgIHByZXBhcmVSZXF1ZXN0KG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdUaGUgcmVxdWVzdCBoYXMgbm8gaGVhZGVycycpO1xuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMuaGVhZGVyc1snQXV0aG9yaXphdGlvbiddID0gYEJhc2ljICR7QnVmZmVyLmZyb20oYCR7dGhpcy51c2VybmFtZX06JHt0aGlzLnBhc3N3b3JkfWApLnRvU3RyaW5nKCdiYXNlNjQnKX1gO1xuICAgIH1cbiAgICAvLyBUaGlzIGhhbmRsZXIgY2Fubm90IGhhbmRsZSA0MDFcbiAgICBjYW5IYW5kbGVBdXRoZW50aWNhdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBoYW5kbGVBdXRoZW50aWNhdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuQmFzaWNDcmVkZW50aWFsSGFuZGxlciA9IEJhc2ljQ3JlZGVudGlhbEhhbmRsZXI7XG5jbGFzcyBCZWFyZXJDcmVkZW50aWFsSGFuZGxlciB7XG4gICAgY29uc3RydWN0b3IodG9rZW4pIHtcbiAgICAgICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICAgIH1cbiAgICAvLyBjdXJyZW50bHkgaW1wbGVtZW50cyBwcmUtYXV0aG9yaXphdGlvblxuICAgIC8vIFRPRE86IHN1cHBvcnQgcHJlQXV0aCA9IGZhbHNlIHdoZXJlIGl0IGhvb2tzIG9uIDQwMVxuICAgIHByZXBhcmVSZXF1ZXN0KG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdUaGUgcmVxdWVzdCBoYXMgbm8gaGVhZGVycycpO1xuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMuaGVhZGVyc1snQXV0aG9yaXphdGlvbiddID0gYEJlYXJlciAke3RoaXMudG9rZW59YDtcbiAgICB9XG4gICAgLy8gVGhpcyBoYW5kbGVyIGNhbm5vdCBoYW5kbGUgNDAxXG4gICAgY2FuSGFuZGxlQXV0aGVudGljYXRpb24oKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaGFuZGxlQXV0aGVudGljYXRpb24oKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLkJlYXJlckNyZWRlbnRpYWxIYW5kbGVyID0gQmVhcmVyQ3JlZGVudGlhbEhhbmRsZXI7XG5jbGFzcyBQZXJzb25hbEFjY2Vzc1Rva2VuQ3JlZGVudGlhbEhhbmRsZXIge1xuICAgIGNvbnN0cnVjdG9yKHRva2VuKSB7XG4gICAgICAgIHRoaXMudG9rZW4gPSB0b2tlbjtcbiAgICB9XG4gICAgLy8gY3VycmVudGx5IGltcGxlbWVudHMgcHJlLWF1dGhvcml6YXRpb25cbiAgICAvLyBUT0RPOiBzdXBwb3J0IHByZUF1dGggPSBmYWxzZSB3aGVyZSBpdCBob29rcyBvbiA0MDFcbiAgICBwcmVwYXJlUmVxdWVzdChvcHRpb25zKSB7XG4gICAgICAgIGlmICghb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcignVGhlIHJlcXVlc3QgaGFzIG5vIGhlYWRlcnMnKTtcbiAgICAgICAgfVxuICAgICAgICBvcHRpb25zLmhlYWRlcnNbJ0F1dGhvcml6YXRpb24nXSA9IGBCYXNpYyAke0J1ZmZlci5mcm9tKGBQQVQ6JHt0aGlzLnRva2VufWApLnRvU3RyaW5nKCdiYXNlNjQnKX1gO1xuICAgIH1cbiAgICAvLyBUaGlzIGhhbmRsZXIgY2Fubm90IGhhbmRsZSA0MDFcbiAgICBjYW5IYW5kbGVBdXRoZW50aWNhdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBoYW5kbGVBdXRoZW50aWNhdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuUGVyc29uYWxBY2Nlc3NUb2tlbkNyZWRlbnRpYWxIYW5kbGVyID0gUGVyc29uYWxBY2Nlc3NUb2tlbkNyZWRlbnRpYWxIYW5kbGVyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXV0aC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnkgKi9cbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX3NldE1vZHVsZURlZmF1bHQpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XG59KTtcbnZhciBfX2ltcG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0U3RhcikgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChrICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuSHR0cENsaWVudCA9IGV4cG9ydHMuaXNIdHRwcyA9IGV4cG9ydHMuSHR0cENsaWVudFJlc3BvbnNlID0gZXhwb3J0cy5IdHRwQ2xpZW50RXJyb3IgPSBleHBvcnRzLmdldFByb3h5VXJsID0gZXhwb3J0cy5NZWRpYVR5cGVzID0gZXhwb3J0cy5IZWFkZXJzID0gZXhwb3J0cy5IdHRwQ29kZXMgPSB2b2lkIDA7XG5jb25zdCBodHRwID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJodHRwXCIpKTtcbmNvbnN0IGh0dHBzID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJodHRwc1wiKSk7XG5jb25zdCBwbSA9IF9faW1wb3J0U3RhcihyZXF1aXJlKFwiLi9wcm94eVwiKSk7XG5jb25zdCB0dW5uZWwgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcInR1bm5lbFwiKSk7XG52YXIgSHR0cENvZGVzO1xuKGZ1bmN0aW9uIChIdHRwQ29kZXMpIHtcbiAgICBIdHRwQ29kZXNbSHR0cENvZGVzW1wiT0tcIl0gPSAyMDBdID0gXCJPS1wiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJNdWx0aXBsZUNob2ljZXNcIl0gPSAzMDBdID0gXCJNdWx0aXBsZUNob2ljZXNcIjtcbiAgICBIdHRwQ29kZXNbSHR0cENvZGVzW1wiTW92ZWRQZXJtYW5lbnRseVwiXSA9IDMwMV0gPSBcIk1vdmVkUGVybWFuZW50bHlcIjtcbiAgICBIdHRwQ29kZXNbSHR0cENvZGVzW1wiUmVzb3VyY2VNb3ZlZFwiXSA9IDMwMl0gPSBcIlJlc291cmNlTW92ZWRcIjtcbiAgICBIdHRwQ29kZXNbSHR0cENvZGVzW1wiU2VlT3RoZXJcIl0gPSAzMDNdID0gXCJTZWVPdGhlclwiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJOb3RNb2RpZmllZFwiXSA9IDMwNF0gPSBcIk5vdE1vZGlmaWVkXCI7XG4gICAgSHR0cENvZGVzW0h0dHBDb2Rlc1tcIlVzZVByb3h5XCJdID0gMzA1XSA9IFwiVXNlUHJveHlcIjtcbiAgICBIdHRwQ29kZXNbSHR0cENvZGVzW1wiU3dpdGNoUHJveHlcIl0gPSAzMDZdID0gXCJTd2l0Y2hQcm94eVwiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJUZW1wb3JhcnlSZWRpcmVjdFwiXSA9IDMwN10gPSBcIlRlbXBvcmFyeVJlZGlyZWN0XCI7XG4gICAgSHR0cENvZGVzW0h0dHBDb2Rlc1tcIlBlcm1hbmVudFJlZGlyZWN0XCJdID0gMzA4XSA9IFwiUGVybWFuZW50UmVkaXJlY3RcIjtcbiAgICBIdHRwQ29kZXNbSHR0cENvZGVzW1wiQmFkUmVxdWVzdFwiXSA9IDQwMF0gPSBcIkJhZFJlcXVlc3RcIjtcbiAgICBIdHRwQ29kZXNbSHR0cENvZGVzW1wiVW5hdXRob3JpemVkXCJdID0gNDAxXSA9IFwiVW5hdXRob3JpemVkXCI7XG4gICAgSHR0cENvZGVzW0h0dHBDb2Rlc1tcIlBheW1lbnRSZXF1aXJlZFwiXSA9IDQwMl0gPSBcIlBheW1lbnRSZXF1aXJlZFwiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJGb3JiaWRkZW5cIl0gPSA0MDNdID0gXCJGb3JiaWRkZW5cIjtcbiAgICBIdHRwQ29kZXNbSHR0cENvZGVzW1wiTm90Rm91bmRcIl0gPSA0MDRdID0gXCJOb3RGb3VuZFwiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJNZXRob2ROb3RBbGxvd2VkXCJdID0gNDA1XSA9IFwiTWV0aG9kTm90QWxsb3dlZFwiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJOb3RBY2NlcHRhYmxlXCJdID0gNDA2XSA9IFwiTm90QWNjZXB0YWJsZVwiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJQcm94eUF1dGhlbnRpY2F0aW9uUmVxdWlyZWRcIl0gPSA0MDddID0gXCJQcm94eUF1dGhlbnRpY2F0aW9uUmVxdWlyZWRcIjtcbiAgICBIdHRwQ29kZXNbSHR0cENvZGVzW1wiUmVxdWVzdFRpbWVvdXRcIl0gPSA0MDhdID0gXCJSZXF1ZXN0VGltZW91dFwiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJDb25mbGljdFwiXSA9IDQwOV0gPSBcIkNvbmZsaWN0XCI7XG4gICAgSHR0cENvZGVzW0h0dHBDb2Rlc1tcIkdvbmVcIl0gPSA0MTBdID0gXCJHb25lXCI7XG4gICAgSHR0cENvZGVzW0h0dHBDb2Rlc1tcIlRvb01hbnlSZXF1ZXN0c1wiXSA9IDQyOV0gPSBcIlRvb01hbnlSZXF1ZXN0c1wiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJJbnRlcm5hbFNlcnZlckVycm9yXCJdID0gNTAwXSA9IFwiSW50ZXJuYWxTZXJ2ZXJFcnJvclwiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJOb3RJbXBsZW1lbnRlZFwiXSA9IDUwMV0gPSBcIk5vdEltcGxlbWVudGVkXCI7XG4gICAgSHR0cENvZGVzW0h0dHBDb2Rlc1tcIkJhZEdhdGV3YXlcIl0gPSA1MDJdID0gXCJCYWRHYXRld2F5XCI7XG4gICAgSHR0cENvZGVzW0h0dHBDb2Rlc1tcIlNlcnZpY2VVbmF2YWlsYWJsZVwiXSA9IDUwM10gPSBcIlNlcnZpY2VVbmF2YWlsYWJsZVwiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJHYXRld2F5VGltZW91dFwiXSA9IDUwNF0gPSBcIkdhdGV3YXlUaW1lb3V0XCI7XG59KShIdHRwQ29kZXMgPSBleHBvcnRzLkh0dHBDb2RlcyB8fCAoZXhwb3J0cy5IdHRwQ29kZXMgPSB7fSkpO1xudmFyIEhlYWRlcnM7XG4oZnVuY3Rpb24gKEhlYWRlcnMpIHtcbiAgICBIZWFkZXJzW1wiQWNjZXB0XCJdID0gXCJhY2NlcHRcIjtcbiAgICBIZWFkZXJzW1wiQ29udGVudFR5cGVcIl0gPSBcImNvbnRlbnQtdHlwZVwiO1xufSkoSGVhZGVycyA9IGV4cG9ydHMuSGVhZGVycyB8fCAoZXhwb3J0cy5IZWFkZXJzID0ge30pKTtcbnZhciBNZWRpYVR5cGVzO1xuKGZ1bmN0aW9uIChNZWRpYVR5cGVzKSB7XG4gICAgTWVkaWFUeXBlc1tcIkFwcGxpY2F0aW9uSnNvblwiXSA9IFwiYXBwbGljYXRpb24vanNvblwiO1xufSkoTWVkaWFUeXBlcyA9IGV4cG9ydHMuTWVkaWFUeXBlcyB8fCAoZXhwb3J0cy5NZWRpYVR5cGVzID0ge30pKTtcbi8qKlxuICogUmV0dXJucyB0aGUgcHJveHkgVVJMLCBkZXBlbmRpbmcgdXBvbiB0aGUgc3VwcGxpZWQgdXJsIGFuZCBwcm94eSBlbnZpcm9ubWVudCB2YXJpYWJsZXMuXG4gKiBAcGFyYW0gc2VydmVyVXJsICBUaGUgc2VydmVyIFVSTCB3aGVyZSB0aGUgcmVxdWVzdCB3aWxsIGJlIHNlbnQuIEZvciBleGFtcGxlLCBodHRwczovL2FwaS5naXRodWIuY29tXG4gKi9cbmZ1bmN0aW9uIGdldFByb3h5VXJsKHNlcnZlclVybCkge1xuICAgIGNvbnN0IHByb3h5VXJsID0gcG0uZ2V0UHJveHlVcmwobmV3IFVSTChzZXJ2ZXJVcmwpKTtcbiAgICByZXR1cm4gcHJveHlVcmwgPyBwcm94eVVybC5ocmVmIDogJyc7XG59XG5leHBvcnRzLmdldFByb3h5VXJsID0gZ2V0UHJveHlVcmw7XG5jb25zdCBIdHRwUmVkaXJlY3RDb2RlcyA9IFtcbiAgICBIdHRwQ29kZXMuTW92ZWRQZXJtYW5lbnRseSxcbiAgICBIdHRwQ29kZXMuUmVzb3VyY2VNb3ZlZCxcbiAgICBIdHRwQ29kZXMuU2VlT3RoZXIsXG4gICAgSHR0cENvZGVzLlRlbXBvcmFyeVJlZGlyZWN0LFxuICAgIEh0dHBDb2Rlcy5QZXJtYW5lbnRSZWRpcmVjdFxuXTtcbmNvbnN0IEh0dHBSZXNwb25zZVJldHJ5Q29kZXMgPSBbXG4gICAgSHR0cENvZGVzLkJhZEdhdGV3YXksXG4gICAgSHR0cENvZGVzLlNlcnZpY2VVbmF2YWlsYWJsZSxcbiAgICBIdHRwQ29kZXMuR2F0ZXdheVRpbWVvdXRcbl07XG5jb25zdCBSZXRyeWFibGVIdHRwVmVyYnMgPSBbJ09QVElPTlMnLCAnR0VUJywgJ0RFTEVURScsICdIRUFEJ107XG5jb25zdCBFeHBvbmVudGlhbEJhY2tvZmZDZWlsaW5nID0gMTA7XG5jb25zdCBFeHBvbmVudGlhbEJhY2tvZmZUaW1lU2xpY2UgPSA1O1xuY2xhc3MgSHR0cENsaWVudEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIHN0YXR1c0NvZGUpIHtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdIdHRwQ2xpZW50RXJyb3InO1xuICAgICAgICB0aGlzLnN0YXR1c0NvZGUgPSBzdGF0dXNDb2RlO1xuICAgICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgSHR0cENsaWVudEVycm9yLnByb3RvdHlwZSk7XG4gICAgfVxufVxuZXhwb3J0cy5IdHRwQ2xpZW50RXJyb3IgPSBIdHRwQ2xpZW50RXJyb3I7XG5jbGFzcyBIdHRwQ2xpZW50UmVzcG9uc2Uge1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UpIHtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB9XG4gICAgcmVhZEJvZHkoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBsZXQgb3V0cHV0ID0gQnVmZmVyLmFsbG9jKDApO1xuICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZS5vbignZGF0YScsIChjaHVuaykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQgPSBCdWZmZXIuY29uY2F0KFtvdXRwdXQsIGNodW5rXSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUob3V0cHV0LnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLkh0dHBDbGllbnRSZXNwb25zZSA9IEh0dHBDbGllbnRSZXNwb25zZTtcbmZ1bmN0aW9uIGlzSHR0cHMocmVxdWVzdFVybCkge1xuICAgIGNvbnN0IHBhcnNlZFVybCA9IG5ldyBVUkwocmVxdWVzdFVybCk7XG4gICAgcmV0dXJuIHBhcnNlZFVybC5wcm90b2NvbCA9PT0gJ2h0dHBzOic7XG59XG5leHBvcnRzLmlzSHR0cHMgPSBpc0h0dHBzO1xuY2xhc3MgSHR0cENsaWVudCB7XG4gICAgY29uc3RydWN0b3IodXNlckFnZW50LCBoYW5kbGVycywgcmVxdWVzdE9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5faWdub3JlU3NsRXJyb3IgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fYWxsb3dSZWRpcmVjdHMgPSB0cnVlO1xuICAgICAgICB0aGlzLl9hbGxvd1JlZGlyZWN0RG93bmdyYWRlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX21heFJlZGlyZWN0cyA9IDUwO1xuICAgICAgICB0aGlzLl9hbGxvd1JldHJpZXMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fbWF4UmV0cmllcyA9IDE7XG4gICAgICAgIHRoaXMuX2tlZXBBbGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9kaXNwb3NlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnVzZXJBZ2VudCA9IHVzZXJBZ2VudDtcbiAgICAgICAgdGhpcy5oYW5kbGVycyA9IGhhbmRsZXJzIHx8IFtdO1xuICAgICAgICB0aGlzLnJlcXVlc3RPcHRpb25zID0gcmVxdWVzdE9wdGlvbnM7XG4gICAgICAgIGlmIChyZXF1ZXN0T3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKHJlcXVlc3RPcHRpb25zLmlnbm9yZVNzbEVycm9yICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pZ25vcmVTc2xFcnJvciA9IHJlcXVlc3RPcHRpb25zLmlnbm9yZVNzbEVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fc29ja2V0VGltZW91dCA9IHJlcXVlc3RPcHRpb25zLnNvY2tldFRpbWVvdXQ7XG4gICAgICAgICAgICBpZiAocmVxdWVzdE9wdGlvbnMuYWxsb3dSZWRpcmVjdHMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FsbG93UmVkaXJlY3RzID0gcmVxdWVzdE9wdGlvbnMuYWxsb3dSZWRpcmVjdHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVxdWVzdE9wdGlvbnMuYWxsb3dSZWRpcmVjdERvd25ncmFkZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWxsb3dSZWRpcmVjdERvd25ncmFkZSA9IHJlcXVlc3RPcHRpb25zLmFsbG93UmVkaXJlY3REb3duZ3JhZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVxdWVzdE9wdGlvbnMubWF4UmVkaXJlY3RzICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXhSZWRpcmVjdHMgPSBNYXRoLm1heChyZXF1ZXN0T3B0aW9ucy5tYXhSZWRpcmVjdHMsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlcXVlc3RPcHRpb25zLmtlZXBBbGl2ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fa2VlcEFsaXZlID0gcmVxdWVzdE9wdGlvbnMua2VlcEFsaXZlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlcXVlc3RPcHRpb25zLmFsbG93UmV0cmllcyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWxsb3dSZXRyaWVzID0gcmVxdWVzdE9wdGlvbnMuYWxsb3dSZXRyaWVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlcXVlc3RPcHRpb25zLm1heFJldHJpZXMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX21heFJldHJpZXMgPSByZXF1ZXN0T3B0aW9ucy5tYXhSZXRyaWVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIG9wdGlvbnMocmVxdWVzdFVybCwgYWRkaXRpb25hbEhlYWRlcnMpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3QoJ09QVElPTlMnLCByZXF1ZXN0VXJsLCBudWxsLCBhZGRpdGlvbmFsSGVhZGVycyB8fCB7fSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXQocmVxdWVzdFVybCwgYWRkaXRpb25hbEhlYWRlcnMpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3QoJ0dFVCcsIHJlcXVlc3RVcmwsIG51bGwsIGFkZGl0aW9uYWxIZWFkZXJzIHx8IHt9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGRlbChyZXF1ZXN0VXJsLCBhZGRpdGlvbmFsSGVhZGVycykge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdCgnREVMRVRFJywgcmVxdWVzdFVybCwgbnVsbCwgYWRkaXRpb25hbEhlYWRlcnMgfHwge30pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcG9zdChyZXF1ZXN0VXJsLCBkYXRhLCBhZGRpdGlvbmFsSGVhZGVycykge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdCgnUE9TVCcsIHJlcXVlc3RVcmwsIGRhdGEsIGFkZGl0aW9uYWxIZWFkZXJzIHx8IHt9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBhdGNoKHJlcXVlc3RVcmwsIGRhdGEsIGFkZGl0aW9uYWxIZWFkZXJzKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KCdQQVRDSCcsIHJlcXVlc3RVcmwsIGRhdGEsIGFkZGl0aW9uYWxIZWFkZXJzIHx8IHt9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHB1dChyZXF1ZXN0VXJsLCBkYXRhLCBhZGRpdGlvbmFsSGVhZGVycykge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdCgnUFVUJywgcmVxdWVzdFVybCwgZGF0YSwgYWRkaXRpb25hbEhlYWRlcnMgfHwge30pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaGVhZChyZXF1ZXN0VXJsLCBhZGRpdGlvbmFsSGVhZGVycykge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdCgnSEVBRCcsIHJlcXVlc3RVcmwsIG51bGwsIGFkZGl0aW9uYWxIZWFkZXJzIHx8IHt9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHNlbmRTdHJlYW0odmVyYiwgcmVxdWVzdFVybCwgc3RyZWFtLCBhZGRpdGlvbmFsSGVhZGVycykge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdCh2ZXJiLCByZXF1ZXN0VXJsLCBzdHJlYW0sIGFkZGl0aW9uYWxIZWFkZXJzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldHMgYSB0eXBlZCBvYmplY3QgZnJvbSBhbiBlbmRwb2ludFxuICAgICAqIEJlIGF3YXJlIHRoYXQgbm90IGZvdW5kIHJldHVybnMgYSBudWxsLiAgT3RoZXIgZXJyb3JzICg0eHgsIDV4eCkgcmVqZWN0IHRoZSBwcm9taXNlXG4gICAgICovXG4gICAgZ2V0SnNvbihyZXF1ZXN0VXJsLCBhZGRpdGlvbmFsSGVhZGVycyA9IHt9KSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBhZGRpdGlvbmFsSGVhZGVyc1tIZWFkZXJzLkFjY2VwdF0gPSB0aGlzLl9nZXRFeGlzdGluZ09yRGVmYXVsdEhlYWRlcihhZGRpdGlvbmFsSGVhZGVycywgSGVhZGVycy5BY2NlcHQsIE1lZGlhVHlwZXMuQXBwbGljYXRpb25Kc29uKTtcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IHlpZWxkIHRoaXMuZ2V0KHJlcXVlc3RVcmwsIGFkZGl0aW9uYWxIZWFkZXJzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wcm9jZXNzUmVzcG9uc2UocmVzLCB0aGlzLnJlcXVlc3RPcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBvc3RKc29uKHJlcXVlc3RVcmwsIG9iaiwgYWRkaXRpb25hbEhlYWRlcnMgPSB7fSkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IEpTT04uc3RyaW5naWZ5KG9iaiwgbnVsbCwgMik7XG4gICAgICAgICAgICBhZGRpdGlvbmFsSGVhZGVyc1tIZWFkZXJzLkFjY2VwdF0gPSB0aGlzLl9nZXRFeGlzdGluZ09yRGVmYXVsdEhlYWRlcihhZGRpdGlvbmFsSGVhZGVycywgSGVhZGVycy5BY2NlcHQsIE1lZGlhVHlwZXMuQXBwbGljYXRpb25Kc29uKTtcbiAgICAgICAgICAgIGFkZGl0aW9uYWxIZWFkZXJzW0hlYWRlcnMuQ29udGVudFR5cGVdID0gdGhpcy5fZ2V0RXhpc3RpbmdPckRlZmF1bHRIZWFkZXIoYWRkaXRpb25hbEhlYWRlcnMsIEhlYWRlcnMuQ29udGVudFR5cGUsIE1lZGlhVHlwZXMuQXBwbGljYXRpb25Kc29uKTtcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IHlpZWxkIHRoaXMucG9zdChyZXF1ZXN0VXJsLCBkYXRhLCBhZGRpdGlvbmFsSGVhZGVycyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcHJvY2Vzc1Jlc3BvbnNlKHJlcywgdGhpcy5yZXF1ZXN0T3B0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwdXRKc29uKHJlcXVlc3RVcmwsIG9iaiwgYWRkaXRpb25hbEhlYWRlcnMgPSB7fSkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IEpTT04uc3RyaW5naWZ5KG9iaiwgbnVsbCwgMik7XG4gICAgICAgICAgICBhZGRpdGlvbmFsSGVhZGVyc1tIZWFkZXJzLkFjY2VwdF0gPSB0aGlzLl9nZXRFeGlzdGluZ09yRGVmYXVsdEhlYWRlcihhZGRpdGlvbmFsSGVhZGVycywgSGVhZGVycy5BY2NlcHQsIE1lZGlhVHlwZXMuQXBwbGljYXRpb25Kc29uKTtcbiAgICAgICAgICAgIGFkZGl0aW9uYWxIZWFkZXJzW0hlYWRlcnMuQ29udGVudFR5cGVdID0gdGhpcy5fZ2V0RXhpc3RpbmdPckRlZmF1bHRIZWFkZXIoYWRkaXRpb25hbEhlYWRlcnMsIEhlYWRlcnMuQ29udGVudFR5cGUsIE1lZGlhVHlwZXMuQXBwbGljYXRpb25Kc29uKTtcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IHlpZWxkIHRoaXMucHV0KHJlcXVlc3RVcmwsIGRhdGEsIGFkZGl0aW9uYWxIZWFkZXJzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wcm9jZXNzUmVzcG9uc2UocmVzLCB0aGlzLnJlcXVlc3RPcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBhdGNoSnNvbihyZXF1ZXN0VXJsLCBvYmosIGFkZGl0aW9uYWxIZWFkZXJzID0ge30pIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnN0cmluZ2lmeShvYmosIG51bGwsIDIpO1xuICAgICAgICAgICAgYWRkaXRpb25hbEhlYWRlcnNbSGVhZGVycy5BY2NlcHRdID0gdGhpcy5fZ2V0RXhpc3RpbmdPckRlZmF1bHRIZWFkZXIoYWRkaXRpb25hbEhlYWRlcnMsIEhlYWRlcnMuQWNjZXB0LCBNZWRpYVR5cGVzLkFwcGxpY2F0aW9uSnNvbik7XG4gICAgICAgICAgICBhZGRpdGlvbmFsSGVhZGVyc1tIZWFkZXJzLkNvbnRlbnRUeXBlXSA9IHRoaXMuX2dldEV4aXN0aW5nT3JEZWZhdWx0SGVhZGVyKGFkZGl0aW9uYWxIZWFkZXJzLCBIZWFkZXJzLkNvbnRlbnRUeXBlLCBNZWRpYVR5cGVzLkFwcGxpY2F0aW9uSnNvbik7XG4gICAgICAgICAgICBjb25zdCByZXMgPSB5aWVsZCB0aGlzLnBhdGNoKHJlcXVlc3RVcmwsIGRhdGEsIGFkZGl0aW9uYWxIZWFkZXJzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wcm9jZXNzUmVzcG9uc2UocmVzLCB0aGlzLnJlcXVlc3RPcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1ha2VzIGEgcmF3IGh0dHAgcmVxdWVzdC5cbiAgICAgKiBBbGwgb3RoZXIgbWV0aG9kcyBzdWNoIGFzIGdldCwgcG9zdCwgcGF0Y2gsIGFuZCByZXF1ZXN0IHVsdGltYXRlbHkgY2FsbCB0aGlzLlxuICAgICAqIFByZWZlciBnZXQsIGRlbCwgcG9zdCBhbmQgcGF0Y2hcbiAgICAgKi9cbiAgICByZXF1ZXN0KHZlcmIsIHJlcXVlc3RVcmwsIGRhdGEsIGhlYWRlcnMpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9kaXNwb3NlZCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2xpZW50IGhhcyBhbHJlYWR5IGJlZW4gZGlzcG9zZWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwYXJzZWRVcmwgPSBuZXcgVVJMKHJlcXVlc3RVcmwpO1xuICAgICAgICAgICAgbGV0IGluZm8gPSB0aGlzLl9wcmVwYXJlUmVxdWVzdCh2ZXJiLCBwYXJzZWRVcmwsIGhlYWRlcnMpO1xuICAgICAgICAgICAgLy8gT25seSBwZXJmb3JtIHJldHJpZXMgb24gcmVhZHMgc2luY2Ugd3JpdGVzIG1heSBub3QgYmUgaWRlbXBvdGVudC5cbiAgICAgICAgICAgIGNvbnN0IG1heFRyaWVzID0gdGhpcy5fYWxsb3dSZXRyaWVzICYmIFJldHJ5YWJsZUh0dHBWZXJicy5pbmNsdWRlcyh2ZXJiKVxuICAgICAgICAgICAgICAgID8gdGhpcy5fbWF4UmV0cmllcyArIDFcbiAgICAgICAgICAgICAgICA6IDE7XG4gICAgICAgICAgICBsZXQgbnVtVHJpZXMgPSAwO1xuICAgICAgICAgICAgbGV0IHJlc3BvbnNlO1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0geWllbGQgdGhpcy5yZXF1ZXN0UmF3KGluZm8sIGRhdGEpO1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIGl0J3MgYW4gYXV0aGVudGljYXRpb24gY2hhbGxlbmdlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLm1lc3NhZ2UgJiZcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UubWVzc2FnZS5zdGF0dXNDb2RlID09PSBIdHRwQ29kZXMuVW5hdXRob3JpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBhdXRoZW50aWNhdGlvbkhhbmRsZXI7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaGFuZGxlciBvZiB0aGlzLmhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFuZGxlci5jYW5IYW5kbGVBdXRoZW50aWNhdGlvbihyZXNwb25zZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRoZW50aWNhdGlvbkhhbmRsZXIgPSBoYW5kbGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdXRoZW50aWNhdGlvbkhhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhdXRoZW50aWNhdGlvbkhhbmRsZXIuaGFuZGxlQXV0aGVudGljYXRpb24odGhpcywgaW5mbywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIHJlY2VpdmVkIGFuIHVuYXV0aG9yaXplZCByZXNwb25zZSBidXQgaGF2ZSBubyBoYW5kbGVycyB0byBoYW5kbGUgaXQuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBMZXQgdGhlIHJlc3BvbnNlIHJldHVybiB0byB0aGUgY2FsbGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCByZWRpcmVjdHNSZW1haW5pbmcgPSB0aGlzLl9tYXhSZWRpcmVjdHM7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHJlc3BvbnNlLm1lc3NhZ2Uuc3RhdHVzQ29kZSAmJlxuICAgICAgICAgICAgICAgICAgICBIdHRwUmVkaXJlY3RDb2Rlcy5pbmNsdWRlcyhyZXNwb25zZS5tZXNzYWdlLnN0YXR1c0NvZGUpICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FsbG93UmVkaXJlY3RzICYmXG4gICAgICAgICAgICAgICAgICAgIHJlZGlyZWN0c1JlbWFpbmluZyA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVkaXJlY3RVcmwgPSByZXNwb25zZS5tZXNzYWdlLmhlYWRlcnNbJ2xvY2F0aW9uJ107XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVkaXJlY3RVcmwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlJ3Mgbm8gbG9jYXRpb24gdG8gcmVkaXJlY3QgdG8sIHdlIHdvbid0XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWRSZWRpcmVjdFVybCA9IG5ldyBVUkwocmVkaXJlY3RVcmwpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VkVXJsLnByb3RvY29sID09PSAnaHR0cHM6JyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VkVXJsLnByb3RvY29sICE9PSBwYXJzZWRSZWRpcmVjdFVybC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgIXRoaXMuX2FsbG93UmVkaXJlY3REb3duZ3JhZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUmVkaXJlY3QgZnJvbSBIVFRQUyB0byBIVFRQIHByb3RvY29sLiBUaGlzIGRvd25ncmFkZSBpcyBub3QgYWxsb3dlZCBmb3Igc2VjdXJpdHkgcmVhc29ucy4gSWYgeW91IHdhbnQgdG8gYWxsb3cgdGhpcyBiZWhhdmlvciwgc2V0IHRoZSBhbGxvd1JlZGlyZWN0RG93bmdyYWRlIG9wdGlvbiB0byB0cnVlLicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIHdlIG5lZWQgdG8gZmluaXNoIHJlYWRpbmcgdGhlIHJlc3BvbnNlIGJlZm9yZSByZWFzc2lnbmluZyByZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICAvLyB3aGljaCB3aWxsIGxlYWsgdGhlIG9wZW4gc29ja2V0LlxuICAgICAgICAgICAgICAgICAgICB5aWVsZCByZXNwb25zZS5yZWFkQm9keSgpO1xuICAgICAgICAgICAgICAgICAgICAvLyBzdHJpcCBhdXRob3JpemF0aW9uIGhlYWRlciBpZiByZWRpcmVjdGVkIHRvIGEgZGlmZmVyZW50IGhvc3RuYW1lXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZWRSZWRpcmVjdFVybC5ob3N0bmFtZSAhPT0gcGFyc2VkVXJsLmhvc3RuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGhlYWRlciBpbiBoZWFkZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaGVhZGVyIG5hbWVzIGFyZSBjYXNlIGluc2Vuc2l0aXZlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhlYWRlci50b0xvd2VyQ2FzZSgpID09PSAnYXV0aG9yaXphdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGhlYWRlcnNbaGVhZGVyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gbGV0J3MgbWFrZSB0aGUgcmVxdWVzdCB3aXRoIHRoZSBuZXcgcmVkaXJlY3RVcmxcbiAgICAgICAgICAgICAgICAgICAgaW5mbyA9IHRoaXMuX3ByZXBhcmVSZXF1ZXN0KHZlcmIsIHBhcnNlZFJlZGlyZWN0VXJsLCBoZWFkZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB5aWVsZCB0aGlzLnJlcXVlc3RSYXcoaW5mbywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIHJlZGlyZWN0c1JlbWFpbmluZy0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlLm1lc3NhZ2Uuc3RhdHVzQ29kZSB8fFxuICAgICAgICAgICAgICAgICAgICAhSHR0cFJlc3BvbnNlUmV0cnlDb2Rlcy5pbmNsdWRlcyhyZXNwb25zZS5tZXNzYWdlLnN0YXR1c0NvZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIG5vdCBhIHJldHJ5IGNvZGUsIHJldHVybiBpbW1lZGlhdGVseSBpbnN0ZWFkIG9mIHJldHJ5aW5nXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbnVtVHJpZXMgKz0gMTtcbiAgICAgICAgICAgICAgICBpZiAobnVtVHJpZXMgPCBtYXhUcmllcykge1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCByZXNwb25zZS5yZWFkQm9keSgpO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLl9wZXJmb3JtRXhwb25lbnRpYWxCYWNrb2ZmKG51bVRyaWVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IHdoaWxlIChudW1UcmllcyA8IG1heFRyaWVzKTtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE5lZWRzIHRvIGJlIGNhbGxlZCBpZiBrZWVwQWxpdmUgaXMgc2V0IHRvIHRydWUgaW4gcmVxdWVzdCBvcHRpb25zLlxuICAgICAqL1xuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIGlmICh0aGlzLl9hZ2VudCkge1xuICAgICAgICAgICAgdGhpcy5fYWdlbnQuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2Rpc3Bvc2VkID0gdHJ1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmF3IHJlcXVlc3QuXG4gICAgICogQHBhcmFtIGluZm9cbiAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAqL1xuICAgIHJlcXVlc3RSYXcoaW5mbywgZGF0YSkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBjYWxsYmFja0ZvclJlc3VsdChlcnIsIHJlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghcmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBgZXJyYCBpcyBub3QgcGFzc2VkLCB0aGVuIGByZXNgIG11c3QgYmUgcGFzc2VkLlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignVW5rbm93biBlcnJvcicpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RSYXdXaXRoQ2FsbGJhY2soaW5mbywgZGF0YSwgY2FsbGJhY2tGb3JSZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSYXcgcmVxdWVzdCB3aXRoIGNhbGxiYWNrLlxuICAgICAqIEBwYXJhbSBpbmZvXG4gICAgICogQHBhcmFtIGRhdGFcbiAgICAgKiBAcGFyYW0gb25SZXN1bHRcbiAgICAgKi9cbiAgICByZXF1ZXN0UmF3V2l0aENhbGxiYWNrKGluZm8sIGRhdGEsIG9uUmVzdWx0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGlmICghaW5mby5vcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgICAgICAgICBpbmZvLm9wdGlvbnMuaGVhZGVycyA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5mby5vcHRpb25zLmhlYWRlcnNbJ0NvbnRlbnQtTGVuZ3RoJ10gPSBCdWZmZXIuYnl0ZUxlbmd0aChkYXRhLCAndXRmOCcpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjYWxsYmFja0NhbGxlZCA9IGZhbHNlO1xuICAgICAgICBmdW5jdGlvbiBoYW5kbGVSZXN1bHQoZXJyLCByZXMpIHtcbiAgICAgICAgICAgIGlmICghY2FsbGJhY2tDYWxsZWQpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFja0NhbGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgb25SZXN1bHQoZXJyLCByZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlcSA9IGluZm8uaHR0cE1vZHVsZS5yZXF1ZXN0KGluZm8ub3B0aW9ucywgKG1zZykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVzID0gbmV3IEh0dHBDbGllbnRSZXNwb25zZShtc2cpO1xuICAgICAgICAgICAgaGFuZGxlUmVzdWx0KHVuZGVmaW5lZCwgcmVzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBzb2NrZXQ7XG4gICAgICAgIHJlcS5vbignc29ja2V0Jywgc29jayA9PiB7XG4gICAgICAgICAgICBzb2NrZXQgPSBzb2NrO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gSWYgd2UgZXZlciBnZXQgZGlzY29ubmVjdGVkLCB3ZSB3YW50IHRoZSBzb2NrZXQgdG8gdGltZW91dCBldmVudHVhbGx5XG4gICAgICAgIHJlcS5zZXRUaW1lb3V0KHRoaXMuX3NvY2tldFRpbWVvdXQgfHwgMyAqIDYwMDAwLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoc29ja2V0KSB7XG4gICAgICAgICAgICAgICAgc29ja2V0LmVuZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaGFuZGxlUmVzdWx0KG5ldyBFcnJvcihgUmVxdWVzdCB0aW1lb3V0OiAke2luZm8ub3B0aW9ucy5wYXRofWApKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJlcS5vbignZXJyb3InLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAvLyBlcnIgaGFzIHN0YXR1c0NvZGUgcHJvcGVydHlcbiAgICAgICAgICAgIC8vIHJlcyBzaG91bGQgaGF2ZSBoZWFkZXJzXG4gICAgICAgICAgICBoYW5kbGVSZXN1bHQoZXJyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChkYXRhICYmIHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcmVxLndyaXRlKGRhdGEsICd1dGY4Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRhdGEgJiYgdHlwZW9mIGRhdGEgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBkYXRhLm9uKCdjbG9zZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXEuZW5kKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRhdGEucGlwZShyZXEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVxLmVuZCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldHMgYW4gaHR0cCBhZ2VudC4gVGhpcyBmdW5jdGlvbiBpcyB1c2VmdWwgd2hlbiB5b3UgbmVlZCBhbiBodHRwIGFnZW50IHRoYXQgaGFuZGxlc1xuICAgICAqIHJvdXRpbmcgdGhyb3VnaCBhIHByb3h5IHNlcnZlciAtIGRlcGVuZGluZyB1cG9uIHRoZSB1cmwgYW5kIHByb3h5IGVudmlyb25tZW50IHZhcmlhYmxlcy5cbiAgICAgKiBAcGFyYW0gc2VydmVyVXJsICBUaGUgc2VydmVyIFVSTCB3aGVyZSB0aGUgcmVxdWVzdCB3aWxsIGJlIHNlbnQuIEZvciBleGFtcGxlLCBodHRwczovL2FwaS5naXRodWIuY29tXG4gICAgICovXG4gICAgZ2V0QWdlbnQoc2VydmVyVXJsKSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFVybCA9IG5ldyBVUkwoc2VydmVyVXJsKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldEFnZW50KHBhcnNlZFVybCk7XG4gICAgfVxuICAgIF9wcmVwYXJlUmVxdWVzdChtZXRob2QsIHJlcXVlc3RVcmwsIGhlYWRlcnMpIHtcbiAgICAgICAgY29uc3QgaW5mbyA9IHt9O1xuICAgICAgICBpbmZvLnBhcnNlZFVybCA9IHJlcXVlc3RVcmw7XG4gICAgICAgIGNvbnN0IHVzaW5nU3NsID0gaW5mby5wYXJzZWRVcmwucHJvdG9jb2wgPT09ICdodHRwczonO1xuICAgICAgICBpbmZvLmh0dHBNb2R1bGUgPSB1c2luZ1NzbCA/IGh0dHBzIDogaHR0cDtcbiAgICAgICAgY29uc3QgZGVmYXVsdFBvcnQgPSB1c2luZ1NzbCA/IDQ0MyA6IDgwO1xuICAgICAgICBpbmZvLm9wdGlvbnMgPSB7fTtcbiAgICAgICAgaW5mby5vcHRpb25zLmhvc3QgPSBpbmZvLnBhcnNlZFVybC5ob3N0bmFtZTtcbiAgICAgICAgaW5mby5vcHRpb25zLnBvcnQgPSBpbmZvLnBhcnNlZFVybC5wb3J0XG4gICAgICAgICAgICA/IHBhcnNlSW50KGluZm8ucGFyc2VkVXJsLnBvcnQpXG4gICAgICAgICAgICA6IGRlZmF1bHRQb3J0O1xuICAgICAgICBpbmZvLm9wdGlvbnMucGF0aCA9XG4gICAgICAgICAgICAoaW5mby5wYXJzZWRVcmwucGF0aG5hbWUgfHwgJycpICsgKGluZm8ucGFyc2VkVXJsLnNlYXJjaCB8fCAnJyk7XG4gICAgICAgIGluZm8ub3B0aW9ucy5tZXRob2QgPSBtZXRob2Q7XG4gICAgICAgIGluZm8ub3B0aW9ucy5oZWFkZXJzID0gdGhpcy5fbWVyZ2VIZWFkZXJzKGhlYWRlcnMpO1xuICAgICAgICBpZiAodGhpcy51c2VyQWdlbnQgIT0gbnVsbCkge1xuICAgICAgICAgICAgaW5mby5vcHRpb25zLmhlYWRlcnNbJ3VzZXItYWdlbnQnXSA9IHRoaXMudXNlckFnZW50O1xuICAgICAgICB9XG4gICAgICAgIGluZm8ub3B0aW9ucy5hZ2VudCA9IHRoaXMuX2dldEFnZW50KGluZm8ucGFyc2VkVXJsKTtcbiAgICAgICAgLy8gZ2l2ZXMgaGFuZGxlcnMgYW4gb3Bwb3J0dW5pdHkgdG8gcGFydGljaXBhdGVcbiAgICAgICAgaWYgKHRoaXMuaGFuZGxlcnMpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaGFuZGxlciBvZiB0aGlzLmhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5wcmVwYXJlUmVxdWVzdChpbmZvLm9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbmZvO1xuICAgIH1cbiAgICBfbWVyZ2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICAgICAgaWYgKHRoaXMucmVxdWVzdE9wdGlvbnMgJiYgdGhpcy5yZXF1ZXN0T3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgbG93ZXJjYXNlS2V5cyh0aGlzLnJlcXVlc3RPcHRpb25zLmhlYWRlcnMpLCBsb3dlcmNhc2VLZXlzKGhlYWRlcnMgfHwge30pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbG93ZXJjYXNlS2V5cyhoZWFkZXJzIHx8IHt9KTtcbiAgICB9XG4gICAgX2dldEV4aXN0aW5nT3JEZWZhdWx0SGVhZGVyKGFkZGl0aW9uYWxIZWFkZXJzLCBoZWFkZXIsIF9kZWZhdWx0KSB7XG4gICAgICAgIGxldCBjbGllbnRIZWFkZXI7XG4gICAgICAgIGlmICh0aGlzLnJlcXVlc3RPcHRpb25zICYmIHRoaXMucmVxdWVzdE9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICAgICAgY2xpZW50SGVhZGVyID0gbG93ZXJjYXNlS2V5cyh0aGlzLnJlcXVlc3RPcHRpb25zLmhlYWRlcnMpW2hlYWRlcl07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFkZGl0aW9uYWxIZWFkZXJzW2hlYWRlcl0gfHwgY2xpZW50SGVhZGVyIHx8IF9kZWZhdWx0O1xuICAgIH1cbiAgICBfZ2V0QWdlbnQocGFyc2VkVXJsKSB7XG4gICAgICAgIGxldCBhZ2VudDtcbiAgICAgICAgY29uc3QgcHJveHlVcmwgPSBwbS5nZXRQcm94eVVybChwYXJzZWRVcmwpO1xuICAgICAgICBjb25zdCB1c2VQcm94eSA9IHByb3h5VXJsICYmIHByb3h5VXJsLmhvc3RuYW1lO1xuICAgICAgICBpZiAodGhpcy5fa2VlcEFsaXZlICYmIHVzZVByb3h5KSB7XG4gICAgICAgICAgICBhZ2VudCA9IHRoaXMuX3Byb3h5QWdlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2tlZXBBbGl2ZSAmJiAhdXNlUHJveHkpIHtcbiAgICAgICAgICAgIGFnZW50ID0gdGhpcy5fYWdlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgYWdlbnQgaXMgYWxyZWFkeSBhc3NpZ25lZCB1c2UgdGhhdCBhZ2VudC5cbiAgICAgICAgaWYgKGFnZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gYWdlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXNpbmdTc2wgPSBwYXJzZWRVcmwucHJvdG9jb2wgPT09ICdodHRwczonO1xuICAgICAgICBsZXQgbWF4U29ja2V0cyA9IDEwMDtcbiAgICAgICAgaWYgKHRoaXMucmVxdWVzdE9wdGlvbnMpIHtcbiAgICAgICAgICAgIG1heFNvY2tldHMgPSB0aGlzLnJlcXVlc3RPcHRpb25zLm1heFNvY2tldHMgfHwgaHR0cC5nbG9iYWxBZ2VudC5tYXhTb2NrZXRzO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRoaXMgaXMgYHVzZVByb3h5YCBhZ2FpbiwgYnV0IHdlIG5lZWQgdG8gY2hlY2sgYHByb3h5VVJsYCBkaXJlY3RseSBmb3IgVHlwZVNjcmlwdHMncyBmbG93IGFuYWx5c2lzLlxuICAgICAgICBpZiAocHJveHlVcmwgJiYgcHJveHlVcmwuaG9zdG5hbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IGFnZW50T3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBtYXhTb2NrZXRzLFxuICAgICAgICAgICAgICAgIGtlZXBBbGl2ZTogdGhpcy5fa2VlcEFsaXZlLFxuICAgICAgICAgICAgICAgIHByb3h5OiBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sICgocHJveHlVcmwudXNlcm5hbWUgfHwgcHJveHlVcmwucGFzc3dvcmQpICYmIHtcbiAgICAgICAgICAgICAgICAgICAgcHJveHlBdXRoOiBgJHtwcm94eVVybC51c2VybmFtZX06JHtwcm94eVVybC5wYXNzd29yZH1gXG4gICAgICAgICAgICAgICAgfSkpLCB7IGhvc3Q6IHByb3h5VXJsLmhvc3RuYW1lLCBwb3J0OiBwcm94eVVybC5wb3J0IH0pXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGV0IHR1bm5lbEFnZW50O1xuICAgICAgICAgICAgY29uc3Qgb3Zlckh0dHBzID0gcHJveHlVcmwucHJvdG9jb2wgPT09ICdodHRwczonO1xuICAgICAgICAgICAgaWYgKHVzaW5nU3NsKSB7XG4gICAgICAgICAgICAgICAgdHVubmVsQWdlbnQgPSBvdmVySHR0cHMgPyB0dW5uZWwuaHR0cHNPdmVySHR0cHMgOiB0dW5uZWwuaHR0cHNPdmVySHR0cDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHR1bm5lbEFnZW50ID0gb3Zlckh0dHBzID8gdHVubmVsLmh0dHBPdmVySHR0cHMgOiB0dW5uZWwuaHR0cE92ZXJIdHRwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWdlbnQgPSB0dW5uZWxBZ2VudChhZ2VudE9wdGlvbnMpO1xuICAgICAgICAgICAgdGhpcy5fcHJveHlBZ2VudCA9IGFnZW50O1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmIHJldXNpbmcgYWdlbnQgYWNyb3NzIHJlcXVlc3QgYW5kIHR1bm5lbGluZyBhZ2VudCBpc24ndCBhc3NpZ25lZCBjcmVhdGUgYSBuZXcgYWdlbnRcbiAgICAgICAgaWYgKHRoaXMuX2tlZXBBbGl2ZSAmJiAhYWdlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7IGtlZXBBbGl2ZTogdGhpcy5fa2VlcEFsaXZlLCBtYXhTb2NrZXRzIH07XG4gICAgICAgICAgICBhZ2VudCA9IHVzaW5nU3NsID8gbmV3IGh0dHBzLkFnZW50KG9wdGlvbnMpIDogbmV3IGh0dHAuQWdlbnQob3B0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLl9hZ2VudCA9IGFnZW50O1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmIG5vdCB1c2luZyBwcml2YXRlIGFnZW50IGFuZCB0dW5uZWwgYWdlbnQgaXNuJ3Qgc2V0dXAgdGhlbiB1c2UgZ2xvYmFsIGFnZW50XG4gICAgICAgIGlmICghYWdlbnQpIHtcbiAgICAgICAgICAgIGFnZW50ID0gdXNpbmdTc2wgPyBodHRwcy5nbG9iYWxBZ2VudCA6IGh0dHAuZ2xvYmFsQWdlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVzaW5nU3NsICYmIHRoaXMuX2lnbm9yZVNzbEVycm9yKSB7XG4gICAgICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIHNldCBOT0RFX1RMU19SRUpFQ1RfVU5BVVRIT1JJWkVEPTAgc2luY2UgdGhhdCB3aWxsIGFmZmVjdCByZXF1ZXN0IGZvciBlbnRpcmUgcHJvY2Vzc1xuICAgICAgICAgICAgLy8gaHR0cC5SZXF1ZXN0T3B0aW9ucyBkb2Vzbid0IGV4cG9zZSBhIHdheSB0byBtb2RpZnkgUmVxdWVzdE9wdGlvbnMuYWdlbnQub3B0aW9uc1xuICAgICAgICAgICAgLy8gd2UgaGF2ZSB0byBjYXN0IGl0IHRvIGFueSBhbmQgY2hhbmdlIGl0IGRpcmVjdGx5XG4gICAgICAgICAgICBhZ2VudC5vcHRpb25zID0gT2JqZWN0LmFzc2lnbihhZ2VudC5vcHRpb25zIHx8IHt9LCB7XG4gICAgICAgICAgICAgICAgcmVqZWN0VW5hdXRob3JpemVkOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFnZW50O1xuICAgIH1cbiAgICBfcGVyZm9ybUV4cG9uZW50aWFsQmFja29mZihyZXRyeU51bWJlcikge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgcmV0cnlOdW1iZXIgPSBNYXRoLm1pbihFeHBvbmVudGlhbEJhY2tvZmZDZWlsaW5nLCByZXRyeU51bWJlcik7XG4gICAgICAgICAgICBjb25zdCBtcyA9IEV4cG9uZW50aWFsQmFja29mZlRpbWVTbGljZSAqIE1hdGgucG93KDIsIHJldHJ5TnVtYmVyKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQoKCkgPT4gcmVzb2x2ZSgpLCBtcykpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgX3Byb2Nlc3NSZXNwb25zZShyZXMsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzQ29kZSA9IHJlcy5tZXNzYWdlLnN0YXR1c0NvZGUgfHwgMDtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZSxcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7fVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgLy8gbm90IGZvdW5kIGxlYWRzIHRvIG51bGwgb2JqIHJldHVybmVkXG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1c0NvZGUgPT09IEh0dHBDb2Rlcy5Ob3RGb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSByZXN1bHQgZnJvbSB0aGUgYm9keVxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRhdGVUaW1lRGVzZXJpYWxpemVyKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGEgPSBuZXcgRGF0ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzTmFOKGEudmFsdWVPZigpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IG9iajtcbiAgICAgICAgICAgICAgICBsZXQgY29udGVudHM7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudHMgPSB5aWVsZCByZXMucmVhZEJvZHkoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRlbnRzICYmIGNvbnRlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZGVzZXJpYWxpemVEYXRlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iaiA9IEpTT04ucGFyc2UoY29udGVudHMsIGRhdGVUaW1lRGVzZXJpYWxpemVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iaiA9IEpTT04ucGFyc2UoY29udGVudHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UucmVzdWx0ID0gb2JqO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLmhlYWRlcnMgPSByZXMubWVzc2FnZS5oZWFkZXJzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEludmFsaWQgcmVzb3VyY2UgKGNvbnRlbnRzIG5vdCBqc29uKTsgIGxlYXZpbmcgcmVzdWx0IG9iaiBudWxsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIG5vdGUgdGhhdCAzeHggcmVkaXJlY3RzIGFyZSBoYW5kbGVkIGJ5IHRoZSBodHRwIGxheWVyLlxuICAgICAgICAgICAgICAgIGlmIChzdGF0dXNDb2RlID4gMjk5KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtc2c7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIGV4Y2VwdGlvbi9lcnJvciBpbiBib2R5LCBhdHRlbXB0IHRvIGdldCBiZXR0ZXIgZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iaiAmJiBvYmoubWVzc2FnZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbXNnID0gb2JqLm1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoY29udGVudHMgJiYgY29udGVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaXQgbWF5IGJlIHRoZSBjYXNlIHRoYXQgdGhlIGV4Y2VwdGlvbiBpcyBpbiB0aGUgYm9keSBtZXNzYWdlIGFzIHN0cmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgbXNnID0gY29udGVudHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtc2cgPSBgRmFpbGVkIHJlcXVlc3Q6ICgke3N0YXR1c0NvZGV9KWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyID0gbmV3IEh0dHBDbGllbnRFcnJvcihtc2csIHN0YXR1c0NvZGUpO1xuICAgICAgICAgICAgICAgICAgICBlcnIucmVzdWx0ID0gcmVzcG9uc2UucmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5IdHRwQ2xpZW50ID0gSHR0cENsaWVudDtcbmNvbnN0IGxvd2VyY2FzZUtleXMgPSAob2JqKSA9PiBPYmplY3Qua2V5cyhvYmopLnJlZHVjZSgoYywgaykgPT4gKChjW2sudG9Mb3dlckNhc2UoKV0gPSBvYmpba10pLCBjKSwge30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmNoZWNrQnlwYXNzID0gZXhwb3J0cy5nZXRQcm94eVVybCA9IHZvaWQgMDtcbmZ1bmN0aW9uIGdldFByb3h5VXJsKHJlcVVybCkge1xuICAgIGNvbnN0IHVzaW5nU3NsID0gcmVxVXJsLnByb3RvY29sID09PSAnaHR0cHM6JztcbiAgICBpZiAoY2hlY2tCeXBhc3MocmVxVXJsKSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCBwcm94eVZhciA9ICgoKSA9PiB7XG4gICAgICAgIGlmICh1c2luZ1NzbCkge1xuICAgICAgICAgICAgcmV0dXJuIHByb2Nlc3MuZW52WydodHRwc19wcm94eSddIHx8IHByb2Nlc3MuZW52WydIVFRQU19QUk9YWSddO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHByb2Nlc3MuZW52WydodHRwX3Byb3h5J10gfHwgcHJvY2Vzcy5lbnZbJ0hUVFBfUFJPWFknXTtcbiAgICAgICAgfVxuICAgIH0pKCk7XG4gICAgaWYgKHByb3h5VmFyKSB7XG4gICAgICAgIHJldHVybiBuZXcgVVJMKHByb3h5VmFyKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxufVxuZXhwb3J0cy5nZXRQcm94eVVybCA9IGdldFByb3h5VXJsO1xuZnVuY3Rpb24gY2hlY2tCeXBhc3MocmVxVXJsKSB7XG4gICAgaWYgKCFyZXFVcmwuaG9zdG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCByZXFIb3N0ID0gcmVxVXJsLmhvc3RuYW1lO1xuICAgIGlmIChpc0xvb3BiYWNrQWRkcmVzcyhyZXFIb3N0KSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgY29uc3Qgbm9Qcm94eSA9IHByb2Nlc3MuZW52Wydub19wcm94eSddIHx8IHByb2Nlc3MuZW52WydOT19QUk9YWSddIHx8ICcnO1xuICAgIGlmICghbm9Qcm94eSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIERldGVybWluZSB0aGUgcmVxdWVzdCBwb3J0XG4gICAgbGV0IHJlcVBvcnQ7XG4gICAgaWYgKHJlcVVybC5wb3J0KSB7XG4gICAgICAgIHJlcVBvcnQgPSBOdW1iZXIocmVxVXJsLnBvcnQpO1xuICAgIH1cbiAgICBlbHNlIGlmIChyZXFVcmwucHJvdG9jb2wgPT09ICdodHRwOicpIHtcbiAgICAgICAgcmVxUG9ydCA9IDgwO1xuICAgIH1cbiAgICBlbHNlIGlmIChyZXFVcmwucHJvdG9jb2wgPT09ICdodHRwczonKSB7XG4gICAgICAgIHJlcVBvcnQgPSA0NDM7XG4gICAgfVxuICAgIC8vIEZvcm1hdCB0aGUgcmVxdWVzdCBob3N0bmFtZSBhbmQgaG9zdG5hbWUgd2l0aCBwb3J0XG4gICAgY29uc3QgdXBwZXJSZXFIb3N0cyA9IFtyZXFVcmwuaG9zdG5hbWUudG9VcHBlckNhc2UoKV07XG4gICAgaWYgKHR5cGVvZiByZXFQb3J0ID09PSAnbnVtYmVyJykge1xuICAgICAgICB1cHBlclJlcUhvc3RzLnB1c2goYCR7dXBwZXJSZXFIb3N0c1swXX06JHtyZXFQb3J0fWApO1xuICAgIH1cbiAgICAvLyBDb21wYXJlIHJlcXVlc3QgaG9zdCBhZ2FpbnN0IG5vcHJveHlcbiAgICBmb3IgKGNvbnN0IHVwcGVyTm9Qcm94eUl0ZW0gb2Ygbm9Qcm94eVxuICAgICAgICAuc3BsaXQoJywnKVxuICAgICAgICAubWFwKHggPT4geC50cmltKCkudG9VcHBlckNhc2UoKSlcbiAgICAgICAgLmZpbHRlcih4ID0+IHgpKSB7XG4gICAgICAgIGlmICh1cHBlck5vUHJveHlJdGVtID09PSAnKicgfHxcbiAgICAgICAgICAgIHVwcGVyUmVxSG9zdHMuc29tZSh4ID0+IHggPT09IHVwcGVyTm9Qcm94eUl0ZW0gfHxcbiAgICAgICAgICAgICAgICB4LmVuZHNXaXRoKGAuJHt1cHBlck5vUHJveHlJdGVtfWApIHx8XG4gICAgICAgICAgICAgICAgKHVwcGVyTm9Qcm94eUl0ZW0uc3RhcnRzV2l0aCgnLicpICYmXG4gICAgICAgICAgICAgICAgICAgIHguZW5kc1dpdGgoYCR7dXBwZXJOb1Byb3h5SXRlbX1gKSkpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5leHBvcnRzLmNoZWNrQnlwYXNzID0gY2hlY2tCeXBhc3M7XG5mdW5jdGlvbiBpc0xvb3BiYWNrQWRkcmVzcyhob3N0KSB7XG4gICAgY29uc3QgaG9zdExvd2VyID0gaG9zdC50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiAoaG9zdExvd2VyID09PSAnbG9jYWxob3N0JyB8fFxuICAgICAgICBob3N0TG93ZXIuc3RhcnRzV2l0aCgnMTI3LicpIHx8XG4gICAgICAgIGhvc3RMb3dlci5zdGFydHNXaXRoKCdbOjoxXScpIHx8XG4gICAgICAgIGhvc3RMb3dlci5zdGFydHNXaXRoKCdbMDowOjA6MDowOjA6MDoxXScpKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByb3h5LmpzLm1hcCIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gYmFsYW5jZWQ7XG5mdW5jdGlvbiBiYWxhbmNlZChhLCBiLCBzdHIpIHtcbiAgaWYgKGEgaW5zdGFuY2VvZiBSZWdFeHApIGEgPSBtYXliZU1hdGNoKGEsIHN0cik7XG4gIGlmIChiIGluc3RhbmNlb2YgUmVnRXhwKSBiID0gbWF5YmVNYXRjaChiLCBzdHIpO1xuXG4gIHZhciByID0gcmFuZ2UoYSwgYiwgc3RyKTtcblxuICByZXR1cm4gciAmJiB7XG4gICAgc3RhcnQ6IHJbMF0sXG4gICAgZW5kOiByWzFdLFxuICAgIHByZTogc3RyLnNsaWNlKDAsIHJbMF0pLFxuICAgIGJvZHk6IHN0ci5zbGljZShyWzBdICsgYS5sZW5ndGgsIHJbMV0pLFxuICAgIHBvc3Q6IHN0ci5zbGljZShyWzFdICsgYi5sZW5ndGgpXG4gIH07XG59XG5cbmZ1bmN0aW9uIG1heWJlTWF0Y2gocmVnLCBzdHIpIHtcbiAgdmFyIG0gPSBzdHIubWF0Y2gocmVnKTtcbiAgcmV0dXJuIG0gPyBtWzBdIDogbnVsbDtcbn1cblxuYmFsYW5jZWQucmFuZ2UgPSByYW5nZTtcbmZ1bmN0aW9uIHJhbmdlKGEsIGIsIHN0cikge1xuICB2YXIgYmVncywgYmVnLCBsZWZ0LCByaWdodCwgcmVzdWx0O1xuICB2YXIgYWkgPSBzdHIuaW5kZXhPZihhKTtcbiAgdmFyIGJpID0gc3RyLmluZGV4T2YoYiwgYWkgKyAxKTtcbiAgdmFyIGkgPSBhaTtcblxuICBpZiAoYWkgPj0gMCAmJiBiaSA+IDApIHtcbiAgICBpZihhPT09Yikge1xuICAgICAgcmV0dXJuIFthaSwgYmldO1xuICAgIH1cbiAgICBiZWdzID0gW107XG4gICAgbGVmdCA9IHN0ci5sZW5ndGg7XG5cbiAgICB3aGlsZSAoaSA+PSAwICYmICFyZXN1bHQpIHtcbiAgICAgIGlmIChpID09IGFpKSB7XG4gICAgICAgIGJlZ3MucHVzaChpKTtcbiAgICAgICAgYWkgPSBzdHIuaW5kZXhPZihhLCBpICsgMSk7XG4gICAgICB9IGVsc2UgaWYgKGJlZ3MubGVuZ3RoID09IDEpIHtcbiAgICAgICAgcmVzdWx0ID0gWyBiZWdzLnBvcCgpLCBiaSBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYmVnID0gYmVncy5wb3AoKTtcbiAgICAgICAgaWYgKGJlZyA8IGxlZnQpIHtcbiAgICAgICAgICBsZWZ0ID0gYmVnO1xuICAgICAgICAgIHJpZ2h0ID0gYmk7XG4gICAgICAgIH1cblxuICAgICAgICBiaSA9IHN0ci5pbmRleE9mKGIsIGkgKyAxKTtcbiAgICAgIH1cblxuICAgICAgaSA9IGFpIDwgYmkgJiYgYWkgPj0gMCA/IGFpIDogYmk7XG4gICAgfVxuXG4gICAgaWYgKGJlZ3MubGVuZ3RoKSB7XG4gICAgICByZXN1bHQgPSBbIGxlZnQsIHJpZ2h0IF07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiIsInZhciBjb25jYXRNYXAgPSByZXF1aXJlKCdjb25jYXQtbWFwJyk7XG52YXIgYmFsYW5jZWQgPSByZXF1aXJlKCdiYWxhbmNlZC1tYXRjaCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cGFuZFRvcDtcblxudmFyIGVzY1NsYXNoID0gJ1xcMFNMQVNIJytNYXRoLnJhbmRvbSgpKydcXDAnO1xudmFyIGVzY09wZW4gPSAnXFwwT1BFTicrTWF0aC5yYW5kb20oKSsnXFwwJztcbnZhciBlc2NDbG9zZSA9ICdcXDBDTE9TRScrTWF0aC5yYW5kb20oKSsnXFwwJztcbnZhciBlc2NDb21tYSA9ICdcXDBDT01NQScrTWF0aC5yYW5kb20oKSsnXFwwJztcbnZhciBlc2NQZXJpb2QgPSAnXFwwUEVSSU9EJytNYXRoLnJhbmRvbSgpKydcXDAnO1xuXG5mdW5jdGlvbiBudW1lcmljKHN0cikge1xuICByZXR1cm4gcGFyc2VJbnQoc3RyLCAxMCkgPT0gc3RyXG4gICAgPyBwYXJzZUludChzdHIsIDEwKVxuICAgIDogc3RyLmNoYXJDb2RlQXQoMCk7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUJyYWNlcyhzdHIpIHtcbiAgcmV0dXJuIHN0ci5zcGxpdCgnXFxcXFxcXFwnKS5qb2luKGVzY1NsYXNoKVxuICAgICAgICAgICAgLnNwbGl0KCdcXFxceycpLmpvaW4oZXNjT3BlbilcbiAgICAgICAgICAgIC5zcGxpdCgnXFxcXH0nKS5qb2luKGVzY0Nsb3NlKVxuICAgICAgICAgICAgLnNwbGl0KCdcXFxcLCcpLmpvaW4oZXNjQ29tbWEpXG4gICAgICAgICAgICAuc3BsaXQoJ1xcXFwuJykuam9pbihlc2NQZXJpb2QpO1xufVxuXG5mdW5jdGlvbiB1bmVzY2FwZUJyYWNlcyhzdHIpIHtcbiAgcmV0dXJuIHN0ci5zcGxpdChlc2NTbGFzaCkuam9pbignXFxcXCcpXG4gICAgICAgICAgICAuc3BsaXQoZXNjT3Blbikuam9pbigneycpXG4gICAgICAgICAgICAuc3BsaXQoZXNjQ2xvc2UpLmpvaW4oJ30nKVxuICAgICAgICAgICAgLnNwbGl0KGVzY0NvbW1hKS5qb2luKCcsJylcbiAgICAgICAgICAgIC5zcGxpdChlc2NQZXJpb2QpLmpvaW4oJy4nKTtcbn1cblxuXG4vLyBCYXNpY2FsbHkganVzdCBzdHIuc3BsaXQoXCIsXCIpLCBidXQgaGFuZGxpbmcgY2FzZXNcbi8vIHdoZXJlIHdlIGhhdmUgbmVzdGVkIGJyYWNlZCBzZWN0aW9ucywgd2hpY2ggc2hvdWxkIGJlXG4vLyB0cmVhdGVkIGFzIGluZGl2aWR1YWwgbWVtYmVycywgbGlrZSB7YSx7YixjfSxkfVxuZnVuY3Rpb24gcGFyc2VDb21tYVBhcnRzKHN0cikge1xuICBpZiAoIXN0cilcbiAgICByZXR1cm4gWycnXTtcblxuICB2YXIgcGFydHMgPSBbXTtcbiAgdmFyIG0gPSBiYWxhbmNlZCgneycsICd9Jywgc3RyKTtcblxuICBpZiAoIW0pXG4gICAgcmV0dXJuIHN0ci5zcGxpdCgnLCcpO1xuXG4gIHZhciBwcmUgPSBtLnByZTtcbiAgdmFyIGJvZHkgPSBtLmJvZHk7XG4gIHZhciBwb3N0ID0gbS5wb3N0O1xuICB2YXIgcCA9IHByZS5zcGxpdCgnLCcpO1xuXG4gIHBbcC5sZW5ndGgtMV0gKz0gJ3snICsgYm9keSArICd9JztcbiAgdmFyIHBvc3RQYXJ0cyA9IHBhcnNlQ29tbWFQYXJ0cyhwb3N0KTtcbiAgaWYgKHBvc3QubGVuZ3RoKSB7XG4gICAgcFtwLmxlbmd0aC0xXSArPSBwb3N0UGFydHMuc2hpZnQoKTtcbiAgICBwLnB1c2guYXBwbHkocCwgcG9zdFBhcnRzKTtcbiAgfVxuXG4gIHBhcnRzLnB1c2guYXBwbHkocGFydHMsIHApO1xuXG4gIHJldHVybiBwYXJ0cztcbn1cblxuZnVuY3Rpb24gZXhwYW5kVG9wKHN0cikge1xuICBpZiAoIXN0cilcbiAgICByZXR1cm4gW107XG5cbiAgLy8gSSBkb24ndCBrbm93IHdoeSBCYXNoIDQuMyBkb2VzIHRoaXMsIGJ1dCBpdCBkb2VzLlxuICAvLyBBbnl0aGluZyBzdGFydGluZyB3aXRoIHt9IHdpbGwgaGF2ZSB0aGUgZmlyc3QgdHdvIGJ5dGVzIHByZXNlcnZlZFxuICAvLyBidXQgKm9ubHkqIGF0IHRoZSB0b3AgbGV2ZWwsIHNvIHt9LGF9YiB3aWxsIG5vdCBleHBhbmQgdG8gYW55dGhpbmcsXG4gIC8vIGJ1dCBhe30sYn1jIHdpbGwgYmUgZXhwYW5kZWQgdG8gW2F9YyxhYmNdLlxuICAvLyBPbmUgY291bGQgYXJndWUgdGhhdCB0aGlzIGlzIGEgYnVnIGluIEJhc2gsIGJ1dCBzaW5jZSB0aGUgZ29hbCBvZlxuICAvLyB0aGlzIG1vZHVsZSBpcyB0byBtYXRjaCBCYXNoJ3MgcnVsZXMsIHdlIGVzY2FwZSBhIGxlYWRpbmcge31cbiAgaWYgKHN0ci5zdWJzdHIoMCwgMikgPT09ICd7fScpIHtcbiAgICBzdHIgPSAnXFxcXHtcXFxcfScgKyBzdHIuc3Vic3RyKDIpO1xuICB9XG5cbiAgcmV0dXJuIGV4cGFuZChlc2NhcGVCcmFjZXMoc3RyKSwgdHJ1ZSkubWFwKHVuZXNjYXBlQnJhY2VzKTtcbn1cblxuZnVuY3Rpb24gaWRlbnRpdHkoZSkge1xuICByZXR1cm4gZTtcbn1cblxuZnVuY3Rpb24gZW1icmFjZShzdHIpIHtcbiAgcmV0dXJuICd7JyArIHN0ciArICd9Jztcbn1cbmZ1bmN0aW9uIGlzUGFkZGVkKGVsKSB7XG4gIHJldHVybiAvXi0/MFxcZC8udGVzdChlbCk7XG59XG5cbmZ1bmN0aW9uIGx0ZShpLCB5KSB7XG4gIHJldHVybiBpIDw9IHk7XG59XG5mdW5jdGlvbiBndGUoaSwgeSkge1xuICByZXR1cm4gaSA+PSB5O1xufVxuXG5mdW5jdGlvbiBleHBhbmQoc3RyLCBpc1RvcCkge1xuICB2YXIgZXhwYW5zaW9ucyA9IFtdO1xuXG4gIHZhciBtID0gYmFsYW5jZWQoJ3snLCAnfScsIHN0cik7XG4gIGlmICghbSB8fCAvXFwkJC8udGVzdChtLnByZSkpIHJldHVybiBbc3RyXTtcblxuICB2YXIgaXNOdW1lcmljU2VxdWVuY2UgPSAvXi0/XFxkK1xcLlxcLi0/XFxkKyg/OlxcLlxcLi0/XFxkKyk/JC8udGVzdChtLmJvZHkpO1xuICB2YXIgaXNBbHBoYVNlcXVlbmNlID0gL15bYS16QS1aXVxcLlxcLlthLXpBLVpdKD86XFwuXFwuLT9cXGQrKT8kLy50ZXN0KG0uYm9keSk7XG4gIHZhciBpc1NlcXVlbmNlID0gaXNOdW1lcmljU2VxdWVuY2UgfHwgaXNBbHBoYVNlcXVlbmNlO1xuICB2YXIgaXNPcHRpb25zID0gbS5ib2R5LmluZGV4T2YoJywnKSA+PSAwO1xuICBpZiAoIWlzU2VxdWVuY2UgJiYgIWlzT3B0aW9ucykge1xuICAgIC8vIHthfSxifVxuICAgIGlmIChtLnBvc3QubWF0Y2goLywuKlxcfS8pKSB7XG4gICAgICBzdHIgPSBtLnByZSArICd7JyArIG0uYm9keSArIGVzY0Nsb3NlICsgbS5wb3N0O1xuICAgICAgcmV0dXJuIGV4cGFuZChzdHIpO1xuICAgIH1cbiAgICByZXR1cm4gW3N0cl07XG4gIH1cblxuICB2YXIgbjtcbiAgaWYgKGlzU2VxdWVuY2UpIHtcbiAgICBuID0gbS5ib2R5LnNwbGl0KC9cXC5cXC4vKTtcbiAgfSBlbHNlIHtcbiAgICBuID0gcGFyc2VDb21tYVBhcnRzKG0uYm9keSk7XG4gICAgaWYgKG4ubGVuZ3RoID09PSAxKSB7XG4gICAgICAvLyB4e3thLGJ9fXkgPT0+IHh7YX15IHh7Yn15XG4gICAgICBuID0gZXhwYW5kKG5bMF0sIGZhbHNlKS5tYXAoZW1icmFjZSk7XG4gICAgICBpZiAobi5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgdmFyIHBvc3QgPSBtLnBvc3QubGVuZ3RoXG4gICAgICAgICAgPyBleHBhbmQobS5wb3N0LCBmYWxzZSlcbiAgICAgICAgICA6IFsnJ107XG4gICAgICAgIHJldHVybiBwb3N0Lm1hcChmdW5jdGlvbihwKSB7XG4gICAgICAgICAgcmV0dXJuIG0ucHJlICsgblswXSArIHA7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIGF0IHRoaXMgcG9pbnQsIG4gaXMgdGhlIHBhcnRzLCBhbmQgd2Uga25vdyBpdCdzIG5vdCBhIGNvbW1hIHNldFxuICAvLyB3aXRoIGEgc2luZ2xlIGVudHJ5LlxuXG4gIC8vIG5vIG5lZWQgdG8gZXhwYW5kIHByZSwgc2luY2UgaXQgaXMgZ3VhcmFudGVlZCB0byBiZSBmcmVlIG9mIGJyYWNlLXNldHNcbiAgdmFyIHByZSA9IG0ucHJlO1xuICB2YXIgcG9zdCA9IG0ucG9zdC5sZW5ndGhcbiAgICA/IGV4cGFuZChtLnBvc3QsIGZhbHNlKVxuICAgIDogWycnXTtcblxuICB2YXIgTjtcblxuICBpZiAoaXNTZXF1ZW5jZSkge1xuICAgIHZhciB4ID0gbnVtZXJpYyhuWzBdKTtcbiAgICB2YXIgeSA9IG51bWVyaWMoblsxXSk7XG4gICAgdmFyIHdpZHRoID0gTWF0aC5tYXgoblswXS5sZW5ndGgsIG5bMV0ubGVuZ3RoKVxuICAgIHZhciBpbmNyID0gbi5sZW5ndGggPT0gM1xuICAgICAgPyBNYXRoLmFicyhudW1lcmljKG5bMl0pKVxuICAgICAgOiAxO1xuICAgIHZhciB0ZXN0ID0gbHRlO1xuICAgIHZhciByZXZlcnNlID0geSA8IHg7XG4gICAgaWYgKHJldmVyc2UpIHtcbiAgICAgIGluY3IgKj0gLTE7XG4gICAgICB0ZXN0ID0gZ3RlO1xuICAgIH1cbiAgICB2YXIgcGFkID0gbi5zb21lKGlzUGFkZGVkKTtcblxuICAgIE4gPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSB4OyB0ZXN0KGksIHkpOyBpICs9IGluY3IpIHtcbiAgICAgIHZhciBjO1xuICAgICAgaWYgKGlzQWxwaGFTZXF1ZW5jZSkge1xuICAgICAgICBjID0gU3RyaW5nLmZyb21DaGFyQ29kZShpKTtcbiAgICAgICAgaWYgKGMgPT09ICdcXFxcJylcbiAgICAgICAgICBjID0gJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjID0gU3RyaW5nKGkpO1xuICAgICAgICBpZiAocGFkKSB7XG4gICAgICAgICAgdmFyIG5lZWQgPSB3aWR0aCAtIGMubGVuZ3RoO1xuICAgICAgICAgIGlmIChuZWVkID4gMCkge1xuICAgICAgICAgICAgdmFyIHogPSBuZXcgQXJyYXkobmVlZCArIDEpLmpvaW4oJzAnKTtcbiAgICAgICAgICAgIGlmIChpIDwgMClcbiAgICAgICAgICAgICAgYyA9ICctJyArIHogKyBjLnNsaWNlKDEpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBjID0geiArIGM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBOLnB1c2goYyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIE4gPSBjb25jYXRNYXAobiwgZnVuY3Rpb24oZWwpIHsgcmV0dXJuIGV4cGFuZChlbCwgZmFsc2UpIH0pO1xuICB9XG5cbiAgZm9yICh2YXIgaiA9IDA7IGogPCBOLmxlbmd0aDsgaisrKSB7XG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBwb3N0Lmxlbmd0aDsgaysrKSB7XG4gICAgICB2YXIgZXhwYW5zaW9uID0gcHJlICsgTltqXSArIHBvc3Rba107XG4gICAgICBpZiAoIWlzVG9wIHx8IGlzU2VxdWVuY2UgfHwgZXhwYW5zaW9uKVxuICAgICAgICBleHBhbnNpb25zLnB1c2goZXhwYW5zaW9uKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZXhwYW5zaW9ucztcbn1cblxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeHMsIGZuKSB7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHggPSBmbih4c1tpXSwgaSk7XG4gICAgICAgIGlmIChpc0FycmF5KHgpKSByZXMucHVzaC5hcHBseShyZXMsIHgpO1xuICAgICAgICBlbHNlIHJlcy5wdXNoKHgpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh4cykge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSID0gdHlwZW9mIFJlZmxlY3QgPT09ICdvYmplY3QnID8gUmVmbGVjdCA6IG51bGxcbnZhciBSZWZsZWN0QXBwbHkgPSBSICYmIHR5cGVvZiBSLmFwcGx5ID09PSAnZnVuY3Rpb24nXG4gID8gUi5hcHBseVxuICA6IGZ1bmN0aW9uIFJlZmxlY3RBcHBseSh0YXJnZXQsIHJlY2VpdmVyLCBhcmdzKSB7XG4gICAgcmV0dXJuIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKHRhcmdldCwgcmVjZWl2ZXIsIGFyZ3MpO1xuICB9XG5cbnZhciBSZWZsZWN0T3duS2V5c1xuaWYgKFIgJiYgdHlwZW9mIFIub3duS2V5cyA9PT0gJ2Z1bmN0aW9uJykge1xuICBSZWZsZWN0T3duS2V5cyA9IFIub3duS2V5c1xufSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG4gIFJlZmxlY3RPd25LZXlzID0gZnVuY3Rpb24gUmVmbGVjdE93bktleXModGFyZ2V0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRhcmdldClcbiAgICAgIC5jb25jYXQoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyh0YXJnZXQpKTtcbiAgfTtcbn0gZWxzZSB7XG4gIFJlZmxlY3RPd25LZXlzID0gZnVuY3Rpb24gUmVmbGVjdE93bktleXModGFyZ2V0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRhcmdldCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIFByb2Nlc3NFbWl0V2FybmluZyh3YXJuaW5nKSB7XG4gIGlmIChjb25zb2xlICYmIGNvbnNvbGUud2FybikgY29uc29sZS53YXJuKHdhcm5pbmcpO1xufVxuXG52YXIgTnVtYmVySXNOYU4gPSBOdW1iZXIuaXNOYU4gfHwgZnVuY3Rpb24gTnVtYmVySXNOYU4odmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9PSB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICBFdmVudEVtaXR0ZXIuaW5pdC5jYWxsKHRoaXMpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5tb2R1bGUuZXhwb3J0cy5vbmNlID0gb25jZTtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHNDb3VudCA9IDA7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbnZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbmZ1bmN0aW9uIGNoZWNrTGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIEZ1bmN0aW9uLiBSZWNlaXZlZCB0eXBlICcgKyB0eXBlb2YgbGlzdGVuZXIpO1xuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShFdmVudEVtaXR0ZXIsICdkZWZhdWx0TWF4TGlzdGVuZXJzJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkZWZhdWx0TWF4TGlzdGVuZXJzO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uKGFyZykge1xuICAgIGlmICh0eXBlb2YgYXJnICE9PSAnbnVtYmVyJyB8fCBhcmcgPCAwIHx8IE51bWJlcklzTmFOKGFyZykpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgb2YgXCJkZWZhdWx0TWF4TGlzdGVuZXJzXCIgaXMgb3V0IG9mIHJhbmdlLiBJdCBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIG51bWJlci4gUmVjZWl2ZWQgJyArIGFyZyArICcuJyk7XG4gICAgfVxuICAgIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSBhcmc7XG4gIH1cbn0pO1xuXG5FdmVudEVtaXR0ZXIuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gIGlmICh0aGlzLl9ldmVudHMgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgdGhpcy5fZXZlbnRzID09PSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykuX2V2ZW50cykge1xuICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICB9XG5cbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn07XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycyhuKSB7XG4gIGlmICh0eXBlb2YgbiAhPT0gJ251bWJlcicgfHwgbiA8IDAgfHwgTnVtYmVySXNOYU4obikpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVGhlIHZhbHVlIG9mIFwiblwiIGlzIG91dCBvZiByYW5nZS4gSXQgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBudW1iZXIuIFJlY2VpdmVkICcgKyBuICsgJy4nKTtcbiAgfVxuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIF9nZXRNYXhMaXN0ZW5lcnModGhhdCkge1xuICBpZiAodGhhdC5fbWF4TGlzdGVuZXJzID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICByZXR1cm4gdGhhdC5fbWF4TGlzdGVuZXJzO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmdldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIGdldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuIF9nZXRNYXhMaXN0ZW5lcnModGhpcyk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUpIHtcbiAgdmFyIGFyZ3MgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICB2YXIgZG9FcnJvciA9ICh0eXBlID09PSAnZXJyb3InKTtcblxuICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICBpZiAoZXZlbnRzICE9PSB1bmRlZmluZWQpXG4gICAgZG9FcnJvciA9IChkb0Vycm9yICYmIGV2ZW50cy5lcnJvciA9PT0gdW5kZWZpbmVkKTtcbiAgZWxzZSBpZiAoIWRvRXJyb3IpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKGRvRXJyb3IpIHtcbiAgICB2YXIgZXI7XG4gICAgaWYgKGFyZ3MubGVuZ3RoID4gMClcbiAgICAgIGVyID0gYXJnc1swXTtcbiAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgLy8gTm90ZTogVGhlIGNvbW1lbnRzIG9uIHRoZSBgdGhyb3dgIGxpbmVzIGFyZSBpbnRlbnRpb25hbCwgdGhleSBzaG93XG4gICAgICAvLyB1cCBpbiBOb2RlJ3Mgb3V0cHV0IGlmIHRoaXMgcmVzdWx0cyBpbiBhbiB1bmhhbmRsZWQgZXhjZXB0aW9uLlxuICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgfVxuICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmhhbmRsZWQgZXJyb3IuJyArIChlciA/ICcgKCcgKyBlci5tZXNzYWdlICsgJyknIDogJycpKTtcbiAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgIHRocm93IGVycjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgfVxuXG4gIHZhciBoYW5kbGVyID0gZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChoYW5kbGVyID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIFJlZmxlY3RBcHBseShoYW5kbGVyLCB0aGlzLCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgUmVmbGVjdEFwcGx5KGxpc3RlbmVyc1tpXSwgdGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmZ1bmN0aW9uIF9hZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBwcmVwZW5kKSB7XG4gIHZhciBtO1xuICB2YXIgZXZlbnRzO1xuICB2YXIgZXhpc3Rpbmc7XG5cbiAgY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG5cbiAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gIGlmIChldmVudHMgPT09IHVuZGVmaW5lZCkge1xuICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB0YXJnZXQuX2V2ZW50c0NvdW50ID0gMDtcbiAgfSBlbHNlIHtcbiAgICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAgIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgICBpZiAoZXZlbnRzLm5ld0xpc3RlbmVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRhcmdldC5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA/IGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gICAgICAvLyBSZS1hc3NpZ24gYGV2ZW50c2AgYmVjYXVzZSBhIG5ld0xpc3RlbmVyIGhhbmRsZXIgY291bGQgaGF2ZSBjYXVzZWQgdGhlXG4gICAgICAvLyB0aGlzLl9ldmVudHMgdG8gYmUgYXNzaWduZWQgdG8gYSBuZXcgb2JqZWN0XG4gICAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgICB9XG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV07XG4gIH1cblxuICBpZiAoZXhpc3RpbmcgPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gICAgKyt0YXJnZXQuX2V2ZW50c0NvdW50O1xuICB9IGVsc2Uge1xuICAgIGlmICh0eXBlb2YgZXhpc3RpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPVxuICAgICAgICBwcmVwZW5kID8gW2xpc3RlbmVyLCBleGlzdGluZ10gOiBbZXhpc3RpbmcsIGxpc3RlbmVyXTtcbiAgICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB9IGVsc2UgaWYgKHByZXBlbmQpIHtcbiAgICAgIGV4aXN0aW5nLnVuc2hpZnQobGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleGlzdGluZy5wdXNoKGxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICAgIG0gPSBfZ2V0TWF4TGlzdGVuZXJzKHRhcmdldCk7XG4gICAgaWYgKG0gPiAwICYmIGV4aXN0aW5nLmxlbmd0aCA+IG0gJiYgIWV4aXN0aW5nLndhcm5lZCkge1xuICAgICAgZXhpc3Rpbmcud2FybmVkID0gdHJ1ZTtcbiAgICAgIC8vIE5vIGVycm9yIGNvZGUgZm9yIHRoaXMgc2luY2UgaXQgaXMgYSBXYXJuaW5nXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVzdHJpY3RlZC1zeW50YXhcbiAgICAgIHZhciB3ID0gbmV3IEVycm9yKCdQb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5IGxlYWsgZGV0ZWN0ZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZy5sZW5ndGggKyAnICcgKyBTdHJpbmcodHlwZSkgKyAnIGxpc3RlbmVycyAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FkZGVkLiBVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ2luY3JlYXNlIGxpbWl0Jyk7XG4gICAgICB3Lm5hbWUgPSAnTWF4TGlzdGVuZXJzRXhjZWVkZWRXYXJuaW5nJztcbiAgICAgIHcuZW1pdHRlciA9IHRhcmdldDtcbiAgICAgIHcudHlwZSA9IHR5cGU7XG4gICAgICB3LmNvdW50ID0gZXhpc3RpbmcubGVuZ3RoO1xuICAgICAgUHJvY2Vzc0VtaXRXYXJuaW5nKHcpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiBhZGRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLCB0eXBlLCBsaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfTtcblxuZnVuY3Rpb24gb25jZVdyYXBwZXIoKSB7XG4gIGlmICghdGhpcy5maXJlZCkge1xuICAgIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHRoaXMudHlwZSwgdGhpcy53cmFwRm4pO1xuICAgIHRoaXMuZmlyZWQgPSB0cnVlO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCk7XG4gICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuYXBwbHkodGhpcy50YXJnZXQsIGFyZ3VtZW50cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX29uY2VXcmFwKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIHN0YXRlID0geyBmaXJlZDogZmFsc2UsIHdyYXBGbjogdW5kZWZpbmVkLCB0YXJnZXQ6IHRhcmdldCwgdHlwZTogdHlwZSwgbGlzdGVuZXI6IGxpc3RlbmVyIH07XG4gIHZhciB3cmFwcGVkID0gb25jZVdyYXBwZXIuYmluZChzdGF0ZSk7XG4gIHdyYXBwZWQubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgc3RhdGUud3JhcEZuID0gd3JhcHBlZDtcbiAgcmV0dXJuIHdyYXBwZWQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UodHlwZSwgbGlzdGVuZXIpIHtcbiAgY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG4gIHRoaXMub24odHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kT25jZUxpc3RlbmVyID1cbiAgICBmdW5jdGlvbiBwcmVwZW5kT25jZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgIHRoaXMucHJlcGVuZExpc3RlbmVyKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuLy8gRW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmIGFuZCBvbmx5IGlmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgbGlzdCwgZXZlbnRzLCBwb3NpdGlvbiwgaSwgb3JpZ2luYWxMaXN0ZW5lcjtcblxuICAgICAgY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmIChldmVudHMgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGxpc3QgPSBldmVudHNbdHlwZV07XG4gICAgICBpZiAobGlzdCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8IGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0Lmxpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbGlzdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwb3NpdGlvbiA9IC0xO1xuXG4gICAgICAgIGZvciAoaSA9IGxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHwgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsTGlzdGVuZXIgPSBsaXN0W2ldLmxpc3RlbmVyO1xuICAgICAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgICBpZiAocG9zaXRpb24gPT09IDApXG4gICAgICAgICAgbGlzdC5zaGlmdCgpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBzcGxpY2VPbmUobGlzdCwgcG9zaXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKVxuICAgICAgICAgIGV2ZW50c1t0eXBlXSA9IGxpc3RbMF07XG5cbiAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lciAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBvcmlnaW5hbExpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKHR5cGUpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMsIGV2ZW50cywgaTtcblxuICAgICAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICAgICAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnRzW3R5cGVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGVsZXRlIGV2ZW50c1t0eXBlXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGV2ZW50cyk7XG4gICAgICAgIHZhciBrZXk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBsaXN0ZW5lcnMgPSBldmVudHNbdHlwZV07XG5cbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgICAgIH0gZWxzZSBpZiAobGlzdGVuZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gTElGTyBvcmRlclxuICAgICAgICBmb3IgKGkgPSBsaXN0ZW5lcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuZnVuY3Rpb24gX2xpc3RlbmVycyh0YXJnZXQsIHR5cGUsIHVud3JhcCkge1xuICB2YXIgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG5cbiAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBbXTtcblxuICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcbiAgaWYgKGV2bGlzdGVuZXIgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gW107XG5cbiAgaWYgKHR5cGVvZiBldmxpc3RlbmVyID09PSAnZnVuY3Rpb24nKVxuICAgIHJldHVybiB1bndyYXAgPyBbZXZsaXN0ZW5lci5saXN0ZW5lciB8fCBldmxpc3RlbmVyXSA6IFtldmxpc3RlbmVyXTtcblxuICByZXR1cm4gdW53cmFwID9cbiAgICB1bndyYXBMaXN0ZW5lcnMoZXZsaXN0ZW5lcikgOiBhcnJheUNsb25lKGV2bGlzdGVuZXIsIGV2bGlzdGVuZXIubGVuZ3RoKTtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCB0cnVlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmF3TGlzdGVuZXJzID0gZnVuY3Rpb24gcmF3TGlzdGVuZXJzKHR5cGUpIHtcbiAgcmV0dXJuIF9saXN0ZW5lcnModGhpcywgdHlwZSwgZmFsc2UpO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5saXN0ZW5lckNvdW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbGlzdGVuZXJDb3VudC5jYWxsKGVtaXR0ZXIsIHR5cGUpO1xuICB9XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBsaXN0ZW5lckNvdW50O1xuZnVuY3Rpb24gbGlzdGVuZXJDb3VudCh0eXBlKSB7XG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHM7XG5cbiAgaWYgKGV2ZW50cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG5cbiAgICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSBpZiAoZXZsaXN0ZW5lciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIDA7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXZlbnROYW1lcyA9IGZ1bmN0aW9uIGV2ZW50TmFtZXMoKSB7XG4gIHJldHVybiB0aGlzLl9ldmVudHNDb3VudCA+IDAgPyBSZWZsZWN0T3duS2V5cyh0aGlzLl9ldmVudHMpIDogW107XG59O1xuXG5mdW5jdGlvbiBhcnJheUNsb25lKGFyciwgbikge1xuICB2YXIgY29weSA9IG5ldyBBcnJheShuKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpXG4gICAgY29weVtpXSA9IGFycltpXTtcbiAgcmV0dXJuIGNvcHk7XG59XG5cbmZ1bmN0aW9uIHNwbGljZU9uZShsaXN0LCBpbmRleCkge1xuICBmb3IgKDsgaW5kZXggKyAxIDwgbGlzdC5sZW5ndGg7IGluZGV4KyspXG4gICAgbGlzdFtpbmRleF0gPSBsaXN0W2luZGV4ICsgMV07XG4gIGxpc3QucG9wKCk7XG59XG5cbmZ1bmN0aW9uIHVud3JhcExpc3RlbmVycyhhcnIpIHtcbiAgdmFyIHJldCA9IG5ldyBBcnJheShhcnIubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXQubGVuZ3RoOyArK2kpIHtcbiAgICByZXRbaV0gPSBhcnJbaV0ubGlzdGVuZXIgfHwgYXJyW2ldO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIG9uY2UoZW1pdHRlciwgbmFtZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGZ1bmN0aW9uIGVycm9yTGlzdGVuZXIoZXJyKSB7XG4gICAgICBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKG5hbWUsIHJlc29sdmVyKTtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc29sdmVyKCkge1xuICAgICAgaWYgKHR5cGVvZiBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgZXJyb3JMaXN0ZW5lcik7XG4gICAgICB9XG4gICAgICByZXNvbHZlKFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgfTtcblxuICAgIGV2ZW50VGFyZ2V0QWdub3N0aWNBZGRMaXN0ZW5lcihlbWl0dGVyLCBuYW1lLCByZXNvbHZlciwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIGlmIChuYW1lICE9PSAnZXJyb3InKSB7XG4gICAgICBhZGRFcnJvckhhbmRsZXJJZkV2ZW50RW1pdHRlcihlbWl0dGVyLCBlcnJvckxpc3RlbmVyLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkRXJyb3JIYW5kbGVySWZFdmVudEVtaXR0ZXIoZW1pdHRlciwgaGFuZGxlciwgZmxhZ3MpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZXZlbnRUYXJnZXRBZ25vc3RpY0FkZExpc3RlbmVyKGVtaXR0ZXIsICdlcnJvcicsIGhhbmRsZXIsIGZsYWdzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBldmVudFRhcmdldEFnbm9zdGljQWRkTGlzdGVuZXIoZW1pdHRlciwgbmFtZSwgbGlzdGVuZXIsIGZsYWdzKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5vbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmIChmbGFncy5vbmNlKSB7XG4gICAgICBlbWl0dGVyLm9uY2UobmFtZSwgbGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbWl0dGVyLm9uKG5hbWUsIGxpc3RlbmVyKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIGVtaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIEV2ZW50VGFyZ2V0IGRvZXMgbm90IGhhdmUgYGVycm9yYCBldmVudCBzZW1hbnRpY3MgbGlrZSBOb2RlXG4gICAgLy8gRXZlbnRFbWl0dGVycywgd2UgZG8gbm90IGxpc3RlbiBmb3IgYGVycm9yYCBldmVudHMgaGVyZS5cbiAgICBlbWl0dGVyLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZnVuY3Rpb24gd3JhcExpc3RlbmVyKGFyZykge1xuICAgICAgLy8gSUUgZG9lcyBub3QgaGF2ZSBidWlsdGluIGB7IG9uY2U6IHRydWUgfWAgc3VwcG9ydCBzbyB3ZVxuICAgICAgLy8gaGF2ZSB0byBkbyBpdCBtYW51YWxseS5cbiAgICAgIGlmIChmbGFncy5vbmNlKSB7XG4gICAgICAgIGVtaXR0ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCB3cmFwTGlzdGVuZXIpO1xuICAgICAgfVxuICAgICAgbGlzdGVuZXIoYXJnKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgXCJlbWl0dGVyXCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIEV2ZW50RW1pdHRlci4gUmVjZWl2ZWQgdHlwZSAnICsgdHlwZW9mIGVtaXR0ZXIpO1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlYWxwYXRoXG5yZWFscGF0aC5yZWFscGF0aCA9IHJlYWxwYXRoXG5yZWFscGF0aC5zeW5jID0gcmVhbHBhdGhTeW5jXG5yZWFscGF0aC5yZWFscGF0aFN5bmMgPSByZWFscGF0aFN5bmNcbnJlYWxwYXRoLm1vbmtleXBhdGNoID0gbW9ua2V5cGF0Y2hcbnJlYWxwYXRoLnVubW9ua2V5cGF0Y2ggPSB1bm1vbmtleXBhdGNoXG5cbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJylcbnZhciBvcmlnUmVhbHBhdGggPSBmcy5yZWFscGF0aFxudmFyIG9yaWdSZWFscGF0aFN5bmMgPSBmcy5yZWFscGF0aFN5bmNcblxudmFyIHZlcnNpb24gPSBwcm9jZXNzLnZlcnNpb25cbnZhciBvayA9IC9edlswLTVdXFwuLy50ZXN0KHZlcnNpb24pXG52YXIgb2xkID0gcmVxdWlyZSgnLi9vbGQuanMnKVxuXG5mdW5jdGlvbiBuZXdFcnJvciAoZXIpIHtcbiAgcmV0dXJuIGVyICYmIGVyLnN5c2NhbGwgPT09ICdyZWFscGF0aCcgJiYgKFxuICAgIGVyLmNvZGUgPT09ICdFTE9PUCcgfHxcbiAgICBlci5jb2RlID09PSAnRU5PTUVNJyB8fFxuICAgIGVyLmNvZGUgPT09ICdFTkFNRVRPT0xPTkcnXG4gIClcbn1cblxuZnVuY3Rpb24gcmVhbHBhdGggKHAsIGNhY2hlLCBjYikge1xuICBpZiAob2spIHtcbiAgICByZXR1cm4gb3JpZ1JlYWxwYXRoKHAsIGNhY2hlLCBjYilcbiAgfVxuXG4gIGlmICh0eXBlb2YgY2FjaGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYiA9IGNhY2hlXG4gICAgY2FjaGUgPSBudWxsXG4gIH1cbiAgb3JpZ1JlYWxwYXRoKHAsIGNhY2hlLCBmdW5jdGlvbiAoZXIsIHJlc3VsdCkge1xuICAgIGlmIChuZXdFcnJvcihlcikpIHtcbiAgICAgIG9sZC5yZWFscGF0aChwLCBjYWNoZSwgY2IpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNiKGVyLCByZXN1bHQpXG4gICAgfVxuICB9KVxufVxuXG5mdW5jdGlvbiByZWFscGF0aFN5bmMgKHAsIGNhY2hlKSB7XG4gIGlmIChvaykge1xuICAgIHJldHVybiBvcmlnUmVhbHBhdGhTeW5jKHAsIGNhY2hlKVxuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gb3JpZ1JlYWxwYXRoU3luYyhwLCBjYWNoZSlcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICBpZiAobmV3RXJyb3IoZXIpKSB7XG4gICAgICByZXR1cm4gb2xkLnJlYWxwYXRoU3luYyhwLCBjYWNoZSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgZXJcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbW9ua2V5cGF0Y2ggKCkge1xuICBmcy5yZWFscGF0aCA9IHJlYWxwYXRoXG4gIGZzLnJlYWxwYXRoU3luYyA9IHJlYWxwYXRoU3luY1xufVxuXG5mdW5jdGlvbiB1bm1vbmtleXBhdGNoICgpIHtcbiAgZnMucmVhbHBhdGggPSBvcmlnUmVhbHBhdGhcbiAgZnMucmVhbHBhdGhTeW5jID0gb3JpZ1JlYWxwYXRoU3luY1xufVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBwYXRoTW9kdWxlID0gcmVxdWlyZSgncGF0aCcpO1xudmFyIGlzV2luZG93cyA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMic7XG52YXIgZnMgPSByZXF1aXJlKCdmcycpO1xuXG4vLyBKYXZhU2NyaXB0IGltcGxlbWVudGF0aW9uIG9mIHJlYWxwYXRoLCBwb3J0ZWQgZnJvbSBub2RlIHByZS12NlxuXG52YXIgREVCVUcgPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHICYmIC9mcy8udGVzdChwcm9jZXNzLmVudi5OT0RFX0RFQlVHKTtcblxuZnVuY3Rpb24gcmV0aHJvdygpIHtcbiAgLy8gT25seSBlbmFibGUgaW4gZGVidWcgbW9kZS4gQSBiYWNrdHJhY2UgdXNlcyB+MTAwMCBieXRlcyBvZiBoZWFwIHNwYWNlIGFuZFxuICAvLyBpcyBmYWlybHkgc2xvdyB0byBnZW5lcmF0ZS5cbiAgdmFyIGNhbGxiYWNrO1xuICBpZiAoREVCVUcpIHtcbiAgICB2YXIgYmFja3RyYWNlID0gbmV3IEVycm9yO1xuICAgIGNhbGxiYWNrID0gZGVidWdDYWxsYmFjaztcbiAgfSBlbHNlXG4gICAgY2FsbGJhY2sgPSBtaXNzaW5nQ2FsbGJhY2s7XG5cbiAgcmV0dXJuIGNhbGxiYWNrO1xuXG4gIGZ1bmN0aW9uIGRlYnVnQ2FsbGJhY2soZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgYmFja3RyYWNlLm1lc3NhZ2UgPSBlcnIubWVzc2FnZTtcbiAgICAgIGVyciA9IGJhY2t0cmFjZTtcbiAgICAgIG1pc3NpbmdDYWxsYmFjayhlcnIpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1pc3NpbmdDYWxsYmFjayhlcnIpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKVxuICAgICAgICB0aHJvdyBlcnI7ICAvLyBGb3Jnb3QgYSBjYWxsYmFjayBidXQgZG9uJ3Qga25vdyB3aGVyZT8gVXNlIE5PREVfREVCVUc9ZnNcbiAgICAgIGVsc2UgaWYgKCFwcm9jZXNzLm5vRGVwcmVjYXRpb24pIHtcbiAgICAgICAgdmFyIG1zZyA9ICdmczogbWlzc2luZyBjYWxsYmFjayAnICsgKGVyci5zdGFjayB8fCBlcnIubWVzc2FnZSk7XG4gICAgICAgIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pXG4gICAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBtYXliZUNhbGxiYWNrKGNiKSB7XG4gIHJldHVybiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicgPyBjYiA6IHJldGhyb3coKTtcbn1cblxudmFyIG5vcm1hbGl6ZSA9IHBhdGhNb2R1bGUubm9ybWFsaXplO1xuXG4vLyBSZWdleHAgdGhhdCBmaW5kcyB0aGUgbmV4dCBwYXJ0aW9uIG9mIGEgKHBhcnRpYWwpIHBhdGhcbi8vIHJlc3VsdCBpcyBbYmFzZV93aXRoX3NsYXNoLCBiYXNlXSwgZS5nLiBbJ3NvbWVkaXIvJywgJ3NvbWVkaXInXVxuaWYgKGlzV2luZG93cykge1xuICB2YXIgbmV4dFBhcnRSZSA9IC8oLio/KSg/OltcXC9cXFxcXSt8JCkvZztcbn0gZWxzZSB7XG4gIHZhciBuZXh0UGFydFJlID0gLyguKj8pKD86W1xcL10rfCQpL2c7XG59XG5cbi8vIFJlZ2V4IHRvIGZpbmQgdGhlIGRldmljZSByb290LCBpbmNsdWRpbmcgdHJhaWxpbmcgc2xhc2guIEUuZy4gJ2M6XFxcXCcuXG5pZiAoaXNXaW5kb3dzKSB7XG4gIHZhciBzcGxpdFJvb3RSZSA9IC9eKD86W2EtekEtWl06fFtcXFxcXFwvXXsyfVteXFxcXFxcL10rW1xcXFxcXC9dW15cXFxcXFwvXSspP1tcXFxcXFwvXSovO1xufSBlbHNlIHtcbiAgdmFyIHNwbGl0Um9vdFJlID0gL15bXFwvXSovO1xufVxuXG5leHBvcnRzLnJlYWxwYXRoU3luYyA9IGZ1bmN0aW9uIHJlYWxwYXRoU3luYyhwLCBjYWNoZSkge1xuICAvLyBtYWtlIHAgaXMgYWJzb2x1dGVcbiAgcCA9IHBhdGhNb2R1bGUucmVzb2x2ZShwKTtcblxuICBpZiAoY2FjaGUgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNhY2hlLCBwKSkge1xuICAgIHJldHVybiBjYWNoZVtwXTtcbiAgfVxuXG4gIHZhciBvcmlnaW5hbCA9IHAsXG4gICAgICBzZWVuTGlua3MgPSB7fSxcbiAgICAgIGtub3duSGFyZCA9IHt9O1xuXG4gIC8vIGN1cnJlbnQgY2hhcmFjdGVyIHBvc2l0aW9uIGluIHBcbiAgdmFyIHBvcztcbiAgLy8gdGhlIHBhcnRpYWwgcGF0aCBzbyBmYXIsIGluY2x1ZGluZyBhIHRyYWlsaW5nIHNsYXNoIGlmIGFueVxuICB2YXIgY3VycmVudDtcbiAgLy8gdGhlIHBhcnRpYWwgcGF0aCB3aXRob3V0IGEgdHJhaWxpbmcgc2xhc2ggKGV4Y2VwdCB3aGVuIHBvaW50aW5nIGF0IGEgcm9vdClcbiAgdmFyIGJhc2U7XG4gIC8vIHRoZSBwYXJ0aWFsIHBhdGggc2Nhbm5lZCBpbiB0aGUgcHJldmlvdXMgcm91bmQsIHdpdGggc2xhc2hcbiAgdmFyIHByZXZpb3VzO1xuXG4gIHN0YXJ0KCk7XG5cbiAgZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgLy8gU2tpcCBvdmVyIHJvb3RzXG4gICAgdmFyIG0gPSBzcGxpdFJvb3RSZS5leGVjKHApO1xuICAgIHBvcyA9IG1bMF0ubGVuZ3RoO1xuICAgIGN1cnJlbnQgPSBtWzBdO1xuICAgIGJhc2UgPSBtWzBdO1xuICAgIHByZXZpb3VzID0gJyc7XG5cbiAgICAvLyBPbiB3aW5kb3dzLCBjaGVjayB0aGF0IHRoZSByb290IGV4aXN0cy4gT24gdW5peCB0aGVyZSBpcyBubyBuZWVkLlxuICAgIGlmIChpc1dpbmRvd3MgJiYgIWtub3duSGFyZFtiYXNlXSkge1xuICAgICAgZnMubHN0YXRTeW5jKGJhc2UpO1xuICAgICAga25vd25IYXJkW2Jhc2VdID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvLyB3YWxrIGRvd24gdGhlIHBhdGgsIHN3YXBwaW5nIG91dCBsaW5rZWQgcGF0aHBhcnRzIGZvciB0aGVpciByZWFsXG4gIC8vIHZhbHVlc1xuICAvLyBOQjogcC5sZW5ndGggY2hhbmdlcy5cbiAgd2hpbGUgKHBvcyA8IHAubGVuZ3RoKSB7XG4gICAgLy8gZmluZCB0aGUgbmV4dCBwYXJ0XG4gICAgbmV4dFBhcnRSZS5sYXN0SW5kZXggPSBwb3M7XG4gICAgdmFyIHJlc3VsdCA9IG5leHRQYXJ0UmUuZXhlYyhwKTtcbiAgICBwcmV2aW91cyA9IGN1cnJlbnQ7XG4gICAgY3VycmVudCArPSByZXN1bHRbMF07XG4gICAgYmFzZSA9IHByZXZpb3VzICsgcmVzdWx0WzFdO1xuICAgIHBvcyA9IG5leHRQYXJ0UmUubGFzdEluZGV4O1xuXG4gICAgLy8gY29udGludWUgaWYgbm90IGEgc3ltbGlua1xuICAgIGlmIChrbm93bkhhcmRbYmFzZV0gfHwgKGNhY2hlICYmIGNhY2hlW2Jhc2VdID09PSBiYXNlKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgdmFyIHJlc29sdmVkTGluaztcbiAgICBpZiAoY2FjaGUgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNhY2hlLCBiYXNlKSkge1xuICAgICAgLy8gc29tZSBrbm93biBzeW1ib2xpYyBsaW5rLiAgbm8gbmVlZCB0byBzdGF0IGFnYWluLlxuICAgICAgcmVzb2x2ZWRMaW5rID0gY2FjaGVbYmFzZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBzdGF0ID0gZnMubHN0YXRTeW5jKGJhc2UpO1xuICAgICAgaWYgKCFzdGF0LmlzU3ltYm9saWNMaW5rKCkpIHtcbiAgICAgICAga25vd25IYXJkW2Jhc2VdID0gdHJ1ZTtcbiAgICAgICAgaWYgKGNhY2hlKSBjYWNoZVtiYXNlXSA9IGJhc2U7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyByZWFkIHRoZSBsaW5rIGlmIGl0IHdhc24ndCByZWFkIGJlZm9yZVxuICAgICAgLy8gZGV2L2lubyBhbHdheXMgcmV0dXJuIDAgb24gd2luZG93cywgc28gc2tpcCB0aGUgY2hlY2suXG4gICAgICB2YXIgbGlua1RhcmdldCA9IG51bGw7XG4gICAgICBpZiAoIWlzV2luZG93cykge1xuICAgICAgICB2YXIgaWQgPSBzdGF0LmRldi50b1N0cmluZygzMikgKyAnOicgKyBzdGF0Lmluby50b1N0cmluZygzMik7XG4gICAgICAgIGlmIChzZWVuTGlua3MuaGFzT3duUHJvcGVydHkoaWQpKSB7XG4gICAgICAgICAgbGlua1RhcmdldCA9IHNlZW5MaW5rc1tpZF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChsaW5rVGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICAgIGZzLnN0YXRTeW5jKGJhc2UpO1xuICAgICAgICBsaW5rVGFyZ2V0ID0gZnMucmVhZGxpbmtTeW5jKGJhc2UpO1xuICAgICAgfVxuICAgICAgcmVzb2x2ZWRMaW5rID0gcGF0aE1vZHVsZS5yZXNvbHZlKHByZXZpb3VzLCBsaW5rVGFyZ2V0KTtcbiAgICAgIC8vIHRyYWNrIHRoaXMsIGlmIGdpdmVuIGEgY2FjaGUuXG4gICAgICBpZiAoY2FjaGUpIGNhY2hlW2Jhc2VdID0gcmVzb2x2ZWRMaW5rO1xuICAgICAgaWYgKCFpc1dpbmRvd3MpIHNlZW5MaW5rc1tpZF0gPSBsaW5rVGFyZ2V0O1xuICAgIH1cblxuICAgIC8vIHJlc29sdmUgdGhlIGxpbmssIHRoZW4gc3RhcnQgb3ZlclxuICAgIHAgPSBwYXRoTW9kdWxlLnJlc29sdmUocmVzb2x2ZWRMaW5rLCBwLnNsaWNlKHBvcykpO1xuICAgIHN0YXJ0KCk7XG4gIH1cblxuICBpZiAoY2FjaGUpIGNhY2hlW29yaWdpbmFsXSA9IHA7XG5cbiAgcmV0dXJuIHA7XG59O1xuXG5cbmV4cG9ydHMucmVhbHBhdGggPSBmdW5jdGlvbiByZWFscGF0aChwLCBjYWNoZSwgY2IpIHtcbiAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiID0gbWF5YmVDYWxsYmFjayhjYWNoZSk7XG4gICAgY2FjaGUgPSBudWxsO1xuICB9XG5cbiAgLy8gbWFrZSBwIGlzIGFic29sdXRlXG4gIHAgPSBwYXRoTW9kdWxlLnJlc29sdmUocCk7XG5cbiAgaWYgKGNhY2hlICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjYWNoZSwgcCkpIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhjYi5iaW5kKG51bGwsIG51bGwsIGNhY2hlW3BdKSk7XG4gIH1cblxuICB2YXIgb3JpZ2luYWwgPSBwLFxuICAgICAgc2VlbkxpbmtzID0ge30sXG4gICAgICBrbm93bkhhcmQgPSB7fTtcblxuICAvLyBjdXJyZW50IGNoYXJhY3RlciBwb3NpdGlvbiBpbiBwXG4gIHZhciBwb3M7XG4gIC8vIHRoZSBwYXJ0aWFsIHBhdGggc28gZmFyLCBpbmNsdWRpbmcgYSB0cmFpbGluZyBzbGFzaCBpZiBhbnlcbiAgdmFyIGN1cnJlbnQ7XG4gIC8vIHRoZSBwYXJ0aWFsIHBhdGggd2l0aG91dCBhIHRyYWlsaW5nIHNsYXNoIChleGNlcHQgd2hlbiBwb2ludGluZyBhdCBhIHJvb3QpXG4gIHZhciBiYXNlO1xuICAvLyB0aGUgcGFydGlhbCBwYXRoIHNjYW5uZWQgaW4gdGhlIHByZXZpb3VzIHJvdW5kLCB3aXRoIHNsYXNoXG4gIHZhciBwcmV2aW91cztcblxuICBzdGFydCgpO1xuXG4gIGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgIC8vIFNraXAgb3ZlciByb290c1xuICAgIHZhciBtID0gc3BsaXRSb290UmUuZXhlYyhwKTtcbiAgICBwb3MgPSBtWzBdLmxlbmd0aDtcbiAgICBjdXJyZW50ID0gbVswXTtcbiAgICBiYXNlID0gbVswXTtcbiAgICBwcmV2aW91cyA9ICcnO1xuXG4gICAgLy8gT24gd2luZG93cywgY2hlY2sgdGhhdCB0aGUgcm9vdCBleGlzdHMuIE9uIHVuaXggdGhlcmUgaXMgbm8gbmVlZC5cbiAgICBpZiAoaXNXaW5kb3dzICYmICFrbm93bkhhcmRbYmFzZV0pIHtcbiAgICAgIGZzLmxzdGF0KGJhc2UsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBpZiAoZXJyKSByZXR1cm4gY2IoZXJyKTtcbiAgICAgICAga25vd25IYXJkW2Jhc2VdID0gdHJ1ZTtcbiAgICAgICAgTE9PUCgpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soTE9PUCk7XG4gICAgfVxuICB9XG5cbiAgLy8gd2FsayBkb3duIHRoZSBwYXRoLCBzd2FwcGluZyBvdXQgbGlua2VkIHBhdGhwYXJ0cyBmb3IgdGhlaXIgcmVhbFxuICAvLyB2YWx1ZXNcbiAgZnVuY3Rpb24gTE9PUCgpIHtcbiAgICAvLyBzdG9wIGlmIHNjYW5uZWQgcGFzdCBlbmQgb2YgcGF0aFxuICAgIGlmIChwb3MgPj0gcC5sZW5ndGgpIHtcbiAgICAgIGlmIChjYWNoZSkgY2FjaGVbb3JpZ2luYWxdID0gcDtcbiAgICAgIHJldHVybiBjYihudWxsLCBwKTtcbiAgICB9XG5cbiAgICAvLyBmaW5kIHRoZSBuZXh0IHBhcnRcbiAgICBuZXh0UGFydFJlLmxhc3RJbmRleCA9IHBvcztcbiAgICB2YXIgcmVzdWx0ID0gbmV4dFBhcnRSZS5leGVjKHApO1xuICAgIHByZXZpb3VzID0gY3VycmVudDtcbiAgICBjdXJyZW50ICs9IHJlc3VsdFswXTtcbiAgICBiYXNlID0gcHJldmlvdXMgKyByZXN1bHRbMV07XG4gICAgcG9zID0gbmV4dFBhcnRSZS5sYXN0SW5kZXg7XG5cbiAgICAvLyBjb250aW51ZSBpZiBub3QgYSBzeW1saW5rXG4gICAgaWYgKGtub3duSGFyZFtiYXNlXSB8fCAoY2FjaGUgJiYgY2FjaGVbYmFzZV0gPT09IGJhc2UpKSB7XG4gICAgICByZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhMT09QKTtcbiAgICB9XG5cbiAgICBpZiAoY2FjaGUgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNhY2hlLCBiYXNlKSkge1xuICAgICAgLy8ga25vd24gc3ltYm9saWMgbGluay4gIG5vIG5lZWQgdG8gc3RhdCBhZ2Fpbi5cbiAgICAgIHJldHVybiBnb3RSZXNvbHZlZExpbmsoY2FjaGVbYmFzZV0pO1xuICAgIH1cblxuICAgIHJldHVybiBmcy5sc3RhdChiYXNlLCBnb3RTdGF0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdvdFN0YXQoZXJyLCBzdGF0KSB7XG4gICAgaWYgKGVycikgcmV0dXJuIGNiKGVycik7XG5cbiAgICAvLyBpZiBub3QgYSBzeW1saW5rLCBza2lwIHRvIHRoZSBuZXh0IHBhdGggcGFydFxuICAgIGlmICghc3RhdC5pc1N5bWJvbGljTGluaygpKSB7XG4gICAgICBrbm93bkhhcmRbYmFzZV0gPSB0cnVlO1xuICAgICAgaWYgKGNhY2hlKSBjYWNoZVtiYXNlXSA9IGJhc2U7XG4gICAgICByZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhMT09QKTtcbiAgICB9XG5cbiAgICAvLyBzdGF0ICYgcmVhZCB0aGUgbGluayBpZiBub3QgcmVhZCBiZWZvcmVcbiAgICAvLyBjYWxsIGdvdFRhcmdldCBhcyBzb29uIGFzIHRoZSBsaW5rIHRhcmdldCBpcyBrbm93blxuICAgIC8vIGRldi9pbm8gYWx3YXlzIHJldHVybiAwIG9uIHdpbmRvd3MsIHNvIHNraXAgdGhlIGNoZWNrLlxuICAgIGlmICghaXNXaW5kb3dzKSB7XG4gICAgICB2YXIgaWQgPSBzdGF0LmRldi50b1N0cmluZygzMikgKyAnOicgKyBzdGF0Lmluby50b1N0cmluZygzMik7XG4gICAgICBpZiAoc2VlbkxpbmtzLmhhc093blByb3BlcnR5KGlkKSkge1xuICAgICAgICByZXR1cm4gZ290VGFyZ2V0KG51bGwsIHNlZW5MaW5rc1tpZF0sIGJhc2UpO1xuICAgICAgfVxuICAgIH1cbiAgICBmcy5zdGF0KGJhc2UsIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikgcmV0dXJuIGNiKGVycik7XG5cbiAgICAgIGZzLnJlYWRsaW5rKGJhc2UsIGZ1bmN0aW9uKGVyciwgdGFyZ2V0KSB7XG4gICAgICAgIGlmICghaXNXaW5kb3dzKSBzZWVuTGlua3NbaWRdID0gdGFyZ2V0O1xuICAgICAgICBnb3RUYXJnZXQoZXJyLCB0YXJnZXQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnb3RUYXJnZXQoZXJyLCB0YXJnZXQsIGJhc2UpIHtcbiAgICBpZiAoZXJyKSByZXR1cm4gY2IoZXJyKTtcblxuICAgIHZhciByZXNvbHZlZExpbmsgPSBwYXRoTW9kdWxlLnJlc29sdmUocHJldmlvdXMsIHRhcmdldCk7XG4gICAgaWYgKGNhY2hlKSBjYWNoZVtiYXNlXSA9IHJlc29sdmVkTGluaztcbiAgICBnb3RSZXNvbHZlZExpbmsocmVzb2x2ZWRMaW5rKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdvdFJlc29sdmVkTGluayhyZXNvbHZlZExpbmspIHtcbiAgICAvLyByZXNvbHZlIHRoZSBsaW5rLCB0aGVuIHN0YXJ0IG92ZXJcbiAgICBwID0gcGF0aE1vZHVsZS5yZXNvbHZlKHJlc29sdmVkTGluaywgcC5zbGljZShwb3MpKTtcbiAgICBzdGFydCgpO1xuICB9XG59O1xuIiwiZXhwb3J0cy5zZXRvcHRzID0gc2V0b3B0c1xuZXhwb3J0cy5vd25Qcm9wID0gb3duUHJvcFxuZXhwb3J0cy5tYWtlQWJzID0gbWFrZUFic1xuZXhwb3J0cy5maW5pc2ggPSBmaW5pc2hcbmV4cG9ydHMubWFyayA9IG1hcmtcbmV4cG9ydHMuaXNJZ25vcmVkID0gaXNJZ25vcmVkXG5leHBvcnRzLmNoaWxkcmVuSWdub3JlZCA9IGNoaWxkcmVuSWdub3JlZFxuXG5mdW5jdGlvbiBvd25Qcm9wIChvYmosIGZpZWxkKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBmaWVsZClcbn1cblxudmFyIGZzID0gcmVxdWlyZShcImZzXCIpXG52YXIgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpXG52YXIgbWluaW1hdGNoID0gcmVxdWlyZShcIm1pbmltYXRjaFwiKVxudmFyIGlzQWJzb2x1dGUgPSByZXF1aXJlKFwicGF0aC1pcy1hYnNvbHV0ZVwiKVxudmFyIE1pbmltYXRjaCA9IG1pbmltYXRjaC5NaW5pbWF0Y2hcblxuZnVuY3Rpb24gYWxwaGFzb3J0IChhLCBiKSB7XG4gIHJldHVybiBhLmxvY2FsZUNvbXBhcmUoYiwgJ2VuJylcbn1cblxuZnVuY3Rpb24gc2V0dXBJZ25vcmVzIChzZWxmLCBvcHRpb25zKSB7XG4gIHNlbGYuaWdub3JlID0gb3B0aW9ucy5pZ25vcmUgfHwgW11cblxuICBpZiAoIUFycmF5LmlzQXJyYXkoc2VsZi5pZ25vcmUpKVxuICAgIHNlbGYuaWdub3JlID0gW3NlbGYuaWdub3JlXVxuXG4gIGlmIChzZWxmLmlnbm9yZS5sZW5ndGgpIHtcbiAgICBzZWxmLmlnbm9yZSA9IHNlbGYuaWdub3JlLm1hcChpZ25vcmVNYXApXG4gIH1cbn1cblxuLy8gaWdub3JlIHBhdHRlcm5zIGFyZSBhbHdheXMgaW4gZG90OnRydWUgbW9kZS5cbmZ1bmN0aW9uIGlnbm9yZU1hcCAocGF0dGVybikge1xuICB2YXIgZ21hdGNoZXIgPSBudWxsXG4gIGlmIChwYXR0ZXJuLnNsaWNlKC0zKSA9PT0gJy8qKicpIHtcbiAgICB2YXIgZ3BhdHRlcm4gPSBwYXR0ZXJuLnJlcGxhY2UoLyhcXC9cXCpcXCopKyQvLCAnJylcbiAgICBnbWF0Y2hlciA9IG5ldyBNaW5pbWF0Y2goZ3BhdHRlcm4sIHsgZG90OiB0cnVlIH0pXG4gIH1cblxuICByZXR1cm4ge1xuICAgIG1hdGNoZXI6IG5ldyBNaW5pbWF0Y2gocGF0dGVybiwgeyBkb3Q6IHRydWUgfSksXG4gICAgZ21hdGNoZXI6IGdtYXRjaGVyXG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0b3B0cyAoc2VsZiwgcGF0dGVybiwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMpXG4gICAgb3B0aW9ucyA9IHt9XG5cbiAgLy8gYmFzZS1tYXRjaGluZzoganVzdCB1c2UgZ2xvYnN0YXIgZm9yIHRoYXQuXG4gIGlmIChvcHRpb25zLm1hdGNoQmFzZSAmJiAtMSA9PT0gcGF0dGVybi5pbmRleE9mKFwiL1wiKSkge1xuICAgIGlmIChvcHRpb25zLm5vZ2xvYnN0YXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImJhc2UgbWF0Y2hpbmcgcmVxdWlyZXMgZ2xvYnN0YXJcIilcbiAgICB9XG4gICAgcGF0dGVybiA9IFwiKiovXCIgKyBwYXR0ZXJuXG4gIH1cblxuICBzZWxmLnNpbGVudCA9ICEhb3B0aW9ucy5zaWxlbnRcbiAgc2VsZi5wYXR0ZXJuID0gcGF0dGVyblxuICBzZWxmLnN0cmljdCA9IG9wdGlvbnMuc3RyaWN0ICE9PSBmYWxzZVxuICBzZWxmLnJlYWxwYXRoID0gISFvcHRpb25zLnJlYWxwYXRoXG4gIHNlbGYucmVhbHBhdGhDYWNoZSA9IG9wdGlvbnMucmVhbHBhdGhDYWNoZSB8fCBPYmplY3QuY3JlYXRlKG51bGwpXG4gIHNlbGYuZm9sbG93ID0gISFvcHRpb25zLmZvbGxvd1xuICBzZWxmLmRvdCA9ICEhb3B0aW9ucy5kb3RcbiAgc2VsZi5tYXJrID0gISFvcHRpb25zLm1hcmtcbiAgc2VsZi5ub2RpciA9ICEhb3B0aW9ucy5ub2RpclxuICBpZiAoc2VsZi5ub2RpcilcbiAgICBzZWxmLm1hcmsgPSB0cnVlXG4gIHNlbGYuc3luYyA9ICEhb3B0aW9ucy5zeW5jXG4gIHNlbGYubm91bmlxdWUgPSAhIW9wdGlvbnMubm91bmlxdWVcbiAgc2VsZi5ub251bGwgPSAhIW9wdGlvbnMubm9udWxsXG4gIHNlbGYubm9zb3J0ID0gISFvcHRpb25zLm5vc29ydFxuICBzZWxmLm5vY2FzZSA9ICEhb3B0aW9ucy5ub2Nhc2VcbiAgc2VsZi5zdGF0ID0gISFvcHRpb25zLnN0YXRcbiAgc2VsZi5ub3Byb2Nlc3MgPSAhIW9wdGlvbnMubm9wcm9jZXNzXG4gIHNlbGYuYWJzb2x1dGUgPSAhIW9wdGlvbnMuYWJzb2x1dGVcbiAgc2VsZi5mcyA9IG9wdGlvbnMuZnMgfHwgZnNcblxuICBzZWxmLm1heExlbmd0aCA9IG9wdGlvbnMubWF4TGVuZ3RoIHx8IEluZmluaXR5XG4gIHNlbGYuY2FjaGUgPSBvcHRpb25zLmNhY2hlIHx8IE9iamVjdC5jcmVhdGUobnVsbClcbiAgc2VsZi5zdGF0Q2FjaGUgPSBvcHRpb25zLnN0YXRDYWNoZSB8fCBPYmplY3QuY3JlYXRlKG51bGwpXG4gIHNlbGYuc3ltbGlua3MgPSBvcHRpb25zLnN5bWxpbmtzIHx8IE9iamVjdC5jcmVhdGUobnVsbClcblxuICBzZXR1cElnbm9yZXMoc2VsZiwgb3B0aW9ucylcblxuICBzZWxmLmNoYW5nZWRDd2QgPSBmYWxzZVxuICB2YXIgY3dkID0gcHJvY2Vzcy5jd2QoKVxuICBpZiAoIW93blByb3Aob3B0aW9ucywgXCJjd2RcIikpXG4gICAgc2VsZi5jd2QgPSBjd2RcbiAgZWxzZSB7XG4gICAgc2VsZi5jd2QgPSBwYXRoLnJlc29sdmUob3B0aW9ucy5jd2QpXG4gICAgc2VsZi5jaGFuZ2VkQ3dkID0gc2VsZi5jd2QgIT09IGN3ZFxuICB9XG5cbiAgc2VsZi5yb290ID0gb3B0aW9ucy5yb290IHx8IHBhdGgucmVzb2x2ZShzZWxmLmN3ZCwgXCIvXCIpXG4gIHNlbGYucm9vdCA9IHBhdGgucmVzb2x2ZShzZWxmLnJvb3QpXG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSBcIndpbjMyXCIpXG4gICAgc2VsZi5yb290ID0gc2VsZi5yb290LnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpXG5cbiAgLy8gVE9ETzogaXMgYW4gYWJzb2x1dGUgYGN3ZGAgc3VwcG9zZWQgdG8gYmUgcmVzb2x2ZWQgYWdhaW5zdCBgcm9vdGA/XG4gIC8vIGUuZy4geyBjd2Q6ICcvdGVzdCcsIHJvb3Q6IF9fZGlybmFtZSB9ID09PSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnL3Rlc3QnKVxuICBzZWxmLmN3ZEFicyA9IGlzQWJzb2x1dGUoc2VsZi5jd2QpID8gc2VsZi5jd2QgOiBtYWtlQWJzKHNlbGYsIHNlbGYuY3dkKVxuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiKVxuICAgIHNlbGYuY3dkQWJzID0gc2VsZi5jd2RBYnMucmVwbGFjZSgvXFxcXC9nLCBcIi9cIilcbiAgc2VsZi5ub21vdW50ID0gISFvcHRpb25zLm5vbW91bnRcblxuICAvLyBkaXNhYmxlIGNvbW1lbnRzIGFuZCBuZWdhdGlvbiBpbiBNaW5pbWF0Y2guXG4gIC8vIE5vdGUgdGhhdCB0aGV5IGFyZSBub3Qgc3VwcG9ydGVkIGluIEdsb2IgaXRzZWxmIGFueXdheS5cbiAgb3B0aW9ucy5ub25lZ2F0ZSA9IHRydWVcbiAgb3B0aW9ucy5ub2NvbW1lbnQgPSB0cnVlXG4gIC8vIGFsd2F5cyB0cmVhdCBcXCBpbiBwYXR0ZXJucyBhcyBlc2NhcGVzLCBub3QgcGF0aCBzZXBhcmF0b3JzXG4gIG9wdGlvbnMuYWxsb3dXaW5kb3dzRXNjYXBlID0gZmFsc2VcblxuICBzZWxmLm1pbmltYXRjaCA9IG5ldyBNaW5pbWF0Y2gocGF0dGVybiwgb3B0aW9ucylcbiAgc2VsZi5vcHRpb25zID0gc2VsZi5taW5pbWF0Y2gub3B0aW9uc1xufVxuXG5mdW5jdGlvbiBmaW5pc2ggKHNlbGYpIHtcbiAgdmFyIG5vdSA9IHNlbGYubm91bmlxdWVcbiAgdmFyIGFsbCA9IG5vdSA/IFtdIDogT2JqZWN0LmNyZWF0ZShudWxsKVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gc2VsZi5tYXRjaGVzLmxlbmd0aDsgaSA8IGw7IGkgKyspIHtcbiAgICB2YXIgbWF0Y2hlcyA9IHNlbGYubWF0Y2hlc1tpXVxuICAgIGlmICghbWF0Y2hlcyB8fCBPYmplY3Qua2V5cyhtYXRjaGVzKS5sZW5ndGggPT09IDApIHtcbiAgICAgIGlmIChzZWxmLm5vbnVsbCkge1xuICAgICAgICAvLyBkbyBsaWtlIHRoZSBzaGVsbCwgYW5kIHNwaXQgb3V0IHRoZSBsaXRlcmFsIGdsb2JcbiAgICAgICAgdmFyIGxpdGVyYWwgPSBzZWxmLm1pbmltYXRjaC5nbG9iU2V0W2ldXG4gICAgICAgIGlmIChub3UpXG4gICAgICAgICAgYWxsLnB1c2gobGl0ZXJhbClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGFsbFtsaXRlcmFsXSA9IHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gaGFkIG1hdGNoZXNcbiAgICAgIHZhciBtID0gT2JqZWN0LmtleXMobWF0Y2hlcylcbiAgICAgIGlmIChub3UpXG4gICAgICAgIGFsbC5wdXNoLmFwcGx5KGFsbCwgbSlcbiAgICAgIGVsc2VcbiAgICAgICAgbS5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgYWxsW21dID0gdHJ1ZVxuICAgICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGlmICghbm91KVxuICAgIGFsbCA9IE9iamVjdC5rZXlzKGFsbClcblxuICBpZiAoIXNlbGYubm9zb3J0KVxuICAgIGFsbCA9IGFsbC5zb3J0KGFscGhhc29ydClcblxuICAvLyBhdCAqc29tZSogcG9pbnQgd2Ugc3RhdHRlZCBhbGwgb2YgdGhlc2VcbiAgaWYgKHNlbGYubWFyaykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhbGxbaV0gPSBzZWxmLl9tYXJrKGFsbFtpXSlcbiAgICB9XG4gICAgaWYgKHNlbGYubm9kaXIpIHtcbiAgICAgIGFsbCA9IGFsbC5maWx0ZXIoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIG5vdERpciA9ICEoL1xcLyQvLnRlc3QoZSkpXG4gICAgICAgIHZhciBjID0gc2VsZi5jYWNoZVtlXSB8fCBzZWxmLmNhY2hlW21ha2VBYnMoc2VsZiwgZSldXG4gICAgICAgIGlmIChub3REaXIgJiYgYylcbiAgICAgICAgICBub3REaXIgPSBjICE9PSAnRElSJyAmJiAhQXJyYXkuaXNBcnJheShjKVxuICAgICAgICByZXR1cm4gbm90RGlyXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGlmIChzZWxmLmlnbm9yZS5sZW5ndGgpXG4gICAgYWxsID0gYWxsLmZpbHRlcihmdW5jdGlvbihtKSB7XG4gICAgICByZXR1cm4gIWlzSWdub3JlZChzZWxmLCBtKVxuICAgIH0pXG5cbiAgc2VsZi5mb3VuZCA9IGFsbFxufVxuXG5mdW5jdGlvbiBtYXJrIChzZWxmLCBwKSB7XG4gIHZhciBhYnMgPSBtYWtlQWJzKHNlbGYsIHApXG4gIHZhciBjID0gc2VsZi5jYWNoZVthYnNdXG4gIHZhciBtID0gcFxuICBpZiAoYykge1xuICAgIHZhciBpc0RpciA9IGMgPT09ICdESVInIHx8IEFycmF5LmlzQXJyYXkoYylcbiAgICB2YXIgc2xhc2ggPSBwLnNsaWNlKC0xKSA9PT0gJy8nXG5cbiAgICBpZiAoaXNEaXIgJiYgIXNsYXNoKVxuICAgICAgbSArPSAnLydcbiAgICBlbHNlIGlmICghaXNEaXIgJiYgc2xhc2gpXG4gICAgICBtID0gbS5zbGljZSgwLCAtMSlcblxuICAgIGlmIChtICE9PSBwKSB7XG4gICAgICB2YXIgbWFicyA9IG1ha2VBYnMoc2VsZiwgbSlcbiAgICAgIHNlbGYuc3RhdENhY2hlW21hYnNdID0gc2VsZi5zdGF0Q2FjaGVbYWJzXVxuICAgICAgc2VsZi5jYWNoZVttYWJzXSA9IHNlbGYuY2FjaGVbYWJzXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtXG59XG5cbi8vIGxvdHRhIHNpdHVwcy4uLlxuZnVuY3Rpb24gbWFrZUFicyAoc2VsZiwgZikge1xuICB2YXIgYWJzID0gZlxuICBpZiAoZi5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgIGFicyA9IHBhdGguam9pbihzZWxmLnJvb3QsIGYpXG4gIH0gZWxzZSBpZiAoaXNBYnNvbHV0ZShmKSB8fCBmID09PSAnJykge1xuICAgIGFicyA9IGZcbiAgfSBlbHNlIGlmIChzZWxmLmNoYW5nZWRDd2QpIHtcbiAgICBhYnMgPSBwYXRoLnJlc29sdmUoc2VsZi5jd2QsIGYpXG4gIH0gZWxzZSB7XG4gICAgYWJzID0gcGF0aC5yZXNvbHZlKGYpXG4gIH1cblxuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJylcbiAgICBhYnMgPSBhYnMucmVwbGFjZSgvXFxcXC9nLCAnLycpXG5cbiAgcmV0dXJuIGFic1xufVxuXG5cbi8vIFJldHVybiB0cnVlLCBpZiBwYXR0ZXJuIGVuZHMgd2l0aCBnbG9ic3RhciAnKionLCBmb3IgdGhlIGFjY29tcGFueWluZyBwYXJlbnQgZGlyZWN0b3J5LlxuLy8gRXg6LSBJZiBub2RlX21vZHVsZXMvKiogaXMgdGhlIHBhdHRlcm4sIGFkZCAnbm9kZV9tb2R1bGVzJyB0byBpZ25vcmUgbGlzdCBhbG9uZyB3aXRoIGl0J3MgY29udGVudHNcbmZ1bmN0aW9uIGlzSWdub3JlZCAoc2VsZiwgcGF0aCkge1xuICBpZiAoIXNlbGYuaWdub3JlLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2VcblxuICByZXR1cm4gc2VsZi5pZ25vcmUuc29tZShmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0ubWF0Y2hlci5tYXRjaChwYXRoKSB8fCAhIShpdGVtLmdtYXRjaGVyICYmIGl0ZW0uZ21hdGNoZXIubWF0Y2gocGF0aCkpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGNoaWxkcmVuSWdub3JlZCAoc2VsZiwgcGF0aCkge1xuICBpZiAoIXNlbGYuaWdub3JlLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2VcblxuICByZXR1cm4gc2VsZi5pZ25vcmUuc29tZShmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuICEhKGl0ZW0uZ21hdGNoZXIgJiYgaXRlbS5nbWF0Y2hlci5tYXRjaChwYXRoKSlcbiAgfSlcbn1cbiIsIi8vIEFwcHJvYWNoOlxuLy9cbi8vIDEuIEdldCB0aGUgbWluaW1hdGNoIHNldFxuLy8gMi4gRm9yIGVhY2ggcGF0dGVybiBpbiB0aGUgc2V0LCBQUk9DRVNTKHBhdHRlcm4sIGZhbHNlKVxuLy8gMy4gU3RvcmUgbWF0Y2hlcyBwZXItc2V0LCB0aGVuIHVuaXEgdGhlbVxuLy9cbi8vIFBST0NFU1MocGF0dGVybiwgaW5HbG9iU3Rhcilcbi8vIEdldCB0aGUgZmlyc3QgW25dIGl0ZW1zIGZyb20gcGF0dGVybiB0aGF0IGFyZSBhbGwgc3RyaW5nc1xuLy8gSm9pbiB0aGVzZSB0b2dldGhlci4gIFRoaXMgaXMgUFJFRklYLlxuLy8gICBJZiB0aGVyZSBpcyBubyBtb3JlIHJlbWFpbmluZywgdGhlbiBzdGF0KFBSRUZJWCkgYW5kXG4vLyAgIGFkZCB0byBtYXRjaGVzIGlmIGl0IHN1Y2NlZWRzLiAgRU5ELlxuLy9cbi8vIElmIGluR2xvYlN0YXIgYW5kIFBSRUZJWCBpcyBzeW1saW5rIGFuZCBwb2ludHMgdG8gZGlyXG4vLyAgIHNldCBFTlRSSUVTID0gW11cbi8vIGVsc2UgcmVhZGRpcihQUkVGSVgpIGFzIEVOVFJJRVNcbi8vICAgSWYgZmFpbCwgRU5EXG4vL1xuLy8gd2l0aCBFTlRSSUVTXG4vLyAgIElmIHBhdHRlcm5bbl0gaXMgR0xPQlNUQVJcbi8vICAgICAvLyBoYW5kbGUgdGhlIGNhc2Ugd2hlcmUgdGhlIGdsb2JzdGFyIG1hdGNoIGlzIGVtcHR5XG4vLyAgICAgLy8gYnkgcHJ1bmluZyBpdCBvdXQsIGFuZCB0ZXN0aW5nIHRoZSByZXN1bHRpbmcgcGF0dGVyblxuLy8gICAgIFBST0NFU1MocGF0dGVyblswLi5uXSArIHBhdHRlcm5bbisxIC4uICRdLCBmYWxzZSlcbi8vICAgICAvLyBoYW5kbGUgb3RoZXIgY2FzZXMuXG4vLyAgICAgZm9yIEVOVFJZIGluIEVOVFJJRVMgKG5vdCBkb3RmaWxlcylcbi8vICAgICAgIC8vIGF0dGFjaCBnbG9ic3RhciArIHRhaWwgb250byB0aGUgZW50cnlcbi8vICAgICAgIC8vIE1hcmsgdGhhdCB0aGlzIGVudHJ5IGlzIGEgZ2xvYnN0YXIgbWF0Y2hcbi8vICAgICAgIFBST0NFU1MocGF0dGVyblswLi5uXSArIEVOVFJZICsgcGF0dGVybltuIC4uICRdLCB0cnVlKVxuLy9cbi8vICAgZWxzZSAvLyBub3QgZ2xvYnN0YXJcbi8vICAgICBmb3IgRU5UUlkgaW4gRU5UUklFUyAobm90IGRvdGZpbGVzLCB1bmxlc3MgcGF0dGVybltuXSBpcyBkb3QpXG4vLyAgICAgICBUZXN0IEVOVFJZIGFnYWluc3QgcGF0dGVybltuXVxuLy8gICAgICAgSWYgZmFpbHMsIGNvbnRpbnVlXG4vLyAgICAgICBJZiBwYXNzZXMsIFBST0NFU1MocGF0dGVyblswLi5uXSArIGl0ZW0gKyBwYXR0ZXJuW24rMSAuLiAkXSlcbi8vXG4vLyBDYXZlYXQ6XG4vLyAgIENhY2hlIGFsbCBzdGF0cyBhbmQgcmVhZGRpcnMgcmVzdWx0cyB0byBtaW5pbWl6ZSBzeXNjYWxsLiAgU2luY2UgYWxsXG4vLyAgIHdlIGV2ZXIgY2FyZSBhYm91dCBpcyBleGlzdGVuY2UgYW5kIGRpcmVjdG9yeS1uZXNzLCB3ZSBjYW4ganVzdCBrZWVwXG4vLyAgIGB0cnVlYCBmb3IgZmlsZXMsIGFuZCBbY2hpbGRyZW4sLi4uXSBmb3IgZGlyZWN0b3JpZXMsIG9yIGBmYWxzZWAgZm9yXG4vLyAgIHRoaW5ncyB0aGF0IGRvbid0IGV4aXN0LlxuXG5tb2R1bGUuZXhwb3J0cyA9IGdsb2JcblxudmFyIHJwID0gcmVxdWlyZSgnZnMucmVhbHBhdGgnKVxudmFyIG1pbmltYXRjaCA9IHJlcXVpcmUoJ21pbmltYXRjaCcpXG52YXIgTWluaW1hdGNoID0gbWluaW1hdGNoLk1pbmltYXRjaFxudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKVxudmFyIEVFID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyXG52YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxudmFyIGFzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpXG52YXIgaXNBYnNvbHV0ZSA9IHJlcXVpcmUoJ3BhdGgtaXMtYWJzb2x1dGUnKVxudmFyIGdsb2JTeW5jID0gcmVxdWlyZSgnLi9zeW5jLmpzJylcbnZhciBjb21tb24gPSByZXF1aXJlKCcuL2NvbW1vbi5qcycpXG52YXIgc2V0b3B0cyA9IGNvbW1vbi5zZXRvcHRzXG52YXIgb3duUHJvcCA9IGNvbW1vbi5vd25Qcm9wXG52YXIgaW5mbGlnaHQgPSByZXF1aXJlKCdpbmZsaWdodCcpXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKVxudmFyIGNoaWxkcmVuSWdub3JlZCA9IGNvbW1vbi5jaGlsZHJlbklnbm9yZWRcbnZhciBpc0lnbm9yZWQgPSBjb21tb24uaXNJZ25vcmVkXG5cbnZhciBvbmNlID0gcmVxdWlyZSgnb25jZScpXG5cbmZ1bmN0aW9uIGdsb2IgKHBhdHRlcm4sIG9wdGlvbnMsIGNiKSB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykgY2IgPSBvcHRpb25zLCBvcHRpb25zID0ge31cbiAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge31cblxuICBpZiAob3B0aW9ucy5zeW5jKSB7XG4gICAgaWYgKGNiKVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2FsbGJhY2sgcHJvdmlkZWQgdG8gc3luYyBnbG9iJylcbiAgICByZXR1cm4gZ2xvYlN5bmMocGF0dGVybiwgb3B0aW9ucylcbiAgfVxuXG4gIHJldHVybiBuZXcgR2xvYihwYXR0ZXJuLCBvcHRpb25zLCBjYilcbn1cblxuZ2xvYi5zeW5jID0gZ2xvYlN5bmNcbnZhciBHbG9iU3luYyA9IGdsb2IuR2xvYlN5bmMgPSBnbG9iU3luYy5HbG9iU3luY1xuXG4vLyBvbGQgYXBpIHN1cmZhY2Vcbmdsb2IuZ2xvYiA9IGdsb2JcblxuZnVuY3Rpb24gZXh0ZW5kIChvcmlnaW4sIGFkZCkge1xuICBpZiAoYWRkID09PSBudWxsIHx8IHR5cGVvZiBhZGQgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG9yaWdpblxuICB9XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpXG4gIHZhciBpID0ga2V5cy5sZW5ndGhcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXVxuICB9XG4gIHJldHVybiBvcmlnaW5cbn1cblxuZ2xvYi5oYXNNYWdpYyA9IGZ1bmN0aW9uIChwYXR0ZXJuLCBvcHRpb25zXykge1xuICB2YXIgb3B0aW9ucyA9IGV4dGVuZCh7fSwgb3B0aW9uc18pXG4gIG9wdGlvbnMubm9wcm9jZXNzID0gdHJ1ZVxuXG4gIHZhciBnID0gbmV3IEdsb2IocGF0dGVybiwgb3B0aW9ucylcbiAgdmFyIHNldCA9IGcubWluaW1hdGNoLnNldFxuXG4gIGlmICghcGF0dGVybilcbiAgICByZXR1cm4gZmFsc2VcblxuICBpZiAoc2V0Lmxlbmd0aCA+IDEpXG4gICAgcmV0dXJuIHRydWVcblxuICBmb3IgKHZhciBqID0gMDsgaiA8IHNldFswXS5sZW5ndGg7IGorKykge1xuICAgIGlmICh0eXBlb2Ygc2V0WzBdW2pdICE9PSAnc3RyaW5nJylcbiAgICAgIHJldHVybiB0cnVlXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuZ2xvYi5HbG9iID0gR2xvYlxuaW5oZXJpdHMoR2xvYiwgRUUpXG5mdW5jdGlvbiBHbG9iIChwYXR0ZXJuLCBvcHRpb25zLCBjYikge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYiA9IG9wdGlvbnNcbiAgICBvcHRpb25zID0gbnVsbFxuICB9XG5cbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5zeW5jKSB7XG4gICAgaWYgKGNiKVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2FsbGJhY2sgcHJvdmlkZWQgdG8gc3luYyBnbG9iJylcbiAgICByZXR1cm4gbmV3IEdsb2JTeW5jKHBhdHRlcm4sIG9wdGlvbnMpXG4gIH1cblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgR2xvYikpXG4gICAgcmV0dXJuIG5ldyBHbG9iKHBhdHRlcm4sIG9wdGlvbnMsIGNiKVxuXG4gIHNldG9wdHModGhpcywgcGF0dGVybiwgb3B0aW9ucylcbiAgdGhpcy5fZGlkUmVhbFBhdGggPSBmYWxzZVxuXG4gIC8vIHByb2Nlc3MgZWFjaCBwYXR0ZXJuIGluIHRoZSBtaW5pbWF0Y2ggc2V0XG4gIHZhciBuID0gdGhpcy5taW5pbWF0Y2guc2V0Lmxlbmd0aFxuXG4gIC8vIFRoZSBtYXRjaGVzIGFyZSBzdG9yZWQgYXMgezxmaWxlbmFtZT46IHRydWUsLi4ufSBzbyB0aGF0XG4gIC8vIGR1cGxpY2F0ZXMgYXJlIGF1dG9tYWdpY2FsbHkgcHJ1bmVkLlxuICAvLyBMYXRlciwgd2UgZG8gYW4gT2JqZWN0LmtleXMoKSBvbiB0aGVzZS5cbiAgLy8gS2VlcCB0aGVtIGFzIGEgbGlzdCBzbyB3ZSBjYW4gZmlsbCBpbiB3aGVuIG5vbnVsbCBpcyBzZXQuXG4gIHRoaXMubWF0Y2hlcyA9IG5ldyBBcnJheShuKVxuXG4gIGlmICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYiA9IG9uY2UoY2IpXG4gICAgdGhpcy5vbignZXJyb3InLCBjYilcbiAgICB0aGlzLm9uKCdlbmQnLCBmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgY2IobnVsbCwgbWF0Y2hlcylcbiAgICB9KVxuICB9XG5cbiAgdmFyIHNlbGYgPSB0aGlzXG4gIHRoaXMuX3Byb2Nlc3NpbmcgPSAwXG5cbiAgdGhpcy5fZW1pdFF1ZXVlID0gW11cbiAgdGhpcy5fcHJvY2Vzc1F1ZXVlID0gW11cbiAgdGhpcy5wYXVzZWQgPSBmYWxzZVxuXG4gIGlmICh0aGlzLm5vcHJvY2VzcylcbiAgICByZXR1cm4gdGhpc1xuXG4gIGlmIChuID09PSAwKVxuICAgIHJldHVybiBkb25lKClcblxuICB2YXIgc3luYyA9IHRydWVcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpICsrKSB7XG4gICAgdGhpcy5fcHJvY2Vzcyh0aGlzLm1pbmltYXRjaC5zZXRbaV0sIGksIGZhbHNlLCBkb25lKVxuICB9XG4gIHN5bmMgPSBmYWxzZVxuXG4gIGZ1bmN0aW9uIGRvbmUgKCkge1xuICAgIC0tc2VsZi5fcHJvY2Vzc2luZ1xuICAgIGlmIChzZWxmLl9wcm9jZXNzaW5nIDw9IDApIHtcbiAgICAgIGlmIChzeW5jKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNlbGYuX2ZpbmlzaCgpXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLl9maW5pc2goKVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5HbG9iLnByb3RvdHlwZS5fZmluaXNoID0gZnVuY3Rpb24gKCkge1xuICBhc3NlcnQodGhpcyBpbnN0YW5jZW9mIEdsb2IpXG4gIGlmICh0aGlzLmFib3J0ZWQpXG4gICAgcmV0dXJuXG5cbiAgaWYgKHRoaXMucmVhbHBhdGggJiYgIXRoaXMuX2RpZFJlYWxwYXRoKVxuICAgIHJldHVybiB0aGlzLl9yZWFscGF0aCgpXG5cbiAgY29tbW9uLmZpbmlzaCh0aGlzKVxuICB0aGlzLmVtaXQoJ2VuZCcsIHRoaXMuZm91bmQpXG59XG5cbkdsb2IucHJvdG90eXBlLl9yZWFscGF0aCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuX2RpZFJlYWxwYXRoKVxuICAgIHJldHVyblxuXG4gIHRoaXMuX2RpZFJlYWxwYXRoID0gdHJ1ZVxuXG4gIHZhciBuID0gdGhpcy5tYXRjaGVzLmxlbmd0aFxuICBpZiAobiA9PT0gMClcbiAgICByZXR1cm4gdGhpcy5fZmluaXNoKClcblxuICB2YXIgc2VsZiA9IHRoaXNcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hdGNoZXMubGVuZ3RoOyBpKyspXG4gICAgdGhpcy5fcmVhbHBhdGhTZXQoaSwgbmV4dClcblxuICBmdW5jdGlvbiBuZXh0ICgpIHtcbiAgICBpZiAoLS1uID09PSAwKVxuICAgICAgc2VsZi5fZmluaXNoKClcbiAgfVxufVxuXG5HbG9iLnByb3RvdHlwZS5fcmVhbHBhdGhTZXQgPSBmdW5jdGlvbiAoaW5kZXgsIGNiKSB7XG4gIHZhciBtYXRjaHNldCA9IHRoaXMubWF0Y2hlc1tpbmRleF1cbiAgaWYgKCFtYXRjaHNldClcbiAgICByZXR1cm4gY2IoKVxuXG4gIHZhciBmb3VuZCA9IE9iamVjdC5rZXlzKG1hdGNoc2V0KVxuICB2YXIgc2VsZiA9IHRoaXNcbiAgdmFyIG4gPSBmb3VuZC5sZW5ndGhcblxuICBpZiAobiA9PT0gMClcbiAgICByZXR1cm4gY2IoKVxuXG4gIHZhciBzZXQgPSB0aGlzLm1hdGNoZXNbaW5kZXhdID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICBmb3VuZC5mb3JFYWNoKGZ1bmN0aW9uIChwLCBpKSB7XG4gICAgLy8gSWYgdGhlcmUncyBhIHByb2JsZW0gd2l0aCB0aGUgc3RhdCwgdGhlbiBpdCBtZWFucyB0aGF0XG4gICAgLy8gb25lIG9yIG1vcmUgb2YgdGhlIGxpbmtzIGluIHRoZSByZWFscGF0aCBjb3VsZG4ndCBiZVxuICAgIC8vIHJlc29sdmVkLiAganVzdCByZXR1cm4gdGhlIGFicyB2YWx1ZSBpbiB0aGF0IGNhc2UuXG4gICAgcCA9IHNlbGYuX21ha2VBYnMocClcbiAgICBycC5yZWFscGF0aChwLCBzZWxmLnJlYWxwYXRoQ2FjaGUsIGZ1bmN0aW9uIChlciwgcmVhbCkge1xuICAgICAgaWYgKCFlcilcbiAgICAgICAgc2V0W3JlYWxdID0gdHJ1ZVxuICAgICAgZWxzZSBpZiAoZXIuc3lzY2FsbCA9PT0gJ3N0YXQnKVxuICAgICAgICBzZXRbcF0gPSB0cnVlXG4gICAgICBlbHNlXG4gICAgICAgIHNlbGYuZW1pdCgnZXJyb3InLCBlcikgLy8gc3JzbHkgd3RmIHJpZ2h0IGhlcmVcblxuICAgICAgaWYgKC0tbiA9PT0gMCkge1xuICAgICAgICBzZWxmLm1hdGNoZXNbaW5kZXhdID0gc2V0XG4gICAgICAgIGNiKClcbiAgICAgIH1cbiAgICB9KVxuICB9KVxufVxuXG5HbG9iLnByb3RvdHlwZS5fbWFyayA9IGZ1bmN0aW9uIChwKSB7XG4gIHJldHVybiBjb21tb24ubWFyayh0aGlzLCBwKVxufVxuXG5HbG9iLnByb3RvdHlwZS5fbWFrZUFicyA9IGZ1bmN0aW9uIChmKSB7XG4gIHJldHVybiBjb21tb24ubWFrZUFicyh0aGlzLCBmKVxufVxuXG5HbG9iLnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5hYm9ydGVkID0gdHJ1ZVxuICB0aGlzLmVtaXQoJ2Fib3J0Jylcbn1cblxuR2xvYi5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5wYXVzZWQpIHtcbiAgICB0aGlzLnBhdXNlZCA9IHRydWVcbiAgICB0aGlzLmVtaXQoJ3BhdXNlJylcbiAgfVxufVxuXG5HbG9iLnByb3RvdHlwZS5yZXN1bWUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLnBhdXNlZCkge1xuICAgIHRoaXMuZW1pdCgncmVzdW1lJylcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXG4gICAgaWYgKHRoaXMuX2VtaXRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgIHZhciBlcSA9IHRoaXMuX2VtaXRRdWV1ZS5zbGljZSgwKVxuICAgICAgdGhpcy5fZW1pdFF1ZXVlLmxlbmd0aCA9IDBcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXEubGVuZ3RoOyBpICsrKSB7XG4gICAgICAgIHZhciBlID0gZXFbaV1cbiAgICAgICAgdGhpcy5fZW1pdE1hdGNoKGVbMF0sIGVbMV0pXG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLl9wcm9jZXNzUXVldWUubGVuZ3RoKSB7XG4gICAgICB2YXIgcHEgPSB0aGlzLl9wcm9jZXNzUXVldWUuc2xpY2UoMClcbiAgICAgIHRoaXMuX3Byb2Nlc3NRdWV1ZS5sZW5ndGggPSAwXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBxLmxlbmd0aDsgaSArKykge1xuICAgICAgICB2YXIgcCA9IHBxW2ldXG4gICAgICAgIHRoaXMuX3Byb2Nlc3NpbmctLVxuICAgICAgICB0aGlzLl9wcm9jZXNzKHBbMF0sIHBbMV0sIHBbMl0sIHBbM10pXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbkdsb2IucHJvdG90eXBlLl9wcm9jZXNzID0gZnVuY3Rpb24gKHBhdHRlcm4sIGluZGV4LCBpbkdsb2JTdGFyLCBjYikge1xuICBhc3NlcnQodGhpcyBpbnN0YW5jZW9mIEdsb2IpXG4gIGFzc2VydCh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpXG5cbiAgaWYgKHRoaXMuYWJvcnRlZClcbiAgICByZXR1cm5cblxuICB0aGlzLl9wcm9jZXNzaW5nKytcbiAgaWYgKHRoaXMucGF1c2VkKSB7XG4gICAgdGhpcy5fcHJvY2Vzc1F1ZXVlLnB1c2goW3BhdHRlcm4sIGluZGV4LCBpbkdsb2JTdGFyLCBjYl0pXG4gICAgcmV0dXJuXG4gIH1cblxuICAvL2NvbnNvbGUuZXJyb3IoJ1BST0NFU1MgJWQnLCB0aGlzLl9wcm9jZXNzaW5nLCBwYXR0ZXJuKVxuXG4gIC8vIEdldCB0aGUgZmlyc3QgW25dIHBhcnRzIG9mIHBhdHRlcm4gdGhhdCBhcmUgYWxsIHN0cmluZ3MuXG4gIHZhciBuID0gMFxuICB3aGlsZSAodHlwZW9mIHBhdHRlcm5bbl0gPT09ICdzdHJpbmcnKSB7XG4gICAgbiArK1xuICB9XG4gIC8vIG5vdyBuIGlzIHRoZSBpbmRleCBvZiB0aGUgZmlyc3Qgb25lIHRoYXQgaXMgKm5vdCogYSBzdHJpbmcuXG5cbiAgLy8gc2VlIGlmIHRoZXJlJ3MgYW55dGhpbmcgZWxzZVxuICB2YXIgcHJlZml4XG4gIHN3aXRjaCAobikge1xuICAgIC8vIGlmIG5vdCwgdGhlbiB0aGlzIGlzIHJhdGhlciBzaW1wbGVcbiAgICBjYXNlIHBhdHRlcm4ubGVuZ3RoOlxuICAgICAgdGhpcy5fcHJvY2Vzc1NpbXBsZShwYXR0ZXJuLmpvaW4oJy8nKSwgaW5kZXgsIGNiKVxuICAgICAgcmV0dXJuXG5cbiAgICBjYXNlIDA6XG4gICAgICAvLyBwYXR0ZXJuICpzdGFydHMqIHdpdGggc29tZSBub24tdHJpdmlhbCBpdGVtLlxuICAgICAgLy8gZ29pbmcgdG8gcmVhZGRpcihjd2QpLCBidXQgbm90IGluY2x1ZGUgdGhlIHByZWZpeCBpbiBtYXRjaGVzLlxuICAgICAgcHJlZml4ID0gbnVsbFxuICAgICAgYnJlYWtcblxuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBwYXR0ZXJuIGhhcyBzb21lIHN0cmluZyBiaXRzIGluIHRoZSBmcm9udC5cbiAgICAgIC8vIHdoYXRldmVyIGl0IHN0YXJ0cyB3aXRoLCB3aGV0aGVyIHRoYXQncyAnYWJzb2x1dGUnIGxpa2UgL2Zvby9iYXIsXG4gICAgICAvLyBvciAncmVsYXRpdmUnIGxpa2UgJy4uL2JheidcbiAgICAgIHByZWZpeCA9IHBhdHRlcm4uc2xpY2UoMCwgbikuam9pbignLycpXG4gICAgICBicmVha1xuICB9XG5cbiAgdmFyIHJlbWFpbiA9IHBhdHRlcm4uc2xpY2UobilcblxuICAvLyBnZXQgdGhlIGxpc3Qgb2YgZW50cmllcy5cbiAgdmFyIHJlYWRcbiAgaWYgKHByZWZpeCA9PT0gbnVsbClcbiAgICByZWFkID0gJy4nXG4gIGVsc2UgaWYgKGlzQWJzb2x1dGUocHJlZml4KSB8fFxuICAgICAgaXNBYnNvbHV0ZShwYXR0ZXJuLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHAgPT09ICdzdHJpbmcnID8gcCA6ICdbKl0nXG4gICAgICB9KS5qb2luKCcvJykpKSB7XG4gICAgaWYgKCFwcmVmaXggfHwgIWlzQWJzb2x1dGUocHJlZml4KSlcbiAgICAgIHByZWZpeCA9ICcvJyArIHByZWZpeFxuICAgIHJlYWQgPSBwcmVmaXhcbiAgfSBlbHNlXG4gICAgcmVhZCA9IHByZWZpeFxuXG4gIHZhciBhYnMgPSB0aGlzLl9tYWtlQWJzKHJlYWQpXG5cbiAgLy9pZiBpZ25vcmVkLCBza2lwIF9wcm9jZXNzaW5nXG4gIGlmIChjaGlsZHJlbklnbm9yZWQodGhpcywgcmVhZCkpXG4gICAgcmV0dXJuIGNiKClcblxuICB2YXIgaXNHbG9iU3RhciA9IHJlbWFpblswXSA9PT0gbWluaW1hdGNoLkdMT0JTVEFSXG4gIGlmIChpc0dsb2JTdGFyKVxuICAgIHRoaXMuX3Byb2Nlc3NHbG9iU3RhcihwcmVmaXgsIHJlYWQsIGFicywgcmVtYWluLCBpbmRleCwgaW5HbG9iU3RhciwgY2IpXG4gIGVsc2VcbiAgICB0aGlzLl9wcm9jZXNzUmVhZGRpcihwcmVmaXgsIHJlYWQsIGFicywgcmVtYWluLCBpbmRleCwgaW5HbG9iU3RhciwgY2IpXG59XG5cbkdsb2IucHJvdG90eXBlLl9wcm9jZXNzUmVhZGRpciA9IGZ1bmN0aW9uIChwcmVmaXgsIHJlYWQsIGFicywgcmVtYWluLCBpbmRleCwgaW5HbG9iU3RhciwgY2IpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG4gIHRoaXMuX3JlYWRkaXIoYWJzLCBpbkdsb2JTdGFyLCBmdW5jdGlvbiAoZXIsIGVudHJpZXMpIHtcbiAgICByZXR1cm4gc2VsZi5fcHJvY2Vzc1JlYWRkaXIyKHByZWZpeCwgcmVhZCwgYWJzLCByZW1haW4sIGluZGV4LCBpbkdsb2JTdGFyLCBlbnRyaWVzLCBjYilcbiAgfSlcbn1cblxuR2xvYi5wcm90b3R5cGUuX3Byb2Nlc3NSZWFkZGlyMiA9IGZ1bmN0aW9uIChwcmVmaXgsIHJlYWQsIGFicywgcmVtYWluLCBpbmRleCwgaW5HbG9iU3RhciwgZW50cmllcywgY2IpIHtcblxuICAvLyBpZiB0aGUgYWJzIGlzbid0IGEgZGlyLCB0aGVuIG5vdGhpbmcgY2FuIG1hdGNoIVxuICBpZiAoIWVudHJpZXMpXG4gICAgcmV0dXJuIGNiKClcblxuICAvLyBJdCB3aWxsIG9ubHkgbWF0Y2ggZG90IGVudHJpZXMgaWYgaXQgc3RhcnRzIHdpdGggYSBkb3QsIG9yIGlmXG4gIC8vIGRvdCBpcyBzZXQuICBTdHVmZiBsaWtlIEAoLmZvb3wuYmFyKSBpc24ndCBhbGxvd2VkLlxuICB2YXIgcG4gPSByZW1haW5bMF1cbiAgdmFyIG5lZ2F0ZSA9ICEhdGhpcy5taW5pbWF0Y2gubmVnYXRlXG4gIHZhciByYXdHbG9iID0gcG4uX2dsb2JcbiAgdmFyIGRvdE9rID0gdGhpcy5kb3QgfHwgcmF3R2xvYi5jaGFyQXQoMCkgPT09ICcuJ1xuXG4gIHZhciBtYXRjaGVkRW50cmllcyA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBlID0gZW50cmllc1tpXVxuICAgIGlmIChlLmNoYXJBdCgwKSAhPT0gJy4nIHx8IGRvdE9rKSB7XG4gICAgICB2YXIgbVxuICAgICAgaWYgKG5lZ2F0ZSAmJiAhcHJlZml4KSB7XG4gICAgICAgIG0gPSAhZS5tYXRjaChwbilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG0gPSBlLm1hdGNoKHBuKVxuICAgICAgfVxuICAgICAgaWYgKG0pXG4gICAgICAgIG1hdGNoZWRFbnRyaWVzLnB1c2goZSlcbiAgICB9XG4gIH1cblxuICAvL2NvbnNvbGUuZXJyb3IoJ3ByZDInLCBwcmVmaXgsIGVudHJpZXMsIHJlbWFpblswXS5fZ2xvYiwgbWF0Y2hlZEVudHJpZXMpXG5cbiAgdmFyIGxlbiA9IG1hdGNoZWRFbnRyaWVzLmxlbmd0aFxuICAvLyBJZiB0aGVyZSBhcmUgbm8gbWF0Y2hlZCBlbnRyaWVzLCB0aGVuIG5vdGhpbmcgbWF0Y2hlcy5cbiAgaWYgKGxlbiA9PT0gMClcbiAgICByZXR1cm4gY2IoKVxuXG4gIC8vIGlmIHRoaXMgaXMgdGhlIGxhc3QgcmVtYWluaW5nIHBhdHRlcm4gYml0LCB0aGVuIG5vIG5lZWQgZm9yXG4gIC8vIGFuIGFkZGl0aW9uYWwgc3RhdCAqdW5sZXNzKiB0aGUgdXNlciBoYXMgc3BlY2lmaWVkIG1hcmsgb3JcbiAgLy8gc3RhdCBleHBsaWNpdGx5LiAgV2Uga25vdyB0aGV5IGV4aXN0LCBzaW5jZSByZWFkZGlyIHJldHVybmVkXG4gIC8vIHRoZW0uXG5cbiAgaWYgKHJlbWFpbi5sZW5ndGggPT09IDEgJiYgIXRoaXMubWFyayAmJiAhdGhpcy5zdGF0KSB7XG4gICAgaWYgKCF0aGlzLm1hdGNoZXNbaW5kZXhdKVxuICAgICAgdGhpcy5tYXRjaGVzW2luZGV4XSA9IE9iamVjdC5jcmVhdGUobnVsbClcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICsrKSB7XG4gICAgICB2YXIgZSA9IG1hdGNoZWRFbnRyaWVzW2ldXG4gICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgIGlmIChwcmVmaXggIT09ICcvJylcbiAgICAgICAgICBlID0gcHJlZml4ICsgJy8nICsgZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZSA9IHByZWZpeCArIGVcbiAgICAgIH1cblxuICAgICAgaWYgKGUuY2hhckF0KDApID09PSAnLycgJiYgIXRoaXMubm9tb3VudCkge1xuICAgICAgICBlID0gcGF0aC5qb2luKHRoaXMucm9vdCwgZSlcbiAgICAgIH1cbiAgICAgIHRoaXMuX2VtaXRNYXRjaChpbmRleCwgZSlcbiAgICB9XG4gICAgLy8gVGhpcyB3YXMgdGhlIGxhc3Qgb25lLCBhbmQgbm8gc3RhdHMgd2VyZSBuZWVkZWRcbiAgICByZXR1cm4gY2IoKVxuICB9XG5cbiAgLy8gbm93IHRlc3QgYWxsIG1hdGNoZWQgZW50cmllcyBhcyBzdGFuZC1pbnMgZm9yIHRoYXQgcGFydFxuICAvLyBvZiB0aGUgcGF0dGVybi5cbiAgcmVtYWluLnNoaWZ0KClcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKyspIHtcbiAgICB2YXIgZSA9IG1hdGNoZWRFbnRyaWVzW2ldXG4gICAgdmFyIG5ld1BhdHRlcm5cbiAgICBpZiAocHJlZml4KSB7XG4gICAgICBpZiAocHJlZml4ICE9PSAnLycpXG4gICAgICAgIGUgPSBwcmVmaXggKyAnLycgKyBlXG4gICAgICBlbHNlXG4gICAgICAgIGUgPSBwcmVmaXggKyBlXG4gICAgfVxuICAgIHRoaXMuX3Byb2Nlc3MoW2VdLmNvbmNhdChyZW1haW4pLCBpbmRleCwgaW5HbG9iU3RhciwgY2IpXG4gIH1cbiAgY2IoKVxufVxuXG5HbG9iLnByb3RvdHlwZS5fZW1pdE1hdGNoID0gZnVuY3Rpb24gKGluZGV4LCBlKSB7XG4gIGlmICh0aGlzLmFib3J0ZWQpXG4gICAgcmV0dXJuXG5cbiAgaWYgKGlzSWdub3JlZCh0aGlzLCBlKSlcbiAgICByZXR1cm5cblxuICBpZiAodGhpcy5wYXVzZWQpIHtcbiAgICB0aGlzLl9lbWl0UXVldWUucHVzaChbaW5kZXgsIGVdKVxuICAgIHJldHVyblxuICB9XG5cbiAgdmFyIGFicyA9IGlzQWJzb2x1dGUoZSkgPyBlIDogdGhpcy5fbWFrZUFicyhlKVxuXG4gIGlmICh0aGlzLm1hcmspXG4gICAgZSA9IHRoaXMuX21hcmsoZSlcblxuICBpZiAodGhpcy5hYnNvbHV0ZSlcbiAgICBlID0gYWJzXG5cbiAgaWYgKHRoaXMubWF0Y2hlc1tpbmRleF1bZV0pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHRoaXMubm9kaXIpIHtcbiAgICB2YXIgYyA9IHRoaXMuY2FjaGVbYWJzXVxuICAgIGlmIChjID09PSAnRElSJyB8fCBBcnJheS5pc0FycmF5KGMpKVxuICAgICAgcmV0dXJuXG4gIH1cblxuICB0aGlzLm1hdGNoZXNbaW5kZXhdW2VdID0gdHJ1ZVxuXG4gIHZhciBzdCA9IHRoaXMuc3RhdENhY2hlW2Fic11cbiAgaWYgKHN0KVxuICAgIHRoaXMuZW1pdCgnc3RhdCcsIGUsIHN0KVxuXG4gIHRoaXMuZW1pdCgnbWF0Y2gnLCBlKVxufVxuXG5HbG9iLnByb3RvdHlwZS5fcmVhZGRpckluR2xvYlN0YXIgPSBmdW5jdGlvbiAoYWJzLCBjYikge1xuICBpZiAodGhpcy5hYm9ydGVkKVxuICAgIHJldHVyblxuXG4gIC8vIGZvbGxvdyBhbGwgc3ltbGlua2VkIGRpcmVjdG9yaWVzIGZvcmV2ZXJcbiAgLy8ganVzdCBwcm9jZWVkIGFzIGlmIHRoaXMgaXMgYSBub24tZ2xvYnN0YXIgc2l0dWF0aW9uXG4gIGlmICh0aGlzLmZvbGxvdylcbiAgICByZXR1cm4gdGhpcy5fcmVhZGRpcihhYnMsIGZhbHNlLCBjYilcblxuICB2YXIgbHN0YXRrZXkgPSAnbHN0YXRcXDAnICsgYWJzXG4gIHZhciBzZWxmID0gdGhpc1xuICB2YXIgbHN0YXRjYiA9IGluZmxpZ2h0KGxzdGF0a2V5LCBsc3RhdGNiXylcblxuICBpZiAobHN0YXRjYilcbiAgICBzZWxmLmZzLmxzdGF0KGFicywgbHN0YXRjYilcblxuICBmdW5jdGlvbiBsc3RhdGNiXyAoZXIsIGxzdGF0KSB7XG4gICAgaWYgKGVyICYmIGVyLmNvZGUgPT09ICdFTk9FTlQnKVxuICAgICAgcmV0dXJuIGNiKClcblxuICAgIHZhciBpc1N5bSA9IGxzdGF0ICYmIGxzdGF0LmlzU3ltYm9saWNMaW5rKClcbiAgICBzZWxmLnN5bWxpbmtzW2Fic10gPSBpc1N5bVxuXG4gICAgLy8gSWYgaXQncyBub3QgYSBzeW1saW5rIG9yIGEgZGlyLCB0aGVuIGl0J3MgZGVmaW5pdGVseSBhIHJlZ3VsYXIgZmlsZS5cbiAgICAvLyBkb24ndCBib3RoZXIgZG9pbmcgYSByZWFkZGlyIGluIHRoYXQgY2FzZS5cbiAgICBpZiAoIWlzU3ltICYmIGxzdGF0ICYmICFsc3RhdC5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICBzZWxmLmNhY2hlW2Fic10gPSAnRklMRSdcbiAgICAgIGNiKClcbiAgICB9IGVsc2VcbiAgICAgIHNlbGYuX3JlYWRkaXIoYWJzLCBmYWxzZSwgY2IpXG4gIH1cbn1cblxuR2xvYi5wcm90b3R5cGUuX3JlYWRkaXIgPSBmdW5jdGlvbiAoYWJzLCBpbkdsb2JTdGFyLCBjYikge1xuICBpZiAodGhpcy5hYm9ydGVkKVxuICAgIHJldHVyblxuXG4gIGNiID0gaW5mbGlnaHQoJ3JlYWRkaXJcXDAnK2FicysnXFwwJytpbkdsb2JTdGFyLCBjYilcbiAgaWYgKCFjYilcbiAgICByZXR1cm5cblxuICAvL2NvbnNvbGUuZXJyb3IoJ1JEICVqICVqJywgK2luR2xvYlN0YXIsIGFicylcbiAgaWYgKGluR2xvYlN0YXIgJiYgIW93blByb3AodGhpcy5zeW1saW5rcywgYWJzKSlcbiAgICByZXR1cm4gdGhpcy5fcmVhZGRpckluR2xvYlN0YXIoYWJzLCBjYilcblxuICBpZiAob3duUHJvcCh0aGlzLmNhY2hlLCBhYnMpKSB7XG4gICAgdmFyIGMgPSB0aGlzLmNhY2hlW2Fic11cbiAgICBpZiAoIWMgfHwgYyA9PT0gJ0ZJTEUnKVxuICAgICAgcmV0dXJuIGNiKClcblxuICAgIGlmIChBcnJheS5pc0FycmF5KGMpKVxuICAgICAgcmV0dXJuIGNiKG51bGwsIGMpXG4gIH1cblxuICB2YXIgc2VsZiA9IHRoaXNcbiAgc2VsZi5mcy5yZWFkZGlyKGFicywgcmVhZGRpckNiKHRoaXMsIGFicywgY2IpKVxufVxuXG5mdW5jdGlvbiByZWFkZGlyQ2IgKHNlbGYsIGFicywgY2IpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlciwgZW50cmllcykge1xuICAgIGlmIChlcilcbiAgICAgIHNlbGYuX3JlYWRkaXJFcnJvcihhYnMsIGVyLCBjYilcbiAgICBlbHNlXG4gICAgICBzZWxmLl9yZWFkZGlyRW50cmllcyhhYnMsIGVudHJpZXMsIGNiKVxuICB9XG59XG5cbkdsb2IucHJvdG90eXBlLl9yZWFkZGlyRW50cmllcyA9IGZ1bmN0aW9uIChhYnMsIGVudHJpZXMsIGNiKSB7XG4gIGlmICh0aGlzLmFib3J0ZWQpXG4gICAgcmV0dXJuXG5cbiAgLy8gaWYgd2UgaGF2ZW4ndCBhc2tlZCB0byBzdGF0IGV2ZXJ5dGhpbmcsIHRoZW4ganVzdFxuICAvLyBhc3N1bWUgdGhhdCBldmVyeXRoaW5nIGluIHRoZXJlIGV4aXN0cywgc28gd2UgY2FuIGF2b2lkXG4gIC8vIGhhdmluZyB0byBzdGF0IGl0IGEgc2Vjb25kIHRpbWUuXG4gIGlmICghdGhpcy5tYXJrICYmICF0aGlzLnN0YXQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVudHJpZXMubGVuZ3RoOyBpICsrKSB7XG4gICAgICB2YXIgZSA9IGVudHJpZXNbaV1cbiAgICAgIGlmIChhYnMgPT09ICcvJylcbiAgICAgICAgZSA9IGFicyArIGVcbiAgICAgIGVsc2VcbiAgICAgICAgZSA9IGFicyArICcvJyArIGVcbiAgICAgIHRoaXMuY2FjaGVbZV0gPSB0cnVlXG4gICAgfVxuICB9XG5cbiAgdGhpcy5jYWNoZVthYnNdID0gZW50cmllc1xuICByZXR1cm4gY2IobnVsbCwgZW50cmllcylcbn1cblxuR2xvYi5wcm90b3R5cGUuX3JlYWRkaXJFcnJvciA9IGZ1bmN0aW9uIChmLCBlciwgY2IpIHtcbiAgaWYgKHRoaXMuYWJvcnRlZClcbiAgICByZXR1cm5cblxuICAvLyBoYW5kbGUgZXJyb3JzLCBhbmQgY2FjaGUgdGhlIGluZm9ybWF0aW9uXG4gIHN3aXRjaCAoZXIuY29kZSkge1xuICAgIGNhc2UgJ0VOT1RTVVAnOiAvLyBodHRwczovL2dpdGh1Yi5jb20vaXNhYWNzL25vZGUtZ2xvYi9pc3N1ZXMvMjA1XG4gICAgY2FzZSAnRU5PVERJUic6IC8vIHRvdGFsbHkgbm9ybWFsLiBtZWFucyBpdCAqZG9lcyogZXhpc3QuXG4gICAgICB2YXIgYWJzID0gdGhpcy5fbWFrZUFicyhmKVxuICAgICAgdGhpcy5jYWNoZVthYnNdID0gJ0ZJTEUnXG4gICAgICBpZiAoYWJzID09PSB0aGlzLmN3ZEFicykge1xuICAgICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoZXIuY29kZSArICcgaW52YWxpZCBjd2QgJyArIHRoaXMuY3dkKVxuICAgICAgICBlcnJvci5wYXRoID0gdGhpcy5jd2RcbiAgICAgICAgZXJyb3IuY29kZSA9IGVyLmNvZGVcbiAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycm9yKVxuICAgICAgICB0aGlzLmFib3J0KClcbiAgICAgIH1cbiAgICAgIGJyZWFrXG5cbiAgICBjYXNlICdFTk9FTlQnOiAvLyBub3QgdGVycmlibHkgdW51c3VhbFxuICAgIGNhc2UgJ0VMT09QJzpcbiAgICBjYXNlICdFTkFNRVRPT0xPTkcnOlxuICAgIGNhc2UgJ1VOS05PV04nOlxuICAgICAgdGhpcy5jYWNoZVt0aGlzLl9tYWtlQWJzKGYpXSA9IGZhbHNlXG4gICAgICBicmVha1xuXG4gICAgZGVmYXVsdDogLy8gc29tZSB1bnVzdWFsIGVycm9yLiAgVHJlYXQgYXMgZmFpbHVyZS5cbiAgICAgIHRoaXMuY2FjaGVbdGhpcy5fbWFrZUFicyhmKV0gPSBmYWxzZVxuICAgICAgaWYgKHRoaXMuc3RyaWN0KSB7XG4gICAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcilcbiAgICAgICAgLy8gSWYgdGhlIGVycm9yIGlzIGhhbmRsZWQsIHRoZW4gd2UgYWJvcnRcbiAgICAgICAgLy8gaWYgbm90LCB3ZSB0aHJldyBvdXQgb2YgaGVyZVxuICAgICAgICB0aGlzLmFib3J0KClcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5zaWxlbnQpXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ2dsb2IgZXJyb3InLCBlcilcbiAgICAgIGJyZWFrXG4gIH1cblxuICByZXR1cm4gY2IoKVxufVxuXG5HbG9iLnByb3RvdHlwZS5fcHJvY2Vzc0dsb2JTdGFyID0gZnVuY3Rpb24gKHByZWZpeCwgcmVhZCwgYWJzLCByZW1haW4sIGluZGV4LCBpbkdsb2JTdGFyLCBjYikge1xuICB2YXIgc2VsZiA9IHRoaXNcbiAgdGhpcy5fcmVhZGRpcihhYnMsIGluR2xvYlN0YXIsIGZ1bmN0aW9uIChlciwgZW50cmllcykge1xuICAgIHNlbGYuX3Byb2Nlc3NHbG9iU3RhcjIocHJlZml4LCByZWFkLCBhYnMsIHJlbWFpbiwgaW5kZXgsIGluR2xvYlN0YXIsIGVudHJpZXMsIGNiKVxuICB9KVxufVxuXG5cbkdsb2IucHJvdG90eXBlLl9wcm9jZXNzR2xvYlN0YXIyID0gZnVuY3Rpb24gKHByZWZpeCwgcmVhZCwgYWJzLCByZW1haW4sIGluZGV4LCBpbkdsb2JTdGFyLCBlbnRyaWVzLCBjYikge1xuICAvL2NvbnNvbGUuZXJyb3IoJ3BnczInLCBwcmVmaXgsIHJlbWFpblswXSwgZW50cmllcylcblxuICAvLyBubyBlbnRyaWVzIG1lYW5zIG5vdCBhIGRpciwgc28gaXQgY2FuIG5ldmVyIGhhdmUgbWF0Y2hlc1xuICAvLyBmb28udHh0LyoqIGRvZXNuJ3QgbWF0Y2ggZm9vLnR4dFxuICBpZiAoIWVudHJpZXMpXG4gICAgcmV0dXJuIGNiKClcblxuICAvLyB0ZXN0IHdpdGhvdXQgdGhlIGdsb2JzdGFyLCBhbmQgd2l0aCBldmVyeSBjaGlsZCBib3RoIGJlbG93XG4gIC8vIGFuZCByZXBsYWNpbmcgdGhlIGdsb2JzdGFyLlxuICB2YXIgcmVtYWluV2l0aG91dEdsb2JTdGFyID0gcmVtYWluLnNsaWNlKDEpXG4gIHZhciBnc3ByZWYgPSBwcmVmaXggPyBbIHByZWZpeCBdIDogW11cbiAgdmFyIG5vR2xvYlN0YXIgPSBnc3ByZWYuY29uY2F0KHJlbWFpbldpdGhvdXRHbG9iU3RhcilcblxuICAvLyB0aGUgbm9HbG9iU3RhciBwYXR0ZXJuIGV4aXRzIHRoZSBpbkdsb2JTdGFyIHN0YXRlXG4gIHRoaXMuX3Byb2Nlc3Mobm9HbG9iU3RhciwgaW5kZXgsIGZhbHNlLCBjYilcblxuICB2YXIgaXNTeW0gPSB0aGlzLnN5bWxpbmtzW2Fic11cbiAgdmFyIGxlbiA9IGVudHJpZXMubGVuZ3RoXG5cbiAgLy8gSWYgaXQncyBhIHN5bWxpbmssIGFuZCB3ZSdyZSBpbiBhIGdsb2JzdGFyLCB0aGVuIHN0b3BcbiAgaWYgKGlzU3ltICYmIGluR2xvYlN0YXIpXG4gICAgcmV0dXJuIGNiKClcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdmFyIGUgPSBlbnRyaWVzW2ldXG4gICAgaWYgKGUuY2hhckF0KDApID09PSAnLicgJiYgIXRoaXMuZG90KVxuICAgICAgY29udGludWVcblxuICAgIC8vIHRoZXNlIHR3byBjYXNlcyBlbnRlciB0aGUgaW5HbG9iU3RhciBzdGF0ZVxuICAgIHZhciBpbnN0ZWFkID0gZ3NwcmVmLmNvbmNhdChlbnRyaWVzW2ldLCByZW1haW5XaXRob3V0R2xvYlN0YXIpXG4gICAgdGhpcy5fcHJvY2VzcyhpbnN0ZWFkLCBpbmRleCwgdHJ1ZSwgY2IpXG5cbiAgICB2YXIgYmVsb3cgPSBnc3ByZWYuY29uY2F0KGVudHJpZXNbaV0sIHJlbWFpbilcbiAgICB0aGlzLl9wcm9jZXNzKGJlbG93LCBpbmRleCwgdHJ1ZSwgY2IpXG4gIH1cblxuICBjYigpXG59XG5cbkdsb2IucHJvdG90eXBlLl9wcm9jZXNzU2ltcGxlID0gZnVuY3Rpb24gKHByZWZpeCwgaW5kZXgsIGNiKSB7XG4gIC8vIFhYWCByZXZpZXcgdGhpcy4gIFNob3VsZG4ndCBpdCBiZSBkb2luZyB0aGUgbW91bnRpbmcgZXRjXG4gIC8vIGJlZm9yZSBkb2luZyBzdGF0PyAga2luZGEgd2VpcmQ/XG4gIHZhciBzZWxmID0gdGhpc1xuICB0aGlzLl9zdGF0KHByZWZpeCwgZnVuY3Rpb24gKGVyLCBleGlzdHMpIHtcbiAgICBzZWxmLl9wcm9jZXNzU2ltcGxlMihwcmVmaXgsIGluZGV4LCBlciwgZXhpc3RzLCBjYilcbiAgfSlcbn1cbkdsb2IucHJvdG90eXBlLl9wcm9jZXNzU2ltcGxlMiA9IGZ1bmN0aW9uIChwcmVmaXgsIGluZGV4LCBlciwgZXhpc3RzLCBjYikge1xuXG4gIC8vY29uc29sZS5lcnJvcigncHMyJywgcHJlZml4LCBleGlzdHMpXG5cbiAgaWYgKCF0aGlzLm1hdGNoZXNbaW5kZXhdKVxuICAgIHRoaXMubWF0Y2hlc1tpbmRleF0gPSBPYmplY3QuY3JlYXRlKG51bGwpXG5cbiAgLy8gSWYgaXQgZG9lc24ndCBleGlzdCwgdGhlbiBqdXN0IG1hcmsgdGhlIGxhY2sgb2YgcmVzdWx0c1xuICBpZiAoIWV4aXN0cylcbiAgICByZXR1cm4gY2IoKVxuXG4gIGlmIChwcmVmaXggJiYgaXNBYnNvbHV0ZShwcmVmaXgpICYmICF0aGlzLm5vbW91bnQpIHtcbiAgICB2YXIgdHJhaWwgPSAvW1xcL1xcXFxdJC8udGVzdChwcmVmaXgpXG4gICAgaWYgKHByZWZpeC5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgICAgcHJlZml4ID0gcGF0aC5qb2luKHRoaXMucm9vdCwgcHJlZml4KVxuICAgIH0gZWxzZSB7XG4gICAgICBwcmVmaXggPSBwYXRoLnJlc29sdmUodGhpcy5yb290LCBwcmVmaXgpXG4gICAgICBpZiAodHJhaWwpXG4gICAgICAgIHByZWZpeCArPSAnLydcbiAgICB9XG4gIH1cblxuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJylcbiAgICBwcmVmaXggPSBwcmVmaXgucmVwbGFjZSgvXFxcXC9nLCAnLycpXG5cbiAgLy8gTWFyayB0aGlzIGFzIGEgbWF0Y2hcbiAgdGhpcy5fZW1pdE1hdGNoKGluZGV4LCBwcmVmaXgpXG4gIGNiKClcbn1cblxuLy8gUmV0dXJucyBlaXRoZXIgJ0RJUicsICdGSUxFJywgb3IgZmFsc2Vcbkdsb2IucHJvdG90eXBlLl9zdGF0ID0gZnVuY3Rpb24gKGYsIGNiKSB7XG4gIHZhciBhYnMgPSB0aGlzLl9tYWtlQWJzKGYpXG4gIHZhciBuZWVkRGlyID0gZi5zbGljZSgtMSkgPT09ICcvJ1xuXG4gIGlmIChmLmxlbmd0aCA+IHRoaXMubWF4TGVuZ3RoKVxuICAgIHJldHVybiBjYigpXG5cbiAgaWYgKCF0aGlzLnN0YXQgJiYgb3duUHJvcCh0aGlzLmNhY2hlLCBhYnMpKSB7XG4gICAgdmFyIGMgPSB0aGlzLmNhY2hlW2Fic11cblxuICAgIGlmIChBcnJheS5pc0FycmF5KGMpKVxuICAgICAgYyA9ICdESVInXG5cbiAgICAvLyBJdCBleGlzdHMsIGJ1dCBtYXliZSBub3QgaG93IHdlIG5lZWQgaXRcbiAgICBpZiAoIW5lZWREaXIgfHwgYyA9PT0gJ0RJUicpXG4gICAgICByZXR1cm4gY2IobnVsbCwgYylcblxuICAgIGlmIChuZWVkRGlyICYmIGMgPT09ICdGSUxFJylcbiAgICAgIHJldHVybiBjYigpXG5cbiAgICAvLyBvdGhlcndpc2Ugd2UgaGF2ZSB0byBzdGF0LCBiZWNhdXNlIG1heWJlIGM9dHJ1ZVxuICAgIC8vIGlmIHdlIGtub3cgaXQgZXhpc3RzLCBidXQgbm90IHdoYXQgaXQgaXMuXG4gIH1cblxuICB2YXIgZXhpc3RzXG4gIHZhciBzdGF0ID0gdGhpcy5zdGF0Q2FjaGVbYWJzXVxuICBpZiAoc3RhdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHN0YXQgPT09IGZhbHNlKVxuICAgICAgcmV0dXJuIGNiKG51bGwsIHN0YXQpXG4gICAgZWxzZSB7XG4gICAgICB2YXIgdHlwZSA9IHN0YXQuaXNEaXJlY3RvcnkoKSA/ICdESVInIDogJ0ZJTEUnXG4gICAgICBpZiAobmVlZERpciAmJiB0eXBlID09PSAnRklMRScpXG4gICAgICAgIHJldHVybiBjYigpXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBjYihudWxsLCB0eXBlLCBzdGF0KVxuICAgIH1cbiAgfVxuXG4gIHZhciBzZWxmID0gdGhpc1xuICB2YXIgc3RhdGNiID0gaW5mbGlnaHQoJ3N0YXRcXDAnICsgYWJzLCBsc3RhdGNiXylcbiAgaWYgKHN0YXRjYilcbiAgICBzZWxmLmZzLmxzdGF0KGFicywgc3RhdGNiKVxuXG4gIGZ1bmN0aW9uIGxzdGF0Y2JfIChlciwgbHN0YXQpIHtcbiAgICBpZiAobHN0YXQgJiYgbHN0YXQuaXNTeW1ib2xpY0xpbmsoKSkge1xuICAgICAgLy8gSWYgaXQncyBhIHN5bWxpbmssIHRoZW4gdHJlYXQgaXQgYXMgdGhlIHRhcmdldCwgdW5sZXNzXG4gICAgICAvLyB0aGUgdGFyZ2V0IGRvZXMgbm90IGV4aXN0LCB0aGVuIHRyZWF0IGl0IGFzIGEgZmlsZS5cbiAgICAgIHJldHVybiBzZWxmLmZzLnN0YXQoYWJzLCBmdW5jdGlvbiAoZXIsIHN0YXQpIHtcbiAgICAgICAgaWYgKGVyKVxuICAgICAgICAgIHNlbGYuX3N0YXQyKGYsIGFicywgbnVsbCwgbHN0YXQsIGNiKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgc2VsZi5fc3RhdDIoZiwgYWJzLCBlciwgc3RhdCwgY2IpXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLl9zdGF0MihmLCBhYnMsIGVyLCBsc3RhdCwgY2IpXG4gICAgfVxuICB9XG59XG5cbkdsb2IucHJvdG90eXBlLl9zdGF0MiA9IGZ1bmN0aW9uIChmLCBhYnMsIGVyLCBzdGF0LCBjYikge1xuICBpZiAoZXIgJiYgKGVyLmNvZGUgPT09ICdFTk9FTlQnIHx8IGVyLmNvZGUgPT09ICdFTk9URElSJykpIHtcbiAgICB0aGlzLnN0YXRDYWNoZVthYnNdID0gZmFsc2VcbiAgICByZXR1cm4gY2IoKVxuICB9XG5cbiAgdmFyIG5lZWREaXIgPSBmLnNsaWNlKC0xKSA9PT0gJy8nXG4gIHRoaXMuc3RhdENhY2hlW2Fic10gPSBzdGF0XG5cbiAgaWYgKGFicy5zbGljZSgtMSkgPT09ICcvJyAmJiBzdGF0ICYmICFzdGF0LmlzRGlyZWN0b3J5KCkpXG4gICAgcmV0dXJuIGNiKG51bGwsIGZhbHNlLCBzdGF0KVxuXG4gIHZhciBjID0gdHJ1ZVxuICBpZiAoc3RhdClcbiAgICBjID0gc3RhdC5pc0RpcmVjdG9yeSgpID8gJ0RJUicgOiAnRklMRSdcbiAgdGhpcy5jYWNoZVthYnNdID0gdGhpcy5jYWNoZVthYnNdIHx8IGNcblxuICBpZiAobmVlZERpciAmJiBjID09PSAnRklMRScpXG4gICAgcmV0dXJuIGNiKClcblxuICByZXR1cm4gY2IobnVsbCwgYywgc3RhdClcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZ2xvYlN5bmNcbmdsb2JTeW5jLkdsb2JTeW5jID0gR2xvYlN5bmNcblxudmFyIHJwID0gcmVxdWlyZSgnZnMucmVhbHBhdGgnKVxudmFyIG1pbmltYXRjaCA9IHJlcXVpcmUoJ21pbmltYXRjaCcpXG52YXIgTWluaW1hdGNoID0gbWluaW1hdGNoLk1pbmltYXRjaFxudmFyIEdsb2IgPSByZXF1aXJlKCcuL2dsb2IuanMnKS5HbG9iXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKVxudmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJylcbnZhciBhc3NlcnQgPSByZXF1aXJlKCdhc3NlcnQnKVxudmFyIGlzQWJzb2x1dGUgPSByZXF1aXJlKCdwYXRoLWlzLWFic29sdXRlJylcbnZhciBjb21tb24gPSByZXF1aXJlKCcuL2NvbW1vbi5qcycpXG52YXIgc2V0b3B0cyA9IGNvbW1vbi5zZXRvcHRzXG52YXIgb3duUHJvcCA9IGNvbW1vbi5vd25Qcm9wXG52YXIgY2hpbGRyZW5JZ25vcmVkID0gY29tbW9uLmNoaWxkcmVuSWdub3JlZFxudmFyIGlzSWdub3JlZCA9IGNvbW1vbi5pc0lnbm9yZWRcblxuZnVuY3Rpb24gZ2xvYlN5bmMgKHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDMpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2FsbGJhY2sgcHJvdmlkZWQgdG8gc3luYyBnbG9iXFxuJytcbiAgICAgICAgICAgICAgICAgICAgICAgICdTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9pc2FhY3Mvbm9kZS1nbG9iL2lzc3Vlcy8xNjcnKVxuXG4gIHJldHVybiBuZXcgR2xvYlN5bmMocGF0dGVybiwgb3B0aW9ucykuZm91bmRcbn1cblxuZnVuY3Rpb24gR2xvYlN5bmMgKHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgaWYgKCFwYXR0ZXJuKVxuICAgIHRocm93IG5ldyBFcnJvcignbXVzdCBwcm92aWRlIHBhdHRlcm4nKVxuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJyB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAzKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2NhbGxiYWNrIHByb3ZpZGVkIHRvIHN5bmMgZ2xvYlxcbicrXG4gICAgICAgICAgICAgICAgICAgICAgICAnU2VlOiBodHRwczovL2dpdGh1Yi5jb20vaXNhYWNzL25vZGUtZ2xvYi9pc3N1ZXMvMTY3JylcblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgR2xvYlN5bmMpKVxuICAgIHJldHVybiBuZXcgR2xvYlN5bmMocGF0dGVybiwgb3B0aW9ucylcblxuICBzZXRvcHRzKHRoaXMsIHBhdHRlcm4sIG9wdGlvbnMpXG5cbiAgaWYgKHRoaXMubm9wcm9jZXNzKVxuICAgIHJldHVybiB0aGlzXG5cbiAgdmFyIG4gPSB0aGlzLm1pbmltYXRjaC5zZXQubGVuZ3RoXG4gIHRoaXMubWF0Y2hlcyA9IG5ldyBBcnJheShuKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkgKyspIHtcbiAgICB0aGlzLl9wcm9jZXNzKHRoaXMubWluaW1hdGNoLnNldFtpXSwgaSwgZmFsc2UpXG4gIH1cbiAgdGhpcy5fZmluaXNoKClcbn1cblxuR2xvYlN5bmMucHJvdG90eXBlLl9maW5pc2ggPSBmdW5jdGlvbiAoKSB7XG4gIGFzc2VydC5vayh0aGlzIGluc3RhbmNlb2YgR2xvYlN5bmMpXG4gIGlmICh0aGlzLnJlYWxwYXRoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgdGhpcy5tYXRjaGVzLmZvckVhY2goZnVuY3Rpb24gKG1hdGNoc2V0LCBpbmRleCkge1xuICAgICAgdmFyIHNldCA9IHNlbGYubWF0Y2hlc1tpbmRleF0gPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgICBmb3IgKHZhciBwIGluIG1hdGNoc2V0KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcCA9IHNlbGYuX21ha2VBYnMocClcbiAgICAgICAgICB2YXIgcmVhbCA9IHJwLnJlYWxwYXRoU3luYyhwLCBzZWxmLnJlYWxwYXRoQ2FjaGUpXG4gICAgICAgICAgc2V0W3JlYWxdID0gdHJ1ZVxuICAgICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICAgIGlmIChlci5zeXNjYWxsID09PSAnc3RhdCcpXG4gICAgICAgICAgICBzZXRbc2VsZi5fbWFrZUFicyhwKV0gPSB0cnVlXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgZXJcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgY29tbW9uLmZpbmlzaCh0aGlzKVxufVxuXG5cbkdsb2JTeW5jLnByb3RvdHlwZS5fcHJvY2VzcyA9IGZ1bmN0aW9uIChwYXR0ZXJuLCBpbmRleCwgaW5HbG9iU3Rhcikge1xuICBhc3NlcnQub2sodGhpcyBpbnN0YW5jZW9mIEdsb2JTeW5jKVxuXG4gIC8vIEdldCB0aGUgZmlyc3QgW25dIHBhcnRzIG9mIHBhdHRlcm4gdGhhdCBhcmUgYWxsIHN0cmluZ3MuXG4gIHZhciBuID0gMFxuICB3aGlsZSAodHlwZW9mIHBhdHRlcm5bbl0gPT09ICdzdHJpbmcnKSB7XG4gICAgbiArK1xuICB9XG4gIC8vIG5vdyBuIGlzIHRoZSBpbmRleCBvZiB0aGUgZmlyc3Qgb25lIHRoYXQgaXMgKm5vdCogYSBzdHJpbmcuXG5cbiAgLy8gU2VlIGlmIHRoZXJlJ3MgYW55dGhpbmcgZWxzZVxuICB2YXIgcHJlZml4XG4gIHN3aXRjaCAobikge1xuICAgIC8vIGlmIG5vdCwgdGhlbiB0aGlzIGlzIHJhdGhlciBzaW1wbGVcbiAgICBjYXNlIHBhdHRlcm4ubGVuZ3RoOlxuICAgICAgdGhpcy5fcHJvY2Vzc1NpbXBsZShwYXR0ZXJuLmpvaW4oJy8nKSwgaW5kZXgpXG4gICAgICByZXR1cm5cblxuICAgIGNhc2UgMDpcbiAgICAgIC8vIHBhdHRlcm4gKnN0YXJ0cyogd2l0aCBzb21lIG5vbi10cml2aWFsIGl0ZW0uXG4gICAgICAvLyBnb2luZyB0byByZWFkZGlyKGN3ZCksIGJ1dCBub3QgaW5jbHVkZSB0aGUgcHJlZml4IGluIG1hdGNoZXMuXG4gICAgICBwcmVmaXggPSBudWxsXG4gICAgICBicmVha1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIHBhdHRlcm4gaGFzIHNvbWUgc3RyaW5nIGJpdHMgaW4gdGhlIGZyb250LlxuICAgICAgLy8gd2hhdGV2ZXIgaXQgc3RhcnRzIHdpdGgsIHdoZXRoZXIgdGhhdCdzICdhYnNvbHV0ZScgbGlrZSAvZm9vL2JhcixcbiAgICAgIC8vIG9yICdyZWxhdGl2ZScgbGlrZSAnLi4vYmF6J1xuICAgICAgcHJlZml4ID0gcGF0dGVybi5zbGljZSgwLCBuKS5qb2luKCcvJylcbiAgICAgIGJyZWFrXG4gIH1cblxuICB2YXIgcmVtYWluID0gcGF0dGVybi5zbGljZShuKVxuXG4gIC8vIGdldCB0aGUgbGlzdCBvZiBlbnRyaWVzLlxuICB2YXIgcmVhZFxuICBpZiAocHJlZml4ID09PSBudWxsKVxuICAgIHJlYWQgPSAnLidcbiAgZWxzZSBpZiAoaXNBYnNvbHV0ZShwcmVmaXgpIHx8XG4gICAgICBpc0Fic29sdXRlKHBhdHRlcm4ubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgcCA9PT0gJ3N0cmluZycgPyBwIDogJ1sqXSdcbiAgICAgIH0pLmpvaW4oJy8nKSkpIHtcbiAgICBpZiAoIXByZWZpeCB8fCAhaXNBYnNvbHV0ZShwcmVmaXgpKVxuICAgICAgcHJlZml4ID0gJy8nICsgcHJlZml4XG4gICAgcmVhZCA9IHByZWZpeFxuICB9IGVsc2VcbiAgICByZWFkID0gcHJlZml4XG5cbiAgdmFyIGFicyA9IHRoaXMuX21ha2VBYnMocmVhZClcblxuICAvL2lmIGlnbm9yZWQsIHNraXAgcHJvY2Vzc2luZ1xuICBpZiAoY2hpbGRyZW5JZ25vcmVkKHRoaXMsIHJlYWQpKVxuICAgIHJldHVyblxuXG4gIHZhciBpc0dsb2JTdGFyID0gcmVtYWluWzBdID09PSBtaW5pbWF0Y2guR0xPQlNUQVJcbiAgaWYgKGlzR2xvYlN0YXIpXG4gICAgdGhpcy5fcHJvY2Vzc0dsb2JTdGFyKHByZWZpeCwgcmVhZCwgYWJzLCByZW1haW4sIGluZGV4LCBpbkdsb2JTdGFyKVxuICBlbHNlXG4gICAgdGhpcy5fcHJvY2Vzc1JlYWRkaXIocHJlZml4LCByZWFkLCBhYnMsIHJlbWFpbiwgaW5kZXgsIGluR2xvYlN0YXIpXG59XG5cblxuR2xvYlN5bmMucHJvdG90eXBlLl9wcm9jZXNzUmVhZGRpciA9IGZ1bmN0aW9uIChwcmVmaXgsIHJlYWQsIGFicywgcmVtYWluLCBpbmRleCwgaW5HbG9iU3Rhcikge1xuICB2YXIgZW50cmllcyA9IHRoaXMuX3JlYWRkaXIoYWJzLCBpbkdsb2JTdGFyKVxuXG4gIC8vIGlmIHRoZSBhYnMgaXNuJ3QgYSBkaXIsIHRoZW4gbm90aGluZyBjYW4gbWF0Y2ghXG4gIGlmICghZW50cmllcylcbiAgICByZXR1cm5cblxuICAvLyBJdCB3aWxsIG9ubHkgbWF0Y2ggZG90IGVudHJpZXMgaWYgaXQgc3RhcnRzIHdpdGggYSBkb3QsIG9yIGlmXG4gIC8vIGRvdCBpcyBzZXQuICBTdHVmZiBsaWtlIEAoLmZvb3wuYmFyKSBpc24ndCBhbGxvd2VkLlxuICB2YXIgcG4gPSByZW1haW5bMF1cbiAgdmFyIG5lZ2F0ZSA9ICEhdGhpcy5taW5pbWF0Y2gubmVnYXRlXG4gIHZhciByYXdHbG9iID0gcG4uX2dsb2JcbiAgdmFyIGRvdE9rID0gdGhpcy5kb3QgfHwgcmF3R2xvYi5jaGFyQXQoMCkgPT09ICcuJ1xuXG4gIHZhciBtYXRjaGVkRW50cmllcyA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBlID0gZW50cmllc1tpXVxuICAgIGlmIChlLmNoYXJBdCgwKSAhPT0gJy4nIHx8IGRvdE9rKSB7XG4gICAgICB2YXIgbVxuICAgICAgaWYgKG5lZ2F0ZSAmJiAhcHJlZml4KSB7XG4gICAgICAgIG0gPSAhZS5tYXRjaChwbilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG0gPSBlLm1hdGNoKHBuKVxuICAgICAgfVxuICAgICAgaWYgKG0pXG4gICAgICAgIG1hdGNoZWRFbnRyaWVzLnB1c2goZSlcbiAgICB9XG4gIH1cblxuICB2YXIgbGVuID0gbWF0Y2hlZEVudHJpZXMubGVuZ3RoXG4gIC8vIElmIHRoZXJlIGFyZSBubyBtYXRjaGVkIGVudHJpZXMsIHRoZW4gbm90aGluZyBtYXRjaGVzLlxuICBpZiAobGVuID09PSAwKVxuICAgIHJldHVyblxuXG4gIC8vIGlmIHRoaXMgaXMgdGhlIGxhc3QgcmVtYWluaW5nIHBhdHRlcm4gYml0LCB0aGVuIG5vIG5lZWQgZm9yXG4gIC8vIGFuIGFkZGl0aW9uYWwgc3RhdCAqdW5sZXNzKiB0aGUgdXNlciBoYXMgc3BlY2lmaWVkIG1hcmsgb3JcbiAgLy8gc3RhdCBleHBsaWNpdGx5LiAgV2Uga25vdyB0aGV5IGV4aXN0LCBzaW5jZSByZWFkZGlyIHJldHVybmVkXG4gIC8vIHRoZW0uXG5cbiAgaWYgKHJlbWFpbi5sZW5ndGggPT09IDEgJiYgIXRoaXMubWFyayAmJiAhdGhpcy5zdGF0KSB7XG4gICAgaWYgKCF0aGlzLm1hdGNoZXNbaW5kZXhdKVxuICAgICAgdGhpcy5tYXRjaGVzW2luZGV4XSA9IE9iamVjdC5jcmVhdGUobnVsbClcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICsrKSB7XG4gICAgICB2YXIgZSA9IG1hdGNoZWRFbnRyaWVzW2ldXG4gICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgIGlmIChwcmVmaXguc2xpY2UoLTEpICE9PSAnLycpXG4gICAgICAgICAgZSA9IHByZWZpeCArICcvJyArIGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGUgPSBwcmVmaXggKyBlXG4gICAgICB9XG5cbiAgICAgIGlmIChlLmNoYXJBdCgwKSA9PT0gJy8nICYmICF0aGlzLm5vbW91bnQpIHtcbiAgICAgICAgZSA9IHBhdGguam9pbih0aGlzLnJvb3QsIGUpXG4gICAgICB9XG4gICAgICB0aGlzLl9lbWl0TWF0Y2goaW5kZXgsIGUpXG4gICAgfVxuICAgIC8vIFRoaXMgd2FzIHRoZSBsYXN0IG9uZSwgYW5kIG5vIHN0YXRzIHdlcmUgbmVlZGVkXG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBub3cgdGVzdCBhbGwgbWF0Y2hlZCBlbnRyaWVzIGFzIHN0YW5kLWlucyBmb3IgdGhhdCBwYXJ0XG4gIC8vIG9mIHRoZSBwYXR0ZXJuLlxuICByZW1haW4uc2hpZnQoKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArKykge1xuICAgIHZhciBlID0gbWF0Y2hlZEVudHJpZXNbaV1cbiAgICB2YXIgbmV3UGF0dGVyblxuICAgIGlmIChwcmVmaXgpXG4gICAgICBuZXdQYXR0ZXJuID0gW3ByZWZpeCwgZV1cbiAgICBlbHNlXG4gICAgICBuZXdQYXR0ZXJuID0gW2VdXG4gICAgdGhpcy5fcHJvY2VzcyhuZXdQYXR0ZXJuLmNvbmNhdChyZW1haW4pLCBpbmRleCwgaW5HbG9iU3RhcilcbiAgfVxufVxuXG5cbkdsb2JTeW5jLnByb3RvdHlwZS5fZW1pdE1hdGNoID0gZnVuY3Rpb24gKGluZGV4LCBlKSB7XG4gIGlmIChpc0lnbm9yZWQodGhpcywgZSkpXG4gICAgcmV0dXJuXG5cbiAgdmFyIGFicyA9IHRoaXMuX21ha2VBYnMoZSlcblxuICBpZiAodGhpcy5tYXJrKVxuICAgIGUgPSB0aGlzLl9tYXJrKGUpXG5cbiAgaWYgKHRoaXMuYWJzb2x1dGUpIHtcbiAgICBlID0gYWJzXG4gIH1cblxuICBpZiAodGhpcy5tYXRjaGVzW2luZGV4XVtlXSlcbiAgICByZXR1cm5cblxuICBpZiAodGhpcy5ub2Rpcikge1xuICAgIHZhciBjID0gdGhpcy5jYWNoZVthYnNdXG4gICAgaWYgKGMgPT09ICdESVInIHx8IEFycmF5LmlzQXJyYXkoYykpXG4gICAgICByZXR1cm5cbiAgfVxuXG4gIHRoaXMubWF0Y2hlc1tpbmRleF1bZV0gPSB0cnVlXG5cbiAgaWYgKHRoaXMuc3RhdClcbiAgICB0aGlzLl9zdGF0KGUpXG59XG5cblxuR2xvYlN5bmMucHJvdG90eXBlLl9yZWFkZGlySW5HbG9iU3RhciA9IGZ1bmN0aW9uIChhYnMpIHtcbiAgLy8gZm9sbG93IGFsbCBzeW1saW5rZWQgZGlyZWN0b3JpZXMgZm9yZXZlclxuICAvLyBqdXN0IHByb2NlZWQgYXMgaWYgdGhpcyBpcyBhIG5vbi1nbG9ic3RhciBzaXR1YXRpb25cbiAgaWYgKHRoaXMuZm9sbG93KVxuICAgIHJldHVybiB0aGlzLl9yZWFkZGlyKGFicywgZmFsc2UpXG5cbiAgdmFyIGVudHJpZXNcbiAgdmFyIGxzdGF0XG4gIHZhciBzdGF0XG4gIHRyeSB7XG4gICAgbHN0YXQgPSB0aGlzLmZzLmxzdGF0U3luYyhhYnMpXG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgaWYgKGVyLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAvLyBsc3RhdCBmYWlsZWQsIGRvZXNuJ3QgZXhpc3RcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgdmFyIGlzU3ltID0gbHN0YXQgJiYgbHN0YXQuaXNTeW1ib2xpY0xpbmsoKVxuICB0aGlzLnN5bWxpbmtzW2Fic10gPSBpc1N5bVxuXG4gIC8vIElmIGl0J3Mgbm90IGEgc3ltbGluayBvciBhIGRpciwgdGhlbiBpdCdzIGRlZmluaXRlbHkgYSByZWd1bGFyIGZpbGUuXG4gIC8vIGRvbid0IGJvdGhlciBkb2luZyBhIHJlYWRkaXIgaW4gdGhhdCBjYXNlLlxuICBpZiAoIWlzU3ltICYmIGxzdGF0ICYmICFsc3RhdC5pc0RpcmVjdG9yeSgpKVxuICAgIHRoaXMuY2FjaGVbYWJzXSA9ICdGSUxFJ1xuICBlbHNlXG4gICAgZW50cmllcyA9IHRoaXMuX3JlYWRkaXIoYWJzLCBmYWxzZSlcblxuICByZXR1cm4gZW50cmllc1xufVxuXG5HbG9iU3luYy5wcm90b3R5cGUuX3JlYWRkaXIgPSBmdW5jdGlvbiAoYWJzLCBpbkdsb2JTdGFyKSB7XG4gIHZhciBlbnRyaWVzXG5cbiAgaWYgKGluR2xvYlN0YXIgJiYgIW93blByb3AodGhpcy5zeW1saW5rcywgYWJzKSlcbiAgICByZXR1cm4gdGhpcy5fcmVhZGRpckluR2xvYlN0YXIoYWJzKVxuXG4gIGlmIChvd25Qcm9wKHRoaXMuY2FjaGUsIGFicykpIHtcbiAgICB2YXIgYyA9IHRoaXMuY2FjaGVbYWJzXVxuICAgIGlmICghYyB8fCBjID09PSAnRklMRScpXG4gICAgICByZXR1cm4gbnVsbFxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYykpXG4gICAgICByZXR1cm4gY1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gdGhpcy5fcmVhZGRpckVudHJpZXMoYWJzLCB0aGlzLmZzLnJlYWRkaXJTeW5jKGFicykpXG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgdGhpcy5fcmVhZGRpckVycm9yKGFicywgZXIpXG4gICAgcmV0dXJuIG51bGxcbiAgfVxufVxuXG5HbG9iU3luYy5wcm90b3R5cGUuX3JlYWRkaXJFbnRyaWVzID0gZnVuY3Rpb24gKGFicywgZW50cmllcykge1xuICAvLyBpZiB3ZSBoYXZlbid0IGFza2VkIHRvIHN0YXQgZXZlcnl0aGluZywgdGhlbiBqdXN0XG4gIC8vIGFzc3VtZSB0aGF0IGV2ZXJ5dGhpbmcgaW4gdGhlcmUgZXhpc3RzLCBzbyB3ZSBjYW4gYXZvaWRcbiAgLy8gaGF2aW5nIHRvIHN0YXQgaXQgYSBzZWNvbmQgdGltZS5cbiAgaWYgKCF0aGlzLm1hcmsgJiYgIXRoaXMuc3RhdCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkgKyspIHtcbiAgICAgIHZhciBlID0gZW50cmllc1tpXVxuICAgICAgaWYgKGFicyA9PT0gJy8nKVxuICAgICAgICBlID0gYWJzICsgZVxuICAgICAgZWxzZVxuICAgICAgICBlID0gYWJzICsgJy8nICsgZVxuICAgICAgdGhpcy5jYWNoZVtlXSA9IHRydWVcbiAgICB9XG4gIH1cblxuICB0aGlzLmNhY2hlW2Fic10gPSBlbnRyaWVzXG5cbiAgLy8gbWFyayBhbmQgY2FjaGUgZGlyLW5lc3NcbiAgcmV0dXJuIGVudHJpZXNcbn1cblxuR2xvYlN5bmMucHJvdG90eXBlLl9yZWFkZGlyRXJyb3IgPSBmdW5jdGlvbiAoZiwgZXIpIHtcbiAgLy8gaGFuZGxlIGVycm9ycywgYW5kIGNhY2hlIHRoZSBpbmZvcm1hdGlvblxuICBzd2l0Y2ggKGVyLmNvZGUpIHtcbiAgICBjYXNlICdFTk9UU1VQJzogLy8gaHR0cHM6Ly9naXRodWIuY29tL2lzYWFjcy9ub2RlLWdsb2IvaXNzdWVzLzIwNVxuICAgIGNhc2UgJ0VOT1RESVInOiAvLyB0b3RhbGx5IG5vcm1hbC4gbWVhbnMgaXQgKmRvZXMqIGV4aXN0LlxuICAgICAgdmFyIGFicyA9IHRoaXMuX21ha2VBYnMoZilcbiAgICAgIHRoaXMuY2FjaGVbYWJzXSA9ICdGSUxFJ1xuICAgICAgaWYgKGFicyA9PT0gdGhpcy5jd2RBYnMpIHtcbiAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKGVyLmNvZGUgKyAnIGludmFsaWQgY3dkICcgKyB0aGlzLmN3ZClcbiAgICAgICAgZXJyb3IucGF0aCA9IHRoaXMuY3dkXG4gICAgICAgIGVycm9yLmNvZGUgPSBlci5jb2RlXG4gICAgICAgIHRocm93IGVycm9yXG4gICAgICB9XG4gICAgICBicmVha1xuXG4gICAgY2FzZSAnRU5PRU5UJzogLy8gbm90IHRlcnJpYmx5IHVudXN1YWxcbiAgICBjYXNlICdFTE9PUCc6XG4gICAgY2FzZSAnRU5BTUVUT09MT05HJzpcbiAgICBjYXNlICdVTktOT1dOJzpcbiAgICAgIHRoaXMuY2FjaGVbdGhpcy5fbWFrZUFicyhmKV0gPSBmYWxzZVxuICAgICAgYnJlYWtcblxuICAgIGRlZmF1bHQ6IC8vIHNvbWUgdW51c3VhbCBlcnJvci4gIFRyZWF0IGFzIGZhaWx1cmUuXG4gICAgICB0aGlzLmNhY2hlW3RoaXMuX21ha2VBYnMoZildID0gZmFsc2VcbiAgICAgIGlmICh0aGlzLnN0cmljdClcbiAgICAgICAgdGhyb3cgZXJcbiAgICAgIGlmICghdGhpcy5zaWxlbnQpXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ2dsb2IgZXJyb3InLCBlcilcbiAgICAgIGJyZWFrXG4gIH1cbn1cblxuR2xvYlN5bmMucHJvdG90eXBlLl9wcm9jZXNzR2xvYlN0YXIgPSBmdW5jdGlvbiAocHJlZml4LCByZWFkLCBhYnMsIHJlbWFpbiwgaW5kZXgsIGluR2xvYlN0YXIpIHtcblxuICB2YXIgZW50cmllcyA9IHRoaXMuX3JlYWRkaXIoYWJzLCBpbkdsb2JTdGFyKVxuXG4gIC8vIG5vIGVudHJpZXMgbWVhbnMgbm90IGEgZGlyLCBzbyBpdCBjYW4gbmV2ZXIgaGF2ZSBtYXRjaGVzXG4gIC8vIGZvby50eHQvKiogZG9lc24ndCBtYXRjaCBmb28udHh0XG4gIGlmICghZW50cmllcylcbiAgICByZXR1cm5cblxuICAvLyB0ZXN0IHdpdGhvdXQgdGhlIGdsb2JzdGFyLCBhbmQgd2l0aCBldmVyeSBjaGlsZCBib3RoIGJlbG93XG4gIC8vIGFuZCByZXBsYWNpbmcgdGhlIGdsb2JzdGFyLlxuICB2YXIgcmVtYWluV2l0aG91dEdsb2JTdGFyID0gcmVtYWluLnNsaWNlKDEpXG4gIHZhciBnc3ByZWYgPSBwcmVmaXggPyBbIHByZWZpeCBdIDogW11cbiAgdmFyIG5vR2xvYlN0YXIgPSBnc3ByZWYuY29uY2F0KHJlbWFpbldpdGhvdXRHbG9iU3RhcilcblxuICAvLyB0aGUgbm9HbG9iU3RhciBwYXR0ZXJuIGV4aXRzIHRoZSBpbkdsb2JTdGFyIHN0YXRlXG4gIHRoaXMuX3Byb2Nlc3Mobm9HbG9iU3RhciwgaW5kZXgsIGZhbHNlKVxuXG4gIHZhciBsZW4gPSBlbnRyaWVzLmxlbmd0aFxuICB2YXIgaXNTeW0gPSB0aGlzLnN5bWxpbmtzW2Fic11cblxuICAvLyBJZiBpdCdzIGEgc3ltbGluaywgYW5kIHdlJ3JlIGluIGEgZ2xvYnN0YXIsIHRoZW4gc3RvcFxuICBpZiAoaXNTeW0gJiYgaW5HbG9iU3RhcilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdmFyIGUgPSBlbnRyaWVzW2ldXG4gICAgaWYgKGUuY2hhckF0KDApID09PSAnLicgJiYgIXRoaXMuZG90KVxuICAgICAgY29udGludWVcblxuICAgIC8vIHRoZXNlIHR3byBjYXNlcyBlbnRlciB0aGUgaW5HbG9iU3RhciBzdGF0ZVxuICAgIHZhciBpbnN0ZWFkID0gZ3NwcmVmLmNvbmNhdChlbnRyaWVzW2ldLCByZW1haW5XaXRob3V0R2xvYlN0YXIpXG4gICAgdGhpcy5fcHJvY2VzcyhpbnN0ZWFkLCBpbmRleCwgdHJ1ZSlcblxuICAgIHZhciBiZWxvdyA9IGdzcHJlZi5jb25jYXQoZW50cmllc1tpXSwgcmVtYWluKVxuICAgIHRoaXMuX3Byb2Nlc3MoYmVsb3csIGluZGV4LCB0cnVlKVxuICB9XG59XG5cbkdsb2JTeW5jLnByb3RvdHlwZS5fcHJvY2Vzc1NpbXBsZSA9IGZ1bmN0aW9uIChwcmVmaXgsIGluZGV4KSB7XG4gIC8vIFhYWCByZXZpZXcgdGhpcy4gIFNob3VsZG4ndCBpdCBiZSBkb2luZyB0aGUgbW91bnRpbmcgZXRjXG4gIC8vIGJlZm9yZSBkb2luZyBzdGF0PyAga2luZGEgd2VpcmQ/XG4gIHZhciBleGlzdHMgPSB0aGlzLl9zdGF0KHByZWZpeClcblxuICBpZiAoIXRoaXMubWF0Y2hlc1tpbmRleF0pXG4gICAgdGhpcy5tYXRjaGVzW2luZGV4XSA9IE9iamVjdC5jcmVhdGUobnVsbClcblxuICAvLyBJZiBpdCBkb2Vzbid0IGV4aXN0LCB0aGVuIGp1c3QgbWFyayB0aGUgbGFjayBvZiByZXN1bHRzXG4gIGlmICghZXhpc3RzKVxuICAgIHJldHVyblxuXG4gIGlmIChwcmVmaXggJiYgaXNBYnNvbHV0ZShwcmVmaXgpICYmICF0aGlzLm5vbW91bnQpIHtcbiAgICB2YXIgdHJhaWwgPSAvW1xcL1xcXFxdJC8udGVzdChwcmVmaXgpXG4gICAgaWYgKHByZWZpeC5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgICAgcHJlZml4ID0gcGF0aC5qb2luKHRoaXMucm9vdCwgcHJlZml4KVxuICAgIH0gZWxzZSB7XG4gICAgICBwcmVmaXggPSBwYXRoLnJlc29sdmUodGhpcy5yb290LCBwcmVmaXgpXG4gICAgICBpZiAodHJhaWwpXG4gICAgICAgIHByZWZpeCArPSAnLydcbiAgICB9XG4gIH1cblxuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJylcbiAgICBwcmVmaXggPSBwcmVmaXgucmVwbGFjZSgvXFxcXC9nLCAnLycpXG5cbiAgLy8gTWFyayB0aGlzIGFzIGEgbWF0Y2hcbiAgdGhpcy5fZW1pdE1hdGNoKGluZGV4LCBwcmVmaXgpXG59XG5cbi8vIFJldHVybnMgZWl0aGVyICdESVInLCAnRklMRScsIG9yIGZhbHNlXG5HbG9iU3luYy5wcm90b3R5cGUuX3N0YXQgPSBmdW5jdGlvbiAoZikge1xuICB2YXIgYWJzID0gdGhpcy5fbWFrZUFicyhmKVxuICB2YXIgbmVlZERpciA9IGYuc2xpY2UoLTEpID09PSAnLydcblxuICBpZiAoZi5sZW5ndGggPiB0aGlzLm1heExlbmd0aClcbiAgICByZXR1cm4gZmFsc2VcblxuICBpZiAoIXRoaXMuc3RhdCAmJiBvd25Qcm9wKHRoaXMuY2FjaGUsIGFicykpIHtcbiAgICB2YXIgYyA9IHRoaXMuY2FjaGVbYWJzXVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYykpXG4gICAgICBjID0gJ0RJUidcblxuICAgIC8vIEl0IGV4aXN0cywgYnV0IG1heWJlIG5vdCBob3cgd2UgbmVlZCBpdFxuICAgIGlmICghbmVlZERpciB8fCBjID09PSAnRElSJylcbiAgICAgIHJldHVybiBjXG5cbiAgICBpZiAobmVlZERpciAmJiBjID09PSAnRklMRScpXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIC8vIG90aGVyd2lzZSB3ZSBoYXZlIHRvIHN0YXQsIGJlY2F1c2UgbWF5YmUgYz10cnVlXG4gICAgLy8gaWYgd2Uga25vdyBpdCBleGlzdHMsIGJ1dCBub3Qgd2hhdCBpdCBpcy5cbiAgfVxuXG4gIHZhciBleGlzdHNcbiAgdmFyIHN0YXQgPSB0aGlzLnN0YXRDYWNoZVthYnNdXG4gIGlmICghc3RhdCkge1xuICAgIHZhciBsc3RhdFxuICAgIHRyeSB7XG4gICAgICBsc3RhdCA9IHRoaXMuZnMubHN0YXRTeW5jKGFicylcbiAgICB9IGNhdGNoIChlcikge1xuICAgICAgaWYgKGVyICYmIChlci5jb2RlID09PSAnRU5PRU5UJyB8fCBlci5jb2RlID09PSAnRU5PVERJUicpKSB7XG4gICAgICAgIHRoaXMuc3RhdENhY2hlW2Fic10gPSBmYWxzZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobHN0YXQgJiYgbHN0YXQuaXNTeW1ib2xpY0xpbmsoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgc3RhdCA9IHRoaXMuZnMuc3RhdFN5bmMoYWJzKVxuICAgICAgfSBjYXRjaCAoZXIpIHtcbiAgICAgICAgc3RhdCA9IGxzdGF0XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXQgPSBsc3RhdFxuICAgIH1cbiAgfVxuXG4gIHRoaXMuc3RhdENhY2hlW2Fic10gPSBzdGF0XG5cbiAgdmFyIGMgPSB0cnVlXG4gIGlmIChzdGF0KVxuICAgIGMgPSBzdGF0LmlzRGlyZWN0b3J5KCkgPyAnRElSJyA6ICdGSUxFJ1xuXG4gIHRoaXMuY2FjaGVbYWJzXSA9IHRoaXMuY2FjaGVbYWJzXSB8fCBjXG5cbiAgaWYgKG5lZWREaXIgJiYgYyA9PT0gJ0ZJTEUnKVxuICAgIHJldHVybiBmYWxzZVxuXG4gIHJldHVybiBjXG59XG5cbkdsb2JTeW5jLnByb3RvdHlwZS5fbWFyayA9IGZ1bmN0aW9uIChwKSB7XG4gIHJldHVybiBjb21tb24ubWFyayh0aGlzLCBwKVxufVxuXG5HbG9iU3luYy5wcm90b3R5cGUuX21ha2VBYnMgPSBmdW5jdGlvbiAoZikge1xuICByZXR1cm4gY29tbW9uLm1ha2VBYnModGhpcywgZilcbn1cbiIsInZhciB3cmFwcHkgPSByZXF1aXJlKCd3cmFwcHknKVxudmFyIHJlcXMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG52YXIgb25jZSA9IHJlcXVpcmUoJ29uY2UnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdyYXBweShpbmZsaWdodClcblxuZnVuY3Rpb24gaW5mbGlnaHQgKGtleSwgY2IpIHtcbiAgaWYgKHJlcXNba2V5XSkge1xuICAgIHJlcXNba2V5XS5wdXNoKGNiKVxuICAgIHJldHVybiBudWxsXG4gIH0gZWxzZSB7XG4gICAgcmVxc1trZXldID0gW2NiXVxuICAgIHJldHVybiBtYWtlcmVzKGtleSlcbiAgfVxufVxuXG5mdW5jdGlvbiBtYWtlcmVzIChrZXkpIHtcbiAgcmV0dXJuIG9uY2UoZnVuY3Rpb24gUkVTICgpIHtcbiAgICB2YXIgY2JzID0gcmVxc1trZXldXG4gICAgdmFyIGxlbiA9IGNicy5sZW5ndGhcbiAgICB2YXIgYXJncyA9IHNsaWNlKGFyZ3VtZW50cylcblxuICAgIC8vIFhYWCBJdCdzIHNvbWV3aGF0IGFtYmlndW91cyB3aGV0aGVyIGEgbmV3IGNhbGxiYWNrIGFkZGVkIGluIHRoaXNcbiAgICAvLyBwYXNzIHNob3VsZCBiZSBxdWV1ZWQgZm9yIGxhdGVyIGV4ZWN1dGlvbiBpZiBzb21ldGhpbmcgaW4gdGhlXG4gICAgLy8gbGlzdCBvZiBjYWxsYmFja3MgdGhyb3dzLCBvciBpZiBpdCBzaG91bGQganVzdCBiZSBkaXNjYXJkZWQuXG4gICAgLy8gSG93ZXZlciwgaXQncyBzdWNoIGFuIGVkZ2UgY2FzZSB0aGF0IGl0IGhhcmRseSBtYXR0ZXJzLCBhbmQgZWl0aGVyXG4gICAgLy8gY2hvaWNlIGlzIGxpa2VseSBhcyBzdXJwcmlzaW5nIGFzIHRoZSBvdGhlci5cbiAgICAvLyBBcyBpdCBoYXBwZW5zLCB3ZSBkbyBnbyBhaGVhZCBhbmQgc2NoZWR1bGUgaXQgZm9yIGxhdGVyIGV4ZWN1dGlvbi5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBjYnNbaV0uYXBwbHkobnVsbCwgYXJncylcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKGNicy5sZW5ndGggPiBsZW4pIHtcbiAgICAgICAgLy8gYWRkZWQgbW9yZSBpbiB0aGUgaW50ZXJpbS5cbiAgICAgICAgLy8gZGUtemFsZ28sIGp1c3QgaW4gY2FzZSwgYnV0IGRvbid0IGNhbGwgYWdhaW4uXG4gICAgICAgIGNicy5zcGxpY2UoMCwgbGVuKVxuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBSRVMuYXBwbHkobnVsbCwgYXJncylcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlbGV0ZSByZXFzW2tleV1cbiAgICAgIH1cbiAgICB9XG4gIH0pXG59XG5cbmZ1bmN0aW9uIHNsaWNlIChhcmdzKSB7XG4gIHZhciBsZW5ndGggPSBhcmdzLmxlbmd0aFxuICB2YXIgYXJyYXkgPSBbXVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIGFycmF5W2ldID0gYXJnc1tpXVxuICByZXR1cm4gYXJyYXlcbn1cbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGlmIChzdXBlckN0b3IpIHtcbiAgICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgaWYgKHN1cGVyQ3Rvcikge1xuICAgICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgICB9XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gbWluaW1hdGNoXG5taW5pbWF0Y2guTWluaW1hdGNoID0gTWluaW1hdGNoXG5cbnZhciBwYXRoID0gKGZ1bmN0aW9uICgpIHsgdHJ5IHsgcmV0dXJuIHJlcXVpcmUoJ3BhdGgnKSB9IGNhdGNoIChlKSB7fX0oKSkgfHwge1xuICBzZXA6ICcvJ1xufVxubWluaW1hdGNoLnNlcCA9IHBhdGguc2VwXG5cbnZhciBHTE9CU1RBUiA9IG1pbmltYXRjaC5HTE9CU1RBUiA9IE1pbmltYXRjaC5HTE9CU1RBUiA9IHt9XG52YXIgZXhwYW5kID0gcmVxdWlyZSgnYnJhY2UtZXhwYW5zaW9uJylcblxudmFyIHBsVHlwZXMgPSB7XG4gICchJzogeyBvcGVuOiAnKD86KD8hKD86JywgY2xvc2U6ICcpKVteL10qPyknfSxcbiAgJz8nOiB7IG9wZW46ICcoPzonLCBjbG9zZTogJyk/JyB9LFxuICAnKyc6IHsgb3BlbjogJyg/OicsIGNsb3NlOiAnKSsnIH0sXG4gICcqJzogeyBvcGVuOiAnKD86JywgY2xvc2U6ICcpKicgfSxcbiAgJ0AnOiB7IG9wZW46ICcoPzonLCBjbG9zZTogJyknIH1cbn1cblxuLy8gYW55IHNpbmdsZSB0aGluZyBvdGhlciB0aGFuIC9cbi8vIGRvbid0IG5lZWQgdG8gZXNjYXBlIC8gd2hlbiB1c2luZyBuZXcgUmVnRXhwKClcbnZhciBxbWFyayA9ICdbXi9dJ1xuXG4vLyAqID0+IGFueSBudW1iZXIgb2YgY2hhcmFjdGVyc1xudmFyIHN0YXIgPSBxbWFyayArICcqPydcblxuLy8gKiogd2hlbiBkb3RzIGFyZSBhbGxvd2VkLiAgQW55dGhpbmcgZ29lcywgZXhjZXB0IC4uIGFuZCAuXG4vLyBub3QgKF4gb3IgLyBmb2xsb3dlZCBieSBvbmUgb3IgdHdvIGRvdHMgZm9sbG93ZWQgYnkgJCBvciAvKSxcbi8vIGZvbGxvd2VkIGJ5IGFueXRoaW5nLCBhbnkgbnVtYmVyIG9mIHRpbWVzLlxudmFyIHR3b1N0YXJEb3QgPSAnKD86KD8hKD86XFxcXFxcL3xeKSg/OlxcXFwuezEsMn0pKCR8XFxcXFxcLykpLikqPydcblxuLy8gbm90IGEgXiBvciAvIGZvbGxvd2VkIGJ5IGEgZG90LFxuLy8gZm9sbG93ZWQgYnkgYW55dGhpbmcsIGFueSBudW1iZXIgb2YgdGltZXMuXG52YXIgdHdvU3Rhck5vRG90ID0gJyg/Oig/ISg/OlxcXFxcXC98XilcXFxcLikuKSo/J1xuXG4vLyBjaGFyYWN0ZXJzIHRoYXQgbmVlZCB0byBiZSBlc2NhcGVkIGluIFJlZ0V4cC5cbnZhciByZVNwZWNpYWxzID0gY2hhclNldCgnKCkuKnt9Kz9bXV4kXFxcXCEnKVxuXG4vLyBcImFiY1wiIC0+IHsgYTp0cnVlLCBiOnRydWUsIGM6dHJ1ZSB9XG5mdW5jdGlvbiBjaGFyU2V0IChzKSB7XG4gIHJldHVybiBzLnNwbGl0KCcnKS5yZWR1Y2UoZnVuY3Rpb24gKHNldCwgYykge1xuICAgIHNldFtjXSA9IHRydWVcbiAgICByZXR1cm4gc2V0XG4gIH0sIHt9KVxufVxuXG4vLyBub3JtYWxpemVzIHNsYXNoZXMuXG52YXIgc2xhc2hTcGxpdCA9IC9cXC8rL1xuXG5taW5pbWF0Y2guZmlsdGVyID0gZmlsdGVyXG5mdW5jdGlvbiBmaWx0ZXIgKHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgcmV0dXJuIGZ1bmN0aW9uIChwLCBpLCBsaXN0KSB7XG4gICAgcmV0dXJuIG1pbmltYXRjaChwLCBwYXR0ZXJuLCBvcHRpb25zKVxuICB9XG59XG5cbmZ1bmN0aW9uIGV4dCAoYSwgYikge1xuICBiID0gYiB8fCB7fVxuICB2YXIgdCA9IHt9XG4gIE9iamVjdC5rZXlzKGEpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICB0W2tdID0gYVtrXVxuICB9KVxuICBPYmplY3Qua2V5cyhiKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgdFtrXSA9IGJba11cbiAgfSlcbiAgcmV0dXJuIHRcbn1cblxubWluaW1hdGNoLmRlZmF1bHRzID0gZnVuY3Rpb24gKGRlZikge1xuICBpZiAoIWRlZiB8fCB0eXBlb2YgZGVmICE9PSAnb2JqZWN0JyB8fCAhT2JqZWN0LmtleXMoZGVmKS5sZW5ndGgpIHtcbiAgICByZXR1cm4gbWluaW1hdGNoXG4gIH1cblxuICB2YXIgb3JpZyA9IG1pbmltYXRjaFxuXG4gIHZhciBtID0gZnVuY3Rpb24gbWluaW1hdGNoIChwLCBwYXR0ZXJuLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG9yaWcocCwgcGF0dGVybiwgZXh0KGRlZiwgb3B0aW9ucykpXG4gIH1cblxuICBtLk1pbmltYXRjaCA9IGZ1bmN0aW9uIE1pbmltYXRjaCAocGF0dGVybiwgb3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgb3JpZy5NaW5pbWF0Y2gocGF0dGVybiwgZXh0KGRlZiwgb3B0aW9ucykpXG4gIH1cbiAgbS5NaW5pbWF0Y2guZGVmYXVsdHMgPSBmdW5jdGlvbiBkZWZhdWx0cyAob3B0aW9ucykge1xuICAgIHJldHVybiBvcmlnLmRlZmF1bHRzKGV4dChkZWYsIG9wdGlvbnMpKS5NaW5pbWF0Y2hcbiAgfVxuXG4gIG0uZmlsdGVyID0gZnVuY3Rpb24gZmlsdGVyIChwYXR0ZXJuLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG9yaWcuZmlsdGVyKHBhdHRlcm4sIGV4dChkZWYsIG9wdGlvbnMpKVxuICB9XG5cbiAgbS5kZWZhdWx0cyA9IGZ1bmN0aW9uIGRlZmF1bHRzIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIG9yaWcuZGVmYXVsdHMoZXh0KGRlZiwgb3B0aW9ucykpXG4gIH1cblxuICBtLm1ha2VSZSA9IGZ1bmN0aW9uIG1ha2VSZSAocGF0dGVybiwgb3B0aW9ucykge1xuICAgIHJldHVybiBvcmlnLm1ha2VSZShwYXR0ZXJuLCBleHQoZGVmLCBvcHRpb25zKSlcbiAgfVxuXG4gIG0uYnJhY2VFeHBhbmQgPSBmdW5jdGlvbiBicmFjZUV4cGFuZCAocGF0dGVybiwgb3B0aW9ucykge1xuICAgIHJldHVybiBvcmlnLmJyYWNlRXhwYW5kKHBhdHRlcm4sIGV4dChkZWYsIG9wdGlvbnMpKVxuICB9XG5cbiAgbS5tYXRjaCA9IGZ1bmN0aW9uIChsaXN0LCBwYXR0ZXJuLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG9yaWcubWF0Y2gobGlzdCwgcGF0dGVybiwgZXh0KGRlZiwgb3B0aW9ucykpXG4gIH1cblxuICByZXR1cm4gbVxufVxuXG5NaW5pbWF0Y2guZGVmYXVsdHMgPSBmdW5jdGlvbiAoZGVmKSB7XG4gIHJldHVybiBtaW5pbWF0Y2guZGVmYXVsdHMoZGVmKS5NaW5pbWF0Y2hcbn1cblxuZnVuY3Rpb24gbWluaW1hdGNoIChwLCBwYXR0ZXJuLCBvcHRpb25zKSB7XG4gIGFzc2VydFZhbGlkUGF0dGVybihwYXR0ZXJuKVxuXG4gIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9XG5cbiAgLy8gc2hvcnRjdXQ6IGNvbW1lbnRzIG1hdGNoIG5vdGhpbmcuXG4gIGlmICghb3B0aW9ucy5ub2NvbW1lbnQgJiYgcGF0dGVybi5jaGFyQXQoMCkgPT09ICcjJykge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIG5ldyBNaW5pbWF0Y2gocGF0dGVybiwgb3B0aW9ucykubWF0Y2gocClcbn1cblxuZnVuY3Rpb24gTWluaW1hdGNoIChwYXR0ZXJuLCBvcHRpb25zKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBNaW5pbWF0Y2gpKSB7XG4gICAgcmV0dXJuIG5ldyBNaW5pbWF0Y2gocGF0dGVybiwgb3B0aW9ucylcbiAgfVxuXG4gIGFzc2VydFZhbGlkUGF0dGVybihwYXR0ZXJuKVxuXG4gIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9XG5cbiAgcGF0dGVybiA9IHBhdHRlcm4udHJpbSgpXG5cbiAgLy8gd2luZG93cyBzdXBwb3J0OiBuZWVkIHRvIHVzZSAvLCBub3QgXFxcbiAgaWYgKCFvcHRpb25zLmFsbG93V2luZG93c0VzY2FwZSAmJiBwYXRoLnNlcCAhPT0gJy8nKSB7XG4gICAgcGF0dGVybiA9IHBhdHRlcm4uc3BsaXQocGF0aC5zZXApLmpvaW4oJy8nKVxuICB9XG5cbiAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICB0aGlzLnNldCA9IFtdXG4gIHRoaXMucGF0dGVybiA9IHBhdHRlcm5cbiAgdGhpcy5yZWdleHAgPSBudWxsXG4gIHRoaXMubmVnYXRlID0gZmFsc2VcbiAgdGhpcy5jb21tZW50ID0gZmFsc2VcbiAgdGhpcy5lbXB0eSA9IGZhbHNlXG4gIHRoaXMucGFydGlhbCA9ICEhb3B0aW9ucy5wYXJ0aWFsXG5cbiAgLy8gbWFrZSB0aGUgc2V0IG9mIHJlZ2V4cHMgZXRjLlxuICB0aGlzLm1ha2UoKVxufVxuXG5NaW5pbWF0Y2gucHJvdG90eXBlLmRlYnVnID0gZnVuY3Rpb24gKCkge31cblxuTWluaW1hdGNoLnByb3RvdHlwZS5tYWtlID0gbWFrZVxuZnVuY3Rpb24gbWFrZSAoKSB7XG4gIHZhciBwYXR0ZXJuID0gdGhpcy5wYXR0ZXJuXG4gIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zXG5cbiAgLy8gZW1wdHkgcGF0dGVybnMgYW5kIGNvbW1lbnRzIG1hdGNoIG5vdGhpbmcuXG4gIGlmICghb3B0aW9ucy5ub2NvbW1lbnQgJiYgcGF0dGVybi5jaGFyQXQoMCkgPT09ICcjJykge1xuICAgIHRoaXMuY29tbWVudCA9IHRydWVcbiAgICByZXR1cm5cbiAgfVxuICBpZiAoIXBhdHRlcm4pIHtcbiAgICB0aGlzLmVtcHR5ID0gdHJ1ZVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gc3RlcCAxOiBmaWd1cmUgb3V0IG5lZ2F0aW9uLCBldGMuXG4gIHRoaXMucGFyc2VOZWdhdGUoKVxuXG4gIC8vIHN0ZXAgMjogZXhwYW5kIGJyYWNlc1xuICB2YXIgc2V0ID0gdGhpcy5nbG9iU2V0ID0gdGhpcy5icmFjZUV4cGFuZCgpXG5cbiAgaWYgKG9wdGlvbnMuZGVidWcpIHRoaXMuZGVidWcgPSBmdW5jdGlvbiBkZWJ1ZygpIHsgY29uc29sZS5lcnJvci5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpIH1cblxuICB0aGlzLmRlYnVnKHRoaXMucGF0dGVybiwgc2V0KVxuXG4gIC8vIHN0ZXAgMzogbm93IHdlIGhhdmUgYSBzZXQsIHNvIHR1cm4gZWFjaCBvbmUgaW50byBhIHNlcmllcyBvZiBwYXRoLXBvcnRpb25cbiAgLy8gbWF0Y2hpbmcgcGF0dGVybnMuXG4gIC8vIFRoZXNlIHdpbGwgYmUgcmVnZXhwcywgZXhjZXB0IGluIHRoZSBjYXNlIG9mIFwiKipcIiwgd2hpY2ggaXNcbiAgLy8gc2V0IHRvIHRoZSBHTE9CU1RBUiBvYmplY3QgZm9yIGdsb2JzdGFyIGJlaGF2aW9yLFxuICAvLyBhbmQgd2lsbCBub3QgY29udGFpbiBhbnkgLyBjaGFyYWN0ZXJzXG4gIHNldCA9IHRoaXMuZ2xvYlBhcnRzID0gc2V0Lm1hcChmdW5jdGlvbiAocykge1xuICAgIHJldHVybiBzLnNwbGl0KHNsYXNoU3BsaXQpXG4gIH0pXG5cbiAgdGhpcy5kZWJ1Zyh0aGlzLnBhdHRlcm4sIHNldClcblxuICAvLyBnbG9iIC0tPiByZWdleHBzXG4gIHNldCA9IHNldC5tYXAoZnVuY3Rpb24gKHMsIHNpLCBzZXQpIHtcbiAgICByZXR1cm4gcy5tYXAodGhpcy5wYXJzZSwgdGhpcylcbiAgfSwgdGhpcylcblxuICB0aGlzLmRlYnVnKHRoaXMucGF0dGVybiwgc2V0KVxuXG4gIC8vIGZpbHRlciBvdXQgZXZlcnl0aGluZyB0aGF0IGRpZG4ndCBjb21waWxlIHByb3Blcmx5LlxuICBzZXQgPSBzZXQuZmlsdGVyKGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHMuaW5kZXhPZihmYWxzZSkgPT09IC0xXG4gIH0pXG5cbiAgdGhpcy5kZWJ1Zyh0aGlzLnBhdHRlcm4sIHNldClcblxuICB0aGlzLnNldCA9IHNldFxufVxuXG5NaW5pbWF0Y2gucHJvdG90eXBlLnBhcnNlTmVnYXRlID0gcGFyc2VOZWdhdGVcbmZ1bmN0aW9uIHBhcnNlTmVnYXRlICgpIHtcbiAgdmFyIHBhdHRlcm4gPSB0aGlzLnBhdHRlcm5cbiAgdmFyIG5lZ2F0ZSA9IGZhbHNlXG4gIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zXG4gIHZhciBuZWdhdGVPZmZzZXQgPSAwXG5cbiAgaWYgKG9wdGlvbnMubm9uZWdhdGUpIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gcGF0dGVybi5sZW5ndGhcbiAgICA7IGkgPCBsICYmIHBhdHRlcm4uY2hhckF0KGkpID09PSAnISdcbiAgICA7IGkrKykge1xuICAgIG5lZ2F0ZSA9ICFuZWdhdGVcbiAgICBuZWdhdGVPZmZzZXQrK1xuICB9XG5cbiAgaWYgKG5lZ2F0ZU9mZnNldCkgdGhpcy5wYXR0ZXJuID0gcGF0dGVybi5zdWJzdHIobmVnYXRlT2Zmc2V0KVxuICB0aGlzLm5lZ2F0ZSA9IG5lZ2F0ZVxufVxuXG4vLyBCcmFjZSBleHBhbnNpb246XG4vLyBhe2IsY31kIC0+IGFiZCBhY2Rcbi8vIGF7Yix9YyAtPiBhYmMgYWNcbi8vIGF7MC4uM31kIC0+IGEwZCBhMWQgYTJkIGEzZFxuLy8gYXtiLGN7ZCxlfWZ9ZyAtPiBhYmcgYWNkZmcgYWNlZmdcbi8vIGF7YixjfWR7ZSxmfWcgLT4gYWJkZWcgYWNkZWcgYWJkZWcgYWJkZmdcbi8vXG4vLyBJbnZhbGlkIHNldHMgYXJlIG5vdCBleHBhbmRlZC5cbi8vIGF7Mi4ufWIgLT4gYXsyLi59YlxuLy8gYXtifWMgLT4gYXtifWNcbm1pbmltYXRjaC5icmFjZUV4cGFuZCA9IGZ1bmN0aW9uIChwYXR0ZXJuLCBvcHRpb25zKSB7XG4gIHJldHVybiBicmFjZUV4cGFuZChwYXR0ZXJuLCBvcHRpb25zKVxufVxuXG5NaW5pbWF0Y2gucHJvdG90eXBlLmJyYWNlRXhwYW5kID0gYnJhY2VFeHBhbmRcblxuZnVuY3Rpb24gYnJhY2VFeHBhbmQgKHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zKSB7XG4gICAgaWYgKHRoaXMgaW5zdGFuY2VvZiBNaW5pbWF0Y2gpIHtcbiAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnNcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuICB9XG5cbiAgcGF0dGVybiA9IHR5cGVvZiBwYXR0ZXJuID09PSAndW5kZWZpbmVkJ1xuICAgID8gdGhpcy5wYXR0ZXJuIDogcGF0dGVyblxuXG4gIGFzc2VydFZhbGlkUGF0dGVybihwYXR0ZXJuKVxuXG4gIC8vIFRoYW5rcyB0byBZZXRpbmcgTGkgPGh0dHBzOi8vZ2l0aHViLmNvbS95ZXRpbmdsaT4gZm9yXG4gIC8vIGltcHJvdmluZyB0aGlzIHJlZ2V4cCB0byBhdm9pZCBhIFJlRE9TIHZ1bG5lcmFiaWxpdHkuXG4gIGlmIChvcHRpb25zLm5vYnJhY2UgfHwgIS9cXHsoPzooPyFcXHspLikqXFx9Ly50ZXN0KHBhdHRlcm4pKSB7XG4gICAgLy8gc2hvcnRjdXQuIG5vIG5lZWQgdG8gZXhwYW5kLlxuICAgIHJldHVybiBbcGF0dGVybl1cbiAgfVxuXG4gIHJldHVybiBleHBhbmQocGF0dGVybilcbn1cblxudmFyIE1BWF9QQVRURVJOX0xFTkdUSCA9IDEwMjQgKiA2NFxudmFyIGFzc2VydFZhbGlkUGF0dGVybiA9IGZ1bmN0aW9uIChwYXR0ZXJuKSB7XG4gIGlmICh0eXBlb2YgcGF0dGVybiAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpbnZhbGlkIHBhdHRlcm4nKVxuICB9XG5cbiAgaWYgKHBhdHRlcm4ubGVuZ3RoID4gTUFYX1BBVFRFUk5fTEVOR1RIKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncGF0dGVybiBpcyB0b28gbG9uZycpXG4gIH1cbn1cblxuLy8gcGFyc2UgYSBjb21wb25lbnQgb2YgdGhlIGV4cGFuZGVkIHNldC5cbi8vIEF0IHRoaXMgcG9pbnQsIG5vIHBhdHRlcm4gbWF5IGNvbnRhaW4gXCIvXCIgaW4gaXRcbi8vIHNvIHdlJ3JlIGdvaW5nIHRvIHJldHVybiBhIDJkIGFycmF5LCB3aGVyZSBlYWNoIGVudHJ5IGlzIHRoZSBmdWxsXG4vLyBwYXR0ZXJuLCBzcGxpdCBvbiAnLycsIGFuZCB0aGVuIHR1cm5lZCBpbnRvIGEgcmVndWxhciBleHByZXNzaW9uLlxuLy8gQSByZWdleHAgaXMgbWFkZSBhdCB0aGUgZW5kIHdoaWNoIGpvaW5zIGVhY2ggYXJyYXkgd2l0aCBhblxuLy8gZXNjYXBlZCAvLCBhbmQgYW5vdGhlciBmdWxsIG9uZSB3aGljaCBqb2lucyBlYWNoIHJlZ2V4cCB3aXRoIHwuXG4vL1xuLy8gRm9sbG93aW5nIHRoZSBsZWFkIG9mIEJhc2ggNC4xLCBub3RlIHRoYXQgXCIqKlwiIG9ubHkgaGFzIHNwZWNpYWwgbWVhbmluZ1xuLy8gd2hlbiBpdCBpcyB0aGUgKm9ubHkqIHRoaW5nIGluIGEgcGF0aCBwb3J0aW9uLiAgT3RoZXJ3aXNlLCBhbnkgc2VyaWVzXG4vLyBvZiAqIGlzIGVxdWl2YWxlbnQgdG8gYSBzaW5nbGUgKi4gIEdsb2JzdGFyIGJlaGF2aW9yIGlzIGVuYWJsZWQgYnlcbi8vIGRlZmF1bHQsIGFuZCBjYW4gYmUgZGlzYWJsZWQgYnkgc2V0dGluZyBvcHRpb25zLm5vZ2xvYnN0YXIuXG5NaW5pbWF0Y2gucHJvdG90eXBlLnBhcnNlID0gcGFyc2VcbnZhciBTVUJQQVJTRSA9IHt9XG5mdW5jdGlvbiBwYXJzZSAocGF0dGVybiwgaXNTdWIpIHtcbiAgYXNzZXJ0VmFsaWRQYXR0ZXJuKHBhdHRlcm4pXG5cbiAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnNcblxuICAvLyBzaG9ydGN1dHNcbiAgaWYgKHBhdHRlcm4gPT09ICcqKicpIHtcbiAgICBpZiAoIW9wdGlvbnMubm9nbG9ic3RhcilcbiAgICAgIHJldHVybiBHTE9CU1RBUlxuICAgIGVsc2VcbiAgICAgIHBhdHRlcm4gPSAnKidcbiAgfVxuICBpZiAocGF0dGVybiA9PT0gJycpIHJldHVybiAnJ1xuXG4gIHZhciByZSA9ICcnXG4gIHZhciBoYXNNYWdpYyA9ICEhb3B0aW9ucy5ub2Nhc2VcbiAgdmFyIGVzY2FwaW5nID0gZmFsc2VcbiAgLy8gPyA9PiBvbmUgc2luZ2xlIGNoYXJhY3RlclxuICB2YXIgcGF0dGVybkxpc3RTdGFjayA9IFtdXG4gIHZhciBuZWdhdGl2ZUxpc3RzID0gW11cbiAgdmFyIHN0YXRlQ2hhclxuICB2YXIgaW5DbGFzcyA9IGZhbHNlXG4gIHZhciByZUNsYXNzU3RhcnQgPSAtMVxuICB2YXIgY2xhc3NTdGFydCA9IC0xXG4gIC8vIC4gYW5kIC4uIG5ldmVyIG1hdGNoIGFueXRoaW5nIHRoYXQgZG9lc24ndCBzdGFydCB3aXRoIC4sXG4gIC8vIGV2ZW4gd2hlbiBvcHRpb25zLmRvdCBpcyBzZXQuXG4gIHZhciBwYXR0ZXJuU3RhcnQgPSBwYXR0ZXJuLmNoYXJBdCgwKSA9PT0gJy4nID8gJycgLy8gYW55dGhpbmdcbiAgLy8gbm90IChzdGFydCBvciAvIGZvbGxvd2VkIGJ5IC4gb3IgLi4gZm9sbG93ZWQgYnkgLyBvciBlbmQpXG4gIDogb3B0aW9ucy5kb3QgPyAnKD8hKD86XnxcXFxcXFwvKVxcXFwuezEsMn0oPzokfFxcXFxcXC8pKSdcbiAgOiAnKD8hXFxcXC4pJ1xuICB2YXIgc2VsZiA9IHRoaXNcblxuICBmdW5jdGlvbiBjbGVhclN0YXRlQ2hhciAoKSB7XG4gICAgaWYgKHN0YXRlQ2hhcikge1xuICAgICAgLy8gd2UgaGFkIHNvbWUgc3RhdGUtdHJhY2tpbmcgY2hhcmFjdGVyXG4gICAgICAvLyB0aGF0IHdhc24ndCBjb25zdW1lZCBieSB0aGlzIHBhc3MuXG4gICAgICBzd2l0Y2ggKHN0YXRlQ2hhcikge1xuICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgICByZSArPSBzdGFyXG4gICAgICAgICAgaGFzTWFnaWMgPSB0cnVlXG4gICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJz8nOlxuICAgICAgICAgIHJlICs9IHFtYXJrXG4gICAgICAgICAgaGFzTWFnaWMgPSB0cnVlXG4gICAgICAgIGJyZWFrXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmUgKz0gJ1xcXFwnICsgc3RhdGVDaGFyXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBzZWxmLmRlYnVnKCdjbGVhclN0YXRlQ2hhciAlaiAlaicsIHN0YXRlQ2hhciwgcmUpXG4gICAgICBzdGF0ZUNoYXIgPSBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYXR0ZXJuLmxlbmd0aCwgY1xuICAgIDsgKGkgPCBsZW4pICYmIChjID0gcGF0dGVybi5jaGFyQXQoaSkpXG4gICAgOyBpKyspIHtcbiAgICB0aGlzLmRlYnVnKCclc1xcdCVzICVzICVqJywgcGF0dGVybiwgaSwgcmUsIGMpXG5cbiAgICAvLyBza2lwIG92ZXIgYW55IHRoYXQgYXJlIGVzY2FwZWQuXG4gICAgaWYgKGVzY2FwaW5nICYmIHJlU3BlY2lhbHNbY10pIHtcbiAgICAgIHJlICs9ICdcXFxcJyArIGNcbiAgICAgIGVzY2FwaW5nID0gZmFsc2VcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgc3dpdGNoIChjKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgY2FzZSAnLyc6IHtcbiAgICAgICAgLy8gY29tcGxldGVseSBub3QgYWxsb3dlZCwgZXZlbiBlc2NhcGVkLlxuICAgICAgICAvLyBTaG91bGQgYWxyZWFkeSBiZSBwYXRoLXNwbGl0IGJ5IG5vdy5cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGNhc2UgJ1xcXFwnOlxuICAgICAgICBjbGVhclN0YXRlQ2hhcigpXG4gICAgICAgIGVzY2FwaW5nID0gdHJ1ZVxuICAgICAgY29udGludWVcblxuICAgICAgLy8gdGhlIHZhcmlvdXMgc3RhdGVDaGFyIHZhbHVlc1xuICAgICAgLy8gZm9yIHRoZSBcImV4dGdsb2JcIiBzdHVmZi5cbiAgICAgIGNhc2UgJz8nOlxuICAgICAgY2FzZSAnKic6XG4gICAgICBjYXNlICcrJzpcbiAgICAgIGNhc2UgJ0AnOlxuICAgICAgY2FzZSAnISc6XG4gICAgICAgIHRoaXMuZGVidWcoJyVzXFx0JXMgJXMgJWogPC0tIHN0YXRlQ2hhcicsIHBhdHRlcm4sIGksIHJlLCBjKVxuXG4gICAgICAgIC8vIGFsbCBvZiB0aG9zZSBhcmUgbGl0ZXJhbHMgaW5zaWRlIGEgY2xhc3MsIGV4Y2VwdCB0aGF0XG4gICAgICAgIC8vIHRoZSBnbG9iIFshYV0gbWVhbnMgW15hXSBpbiByZWdleHBcbiAgICAgICAgaWYgKGluQ2xhc3MpIHtcbiAgICAgICAgICB0aGlzLmRlYnVnKCcgIGluIGNsYXNzJylcbiAgICAgICAgICBpZiAoYyA9PT0gJyEnICYmIGkgPT09IGNsYXNzU3RhcnQgKyAxKSBjID0gJ14nXG4gICAgICAgICAgcmUgKz0gY1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB3ZSBhbHJlYWR5IGhhdmUgYSBzdGF0ZUNoYXIsIHRoZW4gaXQgbWVhbnNcbiAgICAgICAgLy8gdGhhdCB0aGVyZSB3YXMgc29tZXRoaW5nIGxpa2UgKiogb3IgKz8gaW4gdGhlcmUuXG4gICAgICAgIC8vIEhhbmRsZSB0aGUgc3RhdGVDaGFyLCB0aGVuIHByb2NlZWQgd2l0aCB0aGlzIG9uZS5cbiAgICAgICAgc2VsZi5kZWJ1ZygnY2FsbCBjbGVhclN0YXRlQ2hhciAlaicsIHN0YXRlQ2hhcilcbiAgICAgICAgY2xlYXJTdGF0ZUNoYXIoKVxuICAgICAgICBzdGF0ZUNoYXIgPSBjXG4gICAgICAgIC8vIGlmIGV4dGdsb2IgaXMgZGlzYWJsZWQsIHRoZW4gKyhhc2RmfGZvbykgaXNuJ3QgYSB0aGluZy5cbiAgICAgICAgLy8ganVzdCBjbGVhciB0aGUgc3RhdGVjaGFyICpub3cqLCByYXRoZXIgdGhhbiBldmVuIGRpdmluZyBpbnRvXG4gICAgICAgIC8vIHRoZSBwYXR0ZXJuTGlzdCBzdHVmZi5cbiAgICAgICAgaWYgKG9wdGlvbnMubm9leHQpIGNsZWFyU3RhdGVDaGFyKClcbiAgICAgIGNvbnRpbnVlXG5cbiAgICAgIGNhc2UgJygnOlxuICAgICAgICBpZiAoaW5DbGFzcykge1xuICAgICAgICAgIHJlICs9ICcoJ1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXN0YXRlQ2hhcikge1xuICAgICAgICAgIHJlICs9ICdcXFxcKCdcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgcGF0dGVybkxpc3RTdGFjay5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBzdGF0ZUNoYXIsXG4gICAgICAgICAgc3RhcnQ6IGkgLSAxLFxuICAgICAgICAgIHJlU3RhcnQ6IHJlLmxlbmd0aCxcbiAgICAgICAgICBvcGVuOiBwbFR5cGVzW3N0YXRlQ2hhcl0ub3BlbixcbiAgICAgICAgICBjbG9zZTogcGxUeXBlc1tzdGF0ZUNoYXJdLmNsb3NlXG4gICAgICAgIH0pXG4gICAgICAgIC8vIG5lZ2F0aW9uIGlzICg/Oig/IWpzKVteL10qKVxuICAgICAgICByZSArPSBzdGF0ZUNoYXIgPT09ICchJyA/ICcoPzooPyEoPzonIDogJyg/OidcbiAgICAgICAgdGhpcy5kZWJ1ZygncGxUeXBlICVqICVqJywgc3RhdGVDaGFyLCByZSlcbiAgICAgICAgc3RhdGVDaGFyID0gZmFsc2VcbiAgICAgIGNvbnRpbnVlXG5cbiAgICAgIGNhc2UgJyknOlxuICAgICAgICBpZiAoaW5DbGFzcyB8fCAhcGF0dGVybkxpc3RTdGFjay5sZW5ndGgpIHtcbiAgICAgICAgICByZSArPSAnXFxcXCknXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIGNsZWFyU3RhdGVDaGFyKClcbiAgICAgICAgaGFzTWFnaWMgPSB0cnVlXG4gICAgICAgIHZhciBwbCA9IHBhdHRlcm5MaXN0U3RhY2sucG9wKClcbiAgICAgICAgLy8gbmVnYXRpb24gaXMgKD86KD8hanMpW14vXSopXG4gICAgICAgIC8vIFRoZSBvdGhlcnMgYXJlICg/OjxwYXR0ZXJuPik8dHlwZT5cbiAgICAgICAgcmUgKz0gcGwuY2xvc2VcbiAgICAgICAgaWYgKHBsLnR5cGUgPT09ICchJykge1xuICAgICAgICAgIG5lZ2F0aXZlTGlzdHMucHVzaChwbClcbiAgICAgICAgfVxuICAgICAgICBwbC5yZUVuZCA9IHJlLmxlbmd0aFxuICAgICAgY29udGludWVcblxuICAgICAgY2FzZSAnfCc6XG4gICAgICAgIGlmIChpbkNsYXNzIHx8ICFwYXR0ZXJuTGlzdFN0YWNrLmxlbmd0aCB8fCBlc2NhcGluZykge1xuICAgICAgICAgIHJlICs9ICdcXFxcfCdcbiAgICAgICAgICBlc2NhcGluZyA9IGZhbHNlXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIGNsZWFyU3RhdGVDaGFyKClcbiAgICAgICAgcmUgKz0gJ3wnXG4gICAgICBjb250aW51ZVxuXG4gICAgICAvLyB0aGVzZSBhcmUgbW9zdGx5IHRoZSBzYW1lIGluIHJlZ2V4cCBhbmQgZ2xvYlxuICAgICAgY2FzZSAnWyc6XG4gICAgICAgIC8vIHN3YWxsb3cgYW55IHN0YXRlLXRyYWNraW5nIGNoYXIgYmVmb3JlIHRoZSBbXG4gICAgICAgIGNsZWFyU3RhdGVDaGFyKClcblxuICAgICAgICBpZiAoaW5DbGFzcykge1xuICAgICAgICAgIHJlICs9ICdcXFxcJyArIGNcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgaW5DbGFzcyA9IHRydWVcbiAgICAgICAgY2xhc3NTdGFydCA9IGlcbiAgICAgICAgcmVDbGFzc1N0YXJ0ID0gcmUubGVuZ3RoXG4gICAgICAgIHJlICs9IGNcbiAgICAgIGNvbnRpbnVlXG5cbiAgICAgIGNhc2UgJ10nOlxuICAgICAgICAvLyAgYSByaWdodCBicmFja2V0IHNoYWxsIGxvc2UgaXRzIHNwZWNpYWxcbiAgICAgICAgLy8gIG1lYW5pbmcgYW5kIHJlcHJlc2VudCBpdHNlbGYgaW5cbiAgICAgICAgLy8gIGEgYnJhY2tldCBleHByZXNzaW9uIGlmIGl0IG9jY3Vyc1xuICAgICAgICAvLyAgZmlyc3QgaW4gdGhlIGxpc3QuICAtLSBQT1NJWC4yIDIuOC4zLjJcbiAgICAgICAgaWYgKGkgPT09IGNsYXNzU3RhcnQgKyAxIHx8ICFpbkNsYXNzKSB7XG4gICAgICAgICAgcmUgKz0gJ1xcXFwnICsgY1xuICAgICAgICAgIGVzY2FwaW5nID0gZmFsc2VcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gaGFuZGxlIHRoZSBjYXNlIHdoZXJlIHdlIGxlZnQgYSBjbGFzcyBvcGVuLlxuICAgICAgICAvLyBcIlt6LWFdXCIgaXMgdmFsaWQsIGVxdWl2YWxlbnQgdG8gXCJcXFt6LWFcXF1cIlxuICAgICAgICAvLyBzcGxpdCB3aGVyZSB0aGUgbGFzdCBbIHdhcywgbWFrZSBzdXJlIHdlIGRvbid0IGhhdmVcbiAgICAgICAgLy8gYW4gaW52YWxpZCByZS4gaWYgc28sIHJlLXdhbGsgdGhlIGNvbnRlbnRzIG9mIHRoZVxuICAgICAgICAvLyB3b3VsZC1iZSBjbGFzcyB0byByZS10cmFuc2xhdGUgYW55IGNoYXJhY3RlcnMgdGhhdFxuICAgICAgICAvLyB3ZXJlIHBhc3NlZCB0aHJvdWdoIGFzLWlzXG4gICAgICAgIC8vIFRPRE86IEl0IHdvdWxkIHByb2JhYmx5IGJlIGZhc3RlciB0byBkZXRlcm1pbmUgdGhpc1xuICAgICAgICAvLyB3aXRob3V0IGEgdHJ5L2NhdGNoIGFuZCBhIG5ldyBSZWdFeHAsIGJ1dCBpdCdzIHRyaWNreVxuICAgICAgICAvLyB0byBkbyBzYWZlbHkuICBGb3Igbm93LCB0aGlzIGlzIHNhZmUgYW5kIHdvcmtzLlxuICAgICAgICB2YXIgY3MgPSBwYXR0ZXJuLnN1YnN0cmluZyhjbGFzc1N0YXJ0ICsgMSwgaSlcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBSZWdFeHAoJ1snICsgY3MgKyAnXScpXG4gICAgICAgIH0gY2F0Y2ggKGVyKSB7XG4gICAgICAgICAgLy8gbm90IGEgdmFsaWQgY2xhc3MhXG4gICAgICAgICAgdmFyIHNwID0gdGhpcy5wYXJzZShjcywgU1VCUEFSU0UpXG4gICAgICAgICAgcmUgPSByZS5zdWJzdHIoMCwgcmVDbGFzc1N0YXJ0KSArICdcXFxcWycgKyBzcFswXSArICdcXFxcXSdcbiAgICAgICAgICBoYXNNYWdpYyA9IGhhc01hZ2ljIHx8IHNwWzFdXG4gICAgICAgICAgaW5DbGFzcyA9IGZhbHNlXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZpbmlzaCB1cCB0aGUgY2xhc3MuXG4gICAgICAgIGhhc01hZ2ljID0gdHJ1ZVxuICAgICAgICBpbkNsYXNzID0gZmFsc2VcbiAgICAgICAgcmUgKz0gY1xuICAgICAgY29udGludWVcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gc3dhbGxvdyBhbnkgc3RhdGUgY2hhciB0aGF0IHdhc24ndCBjb25zdW1lZFxuICAgICAgICBjbGVhclN0YXRlQ2hhcigpXG5cbiAgICAgICAgaWYgKGVzY2FwaW5nKSB7XG4gICAgICAgICAgLy8gbm8gbmVlZFxuICAgICAgICAgIGVzY2FwaW5nID0gZmFsc2VcbiAgICAgICAgfSBlbHNlIGlmIChyZVNwZWNpYWxzW2NdXG4gICAgICAgICAgJiYgIShjID09PSAnXicgJiYgaW5DbGFzcykpIHtcbiAgICAgICAgICByZSArPSAnXFxcXCdcbiAgICAgICAgfVxuXG4gICAgICAgIHJlICs9IGNcblxuICAgIH0gLy8gc3dpdGNoXG4gIH0gLy8gZm9yXG5cbiAgLy8gaGFuZGxlIHRoZSBjYXNlIHdoZXJlIHdlIGxlZnQgYSBjbGFzcyBvcGVuLlxuICAvLyBcIlthYmNcIiBpcyB2YWxpZCwgZXF1aXZhbGVudCB0byBcIlxcW2FiY1wiXG4gIGlmIChpbkNsYXNzKSB7XG4gICAgLy8gc3BsaXQgd2hlcmUgdGhlIGxhc3QgWyB3YXMsIGFuZCBlc2NhcGUgaXRcbiAgICAvLyB0aGlzIGlzIGEgaHVnZSBwaXRhLiAgV2Ugbm93IGhhdmUgdG8gcmUtd2Fsa1xuICAgIC8vIHRoZSBjb250ZW50cyBvZiB0aGUgd291bGQtYmUgY2xhc3MgdG8gcmUtdHJhbnNsYXRlXG4gICAgLy8gYW55IGNoYXJhY3RlcnMgdGhhdCB3ZXJlIHBhc3NlZCB0aHJvdWdoIGFzLWlzXG4gICAgY3MgPSBwYXR0ZXJuLnN1YnN0cihjbGFzc1N0YXJ0ICsgMSlcbiAgICBzcCA9IHRoaXMucGFyc2UoY3MsIFNVQlBBUlNFKVxuICAgIHJlID0gcmUuc3Vic3RyKDAsIHJlQ2xhc3NTdGFydCkgKyAnXFxcXFsnICsgc3BbMF1cbiAgICBoYXNNYWdpYyA9IGhhc01hZ2ljIHx8IHNwWzFdXG4gIH1cblxuICAvLyBoYW5kbGUgdGhlIGNhc2Ugd2hlcmUgd2UgaGFkIGEgKyggdGhpbmcgYXQgdGhlICplbmQqXG4gIC8vIG9mIHRoZSBwYXR0ZXJuLlxuICAvLyBlYWNoIHBhdHRlcm4gbGlzdCBzdGFjayBhZGRzIDMgY2hhcnMsIGFuZCB3ZSBuZWVkIHRvIGdvIHRocm91Z2hcbiAgLy8gYW5kIGVzY2FwZSBhbnkgfCBjaGFycyB0aGF0IHdlcmUgcGFzc2VkIHRocm91Z2ggYXMtaXMgZm9yIHRoZSByZWdleHAuXG4gIC8vIEdvIHRocm91Z2ggYW5kIGVzY2FwZSB0aGVtLCB0YWtpbmcgY2FyZSBub3QgdG8gZG91YmxlLWVzY2FwZSBhbnlcbiAgLy8gfCBjaGFycyB0aGF0IHdlcmUgYWxyZWFkeSBlc2NhcGVkLlxuICBmb3IgKHBsID0gcGF0dGVybkxpc3RTdGFjay5wb3AoKTsgcGw7IHBsID0gcGF0dGVybkxpc3RTdGFjay5wb3AoKSkge1xuICAgIHZhciB0YWlsID0gcmUuc2xpY2UocGwucmVTdGFydCArIHBsLm9wZW4ubGVuZ3RoKVxuICAgIHRoaXMuZGVidWcoJ3NldHRpbmcgdGFpbCcsIHJlLCBwbClcbiAgICAvLyBtYXliZSBzb21lIGV2ZW4gbnVtYmVyIG9mIFxcLCB0aGVuIG1heWJlIDEgXFwsIGZvbGxvd2VkIGJ5IGEgfFxuICAgIHRhaWwgPSB0YWlsLnJlcGxhY2UoLygoPzpcXFxcezJ9KXswLDY0fSkoXFxcXD8pXFx8L2csIGZ1bmN0aW9uIChfLCAkMSwgJDIpIHtcbiAgICAgIGlmICghJDIpIHtcbiAgICAgICAgLy8gdGhlIHwgaXNuJ3QgYWxyZWFkeSBlc2NhcGVkLCBzbyBlc2NhcGUgaXQuXG4gICAgICAgICQyID0gJ1xcXFwnXG4gICAgICB9XG5cbiAgICAgIC8vIG5lZWQgdG8gZXNjYXBlIGFsbCB0aG9zZSBzbGFzaGVzICphZ2FpbiosIHdpdGhvdXQgZXNjYXBpbmcgdGhlXG4gICAgICAvLyBvbmUgdGhhdCB3ZSBuZWVkIGZvciBlc2NhcGluZyB0aGUgfCBjaGFyYWN0ZXIuICBBcyBpdCB3b3JrcyBvdXQsXG4gICAgICAvLyBlc2NhcGluZyBhbiBldmVuIG51bWJlciBvZiBzbGFzaGVzIGNhbiBiZSBkb25lIGJ5IHNpbXBseSByZXBlYXRpbmdcbiAgICAgIC8vIGl0IGV4YWN0bHkgYWZ0ZXIgaXRzZWxmLiAgVGhhdCdzIHdoeSB0aGlzIHRyaWNrIHdvcmtzLlxuICAgICAgLy9cbiAgICAgIC8vIEkgYW0gc29ycnkgdGhhdCB5b3UgaGF2ZSB0byBzZWUgdGhpcy5cbiAgICAgIHJldHVybiAkMSArICQxICsgJDIgKyAnfCdcbiAgICB9KVxuXG4gICAgdGhpcy5kZWJ1ZygndGFpbD0lalxcbiAgICVzJywgdGFpbCwgdGFpbCwgcGwsIHJlKVxuICAgIHZhciB0ID0gcGwudHlwZSA9PT0gJyonID8gc3RhclxuICAgICAgOiBwbC50eXBlID09PSAnPycgPyBxbWFya1xuICAgICAgOiAnXFxcXCcgKyBwbC50eXBlXG5cbiAgICBoYXNNYWdpYyA9IHRydWVcbiAgICByZSA9IHJlLnNsaWNlKDAsIHBsLnJlU3RhcnQpICsgdCArICdcXFxcKCcgKyB0YWlsXG4gIH1cblxuICAvLyBoYW5kbGUgdHJhaWxpbmcgdGhpbmdzIHRoYXQgb25seSBtYXR0ZXIgYXQgdGhlIHZlcnkgZW5kLlxuICBjbGVhclN0YXRlQ2hhcigpXG4gIGlmIChlc2NhcGluZykge1xuICAgIC8vIHRyYWlsaW5nIFxcXFxcbiAgICByZSArPSAnXFxcXFxcXFwnXG4gIH1cblxuICAvLyBvbmx5IG5lZWQgdG8gYXBwbHkgdGhlIG5vZG90IHN0YXJ0IGlmIHRoZSByZSBzdGFydHMgd2l0aFxuICAvLyBzb21ldGhpbmcgdGhhdCBjb3VsZCBjb25jZWl2YWJseSBjYXB0dXJlIGEgZG90XG4gIHZhciBhZGRQYXR0ZXJuU3RhcnQgPSBmYWxzZVxuICBzd2l0Y2ggKHJlLmNoYXJBdCgwKSkge1xuICAgIGNhc2UgJ1snOiBjYXNlICcuJzogY2FzZSAnKCc6IGFkZFBhdHRlcm5TdGFydCA9IHRydWVcbiAgfVxuXG4gIC8vIEhhY2sgdG8gd29yayBhcm91bmQgbGFjayBvZiBuZWdhdGl2ZSBsb29rYmVoaW5kIGluIEpTXG4gIC8vIEEgcGF0dGVybiBsaWtlOiAqLiEoeCkuISh5fHopIG5lZWRzIHRvIGVuc3VyZSB0aGF0IGEgbmFtZVxuICAvLyBsaWtlICdhLnh5ei55eicgZG9lc24ndCBtYXRjaC4gIFNvLCB0aGUgZmlyc3QgbmVnYXRpdmVcbiAgLy8gbG9va2FoZWFkLCBoYXMgdG8gbG9vayBBTEwgdGhlIHdheSBhaGVhZCwgdG8gdGhlIGVuZCBvZlxuICAvLyB0aGUgcGF0dGVybi5cbiAgZm9yICh2YXIgbiA9IG5lZ2F0aXZlTGlzdHMubGVuZ3RoIC0gMTsgbiA+IC0xOyBuLS0pIHtcbiAgICB2YXIgbmwgPSBuZWdhdGl2ZUxpc3RzW25dXG5cbiAgICB2YXIgbmxCZWZvcmUgPSByZS5zbGljZSgwLCBubC5yZVN0YXJ0KVxuICAgIHZhciBubEZpcnN0ID0gcmUuc2xpY2UobmwucmVTdGFydCwgbmwucmVFbmQgLSA4KVxuICAgIHZhciBubExhc3QgPSByZS5zbGljZShubC5yZUVuZCAtIDgsIG5sLnJlRW5kKVxuICAgIHZhciBubEFmdGVyID0gcmUuc2xpY2UobmwucmVFbmQpXG5cbiAgICBubExhc3QgKz0gbmxBZnRlclxuXG4gICAgLy8gSGFuZGxlIG5lc3RlZCBzdHVmZiBsaWtlICooKi5qc3whKCouanNvbikpLCB3aGVyZSBvcGVuIHBhcmVuc1xuICAgIC8vIG1lYW4gdGhhdCB3ZSBzaG91bGQgKm5vdCogaW5jbHVkZSB0aGUgKSBpbiB0aGUgYml0IHRoYXQgaXMgY29uc2lkZXJlZFxuICAgIC8vIFwiYWZ0ZXJcIiB0aGUgbmVnYXRlZCBzZWN0aW9uLlxuICAgIHZhciBvcGVuUGFyZW5zQmVmb3JlID0gbmxCZWZvcmUuc3BsaXQoJygnKS5sZW5ndGggLSAxXG4gICAgdmFyIGNsZWFuQWZ0ZXIgPSBubEFmdGVyXG4gICAgZm9yIChpID0gMDsgaSA8IG9wZW5QYXJlbnNCZWZvcmU7IGkrKykge1xuICAgICAgY2xlYW5BZnRlciA9IGNsZWFuQWZ0ZXIucmVwbGFjZSgvXFwpWysqP10/LywgJycpXG4gICAgfVxuICAgIG5sQWZ0ZXIgPSBjbGVhbkFmdGVyXG5cbiAgICB2YXIgZG9sbGFyID0gJydcbiAgICBpZiAobmxBZnRlciA9PT0gJycgJiYgaXNTdWIgIT09IFNVQlBBUlNFKSB7XG4gICAgICBkb2xsYXIgPSAnJCdcbiAgICB9XG4gICAgdmFyIG5ld1JlID0gbmxCZWZvcmUgKyBubEZpcnN0ICsgbmxBZnRlciArIGRvbGxhciArIG5sTGFzdFxuICAgIHJlID0gbmV3UmVcbiAgfVxuXG4gIC8vIGlmIHRoZSByZSBpcyBub3QgXCJcIiBhdCB0aGlzIHBvaW50LCB0aGVuIHdlIG5lZWQgdG8gbWFrZSBzdXJlXG4gIC8vIGl0IGRvZXNuJ3QgbWF0Y2ggYWdhaW5zdCBhbiBlbXB0eSBwYXRoIHBhcnQuXG4gIC8vIE90aGVyd2lzZSBhLyogd2lsbCBtYXRjaCBhLywgd2hpY2ggaXQgc2hvdWxkIG5vdC5cbiAgaWYgKHJlICE9PSAnJyAmJiBoYXNNYWdpYykge1xuICAgIHJlID0gJyg/PS4pJyArIHJlXG4gIH1cblxuICBpZiAoYWRkUGF0dGVyblN0YXJ0KSB7XG4gICAgcmUgPSBwYXR0ZXJuU3RhcnQgKyByZVxuICB9XG5cbiAgLy8gcGFyc2luZyBqdXN0IGEgcGllY2Ugb2YgYSBsYXJnZXIgcGF0dGVybi5cbiAgaWYgKGlzU3ViID09PSBTVUJQQVJTRSkge1xuICAgIHJldHVybiBbcmUsIGhhc01hZ2ljXVxuICB9XG5cbiAgLy8gc2tpcCB0aGUgcmVnZXhwIGZvciBub24tbWFnaWNhbCBwYXR0ZXJuc1xuICAvLyB1bmVzY2FwZSBhbnl0aGluZyBpbiBpdCwgdGhvdWdoLCBzbyB0aGF0IGl0J2xsIGJlXG4gIC8vIGFuIGV4YWN0IG1hdGNoIGFnYWluc3QgYSBmaWxlIGV0Yy5cbiAgaWYgKCFoYXNNYWdpYykge1xuICAgIHJldHVybiBnbG9iVW5lc2NhcGUocGF0dGVybilcbiAgfVxuXG4gIHZhciBmbGFncyA9IG9wdGlvbnMubm9jYXNlID8gJ2knIDogJydcbiAgdHJ5IHtcbiAgICB2YXIgcmVnRXhwID0gbmV3IFJlZ0V4cCgnXicgKyByZSArICckJywgZmxhZ3MpXG4gIH0gY2F0Y2ggKGVyKSAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAtIHNob3VsZCBiZSBpbXBvc3NpYmxlICovIHtcbiAgICAvLyBJZiBpdCB3YXMgYW4gaW52YWxpZCByZWd1bGFyIGV4cHJlc3Npb24sIHRoZW4gaXQgY2FuJ3QgbWF0Y2hcbiAgICAvLyBhbnl0aGluZy4gIFRoaXMgdHJpY2sgbG9va3MgZm9yIGEgY2hhcmFjdGVyIGFmdGVyIHRoZSBlbmQgb2ZcbiAgICAvLyB0aGUgc3RyaW5nLCB3aGljaCBpcyBvZiBjb3Vyc2UgaW1wb3NzaWJsZSwgZXhjZXB0IGluIG11bHRpLWxpbmVcbiAgICAvLyBtb2RlLCBidXQgaXQncyBub3QgYSAvbSByZWdleC5cbiAgICByZXR1cm4gbmV3IFJlZ0V4cCgnJC4nKVxuICB9XG5cbiAgcmVnRXhwLl9nbG9iID0gcGF0dGVyblxuICByZWdFeHAuX3NyYyA9IHJlXG5cbiAgcmV0dXJuIHJlZ0V4cFxufVxuXG5taW5pbWF0Y2gubWFrZVJlID0gZnVuY3Rpb24gKHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG5ldyBNaW5pbWF0Y2gocGF0dGVybiwgb3B0aW9ucyB8fCB7fSkubWFrZVJlKClcbn1cblxuTWluaW1hdGNoLnByb3RvdHlwZS5tYWtlUmUgPSBtYWtlUmVcbmZ1bmN0aW9uIG1ha2VSZSAoKSB7XG4gIGlmICh0aGlzLnJlZ2V4cCB8fCB0aGlzLnJlZ2V4cCA9PT0gZmFsc2UpIHJldHVybiB0aGlzLnJlZ2V4cFxuXG4gIC8vIGF0IHRoaXMgcG9pbnQsIHRoaXMuc2V0IGlzIGEgMmQgYXJyYXkgb2YgcGFydGlhbFxuICAvLyBwYXR0ZXJuIHN0cmluZ3MsIG9yIFwiKipcIi5cbiAgLy9cbiAgLy8gSXQncyBiZXR0ZXIgdG8gdXNlIC5tYXRjaCgpLiAgVGhpcyBmdW5jdGlvbiBzaG91bGRuJ3RcbiAgLy8gYmUgdXNlZCwgcmVhbGx5LCBidXQgaXQncyBwcmV0dHkgY29udmVuaWVudCBzb21ldGltZXMsXG4gIC8vIHdoZW4geW91IGp1c3Qgd2FudCB0byB3b3JrIHdpdGggYSByZWdleC5cbiAgdmFyIHNldCA9IHRoaXMuc2V0XG5cbiAgaWYgKCFzZXQubGVuZ3RoKSB7XG4gICAgdGhpcy5yZWdleHAgPSBmYWxzZVxuICAgIHJldHVybiB0aGlzLnJlZ2V4cFxuICB9XG4gIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zXG5cbiAgdmFyIHR3b1N0YXIgPSBvcHRpb25zLm5vZ2xvYnN0YXIgPyBzdGFyXG4gICAgOiBvcHRpb25zLmRvdCA/IHR3b1N0YXJEb3RcbiAgICA6IHR3b1N0YXJOb0RvdFxuICB2YXIgZmxhZ3MgPSBvcHRpb25zLm5vY2FzZSA/ICdpJyA6ICcnXG5cbiAgdmFyIHJlID0gc2V0Lm1hcChmdW5jdGlvbiAocGF0dGVybikge1xuICAgIHJldHVybiBwYXR0ZXJuLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgcmV0dXJuIChwID09PSBHTE9CU1RBUikgPyB0d29TdGFyXG4gICAgICA6ICh0eXBlb2YgcCA9PT0gJ3N0cmluZycpID8gcmVnRXhwRXNjYXBlKHApXG4gICAgICA6IHAuX3NyY1xuICAgIH0pLmpvaW4oJ1xcXFxcXC8nKVxuICB9KS5qb2luKCd8JylcblxuICAvLyBtdXN0IG1hdGNoIGVudGlyZSBwYXR0ZXJuXG4gIC8vIGVuZGluZyBpbiBhICogb3IgKiogd2lsbCBtYWtlIGl0IGxlc3Mgc3RyaWN0LlxuICByZSA9ICdeKD86JyArIHJlICsgJykkJ1xuXG4gIC8vIGNhbiBtYXRjaCBhbnl0aGluZywgYXMgbG9uZyBhcyBpdCdzIG5vdCB0aGlzLlxuICBpZiAodGhpcy5uZWdhdGUpIHJlID0gJ14oPyEnICsgcmUgKyAnKS4qJCdcblxuICB0cnkge1xuICAgIHRoaXMucmVnZXhwID0gbmV3IFJlZ0V4cChyZSwgZmxhZ3MpXG4gIH0gY2F0Y2ggKGV4KSAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAtIHNob3VsZCBiZSBpbXBvc3NpYmxlICovIHtcbiAgICB0aGlzLnJlZ2V4cCA9IGZhbHNlXG4gIH1cbiAgcmV0dXJuIHRoaXMucmVnZXhwXG59XG5cbm1pbmltYXRjaC5tYXRjaCA9IGZ1bmN0aW9uIChsaXN0LCBwYXR0ZXJuLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gIHZhciBtbSA9IG5ldyBNaW5pbWF0Y2gocGF0dGVybiwgb3B0aW9ucylcbiAgbGlzdCA9IGxpc3QuZmlsdGVyKGZ1bmN0aW9uIChmKSB7XG4gICAgcmV0dXJuIG1tLm1hdGNoKGYpXG4gIH0pXG4gIGlmIChtbS5vcHRpb25zLm5vbnVsbCAmJiAhbGlzdC5sZW5ndGgpIHtcbiAgICBsaXN0LnB1c2gocGF0dGVybilcbiAgfVxuICByZXR1cm4gbGlzdFxufVxuXG5NaW5pbWF0Y2gucHJvdG90eXBlLm1hdGNoID0gZnVuY3Rpb24gbWF0Y2ggKGYsIHBhcnRpYWwpIHtcbiAgaWYgKHR5cGVvZiBwYXJ0aWFsID09PSAndW5kZWZpbmVkJykgcGFydGlhbCA9IHRoaXMucGFydGlhbFxuICB0aGlzLmRlYnVnKCdtYXRjaCcsIGYsIHRoaXMucGF0dGVybilcbiAgLy8gc2hvcnQtY2lyY3VpdCBpbiB0aGUgY2FzZSBvZiBidXN0ZWQgdGhpbmdzLlxuICAvLyBjb21tZW50cywgZXRjLlxuICBpZiAodGhpcy5jb21tZW50KSByZXR1cm4gZmFsc2VcbiAgaWYgKHRoaXMuZW1wdHkpIHJldHVybiBmID09PSAnJ1xuXG4gIGlmIChmID09PSAnLycgJiYgcGFydGlhbCkgcmV0dXJuIHRydWVcblxuICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9uc1xuXG4gIC8vIHdpbmRvd3M6IG5lZWQgdG8gdXNlIC8sIG5vdCBcXFxuICBpZiAocGF0aC5zZXAgIT09ICcvJykge1xuICAgIGYgPSBmLnNwbGl0KHBhdGguc2VwKS5qb2luKCcvJylcbiAgfVxuXG4gIC8vIHRyZWF0IHRoZSB0ZXN0IHBhdGggYXMgYSBzZXQgb2YgcGF0aHBhcnRzLlxuICBmID0gZi5zcGxpdChzbGFzaFNwbGl0KVxuICB0aGlzLmRlYnVnKHRoaXMucGF0dGVybiwgJ3NwbGl0JywgZilcblxuICAvLyBqdXN0IE9ORSBvZiB0aGUgcGF0dGVybiBzZXRzIGluIHRoaXMuc2V0IG5lZWRzIHRvIG1hdGNoXG4gIC8vIGluIG9yZGVyIGZvciBpdCB0byBiZSB2YWxpZC4gIElmIG5lZ2F0aW5nLCB0aGVuIGp1c3Qgb25lXG4gIC8vIG1hdGNoIG1lYW5zIHRoYXQgd2UgaGF2ZSBmYWlsZWQuXG4gIC8vIEVpdGhlciB3YXksIHJldHVybiBvbiB0aGUgZmlyc3QgaGl0LlxuXG4gIHZhciBzZXQgPSB0aGlzLnNldFxuICB0aGlzLmRlYnVnKHRoaXMucGF0dGVybiwgJ3NldCcsIHNldClcblxuICAvLyBGaW5kIHRoZSBiYXNlbmFtZSBvZiB0aGUgcGF0aCBieSBsb29raW5nIGZvciB0aGUgbGFzdCBub24tZW1wdHkgc2VnbWVudFxuICB2YXIgZmlsZW5hbWVcbiAgdmFyIGlcbiAgZm9yIChpID0gZi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGZpbGVuYW1lID0gZltpXVxuICAgIGlmIChmaWxlbmFtZSkgYnJlYWtcbiAgfVxuXG4gIGZvciAoaSA9IDA7IGkgPCBzZXQubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcGF0dGVybiA9IHNldFtpXVxuICAgIHZhciBmaWxlID0gZlxuICAgIGlmIChvcHRpb25zLm1hdGNoQmFzZSAmJiBwYXR0ZXJuLmxlbmd0aCA9PT0gMSkge1xuICAgICAgZmlsZSA9IFtmaWxlbmFtZV1cbiAgICB9XG4gICAgdmFyIGhpdCA9IHRoaXMubWF0Y2hPbmUoZmlsZSwgcGF0dGVybiwgcGFydGlhbClcbiAgICBpZiAoaGl0KSB7XG4gICAgICBpZiAob3B0aW9ucy5mbGlwTmVnYXRlKSByZXR1cm4gdHJ1ZVxuICAgICAgcmV0dXJuICF0aGlzLm5lZ2F0ZVxuICAgIH1cbiAgfVxuXG4gIC8vIGRpZG4ndCBnZXQgYW55IGhpdHMuICB0aGlzIGlzIHN1Y2Nlc3MgaWYgaXQncyBhIG5lZ2F0aXZlXG4gIC8vIHBhdHRlcm4sIGZhaWx1cmUgb3RoZXJ3aXNlLlxuICBpZiAob3B0aW9ucy5mbGlwTmVnYXRlKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIHRoaXMubmVnYXRlXG59XG5cbi8vIHNldCBwYXJ0aWFsIHRvIHRydWUgdG8gdGVzdCBpZiwgZm9yIGV4YW1wbGUsXG4vLyBcIi9hL2JcIiBtYXRjaGVzIHRoZSBzdGFydCBvZiBcIi8qL2IvKi9kXCJcbi8vIFBhcnRpYWwgbWVhbnMsIGlmIHlvdSBydW4gb3V0IG9mIGZpbGUgYmVmb3JlIHlvdSBydW5cbi8vIG91dCBvZiBwYXR0ZXJuLCB0aGVuIHRoYXQncyBmaW5lLCBhcyBsb25nIGFzIGFsbFxuLy8gdGhlIHBhcnRzIG1hdGNoLlxuTWluaW1hdGNoLnByb3RvdHlwZS5tYXRjaE9uZSA9IGZ1bmN0aW9uIChmaWxlLCBwYXR0ZXJuLCBwYXJ0aWFsKSB7XG4gIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zXG5cbiAgdGhpcy5kZWJ1ZygnbWF0Y2hPbmUnLFxuICAgIHsgJ3RoaXMnOiB0aGlzLCBmaWxlOiBmaWxlLCBwYXR0ZXJuOiBwYXR0ZXJuIH0pXG5cbiAgdGhpcy5kZWJ1ZygnbWF0Y2hPbmUnLCBmaWxlLmxlbmd0aCwgcGF0dGVybi5sZW5ndGgpXG5cbiAgZm9yICh2YXIgZmkgPSAwLFxuICAgICAgcGkgPSAwLFxuICAgICAgZmwgPSBmaWxlLmxlbmd0aCxcbiAgICAgIHBsID0gcGF0dGVybi5sZW5ndGhcbiAgICAgIDsgKGZpIDwgZmwpICYmIChwaSA8IHBsKVxuICAgICAgOyBmaSsrLCBwaSsrKSB7XG4gICAgdGhpcy5kZWJ1ZygnbWF0Y2hPbmUgbG9vcCcpXG4gICAgdmFyIHAgPSBwYXR0ZXJuW3BpXVxuICAgIHZhciBmID0gZmlsZVtmaV1cblxuICAgIHRoaXMuZGVidWcocGF0dGVybiwgcCwgZilcblxuICAgIC8vIHNob3VsZCBiZSBpbXBvc3NpYmxlLlxuICAgIC8vIHNvbWUgaW52YWxpZCByZWdleHAgc3R1ZmYgaW4gdGhlIHNldC5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAocCA9PT0gZmFsc2UpIHJldHVybiBmYWxzZVxuXG4gICAgaWYgKHAgPT09IEdMT0JTVEFSKSB7XG4gICAgICB0aGlzLmRlYnVnKCdHTE9CU1RBUicsIFtwYXR0ZXJuLCBwLCBmXSlcblxuICAgICAgLy8gXCIqKlwiXG4gICAgICAvLyBhLyoqL2IvKiovYyB3b3VsZCBtYXRjaCB0aGUgZm9sbG93aW5nOlxuICAgICAgLy8gYS9iL3gveS96L2NcbiAgICAgIC8vIGEveC95L3ovYi9jXG4gICAgICAvLyBhL2IveC9iL3gvY1xuICAgICAgLy8gYS9iL2NcbiAgICAgIC8vIFRvIGRvIHRoaXMsIHRha2UgdGhlIHJlc3Qgb2YgdGhlIHBhdHRlcm4gYWZ0ZXJcbiAgICAgIC8vIHRoZSAqKiwgYW5kIHNlZSBpZiBpdCB3b3VsZCBtYXRjaCB0aGUgZmlsZSByZW1haW5kZXIuXG4gICAgICAvLyBJZiBzbywgcmV0dXJuIHN1Y2Nlc3MuXG4gICAgICAvLyBJZiBub3QsIHRoZSAqKiBcInN3YWxsb3dzXCIgYSBzZWdtZW50LCBhbmQgdHJ5IGFnYWluLlxuICAgICAgLy8gVGhpcyBpcyByZWN1cnNpdmVseSBhd2Z1bC5cbiAgICAgIC8vXG4gICAgICAvLyBhLyoqL2IvKiovYyBtYXRjaGluZyBhL2IveC95L3ovY1xuICAgICAgLy8gLSBhIG1hdGNoZXMgYVxuICAgICAgLy8gLSBkb3VibGVzdGFyXG4gICAgICAvLyAgIC0gbWF0Y2hPbmUoYi94L3kvei9jLCBiLyoqL2MpXG4gICAgICAvLyAgICAgLSBiIG1hdGNoZXMgYlxuICAgICAgLy8gICAgIC0gZG91Ymxlc3RhclxuICAgICAgLy8gICAgICAgLSBtYXRjaE9uZSh4L3kvei9jLCBjKSAtPiBub1xuICAgICAgLy8gICAgICAgLSBtYXRjaE9uZSh5L3ovYywgYykgLT4gbm9cbiAgICAgIC8vICAgICAgIC0gbWF0Y2hPbmUoei9jLCBjKSAtPiBub1xuICAgICAgLy8gICAgICAgLSBtYXRjaE9uZShjLCBjKSB5ZXMsIGhpdFxuICAgICAgdmFyIGZyID0gZmlcbiAgICAgIHZhciBwciA9IHBpICsgMVxuICAgICAgaWYgKHByID09PSBwbCkge1xuICAgICAgICB0aGlzLmRlYnVnKCcqKiBhdCB0aGUgZW5kJylcbiAgICAgICAgLy8gYSAqKiBhdCB0aGUgZW5kIHdpbGwganVzdCBzd2FsbG93IHRoZSByZXN0LlxuICAgICAgICAvLyBXZSBoYXZlIGZvdW5kIGEgbWF0Y2guXG4gICAgICAgIC8vIGhvd2V2ZXIsIGl0IHdpbGwgbm90IHN3YWxsb3cgLy54LCB1bmxlc3NcbiAgICAgICAgLy8gb3B0aW9ucy5kb3QgaXMgc2V0LlxuICAgICAgICAvLyAuIGFuZCAuLiBhcmUgKm5ldmVyKiBtYXRjaGVkIGJ5ICoqLCBmb3IgZXhwbG9zaXZlbHlcbiAgICAgICAgLy8gZXhwb25lbnRpYWwgcmVhc29ucy5cbiAgICAgICAgZm9yICg7IGZpIDwgZmw7IGZpKyspIHtcbiAgICAgICAgICBpZiAoZmlsZVtmaV0gPT09ICcuJyB8fCBmaWxlW2ZpXSA9PT0gJy4uJyB8fFxuICAgICAgICAgICAgKCFvcHRpb25zLmRvdCAmJiBmaWxlW2ZpXS5jaGFyQXQoMCkgPT09ICcuJykpIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG5cbiAgICAgIC8vIG9rLCBsZXQncyBzZWUgaWYgd2UgY2FuIHN3YWxsb3cgd2hhdGV2ZXIgd2UgY2FuLlxuICAgICAgd2hpbGUgKGZyIDwgZmwpIHtcbiAgICAgICAgdmFyIHN3YWxsb3dlZSA9IGZpbGVbZnJdXG5cbiAgICAgICAgdGhpcy5kZWJ1ZygnXFxuZ2xvYnN0YXIgd2hpbGUnLCBmaWxlLCBmciwgcGF0dGVybiwgcHIsIHN3YWxsb3dlZSlcblxuICAgICAgICAvLyBYWFggcmVtb3ZlIHRoaXMgc2xpY2UuICBKdXN0IHBhc3MgdGhlIHN0YXJ0IGluZGV4LlxuICAgICAgICBpZiAodGhpcy5tYXRjaE9uZShmaWxlLnNsaWNlKGZyKSwgcGF0dGVybi5zbGljZShwciksIHBhcnRpYWwpKSB7XG4gICAgICAgICAgdGhpcy5kZWJ1ZygnZ2xvYnN0YXIgZm91bmQgbWF0Y2ghJywgZnIsIGZsLCBzd2FsbG93ZWUpXG4gICAgICAgICAgLy8gZm91bmQgYSBtYXRjaC5cbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGNhbid0IHN3YWxsb3cgXCIuXCIgb3IgXCIuLlwiIGV2ZXIuXG4gICAgICAgICAgLy8gY2FuIG9ubHkgc3dhbGxvdyBcIi5mb29cIiB3aGVuIGV4cGxpY2l0bHkgYXNrZWQuXG4gICAgICAgICAgaWYgKHN3YWxsb3dlZSA9PT0gJy4nIHx8IHN3YWxsb3dlZSA9PT0gJy4uJyB8fFxuICAgICAgICAgICAgKCFvcHRpb25zLmRvdCAmJiBzd2FsbG93ZWUuY2hhckF0KDApID09PSAnLicpKSB7XG4gICAgICAgICAgICB0aGlzLmRlYnVnKCdkb3QgZGV0ZWN0ZWQhJywgZmlsZSwgZnIsIHBhdHRlcm4sIHByKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyAqKiBzd2FsbG93cyBhIHNlZ21lbnQsIGFuZCBjb250aW51ZS5cbiAgICAgICAgICB0aGlzLmRlYnVnKCdnbG9ic3RhciBzd2FsbG93IGEgc2VnbWVudCwgYW5kIGNvbnRpbnVlJylcbiAgICAgICAgICBmcisrXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gbm8gbWF0Y2ggd2FzIGZvdW5kLlxuICAgICAgLy8gSG93ZXZlciwgaW4gcGFydGlhbCBtb2RlLCB3ZSBjYW4ndCBzYXkgdGhpcyBpcyBuZWNlc3NhcmlseSBvdmVyLlxuICAgICAgLy8gSWYgdGhlcmUncyBtb3JlICpwYXR0ZXJuKiBsZWZ0LCB0aGVuXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmIChwYXJ0aWFsKSB7XG4gICAgICAgIC8vIHJhbiBvdXQgb2YgZmlsZVxuICAgICAgICB0aGlzLmRlYnVnKCdcXG4+Pj4gbm8gbWF0Y2gsIHBhcnRpYWw/JywgZmlsZSwgZnIsIHBhdHRlcm4sIHByKVxuICAgICAgICBpZiAoZnIgPT09IGZsKSByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgLy8gc29tZXRoaW5nIG90aGVyIHRoYW4gKipcbiAgICAvLyBub24tbWFnaWMgcGF0dGVybnMganVzdCBoYXZlIHRvIG1hdGNoIGV4YWN0bHlcbiAgICAvLyBwYXR0ZXJucyB3aXRoIG1hZ2ljIGhhdmUgYmVlbiB0dXJuZWQgaW50byByZWdleHBzLlxuICAgIHZhciBoaXRcbiAgICBpZiAodHlwZW9mIHAgPT09ICdzdHJpbmcnKSB7XG4gICAgICBoaXQgPSBmID09PSBwXG4gICAgICB0aGlzLmRlYnVnKCdzdHJpbmcgbWF0Y2gnLCBwLCBmLCBoaXQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGhpdCA9IGYubWF0Y2gocClcbiAgICAgIHRoaXMuZGVidWcoJ3BhdHRlcm4gbWF0Y2gnLCBwLCBmLCBoaXQpXG4gICAgfVxuXG4gICAgaWYgKCFoaXQpIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8gTm90ZTogZW5kaW5nIGluIC8gbWVhbnMgdGhhdCB3ZSdsbCBnZXQgYSBmaW5hbCBcIlwiXG4gIC8vIGF0IHRoZSBlbmQgb2YgdGhlIHBhdHRlcm4uICBUaGlzIGNhbiBvbmx5IG1hdGNoIGFcbiAgLy8gY29ycmVzcG9uZGluZyBcIlwiIGF0IHRoZSBlbmQgb2YgdGhlIGZpbGUuXG4gIC8vIElmIHRoZSBmaWxlIGVuZHMgaW4gLywgdGhlbiBpdCBjYW4gb25seSBtYXRjaCBhXG4gIC8vIGEgcGF0dGVybiB0aGF0IGVuZHMgaW4gLywgdW5sZXNzIHRoZSBwYXR0ZXJuIGp1c3RcbiAgLy8gZG9lc24ndCBoYXZlIGFueSBtb3JlIGZvciBpdC4gQnV0LCBhL2IvIHNob3VsZCAqbm90KlxuICAvLyBtYXRjaCBcImEvYi8qXCIsIGV2ZW4gdGhvdWdoIFwiXCIgbWF0Y2hlcyBhZ2FpbnN0IHRoZVxuICAvLyBbXi9dKj8gcGF0dGVybiwgZXhjZXB0IGluIHBhcnRpYWwgbW9kZSwgd2hlcmUgaXQgbWlnaHRcbiAgLy8gc2ltcGx5IG5vdCBiZSByZWFjaGVkIHlldC5cbiAgLy8gSG93ZXZlciwgYS9iLyBzaG91bGQgc3RpbGwgc2F0aXNmeSBhLypcblxuICAvLyBub3cgZWl0aGVyIHdlIGZlbGwgb2ZmIHRoZSBlbmQgb2YgdGhlIHBhdHRlcm4sIG9yIHdlJ3JlIGRvbmUuXG4gIGlmIChmaSA9PT0gZmwgJiYgcGkgPT09IHBsKSB7XG4gICAgLy8gcmFuIG91dCBvZiBwYXR0ZXJuIGFuZCBmaWxlbmFtZSBhdCB0aGUgc2FtZSB0aW1lLlxuICAgIC8vIGFuIGV4YWN0IGhpdCFcbiAgICByZXR1cm4gdHJ1ZVxuICB9IGVsc2UgaWYgKGZpID09PSBmbCkge1xuICAgIC8vIHJhbiBvdXQgb2YgZmlsZSwgYnV0IHN0aWxsIGhhZCBwYXR0ZXJuIGxlZnQuXG4gICAgLy8gdGhpcyBpcyBvayBpZiB3ZSdyZSBkb2luZyB0aGUgbWF0Y2ggYXMgcGFydCBvZlxuICAgIC8vIGEgZ2xvYiBmcyB0cmF2ZXJzYWwuXG4gICAgcmV0dXJuIHBhcnRpYWxcbiAgfSBlbHNlIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovIGlmIChwaSA9PT0gcGwpIHtcbiAgICAvLyByYW4gb3V0IG9mIHBhdHRlcm4sIHN0aWxsIGhhdmUgZmlsZSBsZWZ0LlxuICAgIC8vIHRoaXMgaXMgb25seSBhY2NlcHRhYmxlIGlmIHdlJ3JlIG9uIHRoZSB2ZXJ5IGxhc3RcbiAgICAvLyBlbXB0eSBzZWdtZW50IG9mIGEgZmlsZSB3aXRoIGEgdHJhaWxpbmcgc2xhc2guXG4gICAgLy8gYS8qIHNob3VsZCBtYXRjaCBhL2IvXG4gICAgcmV0dXJuIChmaSA9PT0gZmwgLSAxKSAmJiAoZmlsZVtmaV0gPT09ICcnKVxuICB9XG5cbiAgLy8gc2hvdWxkIGJlIHVucmVhY2hhYmxlLlxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICB0aHJvdyBuZXcgRXJyb3IoJ3d0Zj8nKVxufVxuXG4vLyByZXBsYWNlIHN0dWZmIGxpa2UgXFwqIHdpdGggKlxuZnVuY3Rpb24gZ2xvYlVuZXNjYXBlIChzKSB7XG4gIHJldHVybiBzLnJlcGxhY2UoL1xcXFwoLikvZywgJyQxJylcbn1cblxuZnVuY3Rpb24gcmVnRXhwRXNjYXBlIChzKSB7XG4gIHJldHVybiBzLnJlcGxhY2UoL1stW1xcXXt9KCkqKz8uLFxcXFxeJHwjXFxzXS9nLCAnXFxcXCQmJylcbn1cbiIsInZhciB3cmFwcHkgPSByZXF1aXJlKCd3cmFwcHknKVxubW9kdWxlLmV4cG9ydHMgPSB3cmFwcHkob25jZSlcbm1vZHVsZS5leHBvcnRzLnN0cmljdCA9IHdyYXBweShvbmNlU3RyaWN0KVxuXG5vbmNlLnByb3RvID0gb25jZShmdW5jdGlvbiAoKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGdW5jdGlvbi5wcm90b3R5cGUsICdvbmNlJywge1xuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gb25jZSh0aGlzKVxuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZ1bmN0aW9uLnByb3RvdHlwZSwgJ29uY2VTdHJpY3QnLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBvbmNlU3RyaWN0KHRoaXMpXG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSlcbn0pXG5cbmZ1bmN0aW9uIG9uY2UgKGZuKSB7XG4gIHZhciBmID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChmLmNhbGxlZCkgcmV0dXJuIGYudmFsdWVcbiAgICBmLmNhbGxlZCA9IHRydWVcbiAgICByZXR1cm4gZi52YWx1ZSA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgfVxuICBmLmNhbGxlZCA9IGZhbHNlXG4gIHJldHVybiBmXG59XG5cbmZ1bmN0aW9uIG9uY2VTdHJpY3QgKGZuKSB7XG4gIHZhciBmID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChmLmNhbGxlZClcbiAgICAgIHRocm93IG5ldyBFcnJvcihmLm9uY2VFcnJvcilcbiAgICBmLmNhbGxlZCA9IHRydWVcbiAgICByZXR1cm4gZi52YWx1ZSA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgfVxuICB2YXIgbmFtZSA9IGZuLm5hbWUgfHwgJ0Z1bmN0aW9uIHdyYXBwZWQgd2l0aCBgb25jZWAnXG4gIGYub25jZUVycm9yID0gbmFtZSArIFwiIHNob3VsZG4ndCBiZSBjYWxsZWQgbW9yZSB0aGFuIG9uY2VcIlxuICBmLmNhbGxlZCA9IGZhbHNlXG4gIHJldHVybiBmXG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHBvc2l4KHBhdGgpIHtcblx0cmV0dXJuIHBhdGguY2hhckF0KDApID09PSAnLyc7XG59XG5cbmZ1bmN0aW9uIHdpbjMyKHBhdGgpIHtcblx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvYjNmY2MyNDVmYjI1NTM5OTA5ZWYxZDVlYWEwMWRiZjkyZTE2ODYzMy9saWIvcGF0aC5qcyNMNTZcblx0dmFyIHNwbGl0RGV2aWNlUmUgPSAvXihbYS16QS1aXTp8W1xcXFxcXC9dezJ9W15cXFxcXFwvXStbXFxcXFxcL10rW15cXFxcXFwvXSspPyhbXFxcXFxcL10pPyhbXFxzXFxTXSo/KSQvO1xuXHR2YXIgcmVzdWx0ID0gc3BsaXREZXZpY2VSZS5leGVjKHBhdGgpO1xuXHR2YXIgZGV2aWNlID0gcmVzdWx0WzFdIHx8ICcnO1xuXHR2YXIgaXNVbmMgPSBCb29sZWFuKGRldmljZSAmJiBkZXZpY2UuY2hhckF0KDEpICE9PSAnOicpO1xuXG5cdC8vIFVOQyBwYXRocyBhcmUgYWx3YXlzIGFic29sdXRlXG5cdHJldHVybiBCb29sZWFuKHJlc3VsdFsyXSB8fCBpc1VuYyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyA/IHdpbjMyIDogcG9zaXg7XG5tb2R1bGUuZXhwb3J0cy5wb3NpeCA9IHBvc2l4O1xubW9kdWxlLmV4cG9ydHMud2luMzIgPSB3aW4zMjtcbiIsImNvbnN0IGFzc2VydCA9IHJlcXVpcmUoXCJhc3NlcnRcIilcbmNvbnN0IHBhdGggPSByZXF1aXJlKFwicGF0aFwiKVxuY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIilcbmxldCBnbG9iID0gdW5kZWZpbmVkXG50cnkge1xuICBnbG9iID0gcmVxdWlyZShcImdsb2JcIilcbn0gY2F0Y2ggKF9lcnIpIHtcbiAgLy8gdHJlYXQgZ2xvYiBhcyBvcHRpb25hbC5cbn1cblxuY29uc3QgZGVmYXVsdEdsb2JPcHRzID0ge1xuICBub3NvcnQ6IHRydWUsXG4gIHNpbGVudDogdHJ1ZVxufVxuXG4vLyBmb3IgRU1GSUxFIGhhbmRsaW5nXG5sZXQgdGltZW91dCA9IDBcblxuY29uc3QgaXNXaW5kb3dzID0gKHByb2Nlc3MucGxhdGZvcm0gPT09IFwid2luMzJcIilcblxuY29uc3QgZGVmYXVsdHMgPSBvcHRpb25zID0+IHtcbiAgY29uc3QgbWV0aG9kcyA9IFtcbiAgICAndW5saW5rJyxcbiAgICAnY2htb2QnLFxuICAgICdzdGF0JyxcbiAgICAnbHN0YXQnLFxuICAgICdybWRpcicsXG4gICAgJ3JlYWRkaXInXG4gIF1cbiAgbWV0aG9kcy5mb3JFYWNoKG0gPT4ge1xuICAgIG9wdGlvbnNbbV0gPSBvcHRpb25zW21dIHx8IGZzW21dXG4gICAgbSA9IG0gKyAnU3luYydcbiAgICBvcHRpb25zW21dID0gb3B0aW9uc1ttXSB8fCBmc1ttXVxuICB9KVxuXG4gIG9wdGlvbnMubWF4QnVzeVRyaWVzID0gb3B0aW9ucy5tYXhCdXN5VHJpZXMgfHwgM1xuICBvcHRpb25zLmVtZmlsZVdhaXQgPSBvcHRpb25zLmVtZmlsZVdhaXQgfHwgMTAwMFxuICBpZiAob3B0aW9ucy5nbG9iID09PSBmYWxzZSkge1xuICAgIG9wdGlvbnMuZGlzYWJsZUdsb2IgPSB0cnVlXG4gIH1cbiAgaWYgKG9wdGlvbnMuZGlzYWJsZUdsb2IgIT09IHRydWUgJiYgZ2xvYiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgRXJyb3IoJ2dsb2IgZGVwZW5kZW5jeSBub3QgZm91bmQsIHNldCBgb3B0aW9ucy5kaXNhYmxlR2xvYiA9IHRydWVgIGlmIGludGVudGlvbmFsJylcbiAgfVxuICBvcHRpb25zLmRpc2FibGVHbG9iID0gb3B0aW9ucy5kaXNhYmxlR2xvYiB8fCBmYWxzZVxuICBvcHRpb25zLmdsb2IgPSBvcHRpb25zLmdsb2IgfHwgZGVmYXVsdEdsb2JPcHRzXG59XG5cbmNvbnN0IHJpbXJhZiA9IChwLCBvcHRpb25zLCBjYikgPT4ge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYiA9IG9wdGlvbnNcbiAgICBvcHRpb25zID0ge31cbiAgfVxuXG4gIGFzc2VydChwLCAncmltcmFmOiBtaXNzaW5nIHBhdGgnKVxuICBhc3NlcnQuZXF1YWwodHlwZW9mIHAsICdzdHJpbmcnLCAncmltcmFmOiBwYXRoIHNob3VsZCBiZSBhIHN0cmluZycpXG4gIGFzc2VydC5lcXVhbCh0eXBlb2YgY2IsICdmdW5jdGlvbicsICdyaW1yYWY6IGNhbGxiYWNrIGZ1bmN0aW9uIHJlcXVpcmVkJylcbiAgYXNzZXJ0KG9wdGlvbnMsICdyaW1yYWY6IGludmFsaWQgb3B0aW9ucyBhcmd1bWVudCBwcm92aWRlZCcpXG4gIGFzc2VydC5lcXVhbCh0eXBlb2Ygb3B0aW9ucywgJ29iamVjdCcsICdyaW1yYWY6IG9wdGlvbnMgc2hvdWxkIGJlIG9iamVjdCcpXG5cbiAgZGVmYXVsdHMob3B0aW9ucylcblxuICBsZXQgYnVzeVRyaWVzID0gMFxuICBsZXQgZXJyU3RhdGUgPSBudWxsXG4gIGxldCBuID0gMFxuXG4gIGNvbnN0IG5leHQgPSAoZXIpID0+IHtcbiAgICBlcnJTdGF0ZSA9IGVyclN0YXRlIHx8IGVyXG4gICAgaWYgKC0tbiA9PT0gMClcbiAgICAgIGNiKGVyclN0YXRlKVxuICB9XG5cbiAgY29uc3QgYWZ0ZXJHbG9iID0gKGVyLCByZXN1bHRzKSA9PiB7XG4gICAgaWYgKGVyKVxuICAgICAgcmV0dXJuIGNiKGVyKVxuXG4gICAgbiA9IHJlc3VsdHMubGVuZ3RoXG4gICAgaWYgKG4gPT09IDApXG4gICAgICByZXR1cm4gY2IoKVxuXG4gICAgcmVzdWx0cy5mb3JFYWNoKHAgPT4ge1xuICAgICAgY29uc3QgQ0IgPSAoZXIpID0+IHtcbiAgICAgICAgaWYgKGVyKSB7XG4gICAgICAgICAgaWYgKChlci5jb2RlID09PSBcIkVCVVNZXCIgfHwgZXIuY29kZSA9PT0gXCJFTk9URU1QVFlcIiB8fCBlci5jb2RlID09PSBcIkVQRVJNXCIpICYmXG4gICAgICAgICAgICAgIGJ1c3lUcmllcyA8IG9wdGlvbnMubWF4QnVzeVRyaWVzKSB7XG4gICAgICAgICAgICBidXN5VHJpZXMgKytcbiAgICAgICAgICAgIC8vIHRyeSBhZ2Fpbiwgd2l0aCB0aGUgc2FtZSBleGFjdCBjYWxsYmFjayBhcyB0aGlzIG9uZS5cbiAgICAgICAgICAgIHJldHVybiBzZXRUaW1lb3V0KCgpID0+IHJpbXJhZl8ocCwgb3B0aW9ucywgQ0IpLCBidXN5VHJpZXMgKiAxMDApXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gdGhpcyBvbmUgd29uJ3QgaGFwcGVuIGlmIGdyYWNlZnVsLWZzIGlzIHVzZWQuXG4gICAgICAgICAgaWYgKGVyLmNvZGUgPT09IFwiRU1GSUxFXCIgJiYgdGltZW91dCA8IG9wdGlvbnMuZW1maWxlV2FpdCkge1xuICAgICAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoKCkgPT4gcmltcmFmXyhwLCBvcHRpb25zLCBDQiksIHRpbWVvdXQgKyspXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gYWxyZWFkeSBnb25lXG4gICAgICAgICAgaWYgKGVyLmNvZGUgPT09IFwiRU5PRU5UXCIpIGVyID0gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgdGltZW91dCA9IDBcbiAgICAgICAgbmV4dChlcilcbiAgICAgIH1cbiAgICAgIHJpbXJhZl8ocCwgb3B0aW9ucywgQ0IpXG4gICAgfSlcbiAgfVxuXG4gIGlmIChvcHRpb25zLmRpc2FibGVHbG9iIHx8ICFnbG9iLmhhc01hZ2ljKHApKVxuICAgIHJldHVybiBhZnRlckdsb2IobnVsbCwgW3BdKVxuXG4gIG9wdGlvbnMubHN0YXQocCwgKGVyLCBzdGF0KSA9PiB7XG4gICAgaWYgKCFlcilcbiAgICAgIHJldHVybiBhZnRlckdsb2IobnVsbCwgW3BdKVxuXG4gICAgZ2xvYihwLCBvcHRpb25zLmdsb2IsIGFmdGVyR2xvYilcbiAgfSlcblxufVxuXG4vLyBUd28gcG9zc2libGUgc3RyYXRlZ2llcy5cbi8vIDEuIEFzc3VtZSBpdCdzIGEgZmlsZS4gIHVubGluayBpdCwgdGhlbiBkbyB0aGUgZGlyIHN0dWZmIG9uIEVQRVJNIG9yIEVJU0RJUlxuLy8gMi4gQXNzdW1lIGl0J3MgYSBkaXJlY3RvcnkuICByZWFkZGlyLCB0aGVuIGRvIHRoZSBmaWxlIHN0dWZmIG9uIEVOT1RESVJcbi8vXG4vLyBCb3RoIHJlc3VsdCBpbiBhbiBleHRyYSBzeXNjYWxsIHdoZW4geW91IGd1ZXNzIHdyb25nLiAgSG93ZXZlciwgdGhlcmVcbi8vIGFyZSBsaWtlbHkgZmFyIG1vcmUgbm9ybWFsIGZpbGVzIGluIHRoZSB3b3JsZCB0aGFuIGRpcmVjdG9yaWVzLiAgVGhpc1xuLy8gaXMgYmFzZWQgb24gdGhlIGFzc3VtcHRpb24gdGhhdCBhIHRoZSBhdmVyYWdlIG51bWJlciBvZiBmaWxlcyBwZXJcbi8vIGRpcmVjdG9yeSBpcyA+PSAxLlxuLy9cbi8vIElmIGFueW9uZSBldmVyIGNvbXBsYWlucyBhYm91dCB0aGlzLCB0aGVuIEkgZ3Vlc3MgdGhlIHN0cmF0ZWd5IGNvdWxkXG4vLyBiZSBtYWRlIGNvbmZpZ3VyYWJsZSBzb21laG93LiAgQnV0IHVudGlsIHRoZW4sIFlBR05JLlxuY29uc3QgcmltcmFmXyA9IChwLCBvcHRpb25zLCBjYikgPT4ge1xuICBhc3NlcnQocClcbiAgYXNzZXJ0KG9wdGlvbnMpXG4gIGFzc2VydCh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpXG5cbiAgLy8gc3Vub3MgbGV0cyB0aGUgcm9vdCB1c2VyIHVubGluayBkaXJlY3Rvcmllcywgd2hpY2ggaXMuLi4gd2VpcmQuXG4gIC8vIHNvIHdlIGhhdmUgdG8gbHN0YXQgaGVyZSBhbmQgbWFrZSBzdXJlIGl0J3Mgbm90IGEgZGlyLlxuICBvcHRpb25zLmxzdGF0KHAsIChlciwgc3QpID0+IHtcbiAgICBpZiAoZXIgJiYgZXIuY29kZSA9PT0gXCJFTk9FTlRcIilcbiAgICAgIHJldHVybiBjYihudWxsKVxuXG4gICAgLy8gV2luZG93cyBjYW4gRVBFUk0gb24gc3RhdC4gIExpZmUgaXMgc3VmZmVyaW5nLlxuICAgIGlmIChlciAmJiBlci5jb2RlID09PSBcIkVQRVJNXCIgJiYgaXNXaW5kb3dzKVxuICAgICAgZml4V2luRVBFUk0ocCwgb3B0aW9ucywgZXIsIGNiKVxuXG4gICAgaWYgKHN0ICYmIHN0LmlzRGlyZWN0b3J5KCkpXG4gICAgICByZXR1cm4gcm1kaXIocCwgb3B0aW9ucywgZXIsIGNiKVxuXG4gICAgb3B0aW9ucy51bmxpbmsocCwgZXIgPT4ge1xuICAgICAgaWYgKGVyKSB7XG4gICAgICAgIGlmIChlci5jb2RlID09PSBcIkVOT0VOVFwiKVxuICAgICAgICAgIHJldHVybiBjYihudWxsKVxuICAgICAgICBpZiAoZXIuY29kZSA9PT0gXCJFUEVSTVwiKVxuICAgICAgICAgIHJldHVybiAoaXNXaW5kb3dzKVxuICAgICAgICAgICAgPyBmaXhXaW5FUEVSTShwLCBvcHRpb25zLCBlciwgY2IpXG4gICAgICAgICAgICA6IHJtZGlyKHAsIG9wdGlvbnMsIGVyLCBjYilcbiAgICAgICAgaWYgKGVyLmNvZGUgPT09IFwiRUlTRElSXCIpXG4gICAgICAgICAgcmV0dXJuIHJtZGlyKHAsIG9wdGlvbnMsIGVyLCBjYilcbiAgICAgIH1cbiAgICAgIHJldHVybiBjYihlcilcbiAgICB9KVxuICB9KVxufVxuXG5jb25zdCBmaXhXaW5FUEVSTSA9IChwLCBvcHRpb25zLCBlciwgY2IpID0+IHtcbiAgYXNzZXJ0KHApXG4gIGFzc2VydChvcHRpb25zKVxuICBhc3NlcnQodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKVxuXG4gIG9wdGlvbnMuY2htb2QocCwgMG82NjYsIGVyMiA9PiB7XG4gICAgaWYgKGVyMilcbiAgICAgIGNiKGVyMi5jb2RlID09PSBcIkVOT0VOVFwiID8gbnVsbCA6IGVyKVxuICAgIGVsc2VcbiAgICAgIG9wdGlvbnMuc3RhdChwLCAoZXIzLCBzdGF0cykgPT4ge1xuICAgICAgICBpZiAoZXIzKVxuICAgICAgICAgIGNiKGVyMy5jb2RlID09PSBcIkVOT0VOVFwiID8gbnVsbCA6IGVyKVxuICAgICAgICBlbHNlIGlmIChzdGF0cy5pc0RpcmVjdG9yeSgpKVxuICAgICAgICAgIHJtZGlyKHAsIG9wdGlvbnMsIGVyLCBjYilcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG9wdGlvbnMudW5saW5rKHAsIGNiKVxuICAgICAgfSlcbiAgfSlcbn1cblxuY29uc3QgZml4V2luRVBFUk1TeW5jID0gKHAsIG9wdGlvbnMsIGVyKSA9PiB7XG4gIGFzc2VydChwKVxuICBhc3NlcnQob3B0aW9ucylcblxuICB0cnkge1xuICAgIG9wdGlvbnMuY2htb2RTeW5jKHAsIDBvNjY2KVxuICB9IGNhdGNoIChlcjIpIHtcbiAgICBpZiAoZXIyLmNvZGUgPT09IFwiRU5PRU5UXCIpXG4gICAgICByZXR1cm5cbiAgICBlbHNlXG4gICAgICB0aHJvdyBlclxuICB9XG5cbiAgbGV0IHN0YXRzXG4gIHRyeSB7XG4gICAgc3RhdHMgPSBvcHRpb25zLnN0YXRTeW5jKHApXG4gIH0gY2F0Y2ggKGVyMykge1xuICAgIGlmIChlcjMuY29kZSA9PT0gXCJFTk9FTlRcIilcbiAgICAgIHJldHVyblxuICAgIGVsc2VcbiAgICAgIHRocm93IGVyXG4gIH1cblxuICBpZiAoc3RhdHMuaXNEaXJlY3RvcnkoKSlcbiAgICBybWRpclN5bmMocCwgb3B0aW9ucywgZXIpXG4gIGVsc2VcbiAgICBvcHRpb25zLnVubGlua1N5bmMocClcbn1cblxuY29uc3Qgcm1kaXIgPSAocCwgb3B0aW9ucywgb3JpZ2luYWxFciwgY2IpID0+IHtcbiAgYXNzZXJ0KHApXG4gIGFzc2VydChvcHRpb25zKVxuICBhc3NlcnQodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKVxuXG4gIC8vIHRyeSB0byBybWRpciBmaXJzdCwgYW5kIG9ubHkgcmVhZGRpciBvbiBFTk9URU1QVFkgb3IgRUVYSVNUIChTdW5PUylcbiAgLy8gaWYgd2UgZ3Vlc3NlZCB3cm9uZywgYW5kIGl0J3Mgbm90IGEgZGlyZWN0b3J5LCB0aGVuXG4gIC8vIHJhaXNlIHRoZSBvcmlnaW5hbCBlcnJvci5cbiAgb3B0aW9ucy5ybWRpcihwLCBlciA9PiB7XG4gICAgaWYgKGVyICYmIChlci5jb2RlID09PSBcIkVOT1RFTVBUWVwiIHx8IGVyLmNvZGUgPT09IFwiRUVYSVNUXCIgfHwgZXIuY29kZSA9PT0gXCJFUEVSTVwiKSlcbiAgICAgIHJta2lkcyhwLCBvcHRpb25zLCBjYilcbiAgICBlbHNlIGlmIChlciAmJiBlci5jb2RlID09PSBcIkVOT1RESVJcIilcbiAgICAgIGNiKG9yaWdpbmFsRXIpXG4gICAgZWxzZVxuICAgICAgY2IoZXIpXG4gIH0pXG59XG5cbmNvbnN0IHJta2lkcyA9IChwLCBvcHRpb25zLCBjYikgPT4ge1xuICBhc3NlcnQocClcbiAgYXNzZXJ0KG9wdGlvbnMpXG4gIGFzc2VydCh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpXG5cbiAgb3B0aW9ucy5yZWFkZGlyKHAsIChlciwgZmlsZXMpID0+IHtcbiAgICBpZiAoZXIpXG4gICAgICByZXR1cm4gY2IoZXIpXG4gICAgbGV0IG4gPSBmaWxlcy5sZW5ndGhcbiAgICBpZiAobiA9PT0gMClcbiAgICAgIHJldHVybiBvcHRpb25zLnJtZGlyKHAsIGNiKVxuICAgIGxldCBlcnJTdGF0ZVxuICAgIGZpbGVzLmZvckVhY2goZiA9PiB7XG4gICAgICByaW1yYWYocGF0aC5qb2luKHAsIGYpLCBvcHRpb25zLCBlciA9PiB7XG4gICAgICAgIGlmIChlcnJTdGF0ZSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgaWYgKGVyKVxuICAgICAgICAgIHJldHVybiBjYihlcnJTdGF0ZSA9IGVyKVxuICAgICAgICBpZiAoLS1uID09PSAwKVxuICAgICAgICAgIG9wdGlvbnMucm1kaXIocCwgY2IpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG59XG5cbi8vIHRoaXMgbG9va3Mgc2ltcGxlciwgYW5kIGlzIHN0cmljdGx5ICpmYXN0ZXIqLCBidXQgd2lsbFxuLy8gdGllIHVwIHRoZSBKYXZhU2NyaXB0IHRocmVhZCBhbmQgZmFpbCBvbiBleGNlc3NpdmVseVxuLy8gZGVlcCBkaXJlY3RvcnkgdHJlZXMuXG5jb25zdCByaW1yYWZTeW5jID0gKHAsIG9wdGlvbnMpID0+IHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgZGVmYXVsdHMob3B0aW9ucylcblxuICBhc3NlcnQocCwgJ3JpbXJhZjogbWlzc2luZyBwYXRoJylcbiAgYXNzZXJ0LmVxdWFsKHR5cGVvZiBwLCAnc3RyaW5nJywgJ3JpbXJhZjogcGF0aCBzaG91bGQgYmUgYSBzdHJpbmcnKVxuICBhc3NlcnQob3B0aW9ucywgJ3JpbXJhZjogbWlzc2luZyBvcHRpb25zJylcbiAgYXNzZXJ0LmVxdWFsKHR5cGVvZiBvcHRpb25zLCAnb2JqZWN0JywgJ3JpbXJhZjogb3B0aW9ucyBzaG91bGQgYmUgb2JqZWN0JylcblxuICBsZXQgcmVzdWx0c1xuXG4gIGlmIChvcHRpb25zLmRpc2FibGVHbG9iIHx8ICFnbG9iLmhhc01hZ2ljKHApKSB7XG4gICAgcmVzdWx0cyA9IFtwXVxuICB9IGVsc2Uge1xuICAgIHRyeSB7XG4gICAgICBvcHRpb25zLmxzdGF0U3luYyhwKVxuICAgICAgcmVzdWx0cyA9IFtwXVxuICAgIH0gY2F0Y2ggKGVyKSB7XG4gICAgICByZXN1bHRzID0gZ2xvYi5zeW5jKHAsIG9wdGlvbnMuZ2xvYilcbiAgICB9XG4gIH1cblxuICBpZiAoIXJlc3VsdHMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHAgPSByZXN1bHRzW2ldXG5cbiAgICBsZXQgc3RcbiAgICB0cnkge1xuICAgICAgc3QgPSBvcHRpb25zLmxzdGF0U3luYyhwKVxuICAgIH0gY2F0Y2ggKGVyKSB7XG4gICAgICBpZiAoZXIuY29kZSA9PT0gXCJFTk9FTlRcIilcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIC8vIFdpbmRvd3MgY2FuIEVQRVJNIG9uIHN0YXQuICBMaWZlIGlzIHN1ZmZlcmluZy5cbiAgICAgIGlmIChlci5jb2RlID09PSBcIkVQRVJNXCIgJiYgaXNXaW5kb3dzKVxuICAgICAgICBmaXhXaW5FUEVSTVN5bmMocCwgb3B0aW9ucywgZXIpXG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIC8vIHN1bm9zIGxldHMgdGhlIHJvb3QgdXNlciB1bmxpbmsgZGlyZWN0b3JpZXMsIHdoaWNoIGlzLi4uIHdlaXJkLlxuICAgICAgaWYgKHN0ICYmIHN0LmlzRGlyZWN0b3J5KCkpXG4gICAgICAgIHJtZGlyU3luYyhwLCBvcHRpb25zLCBudWxsKVxuICAgICAgZWxzZVxuICAgICAgICBvcHRpb25zLnVubGlua1N5bmMocClcbiAgICB9IGNhdGNoIChlcikge1xuICAgICAgaWYgKGVyLmNvZGUgPT09IFwiRU5PRU5UXCIpXG4gICAgICAgIHJldHVyblxuICAgICAgaWYgKGVyLmNvZGUgPT09IFwiRVBFUk1cIilcbiAgICAgICAgcmV0dXJuIGlzV2luZG93cyA/IGZpeFdpbkVQRVJNU3luYyhwLCBvcHRpb25zLCBlcikgOiBybWRpclN5bmMocCwgb3B0aW9ucywgZXIpXG4gICAgICBpZiAoZXIuY29kZSAhPT0gXCJFSVNESVJcIilcbiAgICAgICAgdGhyb3cgZXJcblxuICAgICAgcm1kaXJTeW5jKHAsIG9wdGlvbnMsIGVyKVxuICAgIH1cbiAgfVxufVxuXG5jb25zdCBybWRpclN5bmMgPSAocCwgb3B0aW9ucywgb3JpZ2luYWxFcikgPT4ge1xuICBhc3NlcnQocClcbiAgYXNzZXJ0KG9wdGlvbnMpXG5cbiAgdHJ5IHtcbiAgICBvcHRpb25zLnJtZGlyU3luYyhwKVxuICB9IGNhdGNoIChlcikge1xuICAgIGlmIChlci5jb2RlID09PSBcIkVOT0VOVFwiKVxuICAgICAgcmV0dXJuXG4gICAgaWYgKGVyLmNvZGUgPT09IFwiRU5PVERJUlwiKVxuICAgICAgdGhyb3cgb3JpZ2luYWxFclxuICAgIGlmIChlci5jb2RlID09PSBcIkVOT1RFTVBUWVwiIHx8IGVyLmNvZGUgPT09IFwiRUVYSVNUXCIgfHwgZXIuY29kZSA9PT0gXCJFUEVSTVwiKVxuICAgICAgcm1raWRzU3luYyhwLCBvcHRpb25zKVxuICB9XG59XG5cbmNvbnN0IHJta2lkc1N5bmMgPSAocCwgb3B0aW9ucykgPT4ge1xuICBhc3NlcnQocClcbiAgYXNzZXJ0KG9wdGlvbnMpXG4gIG9wdGlvbnMucmVhZGRpclN5bmMocCkuZm9yRWFjaChmID0+IHJpbXJhZlN5bmMocGF0aC5qb2luKHAsIGYpLCBvcHRpb25zKSlcblxuICAvLyBXZSBvbmx5IGVuZCB1cCBoZXJlIG9uY2Ugd2UgZ290IEVOT1RFTVBUWSBhdCBsZWFzdCBvbmNlLCBhbmRcbiAgLy8gYXQgdGhpcyBwb2ludCwgd2UgYXJlIGd1YXJhbnRlZWQgdG8gaGF2ZSByZW1vdmVkIGFsbCB0aGUga2lkcy5cbiAgLy8gU28sIHdlIGtub3cgdGhhdCBpdCB3b24ndCBiZSBFTk9FTlQgb3IgRU5PVERJUiBvciBhbnl0aGluZyBlbHNlLlxuICAvLyB0cnkgcmVhbGx5IGhhcmQgdG8gZGVsZXRlIHN0dWZmIG9uIHdpbmRvd3MsIGJlY2F1c2UgaXQgaGFzIGFcbiAgLy8gUFJPRk9VTkRMWSBhbm5veWluZyBoYWJpdCBvZiBub3QgY2xvc2luZyBoYW5kbGVzIHByb21wdGx5IHdoZW5cbiAgLy8gZmlsZXMgYXJlIGRlbGV0ZWQsIHJlc3VsdGluZyBpbiBzcHVyaW91cyBFTk9URU1QVFkgZXJyb3JzLlxuICBjb25zdCByZXRyaWVzID0gaXNXaW5kb3dzID8gMTAwIDogMVxuICBsZXQgaSA9IDBcbiAgZG8ge1xuICAgIGxldCB0aHJldyA9IHRydWVcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmV0ID0gb3B0aW9ucy5ybWRpclN5bmMocCwgb3B0aW9ucylcbiAgICAgIHRocmV3ID0gZmFsc2VcbiAgICAgIHJldHVybiByZXRcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKCsraSA8IHJldHJpZXMgJiYgdGhyZXcpXG4gICAgICAgIGNvbnRpbnVlXG4gICAgfVxuICB9IHdoaWxlICh0cnVlKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJpbXJhZlxucmltcmFmLnN5bmMgPSByaW1yYWZTeW5jXG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHsgcHJvbWlzaWZ5IH0gPSByZXF1aXJlKFwidXRpbFwiKTtcbmNvbnN0IHRtcCA9IHJlcXVpcmUoXCJ0bXBcIik7XG5cbi8vIGZpbGVcbm1vZHVsZS5leHBvcnRzLmZpbGVTeW5jID0gdG1wLmZpbGVTeW5jO1xuY29uc3QgZmlsZVdpdGhPcHRpb25zID0gcHJvbWlzaWZ5KChvcHRpb25zLCBjYikgPT5cbiAgdG1wLmZpbGUob3B0aW9ucywgKGVyciwgcGF0aCwgZmQsIGNsZWFudXApID0+XG4gICAgZXJyID8gY2IoZXJyKSA6IGNiKHVuZGVmaW5lZCwgeyBwYXRoLCBmZCwgY2xlYW51cDogcHJvbWlzaWZ5KGNsZWFudXApIH0pXG4gIClcbik7XG5tb2R1bGUuZXhwb3J0cy5maWxlID0gYXN5bmMgKG9wdGlvbnMpID0+IGZpbGVXaXRoT3B0aW9ucyhvcHRpb25zKTtcblxubW9kdWxlLmV4cG9ydHMud2l0aEZpbGUgPSBhc3luYyBmdW5jdGlvbiB3aXRoRmlsZShmbiwgb3B0aW9ucykge1xuICBjb25zdCB7IHBhdGgsIGZkLCBjbGVhbnVwIH0gPSBhd2FpdCBtb2R1bGUuZXhwb3J0cy5maWxlKG9wdGlvbnMpO1xuICB0cnkge1xuICAgIHJldHVybiBhd2FpdCBmbih7IHBhdGgsIGZkIH0pO1xuICB9IGZpbmFsbHkge1xuICAgIGF3YWl0IGNsZWFudXAoKTtcbiAgfVxufTtcblxuXG4vLyBkaXJlY3Rvcnlcbm1vZHVsZS5leHBvcnRzLmRpclN5bmMgPSB0bXAuZGlyU3luYztcbmNvbnN0IGRpcldpdGhPcHRpb25zID0gcHJvbWlzaWZ5KChvcHRpb25zLCBjYikgPT5cbiAgdG1wLmRpcihvcHRpb25zLCAoZXJyLCBwYXRoLCBjbGVhbnVwKSA9PlxuICAgIGVyciA/IGNiKGVycikgOiBjYih1bmRlZmluZWQsIHsgcGF0aCwgY2xlYW51cDogcHJvbWlzaWZ5KGNsZWFudXApIH0pXG4gIClcbik7XG5tb2R1bGUuZXhwb3J0cy5kaXIgPSBhc3luYyAob3B0aW9ucykgPT4gZGlyV2l0aE9wdGlvbnMob3B0aW9ucyk7XG5cbm1vZHVsZS5leHBvcnRzLndpdGhEaXIgPSBhc3luYyBmdW5jdGlvbiB3aXRoRGlyKGZuLCBvcHRpb25zKSB7XG4gIGNvbnN0IHsgcGF0aCwgY2xlYW51cCB9ID0gYXdhaXQgbW9kdWxlLmV4cG9ydHMuZGlyKG9wdGlvbnMpO1xuICB0cnkge1xuICAgIHJldHVybiBhd2FpdCBmbih7IHBhdGggfSk7XG4gIH0gZmluYWxseSB7XG4gICAgYXdhaXQgY2xlYW51cCgpO1xuICB9XG59O1xuXG5cbi8vIG5hbWUgZ2VuZXJhdGlvblxubW9kdWxlLmV4cG9ydHMudG1wTmFtZVN5bmMgPSB0bXAudG1wTmFtZVN5bmM7XG5tb2R1bGUuZXhwb3J0cy50bXBOYW1lID0gcHJvbWlzaWZ5KHRtcC50bXBOYW1lKTtcblxubW9kdWxlLmV4cG9ydHMudG1wZGlyID0gdG1wLnRtcGRpcjtcblxubW9kdWxlLmV4cG9ydHMuc2V0R3JhY2VmdWxDbGVhbnVwID0gdG1wLnNldEdyYWNlZnVsQ2xlYW51cDtcbiIsIi8qIVxuICogVG1wXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTcgS0FSQVNaSSBJc3R2YW4gPGdpdGh1YkBzcGFtLnJhc3ppLmh1PlxuICpcbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbi8qXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBvcyA9IHJlcXVpcmUoJ29zJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XG5jb25zdCBfYyA9IHsgZnM6IGZzLmNvbnN0YW50cywgb3M6IG9zLmNvbnN0YW50cyB9O1xuY29uc3QgcmltcmFmID0gcmVxdWlyZSgncmltcmFmJyk7XG5cbi8qXG4gKiBUaGUgd29ya2luZyBpbm5lciB2YXJpYWJsZXMuXG4gKi9cbmNvbnN0XG4gIC8vIHRoZSByYW5kb20gY2hhcmFjdGVycyB0byBjaG9vc2UgZnJvbVxuICBSQU5ET01fQ0hBUlMgPSAnMDEyMzQ1Njc4OUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXonLFxuXG4gIFRFTVBMQVRFX1BBVFRFUk4gPSAvWFhYWFhYLyxcblxuICBERUZBVUxUX1RSSUVTID0gMyxcblxuICBDUkVBVEVfRkxBR1MgPSAoX2MuT19DUkVBVCB8fCBfYy5mcy5PX0NSRUFUKSB8IChfYy5PX0VYQ0wgfHwgX2MuZnMuT19FWENMKSB8IChfYy5PX1JEV1IgfHwgX2MuZnMuT19SRFdSKSxcblxuICAvLyBjb25zdGFudHMgYXJlIG9mZiBvbiB0aGUgd2luZG93cyBwbGF0Zm9ybSBhbmQgd2lsbCBub3QgbWF0Y2ggdGhlIGFjdHVhbCBlcnJubyBjb2Rlc1xuICBJU19XSU4zMiA9IG9zLnBsYXRmb3JtKCkgPT09ICd3aW4zMicsXG4gIEVCQURGID0gX2MuRUJBREYgfHwgX2Mub3MuZXJybm8uRUJBREYsXG4gIEVOT0VOVCA9IF9jLkVOT0VOVCB8fCBfYy5vcy5lcnJuby5FTk9FTlQsXG5cbiAgRElSX01PREUgPSAwbzcwMCAvKiA0NDggKi8sXG4gIEZJTEVfTU9ERSA9IDBvNjAwIC8qIDM4NCAqLyxcblxuICBFWElUID0gJ2V4aXQnLFxuXG4gIC8vIHRoaXMgd2lsbCBob2xkIHRoZSBvYmplY3RzIG5lZWQgdG8gYmUgcmVtb3ZlZCBvbiBleGl0XG4gIF9yZW1vdmVPYmplY3RzID0gW10sXG5cbiAgLy8gQVBJIGNoYW5nZSBpbiBmcy5ybWRpclN5bmMgbGVhZHMgdG8gZXJyb3Igd2hlbiBwYXNzaW5nIGluIGEgc2Vjb25kIHBhcmFtZXRlciwgZS5nLiB0aGUgY2FsbGJhY2tcbiAgRk5fUk1ESVJfU1lOQyA9IGZzLnJtZGlyU3luYy5iaW5kKGZzKSxcbiAgRk5fUklNUkFGX1NZTkMgPSByaW1yYWYuc3luYztcblxubGV0XG4gIF9ncmFjZWZ1bENsZWFudXAgPSBmYWxzZTtcblxuLyoqXG4gKiBHZXRzIGEgdGVtcG9yYXJ5IGZpbGUgbmFtZS5cbiAqXG4gKiBAcGFyYW0geyhPcHRpb25zfHRtcE5hbWVDYWxsYmFjayl9IG9wdGlvbnMgb3B0aW9ucyBvciBjYWxsYmFja1xuICogQHBhcmFtIHs/dG1wTmFtZUNhbGxiYWNrfSBjYWxsYmFjayB0aGUgY2FsbGJhY2sgZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gdG1wTmFtZShvcHRpb25zLCBjYWxsYmFjaykge1xuICBjb25zdFxuICAgIGFyZ3MgPSBfcGFyc2VBcmd1bWVudHMob3B0aW9ucywgY2FsbGJhY2spLFxuICAgIG9wdHMgPSBhcmdzWzBdLFxuICAgIGNiID0gYXJnc1sxXTtcblxuICB0cnkge1xuICAgIF9hc3NlcnRBbmRTYW5pdGl6ZU9wdGlvbnMob3B0cyk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBjYihlcnIpO1xuICB9XG5cbiAgbGV0IHRyaWVzID0gb3B0cy50cmllcztcbiAgKGZ1bmN0aW9uIF9nZXRVbmlxdWVOYW1lKCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBuYW1lID0gX2dlbmVyYXRlVG1wTmFtZShvcHRzKTtcblxuICAgICAgLy8gY2hlY2sgd2hldGhlciB0aGUgcGF0aCBleGlzdHMgdGhlbiByZXRyeSBpZiBuZWVkZWRcbiAgICAgIGZzLnN0YXQobmFtZSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICAgICAgaWYgKHRyaWVzLS0gPiAwKSByZXR1cm4gX2dldFVuaXF1ZU5hbWUoKTtcblxuICAgICAgICAgIHJldHVybiBjYihuZXcgRXJyb3IoJ0NvdWxkIG5vdCBnZXQgYSB1bmlxdWUgdG1wIGZpbGVuYW1lLCBtYXggdHJpZXMgcmVhY2hlZCAnICsgbmFtZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2IobnVsbCwgbmFtZSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNiKGVycik7XG4gICAgfVxuICB9KCkpO1xufVxuXG4vKipcbiAqIFN5bmNocm9ub3VzIHZlcnNpb24gb2YgdG1wTmFtZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybnMge3N0cmluZ30gdGhlIGdlbmVyYXRlZCByYW5kb20gbmFtZVxuICogQHRocm93cyB7RXJyb3J9IGlmIHRoZSBvcHRpb25zIGFyZSBpbnZhbGlkIG9yIGNvdWxkIG5vdCBnZW5lcmF0ZSBhIGZpbGVuYW1lXG4gKi9cbmZ1bmN0aW9uIHRtcE5hbWVTeW5jKG9wdGlvbnMpIHtcbiAgY29uc3RcbiAgICBhcmdzID0gX3BhcnNlQXJndW1lbnRzKG9wdGlvbnMpLFxuICAgIG9wdHMgPSBhcmdzWzBdO1xuXG4gIF9hc3NlcnRBbmRTYW5pdGl6ZU9wdGlvbnMob3B0cyk7XG5cbiAgbGV0IHRyaWVzID0gb3B0cy50cmllcztcbiAgZG8ge1xuICAgIGNvbnN0IG5hbWUgPSBfZ2VuZXJhdGVUbXBOYW1lKG9wdHMpO1xuICAgIHRyeSB7XG4gICAgICBmcy5zdGF0U3luYyhuYW1lKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbmFtZTtcbiAgICB9XG4gIH0gd2hpbGUgKHRyaWVzLS0gPiAwKTtcblxuICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBnZXQgYSB1bmlxdWUgdG1wIGZpbGVuYW1lLCBtYXggdHJpZXMgcmVhY2hlZCcpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYW5kIG9wZW5zIGEgdGVtcG9yYXJ5IGZpbGUuXG4gKlxuICogQHBhcmFtIHsoT3B0aW9uc3xudWxsfHVuZGVmaW5lZHxmaWxlQ2FsbGJhY2spfSBvcHRpb25zIHRoZSBjb25maWcgb3B0aW9ucyBvciB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gb3IgbnVsbCBvciB1bmRlZmluZWRcbiAqIEBwYXJhbSB7P2ZpbGVDYWxsYmFja30gY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gZmlsZShvcHRpb25zLCBjYWxsYmFjaykge1xuICBjb25zdFxuICAgIGFyZ3MgPSBfcGFyc2VBcmd1bWVudHMob3B0aW9ucywgY2FsbGJhY2spLFxuICAgIG9wdHMgPSBhcmdzWzBdLFxuICAgIGNiID0gYXJnc1sxXTtcblxuICAvLyBnZXRzIGEgdGVtcG9yYXJ5IGZpbGVuYW1lXG4gIHRtcE5hbWUob3B0cywgZnVuY3Rpb24gX3RtcE5hbWVDcmVhdGVkKGVyciwgbmFtZSkge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgaWYgKGVycikgcmV0dXJuIGNiKGVycik7XG5cbiAgICAvLyBjcmVhdGUgYW5kIG9wZW4gdGhlIGZpbGVcbiAgICBmcy5vcGVuKG5hbWUsIENSRUFURV9GTEFHUywgb3B0cy5tb2RlIHx8IEZJTEVfTU9ERSwgZnVuY3Rpb24gX2ZpbGVDcmVhdGVkKGVyciwgZmQpIHtcbiAgICAgIC8qIGlzdGFuYnUgaWdub3JlIGVsc2UgKi9cbiAgICAgIGlmIChlcnIpIHJldHVybiBjYihlcnIpO1xuXG4gICAgICBpZiAob3B0cy5kaXNjYXJkRGVzY3JpcHRvcikge1xuICAgICAgICByZXR1cm4gZnMuY2xvc2UoZmQsIGZ1bmN0aW9uIF9kaXNjYXJkQ2FsbGJhY2socG9zc2libGVFcnIpIHtcbiAgICAgICAgICAvLyB0aGUgY2hhbmNlIG9mIGdldHRpbmcgYW4gZXJyb3Igb24gY2xvc2UgaGVyZSBpcyByYXRoZXIgbG93IGFuZCBtaWdodCBvY2N1ciBpbiB0aGUgbW9zdCBlZGdpZXN0IGNhc2VzIG9ubHlcbiAgICAgICAgICByZXR1cm4gY2IocG9zc2libGVFcnIsIG5hbWUsIHVuZGVmaW5lZCwgX3ByZXBhcmVUbXBGaWxlUmVtb3ZlQ2FsbGJhY2sobmFtZSwgLTEsIG9wdHMsIGZhbHNlKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZGV0YWNoRGVzY3JpcHRvciBwYXNzZXMgdGhlIGRlc2NyaXB0b3Igd2hlcmVhcyBkaXNjYXJkRGVzY3JpcHRvciBjbG9zZXMgaXQsIGVpdGhlciB3YXksIHdlIG5vIGxvbmdlciBjYXJlXG4gICAgICAgIC8vIGFib3V0IHRoZSBkZXNjcmlwdG9yXG4gICAgICAgIGNvbnN0IGRpc2NhcmRPckRldGFjaERlc2NyaXB0b3IgPSBvcHRzLmRpc2NhcmREZXNjcmlwdG9yIHx8IG9wdHMuZGV0YWNoRGVzY3JpcHRvcjtcbiAgICAgICAgY2IobnVsbCwgbmFtZSwgZmQsIF9wcmVwYXJlVG1wRmlsZVJlbW92ZUNhbGxiYWNrKG5hbWUsIGRpc2NhcmRPckRldGFjaERlc2NyaXB0b3IgPyAtMSA6IGZkLCBvcHRzLCBmYWxzZSkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91cyB2ZXJzaW9uIG9mIGZpbGUuXG4gKlxuICogQHBhcmFtIHtPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7RmlsZVN5bmNPYmplY3R9IG9iamVjdCBjb25zaXN0cyBvZiBuYW1lLCBmZCBhbmQgcmVtb3ZlQ2FsbGJhY2tcbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiBjYW5ub3QgY3JlYXRlIGEgZmlsZVxuICovXG5mdW5jdGlvbiBmaWxlU3luYyhvcHRpb25zKSB7XG4gIGNvbnN0XG4gICAgYXJncyA9IF9wYXJzZUFyZ3VtZW50cyhvcHRpb25zKSxcbiAgICBvcHRzID0gYXJnc1swXTtcblxuICBjb25zdCBkaXNjYXJkT3JEZXRhY2hEZXNjcmlwdG9yID0gb3B0cy5kaXNjYXJkRGVzY3JpcHRvciB8fCBvcHRzLmRldGFjaERlc2NyaXB0b3I7XG4gIGNvbnN0IG5hbWUgPSB0bXBOYW1lU3luYyhvcHRzKTtcbiAgdmFyIGZkID0gZnMub3BlblN5bmMobmFtZSwgQ1JFQVRFX0ZMQUdTLCBvcHRzLm1vZGUgfHwgRklMRV9NT0RFKTtcbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKG9wdHMuZGlzY2FyZERlc2NyaXB0b3IpIHtcbiAgICBmcy5jbG9zZVN5bmMoZmQpO1xuICAgIGZkID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBuYW1lLFxuICAgIGZkOiBmZCxcbiAgICByZW1vdmVDYWxsYmFjazogX3ByZXBhcmVUbXBGaWxlUmVtb3ZlQ2FsbGJhY2sobmFtZSwgZGlzY2FyZE9yRGV0YWNoRGVzY3JpcHRvciA/IC0xIDogZmQsIG9wdHMsIHRydWUpXG4gIH07XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHRlbXBvcmFyeSBkaXJlY3RvcnkuXG4gKlxuICogQHBhcmFtIHsoT3B0aW9uc3xkaXJDYWxsYmFjayl9IG9wdGlvbnMgdGhlIG9wdGlvbnMgb3IgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gKiBAcGFyYW0gez9kaXJDYWxsYmFja30gY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gZGlyKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIGNvbnN0XG4gICAgYXJncyA9IF9wYXJzZUFyZ3VtZW50cyhvcHRpb25zLCBjYWxsYmFjayksXG4gICAgb3B0cyA9IGFyZ3NbMF0sXG4gICAgY2IgPSBhcmdzWzFdO1xuXG4gIC8vIGdldHMgYSB0ZW1wb3JhcnkgZmlsZW5hbWVcbiAgdG1wTmFtZShvcHRzLCBmdW5jdGlvbiBfdG1wTmFtZUNyZWF0ZWQoZXJyLCBuYW1lKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICBpZiAoZXJyKSByZXR1cm4gY2IoZXJyKTtcblxuICAgIC8vIGNyZWF0ZSB0aGUgZGlyZWN0b3J5XG4gICAgZnMubWtkaXIobmFtZSwgb3B0cy5tb2RlIHx8IERJUl9NT0RFLCBmdW5jdGlvbiBfZGlyQ3JlYXRlZChlcnIpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICBpZiAoZXJyKSByZXR1cm4gY2IoZXJyKTtcblxuICAgICAgY2IobnVsbCwgbmFtZSwgX3ByZXBhcmVUbXBEaXJSZW1vdmVDYWxsYmFjayhuYW1lLCBvcHRzLCBmYWxzZSkpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91cyB2ZXJzaW9uIG9mIGRpci5cbiAqXG4gKiBAcGFyYW0ge09wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtEaXJTeW5jT2JqZWN0fSBvYmplY3QgY29uc2lzdHMgb2YgbmFtZSBhbmQgcmVtb3ZlQ2FsbGJhY2tcbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiBpdCBjYW5ub3QgY3JlYXRlIGEgZGlyZWN0b3J5XG4gKi9cbmZ1bmN0aW9uIGRpclN5bmMob3B0aW9ucykge1xuICBjb25zdFxuICAgIGFyZ3MgPSBfcGFyc2VBcmd1bWVudHMob3B0aW9ucyksXG4gICAgb3B0cyA9IGFyZ3NbMF07XG5cbiAgY29uc3QgbmFtZSA9IHRtcE5hbWVTeW5jKG9wdHMpO1xuICBmcy5ta2RpclN5bmMobmFtZSwgb3B0cy5tb2RlIHx8IERJUl9NT0RFKTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6IG5hbWUsXG4gICAgcmVtb3ZlQ2FsbGJhY2s6IF9wcmVwYXJlVG1wRGlyUmVtb3ZlQ2FsbGJhY2sobmFtZSwgb3B0cywgdHJ1ZSlcbiAgfTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGZpbGVzIGFzeW5jaHJvbm91c2x5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBmZFBhdGhcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHRcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9yZW1vdmVGaWxlQXN5bmMoZmRQYXRoLCBuZXh0KSB7XG4gIGNvbnN0IF9oYW5kbGVyID0gZnVuY3Rpb24gKGVycikge1xuICAgIGlmIChlcnIgJiYgIV9pc0VOT0VOVChlcnIpKSB7XG4gICAgICAvLyByZXJhaXNlIGFueSB1bmFudGljaXBhdGVkIGVycm9yXG4gICAgICByZXR1cm4gbmV4dChlcnIpO1xuICAgIH1cbiAgICBuZXh0KCk7XG4gIH07XG5cbiAgaWYgKDAgPD0gZmRQYXRoWzBdKVxuICAgIGZzLmNsb3NlKGZkUGF0aFswXSwgZnVuY3Rpb24gKCkge1xuICAgICAgZnMudW5saW5rKGZkUGF0aFsxXSwgX2hhbmRsZXIpO1xuICAgIH0pO1xuICBlbHNlIGZzLnVubGluayhmZFBhdGhbMV0sIF9oYW5kbGVyKTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGZpbGVzIHN5bmNocm9ub3VzbHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGZkUGF0aFxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX3JlbW92ZUZpbGVTeW5jKGZkUGF0aCkge1xuICBsZXQgcmV0aHJvd25FeGNlcHRpb24gPSBudWxsO1xuICB0cnkge1xuICAgIGlmICgwIDw9IGZkUGF0aFswXSkgZnMuY2xvc2VTeW5jKGZkUGF0aFswXSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyByZXJhaXNlIGFueSB1bmFudGljaXBhdGVkIGVycm9yXG4gICAgaWYgKCFfaXNFQkFERihlKSAmJiAhX2lzRU5PRU5UKGUpKSB0aHJvdyBlO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBmcy51bmxpbmtTeW5jKGZkUGF0aFsxXSk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAvLyByZXJhaXNlIGFueSB1bmFudGljaXBhdGVkIGVycm9yXG4gICAgICBpZiAoIV9pc0VOT0VOVChlKSkgcmV0aHJvd25FeGNlcHRpb24gPSBlO1xuICAgIH1cbiAgfVxuICBpZiAocmV0aHJvd25FeGNlcHRpb24gIT09IG51bGwpIHtcbiAgICB0aHJvdyByZXRocm93bkV4Y2VwdGlvbjtcbiAgfVxufVxuXG4vKipcbiAqIFByZXBhcmVzIHRoZSBjYWxsYmFjayBmb3IgcmVtb3ZhbCBvZiB0aGUgdGVtcG9yYXJ5IGZpbGUuXG4gKlxuICogUmV0dXJucyBlaXRoZXIgYSBzeW5jIGNhbGxiYWNrIG9yIGEgYXN5bmMgY2FsbGJhY2sgZGVwZW5kaW5nIG9uIHdoZXRoZXJcbiAqIGZpbGVTeW5jIG9yIGZpbGUgd2FzIGNhbGxlZCwgd2hpY2ggaXMgZXhwcmVzc2VkIGJ5IHRoZSBzeW5jIHBhcmFtZXRlci5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSB0aGUgcGF0aCBvZiB0aGUgZmlsZVxuICogQHBhcmFtIHtudW1iZXJ9IGZkIGZpbGUgZGVzY3JpcHRvclxuICogQHBhcmFtIHtPYmplY3R9IG9wdHNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gc3luY1xuICogQHJldHVybnMge2ZpbGVDYWxsYmFjayB8IGZpbGVDYWxsYmFja1N5bmN9XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBfcHJlcGFyZVRtcEZpbGVSZW1vdmVDYWxsYmFjayhuYW1lLCBmZCwgb3B0cywgc3luYykge1xuICBjb25zdCByZW1vdmVDYWxsYmFja1N5bmMgPSBfcHJlcGFyZVJlbW92ZUNhbGxiYWNrKF9yZW1vdmVGaWxlU3luYywgW2ZkLCBuYW1lXSwgc3luYyk7XG4gIGNvbnN0IHJlbW92ZUNhbGxiYWNrID0gX3ByZXBhcmVSZW1vdmVDYWxsYmFjayhfcmVtb3ZlRmlsZUFzeW5jLCBbZmQsIG5hbWVdLCBzeW5jLCByZW1vdmVDYWxsYmFja1N5bmMpO1xuXG4gIGlmICghb3B0cy5rZWVwKSBfcmVtb3ZlT2JqZWN0cy51bnNoaWZ0KHJlbW92ZUNhbGxiYWNrU3luYyk7XG5cbiAgcmV0dXJuIHN5bmMgPyByZW1vdmVDYWxsYmFja1N5bmMgOiByZW1vdmVDYWxsYmFjaztcbn1cblxuLyoqXG4gKiBQcmVwYXJlcyB0aGUgY2FsbGJhY2sgZm9yIHJlbW92YWwgb2YgdGhlIHRlbXBvcmFyeSBkaXJlY3RvcnkuXG4gKlxuICogUmV0dXJucyBlaXRoZXIgYSBzeW5jIGNhbGxiYWNrIG9yIGEgYXN5bmMgY2FsbGJhY2sgZGVwZW5kaW5nIG9uIHdoZXRoZXJcbiAqIHRtcEZpbGVTeW5jIG9yIHRtcEZpbGUgd2FzIGNhbGxlZCwgd2hpY2ggaXMgZXhwcmVzc2VkIGJ5IHRoZSBzeW5jIHBhcmFtZXRlci5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdHNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gc3luY1xuICogQHJldHVybnMge0Z1bmN0aW9ufSB0aGUgY2FsbGJhY2tcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9wcmVwYXJlVG1wRGlyUmVtb3ZlQ2FsbGJhY2sobmFtZSwgb3B0cywgc3luYykge1xuICBjb25zdCByZW1vdmVGdW5jdGlvbiA9IG9wdHMudW5zYWZlQ2xlYW51cCA/IHJpbXJhZiA6IGZzLnJtZGlyLmJpbmQoZnMpO1xuICBjb25zdCByZW1vdmVGdW5jdGlvblN5bmMgPSBvcHRzLnVuc2FmZUNsZWFudXAgPyBGTl9SSU1SQUZfU1lOQyA6IEZOX1JNRElSX1NZTkM7XG4gIGNvbnN0IHJlbW92ZUNhbGxiYWNrU3luYyA9IF9wcmVwYXJlUmVtb3ZlQ2FsbGJhY2socmVtb3ZlRnVuY3Rpb25TeW5jLCBuYW1lLCBzeW5jKTtcbiAgY29uc3QgcmVtb3ZlQ2FsbGJhY2sgPSBfcHJlcGFyZVJlbW92ZUNhbGxiYWNrKHJlbW92ZUZ1bmN0aW9uLCBuYW1lLCBzeW5jLCByZW1vdmVDYWxsYmFja1N5bmMpO1xuICBpZiAoIW9wdHMua2VlcCkgX3JlbW92ZU9iamVjdHMudW5zaGlmdChyZW1vdmVDYWxsYmFja1N5bmMpO1xuXG4gIHJldHVybiBzeW5jID8gcmVtb3ZlQ2FsbGJhY2tTeW5jIDogcmVtb3ZlQ2FsbGJhY2s7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGd1YXJkZWQgZnVuY3Rpb24gd3JhcHBpbmcgdGhlIHJlbW92ZUZ1bmN0aW9uIGNhbGwuXG4gKlxuICogVGhlIGNsZWFudXAgY2FsbGJhY2sgaXMgc2F2ZSB0byBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMuXG4gKiBTdWJzZXF1ZW50IGludm9jYXRpb25zIHdpbGwgYmUgaWdub3JlZC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZW1vdmVGdW5jdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVPckRpck5hbWVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gc3luY1xuICogQHBhcmFtIHtjbGVhbnVwQ2FsbGJhY2tTeW5jP30gY2xlYW51cENhbGxiYWNrU3luY1xuICogQHJldHVybnMge2NsZWFudXBDYWxsYmFjayB8IGNsZWFudXBDYWxsYmFja1N5bmN9XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBfcHJlcGFyZVJlbW92ZUNhbGxiYWNrKHJlbW92ZUZ1bmN0aW9uLCBmaWxlT3JEaXJOYW1lLCBzeW5jLCBjbGVhbnVwQ2FsbGJhY2tTeW5jKSB7XG4gIGxldCBjYWxsZWQgPSBmYWxzZTtcblxuICAvLyBpZiBzeW5jIGlzIHRydWUsIHRoZSBuZXh0IHBhcmFtZXRlciB3aWxsIGJlIGlnbm9yZWRcbiAgcmV0dXJuIGZ1bmN0aW9uIF9jbGVhbnVwQ2FsbGJhY2sobmV4dCkge1xuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgLy8gcmVtb3ZlIGNsZWFudXBDYWxsYmFjayBmcm9tIGNhY2hlXG4gICAgICBjb25zdCB0b1JlbW92ZSA9IGNsZWFudXBDYWxsYmFja1N5bmMgfHwgX2NsZWFudXBDYWxsYmFjaztcbiAgICAgIGNvbnN0IGluZGV4ID0gX3JlbW92ZU9iamVjdHMuaW5kZXhPZih0b1JlbW92ZSk7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgICAgaWYgKGluZGV4ID49IDApIF9yZW1vdmVPYmplY3RzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICBpZiAoc3luYyB8fCByZW1vdmVGdW5jdGlvbiA9PT0gRk5fUk1ESVJfU1lOQyB8fCByZW1vdmVGdW5jdGlvbiA9PT0gRk5fUklNUkFGX1NZTkMpIHtcbiAgICAgICAgcmV0dXJuIHJlbW92ZUZ1bmN0aW9uKGZpbGVPckRpck5hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlbW92ZUZ1bmN0aW9uKGZpbGVPckRpck5hbWUsIG5leHQgfHwgZnVuY3Rpb24oKSB7fSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIFRoZSBnYXJiYWdlIGNvbGxlY3Rvci5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBfZ2FyYmFnZUNvbGxlY3RvcigpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKCFfZ3JhY2VmdWxDbGVhbnVwKSByZXR1cm47XG5cbiAgLy8gdGhlIGZ1bmN0aW9uIGJlaW5nIGNhbGxlZCByZW1vdmVzIGl0c2VsZiBmcm9tIF9yZW1vdmVPYmplY3RzLFxuICAvLyBsb29wIHVudGlsIF9yZW1vdmVPYmplY3RzIGlzIGVtcHR5XG4gIHdoaWxlIChfcmVtb3ZlT2JqZWN0cy5sZW5ndGgpIHtcbiAgICB0cnkge1xuICAgICAgX3JlbW92ZU9iamVjdHNbMF0oKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBhbHJlYWR5IHJlbW92ZWQ/XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmFuZG9tIG5hbWUgZ2VuZXJhdG9yIGJhc2VkIG9uIGNyeXB0by5cbiAqIEFkYXB0ZWQgZnJvbSBodHRwOi8vYmxvZy50b21wYXdsYWsub3JnL2hvdy10by1nZW5lcmF0ZS1yYW5kb20tdmFsdWVzLW5vZGVqcy1qYXZhc2NyaXB0XG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGhvd01hbnlcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBnZW5lcmF0ZWQgcmFuZG9tIG5hbWVcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9yYW5kb21DaGFycyhob3dNYW55KSB7XG4gIGxldFxuICAgIHZhbHVlID0gW10sXG4gICAgcm5kID0gbnVsbDtcblxuICAvLyBtYWtlIHN1cmUgdGhhdCB3ZSBkbyBub3QgZmFpbCBiZWNhdXNlIHdlIHJhbiBvdXQgb2YgZW50cm9weVxuICB0cnkge1xuICAgIHJuZCA9IGNyeXB0by5yYW5kb21CeXRlcyhob3dNYW55KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJuZCA9IGNyeXB0by5wc2V1ZG9SYW5kb21CeXRlcyhob3dNYW55KTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaG93TWFueTsgaSsrKSB7XG4gICAgdmFsdWUucHVzaChSQU5ET01fQ0hBUlNbcm5kW2ldICUgUkFORE9NX0NIQVJTLmxlbmd0aF0pO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlLmpvaW4oJycpO1xufVxuXG4vKipcbiAqIEhlbHBlciB3aGljaCBkZXRlcm1pbmVzIHdoZXRoZXIgYSBzdHJpbmcgcyBpcyBibGFuaywgdGhhdCBpcyB1bmRlZmluZWQsIG9yIGVtcHR5IG9yIG51bGwuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gdHJ1ZSB3aGV0aGVyIHRoZSBzdHJpbmcgcyBpcyBibGFuaywgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmZ1bmN0aW9uIF9pc0JsYW5rKHMpIHtcbiAgcmV0dXJuIHMgPT09IG51bGwgfHwgX2lzVW5kZWZpbmVkKHMpIHx8ICFzLnRyaW0oKTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgYG9iamAgcGFyYW1ldGVyIGlzIGRlZmluZWQgb3Igbm90LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSBvYmplY3QgaXMgdW5kZWZpbmVkXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBfaXNVbmRlZmluZWQob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBQYXJzZXMgdGhlIGZ1bmN0aW9uIGFyZ3VtZW50cy5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGhlbHBzIHRvIGhhdmUgb3B0aW9uYWwgYXJndW1lbnRzLlxuICpcbiAqIEBwYXJhbSB7KE9wdGlvbnN8bnVsbHx1bmRlZmluZWR8RnVuY3Rpb24pfSBvcHRpb25zXG4gKiBAcGFyYW0gez9GdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtBcnJheX0gcGFyc2VkIGFyZ3VtZW50c1xuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX3BhcnNlQXJndW1lbnRzKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBbe30sIG9wdGlvbnNdO1xuICB9XG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKF9pc1VuZGVmaW5lZChvcHRpb25zKSkge1xuICAgIHJldHVybiBbe30sIGNhbGxiYWNrXTtcbiAgfVxuXG4gIC8vIGNvcHkgb3B0aW9ucyBzbyB3ZSBkbyBub3QgbGVhayB0aGUgY2hhbmdlcyB3ZSBtYWtlIGludGVybmFsbHlcbiAgY29uc3QgYWN0dWFsT3B0aW9ucyA9IHt9O1xuICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvcHRpb25zKSkge1xuICAgIGFjdHVhbE9wdGlvbnNba2V5XSA9IG9wdGlvbnNba2V5XTtcbiAgfVxuXG4gIHJldHVybiBbYWN0dWFsT3B0aW9ucywgY2FsbGJhY2tdO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIG5ldyB0ZW1wb3JhcnkgbmFtZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0c1xuICogQHJldHVybnMge3N0cmluZ30gdGhlIG5ldyByYW5kb20gbmFtZSBhY2NvcmRpbmcgdG8gb3B0c1xuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX2dlbmVyYXRlVG1wTmFtZShvcHRzKSB7XG5cbiAgY29uc3QgdG1wRGlyID0gb3B0cy50bXBkaXI7XG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKCFfaXNVbmRlZmluZWQob3B0cy5uYW1lKSlcbiAgICByZXR1cm4gcGF0aC5qb2luKHRtcERpciwgb3B0cy5kaXIsIG9wdHMubmFtZSk7XG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKCFfaXNVbmRlZmluZWQob3B0cy50ZW1wbGF0ZSkpXG4gICAgcmV0dXJuIHBhdGguam9pbih0bXBEaXIsIG9wdHMuZGlyLCBvcHRzLnRlbXBsYXRlKS5yZXBsYWNlKFRFTVBMQVRFX1BBVFRFUk4sIF9yYW5kb21DaGFycyg2KSk7XG5cbiAgLy8gcHJlZml4IGFuZCBwb3N0Zml4XG4gIGNvbnN0IG5hbWUgPSBbXG4gICAgb3B0cy5wcmVmaXggPyBvcHRzLnByZWZpeCA6ICd0bXAnLFxuICAgICctJyxcbiAgICBwcm9jZXNzLnBpZCxcbiAgICAnLScsXG4gICAgX3JhbmRvbUNoYXJzKDEyKSxcbiAgICBvcHRzLnBvc3RmaXggPyAnLScgKyBvcHRzLnBvc3RmaXggOiAnJ1xuICBdLmpvaW4oJycpO1xuXG4gIHJldHVybiBwYXRoLmpvaW4odG1wRGlyLCBvcHRzLmRpciwgbmFtZSk7XG59XG5cbi8qKlxuICogQXNzZXJ0cyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgb3B0aW9ucyBhcmUgdmFsaWQsIGFsc28gc2FuaXRpemVzIG9wdGlvbnMgYW5kIHByb3ZpZGVzIHNhbmUgZGVmYXVsdHMgZm9yIG1pc3NpbmdcbiAqIG9wdGlvbnMuXG4gKlxuICogQHBhcmFtIHtPcHRpb25zfSBvcHRpb25zXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBfYXNzZXJ0QW5kU2FuaXRpemVPcHRpb25zKG9wdGlvbnMpIHtcblxuICBvcHRpb25zLnRtcGRpciA9IF9nZXRUbXBEaXIob3B0aW9ucyk7XG5cbiAgY29uc3QgdG1wRGlyID0gb3B0aW9ucy50bXBkaXI7XG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKCFfaXNVbmRlZmluZWQob3B0aW9ucy5uYW1lKSlcbiAgICBfYXNzZXJ0SXNSZWxhdGl2ZShvcHRpb25zLm5hbWUsICduYW1lJywgdG1wRGlyKTtcbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKCFfaXNVbmRlZmluZWQob3B0aW9ucy5kaXIpKVxuICAgIF9hc3NlcnRJc1JlbGF0aXZlKG9wdGlvbnMuZGlyLCAnZGlyJywgdG1wRGlyKTtcbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKCFfaXNVbmRlZmluZWQob3B0aW9ucy50ZW1wbGF0ZSkpIHtcbiAgICBfYXNzZXJ0SXNSZWxhdGl2ZShvcHRpb25zLnRlbXBsYXRlLCAndGVtcGxhdGUnLCB0bXBEaXIpO1xuICAgIGlmICghb3B0aW9ucy50ZW1wbGF0ZS5tYXRjaChURU1QTEFURV9QQVRURVJOKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB0ZW1wbGF0ZSwgZm91bmQgXCIke29wdGlvbnMudGVtcGxhdGV9XCIuYCk7XG4gIH1cbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKCFfaXNVbmRlZmluZWQob3B0aW9ucy50cmllcykgJiYgaXNOYU4ob3B0aW9ucy50cmllcykgfHwgb3B0aW9ucy50cmllcyA8IDApXG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHRyaWVzLCBmb3VuZCBcIiR7b3B0aW9ucy50cmllc31cIi5gKTtcblxuICAvLyBpZiBhIG5hbWUgd2FzIHNwZWNpZmllZCB3ZSB3aWxsIHRyeSBvbmNlXG4gIG9wdGlvbnMudHJpZXMgPSBfaXNVbmRlZmluZWQob3B0aW9ucy5uYW1lKSA/IG9wdGlvbnMudHJpZXMgfHwgREVGQVVMVF9UUklFUyA6IDE7XG4gIG9wdGlvbnMua2VlcCA9ICEhb3B0aW9ucy5rZWVwO1xuICBvcHRpb25zLmRldGFjaERlc2NyaXB0b3IgPSAhIW9wdGlvbnMuZGV0YWNoRGVzY3JpcHRvcjtcbiAgb3B0aW9ucy5kaXNjYXJkRGVzY3JpcHRvciA9ICEhb3B0aW9ucy5kaXNjYXJkRGVzY3JpcHRvcjtcbiAgb3B0aW9ucy51bnNhZmVDbGVhbnVwID0gISFvcHRpb25zLnVuc2FmZUNsZWFudXA7XG5cbiAgLy8gc2FuaXRpemUgZGlyLCBhbHNvIGtlZXAgKG11bHRpcGxlKSBibGFua3MgaWYgdGhlIHVzZXIsIHB1cnBvcnRlZGx5IHNhbmUsIHJlcXVlc3RzIHVzIHRvXG4gIG9wdGlvbnMuZGlyID0gX2lzVW5kZWZpbmVkKG9wdGlvbnMuZGlyKSA/ICcnIDogcGF0aC5yZWxhdGl2ZSh0bXBEaXIsIF9yZXNvbHZlUGF0aChvcHRpb25zLmRpciwgdG1wRGlyKSk7XG4gIG9wdGlvbnMudGVtcGxhdGUgPSBfaXNVbmRlZmluZWQob3B0aW9ucy50ZW1wbGF0ZSkgPyB1bmRlZmluZWQgOiBwYXRoLnJlbGF0aXZlKHRtcERpciwgX3Jlc29sdmVQYXRoKG9wdGlvbnMudGVtcGxhdGUsIHRtcERpcikpO1xuICAvLyBzYW5pdGl6ZSBmdXJ0aGVyIGlmIHRlbXBsYXRlIGlzIHJlbGF0aXZlIHRvIG9wdGlvbnMuZGlyXG4gIG9wdGlvbnMudGVtcGxhdGUgPSBfaXNCbGFuayhvcHRpb25zLnRlbXBsYXRlKSA/IHVuZGVmaW5lZCA6IHBhdGgucmVsYXRpdmUob3B0aW9ucy5kaXIsIG9wdGlvbnMudGVtcGxhdGUpO1xuXG4gIC8vIGZvciBjb21wbGV0ZW5lc3MnIHNha2Ugb25seSwgYWxzbyBrZWVwIChtdWx0aXBsZSkgYmxhbmtzIGlmIHRoZSB1c2VyLCBwdXJwb3J0ZWRseSBzYW5lLCByZXF1ZXN0cyB1cyB0b1xuICBvcHRpb25zLm5hbWUgPSBfaXNVbmRlZmluZWQob3B0aW9ucy5uYW1lKSA/IHVuZGVmaW5lZCA6IF9zYW5pdGl6ZU5hbWUob3B0aW9ucy5uYW1lKTtcbiAgb3B0aW9ucy5wcmVmaXggPSBfaXNVbmRlZmluZWQob3B0aW9ucy5wcmVmaXgpID8gJycgOiBvcHRpb25zLnByZWZpeDtcbiAgb3B0aW9ucy5wb3N0Zml4ID0gX2lzVW5kZWZpbmVkKG9wdGlvbnMucG9zdGZpeCkgPyAnJyA6IG9wdGlvbnMucG9zdGZpeDtcbn1cblxuLyoqXG4gKiBSZXNvbHZlIHRoZSBzcGVjaWZpZWQgcGF0aCBuYW1lIGluIHJlc3BlY3QgdG8gdG1wRGlyLlxuICpcbiAqIFRoZSBzcGVjaWZpZWQgbmFtZSBtaWdodCBpbmNsdWRlIHJlbGF0aXZlIHBhdGggY29tcG9uZW50cywgZS5nLiAuLi9cbiAqIHNvIHdlIG5lZWQgdG8gcmVzb2x2ZSBpbiBvcmRlciB0byBiZSBzdXJlIHRoYXQgaXMgaXMgbG9jYXRlZCBpbnNpZGUgdG1wRGlyXG4gKlxuICogQHBhcmFtIG5hbWVcbiAqIEBwYXJhbSB0bXBEaXJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBfcmVzb2x2ZVBhdGgobmFtZSwgdG1wRGlyKSB7XG4gIGNvbnN0IHNhbml0aXplZE5hbWUgPSBfc2FuaXRpemVOYW1lKG5hbWUpO1xuICBpZiAoc2FuaXRpemVkTmFtZS5zdGFydHNXaXRoKHRtcERpcikpIHtcbiAgICByZXR1cm4gcGF0aC5yZXNvbHZlKHNhbml0aXplZE5hbWUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBwYXRoLnJlc29sdmUocGF0aC5qb2luKHRtcERpciwgc2FuaXRpemVkTmFtZSkpO1xuICB9XG59XG5cbi8qKlxuICogU2FuaXRpemUgdGhlIHNwZWNpZmllZCBwYXRoIG5hbWUgYnkgcmVtb3ZpbmcgYWxsIHF1b3RlIGNoYXJhY3RlcnMuXG4gKlxuICogQHBhcmFtIG5hbWVcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBfc2FuaXRpemVOYW1lKG5hbWUpIHtcbiAgaWYgKF9pc0JsYW5rKG5hbWUpKSB7XG4gICAgcmV0dXJuIG5hbWU7XG4gIH1cbiAgcmV0dXJuIG5hbWUucmVwbGFjZSgvW1wiJ10vZywgJycpO1xufVxuXG4vKipcbiAqIEFzc2VydHMgd2hldGhlciBzcGVjaWZpZWQgbmFtZSBpcyByZWxhdGl2ZSB0byB0aGUgc3BlY2lmaWVkIHRtcERpci5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHRtcERpclxuICogQHRocm93cyB7RXJyb3J9XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBfYXNzZXJ0SXNSZWxhdGl2ZShuYW1lLCBvcHRpb24sIHRtcERpcikge1xuICBpZiAob3B0aW9uID09PSAnbmFtZScpIHtcbiAgICAvLyBhc3NlcnQgdGhhdCBuYW1lIGlzIG5vdCBhYnNvbHV0ZSBhbmQgZG9lcyBub3QgY29udGFpbiBhIHBhdGhcbiAgICBpZiAocGF0aC5pc0Fic29sdXRlKG5hbWUpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke29wdGlvbn0gb3B0aW9uIG11c3Qgbm90IGNvbnRhaW4gYW4gYWJzb2x1dGUgcGF0aCwgZm91bmQgXCIke25hbWV9XCIuYCk7XG4gICAgLy8gbXVzdCBub3QgZmFpbCBvbiB2YWxpZCAuPG5hbWU+IG9yIC4uPG5hbWU+IG9yIHNpbWlsYXIgc3VjaCBjb25zdHJ1Y3RzXG4gICAgbGV0IGJhc2VuYW1lID0gcGF0aC5iYXNlbmFtZShuYW1lKTtcbiAgICBpZiAoYmFzZW5hbWUgPT09ICcuLicgfHwgYmFzZW5hbWUgPT09ICcuJyB8fCBiYXNlbmFtZSAhPT0gbmFtZSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHtvcHRpb259IG9wdGlvbiBtdXN0IG5vdCBjb250YWluIGEgcGF0aCwgZm91bmQgXCIke25hbWV9XCIuYCk7XG4gIH1cbiAgZWxzZSB7IC8vIGlmIChvcHRpb24gPT09ICdkaXInIHx8IG9wdGlvbiA9PT0gJ3RlbXBsYXRlJykge1xuICAgIC8vIGFzc2VydCB0aGF0IGRpciBvciB0ZW1wbGF0ZSBhcmUgcmVsYXRpdmUgdG8gdG1wRGlyXG4gICAgaWYgKHBhdGguaXNBYnNvbHV0ZShuYW1lKSAmJiAhbmFtZS5zdGFydHNXaXRoKHRtcERpcikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHtvcHRpb259IG9wdGlvbiBtdXN0IGJlIHJlbGF0aXZlIHRvIFwiJHt0bXBEaXJ9XCIsIGZvdW5kIFwiJHtuYW1lfVwiLmApO1xuICAgIH1cbiAgICBsZXQgcmVzb2x2ZWRQYXRoID0gX3Jlc29sdmVQYXRoKG5hbWUsIHRtcERpcik7XG4gICAgaWYgKCFyZXNvbHZlZFBhdGguc3RhcnRzV2l0aCh0bXBEaXIpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke29wdGlvbn0gb3B0aW9uIG11c3QgYmUgcmVsYXRpdmUgdG8gXCIke3RtcERpcn1cIiwgZm91bmQgXCIke3Jlc29sdmVkUGF0aH1cIi5gKTtcbiAgfVxufVxuXG4vKipcbiAqIEhlbHBlciBmb3IgdGVzdGluZyBhZ2FpbnN0IEVCQURGIHRvIGNvbXBlbnNhdGUgY2hhbmdlcyBtYWRlIHRvIE5vZGUgNy54IHVuZGVyIFdpbmRvd3MuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX2lzRUJBREYoZXJyb3IpIHtcbiAgcmV0dXJuIF9pc0V4cGVjdGVkRXJyb3IoZXJyb3IsIC1FQkFERiwgJ0VCQURGJyk7XG59XG5cbi8qKlxuICogSGVscGVyIGZvciB0ZXN0aW5nIGFnYWluc3QgRU5PRU5UIHRvIGNvbXBlbnNhdGUgY2hhbmdlcyBtYWRlIHRvIE5vZGUgNy54IHVuZGVyIFdpbmRvd3MuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX2lzRU5PRU5UKGVycm9yKSB7XG4gIHJldHVybiBfaXNFeHBlY3RlZEVycm9yKGVycm9yLCAtRU5PRU5ULCAnRU5PRU5UJyk7XG59XG5cbi8qKlxuICogSGVscGVyIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBleHBlY3RlZCBlcnJvciBjb2RlIG1hdGNoZXMgdGhlIGFjdHVhbCBjb2RlIGFuZCBlcnJubyxcbiAqIHdoaWNoIHdpbGwgZGlmZmVyIGJldHdlZW4gdGhlIHN1cHBvcnRlZCBub2RlIHZlcnNpb25zLlxuICpcbiAqIC0gTm9kZSA+PSA3LjA6XG4gKiAgIGVycm9yLmNvZGUge3N0cmluZ31cbiAqICAgZXJyb3IuZXJybm8ge251bWJlcn0gYW55IG51bWVyaWNhbCB2YWx1ZSB3aWxsIGJlIG5lZ2F0ZWRcbiAqXG4gKiBDQVZFQVRcbiAqXG4gKiBPbiB3aW5kb3dzLCB0aGUgZXJybm8gZm9yIEVCQURGIGlzIC00MDgzIGJ1dCBvcy5jb25zdGFudHMuZXJybm8uRUJBREYgaXMgZGlmZmVyZW50IGFuZCB3ZSBtdXN0IGFzc3VtZSB0aGF0IEVOT0VOVFxuICogaXMgbm8gZGlmZmVyZW50IGhlcmUuXG4gKlxuICogQHBhcmFtIHtTeXN0ZW1FcnJvcn0gZXJyb3JcbiAqIEBwYXJhbSB7bnVtYmVyfSBlcnJub1xuICogQHBhcmFtIHtzdHJpbmd9IGNvZGVcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9pc0V4cGVjdGVkRXJyb3IoZXJyb3IsIGVycm5vLCBjb2RlKSB7XG4gIHJldHVybiBJU19XSU4zMiA/IGVycm9yLmNvZGUgPT09IGNvZGUgOiBlcnJvci5jb2RlID09PSBjb2RlICYmIGVycm9yLmVycm5vID09PSBlcnJubztcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBncmFjZWZ1bCBjbGVhbnVwLlxuICpcbiAqIElmIGdyYWNlZnVsIGNsZWFudXAgaXMgc2V0LCB0bXAgd2lsbCByZW1vdmUgYWxsIGNvbnRyb2xsZWQgdGVtcG9yYXJ5IG9iamVjdHMgb24gcHJvY2VzcyBleGl0LCBvdGhlcndpc2UgdGhlXG4gKiB0ZW1wb3Jhcnkgb2JqZWN0cyB3aWxsIHJlbWFpbiBpbiBwbGFjZSwgd2FpdGluZyB0byBiZSBjbGVhbmVkIHVwIG9uIHN5c3RlbSByZXN0YXJ0IG9yIG90aGVyd2lzZSBzY2hlZHVsZWQgdGVtcG9yYXJ5XG4gKiBvYmplY3QgcmVtb3ZhbHMuXG4gKi9cbmZ1bmN0aW9uIHNldEdyYWNlZnVsQ2xlYW51cCgpIHtcbiAgX2dyYWNlZnVsQ2xlYW51cCA9IHRydWU7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VycmVudGx5IGNvbmZpZ3VyZWQgdG1wIGRpciBmcm9tIG9zLnRtcGRpcigpLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gez9PcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgY3VycmVudGx5IGNvbmZpZ3VyZWQgdG1wIGRpclxuICovXG5mdW5jdGlvbiBfZ2V0VG1wRGlyKG9wdGlvbnMpIHtcbiAgcmV0dXJuIHBhdGgucmVzb2x2ZShfc2FuaXRpemVOYW1lKG9wdGlvbnMgJiYgb3B0aW9ucy50bXBkaXIgfHwgb3MudG1wZGlyKCkpKTtcbn1cblxuLy8gSW5zdGFsbCBwcm9jZXNzIGV4aXQgbGlzdGVuZXJcbnByb2Nlc3MuYWRkTGlzdGVuZXIoRVhJVCwgX2dhcmJhZ2VDb2xsZWN0b3IpO1xuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucy5cbiAqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBPcHRpb25zXG4gKiBAcHJvcGVydHkgez9ib29sZWFufSBrZWVwIHRoZSB0ZW1wb3Jhcnkgb2JqZWN0IChmaWxlIG9yIGRpcikgd2lsbCBub3QgYmUgZ2FyYmFnZSBjb2xsZWN0ZWRcbiAqIEBwcm9wZXJ0eSB7P251bWJlcn0gdHJpZXMgdGhlIG51bWJlciBvZiB0cmllcyBiZWZvcmUgZ2l2ZSB1cCB0aGUgbmFtZSBnZW5lcmF0aW9uXG4gKiBAcHJvcGVydHkgKD9pbnQpIG1vZGUgdGhlIGFjY2VzcyBtb2RlLCBkZWZhdWx0cyBhcmUgMG83MDAgZm9yIGRpcmVjdG9yaWVzIGFuZCAwbzYwMCBmb3IgZmlsZXNcbiAqIEBwcm9wZXJ0eSB7P3N0cmluZ30gdGVtcGxhdGUgdGhlIFwibWtzdGVtcFwiIGxpa2UgZmlsZW5hbWUgdGVtcGxhdGVcbiAqIEBwcm9wZXJ0eSB7P3N0cmluZ30gbmFtZSBmaXhlZCBuYW1lIHJlbGF0aXZlIHRvIHRtcGRpciBvciB0aGUgc3BlY2lmaWVkIGRpciBvcHRpb25cbiAqIEBwcm9wZXJ0eSB7P3N0cmluZ30gZGlyIHRtcCBkaXJlY3RvcnkgcmVsYXRpdmUgdG8gdGhlIHJvb3QgdG1wIGRpcmVjdG9yeSBpbiB1c2VcbiAqIEBwcm9wZXJ0eSB7P3N0cmluZ30gcHJlZml4IHByZWZpeCBmb3IgdGhlIGdlbmVyYXRlZCBuYW1lXG4gKiBAcHJvcGVydHkgez9zdHJpbmd9IHBvc3RmaXggcG9zdGZpeCBmb3IgdGhlIGdlbmVyYXRlZCBuYW1lXG4gKiBAcHJvcGVydHkgez9zdHJpbmd9IHRtcGRpciB0aGUgcm9vdCB0bXAgZGlyZWN0b3J5IHdoaWNoIG92ZXJyaWRlcyB0aGUgb3MgdG1wZGlyXG4gKiBAcHJvcGVydHkgez9ib29sZWFufSB1bnNhZmVDbGVhbnVwIHJlY3Vyc2l2ZWx5IHJlbW92ZXMgdGhlIGNyZWF0ZWQgdGVtcG9yYXJ5IGRpcmVjdG9yeSwgZXZlbiB3aGVuIGl0J3Mgbm90IGVtcHR5XG4gKiBAcHJvcGVydHkgez9ib29sZWFufSBkZXRhY2hEZXNjcmlwdG9yIGRldGFjaGVzIHRoZSBmaWxlIGRlc2NyaXB0b3IsIGNhbGxlciBpcyByZXNwb25zaWJsZSBmb3IgY2xvc2luZyB0aGUgZmlsZSwgdG1wIHdpbGwgbm8gbG9uZ2VyIHRyeSBjbG9zaW5nIHRoZSBmaWxlIGR1cmluZyBnYXJiYWdlIGNvbGxlY3Rpb25cbiAqIEBwcm9wZXJ0eSB7P2Jvb2xlYW59IGRpc2NhcmREZXNjcmlwdG9yIGRpc2NhcmRzIHRoZSBmaWxlIGRlc2NyaXB0b3IgKGNsb3NlcyBmaWxlLCBmZCBpcyAtMSksIHRtcCB3aWxsIG5vIGxvbmdlciB0cnkgY2xvc2luZyB0aGUgZmlsZSBkdXJpbmcgZ2FyYmFnZSBjb2xsZWN0aW9uXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBGaWxlU3luY09iamVjdFxuICogQHByb3BlcnR5IHtzdHJpbmd9IG5hbWUgdGhlIG5hbWUgb2YgdGhlIGZpbGVcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBmZCB0aGUgZmlsZSBkZXNjcmlwdG9yIG9yIC0xIGlmIHRoZSBmZCBoYXMgYmVlbiBkaXNjYXJkZWRcbiAqIEBwcm9wZXJ0eSB7ZmlsZUNhbGxiYWNrfSByZW1vdmVDYWxsYmFjayB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gcmVtb3ZlIHRoZSBmaWxlXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBEaXJTeW5jT2JqZWN0XG4gKiBAcHJvcGVydHkge3N0cmluZ30gbmFtZSB0aGUgbmFtZSBvZiB0aGUgZGlyZWN0b3J5XG4gKiBAcHJvcGVydHkge2ZpbGVDYWxsYmFja30gcmVtb3ZlQ2FsbGJhY2sgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIHJlbW92ZSB0aGUgZGlyZWN0b3J5XG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgdG1wTmFtZUNhbGxiYWNrXG4gKiBAcGFyYW0gez9FcnJvcn0gZXJyIHRoZSBlcnJvciBvYmplY3QgaWYgYW55dGhpbmcgZ29lcyB3cm9uZ1xuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgdGhlIHRlbXBvcmFyeSBmaWxlIG5hbWVcbiAqL1xuXG4vKipcbiAqIEBjYWxsYmFjayBmaWxlQ2FsbGJhY2tcbiAqIEBwYXJhbSB7P0Vycm9yfSBlcnIgdGhlIGVycm9yIG9iamVjdCBpZiBhbnl0aGluZyBnb2VzIHdyb25nXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSB0aGUgdGVtcG9yYXJ5IGZpbGUgbmFtZVxuICogQHBhcmFtIHtudW1iZXJ9IGZkIHRoZSBmaWxlIGRlc2NyaXB0b3Igb3IgLTEgaWYgdGhlIGZkIGhhZCBiZWVuIGRpc2NhcmRlZFxuICogQHBhcmFtIHtjbGVhbnVwQ2FsbGJhY2t9IGZuIHRoZSBjbGVhbnVwIGNhbGxiYWNrIGZ1bmN0aW9uXG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgZmlsZUNhbGxiYWNrU3luY1xuICogQHBhcmFtIHs/RXJyb3J9IGVyciB0aGUgZXJyb3Igb2JqZWN0IGlmIGFueXRoaW5nIGdvZXMgd3JvbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIHRoZSB0ZW1wb3JhcnkgZmlsZSBuYW1lXG4gKiBAcGFyYW0ge251bWJlcn0gZmQgdGhlIGZpbGUgZGVzY3JpcHRvciBvciAtMSBpZiB0aGUgZmQgaGFkIGJlZW4gZGlzY2FyZGVkXG4gKiBAcGFyYW0ge2NsZWFudXBDYWxsYmFja1N5bmN9IGZuIHRoZSBjbGVhbnVwIGNhbGxiYWNrIGZ1bmN0aW9uXG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgZGlyQ2FsbGJhY2tcbiAqIEBwYXJhbSB7P0Vycm9yfSBlcnIgdGhlIGVycm9yIG9iamVjdCBpZiBhbnl0aGluZyBnb2VzIHdyb25nXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSB0aGUgdGVtcG9yYXJ5IGZpbGUgbmFtZVxuICogQHBhcmFtIHtjbGVhbnVwQ2FsbGJhY2t9IGZuIHRoZSBjbGVhbnVwIGNhbGxiYWNrIGZ1bmN0aW9uXG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgZGlyQ2FsbGJhY2tTeW5jXG4gKiBAcGFyYW0gez9FcnJvcn0gZXJyIHRoZSBlcnJvciBvYmplY3QgaWYgYW55dGhpbmcgZ29lcyB3cm9uZ1xuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgdGhlIHRlbXBvcmFyeSBmaWxlIG5hbWVcbiAqIEBwYXJhbSB7Y2xlYW51cENhbGxiYWNrU3luY30gZm4gdGhlIGNsZWFudXAgY2FsbGJhY2sgZnVuY3Rpb25cbiAqL1xuXG4vKipcbiAqIFJlbW92ZXMgdGhlIHRlbXBvcmFyeSBjcmVhdGVkIGZpbGUgb3IgZGlyZWN0b3J5LlxuICpcbiAqIEBjYWxsYmFjayBjbGVhbnVwQ2FsbGJhY2tcbiAqIEBwYXJhbSB7c2ltcGxlQ2FsbGJhY2t9IFtuZXh0XSBmdW5jdGlvbiB0byBjYWxsIHdoZW5ldmVyIHRoZSB0bXAgb2JqZWN0IG5lZWRzIHRvIGJlIHJlbW92ZWRcbiAqL1xuXG4vKipcbiAqIFJlbW92ZXMgdGhlIHRlbXBvcmFyeSBjcmVhdGVkIGZpbGUgb3IgZGlyZWN0b3J5LlxuICpcbiAqIEBjYWxsYmFjayBjbGVhbnVwQ2FsbGJhY2tTeW5jXG4gKi9cblxuLyoqXG4gKiBDYWxsYmFjayBmdW5jdGlvbiBmb3IgZnVuY3Rpb24gY29tcG9zaXRpb24uXG4gKiBAc2VlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vcmFzemkvbm9kZS10bXAvaXNzdWVzLzU3fHJhc3ppL25vZGUtdG1wIzU3fVxuICpcbiAqIEBjYWxsYmFjayBzaW1wbGVDYWxsYmFja1xuICovXG5cbi8vIGV4cG9ydGluZyBhbGwgdGhlIG5lZWRlZCBtZXRob2RzXG5cbi8vIGV2YWx1YXRlIF9nZXRUbXBEaXIoKSBsYXppbHksIG1haW5seSBmb3Igc2ltcGxpZnlpbmcgdGVzdGluZyBidXQgaXQgYWxzbyB3aWxsXG4vLyBhbGxvdyB1c2VycyB0byByZWNvbmZpZ3VyZSB0aGUgdGVtcG9yYXJ5IGRpcmVjdG9yeVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZS5leHBvcnRzLCAndG1wZGlyJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBjb25maWd1cmFibGU6IGZhbHNlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX2dldFRtcERpcigpO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMuZGlyID0gZGlyO1xubW9kdWxlLmV4cG9ydHMuZGlyU3luYyA9IGRpclN5bmM7XG5cbm1vZHVsZS5leHBvcnRzLmZpbGUgPSBmaWxlO1xubW9kdWxlLmV4cG9ydHMuZmlsZVN5bmMgPSBmaWxlU3luYztcblxubW9kdWxlLmV4cG9ydHMudG1wTmFtZSA9IHRtcE5hbWU7XG5tb2R1bGUuZXhwb3J0cy50bXBOYW1lU3luYyA9IHRtcE5hbWVTeW5jO1xuXG5tb2R1bGUuZXhwb3J0cy5zZXRHcmFjZWZ1bENsZWFudXAgPSBzZXRHcmFjZWZ1bENsZWFudXA7XG4iLCIjIS91c3IvYmluL2VudiBub2RlXG5cInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xuICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX3NldE1vZHVsZURlZmF1bHQpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XG59KTtcbnZhciBfX2ltcG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0U3RhcikgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChrICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnJ1blNjYW4gPSB2b2lkIDA7XG5jb25zdCBjb3JlID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJAYWN0aW9ucy9jb3JlXCIpKTtcbmNvbnN0IGFydGlmYWN0ID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJAYWN0aW9ucy9hcnRpZmFjdFwiKSk7XG5jb25zdCBjaGlsZF9wcm9jZXNzXzEgPSByZXF1aXJlKFwiY2hpbGRfcHJvY2Vzc1wiKTtcbmNvbnN0IHByb2Nlc3NfMSA9IHJlcXVpcmUoXCJwcm9jZXNzXCIpO1xuZnVuY3Rpb24gcnVuU2Nhbih2aWQsIHZrZXksIHBhdGgsIGZvcm1hdCwgc2NhblR5cGUsIGV4cG9ydGZpbGUpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgJ1BhdGggOiAgJHtwYXRofSdgKTtcbiAgICAgICAgbGV0IGN1cmxDb21tYW5kT3V0cHV0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IGV4dDtcbiAgICAgICAgICAgIHByb2Nlc3NfMS5lbnYuVkVSQUNPREVfQVBJX0tFWV9JRCA9IHZpZDtcbiAgICAgICAgICAgIHByb2Nlc3NfMS5lbnYuVkVSQUNPREVfQVBJX0tFWV9TRUNSRVQgPSB2a2V5O1xuICAgICAgICAgICAgaWYgKGZvcm1hdCA9PSAnanNvbicpXG4gICAgICAgICAgICAgICAgZXh0ID0gJy5qc29uJztcbiAgICAgICAgICAgIGlmIChmb3JtYXQgPT0gJ3RhYmxlJylcbiAgICAgICAgICAgICAgICBleHQgPSAnLnR4dCc7XG4gICAgICAgICAgICBpZiAoZm9ybWF0ID09ICdjeWNsb25lZHgnKVxuICAgICAgICAgICAgICAgIGV4dCA9ICcueG1sJztcbiAgICAgICAgICAgIGxldCBzY2FuQ29tbWFuZDtcbiAgICAgICAgICAgIGlmIChleHBvcnRmaWxlID0gJ3RydWUnKSB7XG4gICAgICAgICAgICAgICAgc2NhbkNvbW1hbmQgPSBgY3VybCAtZnNTIGh0dHBzOi8vdG9vbHMudmVyYWNvZGUuY29tL3ZlcmFjb2RlLWNsaS9pbnN0YWxsIHwgc2ggJiYgLi92ZXJhY29kZSAke3NjYW5UeXBlfSAtLXNvdXJjZSAke3BhdGh9IC0tdHlwZSBkaXJlY3RvcnkgLS1mb3JtYXQgJHtmb3JtYXR9IC0tb3V0cHV0IHJlc3VsdHMke2V4dH0gYDtcbiAgICAgICAgICAgICAgICBjb3JlLmluZm8oJ1NjYW4gY29tbWFuZCA6ICcgKyBzY2FuQ29tbWFuZCk7XG4gICAgICAgICAgICAgICAgY3VybENvbW1hbmRPdXRwdXQgPSAoMCwgY2hpbGRfcHJvY2Vzc18xLmV4ZWNTeW5jKShzY2FuQ29tbWFuZCk7XG4gICAgICAgICAgICAgICAgY29yZS5pbmZvKGAke2N1cmxDb21tYW5kT3V0cHV0fWApO1xuICAgICAgICAgICAgICAgIC8vc3RvcmUgb3V0cHV0IGZpbGVzIGFzIGFydGlmYWN0c1xuICAgICAgICAgICAgICAgIGNvbnN0IGFydGlmYWN0Q2xpZW50ID0gYXJ0aWZhY3QuY3JlYXRlKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgYXJ0aWZhY3ROYW1lID0gJ1ZlcmFjb2RlIENvbnRhaW5lciBTY2FubmluZyBSZXN1bHRzJztcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlcyA9IFtgcmVzdWx0cyR7ZXh0fWBdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb3REaXJlY3RvcnkgPSBwcm9jZXNzLmN3ZCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlT25FcnJvcjogdHJ1ZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgdXBsb2FkUmVzdWx0ID0geWllbGQgYXJ0aWZhY3RDbGllbnQudXBsb2FkQXJ0aWZhY3QoYXJ0aWZhY3ROYW1lLCBmaWxlcywgcm9vdERpcmVjdG9yeSwgb3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdXJsQ29tbWFuZE91dHB1dCA9ICgwLCBjaGlsZF9wcm9jZXNzXzEuZXhlY1N5bmMpKGBjdXJsIC1mc1MgaHR0cHM6Ly90b29scy52ZXJhY29kZS5jb20vdmVyYWNvZGUtY2xpL2luc3RhbGwgfCBzaCAmJiAuL3ZlcmFjb2RlICR7c2NhblR5cGV9IC0tc291cmNlICR7cGF0aH0gLS10eXBlIGRpcmVjdG9yeSAtLWZvcm1hdCAke2Zvcm1hdH1gKTtcbiAgICAgICAgICAgICAgICBjb3JlLmluZm8oYCR7Y3VybENvbW1hbmRPdXRwdXR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICBjdXJsQ29tbWFuZE91dHB1dCA9IGV4LnN0ZG91dC50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5leHBvcnRzLnJ1blNjYW4gPSBydW5TY2FuO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcbiAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19zZXRNb2R1bGVEZWZhdWx0KSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xufSkgOiBmdW5jdGlvbihvLCB2KSB7XG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xufSk7XG52YXIgX19pbXBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydFN0YXIpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGNvcmUgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcIkBhY3Rpb25zL2NvcmVcIikpO1xuY29uc3QgY29udGFpbmVyU2Nhbl8xID0gcmVxdWlyZShcIi4vY29udGFpbmVyU2NhblwiKTtcbmNvbnN0IHZpZCA9IGNvcmUuZ2V0SW5wdXQoXCJ2aWRcIiwgeyByZXF1aXJlZDogdHJ1ZSB9KTtcbmNvbnN0IHZrZXkgPSBjb3JlLmdldElucHV0KFwidmtleVwiLCB7IHJlcXVpcmVkOiB0cnVlIH0pO1xuY29uc3QgcGF0aCA9IGNvcmUuZ2V0SW5wdXQoXCJwYXRoXCIsIHsgcmVxdWlyZWQ6IHRydWUgfSk7XG5jb25zdCBmb3JtYXQgPSBjb3JlLmdldElucHV0KFwiZm9ybWF0XCIsIHsgcmVxdWlyZWQ6IHRydWUgfSk7XG5jb25zdCBzY2FuVHlwZSA9IGNvcmUuZ2V0SW5wdXQoXCJzY2FuVHlwZVwiLCB7IHJlcXVpcmVkOiB0cnVlIH0pO1xuY29uc3QgZXhwb3J0ZmlsZSA9IGNvcmUuZ2V0SW5wdXQoXCJleHBvcnRcIiwgeyByZXF1aXJlZDogdHJ1ZSB9KTtcbigwLCBjb250YWluZXJTY2FuXzEucnVuU2NhbikodmlkLCB2a2V5LCBwYXRoLCBmb3JtYXQsIHNjYW5UeXBlLCBleHBvcnRmaWxlKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvdHVubmVsJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBuZXQgPSByZXF1aXJlKCduZXQnKTtcbnZhciB0bHMgPSByZXF1aXJlKCd0bHMnKTtcbnZhciBodHRwID0gcmVxdWlyZSgnaHR0cCcpO1xudmFyIGh0dHBzID0gcmVxdWlyZSgnaHR0cHMnKTtcbnZhciBldmVudHMgPSByZXF1aXJlKCdldmVudHMnKTtcbnZhciBhc3NlcnQgPSByZXF1aXJlKCdhc3NlcnQnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5cbmV4cG9ydHMuaHR0cE92ZXJIdHRwID0gaHR0cE92ZXJIdHRwO1xuZXhwb3J0cy5odHRwc092ZXJIdHRwID0gaHR0cHNPdmVySHR0cDtcbmV4cG9ydHMuaHR0cE92ZXJIdHRwcyA9IGh0dHBPdmVySHR0cHM7XG5leHBvcnRzLmh0dHBzT3Zlckh0dHBzID0gaHR0cHNPdmVySHR0cHM7XG5cblxuZnVuY3Rpb24gaHR0cE92ZXJIdHRwKG9wdGlvbnMpIHtcbiAgdmFyIGFnZW50ID0gbmV3IFR1bm5lbGluZ0FnZW50KG9wdGlvbnMpO1xuICBhZ2VudC5yZXF1ZXN0ID0gaHR0cC5yZXF1ZXN0O1xuICByZXR1cm4gYWdlbnQ7XG59XG5cbmZ1bmN0aW9uIGh0dHBzT3Zlckh0dHAob3B0aW9ucykge1xuICB2YXIgYWdlbnQgPSBuZXcgVHVubmVsaW5nQWdlbnQob3B0aW9ucyk7XG4gIGFnZW50LnJlcXVlc3QgPSBodHRwLnJlcXVlc3Q7XG4gIGFnZW50LmNyZWF0ZVNvY2tldCA9IGNyZWF0ZVNlY3VyZVNvY2tldDtcbiAgYWdlbnQuZGVmYXVsdFBvcnQgPSA0NDM7XG4gIHJldHVybiBhZ2VudDtcbn1cblxuZnVuY3Rpb24gaHR0cE92ZXJIdHRwcyhvcHRpb25zKSB7XG4gIHZhciBhZ2VudCA9IG5ldyBUdW5uZWxpbmdBZ2VudChvcHRpb25zKTtcbiAgYWdlbnQucmVxdWVzdCA9IGh0dHBzLnJlcXVlc3Q7XG4gIHJldHVybiBhZ2VudDtcbn1cblxuZnVuY3Rpb24gaHR0cHNPdmVySHR0cHMob3B0aW9ucykge1xuICB2YXIgYWdlbnQgPSBuZXcgVHVubmVsaW5nQWdlbnQob3B0aW9ucyk7XG4gIGFnZW50LnJlcXVlc3QgPSBodHRwcy5yZXF1ZXN0O1xuICBhZ2VudC5jcmVhdGVTb2NrZXQgPSBjcmVhdGVTZWN1cmVTb2NrZXQ7XG4gIGFnZW50LmRlZmF1bHRQb3J0ID0gNDQzO1xuICByZXR1cm4gYWdlbnQ7XG59XG5cblxuZnVuY3Rpb24gVHVubmVsaW5nQWdlbnQob3B0aW9ucykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHNlbGYucHJveHlPcHRpb25zID0gc2VsZi5vcHRpb25zLnByb3h5IHx8IHt9O1xuICBzZWxmLm1heFNvY2tldHMgPSBzZWxmLm9wdGlvbnMubWF4U29ja2V0cyB8fCBodHRwLkFnZW50LmRlZmF1bHRNYXhTb2NrZXRzO1xuICBzZWxmLnJlcXVlc3RzID0gW107XG4gIHNlbGYuc29ja2V0cyA9IFtdO1xuXG4gIHNlbGYub24oJ2ZyZWUnLCBmdW5jdGlvbiBvbkZyZWUoc29ja2V0LCBob3N0LCBwb3J0LCBsb2NhbEFkZHJlc3MpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRvT3B0aW9ucyhob3N0LCBwb3J0LCBsb2NhbEFkZHJlc3MpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzZWxmLnJlcXVlc3RzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICB2YXIgcGVuZGluZyA9IHNlbGYucmVxdWVzdHNbaV07XG4gICAgICBpZiAocGVuZGluZy5ob3N0ID09PSBvcHRpb25zLmhvc3QgJiYgcGVuZGluZy5wb3J0ID09PSBvcHRpb25zLnBvcnQpIHtcbiAgICAgICAgLy8gRGV0ZWN0IHRoZSByZXF1ZXN0IHRvIGNvbm5lY3Qgc2FtZSBvcmlnaW4gc2VydmVyLFxuICAgICAgICAvLyByZXVzZSB0aGUgY29ubmVjdGlvbi5cbiAgICAgICAgc2VsZi5yZXF1ZXN0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIHBlbmRpbmcucmVxdWVzdC5vblNvY2tldChzb2NrZXQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHNvY2tldC5kZXN0cm95KCk7XG4gICAgc2VsZi5yZW1vdmVTb2NrZXQoc29ja2V0KTtcbiAgfSk7XG59XG51dGlsLmluaGVyaXRzKFR1bm5lbGluZ0FnZW50LCBldmVudHMuRXZlbnRFbWl0dGVyKTtcblxuVHVubmVsaW5nQWdlbnQucHJvdG90eXBlLmFkZFJlcXVlc3QgPSBmdW5jdGlvbiBhZGRSZXF1ZXN0KHJlcSwgaG9zdCwgcG9ydCwgbG9jYWxBZGRyZXNzKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIG9wdGlvbnMgPSBtZXJnZU9wdGlvbnMoe3JlcXVlc3Q6IHJlcX0sIHNlbGYub3B0aW9ucywgdG9PcHRpb25zKGhvc3QsIHBvcnQsIGxvY2FsQWRkcmVzcykpO1xuXG4gIGlmIChzZWxmLnNvY2tldHMubGVuZ3RoID49IHRoaXMubWF4U29ja2V0cykge1xuICAgIC8vIFdlIGFyZSBvdmVyIGxpbWl0IHNvIHdlJ2xsIGFkZCBpdCB0byB0aGUgcXVldWUuXG4gICAgc2VsZi5yZXF1ZXN0cy5wdXNoKG9wdGlvbnMpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIElmIHdlIGFyZSB1bmRlciBtYXhTb2NrZXRzIGNyZWF0ZSBhIG5ldyBvbmUuXG4gIHNlbGYuY3JlYXRlU29ja2V0KG9wdGlvbnMsIGZ1bmN0aW9uKHNvY2tldCkge1xuICAgIHNvY2tldC5vbignZnJlZScsIG9uRnJlZSk7XG4gICAgc29ja2V0Lm9uKCdjbG9zZScsIG9uQ2xvc2VPclJlbW92ZSk7XG4gICAgc29ja2V0Lm9uKCdhZ2VudFJlbW92ZScsIG9uQ2xvc2VPclJlbW92ZSk7XG4gICAgcmVxLm9uU29ja2V0KHNvY2tldCk7XG5cbiAgICBmdW5jdGlvbiBvbkZyZWUoKSB7XG4gICAgICBzZWxmLmVtaXQoJ2ZyZWUnLCBzb2NrZXQsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uQ2xvc2VPclJlbW92ZShlcnIpIHtcbiAgICAgIHNlbGYucmVtb3ZlU29ja2V0KHNvY2tldCk7XG4gICAgICBzb2NrZXQucmVtb3ZlTGlzdGVuZXIoJ2ZyZWUnLCBvbkZyZWUpO1xuICAgICAgc29ja2V0LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIG9uQ2xvc2VPclJlbW92ZSk7XG4gICAgICBzb2NrZXQucmVtb3ZlTGlzdGVuZXIoJ2FnZW50UmVtb3ZlJywgb25DbG9zZU9yUmVtb3ZlKTtcbiAgICB9XG4gIH0pO1xufTtcblxuVHVubmVsaW5nQWdlbnQucHJvdG90eXBlLmNyZWF0ZVNvY2tldCA9IGZ1bmN0aW9uIGNyZWF0ZVNvY2tldChvcHRpb25zLCBjYikge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciBwbGFjZWhvbGRlciA9IHt9O1xuICBzZWxmLnNvY2tldHMucHVzaChwbGFjZWhvbGRlcik7XG5cbiAgdmFyIGNvbm5lY3RPcHRpb25zID0gbWVyZ2VPcHRpb25zKHt9LCBzZWxmLnByb3h5T3B0aW9ucywge1xuICAgIG1ldGhvZDogJ0NPTk5FQ1QnLFxuICAgIHBhdGg6IG9wdGlvbnMuaG9zdCArICc6JyArIG9wdGlvbnMucG9ydCxcbiAgICBhZ2VudDogZmFsc2UsXG4gICAgaGVhZGVyczoge1xuICAgICAgaG9zdDogb3B0aW9ucy5ob3N0ICsgJzonICsgb3B0aW9ucy5wb3J0XG4gICAgfVxuICB9KTtcbiAgaWYgKG9wdGlvbnMubG9jYWxBZGRyZXNzKSB7XG4gICAgY29ubmVjdE9wdGlvbnMubG9jYWxBZGRyZXNzID0gb3B0aW9ucy5sb2NhbEFkZHJlc3M7XG4gIH1cbiAgaWYgKGNvbm5lY3RPcHRpb25zLnByb3h5QXV0aCkge1xuICAgIGNvbm5lY3RPcHRpb25zLmhlYWRlcnMgPSBjb25uZWN0T3B0aW9ucy5oZWFkZXJzIHx8IHt9O1xuICAgIGNvbm5lY3RPcHRpb25zLmhlYWRlcnNbJ1Byb3h5LUF1dGhvcml6YXRpb24nXSA9ICdCYXNpYyAnICtcbiAgICAgICAgbmV3IEJ1ZmZlcihjb25uZWN0T3B0aW9ucy5wcm94eUF1dGgpLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgfVxuXG4gIGRlYnVnKCdtYWtpbmcgQ09OTkVDVCByZXF1ZXN0Jyk7XG4gIHZhciBjb25uZWN0UmVxID0gc2VsZi5yZXF1ZXN0KGNvbm5lY3RPcHRpb25zKTtcbiAgY29ubmVjdFJlcS51c2VDaHVua2VkRW5jb2RpbmdCeURlZmF1bHQgPSBmYWxzZTsgLy8gZm9yIHYwLjZcbiAgY29ubmVjdFJlcS5vbmNlKCdyZXNwb25zZScsIG9uUmVzcG9uc2UpOyAvLyBmb3IgdjAuNlxuICBjb25uZWN0UmVxLm9uY2UoJ3VwZ3JhZGUnLCBvblVwZ3JhZGUpOyAgIC8vIGZvciB2MC42XG4gIGNvbm5lY3RSZXEub25jZSgnY29ubmVjdCcsIG9uQ29ubmVjdCk7ICAgLy8gZm9yIHYwLjcgb3IgbGF0ZXJcbiAgY29ubmVjdFJlcS5vbmNlKCdlcnJvcicsIG9uRXJyb3IpO1xuICBjb25uZWN0UmVxLmVuZCgpO1xuXG4gIGZ1bmN0aW9uIG9uUmVzcG9uc2UocmVzKSB7XG4gICAgLy8gVmVyeSBoYWNreS4gVGhpcyBpcyBuZWNlc3NhcnkgdG8gYXZvaWQgaHR0cC1wYXJzZXIgbGVha3MuXG4gICAgcmVzLnVwZ3JhZGUgPSB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gb25VcGdyYWRlKHJlcywgc29ja2V0LCBoZWFkKSB7XG4gICAgLy8gSGFja3kuXG4gICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgIG9uQ29ubmVjdChyZXMsIHNvY2tldCwgaGVhZCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBvbkNvbm5lY3QocmVzLCBzb2NrZXQsIGhlYWQpIHtcbiAgICBjb25uZWN0UmVxLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgIHNvY2tldC5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcblxuICAgIGlmIChyZXMuc3RhdHVzQ29kZSAhPT0gMjAwKSB7XG4gICAgICBkZWJ1ZygndHVubmVsaW5nIHNvY2tldCBjb3VsZCBub3QgYmUgZXN0YWJsaXNoZWQsIHN0YXR1c0NvZGU9JWQnLFxuICAgICAgICByZXMuc3RhdHVzQ29kZSk7XG4gICAgICBzb2NrZXQuZGVzdHJveSgpO1xuICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKCd0dW5uZWxpbmcgc29ja2V0IGNvdWxkIG5vdCBiZSBlc3RhYmxpc2hlZCwgJyArXG4gICAgICAgICdzdGF0dXNDb2RlPScgKyByZXMuc3RhdHVzQ29kZSk7XG4gICAgICBlcnJvci5jb2RlID0gJ0VDT05OUkVTRVQnO1xuICAgICAgb3B0aW9ucy5yZXF1ZXN0LmVtaXQoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgc2VsZi5yZW1vdmVTb2NrZXQocGxhY2Vob2xkZXIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaGVhZC5sZW5ndGggPiAwKSB7XG4gICAgICBkZWJ1ZygnZ290IGlsbGVnYWwgcmVzcG9uc2UgYm9keSBmcm9tIHByb3h5Jyk7XG4gICAgICBzb2NrZXQuZGVzdHJveSgpO1xuICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKCdnb3QgaWxsZWdhbCByZXNwb25zZSBib2R5IGZyb20gcHJveHknKTtcbiAgICAgIGVycm9yLmNvZGUgPSAnRUNPTk5SRVNFVCc7XG4gICAgICBvcHRpb25zLnJlcXVlc3QuZW1pdCgnZXJyb3InLCBlcnJvcik7XG4gICAgICBzZWxmLnJlbW92ZVNvY2tldChwbGFjZWhvbGRlcik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGRlYnVnKCd0dW5uZWxpbmcgY29ubmVjdGlvbiBoYXMgZXN0YWJsaXNoZWQnKTtcbiAgICBzZWxmLnNvY2tldHNbc2VsZi5zb2NrZXRzLmluZGV4T2YocGxhY2Vob2xkZXIpXSA9IHNvY2tldDtcbiAgICByZXR1cm4gY2Ioc29ja2V0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uRXJyb3IoY2F1c2UpIHtcbiAgICBjb25uZWN0UmVxLnJlbW92ZUFsbExpc3RlbmVycygpO1xuXG4gICAgZGVidWcoJ3R1bm5lbGluZyBzb2NrZXQgY291bGQgbm90IGJlIGVzdGFibGlzaGVkLCBjYXVzZT0lc1xcbicsXG4gICAgICAgICAgY2F1c2UubWVzc2FnZSwgY2F1c2Uuc3RhY2spO1xuICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcigndHVubmVsaW5nIHNvY2tldCBjb3VsZCBub3QgYmUgZXN0YWJsaXNoZWQsICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnY2F1c2U9JyArIGNhdXNlLm1lc3NhZ2UpO1xuICAgIGVycm9yLmNvZGUgPSAnRUNPTk5SRVNFVCc7XG4gICAgb3B0aW9ucy5yZXF1ZXN0LmVtaXQoJ2Vycm9yJywgZXJyb3IpO1xuICAgIHNlbGYucmVtb3ZlU29ja2V0KHBsYWNlaG9sZGVyKTtcbiAgfVxufTtcblxuVHVubmVsaW5nQWdlbnQucHJvdG90eXBlLnJlbW92ZVNvY2tldCA9IGZ1bmN0aW9uIHJlbW92ZVNvY2tldChzb2NrZXQpIHtcbiAgdmFyIHBvcyA9IHRoaXMuc29ja2V0cy5pbmRleE9mKHNvY2tldClcbiAgaWYgKHBvcyA9PT0gLTEpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5zb2NrZXRzLnNwbGljZShwb3MsIDEpO1xuXG4gIHZhciBwZW5kaW5nID0gdGhpcy5yZXF1ZXN0cy5zaGlmdCgpO1xuICBpZiAocGVuZGluZykge1xuICAgIC8vIElmIHdlIGhhdmUgcGVuZGluZyByZXF1ZXN0cyBhbmQgYSBzb2NrZXQgZ2V0cyBjbG9zZWQgYSBuZXcgb25lXG4gICAgLy8gbmVlZHMgdG8gYmUgY3JlYXRlZCB0byB0YWtlIG92ZXIgaW4gdGhlIHBvb2wgZm9yIHRoZSBvbmUgdGhhdCBjbG9zZWQuXG4gICAgdGhpcy5jcmVhdGVTb2NrZXQocGVuZGluZywgZnVuY3Rpb24oc29ja2V0KSB7XG4gICAgICBwZW5kaW5nLnJlcXVlc3Qub25Tb2NrZXQoc29ja2V0KTtcbiAgICB9KTtcbiAgfVxufTtcblxuZnVuY3Rpb24gY3JlYXRlU2VjdXJlU29ja2V0KG9wdGlvbnMsIGNiKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgVHVubmVsaW5nQWdlbnQucHJvdG90eXBlLmNyZWF0ZVNvY2tldC5jYWxsKHNlbGYsIG9wdGlvbnMsIGZ1bmN0aW9uKHNvY2tldCkge1xuICAgIHZhciBob3N0SGVhZGVyID0gb3B0aW9ucy5yZXF1ZXN0LmdldEhlYWRlcignaG9zdCcpO1xuICAgIHZhciB0bHNPcHRpb25zID0gbWVyZ2VPcHRpb25zKHt9LCBzZWxmLm9wdGlvbnMsIHtcbiAgICAgIHNvY2tldDogc29ja2V0LFxuICAgICAgc2VydmVybmFtZTogaG9zdEhlYWRlciA/IGhvc3RIZWFkZXIucmVwbGFjZSgvOi4qJC8sICcnKSA6IG9wdGlvbnMuaG9zdFxuICAgIH0pO1xuXG4gICAgLy8gMCBpcyBkdW1teSBwb3J0IGZvciB2MC42XG4gICAgdmFyIHNlY3VyZVNvY2tldCA9IHRscy5jb25uZWN0KDAsIHRsc09wdGlvbnMpO1xuICAgIHNlbGYuc29ja2V0c1tzZWxmLnNvY2tldHMuaW5kZXhPZihzb2NrZXQpXSA9IHNlY3VyZVNvY2tldDtcbiAgICBjYihzZWN1cmVTb2NrZXQpO1xuICB9KTtcbn1cblxuXG5mdW5jdGlvbiB0b09wdGlvbnMoaG9zdCwgcG9ydCwgbG9jYWxBZGRyZXNzKSB7XG4gIGlmICh0eXBlb2YgaG9zdCA9PT0gJ3N0cmluZycpIHsgLy8gc2luY2UgdjAuMTBcbiAgICByZXR1cm4ge1xuICAgICAgaG9zdDogaG9zdCxcbiAgICAgIHBvcnQ6IHBvcnQsXG4gICAgICBsb2NhbEFkZHJlc3M6IGxvY2FsQWRkcmVzc1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGhvc3Q7IC8vIGZvciB2MC4xMSBvciBsYXRlclxufVxuXG5mdW5jdGlvbiBtZXJnZU9wdGlvbnModGFyZ2V0KSB7XG4gIGZvciAodmFyIGkgPSAxLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICB2YXIgb3ZlcnJpZGVzID0gYXJndW1lbnRzW2ldO1xuICAgIGlmICh0eXBlb2Ygb3ZlcnJpZGVzID09PSAnb2JqZWN0Jykge1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvdmVycmlkZXMpO1xuICAgICAgZm9yICh2YXIgaiA9IDAsIGtleUxlbiA9IGtleXMubGVuZ3RoOyBqIDwga2V5TGVuOyArK2opIHtcbiAgICAgICAgdmFyIGsgPSBrZXlzW2pdO1xuICAgICAgICBpZiAob3ZlcnJpZGVzW2tdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0YXJnZXRba10gPSBvdmVycmlkZXNba107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuXG52YXIgZGVidWc7XG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyAmJiAvXFxidHVubmVsXFxiLy50ZXN0KHByb2Nlc3MuZW52Lk5PREVfREVCVUcpKSB7XG4gIGRlYnVnID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGFyZ3NbMF0gPSAnVFVOTkVMOiAnICsgYXJnc1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXJncy51bnNoaWZ0KCdUVU5ORUw6Jyk7XG4gICAgfVxuICAgIGNvbnNvbGUuZXJyb3IuYXBwbHkoY29uc29sZSwgYXJncyk7XG4gIH1cbn0gZWxzZSB7XG4gIGRlYnVnID0gZnVuY3Rpb24oKSB7fTtcbn1cbmV4cG9ydHMuZGVidWcgPSBkZWJ1ZzsgLy8gZm9yIHRlc3RcbiIsImV4cG9ydCB7IGRlZmF1bHQgYXMgdjEgfSBmcm9tICcuL3YxLmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgdjMgfSBmcm9tICcuL3YzLmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgdjQgfSBmcm9tICcuL3Y0LmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgdjUgfSBmcm9tICcuL3Y1LmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgTklMIH0gZnJvbSAnLi9uaWwuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyB2ZXJzaW9uIH0gZnJvbSAnLi92ZXJzaW9uLmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgdmFsaWRhdGUgfSBmcm9tICcuL3ZhbGlkYXRlLmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgc3RyaW5naWZ5IH0gZnJvbSAnLi9zdHJpbmdpZnkuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBwYXJzZSB9IGZyb20gJy4vcGFyc2UuanMnOyIsIi8qXG4gKiBCcm93c2VyLWNvbXBhdGlibGUgSmF2YVNjcmlwdCBNRDVcbiAqXG4gKiBNb2RpZmljYXRpb24gb2YgSmF2YVNjcmlwdCBNRDVcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9ibHVlaW1wL0phdmFTY3JpcHQtTUQ1XG4gKlxuICogQ29weXJpZ2h0IDIwMTEsIFNlYmFzdGlhbiBUc2NoYW5cbiAqIGh0dHBzOi8vYmx1ZWltcC5uZXRcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwczovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICpcbiAqIEJhc2VkIG9uXG4gKiBBIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb24gb2YgdGhlIFJTQSBEYXRhIFNlY3VyaXR5LCBJbmMuIE1ENSBNZXNzYWdlXG4gKiBEaWdlc3QgQWxnb3JpdGhtLCBhcyBkZWZpbmVkIGluIFJGQyAxMzIxLlxuICogVmVyc2lvbiAyLjIgQ29weXJpZ2h0IChDKSBQYXVsIEpvaG5zdG9uIDE5OTkgLSAyMDA5XG4gKiBPdGhlciBjb250cmlidXRvcnM6IEdyZWcgSG9sdCwgQW5kcmV3IEtlcGVydCwgWWRuYXIsIExvc3RpbmV0XG4gKiBEaXN0cmlidXRlZCB1bmRlciB0aGUgQlNEIExpY2Vuc2VcbiAqIFNlZSBodHRwOi8vcGFqaG9tZS5vcmcudWsvY3J5cHQvbWQ1IGZvciBtb3JlIGluZm8uXG4gKi9cbmZ1bmN0aW9uIG1kNShieXRlcykge1xuICBpZiAodHlwZW9mIGJ5dGVzID09PSAnc3RyaW5nJykge1xuICAgIHZhciBtc2cgPSB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoYnl0ZXMpKTsgLy8gVVRGOCBlc2NhcGVcblxuICAgIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkobXNnLmxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1zZy5sZW5ndGg7ICsraSkge1xuICAgICAgYnl0ZXNbaV0gPSBtc2cuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWQ1VG9IZXhFbmNvZGVkQXJyYXkod29yZHNUb01kNShieXRlc1RvV29yZHMoYnl0ZXMpLCBieXRlcy5sZW5ndGggKiA4KSk7XG59XG4vKlxuICogQ29udmVydCBhbiBhcnJheSBvZiBsaXR0bGUtZW5kaWFuIHdvcmRzIHRvIGFuIGFycmF5IG9mIGJ5dGVzXG4gKi9cblxuXG5mdW5jdGlvbiBtZDVUb0hleEVuY29kZWRBcnJheShpbnB1dCkge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIHZhciBsZW5ndGgzMiA9IGlucHV0Lmxlbmd0aCAqIDMyO1xuICB2YXIgaGV4VGFiID0gJzAxMjM0NTY3ODlhYmNkZWYnO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoMzI7IGkgKz0gOCkge1xuICAgIHZhciB4ID0gaW5wdXRbaSA+PiA1XSA+Pj4gaSAlIDMyICYgMHhmZjtcbiAgICB2YXIgaGV4ID0gcGFyc2VJbnQoaGV4VGFiLmNoYXJBdCh4ID4+PiA0ICYgMHgwZikgKyBoZXhUYWIuY2hhckF0KHggJiAweDBmKSwgMTYpO1xuICAgIG91dHB1dC5wdXNoKGhleCk7XG4gIH1cblxuICByZXR1cm4gb3V0cHV0O1xufVxuLyoqXG4gKiBDYWxjdWxhdGUgb3V0cHV0IGxlbmd0aCB3aXRoIHBhZGRpbmcgYW5kIGJpdCBsZW5ndGhcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldE91dHB1dExlbmd0aChpbnB1dExlbmd0aDgpIHtcbiAgcmV0dXJuIChpbnB1dExlbmd0aDggKyA2NCA+Pj4gOSA8PCA0KSArIDE0ICsgMTtcbn1cbi8qXG4gKiBDYWxjdWxhdGUgdGhlIE1ENSBvZiBhbiBhcnJheSBvZiBsaXR0bGUtZW5kaWFuIHdvcmRzLCBhbmQgYSBiaXQgbGVuZ3RoLlxuICovXG5cblxuZnVuY3Rpb24gd29yZHNUb01kNSh4LCBsZW4pIHtcbiAgLyogYXBwZW5kIHBhZGRpbmcgKi9cbiAgeFtsZW4gPj4gNV0gfD0gMHg4MCA8PCBsZW4gJSAzMjtcbiAgeFtnZXRPdXRwdXRMZW5ndGgobGVuKSAtIDFdID0gbGVuO1xuICB2YXIgYSA9IDE3MzI1ODQxOTM7XG4gIHZhciBiID0gLTI3MTczMzg3OTtcbiAgdmFyIGMgPSAtMTczMjU4NDE5NDtcbiAgdmFyIGQgPSAyNzE3MzM4Nzg7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSArPSAxNikge1xuICAgIHZhciBvbGRhID0gYTtcbiAgICB2YXIgb2xkYiA9IGI7XG4gICAgdmFyIG9sZGMgPSBjO1xuICAgIHZhciBvbGRkID0gZDtcbiAgICBhID0gbWQ1ZmYoYSwgYiwgYywgZCwgeFtpXSwgNywgLTY4MDg3NjkzNik7XG4gICAgZCA9IG1kNWZmKGQsIGEsIGIsIGMsIHhbaSArIDFdLCAxMiwgLTM4OTU2NDU4Nik7XG4gICAgYyA9IG1kNWZmKGMsIGQsIGEsIGIsIHhbaSArIDJdLCAxNywgNjA2MTA1ODE5KTtcbiAgICBiID0gbWQ1ZmYoYiwgYywgZCwgYSwgeFtpICsgM10sIDIyLCAtMTA0NDUyNTMzMCk7XG4gICAgYSA9IG1kNWZmKGEsIGIsIGMsIGQsIHhbaSArIDRdLCA3LCAtMTc2NDE4ODk3KTtcbiAgICBkID0gbWQ1ZmYoZCwgYSwgYiwgYywgeFtpICsgNV0sIDEyLCAxMjAwMDgwNDI2KTtcbiAgICBjID0gbWQ1ZmYoYywgZCwgYSwgYiwgeFtpICsgNl0sIDE3LCAtMTQ3MzIzMTM0MSk7XG4gICAgYiA9IG1kNWZmKGIsIGMsIGQsIGEsIHhbaSArIDddLCAyMiwgLTQ1NzA1OTgzKTtcbiAgICBhID0gbWQ1ZmYoYSwgYiwgYywgZCwgeFtpICsgOF0sIDcsIDE3NzAwMzU0MTYpO1xuICAgIGQgPSBtZDVmZihkLCBhLCBiLCBjLCB4W2kgKyA5XSwgMTIsIC0xOTU4NDE0NDE3KTtcbiAgICBjID0gbWQ1ZmYoYywgZCwgYSwgYiwgeFtpICsgMTBdLCAxNywgLTQyMDYzKTtcbiAgICBiID0gbWQ1ZmYoYiwgYywgZCwgYSwgeFtpICsgMTFdLCAyMiwgLTE5OTA0MDQxNjIpO1xuICAgIGEgPSBtZDVmZihhLCBiLCBjLCBkLCB4W2kgKyAxMl0sIDcsIDE4MDQ2MDM2ODIpO1xuICAgIGQgPSBtZDVmZihkLCBhLCBiLCBjLCB4W2kgKyAxM10sIDEyLCAtNDAzNDExMDEpO1xuICAgIGMgPSBtZDVmZihjLCBkLCBhLCBiLCB4W2kgKyAxNF0sIDE3LCAtMTUwMjAwMjI5MCk7XG4gICAgYiA9IG1kNWZmKGIsIGMsIGQsIGEsIHhbaSArIDE1XSwgMjIsIDEyMzY1MzUzMjkpO1xuICAgIGEgPSBtZDVnZyhhLCBiLCBjLCBkLCB4W2kgKyAxXSwgNSwgLTE2NTc5NjUxMCk7XG4gICAgZCA9IG1kNWdnKGQsIGEsIGIsIGMsIHhbaSArIDZdLCA5LCAtMTA2OTUwMTYzMik7XG4gICAgYyA9IG1kNWdnKGMsIGQsIGEsIGIsIHhbaSArIDExXSwgMTQsIDY0MzcxNzcxMyk7XG4gICAgYiA9IG1kNWdnKGIsIGMsIGQsIGEsIHhbaV0sIDIwLCAtMzczODk3MzAyKTtcbiAgICBhID0gbWQ1Z2coYSwgYiwgYywgZCwgeFtpICsgNV0sIDUsIC03MDE1NTg2OTEpO1xuICAgIGQgPSBtZDVnZyhkLCBhLCBiLCBjLCB4W2kgKyAxMF0sIDksIDM4MDE2MDgzKTtcbiAgICBjID0gbWQ1Z2coYywgZCwgYSwgYiwgeFtpICsgMTVdLCAxNCwgLTY2MDQ3ODMzNSk7XG4gICAgYiA9IG1kNWdnKGIsIGMsIGQsIGEsIHhbaSArIDRdLCAyMCwgLTQwNTUzNzg0OCk7XG4gICAgYSA9IG1kNWdnKGEsIGIsIGMsIGQsIHhbaSArIDldLCA1LCA1Njg0NDY0MzgpO1xuICAgIGQgPSBtZDVnZyhkLCBhLCBiLCBjLCB4W2kgKyAxNF0sIDksIC0xMDE5ODAzNjkwKTtcbiAgICBjID0gbWQ1Z2coYywgZCwgYSwgYiwgeFtpICsgM10sIDE0LCAtMTg3MzYzOTYxKTtcbiAgICBiID0gbWQ1Z2coYiwgYywgZCwgYSwgeFtpICsgOF0sIDIwLCAxMTYzNTMxNTAxKTtcbiAgICBhID0gbWQ1Z2coYSwgYiwgYywgZCwgeFtpICsgMTNdLCA1LCAtMTQ0NDY4MTQ2Nyk7XG4gICAgZCA9IG1kNWdnKGQsIGEsIGIsIGMsIHhbaSArIDJdLCA5LCAtNTE0MDM3ODQpO1xuICAgIGMgPSBtZDVnZyhjLCBkLCBhLCBiLCB4W2kgKyA3XSwgMTQsIDE3MzUzMjg0NzMpO1xuICAgIGIgPSBtZDVnZyhiLCBjLCBkLCBhLCB4W2kgKyAxMl0sIDIwLCAtMTkyNjYwNzczNCk7XG4gICAgYSA9IG1kNWhoKGEsIGIsIGMsIGQsIHhbaSArIDVdLCA0LCAtMzc4NTU4KTtcbiAgICBkID0gbWQ1aGgoZCwgYSwgYiwgYywgeFtpICsgOF0sIDExLCAtMjAyMjU3NDQ2Myk7XG4gICAgYyA9IG1kNWhoKGMsIGQsIGEsIGIsIHhbaSArIDExXSwgMTYsIDE4MzkwMzA1NjIpO1xuICAgIGIgPSBtZDVoaChiLCBjLCBkLCBhLCB4W2kgKyAxNF0sIDIzLCAtMzUzMDk1NTYpO1xuICAgIGEgPSBtZDVoaChhLCBiLCBjLCBkLCB4W2kgKyAxXSwgNCwgLTE1MzA5OTIwNjApO1xuICAgIGQgPSBtZDVoaChkLCBhLCBiLCBjLCB4W2kgKyA0XSwgMTEsIDEyNzI4OTMzNTMpO1xuICAgIGMgPSBtZDVoaChjLCBkLCBhLCBiLCB4W2kgKyA3XSwgMTYsIC0xNTU0OTc2MzIpO1xuICAgIGIgPSBtZDVoaChiLCBjLCBkLCBhLCB4W2kgKyAxMF0sIDIzLCAtMTA5NDczMDY0MCk7XG4gICAgYSA9IG1kNWhoKGEsIGIsIGMsIGQsIHhbaSArIDEzXSwgNCwgNjgxMjc5MTc0KTtcbiAgICBkID0gbWQ1aGgoZCwgYSwgYiwgYywgeFtpXSwgMTEsIC0zNTg1MzcyMjIpO1xuICAgIGMgPSBtZDVoaChjLCBkLCBhLCBiLCB4W2kgKyAzXSwgMTYsIC03MjI1MjE5NzkpO1xuICAgIGIgPSBtZDVoaChiLCBjLCBkLCBhLCB4W2kgKyA2XSwgMjMsIDc2MDI5MTg5KTtcbiAgICBhID0gbWQ1aGgoYSwgYiwgYywgZCwgeFtpICsgOV0sIDQsIC02NDAzNjQ0ODcpO1xuICAgIGQgPSBtZDVoaChkLCBhLCBiLCBjLCB4W2kgKyAxMl0sIDExLCAtNDIxODE1ODM1KTtcbiAgICBjID0gbWQ1aGgoYywgZCwgYSwgYiwgeFtpICsgMTVdLCAxNiwgNTMwNzQyNTIwKTtcbiAgICBiID0gbWQ1aGgoYiwgYywgZCwgYSwgeFtpICsgMl0sIDIzLCAtOTk1MzM4NjUxKTtcbiAgICBhID0gbWQ1aWkoYSwgYiwgYywgZCwgeFtpXSwgNiwgLTE5ODYzMDg0NCk7XG4gICAgZCA9IG1kNWlpKGQsIGEsIGIsIGMsIHhbaSArIDddLCAxMCwgMTEyNjg5MTQxNSk7XG4gICAgYyA9IG1kNWlpKGMsIGQsIGEsIGIsIHhbaSArIDE0XSwgMTUsIC0xNDE2MzU0OTA1KTtcbiAgICBiID0gbWQ1aWkoYiwgYywgZCwgYSwgeFtpICsgNV0sIDIxLCAtNTc0MzQwNTUpO1xuICAgIGEgPSBtZDVpaShhLCBiLCBjLCBkLCB4W2kgKyAxMl0sIDYsIDE3MDA0ODU1NzEpO1xuICAgIGQgPSBtZDVpaShkLCBhLCBiLCBjLCB4W2kgKyAzXSwgMTAsIC0xODk0OTg2NjA2KTtcbiAgICBjID0gbWQ1aWkoYywgZCwgYSwgYiwgeFtpICsgMTBdLCAxNSwgLTEwNTE1MjMpO1xuICAgIGIgPSBtZDVpaShiLCBjLCBkLCBhLCB4W2kgKyAxXSwgMjEsIC0yMDU0OTIyNzk5KTtcbiAgICBhID0gbWQ1aWkoYSwgYiwgYywgZCwgeFtpICsgOF0sIDYsIDE4NzMzMTMzNTkpO1xuICAgIGQgPSBtZDVpaShkLCBhLCBiLCBjLCB4W2kgKyAxNV0sIDEwLCAtMzA2MTE3NDQpO1xuICAgIGMgPSBtZDVpaShjLCBkLCBhLCBiLCB4W2kgKyA2XSwgMTUsIC0xNTYwMTk4MzgwKTtcbiAgICBiID0gbWQ1aWkoYiwgYywgZCwgYSwgeFtpICsgMTNdLCAyMSwgMTMwOTE1MTY0OSk7XG4gICAgYSA9IG1kNWlpKGEsIGIsIGMsIGQsIHhbaSArIDRdLCA2LCAtMTQ1NTIzMDcwKTtcbiAgICBkID0gbWQ1aWkoZCwgYSwgYiwgYywgeFtpICsgMTFdLCAxMCwgLTExMjAyMTAzNzkpO1xuICAgIGMgPSBtZDVpaShjLCBkLCBhLCBiLCB4W2kgKyAyXSwgMTUsIDcxODc4NzI1OSk7XG4gICAgYiA9IG1kNWlpKGIsIGMsIGQsIGEsIHhbaSArIDldLCAyMSwgLTM0MzQ4NTU1MSk7XG4gICAgYSA9IHNhZmVBZGQoYSwgb2xkYSk7XG4gICAgYiA9IHNhZmVBZGQoYiwgb2xkYik7XG4gICAgYyA9IHNhZmVBZGQoYywgb2xkYyk7XG4gICAgZCA9IHNhZmVBZGQoZCwgb2xkZCk7XG4gIH1cblxuICByZXR1cm4gW2EsIGIsIGMsIGRdO1xufVxuLypcbiAqIENvbnZlcnQgYW4gYXJyYXkgYnl0ZXMgdG8gYW4gYXJyYXkgb2YgbGl0dGxlLWVuZGlhbiB3b3Jkc1xuICogQ2hhcmFjdGVycyA+MjU1IGhhdmUgdGhlaXIgaGlnaC1ieXRlIHNpbGVudGx5IGlnbm9yZWQuXG4gKi9cblxuXG5mdW5jdGlvbiBieXRlc1RvV29yZHMoaW5wdXQpIHtcbiAgaWYgKGlucHV0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHZhciBsZW5ndGg4ID0gaW5wdXQubGVuZ3RoICogODtcbiAgdmFyIG91dHB1dCA9IG5ldyBVaW50MzJBcnJheShnZXRPdXRwdXRMZW5ndGgobGVuZ3RoOCkpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoODsgaSArPSA4KSB7XG4gICAgb3V0cHV0W2kgPj4gNV0gfD0gKGlucHV0W2kgLyA4XSAmIDB4ZmYpIDw8IGkgJSAzMjtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59XG4vKlxuICogQWRkIGludGVnZXJzLCB3cmFwcGluZyBhdCAyXjMyLiBUaGlzIHVzZXMgMTYtYml0IG9wZXJhdGlvbnMgaW50ZXJuYWxseVxuICogdG8gd29yayBhcm91bmQgYnVncyBpbiBzb21lIEpTIGludGVycHJldGVycy5cbiAqL1xuXG5cbmZ1bmN0aW9uIHNhZmVBZGQoeCwgeSkge1xuICB2YXIgbHN3ID0gKHggJiAweGZmZmYpICsgKHkgJiAweGZmZmYpO1xuICB2YXIgbXN3ID0gKHggPj4gMTYpICsgKHkgPj4gMTYpICsgKGxzdyA+PiAxNik7XG4gIHJldHVybiBtc3cgPDwgMTYgfCBsc3cgJiAweGZmZmY7XG59XG4vKlxuICogQml0d2lzZSByb3RhdGUgYSAzMi1iaXQgbnVtYmVyIHRvIHRoZSBsZWZ0LlxuICovXG5cblxuZnVuY3Rpb24gYml0Um90YXRlTGVmdChudW0sIGNudCkge1xuICByZXR1cm4gbnVtIDw8IGNudCB8IG51bSA+Pj4gMzIgLSBjbnQ7XG59XG4vKlxuICogVGhlc2UgZnVuY3Rpb25zIGltcGxlbWVudCB0aGUgZm91ciBiYXNpYyBvcGVyYXRpb25zIHRoZSBhbGdvcml0aG0gdXNlcy5cbiAqL1xuXG5cbmZ1bmN0aW9uIG1kNWNtbihxLCBhLCBiLCB4LCBzLCB0KSB7XG4gIHJldHVybiBzYWZlQWRkKGJpdFJvdGF0ZUxlZnQoc2FmZUFkZChzYWZlQWRkKGEsIHEpLCBzYWZlQWRkKHgsIHQpKSwgcyksIGIpO1xufVxuXG5mdW5jdGlvbiBtZDVmZihhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XG4gIHJldHVybiBtZDVjbW4oYiAmIGMgfCB+YiAmIGQsIGEsIGIsIHgsIHMsIHQpO1xufVxuXG5mdW5jdGlvbiBtZDVnZyhhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XG4gIHJldHVybiBtZDVjbW4oYiAmIGQgfCBjICYgfmQsIGEsIGIsIHgsIHMsIHQpO1xufVxuXG5mdW5jdGlvbiBtZDVoaChhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XG4gIHJldHVybiBtZDVjbW4oYiBeIGMgXiBkLCBhLCBiLCB4LCBzLCB0KTtcbn1cblxuZnVuY3Rpb24gbWQ1aWkoYSwgYiwgYywgZCwgeCwgcywgdCkge1xuICByZXR1cm4gbWQ1Y21uKGMgXiAoYiB8IH5kKSwgYSwgYiwgeCwgcywgdCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1kNTsiLCJleHBvcnQgZGVmYXVsdCAnMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwJzsiLCJpbXBvcnQgdmFsaWRhdGUgZnJvbSAnLi92YWxpZGF0ZS5qcyc7XG5cbmZ1bmN0aW9uIHBhcnNlKHV1aWQpIHtcbiAgaWYgKCF2YWxpZGF0ZSh1dWlkKSkge1xuICAgIHRocm93IFR5cGVFcnJvcignSW52YWxpZCBVVUlEJyk7XG4gIH1cblxuICB2YXIgdjtcbiAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KDE2KTsgLy8gUGFyc2UgIyMjIyMjIyMtLi4uLi0uLi4uLS4uLi4tLi4uLi4uLi4uLi4uXG5cbiAgYXJyWzBdID0gKHYgPSBwYXJzZUludCh1dWlkLnNsaWNlKDAsIDgpLCAxNikpID4+PiAyNDtcbiAgYXJyWzFdID0gdiA+Pj4gMTYgJiAweGZmO1xuICBhcnJbMl0gPSB2ID4+PiA4ICYgMHhmZjtcbiAgYXJyWzNdID0gdiAmIDB4ZmY7IC8vIFBhcnNlIC4uLi4uLi4uLSMjIyMtLi4uLi0uLi4uLS4uLi4uLi4uLi4uLlxuXG4gIGFycls0XSA9ICh2ID0gcGFyc2VJbnQodXVpZC5zbGljZSg5LCAxMyksIDE2KSkgPj4+IDg7XG4gIGFycls1XSA9IHYgJiAweGZmOyAvLyBQYXJzZSAuLi4uLi4uLi0uLi4uLSMjIyMtLi4uLi0uLi4uLi4uLi4uLi5cblxuICBhcnJbNl0gPSAodiA9IHBhcnNlSW50KHV1aWQuc2xpY2UoMTQsIDE4KSwgMTYpKSA+Pj4gODtcbiAgYXJyWzddID0gdiAmIDB4ZmY7IC8vIFBhcnNlIC4uLi4uLi4uLS4uLi4tLi4uLi0jIyMjLS4uLi4uLi4uLi4uLlxuXG4gIGFycls4XSA9ICh2ID0gcGFyc2VJbnQodXVpZC5zbGljZSgxOSwgMjMpLCAxNikpID4+PiA4O1xuICBhcnJbOV0gPSB2ICYgMHhmZjsgLy8gUGFyc2UgLi4uLi4uLi4tLi4uLi0uLi4uLS4uLi4tIyMjIyMjIyMjIyMjXG4gIC8vIChVc2UgXCIvXCIgdG8gYXZvaWQgMzItYml0IHRydW5jYXRpb24gd2hlbiBiaXQtc2hpZnRpbmcgaGlnaC1vcmRlciBieXRlcylcblxuICBhcnJbMTBdID0gKHYgPSBwYXJzZUludCh1dWlkLnNsaWNlKDI0LCAzNiksIDE2KSkgLyAweDEwMDAwMDAwMDAwICYgMHhmZjtcbiAgYXJyWzExXSA9IHYgLyAweDEwMDAwMDAwMCAmIDB4ZmY7XG4gIGFyclsxMl0gPSB2ID4+PiAyNCAmIDB4ZmY7XG4gIGFyclsxM10gPSB2ID4+PiAxNiAmIDB4ZmY7XG4gIGFyclsxNF0gPSB2ID4+PiA4ICYgMHhmZjtcbiAgYXJyWzE1XSA9IHYgJiAweGZmO1xuICByZXR1cm4gYXJyO1xufVxuXG5leHBvcnQgZGVmYXVsdCBwYXJzZTsiLCJleHBvcnQgZGVmYXVsdCAvXig/OlswLTlhLWZdezh9LVswLTlhLWZdezR9LVsxLTVdWzAtOWEtZl17M30tWzg5YWJdWzAtOWEtZl17M30tWzAtOWEtZl17MTJ9fDAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCkkL2k7IiwiLy8gVW5pcXVlIElEIGNyZWF0aW9uIHJlcXVpcmVzIGEgaGlnaCBxdWFsaXR5IHJhbmRvbSAjIGdlbmVyYXRvci4gSW4gdGhlIGJyb3dzZXIgd2UgdGhlcmVmb3JlXG4vLyByZXF1aXJlIHRoZSBjcnlwdG8gQVBJIGFuZCBkbyBub3Qgc3VwcG9ydCBidWlsdC1pbiBmYWxsYmFjayB0byBsb3dlciBxdWFsaXR5IHJhbmRvbSBudW1iZXJcbi8vIGdlbmVyYXRvcnMgKGxpa2UgTWF0aC5yYW5kb20oKSkuXG52YXIgZ2V0UmFuZG9tVmFsdWVzO1xudmFyIHJuZHM4ID0gbmV3IFVpbnQ4QXJyYXkoMTYpO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcm5nKCkge1xuICAvLyBsYXp5IGxvYWQgc28gdGhhdCBlbnZpcm9ubWVudHMgdGhhdCBuZWVkIHRvIHBvbHlmaWxsIGhhdmUgYSBjaGFuY2UgdG8gZG8gc29cbiAgaWYgKCFnZXRSYW5kb21WYWx1ZXMpIHtcbiAgICAvLyBnZXRSYW5kb21WYWx1ZXMgbmVlZHMgdG8gYmUgaW52b2tlZCBpbiBhIGNvbnRleHQgd2hlcmUgXCJ0aGlzXCIgaXMgYSBDcnlwdG8gaW1wbGVtZW50YXRpb24uIEFsc28sXG4gICAgLy8gZmluZCB0aGUgY29tcGxldGUgaW1wbGVtZW50YXRpb24gb2YgY3J5cHRvIChtc0NyeXB0bykgb24gSUUxMS5cbiAgICBnZXRSYW5kb21WYWx1ZXMgPSB0eXBlb2YgY3J5cHRvICE9PSAndW5kZWZpbmVkJyAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMuYmluZChjcnlwdG8pIHx8IHR5cGVvZiBtc0NyeXB0byAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1zQ3J5cHRvLmdldFJhbmRvbVZhbHVlcyA9PT0gJ2Z1bmN0aW9uJyAmJiBtc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMuYmluZChtc0NyeXB0byk7XG5cbiAgICBpZiAoIWdldFJhbmRvbVZhbHVlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKCkgbm90IHN1cHBvcnRlZC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS91dWlkanMvdXVpZCNnZXRyYW5kb212YWx1ZXMtbm90LXN1cHBvcnRlZCcpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBnZXRSYW5kb21WYWx1ZXMocm5kczgpO1xufSIsIi8vIEFkYXB0ZWQgZnJvbSBDaHJpcyBWZW5lc3MnIFNIQTEgY29kZSBhdFxuLy8gaHR0cDovL3d3dy5tb3ZhYmxlLXR5cGUuY28udWsvc2NyaXB0cy9zaGExLmh0bWxcbmZ1bmN0aW9uIGYocywgeCwgeSwgeikge1xuICBzd2l0Y2ggKHMpIHtcbiAgICBjYXNlIDA6XG4gICAgICByZXR1cm4geCAmIHkgXiB+eCAmIHo7XG5cbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4geCBeIHkgXiB6O1xuXG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIHggJiB5IF4geCAmIHogXiB5ICYgejtcblxuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiB4IF4geSBeIHo7XG4gIH1cbn1cblxuZnVuY3Rpb24gUk9UTCh4LCBuKSB7XG4gIHJldHVybiB4IDw8IG4gfCB4ID4+PiAzMiAtIG47XG59XG5cbmZ1bmN0aW9uIHNoYTEoYnl0ZXMpIHtcbiAgdmFyIEsgPSBbMHg1YTgyNzk5OSwgMHg2ZWQ5ZWJhMSwgMHg4ZjFiYmNkYywgMHhjYTYyYzFkNl07XG4gIHZhciBIID0gWzB4Njc0NTIzMDEsIDB4ZWZjZGFiODksIDB4OThiYWRjZmUsIDB4MTAzMjU0NzYsIDB4YzNkMmUxZjBdO1xuXG4gIGlmICh0eXBlb2YgYnl0ZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIG1zZyA9IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChieXRlcykpOyAvLyBVVEY4IGVzY2FwZVxuXG4gICAgYnl0ZXMgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbXNnLmxlbmd0aDsgKytpKSB7XG4gICAgICBieXRlcy5wdXNoKG1zZy5jaGFyQ29kZUF0KGkpKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoIUFycmF5LmlzQXJyYXkoYnl0ZXMpKSB7XG4gICAgLy8gQ29udmVydCBBcnJheS1saWtlIHRvIEFycmF5XG4gICAgYnl0ZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChieXRlcyk7XG4gIH1cblxuICBieXRlcy5wdXNoKDB4ODApO1xuICB2YXIgbCA9IGJ5dGVzLmxlbmd0aCAvIDQgKyAyO1xuICB2YXIgTiA9IE1hdGguY2VpbChsIC8gMTYpO1xuICB2YXIgTSA9IG5ldyBBcnJheShOKTtcblxuICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgTjsgKytfaSkge1xuICAgIHZhciBhcnIgPSBuZXcgVWludDMyQXJyYXkoMTYpO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCAxNjsgKytqKSB7XG4gICAgICBhcnJbal0gPSBieXRlc1tfaSAqIDY0ICsgaiAqIDRdIDw8IDI0IHwgYnl0ZXNbX2kgKiA2NCArIGogKiA0ICsgMV0gPDwgMTYgfCBieXRlc1tfaSAqIDY0ICsgaiAqIDQgKyAyXSA8PCA4IHwgYnl0ZXNbX2kgKiA2NCArIGogKiA0ICsgM107XG4gICAgfVxuXG4gICAgTVtfaV0gPSBhcnI7XG4gIH1cblxuICBNW04gLSAxXVsxNF0gPSAoYnl0ZXMubGVuZ3RoIC0gMSkgKiA4IC8gTWF0aC5wb3coMiwgMzIpO1xuICBNW04gLSAxXVsxNF0gPSBNYXRoLmZsb29yKE1bTiAtIDFdWzE0XSk7XG4gIE1bTiAtIDFdWzE1XSA9IChieXRlcy5sZW5ndGggLSAxKSAqIDggJiAweGZmZmZmZmZmO1xuXG4gIGZvciAodmFyIF9pMiA9IDA7IF9pMiA8IE47ICsrX2kyKSB7XG4gICAgdmFyIFcgPSBuZXcgVWludDMyQXJyYXkoODApO1xuXG4gICAgZm9yICh2YXIgdCA9IDA7IHQgPCAxNjsgKyt0KSB7XG4gICAgICBXW3RdID0gTVtfaTJdW3RdO1xuICAgIH1cblxuICAgIGZvciAodmFyIF90ID0gMTY7IF90IDwgODA7ICsrX3QpIHtcbiAgICAgIFdbX3RdID0gUk9UTChXW190IC0gM10gXiBXW190IC0gOF0gXiBXW190IC0gMTRdIF4gV1tfdCAtIDE2XSwgMSk7XG4gICAgfVxuXG4gICAgdmFyIGEgPSBIWzBdO1xuICAgIHZhciBiID0gSFsxXTtcbiAgICB2YXIgYyA9IEhbMl07XG4gICAgdmFyIGQgPSBIWzNdO1xuICAgIHZhciBlID0gSFs0XTtcblxuICAgIGZvciAodmFyIF90MiA9IDA7IF90MiA8IDgwOyArK190Mikge1xuICAgICAgdmFyIHMgPSBNYXRoLmZsb29yKF90MiAvIDIwKTtcbiAgICAgIHZhciBUID0gUk9UTChhLCA1KSArIGYocywgYiwgYywgZCkgKyBlICsgS1tzXSArIFdbX3QyXSA+Pj4gMDtcbiAgICAgIGUgPSBkO1xuICAgICAgZCA9IGM7XG4gICAgICBjID0gUk9UTChiLCAzMCkgPj4+IDA7XG4gICAgICBiID0gYTtcbiAgICAgIGEgPSBUO1xuICAgIH1cblxuICAgIEhbMF0gPSBIWzBdICsgYSA+Pj4gMDtcbiAgICBIWzFdID0gSFsxXSArIGIgPj4+IDA7XG4gICAgSFsyXSA9IEhbMl0gKyBjID4+PiAwO1xuICAgIEhbM10gPSBIWzNdICsgZCA+Pj4gMDtcbiAgICBIWzRdID0gSFs0XSArIGUgPj4+IDA7XG4gIH1cblxuICByZXR1cm4gW0hbMF0gPj4gMjQgJiAweGZmLCBIWzBdID4+IDE2ICYgMHhmZiwgSFswXSA+PiA4ICYgMHhmZiwgSFswXSAmIDB4ZmYsIEhbMV0gPj4gMjQgJiAweGZmLCBIWzFdID4+IDE2ICYgMHhmZiwgSFsxXSA+PiA4ICYgMHhmZiwgSFsxXSAmIDB4ZmYsIEhbMl0gPj4gMjQgJiAweGZmLCBIWzJdID4+IDE2ICYgMHhmZiwgSFsyXSA+PiA4ICYgMHhmZiwgSFsyXSAmIDB4ZmYsIEhbM10gPj4gMjQgJiAweGZmLCBIWzNdID4+IDE2ICYgMHhmZiwgSFszXSA+PiA4ICYgMHhmZiwgSFszXSAmIDB4ZmYsIEhbNF0gPj4gMjQgJiAweGZmLCBIWzRdID4+IDE2ICYgMHhmZiwgSFs0XSA+PiA4ICYgMHhmZiwgSFs0XSAmIDB4ZmZdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBzaGExOyIsImltcG9ydCB2YWxpZGF0ZSBmcm9tICcuL3ZhbGlkYXRlLmpzJztcbi8qKlxuICogQ29udmVydCBhcnJheSBvZiAxNiBieXRlIHZhbHVlcyB0byBVVUlEIHN0cmluZyBmb3JtYXQgb2YgdGhlIGZvcm06XG4gKiBYWFhYWFhYWC1YWFhYLVhYWFgtWFhYWC1YWFhYWFhYWFhYWFhcbiAqL1xuXG52YXIgYnl0ZVRvSGV4ID0gW107XG5cbmZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyArK2kpIHtcbiAgYnl0ZVRvSGV4LnB1c2goKGkgKyAweDEwMCkudG9TdHJpbmcoMTYpLnN1YnN0cigxKSk7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeShhcnIpIHtcbiAgdmFyIG9mZnNldCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcbiAgLy8gTm90ZTogQmUgY2FyZWZ1bCBlZGl0aW5nIHRoaXMgY29kZSEgIEl0J3MgYmVlbiB0dW5lZCBmb3IgcGVyZm9ybWFuY2VcbiAgLy8gYW5kIHdvcmtzIGluIHdheXMgeW91IG1heSBub3QgZXhwZWN0LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3V1aWRqcy91dWlkL3B1bGwvNDM0XG4gIHZhciB1dWlkID0gKGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDJdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgM11dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA0XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDVdXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgNl1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA3XV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDhdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgOV1dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxMF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxMV1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxMl1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxM11dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxNF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxNV1dKS50b0xvd2VyQ2FzZSgpOyAvLyBDb25zaXN0ZW5jeSBjaGVjayBmb3IgdmFsaWQgVVVJRC4gIElmIHRoaXMgdGhyb3dzLCBpdCdzIGxpa2VseSBkdWUgdG8gb25lXG4gIC8vIG9mIHRoZSBmb2xsb3dpbmc6XG4gIC8vIC0gT25lIG9yIG1vcmUgaW5wdXQgYXJyYXkgdmFsdWVzIGRvbid0IG1hcCB0byBhIGhleCBvY3RldCAobGVhZGluZyB0b1xuICAvLyBcInVuZGVmaW5lZFwiIGluIHRoZSB1dWlkKVxuICAvLyAtIEludmFsaWQgaW5wdXQgdmFsdWVzIGZvciB0aGUgUkZDIGB2ZXJzaW9uYCBvciBgdmFyaWFudGAgZmllbGRzXG5cbiAgaWYgKCF2YWxpZGF0ZSh1dWlkKSkge1xuICAgIHRocm93IFR5cGVFcnJvcignU3RyaW5naWZpZWQgVVVJRCBpcyBpbnZhbGlkJyk7XG4gIH1cblxuICByZXR1cm4gdXVpZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc3RyaW5naWZ5OyIsImltcG9ydCBybmcgZnJvbSAnLi9ybmcuanMnO1xuaW1wb3J0IHN0cmluZ2lmeSBmcm9tICcuL3N0cmluZ2lmeS5qcyc7IC8vICoqYHYxKClgIC0gR2VuZXJhdGUgdGltZS1iYXNlZCBVVUlEKipcbi8vXG4vLyBJbnNwaXJlZCBieSBodHRwczovL2dpdGh1Yi5jb20vTGlvc0svVVVJRC5qc1xuLy8gYW5kIGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS91dWlkLmh0bWxcblxudmFyIF9ub2RlSWQ7XG5cbnZhciBfY2xvY2tzZXE7IC8vIFByZXZpb3VzIHV1aWQgY3JlYXRpb24gdGltZVxuXG5cbnZhciBfbGFzdE1TZWNzID0gMDtcbnZhciBfbGFzdE5TZWNzID0gMDsgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS91dWlkanMvdXVpZCBmb3IgQVBJIGRldGFpbHNcblxuZnVuY3Rpb24gdjEob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG4gIHZhciBiID0gYnVmIHx8IG5ldyBBcnJheSgxNik7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgbm9kZSA9IG9wdGlvbnMubm9kZSB8fCBfbm9kZUlkO1xuICB2YXIgY2xvY2tzZXEgPSBvcHRpb25zLmNsb2Nrc2VxICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmNsb2Nrc2VxIDogX2Nsb2Nrc2VxOyAvLyBub2RlIGFuZCBjbG9ja3NlcSBuZWVkIHRvIGJlIGluaXRpYWxpemVkIHRvIHJhbmRvbSB2YWx1ZXMgaWYgdGhleSdyZSBub3RcbiAgLy8gc3BlY2lmaWVkLiAgV2UgZG8gdGhpcyBsYXppbHkgdG8gbWluaW1pemUgaXNzdWVzIHJlbGF0ZWQgdG8gaW5zdWZmaWNpZW50XG4gIC8vIHN5c3RlbSBlbnRyb3B5LiAgU2VlICMxODlcblxuICBpZiAobm9kZSA9PSBudWxsIHx8IGNsb2Nrc2VxID09IG51bGwpIHtcbiAgICB2YXIgc2VlZEJ5dGVzID0gb3B0aW9ucy5yYW5kb20gfHwgKG9wdGlvbnMucm5nIHx8IHJuZykoKTtcblxuICAgIGlmIChub2RlID09IG51bGwpIHtcbiAgICAgIC8vIFBlciA0LjUsIGNyZWF0ZSBhbmQgNDgtYml0IG5vZGUgaWQsICg0NyByYW5kb20gYml0cyArIG11bHRpY2FzdCBiaXQgPSAxKVxuICAgICAgbm9kZSA9IF9ub2RlSWQgPSBbc2VlZEJ5dGVzWzBdIHwgMHgwMSwgc2VlZEJ5dGVzWzFdLCBzZWVkQnl0ZXNbMl0sIHNlZWRCeXRlc1szXSwgc2VlZEJ5dGVzWzRdLCBzZWVkQnl0ZXNbNV1dO1xuICAgIH1cblxuICAgIGlmIChjbG9ja3NlcSA9PSBudWxsKSB7XG4gICAgICAvLyBQZXIgNC4yLjIsIHJhbmRvbWl6ZSAoMTQgYml0KSBjbG9ja3NlcVxuICAgICAgY2xvY2tzZXEgPSBfY2xvY2tzZXEgPSAoc2VlZEJ5dGVzWzZdIDw8IDggfCBzZWVkQnl0ZXNbN10pICYgMHgzZmZmO1xuICAgIH1cbiAgfSAvLyBVVUlEIHRpbWVzdGFtcHMgYXJlIDEwMCBuYW5vLXNlY29uZCB1bml0cyBzaW5jZSB0aGUgR3JlZ29yaWFuIGVwb2NoLFxuICAvLyAoMTU4Mi0xMC0xNSAwMDowMCkuICBKU051bWJlcnMgYXJlbid0IHByZWNpc2UgZW5vdWdoIGZvciB0aGlzLCBzb1xuICAvLyB0aW1lIGlzIGhhbmRsZWQgaW50ZXJuYWxseSBhcyAnbXNlY3MnIChpbnRlZ2VyIG1pbGxpc2Vjb25kcykgYW5kICduc2VjcydcbiAgLy8gKDEwMC1uYW5vc2Vjb25kcyBvZmZzZXQgZnJvbSBtc2Vjcykgc2luY2UgdW5peCBlcG9jaCwgMTk3MC0wMS0wMSAwMDowMC5cblxuXG4gIHZhciBtc2VjcyA9IG9wdGlvbnMubXNlY3MgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMubXNlY3MgOiBEYXRlLm5vdygpOyAvLyBQZXIgNC4yLjEuMiwgdXNlIGNvdW50IG9mIHV1aWQncyBnZW5lcmF0ZWQgZHVyaW5nIHRoZSBjdXJyZW50IGNsb2NrXG4gIC8vIGN5Y2xlIHRvIHNpbXVsYXRlIGhpZ2hlciByZXNvbHV0aW9uIGNsb2NrXG5cbiAgdmFyIG5zZWNzID0gb3B0aW9ucy5uc2VjcyAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5uc2VjcyA6IF9sYXN0TlNlY3MgKyAxOyAvLyBUaW1lIHNpbmNlIGxhc3QgdXVpZCBjcmVhdGlvbiAoaW4gbXNlY3MpXG5cbiAgdmFyIGR0ID0gbXNlY3MgLSBfbGFzdE1TZWNzICsgKG5zZWNzIC0gX2xhc3ROU2VjcykgLyAxMDAwMDsgLy8gUGVyIDQuMi4xLjIsIEJ1bXAgY2xvY2tzZXEgb24gY2xvY2sgcmVncmVzc2lvblxuXG4gIGlmIChkdCA8IDAgJiYgb3B0aW9ucy5jbG9ja3NlcSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY2xvY2tzZXEgPSBjbG9ja3NlcSArIDEgJiAweDNmZmY7XG4gIH0gLy8gUmVzZXQgbnNlY3MgaWYgY2xvY2sgcmVncmVzc2VzIChuZXcgY2xvY2tzZXEpIG9yIHdlJ3ZlIG1vdmVkIG9udG8gYSBuZXdcbiAgLy8gdGltZSBpbnRlcnZhbFxuXG5cbiAgaWYgKChkdCA8IDAgfHwgbXNlY3MgPiBfbGFzdE1TZWNzKSAmJiBvcHRpb25zLm5zZWNzID09PSB1bmRlZmluZWQpIHtcbiAgICBuc2VjcyA9IDA7XG4gIH0gLy8gUGVyIDQuMi4xLjIgVGhyb3cgZXJyb3IgaWYgdG9vIG1hbnkgdXVpZHMgYXJlIHJlcXVlc3RlZFxuXG5cbiAgaWYgKG5zZWNzID49IDEwMDAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwidXVpZC52MSgpOiBDYW4ndCBjcmVhdGUgbW9yZSB0aGFuIDEwTSB1dWlkcy9zZWNcIik7XG4gIH1cblxuICBfbGFzdE1TZWNzID0gbXNlY3M7XG4gIF9sYXN0TlNlY3MgPSBuc2VjcztcbiAgX2Nsb2Nrc2VxID0gY2xvY2tzZXE7IC8vIFBlciA0LjEuNCAtIENvbnZlcnQgZnJvbSB1bml4IGVwb2NoIHRvIEdyZWdvcmlhbiBlcG9jaFxuXG4gIG1zZWNzICs9IDEyMjE5MjkyODAwMDAwOyAvLyBgdGltZV9sb3dgXG5cbiAgdmFyIHRsID0gKChtc2VjcyAmIDB4ZmZmZmZmZikgKiAxMDAwMCArIG5zZWNzKSAlIDB4MTAwMDAwMDAwO1xuICBiW2krK10gPSB0bCA+Pj4gMjQgJiAweGZmO1xuICBiW2krK10gPSB0bCA+Pj4gMTYgJiAweGZmO1xuICBiW2krK10gPSB0bCA+Pj4gOCAmIDB4ZmY7XG4gIGJbaSsrXSA9IHRsICYgMHhmZjsgLy8gYHRpbWVfbWlkYFxuXG4gIHZhciB0bWggPSBtc2VjcyAvIDB4MTAwMDAwMDAwICogMTAwMDAgJiAweGZmZmZmZmY7XG4gIGJbaSsrXSA9IHRtaCA+Pj4gOCAmIDB4ZmY7XG4gIGJbaSsrXSA9IHRtaCAmIDB4ZmY7IC8vIGB0aW1lX2hpZ2hfYW5kX3ZlcnNpb25gXG5cbiAgYltpKytdID0gdG1oID4+PiAyNCAmIDB4ZiB8IDB4MTA7IC8vIGluY2x1ZGUgdmVyc2lvblxuXG4gIGJbaSsrXSA9IHRtaCA+Pj4gMTYgJiAweGZmOyAvLyBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGAgKFBlciA0LjIuMiAtIGluY2x1ZGUgdmFyaWFudClcblxuICBiW2krK10gPSBjbG9ja3NlcSA+Pj4gOCB8IDB4ODA7IC8vIGBjbG9ja19zZXFfbG93YFxuXG4gIGJbaSsrXSA9IGNsb2Nrc2VxICYgMHhmZjsgLy8gYG5vZGVgXG5cbiAgZm9yICh2YXIgbiA9IDA7IG4gPCA2OyArK24pIHtcbiAgICBiW2kgKyBuXSA9IG5vZGVbbl07XG4gIH1cblxuICByZXR1cm4gYnVmIHx8IHN0cmluZ2lmeShiKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdjE7IiwiaW1wb3J0IHYzNSBmcm9tICcuL3YzNS5qcyc7XG5pbXBvcnQgbWQ1IGZyb20gJy4vbWQ1LmpzJztcbnZhciB2MyA9IHYzNSgndjMnLCAweDMwLCBtZDUpO1xuZXhwb3J0IGRlZmF1bHQgdjM7IiwiaW1wb3J0IHN0cmluZ2lmeSBmcm9tICcuL3N0cmluZ2lmeS5qcyc7XG5pbXBvcnQgcGFyc2UgZnJvbSAnLi9wYXJzZS5qcyc7XG5cbmZ1bmN0aW9uIHN0cmluZ1RvQnl0ZXMoc3RyKSB7XG4gIHN0ciA9IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChzdHIpKTsgLy8gVVRGOCBlc2NhcGVcblxuICB2YXIgYnl0ZXMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIGJ5dGVzLnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpO1xuICB9XG5cbiAgcmV0dXJuIGJ5dGVzO1xufVxuXG5leHBvcnQgdmFyIEROUyA9ICc2YmE3YjgxMC05ZGFkLTExZDEtODBiNC0wMGMwNGZkNDMwYzgnO1xuZXhwb3J0IHZhciBVUkwgPSAnNmJhN2I4MTEtOWRhZC0xMWQxLTgwYjQtMDBjMDRmZDQzMGM4JztcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChuYW1lLCB2ZXJzaW9uLCBoYXNoZnVuYykge1xuICBmdW5jdGlvbiBnZW5lcmF0ZVVVSUQodmFsdWUsIG5hbWVzcGFjZSwgYnVmLCBvZmZzZXQpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWUgPSBzdHJpbmdUb0J5dGVzKHZhbHVlKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG5hbWVzcGFjZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG5hbWVzcGFjZSA9IHBhcnNlKG5hbWVzcGFjZSk7XG4gICAgfVxuXG4gICAgaWYgKG5hbWVzcGFjZS5sZW5ndGggIT09IDE2KSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ05hbWVzcGFjZSBtdXN0IGJlIGFycmF5LWxpa2UgKDE2IGl0ZXJhYmxlIGludGVnZXIgdmFsdWVzLCAwLTI1NSknKTtcbiAgICB9IC8vIENvbXB1dGUgaGFzaCBvZiBuYW1lc3BhY2UgYW5kIHZhbHVlLCBQZXIgNC4zXG4gICAgLy8gRnV0dXJlOiBVc2Ugc3ByZWFkIHN5bnRheCB3aGVuIHN1cHBvcnRlZCBvbiBhbGwgcGxhdGZvcm1zLCBlLmcuIGBieXRlcyA9XG4gICAgLy8gaGFzaGZ1bmMoWy4uLm5hbWVzcGFjZSwgLi4uIHZhbHVlXSlgXG5cblxuICAgIHZhciBieXRlcyA9IG5ldyBVaW50OEFycmF5KDE2ICsgdmFsdWUubGVuZ3RoKTtcbiAgICBieXRlcy5zZXQobmFtZXNwYWNlKTtcbiAgICBieXRlcy5zZXQodmFsdWUsIG5hbWVzcGFjZS5sZW5ndGgpO1xuICAgIGJ5dGVzID0gaGFzaGZ1bmMoYnl0ZXMpO1xuICAgIGJ5dGVzWzZdID0gYnl0ZXNbNl0gJiAweDBmIHwgdmVyc2lvbjtcbiAgICBieXRlc1s4XSA9IGJ5dGVzWzhdICYgMHgzZiB8IDB4ODA7XG5cbiAgICBpZiAoYnVmKSB7XG4gICAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNjsgKytpKSB7XG4gICAgICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVzW2ldO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYnVmO1xuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmdpZnkoYnl0ZXMpO1xuICB9IC8vIEZ1bmN0aW9uI25hbWUgaXMgbm90IHNldHRhYmxlIG9uIHNvbWUgcGxhdGZvcm1zICgjMjcwKVxuXG5cbiAgdHJ5IHtcbiAgICBnZW5lcmF0ZVVVSUQubmFtZSA9IG5hbWU7IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1lbXB0eVxuICB9IGNhdGNoIChlcnIpIHt9IC8vIEZvciBDb21tb25KUyBkZWZhdWx0IGV4cG9ydCBzdXBwb3J0XG5cblxuICBnZW5lcmF0ZVVVSUQuRE5TID0gRE5TO1xuICBnZW5lcmF0ZVVVSUQuVVJMID0gVVJMO1xuICByZXR1cm4gZ2VuZXJhdGVVVUlEO1xufSIsImltcG9ydCBybmcgZnJvbSAnLi9ybmcuanMnO1xuaW1wb3J0IHN0cmluZ2lmeSBmcm9tICcuL3N0cmluZ2lmeS5qcyc7XG5cbmZ1bmN0aW9uIHY0KG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgcm5kcyA9IG9wdGlvbnMucmFuZG9tIHx8IChvcHRpb25zLnJuZyB8fCBybmcpKCk7IC8vIFBlciA0LjQsIHNldCBiaXRzIGZvciB2ZXJzaW9uIGFuZCBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGBcblxuICBybmRzWzZdID0gcm5kc1s2XSAmIDB4MGYgfCAweDQwO1xuICBybmRzWzhdID0gcm5kc1s4XSAmIDB4M2YgfCAweDgwOyAvLyBDb3B5IGJ5dGVzIHRvIGJ1ZmZlciwgaWYgcHJvdmlkZWRcblxuICBpZiAoYnVmKSB7XG4gICAgb2Zmc2V0ID0gb2Zmc2V0IHx8IDA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE2OyArK2kpIHtcbiAgICAgIGJ1ZltvZmZzZXQgKyBpXSA9IHJuZHNbaV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZjtcbiAgfVxuXG4gIHJldHVybiBzdHJpbmdpZnkocm5kcyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHY0OyIsImltcG9ydCB2MzUgZnJvbSAnLi92MzUuanMnO1xuaW1wb3J0IHNoYTEgZnJvbSAnLi9zaGExLmpzJztcbnZhciB2NSA9IHYzNSgndjUnLCAweDUwLCBzaGExKTtcbmV4cG9ydCBkZWZhdWx0IHY1OyIsImltcG9ydCBSRUdFWCBmcm9tICcuL3JlZ2V4LmpzJztcblxuZnVuY3Rpb24gdmFsaWRhdGUodXVpZCkge1xuICByZXR1cm4gdHlwZW9mIHV1aWQgPT09ICdzdHJpbmcnICYmIFJFR0VYLnRlc3QodXVpZCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHZhbGlkYXRlOyIsImltcG9ydCB2YWxpZGF0ZSBmcm9tICcuL3ZhbGlkYXRlLmpzJztcblxuZnVuY3Rpb24gdmVyc2lvbih1dWlkKSB7XG4gIGlmICghdmFsaWRhdGUodXVpZCkpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ0ludmFsaWQgVVVJRCcpO1xuICB9XG5cbiAgcmV0dXJuIHBhcnNlSW50KHV1aWQuc3Vic3RyKDE0LCAxKSwgMTYpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB2ZXJzaW9uOyIsIi8vIFJldHVybnMgYSB3cmFwcGVyIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHdyYXBwZWQgY2FsbGJhY2tcbi8vIFRoZSB3cmFwcGVyIGZ1bmN0aW9uIHNob3VsZCBkbyBzb21lIHN0dWZmLCBhbmQgcmV0dXJuIGFcbi8vIHByZXN1bWFibHkgZGlmZmVyZW50IGNhbGxiYWNrIGZ1bmN0aW9uLlxuLy8gVGhpcyBtYWtlcyBzdXJlIHRoYXQgb3duIHByb3BlcnRpZXMgYXJlIHJldGFpbmVkLCBzbyB0aGF0XG4vLyBkZWNvcmF0aW9ucyBhbmQgc3VjaCBhcmUgbm90IGxvc3QgYWxvbmcgdGhlIHdheS5cbm1vZHVsZS5leHBvcnRzID0gd3JhcHB5XG5mdW5jdGlvbiB3cmFwcHkgKGZuLCBjYikge1xuICBpZiAoZm4gJiYgY2IpIHJldHVybiB3cmFwcHkoZm4pKGNiKVxuXG4gIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbmVlZCB3cmFwcGVyIGZ1bmN0aW9uJylcblxuICBPYmplY3Qua2V5cyhmbikuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgIHdyYXBwZXJba10gPSBmbltrXVxuICB9KVxuXG4gIHJldHVybiB3cmFwcGVyXG5cbiAgZnVuY3Rpb24gd3JhcHBlcigpIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXVxuICAgIH1cbiAgICB2YXIgcmV0ID0gZm4uYXBwbHkodGhpcywgYXJncylcbiAgICB2YXIgY2IgPSBhcmdzW2FyZ3MubGVuZ3RoLTFdXG4gICAgaWYgKHR5cGVvZiByZXQgPT09ICdmdW5jdGlvbicgJiYgcmV0ICE9PSBjYikge1xuICAgICAgT2JqZWN0LmtleXMoY2IpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgcmV0W2tdID0gY2Jba11cbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiByZXRcbiAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9pbmRleC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==