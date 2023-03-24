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
const core = __importStar(__webpack_require__(/*! @actions/core */ "./node_modules/@actions/core/lib/core.js"));
const artifact = __importStar(__webpack_require__(/*! @actions/artifact */ "./node_modules/@actions/artifact/lib/artifact-client.js"));
const child_process_1 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'child_process'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const process_1 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'process'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const vid = core.getInput("vid", { required: true });
const vkey = core.getInput("vkey", { required: true });
const path = core.getInput("path", { required: true });
const format = core.getInput("format", { required: true });
const scanType = core.getInput("scanType", { required: true });
const exportfile = core.getInput("export", { required: true });
ContainerScan(vid, vkey, path, format, scanType, exportfile);
function ContainerScan(vid, vkey, path, format, scanType, exportfile) {
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
                core.info('Scan command :' + scanCommand);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFlO0FBQ2Y7Ozs7Ozs7Ozs7O0FDOVNhO0FBQ2I7QUFDQTtBQUNBLG1DQUFtQyxvQ0FBb0MsZ0JBQWdCO0FBQ3ZGLENBQUM7QUFDRDtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0EsMENBQTBDLDRCQUE0QjtBQUN0RSxDQUFDO0FBQ0Q7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QiwrREFBK0QsaUJBQWlCO0FBQzVHO0FBQ0Esb0NBQW9DLE1BQU0sK0JBQStCLFlBQVk7QUFDckYsbUNBQW1DLE1BQU0sbUNBQW1DLFlBQVk7QUFDeEYsZ0NBQWdDO0FBQ2hDO0FBQ0EsS0FBSztBQUNMO0FBQ0EsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELDBCQUEwQjtBQUMxQix3QkFBd0IsbUJBQU8sQ0FBQyxpSUFBSTtBQUNwQywwQkFBMEIsbUJBQU8sQ0FBQywrREFBZTtBQUNqRCwwQkFBMEIsbUJBQU8sQ0FBQyxtSUFBTTtBQUN4QyxnQkFBZ0IsbUJBQU8sQ0FBQyx1RUFBUztBQUNqQyxjQUFjLG1CQUFPLENBQUMsa0lBQUs7QUFDM0IsMEJBQTBCLG1CQUFPLENBQUMsMkZBQW1CO0FBQ3JELHFCQUFxQixtQkFBTyxDQUFDLHlJQUFZO0FBQ3pDLHVCQUF1QixtQkFBTyxDQUFDLHFGQUFnQjtBQUMvQywyQkFBMkIsbUJBQU8sQ0FBQyw2RkFBb0I7QUFDdkQsdUJBQXVCLG1CQUFPLENBQUMscUZBQWdCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdKQUFnSiwwQ0FBMEM7QUFDMUw7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUpBQXFKLHFEQUFxRDtBQUMxTTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhEQUE4RCxxQkFBcUI7QUFDbkY7QUFDQTtBQUNBO0FBQ0Esd0VBQXdFLHFCQUFxQjtBQUM3RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEMsa0JBQWtCLEdBQUcscUJBQXFCLElBQUksa0NBQWtDLE9BQU8seURBQXlEO0FBQzVMO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLG9FQUFvRSxNQUFNO0FBQzFFLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0dBQXdHLGlCQUFpQjtBQUN6SDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEVBQThFLFdBQVcsZ0JBQWdCLGlCQUFpQjtBQUMxSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0VBQW9FLFdBQVcsZ0JBQWdCLGFBQWE7QUFDNUc7QUFDQTtBQUNBLDZEQUE2RCxXQUFXO0FBQ3hFO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdFQUFnRTtBQUNoRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsNkJBQTZCO0FBQ2hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVFQUF1RSw2QkFBNkIsc0JBQXNCLGlCQUFpQjtBQUMzSTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBLDJGQUEyRix1QkFBdUI7QUFDbEg7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0EsMkZBQTJGLHVCQUF1QjtBQUNsSDtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBLGFBQWE7QUFDYjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsMEJBQTBCO0FBQzFCOzs7Ozs7Ozs7OztBQ25TYTtBQUNiO0FBQ0E7QUFDQSxtQ0FBbUMsb0NBQW9DLGdCQUFnQjtBQUN2RixDQUFDO0FBQ0Q7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBLDBDQUEwQyw0QkFBNEI7QUFDdEUsQ0FBQztBQUNEO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELGdDQUFnQztBQUNoQywwQkFBMEIsbUJBQU8sQ0FBQyxtSUFBTTtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLGFBQWE7QUFDbEQscUNBQXFDLGFBQWE7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0M7QUFDaEM7Ozs7Ozs7Ozs7O0FDekVhO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELG1CQUFtQjtBQUNuQixnQkFBZ0IsbUJBQU8sQ0FBQyx1RUFBUztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CO0FBQ25COzs7Ozs7Ozs7OztBQy9CYTtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCw2QkFBNkIsR0FBRyx5QkFBeUI7QUFDekQsZUFBZSxtQkFBTyxDQUFDLCtEQUFlO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsS0FBSztBQUMvQztBQUNBO0FBQ0E7QUFDQSwyREFBMkQsS0FBSyxzQ0FBc0M7QUFDdEc7QUFDQSw4QkFBOEI7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsS0FBSztBQUMvQztBQUNBO0FBQ0E7QUFDQSwyREFBMkQsS0FBSyxzQ0FBc0M7QUFDdEc7QUFDQSw4QkFBOEI7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCOzs7Ozs7Ozs7OztBQ2xFYTtBQUNiO0FBQ0E7QUFDQSxtQ0FBbUMsb0NBQW9DLGdCQUFnQjtBQUN2RixDQUFDO0FBQ0Q7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBLDBDQUEwQyw0QkFBNEI7QUFDdEUsQ0FBQztBQUNEO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsK0RBQStELGlCQUFpQjtBQUM1RztBQUNBLG9DQUFvQyxNQUFNLCtCQUErQixZQUFZO0FBQ3JGLG1DQUFtQyxNQUFNLG1DQUFtQyxZQUFZO0FBQ3hGLGdDQUFnQztBQUNoQztBQUNBLEtBQUs7QUFDTDtBQUNBLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCw4QkFBOEIsR0FBRyxhQUFhO0FBQzlDLGdCQUFnQixtQkFBTyxDQUFDLHVFQUFTO0FBQ2pDLDBCQUEwQixtQkFBTyxDQUFDLCtEQUFlO0FBQ2pELDJCQUEyQixtQkFBTyxDQUFDLDZGQUFvQjtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0VBQWtFLFdBQVc7QUFDN0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLE1BQU07QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QixNQUFNLFlBQVksU0FBUyxLQUFLLGFBQWEscUJBQXFCLGFBQWE7QUFDeEc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsTUFBTSxVQUFVLHVCQUF1QjtBQUNsRTtBQUNBLHVCQUF1QixNQUFNLFVBQVUsYUFBYTtBQUNwRCxLQUFLO0FBQ0w7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsOEJBQThCO0FBQzlCOzs7Ozs7Ozs7OztBQ3ZGYTtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxzQkFBc0I7QUFDdEIsZUFBZSxtQkFBTyxDQUFDLCtEQUFlO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QyxrQ0FBa0MsdUJBQXVCLHFCQUFxQixHQUFHLGlEQUFpRDtBQUMvSyxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQyxVQUFVLEdBQUcsaURBQWlELFdBQVcsZ0JBQWdCLEdBQUcsY0FBYztBQUMxSTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCOzs7Ozs7Ozs7OztBQ25EYTtBQUNiO0FBQ0E7QUFDQSxtQ0FBbUMsb0NBQW9DLGdCQUFnQjtBQUN2RixDQUFDO0FBQ0Q7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBLDBDQUEwQyw0QkFBNEI7QUFDdEUsQ0FBQztBQUNEO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsK0RBQStELGlCQUFpQjtBQUM1RztBQUNBLG9DQUFvQyxNQUFNLCtCQUErQixZQUFZO0FBQ3JGLG1DQUFtQyxNQUFNLG1DQUFtQyxZQUFZO0FBQ3hGLGdDQUFnQztBQUNoQztBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJHQUEyRyx1RkFBdUYsY0FBYztBQUNoTix1QkFBdUIsOEJBQThCLGdEQUFnRCx3REFBd0Q7QUFDN0osNkNBQTZDLHNDQUFzQyxVQUFVLG1CQUFtQixJQUFJO0FBQ3BIO0FBQ0EsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELDhCQUE4QixHQUFHLDRCQUE0QjtBQUM3RCx3QkFBd0IsbUJBQU8sQ0FBQyxpSUFBSTtBQUNwQywwQkFBMEIsbUJBQU8sQ0FBQyxtSUFBTTtBQUN4QyxlQUFlLG1CQUFPLENBQUMsbUlBQU07QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQSw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUVBQWlFLCtDQUErQztBQUNoSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixRQUFRO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCO0FBQzFCO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0EsOEJBQThCO0FBQzlCOzs7Ozs7Ozs7OztBQ3hIYTtBQUNiO0FBQ0E7QUFDQSxtQ0FBbUMsb0NBQW9DLGdCQUFnQjtBQUN2RixDQUFDO0FBQ0Q7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBLDBDQUEwQyw0QkFBNEI7QUFDdEUsQ0FBQztBQUNEO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsK0RBQStELGlCQUFpQjtBQUM1RztBQUNBLG9DQUFvQyxNQUFNLCtCQUErQixZQUFZO0FBQ3JGLG1DQUFtQyxNQUFNLG1DQUFtQyxZQUFZO0FBQ3hGLGdDQUFnQztBQUNoQztBQUNBLEtBQUs7QUFDTDtBQUNBLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCx3QkFBd0I7QUFDeEIsd0JBQXdCLG1CQUFPLENBQUMsaUlBQUk7QUFDcEMsMEJBQTBCLG1CQUFPLENBQUMsK0RBQWU7QUFDakQseUJBQXlCLG1CQUFPLENBQUMsd0RBQWE7QUFDOUMsNEJBQTRCLG1CQUFPLENBQUMscUlBQVE7QUFDNUMsZ0JBQWdCLG1CQUFPLENBQUMsdUVBQVM7QUFDakMsMkJBQTJCLG1CQUFPLENBQUMsNkZBQW9CO0FBQ3ZELGVBQWUsbUJBQU8sQ0FBQyxtSUFBTTtBQUM3QixjQUFjLG1CQUFPLENBQUMsa0lBQUs7QUFDM0IscUJBQXFCLG1CQUFPLENBQUMseUlBQVk7QUFDekMsMEJBQTBCLG1CQUFPLENBQUMsMkZBQW1CO0FBQ3JELHNCQUFzQixtQkFBTyxDQUFDLDhFQUFzQjtBQUNwRCx1QkFBdUIsbUJBQU8sQ0FBQyxxRkFBZ0I7QUFDL0Msc0JBQXNCLG1CQUFPLENBQUMsbUZBQWU7QUFDN0MsdUJBQXVCLG1CQUFPLENBQUMscUZBQWdCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLFFBQVE7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsY0FBYyw0QkFBNEIsWUFBWTtBQUMvRjtBQUNBO0FBQ0EsMkpBQTJKLGlEQUFpRDtBQUM1TTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLGdCQUFnQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEMsaUJBQWlCLG9CQUFvQixlQUFlO0FBQ2hHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEMsaUJBQWlCLEdBQUcscUJBQXFCLElBQUksNEJBQTRCLE9BQU8seURBQXlEO0FBQ3JMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLGlFQUFpRSxnQkFBZ0I7QUFDakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLHNCQUFzQjtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QixpQkFBaUI7QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNERBQTRELGlCQUFpQjtBQUM3RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwREFBMEQsaUJBQWlCO0FBQzNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdEQUF3RCxpQkFBaUI7QUFDekU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QixpQkFBaUIsNERBQTRELGVBQWU7QUFDMUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNERBQTRELGlCQUFpQjtBQUM3RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNERBQTRELGlCQUFpQjtBQUM3RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0REFBNEQsaUJBQWlCO0FBQzdFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyREFBMkQsY0FBYztBQUN6RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLFFBQVE7QUFDdkIsZUFBZSx1QkFBdUI7QUFDdEMsZUFBZSxRQUFRO0FBQ3ZCLGVBQWUsUUFBUTtBQUN2QixlQUFlLFFBQVE7QUFDdkIsZUFBZSxTQUFTO0FBQ3hCLGVBQWUsUUFBUTtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0ZBQWtGLE9BQU8sS0FBSyxZQUFZO0FBQzFHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEVBQTBFLFdBQVcsZ0JBQWdCLGlCQUFpQjtBQUN0SDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdFQUFnRSxXQUFXLGdCQUFnQixhQUFhLHNEQUFzRCxNQUFNO0FBQ3BLO0FBQ0E7QUFDQSx5REFBeUQsV0FBVztBQUNwRTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEVBQTRFLGdCQUFnQjtBQUM1RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsNkJBQTZCO0FBQ2hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRkFBaUYsWUFBWTtBQUM3RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQztBQUNqQztBQUNBLGlDQUFpQyx1QkFBdUI7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpREFBaUQsY0FBYztBQUMvRDtBQUNBO0FBQ0E7QUFDQSwwSkFBMEosNkRBQTZEO0FBQ3ZOO0FBQ0EsbUNBQW1DLGNBQWMsdURBQXVELEtBQUs7QUFDN0csU0FBUztBQUNUO0FBQ0E7QUFDQSx3QkFBd0I7QUFDeEI7Ozs7Ozs7Ozs7O0FDeFphO0FBQ2I7QUFDQTtBQUNBLG1DQUFtQyxvQ0FBb0MsZ0JBQWdCO0FBQ3ZGLENBQUM7QUFDRDtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0EsMENBQTBDLDRCQUE0QjtBQUN0RSxDQUFDO0FBQ0Q7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsOEJBQThCO0FBQzlCLHdCQUF3QixtQkFBTyxDQUFDLGlJQUFJO0FBQ3BDLGVBQWUsbUJBQU8sQ0FBQywrREFBZTtBQUN0QyxlQUFlLG1CQUFPLENBQUMsbUlBQU07QUFDN0IsNENBQTRDLG1CQUFPLENBQUMsK0hBQXFDO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0RBQWtELGVBQWU7QUFDakU7QUFDQTtBQUNBLGtEQUFrRCxlQUFlO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLE1BQU07QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0RBQXNELGVBQWUseUNBQXlDLEtBQUs7QUFDbkg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUMsTUFBTTtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QjtBQUM5Qjs7Ozs7Ozs7Ozs7QUNwR2E7QUFDYjtBQUNBLDRCQUE0QiwrREFBK0QsaUJBQWlCO0FBQzVHO0FBQ0Esb0NBQW9DLE1BQU0sK0JBQStCLFlBQVk7QUFDckYsbUNBQW1DLE1BQU0sbUNBQW1DLFlBQVk7QUFDeEYsZ0NBQWdDO0FBQ2hDO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSw2Q0FBNkM7QUFDN0M7QUFDQSw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsdUJBQXVCLEdBQUcsYUFBYSxHQUFHLDBCQUEwQixHQUFHLGNBQWMsR0FBRyxtQkFBbUIsR0FBRyxtQ0FBbUMsR0FBRyxvQ0FBb0MsR0FBRyw4QkFBOEIsR0FBRyxzQkFBc0IsR0FBRyx3QkFBd0IsR0FBRyx3QkFBd0IsR0FBRywwQkFBMEIsR0FBRyx1QkFBdUIsR0FBRywrQ0FBK0MsR0FBRyw2QkFBNkIsR0FBRyw2QkFBNkIsR0FBRyw2QkFBNkIsR0FBRywyQkFBMkIsR0FBRyxxQkFBcUIsR0FBRyxzQkFBc0IsR0FBRyw2Q0FBNkM7QUFDaG5CLGlDQUFpQyxtQkFBTyxDQUFDLHFJQUFRO0FBQ2pELGFBQWEsbUJBQU8sQ0FBQyxpSUFBSTtBQUN6QixlQUFlLG1CQUFPLENBQUMsK0RBQWU7QUFDdEMsc0JBQXNCLG1CQUFPLENBQUMsOEVBQXNCO0FBQ3BELGVBQWUsbUJBQU8sQ0FBQyxzRkFBK0I7QUFDdEQsMkJBQTJCLG1CQUFPLENBQUMsNkZBQW9CO0FBQ3ZELGdDQUFnQyxtQkFBTyxDQUFDLHVFQUFTO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlFQUF5RSxVQUFVO0FBQ25GO0FBQ0E7QUFDQSwwREFBMEQsV0FBVztBQUNyRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDQUErQztBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLE1BQU0sR0FBRyxJQUFJLEdBQUcsTUFBTTtBQUMxQztBQUNBLHVCQUF1QjtBQUN2QjtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsU0FBUztBQUNwQixXQUFXLFNBQVM7QUFDcEIsV0FBVyxRQUFRO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZEQUE2RCxjQUFjLGdCQUFnQjtBQUMzRjtBQUNBO0FBQ0E7QUFDQSxxREFBcUQsY0FBYyxnQkFBZ0I7QUFDbkY7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCO0FBQzFCO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxTQUFTO0FBQ3BCLFdBQVcsU0FBUztBQUNwQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUFpRCxjQUFjLGdCQUFnQjtBQUMvRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0I7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QjtBQUN4QjtBQUNBLDJCQUEyQixtQ0FBbUMsNEJBQTRCLHNDQUFzQyx5QkFBeUIsZ0JBQWdCO0FBQ3pLLGtDQUFrQyxZQUFZO0FBQzlDO0FBQ0E7QUFDQSxzQkFBc0I7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZixrQkFBa0I7QUFDbEIsc0JBQXNCO0FBQ3RCO0FBQ0E7QUFDQSw4QkFBOEI7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLEtBQUs7QUFDTDtBQUNBLG9DQUFvQztBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsbUNBQW1DO0FBQ25DO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixVQUFVLFFBQVEsV0FBVyxhQUFhLGNBQWMsWUFBWSxhQUFhO0FBQ3pHO0FBQ0EsS0FBSztBQUNMO0FBQ0EsbUJBQW1CO0FBQ25CO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0lBQWtJLGNBQWM7QUFDaEo7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQSx1QkFBdUI7QUFDdkI7Ozs7Ozs7Ozs7O0FDblNhO0FBQ2I7QUFDQTtBQUNBLG1DQUFtQyxvQ0FBb0MsZ0JBQWdCO0FBQ3ZGLENBQUM7QUFDRDtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0EsMENBQTBDLDRCQUE0QjtBQUN0RSxDQUFDO0FBQ0Q7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsYUFBYSxHQUFHLG9CQUFvQjtBQUNwQyx3QkFBd0IsbUJBQU8sQ0FBQyxpSUFBSTtBQUNwQyxnQkFBZ0IsbUJBQU8sQ0FBQywwREFBUztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CO0FBQ3BCO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLElBQUksR0FBRyxvQkFBb0I7QUFDaEU7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsV0FBVyxFQUFFLHlCQUF5QjtBQUMzRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDM0ZhO0FBQ2I7QUFDQTtBQUNBLG1DQUFtQyxvQ0FBb0MsZ0JBQWdCO0FBQ3ZGLENBQUM7QUFDRDtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0EsMENBQTBDLDRCQUE0QjtBQUN0RSxDQUFDO0FBQ0Q7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QiwrREFBK0QsaUJBQWlCO0FBQzVHO0FBQ0Esb0NBQW9DLE1BQU0sK0JBQStCLFlBQVk7QUFDckYsbUNBQW1DLE1BQU0sbUNBQW1DLFlBQVk7QUFDeEYsZ0NBQWdDO0FBQ2hDO0FBQ0EsS0FBSztBQUNMO0FBQ0EsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELGtCQUFrQixHQUFHLGdCQUFnQixHQUFHLGlCQUFpQixHQUFHLGFBQWEsR0FBRyxnQkFBZ0IsR0FBRyxrQkFBa0IsR0FBRyxZQUFZLEdBQUcsY0FBYyxHQUFHLGVBQWUsR0FBRyxhQUFhLEdBQUcsYUFBYSxHQUFHLGVBQWUsR0FBRyxpQkFBaUIsR0FBRyxzQkFBc0IsR0FBRyxpQkFBaUIsR0FBRyx1QkFBdUIsR0FBRyx5QkFBeUIsR0FBRyxnQkFBZ0IsR0FBRyxlQUFlLEdBQUcsaUJBQWlCLEdBQUcsc0JBQXNCLEdBQUcsZ0JBQWdCO0FBQ2piLGtCQUFrQixtQkFBTyxDQUFDLDhEQUFXO0FBQ3JDLHVCQUF1QixtQkFBTyxDQUFDLHdFQUFnQjtBQUMvQyxnQkFBZ0IsbUJBQU8sQ0FBQywwREFBUztBQUNqQyx3QkFBd0IsbUJBQU8sQ0FBQyxpSUFBSTtBQUNwQywwQkFBMEIsbUJBQU8sQ0FBQyxtSUFBTTtBQUN4QyxxQkFBcUIsbUJBQU8sQ0FBQyxvRUFBYztBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsa0NBQWtDLGdCQUFnQixLQUFLO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLE1BQU07QUFDOUM7QUFDQSxzQkFBc0I7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QztBQUN6QztBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QztBQUM3QztBQUNBLDZCQUE2QixVQUFVLEVBQUUsZUFBZSxFQUFFLG9CQUFvQjtBQUM5RTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyxzQ0FBc0M7QUFDM0U7QUFDQSw0REFBNEQsS0FBSztBQUNqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxRkFBcUYsS0FBSztBQUMxRjtBQUNBO0FBQ0EsdUJBQXVCO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLE1BQU07QUFDakQ7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0M7QUFDdEM7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1QztBQUN2QztBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUM7QUFDekM7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDO0FBQ3hDO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxNQUFNO0FBQ2pEO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLEtBQUs7QUFDckM7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixtQkFBTyxDQUFDLDhEQUFXO0FBQ25DLDJDQUEwQyxFQUFFLHFDQUFxQyw2QkFBNkIsRUFBQztBQUMvRztBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsbUJBQU8sQ0FBQyw4REFBVztBQUNuQyxtREFBa0QsRUFBRSxxQ0FBcUMscUNBQXFDLEVBQUM7QUFDL0g7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLG1CQUFPLENBQUMsb0VBQWM7QUFDekMsK0NBQThDLEVBQUUscUNBQXFDLG9DQUFvQyxFQUFDO0FBQzFILCtDQUE4QyxFQUFFLHFDQUFxQyxvQ0FBb0MsRUFBQztBQUMxSCxrREFBaUQsRUFBRSxxQ0FBcUMsdUNBQXVDLEVBQUM7QUFDaEk7Ozs7Ozs7Ozs7O0FDL1VhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLG9DQUFvQyxnQkFBZ0I7QUFDdkYsQ0FBQztBQUNEO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQSwwQ0FBMEMsNEJBQTRCO0FBQ3RFLENBQUM7QUFDRDtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCw4QkFBOEIsR0FBRyx3QkFBd0I7QUFDekQ7QUFDQTtBQUNBLHdCQUF3QixtQkFBTyxDQUFDLGlJQUFJO0FBQ3BDLHdCQUF3QixtQkFBTyxDQUFDLGlJQUFJO0FBQ3BDLGVBQWUsbUJBQU8sQ0FBQywyREFBTTtBQUM3QixnQkFBZ0IsbUJBQU8sQ0FBQywwREFBUztBQUNqQztBQUNBLDJDQUEyQyxRQUFRO0FBQ25EO0FBQ0EsZ0ZBQWdGLFFBQVE7QUFDeEY7QUFDQTtBQUNBLGlEQUFpRCxTQUFTO0FBQzFEO0FBQ0EsbUNBQW1DLGdDQUFnQyxFQUFFLE9BQU87QUFDNUU7QUFDQSxLQUFLO0FBQ0w7QUFDQSx3QkFBd0I7QUFDeEI7QUFDQSxzQ0FBc0MsWUFBWTtBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0ZBQW9GLFVBQVU7QUFDOUY7QUFDQTtBQUNBLHFGQUFxRixVQUFVO0FBQy9GO0FBQ0EsY0FBYyxJQUFJLElBQUksVUFBVSxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLFVBQVU7QUFDL0U7QUFDQSw4QkFBOEI7QUFDOUI7Ozs7Ozs7Ozs7O0FDekRhO0FBQ2I7QUFDQSw0QkFBNEIsK0RBQStELGlCQUFpQjtBQUM1RztBQUNBLG9DQUFvQyxNQUFNLCtCQUErQixZQUFZO0FBQ3JGLG1DQUFtQyxNQUFNLG1DQUFtQyxZQUFZO0FBQ3hGLGdDQUFnQztBQUNoQztBQUNBLEtBQUs7QUFDTDtBQUNBLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxrQkFBa0I7QUFDbEIsc0JBQXNCLG1CQUFPLENBQUMsOEVBQXNCO0FBQ3BELGVBQWUsbUJBQU8sQ0FBQyxzRkFBK0I7QUFDdEQsZUFBZSxtQkFBTyxDQUFDLHdEQUFRO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixpQkFBaUI7QUFDeEMseUJBQXlCLHFCQUFxQjtBQUM5QyxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLGFBQWEsWUFBWSxnQkFBZ0I7QUFDL0U7QUFDQSxnREFBZ0QsYUFBYTtBQUM3RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0RBQWtELGNBQWM7QUFDaEU7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQjs7Ozs7Ozs7Ozs7QUM1RWE7QUFDYjtBQUNBO0FBQ0EsbUNBQW1DLG9DQUFvQyxnQkFBZ0I7QUFDdkYsQ0FBQztBQUNEO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQSwwQ0FBMEMsNEJBQTRCO0FBQ3RFLENBQUM7QUFDRDtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxzQkFBc0IsR0FBRyxtQkFBbUIsR0FBRyxtQkFBbUI7QUFDbEUsMEJBQTBCLG1CQUFPLENBQUMsbUlBQU07QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0Qjs7Ozs7Ozs7Ozs7QUN6RGE7QUFDYjtBQUNBLDRCQUE0QiwrREFBK0QsaUJBQWlCO0FBQzVHO0FBQ0Esb0NBQW9DLE1BQU0sK0JBQStCLFlBQVk7QUFDckYsbUNBQW1DLE1BQU0sbUNBQW1DLFlBQVk7QUFDeEYsZ0NBQWdDO0FBQ2hDO0FBQ0EsS0FBSztBQUNMO0FBQ0EsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELGVBQWUsR0FBRyx1QkFBdUIsR0FBRyx3QkFBd0IsR0FBRyx1QkFBdUI7QUFDOUYsYUFBYSxtQkFBTyxDQUFDLGlJQUFJO0FBQ3pCLGFBQWEsbUJBQU8sQ0FBQyxpSUFBSTtBQUN6QixRQUFRLGdDQUFnQztBQUN4Qyx1QkFBdUI7QUFDdkIsd0JBQXdCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0RUFBNEUsd0JBQXdCO0FBQ3BHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtRUFBbUUsWUFBWTtBQUMvRTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLFFBQVE7QUFDdkIsZUFBZSxlQUFlO0FBQzlCLGVBQWUsNkJBQTZCO0FBQzVDO0FBQ0EsaUJBQWlCLFFBQVE7QUFDekI7QUFDQSxpQ0FBaUM7QUFDakM7QUFDQSx1Q0FBdUMsSUFBSSxJQUFJLE1BQU07QUFDckQ7QUFDQTtBQUNBLHVCQUF1QixJQUFJLEVBQUUsVUFBVTtBQUN2QztBQUNBLG1CQUFtQixJQUFJLEVBQUUsVUFBVSxHQUFHLFFBQVEsSUFBSSxJQUFJO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxxQkFBcUI7QUFDcEM7QUFDQSxpQkFBaUIsa0JBQWtCO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNEQUFzRCxrQkFBa0I7QUFDeEU7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsaUJBQWlCO0FBQy9ELFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixRQUFRO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLFFBQVE7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxRQUFRO0FBQ3ZCLGVBQWUsU0FBUztBQUN4QjtBQUNBLGlCQUFpQixTQUFTO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLFFBQVE7QUFDdkI7QUFDQSxpQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0Esc0NBQXNDLGFBQWEsTUFBTTtBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLFVBQVU7QUFDekIsZUFBZSxTQUFTO0FBQ3hCO0FBQ0EsaUJBQWlCLFNBQVM7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLG9CQUFvQjtBQUNuQztBQUNBLGlCQUFpQixTQUFTO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixpQ0FBaUM7QUFDekQ7QUFDQSw0REFBNEQsZ0JBQWdCLFNBQVMsa0JBQWtCLFNBQVM7QUFDaEg7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLFFBQVE7QUFDdkI7QUFDQSxpQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxRQUFRO0FBQ3ZCLGVBQWUsUUFBUTtBQUN2QixlQUFlLHFCQUFxQjtBQUNwQztBQUNBLGlCQUFpQixTQUFTO0FBQzFCO0FBQ0E7QUFDQSxnQkFBZ0IsZ0JBQWdCO0FBQ2hDLG9EQUFvRCxjQUFjLE9BQU8saUJBQWlCLFFBQVE7QUFDbEcsK0RBQStELFVBQVU7QUFDekU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLGlCQUFpQjtBQUNoQztBQUNBLGlCQUFpQixTQUFTO0FBQzFCO0FBQ0E7QUFDQSx3QkFBd0IsTUFBTTtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLFNBQVM7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLFFBQVE7QUFDdkI7QUFDQSxpQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0Esc0NBQXNDLGFBQWEsTUFBTTtBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLFFBQVE7QUFDdkIsZUFBZSxRQUFRO0FBQ3ZCO0FBQ0EsaUJBQWlCLFNBQVM7QUFDMUI7QUFDQTtBQUNBLCtDQUErQyxNQUFNO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCO0FBQ3ZCLGVBQWU7QUFDZjs7Ozs7Ozs7Ozs7QUMxUmE7QUFDYjtBQUNBO0FBQ0EsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELDJCQUEyQixHQUFHLHNCQUFzQjtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQjtBQUMzQjs7Ozs7Ozs7Ozs7QUN2Q2E7QUFDYjtBQUNBLDRCQUE0QiwrREFBK0QsaUJBQWlCO0FBQzVHO0FBQ0Esb0NBQW9DLE1BQU0sK0JBQStCLFlBQVk7QUFDckYsbUNBQW1DLE1BQU0sbUNBQW1DLFlBQVk7QUFDeEYsZ0NBQWdDO0FBQ2hDO0FBQ0EsS0FBSztBQUNMO0FBQ0EsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELDRDQUE0QyxHQUFHLCtCQUErQixHQUFHLDhCQUE4QjtBQUMvRztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvREFBb0QsZUFBZSxjQUFjLEdBQUcsY0FBYyxzQkFBc0I7QUFDeEg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscURBQXFELFdBQVc7QUFDaEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsK0JBQStCO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0RBQW9ELG1CQUFtQixXQUFXLHNCQUFzQjtBQUN4RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSw0Q0FBNEM7QUFDNUM7Ozs7Ozs7Ozs7O0FDaEZhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLG9DQUFvQyxnQkFBZ0I7QUFDdkYsQ0FBQztBQUNEO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQSwwQ0FBMEMsNEJBQTRCO0FBQ3RFLENBQUM7QUFDRDtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLCtEQUErRCxpQkFBaUI7QUFDNUc7QUFDQSxvQ0FBb0MsTUFBTSwrQkFBK0IsWUFBWTtBQUNyRixtQ0FBbUMsTUFBTSxtQ0FBbUMsWUFBWTtBQUN4RixnQ0FBZ0M7QUFDaEM7QUFDQSxLQUFLO0FBQ0w7QUFDQSw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0Qsa0JBQWtCLEdBQUcsZUFBZSxHQUFHLDBCQUEwQixHQUFHLHVCQUF1QixHQUFHLG1CQUFtQixHQUFHLGtCQUFrQixHQUFHLGVBQWUsR0FBRyxpQkFBaUI7QUFDNUssMEJBQTBCLG1CQUFPLENBQUMsbUlBQU07QUFDeEMsMkJBQTJCLG1CQUFPLENBQUMsb0lBQU87QUFDMUMsd0JBQXdCLG1CQUFPLENBQUMsaUVBQVM7QUFDekMsNEJBQTRCLG1CQUFPLENBQUMsOENBQVE7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsb0NBQW9DLGlCQUFpQixLQUFLO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxnQ0FBZ0MsZUFBZSxLQUFLO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBLENBQUMsc0NBQXNDLGtCQUFrQixLQUFLO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QjtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9GQUFvRjtBQUNwRixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsZ0ZBQWdGO0FBQ2hGLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtRkFBbUY7QUFDbkYsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLGlGQUFpRjtBQUNqRixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0Esa0ZBQWtGO0FBQ2xGLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxnRkFBZ0Y7QUFDaEYsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLGlGQUFpRjtBQUNqRixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE4QztBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLG9EQUFvRDtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxtREFBbUQ7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EscURBQXFEO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxZQUFZLGdDQUFnQztBQUM1QztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSwyQ0FBMkMsT0FBTztBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esb0JBQW9CLGdCQUFnQjtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBLElBQUk7QUFDSjtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIOzs7Ozs7Ozs7OztBQzdPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esa0JBQWtCLG9CQUFvQjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsb0JBQW9CLFNBQVM7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsU0FBUztBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixvQkFBb0I7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxrQkFBa0IsU0FBUztBQUMzQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7O0FDcnhCQTtBQUNBOztBQUVBLFNBQVMsbUJBQU8sQ0FBQyx3REFBYTtBQUM5QixnQkFBZ0IsbUJBQU8sQ0FBQyx3REFBVztBQUNuQztBQUNBLFdBQVcsMEVBQXlCO0FBQ3BDLFdBQVcsbUJBQU8sQ0FBQyxtSUFBTTtBQUN6QixXQUFXLG1CQUFPLENBQUMsbUlBQU07QUFDekIsYUFBYSxtQkFBTyxDQUFDLHFJQUFRO0FBQzdCLGlCQUFpQixtQkFBTyxDQUFDLGtFQUFrQjtBQUMzQyxhQUFhLG1CQUFPLENBQUMsa0RBQWE7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esa0JBQWtCLE9BQU87QUFDekI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrQkFBa0Isb0JBQW9CO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxvQkFBb0IsU0FBUztBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixTQUFTO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0Isb0JBQW9CO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsa0JBQWtCLFNBQVM7QUFDM0I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQ3JlQSxhQUFhLG1CQUFPLENBQUMsK0NBQVE7QUFDN0I7QUFDQSxXQUFXLG1CQUFP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QUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsNkJBQTZCLFFBQVEsTUFBTTtBQUMzQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MsSUFBSTtBQUN4QztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE1BQU07QUFDTixNQUFNO0FBQ047O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxNQUFNO0FBQ04sSUFBSTs7QUFFSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLElBQUk7QUFDeEM7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLEVBQUUsRUFBRSxLQUFLO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUNBQXlDLFFBQVE7QUFDakQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixzQkFBc0I7QUFDdEM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsNkNBQTZDO0FBQzdDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUIsUUFBUTtBQUNqQztBQUNBO0FBQ0E7O0FBRUEsY0FBYyxnQkFBZ0I7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsTUFBTSw0Q0FBNEM7O0FBRWxEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSLFFBQVE7QUFDUjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxTQUFTO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsMkJBQTJCO0FBQzNCOzs7Ozs7Ozs7OztBQ2w3QkEsYUFBYSxtQkFBTyxDQUFDLCtDQUFRO0FBQzdCO0FBQ0EscUJBQXFCOztBQUVyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsR0FBRztBQUNILENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDekNhOztBQUViO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EseUNBQXlDLEVBQUU7QUFDM0M7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG9CQUFvQjtBQUNwQixvQkFBb0I7Ozs7Ozs7Ozs7O0FDbkJwQixlQUFlLG1CQUFPLENBQUMscUlBQVE7QUFDL0IsYUFBYSxtQkFBTyxDQUFDLG1JQUFNO0FBQzNCLFdBQVcsbUJBQU8sQ0FBQyxpSUFBSTtBQUN2QjtBQUNBO0FBQ0EsU0FBUyxtQkFBTyxDQUFDLHlDQUFNO0FBQ3ZCLEVBQUU7QUFDRjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTCxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLGtCQUFrQixvQkFBb0I7QUFDdEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3ZXYTs7QUFFYixRQUFRLFlBQVksRUFBRSxtQkFBTyxDQUFDLG1JQUFNO0FBQ3BDLFlBQVksbUJBQU8sQ0FBQywwQ0FBSzs7QUFFekI7QUFDQSx1QkFBdUI7QUFDdkI7QUFDQTtBQUNBLG9DQUFvQyx1Q0FBdUM7QUFDM0U7QUFDQTtBQUNBLG1CQUFtQjs7QUFFbkIsdUJBQXVCO0FBQ3ZCLFVBQVUsb0JBQW9CO0FBQzlCO0FBQ0Esc0JBQXNCLFVBQVU7QUFDaEMsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQSxzQkFBc0I7QUFDdEI7QUFDQTtBQUNBLG9DQUFvQyxtQ0FBbUM7QUFDdkU7QUFDQTtBQUNBLGtCQUFrQjs7QUFFbEIsc0JBQXNCO0FBQ3RCLFVBQVUsZ0JBQWdCO0FBQzFCO0FBQ0Esc0JBQXNCLE1BQU07QUFDNUIsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQSwwQkFBMEI7QUFDMUIsc0JBQXNCOztBQUV0QixxQkFBcUI7O0FBRXJCLGlDQUFpQzs7Ozs7Ozs7Ozs7QUNqRGpDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsbUJBQU8sQ0FBQyxpSUFBSTtBQUN2QixXQUFXLG1CQUFPLENBQUMsaUlBQUk7QUFDdkIsYUFBYSxtQkFBTyxDQUFDLG1JQUFNO0FBQzNCLGVBQWUsbUJBQU8sQ0FBQyxxSUFBUTtBQUMvQixhQUFhO0FBQ2IsZUFBZSxtQkFBTyxDQUFDLCtDQUFROztBQUUvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsMkJBQTJCO0FBQ3RDLFdBQVcsa0JBQWtCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxPQUFPO0FBQ1AsTUFBTTtBQUNOO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQixZQUFZLE9BQU87QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyx1Q0FBdUM7QUFDbEQsV0FBVyxlQUFlO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxTQUFTO0FBQ3BCLGFBQWEsZ0JBQWdCO0FBQzdCLFlBQVksT0FBTztBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsdUJBQXVCO0FBQ2xDLFdBQVcsY0FBYztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsU0FBUztBQUNwQixhQUFhLGVBQWU7QUFDNUIsWUFBWSxPQUFPO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLFVBQVU7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLFNBQVM7QUFDcEIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLFdBQVcsU0FBUztBQUNwQixhQUFhLFVBQVU7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsVUFBVTtBQUNyQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxTQUFTO0FBQ3BCLFdBQVcsc0JBQXNCO0FBQ2pDLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUixrRUFBa0U7QUFDbEU7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7O0FBRUEsa0JBQWtCLGFBQWE7QUFDL0I7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsbUNBQW1DO0FBQzlDLFdBQVcsV0FBVztBQUN0QixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDs7QUFFQTtBQUNBO0FBQ0EsY0FBYztBQUNkOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxTQUFTO0FBQ3BCO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtEQUFrRCxpQkFBaUI7QUFDbkU7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLGNBQWM7O0FBRTNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QixRQUFRLG1EQUFtRCxLQUFLO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QixRQUFRLHlDQUF5QyxLQUFLO0FBQy9FO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSx5QkFBeUIsUUFBUSw4QkFBOEIsT0FBTyxZQUFZLEtBQUs7QUFDdkY7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLFFBQVEsOEJBQThCLE9BQU8sWUFBWSxhQUFhO0FBQy9GO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsa0JBQWtCLFFBQVE7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxhQUFhO0FBQ3hCLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsVUFBVTtBQUNyQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLFFBQVE7QUFDckIsY0FBYyxVQUFVO0FBQ3hCLGNBQWMsU0FBUztBQUN2QjtBQUNBLGNBQWMsU0FBUztBQUN2QixjQUFjLFNBQVM7QUFDdkIsY0FBYyxTQUFTO0FBQ3ZCLGNBQWMsU0FBUztBQUN2QixjQUFjLFNBQVM7QUFDdkIsY0FBYyxTQUFTO0FBQ3ZCLGNBQWMsVUFBVTtBQUN4QixjQUFjLFVBQVU7QUFDeEIsY0FBYyxVQUFVO0FBQ3hCOztBQUVBO0FBQ0EsYUFBYSxRQUFRO0FBQ3JCLGNBQWMsUUFBUTtBQUN0QixjQUFjLFFBQVE7QUFDdEIsY0FBYyxjQUFjO0FBQzVCOztBQUVBO0FBQ0EsYUFBYSxRQUFRO0FBQ3JCLGNBQWMsUUFBUTtBQUN0QixjQUFjLGNBQWM7QUFDNUI7O0FBRUE7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkI7O0FBRUE7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLFdBQVcsaUJBQWlCO0FBQzVCOztBQUVBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLHFCQUFxQjtBQUNoQzs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLGlCQUFpQjtBQUM1Qjs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLHFCQUFxQjtBQUNoQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsZ0JBQWdCO0FBQzNCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLGlEQUFnRDtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxFQUFDOztBQUVGLGtCQUFrQjtBQUNsQixzQkFBc0I7O0FBRXRCLG1CQUFtQjtBQUNuQix1QkFBdUI7O0FBRXZCLHNCQUFzQjtBQUN0QiwwQkFBMEI7O0FBRTFCLGlDQUFpQzs7Ozs7Ozs7Ozs7O0FDM3dCcEI7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsb0NBQW9DO0FBQ25EO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBLDBDQUEwQyw0QkFBNEI7QUFDdEUsQ0FBQztBQUNEO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsK0RBQStELGlCQUFpQjtBQUM1RztBQUNBLG9DQUFvQyxNQUFNLCtCQUErQixZQUFZO0FBQ3JGLG1DQUFtQyxNQUFNLG1DQUFtQyxZQUFZO0FBQ3hGLGdDQUFnQztBQUNoQztBQUNBLEtBQUs7QUFDTDtBQUNBLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCwwQkFBMEIsbUJBQU8sQ0FBQywrREFBZTtBQUNqRCw4QkFBOEIsbUJBQU8sQ0FBQyxrRkFBbUI7QUFDekQsd0JBQXdCLG1CQUFPLENBQUMsNElBQWU7QUFDL0Msa0JBQWtCLG1CQUFPLENBQUMsc0lBQVM7QUFDbkMsbUNBQW1DLGdCQUFnQjtBQUNuRCxxQ0FBcUMsZ0JBQWdCO0FBQ3JELHFDQUFxQyxnQkFBZ0I7QUFDckQseUNBQXlDLGdCQUFnQjtBQUN6RCw2Q0FBNkMsZ0JBQWdCO0FBQzdELDZDQUE2QyxnQkFBZ0I7QUFDN0Q7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLEtBQUs7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4R0FBOEcsVUFBVSxXQUFXLE1BQU0sNEJBQTRCLFFBQVEsa0JBQWtCLEtBQUs7QUFDcE07QUFDQTtBQUNBLDZCQUE2QixrQkFBa0I7QUFDL0M7QUFDQTtBQUNBO0FBQ0EseUNBQXlDLElBQUk7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrSkFBa0osVUFBVSxXQUFXLE1BQU0sNEJBQTRCLE9BQU87QUFDaE4sNkJBQTZCLGtCQUFrQjtBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOzs7Ozs7Ozs7OztBQ3BGQSwrRkFBd0M7Ozs7Ozs7Ozs7OztBQ0EzQjs7QUFFYixVQUFVLG1CQUFPLENBQUMsa0lBQUs7QUFDdkIsVUFBVSxtQkFBTyxDQUFDLGtJQUFLO0FBQ3ZCLFdBQVcsbUJBQU8sQ0FBQyxtSUFBTTtBQUN6QixZQUFZLG1CQUFPLENBQUMsb0lBQU87QUFDM0IsYUFBYSxtQkFBTyxDQUFDLCtDQUFRO0FBQzdCLGFBQWEsbUJBQU8sQ0FBQyxxSUFBUTtBQUM3QixXQUFXLG1CQUFPLENBQUMsbUlBQU07OztBQUd6QixvQkFBb0I7QUFDcEIscUJBQXFCO0FBQ3JCLHFCQUFxQjtBQUNyQixzQkFBc0I7OztBQUd0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxnREFBZ0QsU0FBUztBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDhCQUE4QixhQUFhOztBQUUzQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHNDQUFzQztBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esa0RBQWtEO0FBQ2xELDJDQUEyQztBQUMzQywyQ0FBMkM7QUFDM0MsMkNBQTJDO0FBQzNDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0M7QUFDcEM7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7OztBQUdBO0FBQ0Esa0NBQWtDO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZjs7QUFFQTtBQUNBLDBDQUEwQyxTQUFTO0FBQ25EO0FBQ0E7QUFDQTtBQUNBLDRDQUE0QyxZQUFZO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQSxhQUFhLFVBQVU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3ZRaUI7QUFDQTtBQUNBO0FBQ0E7QUFDRTtBQUNRO0FBQ0U7QUFDRTs7Ozs7Ozs7Ozs7Ozs7OztBQ1B0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1EQUFtRDs7QUFFbkQ7O0FBRUEsb0JBQW9CLGdCQUFnQjtBQUNwQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsa0JBQWtCLGNBQWM7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtCQUFrQixjQUFjO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxrQkFBa0IsYUFBYTtBQUMvQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLGlFQUFlLEdBQUc7Ozs7Ozs7Ozs7Ozs7OztBQ3RObEIsaUVBQWUsc0NBQXNDOzs7Ozs7Ozs7Ozs7Ozs7O0FDQWhCOztBQUVyQztBQUNBLE9BQU8sd0RBQVE7QUFDZjtBQUNBOztBQUVBO0FBQ0EsZ0NBQWdDOztBQUVoQztBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7O0FBRXJCO0FBQ0EscUJBQXFCOztBQUVyQjtBQUNBLHFCQUFxQjs7QUFFckI7QUFDQSxxQkFBcUI7QUFDckI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpRUFBZSxLQUFLOzs7Ozs7Ozs7Ozs7Ozs7QUNsQ3BCLGlFQUFlLGNBQWMsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLFVBQVUsR0FBRyx5Q0FBeUM7Ozs7Ozs7Ozs7Ozs7OztBQ0FwSTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2U7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxtREFBbUQ7O0FBRW5EOztBQUVBLG9CQUFvQixnQkFBZ0I7QUFDcEM7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsbUJBQW1CLFFBQVE7QUFDM0I7O0FBRUEsb0JBQW9CLFFBQVE7QUFDNUI7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxvQkFBb0IsU0FBUztBQUM3Qjs7QUFFQSxvQkFBb0IsUUFBUTtBQUM1QjtBQUNBOztBQUVBLHNCQUFzQixTQUFTO0FBQy9CO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxzQkFBc0IsVUFBVTtBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLGlFQUFlLElBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7QUMvRmtCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLGdCQUFnQixTQUFTO0FBQ3pCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwZ0JBQTBnQjtBQUMxZ0I7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBTyx3REFBUTtBQUNmO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxpRUFBZSxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7OztBQzdCRztBQUNZLENBQUM7QUFDeEM7QUFDQTtBQUNBOztBQUVBOztBQUVBLGVBQWU7OztBQUdmO0FBQ0Esb0JBQW9COztBQUVwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0ZBQWdGO0FBQ2hGO0FBQ0E7O0FBRUE7QUFDQSxzREFBc0QsK0NBQUc7O0FBRXpEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7O0FBR0Esd0VBQXdFO0FBQ3hFOztBQUVBLDRFQUE0RTs7QUFFNUUsOERBQThEOztBQUU5RDtBQUNBO0FBQ0EsSUFBSTtBQUNKOzs7QUFHQTtBQUNBO0FBQ0EsSUFBSTs7O0FBR0o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx3QkFBd0I7O0FBRXhCLDJCQUEyQjs7QUFFM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0I7O0FBRXRCO0FBQ0E7QUFDQSx1QkFBdUI7O0FBRXZCLG9DQUFvQzs7QUFFcEMsOEJBQThCOztBQUU5QixrQ0FBa0M7O0FBRWxDLDRCQUE0Qjs7QUFFNUIsa0JBQWtCLE9BQU87QUFDekI7QUFDQTs7QUFFQSxnQkFBZ0IseURBQVM7QUFDekI7O0FBRUEsaUVBQWUsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM5RlU7QUFDQTtBQUMzQixTQUFTLG1EQUFHLGFBQWEsK0NBQUc7QUFDNUIsaUVBQWUsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0hzQjtBQUNSOztBQUUvQjtBQUNBLDJDQUEyQzs7QUFFM0M7O0FBRUEsa0JBQWtCLGdCQUFnQjtBQUNsQztBQUNBOztBQUVBO0FBQ0E7O0FBRU87QUFDQTtBQUNQLDZCQUFlLG9DQUFVO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esa0JBQWtCLHFEQUFLO0FBQ3ZCOztBQUVBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsc0JBQXNCLFFBQVE7QUFDOUI7QUFDQTs7QUFFQTtBQUNBOztBQUVBLFdBQVcseURBQVM7QUFDcEIsSUFBSTs7O0FBR0o7QUFDQSw4QkFBOEI7QUFDOUIsSUFBSSxlQUFlOzs7QUFHbkI7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDL0QyQjtBQUNZOztBQUV2QztBQUNBO0FBQ0EsK0NBQStDLCtDQUFHLEtBQUs7O0FBRXZEO0FBQ0EsbUNBQW1DOztBQUVuQztBQUNBOztBQUVBLG9CQUFvQixRQUFRO0FBQzVCO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxTQUFTLHlEQUFTO0FBQ2xCOztBQUVBLGlFQUFlLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdkJVO0FBQ0U7QUFDN0IsU0FBUyxtREFBRyxhQUFhLGdEQUFJO0FBQzdCLGlFQUFlLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7QUNIYzs7QUFFL0I7QUFDQSxxQ0FBcUMsc0RBQVU7QUFDL0M7O0FBRUEsaUVBQWUsUUFBUTs7Ozs7Ozs7Ozs7Ozs7OztBQ05jOztBQUVyQztBQUNBLE9BQU8sd0RBQVE7QUFDZjtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsaUVBQWUsT0FBTzs7Ozs7Ozs7OztBQ1Z0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTtBQUNBLG9CQUFvQixpQkFBaUI7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7VUNoQ0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1VFTkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL0BhY3Rpb25zL2FydGlmYWN0L2xpYi9hcnRpZmFjdC1jbGllbnQuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9hcnRpZmFjdC9saWIvaW50ZXJuYWwvYXJ0aWZhY3QtY2xpZW50LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvQGFjdGlvbnMvYXJ0aWZhY3QvbGliL2ludGVybmFsL2NvbmZpZy12YXJpYWJsZXMuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9hcnRpZmFjdC9saWIvaW50ZXJuYWwvY3JjNjQuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9hcnRpZmFjdC9saWIvaW50ZXJuYWwvZG93bmxvYWQtaHR0cC1jbGllbnQuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9hcnRpZmFjdC9saWIvaW50ZXJuYWwvZG93bmxvYWQtc3BlY2lmaWNhdGlvbi5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL0BhY3Rpb25zL2FydGlmYWN0L2xpYi9pbnRlcm5hbC9odHRwLW1hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9hcnRpZmFjdC9saWIvaW50ZXJuYWwvcGF0aC1hbmQtYXJ0aWZhY3QtbmFtZS12YWxpZGF0aW9uLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvQGFjdGlvbnMvYXJ0aWZhY3QvbGliL2ludGVybmFsL3JlcXVlc3RVdGlscy5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL0BhY3Rpb25zL2FydGlmYWN0L2xpYi9pbnRlcm5hbC9zdGF0dXMtcmVwb3J0ZXIuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9hcnRpZmFjdC9saWIvaW50ZXJuYWwvdXBsb2FkLWd6aXAuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9hcnRpZmFjdC9saWIvaW50ZXJuYWwvdXBsb2FkLWh0dHAtY2xpZW50LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvQGFjdGlvbnMvYXJ0aWZhY3QvbGliL2ludGVybmFsL3VwbG9hZC1zcGVjaWZpY2F0aW9uLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvQGFjdGlvbnMvYXJ0aWZhY3QvbGliL2ludGVybmFsL3V0aWxzLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvQGFjdGlvbnMvY29yZS9saWIvY29tbWFuZC5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL0BhY3Rpb25zL2NvcmUvbGliL2NvcmUuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9jb3JlL2xpYi9maWxlLWNvbW1hbmQuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9jb3JlL2xpYi9vaWRjLXV0aWxzLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvQGFjdGlvbnMvY29yZS9saWIvcGF0aC11dGlscy5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL0BhY3Rpb25zL2NvcmUvbGliL3N1bW1hcnkuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9AYWN0aW9ucy9jb3JlL2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL0BhY3Rpb25zL2h0dHAtY2xpZW50L2xpYi9hdXRoLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvQGFjdGlvbnMvaHR0cC1jbGllbnQvbGliL2luZGV4LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvQGFjdGlvbnMvaHR0cC1jbGllbnQvbGliL3Byb3h5LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvYmFsYW5jZWQtbWF0Y2gvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9icmFjZS1leHBhbnNpb24vaW5kZXguanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9jb25jYXQtbWFwL2luZGV4LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL2ZzLnJlYWxwYXRoL2luZGV4LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvZnMucmVhbHBhdGgvb2xkLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvZ2xvYi9jb21tb24uanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9nbG9iL2dsb2IuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9nbG9iL3N5bmMuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9pbmZsaWdodC9pbmZsaWdodC5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy9taW5pbWF0Y2gvbWluaW1hdGNoLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvb25jZS9vbmNlLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvcGF0aC1pcy1hYnNvbHV0ZS9pbmRleC5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL3JpbXJhZi9yaW1yYWYuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy90bXAtcHJvbWlzZS9pbmRleC5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL3RtcC9saWIvdG1wLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy90dW5uZWwvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy90dW5uZWwvbGliL3R1bm5lbC5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9pbmRleC5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9tZDUuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvbmlsLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3BhcnNlLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3JlZ2V4LmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3JuZy5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9zaGExLmpzIiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3N0cmluZ2lmeS5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci92MS5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci92My5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci92MzUuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjQuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjUuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdmFsaWRhdGUuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdmVyc2lvbi5qcyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uLy4vbm9kZV9tb2R1bGVzL3dyYXBweS93cmFwcHkuanMiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vdmVyYWNvZGUtY29udGFpbmVyLXNjYW5uaW5nLWFjdGlvbi93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3ZlcmFjb2RlLWNvbnRhaW5lci1zY2FubmluZy1hY3Rpb24vd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly92ZXJhY29kZS1jb250YWluZXItc2Nhbm5pbmctYWN0aW9uL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuY3JlYXRlID0gdm9pZCAwO1xuY29uc3QgYXJ0aWZhY3RfY2xpZW50XzEgPSByZXF1aXJlKFwiLi9pbnRlcm5hbC9hcnRpZmFjdC1jbGllbnRcIik7XG4vKipcbiAqIENvbnN0cnVjdHMgYW4gQXJ0aWZhY3RDbGllbnRcbiAqL1xuZnVuY3Rpb24gY3JlYXRlKCkge1xuICAgIHJldHVybiBhcnRpZmFjdF9jbGllbnRfMS5EZWZhdWx0QXJ0aWZhY3RDbGllbnQuY3JlYXRlKCk7XG59XG5leHBvcnRzLmNyZWF0ZSA9IGNyZWF0ZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFydGlmYWN0LWNsaWVudC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX3NldE1vZHVsZURlZmF1bHQpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XG59KTtcbnZhciBfX2ltcG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0U3RhcikgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChrICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuRGVmYXVsdEFydGlmYWN0Q2xpZW50ID0gdm9pZCAwO1xuY29uc3QgY29yZSA9IF9faW1wb3J0U3RhcihyZXF1aXJlKFwiQGFjdGlvbnMvY29yZVwiKSk7XG5jb25zdCB1cGxvYWRfc3BlY2lmaWNhdGlvbl8xID0gcmVxdWlyZShcIi4vdXBsb2FkLXNwZWNpZmljYXRpb25cIik7XG5jb25zdCB1cGxvYWRfaHR0cF9jbGllbnRfMSA9IHJlcXVpcmUoXCIuL3VwbG9hZC1odHRwLWNsaWVudFwiKTtcbmNvbnN0IHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbmNvbnN0IHBhdGhfYW5kX2FydGlmYWN0X25hbWVfdmFsaWRhdGlvbl8xID0gcmVxdWlyZShcIi4vcGF0aC1hbmQtYXJ0aWZhY3QtbmFtZS12YWxpZGF0aW9uXCIpO1xuY29uc3QgZG93bmxvYWRfaHR0cF9jbGllbnRfMSA9IHJlcXVpcmUoXCIuL2Rvd25sb2FkLWh0dHAtY2xpZW50XCIpO1xuY29uc3QgZG93bmxvYWRfc3BlY2lmaWNhdGlvbl8xID0gcmVxdWlyZShcIi4vZG93bmxvYWQtc3BlY2lmaWNhdGlvblwiKTtcbmNvbnN0IGNvbmZpZ192YXJpYWJsZXNfMSA9IHJlcXVpcmUoXCIuL2NvbmZpZy12YXJpYWJsZXNcIik7XG5jb25zdCBwYXRoXzEgPSByZXF1aXJlKFwicGF0aFwiKTtcbmNsYXNzIERlZmF1bHRBcnRpZmFjdENsaWVudCB7XG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0cyBhIERlZmF1bHRBcnRpZmFjdENsaWVudFxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGVmYXVsdEFydGlmYWN0Q2xpZW50KCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVwbG9hZHMgYW4gYXJ0aWZhY3RcbiAgICAgKi9cbiAgICB1cGxvYWRBcnRpZmFjdChuYW1lLCBmaWxlcywgcm9vdERpcmVjdG9yeSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29yZS5pbmZvKGBTdGFydGluZyBhcnRpZmFjdCB1cGxvYWRcbkZvciBtb3JlIGRldGFpbGVkIGxvZ3MgZHVyaW5nIHRoZSBhcnRpZmFjdCB1cGxvYWQgcHJvY2VzcywgZW5hYmxlIHN0ZXAtZGVidWdnaW5nOiBodHRwczovL2RvY3MuZ2l0aHViLmNvbS9hY3Rpb25zL21vbml0b3JpbmctYW5kLXRyb3VibGVzaG9vdGluZy13b3JrZmxvd3MvZW5hYmxpbmctZGVidWctbG9nZ2luZyNlbmFibGluZy1zdGVwLWRlYnVnLWxvZ2dpbmdgKTtcbiAgICAgICAgICAgIHBhdGhfYW5kX2FydGlmYWN0X25hbWVfdmFsaWRhdGlvbl8xLmNoZWNrQXJ0aWZhY3ROYW1lKG5hbWUpO1xuICAgICAgICAgICAgLy8gR2V0IHNwZWNpZmljYXRpb24gZm9yIHRoZSBmaWxlcyBiZWluZyB1cGxvYWRlZFxuICAgICAgICAgICAgY29uc3QgdXBsb2FkU3BlY2lmaWNhdGlvbiA9IHVwbG9hZF9zcGVjaWZpY2F0aW9uXzEuZ2V0VXBsb2FkU3BlY2lmaWNhdGlvbihuYW1lLCByb290RGlyZWN0b3J5LCBmaWxlcyk7XG4gICAgICAgICAgICBjb25zdCB1cGxvYWRSZXNwb25zZSA9IHtcbiAgICAgICAgICAgICAgICBhcnRpZmFjdE5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgYXJ0aWZhY3RJdGVtczogW10sXG4gICAgICAgICAgICAgICAgc2l6ZTogMCxcbiAgICAgICAgICAgICAgICBmYWlsZWRJdGVtczogW11cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCB1cGxvYWRIdHRwQ2xpZW50ID0gbmV3IHVwbG9hZF9odHRwX2NsaWVudF8xLlVwbG9hZEh0dHBDbGllbnQoKTtcbiAgICAgICAgICAgIGlmICh1cGxvYWRTcGVjaWZpY2F0aW9uLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvcmUud2FybmluZyhgTm8gZmlsZXMgZm91bmQgdGhhdCBjYW4gYmUgdXBsb2FkZWRgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhbiBlbnRyeSBmb3IgdGhlIGFydGlmYWN0IGluIHRoZSBmaWxlIGNvbnRhaW5lclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0geWllbGQgdXBsb2FkSHR0cENsaWVudC5jcmVhdGVBcnRpZmFjdEluRmlsZUNvbnRhaW5lcihuYW1lLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlLmZpbGVDb250YWluZXJSZXNvdXJjZVVybCkge1xuICAgICAgICAgICAgICAgICAgICBjb3JlLmRlYnVnKHJlc3BvbnNlLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIFVSTCBwcm92aWRlZCBieSB0aGUgQXJ0aWZhY3QgU2VydmljZSB0byB1cGxvYWQgYW4gYXJ0aWZhY3QgdG8nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29yZS5kZWJ1ZyhgVXBsb2FkIFJlc291cmNlIFVSTDogJHtyZXNwb25zZS5maWxlQ29udGFpbmVyUmVzb3VyY2VVcmx9YCk7XG4gICAgICAgICAgICAgICAgY29yZS5pbmZvKGBDb250YWluZXIgZm9yIGFydGlmYWN0IFwiJHtuYW1lfVwiIHN1Y2Nlc3NmdWxseSBjcmVhdGVkLiBTdGFydGluZyB1cGxvYWQgb2YgZmlsZShzKWApO1xuICAgICAgICAgICAgICAgIC8vIFVwbG9hZCBlYWNoIG9mIHRoZSBmaWxlcyB0aGF0IHdlcmUgZm91bmQgY29uY3VycmVudGx5XG4gICAgICAgICAgICAgICAgY29uc3QgdXBsb2FkUmVzdWx0ID0geWllbGQgdXBsb2FkSHR0cENsaWVudC51cGxvYWRBcnRpZmFjdFRvRmlsZUNvbnRhaW5lcihyZXNwb25zZS5maWxlQ29udGFpbmVyUmVzb3VyY2VVcmwsIHVwbG9hZFNwZWNpZmljYXRpb24sIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgc2l6ZSBvZiB0aGUgYXJ0aWZhY3QgdG8gaW5kaWNhdGUgd2UgYXJlIGRvbmUgdXBsb2FkaW5nXG4gICAgICAgICAgICAgICAgLy8gVGhlIHVuY29tcHJlc3NlZCBzaXplIGlzIHVzZWQgZm9yIGRpc3BsYXkgd2hlbiBkb3dubG9hZGluZyBhIHppcCBvZiB0aGUgYXJ0aWZhY3QgZnJvbSB0aGUgVUlcbiAgICAgICAgICAgICAgICBjb3JlLmluZm8oYEZpbGUgdXBsb2FkIHByb2Nlc3MgaGFzIGZpbmlzaGVkLiBGaW5hbGl6aW5nIHRoZSBhcnRpZmFjdCB1cGxvYWRgKTtcbiAgICAgICAgICAgICAgICB5aWVsZCB1cGxvYWRIdHRwQ2xpZW50LnBhdGNoQXJ0aWZhY3RTaXplKHVwbG9hZFJlc3VsdC50b3RhbFNpemUsIG5hbWUpO1xuICAgICAgICAgICAgICAgIGlmICh1cGxvYWRSZXN1bHQuZmFpbGVkSXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb3JlLmluZm8oYFVwbG9hZCBmaW5pc2hlZC4gVGhlcmUgd2VyZSAke3VwbG9hZFJlc3VsdC5mYWlsZWRJdGVtcy5sZW5ndGh9IGl0ZW1zIHRoYXQgZmFpbGVkIHRvIHVwbG9hZGApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29yZS5pbmZvKGBBcnRpZmFjdCBoYXMgYmVlbiBmaW5hbGl6ZWQuIEFsbCBmaWxlcyBoYXZlIGJlZW4gc3VjY2Vzc2Z1bGx5IHVwbG9hZGVkIWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb3JlLmluZm8oYFxuVGhlIHJhdyBzaXplIG9mIGFsbCB0aGUgZmlsZXMgdGhhdCB3ZXJlIHNwZWNpZmllZCBmb3IgdXBsb2FkIGlzICR7dXBsb2FkUmVzdWx0LnRvdGFsU2l6ZX0gYnl0ZXNcblRoZSBzaXplIG9mIGFsbCB0aGUgZmlsZXMgdGhhdCB3ZXJlIHVwbG9hZGVkIGlzICR7dXBsb2FkUmVzdWx0LnVwbG9hZFNpemV9IGJ5dGVzLiBUaGlzIHRha2VzIGludG8gYWNjb3VudCBhbnkgZ3ppcCBjb21wcmVzc2lvbiB1c2VkIHRvIHJlZHVjZSB0aGUgdXBsb2FkIHNpemUsIHRpbWUgYW5kIHN0b3JhZ2VcblxuTm90ZTogVGhlIHNpemUgb2YgZG93bmxvYWRlZCB6aXBzIGNhbiBkaWZmZXIgc2lnbmlmaWNhbnRseSBmcm9tIHRoZSByZXBvcnRlZCBzaXplLiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hY3Rpb25zL3VwbG9hZC1hcnRpZmFjdCN6aXBwZWQtYXJ0aWZhY3QtZG93bmxvYWRzIFxcclxcbmApO1xuICAgICAgICAgICAgICAgIHVwbG9hZFJlc3BvbnNlLmFydGlmYWN0SXRlbXMgPSB1cGxvYWRTcGVjaWZpY2F0aW9uLm1hcChpdGVtID0+IGl0ZW0uYWJzb2x1dGVGaWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgdXBsb2FkUmVzcG9uc2Uuc2l6ZSA9IHVwbG9hZFJlc3VsdC51cGxvYWRTaXplO1xuICAgICAgICAgICAgICAgIHVwbG9hZFJlc3BvbnNlLmZhaWxlZEl0ZW1zID0gdXBsb2FkUmVzdWx0LmZhaWxlZEl0ZW1zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHVwbG9hZFJlc3BvbnNlO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZG93bmxvYWRBcnRpZmFjdChuYW1lLCBwYXRoLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCBkb3dubG9hZEh0dHBDbGllbnQgPSBuZXcgZG93bmxvYWRfaHR0cF9jbGllbnRfMS5Eb3dubG9hZEh0dHBDbGllbnQoKTtcbiAgICAgICAgICAgIGNvbnN0IGFydGlmYWN0cyA9IHlpZWxkIGRvd25sb2FkSHR0cENsaWVudC5saXN0QXJ0aWZhY3RzKCk7XG4gICAgICAgICAgICBpZiAoYXJ0aWZhY3RzLmNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gZmluZCBhbnkgYXJ0aWZhY3RzIGZvciB0aGUgYXNzb2NpYXRlZCB3b3JrZmxvd2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgYXJ0aWZhY3RUb0Rvd25sb2FkID0gYXJ0aWZhY3RzLnZhbHVlLmZpbmQoYXJ0aWZhY3QgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBhcnRpZmFjdC5uYW1lID09PSBuYW1lO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIWFydGlmYWN0VG9Eb3dubG9hZCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGZpbmQgYW4gYXJ0aWZhY3Qgd2l0aCB0aGUgbmFtZTogJHtuYW1lfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgaXRlbXMgPSB5aWVsZCBkb3dubG9hZEh0dHBDbGllbnQuZ2V0Q29udGFpbmVySXRlbXMoYXJ0aWZhY3RUb0Rvd25sb2FkLm5hbWUsIGFydGlmYWN0VG9Eb3dubG9hZC5maWxlQ29udGFpbmVyUmVzb3VyY2VVcmwpO1xuICAgICAgICAgICAgaWYgKCFwYXRoKSB7XG4gICAgICAgICAgICAgICAgcGF0aCA9IGNvbmZpZ192YXJpYWJsZXNfMS5nZXRXb3JrU3BhY2VEaXJlY3RvcnkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhdGggPSBwYXRoXzEubm9ybWFsaXplKHBhdGgpO1xuICAgICAgICAgICAgcGF0aCA9IHBhdGhfMS5yZXNvbHZlKHBhdGgpO1xuICAgICAgICAgICAgLy8gRHVyaW5nIHVwbG9hZCwgZW1wdHkgZGlyZWN0b3JpZXMgYXJlIHJlamVjdGVkIGJ5IHRoZSByZW1vdGUgc2VydmVyIHNvIHRoZXJlIHNob3VsZCBiZSBubyBhcnRpZmFjdHMgdGhhdCBjb25zaXN0IG9mIG9ubHkgZW1wdHkgZGlyZWN0b3JpZXNcbiAgICAgICAgICAgIGNvbnN0IGRvd25sb2FkU3BlY2lmaWNhdGlvbiA9IGRvd25sb2FkX3NwZWNpZmljYXRpb25fMS5nZXREb3dubG9hZFNwZWNpZmljYXRpb24obmFtZSwgaXRlbXMudmFsdWUsIHBhdGgsIChvcHRpb25zID09PSBudWxsIHx8IG9wdGlvbnMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9wdGlvbnMuY3JlYXRlQXJ0aWZhY3RGb2xkZXIpIHx8IGZhbHNlKTtcbiAgICAgICAgICAgIGlmIChkb3dubG9hZFNwZWNpZmljYXRpb24uZmlsZXNUb0Rvd25sb2FkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvcmUuaW5mbyhgTm8gZG93bmxvYWRhYmxlIGZpbGVzIHdlcmUgZm91bmQgZm9yIHRoZSBhcnRpZmFjdDogJHthcnRpZmFjdFRvRG93bmxvYWQubmFtZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhbGwgbmVjZXNzYXJ5IGRpcmVjdG9yaWVzIHJlY3Vyc2l2ZWx5IGJlZm9yZSBzdGFydGluZyBhbnkgZG93bmxvYWRcbiAgICAgICAgICAgICAgICB5aWVsZCB1dGlsc18xLmNyZWF0ZURpcmVjdG9yaWVzRm9yQXJ0aWZhY3QoZG93bmxvYWRTcGVjaWZpY2F0aW9uLmRpcmVjdG9yeVN0cnVjdHVyZSk7XG4gICAgICAgICAgICAgICAgY29yZS5pbmZvKCdEaXJlY3Rvcnkgc3RydWN0dXJlIGhhcyBiZWVuIHNldHVwIGZvciB0aGUgYXJ0aWZhY3QnKTtcbiAgICAgICAgICAgICAgICB5aWVsZCB1dGlsc18xLmNyZWF0ZUVtcHR5RmlsZXNGb3JBcnRpZmFjdChkb3dubG9hZFNwZWNpZmljYXRpb24uZW1wdHlGaWxlc1RvQ3JlYXRlKTtcbiAgICAgICAgICAgICAgICB5aWVsZCBkb3dubG9hZEh0dHBDbGllbnQuZG93bmxvYWRTaW5nbGVBcnRpZmFjdChkb3dubG9hZFNwZWNpZmljYXRpb24uZmlsZXNUb0Rvd25sb2FkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYXJ0aWZhY3ROYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgIGRvd25sb2FkUGF0aDogZG93bmxvYWRTcGVjaWZpY2F0aW9uLnJvb3REb3dubG9hZExvY2F0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZG93bmxvYWRBbGxBcnRpZmFjdHMocGF0aCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgZG93bmxvYWRIdHRwQ2xpZW50ID0gbmV3IGRvd25sb2FkX2h0dHBfY2xpZW50XzEuRG93bmxvYWRIdHRwQ2xpZW50KCk7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IFtdO1xuICAgICAgICAgICAgY29uc3QgYXJ0aWZhY3RzID0geWllbGQgZG93bmxvYWRIdHRwQ2xpZW50Lmxpc3RBcnRpZmFjdHMoKTtcbiAgICAgICAgICAgIGlmIChhcnRpZmFjdHMuY291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb3JlLmluZm8oJ1VuYWJsZSB0byBmaW5kIGFueSBhcnRpZmFjdHMgZm9yIHRoZSBhc3NvY2lhdGVkIHdvcmtmbG93Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFwYXRoKSB7XG4gICAgICAgICAgICAgICAgcGF0aCA9IGNvbmZpZ192YXJpYWJsZXNfMS5nZXRXb3JrU3BhY2VEaXJlY3RvcnkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhdGggPSBwYXRoXzEubm9ybWFsaXplKHBhdGgpO1xuICAgICAgICAgICAgcGF0aCA9IHBhdGhfMS5yZXNvbHZlKHBhdGgpO1xuICAgICAgICAgICAgbGV0IGRvd25sb2FkZWRBcnRpZmFjdHMgPSAwO1xuICAgICAgICAgICAgd2hpbGUgKGRvd25sb2FkZWRBcnRpZmFjdHMgPCBhcnRpZmFjdHMuY291bnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50QXJ0aWZhY3RUb0Rvd25sb2FkID0gYXJ0aWZhY3RzLnZhbHVlW2Rvd25sb2FkZWRBcnRpZmFjdHNdO1xuICAgICAgICAgICAgICAgIGRvd25sb2FkZWRBcnRpZmFjdHMgKz0gMTtcbiAgICAgICAgICAgICAgICBjb3JlLmluZm8oYHN0YXJ0aW5nIGRvd25sb2FkIG9mIGFydGlmYWN0ICR7Y3VycmVudEFydGlmYWN0VG9Eb3dubG9hZC5uYW1lfSA6ICR7ZG93bmxvYWRlZEFydGlmYWN0c30vJHthcnRpZmFjdHMuY291bnR9YCk7XG4gICAgICAgICAgICAgICAgLy8gR2V0IGNvbnRhaW5lciBlbnRyaWVzIGZvciB0aGUgc3BlY2lmaWMgYXJ0aWZhY3RcbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtcyA9IHlpZWxkIGRvd25sb2FkSHR0cENsaWVudC5nZXRDb250YWluZXJJdGVtcyhjdXJyZW50QXJ0aWZhY3RUb0Rvd25sb2FkLm5hbWUsIGN1cnJlbnRBcnRpZmFjdFRvRG93bmxvYWQuZmlsZUNvbnRhaW5lclJlc291cmNlVXJsKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkb3dubG9hZFNwZWNpZmljYXRpb24gPSBkb3dubG9hZF9zcGVjaWZpY2F0aW9uXzEuZ2V0RG93bmxvYWRTcGVjaWZpY2F0aW9uKGN1cnJlbnRBcnRpZmFjdFRvRG93bmxvYWQubmFtZSwgaXRlbXMudmFsdWUsIHBhdGgsIHRydWUpO1xuICAgICAgICAgICAgICAgIGlmIChkb3dubG9hZFNwZWNpZmljYXRpb24uZmlsZXNUb0Rvd25sb2FkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb3JlLmluZm8oYE5vIGRvd25sb2FkYWJsZSBmaWxlcyB3ZXJlIGZvdW5kIGZvciBhbnkgYXJ0aWZhY3QgJHtjdXJyZW50QXJ0aWZhY3RUb0Rvd25sb2FkLm5hbWV9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCB1dGlsc18xLmNyZWF0ZURpcmVjdG9yaWVzRm9yQXJ0aWZhY3QoZG93bmxvYWRTcGVjaWZpY2F0aW9uLmRpcmVjdG9yeVN0cnVjdHVyZSk7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIHV0aWxzXzEuY3JlYXRlRW1wdHlGaWxlc0ZvckFydGlmYWN0KGRvd25sb2FkU3BlY2lmaWNhdGlvbi5lbXB0eUZpbGVzVG9DcmVhdGUpO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCBkb3dubG9hZEh0dHBDbGllbnQuZG93bmxvYWRTaW5nbGVBcnRpZmFjdChkb3dubG9hZFNwZWNpZmljYXRpb24uZmlsZXNUb0Rvd25sb2FkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGFydGlmYWN0TmFtZTogY3VycmVudEFydGlmYWN0VG9Eb3dubG9hZC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBkb3dubG9hZFBhdGg6IGRvd25sb2FkU3BlY2lmaWNhdGlvbi5yb290RG93bmxvYWRMb2NhdGlvblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLkRlZmF1bHRBcnRpZmFjdENsaWVudCA9IERlZmF1bHRBcnRpZmFjdENsaWVudDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFydGlmYWN0LWNsaWVudC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZ2V0UmV0ZW50aW9uRGF5cyA9IGV4cG9ydHMuZ2V0V29ya1NwYWNlRGlyZWN0b3J5ID0gZXhwb3J0cy5nZXRXb3JrRmxvd1J1bklkID0gZXhwb3J0cy5nZXRSdW50aW1lVXJsID0gZXhwb3J0cy5nZXRSdW50aW1lVG9rZW4gPSBleHBvcnRzLmdldERvd25sb2FkRmlsZUNvbmN1cnJlbmN5ID0gZXhwb3J0cy5nZXRJbml0aWFsUmV0cnlJbnRlcnZhbEluTWlsbGlzZWNvbmRzID0gZXhwb3J0cy5nZXRSZXRyeU11bHRpcGxpZXIgPSBleHBvcnRzLmdldFJldHJ5TGltaXQgPSBleHBvcnRzLmdldFVwbG9hZENodW5rU2l6ZSA9IGV4cG9ydHMuZ2V0VXBsb2FkRmlsZUNvbmN1cnJlbmN5ID0gdm9pZCAwO1xuLy8gVGhlIG51bWJlciBvZiBjb25jdXJyZW50IHVwbG9hZHMgdGhhdCBoYXBwZW5zIGF0IHRoZSBzYW1lIHRpbWVcbmZ1bmN0aW9uIGdldFVwbG9hZEZpbGVDb25jdXJyZW5jeSgpIHtcbiAgICByZXR1cm4gMjtcbn1cbmV4cG9ydHMuZ2V0VXBsb2FkRmlsZUNvbmN1cnJlbmN5ID0gZ2V0VXBsb2FkRmlsZUNvbmN1cnJlbmN5O1xuLy8gV2hlbiB1cGxvYWRpbmcgbGFyZ2UgZmlsZXMgdGhhdCBjYW4ndCBiZSB1cGxvYWRlZCB3aXRoIGEgc2luZ2xlIGh0dHAgY2FsbCwgdGhpcyBjb250cm9sc1xuLy8gdGhlIGNodW5rIHNpemUgdGhhdCBpcyB1c2VkIGR1cmluZyB1cGxvYWRcbmZ1bmN0aW9uIGdldFVwbG9hZENodW5rU2l6ZSgpIHtcbiAgICByZXR1cm4gOCAqIDEwMjQgKiAxMDI0OyAvLyA4IE1CIENodW5rc1xufVxuZXhwb3J0cy5nZXRVcGxvYWRDaHVua1NpemUgPSBnZXRVcGxvYWRDaHVua1NpemU7XG4vLyBUaGUgbWF4aW11bSBudW1iZXIgb2YgcmV0cmllcyB0aGF0IGNhbiBiZSBhdHRlbXB0ZWQgYmVmb3JlIGFuIHVwbG9hZCBvciBkb3dubG9hZCBmYWlsc1xuZnVuY3Rpb24gZ2V0UmV0cnlMaW1pdCgpIHtcbiAgICByZXR1cm4gNTtcbn1cbmV4cG9ydHMuZ2V0UmV0cnlMaW1pdCA9IGdldFJldHJ5TGltaXQ7XG4vLyBXaXRoIGV4cG9uZW50aWFsIGJhY2tvZmYsIHRoZSBsYXJnZXIgdGhlIHJldHJ5IGNvdW50LCB0aGUgbGFyZ2VyIHRoZSB3YWl0IHRpbWUgYmVmb3JlIGFub3RoZXIgYXR0ZW1wdFxuLy8gVGhlIHJldHJ5IG11bHRpcGxpZXIgY29udHJvbHMgYnkgaG93IG11Y2ggdGhlIGJhY2tPZmYgdGltZSBpbmNyZWFzZXMgZGVwZW5kaW5nIG9uIHRoZSBudW1iZXIgb2YgcmV0cmllc1xuZnVuY3Rpb24gZ2V0UmV0cnlNdWx0aXBsaWVyKCkge1xuICAgIHJldHVybiAxLjU7XG59XG5leHBvcnRzLmdldFJldHJ5TXVsdGlwbGllciA9IGdldFJldHJ5TXVsdGlwbGllcjtcbi8vIFRoZSBpbml0aWFsIHdhaXQgdGltZSBpZiBhbiB1cGxvYWQgb3IgZG93bmxvYWQgZmFpbHMgYW5kIGEgcmV0cnkgaXMgYmVpbmcgYXR0ZW1wdGVkIGZvciB0aGUgZmlyc3QgdGltZVxuZnVuY3Rpb24gZ2V0SW5pdGlhbFJldHJ5SW50ZXJ2YWxJbk1pbGxpc2Vjb25kcygpIHtcbiAgICByZXR1cm4gMzAwMDtcbn1cbmV4cG9ydHMuZ2V0SW5pdGlhbFJldHJ5SW50ZXJ2YWxJbk1pbGxpc2Vjb25kcyA9IGdldEluaXRpYWxSZXRyeUludGVydmFsSW5NaWxsaXNlY29uZHM7XG4vLyBUaGUgbnVtYmVyIG9mIGNvbmN1cnJlbnQgZG93bmxvYWRzIHRoYXQgaGFwcGVucyBhdCB0aGUgc2FtZSB0aW1lXG5mdW5jdGlvbiBnZXREb3dubG9hZEZpbGVDb25jdXJyZW5jeSgpIHtcbiAgICByZXR1cm4gMjtcbn1cbmV4cG9ydHMuZ2V0RG93bmxvYWRGaWxlQ29uY3VycmVuY3kgPSBnZXREb3dubG9hZEZpbGVDb25jdXJyZW5jeTtcbmZ1bmN0aW9uIGdldFJ1bnRpbWVUb2tlbigpIHtcbiAgICBjb25zdCB0b2tlbiA9IHByb2Nlc3MuZW52WydBQ1RJT05TX1JVTlRJTUVfVE9LRU4nXTtcbiAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGdldCBBQ1RJT05TX1JVTlRJTUVfVE9LRU4gZW52IHZhcmlhYmxlJyk7XG4gICAgfVxuICAgIHJldHVybiB0b2tlbjtcbn1cbmV4cG9ydHMuZ2V0UnVudGltZVRva2VuID0gZ2V0UnVudGltZVRva2VuO1xuZnVuY3Rpb24gZ2V0UnVudGltZVVybCgpIHtcbiAgICBjb25zdCBydW50aW1lVXJsID0gcHJvY2Vzcy5lbnZbJ0FDVElPTlNfUlVOVElNRV9VUkwnXTtcbiAgICBpZiAoIXJ1bnRpbWVVcmwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmFibGUgdG8gZ2V0IEFDVElPTlNfUlVOVElNRV9VUkwgZW52IHZhcmlhYmxlJyk7XG4gICAgfVxuICAgIHJldHVybiBydW50aW1lVXJsO1xufVxuZXhwb3J0cy5nZXRSdW50aW1lVXJsID0gZ2V0UnVudGltZVVybDtcbmZ1bmN0aW9uIGdldFdvcmtGbG93UnVuSWQoKSB7XG4gICAgY29uc3Qgd29ya0Zsb3dSdW5JZCA9IHByb2Nlc3MuZW52WydHSVRIVUJfUlVOX0lEJ107XG4gICAgaWYgKCF3b3JrRmxvd1J1bklkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGdldCBHSVRIVUJfUlVOX0lEIGVudiB2YXJpYWJsZScpO1xuICAgIH1cbiAgICByZXR1cm4gd29ya0Zsb3dSdW5JZDtcbn1cbmV4cG9ydHMuZ2V0V29ya0Zsb3dSdW5JZCA9IGdldFdvcmtGbG93UnVuSWQ7XG5mdW5jdGlvbiBnZXRXb3JrU3BhY2VEaXJlY3RvcnkoKSB7XG4gICAgY29uc3Qgd29ya3NwYWNlRGlyZWN0b3J5ID0gcHJvY2Vzcy5lbnZbJ0dJVEhVQl9XT1JLU1BBQ0UnXTtcbiAgICBpZiAoIXdvcmtzcGFjZURpcmVjdG9yeSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBnZXQgR0lUSFVCX1dPUktTUEFDRSBlbnYgdmFyaWFibGUnKTtcbiAgICB9XG4gICAgcmV0dXJuIHdvcmtzcGFjZURpcmVjdG9yeTtcbn1cbmV4cG9ydHMuZ2V0V29ya1NwYWNlRGlyZWN0b3J5ID0gZ2V0V29ya1NwYWNlRGlyZWN0b3J5O1xuZnVuY3Rpb24gZ2V0UmV0ZW50aW9uRGF5cygpIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnZbJ0dJVEhVQl9SRVRFTlRJT05fREFZUyddO1xufVxuZXhwb3J0cy5nZXRSZXRlbnRpb25EYXlzID0gZ2V0UmV0ZW50aW9uRGF5cztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbmZpZy12YXJpYWJsZXMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKipcbiAqIENSQzY0OiBjeWNsaWMgcmVkdW5kYW5jeSBjaGVjaywgNjQtYml0c1xuICpcbiAqIEluIG9yZGVyIHRvIHZhbGlkYXRlIHRoYXQgYXJ0aWZhY3RzIGFyZSBub3QgYmVpbmcgY29ycnVwdGVkIG92ZXIgdGhlIHdpcmUsIHRoaXMgcmVkdW5kYW5jeSBjaGVjayBhbGxvd3MgdXMgdG9cbiAqIHZhbGlkYXRlIHRoYXQgdGhlcmUgd2FzIG5vIGNvcnJ1cHRpb24gZHVyaW5nIHRyYW5zbWlzc2lvbi4gVGhlIGltcGxlbWVudGF0aW9uIGhlcmUgaXMgYmFzZWQgb24gR28ncyBoYXNoL2NyYzY0IHBrZyxcbiAqIGJ1dCB3aXRob3V0IHRoZSBzbGljaW5nLWJ5LTggb3B0aW1pemF0aW9uOiBodHRwczovL2NzLm9wZW5zb3VyY2UuZ29vZ2xlL2dvL2dvLysvbWFzdGVyOnNyYy9oYXNoL2NyYzY0L2NyYzY0LmdvXG4gKlxuICogVGhpcyBpbXBsZW1lbnRhdGlvbiB1c2VzIGEgcHJlZ2VuZXJhdGVkIHRhYmxlIGJhc2VkIG9uIDB4OUE2QzkzMjlBQzRCQzlCNSBhcyB0aGUgcG9seW5vbWlhbCwgdGhlIHNhbWUgcG9seW5vbWlhbCB0aGF0XG4gKiBpcyB1c2VkIGZvciBBenVyZSBTdG9yYWdlOiBodHRwczovL2dpdGh1Yi5jb20vQXp1cmUvYXp1cmUtc3RvcmFnZS1uZXQvYmxvYi9jYmU2MDVmOWZhYTAxYmZjMzAwM2Q3NWZjNWExNmIyZWFjY2ZlMTAyL0xpYi9Db21tb24vQ29yZS9VdGlsL0NyYzY0LmNzI0wyN1xuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vLyB3aGVuIHRyYW5zcGlsZSB0YXJnZXQgaXMgPj0gRVMyMDIwIChhZnRlciBkcm9wcGluZyBub2RlIDEyKSB0aGVzZSBjYW4gYmUgY2hhbmdlZCB0byBiaWdpbnQgbGl0ZXJhbHMgLSB0cygyNzM3KVxuY29uc3QgUFJFR0VOX1BPTFlfVEFCTEUgPSBbXG4gICAgQmlnSW50KCcweDAwMDAwMDAwMDAwMDAwMDAnKSxcbiAgICBCaWdJbnQoJzB4N0Y2RUYwQzgzMDM1ODk3OScpLFxuICAgIEJpZ0ludCgnMHhGRURERTE5MDYwNkIxMkYyJyksXG4gICAgQmlnSW50KCcweDgxQjMxMTU4NTA1RTlCOEInKSxcbiAgICBCaWdJbnQoJzB4Qzk2MkU1NzM5ODQxQjY4RicpLFxuICAgIEJpZ0ludCgnMHhCNjBDMTVCQkE4NzQzRkY2JyksXG4gICAgQmlnSW50KCcweDM3QkYwNEUzRjgyQUE0N0QnKSxcbiAgICBCaWdJbnQoJzB4NDhEMUY0MkJDODFGMkQwNCcpLFxuICAgIEJpZ0ludCgnMHhBNjFDRUNCNDY4MTRGRTc1JyksXG4gICAgQmlnSW50KCcweEQ5NzIxQzdDNTgyMTc3MEMnKSxcbiAgICBCaWdJbnQoJzB4NThDMTBEMjQwODdGRUM4NycpLFxuICAgIEJpZ0ludCgnMHgyN0FGRkRFQzM4NEE2NUZFJyksXG4gICAgQmlnSW50KCcweDZGN0UwOUM3RjA1NTQ4RkEnKSxcbiAgICBCaWdJbnQoJzB4MTAxMEY5MEZDMDYwQzE4MycpLFxuICAgIEJpZ0ludCgnMHg5MUEzRTg1NzkwM0U1QTA4JyksXG4gICAgQmlnSW50KCcweEVFQ0QxODlGQTAwQkQzNzEnKSxcbiAgICBCaWdJbnQoJzB4NzhFMEZGM0I4OEJFNkY4MScpLFxuICAgIEJpZ0ludCgnMHgwNzhFMEZGM0I4OEJFNkY4JyksXG4gICAgQmlnSW50KCcweDg2M0QxRUFCRThENTdENzMnKSxcbiAgICBCaWdJbnQoJzB4Rjk1M0VFNjNEOEUwRjQwQScpLFxuICAgIEJpZ0ludCgnMHhCMTgyMUE0ODEwRkZEOTBFJyksXG4gICAgQmlnSW50KCcweENFRUNFQTgwMjBDQTUwNzcnKSxcbiAgICBCaWdJbnQoJzB4NEY1RkZCRDg3MDk0Q0JGQycpLFxuICAgIEJpZ0ludCgnMHgzMDMxMEIxMDQwQTE0Mjg1JyksXG4gICAgQmlnSW50KCcweERFRkMxMzhGRTBBQTkxRjQnKSxcbiAgICBCaWdJbnQoJzB4QTE5MkUzNDdEMDlGMTg4RCcpLFxuICAgIEJpZ0ludCgnMHgyMDIxRjIxRjgwQzE4MzA2JyksXG4gICAgQmlnSW50KCcweDVGNEYwMkQ3QjBGNDBBN0YnKSxcbiAgICBCaWdJbnQoJzB4MTc5RUY2RkM3OEVCMjc3QicpLFxuICAgIEJpZ0ludCgnMHg2OEYwMDYzNDQ4REVBRTAyJyksXG4gICAgQmlnSW50KCcweEU5NDMxNzZDMTg4MDM1ODknKSxcbiAgICBCaWdJbnQoJzB4OTYyREU3QTQyOEI1QkNGMCcpLFxuICAgIEJpZ0ludCgnMHhGMUMxRkU3NzExN0NERjAyJyksXG4gICAgQmlnSW50KCcweDhFQUYwRUJGMjE0OTU2N0InKSxcbiAgICBCaWdJbnQoJzB4MEYxQzFGRTc3MTE3Q0RGMCcpLFxuICAgIEJpZ0ludCgnMHg3MDcyRUYyRjQxMjI0NDg5JyksXG4gICAgQmlnSW50KCcweDM4QTMxQjA0ODkzRDY5OEQnKSxcbiAgICBCaWdJbnQoJzB4NDdDREVCQ0NCOTA4RTBGNCcpLFxuICAgIEJpZ0ludCgnMHhDNjdFRkE5NEU5NTY3QjdGJyksXG4gICAgQmlnSW50KCcweEI5MTAwQTVDRDk2M0YyMDYnKSxcbiAgICBCaWdJbnQoJzB4NTdERDEyQzM3OTY4MjE3NycpLFxuICAgIEJpZ0ludCgnMHgyOEIzRTIwQjQ5NURBODBFJyksXG4gICAgQmlnSW50KCcweEE5MDBGMzUzMTkwMzMzODUnKSxcbiAgICBCaWdJbnQoJzB4RDY2RTAzOUIyOTM2QkFGQycpLFxuICAgIEJpZ0ludCgnMHg5RUJGRjdCMEUxMjk5N0Y4JyksXG4gICAgQmlnSW50KCcweEUxRDEwNzc4RDExQzFFODEnKSxcbiAgICBCaWdJbnQoJzB4NjA2MjE2MjA4MTQyODUwQScpLFxuICAgIEJpZ0ludCgnMHgxRjBDRTZFOEIxNzcwQzczJyksXG4gICAgQmlnSW50KCcweDg5MjEwMTRDOTlDMkIwODMnKSxcbiAgICBCaWdJbnQoJzB4RjY0RkYxODRBOUY3MzlGQScpLFxuICAgIEJpZ0ludCgnMHg3N0ZDRTBEQ0Y5QTlBMjcxJyksXG4gICAgQmlnSW50KCcweDA4OTIxMDE0Qzk5QzJCMDgnKSxcbiAgICBCaWdJbnQoJzB4NDA0M0U0M0YwMTgzMDYwQycpLFxuICAgIEJpZ0ludCgnMHgzRjJEMTRGNzMxQjY4Rjc1JyksXG4gICAgQmlnSW50KCcweEJFOUUwNUFGNjFFODE0RkUnKSxcbiAgICBCaWdJbnQoJzB4QzFGMEY1Njc1MUREOUQ4NycpLFxuICAgIEJpZ0ludCgnMHgyRjNERURGOEYxRDY0RUY2JyksXG4gICAgQmlnSW50KCcweDUwNTMxRDMwQzFFM0M3OEYnKSxcbiAgICBCaWdJbnQoJzB4RDFFMDBDNjg5MUJENUMwNCcpLFxuICAgIEJpZ0ludCgnMHhBRThFRkNBMEExODhENTdEJyksXG4gICAgQmlnSW50KCcweEU2NUYwODhCNjk5N0Y4NzknKSxcbiAgICBCaWdJbnQoJzB4OTkzMUY4NDM1OUEyNzEwMCcpLFxuICAgIEJpZ0ludCgnMHgxODgyRTkxQjA5RkNFQThCJyksXG4gICAgQmlnSW50KCcweDY3RUMxOUQzMzlDOTYzRjInKSxcbiAgICBCaWdJbnQoJzB4RDc1QURBQkQ3QTZFMkQ2RicpLFxuICAgIEJpZ0ludCgnMHhBODM0MkE3NTRBNUJBNDE2JyksXG4gICAgQmlnSW50KCcweDI5ODczQjJEMUEwNTNGOUQnKSxcbiAgICBCaWdJbnQoJzB4NTZFOUNCRTUyQTMwQjZFNCcpLFxuICAgIEJpZ0ludCgnMHgxRTM4M0ZDRUUyMkY5QkUwJyksXG4gICAgQmlnSW50KCcweDYxNTZDRjA2RDIxQTEyOTknKSxcbiAgICBCaWdJbnQoJzB4RTBFNURFNUU4MjQ0ODkxMicpLFxuICAgIEJpZ0ludCgnMHg5RjhCMkU5NkIyNzEwMDZCJyksXG4gICAgQmlnSW50KCcweDcxNDYzNjA5MTI3QUQzMUEnKSxcbiAgICBCaWdJbnQoJzB4MEUyOEM2QzEyMjRGNUE2MycpLFxuICAgIEJpZ0ludCgnMHg4RjlCRDc5OTcyMTFDMUU4JyksXG4gICAgQmlnSW50KCcweEYwRjUyNzUxNDIyNDQ4OTEnKSxcbiAgICBCaWdJbnQoJzB4QjgyNEQzN0E4QTNCNjU5NScpLFxuICAgIEJpZ0ludCgnMHhDNzRBMjNCMkJBMEVFQ0VDJyksXG4gICAgQmlnSW50KCcweDQ2RjkzMkVBRUE1MDc3NjcnKSxcbiAgICBCaWdJbnQoJzB4Mzk5N0MyMjJEQTY1RkUxRScpLFxuICAgIEJpZ0ludCgnMHhBRkJBMjU4NkYyRDA0MkVFJyksXG4gICAgQmlnSW50KCcweEQwRDRENTRFQzJFNUNCOTcnKSxcbiAgICBCaWdJbnQoJzB4NTE2N0M0MTY5MkJCNTAxQycpLFxuICAgIEJpZ0ludCgnMHgyRTA5MzRERUEyOEVEOTY1JyksXG4gICAgQmlnSW50KCcweDY2RDhDMEY1NkE5MUY0NjEnKSxcbiAgICBCaWdJbnQoJzB4MTlCNjMwM0Q1QUE0N0QxOCcpLFxuICAgIEJpZ0ludCgnMHg5ODA1MjE2NTBBRkFFNjkzJyksXG4gICAgQmlnSW50KCcweEU3NkJEMUFEM0FDRjZGRUEnKSxcbiAgICBCaWdJbnQoJzB4MDlBNkM5MzI5QUM0QkM5QicpLFxuICAgIEJpZ0ludCgnMHg3NkM4MzlGQUFBRjEzNUUyJyksXG4gICAgQmlnSW50KCcweEY3N0IyOEEyRkFBRkFFNjknKSxcbiAgICBCaWdJbnQoJzB4ODgxNUQ4NkFDQTlBMjcxMCcpLFxuICAgIEJpZ0ludCgnMHhDMEM0MkM0MTAyODUwQTE0JyksXG4gICAgQmlnSW50KCcweEJGQUFEQzg5MzJCMDgzNkQnKSxcbiAgICBCaWdJbnQoJzB4M0UxOUNERDE2MkVFMThFNicpLFxuICAgIEJpZ0ludCgnMHg0MTc3M0QxOTUyREI5MTlGJyksXG4gICAgQmlnSW50KCcweDI2OUIyNENBNkIxMkYyNkQnKSxcbiAgICBCaWdJbnQoJzB4NTlGNUQ0MDI1QjI3N0IxNCcpLFxuICAgIEJpZ0ludCgnMHhEODQ2QzU1QTBCNzlFMDlGJyksXG4gICAgQmlnSW50KCcweEE3MjgzNTkyM0I0QzY5RTYnKSxcbiAgICBCaWdJbnQoJzB4RUZGOUMxQjlGMzUzNDRFMicpLFxuICAgIEJpZ0ludCgnMHg5MDk3MzE3MUMzNjZDRDlCJyksXG4gICAgQmlnSW50KCcweDExMjQyMDI5OTMzODU2MTAnKSxcbiAgICBCaWdJbnQoJzB4NkU0QUQwRTFBMzBEREY2OScpLFxuICAgIEJpZ0ludCgnMHg4MDg3Qzg3RTAzMDYwQzE4JyksXG4gICAgQmlnSW50KCcweEZGRTkzOEI2MzMzMzg1NjEnKSxcbiAgICBCaWdJbnQoJzB4N0U1QTI5RUU2MzZEMUVFQScpLFxuICAgIEJpZ0ludCgnMHgwMTM0RDkyNjUzNTg5NzkzJyksXG4gICAgQmlnSW50KCcweDQ5RTUyRDBEOUI0N0JBOTcnKSxcbiAgICBCaWdJbnQoJzB4MzY4QkREQzVBQjcyMzNFRScpLFxuICAgIEJpZ0ludCgnMHhCNzM4Q0M5REZCMkNBODY1JyksXG4gICAgQmlnSW50KCcweEM4NTYzQzU1Q0IxOTIxMUMnKSxcbiAgICBCaWdJbnQoJzB4NUU3QkRCRjFFM0FDOURFQycpLFxuICAgIEJpZ0ludCgnMHgyMTE1MkIzOUQzOTkxNDk1JyksXG4gICAgQmlnSW50KCcweEEwQTYzQTYxODNDNzhGMUUnKSxcbiAgICBCaWdJbnQoJzB4REZDOENBQTlCM0YyMDY2NycpLFxuICAgIEJpZ0ludCgnMHg5NzE5M0U4MjdCRUQyQjYzJyksXG4gICAgQmlnSW50KCcweEU4NzdDRTRBNEJEOEEyMUEnKSxcbiAgICBCaWdJbnQoJzB4NjlDNERGMTIxQjg2Mzk5MScpLFxuICAgIEJpZ0ludCgnMHgxNkFBMkZEQTJCQjNCMEU4JyksXG4gICAgQmlnSW50KCcweEY4NjczNzQ1OEJCODYzOTknKSxcbiAgICBCaWdJbnQoJzB4ODcwOUM3OERCQjhERUFFMCcpLFxuICAgIEJpZ0ludCgnMHgwNkJBRDZENUVCRDM3MTZCJyksXG4gICAgQmlnSW50KCcweDc5RDQyNjFEREJFNkY4MTInKSxcbiAgICBCaWdJbnQoJzB4MzEwNUQyMzYxM0Y5RDUxNicpLFxuICAgIEJpZ0ludCgnMHg0RTZCMjJGRTIzQ0M1QzZGJyksXG4gICAgQmlnSW50KCcweENGRDgzM0E2NzM5MkM3RTQnKSxcbiAgICBCaWdJbnQoJzB4QjBCNkMzNkU0M0E3NEU5RCcpLFxuICAgIEJpZ0ludCgnMHg5QTZDOTMyOUFDNEJDOUI1JyksXG4gICAgQmlnSW50KCcweEU1MDI2M0UxOUM3RTQwQ0MnKSxcbiAgICBCaWdJbnQoJzB4NjRCMTcyQjlDQzIwREI0NycpLFxuICAgIEJpZ0ludCgnMHgxQkRGODI3MUZDMTU1MjNFJyksXG4gICAgQmlnSW50KCcweDUzMEU3NjVBMzQwQTdGM0EnKSxcbiAgICBCaWdJbnQoJzB4MkM2MDg2OTIwNDNGRjY0MycpLFxuICAgIEJpZ0ludCgnMHhBREQzOTdDQTU0NjE2REM4JyksXG4gICAgQmlnSW50KCcweEQyQkQ2NzAyNjQ1NEU0QjEnKSxcbiAgICBCaWdJbnQoJzB4M0M3MDdGOURDNDVGMzdDMCcpLFxuICAgIEJpZ0ludCgnMHg0MzFFOEY1NUY0NkFCRUI5JyksXG4gICAgQmlnSW50KCcweEMyQUQ5RTBEQTQzNDI1MzInKSxcbiAgICBCaWdJbnQoJzB4QkRDMzZFQzU5NDAxQUM0QicpLFxuICAgIEJpZ0ludCgnMHhGNTEyOUFFRTVDMUU4MTRGJyksXG4gICAgQmlnSW50KCcweDhBN0M2QTI2NkMyQjA4MzYnKSxcbiAgICBCaWdJbnQoJzB4MEJDRjdCN0UzQzc1OTNCRCcpLFxuICAgIEJpZ0ludCgnMHg3NEExOEJCNjBDNDAxQUM0JyksXG4gICAgQmlnSW50KCcweEUyOEM2QzEyMjRGNUE2MzQnKSxcbiAgICBCaWdJbnQoJzB4OURFMjlDREExNEMwMkY0RCcpLFxuICAgIEJpZ0ludCgnMHgxQzUxOEQ4MjQ0OUVCNEM2JyksXG4gICAgQmlnSW50KCcweDYzM0Y3RDRBNzRBQjNEQkYnKSxcbiAgICBCaWdJbnQoJzB4MkJFRTg5NjFCQ0I0MTBCQicpLFxuICAgIEJpZ0ludCgnMHg1NDgwNzlBOThDODE5OUMyJyksXG4gICAgQmlnSW50KCcweEQ1MzM2OEYxRENERjAyNDknKSxcbiAgICBCaWdJbnQoJzB4QUE1RDk4MzlFQ0VBOEIzMCcpLFxuICAgIEJpZ0ludCgnMHg0NDkwODBBNjRDRTE1ODQxJyksXG4gICAgQmlnSW50KCcweDNCRkU3MDZFN0NENEQxMzgnKSxcbiAgICBCaWdJbnQoJzB4QkE0RDYxMzYyQzhBNEFCMycpLFxuICAgIEJpZ0ludCgnMHhDNTIzOTFGRTFDQkZDM0NBJyksXG4gICAgQmlnSW50KCcweDhERjI2NUQ1RDRBMEVFQ0UnKSxcbiAgICBCaWdJbnQoJzB4RjI5Qzk1MURFNDk1NjdCNycpLFxuICAgIEJpZ0ludCgnMHg3MzJGODQ0NUI0Q0JGQzNDJyksXG4gICAgQmlnSW50KCcweDBDNDE3NDhEODRGRTc1NDUnKSxcbiAgICBCaWdJbnQoJzB4NkJBRDZENUVCRDM3MTZCNycpLFxuICAgIEJpZ0ludCgnMHgxNEMzOUQ5NjhEMDI5RkNFJyksXG4gICAgQmlnSW50KCcweDk1NzA4Q0NFREQ1QzA0NDUnKSxcbiAgICBCaWdJbnQoJzB4RUExRTdDMDZFRDY5OEQzQycpLFxuICAgIEJpZ0ludCgnMHhBMkNGODgyRDI1NzZBMDM4JyksXG4gICAgQmlnSW50KCcweEREQTE3OEU1MTU0MzI5NDEnKSxcbiAgICBCaWdJbnQoJzB4NUMxMjY5QkQ0NTFEQjJDQScpLFxuICAgIEJpZ0ludCgnMHgyMzdDOTk3NTc1MjgzQkIzJyksXG4gICAgQmlnSW50KCcweENEQjE4MUVBRDUyM0U4QzInKSxcbiAgICBCaWdJbnQoJzB4QjJERjcxMjJFNTE2NjFCQicpLFxuICAgIEJpZ0ludCgnMHgzMzZDNjA3QUI1NDhGQTMwJyksXG4gICAgQmlnSW50KCcweDRDMDI5MEIyODU3RDczNDknKSxcbiAgICBCaWdJbnQoJzB4MDREMzY0OTk0RDYyNUU0RCcpLFxuICAgIEJpZ0ludCgnMHg3QkJEOTQ1MTdENTdENzM0JyksXG4gICAgQmlnSW50KCcweEZBMEU4NTA5MkQwOTRDQkYnKSxcbiAgICBCaWdJbnQoJzB4ODU2MDc1QzExRDNDQzVDNicpLFxuICAgIEJpZ0ludCgnMHgxMzREOTI2NTM1ODk3OTM2JyksXG4gICAgQmlnSW50KCcweDZDMjM2MkFEMDVCQ0YwNEYnKSxcbiAgICBCaWdJbnQoJzB4RUQ5MDczRjU1NUUyNkJDNCcpLFxuICAgIEJpZ0ludCgnMHg5MkZFODMzRDY1RDdFMkJEJyksXG4gICAgQmlnSW50KCcweERBMkY3NzE2QURDOENGQjknKSxcbiAgICBCaWdJbnQoJzB4QTU0MTg3REU5REZENDZDMCcpLFxuICAgIEJpZ0ludCgnMHgyNEYyOTY4NkNEQTNERDRCJyksXG4gICAgQmlnSW50KCcweDVCOUM2NjRFRkQ5NjU0MzInKSxcbiAgICBCaWdJbnQoJzB4QjU1MTdFRDE1RDlEODc0MycpLFxuICAgIEJpZ0ludCgnMHhDQTNGOEUxOTZEQTgwRTNBJyksXG4gICAgQmlnSW50KCcweDRCOEM5RjQxM0RGNjk1QjEnKSxcbiAgICBCaWdJbnQoJzB4MzRFMjZGODkwREMzMUNDOCcpLFxuICAgIEJpZ0ludCgnMHg3QzMzOUJBMkM1REMzMUNDJyksXG4gICAgQmlnSW50KCcweDAzNUQ2QjZBRjVFOUI4QjUnKSxcbiAgICBCaWdJbnQoJzB4ODJFRTdBMzJBNUI3MjMzRScpLFxuICAgIEJpZ0ludCgnMHhGRDgwOEFGQTk1ODJBQTQ3JyksXG4gICAgQmlnSW50KCcweDREMzY0OTk0RDYyNUU0REEnKSxcbiAgICBCaWdJbnQoJzB4MzI1OEI5NUNFNjEwNkRBMycpLFxuICAgIEJpZ0ludCgnMHhCM0VCQTgwNEI2NEVGNjI4JyksXG4gICAgQmlnSW50KCcweENDODU1OENDODY3QjdGNTEnKSxcbiAgICBCaWdJbnQoJzB4ODQ1NEFDRTc0RTY0NTI1NScpLFxuICAgIEJpZ0ludCgnMHhGQjNBNUMyRjdFNTFEQjJDJyksXG4gICAgQmlnSW50KCcweDdBODk0RDc3MkUwRjQwQTcnKSxcbiAgICBCaWdJbnQoJzB4MDVFN0JEQkYxRTNBQzlERScpLFxuICAgIEJpZ0ludCgnMHhFQjJBQTUyMEJFMzExQUFGJyksXG4gICAgQmlnSW50KCcweDk0NDQ1NUU4OEUwNDkzRDYnKSxcbiAgICBCaWdJbnQoJzB4MTVGNzQ0QjBERTVBMDg1RCcpLFxuICAgIEJpZ0ludCgnMHg2QTk5QjQ3OEVFNkY4MTI0JyksXG4gICAgQmlnSW50KCcweDIyNDg0MDUzMjY3MEFDMjAnKSxcbiAgICBCaWdJbnQoJzB4NUQyNkIwOUIxNjQ1MjU1OScpLFxuICAgIEJpZ0ludCgnMHhEQzk1QTFDMzQ2MUJCRUQyJyksXG4gICAgQmlnSW50KCcweEEzRkI1MTBCNzYyRTM3QUInKSxcbiAgICBCaWdJbnQoJzB4MzVENkI2QUY1RTlCOEI1QicpLFxuICAgIEJpZ0ludCgnMHg0QUI4NDY2NzZFQUUwMjIyJyksXG4gICAgQmlnSW50KCcweENCMEI1NzNGM0VGMDk5QTknKSxcbiAgICBCaWdJbnQoJzB4QjQ2NUE3RjcwRUM1MTBEMCcpLFxuICAgIEJpZ0ludCgnMHhGQ0I0NTNEQ0M2REEzREQ0JyksXG4gICAgQmlnSW50KCcweDgzREFBMzE0RjZFRkI0QUQnKSxcbiAgICBCaWdJbnQoJzB4MDI2OUIyNENBNkIxMkYyNicpLFxuICAgIEJpZ0ludCgnMHg3RDA3NDI4NDk2ODRBNjVGJyksXG4gICAgQmlnSW50KCcweDkzQ0E1QTFCMzY4Rjc1MkUnKSxcbiAgICBCaWdJbnQoJzB4RUNBNEFBRDMwNkJBRkM1NycpLFxuICAgIEJpZ0ludCgnMHg2RDE3QkI4QjU2RTQ2N0RDJyksXG4gICAgQmlnSW50KCcweDEyNzk0QjQzNjZEMUVFQTUnKSxcbiAgICBCaWdJbnQoJzB4NUFBOEJGNjhBRUNFQzNBMScpLFxuICAgIEJpZ0ludCgnMHgyNUM2NEZBMDlFRkI0QUQ4JyksXG4gICAgQmlnSW50KCcweEE0NzU1RUY4Q0VBNUQxNTMnKSxcbiAgICBCaWdJbnQoJzB4REIxQkFFMzBGRTkwNTgyQScpLFxuICAgIEJpZ0ludCgnMHhCQ0Y3QjdFM0M3NTkzQkQ4JyksXG4gICAgQmlnSW50KCcweEMzOTk0NzJCRjc2Q0IyQTEnKSxcbiAgICBCaWdJbnQoJzB4NDIyQTU2NzNBNzMyMjkyQScpLFxuICAgIEJpZ0ludCgnMHgzRDQ0QTZCQjk3MDdBMDUzJyksXG4gICAgQmlnSW50KCcweDc1OTU1MjkwNUYxODhENTcnKSxcbiAgICBCaWdJbnQoJzB4MEFGQkEyNTg2RjJEMDQyRScpLFxuICAgIEJpZ0ludCgnMHg4QjQ4QjMwMDNGNzM5RkE1JyksXG4gICAgQmlnSW50KCcweEY0MjY0M0M4MEY0NjE2REMnKSxcbiAgICBCaWdJbnQoJzB4MUFFQjVCNTdBRjREQzVBRCcpLFxuICAgIEJpZ0ludCgnMHg2NTg1QUI5RjlGNzg0Q0Q0JyksXG4gICAgQmlnSW50KCcweEU0MzZCQUM3Q0YyNkQ3NUYnKSxcbiAgICBCaWdJbnQoJzB4OUI1ODRBMEZGRjEzNUUyNicpLFxuICAgIEJpZ0ludCgnMHhEMzg5QkUyNDM3MEM3MzIyJyksXG4gICAgQmlnSW50KCcweEFDRTc0RUVDMDczOUZBNUInKSxcbiAgICBCaWdJbnQoJzB4MkQ1NDVGQjQ1NzY3NjFEMCcpLFxuICAgIEJpZ0ludCgnMHg1MjNBQUY3QzY3NTJFOEE5JyksXG4gICAgQmlnSW50KCcweEM0MTc0OEQ4NEZFNzU0NTknKSxcbiAgICBCaWdJbnQoJzB4QkI3OUI4MTA3RkQyREQyMCcpLFxuICAgIEJpZ0ludCgnMHgzQUNBQTk0ODJGOEM0NkFCJyksXG4gICAgQmlnSW50KCcweDQ1QTQ1OTgwMUZCOUNGRDInKSxcbiAgICBCaWdJbnQoJzB4MEQ3NUFEQUJEN0E2RTJENicpLFxuICAgIEJpZ0ludCgnMHg3MjFCNUQ2M0U3OTM2QkFGJyksXG4gICAgQmlnSW50KCcweEYzQTg0QzNCQjdDREYwMjQnKSxcbiAgICBCaWdJbnQoJzB4OENDNkJDRjM4N0Y4Nzk1RCcpLFxuICAgIEJpZ0ludCgnMHg2MjBCQTQ2QzI3RjNBQTJDJyksXG4gICAgQmlnSW50KCcweDFENjU1NEE0MTdDNjIzNTUnKSxcbiAgICBCaWdJbnQoJzB4OUNENjQ1RkM0Nzk4QjhERScpLFxuICAgIEJpZ0ludCgnMHhFM0I4QjUzNDc3QUQzMUE3JyksXG4gICAgQmlnSW50KCcweEFCNjk0MTFGQkZCMjFDQTMnKSxcbiAgICBCaWdJbnQoJzB4RDQwN0IxRDc4Rjg3OTVEQScpLFxuICAgIEJpZ0ludCgnMHg1NUI0QTA4RkRGRDkwRTUxJyksXG4gICAgQmlnSW50KCcweDJBREE1MDQ3RUZFQzg3MjgnKVxuXTtcbmNsYXNzIENSQzY0IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5fY3JjID0gQmlnSW50KDApO1xuICAgIH1cbiAgICB1cGRhdGUoZGF0YSkge1xuICAgICAgICBjb25zdCBidWZmZXIgPSB0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycgPyBCdWZmZXIuZnJvbShkYXRhKSA6IGRhdGE7XG4gICAgICAgIGxldCBjcmMgPSBDUkM2NC5mbGlwNjRCaXRzKHRoaXMuX2NyYyk7XG4gICAgICAgIGZvciAoY29uc3QgZGF0YUJ5dGUgb2YgYnVmZmVyKSB7XG4gICAgICAgICAgICBjb25zdCBjcmNCeXRlID0gTnVtYmVyKGNyYyAmIEJpZ0ludCgweGZmKSk7XG4gICAgICAgICAgICBjcmMgPSBQUkVHRU5fUE9MWV9UQUJMRVtjcmNCeXRlIF4gZGF0YUJ5dGVdIF4gKGNyYyA+PiBCaWdJbnQoOCkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2NyYyA9IENSQzY0LmZsaXA2NEJpdHMoY3JjKTtcbiAgICB9XG4gICAgZGlnZXN0KGVuY29kaW5nKSB7XG4gICAgICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgICAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NyYy50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9CdWZmZXIoKS50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRvQnVmZmVyKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdG9CdWZmZXIoKSB7XG4gICAgICAgIHJldHVybiBCdWZmZXIuZnJvbShbMCwgOCwgMTYsIDI0LCAzMiwgNDAsIDQ4LCA1Nl0ubWFwKHMgPT4gTnVtYmVyKCh0aGlzLl9jcmMgPj4gQmlnSW50KHMpKSAmIEJpZ0ludCgweGZmKSkpKTtcbiAgICB9XG4gICAgc3RhdGljIGZsaXA2NEJpdHMobikge1xuICAgICAgICByZXR1cm4gKEJpZ0ludCgxKSA8PCBCaWdJbnQoNjQpKSAtIEJpZ0ludCgxKSAtIG47XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gQ1JDNjQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jcmM2NC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX3NldE1vZHVsZURlZmF1bHQpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XG59KTtcbnZhciBfX2ltcG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0U3RhcikgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChrICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuRG93bmxvYWRIdHRwQ2xpZW50ID0gdm9pZCAwO1xuY29uc3QgZnMgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcImZzXCIpKTtcbmNvbnN0IGNvcmUgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcIkBhY3Rpb25zL2NvcmVcIikpO1xuY29uc3QgemxpYiA9IF9faW1wb3J0U3RhcihyZXF1aXJlKFwiemxpYlwiKSk7XG5jb25zdCB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG5jb25zdCB1cmxfMSA9IHJlcXVpcmUoXCJ1cmxcIik7XG5jb25zdCBzdGF0dXNfcmVwb3J0ZXJfMSA9IHJlcXVpcmUoXCIuL3N0YXR1cy1yZXBvcnRlclwiKTtcbmNvbnN0IHBlcmZfaG9va3NfMSA9IHJlcXVpcmUoXCJwZXJmX2hvb2tzXCIpO1xuY29uc3QgaHR0cF9tYW5hZ2VyXzEgPSByZXF1aXJlKFwiLi9odHRwLW1hbmFnZXJcIik7XG5jb25zdCBjb25maWdfdmFyaWFibGVzXzEgPSByZXF1aXJlKFwiLi9jb25maWctdmFyaWFibGVzXCIpO1xuY29uc3QgcmVxdWVzdFV0aWxzXzEgPSByZXF1aXJlKFwiLi9yZXF1ZXN0VXRpbHNcIik7XG5jbGFzcyBEb3dubG9hZEh0dHBDbGllbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmRvd25sb2FkSHR0cE1hbmFnZXIgPSBuZXcgaHR0cF9tYW5hZ2VyXzEuSHR0cE1hbmFnZXIoY29uZmlnX3ZhcmlhYmxlc18xLmdldERvd25sb2FkRmlsZUNvbmN1cnJlbmN5KCksICdAYWN0aW9ucy9hcnRpZmFjdC1kb3dubG9hZCcpO1xuICAgICAgICAvLyBkb3dubG9hZHMgYXJlIHVzdWFsbHkgc2lnbmlmaWNhbnRseSBmYXN0ZXIgdGhhbiB1cGxvYWRzIHNvIGRpc3BsYXkgc3RhdHVzIGluZm9ybWF0aW9uIGV2ZXJ5IHNlY29uZFxuICAgICAgICB0aGlzLnN0YXR1c1JlcG9ydGVyID0gbmV3IHN0YXR1c19yZXBvcnRlcl8xLlN0YXR1c1JlcG9ydGVyKDEwMDApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXRzIGEgbGlzdCBvZiBhbGwgYXJ0aWZhY3RzIHRoYXQgYXJlIGluIGEgc3BlY2lmaWMgY29udGFpbmVyXG4gICAgICovXG4gICAgbGlzdEFydGlmYWN0cygpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IGFydGlmYWN0VXJsID0gdXRpbHNfMS5nZXRBcnRpZmFjdFVybCgpO1xuICAgICAgICAgICAgLy8gdXNlIHRoZSBmaXJzdCBjbGllbnQgZnJvbSB0aGUgaHR0cE1hbmFnZXIsIGBrZWVwLWFsaXZlYCBpcyBub3QgdXNlZCBzbyB0aGUgY29ubmVjdGlvbiB3aWxsIGNsb3NlIGltbWVkaWF0ZWx5XG4gICAgICAgICAgICBjb25zdCBjbGllbnQgPSB0aGlzLmRvd25sb2FkSHR0cE1hbmFnZXIuZ2V0Q2xpZW50KDApO1xuICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IHV0aWxzXzEuZ2V0RG93bmxvYWRIZWFkZXJzKCdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHlpZWxkIHJlcXVlc3RVdGlsc18xLnJldHJ5SHR0cENsaWVudFJlcXVlc3QoJ0xpc3QgQXJ0aWZhY3RzJywgKCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkgeyByZXR1cm4gY2xpZW50LmdldChhcnRpZmFjdFVybCwgaGVhZGVycyk7IH0pKTtcbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSB5aWVsZCByZXNwb25zZS5yZWFkQm9keSgpO1xuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoYm9keSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBGZXRjaGVzIGEgc2V0IG9mIGNvbnRhaW5lciBpdGVtcyB0aGF0IGRlc2NyaWJlIHRoZSBjb250ZW50cyBvZiBhbiBhcnRpZmFjdFxuICAgICAqIEBwYXJhbSBhcnRpZmFjdE5hbWUgdGhlIG5hbWUgb2YgdGhlIGFydGlmYWN0XG4gICAgICogQHBhcmFtIGNvbnRhaW5lclVybCB0aGUgYXJ0aWZhY3QgY29udGFpbmVyIFVSTCBmb3IgdGhlIHJ1blxuICAgICAqL1xuICAgIGdldENvbnRhaW5lckl0ZW1zKGFydGlmYWN0TmFtZSwgY29udGFpbmVyVXJsKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyB0aGUgaXRlbVBhdGggc2VhcmNoIHBhcmFtZXRlciBjb250cm9scyB3aGljaCBjb250YWluZXJzIHdpbGwgYmUgcmV0dXJuZWRcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlVXJsID0gbmV3IHVybF8xLlVSTChjb250YWluZXJVcmwpO1xuICAgICAgICAgICAgcmVzb3VyY2VVcmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnaXRlbVBhdGgnLCBhcnRpZmFjdE5hbWUpO1xuICAgICAgICAgICAgLy8gdXNlIHRoZSBmaXJzdCBjbGllbnQgZnJvbSB0aGUgaHR0cE1hbmFnZXIsIGBrZWVwLWFsaXZlYCBpcyBub3QgdXNlZCBzbyB0aGUgY29ubmVjdGlvbiB3aWxsIGNsb3NlIGltbWVkaWF0ZWx5XG4gICAgICAgICAgICBjb25zdCBjbGllbnQgPSB0aGlzLmRvd25sb2FkSHR0cE1hbmFnZXIuZ2V0Q2xpZW50KDApO1xuICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IHV0aWxzXzEuZ2V0RG93bmxvYWRIZWFkZXJzKCdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHlpZWxkIHJlcXVlc3RVdGlsc18xLnJldHJ5SHR0cENsaWVudFJlcXVlc3QoJ0dldCBDb250YWluZXIgSXRlbXMnLCAoKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7IHJldHVybiBjbGllbnQuZ2V0KHJlc291cmNlVXJsLnRvU3RyaW5nKCksIGhlYWRlcnMpOyB9KSk7XG4gICAgICAgICAgICBjb25zdCBib2R5ID0geWllbGQgcmVzcG9uc2UucmVhZEJvZHkoKTtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGJvZHkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29uY3VycmVudGx5IGRvd25sb2FkcyBhbGwgdGhlIGZpbGVzIHRoYXQgYXJlIHBhcnQgb2YgYW4gYXJ0aWZhY3RcbiAgICAgKiBAcGFyYW0gZG93bmxvYWRJdGVtcyBpbmZvcm1hdGlvbiBhYm91dCB3aGF0IGl0ZW1zIHRvIGRvd25sb2FkIGFuZCB3aGVyZSB0byBzYXZlIHRoZW1cbiAgICAgKi9cbiAgICBkb3dubG9hZFNpbmdsZUFydGlmYWN0KGRvd25sb2FkSXRlbXMpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IERPV05MT0FEX0NPTkNVUlJFTkNZID0gY29uZmlnX3ZhcmlhYmxlc18xLmdldERvd25sb2FkRmlsZUNvbmN1cnJlbmN5KCk7XG4gICAgICAgICAgICAvLyBsaW1pdCB0aGUgbnVtYmVyIG9mIGZpbGVzIGRvd25sb2FkZWQgYXQgYSBzaW5nbGUgdGltZVxuICAgICAgICAgICAgY29yZS5kZWJ1ZyhgRG93bmxvYWQgZmlsZSBjb25jdXJyZW5jeSBpcyBzZXQgdG8gJHtET1dOTE9BRF9DT05DVVJSRU5DWX1gKTtcbiAgICAgICAgICAgIGNvbnN0IHBhcmFsbGVsRG93bmxvYWRzID0gWy4uLm5ldyBBcnJheShET1dOTE9BRF9DT05DVVJSRU5DWSkua2V5cygpXTtcbiAgICAgICAgICAgIGxldCBjdXJyZW50RmlsZSA9IDA7XG4gICAgICAgICAgICBsZXQgZG93bmxvYWRlZEZpbGVzID0gMDtcbiAgICAgICAgICAgIGNvcmUuaW5mbyhgVG90YWwgbnVtYmVyIG9mIGZpbGVzIHRoYXQgd2lsbCBiZSBkb3dubG9hZGVkOiAke2Rvd25sb2FkSXRlbXMubGVuZ3RofWApO1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNSZXBvcnRlci5zZXRUb3RhbE51bWJlck9mRmlsZXNUb1Byb2Nlc3MoZG93bmxvYWRJdGVtcy5sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNSZXBvcnRlci5zdGFydCgpO1xuICAgICAgICAgICAgeWllbGQgUHJvbWlzZS5hbGwocGFyYWxsZWxEb3dubG9hZHMubWFwKChpbmRleCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIHdoaWxlIChjdXJyZW50RmlsZSA8IGRvd25sb2FkSXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRGaWxlVG9Eb3dubG9hZCA9IGRvd25sb2FkSXRlbXNbY3VycmVudEZpbGVdO1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50RmlsZSArPSAxO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBwZXJmX2hvb2tzXzEucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMuZG93bmxvYWRJbmRpdmlkdWFsRmlsZShpbmRleCwgY3VycmVudEZpbGVUb0Rvd25sb2FkLnNvdXJjZUxvY2F0aW9uLCBjdXJyZW50RmlsZVRvRG93bmxvYWQudGFyZ2V0UGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb3JlLmlzRGVidWcoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29yZS5kZWJ1ZyhgRmlsZTogJHsrK2Rvd25sb2FkZWRGaWxlc30vJHtkb3dubG9hZEl0ZW1zLmxlbmd0aH0uICR7Y3VycmVudEZpbGVUb0Rvd25sb2FkLnRhcmdldFBhdGh9IHRvb2sgJHsocGVyZl9ob29rc18xLnBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRUaW1lKS50b0ZpeGVkKDMpfSBtaWxsaXNlY29uZHMgdG8gZmluaXNoIGRvd25sb2FkaW5nYCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0dXNSZXBvcnRlci5pbmNyZW1lbnRQcm9jZXNzZWRDb3VudCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGRvd25sb2FkIHRoZSBhcnRpZmFjdDogJHtlcnJvcn1gKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdHVzUmVwb3J0ZXIuc3RvcCgpO1xuICAgICAgICAgICAgICAgIC8vIHNhZmV0eSBkaXNwb3NlIGFsbCBjb25uZWN0aW9uc1xuICAgICAgICAgICAgICAgIHRoaXMuZG93bmxvYWRIdHRwTWFuYWdlci5kaXNwb3NlQW5kUmVwbGFjZUFsbENsaWVudHMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRG93bmxvYWRzIGFuIGluZGl2aWR1YWwgZmlsZVxuICAgICAqIEBwYXJhbSBodHRwQ2xpZW50SW5kZXggdGhlIGluZGV4IG9mIHRoZSBodHRwIGNsaWVudCB0aGF0IGlzIHVzZWQgdG8gbWFrZSBhbGwgb2YgdGhlIGNhbGxzXG4gICAgICogQHBhcmFtIGFydGlmYWN0TG9jYXRpb24gb3JpZ2luIGxvY2F0aW9uIHdoZXJlIGEgZmlsZSB3aWxsIGJlIGRvd25sb2FkZWQgZnJvbVxuICAgICAqIEBwYXJhbSBkb3dubG9hZFBhdGggZGVzdGluYXRpb24gbG9jYXRpb24gZm9yIHRoZSBmaWxlIGJlaW5nIGRvd25sb2FkZWRcbiAgICAgKi9cbiAgICBkb3dubG9hZEluZGl2aWR1YWxGaWxlKGh0dHBDbGllbnRJbmRleCwgYXJ0aWZhY3RMb2NhdGlvbiwgZG93bmxvYWRQYXRoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBsZXQgcmV0cnlDb3VudCA9IDA7XG4gICAgICAgICAgICBjb25zdCByZXRyeUxpbWl0ID0gY29uZmlnX3ZhcmlhYmxlc18xLmdldFJldHJ5TGltaXQoKTtcbiAgICAgICAgICAgIGxldCBkZXN0aW5hdGlvblN0cmVhbSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRvd25sb2FkUGF0aCk7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gdXRpbHNfMS5nZXREb3dubG9hZEhlYWRlcnMoJ2FwcGxpY2F0aW9uL2pzb24nLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgICAgIC8vIGEgc2luZ2xlIEdFVCByZXF1ZXN0IGlzIHVzZWQgdG8gZG93bmxvYWQgYSBmaWxlXG4gICAgICAgICAgICBjb25zdCBtYWtlRG93bmxvYWRSZXF1ZXN0ID0gKCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNsaWVudCA9IHRoaXMuZG93bmxvYWRIdHRwTWFuYWdlci5nZXRDbGllbnQoaHR0cENsaWVudEluZGV4KTtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQgY2xpZW50LmdldChhcnRpZmFjdExvY2F0aW9uLCBoZWFkZXJzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gY2hlY2sgdGhlIHJlc3BvbnNlIGhlYWRlcnMgdG8gZGV0ZXJtaW5lIGlmIHRoZSBmaWxlIHdhcyBjb21wcmVzc2VkIHVzaW5nIGd6aXBcbiAgICAgICAgICAgIGNvbnN0IGlzR3ppcCA9IChpbmNvbWluZ0hlYWRlcnMpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCdjb250ZW50LWVuY29kaW5nJyBpbiBpbmNvbWluZ0hlYWRlcnMgJiZcbiAgICAgICAgICAgICAgICAgICAgaW5jb21pbmdIZWFkZXJzWydjb250ZW50LWVuY29kaW5nJ10gPT09ICdnemlwJyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gSW5jcmVtZW50cyB0aGUgY3VycmVudCByZXRyeSBjb3VudCBhbmQgdGhlbiBjaGVja3MgaWYgdGhlIHJldHJ5IGxpbWl0IGhhcyBiZWVuIHJlYWNoZWRcbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGhhdmUgYmVlbiB0b28gbWFueSByZXRyaWVzLCBmYWlsIHNvIHRoZSBkb3dubG9hZCBzdG9wcy4gSWYgdGhlcmUgaXMgYSByZXRyeUFmdGVyVmFsdWUgdmFsdWUgcHJvdmlkZWQsXG4gICAgICAgICAgICAvLyBpdCB3aWxsIGJlIHVzZWRcbiAgICAgICAgICAgIGNvbnN0IGJhY2tPZmYgPSAocmV0cnlBZnRlclZhbHVlKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0cnlDb3VudCsrO1xuICAgICAgICAgICAgICAgIGlmIChyZXRyeUNvdW50ID4gcmV0cnlMaW1pdCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGBSZXRyeSBsaW1pdCBoYXMgYmVlbiByZWFjaGVkLiBVbmFibGUgdG8gZG93bmxvYWQgJHthcnRpZmFjdExvY2F0aW9ufWApKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZG93bmxvYWRIdHRwTWFuYWdlci5kaXNwb3NlQW5kUmVwbGFjZUNsaWVudChodHRwQ2xpZW50SW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmV0cnlBZnRlclZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBCYWNrIG9mZiBieSB3YWl0aW5nIHRoZSBzcGVjaWZpZWQgdGltZSBkZW5vdGVkIGJ5IHRoZSByZXRyeS1hZnRlciBoZWFkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcmUuaW5mbyhgQmFja29mZiBkdWUgdG8gdG9vIG1hbnkgcmVxdWVzdHMsIHJldHJ5ICMke3JldHJ5Q291bnR9LiBXYWl0aW5nIGZvciAke3JldHJ5QWZ0ZXJWYWx1ZX0gbWlsbGlzZWNvbmRzIGJlZm9yZSBjb250aW51aW5nIHRoZSBkb3dubG9hZGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgdXRpbHNfMS5zbGVlcChyZXRyeUFmdGVyVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQmFjayBvZmYgdXNpbmcgYW4gZXhwb25lbnRpYWwgdmFsdWUgdGhhdCBkZXBlbmRzIG9uIHRoZSByZXRyeSBjb3VudFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYmFja29mZlRpbWUgPSB1dGlsc18xLmdldEV4cG9uZW50aWFsUmV0cnlUaW1lSW5NaWxsaXNlY29uZHMocmV0cnlDb3VudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3JlLmluZm8oYEV4cG9uZW50aWFsIGJhY2tvZmYgZm9yIHJldHJ5ICMke3JldHJ5Q291bnR9LiBXYWl0aW5nIGZvciAke2JhY2tvZmZUaW1lfSBtaWxsaXNlY29uZHMgYmVmb3JlIGNvbnRpbnVpbmcgdGhlIGRvd25sb2FkYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCB1dGlsc18xLnNsZWVwKGJhY2tvZmZUaW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb3JlLmluZm8oYEZpbmlzaGVkIGJhY2tvZmYgZm9yIHJldHJ5ICMke3JldHJ5Q291bnR9LCBjb250aW51aW5nIHdpdGggZG93bmxvYWRgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IGlzQWxsQnl0ZXNSZWNlaXZlZCA9IChleHBlY3RlZCwgcmVjZWl2ZWQpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBiZSBsZW5pZW50LCBpZiBhbnkgaW5wdXQgaXMgbWlzc2luZywgYXNzdW1lIHN1Y2Nlc3MsIGkuZS4gbm90IHRydW5jYXRlZFxuICAgICAgICAgICAgICAgIGlmICghZXhwZWN0ZWQgfHxcbiAgICAgICAgICAgICAgICAgICAgIXJlY2VpdmVkIHx8XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZW52WydBQ1RJT05TX0FSVElGQUNUX1NLSVBfRE9XTkxPQURfVkFMSURBVElPTiddKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvcmUuaW5mbygnU2tpcHBpbmcgZG93bmxvYWQgdmFsaWRhdGlvbi4nKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludChleHBlY3RlZCkgPT09IHJlY2VpdmVkO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHJlc2V0RGVzdGluYXRpb25TdHJlYW0gPSAoZmlsZURvd25sb2FkUGF0aCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uU3RyZWFtLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgLy8gYXdhaXQgdW50aWwgZmlsZSBpcyBjcmVhdGVkIGF0IGRvd25sb2FkcGF0aDsgbm9kZTE1IGFuZCB1cCBmcy5jcmVhdGVXcml0ZVN0cmVhbSBoYWQgbm90IGNyZWF0ZWQgYSBmaWxlIHlldFxuICAgICAgICAgICAgICAgIHlpZWxkIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvblN0cmVhbS5vbignY2xvc2UnLCByZXNvbHZlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlc3RpbmF0aW9uU3RyZWFtLndyaXRhYmxlRmluaXNoZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHlpZWxkIHV0aWxzXzEucm1GaWxlKGZpbGVEb3dubG9hZFBhdGgpO1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uU3RyZWFtID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0oZmlsZURvd25sb2FkUGF0aCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIGtlZXAgdHJ5aW5nIHRvIGRvd25sb2FkIGEgZmlsZSB1bnRpbCBhIHJldHJ5IGxpbWl0IGhhcyBiZWVuIHJlYWNoZWRcbiAgICAgICAgICAgIHdoaWxlIChyZXRyeUNvdW50IDw9IHJldHJ5TGltaXQpIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB5aWVsZCBtYWtlRG93bmxvYWRSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiBhbiBlcnJvciBpcyBjYXVnaHQsIGl0IGlzIHVzdWFsbHkgaW5kaWNhdGl2ZSBvZiBhIHRpbWVvdXQgc28gcmV0cnkgdGhlIGRvd25sb2FkXG4gICAgICAgICAgICAgICAgICAgIGNvcmUuaW5mbygnQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgYXR0ZW1wdGluZyB0byBkb3dubG9hZCBhIGZpbGUnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAvLyBpbmNyZW1lbnQgdGhlIHJldHJ5Q291bnQgYW5kIHVzZSBleHBvbmVudGlhbCBiYWNrb2ZmIHRvIHdhaXQgYmVmb3JlIG1ha2luZyB0aGUgbmV4dCByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIGJhY2tPZmYoKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBmb3JjZVJldHJ5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHV0aWxzXzEuaXNTdWNjZXNzU3RhdHVzQ29kZShyZXNwb25zZS5tZXNzYWdlLnN0YXR1c0NvZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBib2R5IGNvbnRhaW5zIHRoZSBjb250ZW50cyBvZiB0aGUgZmlsZSBob3dldmVyIGNhbGxpbmcgcmVzcG9uc2UucmVhZEJvZHkoKSBjYXVzZXMgYWxsIHRoZSBjb250ZW50IHRvIGJlIGNvbnZlcnRlZCB0byBhIHN0cmluZ1xuICAgICAgICAgICAgICAgICAgICAvLyB3aGljaCBjYW4gY2F1c2Ugc29tZSBnemlwIGVuY29kZWQgZGF0YSB0byBiZSBsb3N0XG4gICAgICAgICAgICAgICAgICAgIC8vIEluc3RlYWQgb2YgdXNpbmcgcmVzcG9uc2UucmVhZEJvZHkoKSwgcmVzcG9uc2UubWVzc2FnZSBpcyBhIHJlYWRhYmxlU3RyZWFtIHRoYXQgY2FuIGJlIGRpcmVjdGx5IHVzZWQgdG8gZ2V0IHRoZSByYXcgYm9keSBjb250ZW50c1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNHemlwcGVkID0gaXNHemlwKHJlc3BvbnNlLm1lc3NhZ2UuaGVhZGVycyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLnBpcGVSZXNwb25zZVRvRmlsZShyZXNwb25zZSwgZGVzdGluYXRpb25TdHJlYW0sIGlzR3ppcHBlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNHemlwcGVkIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNBbGxCeXRlc1JlY2VpdmVkKHJlc3BvbnNlLm1lc3NhZ2UuaGVhZGVyc1snY29udGVudC1sZW5ndGgnXSwgeWllbGQgdXRpbHNfMS5nZXRGaWxlU2l6ZShkb3dubG9hZFBhdGgpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcmNlUmV0cnkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0cnkgb24gZXJyb3IsIG1vc3QgbGlrZWx5IHN0cmVhbXMgd2VyZSBjb3JydXB0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcmNlUmV0cnkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChmb3JjZVJldHJ5IHx8IHV0aWxzXzEuaXNSZXRyeWFibGVTdGF0dXNDb2RlKHJlc3BvbnNlLm1lc3NhZ2Uuc3RhdHVzQ29kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29yZS5pbmZvKGBBICR7cmVzcG9uc2UubWVzc2FnZS5zdGF0dXNDb2RlfSByZXNwb25zZSBjb2RlIGhhcyBiZWVuIHJlY2VpdmVkIHdoaWxlIGF0dGVtcHRpbmcgdG8gZG93bmxvYWQgYW4gYXJ0aWZhY3RgKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXREZXN0aW5hdGlvblN0cmVhbShkb3dubG9hZFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiBhIHRocm90dGxlZCBzdGF0dXMgY29kZSBpcyByZWNlaXZlZCwgdHJ5IHRvIGdldCB0aGUgcmV0cnlBZnRlciBoZWFkZXIgdmFsdWUsIGVsc2UgZGlmZmVyIHRvIHN0YW5kYXJkIGV4cG9uZW50aWFsIGJhY2tvZmZcbiAgICAgICAgICAgICAgICAgICAgdXRpbHNfMS5pc1Rocm90dGxlZFN0YXR1c0NvZGUocmVzcG9uc2UubWVzc2FnZS5zdGF0dXNDb2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgPyB5aWVsZCBiYWNrT2ZmKHV0aWxzXzEudHJ5R2V0UmV0cnlBZnRlclZhbHVlVGltZUluTWlsbGlzZWNvbmRzKHJlc3BvbnNlLm1lc3NhZ2UuaGVhZGVycykpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHlpZWxkIGJhY2tPZmYoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWUgdW5leHBlY3RlZCByZXNwb25zZSBjb2RlLCBmYWlsIGltbWVkaWF0ZWx5IGFuZCBzdG9wIHRoZSBkb3dubG9hZFxuICAgICAgICAgICAgICAgICAgICB1dGlsc18xLmRpc3BsYXlIdHRwRGlhZ25vc3RpY3MocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGBVbmV4cGVjdGVkIGh0dHAgJHtyZXNwb25zZS5tZXNzYWdlLnN0YXR1c0NvZGV9IGR1cmluZyBkb3dubG9hZCBmb3IgJHthcnRpZmFjdExvY2F0aW9ufWApKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQaXBlcyB0aGUgcmVzcG9uc2UgZnJvbSBkb3dubG9hZGluZyBhbiBpbmRpdmlkdWFsIGZpbGUgdG8gdGhlIGFwcHJvcHJpYXRlIGRlc3RpbmF0aW9uIHN0cmVhbSB3aGlsZSBkZWNvZGluZyBnemlwIGNvbnRlbnQgaWYgbmVjZXNzYXJ5XG4gICAgICogQHBhcmFtIHJlc3BvbnNlIHRoZSBodHRwIHJlc3BvbnNlIHJlY2VpdmVkIHdoZW4gZG93bmxvYWRpbmcgYSBmaWxlXG4gICAgICogQHBhcmFtIGRlc3RpbmF0aW9uU3RyZWFtIHRoZSBzdHJlYW0gd2hlcmUgdGhlIGZpbGUgc2hvdWxkIGJlIHdyaXR0ZW4gdG9cbiAgICAgKiBAcGFyYW0gaXNHemlwIGEgYm9vbGVhbiBkZW5vdGluZyBpZiB0aGUgY29udGVudCBpcyBjb21wcmVzc2VkIHVzaW5nIGd6aXAgYW5kIGlmIHdlIG5lZWQgdG8gZGVjb2RlIGl0XG4gICAgICovXG4gICAgcGlwZVJlc3BvbnNlVG9GaWxlKHJlc3BvbnNlLCBkZXN0aW5hdGlvblN0cmVhbSwgaXNHemlwKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICB5aWVsZCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGlzR3ppcCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBndW56aXAgPSB6bGliLmNyZWF0ZUd1bnppcCgpO1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29yZS5lcnJvcihgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgYXR0ZW1wdGluZyB0byByZWFkIHRoZSByZXNwb25zZSBzdHJlYW1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGd1bnppcC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb25TdHJlYW0uY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAucGlwZShndW56aXApXG4gICAgICAgICAgICAgICAgICAgICAgICAub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29yZS5lcnJvcihgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgYXR0ZW1wdGluZyB0byBkZWNvbXByZXNzIHRoZSByZXNwb25zZSBzdHJlYW1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uU3RyZWFtLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnBpcGUoZGVzdGluYXRpb25TdHJlYW0pXG4gICAgICAgICAgICAgICAgICAgICAgICAub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcmUuZXJyb3IoYEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHdyaXRpbmcgYSBkb3dubG9hZGVkIGZpbGUgdG8gJHtkZXN0aW5hdGlvblN0cmVhbS5wYXRofWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29yZS5lcnJvcihgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgYXR0ZW1wdGluZyB0byByZWFkIHRoZSByZXNwb25zZSBzdHJlYW1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uU3RyZWFtLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnBpcGUoZGVzdGluYXRpb25TdHJlYW0pXG4gICAgICAgICAgICAgICAgICAgICAgICAub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcmUuZXJyb3IoYEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHdyaXRpbmcgYSBkb3dubG9hZGVkIGZpbGUgdG8gJHtkZXN0aW5hdGlvblN0cmVhbS5wYXRofWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuRG93bmxvYWRIdHRwQ2xpZW50ID0gRG93bmxvYWRIdHRwQ2xpZW50O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZG93bmxvYWQtaHR0cC1jbGllbnQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19zZXRNb2R1bGVEZWZhdWx0KSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xufSkgOiBmdW5jdGlvbihvLCB2KSB7XG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xufSk7XG52YXIgX19pbXBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydFN0YXIpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5nZXREb3dubG9hZFNwZWNpZmljYXRpb24gPSB2b2lkIDA7XG5jb25zdCBwYXRoID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJwYXRoXCIpKTtcbi8qKlxuICogQ3JlYXRlcyBhIHNwZWNpZmljYXRpb24gZm9yIGEgc2V0IG9mIGZpbGVzIHRoYXQgd2lsbCBiZSBkb3dubG9hZGVkXG4gKiBAcGFyYW0gYXJ0aWZhY3ROYW1lIHRoZSBuYW1lIG9mIHRoZSBhcnRpZmFjdFxuICogQHBhcmFtIGFydGlmYWN0RW50cmllcyBhIHNldCBvZiBjb250YWluZXIgZW50cmllcyB0aGF0IGRlc2NyaWJlIHRoYXQgZmlsZXMgdGhhdCBtYWtlIHVwIGFuIGFydGlmYWN0XG4gKiBAcGFyYW0gZG93bmxvYWRQYXRoIHRoZSBwYXRoIHdoZXJlIHRoZSBhcnRpZmFjdCB3aWxsIGJlIGRvd25sb2FkZWQgdG9cbiAqIEBwYXJhbSBpbmNsdWRlUm9vdERpcmVjdG9yeSBzcGVjaWZpZXMgaWYgdGhlcmUgc2hvdWxkIGJlIGFuIGV4dHJhIGRpcmVjdG9yeSAoZGVub3RlZCBieSB0aGUgYXJ0aWZhY3QgbmFtZSkgd2hlcmUgdGhlIGFydGlmYWN0IGZpbGVzIHNob3VsZCBiZSBkb3dubG9hZGVkIHRvXG4gKi9cbmZ1bmN0aW9uIGdldERvd25sb2FkU3BlY2lmaWNhdGlvbihhcnRpZmFjdE5hbWUsIGFydGlmYWN0RW50cmllcywgZG93bmxvYWRQYXRoLCBpbmNsdWRlUm9vdERpcmVjdG9yeSkge1xuICAgIC8vIHVzZSBhIHNldCBmb3IgdGhlIGRpcmVjdG9yeSBwYXRocyBzbyB0aGF0IHRoZXJlIGFyZSBubyBkdXBsaWNhdGVzXG4gICAgY29uc3QgZGlyZWN0b3JpZXMgPSBuZXcgU2V0KCk7XG4gICAgY29uc3Qgc3BlY2lmaWNhdGlvbnMgPSB7XG4gICAgICAgIHJvb3REb3dubG9hZExvY2F0aW9uOiBpbmNsdWRlUm9vdERpcmVjdG9yeVxuICAgICAgICAgICAgPyBwYXRoLmpvaW4oZG93bmxvYWRQYXRoLCBhcnRpZmFjdE5hbWUpXG4gICAgICAgICAgICA6IGRvd25sb2FkUGF0aCxcbiAgICAgICAgZGlyZWN0b3J5U3RydWN0dXJlOiBbXSxcbiAgICAgICAgZW1wdHlGaWxlc1RvQ3JlYXRlOiBbXSxcbiAgICAgICAgZmlsZXNUb0Rvd25sb2FkOiBbXVxuICAgIH07XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiBhcnRpZmFjdEVudHJpZXMpIHtcbiAgICAgICAgLy8gSWdub3JlIGFydGlmYWN0cyBpbiB0aGUgY29udGFpbmVyIHRoYXQgZG9uJ3QgYmVnaW4gd2l0aCB0aGUgc2FtZSBuYW1lXG4gICAgICAgIGlmIChlbnRyeS5wYXRoLnN0YXJ0c1dpdGgoYCR7YXJ0aWZhY3ROYW1lfS9gKSB8fFxuICAgICAgICAgICAgZW50cnkucGF0aC5zdGFydHNXaXRoKGAke2FydGlmYWN0TmFtZX1cXFxcYCkpIHtcbiAgICAgICAgICAgIC8vIG5vcm1hbGl6ZSBhbGwgc2VwYXJhdG9ycyB0byB0aGUgbG9jYWwgT1NcbiAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoRW50cnkgPSBwYXRoLm5vcm1hbGl6ZShlbnRyeS5wYXRoKTtcbiAgICAgICAgICAgIC8vIGVudHJ5LnBhdGggYWx3YXlzIHN0YXJ0cyB3aXRoIHRoZSBhcnRpZmFjdCBuYW1lLCBpZiBpbmNsdWRlUm9vdERpcmVjdG9yeSBpcyBmYWxzZSwgcmVtb3ZlIHRoZSBuYW1lIGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgcGF0aFxuICAgICAgICAgICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4oZG93bmxvYWRQYXRoLCBpbmNsdWRlUm9vdERpcmVjdG9yeVxuICAgICAgICAgICAgICAgID8gbm9ybWFsaXplZFBhdGhFbnRyeVxuICAgICAgICAgICAgICAgIDogbm9ybWFsaXplZFBhdGhFbnRyeS5yZXBsYWNlKGFydGlmYWN0TmFtZSwgJycpKTtcbiAgICAgICAgICAgIC8vIENhc2UgaW5zZW5zaXRpdmUgZm9sZGVyIHN0cnVjdHVyZSBtYWludGFpbmVkIGluIHRoZSBiYWNrZW5kLCBub3QgZXZlcnkgZm9sZGVyIGlzIGNyZWF0ZWQgc28gdGhlICdmb2xkZXInXG4gICAgICAgICAgICAvLyBpdGVtVHlwZSBjYW5ub3QgYmUgcmVsaWVkIHVwb24uIFRoZSBmaWxlIG11c3QgYmUgdXNlZCB0byBkZXRlcm1pbmUgdGhlIGRpcmVjdG9yeSBzdHJ1Y3R1cmVcbiAgICAgICAgICAgIGlmIChlbnRyeS5pdGVtVHlwZSA9PT0gJ2ZpbGUnKSB7XG4gICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBkaXJlY3RvcmllcyB0aGF0IHdlIG5lZWQgdG8gY3JlYXRlIGZyb20gdGhlIGZpbGVQYXRoIGZvciBlYWNoIGluZGl2aWR1YWwgZmlsZVxuICAgICAgICAgICAgICAgIGRpcmVjdG9yaWVzLmFkZChwYXRoLmRpcm5hbWUoZmlsZVBhdGgpKTtcbiAgICAgICAgICAgICAgICBpZiAoZW50cnkuZmlsZUxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBbiBlbXB0eSBmaWxlIHdhcyB1cGxvYWRlZCwgY3JlYXRlIHRoZSBlbXB0eSBmaWxlcyBsb2NhbGx5IHNvIHRoYXQgbm8gZXh0cmEgaHR0cCBjYWxscyBhcmUgbWFkZVxuICAgICAgICAgICAgICAgICAgICBzcGVjaWZpY2F0aW9ucy5lbXB0eUZpbGVzVG9DcmVhdGUucHVzaChmaWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzcGVjaWZpY2F0aW9ucy5maWxlc1RvRG93bmxvYWQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VMb2NhdGlvbjogZW50cnkuY29udGVudExvY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UGF0aDogZmlsZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHNwZWNpZmljYXRpb25zLmRpcmVjdG9yeVN0cnVjdHVyZSA9IEFycmF5LmZyb20oZGlyZWN0b3JpZXMpO1xuICAgIHJldHVybiBzcGVjaWZpY2F0aW9ucztcbn1cbmV4cG9ydHMuZ2V0RG93bmxvYWRTcGVjaWZpY2F0aW9uID0gZ2V0RG93bmxvYWRTcGVjaWZpY2F0aW9uO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZG93bmxvYWQtc3BlY2lmaWNhdGlvbi5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuSHR0cE1hbmFnZXIgPSB2b2lkIDA7XG5jb25zdCB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG4vKipcbiAqIFVzZWQgZm9yIG1hbmFnaW5nIGh0dHAgY2xpZW50cyBkdXJpbmcgZWl0aGVyIHVwbG9hZCBvciBkb3dubG9hZFxuICovXG5jbGFzcyBIdHRwTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoY2xpZW50Q291bnQsIHVzZXJBZ2VudCkge1xuICAgICAgICBpZiAoY2xpZW50Q291bnQgPCAxKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZXJlIG11c3QgYmUgYXQgbGVhc3Qgb25lIGNsaWVudCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXNlckFnZW50ID0gdXNlckFnZW50O1xuICAgICAgICB0aGlzLmNsaWVudHMgPSBuZXcgQXJyYXkoY2xpZW50Q291bnQpLmZpbGwodXRpbHNfMS5jcmVhdGVIdHRwQ2xpZW50KHVzZXJBZ2VudCkpO1xuICAgIH1cbiAgICBnZXRDbGllbnQoaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xpZW50c1tpbmRleF07XG4gICAgfVxuICAgIC8vIGNsaWVudCBkaXNwb3NhbCBpcyBuZWNlc3NhcnkgaWYgYSBrZWVwLWFsaXZlIGNvbm5lY3Rpb24gaXMgdXNlZCB0byBwcm9wZXJseSBjbG9zZSB0aGUgY29ubmVjdGlvblxuICAgIC8vIGZvciBtb3JlIGluZm9ybWF0aW9uIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL2FjdGlvbnMvaHR0cC1jbGllbnQvYmxvYi8wNGU1YWQ3M2NkM2ZkMWY1NjEwYTMyMTE2YjA3NTllZGRmNjU3MGQyL2luZGV4LnRzI0wyOTJcbiAgICBkaXNwb3NlQW5kUmVwbGFjZUNsaWVudChpbmRleCkge1xuICAgICAgICB0aGlzLmNsaWVudHNbaW5kZXhdLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5jbGllbnRzW2luZGV4XSA9IHV0aWxzXzEuY3JlYXRlSHR0cENsaWVudCh0aGlzLnVzZXJBZ2VudCk7XG4gICAgfVxuICAgIGRpc3Bvc2VBbmRSZXBsYWNlQWxsQ2xpZW50cygpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaW5kZXhdIG9mIHRoaXMuY2xpZW50cy5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcG9zZUFuZFJlcGxhY2VDbGllbnQoaW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5IdHRwTWFuYWdlciA9IEh0dHBNYW5hZ2VyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aHR0cC1tYW5hZ2VyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5jaGVja0FydGlmYWN0RmlsZVBhdGggPSBleHBvcnRzLmNoZWNrQXJ0aWZhY3ROYW1lID0gdm9pZCAwO1xuY29uc3QgY29yZV8xID0gcmVxdWlyZShcIkBhY3Rpb25zL2NvcmVcIik7XG4vKipcbiAqIEludmFsaWQgY2hhcmFjdGVycyB0aGF0IGNhbm5vdCBiZSBpbiB0aGUgYXJ0aWZhY3QgbmFtZSBvciBhbiB1cGxvYWRlZCBmaWxlLiBXaWxsIGJlIHJlamVjdGVkXG4gKiBmcm9tIHRoZSBzZXJ2ZXIgaWYgYXR0ZW1wdGVkIHRvIGJlIHNlbnQgb3Zlci4gVGhlc2UgY2hhcmFjdGVycyBhcmUgbm90IGFsbG93ZWQgZHVlIHRvIGxpbWl0YXRpb25zIHdpdGggY2VydGFpblxuICogZmlsZSBzeXN0ZW1zIHN1Y2ggYXMgTlRGUy4gVG8gbWFpbnRhaW4gcGxhdGZvcm0tYWdub3N0aWMgYmVoYXZpb3IsIGFsbCBjaGFyYWN0ZXJzIHRoYXQgYXJlIG5vdCBzdXBwb3J0ZWQgYnkgYW5cbiAqIGluZGl2aWR1YWwgZmlsZXN5c3RlbS9wbGF0Zm9ybSB3aWxsIG5vdCBiZSBzdXBwb3J0ZWQgb24gYWxsIGZpbGVTeXN0ZW1zL3BsYXRmb3Jtc1xuICpcbiAqIEZpbGVQYXRocyBjYW4gaW5jbHVkZSBjaGFyYWN0ZXJzIHN1Y2ggYXMgXFwgYW5kIC8gd2hpY2ggYXJlIG5vdCBwZXJtaXR0ZWQgaW4gdGhlIGFydGlmYWN0IG5hbWUgYWxvbmVcbiAqL1xuY29uc3QgaW52YWxpZEFydGlmYWN0RmlsZVBhdGhDaGFyYWN0ZXJzID0gbmV3IE1hcChbXG4gICAgWydcIicsICcgRG91YmxlIHF1b3RlIFwiJ10sXG4gICAgWyc6JywgJyBDb2xvbiA6J10sXG4gICAgWyc8JywgJyBMZXNzIHRoYW4gPCddLFxuICAgIFsnPicsICcgR3JlYXRlciB0aGFuID4nXSxcbiAgICBbJ3wnLCAnIFZlcnRpY2FsIGJhciB8J10sXG4gICAgWycqJywgJyBBc3RlcmlzayAqJ10sXG4gICAgWyc/JywgJyBRdWVzdGlvbiBtYXJrID8nXSxcbiAgICBbJ1xccicsICcgQ2FycmlhZ2UgcmV0dXJuIFxcXFxyJ10sXG4gICAgWydcXG4nLCAnIExpbmUgZmVlZCBcXFxcbiddXG5dKTtcbmNvbnN0IGludmFsaWRBcnRpZmFjdE5hbWVDaGFyYWN0ZXJzID0gbmV3IE1hcChbXG4gICAgLi4uaW52YWxpZEFydGlmYWN0RmlsZVBhdGhDaGFyYWN0ZXJzLFxuICAgIFsnXFxcXCcsICcgQmFja3NsYXNoIFxcXFwnXSxcbiAgICBbJy8nLCAnIEZvcndhcmQgc2xhc2ggLyddXG5dKTtcbi8qKlxuICogU2NhbnMgdGhlIG5hbWUgb2YgdGhlIGFydGlmYWN0IHRvIG1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gaWxsZWdhbCBjaGFyYWN0ZXJzXG4gKi9cbmZ1bmN0aW9uIGNoZWNrQXJ0aWZhY3ROYW1lKG5hbWUpIHtcbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBcnRpZmFjdCBuYW1lOiAke25hbWV9LCBpcyBpbmNvcnJlY3RseSBwcm92aWRlZGApO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFtpbnZhbGlkQ2hhcmFjdGVyS2V5LCBlcnJvck1lc3NhZ2VGb3JDaGFyYWN0ZXJdIG9mIGludmFsaWRBcnRpZmFjdE5hbWVDaGFyYWN0ZXJzKSB7XG4gICAgICAgIGlmIChuYW1lLmluY2x1ZGVzKGludmFsaWRDaGFyYWN0ZXJLZXkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFydGlmYWN0IG5hbWUgaXMgbm90IHZhbGlkOiAke25hbWV9LiBDb250YWlucyB0aGUgZm9sbG93aW5nIGNoYXJhY3RlcjogJHtlcnJvck1lc3NhZ2VGb3JDaGFyYWN0ZXJ9XG4gICAgICAgICAgXG5JbnZhbGlkIGNoYXJhY3RlcnMgaW5jbHVkZTogJHtBcnJheS5mcm9tKGludmFsaWRBcnRpZmFjdE5hbWVDaGFyYWN0ZXJzLnZhbHVlcygpKS50b1N0cmluZygpfVxuICAgICAgICAgIFxuVGhlc2UgY2hhcmFjdGVycyBhcmUgbm90IGFsbG93ZWQgaW4gdGhlIGFydGlmYWN0IG5hbWUgZHVlIHRvIGxpbWl0YXRpb25zIHdpdGggY2VydGFpbiBmaWxlIHN5c3RlbXMgc3VjaCBhcyBOVEZTLiBUbyBtYWludGFpbiBmaWxlIHN5c3RlbSBhZ25vc3RpYyBiZWhhdmlvciwgdGhlc2UgY2hhcmFjdGVycyBhcmUgaW50ZW50aW9uYWxseSBub3QgYWxsb3dlZCB0byBwcmV2ZW50IHBvdGVudGlhbCBwcm9ibGVtcyB3aXRoIGRvd25sb2FkcyBvbiBkaWZmZXJlbnQgZmlsZSBzeXN0ZW1zLmApO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvcmVfMS5pbmZvKGBBcnRpZmFjdCBuYW1lIGlzIHZhbGlkIWApO1xufVxuZXhwb3J0cy5jaGVja0FydGlmYWN0TmFtZSA9IGNoZWNrQXJ0aWZhY3ROYW1lO1xuLyoqXG4gKiBTY2FucyB0aGUgbmFtZSBvZiB0aGUgZmlsZVBhdGggdXNlZCB0byBtYWtlIHN1cmUgdGhlcmUgYXJlIG5vIGlsbGVnYWwgY2hhcmFjdGVyc1xuICovXG5mdW5jdGlvbiBjaGVja0FydGlmYWN0RmlsZVBhdGgocGF0aCkge1xuICAgIGlmICghcGF0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFydGlmYWN0IHBhdGg6ICR7cGF0aH0sIGlzIGluY29ycmVjdGx5IHByb3ZpZGVkYCk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgW2ludmFsaWRDaGFyYWN0ZXJLZXksIGVycm9yTWVzc2FnZUZvckNoYXJhY3Rlcl0gb2YgaW52YWxpZEFydGlmYWN0RmlsZVBhdGhDaGFyYWN0ZXJzKSB7XG4gICAgICAgIGlmIChwYXRoLmluY2x1ZGVzKGludmFsaWRDaGFyYWN0ZXJLZXkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFydGlmYWN0IHBhdGggaXMgbm90IHZhbGlkOiAke3BhdGh9LiBDb250YWlucyB0aGUgZm9sbG93aW5nIGNoYXJhY3RlcjogJHtlcnJvck1lc3NhZ2VGb3JDaGFyYWN0ZXJ9XG4gICAgICAgICAgXG5JbnZhbGlkIGNoYXJhY3RlcnMgaW5jbHVkZTogJHtBcnJheS5mcm9tKGludmFsaWRBcnRpZmFjdEZpbGVQYXRoQ2hhcmFjdGVycy52YWx1ZXMoKSkudG9TdHJpbmcoKX1cbiAgICAgICAgICBcblRoZSBmb2xsb3dpbmcgY2hhcmFjdGVycyBhcmUgbm90IGFsbG93ZWQgaW4gZmlsZXMgdGhhdCBhcmUgdXBsb2FkZWQgZHVlIHRvIGxpbWl0YXRpb25zIHdpdGggY2VydGFpbiBmaWxlIHN5c3RlbXMgc3VjaCBhcyBOVEZTLiBUbyBtYWludGFpbiBmaWxlIHN5c3RlbSBhZ25vc3RpYyBiZWhhdmlvciwgdGhlc2UgY2hhcmFjdGVycyBhcmUgaW50ZW50aW9uYWxseSBub3QgYWxsb3dlZCB0byBwcmV2ZW50IHBvdGVudGlhbCBwcm9ibGVtcyB3aXRoIGRvd25sb2FkcyBvbiBkaWZmZXJlbnQgZmlsZSBzeXN0ZW1zLlxuICAgICAgICAgIGApO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5jaGVja0FydGlmYWN0RmlsZVBhdGggPSBjaGVja0FydGlmYWN0RmlsZVBhdGg7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXRoLWFuZC1hcnRpZmFjdC1uYW1lLXZhbGlkYXRpb24uanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19zZXRNb2R1bGVEZWZhdWx0KSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xufSkgOiBmdW5jdGlvbihvLCB2KSB7XG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xufSk7XG52YXIgX19pbXBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydFN0YXIpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnJldHJ5SHR0cENsaWVudFJlcXVlc3QgPSBleHBvcnRzLnJldHJ5ID0gdm9pZCAwO1xuY29uc3QgdXRpbHNfMSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xuY29uc3QgY29yZSA9IF9faW1wb3J0U3RhcihyZXF1aXJlKFwiQGFjdGlvbnMvY29yZVwiKSk7XG5jb25zdCBjb25maWdfdmFyaWFibGVzXzEgPSByZXF1aXJlKFwiLi9jb25maWctdmFyaWFibGVzXCIpO1xuZnVuY3Rpb24gcmV0cnkobmFtZSwgb3BlcmF0aW9uLCBjdXN0b21FcnJvck1lc3NhZ2VzLCBtYXhBdHRlbXB0cykge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHN0YXR1c0NvZGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIGxldCBpc1JldHJ5YWJsZSA9IGZhbHNlO1xuICAgICAgICBsZXQgZXJyb3JNZXNzYWdlID0gJyc7XG4gICAgICAgIGxldCBjdXN0b21FcnJvckluZm9ybWF0aW9uID0gdW5kZWZpbmVkO1xuICAgICAgICBsZXQgYXR0ZW1wdCA9IDE7XG4gICAgICAgIHdoaWxlIChhdHRlbXB0IDw9IG1heEF0dGVtcHRzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0geWllbGQgb3BlcmF0aW9uKCk7XG4gICAgICAgICAgICAgICAgc3RhdHVzQ29kZSA9IHJlc3BvbnNlLm1lc3NhZ2Uuc3RhdHVzQ29kZTtcbiAgICAgICAgICAgICAgICBpZiAodXRpbHNfMS5pc1N1Y2Nlc3NTdGF0dXNDb2RlKHN0YXR1c0NvZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gRXh0cmEgZXJyb3IgaW5mb3JtYXRpb24gdGhhdCB3ZSB3YW50IHRvIGRpc3BsYXkgaWYgYSBwYXJ0aWN1bGFyIHJlc3BvbnNlIGNvZGUgaXMgaGl0XG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1c0NvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VzdG9tRXJyb3JJbmZvcm1hdGlvbiA9IGN1c3RvbUVycm9yTWVzc2FnZXMuZ2V0KHN0YXR1c0NvZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpc1JldHJ5YWJsZSA9IHV0aWxzXzEuaXNSZXRyeWFibGVTdGF0dXNDb2RlKHN0YXR1c0NvZGUpO1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZSA9IGBBcnRpZmFjdCBzZXJ2aWNlIHJlc3BvbmRlZCB3aXRoICR7c3RhdHVzQ29kZX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgaXNSZXRyeWFibGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZSA9IGVycm9yLm1lc3NhZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzUmV0cnlhYmxlKSB7XG4gICAgICAgICAgICAgICAgY29yZS5pbmZvKGAke25hbWV9IC0gRXJyb3IgaXMgbm90IHJldHJ5YWJsZWApO1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICB1dGlsc18xLmRpc3BsYXlIdHRwRGlhZ25vc3RpY3MocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvcmUuaW5mbyhgJHtuYW1lfSAtIEF0dGVtcHQgJHthdHRlbXB0fSBvZiAke21heEF0dGVtcHRzfSBmYWlsZWQgd2l0aCBlcnJvcjogJHtlcnJvck1lc3NhZ2V9YCk7XG4gICAgICAgICAgICB5aWVsZCB1dGlsc18xLnNsZWVwKHV0aWxzXzEuZ2V0RXhwb25lbnRpYWxSZXRyeVRpbWVJbk1pbGxpc2Vjb25kcyhhdHRlbXB0KSk7XG4gICAgICAgICAgICBhdHRlbXB0Kys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB1dGlsc18xLmRpc3BsYXlIdHRwRGlhZ25vc3RpY3MocmVzcG9uc2UpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjdXN0b21FcnJvckluZm9ybWF0aW9uKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcihgJHtuYW1lfSBmYWlsZWQ6ICR7Y3VzdG9tRXJyb3JJbmZvcm1hdGlvbn1gKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBFcnJvcihgJHtuYW1lfSBmYWlsZWQ6ICR7ZXJyb3JNZXNzYWdlfWApO1xuICAgIH0pO1xufVxuZXhwb3J0cy5yZXRyeSA9IHJldHJ5O1xuZnVuY3Rpb24gcmV0cnlIdHRwQ2xpZW50UmVxdWVzdChuYW1lLCBtZXRob2QsIGN1c3RvbUVycm9yTWVzc2FnZXMgPSBuZXcgTWFwKCksIG1heEF0dGVtcHRzID0gY29uZmlnX3ZhcmlhYmxlc18xLmdldFJldHJ5TGltaXQoKSkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIHJldHVybiB5aWVsZCByZXRyeShuYW1lLCBtZXRob2QsIGN1c3RvbUVycm9yTWVzc2FnZXMsIG1heEF0dGVtcHRzKTtcbiAgICB9KTtcbn1cbmV4cG9ydHMucmV0cnlIdHRwQ2xpZW50UmVxdWVzdCA9IHJldHJ5SHR0cENsaWVudFJlcXVlc3Q7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZXF1ZXN0VXRpbHMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlN0YXR1c1JlcG9ydGVyID0gdm9pZCAwO1xuY29uc3QgY29yZV8xID0gcmVxdWlyZShcIkBhY3Rpb25zL2NvcmVcIik7XG4vKipcbiAqIFN0YXR1cyBSZXBvcnRlciB0aGF0IGRpc3BsYXlzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBwcm9ncmVzcy9zdGF0dXMgb2YgYW4gYXJ0aWZhY3QgdGhhdCBpcyBiZWluZyB1cGxvYWRlZCBvciBkb3dubG9hZGVkXG4gKlxuICogVmFyaWFibGUgZGlzcGxheSB0aW1lIHRoYXQgY2FuIGJlIGFkanVzdGVkIHVzaW5nIHRoZSBkaXNwbGF5RnJlcXVlbmN5SW5NaWxsaXNlY29uZHMgdmFyaWFibGVcbiAqIFRoZSB0b3RhbCBzdGF0dXMgb2YgdGhlIHVwbG9hZC9kb3dubG9hZCBnZXRzIGRpc3BsYXllZCBhY2NvcmRpbmcgdG8gdGhpcyB2YWx1ZVxuICogSWYgdGhlcmUgaXMgYSBsYXJnZSBmaWxlIHRoYXQgaXMgYmVpbmcgdXBsb2FkZWQsIGV4dHJhIGluZm9ybWF0aW9uIGFib3V0IHRoZSBpbmRpdmlkdWFsIHN0YXR1cyBjYW4gYWxzbyBiZSBkaXNwbGF5ZWQgdXNpbmcgdGhlIHVwZGF0ZUxhcmdlRmlsZVN0YXR1cyBmdW5jdGlvblxuICovXG5jbGFzcyBTdGF0dXNSZXBvcnRlciB7XG4gICAgY29uc3RydWN0b3IoZGlzcGxheUZyZXF1ZW5jeUluTWlsbGlzZWNvbmRzKSB7XG4gICAgICAgIHRoaXMudG90YWxOdW1iZXJPZkZpbGVzVG9Qcm9jZXNzID0gMDtcbiAgICAgICAgdGhpcy5wcm9jZXNzZWRDb3VudCA9IDA7XG4gICAgICAgIHRoaXMubGFyZ2VGaWxlcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy50b3RhbEZpbGVTdGF0dXMgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuZGlzcGxheUZyZXF1ZW5jeUluTWlsbGlzZWNvbmRzID0gZGlzcGxheUZyZXF1ZW5jeUluTWlsbGlzZWNvbmRzO1xuICAgIH1cbiAgICBzZXRUb3RhbE51bWJlck9mRmlsZXNUb1Byb2Nlc3MoZmlsZVRvdGFsKSB7XG4gICAgICAgIHRoaXMudG90YWxOdW1iZXJPZkZpbGVzVG9Qcm9jZXNzID0gZmlsZVRvdGFsO1xuICAgICAgICB0aGlzLnByb2Nlc3NlZENvdW50ID0gMDtcbiAgICB9XG4gICAgc3RhcnQoKSB7XG4gICAgICAgIC8vIGRpc3BsYXlzIGluZm9ybWF0aW9uIGFib3V0IHRoZSB0b3RhbCB1cGxvYWQvZG93bmxvYWQgc3RhdHVzXG4gICAgICAgIHRoaXMudG90YWxGaWxlU3RhdHVzID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgLy8gZGlzcGxheSAxIGRlY2ltYWwgcGxhY2Ugd2l0aG91dCBhbnkgcm91bmRpbmdcbiAgICAgICAgICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSB0aGlzLmZvcm1hdFBlcmNlbnRhZ2UodGhpcy5wcm9jZXNzZWRDb3VudCwgdGhpcy50b3RhbE51bWJlck9mRmlsZXNUb1Byb2Nlc3MpO1xuICAgICAgICAgICAgY29yZV8xLmluZm8oYFRvdGFsIGZpbGUgY291bnQ6ICR7dGhpcy50b3RhbE51bWJlck9mRmlsZXNUb1Byb2Nlc3N9IC0tLS0gUHJvY2Vzc2VkIGZpbGUgIyR7dGhpcy5wcm9jZXNzZWRDb3VudH0gKCR7cGVyY2VudGFnZS5zbGljZSgwLCBwZXJjZW50YWdlLmluZGV4T2YoJy4nKSArIDIpfSUpYCk7XG4gICAgICAgIH0sIHRoaXMuZGlzcGxheUZyZXF1ZW5jeUluTWlsbGlzZWNvbmRzKTtcbiAgICB9XG4gICAgLy8gaWYgdGhlcmUgaXMgYSBsYXJnZSBmaWxlIHRoYXQgaXMgYmVpbmcgdXBsb2FkZWQgaW4gY2h1bmtzLCB0aGlzIGlzIHVzZWQgdG8gZGlzcGxheSBleHRyYSBpbmZvcm1hdGlvbiBhYm91dCB0aGUgc3RhdHVzIG9mIHRoZSB1cGxvYWRcbiAgICB1cGRhdGVMYXJnZUZpbGVTdGF0dXMoZmlsZU5hbWUsIGNodW5rU3RhcnRJbmRleCwgY2h1bmtFbmRJbmRleCwgdG90YWxVcGxvYWRGaWxlU2l6ZSkge1xuICAgICAgICAvLyBkaXNwbGF5IDEgZGVjaW1hbCBwbGFjZSB3aXRob3V0IGFueSByb3VuZGluZ1xuICAgICAgICBjb25zdCBwZXJjZW50YWdlID0gdGhpcy5mb3JtYXRQZXJjZW50YWdlKGNodW5rRW5kSW5kZXgsIHRvdGFsVXBsb2FkRmlsZVNpemUpO1xuICAgICAgICBjb3JlXzEuaW5mbyhgVXBsb2FkZWQgJHtmaWxlTmFtZX0gKCR7cGVyY2VudGFnZS5zbGljZSgwLCBwZXJjZW50YWdlLmluZGV4T2YoJy4nKSArIDIpfSUpIGJ5dGVzICR7Y2h1bmtTdGFydEluZGV4fToke2NodW5rRW5kSW5kZXh9YCk7XG4gICAgfVxuICAgIHN0b3AoKSB7XG4gICAgICAgIGlmICh0aGlzLnRvdGFsRmlsZVN0YXR1cykge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRvdGFsRmlsZVN0YXR1cyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaW5jcmVtZW50UHJvY2Vzc2VkQ291bnQoKSB7XG4gICAgICAgIHRoaXMucHJvY2Vzc2VkQ291bnQrKztcbiAgICB9XG4gICAgZm9ybWF0UGVyY2VudGFnZShudW1lcmF0b3IsIGRlbm9taW5hdG9yKSB7XG4gICAgICAgIC8vIHRvRml4ZWQoKSByb3VuZHMsIHNvIHVzZSBleHRyYSBwcmVjaXNpb24gdG8gZGlzcGxheSBhY2N1cmF0ZSBpbmZvcm1hdGlvbiBldmVuIHRob3VnaCA0IGRlY2ltYWwgcGxhY2VzIGFyZSBub3QgZGlzcGxheWVkXG4gICAgICAgIHJldHVybiAoKG51bWVyYXRvciAvIGRlbm9taW5hdG9yKSAqIDEwMCkudG9GaXhlZCg0KS50b1N0cmluZygpO1xuICAgIH1cbn1cbmV4cG9ydHMuU3RhdHVzUmVwb3J0ZXIgPSBTdGF0dXNSZXBvcnRlcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN0YXR1cy1yZXBvcnRlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX3NldE1vZHVsZURlZmF1bHQpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XG59KTtcbnZhciBfX2ltcG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0U3RhcikgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChrICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbnZhciBfX2FzeW5jVmFsdWVzID0gKHRoaXMgJiYgdGhpcy5fX2FzeW5jVmFsdWVzKSB8fCBmdW5jdGlvbiAobykge1xuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XG4gICAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgaTtcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IChvID0gdHlwZW9mIF9fdmFsdWVzID09PSBcImZ1bmN0aW9uXCIgPyBfX3ZhbHVlcyhvKSA6IG9bU3ltYm9sLml0ZXJhdG9yXSgpLCBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaSk7XG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxuICAgIGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIGQsIHYpIHsgUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZnVuY3Rpb24odikgeyByZXNvbHZlKHsgdmFsdWU6IHYsIGRvbmU6IGQgfSk7IH0sIHJlamVjdCk7IH1cbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmNyZWF0ZUdaaXBGaWxlSW5CdWZmZXIgPSBleHBvcnRzLmNyZWF0ZUdaaXBGaWxlT25EaXNrID0gdm9pZCAwO1xuY29uc3QgZnMgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcImZzXCIpKTtcbmNvbnN0IHpsaWIgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcInpsaWJcIikpO1xuY29uc3QgdXRpbF8xID0gcmVxdWlyZShcInV0aWxcIik7XG5jb25zdCBzdGF0ID0gdXRpbF8xLnByb21pc2lmeShmcy5zdGF0KTtcbi8qKlxuICogR1ppcHBpbmcgY2VydGFpbiBmaWxlcyB0aGF0IGFyZSBhbHJlYWR5IGNvbXByZXNzZWQgd2lsbCBsaWtlbHkgbm90IHlpZWxkIGZ1cnRoZXIgc2l6ZSByZWR1Y3Rpb25zLiBDcmVhdGluZyBsYXJnZSB0ZW1wb3JhcnkgZ3ppcFxuICogZmlsZXMgdGhlbiB3aWxsIGp1c3Qgd2FzdGUgYSBsb3Qgb2YgdGltZSBiZWZvcmUgdWx0aW1hdGVseSBiZWluZyBkaXNjYXJkZWQgKGVzcGVjaWFsbHkgZm9yIHZlcnkgbGFyZ2UgZmlsZXMpLlxuICogSWYgYW55IG9mIHRoZXNlIHR5cGVzIG9mIGZpbGVzIGFyZSBlbmNvdW50ZXJlZCB0aGVuIG9uLWRpc2sgZ3ppcCBjcmVhdGlvbiB3aWxsIGJlIHNraXBwZWQgYW5kIHRoZSBvcmlnaW5hbCBmaWxlIHdpbGwgYmUgdXBsb2FkZWQgYXMtaXNcbiAqL1xuY29uc3QgZ3ppcEV4ZW1wdEZpbGVFeHRlbnNpb25zID0gW1xuICAgICcuZ3ppcCcsXG4gICAgJy56aXAnLFxuICAgICcudGFyLmx6JyxcbiAgICAnLnRhci5neicsXG4gICAgJy50YXIuYnoyJyxcbiAgICAnLjd6J1xuXTtcbi8qKlxuICogQ3JlYXRlcyBhIEd6aXAgY29tcHJlc3NlZCBmaWxlIG9mIGFuIG9yaWdpbmFsIGZpbGUgYXQgdGhlIHByb3ZpZGVkIHRlbXBvcmFyeSBmaWxlcGF0aCBsb2NhdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbmFsRmlsZVBhdGggZmlsZXBhdGggb2Ygd2hhdGV2ZXIgd2lsbCBiZSBjb21wcmVzc2VkLiBUaGUgb3JpZ2luYWwgZmlsZSB3aWxsIGJlIHVubW9kaWZpZWRcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZW1wRmlsZVBhdGggdGhlIGxvY2F0aW9uIG9mIHdoZXJlIHRoZSBHemlwIGZpbGUgd2lsbCBiZSBjcmVhdGVkXG4gKiBAcmV0dXJucyB0aGUgc2l6ZSBvZiBnemlwIGZpbGUgdGhhdCBnZXRzIGNyZWF0ZWRcbiAqL1xuZnVuY3Rpb24gY3JlYXRlR1ppcEZpbGVPbkRpc2sob3JpZ2luYWxGaWxlUGF0aCwgdGVtcEZpbGVQYXRoKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgZm9yIChjb25zdCBnemlwRXhlbXB0RXh0ZW5zaW9uIG9mIGd6aXBFeGVtcHRGaWxlRXh0ZW5zaW9ucykge1xuICAgICAgICAgICAgaWYgKG9yaWdpbmFsRmlsZVBhdGguZW5kc1dpdGgoZ3ppcEV4ZW1wdEV4dGVuc2lvbikpIHtcbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gYSByZWFsbHkgbGFyZ2UgbnVtYmVyIHNvIHRoYXQgdGhlIG9yaWdpbmFsIGZpbGUgZ2V0cyB1cGxvYWRlZFxuICAgICAgICAgICAgICAgIHJldHVybiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5wdXRTdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKG9yaWdpbmFsRmlsZVBhdGgpO1xuICAgICAgICAgICAgY29uc3QgZ3ppcCA9IHpsaWIuY3JlYXRlR3ppcCgpO1xuICAgICAgICAgICAgY29uc3Qgb3V0cHV0U3RyZWFtID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0odGVtcEZpbGVQYXRoKTtcbiAgICAgICAgICAgIGlucHV0U3RyZWFtLnBpcGUoZ3ppcCkucGlwZShvdXRwdXRTdHJlYW0pO1xuICAgICAgICAgICAgb3V0cHV0U3RyZWFtLm9uKCdmaW5pc2gnLCAoKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgLy8gd2FpdCBmb3Igc3RyZWFtIHRvIGZpbmlzaCBiZWZvcmUgY2FsY3VsYXRpbmcgdGhlIHNpemUgd2hpY2ggaXMgbmVlZGVkIGFzIHBhcnQgb2YgdGhlIENvbnRlbnQtTGVuZ3RoIGhlYWRlciB3aGVuIHN0YXJ0aW5nIGFuIHVwbG9hZFxuICAgICAgICAgICAgICAgIGNvbnN0IHNpemUgPSAoeWllbGQgc3RhdCh0ZW1wRmlsZVBhdGgpKS5zaXplO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoc2l6ZSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBvdXRwdXRTdHJlYW0ub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJlamVjdDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbmV4cG9ydHMuY3JlYXRlR1ppcEZpbGVPbkRpc2sgPSBjcmVhdGVHWmlwRmlsZU9uRGlzaztcbi8qKlxuICogQ3JlYXRlcyBhIEdaaXAgZmlsZSBpbiBtZW1vcnkgdXNpbmcgYSBidWZmZXIuIFNob3VsZCBiZSB1c2VkIGZvciBzbWFsbGVyIGZpbGVzIHRvIHJlZHVjZSBkaXNrIEkvT1xuICogQHBhcmFtIG9yaWdpbmFsRmlsZVBhdGggdGhlIHBhdGggdG8gdGhlIG9yaWdpbmFsIGZpbGUgdGhhdCBpcyBiZWluZyBHWmlwcGVkXG4gKiBAcmV0dXJucyBhIGJ1ZmZlciB3aXRoIHRoZSBHWmlwIGZpbGVcbiAqL1xuZnVuY3Rpb24gY3JlYXRlR1ppcEZpbGVJbkJ1ZmZlcihvcmlnaW5hbEZpbGVQYXRoKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICB2YXIgZV8xLCBfYTtcbiAgICAgICAgICAgIGNvbnN0IGlucHV0U3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShvcmlnaW5hbEZpbGVQYXRoKTtcbiAgICAgICAgICAgIGNvbnN0IGd6aXAgPSB6bGliLmNyZWF0ZUd6aXAoKTtcbiAgICAgICAgICAgIGlucHV0U3RyZWFtLnBpcGUoZ3ppcCk7XG4gICAgICAgICAgICAvLyByZWFkIHN0cmVhbSBpbnRvIGJ1ZmZlciwgdXNpbmcgZXhwZXJpbWVudGFsIGFzeW5jIGl0ZXJhdG9ycyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9yZWFkYWJsZS1zdHJlYW0vaXNzdWVzLzQwMyNpc3N1ZWNvbW1lbnQtNDc5MDY5MDQzXG4gICAgICAgICAgICBjb25zdCBjaHVua3MgPSBbXTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgZ3ppcF8xID0gX19hc3luY1ZhbHVlcyhnemlwKSwgZ3ppcF8xXzE7IGd6aXBfMV8xID0geWllbGQgZ3ppcF8xLm5leHQoKSwgIWd6aXBfMV8xLmRvbmU7KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rID0gZ3ppcF8xXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGNodW5rcy5wdXNoKGNodW5rKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xXzEpIHsgZV8xID0geyBlcnJvcjogZV8xXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGd6aXBfMV8xICYmICFnemlwXzFfMS5kb25lICYmIChfYSA9IGd6aXBfMS5yZXR1cm4pKSB5aWVsZCBfYS5jYWxsKGd6aXBfMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc29sdmUoQnVmZmVyLmNvbmNhdChjaHVua3MpKTtcbiAgICAgICAgfSkpO1xuICAgIH0pO1xufVxuZXhwb3J0cy5jcmVhdGVHWmlwRmlsZUluQnVmZmVyID0gY3JlYXRlR1ppcEZpbGVJbkJ1ZmZlcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVwbG9hZC1nemlwLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH0pO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKGsgIT09IFwiZGVmYXVsdFwiICYmIE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5VcGxvYWRIdHRwQ2xpZW50ID0gdm9pZCAwO1xuY29uc3QgZnMgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcImZzXCIpKTtcbmNvbnN0IGNvcmUgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcIkBhY3Rpb25zL2NvcmVcIikpO1xuY29uc3QgdG1wID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJ0bXAtcHJvbWlzZVwiKSk7XG5jb25zdCBzdHJlYW0gPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcInN0cmVhbVwiKSk7XG5jb25zdCB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG5jb25zdCBjb25maWdfdmFyaWFibGVzXzEgPSByZXF1aXJlKFwiLi9jb25maWctdmFyaWFibGVzXCIpO1xuY29uc3QgdXRpbF8xID0gcmVxdWlyZShcInV0aWxcIik7XG5jb25zdCB1cmxfMSA9IHJlcXVpcmUoXCJ1cmxcIik7XG5jb25zdCBwZXJmX2hvb2tzXzEgPSByZXF1aXJlKFwicGVyZl9ob29rc1wiKTtcbmNvbnN0IHN0YXR1c19yZXBvcnRlcl8xID0gcmVxdWlyZShcIi4vc3RhdHVzLXJlcG9ydGVyXCIpO1xuY29uc3QgaHR0cF9jbGllbnRfMSA9IHJlcXVpcmUoXCJAYWN0aW9ucy9odHRwLWNsaWVudFwiKTtcbmNvbnN0IGh0dHBfbWFuYWdlcl8xID0gcmVxdWlyZShcIi4vaHR0cC1tYW5hZ2VyXCIpO1xuY29uc3QgdXBsb2FkX2d6aXBfMSA9IHJlcXVpcmUoXCIuL3VwbG9hZC1nemlwXCIpO1xuY29uc3QgcmVxdWVzdFV0aWxzXzEgPSByZXF1aXJlKFwiLi9yZXF1ZXN0VXRpbHNcIik7XG5jb25zdCBzdGF0ID0gdXRpbF8xLnByb21pc2lmeShmcy5zdGF0KTtcbmNsYXNzIFVwbG9hZEh0dHBDbGllbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnVwbG9hZEh0dHBNYW5hZ2VyID0gbmV3IGh0dHBfbWFuYWdlcl8xLkh0dHBNYW5hZ2VyKGNvbmZpZ192YXJpYWJsZXNfMS5nZXRVcGxvYWRGaWxlQ29uY3VycmVuY3koKSwgJ0BhY3Rpb25zL2FydGlmYWN0LXVwbG9hZCcpO1xuICAgICAgICB0aGlzLnN0YXR1c1JlcG9ydGVyID0gbmV3IHN0YXR1c19yZXBvcnRlcl8xLlN0YXR1c1JlcG9ydGVyKDEwMDAwKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGZpbGUgY29udGFpbmVyIGZvciB0aGUgbmV3IGFydGlmYWN0IGluIHRoZSByZW1vdGUgYmxvYiBzdG9yYWdlL2ZpbGUgc2VydmljZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhcnRpZmFjdE5hbWUgTmFtZSBvZiB0aGUgYXJ0aWZhY3QgYmVpbmcgY3JlYXRlZFxuICAgICAqIEByZXR1cm5zIFRoZSByZXNwb25zZSBmcm9tIHRoZSBBcnRpZmFjdCBTZXJ2aWNlIGlmIHRoZSBmaWxlIGNvbnRhaW5lciB3YXMgc3VjY2Vzc2Z1bGx5IGNyZWF0ZWRcbiAgICAgKi9cbiAgICBjcmVhdGVBcnRpZmFjdEluRmlsZUNvbnRhaW5lcihhcnRpZmFjdE5hbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSB7XG4gICAgICAgICAgICAgICAgVHlwZTogJ2FjdGlvbnNfc3RvcmFnZScsXG4gICAgICAgICAgICAgICAgTmFtZTogYXJ0aWZhY3ROYW1lXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHJldGVudGlvbiBwZXJpb2RcbiAgICAgICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMucmV0ZW50aW9uRGF5cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1heFJldGVudGlvblN0ciA9IGNvbmZpZ192YXJpYWJsZXNfMS5nZXRSZXRlbnRpb25EYXlzKCk7XG4gICAgICAgICAgICAgICAgcGFyYW1ldGVycy5SZXRlbnRpb25EYXlzID0gdXRpbHNfMS5nZXRQcm9wZXJSZXRlbnRpb24ob3B0aW9ucy5yZXRlbnRpb25EYXlzLCBtYXhSZXRlbnRpb25TdHIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZGF0YSA9IEpTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMsIG51bGwsIDIpO1xuICAgICAgICAgICAgY29uc3QgYXJ0aWZhY3RVcmwgPSB1dGlsc18xLmdldEFydGlmYWN0VXJsKCk7XG4gICAgICAgICAgICAvLyB1c2UgdGhlIGZpcnN0IGNsaWVudCBmcm9tIHRoZSBodHRwTWFuYWdlciwgYGtlZXAtYWxpdmVgIGlzIG5vdCB1c2VkIHNvIHRoZSBjb25uZWN0aW9uIHdpbGwgY2xvc2UgaW1tZWRpYXRlbHlcbiAgICAgICAgICAgIGNvbnN0IGNsaWVudCA9IHRoaXMudXBsb2FkSHR0cE1hbmFnZXIuZ2V0Q2xpZW50KDApO1xuICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IHV0aWxzXzEuZ2V0VXBsb2FkSGVhZGVycygnYXBwbGljYXRpb24vanNvbicsIGZhbHNlKTtcbiAgICAgICAgICAgIC8vIEV4dHJhIGluZm9ybWF0aW9uIHRvIGRpc3BsYXkgd2hlbiBhIHBhcnRpY3VsYXIgSFRUUCBjb2RlIGlzIHJldHVybmVkXG4gICAgICAgICAgICAvLyBJZiBhIDQwMyBpcyByZXR1cm5lZCB3aGVuIHRyeWluZyB0byBjcmVhdGUgYSBmaWxlIGNvbnRhaW5lciwgdGhlIGN1c3RvbWVyIGhhcyBleGNlZWRlZFxuICAgICAgICAgICAgLy8gdGhlaXIgc3RvcmFnZSBxdW90YSBzbyBubyBuZXcgYXJ0aWZhY3QgY29udGFpbmVycyBjYW4gYmUgY3JlYXRlZFxuICAgICAgICAgICAgY29uc3QgY3VzdG9tRXJyb3JNZXNzYWdlcyA9IG5ldyBNYXAoW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgaHR0cF9jbGllbnRfMS5IdHRwQ29kZXMuRm9yYmlkZGVuLFxuICAgICAgICAgICAgICAgICAgICAnQXJ0aWZhY3Qgc3RvcmFnZSBxdW90YSBoYXMgYmVlbiBoaXQuIFVuYWJsZSB0byB1cGxvYWQgYW55IG5ldyBhcnRpZmFjdHMnXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIGh0dHBfY2xpZW50XzEuSHR0cENvZGVzLkJhZFJlcXVlc3QsXG4gICAgICAgICAgICAgICAgICAgIGBUaGUgYXJ0aWZhY3QgbmFtZSAke2FydGlmYWN0TmFtZX0gaXMgbm90IHZhbGlkLiBSZXF1ZXN0IFVSTCAke2FydGlmYWN0VXJsfWBcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0geWllbGQgcmVxdWVzdFV0aWxzXzEucmV0cnlIdHRwQ2xpZW50UmVxdWVzdCgnQ3JlYXRlIEFydGlmYWN0IENvbnRhaW5lcicsICgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHsgcmV0dXJuIGNsaWVudC5wb3N0KGFydGlmYWN0VXJsLCBkYXRhLCBoZWFkZXJzKTsgfSksIGN1c3RvbUVycm9yTWVzc2FnZXMpO1xuICAgICAgICAgICAgY29uc3QgYm9keSA9IHlpZWxkIHJlc3BvbnNlLnJlYWRCb2R5KCk7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShib2R5KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbmN1cnJlbnRseSB1cGxvYWQgYWxsIG9mIHRoZSBmaWxlcyBpbiBjaHVua3NcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXBsb2FkVXJsIEJhc2UgVXJsIGZvciB0aGUgYXJ0aWZhY3QgdGhhdCB3YXMgY3JlYXRlZFxuICAgICAqIEBwYXJhbSB7U2VhcmNoUmVzdWx0W119IGZpbGVzVG9VcGxvYWQgQSBsaXN0IG9mIGluZm9ybWF0aW9uIGFib3V0IHRoZSBmaWxlcyBiZWluZyB1cGxvYWRlZFxuICAgICAqIEByZXR1cm5zIFRoZSBzaXplIG9mIGFsbCB0aGUgZmlsZXMgdXBsb2FkZWQgaW4gYnl0ZXNcbiAgICAgKi9cbiAgICB1cGxvYWRBcnRpZmFjdFRvRmlsZUNvbnRhaW5lcih1cGxvYWRVcmwsIGZpbGVzVG9VcGxvYWQsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IEZJTEVfQ09OQ1VSUkVOQ1kgPSBjb25maWdfdmFyaWFibGVzXzEuZ2V0VXBsb2FkRmlsZUNvbmN1cnJlbmN5KCk7XG4gICAgICAgICAgICBjb25zdCBNQVhfQ0hVTktfU0laRSA9IGNvbmZpZ192YXJpYWJsZXNfMS5nZXRVcGxvYWRDaHVua1NpemUoKTtcbiAgICAgICAgICAgIGNvcmUuZGVidWcoYEZpbGUgQ29uY3VycmVuY3k6ICR7RklMRV9DT05DVVJSRU5DWX0sIGFuZCBDaHVuayBTaXplOiAke01BWF9DSFVOS19TSVpFfWApO1xuICAgICAgICAgICAgY29uc3QgcGFyYW1ldGVycyA9IFtdO1xuICAgICAgICAgICAgLy8gYnkgZGVmYXVsdCwgZmlsZSB1cGxvYWRzIHdpbGwgY29udGludWUgaWYgdGhlcmUgaXMgYW4gZXJyb3IgdW5sZXNzIHNwZWNpZmllZCBkaWZmZXJlbnRseSBpbiB0aGUgb3B0aW9uc1xuICAgICAgICAgICAgbGV0IGNvbnRpbnVlT25FcnJvciA9IHRydWU7XG4gICAgICAgICAgICBpZiAob3B0aW9ucykge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmNvbnRpbnVlT25FcnJvciA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVPbkVycm9yID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcHJlcGFyZSB0aGUgbmVjZXNzYXJ5IHBhcmFtZXRlcnMgdG8gdXBsb2FkIGFsbCB0aGUgZmlsZXNcbiAgICAgICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlc1RvVXBsb2FkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzb3VyY2VVcmwgPSBuZXcgdXJsXzEuVVJMKHVwbG9hZFVybCk7XG4gICAgICAgICAgICAgICAgcmVzb3VyY2VVcmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnaXRlbVBhdGgnLCBmaWxlLnVwbG9hZEZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLmFic29sdXRlRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlVXJsOiByZXNvdXJjZVVybC50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICBtYXhDaHVua1NpemU6IE1BWF9DSFVOS19TSVpFLFxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZU9uRXJyb3JcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBhcmFsbGVsVXBsb2FkcyA9IFsuLi5uZXcgQXJyYXkoRklMRV9DT05DVVJSRU5DWSkua2V5cygpXTtcbiAgICAgICAgICAgIGNvbnN0IGZhaWxlZEl0ZW1zVG9SZXBvcnQgPSBbXTtcbiAgICAgICAgICAgIGxldCBjdXJyZW50RmlsZSA9IDA7XG4gICAgICAgICAgICBsZXQgY29tcGxldGVkRmlsZXMgPSAwO1xuICAgICAgICAgICAgbGV0IHVwbG9hZEZpbGVTaXplID0gMDtcbiAgICAgICAgICAgIGxldCB0b3RhbEZpbGVTaXplID0gMDtcbiAgICAgICAgICAgIGxldCBhYm9ydFBlbmRpbmdGaWxlVXBsb2FkcyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNSZXBvcnRlci5zZXRUb3RhbE51bWJlck9mRmlsZXNUb1Byb2Nlc3MoZmlsZXNUb1VwbG9hZC5sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNSZXBvcnRlci5zdGFydCgpO1xuICAgICAgICAgICAgLy8gb25seSBhbGxvdyBhIGNlcnRhaW4gYW1vdW50IG9mIGZpbGVzIHRvIGJlIHVwbG9hZGVkIGF0IG9uY2UsIHRoaXMgaXMgZG9uZSB0byByZWR1Y2UgcG90ZW50aWFsIGVycm9yc1xuICAgICAgICAgICAgeWllbGQgUHJvbWlzZS5hbGwocGFyYWxsZWxVcGxvYWRzLm1hcCgoaW5kZXgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICB3aGlsZSAoY3VycmVudEZpbGUgPCBmaWxlc1RvVXBsb2FkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50RmlsZVBhcmFtZXRlcnMgPSBwYXJhbWV0ZXJzW2N1cnJlbnRGaWxlXTtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEZpbGUgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFib3J0UGVuZGluZ0ZpbGVVcGxvYWRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWRJdGVtc1RvUmVwb3J0LnB1c2goY3VycmVudEZpbGVQYXJhbWV0ZXJzLmZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gcGVyZl9ob29rc18xLnBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGxvYWRGaWxlUmVzdWx0ID0geWllbGQgdGhpcy51cGxvYWRGaWxlQXN5bmMoaW5kZXgsIGN1cnJlbnRGaWxlUGFyYW1ldGVycyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb3JlLmlzRGVidWcoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29yZS5kZWJ1ZyhgRmlsZTogJHsrK2NvbXBsZXRlZEZpbGVzfS8ke2ZpbGVzVG9VcGxvYWQubGVuZ3RofS4gJHtjdXJyZW50RmlsZVBhcmFtZXRlcnMuZmlsZX0gdG9vayAkeyhwZXJmX2hvb2tzXzEucGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydFRpbWUpLnRvRml4ZWQoMyl9IG1pbGxpc2Vjb25kcyB0byBmaW5pc2ggdXBsb2FkYCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkRmlsZVNpemUgKz0gdXBsb2FkRmlsZVJlc3VsdC5zdWNjZXNzZnVsVXBsb2FkU2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxGaWxlU2l6ZSArPSB1cGxvYWRGaWxlUmVzdWx0LnRvdGFsU2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVwbG9hZEZpbGVSZXN1bHQuaXNTdWNjZXNzID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkSXRlbXNUb1JlcG9ydC5wdXNoKGN1cnJlbnRGaWxlUGFyYW1ldGVycy5maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY29udGludWVPbkVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmFpbCBmYXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29yZS5lcnJvcihgYWJvcnRpbmcgYXJ0aWZhY3QgdXBsb2FkYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWJvcnRQZW5kaW5nRmlsZVVwbG9hZHMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdHVzUmVwb3J0ZXIuaW5jcmVtZW50UHJvY2Vzc2VkQ291bnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSkpO1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNSZXBvcnRlci5zdG9wKCk7XG4gICAgICAgICAgICAvLyBkb25lIHVwbG9hZGluZywgc2FmZXR5IGRpc3Bvc2UgYWxsIGNvbm5lY3Rpb25zXG4gICAgICAgICAgICB0aGlzLnVwbG9hZEh0dHBNYW5hZ2VyLmRpc3Bvc2VBbmRSZXBsYWNlQWxsQ2xpZW50cygpO1xuICAgICAgICAgICAgY29yZS5pbmZvKGBUb3RhbCBzaXplIG9mIGFsbCB0aGUgZmlsZXMgdXBsb2FkZWQgaXMgJHt1cGxvYWRGaWxlU2l6ZX0gYnl0ZXNgKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXBsb2FkU2l6ZTogdXBsb2FkRmlsZVNpemUsXG4gICAgICAgICAgICAgICAgdG90YWxTaXplOiB0b3RhbEZpbGVTaXplLFxuICAgICAgICAgICAgICAgIGZhaWxlZEl0ZW1zOiBmYWlsZWRJdGVtc1RvUmVwb3J0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQXN5bmNocm9ub3VzbHkgdXBsb2FkcyBhIGZpbGUuIFRoZSBmaWxlIGlzIGNvbXByZXNzZWQgYW5kIHVwbG9hZGVkIHVzaW5nIEdaaXAgaWYgaXQgaXMgZGV0ZXJtaW5lZCB0byBzYXZlIHNwYWNlLlxuICAgICAqIElmIHRoZSB1cGxvYWQgZmlsZSBpcyBiaWdnZXIgdGhhbiB0aGUgbWF4IGNodW5rIHNpemUgaXQgd2lsbCBiZSB1cGxvYWRlZCB2aWEgbXVsdGlwbGUgY2FsbHNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaHR0cENsaWVudEluZGV4IFRoZSBpbmRleCBvZiB0aGUgaHR0cENsaWVudCB0aGF0IGlzIGJlaW5nIHVzZWQgdG8gbWFrZSBhbGwgb2YgdGhlIGNhbGxzXG4gICAgICogQHBhcmFtIHtVcGxvYWRGaWxlUGFyYW1ldGVyc30gcGFyYW1ldGVycyBJbmZvcm1hdGlvbiBhYm91dCB0aGUgZmlsZSB0aGF0IG5lZWRzIHRvIGJlIHVwbG9hZGVkXG4gICAgICogQHJldHVybnMgVGhlIHNpemUgb2YgdGhlIGZpbGUgdGhhdCB3YXMgdXBsb2FkZWQgaW4gYnl0ZXMgYWxvbmcgd2l0aCBhbnkgZmFpbGVkIHVwbG9hZHNcbiAgICAgKi9cbiAgICB1cGxvYWRGaWxlQXN5bmMoaHR0cENsaWVudEluZGV4LCBwYXJhbWV0ZXJzKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlU3RhdCA9IHlpZWxkIHN0YXQocGFyYW1ldGVycy5maWxlKTtcbiAgICAgICAgICAgIGNvbnN0IHRvdGFsRmlsZVNpemUgPSBmaWxlU3RhdC5zaXplO1xuICAgICAgICAgICAgY29uc3QgaXNGSUZPID0gZmlsZVN0YXQuaXNGSUZPKCk7XG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gMDtcbiAgICAgICAgICAgIGxldCBpc1VwbG9hZFN1Y2Nlc3NmdWwgPSB0cnVlO1xuICAgICAgICAgICAgbGV0IGZhaWxlZENodW5rU2l6ZXMgPSAwO1xuICAgICAgICAgICAgbGV0IHVwbG9hZEZpbGVTaXplID0gMDtcbiAgICAgICAgICAgIGxldCBpc0d6aXAgPSB0cnVlO1xuICAgICAgICAgICAgLy8gdGhlIGZpbGUgdGhhdCBpcyBiZWluZyB1cGxvYWRlZCBpcyBsZXNzIHRoYW4gNjRrIGluIHNpemUgdG8gaW5jcmVhc2UgdGhyb3VnaHB1dCBhbmQgdG8gbWluaW1pemUgZGlzayBJL09cbiAgICAgICAgICAgIC8vIGZvciBjcmVhdGluZyBhIG5ldyBHWmlwIGZpbGUsIGFuIGluLW1lbW9yeSBidWZmZXIgaXMgdXNlZCBmb3IgY29tcHJlc3Npb25cbiAgICAgICAgICAgIC8vIHdpdGggbmFtZWQgcGlwZXMgdGhlIGZpbGUgc2l6ZSBpcyByZXBvcnRlZCBhcyB6ZXJvIGluIHRoYXQgY2FzZSBkb24ndCByZWFkIHRoZSBmaWxlIGluIG1lbW9yeVxuICAgICAgICAgICAgaWYgKCFpc0ZJRk8gJiYgdG90YWxGaWxlU2l6ZSA8IDY1NTM2KSB7XG4gICAgICAgICAgICAgICAgY29yZS5kZWJ1ZyhgJHtwYXJhbWV0ZXJzLmZpbGV9IGlzIGxlc3MgdGhhbiA2NGsgaW4gc2l6ZS4gQ3JlYXRpbmcgYSBnemlwIGZpbGUgaW4tbWVtb3J5IHRvIHBvdGVudGlhbGx5IHJlZHVjZSB0aGUgdXBsb2FkIHNpemVgKTtcbiAgICAgICAgICAgICAgICBjb25zdCBidWZmZXIgPSB5aWVsZCB1cGxvYWRfZ3ppcF8xLmNyZWF0ZUdaaXBGaWxlSW5CdWZmZXIocGFyYW1ldGVycy5maWxlKTtcbiAgICAgICAgICAgICAgICAvLyBBbiBvcGVuIHN0cmVhbSBpcyBuZWVkZWQgaW4gdGhlIGV2ZW50IG9mIGEgZmFpbHVyZSBhbmQgd2UgbmVlZCB0byByZXRyeS4gSWYgYSBOb2RlSlMuUmVhZGFibGVTdHJlYW0gaXMgZGlyZWN0bHkgcGFzc2VkIGluLFxuICAgICAgICAgICAgICAgIC8vIGl0IHdpbGwgbm90IHByb3Blcmx5IGdldCByZXNldCB0byB0aGUgc3RhcnQgb2YgdGhlIHN0cmVhbSBpZiBhIGNodW5rIHVwbG9hZCBuZWVkcyB0byBiZSByZXRyaWVkXG4gICAgICAgICAgICAgICAgbGV0IG9wZW5VcGxvYWRTdHJlYW07XG4gICAgICAgICAgICAgICAgaWYgKHRvdGFsRmlsZVNpemUgPCBidWZmZXIuYnl0ZUxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb21wcmVzc2lvbiBkaWQgbm90IGhlbHAgd2l0aCByZWR1Y2luZyB0aGUgc2l6ZSwgdXNlIGEgcmVhZGFibGUgc3RyZWFtIGZyb20gdGhlIG9yaWdpbmFsIGZpbGUgZm9yIHVwbG9hZFxuICAgICAgICAgICAgICAgICAgICBjb3JlLmRlYnVnKGBUaGUgZ3ppcCBmaWxlIGNyZWF0ZWQgZm9yICR7cGFyYW1ldGVycy5maWxlfSBkaWQgbm90IGhlbHAgd2l0aCByZWR1Y2luZyB0aGUgc2l6ZSBvZiB0aGUgZmlsZS4gVGhlIG9yaWdpbmFsIGZpbGUgd2lsbCBiZSB1cGxvYWRlZCBhcy1pc2ApO1xuICAgICAgICAgICAgICAgICAgICBvcGVuVXBsb2FkU3RyZWFtID0gKCkgPT4gZnMuY3JlYXRlUmVhZFN0cmVhbShwYXJhbWV0ZXJzLmZpbGUpO1xuICAgICAgICAgICAgICAgICAgICBpc0d6aXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkRmlsZVNpemUgPSB0b3RhbEZpbGVTaXplO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIGEgcmVhZGFibGUgc3RyZWFtIHVzaW5nIGEgUGFzc1Rocm91Z2ggc3RyZWFtIHRoYXQgaXMgYm90aCByZWFkYWJsZSBhbmQgd3JpdGFibGVcbiAgICAgICAgICAgICAgICAgICAgY29yZS5kZWJ1ZyhgQSBnemlwIGZpbGUgY3JlYXRlZCBmb3IgJHtwYXJhbWV0ZXJzLmZpbGV9IGhlbHBlZCB3aXRoIHJlZHVjaW5nIHRoZSBzaXplIG9mIHRoZSBvcmlnaW5hbCBmaWxlLiBUaGUgZmlsZSB3aWxsIGJlIHVwbG9hZGVkIHVzaW5nIGd6aXAuYCk7XG4gICAgICAgICAgICAgICAgICAgIG9wZW5VcGxvYWRTdHJlYW0gPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXNzVGhyb3VnaCA9IG5ldyBzdHJlYW0uUGFzc1Rocm91Z2goKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhc3NUaHJvdWdoLmVuZChidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhc3NUaHJvdWdoO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB1cGxvYWRGaWxlU2l6ZSA9IGJ1ZmZlci5ieXRlTGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSB5aWVsZCB0aGlzLnVwbG9hZENodW5rKGh0dHBDbGllbnRJbmRleCwgcGFyYW1ldGVycy5yZXNvdXJjZVVybCwgb3BlblVwbG9hZFN0cmVhbSwgMCwgdXBsb2FkRmlsZVNpemUgLSAxLCB1cGxvYWRGaWxlU2l6ZSwgaXNHemlwLCB0b3RhbEZpbGVTaXplKTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjaHVuayBmYWlsZWQgdG8gdXBsb2FkXG4gICAgICAgICAgICAgICAgICAgIGlzVXBsb2FkU3VjY2Vzc2Z1bCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBmYWlsZWRDaHVua1NpemVzICs9IHVwbG9hZEZpbGVTaXplO1xuICAgICAgICAgICAgICAgICAgICBjb3JlLndhcm5pbmcoYEFib3J0aW5nIHVwbG9hZCBmb3IgJHtwYXJhbWV0ZXJzLmZpbGV9IGR1ZSB0byBmYWlsdXJlYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGlzU3VjY2VzczogaXNVcGxvYWRTdWNjZXNzZnVsLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzZnVsVXBsb2FkU2l6ZTogdXBsb2FkRmlsZVNpemUgLSBmYWlsZWRDaHVua1NpemVzLFxuICAgICAgICAgICAgICAgICAgICB0b3RhbFNpemU6IHRvdGFsRmlsZVNpemVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gdGhlIGZpbGUgdGhhdCBpcyBiZWluZyB1cGxvYWRlZCBpcyBncmVhdGVyIHRoYW4gNjRrIGluIHNpemUsIGEgdGVtcG9yYXJ5IGZpbGUgZ2V0cyBjcmVhdGVkIG9uIGRpc2sgdXNpbmcgdGhlXG4gICAgICAgICAgICAgICAgLy8gbnBtIHRtcC1wcm9taXNlIHBhY2thZ2UgYW5kIHRoaXMgZmlsZSBnZXRzIHVzZWQgdG8gY3JlYXRlIGEgR1ppcHBlZCBmaWxlXG4gICAgICAgICAgICAgICAgY29uc3QgdGVtcEZpbGUgPSB5aWVsZCB0bXAuZmlsZSgpO1xuICAgICAgICAgICAgICAgIGNvcmUuZGVidWcoYCR7cGFyYW1ldGVycy5maWxlfSBpcyBncmVhdGVyIHRoYW4gNjRrIGluIHNpemUuIENyZWF0aW5nIGEgZ3ppcCBmaWxlIG9uLWRpc2sgJHt0ZW1wRmlsZS5wYXRofSB0byBwb3RlbnRpYWxseSByZWR1Y2UgdGhlIHVwbG9hZCBzaXplYCk7XG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGEgR1ppcCBmaWxlIG9mIHRoZSBvcmlnaW5hbCBmaWxlIGJlaW5nIHVwbG9hZGVkLCB0aGUgb3JpZ2luYWwgZmlsZSBzaG91bGQgbm90IGJlIG1vZGlmaWVkIGluIGFueSB3YXlcbiAgICAgICAgICAgICAgICB1cGxvYWRGaWxlU2l6ZSA9IHlpZWxkIHVwbG9hZF9nemlwXzEuY3JlYXRlR1ppcEZpbGVPbkRpc2socGFyYW1ldGVycy5maWxlLCB0ZW1wRmlsZS5wYXRoKTtcbiAgICAgICAgICAgICAgICBsZXQgdXBsb2FkRmlsZVBhdGggPSB0ZW1wRmlsZS5wYXRoO1xuICAgICAgICAgICAgICAgIC8vIGNvbXByZXNzaW9uIGRpZCBub3QgaGVscCB3aXRoIHNpemUgcmVkdWN0aW9uLCB1c2UgdGhlIG9yaWdpbmFsIGZpbGUgZm9yIHVwbG9hZCBhbmQgZGVsZXRlIHRoZSB0ZW1wIEdaaXAgZmlsZVxuICAgICAgICAgICAgICAgIC8vIGZvciBuYW1lZCBwaXBlcyB0b3RhbEZpbGVTaXplIGlzIHplcm8sIHRoaXMgYXNzdW1lcyBjb21wcmVzc2lvbiBkaWQgaGVscFxuICAgICAgICAgICAgICAgIGlmICghaXNGSUZPICYmIHRvdGFsRmlsZVNpemUgPCB1cGxvYWRGaWxlU2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb3JlLmRlYnVnKGBUaGUgZ3ppcCBmaWxlIGNyZWF0ZWQgZm9yICR7cGFyYW1ldGVycy5maWxlfSBkaWQgbm90IGhlbHAgd2l0aCByZWR1Y2luZyB0aGUgc2l6ZSBvZiB0aGUgZmlsZS4gVGhlIG9yaWdpbmFsIGZpbGUgd2lsbCBiZSB1cGxvYWRlZCBhcy1pc2ApO1xuICAgICAgICAgICAgICAgICAgICB1cGxvYWRGaWxlU2l6ZSA9IHRvdGFsRmlsZVNpemU7XG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZEZpbGVQYXRoID0gcGFyYW1ldGVycy5maWxlO1xuICAgICAgICAgICAgICAgICAgICBpc0d6aXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvcmUuZGVidWcoYFRoZSBnemlwIGZpbGUgY3JlYXRlZCBmb3IgJHtwYXJhbWV0ZXJzLmZpbGV9IGlzIHNtYWxsZXIgdGhhbiB0aGUgb3JpZ2luYWwgZmlsZS4gVGhlIGZpbGUgd2lsbCBiZSB1cGxvYWRlZCB1c2luZyBnemlwLmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgYWJvcnRGaWxlVXBsb2FkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgLy8gdXBsb2FkIG9ubHkgYSBzaW5nbGUgY2h1bmsgYXQgYSB0aW1lXG4gICAgICAgICAgICAgICAgd2hpbGUgKG9mZnNldCA8IHVwbG9hZEZpbGVTaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rU2l6ZSA9IE1hdGgubWluKHVwbG9hZEZpbGVTaXplIC0gb2Zmc2V0LCBwYXJhbWV0ZXJzLm1heENodW5rU2l6ZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0Q2h1bmtJbmRleCA9IG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kQ2h1bmtJbmRleCA9IG9mZnNldCArIGNodW5rU2l6ZSAtIDE7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCArPSBwYXJhbWV0ZXJzLm1heENodW5rU2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFib3J0RmlsZVVwbG9hZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgd2UgZG9uJ3Qgd2FudCB0byBjb250aW51ZSBpbiB0aGUgZXZlbnQgb2YgYW4gZXJyb3IsIGFueSBwZW5kaW5nIHVwbG9hZCBjaHVua3Mgd2lsbCBiZSBtYXJrZWQgYXMgZmFpbGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWRDaHVua1NpemVzICs9IGNodW5rU2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHlpZWxkIHRoaXMudXBsb2FkQ2h1bmsoaHR0cENsaWVudEluZGV4LCBwYXJhbWV0ZXJzLnJlc291cmNlVXJsLCAoKSA9PiBmcy5jcmVhdGVSZWFkU3RyZWFtKHVwbG9hZEZpbGVQYXRoLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogc3RhcnRDaHVua0luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kOiBlbmRDaHVua0luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0Nsb3NlOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9KSwgc3RhcnRDaHVua0luZGV4LCBlbmRDaHVua0luZGV4LCB1cGxvYWRGaWxlU2l6ZSwgaXNHemlwLCB0b3RhbEZpbGVTaXplKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENodW5rIGZhaWxlZCB0byB1cGxvYWQsIHJlcG9ydCBhcyBmYWlsZWQgYW5kIGRvIG5vdCBjb250aW51ZSB1cGxvYWRpbmcgYW55IG1vcmUgY2h1bmtzIGZvciB0aGUgZmlsZS4gSXQgaXMgcG9zc2libGUgdGhhdCBwYXJ0IG9mIGEgY2h1bmsgd2FzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzdWNjZXNzZnVsbHkgdXBsb2FkZWQgc28gdGhlIHNlcnZlciBtYXkgcmVwb3J0IGEgZGlmZmVyZW50IHNpemUgZm9yIHdoYXQgd2FzIHVwbG9hZGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBpc1VwbG9hZFN1Y2Nlc3NmdWwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxlZENodW5rU2l6ZXMgKz0gY2h1bmtTaXplO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29yZS53YXJuaW5nKGBBYm9ydGluZyB1cGxvYWQgZm9yICR7cGFyYW1ldGVycy5maWxlfSBkdWUgdG8gZmFpbHVyZWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWJvcnRGaWxlVXBsb2FkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGFuIGluZGl2aWR1YWwgZmlsZSBpcyBncmVhdGVyIHRoYW4gOE1CICgxMDI0KjEwMjQqOCkgaW4gc2l6ZSwgZGlzcGxheSBleHRyYSBpbmZvcm1hdGlvbiBhYm91dCB0aGUgdXBsb2FkIHN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVwbG9hZEZpbGVTaXplID4gODM4ODYwOCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdHVzUmVwb3J0ZXIudXBkYXRlTGFyZ2VGaWxlU3RhdHVzKHBhcmFtZXRlcnMuZmlsZSwgc3RhcnRDaHVua0luZGV4LCBlbmRDaHVua0luZGV4LCB1cGxvYWRGaWxlU2l6ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gRGVsZXRlIHRoZSB0ZW1wb3JhcnkgZmlsZSB0aGF0IHdhcyBjcmVhdGVkIGFzIHBhcnQgb2YgdGhlIHVwbG9hZC4gSWYgdGhlIHRlbXAgZmlsZSBkb2VzIG5vdCBnZXQgbWFudWFsbHkgZGVsZXRlZCBieVxuICAgICAgICAgICAgICAgIC8vIGNhbGxpbmcgY2xlYW51cCwgaXQgZ2V0cyByZW1vdmVkIHdoZW4gdGhlIG5vZGUgcHJvY2VzcyBleGl0cy4gRm9yIG1vcmUgaW5mbyBzZWU6IGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL3RtcC1wcm9taXNlI2Fib3V0XG4gICAgICAgICAgICAgICAgY29yZS5kZWJ1ZyhgZGVsZXRpbmcgdGVtcG9yYXJ5IGd6aXAgZmlsZSAke3RlbXBGaWxlLnBhdGh9YCk7XG4gICAgICAgICAgICAgICAgeWllbGQgdGVtcEZpbGUuY2xlYW51cCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGlzU3VjY2VzczogaXNVcGxvYWRTdWNjZXNzZnVsLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzZnVsVXBsb2FkU2l6ZTogdXBsb2FkRmlsZVNpemUgLSBmYWlsZWRDaHVua1NpemVzLFxuICAgICAgICAgICAgICAgICAgICB0b3RhbFNpemU6IHRvdGFsRmlsZVNpemVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXBsb2FkcyBhIGNodW5rIG9mIGFuIGluZGl2aWR1YWwgZmlsZSB0byB0aGUgc3BlY2lmaWVkIHJlc291cmNlVXJsLiBJZiB0aGUgdXBsb2FkIGZhaWxzIGFuZCB0aGUgc3RhdHVzIGNvZGVcbiAgICAgKiBpbmRpY2F0ZXMgYSByZXRyeWFibGUgc3RhdHVzLCB3ZSB0cnkgdG8gdXBsb2FkIHRoZSBjaHVuayBhcyB3ZWxsXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGh0dHBDbGllbnRJbmRleCBUaGUgaW5kZXggb2YgdGhlIGh0dHBDbGllbnQgYmVpbmcgdXNlZCB0byBtYWtlIGFsbCB0aGUgbmVjZXNzYXJ5IGNhbGxzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJlc291cmNlVXJsIFVybCBvZiB0aGUgcmVzb3VyY2UgdGhhdCB0aGUgY2h1bmsgd2lsbCBiZSB1cGxvYWRlZCB0b1xuICAgICAqIEBwYXJhbSB7Tm9kZUpTLlJlYWRhYmxlU3RyZWFtfSBvcGVuU3RyZWFtIFN0cmVhbSBvZiB0aGUgZmlsZSB0aGF0IHdpbGwgYmUgdXBsb2FkZWRcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnQgU3RhcnRpbmcgYnl0ZSBpbmRleCBvZiBmaWxlIHRoYXQgdGhlIGNodW5rIGJlbG9uZ3MgdG9cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZW5kIEVuZGluZyBieXRlIGluZGV4IG9mIGZpbGUgdGhhdCB0aGUgY2h1bmsgYmVsb25ncyB0b1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB1cGxvYWRGaWxlU2l6ZSBUb3RhbCBzaXplIG9mIHRoZSBmaWxlIGluIGJ5dGVzIHRoYXQgaXMgYmVpbmcgdXBsb2FkZWRcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzR3ppcCBEZW5vdGVzIGlmIHdlIGFyZSB1cGxvYWRpbmcgYSBHemlwIGNvbXByZXNzZWQgc3RyZWFtXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRvdGFsRmlsZVNpemUgT3JpZ2luYWwgdG90YWwgc2l6ZSBvZiB0aGUgZmlsZSB0aGF0IGlzIGJlaW5nIHVwbG9hZGVkXG4gICAgICogQHJldHVybnMgaWYgdGhlIGNodW5rIHdhcyBzdWNjZXNzZnVsbHkgdXBsb2FkZWRcbiAgICAgKi9cbiAgICB1cGxvYWRDaHVuayhodHRwQ2xpZW50SW5kZXgsIHJlc291cmNlVXJsLCBvcGVuU3RyZWFtLCBzdGFydCwgZW5kLCB1cGxvYWRGaWxlU2l6ZSwgaXNHemlwLCB0b3RhbEZpbGVTaXplKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyBvcGVuIGEgbmV3IHN0cmVhbSBhbmQgcmVhZCBpdCB0byBjb21wdXRlIHRoZSBkaWdlc3RcbiAgICAgICAgICAgIGNvbnN0IGRpZ2VzdCA9IHlpZWxkIHV0aWxzXzEuZGlnZXN0Rm9yU3RyZWFtKG9wZW5TdHJlYW0oKSk7XG4gICAgICAgICAgICAvLyBwcmVwYXJlIGFsbCB0aGUgbmVjZXNzYXJ5IGhlYWRlcnMgYmVmb3JlIG1ha2luZyBhbnkgaHR0cCBjYWxsXG4gICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gdXRpbHNfMS5nZXRVcGxvYWRIZWFkZXJzKCdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nLCB0cnVlLCBpc0d6aXAsIHRvdGFsRmlsZVNpemUsIGVuZCAtIHN0YXJ0ICsgMSwgdXRpbHNfMS5nZXRDb250ZW50UmFuZ2Uoc3RhcnQsIGVuZCwgdXBsb2FkRmlsZVNpemUpLCBkaWdlc3QpO1xuICAgICAgICAgICAgY29uc3QgdXBsb2FkQ2h1bmtSZXF1ZXN0ID0gKCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNsaWVudCA9IHRoaXMudXBsb2FkSHR0cE1hbmFnZXIuZ2V0Q2xpZW50KGh0dHBDbGllbnRJbmRleCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkIGNsaWVudC5zZW5kU3RyZWFtKCdQVVQnLCByZXNvdXJjZVVybCwgb3BlblN0cmVhbSgpLCBoZWFkZXJzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IHJldHJ5Q291bnQgPSAwO1xuICAgICAgICAgICAgY29uc3QgcmV0cnlMaW1pdCA9IGNvbmZpZ192YXJpYWJsZXNfMS5nZXRSZXRyeUxpbWl0KCk7XG4gICAgICAgICAgICAvLyBJbmNyZW1lbnRzIHRoZSBjdXJyZW50IHJldHJ5IGNvdW50IGFuZCB0aGVuIGNoZWNrcyBpZiB0aGUgcmV0cnkgbGltaXQgaGFzIGJlZW4gcmVhY2hlZFxuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaGF2ZSBiZWVuIHRvbyBtYW55IHJldHJpZXMsIGZhaWwgc28gdGhlIGRvd25sb2FkIHN0b3BzXG4gICAgICAgICAgICBjb25zdCBpbmNyZW1lbnRBbmRDaGVja1JldHJ5TGltaXQgPSAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICByZXRyeUNvdW50Kys7XG4gICAgICAgICAgICAgICAgaWYgKHJldHJ5Q291bnQgPiByZXRyeUxpbWl0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXRpbHNfMS5kaXNwbGF5SHR0cERpYWdub3N0aWNzKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb3JlLmluZm8oYFJldHJ5IGxpbWl0IGhhcyBiZWVuIHJlYWNoZWQgZm9yIGNodW5rIGF0IG9mZnNldCAke3N0YXJ0fSB0byAke3Jlc291cmNlVXJsfWApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IGJhY2tPZmYgPSAocmV0cnlBZnRlclZhbHVlKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGxvYWRIdHRwTWFuYWdlci5kaXNwb3NlQW5kUmVwbGFjZUNsaWVudChodHRwQ2xpZW50SW5kZXgpO1xuICAgICAgICAgICAgICAgIGlmIChyZXRyeUFmdGVyVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29yZS5pbmZvKGBCYWNrb2ZmIGR1ZSB0byB0b28gbWFueSByZXF1ZXN0cywgcmV0cnkgIyR7cmV0cnlDb3VudH0uIFdhaXRpbmcgZm9yICR7cmV0cnlBZnRlclZhbHVlfSBtaWxsaXNlY29uZHMgYmVmb3JlIGNvbnRpbnVpbmcgdGhlIHVwbG9hZGApO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCB1dGlsc18xLnNsZWVwKHJldHJ5QWZ0ZXJWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBiYWNrb2ZmVGltZSA9IHV0aWxzXzEuZ2V0RXhwb25lbnRpYWxSZXRyeVRpbWVJbk1pbGxpc2Vjb25kcyhyZXRyeUNvdW50KTtcbiAgICAgICAgICAgICAgICAgICAgY29yZS5pbmZvKGBFeHBvbmVudGlhbCBiYWNrb2ZmIGZvciByZXRyeSAjJHtyZXRyeUNvdW50fS4gV2FpdGluZyBmb3IgJHtiYWNrb2ZmVGltZX0gbWlsbGlzZWNvbmRzIGJlZm9yZSBjb250aW51aW5nIHRoZSB1cGxvYWQgYXQgb2Zmc2V0ICR7c3RhcnR9YCk7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIHV0aWxzXzEuc2xlZXAoYmFja29mZlRpbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb3JlLmluZm8oYEZpbmlzaGVkIGJhY2tvZmYgZm9yIHJldHJ5ICMke3JldHJ5Q291bnR9LCBjb250aW51aW5nIHdpdGggdXBsb2FkYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBhbGxvdyBmb3IgZmFpbGVkIGNodW5rcyB0byBiZSByZXRyaWVkIG11bHRpcGxlIHRpbWVzXG4gICAgICAgICAgICB3aGlsZSAocmV0cnlDb3VudCA8PSByZXRyeUxpbWl0KSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlID0geWllbGQgdXBsb2FkQ2h1bmtSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiBhbiBlcnJvciBpcyBjYXVnaHQsIGl0IGlzIHVzdWFsbHkgaW5kaWNhdGl2ZSBvZiBhIHRpbWVvdXQgc28gcmV0cnkgdGhlIHVwbG9hZFxuICAgICAgICAgICAgICAgICAgICBjb3JlLmluZm8oYEFuIGVycm9yIGhhcyBiZWVuIGNhdWdodCBodHRwLWNsaWVudCBpbmRleCAke2h0dHBDbGllbnRJbmRleH0sIHJldHJ5aW5nIHRoZSB1cGxvYWRgKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5jcmVtZW50QW5kQ2hlY2tSZXRyeUxpbWl0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB5aWVsZCBiYWNrT2ZmKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBBbHdheXMgcmVhZCB0aGUgYm9keSBvZiB0aGUgcmVzcG9uc2UuIFRoZXJlIGlzIHBvdGVudGlhbCBmb3IgYSByZXNvdXJjZSBsZWFrIGlmIHRoZSBib2R5IGlzIG5vdCByZWFkIHdoaWNoIHdpbGxcbiAgICAgICAgICAgICAgICAvLyByZXN1bHQgaW4gdGhlIGNvbm5lY3Rpb24gcmVtYWluaW5nIG9wZW4gYWxvbmcgd2l0aCB1bmludGVuZGVkIGNvbnNlcXVlbmNlcyB3aGVuIHRyeWluZyB0byBkaXNwb3NlIG9mIHRoZSBjbGllbnRcbiAgICAgICAgICAgICAgICB5aWVsZCByZXNwb25zZS5yZWFkQm9keSgpO1xuICAgICAgICAgICAgICAgIGlmICh1dGlsc18xLmlzU3VjY2Vzc1N0YXR1c0NvZGUocmVzcG9uc2UubWVzc2FnZS5zdGF0dXNDb2RlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodXRpbHNfMS5pc1JldHJ5YWJsZVN0YXR1c0NvZGUocmVzcG9uc2UubWVzc2FnZS5zdGF0dXNDb2RlKSkge1xuICAgICAgICAgICAgICAgICAgICBjb3JlLmluZm8oYEEgJHtyZXNwb25zZS5tZXNzYWdlLnN0YXR1c0NvZGV9IHN0YXR1cyBjb2RlIGhhcyBiZWVuIHJlY2VpdmVkLCB3aWxsIGF0dGVtcHQgdG8gcmV0cnkgdGhlIHVwbG9hZGApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5jcmVtZW50QW5kQ2hlY2tSZXRyeUxpbWl0KHJlc3BvbnNlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHV0aWxzXzEuaXNUaHJvdHRsZWRTdGF0dXNDb2RlKHJlc3BvbnNlLm1lc3NhZ2Uuc3RhdHVzQ29kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgID8geWllbGQgYmFja09mZih1dGlsc18xLnRyeUdldFJldHJ5QWZ0ZXJWYWx1ZVRpbWVJbk1pbGxpc2Vjb25kcyhyZXNwb25zZS5tZXNzYWdlLmhlYWRlcnMpKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB5aWVsZCBiYWNrT2ZmKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb3JlLmVycm9yKGBVbmV4cGVjdGVkIHJlc3BvbnNlLiBVbmFibGUgdG8gdXBsb2FkIGNodW5rIHRvICR7cmVzb3VyY2VVcmx9YCk7XG4gICAgICAgICAgICAgICAgICAgIHV0aWxzXzEuZGlzcGxheUh0dHBEaWFnbm9zdGljcyhyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIHRoZSBzaXplIG9mIHRoZSBhcnRpZmFjdCBmcm9tIC0xIHdoaWNoIHdhcyBpbml0aWFsbHkgc2V0IHdoZW4gdGhlIGNvbnRhaW5lciB3YXMgZmlyc3QgY3JlYXRlZCBmb3IgdGhlIGFydGlmYWN0LlxuICAgICAqIFVwZGF0aW5nIHRoZSBzaXplIGluZGljYXRlcyB0aGF0IHdlIGFyZSBkb25lIHVwbG9hZGluZyBhbGwgdGhlIGNvbnRlbnRzIG9mIHRoZSBhcnRpZmFjdFxuICAgICAqL1xuICAgIHBhdGNoQXJ0aWZhY3RTaXplKHNpemUsIGFydGlmYWN0TmFtZSkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgcmVzb3VyY2VVcmwgPSBuZXcgdXJsXzEuVVJMKHV0aWxzXzEuZ2V0QXJ0aWZhY3RVcmwoKSk7XG4gICAgICAgICAgICByZXNvdXJjZVVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdhcnRpZmFjdE5hbWUnLCBhcnRpZmFjdE5hbWUpO1xuICAgICAgICAgICAgY29uc3QgcGFyYW1ldGVycyA9IHsgU2l6ZTogc2l6ZSB9O1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IEpTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMsIG51bGwsIDIpO1xuICAgICAgICAgICAgY29yZS5kZWJ1ZyhgVVJMIGlzICR7cmVzb3VyY2VVcmwudG9TdHJpbmcoKX1gKTtcbiAgICAgICAgICAgIC8vIHVzZSB0aGUgZmlyc3QgY2xpZW50IGZyb20gdGhlIGh0dHBNYW5hZ2VyLCBga2VlcC1hbGl2ZWAgaXMgbm90IHVzZWQgc28gdGhlIGNvbm5lY3Rpb24gd2lsbCBjbG9zZSBpbW1lZGlhdGVseVxuICAgICAgICAgICAgY29uc3QgY2xpZW50ID0gdGhpcy51cGxvYWRIdHRwTWFuYWdlci5nZXRDbGllbnQoMCk7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gdXRpbHNfMS5nZXRVcGxvYWRIZWFkZXJzKCdhcHBsaWNhdGlvbi9qc29uJywgZmFsc2UpO1xuICAgICAgICAgICAgLy8gRXh0cmEgaW5mb3JtYXRpb24gdG8gZGlzcGxheSB3aGVuIGEgcGFydGljdWxhciBIVFRQIGNvZGUgaXMgcmV0dXJuZWRcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbUVycm9yTWVzc2FnZXMgPSBuZXcgTWFwKFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIGh0dHBfY2xpZW50XzEuSHR0cENvZGVzLk5vdEZvdW5kLFxuICAgICAgICAgICAgICAgICAgICBgQW4gQXJ0aWZhY3Qgd2l0aCB0aGUgbmFtZSAke2FydGlmYWN0TmFtZX0gd2FzIG5vdCBmb3VuZGBcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIC8vIFRPRE8gcmV0cnkgZm9yIGFsbCBwb3NzaWJsZSByZXNwb25zZSBjb2RlcywgdGhlIGFydGlmYWN0IHVwbG9hZCBpcyBwcmV0dHkgbXVjaCBjb21wbGV0ZSBzbyBpdCBhdCBhbGwgY29zdHMgd2Ugc2hvdWxkIHRyeSB0byBmaW5pc2ggdGhpc1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB5aWVsZCByZXF1ZXN0VXRpbHNfMS5yZXRyeUh0dHBDbGllbnRSZXF1ZXN0KCdGaW5hbGl6ZSBhcnRpZmFjdCB1cGxvYWQnLCAoKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7IHJldHVybiBjbGllbnQucGF0Y2gocmVzb3VyY2VVcmwudG9TdHJpbmcoKSwgZGF0YSwgaGVhZGVycyk7IH0pLCBjdXN0b21FcnJvck1lc3NhZ2VzKTtcbiAgICAgICAgICAgIHlpZWxkIHJlc3BvbnNlLnJlYWRCb2R5KCk7XG4gICAgICAgICAgICBjb3JlLmRlYnVnKGBBcnRpZmFjdCAke2FydGlmYWN0TmFtZX0gaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IHVwbG9hZGVkLCB0b3RhbCBzaXplIGluIGJ5dGVzOiAke3NpemV9YCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuVXBsb2FkSHR0cENsaWVudCA9IFVwbG9hZEh0dHBDbGllbnQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD11cGxvYWQtaHR0cC1jbGllbnQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19zZXRNb2R1bGVEZWZhdWx0KSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xufSkgOiBmdW5jdGlvbihvLCB2KSB7XG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xufSk7XG52YXIgX19pbXBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydFN0YXIpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5nZXRVcGxvYWRTcGVjaWZpY2F0aW9uID0gdm9pZCAwO1xuY29uc3QgZnMgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcImZzXCIpKTtcbmNvbnN0IGNvcmVfMSA9IHJlcXVpcmUoXCJAYWN0aW9ucy9jb3JlXCIpO1xuY29uc3QgcGF0aF8xID0gcmVxdWlyZShcInBhdGhcIik7XG5jb25zdCBwYXRoX2FuZF9hcnRpZmFjdF9uYW1lX3ZhbGlkYXRpb25fMSA9IHJlcXVpcmUoXCIuL3BhdGgtYW5kLWFydGlmYWN0LW5hbWUtdmFsaWRhdGlvblwiKTtcbi8qKlxuICogQ3JlYXRlcyBhIHNwZWNpZmljYXRpb24gdGhhdCBkZXNjcmliZXMgaG93IGVhY2ggZmlsZSB0aGF0IGlzIHBhcnQgb2YgdGhlIGFydGlmYWN0IHdpbGwgYmUgdXBsb2FkZWRcbiAqIEBwYXJhbSBhcnRpZmFjdE5hbWUgdGhlIG5hbWUgb2YgdGhlIGFydGlmYWN0IGJlaW5nIHVwbG9hZGVkLiBVc2VkIGR1cmluZyB1cGxvYWQgdG8gZGVub3RlIHdoZXJlIHRoZSBhcnRpZmFjdCBpcyBzdG9yZWQgb24gdGhlIHNlcnZlclxuICogQHBhcmFtIHJvb3REaXJlY3RvcnkgYW4gYWJzb2x1dGUgZmlsZSBwYXRoIHRoYXQgZGVub3RlcyB0aGUgcGF0aCB0aGF0IHNob3VsZCBiZSByZW1vdmVkIGZyb20gdGhlIGJlZ2lubmluZyBvZiBlYWNoIGFydGlmYWN0IGZpbGVcbiAqIEBwYXJhbSBhcnRpZmFjdEZpbGVzIGEgbGlzdCBvZiBhYnNvbHV0ZSBmaWxlIHBhdGhzIHRoYXQgZGVub3RlIHdoYXQgc2hvdWxkIGJlIHVwbG9hZGVkIGFzIHBhcnQgb2YgdGhlIGFydGlmYWN0XG4gKi9cbmZ1bmN0aW9uIGdldFVwbG9hZFNwZWNpZmljYXRpb24oYXJ0aWZhY3ROYW1lLCByb290RGlyZWN0b3J5LCBhcnRpZmFjdEZpbGVzKSB7XG4gICAgLy8gYXJ0aWZhY3QgbmFtZSB3YXMgY2hlY2tlZCBlYXJsaWVyIG9uLCBubyBuZWVkIHRvIGNoZWNrIGFnYWluXG4gICAgY29uc3Qgc3BlY2lmaWNhdGlvbnMgPSBbXTtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMocm9vdERpcmVjdG9yeSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm92aWRlZCByb290RGlyZWN0b3J5ICR7cm9vdERpcmVjdG9yeX0gZG9lcyBub3QgZXhpc3RgKTtcbiAgICB9XG4gICAgaWYgKCFmcy5sc3RhdFN5bmMocm9vdERpcmVjdG9yeSkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3ZpZGVkIHJvb3REaXJlY3RvcnkgJHtyb290RGlyZWN0b3J5fSBpcyBub3QgYSB2YWxpZCBkaXJlY3RvcnlgKTtcbiAgICB9XG4gICAgLy8gTm9ybWFsaXplIGFuZCByZXNvbHZlLCB0aGlzIGFsbG93cyBmb3IgZWl0aGVyIGFic29sdXRlIG9yIHJlbGF0aXZlIHBhdGhzIHRvIGJlIHVzZWRcbiAgICByb290RGlyZWN0b3J5ID0gcGF0aF8xLm5vcm1hbGl6ZShyb290RGlyZWN0b3J5KTtcbiAgICByb290RGlyZWN0b3J5ID0gcGF0aF8xLnJlc29sdmUocm9vdERpcmVjdG9yeSk7XG4gICAgLypcbiAgICAgICBFeGFtcGxlIHRvIGRlbW9uc3RyYXRlIGJlaGF2aW9yXG4gICAgICAgXG4gICAgICAgSW5wdXQ6XG4gICAgICAgICBhcnRpZmFjdE5hbWU6IG15LWFydGlmYWN0XG4gICAgICAgICByb290RGlyZWN0b3J5OiAnL2hvbWUvdXNlci9maWxlcy9wbHotdXBsb2FkJ1xuICAgICAgICAgYXJ0aWZhY3RGaWxlczogW1xuICAgICAgICAgICAnL2hvbWUvdXNlci9maWxlcy9wbHotdXBsb2FkL2ZpbGUxLnR4dCcsXG4gICAgICAgICAgICcvaG9tZS91c2VyL2ZpbGVzL3Bsei11cGxvYWQvZmlsZTIudHh0JyxcbiAgICAgICAgICAgJy9ob21lL3VzZXIvZmlsZXMvcGx6LXVwbG9hZC9kaXIvZmlsZTMudHh0J1xuICAgICAgICAgXVxuICAgICAgIFxuICAgICAgIE91dHB1dDpcbiAgICAgICAgIHNwZWNpZmljYXRpb25zOiBbXG4gICAgICAgICAgIFsnL2hvbWUvdXNlci9maWxlcy9wbHotdXBsb2FkL2ZpbGUxLnR4dCcsICdteS1hcnRpZmFjdC9maWxlMS50eHQnXSxcbiAgICAgICAgICAgWycvaG9tZS91c2VyL2ZpbGVzL3Bsei11cGxvYWQvZmlsZTEudHh0JywgJ215LWFydGlmYWN0L2ZpbGUyLnR4dCddLFxuICAgICAgICAgICBbJy9ob21lL3VzZXIvZmlsZXMvcGx6LXVwbG9hZC9maWxlMS50eHQnLCAnbXktYXJ0aWZhY3QvZGlyL2ZpbGUzLnR4dCddXG4gICAgICAgICBdXG4gICAgKi9cbiAgICBmb3IgKGxldCBmaWxlIG9mIGFydGlmYWN0RmlsZXMpIHtcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGZpbGUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZpbGUgJHtmaWxlfSBkb2VzIG5vdCBleGlzdGApO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZnMubHN0YXRTeW5jKGZpbGUpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgIC8vIE5vcm1hbGl6ZSBhbmQgcmVzb2x2ZSwgdGhpcyBhbGxvd3MgZm9yIGVpdGhlciBhYnNvbHV0ZSBvciByZWxhdGl2ZSBwYXRocyB0byBiZSB1c2VkXG4gICAgICAgICAgICBmaWxlID0gcGF0aF8xLm5vcm1hbGl6ZShmaWxlKTtcbiAgICAgICAgICAgIGZpbGUgPSBwYXRoXzEucmVzb2x2ZShmaWxlKTtcbiAgICAgICAgICAgIGlmICghZmlsZS5zdGFydHNXaXRoKHJvb3REaXJlY3RvcnkpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgcm9vdERpcmVjdG9yeTogJHtyb290RGlyZWN0b3J5fSBpcyBub3QgYSBwYXJlbnQgZGlyZWN0b3J5IG9mIHRoZSBmaWxlOiAke2ZpbGV9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgZm9yYmlkZGVuIGNoYXJhY3RlcnMgaW4gZmlsZSBwYXRocyB0aGF0IHdpbGwgYmUgcmVqZWN0ZWQgZHVyaW5nIHVwbG9hZFxuICAgICAgICAgICAgY29uc3QgdXBsb2FkUGF0aCA9IGZpbGUucmVwbGFjZShyb290RGlyZWN0b3J5LCAnJyk7XG4gICAgICAgICAgICBwYXRoX2FuZF9hcnRpZmFjdF9uYW1lX3ZhbGlkYXRpb25fMS5jaGVja0FydGlmYWN0RmlsZVBhdGgodXBsb2FkUGF0aCk7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICB1cGxvYWRGaWxlUGF0aCBkZW5vdGVzIHdoZXJlIHRoZSBmaWxlIHdpbGwgYmUgdXBsb2FkZWQgaW4gdGhlIGZpbGUgY29udGFpbmVyIG9uIHRoZSBzZXJ2ZXIuIER1cmluZyBhIHJ1biwgaWYgbXVsdGlwbGUgYXJ0aWZhY3RzIGFyZSB1cGxvYWRlZCwgdGhleSB3aWxsIGFsbFxuICAgICAgICAgICAgICBiZSBzYXZlZCBpbiB0aGUgc2FtZSBjb250YWluZXIuIFRoZSBhcnRpZmFjdCBuYW1lIGlzIHVzZWQgYXMgdGhlIHJvb3QgZGlyZWN0b3J5IGluIHRoZSBjb250YWluZXIgdG8gc2VwYXJhdGUgYW5kIGRpc3Rpbmd1aXNoIHVwbG9hZGVkIGFydGlmYWN0c1xuICAgICAgXG4gICAgICAgICAgICAgIHBhdGguam9pbiBoYW5kbGVzIGFsbCB0aGUgZm9sbG93aW5nIGNhc2VzIGFuZCB3b3VsZCByZXR1cm4gJ2FydGlmYWN0LW5hbWUvZmlsZS10by11cGxvYWQudHh0XG4gICAgICAgICAgICAgICAgam9pbignYXJ0aWZhY3QtbmFtZS8nLCAnZmlsZS10by11cGxvYWQudHh0JylcbiAgICAgICAgICAgICAgICBqb2luKCdhcnRpZmFjdC1uYW1lLycsICcvZmlsZS10by11cGxvYWQudHh0JylcbiAgICAgICAgICAgICAgICBqb2luKCdhcnRpZmFjdC1uYW1lJywgJ2ZpbGUtdG8tdXBsb2FkLnR4dCcpXG4gICAgICAgICAgICAgICAgam9pbignYXJ0aWZhY3QtbmFtZScsICcvZmlsZS10by11cGxvYWQudHh0JylcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBzcGVjaWZpY2F0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICBhYnNvbHV0ZUZpbGVQYXRoOiBmaWxlLFxuICAgICAgICAgICAgICAgIHVwbG9hZEZpbGVQYXRoOiBwYXRoXzEuam9pbihhcnRpZmFjdE5hbWUsIHVwbG9hZFBhdGgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIERpcmVjdG9yaWVzIGFyZSByZWplY3RlZCBieSB0aGUgc2VydmVyIGR1cmluZyB1cGxvYWRcbiAgICAgICAgICAgIGNvcmVfMS5kZWJ1ZyhgUmVtb3ZpbmcgJHtmaWxlfSBmcm9tIHJhd1NlYXJjaFJlc3VsdHMgYmVjYXVzZSBpdCBpcyBhIGRpcmVjdG9yeWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzcGVjaWZpY2F0aW9ucztcbn1cbmV4cG9ydHMuZ2V0VXBsb2FkU3BlY2lmaWNhdGlvbiA9IGdldFVwbG9hZFNwZWNpZmljYXRpb247XG4vLyMgc291cmNlTWFwcGluZ1VSTD11cGxvYWQtc3BlY2lmaWNhdGlvbi5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kaWdlc3RGb3JTdHJlYW0gPSBleHBvcnRzLnNsZWVwID0gZXhwb3J0cy5nZXRQcm9wZXJSZXRlbnRpb24gPSBleHBvcnRzLnJtRmlsZSA9IGV4cG9ydHMuZ2V0RmlsZVNpemUgPSBleHBvcnRzLmNyZWF0ZUVtcHR5RmlsZXNGb3JBcnRpZmFjdCA9IGV4cG9ydHMuY3JlYXRlRGlyZWN0b3JpZXNGb3JBcnRpZmFjdCA9IGV4cG9ydHMuZGlzcGxheUh0dHBEaWFnbm9zdGljcyA9IGV4cG9ydHMuZ2V0QXJ0aWZhY3RVcmwgPSBleHBvcnRzLmNyZWF0ZUh0dHBDbGllbnQgPSBleHBvcnRzLmdldFVwbG9hZEhlYWRlcnMgPSBleHBvcnRzLmdldERvd25sb2FkSGVhZGVycyA9IGV4cG9ydHMuZ2V0Q29udGVudFJhbmdlID0gZXhwb3J0cy50cnlHZXRSZXRyeUFmdGVyVmFsdWVUaW1lSW5NaWxsaXNlY29uZHMgPSBleHBvcnRzLmlzVGhyb3R0bGVkU3RhdHVzQ29kZSA9IGV4cG9ydHMuaXNSZXRyeWFibGVTdGF0dXNDb2RlID0gZXhwb3J0cy5pc0ZvcmJpZGRlblN0YXR1c0NvZGUgPSBleHBvcnRzLmlzU3VjY2Vzc1N0YXR1c0NvZGUgPSBleHBvcnRzLmdldEFwaVZlcnNpb24gPSBleHBvcnRzLnBhcnNlRW52TnVtYmVyID0gZXhwb3J0cy5nZXRFeHBvbmVudGlhbFJldHJ5VGltZUluTWlsbGlzZWNvbmRzID0gdm9pZCAwO1xuY29uc3QgY3J5cHRvXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImNyeXB0b1wiKSk7XG5jb25zdCBmc18xID0gcmVxdWlyZShcImZzXCIpO1xuY29uc3QgY29yZV8xID0gcmVxdWlyZShcIkBhY3Rpb25zL2NvcmVcIik7XG5jb25zdCBodHRwX2NsaWVudF8xID0gcmVxdWlyZShcIkBhY3Rpb25zL2h0dHAtY2xpZW50XCIpO1xuY29uc3QgYXV0aF8xID0gcmVxdWlyZShcIkBhY3Rpb25zL2h0dHAtY2xpZW50L2xpYi9hdXRoXCIpO1xuY29uc3QgY29uZmlnX3ZhcmlhYmxlc18xID0gcmVxdWlyZShcIi4vY29uZmlnLXZhcmlhYmxlc1wiKTtcbmNvbnN0IGNyYzY0XzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vY3JjNjRcIikpO1xuLyoqXG4gKiBSZXR1cm5zIGEgcmV0cnkgdGltZSBpbiBtaWxsaXNlY29uZHMgdGhhdCBleHBvbmVudGlhbGx5IGdldHMgbGFyZ2VyXG4gKiBkZXBlbmRpbmcgb24gdGhlIGFtb3VudCBvZiByZXRyaWVzIHRoYXQgaGF2ZSBiZWVuIGF0dGVtcHRlZFxuICovXG5mdW5jdGlvbiBnZXRFeHBvbmVudGlhbFJldHJ5VGltZUluTWlsbGlzZWNvbmRzKHJldHJ5Q291bnQpIHtcbiAgICBpZiAocmV0cnlDb3VudCA8IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXRyeUNvdW50IHNob3VsZCBub3QgYmUgbmVnYXRpdmUnKTtcbiAgICB9XG4gICAgZWxzZSBpZiAocmV0cnlDb3VudCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gY29uZmlnX3ZhcmlhYmxlc18xLmdldEluaXRpYWxSZXRyeUludGVydmFsSW5NaWxsaXNlY29uZHMoKTtcbiAgICB9XG4gICAgY29uc3QgbWluVGltZSA9IGNvbmZpZ192YXJpYWJsZXNfMS5nZXRJbml0aWFsUmV0cnlJbnRlcnZhbEluTWlsbGlzZWNvbmRzKCkgKiBjb25maWdfdmFyaWFibGVzXzEuZ2V0UmV0cnlNdWx0aXBsaWVyKCkgKiByZXRyeUNvdW50O1xuICAgIGNvbnN0IG1heFRpbWUgPSBtaW5UaW1lICogY29uZmlnX3ZhcmlhYmxlc18xLmdldFJldHJ5TXVsdGlwbGllcigpO1xuICAgIC8vIHJldHVybnMgYSByYW5kb20gbnVtYmVyIGJldHdlZW4gdGhlIG1pblRpbWUgKGluY2x1c2l2ZSkgYW5kIHRoZSBtYXhUaW1lIChleGNsdXNpdmUpXG4gICAgcmV0dXJuIE1hdGgudHJ1bmMoTWF0aC5yYW5kb20oKSAqIChtYXhUaW1lIC0gbWluVGltZSkgKyBtaW5UaW1lKTtcbn1cbmV4cG9ydHMuZ2V0RXhwb25lbnRpYWxSZXRyeVRpbWVJbk1pbGxpc2Vjb25kcyA9IGdldEV4cG9uZW50aWFsUmV0cnlUaW1lSW5NaWxsaXNlY29uZHM7XG4vKipcbiAqIFBhcnNlcyBhIGVudiB2YXJpYWJsZSB0aGF0IGlzIGEgbnVtYmVyXG4gKi9cbmZ1bmN0aW9uIHBhcnNlRW52TnVtYmVyKGtleSkge1xuICAgIGNvbnN0IHZhbHVlID0gTnVtYmVyKHByb2Nlc3MuZW52W2tleV0pO1xuICAgIGlmIChOdW1iZXIuaXNOYU4odmFsdWUpIHx8IHZhbHVlIDwgMCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG59XG5leHBvcnRzLnBhcnNlRW52TnVtYmVyID0gcGFyc2VFbnZOdW1iZXI7XG4vKipcbiAqIFZhcmlvdXMgdXRpbGl0eSBmdW5jdGlvbnMgdG8gaGVscCB3aXRoIHRoZSBuZWNlc3NhcnkgQVBJIGNhbGxzXG4gKi9cbmZ1bmN0aW9uIGdldEFwaVZlcnNpb24oKSB7XG4gICAgcmV0dXJuICc2LjAtcHJldmlldyc7XG59XG5leHBvcnRzLmdldEFwaVZlcnNpb24gPSBnZXRBcGlWZXJzaW9uO1xuZnVuY3Rpb24gaXNTdWNjZXNzU3RhdHVzQ29kZShzdGF0dXNDb2RlKSB7XG4gICAgaWYgKCFzdGF0dXNDb2RlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXR1c0NvZGUgPj0gMjAwICYmIHN0YXR1c0NvZGUgPCAzMDA7XG59XG5leHBvcnRzLmlzU3VjY2Vzc1N0YXR1c0NvZGUgPSBpc1N1Y2Nlc3NTdGF0dXNDb2RlO1xuZnVuY3Rpb24gaXNGb3JiaWRkZW5TdGF0dXNDb2RlKHN0YXR1c0NvZGUpIHtcbiAgICBpZiAoIXN0YXR1c0NvZGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdHVzQ29kZSA9PT0gaHR0cF9jbGllbnRfMS5IdHRwQ29kZXMuRm9yYmlkZGVuO1xufVxuZXhwb3J0cy5pc0ZvcmJpZGRlblN0YXR1c0NvZGUgPSBpc0ZvcmJpZGRlblN0YXR1c0NvZGU7XG5mdW5jdGlvbiBpc1JldHJ5YWJsZVN0YXR1c0NvZGUoc3RhdHVzQ29kZSkge1xuICAgIGlmICghc3RhdHVzQ29kZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHJldHJ5YWJsZVN0YXR1c0NvZGVzID0gW1xuICAgICAgICBodHRwX2NsaWVudF8xLkh0dHBDb2Rlcy5CYWRHYXRld2F5LFxuICAgICAgICBodHRwX2NsaWVudF8xLkh0dHBDb2Rlcy5HYXRld2F5VGltZW91dCxcbiAgICAgICAgaHR0cF9jbGllbnRfMS5IdHRwQ29kZXMuSW50ZXJuYWxTZXJ2ZXJFcnJvcixcbiAgICAgICAgaHR0cF9jbGllbnRfMS5IdHRwQ29kZXMuU2VydmljZVVuYXZhaWxhYmxlLFxuICAgICAgICBodHRwX2NsaWVudF8xLkh0dHBDb2Rlcy5Ub29NYW55UmVxdWVzdHMsXG4gICAgICAgIDQxMyAvLyBQYXlsb2FkIFRvbyBMYXJnZVxuICAgIF07XG4gICAgcmV0dXJuIHJldHJ5YWJsZVN0YXR1c0NvZGVzLmluY2x1ZGVzKHN0YXR1c0NvZGUpO1xufVxuZXhwb3J0cy5pc1JldHJ5YWJsZVN0YXR1c0NvZGUgPSBpc1JldHJ5YWJsZVN0YXR1c0NvZGU7XG5mdW5jdGlvbiBpc1Rocm90dGxlZFN0YXR1c0NvZGUoc3RhdHVzQ29kZSkge1xuICAgIGlmICghc3RhdHVzQ29kZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBzdGF0dXNDb2RlID09PSBodHRwX2NsaWVudF8xLkh0dHBDb2Rlcy5Ub29NYW55UmVxdWVzdHM7XG59XG5leHBvcnRzLmlzVGhyb3R0bGVkU3RhdHVzQ29kZSA9IGlzVGhyb3R0bGVkU3RhdHVzQ29kZTtcbi8qKlxuICogQXR0ZW1wdHMgdG8gZ2V0IHRoZSByZXRyeS1hZnRlciB2YWx1ZSBmcm9tIGEgc2V0IG9mIGh0dHAgaGVhZGVycy4gVGhlIHJldHJ5IHRpbWVcbiAqIGlzIG9yaWdpbmFsbHkgZGVub3RlZCBpbiBzZWNvbmRzLCBzbyBpZiBwcmVzZW50LCBpdCBpcyBjb252ZXJ0ZWQgdG8gbWlsbGlzZWNvbmRzXG4gKiBAcGFyYW0gaGVhZGVycyBhbGwgdGhlIGhlYWRlcnMgcmVjZWl2ZWQgd2hlbiBtYWtpbmcgYW4gaHR0cCBjYWxsXG4gKi9cbmZ1bmN0aW9uIHRyeUdldFJldHJ5QWZ0ZXJWYWx1ZVRpbWVJbk1pbGxpc2Vjb25kcyhoZWFkZXJzKSB7XG4gICAgaWYgKGhlYWRlcnNbJ3JldHJ5LWFmdGVyJ10pIHtcbiAgICAgICAgY29uc3QgcmV0cnlUaW1lID0gTnVtYmVyKGhlYWRlcnNbJ3JldHJ5LWFmdGVyJ10pO1xuICAgICAgICBpZiAoIWlzTmFOKHJldHJ5VGltZSkpIHtcbiAgICAgICAgICAgIGNvcmVfMS5pbmZvKGBSZXRyeS1BZnRlciBoZWFkZXIgaXMgcHJlc2VudCB3aXRoIGEgdmFsdWUgb2YgJHtyZXRyeVRpbWV9YCk7XG4gICAgICAgICAgICByZXR1cm4gcmV0cnlUaW1lICogMTAwMDtcbiAgICAgICAgfVxuICAgICAgICBjb3JlXzEuaW5mbyhgUmV0dXJuZWQgcmV0cnktYWZ0ZXIgaGVhZGVyIHZhbHVlOiAke3JldHJ5VGltZX0gaXMgbm9uLW51bWVyaWMgYW5kIGNhbm5vdCBiZSB1c2VkYCk7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvcmVfMS5pbmZvKGBObyByZXRyeS1hZnRlciBoZWFkZXIgd2FzIGZvdW5kLiBEdW1waW5nIGFsbCBoZWFkZXJzIGZvciBkaWFnbm9zdGljIHB1cnBvc2VzYCk7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmxvZyhoZWFkZXJzKTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuZXhwb3J0cy50cnlHZXRSZXRyeUFmdGVyVmFsdWVUaW1lSW5NaWxsaXNlY29uZHMgPSB0cnlHZXRSZXRyeUFmdGVyVmFsdWVUaW1lSW5NaWxsaXNlY29uZHM7XG5mdW5jdGlvbiBnZXRDb250ZW50UmFuZ2Uoc3RhcnQsIGVuZCwgdG90YWwpIHtcbiAgICAvLyBGb3JtYXQ6IGBieXRlcyBzdGFydC1lbmQvZmlsZVNpemVcbiAgICAvLyBzdGFydCBhbmQgZW5kIGFyZSBpbmNsdXNpdmVcbiAgICAvLyBGb3IgYSAyMDAgYnl0ZSBjaHVuayBzdGFydGluZyBhdCBieXRlIDA6XG4gICAgLy8gQ29udGVudC1SYW5nZTogYnl0ZXMgMC0xOTkvMjAwXG4gICAgcmV0dXJuIGBieXRlcyAke3N0YXJ0fS0ke2VuZH0vJHt0b3RhbH1gO1xufVxuZXhwb3J0cy5nZXRDb250ZW50UmFuZ2UgPSBnZXRDb250ZW50UmFuZ2U7XG4vKipcbiAqIFNldHMgYWxsIHRoZSBuZWNlc3NhcnkgaGVhZGVycyB3aGVuIGRvd25sb2FkaW5nIGFuIGFydGlmYWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudFR5cGUgdGhlIHR5cGUgb2YgY29udGVudCBiZWluZyB1cGxvYWRlZFxuICogQHBhcmFtIHtib29sZWFufSBpc0tlZXBBbGl2ZSBpcyB0aGUgc2FtZSBjb25uZWN0aW9uIGJlaW5nIHVzZWQgdG8gbWFrZSBtdWx0aXBsZSBjYWxsc1xuICogQHBhcmFtIHtib29sZWFufSBhY2NlcHRHemlwIGNhbiB3ZSBhY2NlcHQgYSBnemlwIGVuY29kZWQgcmVzcG9uc2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBhY2NlcHRUeXBlIHRoZSB0eXBlIG9mIGNvbnRlbnQgdGhhdCB3ZSBjYW4gYWNjZXB0XG4gKiBAcmV0dXJucyBhcHByb3ByaWF0ZSBoZWFkZXJzIHRvIG1ha2UgYSBzcGVjaWZpYyBodHRwIGNhbGwgZHVyaW5nIGFydGlmYWN0IGRvd25sb2FkXG4gKi9cbmZ1bmN0aW9uIGdldERvd25sb2FkSGVhZGVycyhjb250ZW50VHlwZSwgaXNLZWVwQWxpdmUsIGFjY2VwdEd6aXApIHtcbiAgICBjb25zdCByZXF1ZXN0T3B0aW9ucyA9IHt9O1xuICAgIGlmIChjb250ZW50VHlwZSkge1xuICAgICAgICByZXF1ZXN0T3B0aW9uc1snQ29udGVudC1UeXBlJ10gPSBjb250ZW50VHlwZTtcbiAgICB9XG4gICAgaWYgKGlzS2VlcEFsaXZlKSB7XG4gICAgICAgIHJlcXVlc3RPcHRpb25zWydDb25uZWN0aW9uJ10gPSAnS2VlcC1BbGl2ZSc7XG4gICAgICAgIC8vIGtlZXAgYWxpdmUgZm9yIGF0IGxlYXN0IDEwIHNlY29uZHMgYmVmb3JlIGNsb3NpbmcgdGhlIGNvbm5lY3Rpb25cbiAgICAgICAgcmVxdWVzdE9wdGlvbnNbJ0tlZXAtQWxpdmUnXSA9ICcxMCc7XG4gICAgfVxuICAgIGlmIChhY2NlcHRHemlwKSB7XG4gICAgICAgIC8vIGlmIHdlIGFyZSBleHBlY3RpbmcgYSByZXNwb25zZSB3aXRoIGd6aXAgZW5jb2RpbmcsIGl0IHNob3VsZCBiZSB1c2luZyBhbiBvY3RldC1zdHJlYW0gaW4gdGhlIGFjY2VwdCBoZWFkZXJcbiAgICAgICAgcmVxdWVzdE9wdGlvbnNbJ0FjY2VwdC1FbmNvZGluZyddID0gJ2d6aXAnO1xuICAgICAgICByZXF1ZXN0T3B0aW9uc1snQWNjZXB0J10gPSBgYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtO2FwaS12ZXJzaW9uPSR7Z2V0QXBpVmVyc2lvbigpfWA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBkZWZhdWx0IHRvIGFwcGxpY2F0aW9uL2pzb24gaWYgd2UgYXJlIG5vdCB3b3JraW5nIHdpdGggZ3ppcCBjb250ZW50XG4gICAgICAgIHJlcXVlc3RPcHRpb25zWydBY2NlcHQnXSA9IGBhcHBsaWNhdGlvbi9qc29uO2FwaS12ZXJzaW9uPSR7Z2V0QXBpVmVyc2lvbigpfWA7XG4gICAgfVxuICAgIHJldHVybiByZXF1ZXN0T3B0aW9ucztcbn1cbmV4cG9ydHMuZ2V0RG93bmxvYWRIZWFkZXJzID0gZ2V0RG93bmxvYWRIZWFkZXJzO1xuLyoqXG4gKiBTZXRzIGFsbCB0aGUgbmVjZXNzYXJ5IGhlYWRlcnMgd2hlbiB1cGxvYWRpbmcgYW4gYXJ0aWZhY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50VHlwZSB0aGUgdHlwZSBvZiBjb250ZW50IGJlaW5nIHVwbG9hZGVkXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlzS2VlcEFsaXZlIGlzIHRoZSBzYW1lIGNvbm5lY3Rpb24gYmVpbmcgdXNlZCB0byBtYWtlIG11bHRpcGxlIGNhbGxzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlzR3ppcCBpcyB0aGUgY29ubmVjdGlvbiBiZWluZyB1c2VkIHRvIHVwbG9hZCBHWmlwIGNvbXByZXNzZWQgY29udGVudFxuICogQHBhcmFtIHtudW1iZXJ9IHVuY29tcHJlc3NlZExlbmd0aCB0aGUgb3JpZ2luYWwgc2l6ZSBvZiB0aGUgY29udGVudCBpZiBzb21ldGhpbmcgaXMgYmVpbmcgdXBsb2FkZWQgdGhhdCBoYXMgYmVlbiBjb21wcmVzc2VkXG4gKiBAcGFyYW0ge251bWJlcn0gY29udGVudExlbmd0aCB0aGUgbGVuZ3RoIG9mIHRoZSBjb250ZW50IHRoYXQgaXMgYmVpbmcgdXBsb2FkZWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50UmFuZ2UgdGhlIHJhbmdlIG9mIHRoZSBjb250ZW50IHRoYXQgaXMgYmVpbmcgdXBsb2FkZWRcbiAqIEByZXR1cm5zIGFwcHJvcHJpYXRlIGhlYWRlcnMgdG8gbWFrZSBhIHNwZWNpZmljIGh0dHAgY2FsbCBkdXJpbmcgYXJ0aWZhY3QgdXBsb2FkXG4gKi9cbmZ1bmN0aW9uIGdldFVwbG9hZEhlYWRlcnMoY29udGVudFR5cGUsIGlzS2VlcEFsaXZlLCBpc0d6aXAsIHVuY29tcHJlc3NlZExlbmd0aCwgY29udGVudExlbmd0aCwgY29udGVudFJhbmdlLCBkaWdlc3QpIHtcbiAgICBjb25zdCByZXF1ZXN0T3B0aW9ucyA9IHt9O1xuICAgIHJlcXVlc3RPcHRpb25zWydBY2NlcHQnXSA9IGBhcHBsaWNhdGlvbi9qc29uO2FwaS12ZXJzaW9uPSR7Z2V0QXBpVmVyc2lvbigpfWA7XG4gICAgaWYgKGNvbnRlbnRUeXBlKSB7XG4gICAgICAgIHJlcXVlc3RPcHRpb25zWydDb250ZW50LVR5cGUnXSA9IGNvbnRlbnRUeXBlO1xuICAgIH1cbiAgICBpZiAoaXNLZWVwQWxpdmUpIHtcbiAgICAgICAgcmVxdWVzdE9wdGlvbnNbJ0Nvbm5lY3Rpb24nXSA9ICdLZWVwLUFsaXZlJztcbiAgICAgICAgLy8ga2VlcCBhbGl2ZSBmb3IgYXQgbGVhc3QgMTAgc2Vjb25kcyBiZWZvcmUgY2xvc2luZyB0aGUgY29ubmVjdGlvblxuICAgICAgICByZXF1ZXN0T3B0aW9uc1snS2VlcC1BbGl2ZSddID0gJzEwJztcbiAgICB9XG4gICAgaWYgKGlzR3ppcCkge1xuICAgICAgICByZXF1ZXN0T3B0aW9uc1snQ29udGVudC1FbmNvZGluZyddID0gJ2d6aXAnO1xuICAgICAgICByZXF1ZXN0T3B0aW9uc1sneC10ZnMtZmlsZWxlbmd0aCddID0gdW5jb21wcmVzc2VkTGVuZ3RoO1xuICAgIH1cbiAgICBpZiAoY29udGVudExlbmd0aCkge1xuICAgICAgICByZXF1ZXN0T3B0aW9uc1snQ29udGVudC1MZW5ndGgnXSA9IGNvbnRlbnRMZW5ndGg7XG4gICAgfVxuICAgIGlmIChjb250ZW50UmFuZ2UpIHtcbiAgICAgICAgcmVxdWVzdE9wdGlvbnNbJ0NvbnRlbnQtUmFuZ2UnXSA9IGNvbnRlbnRSYW5nZTtcbiAgICB9XG4gICAgaWYgKGRpZ2VzdCkge1xuICAgICAgICByZXF1ZXN0T3B0aW9uc1sneC1hY3Rpb25zLXJlc3VsdHMtY3JjNjQnXSA9IGRpZ2VzdC5jcmM2NDtcbiAgICAgICAgcmVxdWVzdE9wdGlvbnNbJ3gtYWN0aW9ucy1yZXN1bHRzLW1kNSddID0gZGlnZXN0Lm1kNTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcXVlc3RPcHRpb25zO1xufVxuZXhwb3J0cy5nZXRVcGxvYWRIZWFkZXJzID0gZ2V0VXBsb2FkSGVhZGVycztcbmZ1bmN0aW9uIGNyZWF0ZUh0dHBDbGllbnQodXNlckFnZW50KSB7XG4gICAgcmV0dXJuIG5ldyBodHRwX2NsaWVudF8xLkh0dHBDbGllbnQodXNlckFnZW50LCBbXG4gICAgICAgIG5ldyBhdXRoXzEuQmVhcmVyQ3JlZGVudGlhbEhhbmRsZXIoY29uZmlnX3ZhcmlhYmxlc18xLmdldFJ1bnRpbWVUb2tlbigpKVxuICAgIF0pO1xufVxuZXhwb3J0cy5jcmVhdGVIdHRwQ2xpZW50ID0gY3JlYXRlSHR0cENsaWVudDtcbmZ1bmN0aW9uIGdldEFydGlmYWN0VXJsKCkge1xuICAgIGNvbnN0IGFydGlmYWN0VXJsID0gYCR7Y29uZmlnX3ZhcmlhYmxlc18xLmdldFJ1bnRpbWVVcmwoKX1fYXBpcy9waXBlbGluZXMvd29ya2Zsb3dzLyR7Y29uZmlnX3ZhcmlhYmxlc18xLmdldFdvcmtGbG93UnVuSWQoKX0vYXJ0aWZhY3RzP2FwaS12ZXJzaW9uPSR7Z2V0QXBpVmVyc2lvbigpfWA7XG4gICAgY29yZV8xLmRlYnVnKGBBcnRpZmFjdCBVcmw6ICR7YXJ0aWZhY3RVcmx9YCk7XG4gICAgcmV0dXJuIGFydGlmYWN0VXJsO1xufVxuZXhwb3J0cy5nZXRBcnRpZmFjdFVybCA9IGdldEFydGlmYWN0VXJsO1xuLyoqXG4gKiBVaCBvaCEgU29tZXRoaW5nIG1pZ2h0IGhhdmUgZ29uZSB3cm9uZyBkdXJpbmcgZWl0aGVyIHVwbG9hZCBvciBkb3dubG9hZC4gVGhlIElIdHR0cENsaWVudFJlc3BvbnNlIG9iamVjdCBjb250YWlucyBpbmZvcm1hdGlvblxuICogYWJvdXQgdGhlIGh0dHAgY2FsbCB0aGF0IHdhcyBtYWRlIGJ5IHRoZSBhY3Rpb25zIGh0dHAgY2xpZW50LiBUaGlzIGluZm9ybWF0aW9uIG1pZ2h0IGJlIHVzZWZ1bCB0byBkaXNwbGF5IGZvciBkaWFnbm9zdGljIHB1cnBvc2VzLCBidXRcbiAqIHRoaXMgZW50aXJlIG9iamVjdCBpcyByZWFsbHkgYmlnIGFuZCBtb3N0IG9mIHRoZSBpbmZvcm1hdGlvbiBpcyBub3QgcmVhbGx5IHVzZWZ1bC4gVGhpcyBmdW5jdGlvbiB0YWtlcyB0aGUgcmVzcG9uc2Ugb2JqZWN0IGFuZCBkaXNwbGF5cyBvbmx5XG4gKiB0aGUgaW5mb3JtYXRpb24gdGhhdCB3ZSB3YW50LlxuICpcbiAqIENlcnRhaW4gaW5mb3JtYXRpb24gc3VjaCBhcyB0aGUgVExTU29ja2V0IGFuZCB0aGUgUmVhZGFibGUgc3RhdGUgYXJlIG5vdCByZWFsbHkgdXNlZnVsIGZvciBkaWFnbm9zdGljIHB1cnBvc2VzIHNvIHRoZXkgY2FuIGJlIGF2b2lkZWQuXG4gKiBPdGhlciBpbmZvcm1hdGlvbiBzdWNoIGFzIHRoZSBoZWFkZXJzLCB0aGUgcmVzcG9uc2UgY29kZSBhbmQgbWVzc2FnZSBtaWdodCBiZSB1c2VmdWwsIHNvIHRoaXMgaXMgZGlzcGxheWVkLlxuICovXG5mdW5jdGlvbiBkaXNwbGF5SHR0cERpYWdub3N0aWNzKHJlc3BvbnNlKSB7XG4gICAgY29yZV8xLmluZm8oYCMjIyMjIEJlZ2luIERpYWdub3N0aWMgSFRUUCBpbmZvcm1hdGlvbiAjIyMjI1xuU3RhdHVzIENvZGU6ICR7cmVzcG9uc2UubWVzc2FnZS5zdGF0dXNDb2RlfVxuU3RhdHVzIE1lc3NhZ2U6ICR7cmVzcG9uc2UubWVzc2FnZS5zdGF0dXNNZXNzYWdlfVxuSGVhZGVyIEluZm9ybWF0aW9uOiAke0pTT04uc3RyaW5naWZ5KHJlc3BvbnNlLm1lc3NhZ2UuaGVhZGVycywgdW5kZWZpbmVkLCAyKX1cbiMjIyMjIyBFbmQgRGlhZ25vc3RpYyBIVFRQIGluZm9ybWF0aW9uICMjIyMjI2ApO1xufVxuZXhwb3J0cy5kaXNwbGF5SHR0cERpYWdub3N0aWNzID0gZGlzcGxheUh0dHBEaWFnbm9zdGljcztcbmZ1bmN0aW9uIGNyZWF0ZURpcmVjdG9yaWVzRm9yQXJ0aWZhY3QoZGlyZWN0b3JpZXMpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBmb3IgKGNvbnN0IGRpcmVjdG9yeSBvZiBkaXJlY3Rvcmllcykge1xuICAgICAgICAgICAgeWllbGQgZnNfMS5wcm9taXNlcy5ta2RpcihkaXJlY3RvcnksIHtcbiAgICAgICAgICAgICAgICByZWN1cnNpdmU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5leHBvcnRzLmNyZWF0ZURpcmVjdG9yaWVzRm9yQXJ0aWZhY3QgPSBjcmVhdGVEaXJlY3Rvcmllc0ZvckFydGlmYWN0O1xuZnVuY3Rpb24gY3JlYXRlRW1wdHlGaWxlc0ZvckFydGlmYWN0KGVtcHR5RmlsZXNUb0NyZWF0ZSkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgZW1wdHlGaWxlc1RvQ3JlYXRlKSB7XG4gICAgICAgICAgICB5aWVsZCAoeWllbGQgZnNfMS5wcm9taXNlcy5vcGVuKGZpbGVQYXRoLCAndycpKS5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5leHBvcnRzLmNyZWF0ZUVtcHR5RmlsZXNGb3JBcnRpZmFjdCA9IGNyZWF0ZUVtcHR5RmlsZXNGb3JBcnRpZmFjdDtcbmZ1bmN0aW9uIGdldEZpbGVTaXplKGZpbGVQYXRoKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgY29uc3Qgc3RhdHMgPSB5aWVsZCBmc18xLnByb21pc2VzLnN0YXQoZmlsZVBhdGgpO1xuICAgICAgICBjb3JlXzEuZGVidWcoYCR7ZmlsZVBhdGh9IHNpemU6KCR7c3RhdHMuc2l6ZX0pIGJsa3NpemU6KCR7c3RhdHMuYmxrc2l6ZX0pIGJsb2NrczooJHtzdGF0cy5ibG9ja3N9KWApO1xuICAgICAgICByZXR1cm4gc3RhdHMuc2l6ZTtcbiAgICB9KTtcbn1cbmV4cG9ydHMuZ2V0RmlsZVNpemUgPSBnZXRGaWxlU2l6ZTtcbmZ1bmN0aW9uIHJtRmlsZShmaWxlUGF0aCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIHlpZWxkIGZzXzEucHJvbWlzZXMudW5saW5rKGZpbGVQYXRoKTtcbiAgICB9KTtcbn1cbmV4cG9ydHMucm1GaWxlID0gcm1GaWxlO1xuZnVuY3Rpb24gZ2V0UHJvcGVyUmV0ZW50aW9uKHJldGVudGlvbklucHV0LCByZXRlbnRpb25TZXR0aW5nKSB7XG4gICAgaWYgKHJldGVudGlvbklucHV0IDwgMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcmV0ZW50aW9uLCBtaW5pbXVtIHZhbHVlIGlzIDEuJyk7XG4gICAgfVxuICAgIGxldCByZXRlbnRpb24gPSByZXRlbnRpb25JbnB1dDtcbiAgICBpZiAocmV0ZW50aW9uU2V0dGluZykge1xuICAgICAgICBjb25zdCBtYXhSZXRlbnRpb24gPSBwYXJzZUludChyZXRlbnRpb25TZXR0aW5nKTtcbiAgICAgICAgaWYgKCFpc05hTihtYXhSZXRlbnRpb24pICYmIG1heFJldGVudGlvbiA8IHJldGVudGlvbikge1xuICAgICAgICAgICAgY29yZV8xLndhcm5pbmcoYFJldGVudGlvbiBkYXlzIGlzIGdyZWF0ZXIgdGhhbiB0aGUgbWF4IHZhbHVlIGFsbG93ZWQgYnkgdGhlIHJlcG9zaXRvcnkgc2V0dGluZywgcmVkdWNlIHJldGVudGlvbiB0byAke21heFJldGVudGlvbn0gZGF5c2ApO1xuICAgICAgICAgICAgcmV0ZW50aW9uID0gbWF4UmV0ZW50aW9uO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXRlbnRpb247XG59XG5leHBvcnRzLmdldFByb3BlclJldGVudGlvbiA9IGdldFByb3BlclJldGVudGlvbjtcbmZ1bmN0aW9uIHNsZWVwKG1pbGxpc2Vjb25kcykge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbWlsbGlzZWNvbmRzKSk7XG4gICAgfSk7XG59XG5leHBvcnRzLnNsZWVwID0gc2xlZXA7XG5mdW5jdGlvbiBkaWdlc3RGb3JTdHJlYW0oc3RyZWFtKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNyYzY0ID0gbmV3IGNyYzY0XzEuZGVmYXVsdCgpO1xuICAgICAgICAgICAgY29uc3QgbWQ1ID0gY3J5cHRvXzEuZGVmYXVsdC5jcmVhdGVIYXNoKCdtZDUnKTtcbiAgICAgICAgICAgIHN0cmVhbVxuICAgICAgICAgICAgICAgIC5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICAgICAgICAgIGNyYzY0LnVwZGF0ZShkYXRhKTtcbiAgICAgICAgICAgICAgICBtZDUudXBkYXRlKGRhdGEpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAub24oJ2VuZCcsICgpID0+IHJlc29sdmUoe1xuICAgICAgICAgICAgICAgIGNyYzY0OiBjcmM2NC5kaWdlc3QoJ2Jhc2U2NCcpLFxuICAgICAgICAgICAgICAgIG1kNTogbWQ1LmRpZ2VzdCgnYmFzZTY0JylcbiAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIC5vbignZXJyb3InLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbmV4cG9ydHMuZGlnZXN0Rm9yU3RyZWFtID0gZGlnZXN0Rm9yU3RyZWFtO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXRpbHMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19zZXRNb2R1bGVEZWZhdWx0KSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xufSkgOiBmdW5jdGlvbihvLCB2KSB7XG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xufSk7XG52YXIgX19pbXBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydFN0YXIpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5pc3N1ZSA9IGV4cG9ydHMuaXNzdWVDb21tYW5kID0gdm9pZCAwO1xuY29uc3Qgb3MgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcIm9zXCIpKTtcbmNvbnN0IHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbi8qKlxuICogQ29tbWFuZHNcbiAqXG4gKiBDb21tYW5kIEZvcm1hdDpcbiAqICAgOjpuYW1lIGtleT12YWx1ZSxrZXk9dmFsdWU6Om1lc3NhZ2VcbiAqXG4gKiBFeGFtcGxlczpcbiAqICAgOjp3YXJuaW5nOjpUaGlzIGlzIHRoZSBtZXNzYWdlXG4gKiAgIDo6c2V0LWVudiBuYW1lPU1ZX1ZBUjo6c29tZSB2YWx1ZVxuICovXG5mdW5jdGlvbiBpc3N1ZUNvbW1hbmQoY29tbWFuZCwgcHJvcGVydGllcywgbWVzc2FnZSkge1xuICAgIGNvbnN0IGNtZCA9IG5ldyBDb21tYW5kKGNvbW1hbmQsIHByb3BlcnRpZXMsIG1lc3NhZ2UpO1xuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGNtZC50b1N0cmluZygpICsgb3MuRU9MKTtcbn1cbmV4cG9ydHMuaXNzdWVDb21tYW5kID0gaXNzdWVDb21tYW5kO1xuZnVuY3Rpb24gaXNzdWUobmFtZSwgbWVzc2FnZSA9ICcnKSB7XG4gICAgaXNzdWVDb21tYW5kKG5hbWUsIHt9LCBtZXNzYWdlKTtcbn1cbmV4cG9ydHMuaXNzdWUgPSBpc3N1ZTtcbmNvbnN0IENNRF9TVFJJTkcgPSAnOjonO1xuY2xhc3MgQ29tbWFuZCB7XG4gICAgY29uc3RydWN0b3IoY29tbWFuZCwgcHJvcGVydGllcywgbWVzc2FnZSkge1xuICAgICAgICBpZiAoIWNvbW1hbmQpIHtcbiAgICAgICAgICAgIGNvbW1hbmQgPSAnbWlzc2luZy5jb21tYW5kJztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xuICAgICAgICB0aGlzLnByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIH1cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgbGV0IGNtZFN0ciA9IENNRF9TVFJJTkcgKyB0aGlzLmNvbW1hbmQ7XG4gICAgICAgIGlmICh0aGlzLnByb3BlcnRpZXMgJiYgT2JqZWN0LmtleXModGhpcy5wcm9wZXJ0aWVzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjbWRTdHIgKz0gJyAnO1xuICAgICAgICAgICAgbGV0IGZpcnN0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMucHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWwgPSB0aGlzLnByb3BlcnRpZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNtZFN0ciArPSAnLCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbWRTdHIgKz0gYCR7a2V5fT0ke2VzY2FwZVByb3BlcnR5KHZhbCl9YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjbWRTdHIgKz0gYCR7Q01EX1NUUklOR30ke2VzY2FwZURhdGEodGhpcy5tZXNzYWdlKX1gO1xuICAgICAgICByZXR1cm4gY21kU3RyO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGVzY2FwZURhdGEocykge1xuICAgIHJldHVybiB1dGlsc18xLnRvQ29tbWFuZFZhbHVlKHMpXG4gICAgICAgIC5yZXBsYWNlKC8lL2csICclMjUnKVxuICAgICAgICAucmVwbGFjZSgvXFxyL2csICclMEQnKVxuICAgICAgICAucmVwbGFjZSgvXFxuL2csICclMEEnKTtcbn1cbmZ1bmN0aW9uIGVzY2FwZVByb3BlcnR5KHMpIHtcbiAgICByZXR1cm4gdXRpbHNfMS50b0NvbW1hbmRWYWx1ZShzKVxuICAgICAgICAucmVwbGFjZSgvJS9nLCAnJTI1JylcbiAgICAgICAgLnJlcGxhY2UoL1xcci9nLCAnJTBEJylcbiAgICAgICAgLnJlcGxhY2UoL1xcbi9nLCAnJTBBJylcbiAgICAgICAgLnJlcGxhY2UoLzovZywgJyUzQScpXG4gICAgICAgIC5yZXBsYWNlKC8sL2csICclMkMnKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbW1hbmQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19zZXRNb2R1bGVEZWZhdWx0KSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xufSkgOiBmdW5jdGlvbihvLCB2KSB7XG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xufSk7XG52YXIgX19pbXBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydFN0YXIpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmdldElEVG9rZW4gPSBleHBvcnRzLmdldFN0YXRlID0gZXhwb3J0cy5zYXZlU3RhdGUgPSBleHBvcnRzLmdyb3VwID0gZXhwb3J0cy5lbmRHcm91cCA9IGV4cG9ydHMuc3RhcnRHcm91cCA9IGV4cG9ydHMuaW5mbyA9IGV4cG9ydHMubm90aWNlID0gZXhwb3J0cy53YXJuaW5nID0gZXhwb3J0cy5lcnJvciA9IGV4cG9ydHMuZGVidWcgPSBleHBvcnRzLmlzRGVidWcgPSBleHBvcnRzLnNldEZhaWxlZCA9IGV4cG9ydHMuc2V0Q29tbWFuZEVjaG8gPSBleHBvcnRzLnNldE91dHB1dCA9IGV4cG9ydHMuZ2V0Qm9vbGVhbklucHV0ID0gZXhwb3J0cy5nZXRNdWx0aWxpbmVJbnB1dCA9IGV4cG9ydHMuZ2V0SW5wdXQgPSBleHBvcnRzLmFkZFBhdGggPSBleHBvcnRzLnNldFNlY3JldCA9IGV4cG9ydHMuZXhwb3J0VmFyaWFibGUgPSBleHBvcnRzLkV4aXRDb2RlID0gdm9pZCAwO1xuY29uc3QgY29tbWFuZF8xID0gcmVxdWlyZShcIi4vY29tbWFuZFwiKTtcbmNvbnN0IGZpbGVfY29tbWFuZF8xID0gcmVxdWlyZShcIi4vZmlsZS1jb21tYW5kXCIpO1xuY29uc3QgdXRpbHNfMSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xuY29uc3Qgb3MgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcIm9zXCIpKTtcbmNvbnN0IHBhdGggPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcInBhdGhcIikpO1xuY29uc3Qgb2lkY191dGlsc18xID0gcmVxdWlyZShcIi4vb2lkYy11dGlsc1wiKTtcbi8qKlxuICogVGhlIGNvZGUgdG8gZXhpdCBhbiBhY3Rpb25cbiAqL1xudmFyIEV4aXRDb2RlO1xuKGZ1bmN0aW9uIChFeGl0Q29kZSkge1xuICAgIC8qKlxuICAgICAqIEEgY29kZSBpbmRpY2F0aW5nIHRoYXQgdGhlIGFjdGlvbiB3YXMgc3VjY2Vzc2Z1bFxuICAgICAqL1xuICAgIEV4aXRDb2RlW0V4aXRDb2RlW1wiU3VjY2Vzc1wiXSA9IDBdID0gXCJTdWNjZXNzXCI7XG4gICAgLyoqXG4gICAgICogQSBjb2RlIGluZGljYXRpbmcgdGhhdCB0aGUgYWN0aW9uIHdhcyBhIGZhaWx1cmVcbiAgICAgKi9cbiAgICBFeGl0Q29kZVtFeGl0Q29kZVtcIkZhaWx1cmVcIl0gPSAxXSA9IFwiRmFpbHVyZVwiO1xufSkoRXhpdENvZGUgPSBleHBvcnRzLkV4aXRDb2RlIHx8IChleHBvcnRzLkV4aXRDb2RlID0ge30pKTtcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFZhcmlhYmxlc1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLyoqXG4gKiBTZXRzIGVudiB2YXJpYWJsZSBmb3IgdGhpcyBhY3Rpb24gYW5kIGZ1dHVyZSBhY3Rpb25zIGluIHRoZSBqb2JcbiAqIEBwYXJhbSBuYW1lIHRoZSBuYW1lIG9mIHRoZSB2YXJpYWJsZSB0byBzZXRcbiAqIEBwYXJhbSB2YWwgdGhlIHZhbHVlIG9mIHRoZSB2YXJpYWJsZS4gTm9uLXN0cmluZyB2YWx1ZXMgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gYSBzdHJpbmcgdmlhIEpTT04uc3RyaW5naWZ5XG4gKi9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG5mdW5jdGlvbiBleHBvcnRWYXJpYWJsZShuYW1lLCB2YWwpIHtcbiAgICBjb25zdCBjb252ZXJ0ZWRWYWwgPSB1dGlsc18xLnRvQ29tbWFuZFZhbHVlKHZhbCk7XG4gICAgcHJvY2Vzcy5lbnZbbmFtZV0gPSBjb252ZXJ0ZWRWYWw7XG4gICAgY29uc3QgZmlsZVBhdGggPSBwcm9jZXNzLmVudlsnR0lUSFVCX0VOViddIHx8ICcnO1xuICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgICByZXR1cm4gZmlsZV9jb21tYW5kXzEuaXNzdWVGaWxlQ29tbWFuZCgnRU5WJywgZmlsZV9jb21tYW5kXzEucHJlcGFyZUtleVZhbHVlTWVzc2FnZShuYW1lLCB2YWwpKTtcbiAgICB9XG4gICAgY29tbWFuZF8xLmlzc3VlQ29tbWFuZCgnc2V0LWVudicsIHsgbmFtZSB9LCBjb252ZXJ0ZWRWYWwpO1xufVxuZXhwb3J0cy5leHBvcnRWYXJpYWJsZSA9IGV4cG9ydFZhcmlhYmxlO1xuLyoqXG4gKiBSZWdpc3RlcnMgYSBzZWNyZXQgd2hpY2ggd2lsbCBnZXQgbWFza2VkIGZyb20gbG9nc1xuICogQHBhcmFtIHNlY3JldCB2YWx1ZSBvZiB0aGUgc2VjcmV0XG4gKi9cbmZ1bmN0aW9uIHNldFNlY3JldChzZWNyZXQpIHtcbiAgICBjb21tYW5kXzEuaXNzdWVDb21tYW5kKCdhZGQtbWFzaycsIHt9LCBzZWNyZXQpO1xufVxuZXhwb3J0cy5zZXRTZWNyZXQgPSBzZXRTZWNyZXQ7XG4vKipcbiAqIFByZXBlbmRzIGlucHV0UGF0aCB0byB0aGUgUEFUSCAoZm9yIHRoaXMgYWN0aW9uIGFuZCBmdXR1cmUgYWN0aW9ucylcbiAqIEBwYXJhbSBpbnB1dFBhdGhcbiAqL1xuZnVuY3Rpb24gYWRkUGF0aChpbnB1dFBhdGgpIHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHByb2Nlc3MuZW52WydHSVRIVUJfUEFUSCddIHx8ICcnO1xuICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgICBmaWxlX2NvbW1hbmRfMS5pc3N1ZUZpbGVDb21tYW5kKCdQQVRIJywgaW5wdXRQYXRoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbW1hbmRfMS5pc3N1ZUNvbW1hbmQoJ2FkZC1wYXRoJywge30sIGlucHV0UGF0aCk7XG4gICAgfVxuICAgIHByb2Nlc3MuZW52WydQQVRIJ10gPSBgJHtpbnB1dFBhdGh9JHtwYXRoLmRlbGltaXRlcn0ke3Byb2Nlc3MuZW52WydQQVRIJ119YDtcbn1cbmV4cG9ydHMuYWRkUGF0aCA9IGFkZFBhdGg7XG4vKipcbiAqIEdldHMgdGhlIHZhbHVlIG9mIGFuIGlucHV0LlxuICogVW5sZXNzIHRyaW1XaGl0ZXNwYWNlIGlzIHNldCB0byBmYWxzZSBpbiBJbnB1dE9wdGlvbnMsIHRoZSB2YWx1ZSBpcyBhbHNvIHRyaW1tZWQuXG4gKiBSZXR1cm5zIGFuIGVtcHR5IHN0cmluZyBpZiB0aGUgdmFsdWUgaXMgbm90IGRlZmluZWQuXG4gKlxuICogQHBhcmFtICAgICBuYW1lICAgICBuYW1lIG9mIHRoZSBpbnB1dCB0byBnZXRcbiAqIEBwYXJhbSAgICAgb3B0aW9ucyAgb3B0aW9uYWwuIFNlZSBJbnB1dE9wdGlvbnMuXG4gKiBAcmV0dXJucyAgIHN0cmluZ1xuICovXG5mdW5jdGlvbiBnZXRJbnB1dChuYW1lLCBvcHRpb25zKSB7XG4gICAgY29uc3QgdmFsID0gcHJvY2Vzcy5lbnZbYElOUFVUXyR7bmFtZS5yZXBsYWNlKC8gL2csICdfJykudG9VcHBlckNhc2UoKX1gXSB8fCAnJztcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnJlcXVpcmVkICYmICF2YWwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnB1dCByZXF1aXJlZCBhbmQgbm90IHN1cHBsaWVkOiAke25hbWV9YCk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMudHJpbVdoaXRlc3BhY2UgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIHJldHVybiB2YWwudHJpbSgpO1xufVxuZXhwb3J0cy5nZXRJbnB1dCA9IGdldElucHV0O1xuLyoqXG4gKiBHZXRzIHRoZSB2YWx1ZXMgb2YgYW4gbXVsdGlsaW5lIGlucHV0LiAgRWFjaCB2YWx1ZSBpcyBhbHNvIHRyaW1tZWQuXG4gKlxuICogQHBhcmFtICAgICBuYW1lICAgICBuYW1lIG9mIHRoZSBpbnB1dCB0byBnZXRcbiAqIEBwYXJhbSAgICAgb3B0aW9ucyAgb3B0aW9uYWwuIFNlZSBJbnB1dE9wdGlvbnMuXG4gKiBAcmV0dXJucyAgIHN0cmluZ1tdXG4gKlxuICovXG5mdW5jdGlvbiBnZXRNdWx0aWxpbmVJbnB1dChuYW1lLCBvcHRpb25zKSB7XG4gICAgY29uc3QgaW5wdXRzID0gZ2V0SW5wdXQobmFtZSwgb3B0aW9ucylcbiAgICAgICAgLnNwbGl0KCdcXG4nKVxuICAgICAgICAuZmlsdGVyKHggPT4geCAhPT0gJycpO1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMudHJpbVdoaXRlc3BhY2UgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBpbnB1dHM7XG4gICAgfVxuICAgIHJldHVybiBpbnB1dHMubWFwKGlucHV0ID0+IGlucHV0LnRyaW0oKSk7XG59XG5leHBvcnRzLmdldE11bHRpbGluZUlucHV0ID0gZ2V0TXVsdGlsaW5lSW5wdXQ7XG4vKipcbiAqIEdldHMgdGhlIGlucHV0IHZhbHVlIG9mIHRoZSBib29sZWFuIHR5cGUgaW4gdGhlIFlBTUwgMS4yIFwiY29yZSBzY2hlbWFcIiBzcGVjaWZpY2F0aW9uLlxuICogU3VwcG9ydCBib29sZWFuIGlucHV0IGxpc3Q6IGB0cnVlIHwgVHJ1ZSB8IFRSVUUgfCBmYWxzZSB8IEZhbHNlIHwgRkFMU0VgIC5cbiAqIFRoZSByZXR1cm4gdmFsdWUgaXMgYWxzbyBpbiBib29sZWFuIHR5cGUuXG4gKiByZWY6IGh0dHBzOi8veWFtbC5vcmcvc3BlYy8xLjIvc3BlYy5odG1sI2lkMjgwNDkyM1xuICpcbiAqIEBwYXJhbSAgICAgbmFtZSAgICAgbmFtZSBvZiB0aGUgaW5wdXQgdG8gZ2V0XG4gKiBAcGFyYW0gICAgIG9wdGlvbnMgIG9wdGlvbmFsLiBTZWUgSW5wdXRPcHRpb25zLlxuICogQHJldHVybnMgICBib29sZWFuXG4gKi9cbmZ1bmN0aW9uIGdldEJvb2xlYW5JbnB1dChuYW1lLCBvcHRpb25zKSB7XG4gICAgY29uc3QgdHJ1ZVZhbHVlID0gWyd0cnVlJywgJ1RydWUnLCAnVFJVRSddO1xuICAgIGNvbnN0IGZhbHNlVmFsdWUgPSBbJ2ZhbHNlJywgJ0ZhbHNlJywgJ0ZBTFNFJ107XG4gICAgY29uc3QgdmFsID0gZ2V0SW5wdXQobmFtZSwgb3B0aW9ucyk7XG4gICAgaWYgKHRydWVWYWx1ZS5pbmNsdWRlcyh2YWwpKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoZmFsc2VWYWx1ZS5pbmNsdWRlcyh2YWwpKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgSW5wdXQgZG9lcyBub3QgbWVldCBZQU1MIDEuMiBcIkNvcmUgU2NoZW1hXCIgc3BlY2lmaWNhdGlvbjogJHtuYW1lfVxcbmAgK1xuICAgICAgICBgU3VwcG9ydCBib29sZWFuIGlucHV0IGxpc3Q6IFxcYHRydWUgfCBUcnVlIHwgVFJVRSB8IGZhbHNlIHwgRmFsc2UgfCBGQUxTRVxcYGApO1xufVxuZXhwb3J0cy5nZXRCb29sZWFuSW5wdXQgPSBnZXRCb29sZWFuSW5wdXQ7XG4vKipcbiAqIFNldHMgdGhlIHZhbHVlIG9mIGFuIG91dHB1dC5cbiAqXG4gKiBAcGFyYW0gICAgIG5hbWUgICAgIG5hbWUgb2YgdGhlIG91dHB1dCB0byBzZXRcbiAqIEBwYXJhbSAgICAgdmFsdWUgICAgdmFsdWUgdG8gc3RvcmUuIE5vbi1zdHJpbmcgdmFsdWVzIHdpbGwgYmUgY29udmVydGVkIHRvIGEgc3RyaW5nIHZpYSBKU09OLnN0cmluZ2lmeVxuICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuZnVuY3Rpb24gc2V0T3V0cHV0KG5hbWUsIHZhbHVlKSB7XG4gICAgY29uc3QgZmlsZVBhdGggPSBwcm9jZXNzLmVudlsnR0lUSFVCX09VVFBVVCddIHx8ICcnO1xuICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgICByZXR1cm4gZmlsZV9jb21tYW5kXzEuaXNzdWVGaWxlQ29tbWFuZCgnT1VUUFVUJywgZmlsZV9jb21tYW5kXzEucHJlcGFyZUtleVZhbHVlTWVzc2FnZShuYW1lLCB2YWx1ZSkpO1xuICAgIH1cbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShvcy5FT0wpO1xuICAgIGNvbW1hbmRfMS5pc3N1ZUNvbW1hbmQoJ3NldC1vdXRwdXQnLCB7IG5hbWUgfSwgdXRpbHNfMS50b0NvbW1hbmRWYWx1ZSh2YWx1ZSkpO1xufVxuZXhwb3J0cy5zZXRPdXRwdXQgPSBzZXRPdXRwdXQ7XG4vKipcbiAqIEVuYWJsZXMgb3IgZGlzYWJsZXMgdGhlIGVjaG9pbmcgb2YgY29tbWFuZHMgaW50byBzdGRvdXQgZm9yIHRoZSByZXN0IG9mIHRoZSBzdGVwLlxuICogRWNob2luZyBpcyBkaXNhYmxlZCBieSBkZWZhdWx0IGlmIEFDVElPTlNfU1RFUF9ERUJVRyBpcyBub3Qgc2V0LlxuICpcbiAqL1xuZnVuY3Rpb24gc2V0Q29tbWFuZEVjaG8oZW5hYmxlZCkge1xuICAgIGNvbW1hbmRfMS5pc3N1ZSgnZWNobycsIGVuYWJsZWQgPyAnb24nIDogJ29mZicpO1xufVxuZXhwb3J0cy5zZXRDb21tYW5kRWNobyA9IHNldENvbW1hbmRFY2hvO1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUmVzdWx0c1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLyoqXG4gKiBTZXRzIHRoZSBhY3Rpb24gc3RhdHVzIHRvIGZhaWxlZC5cbiAqIFdoZW4gdGhlIGFjdGlvbiBleGl0cyBpdCB3aWxsIGJlIHdpdGggYW4gZXhpdCBjb2RlIG9mIDFcbiAqIEBwYXJhbSBtZXNzYWdlIGFkZCBlcnJvciBpc3N1ZSBtZXNzYWdlXG4gKi9cbmZ1bmN0aW9uIHNldEZhaWxlZChtZXNzYWdlKSB7XG4gICAgcHJvY2Vzcy5leGl0Q29kZSA9IEV4aXRDb2RlLkZhaWx1cmU7XG4gICAgZXJyb3IobWVzc2FnZSk7XG59XG5leHBvcnRzLnNldEZhaWxlZCA9IHNldEZhaWxlZDtcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIExvZ2dpbmcgQ29tbWFuZHNcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8qKlxuICogR2V0cyB3aGV0aGVyIEFjdGlvbnMgU3RlcCBEZWJ1ZyBpcyBvbiBvciBub3RcbiAqL1xuZnVuY3Rpb24gaXNEZWJ1ZygpIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnZbJ1JVTk5FUl9ERUJVRyddID09PSAnMSc7XG59XG5leHBvcnRzLmlzRGVidWcgPSBpc0RlYnVnO1xuLyoqXG4gKiBXcml0ZXMgZGVidWcgbWVzc2FnZSB0byB1c2VyIGxvZ1xuICogQHBhcmFtIG1lc3NhZ2UgZGVidWcgbWVzc2FnZVxuICovXG5mdW5jdGlvbiBkZWJ1ZyhtZXNzYWdlKSB7XG4gICAgY29tbWFuZF8xLmlzc3VlQ29tbWFuZCgnZGVidWcnLCB7fSwgbWVzc2FnZSk7XG59XG5leHBvcnRzLmRlYnVnID0gZGVidWc7XG4vKipcbiAqIEFkZHMgYW4gZXJyb3IgaXNzdWVcbiAqIEBwYXJhbSBtZXNzYWdlIGVycm9yIGlzc3VlIG1lc3NhZ2UuIEVycm9ycyB3aWxsIGJlIGNvbnZlcnRlZCB0byBzdHJpbmcgdmlhIHRvU3RyaW5nKClcbiAqIEBwYXJhbSBwcm9wZXJ0aWVzIG9wdGlvbmFsIHByb3BlcnRpZXMgdG8gYWRkIHRvIHRoZSBhbm5vdGF0aW9uLlxuICovXG5mdW5jdGlvbiBlcnJvcihtZXNzYWdlLCBwcm9wZXJ0aWVzID0ge30pIHtcbiAgICBjb21tYW5kXzEuaXNzdWVDb21tYW5kKCdlcnJvcicsIHV0aWxzXzEudG9Db21tYW5kUHJvcGVydGllcyhwcm9wZXJ0aWVzKSwgbWVzc2FnZSBpbnN0YW5jZW9mIEVycm9yID8gbWVzc2FnZS50b1N0cmluZygpIDogbWVzc2FnZSk7XG59XG5leHBvcnRzLmVycm9yID0gZXJyb3I7XG4vKipcbiAqIEFkZHMgYSB3YXJuaW5nIGlzc3VlXG4gKiBAcGFyYW0gbWVzc2FnZSB3YXJuaW5nIGlzc3VlIG1lc3NhZ2UuIEVycm9ycyB3aWxsIGJlIGNvbnZlcnRlZCB0byBzdHJpbmcgdmlhIHRvU3RyaW5nKClcbiAqIEBwYXJhbSBwcm9wZXJ0aWVzIG9wdGlvbmFsIHByb3BlcnRpZXMgdG8gYWRkIHRvIHRoZSBhbm5vdGF0aW9uLlxuICovXG5mdW5jdGlvbiB3YXJuaW5nKG1lc3NhZ2UsIHByb3BlcnRpZXMgPSB7fSkge1xuICAgIGNvbW1hbmRfMS5pc3N1ZUNvbW1hbmQoJ3dhcm5pbmcnLCB1dGlsc18xLnRvQ29tbWFuZFByb3BlcnRpZXMocHJvcGVydGllcyksIG1lc3NhZ2UgaW5zdGFuY2VvZiBFcnJvciA/IG1lc3NhZ2UudG9TdHJpbmcoKSA6IG1lc3NhZ2UpO1xufVxuZXhwb3J0cy53YXJuaW5nID0gd2FybmluZztcbi8qKlxuICogQWRkcyBhIG5vdGljZSBpc3N1ZVxuICogQHBhcmFtIG1lc3NhZ2Ugbm90aWNlIGlzc3VlIG1lc3NhZ2UuIEVycm9ycyB3aWxsIGJlIGNvbnZlcnRlZCB0byBzdHJpbmcgdmlhIHRvU3RyaW5nKClcbiAqIEBwYXJhbSBwcm9wZXJ0aWVzIG9wdGlvbmFsIHByb3BlcnRpZXMgdG8gYWRkIHRvIHRoZSBhbm5vdGF0aW9uLlxuICovXG5mdW5jdGlvbiBub3RpY2UobWVzc2FnZSwgcHJvcGVydGllcyA9IHt9KSB7XG4gICAgY29tbWFuZF8xLmlzc3VlQ29tbWFuZCgnbm90aWNlJywgdXRpbHNfMS50b0NvbW1hbmRQcm9wZXJ0aWVzKHByb3BlcnRpZXMpLCBtZXNzYWdlIGluc3RhbmNlb2YgRXJyb3IgPyBtZXNzYWdlLnRvU3RyaW5nKCkgOiBtZXNzYWdlKTtcbn1cbmV4cG9ydHMubm90aWNlID0gbm90aWNlO1xuLyoqXG4gKiBXcml0ZXMgaW5mbyB0byBsb2cgd2l0aCBjb25zb2xlLmxvZy5cbiAqIEBwYXJhbSBtZXNzYWdlIGluZm8gbWVzc2FnZVxuICovXG5mdW5jdGlvbiBpbmZvKG1lc3NhZ2UpIHtcbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShtZXNzYWdlICsgb3MuRU9MKTtcbn1cbmV4cG9ydHMuaW5mbyA9IGluZm87XG4vKipcbiAqIEJlZ2luIGFuIG91dHB1dCBncm91cC5cbiAqXG4gKiBPdXRwdXQgdW50aWwgdGhlIG5leHQgYGdyb3VwRW5kYCB3aWxsIGJlIGZvbGRhYmxlIGluIHRoaXMgZ3JvdXBcbiAqXG4gKiBAcGFyYW0gbmFtZSBUaGUgbmFtZSBvZiB0aGUgb3V0cHV0IGdyb3VwXG4gKi9cbmZ1bmN0aW9uIHN0YXJ0R3JvdXAobmFtZSkge1xuICAgIGNvbW1hbmRfMS5pc3N1ZSgnZ3JvdXAnLCBuYW1lKTtcbn1cbmV4cG9ydHMuc3RhcnRHcm91cCA9IHN0YXJ0R3JvdXA7XG4vKipcbiAqIEVuZCBhbiBvdXRwdXQgZ3JvdXAuXG4gKi9cbmZ1bmN0aW9uIGVuZEdyb3VwKCkge1xuICAgIGNvbW1hbmRfMS5pc3N1ZSgnZW5kZ3JvdXAnKTtcbn1cbmV4cG9ydHMuZW5kR3JvdXAgPSBlbmRHcm91cDtcbi8qKlxuICogV3JhcCBhbiBhc3luY2hyb25vdXMgZnVuY3Rpb24gY2FsbCBpbiBhIGdyb3VwLlxuICpcbiAqIFJldHVybnMgdGhlIHNhbWUgdHlwZSBhcyB0aGUgZnVuY3Rpb24gaXRzZWxmLlxuICpcbiAqIEBwYXJhbSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBncm91cFxuICogQHBhcmFtIGZuIFRoZSBmdW5jdGlvbiB0byB3cmFwIGluIHRoZSBncm91cFxuICovXG5mdW5jdGlvbiBncm91cChuYW1lLCBmbikge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIHN0YXJ0R3JvdXAobmFtZSk7XG4gICAgICAgIGxldCByZXN1bHQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXN1bHQgPSB5aWVsZCBmbigpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgZW5kR3JvdXAoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xufVxuZXhwb3J0cy5ncm91cCA9IGdyb3VwO1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gV3JhcHBlciBhY3Rpb24gc3RhdGVcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8qKlxuICogU2F2ZXMgc3RhdGUgZm9yIGN1cnJlbnQgYWN0aW9uLCB0aGUgc3RhdGUgY2FuIG9ubHkgYmUgcmV0cmlldmVkIGJ5IHRoaXMgYWN0aW9uJ3MgcG9zdCBqb2IgZXhlY3V0aW9uLlxuICpcbiAqIEBwYXJhbSAgICAgbmFtZSAgICAgbmFtZSBvZiB0aGUgc3RhdGUgdG8gc3RvcmVcbiAqIEBwYXJhbSAgICAgdmFsdWUgICAgdmFsdWUgdG8gc3RvcmUuIE5vbi1zdHJpbmcgdmFsdWVzIHdpbGwgYmUgY29udmVydGVkIHRvIGEgc3RyaW5nIHZpYSBKU09OLnN0cmluZ2lmeVxuICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuZnVuY3Rpb24gc2F2ZVN0YXRlKG5hbWUsIHZhbHVlKSB7XG4gICAgY29uc3QgZmlsZVBhdGggPSBwcm9jZXNzLmVudlsnR0lUSFVCX1NUQVRFJ10gfHwgJyc7XG4gICAgaWYgKGZpbGVQYXRoKSB7XG4gICAgICAgIHJldHVybiBmaWxlX2NvbW1hbmRfMS5pc3N1ZUZpbGVDb21tYW5kKCdTVEFURScsIGZpbGVfY29tbWFuZF8xLnByZXBhcmVLZXlWYWx1ZU1lc3NhZ2UobmFtZSwgdmFsdWUpKTtcbiAgICB9XG4gICAgY29tbWFuZF8xLmlzc3VlQ29tbWFuZCgnc2F2ZS1zdGF0ZScsIHsgbmFtZSB9LCB1dGlsc18xLnRvQ29tbWFuZFZhbHVlKHZhbHVlKSk7XG59XG5leHBvcnRzLnNhdmVTdGF0ZSA9IHNhdmVTdGF0ZTtcbi8qKlxuICogR2V0cyB0aGUgdmFsdWUgb2YgYW4gc3RhdGUgc2V0IGJ5IHRoaXMgYWN0aW9uJ3MgbWFpbiBleGVjdXRpb24uXG4gKlxuICogQHBhcmFtICAgICBuYW1lICAgICBuYW1lIG9mIHRoZSBzdGF0ZSB0byBnZXRcbiAqIEByZXR1cm5zICAgc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIGdldFN0YXRlKG5hbWUpIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnZbYFNUQVRFXyR7bmFtZX1gXSB8fCAnJztcbn1cbmV4cG9ydHMuZ2V0U3RhdGUgPSBnZXRTdGF0ZTtcbmZ1bmN0aW9uIGdldElEVG9rZW4oYXVkKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgcmV0dXJuIHlpZWxkIG9pZGNfdXRpbHNfMS5PaWRjQ2xpZW50LmdldElEVG9rZW4oYXVkKTtcbiAgICB9KTtcbn1cbmV4cG9ydHMuZ2V0SURUb2tlbiA9IGdldElEVG9rZW47XG4vKipcbiAqIFN1bW1hcnkgZXhwb3J0c1xuICovXG52YXIgc3VtbWFyeV8xID0gcmVxdWlyZShcIi4vc3VtbWFyeVwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInN1bW1hcnlcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHN1bW1hcnlfMS5zdW1tYXJ5OyB9IH0pO1xuLyoqXG4gKiBAZGVwcmVjYXRlZCB1c2UgY29yZS5zdW1tYXJ5XG4gKi9cbnZhciBzdW1tYXJ5XzIgPSByZXF1aXJlKFwiLi9zdW1tYXJ5XCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwibWFya2Rvd25TdW1tYXJ5XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBzdW1tYXJ5XzIubWFya2Rvd25TdW1tYXJ5OyB9IH0pO1xuLyoqXG4gKiBQYXRoIGV4cG9ydHNcbiAqL1xudmFyIHBhdGhfdXRpbHNfMSA9IHJlcXVpcmUoXCIuL3BhdGgtdXRpbHNcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJ0b1Bvc2l4UGF0aFwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gcGF0aF91dGlsc18xLnRvUG9zaXhQYXRoOyB9IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwidG9XaW4zMlBhdGhcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHBhdGhfdXRpbHNfMS50b1dpbjMyUGF0aDsgfSB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInRvUGxhdGZvcm1QYXRoXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBwYXRoX3V0aWxzXzEudG9QbGF0Zm9ybVBhdGg7IH0gfSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb3JlLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuLy8gRm9yIGludGVybmFsIHVzZSwgc3ViamVjdCB0byBjaGFuZ2UuXG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19zZXRNb2R1bGVEZWZhdWx0KSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xufSkgOiBmdW5jdGlvbihvLCB2KSB7XG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xufSk7XG52YXIgX19pbXBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydFN0YXIpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5wcmVwYXJlS2V5VmFsdWVNZXNzYWdlID0gZXhwb3J0cy5pc3N1ZUZpbGVDb21tYW5kID0gdm9pZCAwO1xuLy8gV2UgdXNlIGFueSBhcyBhIHZhbGlkIGlucHV0IHR5cGVcbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnkgKi9cbmNvbnN0IGZzID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJmc1wiKSk7XG5jb25zdCBvcyA9IF9faW1wb3J0U3RhcihyZXF1aXJlKFwib3NcIikpO1xuY29uc3QgdXVpZF8xID0gcmVxdWlyZShcInV1aWRcIik7XG5jb25zdCB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG5mdW5jdGlvbiBpc3N1ZUZpbGVDb21tYW5kKGNvbW1hbmQsIG1lc3NhZ2UpIHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHByb2Nlc3MuZW52W2BHSVRIVUJfJHtjb21tYW5kfWBdO1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gZmluZCBlbnZpcm9ubWVudCB2YXJpYWJsZSBmb3IgZmlsZSBjb21tYW5kICR7Y29tbWFuZH1gKTtcbiAgICB9XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGZpbGVQYXRoKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1pc3NpbmcgZmlsZSBhdCBwYXRoOiAke2ZpbGVQYXRofWApO1xuICAgIH1cbiAgICBmcy5hcHBlbmRGaWxlU3luYyhmaWxlUGF0aCwgYCR7dXRpbHNfMS50b0NvbW1hbmRWYWx1ZShtZXNzYWdlKX0ke29zLkVPTH1gLCB7XG4gICAgICAgIGVuY29kaW5nOiAndXRmOCdcbiAgICB9KTtcbn1cbmV4cG9ydHMuaXNzdWVGaWxlQ29tbWFuZCA9IGlzc3VlRmlsZUNvbW1hbmQ7XG5mdW5jdGlvbiBwcmVwYXJlS2V5VmFsdWVNZXNzYWdlKGtleSwgdmFsdWUpIHtcbiAgICBjb25zdCBkZWxpbWl0ZXIgPSBgZ2hhZGVsaW1pdGVyXyR7dXVpZF8xLnY0KCl9YDtcbiAgICBjb25zdCBjb252ZXJ0ZWRWYWx1ZSA9IHV0aWxzXzEudG9Db21tYW5kVmFsdWUodmFsdWUpO1xuICAgIC8vIFRoZXNlIHNob3VsZCByZWFsaXN0aWNhbGx5IG5ldmVyIGhhcHBlbiwgYnV0IGp1c3QgaW4gY2FzZSBzb21lb25lIGZpbmRzIGFcbiAgICAvLyB3YXkgdG8gZXhwbG9pdCB1dWlkIGdlbmVyYXRpb24gbGV0J3Mgbm90IGFsbG93IGtleXMgb3IgdmFsdWVzIHRoYXQgY29udGFpblxuICAgIC8vIHRoZSBkZWxpbWl0ZXIuXG4gICAgaWYgKGtleS5pbmNsdWRlcyhkZWxpbWl0ZXIpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBpbnB1dDogbmFtZSBzaG91bGQgbm90IGNvbnRhaW4gdGhlIGRlbGltaXRlciBcIiR7ZGVsaW1pdGVyfVwiYCk7XG4gICAgfVxuICAgIGlmIChjb252ZXJ0ZWRWYWx1ZS5pbmNsdWRlcyhkZWxpbWl0ZXIpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBpbnB1dDogdmFsdWUgc2hvdWxkIG5vdCBjb250YWluIHRoZSBkZWxpbWl0ZXIgXCIke2RlbGltaXRlcn1cImApO1xuICAgIH1cbiAgICByZXR1cm4gYCR7a2V5fTw8JHtkZWxpbWl0ZXJ9JHtvcy5FT0x9JHtjb252ZXJ0ZWRWYWx1ZX0ke29zLkVPTH0ke2RlbGltaXRlcn1gO1xufVxuZXhwb3J0cy5wcmVwYXJlS2V5VmFsdWVNZXNzYWdlID0gcHJlcGFyZUtleVZhbHVlTWVzc2FnZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZpbGUtY29tbWFuZC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5PaWRjQ2xpZW50ID0gdm9pZCAwO1xuY29uc3QgaHR0cF9jbGllbnRfMSA9IHJlcXVpcmUoXCJAYWN0aW9ucy9odHRwLWNsaWVudFwiKTtcbmNvbnN0IGF1dGhfMSA9IHJlcXVpcmUoXCJAYWN0aW9ucy9odHRwLWNsaWVudC9saWIvYXV0aFwiKTtcbmNvbnN0IGNvcmVfMSA9IHJlcXVpcmUoXCIuL2NvcmVcIik7XG5jbGFzcyBPaWRjQ2xpZW50IHtcbiAgICBzdGF0aWMgY3JlYXRlSHR0cENsaWVudChhbGxvd1JldHJ5ID0gdHJ1ZSwgbWF4UmV0cnkgPSAxMCkge1xuICAgICAgICBjb25zdCByZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGFsbG93UmV0cmllczogYWxsb3dSZXRyeSxcbiAgICAgICAgICAgIG1heFJldHJpZXM6IG1heFJldHJ5XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBuZXcgaHR0cF9jbGllbnRfMS5IdHRwQ2xpZW50KCdhY3Rpb25zL29pZGMtY2xpZW50JywgW25ldyBhdXRoXzEuQmVhcmVyQ3JlZGVudGlhbEhhbmRsZXIoT2lkY0NsaWVudC5nZXRSZXF1ZXN0VG9rZW4oKSldLCByZXF1ZXN0T3B0aW9ucyk7XG4gICAgfVxuICAgIHN0YXRpYyBnZXRSZXF1ZXN0VG9rZW4oKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gcHJvY2Vzcy5lbnZbJ0FDVElPTlNfSURfVE9LRU5fUkVRVUVTVF9UT0tFTiddO1xuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBnZXQgQUNUSU9OU19JRF9UT0tFTl9SRVFVRVNUX1RPS0VOIGVudiB2YXJpYWJsZScpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICB9XG4gICAgc3RhdGljIGdldElEVG9rZW5VcmwoKSB7XG4gICAgICAgIGNvbnN0IHJ1bnRpbWVVcmwgPSBwcm9jZXNzLmVudlsnQUNUSU9OU19JRF9UT0tFTl9SRVFVRVNUX1VSTCddO1xuICAgICAgICBpZiAoIXJ1bnRpbWVVcmwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGdldCBBQ1RJT05TX0lEX1RPS0VOX1JFUVVFU1RfVVJMIGVudiB2YXJpYWJsZScpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBydW50aW1lVXJsO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0Q2FsbChpZF90b2tlbl91cmwpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgaHR0cGNsaWVudCA9IE9pZGNDbGllbnQuY3JlYXRlSHR0cENsaWVudCgpO1xuICAgICAgICAgICAgY29uc3QgcmVzID0geWllbGQgaHR0cGNsaWVudFxuICAgICAgICAgICAgICAgIC5nZXRKc29uKGlkX3Rva2VuX3VybClcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGdldCBJRCBUb2tlbi4gXFxuIFxuICAgICAgICBFcnJvciBDb2RlIDogJHtlcnJvci5zdGF0dXNDb2RlfVxcbiBcbiAgICAgICAgRXJyb3IgTWVzc2FnZTogJHtlcnJvci5yZXN1bHQubWVzc2FnZX1gKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgaWRfdG9rZW4gPSAoX2EgPSByZXMucmVzdWx0KSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EudmFsdWU7XG4gICAgICAgICAgICBpZiAoIWlkX3Rva2VuKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXNwb25zZSBqc29uIGJvZHkgZG8gbm90IGhhdmUgSUQgVG9rZW4gZmllbGQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpZF90b2tlbjtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN0YXRpYyBnZXRJRFRva2VuKGF1ZGllbmNlKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIE5ldyBJRCBUb2tlbiBpcyByZXF1ZXN0ZWQgZnJvbSBhY3Rpb24gc2VydmljZVxuICAgICAgICAgICAgICAgIGxldCBpZF90b2tlbl91cmwgPSBPaWRjQ2xpZW50LmdldElEVG9rZW5VcmwoKTtcbiAgICAgICAgICAgICAgICBpZiAoYXVkaWVuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5jb2RlZEF1ZGllbmNlID0gZW5jb2RlVVJJQ29tcG9uZW50KGF1ZGllbmNlKTtcbiAgICAgICAgICAgICAgICAgICAgaWRfdG9rZW5fdXJsID0gYCR7aWRfdG9rZW5fdXJsfSZhdWRpZW5jZT0ke2VuY29kZWRBdWRpZW5jZX1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb3JlXzEuZGVidWcoYElEIHRva2VuIHVybCBpcyAke2lkX3Rva2VuX3VybH1gKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpZF90b2tlbiA9IHlpZWxkIE9pZGNDbGllbnQuZ2V0Q2FsbChpZF90b2tlbl91cmwpO1xuICAgICAgICAgICAgICAgIGNvcmVfMS5zZXRTZWNyZXQoaWRfdG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybiBpZF90b2tlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3IgbWVzc2FnZTogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLk9pZGNDbGllbnQgPSBPaWRjQ2xpZW50O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9b2lkYy11dGlscy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX3NldE1vZHVsZURlZmF1bHQpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XG59KTtcbnZhciBfX2ltcG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0U3RhcikgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChrICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnRvUGxhdGZvcm1QYXRoID0gZXhwb3J0cy50b1dpbjMyUGF0aCA9IGV4cG9ydHMudG9Qb3NpeFBhdGggPSB2b2lkIDA7XG5jb25zdCBwYXRoID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJwYXRoXCIpKTtcbi8qKlxuICogdG9Qb3NpeFBhdGggY29udmVydHMgdGhlIGdpdmVuIHBhdGggdG8gdGhlIHBvc2l4IGZvcm0uIE9uIFdpbmRvd3MsIFxcXFwgd2lsbCBiZVxuICogcmVwbGFjZWQgd2l0aCAvLlxuICpcbiAqIEBwYXJhbSBwdGguIFBhdGggdG8gdHJhbnNmb3JtLlxuICogQHJldHVybiBzdHJpbmcgUG9zaXggcGF0aC5cbiAqL1xuZnVuY3Rpb24gdG9Qb3NpeFBhdGgocHRoKSB7XG4gICAgcmV0dXJuIHB0aC5yZXBsYWNlKC9bXFxcXF0vZywgJy8nKTtcbn1cbmV4cG9ydHMudG9Qb3NpeFBhdGggPSB0b1Bvc2l4UGF0aDtcbi8qKlxuICogdG9XaW4zMlBhdGggY29udmVydHMgdGhlIGdpdmVuIHBhdGggdG8gdGhlIHdpbjMyIGZvcm0uIE9uIExpbnV4LCAvIHdpbGwgYmVcbiAqIHJlcGxhY2VkIHdpdGggXFxcXC5cbiAqXG4gKiBAcGFyYW0gcHRoLiBQYXRoIHRvIHRyYW5zZm9ybS5cbiAqIEByZXR1cm4gc3RyaW5nIFdpbjMyIHBhdGguXG4gKi9cbmZ1bmN0aW9uIHRvV2luMzJQYXRoKHB0aCkge1xuICAgIHJldHVybiBwdGgucmVwbGFjZSgvWy9dL2csICdcXFxcJyk7XG59XG5leHBvcnRzLnRvV2luMzJQYXRoID0gdG9XaW4zMlBhdGg7XG4vKipcbiAqIHRvUGxhdGZvcm1QYXRoIGNvbnZlcnRzIHRoZSBnaXZlbiBwYXRoIHRvIGEgcGxhdGZvcm0tc3BlY2lmaWMgcGF0aC4gSXQgZG9lc1xuICogdGhpcyBieSByZXBsYWNpbmcgaW5zdGFuY2VzIG9mIC8gYW5kIFxcIHdpdGggdGhlIHBsYXRmb3JtLXNwZWNpZmljIHBhdGhcbiAqIHNlcGFyYXRvci5cbiAqXG4gKiBAcGFyYW0gcHRoIFRoZSBwYXRoIHRvIHBsYXRmb3JtaXplLlxuICogQHJldHVybiBzdHJpbmcgVGhlIHBsYXRmb3JtLXNwZWNpZmljIHBhdGguXG4gKi9cbmZ1bmN0aW9uIHRvUGxhdGZvcm1QYXRoKHB0aCkge1xuICAgIHJldHVybiBwdGgucmVwbGFjZSgvWy9cXFxcXS9nLCBwYXRoLnNlcCk7XG59XG5leHBvcnRzLnRvUGxhdGZvcm1QYXRoID0gdG9QbGF0Zm9ybVBhdGg7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXRoLXV0aWxzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnN1bW1hcnkgPSBleHBvcnRzLm1hcmtkb3duU3VtbWFyeSA9IGV4cG9ydHMuU1VNTUFSWV9ET0NTX1VSTCA9IGV4cG9ydHMuU1VNTUFSWV9FTlZfVkFSID0gdm9pZCAwO1xuY29uc3Qgb3NfMSA9IHJlcXVpcmUoXCJvc1wiKTtcbmNvbnN0IGZzXzEgPSByZXF1aXJlKFwiZnNcIik7XG5jb25zdCB7IGFjY2VzcywgYXBwZW5kRmlsZSwgd3JpdGVGaWxlIH0gPSBmc18xLnByb21pc2VzO1xuZXhwb3J0cy5TVU1NQVJZX0VOVl9WQVIgPSAnR0lUSFVCX1NURVBfU1VNTUFSWSc7XG5leHBvcnRzLlNVTU1BUllfRE9DU19VUkwgPSAnaHR0cHM6Ly9kb2NzLmdpdGh1Yi5jb20vYWN0aW9ucy91c2luZy13b3JrZmxvd3Mvd29ya2Zsb3ctY29tbWFuZHMtZm9yLWdpdGh1Yi1hY3Rpb25zI2FkZGluZy1hLWpvYi1zdW1tYXJ5JztcbmNsYXNzIFN1bW1hcnkge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl9idWZmZXIgPSAnJztcbiAgICB9XG4gICAgLyoqXG4gICAgICogRmluZHMgdGhlIHN1bW1hcnkgZmlsZSBwYXRoIGZyb20gdGhlIGVudmlyb25tZW50LCByZWplY3RzIGlmIGVudiB2YXIgaXMgbm90IGZvdW5kIG9yIGZpbGUgZG9lcyBub3QgZXhpc3RcbiAgICAgKiBBbHNvIGNoZWNrcyByL3cgcGVybWlzc2lvbnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBzdGVwIHN1bW1hcnkgZmlsZSBwYXRoXG4gICAgICovXG4gICAgZmlsZVBhdGgoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fZmlsZVBhdGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZmlsZVBhdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwYXRoRnJvbUVudiA9IHByb2Nlc3MuZW52W2V4cG9ydHMuU1VNTUFSWV9FTlZfVkFSXTtcbiAgICAgICAgICAgIGlmICghcGF0aEZyb21FbnYpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBmaW5kIGVudmlyb25tZW50IHZhcmlhYmxlIGZvciAkJHtleHBvcnRzLlNVTU1BUllfRU5WX1ZBUn0uIENoZWNrIGlmIHlvdXIgcnVudGltZSBlbnZpcm9ubWVudCBzdXBwb3J0cyBqb2Igc3VtbWFyaWVzLmApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB5aWVsZCBhY2Nlc3MocGF0aEZyb21FbnYsIGZzXzEuY29uc3RhbnRzLlJfT0sgfCBmc18xLmNvbnN0YW50cy5XX09LKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChfYSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGFjY2VzcyBzdW1tYXJ5IGZpbGU6ICcke3BhdGhGcm9tRW52fScuIENoZWNrIGlmIHRoZSBmaWxlIGhhcyBjb3JyZWN0IHJlYWQvd3JpdGUgcGVybWlzc2lvbnMuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9maWxlUGF0aCA9IHBhdGhGcm9tRW52O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbGVQYXRoO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogV3JhcHMgY29udGVudCBpbiBhbiBIVE1MIHRhZywgYWRkaW5nIGFueSBIVE1MIGF0dHJpYnV0ZXNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgSFRNTCB0YWcgdG8gd3JhcFxuICAgICAqIEBwYXJhbSB7c3RyaW5nIHwgbnVsbH0gY29udGVudCBjb250ZW50IHdpdGhpbiB0aGUgdGFnXG4gICAgICogQHBhcmFtIHtbYXR0cmlidXRlOiBzdHJpbmddOiBzdHJpbmd9IGF0dHJzIGtleS12YWx1ZSBsaXN0IG9mIEhUTUwgYXR0cmlidXRlcyB0byBhZGRcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGNvbnRlbnQgd3JhcHBlZCBpbiBIVE1MIGVsZW1lbnRcbiAgICAgKi9cbiAgICB3cmFwKHRhZywgY29udGVudCwgYXR0cnMgPSB7fSkge1xuICAgICAgICBjb25zdCBodG1sQXR0cnMgPSBPYmplY3QuZW50cmllcyhhdHRycylcbiAgICAgICAgICAgIC5tYXAoKFtrZXksIHZhbHVlXSkgPT4gYCAke2tleX09XCIke3ZhbHVlfVwiYClcbiAgICAgICAgICAgIC5qb2luKCcnKTtcbiAgICAgICAgaWYgKCFjb250ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gYDwke3RhZ30ke2h0bWxBdHRyc30+YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYDwke3RhZ30ke2h0bWxBdHRyc30+JHtjb250ZW50fTwvJHt0YWd9PmA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFdyaXRlcyB0ZXh0IGluIHRoZSBidWZmZXIgdG8gdGhlIHN1bW1hcnkgYnVmZmVyIGZpbGUgYW5kIGVtcHRpZXMgYnVmZmVyLiBXaWxsIGFwcGVuZCBieSBkZWZhdWx0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdW1tYXJ5V3JpdGVPcHRpb25zfSBbb3B0aW9uc10gKG9wdGlvbmFsKSBvcHRpb25zIGZvciB3cml0ZSBvcGVyYXRpb25cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFN1bW1hcnk+fSBzdW1tYXJ5IGluc3RhbmNlXG4gICAgICovXG4gICAgd3JpdGUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3Qgb3ZlcndyaXRlID0gISEob3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb25zLm92ZXJ3cml0ZSk7XG4gICAgICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHlpZWxkIHRoaXMuZmlsZVBhdGgoKTtcbiAgICAgICAgICAgIGNvbnN0IHdyaXRlRnVuYyA9IG92ZXJ3cml0ZSA/IHdyaXRlRmlsZSA6IGFwcGVuZEZpbGU7XG4gICAgICAgICAgICB5aWVsZCB3cml0ZUZ1bmMoZmlsZVBhdGgsIHRoaXMuX2J1ZmZlciwgeyBlbmNvZGluZzogJ3V0ZjgnIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW1wdHlCdWZmZXIoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsZWFycyB0aGUgc3VtbWFyeSBidWZmZXIgYW5kIHdpcGVzIHRoZSBzdW1tYXJ5IGZpbGVcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtTdW1tYXJ5fSBzdW1tYXJ5IGluc3RhbmNlXG4gICAgICovXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lbXB0eUJ1ZmZlcigpLndyaXRlKHsgb3ZlcndyaXRlOiB0cnVlIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgY3VycmVudCBzdW1tYXJ5IGJ1ZmZlciBhcyBhIHN0cmluZ1xuICAgICAqXG4gICAgICogQHJldHVybnMge3N0cmluZ30gc3RyaW5nIG9mIHN1bW1hcnkgYnVmZmVyXG4gICAgICovXG4gICAgc3RyaW5naWZ5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYnVmZmVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJZiB0aGUgc3VtbWFyeSBidWZmZXIgaXMgZW1wdHlcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtib29sZW59IHRydWUgaWYgdGhlIGJ1ZmZlciBpcyBlbXB0eVxuICAgICAqL1xuICAgIGlzRW1wdHlCdWZmZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9idWZmZXIubGVuZ3RoID09PSAwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXNldHMgdGhlIHN1bW1hcnkgYnVmZmVyIHdpdGhvdXQgd3JpdGluZyB0byBzdW1tYXJ5IGZpbGVcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtTdW1tYXJ5fSBzdW1tYXJ5IGluc3RhbmNlXG4gICAgICovXG4gICAgZW1wdHlCdWZmZXIoKSB7XG4gICAgICAgIHRoaXMuX2J1ZmZlciA9ICcnO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyByYXcgdGV4dCB0byB0aGUgc3VtbWFyeSBidWZmZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IGNvbnRlbnQgdG8gYWRkXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbYWRkRU9MPWZhbHNlXSAob3B0aW9uYWwpIGFwcGVuZCBhbiBFT0wgdG8gdGhlIHJhdyB0ZXh0IChkZWZhdWx0OiBmYWxzZSlcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtTdW1tYXJ5fSBzdW1tYXJ5IGluc3RhbmNlXG4gICAgICovXG4gICAgYWRkUmF3KHRleHQsIGFkZEVPTCA9IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuX2J1ZmZlciArPSB0ZXh0O1xuICAgICAgICByZXR1cm4gYWRkRU9MID8gdGhpcy5hZGRFT0woKSA6IHRoaXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIG9wZXJhdGluZyBzeXN0ZW0tc3BlY2lmaWMgZW5kLW9mLWxpbmUgbWFya2VyIHRvIHRoZSBidWZmZXJcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtTdW1tYXJ5fSBzdW1tYXJ5IGluc3RhbmNlXG4gICAgICovXG4gICAgYWRkRU9MKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRSYXcob3NfMS5FT0wpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGFuIEhUTUwgY29kZWJsb2NrIHRvIHRoZSBzdW1tYXJ5IGJ1ZmZlclxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvZGUgY29udGVudCB0byByZW5kZXIgd2l0aGluIGZlbmNlZCBjb2RlIGJsb2NrXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhbmcgKG9wdGlvbmFsKSBsYW5ndWFnZSB0byBzeW50YXggaGlnaGxpZ2h0IGNvZGVcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtTdW1tYXJ5fSBzdW1tYXJ5IGluc3RhbmNlXG4gICAgICovXG4gICAgYWRkQ29kZUJsb2NrKGNvZGUsIGxhbmcpIHtcbiAgICAgICAgY29uc3QgYXR0cnMgPSBPYmplY3QuYXNzaWduKHt9LCAobGFuZyAmJiB7IGxhbmcgfSkpO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy53cmFwKCdwcmUnLCB0aGlzLndyYXAoJ2NvZGUnLCBjb2RlKSwgYXR0cnMpO1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRSYXcoZWxlbWVudCkuYWRkRU9MKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gSFRNTCBsaXN0IHRvIHRoZSBzdW1tYXJ5IGJ1ZmZlclxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gaXRlbXMgbGlzdCBvZiBpdGVtcyB0byByZW5kZXJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcmRlcmVkPWZhbHNlXSAob3B0aW9uYWwpIGlmIHRoZSByZW5kZXJlZCBsaXN0IHNob3VsZCBiZSBvcmRlcmVkIG9yIG5vdCAoZGVmYXVsdDogZmFsc2UpXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7U3VtbWFyeX0gc3VtbWFyeSBpbnN0YW5jZVxuICAgICAqL1xuICAgIGFkZExpc3QoaXRlbXMsIG9yZGVyZWQgPSBmYWxzZSkge1xuICAgICAgICBjb25zdCB0YWcgPSBvcmRlcmVkID8gJ29sJyA6ICd1bCc7XG4gICAgICAgIGNvbnN0IGxpc3RJdGVtcyA9IGl0ZW1zLm1hcChpdGVtID0+IHRoaXMud3JhcCgnbGknLCBpdGVtKSkuam9pbignJyk7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLndyYXAodGFnLCBsaXN0SXRlbXMpO1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRSYXcoZWxlbWVudCkuYWRkRU9MKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gSFRNTCB0YWJsZSB0byB0aGUgc3VtbWFyeSBidWZmZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3VtbWFyeVRhYmxlQ2VsbFtdfSByb3dzIHRhYmxlIHJvd3NcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtTdW1tYXJ5fSBzdW1tYXJ5IGluc3RhbmNlXG4gICAgICovXG4gICAgYWRkVGFibGUocm93cykge1xuICAgICAgICBjb25zdCB0YWJsZUJvZHkgPSByb3dzXG4gICAgICAgICAgICAubWFwKHJvdyA9PiB7XG4gICAgICAgICAgICBjb25zdCBjZWxscyA9IHJvd1xuICAgICAgICAgICAgICAgIC5tYXAoY2VsbCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjZWxsID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy53cmFwKCd0ZCcsIGNlbGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCB7IGhlYWRlciwgZGF0YSwgY29sc3Bhbiwgcm93c3BhbiB9ID0gY2VsbDtcbiAgICAgICAgICAgICAgICBjb25zdCB0YWcgPSBoZWFkZXIgPyAndGgnIDogJ3RkJztcbiAgICAgICAgICAgICAgICBjb25zdCBhdHRycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgKGNvbHNwYW4gJiYgeyBjb2xzcGFuIH0pKSwgKHJvd3NwYW4gJiYgeyByb3dzcGFuIH0pKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy53cmFwKHRhZywgZGF0YSwgYXR0cnMpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuam9pbignJyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy53cmFwKCd0cicsIGNlbGxzKTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5qb2luKCcnKTtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMud3JhcCgndGFibGUnLCB0YWJsZUJvZHkpO1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRSYXcoZWxlbWVudCkuYWRkRU9MKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBjb2xsYXBzYWJsZSBIVE1MIGRldGFpbHMgZWxlbWVudCB0byB0aGUgc3VtbWFyeSBidWZmZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbCB0ZXh0IGZvciB0aGUgY2xvc2VkIHN0YXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgY29sbGFwc2FibGUgY29udGVudFxuICAgICAqXG4gICAgICogQHJldHVybnMge1N1bW1hcnl9IHN1bW1hcnkgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBhZGREZXRhaWxzKGxhYmVsLCBjb250ZW50KSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLndyYXAoJ2RldGFpbHMnLCB0aGlzLndyYXAoJ3N1bW1hcnknLCBsYWJlbCkgKyBjb250ZW50KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkUmF3KGVsZW1lbnQpLmFkZEVPTCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGFuIEhUTUwgaW1hZ2UgdGFnIHRvIHRoZSBzdW1tYXJ5IGJ1ZmZlclxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNyYyBwYXRoIHRvIHRoZSBpbWFnZSB5b3UgdG8gZW1iZWRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYWx0IHRleHQgZGVzY3JpcHRpb24gb2YgdGhlIGltYWdlXG4gICAgICogQHBhcmFtIHtTdW1tYXJ5SW1hZ2VPcHRpb25zfSBvcHRpb25zIChvcHRpb25hbCkgYWRkaXRpb24gaW1hZ2UgYXR0cmlidXRlc1xuICAgICAqXG4gICAgICogQHJldHVybnMge1N1bW1hcnl9IHN1bW1hcnkgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBhZGRJbWFnZShzcmMsIGFsdCwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIGNvbnN0IGF0dHJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCAod2lkdGggJiYgeyB3aWR0aCB9KSksIChoZWlnaHQgJiYgeyBoZWlnaHQgfSkpO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy53cmFwKCdpbWcnLCBudWxsLCBPYmplY3QuYXNzaWduKHsgc3JjLCBhbHQgfSwgYXR0cnMpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkUmF3KGVsZW1lbnQpLmFkZEVPTCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGFuIEhUTUwgc2VjdGlvbiBoZWFkaW5nIGVsZW1lbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IGhlYWRpbmcgdGV4dFxuICAgICAqIEBwYXJhbSB7bnVtYmVyIHwgc3RyaW5nfSBbbGV2ZWw9MV0gKG9wdGlvbmFsKSB0aGUgaGVhZGluZyBsZXZlbCwgZGVmYXVsdDogMVxuICAgICAqXG4gICAgICogQHJldHVybnMge1N1bW1hcnl9IHN1bW1hcnkgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBhZGRIZWFkaW5nKHRleHQsIGxldmVsKSB7XG4gICAgICAgIGNvbnN0IHRhZyA9IGBoJHtsZXZlbH1gO1xuICAgICAgICBjb25zdCBhbGxvd2VkVGFnID0gWydoMScsICdoMicsICdoMycsICdoNCcsICdoNScsICdoNiddLmluY2x1ZGVzKHRhZylcbiAgICAgICAgICAgID8gdGFnXG4gICAgICAgICAgICA6ICdoMSc7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLndyYXAoYWxsb3dlZFRhZywgdGV4dCk7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZFJhdyhlbGVtZW50KS5hZGRFT0woKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBIVE1MIHRoZW1hdGljIGJyZWFrICg8aHI+KSB0byB0aGUgc3VtbWFyeSBidWZmZXJcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtTdW1tYXJ5fSBzdW1tYXJ5IGluc3RhbmNlXG4gICAgICovXG4gICAgYWRkU2VwYXJhdG9yKCkge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy53cmFwKCdocicsIG51bGwpO1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRSYXcoZWxlbWVudCkuYWRkRU9MKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gSFRNTCBsaW5lIGJyZWFrICg8YnI+KSB0byB0aGUgc3VtbWFyeSBidWZmZXJcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtTdW1tYXJ5fSBzdW1tYXJ5IGluc3RhbmNlXG4gICAgICovXG4gICAgYWRkQnJlYWsoKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLndyYXAoJ2JyJywgbnVsbCk7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZFJhdyhlbGVtZW50KS5hZGRFT0woKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBIVE1MIGJsb2NrcXVvdGUgdG8gdGhlIHN1bW1hcnkgYnVmZmVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBxdW90ZSB0ZXh0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNpdGUgKG9wdGlvbmFsKSBjaXRhdGlvbiB1cmxcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtTdW1tYXJ5fSBzdW1tYXJ5IGluc3RhbmNlXG4gICAgICovXG4gICAgYWRkUXVvdGUodGV4dCwgY2l0ZSkge1xuICAgICAgICBjb25zdCBhdHRycyA9IE9iamVjdC5hc3NpZ24oe30sIChjaXRlICYmIHsgY2l0ZSB9KSk7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLndyYXAoJ2Jsb2NrcXVvdGUnLCB0ZXh0LCBhdHRycyk7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZFJhdyhlbGVtZW50KS5hZGRFT0woKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBIVE1MIGFuY2hvciB0YWcgdG8gdGhlIHN1bW1hcnkgYnVmZmVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBsaW5rIHRleHQvY29udGVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBocmVmIGh5cGVybGlua1xuICAgICAqXG4gICAgICogQHJldHVybnMge1N1bW1hcnl9IHN1bW1hcnkgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBhZGRMaW5rKHRleHQsIGhyZWYpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMud3JhcCgnYScsIHRleHQsIHsgaHJlZiB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkUmF3KGVsZW1lbnQpLmFkZEVPTCgpO1xuICAgIH1cbn1cbmNvbnN0IF9zdW1tYXJ5ID0gbmV3IFN1bW1hcnkoKTtcbi8qKlxuICogQGRlcHJlY2F0ZWQgdXNlIGBjb3JlLnN1bW1hcnlgXG4gKi9cbmV4cG9ydHMubWFya2Rvd25TdW1tYXJ5ID0gX3N1bW1hcnk7XG5leHBvcnRzLnN1bW1hcnkgPSBfc3VtbWFyeTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN1bW1hcnkuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBXZSB1c2UgYW55IGFzIGEgdmFsaWQgaW5wdXQgdHlwZVxuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueSAqL1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy50b0NvbW1hbmRQcm9wZXJ0aWVzID0gZXhwb3J0cy50b0NvbW1hbmRWYWx1ZSA9IHZvaWQgMDtcbi8qKlxuICogU2FuaXRpemVzIGFuIGlucHV0IGludG8gYSBzdHJpbmcgc28gaXQgY2FuIGJlIHBhc3NlZCBpbnRvIGlzc3VlQ29tbWFuZCBzYWZlbHlcbiAqIEBwYXJhbSBpbnB1dCBpbnB1dCB0byBzYW5pdGl6ZSBpbnRvIGEgc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIHRvQ29tbWFuZFZhbHVlKGlucHV0KSB7XG4gICAgaWYgKGlucHV0ID09PSBudWxsIHx8IGlucHV0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnIHx8IGlucHV0IGluc3RhbmNlb2YgU3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBpbnB1dDtcbiAgICB9XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGlucHV0KTtcbn1cbmV4cG9ydHMudG9Db21tYW5kVmFsdWUgPSB0b0NvbW1hbmRWYWx1ZTtcbi8qKlxuICpcbiAqIEBwYXJhbSBhbm5vdGF0aW9uUHJvcGVydGllc1xuICogQHJldHVybnMgVGhlIGNvbW1hbmQgcHJvcGVydGllcyB0byBzZW5kIHdpdGggdGhlIGFjdHVhbCBhbm5vdGF0aW9uIGNvbW1hbmRcbiAqIFNlZSBJc3N1ZUNvbW1hbmRQcm9wZXJ0aWVzOiBodHRwczovL2dpdGh1Yi5jb20vYWN0aW9ucy9ydW5uZXIvYmxvYi9tYWluL3NyYy9SdW5uZXIuV29ya2VyL0FjdGlvbkNvbW1hbmRNYW5hZ2VyLmNzI0w2NDZcbiAqL1xuZnVuY3Rpb24gdG9Db21tYW5kUHJvcGVydGllcyhhbm5vdGF0aW9uUHJvcGVydGllcykge1xuICAgIGlmICghT2JqZWN0LmtleXMoYW5ub3RhdGlvblByb3BlcnRpZXMpLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlOiBhbm5vdGF0aW9uUHJvcGVydGllcy50aXRsZSxcbiAgICAgICAgZmlsZTogYW5ub3RhdGlvblByb3BlcnRpZXMuZmlsZSxcbiAgICAgICAgbGluZTogYW5ub3RhdGlvblByb3BlcnRpZXMuc3RhcnRMaW5lLFxuICAgICAgICBlbmRMaW5lOiBhbm5vdGF0aW9uUHJvcGVydGllcy5lbmRMaW5lLFxuICAgICAgICBjb2w6IGFubm90YXRpb25Qcm9wZXJ0aWVzLnN0YXJ0Q29sdW1uLFxuICAgICAgICBlbmRDb2x1bW46IGFubm90YXRpb25Qcm9wZXJ0aWVzLmVuZENvbHVtblxuICAgIH07XG59XG5leHBvcnRzLnRvQ29tbWFuZFByb3BlcnRpZXMgPSB0b0NvbW1hbmRQcm9wZXJ0aWVzO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXRpbHMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuUGVyc29uYWxBY2Nlc3NUb2tlbkNyZWRlbnRpYWxIYW5kbGVyID0gZXhwb3J0cy5CZWFyZXJDcmVkZW50aWFsSGFuZGxlciA9IGV4cG9ydHMuQmFzaWNDcmVkZW50aWFsSGFuZGxlciA9IHZvaWQgMDtcbmNsYXNzIEJhc2ljQ3JlZGVudGlhbEhhbmRsZXIge1xuICAgIGNvbnN0cnVjdG9yKHVzZXJuYW1lLCBwYXNzd29yZCkge1xuICAgICAgICB0aGlzLnVzZXJuYW1lID0gdXNlcm5hbWU7XG4gICAgICAgIHRoaXMucGFzc3dvcmQgPSBwYXNzd29yZDtcbiAgICB9XG4gICAgcHJlcGFyZVJlcXVlc3Qob3B0aW9ucykge1xuICAgICAgICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ1RoZSByZXF1ZXN0IGhhcyBubyBoZWFkZXJzJyk7XG4gICAgICAgIH1cbiAgICAgICAgb3B0aW9ucy5oZWFkZXJzWydBdXRob3JpemF0aW9uJ10gPSBgQmFzaWMgJHtCdWZmZXIuZnJvbShgJHt0aGlzLnVzZXJuYW1lfToke3RoaXMucGFzc3dvcmR9YCkudG9TdHJpbmcoJ2Jhc2U2NCcpfWA7XG4gICAgfVxuICAgIC8vIFRoaXMgaGFuZGxlciBjYW5ub3QgaGFuZGxlIDQwMVxuICAgIGNhbkhhbmRsZUF1dGhlbnRpY2F0aW9uKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGhhbmRsZUF1dGhlbnRpY2F0aW9uKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5CYXNpY0NyZWRlbnRpYWxIYW5kbGVyID0gQmFzaWNDcmVkZW50aWFsSGFuZGxlcjtcbmNsYXNzIEJlYXJlckNyZWRlbnRpYWxIYW5kbGVyIHtcbiAgICBjb25zdHJ1Y3Rvcih0b2tlbikge1xuICAgICAgICB0aGlzLnRva2VuID0gdG9rZW47XG4gICAgfVxuICAgIC8vIGN1cnJlbnRseSBpbXBsZW1lbnRzIHByZS1hdXRob3JpemF0aW9uXG4gICAgLy8gVE9ETzogc3VwcG9ydCBwcmVBdXRoID0gZmFsc2Ugd2hlcmUgaXQgaG9va3Mgb24gNDAxXG4gICAgcHJlcGFyZVJlcXVlc3Qob3B0aW9ucykge1xuICAgICAgICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ1RoZSByZXF1ZXN0IGhhcyBubyBoZWFkZXJzJyk7XG4gICAgICAgIH1cbiAgICAgICAgb3B0aW9ucy5oZWFkZXJzWydBdXRob3JpemF0aW9uJ10gPSBgQmVhcmVyICR7dGhpcy50b2tlbn1gO1xuICAgIH1cbiAgICAvLyBUaGlzIGhhbmRsZXIgY2Fubm90IGhhbmRsZSA0MDFcbiAgICBjYW5IYW5kbGVBdXRoZW50aWNhdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBoYW5kbGVBdXRoZW50aWNhdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuQmVhcmVyQ3JlZGVudGlhbEhhbmRsZXIgPSBCZWFyZXJDcmVkZW50aWFsSGFuZGxlcjtcbmNsYXNzIFBlcnNvbmFsQWNjZXNzVG9rZW5DcmVkZW50aWFsSGFuZGxlciB7XG4gICAgY29uc3RydWN0b3IodG9rZW4pIHtcbiAgICAgICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICAgIH1cbiAgICAvLyBjdXJyZW50bHkgaW1wbGVtZW50cyBwcmUtYXV0aG9yaXphdGlvblxuICAgIC8vIFRPRE86IHN1cHBvcnQgcHJlQXV0aCA9IGZhbHNlIHdoZXJlIGl0IGhvb2tzIG9uIDQwMVxuICAgIHByZXBhcmVSZXF1ZXN0KG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdUaGUgcmVxdWVzdCBoYXMgbm8gaGVhZGVycycpO1xuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMuaGVhZGVyc1snQXV0aG9yaXphdGlvbiddID0gYEJhc2ljICR7QnVmZmVyLmZyb20oYFBBVDoke3RoaXMudG9rZW59YCkudG9TdHJpbmcoJ2Jhc2U2NCcpfWA7XG4gICAgfVxuICAgIC8vIFRoaXMgaGFuZGxlciBjYW5ub3QgaGFuZGxlIDQwMVxuICAgIGNhbkhhbmRsZUF1dGhlbnRpY2F0aW9uKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGhhbmRsZUF1dGhlbnRpY2F0aW9uKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5QZXJzb25hbEFjY2Vzc1Rva2VuQ3JlZGVudGlhbEhhbmRsZXIgPSBQZXJzb25hbEFjY2Vzc1Rva2VuQ3JlZGVudGlhbEhhbmRsZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdXRoLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueSAqL1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH0pO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKGsgIT09IFwiZGVmYXVsdFwiICYmIE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5IdHRwQ2xpZW50ID0gZXhwb3J0cy5pc0h0dHBzID0gZXhwb3J0cy5IdHRwQ2xpZW50UmVzcG9uc2UgPSBleHBvcnRzLkh0dHBDbGllbnRFcnJvciA9IGV4cG9ydHMuZ2V0UHJveHlVcmwgPSBleHBvcnRzLk1lZGlhVHlwZXMgPSBleHBvcnRzLkhlYWRlcnMgPSBleHBvcnRzLkh0dHBDb2RlcyA9IHZvaWQgMDtcbmNvbnN0IGh0dHAgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcImh0dHBcIikpO1xuY29uc3QgaHR0cHMgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcImh0dHBzXCIpKTtcbmNvbnN0IHBtID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCIuL3Byb3h5XCIpKTtcbmNvbnN0IHR1bm5lbCA9IF9faW1wb3J0U3RhcihyZXF1aXJlKFwidHVubmVsXCIpKTtcbnZhciBIdHRwQ29kZXM7XG4oZnVuY3Rpb24gKEh0dHBDb2Rlcykge1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJPS1wiXSA9IDIwMF0gPSBcIk9LXCI7XG4gICAgSHR0cENvZGVzW0h0dHBDb2Rlc1tcIk11bHRpcGxlQ2hvaWNlc1wiXSA9IDMwMF0gPSBcIk11bHRpcGxlQ2hvaWNlc1wiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJNb3ZlZFBlcm1hbmVudGx5XCJdID0gMzAxXSA9IFwiTW92ZWRQZXJtYW5lbnRseVwiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJSZXNvdXJjZU1vdmVkXCJdID0gMzAyXSA9IFwiUmVzb3VyY2VNb3ZlZFwiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJTZWVPdGhlclwiXSA9IDMwM10gPSBcIlNlZU90aGVyXCI7XG4gICAgSHR0cENvZGVzW0h0dHBDb2Rlc1tcIk5vdE1vZGlmaWVkXCJdID0gMzA0XSA9IFwiTm90TW9kaWZpZWRcIjtcbiAgICBIdHRwQ29kZXNbSHR0cENvZGVzW1wiVXNlUHJveHlcIl0gPSAzMDVdID0gXCJVc2VQcm94eVwiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJTd2l0Y2hQcm94eVwiXSA9IDMwNl0gPSBcIlN3aXRjaFByb3h5XCI7XG4gICAgSHR0cENvZGVzW0h0dHBDb2Rlc1tcIlRlbXBvcmFyeVJlZGlyZWN0XCJdID0gMzA3XSA9IFwiVGVtcG9yYXJ5UmVkaXJlY3RcIjtcbiAgICBIdHRwQ29kZXNbSHR0cENvZGVzW1wiUGVybWFuZW50UmVkaXJlY3RcIl0gPSAzMDhdID0gXCJQZXJtYW5lbnRSZWRpcmVjdFwiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJCYWRSZXF1ZXN0XCJdID0gNDAwXSA9IFwiQmFkUmVxdWVzdFwiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJVbmF1dGhvcml6ZWRcIl0gPSA0MDFdID0gXCJVbmF1dGhvcml6ZWRcIjtcbiAgICBIdHRwQ29kZXNbSHR0cENvZGVzW1wiUGF5bWVudFJlcXVpcmVkXCJdID0gNDAyXSA9IFwiUGF5bWVudFJlcXVpcmVkXCI7XG4gICAgSHR0cENvZGVzW0h0dHBDb2Rlc1tcIkZvcmJpZGRlblwiXSA9IDQwM10gPSBcIkZvcmJpZGRlblwiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJOb3RGb3VuZFwiXSA9IDQwNF0gPSBcIk5vdEZvdW5kXCI7XG4gICAgSHR0cENvZGVzW0h0dHBDb2Rlc1tcIk1ldGhvZE5vdEFsbG93ZWRcIl0gPSA0MDVdID0gXCJNZXRob2ROb3RBbGxvd2VkXCI7XG4gICAgSHR0cENvZGVzW0h0dHBDb2Rlc1tcIk5vdEFjY2VwdGFibGVcIl0gPSA0MDZdID0gXCJOb3RBY2NlcHRhYmxlXCI7XG4gICAgSHR0cENvZGVzW0h0dHBDb2Rlc1tcIlByb3h5QXV0aGVudGljYXRpb25SZXF1aXJlZFwiXSA9IDQwN10gPSBcIlByb3h5QXV0aGVudGljYXRpb25SZXF1aXJlZFwiO1xuICAgIEh0dHBDb2Rlc1tIdHRwQ29kZXNbXCJSZXF1ZXN0VGltZW91dFwiXSA9IDQwOF0gPSBcIlJlcXVlc3RUaW1lb3V0XCI7XG4gICAgSHR0cENvZGVzW0h0dHBDb2Rlc1tcIkNvbmZsaWN0XCJdID0gNDA5XSA9IFwiQ29uZmxpY3RcIjtcbiAgICBIdHRwQ29kZXNbSHR0cENvZGVzW1wiR29uZVwiXSA9IDQxMF0gPSBcIkdvbmVcIjtcbiAgICBIdHRwQ29kZXNbSHR0cENvZGVzW1wiVG9vTWFueVJlcXVlc3RzXCJdID0gNDI5XSA9IFwiVG9vTWFueVJlcXVlc3RzXCI7XG4gICAgSHR0cENvZGVzW0h0dHBDb2Rlc1tcIkludGVybmFsU2VydmVyRXJyb3JcIl0gPSA1MDBdID0gXCJJbnRlcm5hbFNlcnZlckVycm9yXCI7XG4gICAgSHR0cENvZGVzW0h0dHBDb2Rlc1tcIk5vdEltcGxlbWVudGVkXCJdID0gNTAxXSA9IFwiTm90SW1wbGVtZW50ZWRcIjtcbiAgICBIdHRwQ29kZXNbSHR0cENvZGVzW1wiQmFkR2F0ZXdheVwiXSA9IDUwMl0gPSBcIkJhZEdhdGV3YXlcIjtcbiAgICBIdHRwQ29kZXNbSHR0cENvZGVzW1wiU2VydmljZVVuYXZhaWxhYmxlXCJdID0gNTAzXSA9IFwiU2VydmljZVVuYXZhaWxhYmxlXCI7XG4gICAgSHR0cENvZGVzW0h0dHBDb2Rlc1tcIkdhdGV3YXlUaW1lb3V0XCJdID0gNTA0XSA9IFwiR2F0ZXdheVRpbWVvdXRcIjtcbn0pKEh0dHBDb2RlcyA9IGV4cG9ydHMuSHR0cENvZGVzIHx8IChleHBvcnRzLkh0dHBDb2RlcyA9IHt9KSk7XG52YXIgSGVhZGVycztcbihmdW5jdGlvbiAoSGVhZGVycykge1xuICAgIEhlYWRlcnNbXCJBY2NlcHRcIl0gPSBcImFjY2VwdFwiO1xuICAgIEhlYWRlcnNbXCJDb250ZW50VHlwZVwiXSA9IFwiY29udGVudC10eXBlXCI7XG59KShIZWFkZXJzID0gZXhwb3J0cy5IZWFkZXJzIHx8IChleHBvcnRzLkhlYWRlcnMgPSB7fSkpO1xudmFyIE1lZGlhVHlwZXM7XG4oZnVuY3Rpb24gKE1lZGlhVHlwZXMpIHtcbiAgICBNZWRpYVR5cGVzW1wiQXBwbGljYXRpb25Kc29uXCJdID0gXCJhcHBsaWNhdGlvbi9qc29uXCI7XG59KShNZWRpYVR5cGVzID0gZXhwb3J0cy5NZWRpYVR5cGVzIHx8IChleHBvcnRzLk1lZGlhVHlwZXMgPSB7fSkpO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBwcm94eSBVUkwsIGRlcGVuZGluZyB1cG9uIHRoZSBzdXBwbGllZCB1cmwgYW5kIHByb3h5IGVudmlyb25tZW50IHZhcmlhYmxlcy5cbiAqIEBwYXJhbSBzZXJ2ZXJVcmwgIFRoZSBzZXJ2ZXIgVVJMIHdoZXJlIHRoZSByZXF1ZXN0IHdpbGwgYmUgc2VudC4gRm9yIGV4YW1wbGUsIGh0dHBzOi8vYXBpLmdpdGh1Yi5jb21cbiAqL1xuZnVuY3Rpb24gZ2V0UHJveHlVcmwoc2VydmVyVXJsKSB7XG4gICAgY29uc3QgcHJveHlVcmwgPSBwbS5nZXRQcm94eVVybChuZXcgVVJMKHNlcnZlclVybCkpO1xuICAgIHJldHVybiBwcm94eVVybCA/IHByb3h5VXJsLmhyZWYgOiAnJztcbn1cbmV4cG9ydHMuZ2V0UHJveHlVcmwgPSBnZXRQcm94eVVybDtcbmNvbnN0IEh0dHBSZWRpcmVjdENvZGVzID0gW1xuICAgIEh0dHBDb2Rlcy5Nb3ZlZFBlcm1hbmVudGx5LFxuICAgIEh0dHBDb2Rlcy5SZXNvdXJjZU1vdmVkLFxuICAgIEh0dHBDb2Rlcy5TZWVPdGhlcixcbiAgICBIdHRwQ29kZXMuVGVtcG9yYXJ5UmVkaXJlY3QsXG4gICAgSHR0cENvZGVzLlBlcm1hbmVudFJlZGlyZWN0XG5dO1xuY29uc3QgSHR0cFJlc3BvbnNlUmV0cnlDb2RlcyA9IFtcbiAgICBIdHRwQ29kZXMuQmFkR2F0ZXdheSxcbiAgICBIdHRwQ29kZXMuU2VydmljZVVuYXZhaWxhYmxlLFxuICAgIEh0dHBDb2Rlcy5HYXRld2F5VGltZW91dFxuXTtcbmNvbnN0IFJldHJ5YWJsZUh0dHBWZXJicyA9IFsnT1BUSU9OUycsICdHRVQnLCAnREVMRVRFJywgJ0hFQUQnXTtcbmNvbnN0IEV4cG9uZW50aWFsQmFja29mZkNlaWxpbmcgPSAxMDtcbmNvbnN0IEV4cG9uZW50aWFsQmFja29mZlRpbWVTbGljZSA9IDU7XG5jbGFzcyBIdHRwQ2xpZW50RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSwgc3RhdHVzQ29kZSkge1xuICAgICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ0h0dHBDbGllbnRFcnJvcic7XG4gICAgICAgIHRoaXMuc3RhdHVzQ29kZSA9IHN0YXR1c0NvZGU7XG4gICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBIdHRwQ2xpZW50RXJyb3IucHJvdG90eXBlKTtcbiAgICB9XG59XG5leHBvcnRzLkh0dHBDbGllbnRFcnJvciA9IEh0dHBDbGllbnRFcnJvcjtcbmNsYXNzIEh0dHBDbGllbnRSZXNwb25zZSB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSkge1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIH1cbiAgICByZWFkQm9keSgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGxldCBvdXRwdXQgPSBCdWZmZXIuYWxsb2MoMCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCdkYXRhJywgKGNodW5rKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCA9IEJ1ZmZlci5jb25jYXQoW291dHB1dCwgY2h1bmtdKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShvdXRwdXQudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuSHR0cENsaWVudFJlc3BvbnNlID0gSHR0cENsaWVudFJlc3BvbnNlO1xuZnVuY3Rpb24gaXNIdHRwcyhyZXF1ZXN0VXJsKSB7XG4gICAgY29uc3QgcGFyc2VkVXJsID0gbmV3IFVSTChyZXF1ZXN0VXJsKTtcbiAgICByZXR1cm4gcGFyc2VkVXJsLnByb3RvY29sID09PSAnaHR0cHM6Jztcbn1cbmV4cG9ydHMuaXNIdHRwcyA9IGlzSHR0cHM7XG5jbGFzcyBIdHRwQ2xpZW50IHtcbiAgICBjb25zdHJ1Y3Rvcih1c2VyQWdlbnQsIGhhbmRsZXJzLCByZXF1ZXN0T3B0aW9ucykge1xuICAgICAgICB0aGlzLl9pZ25vcmVTc2xFcnJvciA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9hbGxvd1JlZGlyZWN0cyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2FsbG93UmVkaXJlY3REb3duZ3JhZGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fbWF4UmVkaXJlY3RzID0gNTA7XG4gICAgICAgIHRoaXMuX2FsbG93UmV0cmllcyA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9tYXhSZXRyaWVzID0gMTtcbiAgICAgICAgdGhpcy5fa2VlcEFsaXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2Rpc3Bvc2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMudXNlckFnZW50ID0gdXNlckFnZW50O1xuICAgICAgICB0aGlzLmhhbmRsZXJzID0gaGFuZGxlcnMgfHwgW107XG4gICAgICAgIHRoaXMucmVxdWVzdE9wdGlvbnMgPSByZXF1ZXN0T3B0aW9ucztcbiAgICAgICAgaWYgKHJlcXVlc3RPcHRpb25zKSB7XG4gICAgICAgICAgICBpZiAocmVxdWVzdE9wdGlvbnMuaWdub3JlU3NsRXJyb3IgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2lnbm9yZVNzbEVycm9yID0gcmVxdWVzdE9wdGlvbnMuaWdub3JlU3NsRXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9zb2NrZXRUaW1lb3V0ID0gcmVxdWVzdE9wdGlvbnMuc29ja2V0VGltZW91dDtcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0T3B0aW9ucy5hbGxvd1JlZGlyZWN0cyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWxsb3dSZWRpcmVjdHMgPSByZXF1ZXN0T3B0aW9ucy5hbGxvd1JlZGlyZWN0cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXF1ZXN0T3B0aW9ucy5hbGxvd1JlZGlyZWN0RG93bmdyYWRlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hbGxvd1JlZGlyZWN0RG93bmdyYWRlID0gcmVxdWVzdE9wdGlvbnMuYWxsb3dSZWRpcmVjdERvd25ncmFkZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXF1ZXN0T3B0aW9ucy5tYXhSZWRpcmVjdHMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX21heFJlZGlyZWN0cyA9IE1hdGgubWF4KHJlcXVlc3RPcHRpb25zLm1heFJlZGlyZWN0cywgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVxdWVzdE9wdGlvbnMua2VlcEFsaXZlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9rZWVwQWxpdmUgPSByZXF1ZXN0T3B0aW9ucy5rZWVwQWxpdmU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVxdWVzdE9wdGlvbnMuYWxsb3dSZXRyaWVzICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hbGxvd1JldHJpZXMgPSByZXF1ZXN0T3B0aW9ucy5hbGxvd1JldHJpZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVxdWVzdE9wdGlvbnMubWF4UmV0cmllcyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbWF4UmV0cmllcyA9IHJlcXVlc3RPcHRpb25zLm1heFJldHJpZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgb3B0aW9ucyhyZXF1ZXN0VXJsLCBhZGRpdGlvbmFsSGVhZGVycykge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdCgnT1BUSU9OUycsIHJlcXVlc3RVcmwsIG51bGwsIGFkZGl0aW9uYWxIZWFkZXJzIHx8IHt9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldChyZXF1ZXN0VXJsLCBhZGRpdGlvbmFsSGVhZGVycykge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdCgnR0VUJywgcmVxdWVzdFVybCwgbnVsbCwgYWRkaXRpb25hbEhlYWRlcnMgfHwge30pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZGVsKHJlcXVlc3RVcmwsIGFkZGl0aW9uYWxIZWFkZXJzKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KCdERUxFVEUnLCByZXF1ZXN0VXJsLCBudWxsLCBhZGRpdGlvbmFsSGVhZGVycyB8fCB7fSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwb3N0KHJlcXVlc3RVcmwsIGRhdGEsIGFkZGl0aW9uYWxIZWFkZXJzKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KCdQT1NUJywgcmVxdWVzdFVybCwgZGF0YSwgYWRkaXRpb25hbEhlYWRlcnMgfHwge30pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcGF0Y2gocmVxdWVzdFVybCwgZGF0YSwgYWRkaXRpb25hbEhlYWRlcnMpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3QoJ1BBVENIJywgcmVxdWVzdFVybCwgZGF0YSwgYWRkaXRpb25hbEhlYWRlcnMgfHwge30pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcHV0KHJlcXVlc3RVcmwsIGRhdGEsIGFkZGl0aW9uYWxIZWFkZXJzKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KCdQVVQnLCByZXF1ZXN0VXJsLCBkYXRhLCBhZGRpdGlvbmFsSGVhZGVycyB8fCB7fSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBoZWFkKHJlcXVlc3RVcmwsIGFkZGl0aW9uYWxIZWFkZXJzKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KCdIRUFEJywgcmVxdWVzdFVybCwgbnVsbCwgYWRkaXRpb25hbEhlYWRlcnMgfHwge30pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgc2VuZFN0cmVhbSh2ZXJiLCByZXF1ZXN0VXJsLCBzdHJlYW0sIGFkZGl0aW9uYWxIZWFkZXJzKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KHZlcmIsIHJlcXVlc3RVcmwsIHN0cmVhbSwgYWRkaXRpb25hbEhlYWRlcnMpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyBhIHR5cGVkIG9iamVjdCBmcm9tIGFuIGVuZHBvaW50XG4gICAgICogQmUgYXdhcmUgdGhhdCBub3QgZm91bmQgcmV0dXJucyBhIG51bGwuICBPdGhlciBlcnJvcnMgKDR4eCwgNXh4KSByZWplY3QgdGhlIHByb21pc2VcbiAgICAgKi9cbiAgICBnZXRKc29uKHJlcXVlc3RVcmwsIGFkZGl0aW9uYWxIZWFkZXJzID0ge30pIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGFkZGl0aW9uYWxIZWFkZXJzW0hlYWRlcnMuQWNjZXB0XSA9IHRoaXMuX2dldEV4aXN0aW5nT3JEZWZhdWx0SGVhZGVyKGFkZGl0aW9uYWxIZWFkZXJzLCBIZWFkZXJzLkFjY2VwdCwgTWVkaWFUeXBlcy5BcHBsaWNhdGlvbkpzb24pO1xuICAgICAgICAgICAgY29uc3QgcmVzID0geWllbGQgdGhpcy5nZXQocmVxdWVzdFVybCwgYWRkaXRpb25hbEhlYWRlcnMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Byb2Nlc3NSZXNwb25zZShyZXMsIHRoaXMucmVxdWVzdE9wdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcG9zdEpzb24ocmVxdWVzdFVybCwgb2JqLCBhZGRpdGlvbmFsSGVhZGVycyA9IHt9KSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5zdHJpbmdpZnkob2JqLCBudWxsLCAyKTtcbiAgICAgICAgICAgIGFkZGl0aW9uYWxIZWFkZXJzW0hlYWRlcnMuQWNjZXB0XSA9IHRoaXMuX2dldEV4aXN0aW5nT3JEZWZhdWx0SGVhZGVyKGFkZGl0aW9uYWxIZWFkZXJzLCBIZWFkZXJzLkFjY2VwdCwgTWVkaWFUeXBlcy5BcHBsaWNhdGlvbkpzb24pO1xuICAgICAgICAgICAgYWRkaXRpb25hbEhlYWRlcnNbSGVhZGVycy5Db250ZW50VHlwZV0gPSB0aGlzLl9nZXRFeGlzdGluZ09yRGVmYXVsdEhlYWRlcihhZGRpdGlvbmFsSGVhZGVycywgSGVhZGVycy5Db250ZW50VHlwZSwgTWVkaWFUeXBlcy5BcHBsaWNhdGlvbkpzb24pO1xuICAgICAgICAgICAgY29uc3QgcmVzID0geWllbGQgdGhpcy5wb3N0KHJlcXVlc3RVcmwsIGRhdGEsIGFkZGl0aW9uYWxIZWFkZXJzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wcm9jZXNzUmVzcG9uc2UocmVzLCB0aGlzLnJlcXVlc3RPcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHB1dEpzb24ocmVxdWVzdFVybCwgb2JqLCBhZGRpdGlvbmFsSGVhZGVycyA9IHt9KSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5zdHJpbmdpZnkob2JqLCBudWxsLCAyKTtcbiAgICAgICAgICAgIGFkZGl0aW9uYWxIZWFkZXJzW0hlYWRlcnMuQWNjZXB0XSA9IHRoaXMuX2dldEV4aXN0aW5nT3JEZWZhdWx0SGVhZGVyKGFkZGl0aW9uYWxIZWFkZXJzLCBIZWFkZXJzLkFjY2VwdCwgTWVkaWFUeXBlcy5BcHBsaWNhdGlvbkpzb24pO1xuICAgICAgICAgICAgYWRkaXRpb25hbEhlYWRlcnNbSGVhZGVycy5Db250ZW50VHlwZV0gPSB0aGlzLl9nZXRFeGlzdGluZ09yRGVmYXVsdEhlYWRlcihhZGRpdGlvbmFsSGVhZGVycywgSGVhZGVycy5Db250ZW50VHlwZSwgTWVkaWFUeXBlcy5BcHBsaWNhdGlvbkpzb24pO1xuICAgICAgICAgICAgY29uc3QgcmVzID0geWllbGQgdGhpcy5wdXQocmVxdWVzdFVybCwgZGF0YSwgYWRkaXRpb25hbEhlYWRlcnMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Byb2Nlc3NSZXNwb25zZShyZXMsIHRoaXMucmVxdWVzdE9wdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcGF0Y2hKc29uKHJlcXVlc3RVcmwsIG9iaiwgYWRkaXRpb25hbEhlYWRlcnMgPSB7fSkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IEpTT04uc3RyaW5naWZ5KG9iaiwgbnVsbCwgMik7XG4gICAgICAgICAgICBhZGRpdGlvbmFsSGVhZGVyc1tIZWFkZXJzLkFjY2VwdF0gPSB0aGlzLl9nZXRFeGlzdGluZ09yRGVmYXVsdEhlYWRlcihhZGRpdGlvbmFsSGVhZGVycywgSGVhZGVycy5BY2NlcHQsIE1lZGlhVHlwZXMuQXBwbGljYXRpb25Kc29uKTtcbiAgICAgICAgICAgIGFkZGl0aW9uYWxIZWFkZXJzW0hlYWRlcnMuQ29udGVudFR5cGVdID0gdGhpcy5fZ2V0RXhpc3RpbmdPckRlZmF1bHRIZWFkZXIoYWRkaXRpb25hbEhlYWRlcnMsIEhlYWRlcnMuQ29udGVudFR5cGUsIE1lZGlhVHlwZXMuQXBwbGljYXRpb25Kc29uKTtcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IHlpZWxkIHRoaXMucGF0Y2gocmVxdWVzdFVybCwgZGF0YSwgYWRkaXRpb25hbEhlYWRlcnMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Byb2Nlc3NSZXNwb25zZShyZXMsIHRoaXMucmVxdWVzdE9wdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTWFrZXMgYSByYXcgaHR0cCByZXF1ZXN0LlxuICAgICAqIEFsbCBvdGhlciBtZXRob2RzIHN1Y2ggYXMgZ2V0LCBwb3N0LCBwYXRjaCwgYW5kIHJlcXVlc3QgdWx0aW1hdGVseSBjYWxsIHRoaXMuXG4gICAgICogUHJlZmVyIGdldCwgZGVsLCBwb3N0IGFuZCBwYXRjaFxuICAgICAqL1xuICAgIHJlcXVlc3QodmVyYiwgcmVxdWVzdFVybCwgZGF0YSwgaGVhZGVycykge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2Rpc3Bvc2VkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDbGllbnQgaGFzIGFscmVhZHkgYmVlbiBkaXNwb3NlZC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZFVybCA9IG5ldyBVUkwocmVxdWVzdFVybCk7XG4gICAgICAgICAgICBsZXQgaW5mbyA9IHRoaXMuX3ByZXBhcmVSZXF1ZXN0KHZlcmIsIHBhcnNlZFVybCwgaGVhZGVycyk7XG4gICAgICAgICAgICAvLyBPbmx5IHBlcmZvcm0gcmV0cmllcyBvbiByZWFkcyBzaW5jZSB3cml0ZXMgbWF5IG5vdCBiZSBpZGVtcG90ZW50LlxuICAgICAgICAgICAgY29uc3QgbWF4VHJpZXMgPSB0aGlzLl9hbGxvd1JldHJpZXMgJiYgUmV0cnlhYmxlSHR0cFZlcmJzLmluY2x1ZGVzKHZlcmIpXG4gICAgICAgICAgICAgICAgPyB0aGlzLl9tYXhSZXRyaWVzICsgMVxuICAgICAgICAgICAgICAgIDogMTtcbiAgICAgICAgICAgIGxldCBudW1UcmllcyA9IDA7XG4gICAgICAgICAgICBsZXQgcmVzcG9uc2U7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB5aWVsZCB0aGlzLnJlcXVlc3RSYXcoaW5mbywgZGF0YSk7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgaXQncyBhbiBhdXRoZW50aWNhdGlvbiBjaGFsbGVuZ2VcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgJiZcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UubWVzc2FnZSAmJlxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5tZXNzYWdlLnN0YXR1c0NvZGUgPT09IEh0dHBDb2Rlcy5VbmF1dGhvcml6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGF1dGhlbnRpY2F0aW9uSGFuZGxlcjtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBoYW5kbGVyIG9mIHRoaXMuaGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyLmNhbkhhbmRsZUF1dGhlbnRpY2F0aW9uKHJlc3BvbnNlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dGhlbnRpY2F0aW9uSGFuZGxlciA9IGhhbmRsZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGF1dGhlbnRpY2F0aW9uSGFuZGxlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF1dGhlbnRpY2F0aW9uSGFuZGxlci5oYW5kbGVBdXRoZW50aWNhdGlvbih0aGlzLCBpbmZvLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgcmVjZWl2ZWQgYW4gdW5hdXRob3JpemVkIHJlc3BvbnNlIGJ1dCBoYXZlIG5vIGhhbmRsZXJzIHRvIGhhbmRsZSBpdC5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIExldCB0aGUgcmVzcG9uc2UgcmV0dXJuIHRvIHRoZSBjYWxsZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IHJlZGlyZWN0c1JlbWFpbmluZyA9IHRoaXMuX21heFJlZGlyZWN0cztcbiAgICAgICAgICAgICAgICB3aGlsZSAocmVzcG9uc2UubWVzc2FnZS5zdGF0dXNDb2RlICYmXG4gICAgICAgICAgICAgICAgICAgIEh0dHBSZWRpcmVjdENvZGVzLmluY2x1ZGVzKHJlc3BvbnNlLm1lc3NhZ2Uuc3RhdHVzQ29kZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWxsb3dSZWRpcmVjdHMgJiZcbiAgICAgICAgICAgICAgICAgICAgcmVkaXJlY3RzUmVtYWluaW5nID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWRpcmVjdFVybCA9IHJlc3BvbnNlLm1lc3NhZ2UuaGVhZGVyc1snbG9jYXRpb24nXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZWRpcmVjdFVybCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUncyBubyBsb2NhdGlvbiB0byByZWRpcmVjdCB0bywgd2Ugd29uJ3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZFJlZGlyZWN0VXJsID0gbmV3IFVSTChyZWRpcmVjdFVybCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZWRVcmwucHJvdG9jb2wgPT09ICdodHRwczonICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZWRVcmwucHJvdG9jb2wgIT09IHBhcnNlZFJlZGlyZWN0VXJsLnByb3RvY29sICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhdGhpcy5fYWxsb3dSZWRpcmVjdERvd25ncmFkZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWRpcmVjdCBmcm9tIEhUVFBTIHRvIEhUVFAgcHJvdG9jb2wuIFRoaXMgZG93bmdyYWRlIGlzIG5vdCBhbGxvd2VkIGZvciBzZWN1cml0eSByZWFzb25zLiBJZiB5b3Ugd2FudCB0byBhbGxvdyB0aGlzIGJlaGF2aW9yLCBzZXQgdGhlIGFsbG93UmVkaXJlY3REb3duZ3JhZGUgb3B0aW9uIHRvIHRydWUuJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gd2UgbmVlZCB0byBmaW5pc2ggcmVhZGluZyB0aGUgcmVzcG9uc2UgYmVmb3JlIHJlYXNzaWduaW5nIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgIC8vIHdoaWNoIHdpbGwgbGVhayB0aGUgb3BlbiBzb2NrZXQuXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIHJlc3BvbnNlLnJlYWRCb2R5KCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHN0cmlwIGF1dGhvcml6YXRpb24gaGVhZGVyIGlmIHJlZGlyZWN0ZWQgdG8gYSBkaWZmZXJlbnQgaG9zdG5hbWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlZFJlZGlyZWN0VXJsLmhvc3RuYW1lICE9PSBwYXJzZWRVcmwuaG9zdG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaGVhZGVyIGluIGhlYWRlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBoZWFkZXIgbmFtZXMgYXJlIGNhc2UgaW5zZW5zaXRpdmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGVhZGVyLnRvTG93ZXJDYXNlKCkgPT09ICdhdXRob3JpemF0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgaGVhZGVyc1toZWFkZXJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBsZXQncyBtYWtlIHRoZSByZXF1ZXN0IHdpdGggdGhlIG5ldyByZWRpcmVjdFVybFxuICAgICAgICAgICAgICAgICAgICBpbmZvID0gdGhpcy5fcHJlcGFyZVJlcXVlc3QodmVyYiwgcGFyc2VkUmVkaXJlY3RVcmwsIGhlYWRlcnMpO1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IHlpZWxkIHRoaXMucmVxdWVzdFJhdyhpbmZvLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgcmVkaXJlY3RzUmVtYWluaW5nLS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UubWVzc2FnZS5zdGF0dXNDb2RlIHx8XG4gICAgICAgICAgICAgICAgICAgICFIdHRwUmVzcG9uc2VSZXRyeUNvZGVzLmluY2x1ZGVzKHJlc3BvbnNlLm1lc3NhZ2Uuc3RhdHVzQ29kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgbm90IGEgcmV0cnkgY29kZSwgcmV0dXJuIGltbWVkaWF0ZWx5IGluc3RlYWQgb2YgcmV0cnlpbmdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBudW1UcmllcyArPSAxO1xuICAgICAgICAgICAgICAgIGlmIChudW1UcmllcyA8IG1heFRyaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIHJlc3BvbnNlLnJlYWRCb2R5KCk7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMuX3BlcmZvcm1FeHBvbmVudGlhbEJhY2tvZmYobnVtVHJpZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gd2hpbGUgKG51bVRyaWVzIDwgbWF4VHJpZXMpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTmVlZHMgdG8gYmUgY2FsbGVkIGlmIGtlZXBBbGl2ZSBpcyBzZXQgdG8gdHJ1ZSBpbiByZXF1ZXN0IG9wdGlvbnMuXG4gICAgICovXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2FnZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9hZ2VudC5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZGlzcG9zZWQgPSB0cnVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSYXcgcmVxdWVzdC5cbiAgICAgKiBAcGFyYW0gaW5mb1xuICAgICAqIEBwYXJhbSBkYXRhXG4gICAgICovXG4gICAgcmVxdWVzdFJhdyhpbmZvLCBkYXRhKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGxiYWNrRm9yUmVzdWx0KGVyciwgcmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGBlcnJgIGlzIG5vdCBwYXNzZWQsIHRoZW4gYHJlc2AgbXVzdCBiZSBwYXNzZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdVbmtub3duIGVycm9yJykpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMucmVxdWVzdFJhd1dpdGhDYWxsYmFjayhpbmZvLCBkYXRhLCBjYWxsYmFja0ZvclJlc3VsdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJhdyByZXF1ZXN0IHdpdGggY2FsbGJhY2suXG4gICAgICogQHBhcmFtIGluZm9cbiAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAqIEBwYXJhbSBvblJlc3VsdFxuICAgICAqL1xuICAgIHJlcXVlc3RSYXdXaXRoQ2FsbGJhY2soaW5mbywgZGF0YSwgb25SZXN1bHQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgaWYgKCFpbmZvLm9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICAgICAgICAgIGluZm8ub3B0aW9ucy5oZWFkZXJzID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmZvLm9wdGlvbnMuaGVhZGVyc1snQ29udGVudC1MZW5ndGgnXSA9IEJ1ZmZlci5ieXRlTGVuZ3RoKGRhdGEsICd1dGY4Jyk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNhbGxiYWNrQ2FsbGVkID0gZmFsc2U7XG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3VsdChlcnIsIHJlcykge1xuICAgICAgICAgICAgaWYgKCFjYWxsYmFja0NhbGxlZCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrQ2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBvblJlc3VsdChlcnIsIHJlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVxID0gaW5mby5odHRwTW9kdWxlLnJlcXVlc3QoaW5mby5vcHRpb25zLCAobXNnKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXMgPSBuZXcgSHR0cENsaWVudFJlc3BvbnNlKG1zZyk7XG4gICAgICAgICAgICBoYW5kbGVSZXN1bHQodW5kZWZpbmVkLCByZXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHNvY2tldDtcbiAgICAgICAgcmVxLm9uKCdzb2NrZXQnLCBzb2NrID0+IHtcbiAgICAgICAgICAgIHNvY2tldCA9IHNvY2s7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBJZiB3ZSBldmVyIGdldCBkaXNjb25uZWN0ZWQsIHdlIHdhbnQgdGhlIHNvY2tldCB0byB0aW1lb3V0IGV2ZW50dWFsbHlcbiAgICAgICAgcmVxLnNldFRpbWVvdXQodGhpcy5fc29ja2V0VGltZW91dCB8fCAzICogNjAwMDAsICgpID0+IHtcbiAgICAgICAgICAgIGlmIChzb2NrZXQpIHtcbiAgICAgICAgICAgICAgICBzb2NrZXQuZW5kKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBoYW5kbGVSZXN1bHQobmV3IEVycm9yKGBSZXF1ZXN0IHRpbWVvdXQ6ICR7aW5mby5vcHRpb25zLnBhdGh9YCkpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmVxLm9uKCdlcnJvcicsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIC8vIGVyciBoYXMgc3RhdHVzQ29kZSBwcm9wZXJ0eVxuICAgICAgICAgICAgLy8gcmVzIHNob3VsZCBoYXZlIGhlYWRlcnNcbiAgICAgICAgICAgIGhhbmRsZVJlc3VsdChlcnIpO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGRhdGEgJiYgdHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXEud3JpdGUoZGF0YSwgJ3V0ZjgnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YSAmJiB0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGRhdGEub24oJ2Nsb3NlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJlcS5lbmQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGF0YS5waXBlKHJlcSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXEuZW5kKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyBhbiBodHRwIGFnZW50LiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWZ1bCB3aGVuIHlvdSBuZWVkIGFuIGh0dHAgYWdlbnQgdGhhdCBoYW5kbGVzXG4gICAgICogcm91dGluZyB0aHJvdWdoIGEgcHJveHkgc2VydmVyIC0gZGVwZW5kaW5nIHVwb24gdGhlIHVybCBhbmQgcHJveHkgZW52aXJvbm1lbnQgdmFyaWFibGVzLlxuICAgICAqIEBwYXJhbSBzZXJ2ZXJVcmwgIFRoZSBzZXJ2ZXIgVVJMIHdoZXJlIHRoZSByZXF1ZXN0IHdpbGwgYmUgc2VudC4gRm9yIGV4YW1wbGUsIGh0dHBzOi8vYXBpLmdpdGh1Yi5jb21cbiAgICAgKi9cbiAgICBnZXRBZ2VudChzZXJ2ZXJVcmwpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVXJsID0gbmV3IFVSTChzZXJ2ZXJVcmwpO1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0QWdlbnQocGFyc2VkVXJsKTtcbiAgICB9XG4gICAgX3ByZXBhcmVSZXF1ZXN0KG1ldGhvZCwgcmVxdWVzdFVybCwgaGVhZGVycykge1xuICAgICAgICBjb25zdCBpbmZvID0ge307XG4gICAgICAgIGluZm8ucGFyc2VkVXJsID0gcmVxdWVzdFVybDtcbiAgICAgICAgY29uc3QgdXNpbmdTc2wgPSBpbmZvLnBhcnNlZFVybC5wcm90b2NvbCA9PT0gJ2h0dHBzOic7XG4gICAgICAgIGluZm8uaHR0cE1vZHVsZSA9IHVzaW5nU3NsID8gaHR0cHMgOiBodHRwO1xuICAgICAgICBjb25zdCBkZWZhdWx0UG9ydCA9IHVzaW5nU3NsID8gNDQzIDogODA7XG4gICAgICAgIGluZm8ub3B0aW9ucyA9IHt9O1xuICAgICAgICBpbmZvLm9wdGlvbnMuaG9zdCA9IGluZm8ucGFyc2VkVXJsLmhvc3RuYW1lO1xuICAgICAgICBpbmZvLm9wdGlvbnMucG9ydCA9IGluZm8ucGFyc2VkVXJsLnBvcnRcbiAgICAgICAgICAgID8gcGFyc2VJbnQoaW5mby5wYXJzZWRVcmwucG9ydClcbiAgICAgICAgICAgIDogZGVmYXVsdFBvcnQ7XG4gICAgICAgIGluZm8ub3B0aW9ucy5wYXRoID1cbiAgICAgICAgICAgIChpbmZvLnBhcnNlZFVybC5wYXRobmFtZSB8fCAnJykgKyAoaW5mby5wYXJzZWRVcmwuc2VhcmNoIHx8ICcnKTtcbiAgICAgICAgaW5mby5vcHRpb25zLm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgICAgaW5mby5vcHRpb25zLmhlYWRlcnMgPSB0aGlzLl9tZXJnZUhlYWRlcnMoaGVhZGVycyk7XG4gICAgICAgIGlmICh0aGlzLnVzZXJBZ2VudCAhPSBudWxsKSB7XG4gICAgICAgICAgICBpbmZvLm9wdGlvbnMuaGVhZGVyc1sndXNlci1hZ2VudCddID0gdGhpcy51c2VyQWdlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgaW5mby5vcHRpb25zLmFnZW50ID0gdGhpcy5fZ2V0QWdlbnQoaW5mby5wYXJzZWRVcmwpO1xuICAgICAgICAvLyBnaXZlcyBoYW5kbGVycyBhbiBvcHBvcnR1bml0eSB0byBwYXJ0aWNpcGF0ZVxuICAgICAgICBpZiAodGhpcy5oYW5kbGVycykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBoYW5kbGVyIG9mIHRoaXMuaGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLnByZXBhcmVSZXF1ZXN0KGluZm8ub3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluZm87XG4gICAgfVxuICAgIF9tZXJnZUhlYWRlcnMoaGVhZGVycykge1xuICAgICAgICBpZiAodGhpcy5yZXF1ZXN0T3B0aW9ucyAmJiB0aGlzLnJlcXVlc3RPcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBsb3dlcmNhc2VLZXlzKHRoaXMucmVxdWVzdE9wdGlvbnMuaGVhZGVycyksIGxvd2VyY2FzZUtleXMoaGVhZGVycyB8fCB7fSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsb3dlcmNhc2VLZXlzKGhlYWRlcnMgfHwge30pO1xuICAgIH1cbiAgICBfZ2V0RXhpc3RpbmdPckRlZmF1bHRIZWFkZXIoYWRkaXRpb25hbEhlYWRlcnMsIGhlYWRlciwgX2RlZmF1bHQpIHtcbiAgICAgICAgbGV0IGNsaWVudEhlYWRlcjtcbiAgICAgICAgaWYgKHRoaXMucmVxdWVzdE9wdGlvbnMgJiYgdGhpcy5yZXF1ZXN0T3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgICAgICBjbGllbnRIZWFkZXIgPSBsb3dlcmNhc2VLZXlzKHRoaXMucmVxdWVzdE9wdGlvbnMuaGVhZGVycylbaGVhZGVyXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWRkaXRpb25hbEhlYWRlcnNbaGVhZGVyXSB8fCBjbGllbnRIZWFkZXIgfHwgX2RlZmF1bHQ7XG4gICAgfVxuICAgIF9nZXRBZ2VudChwYXJzZWRVcmwpIHtcbiAgICAgICAgbGV0IGFnZW50O1xuICAgICAgICBjb25zdCBwcm94eVVybCA9IHBtLmdldFByb3h5VXJsKHBhcnNlZFVybCk7XG4gICAgICAgIGNvbnN0IHVzZVByb3h5ID0gcHJveHlVcmwgJiYgcHJveHlVcmwuaG9zdG5hbWU7XG4gICAgICAgIGlmICh0aGlzLl9rZWVwQWxpdmUgJiYgdXNlUHJveHkpIHtcbiAgICAgICAgICAgIGFnZW50ID0gdGhpcy5fcHJveHlBZ2VudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fa2VlcEFsaXZlICYmICF1c2VQcm94eSkge1xuICAgICAgICAgICAgYWdlbnQgPSB0aGlzLl9hZ2VudDtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiBhZ2VudCBpcyBhbHJlYWR5IGFzc2lnbmVkIHVzZSB0aGF0IGFnZW50LlxuICAgICAgICBpZiAoYWdlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBhZ2VudDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB1c2luZ1NzbCA9IHBhcnNlZFVybC5wcm90b2NvbCA9PT0gJ2h0dHBzOic7XG4gICAgICAgIGxldCBtYXhTb2NrZXRzID0gMTAwO1xuICAgICAgICBpZiAodGhpcy5yZXF1ZXN0T3B0aW9ucykge1xuICAgICAgICAgICAgbWF4U29ja2V0cyA9IHRoaXMucmVxdWVzdE9wdGlvbnMubWF4U29ja2V0cyB8fCBodHRwLmdsb2JhbEFnZW50Lm1heFNvY2tldHM7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVGhpcyBpcyBgdXNlUHJveHlgIGFnYWluLCBidXQgd2UgbmVlZCB0byBjaGVjayBgcHJveHlVUmxgIGRpcmVjdGx5IGZvciBUeXBlU2NyaXB0cydzIGZsb3cgYW5hbHlzaXMuXG4gICAgICAgIGlmIChwcm94eVVybCAmJiBwcm94eVVybC5ob3N0bmFtZSkge1xuICAgICAgICAgICAgY29uc3QgYWdlbnRPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIG1heFNvY2tldHMsXG4gICAgICAgICAgICAgICAga2VlcEFsaXZlOiB0aGlzLl9rZWVwQWxpdmUsXG4gICAgICAgICAgICAgICAgcHJveHk6IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgKChwcm94eVVybC51c2VybmFtZSB8fCBwcm94eVVybC5wYXNzd29yZCkgJiYge1xuICAgICAgICAgICAgICAgICAgICBwcm94eUF1dGg6IGAke3Byb3h5VXJsLnVzZXJuYW1lfToke3Byb3h5VXJsLnBhc3N3b3JkfWBcbiAgICAgICAgICAgICAgICB9KSksIHsgaG9zdDogcHJveHlVcmwuaG9zdG5hbWUsIHBvcnQ6IHByb3h5VXJsLnBvcnQgfSlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsZXQgdHVubmVsQWdlbnQ7XG4gICAgICAgICAgICBjb25zdCBvdmVySHR0cHMgPSBwcm94eVVybC5wcm90b2NvbCA9PT0gJ2h0dHBzOic7XG4gICAgICAgICAgICBpZiAodXNpbmdTc2wpIHtcbiAgICAgICAgICAgICAgICB0dW5uZWxBZ2VudCA9IG92ZXJIdHRwcyA/IHR1bm5lbC5odHRwc092ZXJIdHRwcyA6IHR1bm5lbC5odHRwc092ZXJIdHRwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdHVubmVsQWdlbnQgPSBvdmVySHR0cHMgPyB0dW5uZWwuaHR0cE92ZXJIdHRwcyA6IHR1bm5lbC5odHRwT3Zlckh0dHA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZ2VudCA9IHR1bm5lbEFnZW50KGFnZW50T3B0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLl9wcm94eUFnZW50ID0gYWdlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgcmV1c2luZyBhZ2VudCBhY3Jvc3MgcmVxdWVzdCBhbmQgdHVubmVsaW5nIGFnZW50IGlzbid0IGFzc2lnbmVkIGNyZWF0ZSBhIG5ldyBhZ2VudFxuICAgICAgICBpZiAodGhpcy5fa2VlcEFsaXZlICYmICFhZ2VudCkge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHsga2VlcEFsaXZlOiB0aGlzLl9rZWVwQWxpdmUsIG1heFNvY2tldHMgfTtcbiAgICAgICAgICAgIGFnZW50ID0gdXNpbmdTc2wgPyBuZXcgaHR0cHMuQWdlbnQob3B0aW9ucykgOiBuZXcgaHR0cC5BZ2VudChvcHRpb25zKTtcbiAgICAgICAgICAgIHRoaXMuX2FnZW50ID0gYWdlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgbm90IHVzaW5nIHByaXZhdGUgYWdlbnQgYW5kIHR1bm5lbCBhZ2VudCBpc24ndCBzZXR1cCB0aGVuIHVzZSBnbG9iYWwgYWdlbnRcbiAgICAgICAgaWYgKCFhZ2VudCkge1xuICAgICAgICAgICAgYWdlbnQgPSB1c2luZ1NzbCA/IGh0dHBzLmdsb2JhbEFnZW50IDogaHR0cC5nbG9iYWxBZ2VudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXNpbmdTc2wgJiYgdGhpcy5faWdub3JlU3NsRXJyb3IpIHtcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IHdhbnQgdG8gc2V0IE5PREVfVExTX1JFSkVDVF9VTkFVVEhPUklaRUQ9MCBzaW5jZSB0aGF0IHdpbGwgYWZmZWN0IHJlcXVlc3QgZm9yIGVudGlyZSBwcm9jZXNzXG4gICAgICAgICAgICAvLyBodHRwLlJlcXVlc3RPcHRpb25zIGRvZXNuJ3QgZXhwb3NlIGEgd2F5IHRvIG1vZGlmeSBSZXF1ZXN0T3B0aW9ucy5hZ2VudC5vcHRpb25zXG4gICAgICAgICAgICAvLyB3ZSBoYXZlIHRvIGNhc3QgaXQgdG8gYW55IGFuZCBjaGFuZ2UgaXQgZGlyZWN0bHlcbiAgICAgICAgICAgIGFnZW50Lm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKGFnZW50Lm9wdGlvbnMgfHwge30sIHtcbiAgICAgICAgICAgICAgICByZWplY3RVbmF1dGhvcml6ZWQ6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWdlbnQ7XG4gICAgfVxuICAgIF9wZXJmb3JtRXhwb25lbnRpYWxCYWNrb2ZmKHJldHJ5TnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICByZXRyeU51bWJlciA9IE1hdGgubWluKEV4cG9uZW50aWFsQmFja29mZkNlaWxpbmcsIHJldHJ5TnVtYmVyKTtcbiAgICAgICAgICAgIGNvbnN0IG1zID0gRXhwb25lbnRpYWxCYWNrb2ZmVGltZVNsaWNlICogTWF0aC5wb3coMiwgcmV0cnlOdW1iZXIpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dCgoKSA9PiByZXNvbHZlKCksIG1zKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfcHJvY2Vzc1Jlc3BvbnNlKHJlcywgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGF0dXNDb2RlID0gcmVzLm1lc3NhZ2Uuc3RhdHVzQ29kZSB8fCAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0ge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlLFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHt9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvLyBub3QgZm91bmQgbGVhZHMgdG8gbnVsbCBvYmogcmV0dXJuZWRcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHVzQ29kZSA9PT0gSHR0cENvZGVzLk5vdEZvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBnZXQgdGhlIHJlc3VsdCBmcm9tIHRoZSBib2R5XG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZGF0ZVRpbWVEZXNlcmlhbGl6ZXIoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYSA9IG5ldyBEYXRlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNOYU4oYS52YWx1ZU9mKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGE7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgb2JqO1xuICAgICAgICAgICAgICAgIGxldCBjb250ZW50cztcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50cyA9IHlpZWxkIHJlcy5yZWFkQm9keSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29udGVudHMgJiYgY29udGVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5kZXNlcmlhbGl6ZURhdGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gSlNPTi5wYXJzZShjb250ZW50cywgZGF0ZVRpbWVEZXNlcmlhbGl6ZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gSlNPTi5wYXJzZShjb250ZW50cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5yZXN1bHQgPSBvYmo7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UuaGVhZGVycyA9IHJlcy5tZXNzYWdlLmhlYWRlcnM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSW52YWxpZCByZXNvdXJjZSAoY29udGVudHMgbm90IGpzb24pOyAgbGVhdmluZyByZXN1bHQgb2JqIG51bGxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gbm90ZSB0aGF0IDN4eCByZWRpcmVjdHMgYXJlIGhhbmRsZWQgYnkgdGhlIGh0dHAgbGF5ZXIuXG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1c0NvZGUgPiAyOTkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1zZztcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgZXhjZXB0aW9uL2Vycm9yIGluIGJvZHksIGF0dGVtcHQgdG8gZ2V0IGJldHRlciBlcnJvclxuICAgICAgICAgICAgICAgICAgICBpZiAob2JqICYmIG9iai5tZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtc2cgPSBvYmoubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjb250ZW50cyAmJiBjb250ZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpdCBtYXkgYmUgdGhlIGNhc2UgdGhhdCB0aGUgZXhjZXB0aW9uIGlzIGluIHRoZSBib2R5IG1lc3NhZ2UgYXMgc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBtc2cgPSBjb250ZW50cztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1zZyA9IGBGYWlsZWQgcmVxdWVzdDogKCR7c3RhdHVzQ29kZX0pYDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnIgPSBuZXcgSHR0cENsaWVudEVycm9yKG1zZywgc3RhdHVzQ29kZSk7XG4gICAgICAgICAgICAgICAgICAgIGVyci5yZXN1bHQgPSByZXNwb25zZS5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLkh0dHBDbGllbnQgPSBIdHRwQ2xpZW50O1xuY29uc3QgbG93ZXJjYXNlS2V5cyA9IChvYmopID0+IE9iamVjdC5rZXlzKG9iaikucmVkdWNlKChjLCBrKSA9PiAoKGNbay50b0xvd2VyQ2FzZSgpXSA9IG9ialtrXSksIGMpLCB7fSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuY2hlY2tCeXBhc3MgPSBleHBvcnRzLmdldFByb3h5VXJsID0gdm9pZCAwO1xuZnVuY3Rpb24gZ2V0UHJveHlVcmwocmVxVXJsKSB7XG4gICAgY29uc3QgdXNpbmdTc2wgPSByZXFVcmwucHJvdG9jb2wgPT09ICdodHRwczonO1xuICAgIGlmIChjaGVja0J5cGFzcyhyZXFVcmwpKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbnN0IHByb3h5VmFyID0gKCgpID0+IHtcbiAgICAgICAgaWYgKHVzaW5nU3NsKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvY2Vzcy5lbnZbJ2h0dHBzX3Byb3h5J10gfHwgcHJvY2Vzcy5lbnZbJ0hUVFBTX1BST1hZJ107XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvY2Vzcy5lbnZbJ2h0dHBfcHJveHknXSB8fCBwcm9jZXNzLmVudlsnSFRUUF9QUk9YWSddO1xuICAgICAgICB9XG4gICAgfSkoKTtcbiAgICBpZiAocHJveHlWYXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBVUkwocHJveHlWYXIpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG59XG5leHBvcnRzLmdldFByb3h5VXJsID0gZ2V0UHJveHlVcmw7XG5mdW5jdGlvbiBjaGVja0J5cGFzcyhyZXFVcmwpIHtcbiAgICBpZiAoIXJlcVVybC5ob3N0bmFtZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHJlcUhvc3QgPSByZXFVcmwuaG9zdG5hbWU7XG4gICAgaWYgKGlzTG9vcGJhY2tBZGRyZXNzKHJlcUhvc3QpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBjb25zdCBub1Byb3h5ID0gcHJvY2Vzcy5lbnZbJ25vX3Byb3h5J10gfHwgcHJvY2Vzcy5lbnZbJ05PX1BST1hZJ10gfHwgJyc7XG4gICAgaWYgKCFub1Byb3h5KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gRGV0ZXJtaW5lIHRoZSByZXF1ZXN0IHBvcnRcbiAgICBsZXQgcmVxUG9ydDtcbiAgICBpZiAocmVxVXJsLnBvcnQpIHtcbiAgICAgICAgcmVxUG9ydCA9IE51bWJlcihyZXFVcmwucG9ydCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHJlcVVybC5wcm90b2NvbCA9PT0gJ2h0dHA6Jykge1xuICAgICAgICByZXFQb3J0ID0gODA7XG4gICAgfVxuICAgIGVsc2UgaWYgKHJlcVVybC5wcm90b2NvbCA9PT0gJ2h0dHBzOicpIHtcbiAgICAgICAgcmVxUG9ydCA9IDQ0MztcbiAgICB9XG4gICAgLy8gRm9ybWF0IHRoZSByZXF1ZXN0IGhvc3RuYW1lIGFuZCBob3N0bmFtZSB3aXRoIHBvcnRcbiAgICBjb25zdCB1cHBlclJlcUhvc3RzID0gW3JlcVVybC5ob3N0bmFtZS50b1VwcGVyQ2FzZSgpXTtcbiAgICBpZiAodHlwZW9mIHJlcVBvcnQgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHVwcGVyUmVxSG9zdHMucHVzaChgJHt1cHBlclJlcUhvc3RzWzBdfToke3JlcVBvcnR9YCk7XG4gICAgfVxuICAgIC8vIENvbXBhcmUgcmVxdWVzdCBob3N0IGFnYWluc3Qgbm9wcm94eVxuICAgIGZvciAoY29uc3QgdXBwZXJOb1Byb3h5SXRlbSBvZiBub1Byb3h5XG4gICAgICAgIC5zcGxpdCgnLCcpXG4gICAgICAgIC5tYXAoeCA9PiB4LnRyaW0oKS50b1VwcGVyQ2FzZSgpKVxuICAgICAgICAuZmlsdGVyKHggPT4geCkpIHtcbiAgICAgICAgaWYgKHVwcGVyTm9Qcm94eUl0ZW0gPT09ICcqJyB8fFxuICAgICAgICAgICAgdXBwZXJSZXFIb3N0cy5zb21lKHggPT4geCA9PT0gdXBwZXJOb1Byb3h5SXRlbSB8fFxuICAgICAgICAgICAgICAgIHguZW5kc1dpdGgoYC4ke3VwcGVyTm9Qcm94eUl0ZW19YCkgfHxcbiAgICAgICAgICAgICAgICAodXBwZXJOb1Byb3h5SXRlbS5zdGFydHNXaXRoKCcuJykgJiZcbiAgICAgICAgICAgICAgICAgICAgeC5lbmRzV2l0aChgJHt1cHBlck5vUHJveHlJdGVtfWApKSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmV4cG9ydHMuY2hlY2tCeXBhc3MgPSBjaGVja0J5cGFzcztcbmZ1bmN0aW9uIGlzTG9vcGJhY2tBZGRyZXNzKGhvc3QpIHtcbiAgICBjb25zdCBob3N0TG93ZXIgPSBob3N0LnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIChob3N0TG93ZXIgPT09ICdsb2NhbGhvc3QnIHx8XG4gICAgICAgIGhvc3RMb3dlci5zdGFydHNXaXRoKCcxMjcuJykgfHxcbiAgICAgICAgaG9zdExvd2VyLnN0YXJ0c1dpdGgoJ1s6OjFdJykgfHxcbiAgICAgICAgaG9zdExvd2VyLnN0YXJ0c1dpdGgoJ1swOjA6MDowOjA6MDowOjFdJykpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJveHkuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBiYWxhbmNlZDtcbmZ1bmN0aW9uIGJhbGFuY2VkKGEsIGIsIHN0cikge1xuICBpZiAoYSBpbnN0YW5jZW9mIFJlZ0V4cCkgYSA9IG1heWJlTWF0Y2goYSwgc3RyKTtcbiAgaWYgKGIgaW5zdGFuY2VvZiBSZWdFeHApIGIgPSBtYXliZU1hdGNoKGIsIHN0cik7XG5cbiAgdmFyIHIgPSByYW5nZShhLCBiLCBzdHIpO1xuXG4gIHJldHVybiByICYmIHtcbiAgICBzdGFydDogclswXSxcbiAgICBlbmQ6IHJbMV0sXG4gICAgcHJlOiBzdHIuc2xpY2UoMCwgclswXSksXG4gICAgYm9keTogc3RyLnNsaWNlKHJbMF0gKyBhLmxlbmd0aCwgclsxXSksXG4gICAgcG9zdDogc3RyLnNsaWNlKHJbMV0gKyBiLmxlbmd0aClcbiAgfTtcbn1cblxuZnVuY3Rpb24gbWF5YmVNYXRjaChyZWcsIHN0cikge1xuICB2YXIgbSA9IHN0ci5tYXRjaChyZWcpO1xuICByZXR1cm4gbSA/IG1bMF0gOiBudWxsO1xufVxuXG5iYWxhbmNlZC5yYW5nZSA9IHJhbmdlO1xuZnVuY3Rpb24gcmFuZ2UoYSwgYiwgc3RyKSB7XG4gIHZhciBiZWdzLCBiZWcsIGxlZnQsIHJpZ2h0LCByZXN1bHQ7XG4gIHZhciBhaSA9IHN0ci5pbmRleE9mKGEpO1xuICB2YXIgYmkgPSBzdHIuaW5kZXhPZihiLCBhaSArIDEpO1xuICB2YXIgaSA9IGFpO1xuXG4gIGlmIChhaSA+PSAwICYmIGJpID4gMCkge1xuICAgIGlmKGE9PT1iKSB7XG4gICAgICByZXR1cm4gW2FpLCBiaV07XG4gICAgfVxuICAgIGJlZ3MgPSBbXTtcbiAgICBsZWZ0ID0gc3RyLmxlbmd0aDtcblxuICAgIHdoaWxlIChpID49IDAgJiYgIXJlc3VsdCkge1xuICAgICAgaWYgKGkgPT0gYWkpIHtcbiAgICAgICAgYmVncy5wdXNoKGkpO1xuICAgICAgICBhaSA9IHN0ci5pbmRleE9mKGEsIGkgKyAxKTtcbiAgICAgIH0gZWxzZSBpZiAoYmVncy5sZW5ndGggPT0gMSkge1xuICAgICAgICByZXN1bHQgPSBbIGJlZ3MucG9wKCksIGJpIF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBiZWcgPSBiZWdzLnBvcCgpO1xuICAgICAgICBpZiAoYmVnIDwgbGVmdCkge1xuICAgICAgICAgIGxlZnQgPSBiZWc7XG4gICAgICAgICAgcmlnaHQgPSBiaTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJpID0gc3RyLmluZGV4T2YoYiwgaSArIDEpO1xuICAgICAgfVxuXG4gICAgICBpID0gYWkgPCBiaSAmJiBhaSA+PSAwID8gYWkgOiBiaTtcbiAgICB9XG5cbiAgICBpZiAoYmVncy5sZW5ndGgpIHtcbiAgICAgIHJlc3VsdCA9IFsgbGVmdCwgcmlnaHQgXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuIiwidmFyIGNvbmNhdE1hcCA9IHJlcXVpcmUoJ2NvbmNhdC1tYXAnKTtcbnZhciBiYWxhbmNlZCA9IHJlcXVpcmUoJ2JhbGFuY2VkLW1hdGNoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwYW5kVG9wO1xuXG52YXIgZXNjU2xhc2ggPSAnXFwwU0xBU0gnK01hdGgucmFuZG9tKCkrJ1xcMCc7XG52YXIgZXNjT3BlbiA9ICdcXDBPUEVOJytNYXRoLnJhbmRvbSgpKydcXDAnO1xudmFyIGVzY0Nsb3NlID0gJ1xcMENMT1NFJytNYXRoLnJhbmRvbSgpKydcXDAnO1xudmFyIGVzY0NvbW1hID0gJ1xcMENPTU1BJytNYXRoLnJhbmRvbSgpKydcXDAnO1xudmFyIGVzY1BlcmlvZCA9ICdcXDBQRVJJT0QnK01hdGgucmFuZG9tKCkrJ1xcMCc7XG5cbmZ1bmN0aW9uIG51bWVyaWMoc3RyKSB7XG4gIHJldHVybiBwYXJzZUludChzdHIsIDEwKSA9PSBzdHJcbiAgICA/IHBhcnNlSW50KHN0ciwgMTApXG4gICAgOiBzdHIuY2hhckNvZGVBdCgwKTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlQnJhY2VzKHN0cikge1xuICByZXR1cm4gc3RyLnNwbGl0KCdcXFxcXFxcXCcpLmpvaW4oZXNjU2xhc2gpXG4gICAgICAgICAgICAuc3BsaXQoJ1xcXFx7Jykuam9pbihlc2NPcGVuKVxuICAgICAgICAgICAgLnNwbGl0KCdcXFxcfScpLmpvaW4oZXNjQ2xvc2UpXG4gICAgICAgICAgICAuc3BsaXQoJ1xcXFwsJykuam9pbihlc2NDb21tYSlcbiAgICAgICAgICAgIC5zcGxpdCgnXFxcXC4nKS5qb2luKGVzY1BlcmlvZCk7XG59XG5cbmZ1bmN0aW9uIHVuZXNjYXBlQnJhY2VzKHN0cikge1xuICByZXR1cm4gc3RyLnNwbGl0KGVzY1NsYXNoKS5qb2luKCdcXFxcJylcbiAgICAgICAgICAgIC5zcGxpdChlc2NPcGVuKS5qb2luKCd7JylcbiAgICAgICAgICAgIC5zcGxpdChlc2NDbG9zZSkuam9pbignfScpXG4gICAgICAgICAgICAuc3BsaXQoZXNjQ29tbWEpLmpvaW4oJywnKVxuICAgICAgICAgICAgLnNwbGl0KGVzY1BlcmlvZCkuam9pbignLicpO1xufVxuXG5cbi8vIEJhc2ljYWxseSBqdXN0IHN0ci5zcGxpdChcIixcIiksIGJ1dCBoYW5kbGluZyBjYXNlc1xuLy8gd2hlcmUgd2UgaGF2ZSBuZXN0ZWQgYnJhY2VkIHNlY3Rpb25zLCB3aGljaCBzaG91bGQgYmVcbi8vIHRyZWF0ZWQgYXMgaW5kaXZpZHVhbCBtZW1iZXJzLCBsaWtlIHthLHtiLGN9LGR9XG5mdW5jdGlvbiBwYXJzZUNvbW1hUGFydHMoc3RyKSB7XG4gIGlmICghc3RyKVxuICAgIHJldHVybiBbJyddO1xuXG4gIHZhciBwYXJ0cyA9IFtdO1xuICB2YXIgbSA9IGJhbGFuY2VkKCd7JywgJ30nLCBzdHIpO1xuXG4gIGlmICghbSlcbiAgICByZXR1cm4gc3RyLnNwbGl0KCcsJyk7XG5cbiAgdmFyIHByZSA9IG0ucHJlO1xuICB2YXIgYm9keSA9IG0uYm9keTtcbiAgdmFyIHBvc3QgPSBtLnBvc3Q7XG4gIHZhciBwID0gcHJlLnNwbGl0KCcsJyk7XG5cbiAgcFtwLmxlbmd0aC0xXSArPSAneycgKyBib2R5ICsgJ30nO1xuICB2YXIgcG9zdFBhcnRzID0gcGFyc2VDb21tYVBhcnRzKHBvc3QpO1xuICBpZiAocG9zdC5sZW5ndGgpIHtcbiAgICBwW3AubGVuZ3RoLTFdICs9IHBvc3RQYXJ0cy5zaGlmdCgpO1xuICAgIHAucHVzaC5hcHBseShwLCBwb3N0UGFydHMpO1xuICB9XG5cbiAgcGFydHMucHVzaC5hcHBseShwYXJ0cywgcCk7XG5cbiAgcmV0dXJuIHBhcnRzO1xufVxuXG5mdW5jdGlvbiBleHBhbmRUb3Aoc3RyKSB7XG4gIGlmICghc3RyKVxuICAgIHJldHVybiBbXTtcblxuICAvLyBJIGRvbid0IGtub3cgd2h5IEJhc2ggNC4zIGRvZXMgdGhpcywgYnV0IGl0IGRvZXMuXG4gIC8vIEFueXRoaW5nIHN0YXJ0aW5nIHdpdGgge30gd2lsbCBoYXZlIHRoZSBmaXJzdCB0d28gYnl0ZXMgcHJlc2VydmVkXG4gIC8vIGJ1dCAqb25seSogYXQgdGhlIHRvcCBsZXZlbCwgc28ge30sYX1iIHdpbGwgbm90IGV4cGFuZCB0byBhbnl0aGluZyxcbiAgLy8gYnV0IGF7fSxifWMgd2lsbCBiZSBleHBhbmRlZCB0byBbYX1jLGFiY10uXG4gIC8vIE9uZSBjb3VsZCBhcmd1ZSB0aGF0IHRoaXMgaXMgYSBidWcgaW4gQmFzaCwgYnV0IHNpbmNlIHRoZSBnb2FsIG9mXG4gIC8vIHRoaXMgbW9kdWxlIGlzIHRvIG1hdGNoIEJhc2gncyBydWxlcywgd2UgZXNjYXBlIGEgbGVhZGluZyB7fVxuICBpZiAoc3RyLnN1YnN0cigwLCAyKSA9PT0gJ3t9Jykge1xuICAgIHN0ciA9ICdcXFxce1xcXFx9JyArIHN0ci5zdWJzdHIoMik7XG4gIH1cblxuICByZXR1cm4gZXhwYW5kKGVzY2FwZUJyYWNlcyhzdHIpLCB0cnVlKS5tYXAodW5lc2NhcGVCcmFjZXMpO1xufVxuXG5mdW5jdGlvbiBpZGVudGl0eShlKSB7XG4gIHJldHVybiBlO1xufVxuXG5mdW5jdGlvbiBlbWJyYWNlKHN0cikge1xuICByZXR1cm4gJ3snICsgc3RyICsgJ30nO1xufVxuZnVuY3Rpb24gaXNQYWRkZWQoZWwpIHtcbiAgcmV0dXJuIC9eLT8wXFxkLy50ZXN0KGVsKTtcbn1cblxuZnVuY3Rpb24gbHRlKGksIHkpIHtcbiAgcmV0dXJuIGkgPD0geTtcbn1cbmZ1bmN0aW9uIGd0ZShpLCB5KSB7XG4gIHJldHVybiBpID49IHk7XG59XG5cbmZ1bmN0aW9uIGV4cGFuZChzdHIsIGlzVG9wKSB7XG4gIHZhciBleHBhbnNpb25zID0gW107XG5cbiAgdmFyIG0gPSBiYWxhbmNlZCgneycsICd9Jywgc3RyKTtcbiAgaWYgKCFtIHx8IC9cXCQkLy50ZXN0KG0ucHJlKSkgcmV0dXJuIFtzdHJdO1xuXG4gIHZhciBpc051bWVyaWNTZXF1ZW5jZSA9IC9eLT9cXGQrXFwuXFwuLT9cXGQrKD86XFwuXFwuLT9cXGQrKT8kLy50ZXN0KG0uYm9keSk7XG4gIHZhciBpc0FscGhhU2VxdWVuY2UgPSAvXlthLXpBLVpdXFwuXFwuW2EtekEtWl0oPzpcXC5cXC4tP1xcZCspPyQvLnRlc3QobS5ib2R5KTtcbiAgdmFyIGlzU2VxdWVuY2UgPSBpc051bWVyaWNTZXF1ZW5jZSB8fCBpc0FscGhhU2VxdWVuY2U7XG4gIHZhciBpc09wdGlvbnMgPSBtLmJvZHkuaW5kZXhPZignLCcpID49IDA7XG4gIGlmICghaXNTZXF1ZW5jZSAmJiAhaXNPcHRpb25zKSB7XG4gICAgLy8ge2F9LGJ9XG4gICAgaWYgKG0ucG9zdC5tYXRjaCgvLC4qXFx9LykpIHtcbiAgICAgIHN0ciA9IG0ucHJlICsgJ3snICsgbS5ib2R5ICsgZXNjQ2xvc2UgKyBtLnBvc3Q7XG4gICAgICByZXR1cm4gZXhwYW5kKHN0cik7XG4gICAgfVxuICAgIHJldHVybiBbc3RyXTtcbiAgfVxuXG4gIHZhciBuO1xuICBpZiAoaXNTZXF1ZW5jZSkge1xuICAgIG4gPSBtLmJvZHkuc3BsaXQoL1xcLlxcLi8pO1xuICB9IGVsc2Uge1xuICAgIG4gPSBwYXJzZUNvbW1hUGFydHMobS5ib2R5KTtcbiAgICBpZiAobi5sZW5ndGggPT09IDEpIHtcbiAgICAgIC8vIHh7e2EsYn19eSA9PT4geHthfXkgeHtifXlcbiAgICAgIG4gPSBleHBhbmQoblswXSwgZmFsc2UpLm1hcChlbWJyYWNlKTtcbiAgICAgIGlmIChuLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICB2YXIgcG9zdCA9IG0ucG9zdC5sZW5ndGhcbiAgICAgICAgICA/IGV4cGFuZChtLnBvc3QsIGZhbHNlKVxuICAgICAgICAgIDogWycnXTtcbiAgICAgICAgcmV0dXJuIHBvc3QubWFwKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICByZXR1cm4gbS5wcmUgKyBuWzBdICsgcDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gYXQgdGhpcyBwb2ludCwgbiBpcyB0aGUgcGFydHMsIGFuZCB3ZSBrbm93IGl0J3Mgbm90IGEgY29tbWEgc2V0XG4gIC8vIHdpdGggYSBzaW5nbGUgZW50cnkuXG5cbiAgLy8gbm8gbmVlZCB0byBleHBhbmQgcHJlLCBzaW5jZSBpdCBpcyBndWFyYW50ZWVkIHRvIGJlIGZyZWUgb2YgYnJhY2Utc2V0c1xuICB2YXIgcHJlID0gbS5wcmU7XG4gIHZhciBwb3N0ID0gbS5wb3N0Lmxlbmd0aFxuICAgID8gZXhwYW5kKG0ucG9zdCwgZmFsc2UpXG4gICAgOiBbJyddO1xuXG4gIHZhciBOO1xuXG4gIGlmIChpc1NlcXVlbmNlKSB7XG4gICAgdmFyIHggPSBudW1lcmljKG5bMF0pO1xuICAgIHZhciB5ID0gbnVtZXJpYyhuWzFdKTtcbiAgICB2YXIgd2lkdGggPSBNYXRoLm1heChuWzBdLmxlbmd0aCwgblsxXS5sZW5ndGgpXG4gICAgdmFyIGluY3IgPSBuLmxlbmd0aCA9PSAzXG4gICAgICA/IE1hdGguYWJzKG51bWVyaWMoblsyXSkpXG4gICAgICA6IDE7XG4gICAgdmFyIHRlc3QgPSBsdGU7XG4gICAgdmFyIHJldmVyc2UgPSB5IDwgeDtcbiAgICBpZiAocmV2ZXJzZSkge1xuICAgICAgaW5jciAqPSAtMTtcbiAgICAgIHRlc3QgPSBndGU7XG4gICAgfVxuICAgIHZhciBwYWQgPSBuLnNvbWUoaXNQYWRkZWQpO1xuXG4gICAgTiA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IHg7IHRlc3QoaSwgeSk7IGkgKz0gaW5jcikge1xuICAgICAgdmFyIGM7XG4gICAgICBpZiAoaXNBbHBoYVNlcXVlbmNlKSB7XG4gICAgICAgIGMgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpO1xuICAgICAgICBpZiAoYyA9PT0gJ1xcXFwnKVxuICAgICAgICAgIGMgPSAnJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGMgPSBTdHJpbmcoaSk7XG4gICAgICAgIGlmIChwYWQpIHtcbiAgICAgICAgICB2YXIgbmVlZCA9IHdpZHRoIC0gYy5sZW5ndGg7XG4gICAgICAgICAgaWYgKG5lZWQgPiAwKSB7XG4gICAgICAgICAgICB2YXIgeiA9IG5ldyBBcnJheShuZWVkICsgMSkuam9pbignMCcpO1xuICAgICAgICAgICAgaWYgKGkgPCAwKVxuICAgICAgICAgICAgICBjID0gJy0nICsgeiArIGMuc2xpY2UoMSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGMgPSB6ICsgYztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIE4ucHVzaChjKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgTiA9IGNvbmNhdE1hcChuLCBmdW5jdGlvbihlbCkgeyByZXR1cm4gZXhwYW5kKGVsLCBmYWxzZSkgfSk7XG4gIH1cblxuICBmb3IgKHZhciBqID0gMDsgaiA8IE4ubGVuZ3RoOyBqKyspIHtcbiAgICBmb3IgKHZhciBrID0gMDsgayA8IHBvc3QubGVuZ3RoOyBrKyspIHtcbiAgICAgIHZhciBleHBhbnNpb24gPSBwcmUgKyBOW2pdICsgcG9zdFtrXTtcbiAgICAgIGlmICghaXNUb3AgfHwgaXNTZXF1ZW5jZSB8fCBleHBhbnNpb24pXG4gICAgICAgIGV4cGFuc2lvbnMucHVzaChleHBhbnNpb24pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBleHBhbnNpb25zO1xufVxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4cywgZm4pIHtcbiAgICB2YXIgcmVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgeCA9IGZuKHhzW2ldLCBpKTtcbiAgICAgICAgaWYgKGlzQXJyYXkoeCkpIHJlcy5wdXNoLmFwcGx5KHJlcywgeCk7XG4gICAgICAgIGVsc2UgcmVzLnB1c2goeCk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFIgPSB0eXBlb2YgUmVmbGVjdCA9PT0gJ29iamVjdCcgPyBSZWZsZWN0IDogbnVsbFxudmFyIFJlZmxlY3RBcHBseSA9IFIgJiYgdHlwZW9mIFIuYXBwbHkgPT09ICdmdW5jdGlvbidcbiAgPyBSLmFwcGx5XG4gIDogZnVuY3Rpb24gUmVmbGVjdEFwcGx5KHRhcmdldCwgcmVjZWl2ZXIsIGFyZ3MpIHtcbiAgICByZXR1cm4gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwodGFyZ2V0LCByZWNlaXZlciwgYXJncyk7XG4gIH1cblxudmFyIFJlZmxlY3RPd25LZXlzXG5pZiAoUiAmJiB0eXBlb2YgUi5vd25LZXlzID09PSAnZnVuY3Rpb24nKSB7XG4gIFJlZmxlY3RPd25LZXlzID0gUi5vd25LZXlzXG59IGVsc2UgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcbiAgUmVmbGVjdE93bktleXMgPSBmdW5jdGlvbiBSZWZsZWN0T3duS2V5cyh0YXJnZXQpIHtcbiAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGFyZ2V0KVxuICAgICAgLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHRhcmdldCkpO1xuICB9O1xufSBlbHNlIHtcbiAgUmVmbGVjdE93bktleXMgPSBmdW5jdGlvbiBSZWZsZWN0T3duS2V5cyh0YXJnZXQpIHtcbiAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGFyZ2V0KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gUHJvY2Vzc0VtaXRXYXJuaW5nKHdhcm5pbmcpIHtcbiAgaWYgKGNvbnNvbGUgJiYgY29uc29sZS53YXJuKSBjb25zb2xlLndhcm4od2FybmluZyk7XG59XG5cbnZhciBOdW1iZXJJc05hTiA9IE51bWJlci5pc05hTiB8fCBmdW5jdGlvbiBOdW1iZXJJc05hTih2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT09IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIEV2ZW50RW1pdHRlci5pbml0LmNhbGwodGhpcyk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbm1vZHVsZS5leHBvcnRzLm9uY2UgPSBvbmNlO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50c0NvdW50ID0gMDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxudmFyIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuZnVuY3Rpb24gY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcikge1xuICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIFwibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgRnVuY3Rpb24uIFJlY2VpdmVkIHR5cGUgJyArIHR5cGVvZiBsaXN0ZW5lcik7XG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEV2ZW50RW1pdHRlciwgJ2RlZmF1bHRNYXhMaXN0ZW5lcnMnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gIH0sXG4gIHNldDogZnVuY3Rpb24oYXJnKSB7XG4gICAgaWYgKHR5cGVvZiBhcmcgIT09ICdudW1iZXInIHx8IGFyZyA8IDAgfHwgTnVtYmVySXNOYU4oYXJnKSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RoZSB2YWx1ZSBvZiBcImRlZmF1bHRNYXhMaXN0ZW5lcnNcIiBpcyBvdXQgb2YgcmFuZ2UuIEl0IG11c3QgYmUgYSBub24tbmVnYXRpdmUgbnVtYmVyLiBSZWNlaXZlZCAnICsgYXJnICsgJy4nKTtcbiAgICB9XG4gICAgZGVmYXVsdE1heExpc3RlbmVycyA9IGFyZztcbiAgfVxufSk7XG5cbkV2ZW50RW1pdHRlci5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgaWYgKHRoaXMuX2V2ZW50cyA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICB0aGlzLl9ldmVudHMgPT09IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKS5fZXZlbnRzKSB7XG4gICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gIH1cblxuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufTtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKG4pIHtcbiAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJyB8fCBuIDwgMCB8fCBOdW1iZXJJc05hTihuKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgb2YgXCJuXCIgaXMgb3V0IG9mIHJhbmdlLiBJdCBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIG51bWJlci4gUmVjZWl2ZWQgJyArIG4gKyAnLicpO1xuICB9XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gX2dldE1heExpc3RlbmVycyh0aGF0KSB7XG4gIGlmICh0aGF0Ll9tYXhMaXN0ZW5lcnMgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gIHJldHVybiB0aGF0Ll9tYXhMaXN0ZW5lcnM7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZ2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gZ2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gX2dldE1heExpc3RlbmVycyh0aGlzKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQodHlwZSkge1xuICB2YXIgYXJncyA9IFtdO1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgYXJncy5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gIHZhciBkb0Vycm9yID0gKHR5cGUgPT09ICdlcnJvcicpO1xuXG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gIGlmIChldmVudHMgIT09IHVuZGVmaW5lZClcbiAgICBkb0Vycm9yID0gKGRvRXJyb3IgJiYgZXZlbnRzLmVycm9yID09PSB1bmRlZmluZWQpO1xuICBlbHNlIGlmICghZG9FcnJvcilcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAoZG9FcnJvcikge1xuICAgIHZhciBlcjtcbiAgICBpZiAoYXJncy5sZW5ndGggPiAwKVxuICAgICAgZXIgPSBhcmdzWzBdO1xuICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAvLyBOb3RlOiBUaGUgY29tbWVudHMgb24gdGhlIGB0aHJvd2AgbGluZXMgYXJlIGludGVudGlvbmFsLCB0aGV5IHNob3dcbiAgICAgIC8vIHVwIGluIE5vZGUncyBvdXRwdXQgaWYgdGhpcyByZXN1bHRzIGluIGFuIHVuaGFuZGxlZCBleGNlcHRpb24uXG4gICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICB9XG4gICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuaGFuZGxlZCBlcnJvci4nICsgKGVyID8gJyAoJyArIGVyLm1lc3NhZ2UgKyAnKScgOiAnJykpO1xuICAgIGVyci5jb250ZXh0ID0gZXI7XG4gICAgdGhyb3cgZXJyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICB9XG5cbiAgdmFyIGhhbmRsZXIgPSBldmVudHNbdHlwZV07XG5cbiAgaWYgKGhhbmRsZXIgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgUmVmbGVjdEFwcGx5KGhhbmRsZXIsIHRoaXMsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBSZWZsZWN0QXBwbHkobGlzdGVuZXJzW2ldLCB0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuZnVuY3Rpb24gX2FkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIHByZXBlbmQpIHtcbiAgdmFyIG07XG4gIHZhciBldmVudHM7XG4gIHZhciBleGlzdGluZztcblxuICBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKTtcblxuICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHRhcmdldC5fZXZlbnRzQ291bnQgPSAwO1xuICB9IGVsc2Uge1xuICAgIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gICAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICAgIGlmIChldmVudHMubmV3TGlzdGVuZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGFyZ2V0LmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyID8gbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgICAgIC8vIFJlLWFzc2lnbiBgZXZlbnRzYCBiZWNhdXNlIGEgbmV3TGlzdGVuZXIgaGFuZGxlciBjb3VsZCBoYXZlIGNhdXNlZCB0aGVcbiAgICAgIC8vIHRoaXMuX2V2ZW50cyB0byBiZSBhc3NpZ25lZCB0byBhIG5ldyBvYmplY3RcbiAgICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuICAgIH1cbiAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXTtcbiAgfVxuXG4gIGlmIChleGlzdGluZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgICArK3RhcmdldC5fZXZlbnRzQ291bnQ7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBleGlzdGluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXSA9XG4gICAgICAgIHByZXBlbmQgPyBbbGlzdGVuZXIsIGV4aXN0aW5nXSA6IFtleGlzdGluZywgbGlzdGVuZXJdO1xuICAgICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIH0gZWxzZSBpZiAocHJlcGVuZCkge1xuICAgICAgZXhpc3RpbmcudW5zaGlmdChsaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4aXN0aW5nLnB1c2gobGlzdGVuZXIpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gICAgbSA9IF9nZXRNYXhMaXN0ZW5lcnModGFyZ2V0KTtcbiAgICBpZiAobSA+IDAgJiYgZXhpc3RpbmcubGVuZ3RoID4gbSAmJiAhZXhpc3Rpbmcud2FybmVkKSB7XG4gICAgICBleGlzdGluZy53YXJuZWQgPSB0cnVlO1xuICAgICAgLy8gTm8gZXJyb3IgY29kZSBmb3IgdGhpcyBzaW5jZSBpdCBpcyBhIFdhcm5pbmdcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1yZXN0cmljdGVkLXN5bnRheFxuICAgICAgdmFyIHcgPSBuZXcgRXJyb3IoJ1Bvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgbGVhayBkZXRlY3RlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLmxlbmd0aCArICcgJyArIFN0cmluZyh0eXBlKSArICcgbGlzdGVuZXJzICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnYWRkZWQuIFVzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5jcmVhc2UgbGltaXQnKTtcbiAgICAgIHcubmFtZSA9ICdNYXhMaXN0ZW5lcnNFeGNlZWRlZFdhcm5pbmcnO1xuICAgICAgdy5lbWl0dGVyID0gdGFyZ2V0O1xuICAgICAgdy50eXBlID0gdHlwZTtcbiAgICAgIHcuY291bnQgPSBleGlzdGluZy5sZW5ndGg7XG4gICAgICBQcm9jZXNzRW1pdFdhcm5pbmcodyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHJldHVybiBfYWRkTGlzdGVuZXIodGhpcywgdHlwZSwgbGlzdGVuZXIsIGZhbHNlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCB0cnVlKTtcbiAgICB9O1xuXG5mdW5jdGlvbiBvbmNlV3JhcHBlcigpIHtcbiAgaWYgKCF0aGlzLmZpcmVkKSB7XG4gICAgdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIodGhpcy50eXBlLCB0aGlzLndyYXBGbik7XG4gICAgdGhpcy5maXJlZCA9IHRydWU7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0KTtcbiAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5hcHBseSh0aGlzLnRhcmdldCwgYXJndW1lbnRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfb25jZVdyYXAodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgc3RhdGUgPSB7IGZpcmVkOiBmYWxzZSwgd3JhcEZuOiB1bmRlZmluZWQsIHRhcmdldDogdGFyZ2V0LCB0eXBlOiB0eXBlLCBsaXN0ZW5lcjogbGlzdGVuZXIgfTtcbiAgdmFyIHdyYXBwZWQgPSBvbmNlV3JhcHBlci5iaW5kKHN0YXRlKTtcbiAgd3JhcHBlZC5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICBzdGF0ZS53cmFwRm4gPSB3cmFwcGVkO1xuICByZXR1cm4gd3JhcHBlZDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZSh0eXBlLCBsaXN0ZW5lcikge1xuICBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKTtcbiAgdGhpcy5vbih0eXBlLCBfb25jZVdyYXAodGhpcywgdHlwZSwgbGlzdGVuZXIpKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRPbmNlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRPbmNlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIGNoZWNrTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgdGhpcy5wcmVwZW5kTGlzdGVuZXIodHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4vLyBFbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWYgYW5kIG9ubHkgaWYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBsaXN0LCBldmVudHMsIHBvc2l0aW9uLCBpLCBvcmlnaW5hbExpc3RlbmVyO1xuXG4gICAgICBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKTtcblxuICAgICAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICAgICAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgbGlzdCA9IGV2ZW50c1t0eXBlXTtcbiAgICAgIGlmIChsaXN0ID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHwgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApXG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIGV2ZW50c1t0eXBlXTtcbiAgICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3QubGlzdGVuZXIgfHwgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBsaXN0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHBvc2l0aW9uID0gLTE7XG5cbiAgICAgICAgZm9yIChpID0gbGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fCBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICAgICAgb3JpZ2luYWxMaXN0ZW5lciA9IGxpc3RbaV0ubGlzdGVuZXI7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICAgIGlmIChwb3NpdGlvbiA9PT0gMClcbiAgICAgICAgICBsaXN0LnNoaWZ0KCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHNwbGljZU9uZShsaXN0LCBwb3NpdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpXG4gICAgICAgICAgZXZlbnRzW3R5cGVdID0gbGlzdFswXTtcblxuICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIG9yaWdpbmFsTGlzdGVuZXIgfHwgbGlzdGVuZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbiAgICBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnModHlwZSkge1xuICAgICAgdmFyIGxpc3RlbmVycywgZXZlbnRzLCBpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoZXZlbnRzID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudHNbdHlwZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBkZWxldGUgZXZlbnRzW3R5cGVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZXZlbnRzKTtcbiAgICAgICAgdmFyIGtleTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGxpc3RlbmVycyA9IGV2ZW50c1t0eXBlXTtcblxuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICAgICAgfSBlbHNlIGlmIChsaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBMSUZPIG9yZGVyXG4gICAgICAgIGZvciAoaSA9IGxpc3RlbmVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5mdW5jdGlvbiBfbGlzdGVuZXJzKHRhcmdldCwgdHlwZSwgdW53cmFwKSB7XG4gIHZhciBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcblxuICBpZiAoZXZlbnRzID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIFtdO1xuXG4gIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuICBpZiAoZXZsaXN0ZW5lciA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBbXTtcblxuICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpXG4gICAgcmV0dXJuIHVud3JhcCA/IFtldmxpc3RlbmVyLmxpc3RlbmVyIHx8IGV2bGlzdGVuZXJdIDogW2V2bGlzdGVuZXJdO1xuXG4gIHJldHVybiB1bndyYXAgP1xuICAgIHVud3JhcExpc3RlbmVycyhldmxpc3RlbmVyKSA6IGFycmF5Q2xvbmUoZXZsaXN0ZW5lciwgZXZsaXN0ZW5lci5sZW5ndGgpO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyh0eXBlKSB7XG4gIHJldHVybiBfbGlzdGVuZXJzKHRoaXMsIHR5cGUsIHRydWUpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yYXdMaXN0ZW5lcnMgPSBmdW5jdGlvbiByYXdMaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLmxpc3RlbmVyQ291bnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBsaXN0ZW5lckNvdW50LmNhbGwoZW1pdHRlciwgdHlwZSk7XG4gIH1cbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGxpc3RlbmVyQ291bnQ7XG5mdW5jdGlvbiBsaXN0ZW5lckNvdW50KHR5cGUpIHtcbiAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcblxuICBpZiAoZXZlbnRzICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcblxuICAgIGlmICh0eXBlb2YgZXZsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfSBlbHNlIGlmIChldmxpc3RlbmVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gMDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5ldmVudE5hbWVzID0gZnVuY3Rpb24gZXZlbnROYW1lcygpIHtcbiAgcmV0dXJuIHRoaXMuX2V2ZW50c0NvdW50ID4gMCA/IFJlZmxlY3RPd25LZXlzKHRoaXMuX2V2ZW50cykgOiBbXTtcbn07XG5cbmZ1bmN0aW9uIGFycmF5Q2xvbmUoYXJyLCBuKSB7XG4gIHZhciBjb3B5ID0gbmV3IEFycmF5KG4pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSlcbiAgICBjb3B5W2ldID0gYXJyW2ldO1xuICByZXR1cm4gY29weTtcbn1cblxuZnVuY3Rpb24gc3BsaWNlT25lKGxpc3QsIGluZGV4KSB7XG4gIGZvciAoOyBpbmRleCArIDEgPCBsaXN0Lmxlbmd0aDsgaW5kZXgrKylcbiAgICBsaXN0W2luZGV4XSA9IGxpc3RbaW5kZXggKyAxXTtcbiAgbGlzdC5wb3AoKTtcbn1cblxuZnVuY3Rpb24gdW53cmFwTGlzdGVuZXJzKGFycikge1xuICB2YXIgcmV0ID0gbmV3IEFycmF5KGFyci5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHJldC5sZW5ndGg7ICsraSkge1xuICAgIHJldFtpXSA9IGFycltpXS5saXN0ZW5lciB8fCBhcnJbaV07XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gb25jZShlbWl0dGVyLCBuYW1lKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgZnVuY3Rpb24gZXJyb3JMaXN0ZW5lcihlcnIpIHtcbiAgICAgIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIobmFtZSwgcmVzb2x2ZXIpO1xuICAgICAgcmVqZWN0KGVycik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzb2x2ZXIoKSB7XG4gICAgICBpZiAodHlwZW9mIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZW1pdHRlci5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBlcnJvckxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICAgIHJlc29sdmUoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgICB9O1xuXG4gICAgZXZlbnRUYXJnZXRBZ25vc3RpY0FkZExpc3RlbmVyKGVtaXR0ZXIsIG5hbWUsIHJlc29sdmVyLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgaWYgKG5hbWUgIT09ICdlcnJvcicpIHtcbiAgICAgIGFkZEVycm9ySGFuZGxlcklmRXZlbnRFbWl0dGVyKGVtaXR0ZXIsIGVycm9yTGlzdGVuZXIsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhZGRFcnJvckhhbmRsZXJJZkV2ZW50RW1pdHRlcihlbWl0dGVyLCBoYW5kbGVyLCBmbGFncykge1xuICBpZiAodHlwZW9mIGVtaXR0ZXIub24gPT09ICdmdW5jdGlvbicpIHtcbiAgICBldmVudFRhcmdldEFnbm9zdGljQWRkTGlzdGVuZXIoZW1pdHRlciwgJ2Vycm9yJywgaGFuZGxlciwgZmxhZ3MpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGV2ZW50VGFyZ2V0QWdub3N0aWNBZGRMaXN0ZW5lcihlbWl0dGVyLCBuYW1lLCBsaXN0ZW5lciwgZmxhZ3MpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaWYgKGZsYWdzLm9uY2UpIHtcbiAgICAgIGVtaXR0ZXIub25jZShuYW1lLCBsaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVtaXR0ZXIub24obmFtZSwgbGlzdGVuZXIpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgZW1pdHRlci5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gRXZlbnRUYXJnZXQgZG9lcyBub3QgaGF2ZSBgZXJyb3JgIGV2ZW50IHNlbWFudGljcyBsaWtlIE5vZGVcbiAgICAvLyBFdmVudEVtaXR0ZXJzLCB3ZSBkbyBub3QgbGlzdGVuIGZvciBgZXJyb3JgIGV2ZW50cyBoZXJlLlxuICAgIGVtaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBmdW5jdGlvbiB3cmFwTGlzdGVuZXIoYXJnKSB7XG4gICAgICAvLyBJRSBkb2VzIG5vdCBoYXZlIGJ1aWx0aW4gYHsgb25jZTogdHJ1ZSB9YCBzdXBwb3J0IHNvIHdlXG4gICAgICAvLyBoYXZlIHRvIGRvIGl0IG1hbnVhbGx5LlxuICAgICAgaWYgKGZsYWdzLm9uY2UpIHtcbiAgICAgICAgZW1pdHRlci5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIHdyYXBMaXN0ZW5lcik7XG4gICAgICB9XG4gICAgICBsaXN0ZW5lcihhcmcpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBcImVtaXR0ZXJcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgRXZlbnRFbWl0dGVyLiBSZWNlaXZlZCB0eXBlICcgKyB0eXBlb2YgZW1pdHRlcik7XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVhbHBhdGhcbnJlYWxwYXRoLnJlYWxwYXRoID0gcmVhbHBhdGhcbnJlYWxwYXRoLnN5bmMgPSByZWFscGF0aFN5bmNcbnJlYWxwYXRoLnJlYWxwYXRoU3luYyA9IHJlYWxwYXRoU3luY1xucmVhbHBhdGgubW9ua2V5cGF0Y2ggPSBtb25rZXlwYXRjaFxucmVhbHBhdGgudW5tb25rZXlwYXRjaCA9IHVubW9ua2V5cGF0Y2hcblxudmFyIGZzID0gcmVxdWlyZSgnZnMnKVxudmFyIG9yaWdSZWFscGF0aCA9IGZzLnJlYWxwYXRoXG52YXIgb3JpZ1JlYWxwYXRoU3luYyA9IGZzLnJlYWxwYXRoU3luY1xuXG52YXIgdmVyc2lvbiA9IHByb2Nlc3MudmVyc2lvblxudmFyIG9rID0gL152WzAtNV1cXC4vLnRlc3QodmVyc2lvbilcbnZhciBvbGQgPSByZXF1aXJlKCcuL29sZC5qcycpXG5cbmZ1bmN0aW9uIG5ld0Vycm9yIChlcikge1xuICByZXR1cm4gZXIgJiYgZXIuc3lzY2FsbCA9PT0gJ3JlYWxwYXRoJyAmJiAoXG4gICAgZXIuY29kZSA9PT0gJ0VMT09QJyB8fFxuICAgIGVyLmNvZGUgPT09ICdFTk9NRU0nIHx8XG4gICAgZXIuY29kZSA9PT0gJ0VOQU1FVE9PTE9ORydcbiAgKVxufVxuXG5mdW5jdGlvbiByZWFscGF0aCAocCwgY2FjaGUsIGNiKSB7XG4gIGlmIChvaykge1xuICAgIHJldHVybiBvcmlnUmVhbHBhdGgocCwgY2FjaGUsIGNiKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBjYWNoZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiID0gY2FjaGVcbiAgICBjYWNoZSA9IG51bGxcbiAgfVxuICBvcmlnUmVhbHBhdGgocCwgY2FjaGUsIGZ1bmN0aW9uIChlciwgcmVzdWx0KSB7XG4gICAgaWYgKG5ld0Vycm9yKGVyKSkge1xuICAgICAgb2xkLnJlYWxwYXRoKHAsIGNhY2hlLCBjYilcbiAgICB9IGVsc2Uge1xuICAgICAgY2IoZXIsIHJlc3VsdClcbiAgICB9XG4gIH0pXG59XG5cbmZ1bmN0aW9uIHJlYWxwYXRoU3luYyAocCwgY2FjaGUpIHtcbiAgaWYgKG9rKSB7XG4gICAgcmV0dXJuIG9yaWdSZWFscGF0aFN5bmMocCwgY2FjaGUpXG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBvcmlnUmVhbHBhdGhTeW5jKHAsIGNhY2hlKVxuICB9IGNhdGNoIChlcikge1xuICAgIGlmIChuZXdFcnJvcihlcikpIHtcbiAgICAgIHJldHVybiBvbGQucmVhbHBhdGhTeW5jKHAsIGNhY2hlKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlclxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBtb25rZXlwYXRjaCAoKSB7XG4gIGZzLnJlYWxwYXRoID0gcmVhbHBhdGhcbiAgZnMucmVhbHBhdGhTeW5jID0gcmVhbHBhdGhTeW5jXG59XG5cbmZ1bmN0aW9uIHVubW9ua2V5cGF0Y2ggKCkge1xuICBmcy5yZWFscGF0aCA9IG9yaWdSZWFscGF0aFxuICBmcy5yZWFscGF0aFN5bmMgPSBvcmlnUmVhbHBhdGhTeW5jXG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIHBhdGhNb2R1bGUgPSByZXF1aXJlKCdwYXRoJyk7XG52YXIgaXNXaW5kb3dzID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJztcbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5cbi8vIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb24gb2YgcmVhbHBhdGgsIHBvcnRlZCBmcm9tIG5vZGUgcHJlLXY2XG5cbnZhciBERUJVRyA9IHByb2Nlc3MuZW52Lk5PREVfREVCVUcgJiYgL2ZzLy50ZXN0KHByb2Nlc3MuZW52Lk5PREVfREVCVUcpO1xuXG5mdW5jdGlvbiByZXRocm93KCkge1xuICAvLyBPbmx5IGVuYWJsZSBpbiBkZWJ1ZyBtb2RlLiBBIGJhY2t0cmFjZSB1c2VzIH4xMDAwIGJ5dGVzIG9mIGhlYXAgc3BhY2UgYW5kXG4gIC8vIGlzIGZhaXJseSBzbG93IHRvIGdlbmVyYXRlLlxuICB2YXIgY2FsbGJhY2s7XG4gIGlmIChERUJVRykge1xuICAgIHZhciBiYWNrdHJhY2UgPSBuZXcgRXJyb3I7XG4gICAgY2FsbGJhY2sgPSBkZWJ1Z0NhbGxiYWNrO1xuICB9IGVsc2VcbiAgICBjYWxsYmFjayA9IG1pc3NpbmdDYWxsYmFjaztcblxuICByZXR1cm4gY2FsbGJhY2s7XG5cbiAgZnVuY3Rpb24gZGVidWdDYWxsYmFjayhlcnIpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBiYWNrdHJhY2UubWVzc2FnZSA9IGVyci5tZXNzYWdlO1xuICAgICAgZXJyID0gYmFja3RyYWNlO1xuICAgICAgbWlzc2luZ0NhbGxiYWNrKGVycik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWlzc2luZ0NhbGxiYWNrKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pXG4gICAgICAgIHRocm93IGVycjsgIC8vIEZvcmdvdCBhIGNhbGxiYWNrIGJ1dCBkb24ndCBrbm93IHdoZXJlPyBVc2UgTk9ERV9ERUJVRz1mc1xuICAgICAgZWxzZSBpZiAoIXByb2Nlc3Mubm9EZXByZWNhdGlvbikge1xuICAgICAgICB2YXIgbXNnID0gJ2ZzOiBtaXNzaW5nIGNhbGxiYWNrICcgKyAoZXJyLnN0YWNrIHx8IGVyci5tZXNzYWdlKTtcbiAgICAgICAgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbilcbiAgICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG1heWJlQ2FsbGJhY2soY2IpIHtcbiAgcmV0dXJuIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJyA/IGNiIDogcmV0aHJvdygpO1xufVxuXG52YXIgbm9ybWFsaXplID0gcGF0aE1vZHVsZS5ub3JtYWxpemU7XG5cbi8vIFJlZ2V4cCB0aGF0IGZpbmRzIHRoZSBuZXh0IHBhcnRpb24gb2YgYSAocGFydGlhbCkgcGF0aFxuLy8gcmVzdWx0IGlzIFtiYXNlX3dpdGhfc2xhc2gsIGJhc2VdLCBlLmcuIFsnc29tZWRpci8nLCAnc29tZWRpciddXG5pZiAoaXNXaW5kb3dzKSB7XG4gIHZhciBuZXh0UGFydFJlID0gLyguKj8pKD86W1xcL1xcXFxdK3wkKS9nO1xufSBlbHNlIHtcbiAgdmFyIG5leHRQYXJ0UmUgPSAvKC4qPykoPzpbXFwvXSt8JCkvZztcbn1cblxuLy8gUmVnZXggdG8gZmluZCB0aGUgZGV2aWNlIHJvb3QsIGluY2x1ZGluZyB0cmFpbGluZyBzbGFzaC4gRS5nLiAnYzpcXFxcJy5cbmlmIChpc1dpbmRvd3MpIHtcbiAgdmFyIHNwbGl0Um9vdFJlID0gL14oPzpbYS16QS1aXTp8W1xcXFxcXC9dezJ9W15cXFxcXFwvXStbXFxcXFxcL11bXlxcXFxcXC9dKyk/W1xcXFxcXC9dKi87XG59IGVsc2Uge1xuICB2YXIgc3BsaXRSb290UmUgPSAvXltcXC9dKi87XG59XG5cbmV4cG9ydHMucmVhbHBhdGhTeW5jID0gZnVuY3Rpb24gcmVhbHBhdGhTeW5jKHAsIGNhY2hlKSB7XG4gIC8vIG1ha2UgcCBpcyBhYnNvbHV0ZVxuICBwID0gcGF0aE1vZHVsZS5yZXNvbHZlKHApO1xuXG4gIGlmIChjYWNoZSAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY2FjaGUsIHApKSB7XG4gICAgcmV0dXJuIGNhY2hlW3BdO1xuICB9XG5cbiAgdmFyIG9yaWdpbmFsID0gcCxcbiAgICAgIHNlZW5MaW5rcyA9IHt9LFxuICAgICAga25vd25IYXJkID0ge307XG5cbiAgLy8gY3VycmVudCBjaGFyYWN0ZXIgcG9zaXRpb24gaW4gcFxuICB2YXIgcG9zO1xuICAvLyB0aGUgcGFydGlhbCBwYXRoIHNvIGZhciwgaW5jbHVkaW5nIGEgdHJhaWxpbmcgc2xhc2ggaWYgYW55XG4gIHZhciBjdXJyZW50O1xuICAvLyB0aGUgcGFydGlhbCBwYXRoIHdpdGhvdXQgYSB0cmFpbGluZyBzbGFzaCAoZXhjZXB0IHdoZW4gcG9pbnRpbmcgYXQgYSByb290KVxuICB2YXIgYmFzZTtcbiAgLy8gdGhlIHBhcnRpYWwgcGF0aCBzY2FubmVkIGluIHRoZSBwcmV2aW91cyByb3VuZCwgd2l0aCBzbGFzaFxuICB2YXIgcHJldmlvdXM7XG5cbiAgc3RhcnQoKTtcblxuICBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICAvLyBTa2lwIG92ZXIgcm9vdHNcbiAgICB2YXIgbSA9IHNwbGl0Um9vdFJlLmV4ZWMocCk7XG4gICAgcG9zID0gbVswXS5sZW5ndGg7XG4gICAgY3VycmVudCA9IG1bMF07XG4gICAgYmFzZSA9IG1bMF07XG4gICAgcHJldmlvdXMgPSAnJztcblxuICAgIC8vIE9uIHdpbmRvd3MsIGNoZWNrIHRoYXQgdGhlIHJvb3QgZXhpc3RzLiBPbiB1bml4IHRoZXJlIGlzIG5vIG5lZWQuXG4gICAgaWYgKGlzV2luZG93cyAmJiAha25vd25IYXJkW2Jhc2VdKSB7XG4gICAgICBmcy5sc3RhdFN5bmMoYmFzZSk7XG4gICAgICBrbm93bkhhcmRbYmFzZV0gPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIHdhbGsgZG93biB0aGUgcGF0aCwgc3dhcHBpbmcgb3V0IGxpbmtlZCBwYXRocGFydHMgZm9yIHRoZWlyIHJlYWxcbiAgLy8gdmFsdWVzXG4gIC8vIE5COiBwLmxlbmd0aCBjaGFuZ2VzLlxuICB3aGlsZSAocG9zIDwgcC5sZW5ndGgpIHtcbiAgICAvLyBmaW5kIHRoZSBuZXh0IHBhcnRcbiAgICBuZXh0UGFydFJlLmxhc3RJbmRleCA9IHBvcztcbiAgICB2YXIgcmVzdWx0ID0gbmV4dFBhcnRSZS5leGVjKHApO1xuICAgIHByZXZpb3VzID0gY3VycmVudDtcbiAgICBjdXJyZW50ICs9IHJlc3VsdFswXTtcbiAgICBiYXNlID0gcHJldmlvdXMgKyByZXN1bHRbMV07XG4gICAgcG9zID0gbmV4dFBhcnRSZS5sYXN0SW5kZXg7XG5cbiAgICAvLyBjb250aW51ZSBpZiBub3QgYSBzeW1saW5rXG4gICAgaWYgKGtub3duSGFyZFtiYXNlXSB8fCAoY2FjaGUgJiYgY2FjaGVbYmFzZV0gPT09IGJhc2UpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB2YXIgcmVzb2x2ZWRMaW5rO1xuICAgIGlmIChjYWNoZSAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY2FjaGUsIGJhc2UpKSB7XG4gICAgICAvLyBzb21lIGtub3duIHN5bWJvbGljIGxpbmsuICBubyBuZWVkIHRvIHN0YXQgYWdhaW4uXG4gICAgICByZXNvbHZlZExpbmsgPSBjYWNoZVtiYXNlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHN0YXQgPSBmcy5sc3RhdFN5bmMoYmFzZSk7XG4gICAgICBpZiAoIXN0YXQuaXNTeW1ib2xpY0xpbmsoKSkge1xuICAgICAgICBrbm93bkhhcmRbYmFzZV0gPSB0cnVlO1xuICAgICAgICBpZiAoY2FjaGUpIGNhY2hlW2Jhc2VdID0gYmFzZTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHJlYWQgdGhlIGxpbmsgaWYgaXQgd2Fzbid0IHJlYWQgYmVmb3JlXG4gICAgICAvLyBkZXYvaW5vIGFsd2F5cyByZXR1cm4gMCBvbiB3aW5kb3dzLCBzbyBza2lwIHRoZSBjaGVjay5cbiAgICAgIHZhciBsaW5rVGFyZ2V0ID0gbnVsbDtcbiAgICAgIGlmICghaXNXaW5kb3dzKSB7XG4gICAgICAgIHZhciBpZCA9IHN0YXQuZGV2LnRvU3RyaW5nKDMyKSArICc6JyArIHN0YXQuaW5vLnRvU3RyaW5nKDMyKTtcbiAgICAgICAgaWYgKHNlZW5MaW5rcy5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcbiAgICAgICAgICBsaW5rVGFyZ2V0ID0gc2VlbkxpbmtzW2lkXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGxpbmtUYXJnZXQgPT09IG51bGwpIHtcbiAgICAgICAgZnMuc3RhdFN5bmMoYmFzZSk7XG4gICAgICAgIGxpbmtUYXJnZXQgPSBmcy5yZWFkbGlua1N5bmMoYmFzZSk7XG4gICAgICB9XG4gICAgICByZXNvbHZlZExpbmsgPSBwYXRoTW9kdWxlLnJlc29sdmUocHJldmlvdXMsIGxpbmtUYXJnZXQpO1xuICAgICAgLy8gdHJhY2sgdGhpcywgaWYgZ2l2ZW4gYSBjYWNoZS5cbiAgICAgIGlmIChjYWNoZSkgY2FjaGVbYmFzZV0gPSByZXNvbHZlZExpbms7XG4gICAgICBpZiAoIWlzV2luZG93cykgc2VlbkxpbmtzW2lkXSA9IGxpbmtUYXJnZXQ7XG4gICAgfVxuXG4gICAgLy8gcmVzb2x2ZSB0aGUgbGluaywgdGhlbiBzdGFydCBvdmVyXG4gICAgcCA9IHBhdGhNb2R1bGUucmVzb2x2ZShyZXNvbHZlZExpbmssIHAuc2xpY2UocG9zKSk7XG4gICAgc3RhcnQoKTtcbiAgfVxuXG4gIGlmIChjYWNoZSkgY2FjaGVbb3JpZ2luYWxdID0gcDtcblxuICByZXR1cm4gcDtcbn07XG5cblxuZXhwb3J0cy5yZWFscGF0aCA9IGZ1bmN0aW9uIHJlYWxwYXRoKHAsIGNhY2hlLCBjYikge1xuICBpZiAodHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgY2IgPSBtYXliZUNhbGxiYWNrKGNhY2hlKTtcbiAgICBjYWNoZSA9IG51bGw7XG4gIH1cblxuICAvLyBtYWtlIHAgaXMgYWJzb2x1dGVcbiAgcCA9IHBhdGhNb2R1bGUucmVzb2x2ZShwKTtcblxuICBpZiAoY2FjaGUgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNhY2hlLCBwKSkge1xuICAgIHJldHVybiBwcm9jZXNzLm5leHRUaWNrKGNiLmJpbmQobnVsbCwgbnVsbCwgY2FjaGVbcF0pKTtcbiAgfVxuXG4gIHZhciBvcmlnaW5hbCA9IHAsXG4gICAgICBzZWVuTGlua3MgPSB7fSxcbiAgICAgIGtub3duSGFyZCA9IHt9O1xuXG4gIC8vIGN1cnJlbnQgY2hhcmFjdGVyIHBvc2l0aW9uIGluIHBcbiAgdmFyIHBvcztcbiAgLy8gdGhlIHBhcnRpYWwgcGF0aCBzbyBmYXIsIGluY2x1ZGluZyBhIHRyYWlsaW5nIHNsYXNoIGlmIGFueVxuICB2YXIgY3VycmVudDtcbiAgLy8gdGhlIHBhcnRpYWwgcGF0aCB3aXRob3V0IGEgdHJhaWxpbmcgc2xhc2ggKGV4Y2VwdCB3aGVuIHBvaW50aW5nIGF0IGEgcm9vdClcbiAgdmFyIGJhc2U7XG4gIC8vIHRoZSBwYXJ0aWFsIHBhdGggc2Nhbm5lZCBpbiB0aGUgcHJldmlvdXMgcm91bmQsIHdpdGggc2xhc2hcbiAgdmFyIHByZXZpb3VzO1xuXG4gIHN0YXJ0KCk7XG5cbiAgZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgLy8gU2tpcCBvdmVyIHJvb3RzXG4gICAgdmFyIG0gPSBzcGxpdFJvb3RSZS5leGVjKHApO1xuICAgIHBvcyA9IG1bMF0ubGVuZ3RoO1xuICAgIGN1cnJlbnQgPSBtWzBdO1xuICAgIGJhc2UgPSBtWzBdO1xuICAgIHByZXZpb3VzID0gJyc7XG5cbiAgICAvLyBPbiB3aW5kb3dzLCBjaGVjayB0aGF0IHRoZSByb290IGV4aXN0cy4gT24gdW5peCB0aGVyZSBpcyBubyBuZWVkLlxuICAgIGlmIChpc1dpbmRvd3MgJiYgIWtub3duSGFyZFtiYXNlXSkge1xuICAgICAgZnMubHN0YXQoYmFzZSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGlmIChlcnIpIHJldHVybiBjYihlcnIpO1xuICAgICAgICBrbm93bkhhcmRbYmFzZV0gPSB0cnVlO1xuICAgICAgICBMT09QKCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhMT09QKTtcbiAgICB9XG4gIH1cblxuICAvLyB3YWxrIGRvd24gdGhlIHBhdGgsIHN3YXBwaW5nIG91dCBsaW5rZWQgcGF0aHBhcnRzIGZvciB0aGVpciByZWFsXG4gIC8vIHZhbHVlc1xuICBmdW5jdGlvbiBMT09QKCkge1xuICAgIC8vIHN0b3AgaWYgc2Nhbm5lZCBwYXN0IGVuZCBvZiBwYXRoXG4gICAgaWYgKHBvcyA+PSBwLmxlbmd0aCkge1xuICAgICAgaWYgKGNhY2hlKSBjYWNoZVtvcmlnaW5hbF0gPSBwO1xuICAgICAgcmV0dXJuIGNiKG51bGwsIHApO1xuICAgIH1cblxuICAgIC8vIGZpbmQgdGhlIG5leHQgcGFydFxuICAgIG5leHRQYXJ0UmUubGFzdEluZGV4ID0gcG9zO1xuICAgIHZhciByZXN1bHQgPSBuZXh0UGFydFJlLmV4ZWMocCk7XG4gICAgcHJldmlvdXMgPSBjdXJyZW50O1xuICAgIGN1cnJlbnQgKz0gcmVzdWx0WzBdO1xuICAgIGJhc2UgPSBwcmV2aW91cyArIHJlc3VsdFsxXTtcbiAgICBwb3MgPSBuZXh0UGFydFJlLmxhc3RJbmRleDtcblxuICAgIC8vIGNvbnRpbnVlIGlmIG5vdCBhIHN5bWxpbmtcbiAgICBpZiAoa25vd25IYXJkW2Jhc2VdIHx8IChjYWNoZSAmJiBjYWNoZVtiYXNlXSA9PT0gYmFzZSkpIHtcbiAgICAgIHJldHVybiBwcm9jZXNzLm5leHRUaWNrKExPT1ApO1xuICAgIH1cblxuICAgIGlmIChjYWNoZSAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY2FjaGUsIGJhc2UpKSB7XG4gICAgICAvLyBrbm93biBzeW1ib2xpYyBsaW5rLiAgbm8gbmVlZCB0byBzdGF0IGFnYWluLlxuICAgICAgcmV0dXJuIGdvdFJlc29sdmVkTGluayhjYWNoZVtiYXNlXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZzLmxzdGF0KGJhc2UsIGdvdFN0YXQpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ290U3RhdChlcnIsIHN0YXQpIHtcbiAgICBpZiAoZXJyKSByZXR1cm4gY2IoZXJyKTtcblxuICAgIC8vIGlmIG5vdCBhIHN5bWxpbmssIHNraXAgdG8gdGhlIG5leHQgcGF0aCBwYXJ0XG4gICAgaWYgKCFzdGF0LmlzU3ltYm9saWNMaW5rKCkpIHtcbiAgICAgIGtub3duSGFyZFtiYXNlXSA9IHRydWU7XG4gICAgICBpZiAoY2FjaGUpIGNhY2hlW2Jhc2VdID0gYmFzZTtcbiAgICAgIHJldHVybiBwcm9jZXNzLm5leHRUaWNrKExPT1ApO1xuICAgIH1cblxuICAgIC8vIHN0YXQgJiByZWFkIHRoZSBsaW5rIGlmIG5vdCByZWFkIGJlZm9yZVxuICAgIC8vIGNhbGwgZ290VGFyZ2V0IGFzIHNvb24gYXMgdGhlIGxpbmsgdGFyZ2V0IGlzIGtub3duXG4gICAgLy8gZGV2L2lubyBhbHdheXMgcmV0dXJuIDAgb24gd2luZG93cywgc28gc2tpcCB0aGUgY2hlY2suXG4gICAgaWYgKCFpc1dpbmRvd3MpIHtcbiAgICAgIHZhciBpZCA9IHN0YXQuZGV2LnRvU3RyaW5nKDMyKSArICc6JyArIHN0YXQuaW5vLnRvU3RyaW5nKDMyKTtcbiAgICAgIGlmIChzZWVuTGlua3MuaGFzT3duUHJvcGVydHkoaWQpKSB7XG4gICAgICAgIHJldHVybiBnb3RUYXJnZXQobnVsbCwgc2VlbkxpbmtzW2lkXSwgYmFzZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGZzLnN0YXQoYmFzZSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSByZXR1cm4gY2IoZXJyKTtcblxuICAgICAgZnMucmVhZGxpbmsoYmFzZSwgZnVuY3Rpb24oZXJyLCB0YXJnZXQpIHtcbiAgICAgICAgaWYgKCFpc1dpbmRvd3MpIHNlZW5MaW5rc1tpZF0gPSB0YXJnZXQ7XG4gICAgICAgIGdvdFRhcmdldChlcnIsIHRhcmdldCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdvdFRhcmdldChlcnIsIHRhcmdldCwgYmFzZSkge1xuICAgIGlmIChlcnIpIHJldHVybiBjYihlcnIpO1xuXG4gICAgdmFyIHJlc29sdmVkTGluayA9IHBhdGhNb2R1bGUucmVzb2x2ZShwcmV2aW91cywgdGFyZ2V0KTtcbiAgICBpZiAoY2FjaGUpIGNhY2hlW2Jhc2VdID0gcmVzb2x2ZWRMaW5rO1xuICAgIGdvdFJlc29sdmVkTGluayhyZXNvbHZlZExpbmspO1xuICB9XG5cbiAgZnVuY3Rpb24gZ290UmVzb2x2ZWRMaW5rKHJlc29sdmVkTGluaykge1xuICAgIC8vIHJlc29sdmUgdGhlIGxpbmssIHRoZW4gc3RhcnQgb3ZlclxuICAgIHAgPSBwYXRoTW9kdWxlLnJlc29sdmUocmVzb2x2ZWRMaW5rLCBwLnNsaWNlKHBvcykpO1xuICAgIHN0YXJ0KCk7XG4gIH1cbn07XG4iLCJleHBvcnRzLnNldG9wdHMgPSBzZXRvcHRzXG5leHBvcnRzLm93blByb3AgPSBvd25Qcm9wXG5leHBvcnRzLm1ha2VBYnMgPSBtYWtlQWJzXG5leHBvcnRzLmZpbmlzaCA9IGZpbmlzaFxuZXhwb3J0cy5tYXJrID0gbWFya1xuZXhwb3J0cy5pc0lnbm9yZWQgPSBpc0lnbm9yZWRcbmV4cG9ydHMuY2hpbGRyZW5JZ25vcmVkID0gY2hpbGRyZW5JZ25vcmVkXG5cbmZ1bmN0aW9uIG93blByb3AgKG9iaiwgZmllbGQpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGZpZWxkKVxufVxuXG52YXIgZnMgPSByZXF1aXJlKFwiZnNcIilcbnZhciBwYXRoID0gcmVxdWlyZShcInBhdGhcIilcbnZhciBtaW5pbWF0Y2ggPSByZXF1aXJlKFwibWluaW1hdGNoXCIpXG52YXIgaXNBYnNvbHV0ZSA9IHJlcXVpcmUoXCJwYXRoLWlzLWFic29sdXRlXCIpXG52YXIgTWluaW1hdGNoID0gbWluaW1hdGNoLk1pbmltYXRjaFxuXG5mdW5jdGlvbiBhbHBoYXNvcnQgKGEsIGIpIHtcbiAgcmV0dXJuIGEubG9jYWxlQ29tcGFyZShiLCAnZW4nKVxufVxuXG5mdW5jdGlvbiBzZXR1cElnbm9yZXMgKHNlbGYsIG9wdGlvbnMpIHtcbiAgc2VsZi5pZ25vcmUgPSBvcHRpb25zLmlnbm9yZSB8fCBbXVxuXG4gIGlmICghQXJyYXkuaXNBcnJheShzZWxmLmlnbm9yZSkpXG4gICAgc2VsZi5pZ25vcmUgPSBbc2VsZi5pZ25vcmVdXG5cbiAgaWYgKHNlbGYuaWdub3JlLmxlbmd0aCkge1xuICAgIHNlbGYuaWdub3JlID0gc2VsZi5pZ25vcmUubWFwKGlnbm9yZU1hcClcbiAgfVxufVxuXG4vLyBpZ25vcmUgcGF0dGVybnMgYXJlIGFsd2F5cyBpbiBkb3Q6dHJ1ZSBtb2RlLlxuZnVuY3Rpb24gaWdub3JlTWFwIChwYXR0ZXJuKSB7XG4gIHZhciBnbWF0Y2hlciA9IG51bGxcbiAgaWYgKHBhdHRlcm4uc2xpY2UoLTMpID09PSAnLyoqJykge1xuICAgIHZhciBncGF0dGVybiA9IHBhdHRlcm4ucmVwbGFjZSgvKFxcL1xcKlxcKikrJC8sICcnKVxuICAgIGdtYXRjaGVyID0gbmV3IE1pbmltYXRjaChncGF0dGVybiwgeyBkb3Q6IHRydWUgfSlcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbWF0Y2hlcjogbmV3IE1pbmltYXRjaChwYXR0ZXJuLCB7IGRvdDogdHJ1ZSB9KSxcbiAgICBnbWF0Y2hlcjogZ21hdGNoZXJcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRvcHRzIChzZWxmLCBwYXR0ZXJuLCBvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucylcbiAgICBvcHRpb25zID0ge31cblxuICAvLyBiYXNlLW1hdGNoaW5nOiBqdXN0IHVzZSBnbG9ic3RhciBmb3IgdGhhdC5cbiAgaWYgKG9wdGlvbnMubWF0Y2hCYXNlICYmIC0xID09PSBwYXR0ZXJuLmluZGV4T2YoXCIvXCIpKSB7XG4gICAgaWYgKG9wdGlvbnMubm9nbG9ic3Rhcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYmFzZSBtYXRjaGluZyByZXF1aXJlcyBnbG9ic3RhclwiKVxuICAgIH1cbiAgICBwYXR0ZXJuID0gXCIqKi9cIiArIHBhdHRlcm5cbiAgfVxuXG4gIHNlbGYuc2lsZW50ID0gISFvcHRpb25zLnNpbGVudFxuICBzZWxmLnBhdHRlcm4gPSBwYXR0ZXJuXG4gIHNlbGYuc3RyaWN0ID0gb3B0aW9ucy5zdHJpY3QgIT09IGZhbHNlXG4gIHNlbGYucmVhbHBhdGggPSAhIW9wdGlvbnMucmVhbHBhdGhcbiAgc2VsZi5yZWFscGF0aENhY2hlID0gb3B0aW9ucy5yZWFscGF0aENhY2hlIHx8IE9iamVjdC5jcmVhdGUobnVsbClcbiAgc2VsZi5mb2xsb3cgPSAhIW9wdGlvbnMuZm9sbG93XG4gIHNlbGYuZG90ID0gISFvcHRpb25zLmRvdFxuICBzZWxmLm1hcmsgPSAhIW9wdGlvbnMubWFya1xuICBzZWxmLm5vZGlyID0gISFvcHRpb25zLm5vZGlyXG4gIGlmIChzZWxmLm5vZGlyKVxuICAgIHNlbGYubWFyayA9IHRydWVcbiAgc2VsZi5zeW5jID0gISFvcHRpb25zLnN5bmNcbiAgc2VsZi5ub3VuaXF1ZSA9ICEhb3B0aW9ucy5ub3VuaXF1ZVxuICBzZWxmLm5vbnVsbCA9ICEhb3B0aW9ucy5ub251bGxcbiAgc2VsZi5ub3NvcnQgPSAhIW9wdGlvbnMubm9zb3J0XG4gIHNlbGYubm9jYXNlID0gISFvcHRpb25zLm5vY2FzZVxuICBzZWxmLnN0YXQgPSAhIW9wdGlvbnMuc3RhdFxuICBzZWxmLm5vcHJvY2VzcyA9ICEhb3B0aW9ucy5ub3Byb2Nlc3NcbiAgc2VsZi5hYnNvbHV0ZSA9ICEhb3B0aW9ucy5hYnNvbHV0ZVxuICBzZWxmLmZzID0gb3B0aW9ucy5mcyB8fCBmc1xuXG4gIHNlbGYubWF4TGVuZ3RoID0gb3B0aW9ucy5tYXhMZW5ndGggfHwgSW5maW5pdHlcbiAgc2VsZi5jYWNoZSA9IG9wdGlvbnMuY2FjaGUgfHwgT2JqZWN0LmNyZWF0ZShudWxsKVxuICBzZWxmLnN0YXRDYWNoZSA9IG9wdGlvbnMuc3RhdENhY2hlIHx8IE9iamVjdC5jcmVhdGUobnVsbClcbiAgc2VsZi5zeW1saW5rcyA9IG9wdGlvbnMuc3ltbGlua3MgfHwgT2JqZWN0LmNyZWF0ZShudWxsKVxuXG4gIHNldHVwSWdub3JlcyhzZWxmLCBvcHRpb25zKVxuXG4gIHNlbGYuY2hhbmdlZEN3ZCA9IGZhbHNlXG4gIHZhciBjd2QgPSBwcm9jZXNzLmN3ZCgpXG4gIGlmICghb3duUHJvcChvcHRpb25zLCBcImN3ZFwiKSlcbiAgICBzZWxmLmN3ZCA9IGN3ZFxuICBlbHNlIHtcbiAgICBzZWxmLmN3ZCA9IHBhdGgucmVzb2x2ZShvcHRpb25zLmN3ZClcbiAgICBzZWxmLmNoYW5nZWRDd2QgPSBzZWxmLmN3ZCAhPT0gY3dkXG4gIH1cblxuICBzZWxmLnJvb3QgPSBvcHRpb25zLnJvb3QgfHwgcGF0aC5yZXNvbHZlKHNlbGYuY3dkLCBcIi9cIilcbiAgc2VsZi5yb290ID0gcGF0aC5yZXNvbHZlKHNlbGYucm9vdClcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09IFwid2luMzJcIilcbiAgICBzZWxmLnJvb3QgPSBzZWxmLnJvb3QucmVwbGFjZSgvXFxcXC9nLCBcIi9cIilcblxuICAvLyBUT0RPOiBpcyBhbiBhYnNvbHV0ZSBgY3dkYCBzdXBwb3NlZCB0byBiZSByZXNvbHZlZCBhZ2FpbnN0IGByb290YD9cbiAgLy8gZS5nLiB7IGN3ZDogJy90ZXN0Jywgcm9vdDogX19kaXJuYW1lIH0gPT09IHBhdGguam9pbihfX2Rpcm5hbWUsICcvdGVzdCcpXG4gIHNlbGYuY3dkQWJzID0gaXNBYnNvbHV0ZShzZWxmLmN3ZCkgPyBzZWxmLmN3ZCA6IG1ha2VBYnMoc2VsZiwgc2VsZi5jd2QpXG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSBcIndpbjMyXCIpXG4gICAgc2VsZi5jd2RBYnMgPSBzZWxmLmN3ZEFicy5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKVxuICBzZWxmLm5vbW91bnQgPSAhIW9wdGlvbnMubm9tb3VudFxuXG4gIC8vIGRpc2FibGUgY29tbWVudHMgYW5kIG5lZ2F0aW9uIGluIE1pbmltYXRjaC5cbiAgLy8gTm90ZSB0aGF0IHRoZXkgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gR2xvYiBpdHNlbGYgYW55d2F5LlxuICBvcHRpb25zLm5vbmVnYXRlID0gdHJ1ZVxuICBvcHRpb25zLm5vY29tbWVudCA9IHRydWVcbiAgLy8gYWx3YXlzIHRyZWF0IFxcIGluIHBhdHRlcm5zIGFzIGVzY2FwZXMsIG5vdCBwYXRoIHNlcGFyYXRvcnNcbiAgb3B0aW9ucy5hbGxvd1dpbmRvd3NFc2NhcGUgPSBmYWxzZVxuXG4gIHNlbGYubWluaW1hdGNoID0gbmV3IE1pbmltYXRjaChwYXR0ZXJuLCBvcHRpb25zKVxuICBzZWxmLm9wdGlvbnMgPSBzZWxmLm1pbmltYXRjaC5vcHRpb25zXG59XG5cbmZ1bmN0aW9uIGZpbmlzaCAoc2VsZikge1xuICB2YXIgbm91ID0gc2VsZi5ub3VuaXF1ZVxuICB2YXIgYWxsID0gbm91ID8gW10gOiBPYmplY3QuY3JlYXRlKG51bGwpXG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBzZWxmLm1hdGNoZXMubGVuZ3RoOyBpIDwgbDsgaSArKykge1xuICAgIHZhciBtYXRjaGVzID0gc2VsZi5tYXRjaGVzW2ldXG4gICAgaWYgKCFtYXRjaGVzIHx8IE9iamVjdC5rZXlzKG1hdGNoZXMpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgaWYgKHNlbGYubm9udWxsKSB7XG4gICAgICAgIC8vIGRvIGxpa2UgdGhlIHNoZWxsLCBhbmQgc3BpdCBvdXQgdGhlIGxpdGVyYWwgZ2xvYlxuICAgICAgICB2YXIgbGl0ZXJhbCA9IHNlbGYubWluaW1hdGNoLmdsb2JTZXRbaV1cbiAgICAgICAgaWYgKG5vdSlcbiAgICAgICAgICBhbGwucHVzaChsaXRlcmFsKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgYWxsW2xpdGVyYWxdID0gdHJ1ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBoYWQgbWF0Y2hlc1xuICAgICAgdmFyIG0gPSBPYmplY3Qua2V5cyhtYXRjaGVzKVxuICAgICAgaWYgKG5vdSlcbiAgICAgICAgYWxsLnB1c2guYXBwbHkoYWxsLCBtKVxuICAgICAgZWxzZVxuICAgICAgICBtLmZvckVhY2goZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICBhbGxbbV0gPSB0cnVlXG4gICAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgaWYgKCFub3UpXG4gICAgYWxsID0gT2JqZWN0LmtleXMoYWxsKVxuXG4gIGlmICghc2VsZi5ub3NvcnQpXG4gICAgYWxsID0gYWxsLnNvcnQoYWxwaGFzb3J0KVxuXG4gIC8vIGF0ICpzb21lKiBwb2ludCB3ZSBzdGF0dGVkIGFsbCBvZiB0aGVzZVxuICBpZiAoc2VsZi5tYXJrKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbGwubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFsbFtpXSA9IHNlbGYuX21hcmsoYWxsW2ldKVxuICAgIH1cbiAgICBpZiAoc2VsZi5ub2Rpcikge1xuICAgICAgYWxsID0gYWxsLmZpbHRlcihmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgbm90RGlyID0gISgvXFwvJC8udGVzdChlKSlcbiAgICAgICAgdmFyIGMgPSBzZWxmLmNhY2hlW2VdIHx8IHNlbGYuY2FjaGVbbWFrZUFicyhzZWxmLCBlKV1cbiAgICAgICAgaWYgKG5vdERpciAmJiBjKVxuICAgICAgICAgIG5vdERpciA9IGMgIT09ICdESVInICYmICFBcnJheS5pc0FycmF5KGMpXG4gICAgICAgIHJldHVybiBub3REaXJcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgaWYgKHNlbGYuaWdub3JlLmxlbmd0aClcbiAgICBhbGwgPSBhbGwuZmlsdGVyKGZ1bmN0aW9uKG0pIHtcbiAgICAgIHJldHVybiAhaXNJZ25vcmVkKHNlbGYsIG0pXG4gICAgfSlcblxuICBzZWxmLmZvdW5kID0gYWxsXG59XG5cbmZ1bmN0aW9uIG1hcmsgKHNlbGYsIHApIHtcbiAgdmFyIGFicyA9IG1ha2VBYnMoc2VsZiwgcClcbiAgdmFyIGMgPSBzZWxmLmNhY2hlW2Fic11cbiAgdmFyIG0gPSBwXG4gIGlmIChjKSB7XG4gICAgdmFyIGlzRGlyID0gYyA9PT0gJ0RJUicgfHwgQXJyYXkuaXNBcnJheShjKVxuICAgIHZhciBzbGFzaCA9IHAuc2xpY2UoLTEpID09PSAnLydcblxuICAgIGlmIChpc0RpciAmJiAhc2xhc2gpXG4gICAgICBtICs9ICcvJ1xuICAgIGVsc2UgaWYgKCFpc0RpciAmJiBzbGFzaClcbiAgICAgIG0gPSBtLnNsaWNlKDAsIC0xKVxuXG4gICAgaWYgKG0gIT09IHApIHtcbiAgICAgIHZhciBtYWJzID0gbWFrZUFicyhzZWxmLCBtKVxuICAgICAgc2VsZi5zdGF0Q2FjaGVbbWFic10gPSBzZWxmLnN0YXRDYWNoZVthYnNdXG4gICAgICBzZWxmLmNhY2hlW21hYnNdID0gc2VsZi5jYWNoZVthYnNdXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1cbn1cblxuLy8gbG90dGEgc2l0dXBzLi4uXG5mdW5jdGlvbiBtYWtlQWJzIChzZWxmLCBmKSB7XG4gIHZhciBhYnMgPSBmXG4gIGlmIChmLmNoYXJBdCgwKSA9PT0gJy8nKSB7XG4gICAgYWJzID0gcGF0aC5qb2luKHNlbGYucm9vdCwgZilcbiAgfSBlbHNlIGlmIChpc0Fic29sdXRlKGYpIHx8IGYgPT09ICcnKSB7XG4gICAgYWJzID0gZlxuICB9IGVsc2UgaWYgKHNlbGYuY2hhbmdlZEN3ZCkge1xuICAgIGFicyA9IHBhdGgucmVzb2x2ZShzZWxmLmN3ZCwgZilcbiAgfSBlbHNlIHtcbiAgICBhYnMgPSBwYXRoLnJlc29sdmUoZilcbiAgfVxuXG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKVxuICAgIGFicyA9IGFicy5yZXBsYWNlKC9cXFxcL2csICcvJylcblxuICByZXR1cm4gYWJzXG59XG5cblxuLy8gUmV0dXJuIHRydWUsIGlmIHBhdHRlcm4gZW5kcyB3aXRoIGdsb2JzdGFyICcqKicsIGZvciB0aGUgYWNjb21wYW55aW5nIHBhcmVudCBkaXJlY3RvcnkuXG4vLyBFeDotIElmIG5vZGVfbW9kdWxlcy8qKiBpcyB0aGUgcGF0dGVybiwgYWRkICdub2RlX21vZHVsZXMnIHRvIGlnbm9yZSBsaXN0IGFsb25nIHdpdGggaXQncyBjb250ZW50c1xuZnVuY3Rpb24gaXNJZ25vcmVkIChzZWxmLCBwYXRoKSB7XG4gIGlmICghc2VsZi5pZ25vcmUubGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZVxuXG4gIHJldHVybiBzZWxmLmlnbm9yZS5zb21lKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5tYXRjaGVyLm1hdGNoKHBhdGgpIHx8ICEhKGl0ZW0uZ21hdGNoZXIgJiYgaXRlbS5nbWF0Y2hlci5tYXRjaChwYXRoKSlcbiAgfSlcbn1cblxuZnVuY3Rpb24gY2hpbGRyZW5JZ25vcmVkIChzZWxmLCBwYXRoKSB7XG4gIGlmICghc2VsZi5pZ25vcmUubGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZVxuXG4gIHJldHVybiBzZWxmLmlnbm9yZS5zb21lKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICByZXR1cm4gISEoaXRlbS5nbWF0Y2hlciAmJiBpdGVtLmdtYXRjaGVyLm1hdGNoKHBhdGgpKVxuICB9KVxufVxuIiwiLy8gQXBwcm9hY2g6XG4vL1xuLy8gMS4gR2V0IHRoZSBtaW5pbWF0Y2ggc2V0XG4vLyAyLiBGb3IgZWFjaCBwYXR0ZXJuIGluIHRoZSBzZXQsIFBST0NFU1MocGF0dGVybiwgZmFsc2UpXG4vLyAzLiBTdG9yZSBtYXRjaGVzIHBlci1zZXQsIHRoZW4gdW5pcSB0aGVtXG4vL1xuLy8gUFJPQ0VTUyhwYXR0ZXJuLCBpbkdsb2JTdGFyKVxuLy8gR2V0IHRoZSBmaXJzdCBbbl0gaXRlbXMgZnJvbSBwYXR0ZXJuIHRoYXQgYXJlIGFsbCBzdHJpbmdzXG4vLyBKb2luIHRoZXNlIHRvZ2V0aGVyLiAgVGhpcyBpcyBQUkVGSVguXG4vLyAgIElmIHRoZXJlIGlzIG5vIG1vcmUgcmVtYWluaW5nLCB0aGVuIHN0YXQoUFJFRklYKSBhbmRcbi8vICAgYWRkIHRvIG1hdGNoZXMgaWYgaXQgc3VjY2VlZHMuICBFTkQuXG4vL1xuLy8gSWYgaW5HbG9iU3RhciBhbmQgUFJFRklYIGlzIHN5bWxpbmsgYW5kIHBvaW50cyB0byBkaXJcbi8vICAgc2V0IEVOVFJJRVMgPSBbXVxuLy8gZWxzZSByZWFkZGlyKFBSRUZJWCkgYXMgRU5UUklFU1xuLy8gICBJZiBmYWlsLCBFTkRcbi8vXG4vLyB3aXRoIEVOVFJJRVNcbi8vICAgSWYgcGF0dGVybltuXSBpcyBHTE9CU1RBUlxuLy8gICAgIC8vIGhhbmRsZSB0aGUgY2FzZSB3aGVyZSB0aGUgZ2xvYnN0YXIgbWF0Y2ggaXMgZW1wdHlcbi8vICAgICAvLyBieSBwcnVuaW5nIGl0IG91dCwgYW5kIHRlc3RpbmcgdGhlIHJlc3VsdGluZyBwYXR0ZXJuXG4vLyAgICAgUFJPQ0VTUyhwYXR0ZXJuWzAuLm5dICsgcGF0dGVybltuKzEgLi4gJF0sIGZhbHNlKVxuLy8gICAgIC8vIGhhbmRsZSBvdGhlciBjYXNlcy5cbi8vICAgICBmb3IgRU5UUlkgaW4gRU5UUklFUyAobm90IGRvdGZpbGVzKVxuLy8gICAgICAgLy8gYXR0YWNoIGdsb2JzdGFyICsgdGFpbCBvbnRvIHRoZSBlbnRyeVxuLy8gICAgICAgLy8gTWFyayB0aGF0IHRoaXMgZW50cnkgaXMgYSBnbG9ic3RhciBtYXRjaFxuLy8gICAgICAgUFJPQ0VTUyhwYXR0ZXJuWzAuLm5dICsgRU5UUlkgKyBwYXR0ZXJuW24gLi4gJF0sIHRydWUpXG4vL1xuLy8gICBlbHNlIC8vIG5vdCBnbG9ic3RhclxuLy8gICAgIGZvciBFTlRSWSBpbiBFTlRSSUVTIChub3QgZG90ZmlsZXMsIHVubGVzcyBwYXR0ZXJuW25dIGlzIGRvdClcbi8vICAgICAgIFRlc3QgRU5UUlkgYWdhaW5zdCBwYXR0ZXJuW25dXG4vLyAgICAgICBJZiBmYWlscywgY29udGludWVcbi8vICAgICAgIElmIHBhc3NlcywgUFJPQ0VTUyhwYXR0ZXJuWzAuLm5dICsgaXRlbSArIHBhdHRlcm5bbisxIC4uICRdKVxuLy9cbi8vIENhdmVhdDpcbi8vICAgQ2FjaGUgYWxsIHN0YXRzIGFuZCByZWFkZGlycyByZXN1bHRzIHRvIG1pbmltaXplIHN5c2NhbGwuICBTaW5jZSBhbGxcbi8vICAgd2UgZXZlciBjYXJlIGFib3V0IGlzIGV4aXN0ZW5jZSBhbmQgZGlyZWN0b3J5LW5lc3MsIHdlIGNhbiBqdXN0IGtlZXBcbi8vICAgYHRydWVgIGZvciBmaWxlcywgYW5kIFtjaGlsZHJlbiwuLi5dIGZvciBkaXJlY3Rvcmllcywgb3IgYGZhbHNlYCBmb3Jcbi8vICAgdGhpbmdzIHRoYXQgZG9uJ3QgZXhpc3QuXG5cbm1vZHVsZS5leHBvcnRzID0gZ2xvYlxuXG52YXIgcnAgPSByZXF1aXJlKCdmcy5yZWFscGF0aCcpXG52YXIgbWluaW1hdGNoID0gcmVxdWlyZSgnbWluaW1hdGNoJylcbnZhciBNaW5pbWF0Y2ggPSBtaW5pbWF0Y2guTWluaW1hdGNoXG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpXG52YXIgRUUgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXJcbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG52YXIgYXNzZXJ0ID0gcmVxdWlyZSgnYXNzZXJ0JylcbnZhciBpc0Fic29sdXRlID0gcmVxdWlyZSgncGF0aC1pcy1hYnNvbHV0ZScpXG52YXIgZ2xvYlN5bmMgPSByZXF1aXJlKCcuL3N5bmMuanMnKVxudmFyIGNvbW1vbiA9IHJlcXVpcmUoJy4vY29tbW9uLmpzJylcbnZhciBzZXRvcHRzID0gY29tbW9uLnNldG9wdHNcbnZhciBvd25Qcm9wID0gY29tbW9uLm93blByb3BcbnZhciBpbmZsaWdodCA9IHJlcXVpcmUoJ2luZmxpZ2h0JylcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpXG52YXIgY2hpbGRyZW5JZ25vcmVkID0gY29tbW9uLmNoaWxkcmVuSWdub3JlZFxudmFyIGlzSWdub3JlZCA9IGNvbW1vbi5pc0lnbm9yZWRcblxudmFyIG9uY2UgPSByZXF1aXJlKCdvbmNlJylcblxuZnVuY3Rpb24gZ2xvYiAocGF0dGVybiwgb3B0aW9ucywgY2IpIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSBjYiA9IG9wdGlvbnMsIG9wdGlvbnMgPSB7fVxuICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fVxuXG4gIGlmIChvcHRpb25zLnN5bmMpIHtcbiAgICBpZiAoY2IpXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdjYWxsYmFjayBwcm92aWRlZCB0byBzeW5jIGdsb2InKVxuICAgIHJldHVybiBnbG9iU3luYyhwYXR0ZXJuLCBvcHRpb25zKVxuICB9XG5cbiAgcmV0dXJuIG5ldyBHbG9iKHBhdHRlcm4sIG9wdGlvbnMsIGNiKVxufVxuXG5nbG9iLnN5bmMgPSBnbG9iU3luY1xudmFyIEdsb2JTeW5jID0gZ2xvYi5HbG9iU3luYyA9IGdsb2JTeW5jLkdsb2JTeW5jXG5cbi8vIG9sZCBhcGkgc3VyZmFjZVxuZ2xvYi5nbG9iID0gZ2xvYlxuXG5mdW5jdGlvbiBleHRlbmQgKG9yaWdpbiwgYWRkKSB7XG4gIGlmIChhZGQgPT09IG51bGwgfHwgdHlwZW9mIGFkZCAhPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gb3JpZ2luXG4gIH1cblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZClcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aFxuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dXG4gIH1cbiAgcmV0dXJuIG9yaWdpblxufVxuXG5nbG9iLmhhc01hZ2ljID0gZnVuY3Rpb24gKHBhdHRlcm4sIG9wdGlvbnNfKSB7XG4gIHZhciBvcHRpb25zID0gZXh0ZW5kKHt9LCBvcHRpb25zXylcbiAgb3B0aW9ucy5ub3Byb2Nlc3MgPSB0cnVlXG5cbiAgdmFyIGcgPSBuZXcgR2xvYihwYXR0ZXJuLCBvcHRpb25zKVxuICB2YXIgc2V0ID0gZy5taW5pbWF0Y2guc2V0XG5cbiAgaWYgKCFwYXR0ZXJuKVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGlmIChzZXQubGVuZ3RoID4gMSlcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIGZvciAodmFyIGogPSAwOyBqIDwgc2V0WzBdLmxlbmd0aDsgaisrKSB7XG4gICAgaWYgKHR5cGVvZiBzZXRbMF1bal0gIT09ICdzdHJpbmcnKVxuICAgICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHJldHVybiBmYWxzZVxufVxuXG5nbG9iLkdsb2IgPSBHbG9iXG5pbmhlcml0cyhHbG9iLCBFRSlcbmZ1bmN0aW9uIEdsb2IgKHBhdHRlcm4sIG9wdGlvbnMsIGNiKSB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiID0gb3B0aW9uc1xuICAgIG9wdGlvbnMgPSBudWxsXG4gIH1cblxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnN5bmMpIHtcbiAgICBpZiAoY2IpXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdjYWxsYmFjayBwcm92aWRlZCB0byBzeW5jIGdsb2InKVxuICAgIHJldHVybiBuZXcgR2xvYlN5bmMocGF0dGVybiwgb3B0aW9ucylcbiAgfVxuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBHbG9iKSlcbiAgICByZXR1cm4gbmV3IEdsb2IocGF0dGVybiwgb3B0aW9ucywgY2IpXG5cbiAgc2V0b3B0cyh0aGlzLCBwYXR0ZXJuLCBvcHRpb25zKVxuICB0aGlzLl9kaWRSZWFsUGF0aCA9IGZhbHNlXG5cbiAgLy8gcHJvY2VzcyBlYWNoIHBhdHRlcm4gaW4gdGhlIG1pbmltYXRjaCBzZXRcbiAgdmFyIG4gPSB0aGlzLm1pbmltYXRjaC5zZXQubGVuZ3RoXG5cbiAgLy8gVGhlIG1hdGNoZXMgYXJlIHN0b3JlZCBhcyB7PGZpbGVuYW1lPjogdHJ1ZSwuLi59IHNvIHRoYXRcbiAgLy8gZHVwbGljYXRlcyBhcmUgYXV0b21hZ2ljYWxseSBwcnVuZWQuXG4gIC8vIExhdGVyLCB3ZSBkbyBhbiBPYmplY3Qua2V5cygpIG9uIHRoZXNlLlxuICAvLyBLZWVwIHRoZW0gYXMgYSBsaXN0IHNvIHdlIGNhbiBmaWxsIGluIHdoZW4gbm9udWxsIGlzIHNldC5cbiAgdGhpcy5tYXRjaGVzID0gbmV3IEFycmF5KG4pXG5cbiAgaWYgKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiID0gb25jZShjYilcbiAgICB0aGlzLm9uKCdlcnJvcicsIGNiKVxuICAgIHRoaXMub24oJ2VuZCcsIGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICBjYihudWxsLCBtYXRjaGVzKVxuICAgIH0pXG4gIH1cblxuICB2YXIgc2VsZiA9IHRoaXNcbiAgdGhpcy5fcHJvY2Vzc2luZyA9IDBcblxuICB0aGlzLl9lbWl0UXVldWUgPSBbXVxuICB0aGlzLl9wcm9jZXNzUXVldWUgPSBbXVxuICB0aGlzLnBhdXNlZCA9IGZhbHNlXG5cbiAgaWYgKHRoaXMubm9wcm9jZXNzKVxuICAgIHJldHVybiB0aGlzXG5cbiAgaWYgKG4gPT09IDApXG4gICAgcmV0dXJuIGRvbmUoKVxuXG4gIHZhciBzeW5jID0gdHJ1ZVxuICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkgKyspIHtcbiAgICB0aGlzLl9wcm9jZXNzKHRoaXMubWluaW1hdGNoLnNldFtpXSwgaSwgZmFsc2UsIGRvbmUpXG4gIH1cbiAgc3luYyA9IGZhbHNlXG5cbiAgZnVuY3Rpb24gZG9uZSAoKSB7XG4gICAgLS1zZWxmLl9wcm9jZXNzaW5nXG4gICAgaWYgKHNlbGYuX3Byb2Nlc3NpbmcgPD0gMCkge1xuICAgICAgaWYgKHN5bmMpIHtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2VsZi5fZmluaXNoKClcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuX2ZpbmlzaCgpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbkdsb2IucHJvdG90eXBlLl9maW5pc2ggPSBmdW5jdGlvbiAoKSB7XG4gIGFzc2VydCh0aGlzIGluc3RhbmNlb2YgR2xvYilcbiAgaWYgKHRoaXMuYWJvcnRlZClcbiAgICByZXR1cm5cblxuICBpZiAodGhpcy5yZWFscGF0aCAmJiAhdGhpcy5fZGlkUmVhbHBhdGgpXG4gICAgcmV0dXJuIHRoaXMuX3JlYWxwYXRoKClcblxuICBjb21tb24uZmluaXNoKHRoaXMpXG4gIHRoaXMuZW1pdCgnZW5kJywgdGhpcy5mb3VuZClcbn1cblxuR2xvYi5wcm90b3R5cGUuX3JlYWxwYXRoID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5fZGlkUmVhbHBhdGgpXG4gICAgcmV0dXJuXG5cbiAgdGhpcy5fZGlkUmVhbHBhdGggPSB0cnVlXG5cbiAgdmFyIG4gPSB0aGlzLm1hdGNoZXMubGVuZ3RoXG4gIGlmIChuID09PSAwKVxuICAgIHJldHVybiB0aGlzLl9maW5pc2goKVxuXG4gIHZhciBzZWxmID0gdGhpc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWF0Y2hlcy5sZW5ndGg7IGkrKylcbiAgICB0aGlzLl9yZWFscGF0aFNldChpLCBuZXh0KVxuXG4gIGZ1bmN0aW9uIG5leHQgKCkge1xuICAgIGlmICgtLW4gPT09IDApXG4gICAgICBzZWxmLl9maW5pc2goKVxuICB9XG59XG5cbkdsb2IucHJvdG90eXBlLl9yZWFscGF0aFNldCA9IGZ1bmN0aW9uIChpbmRleCwgY2IpIHtcbiAgdmFyIG1hdGNoc2V0ID0gdGhpcy5tYXRjaGVzW2luZGV4XVxuICBpZiAoIW1hdGNoc2V0KVxuICAgIHJldHVybiBjYigpXG5cbiAgdmFyIGZvdW5kID0gT2JqZWN0LmtleXMobWF0Y2hzZXQpXG4gIHZhciBzZWxmID0gdGhpc1xuICB2YXIgbiA9IGZvdW5kLmxlbmd0aFxuXG4gIGlmIChuID09PSAwKVxuICAgIHJldHVybiBjYigpXG5cbiAgdmFyIHNldCA9IHRoaXMubWF0Y2hlc1tpbmRleF0gPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIGZvdW5kLmZvckVhY2goZnVuY3Rpb24gKHAsIGkpIHtcbiAgICAvLyBJZiB0aGVyZSdzIGEgcHJvYmxlbSB3aXRoIHRoZSBzdGF0LCB0aGVuIGl0IG1lYW5zIHRoYXRcbiAgICAvLyBvbmUgb3IgbW9yZSBvZiB0aGUgbGlua3MgaW4gdGhlIHJlYWxwYXRoIGNvdWxkbid0IGJlXG4gICAgLy8gcmVzb2x2ZWQuICBqdXN0IHJldHVybiB0aGUgYWJzIHZhbHVlIGluIHRoYXQgY2FzZS5cbiAgICBwID0gc2VsZi5fbWFrZUFicyhwKVxuICAgIHJwLnJlYWxwYXRoKHAsIHNlbGYucmVhbHBhdGhDYWNoZSwgZnVuY3Rpb24gKGVyLCByZWFsKSB7XG4gICAgICBpZiAoIWVyKVxuICAgICAgICBzZXRbcmVhbF0gPSB0cnVlXG4gICAgICBlbHNlIGlmIChlci5zeXNjYWxsID09PSAnc3RhdCcpXG4gICAgICAgIHNldFtwXSA9IHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgc2VsZi5lbWl0KCdlcnJvcicsIGVyKSAvLyBzcnNseSB3dGYgcmlnaHQgaGVyZVxuXG4gICAgICBpZiAoLS1uID09PSAwKSB7XG4gICAgICAgIHNlbGYubWF0Y2hlc1tpbmRleF0gPSBzZXRcbiAgICAgICAgY2IoKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG5cbkdsb2IucHJvdG90eXBlLl9tYXJrID0gZnVuY3Rpb24gKHApIHtcbiAgcmV0dXJuIGNvbW1vbi5tYXJrKHRoaXMsIHApXG59XG5cbkdsb2IucHJvdG90eXBlLl9tYWtlQWJzID0gZnVuY3Rpb24gKGYpIHtcbiAgcmV0dXJuIGNvbW1vbi5tYWtlQWJzKHRoaXMsIGYpXG59XG5cbkdsb2IucHJvdG90eXBlLmFib3J0ID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmFib3J0ZWQgPSB0cnVlXG4gIHRoaXMuZW1pdCgnYWJvcnQnKVxufVxuXG5HbG9iLnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLnBhdXNlZCkge1xuICAgIHRoaXMucGF1c2VkID0gdHJ1ZVxuICAgIHRoaXMuZW1pdCgncGF1c2UnKVxuICB9XG59XG5cbkdsb2IucHJvdG90eXBlLnJlc3VtZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMucGF1c2VkKSB7XG4gICAgdGhpcy5lbWl0KCdyZXN1bWUnKVxuICAgIHRoaXMucGF1c2VkID0gZmFsc2VcbiAgICBpZiAodGhpcy5fZW1pdFF1ZXVlLmxlbmd0aCkge1xuICAgICAgdmFyIGVxID0gdGhpcy5fZW1pdFF1ZXVlLnNsaWNlKDApXG4gICAgICB0aGlzLl9lbWl0UXVldWUubGVuZ3RoID0gMFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlcS5sZW5ndGg7IGkgKyspIHtcbiAgICAgICAgdmFyIGUgPSBlcVtpXVxuICAgICAgICB0aGlzLl9lbWl0TWF0Y2goZVswXSwgZVsxXSlcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuX3Byb2Nlc3NRdWV1ZS5sZW5ndGgpIHtcbiAgICAgIHZhciBwcSA9IHRoaXMuX3Byb2Nlc3NRdWV1ZS5zbGljZSgwKVxuICAgICAgdGhpcy5fcHJvY2Vzc1F1ZXVlLmxlbmd0aCA9IDBcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHEubGVuZ3RoOyBpICsrKSB7XG4gICAgICAgIHZhciBwID0gcHFbaV1cbiAgICAgICAgdGhpcy5fcHJvY2Vzc2luZy0tXG4gICAgICAgIHRoaXMuX3Byb2Nlc3MocFswXSwgcFsxXSwgcFsyXSwgcFszXSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuR2xvYi5wcm90b3R5cGUuX3Byb2Nlc3MgPSBmdW5jdGlvbiAocGF0dGVybiwgaW5kZXgsIGluR2xvYlN0YXIsIGNiKSB7XG4gIGFzc2VydCh0aGlzIGluc3RhbmNlb2YgR2xvYilcbiAgYXNzZXJ0KHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJylcblxuICBpZiAodGhpcy5hYm9ydGVkKVxuICAgIHJldHVyblxuXG4gIHRoaXMuX3Byb2Nlc3NpbmcrK1xuICBpZiAodGhpcy5wYXVzZWQpIHtcbiAgICB0aGlzLl9wcm9jZXNzUXVldWUucHVzaChbcGF0dGVybiwgaW5kZXgsIGluR2xvYlN0YXIsIGNiXSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIC8vY29uc29sZS5lcnJvcignUFJPQ0VTUyAlZCcsIHRoaXMuX3Byb2Nlc3NpbmcsIHBhdHRlcm4pXG5cbiAgLy8gR2V0IHRoZSBmaXJzdCBbbl0gcGFydHMgb2YgcGF0dGVybiB0aGF0IGFyZSBhbGwgc3RyaW5ncy5cbiAgdmFyIG4gPSAwXG4gIHdoaWxlICh0eXBlb2YgcGF0dGVybltuXSA9PT0gJ3N0cmluZycpIHtcbiAgICBuICsrXG4gIH1cbiAgLy8gbm93IG4gaXMgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBvbmUgdGhhdCBpcyAqbm90KiBhIHN0cmluZy5cblxuICAvLyBzZWUgaWYgdGhlcmUncyBhbnl0aGluZyBlbHNlXG4gIHZhciBwcmVmaXhcbiAgc3dpdGNoIChuKSB7XG4gICAgLy8gaWYgbm90LCB0aGVuIHRoaXMgaXMgcmF0aGVyIHNpbXBsZVxuICAgIGNhc2UgcGF0dGVybi5sZW5ndGg6XG4gICAgICB0aGlzLl9wcm9jZXNzU2ltcGxlKHBhdHRlcm4uam9pbignLycpLCBpbmRleCwgY2IpXG4gICAgICByZXR1cm5cblxuICAgIGNhc2UgMDpcbiAgICAgIC8vIHBhdHRlcm4gKnN0YXJ0cyogd2l0aCBzb21lIG5vbi10cml2aWFsIGl0ZW0uXG4gICAgICAvLyBnb2luZyB0byByZWFkZGlyKGN3ZCksIGJ1dCBub3QgaW5jbHVkZSB0aGUgcHJlZml4IGluIG1hdGNoZXMuXG4gICAgICBwcmVmaXggPSBudWxsXG4gICAgICBicmVha1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIHBhdHRlcm4gaGFzIHNvbWUgc3RyaW5nIGJpdHMgaW4gdGhlIGZyb250LlxuICAgICAgLy8gd2hhdGV2ZXIgaXQgc3RhcnRzIHdpdGgsIHdoZXRoZXIgdGhhdCdzICdhYnNvbHV0ZScgbGlrZSAvZm9vL2JhcixcbiAgICAgIC8vIG9yICdyZWxhdGl2ZScgbGlrZSAnLi4vYmF6J1xuICAgICAgcHJlZml4ID0gcGF0dGVybi5zbGljZSgwLCBuKS5qb2luKCcvJylcbiAgICAgIGJyZWFrXG4gIH1cblxuICB2YXIgcmVtYWluID0gcGF0dGVybi5zbGljZShuKVxuXG4gIC8vIGdldCB0aGUgbGlzdCBvZiBlbnRyaWVzLlxuICB2YXIgcmVhZFxuICBpZiAocHJlZml4ID09PSBudWxsKVxuICAgIHJlYWQgPSAnLidcbiAgZWxzZSBpZiAoaXNBYnNvbHV0ZShwcmVmaXgpIHx8XG4gICAgICBpc0Fic29sdXRlKHBhdHRlcm4ubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgcCA9PT0gJ3N0cmluZycgPyBwIDogJ1sqXSdcbiAgICAgIH0pLmpvaW4oJy8nKSkpIHtcbiAgICBpZiAoIXByZWZpeCB8fCAhaXNBYnNvbHV0ZShwcmVmaXgpKVxuICAgICAgcHJlZml4ID0gJy8nICsgcHJlZml4XG4gICAgcmVhZCA9IHByZWZpeFxuICB9IGVsc2VcbiAgICByZWFkID0gcHJlZml4XG5cbiAgdmFyIGFicyA9IHRoaXMuX21ha2VBYnMocmVhZClcblxuICAvL2lmIGlnbm9yZWQsIHNraXAgX3Byb2Nlc3NpbmdcbiAgaWYgKGNoaWxkcmVuSWdub3JlZCh0aGlzLCByZWFkKSlcbiAgICByZXR1cm4gY2IoKVxuXG4gIHZhciBpc0dsb2JTdGFyID0gcmVtYWluWzBdID09PSBtaW5pbWF0Y2guR0xPQlNUQVJcbiAgaWYgKGlzR2xvYlN0YXIpXG4gICAgdGhpcy5fcHJvY2Vzc0dsb2JTdGFyKHByZWZpeCwgcmVhZCwgYWJzLCByZW1haW4sIGluZGV4LCBpbkdsb2JTdGFyLCBjYilcbiAgZWxzZVxuICAgIHRoaXMuX3Byb2Nlc3NSZWFkZGlyKHByZWZpeCwgcmVhZCwgYWJzLCByZW1haW4sIGluZGV4LCBpbkdsb2JTdGFyLCBjYilcbn1cblxuR2xvYi5wcm90b3R5cGUuX3Byb2Nlc3NSZWFkZGlyID0gZnVuY3Rpb24gKHByZWZpeCwgcmVhZCwgYWJzLCByZW1haW4sIGluZGV4LCBpbkdsb2JTdGFyLCBjYikge1xuICB2YXIgc2VsZiA9IHRoaXNcbiAgdGhpcy5fcmVhZGRpcihhYnMsIGluR2xvYlN0YXIsIGZ1bmN0aW9uIChlciwgZW50cmllcykge1xuICAgIHJldHVybiBzZWxmLl9wcm9jZXNzUmVhZGRpcjIocHJlZml4LCByZWFkLCBhYnMsIHJlbWFpbiwgaW5kZXgsIGluR2xvYlN0YXIsIGVudHJpZXMsIGNiKVxuICB9KVxufVxuXG5HbG9iLnByb3RvdHlwZS5fcHJvY2Vzc1JlYWRkaXIyID0gZnVuY3Rpb24gKHByZWZpeCwgcmVhZCwgYWJzLCByZW1haW4sIGluZGV4LCBpbkdsb2JTdGFyLCBlbnRyaWVzLCBjYikge1xuXG4gIC8vIGlmIHRoZSBhYnMgaXNuJ3QgYSBkaXIsIHRoZW4gbm90aGluZyBjYW4gbWF0Y2ghXG4gIGlmICghZW50cmllcylcbiAgICByZXR1cm4gY2IoKVxuXG4gIC8vIEl0IHdpbGwgb25seSBtYXRjaCBkb3QgZW50cmllcyBpZiBpdCBzdGFydHMgd2l0aCBhIGRvdCwgb3IgaWZcbiAgLy8gZG90IGlzIHNldC4gIFN0dWZmIGxpa2UgQCguZm9vfC5iYXIpIGlzbid0IGFsbG93ZWQuXG4gIHZhciBwbiA9IHJlbWFpblswXVxuICB2YXIgbmVnYXRlID0gISF0aGlzLm1pbmltYXRjaC5uZWdhdGVcbiAgdmFyIHJhd0dsb2IgPSBwbi5fZ2xvYlxuICB2YXIgZG90T2sgPSB0aGlzLmRvdCB8fCByYXdHbG9iLmNoYXJBdCgwKSA9PT0gJy4nXG5cbiAgdmFyIG1hdGNoZWRFbnRyaWVzID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnRyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGUgPSBlbnRyaWVzW2ldXG4gICAgaWYgKGUuY2hhckF0KDApICE9PSAnLicgfHwgZG90T2spIHtcbiAgICAgIHZhciBtXG4gICAgICBpZiAobmVnYXRlICYmICFwcmVmaXgpIHtcbiAgICAgICAgbSA9ICFlLm1hdGNoKHBuKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbSA9IGUubWF0Y2gocG4pXG4gICAgICB9XG4gICAgICBpZiAobSlcbiAgICAgICAgbWF0Y2hlZEVudHJpZXMucHVzaChlKVxuICAgIH1cbiAgfVxuXG4gIC8vY29uc29sZS5lcnJvcigncHJkMicsIHByZWZpeCwgZW50cmllcywgcmVtYWluWzBdLl9nbG9iLCBtYXRjaGVkRW50cmllcylcblxuICB2YXIgbGVuID0gbWF0Y2hlZEVudHJpZXMubGVuZ3RoXG4gIC8vIElmIHRoZXJlIGFyZSBubyBtYXRjaGVkIGVudHJpZXMsIHRoZW4gbm90aGluZyBtYXRjaGVzLlxuICBpZiAobGVuID09PSAwKVxuICAgIHJldHVybiBjYigpXG5cbiAgLy8gaWYgdGhpcyBpcyB0aGUgbGFzdCByZW1haW5pbmcgcGF0dGVybiBiaXQsIHRoZW4gbm8gbmVlZCBmb3JcbiAgLy8gYW4gYWRkaXRpb25hbCBzdGF0ICp1bmxlc3MqIHRoZSB1c2VyIGhhcyBzcGVjaWZpZWQgbWFyayBvclxuICAvLyBzdGF0IGV4cGxpY2l0bHkuICBXZSBrbm93IHRoZXkgZXhpc3QsIHNpbmNlIHJlYWRkaXIgcmV0dXJuZWRcbiAgLy8gdGhlbS5cblxuICBpZiAocmVtYWluLmxlbmd0aCA9PT0gMSAmJiAhdGhpcy5tYXJrICYmICF0aGlzLnN0YXQpIHtcbiAgICBpZiAoIXRoaXMubWF0Y2hlc1tpbmRleF0pXG4gICAgICB0aGlzLm1hdGNoZXNbaW5kZXhdID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKyspIHtcbiAgICAgIHZhciBlID0gbWF0Y2hlZEVudHJpZXNbaV1cbiAgICAgIGlmIChwcmVmaXgpIHtcbiAgICAgICAgaWYgKHByZWZpeCAhPT0gJy8nKVxuICAgICAgICAgIGUgPSBwcmVmaXggKyAnLycgKyBlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBlID0gcHJlZml4ICsgZVxuICAgICAgfVxuXG4gICAgICBpZiAoZS5jaGFyQXQoMCkgPT09ICcvJyAmJiAhdGhpcy5ub21vdW50KSB7XG4gICAgICAgIGUgPSBwYXRoLmpvaW4odGhpcy5yb290LCBlKVxuICAgICAgfVxuICAgICAgdGhpcy5fZW1pdE1hdGNoKGluZGV4LCBlKVxuICAgIH1cbiAgICAvLyBUaGlzIHdhcyB0aGUgbGFzdCBvbmUsIGFuZCBubyBzdGF0cyB3ZXJlIG5lZWRlZFxuICAgIHJldHVybiBjYigpXG4gIH1cblxuICAvLyBub3cgdGVzdCBhbGwgbWF0Y2hlZCBlbnRyaWVzIGFzIHN0YW5kLWlucyBmb3IgdGhhdCBwYXJ0XG4gIC8vIG9mIHRoZSBwYXR0ZXJuLlxuICByZW1haW4uc2hpZnQoKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArKykge1xuICAgIHZhciBlID0gbWF0Y2hlZEVudHJpZXNbaV1cbiAgICB2YXIgbmV3UGF0dGVyblxuICAgIGlmIChwcmVmaXgpIHtcbiAgICAgIGlmIChwcmVmaXggIT09ICcvJylcbiAgICAgICAgZSA9IHByZWZpeCArICcvJyArIGVcbiAgICAgIGVsc2VcbiAgICAgICAgZSA9IHByZWZpeCArIGVcbiAgICB9XG4gICAgdGhpcy5fcHJvY2VzcyhbZV0uY29uY2F0KHJlbWFpbiksIGluZGV4LCBpbkdsb2JTdGFyLCBjYilcbiAgfVxuICBjYigpXG59XG5cbkdsb2IucHJvdG90eXBlLl9lbWl0TWF0Y2ggPSBmdW5jdGlvbiAoaW5kZXgsIGUpIHtcbiAgaWYgKHRoaXMuYWJvcnRlZClcbiAgICByZXR1cm5cblxuICBpZiAoaXNJZ25vcmVkKHRoaXMsIGUpKVxuICAgIHJldHVyblxuXG4gIGlmICh0aGlzLnBhdXNlZCkge1xuICAgIHRoaXMuX2VtaXRRdWV1ZS5wdXNoKFtpbmRleCwgZV0pXG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgYWJzID0gaXNBYnNvbHV0ZShlKSA/IGUgOiB0aGlzLl9tYWtlQWJzKGUpXG5cbiAgaWYgKHRoaXMubWFyaylcbiAgICBlID0gdGhpcy5fbWFyayhlKVxuXG4gIGlmICh0aGlzLmFic29sdXRlKVxuICAgIGUgPSBhYnNcblxuICBpZiAodGhpcy5tYXRjaGVzW2luZGV4XVtlXSlcbiAgICByZXR1cm5cblxuICBpZiAodGhpcy5ub2Rpcikge1xuICAgIHZhciBjID0gdGhpcy5jYWNoZVthYnNdXG4gICAgaWYgKGMgPT09ICdESVInIHx8IEFycmF5LmlzQXJyYXkoYykpXG4gICAgICByZXR1cm5cbiAgfVxuXG4gIHRoaXMubWF0Y2hlc1tpbmRleF1bZV0gPSB0cnVlXG5cbiAgdmFyIHN0ID0gdGhpcy5zdGF0Q2FjaGVbYWJzXVxuICBpZiAoc3QpXG4gICAgdGhpcy5lbWl0KCdzdGF0JywgZSwgc3QpXG5cbiAgdGhpcy5lbWl0KCdtYXRjaCcsIGUpXG59XG5cbkdsb2IucHJvdG90eXBlLl9yZWFkZGlySW5HbG9iU3RhciA9IGZ1bmN0aW9uIChhYnMsIGNiKSB7XG4gIGlmICh0aGlzLmFib3J0ZWQpXG4gICAgcmV0dXJuXG5cbiAgLy8gZm9sbG93IGFsbCBzeW1saW5rZWQgZGlyZWN0b3JpZXMgZm9yZXZlclxuICAvLyBqdXN0IHByb2NlZWQgYXMgaWYgdGhpcyBpcyBhIG5vbi1nbG9ic3RhciBzaXR1YXRpb25cbiAgaWYgKHRoaXMuZm9sbG93KVxuICAgIHJldHVybiB0aGlzLl9yZWFkZGlyKGFicywgZmFsc2UsIGNiKVxuXG4gIHZhciBsc3RhdGtleSA9ICdsc3RhdFxcMCcgKyBhYnNcbiAgdmFyIHNlbGYgPSB0aGlzXG4gIHZhciBsc3RhdGNiID0gaW5mbGlnaHQobHN0YXRrZXksIGxzdGF0Y2JfKVxuXG4gIGlmIChsc3RhdGNiKVxuICAgIHNlbGYuZnMubHN0YXQoYWJzLCBsc3RhdGNiKVxuXG4gIGZ1bmN0aW9uIGxzdGF0Y2JfIChlciwgbHN0YXQpIHtcbiAgICBpZiAoZXIgJiYgZXIuY29kZSA9PT0gJ0VOT0VOVCcpXG4gICAgICByZXR1cm4gY2IoKVxuXG4gICAgdmFyIGlzU3ltID0gbHN0YXQgJiYgbHN0YXQuaXNTeW1ib2xpY0xpbmsoKVxuICAgIHNlbGYuc3ltbGlua3NbYWJzXSA9IGlzU3ltXG5cbiAgICAvLyBJZiBpdCdzIG5vdCBhIHN5bWxpbmsgb3IgYSBkaXIsIHRoZW4gaXQncyBkZWZpbml0ZWx5IGEgcmVndWxhciBmaWxlLlxuICAgIC8vIGRvbid0IGJvdGhlciBkb2luZyBhIHJlYWRkaXIgaW4gdGhhdCBjYXNlLlxuICAgIGlmICghaXNTeW0gJiYgbHN0YXQgJiYgIWxzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIHNlbGYuY2FjaGVbYWJzXSA9ICdGSUxFJ1xuICAgICAgY2IoKVxuICAgIH0gZWxzZVxuICAgICAgc2VsZi5fcmVhZGRpcihhYnMsIGZhbHNlLCBjYilcbiAgfVxufVxuXG5HbG9iLnByb3RvdHlwZS5fcmVhZGRpciA9IGZ1bmN0aW9uIChhYnMsIGluR2xvYlN0YXIsIGNiKSB7XG4gIGlmICh0aGlzLmFib3J0ZWQpXG4gICAgcmV0dXJuXG5cbiAgY2IgPSBpbmZsaWdodCgncmVhZGRpclxcMCcrYWJzKydcXDAnK2luR2xvYlN0YXIsIGNiKVxuICBpZiAoIWNiKVxuICAgIHJldHVyblxuXG4gIC8vY29uc29sZS5lcnJvcignUkQgJWogJWonLCAraW5HbG9iU3RhciwgYWJzKVxuICBpZiAoaW5HbG9iU3RhciAmJiAhb3duUHJvcCh0aGlzLnN5bWxpbmtzLCBhYnMpKVxuICAgIHJldHVybiB0aGlzLl9yZWFkZGlySW5HbG9iU3RhcihhYnMsIGNiKVxuXG4gIGlmIChvd25Qcm9wKHRoaXMuY2FjaGUsIGFicykpIHtcbiAgICB2YXIgYyA9IHRoaXMuY2FjaGVbYWJzXVxuICAgIGlmICghYyB8fCBjID09PSAnRklMRScpXG4gICAgICByZXR1cm4gY2IoKVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYykpXG4gICAgICByZXR1cm4gY2IobnVsbCwgYylcbiAgfVxuXG4gIHZhciBzZWxmID0gdGhpc1xuICBzZWxmLmZzLnJlYWRkaXIoYWJzLCByZWFkZGlyQ2IodGhpcywgYWJzLCBjYikpXG59XG5cbmZ1bmN0aW9uIHJlYWRkaXJDYiAoc2VsZiwgYWJzLCBjYikge1xuICByZXR1cm4gZnVuY3Rpb24gKGVyLCBlbnRyaWVzKSB7XG4gICAgaWYgKGVyKVxuICAgICAgc2VsZi5fcmVhZGRpckVycm9yKGFicywgZXIsIGNiKVxuICAgIGVsc2VcbiAgICAgIHNlbGYuX3JlYWRkaXJFbnRyaWVzKGFicywgZW50cmllcywgY2IpXG4gIH1cbn1cblxuR2xvYi5wcm90b3R5cGUuX3JlYWRkaXJFbnRyaWVzID0gZnVuY3Rpb24gKGFicywgZW50cmllcywgY2IpIHtcbiAgaWYgKHRoaXMuYWJvcnRlZClcbiAgICByZXR1cm5cblxuICAvLyBpZiB3ZSBoYXZlbid0IGFza2VkIHRvIHN0YXQgZXZlcnl0aGluZywgdGhlbiBqdXN0XG4gIC8vIGFzc3VtZSB0aGF0IGV2ZXJ5dGhpbmcgaW4gdGhlcmUgZXhpc3RzLCBzbyB3ZSBjYW4gYXZvaWRcbiAgLy8gaGF2aW5nIHRvIHN0YXQgaXQgYSBzZWNvbmQgdGltZS5cbiAgaWYgKCF0aGlzLm1hcmsgJiYgIXRoaXMuc3RhdCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkgKyspIHtcbiAgICAgIHZhciBlID0gZW50cmllc1tpXVxuICAgICAgaWYgKGFicyA9PT0gJy8nKVxuICAgICAgICBlID0gYWJzICsgZVxuICAgICAgZWxzZVxuICAgICAgICBlID0gYWJzICsgJy8nICsgZVxuICAgICAgdGhpcy5jYWNoZVtlXSA9IHRydWVcbiAgICB9XG4gIH1cblxuICB0aGlzLmNhY2hlW2Fic10gPSBlbnRyaWVzXG4gIHJldHVybiBjYihudWxsLCBlbnRyaWVzKVxufVxuXG5HbG9iLnByb3RvdHlwZS5fcmVhZGRpckVycm9yID0gZnVuY3Rpb24gKGYsIGVyLCBjYikge1xuICBpZiAodGhpcy5hYm9ydGVkKVxuICAgIHJldHVyblxuXG4gIC8vIGhhbmRsZSBlcnJvcnMsIGFuZCBjYWNoZSB0aGUgaW5mb3JtYXRpb25cbiAgc3dpdGNoIChlci5jb2RlKSB7XG4gICAgY2FzZSAnRU5PVFNVUCc6IC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9pc2FhY3Mvbm9kZS1nbG9iL2lzc3Vlcy8yMDVcbiAgICBjYXNlICdFTk9URElSJzogLy8gdG90YWxseSBub3JtYWwuIG1lYW5zIGl0ICpkb2VzKiBleGlzdC5cbiAgICAgIHZhciBhYnMgPSB0aGlzLl9tYWtlQWJzKGYpXG4gICAgICB0aGlzLmNhY2hlW2Fic10gPSAnRklMRSdcbiAgICAgIGlmIChhYnMgPT09IHRoaXMuY3dkQWJzKSB7XG4gICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcihlci5jb2RlICsgJyBpbnZhbGlkIGN3ZCAnICsgdGhpcy5jd2QpXG4gICAgICAgIGVycm9yLnBhdGggPSB0aGlzLmN3ZFxuICAgICAgICBlcnJvci5jb2RlID0gZXIuY29kZVxuICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyb3IpXG4gICAgICAgIHRoaXMuYWJvcnQoKVxuICAgICAgfVxuICAgICAgYnJlYWtcblxuICAgIGNhc2UgJ0VOT0VOVCc6IC8vIG5vdCB0ZXJyaWJseSB1bnVzdWFsXG4gICAgY2FzZSAnRUxPT1AnOlxuICAgIGNhc2UgJ0VOQU1FVE9PTE9ORyc6XG4gICAgY2FzZSAnVU5LTk9XTic6XG4gICAgICB0aGlzLmNhY2hlW3RoaXMuX21ha2VBYnMoZildID0gZmFsc2VcbiAgICAgIGJyZWFrXG5cbiAgICBkZWZhdWx0OiAvLyBzb21lIHVudXN1YWwgZXJyb3IuICBUcmVhdCBhcyBmYWlsdXJlLlxuICAgICAgdGhpcy5jYWNoZVt0aGlzLl9tYWtlQWJzKGYpXSA9IGZhbHNlXG4gICAgICBpZiAodGhpcy5zdHJpY3QpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVyKVxuICAgICAgICAvLyBJZiB0aGUgZXJyb3IgaXMgaGFuZGxlZCwgdGhlbiB3ZSBhYm9ydFxuICAgICAgICAvLyBpZiBub3QsIHdlIHRocmV3IG91dCBvZiBoZXJlXG4gICAgICAgIHRoaXMuYWJvcnQoKVxuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLnNpbGVudClcbiAgICAgICAgY29uc29sZS5lcnJvcignZ2xvYiBlcnJvcicsIGVyKVxuICAgICAgYnJlYWtcbiAgfVxuXG4gIHJldHVybiBjYigpXG59XG5cbkdsb2IucHJvdG90eXBlLl9wcm9jZXNzR2xvYlN0YXIgPSBmdW5jdGlvbiAocHJlZml4LCByZWFkLCBhYnMsIHJlbWFpbiwgaW5kZXgsIGluR2xvYlN0YXIsIGNiKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuICB0aGlzLl9yZWFkZGlyKGFicywgaW5HbG9iU3RhciwgZnVuY3Rpb24gKGVyLCBlbnRyaWVzKSB7XG4gICAgc2VsZi5fcHJvY2Vzc0dsb2JTdGFyMihwcmVmaXgsIHJlYWQsIGFicywgcmVtYWluLCBpbmRleCwgaW5HbG9iU3RhciwgZW50cmllcywgY2IpXG4gIH0pXG59XG5cblxuR2xvYi5wcm90b3R5cGUuX3Byb2Nlc3NHbG9iU3RhcjIgPSBmdW5jdGlvbiAocHJlZml4LCByZWFkLCBhYnMsIHJlbWFpbiwgaW5kZXgsIGluR2xvYlN0YXIsIGVudHJpZXMsIGNiKSB7XG4gIC8vY29uc29sZS5lcnJvcigncGdzMicsIHByZWZpeCwgcmVtYWluWzBdLCBlbnRyaWVzKVxuXG4gIC8vIG5vIGVudHJpZXMgbWVhbnMgbm90IGEgZGlyLCBzbyBpdCBjYW4gbmV2ZXIgaGF2ZSBtYXRjaGVzXG4gIC8vIGZvby50eHQvKiogZG9lc24ndCBtYXRjaCBmb28udHh0XG4gIGlmICghZW50cmllcylcbiAgICByZXR1cm4gY2IoKVxuXG4gIC8vIHRlc3Qgd2l0aG91dCB0aGUgZ2xvYnN0YXIsIGFuZCB3aXRoIGV2ZXJ5IGNoaWxkIGJvdGggYmVsb3dcbiAgLy8gYW5kIHJlcGxhY2luZyB0aGUgZ2xvYnN0YXIuXG4gIHZhciByZW1haW5XaXRob3V0R2xvYlN0YXIgPSByZW1haW4uc2xpY2UoMSlcbiAgdmFyIGdzcHJlZiA9IHByZWZpeCA/IFsgcHJlZml4IF0gOiBbXVxuICB2YXIgbm9HbG9iU3RhciA9IGdzcHJlZi5jb25jYXQocmVtYWluV2l0aG91dEdsb2JTdGFyKVxuXG4gIC8vIHRoZSBub0dsb2JTdGFyIHBhdHRlcm4gZXhpdHMgdGhlIGluR2xvYlN0YXIgc3RhdGVcbiAgdGhpcy5fcHJvY2Vzcyhub0dsb2JTdGFyLCBpbmRleCwgZmFsc2UsIGNiKVxuXG4gIHZhciBpc1N5bSA9IHRoaXMuc3ltbGlua3NbYWJzXVxuICB2YXIgbGVuID0gZW50cmllcy5sZW5ndGhcblxuICAvLyBJZiBpdCdzIGEgc3ltbGluaywgYW5kIHdlJ3JlIGluIGEgZ2xvYnN0YXIsIHRoZW4gc3RvcFxuICBpZiAoaXNTeW0gJiYgaW5HbG9iU3RhcilcbiAgICByZXR1cm4gY2IoKVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICB2YXIgZSA9IGVudHJpZXNbaV1cbiAgICBpZiAoZS5jaGFyQXQoMCkgPT09ICcuJyAmJiAhdGhpcy5kb3QpXG4gICAgICBjb250aW51ZVxuXG4gICAgLy8gdGhlc2UgdHdvIGNhc2VzIGVudGVyIHRoZSBpbkdsb2JTdGFyIHN0YXRlXG4gICAgdmFyIGluc3RlYWQgPSBnc3ByZWYuY29uY2F0KGVudHJpZXNbaV0sIHJlbWFpbldpdGhvdXRHbG9iU3RhcilcbiAgICB0aGlzLl9wcm9jZXNzKGluc3RlYWQsIGluZGV4LCB0cnVlLCBjYilcblxuICAgIHZhciBiZWxvdyA9IGdzcHJlZi5jb25jYXQoZW50cmllc1tpXSwgcmVtYWluKVxuICAgIHRoaXMuX3Byb2Nlc3MoYmVsb3csIGluZGV4LCB0cnVlLCBjYilcbiAgfVxuXG4gIGNiKClcbn1cblxuR2xvYi5wcm90b3R5cGUuX3Byb2Nlc3NTaW1wbGUgPSBmdW5jdGlvbiAocHJlZml4LCBpbmRleCwgY2IpIHtcbiAgLy8gWFhYIHJldmlldyB0aGlzLiAgU2hvdWxkbid0IGl0IGJlIGRvaW5nIHRoZSBtb3VudGluZyBldGNcbiAgLy8gYmVmb3JlIGRvaW5nIHN0YXQ/ICBraW5kYSB3ZWlyZD9cbiAgdmFyIHNlbGYgPSB0aGlzXG4gIHRoaXMuX3N0YXQocHJlZml4LCBmdW5jdGlvbiAoZXIsIGV4aXN0cykge1xuICAgIHNlbGYuX3Byb2Nlc3NTaW1wbGUyKHByZWZpeCwgaW5kZXgsIGVyLCBleGlzdHMsIGNiKVxuICB9KVxufVxuR2xvYi5wcm90b3R5cGUuX3Byb2Nlc3NTaW1wbGUyID0gZnVuY3Rpb24gKHByZWZpeCwgaW5kZXgsIGVyLCBleGlzdHMsIGNiKSB7XG5cbiAgLy9jb25zb2xlLmVycm9yKCdwczInLCBwcmVmaXgsIGV4aXN0cylcblxuICBpZiAoIXRoaXMubWF0Y2hlc1tpbmRleF0pXG4gICAgdGhpcy5tYXRjaGVzW2luZGV4XSA9IE9iamVjdC5jcmVhdGUobnVsbClcblxuICAvLyBJZiBpdCBkb2Vzbid0IGV4aXN0LCB0aGVuIGp1c3QgbWFyayB0aGUgbGFjayBvZiByZXN1bHRzXG4gIGlmICghZXhpc3RzKVxuICAgIHJldHVybiBjYigpXG5cbiAgaWYgKHByZWZpeCAmJiBpc0Fic29sdXRlKHByZWZpeCkgJiYgIXRoaXMubm9tb3VudCkge1xuICAgIHZhciB0cmFpbCA9IC9bXFwvXFxcXF0kLy50ZXN0KHByZWZpeClcbiAgICBpZiAocHJlZml4LmNoYXJBdCgwKSA9PT0gJy8nKSB7XG4gICAgICBwcmVmaXggPSBwYXRoLmpvaW4odGhpcy5yb290LCBwcmVmaXgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHByZWZpeCA9IHBhdGgucmVzb2x2ZSh0aGlzLnJvb3QsIHByZWZpeClcbiAgICAgIGlmICh0cmFpbClcbiAgICAgICAgcHJlZml4ICs9ICcvJ1xuICAgIH1cbiAgfVxuXG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKVxuICAgIHByZWZpeCA9IHByZWZpeC5yZXBsYWNlKC9cXFxcL2csICcvJylcblxuICAvLyBNYXJrIHRoaXMgYXMgYSBtYXRjaFxuICB0aGlzLl9lbWl0TWF0Y2goaW5kZXgsIHByZWZpeClcbiAgY2IoKVxufVxuXG4vLyBSZXR1cm5zIGVpdGhlciAnRElSJywgJ0ZJTEUnLCBvciBmYWxzZVxuR2xvYi5wcm90b3R5cGUuX3N0YXQgPSBmdW5jdGlvbiAoZiwgY2IpIHtcbiAgdmFyIGFicyA9IHRoaXMuX21ha2VBYnMoZilcbiAgdmFyIG5lZWREaXIgPSBmLnNsaWNlKC0xKSA9PT0gJy8nXG5cbiAgaWYgKGYubGVuZ3RoID4gdGhpcy5tYXhMZW5ndGgpXG4gICAgcmV0dXJuIGNiKClcblxuICBpZiAoIXRoaXMuc3RhdCAmJiBvd25Qcm9wKHRoaXMuY2FjaGUsIGFicykpIHtcbiAgICB2YXIgYyA9IHRoaXMuY2FjaGVbYWJzXVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYykpXG4gICAgICBjID0gJ0RJUidcblxuICAgIC8vIEl0IGV4aXN0cywgYnV0IG1heWJlIG5vdCBob3cgd2UgbmVlZCBpdFxuICAgIGlmICghbmVlZERpciB8fCBjID09PSAnRElSJylcbiAgICAgIHJldHVybiBjYihudWxsLCBjKVxuXG4gICAgaWYgKG5lZWREaXIgJiYgYyA9PT0gJ0ZJTEUnKVxuICAgICAgcmV0dXJuIGNiKClcblxuICAgIC8vIG90aGVyd2lzZSB3ZSBoYXZlIHRvIHN0YXQsIGJlY2F1c2UgbWF5YmUgYz10cnVlXG4gICAgLy8gaWYgd2Uga25vdyBpdCBleGlzdHMsIGJ1dCBub3Qgd2hhdCBpdCBpcy5cbiAgfVxuXG4gIHZhciBleGlzdHNcbiAgdmFyIHN0YXQgPSB0aGlzLnN0YXRDYWNoZVthYnNdXG4gIGlmIChzdGF0ICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoc3RhdCA9PT0gZmFsc2UpXG4gICAgICByZXR1cm4gY2IobnVsbCwgc3RhdClcbiAgICBlbHNlIHtcbiAgICAgIHZhciB0eXBlID0gc3RhdC5pc0RpcmVjdG9yeSgpID8gJ0RJUicgOiAnRklMRSdcbiAgICAgIGlmIChuZWVkRGlyICYmIHR5cGUgPT09ICdGSUxFJylcbiAgICAgICAgcmV0dXJuIGNiKClcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGNiKG51bGwsIHR5cGUsIHN0YXQpXG4gICAgfVxuICB9XG5cbiAgdmFyIHNlbGYgPSB0aGlzXG4gIHZhciBzdGF0Y2IgPSBpbmZsaWdodCgnc3RhdFxcMCcgKyBhYnMsIGxzdGF0Y2JfKVxuICBpZiAoc3RhdGNiKVxuICAgIHNlbGYuZnMubHN0YXQoYWJzLCBzdGF0Y2IpXG5cbiAgZnVuY3Rpb24gbHN0YXRjYl8gKGVyLCBsc3RhdCkge1xuICAgIGlmIChsc3RhdCAmJiBsc3RhdC5pc1N5bWJvbGljTGluaygpKSB7XG4gICAgICAvLyBJZiBpdCdzIGEgc3ltbGluaywgdGhlbiB0cmVhdCBpdCBhcyB0aGUgdGFyZ2V0LCB1bmxlc3NcbiAgICAgIC8vIHRoZSB0YXJnZXQgZG9lcyBub3QgZXhpc3QsIHRoZW4gdHJlYXQgaXQgYXMgYSBmaWxlLlxuICAgICAgcmV0dXJuIHNlbGYuZnMuc3RhdChhYnMsIGZ1bmN0aW9uIChlciwgc3RhdCkge1xuICAgICAgICBpZiAoZXIpXG4gICAgICAgICAgc2VsZi5fc3RhdDIoZiwgYWJzLCBudWxsLCBsc3RhdCwgY2IpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzZWxmLl9zdGF0MihmLCBhYnMsIGVyLCBzdGF0LCBjYilcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuX3N0YXQyKGYsIGFicywgZXIsIGxzdGF0LCBjYilcbiAgICB9XG4gIH1cbn1cblxuR2xvYi5wcm90b3R5cGUuX3N0YXQyID0gZnVuY3Rpb24gKGYsIGFicywgZXIsIHN0YXQsIGNiKSB7XG4gIGlmIChlciAmJiAoZXIuY29kZSA9PT0gJ0VOT0VOVCcgfHwgZXIuY29kZSA9PT0gJ0VOT1RESVInKSkge1xuICAgIHRoaXMuc3RhdENhY2hlW2Fic10gPSBmYWxzZVxuICAgIHJldHVybiBjYigpXG4gIH1cblxuICB2YXIgbmVlZERpciA9IGYuc2xpY2UoLTEpID09PSAnLydcbiAgdGhpcy5zdGF0Q2FjaGVbYWJzXSA9IHN0YXRcblxuICBpZiAoYWJzLnNsaWNlKC0xKSA9PT0gJy8nICYmIHN0YXQgJiYgIXN0YXQuaXNEaXJlY3RvcnkoKSlcbiAgICByZXR1cm4gY2IobnVsbCwgZmFsc2UsIHN0YXQpXG5cbiAgdmFyIGMgPSB0cnVlXG4gIGlmIChzdGF0KVxuICAgIGMgPSBzdGF0LmlzRGlyZWN0b3J5KCkgPyAnRElSJyA6ICdGSUxFJ1xuICB0aGlzLmNhY2hlW2Fic10gPSB0aGlzLmNhY2hlW2Fic10gfHwgY1xuXG4gIGlmIChuZWVkRGlyICYmIGMgPT09ICdGSUxFJylcbiAgICByZXR1cm4gY2IoKVxuXG4gIHJldHVybiBjYihudWxsLCBjLCBzdGF0KVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBnbG9iU3luY1xuZ2xvYlN5bmMuR2xvYlN5bmMgPSBHbG9iU3luY1xuXG52YXIgcnAgPSByZXF1aXJlKCdmcy5yZWFscGF0aCcpXG52YXIgbWluaW1hdGNoID0gcmVxdWlyZSgnbWluaW1hdGNoJylcbnZhciBNaW5pbWF0Y2ggPSBtaW5pbWF0Y2guTWluaW1hdGNoXG52YXIgR2xvYiA9IHJlcXVpcmUoJy4vZ2xvYi5qcycpLkdsb2JcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpXG52YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxudmFyIGFzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpXG52YXIgaXNBYnNvbHV0ZSA9IHJlcXVpcmUoJ3BhdGgtaXMtYWJzb2x1dGUnKVxudmFyIGNvbW1vbiA9IHJlcXVpcmUoJy4vY29tbW9uLmpzJylcbnZhciBzZXRvcHRzID0gY29tbW9uLnNldG9wdHNcbnZhciBvd25Qcm9wID0gY29tbW9uLm93blByb3BcbnZhciBjaGlsZHJlbklnbm9yZWQgPSBjb21tb24uY2hpbGRyZW5JZ25vcmVkXG52YXIgaXNJZ25vcmVkID0gY29tbW9uLmlzSWdub3JlZFxuXG5mdW5jdGlvbiBnbG9iU3luYyAocGF0dGVybiwgb3B0aW9ucykge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMylcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdjYWxsYmFjayBwcm92aWRlZCB0byBzeW5jIGdsb2JcXG4nK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1NlZTogaHR0cHM6Ly9naXRodWIuY29tL2lzYWFjcy9ub2RlLWdsb2IvaXNzdWVzLzE2NycpXG5cbiAgcmV0dXJuIG5ldyBHbG9iU3luYyhwYXR0ZXJuLCBvcHRpb25zKS5mb3VuZFxufVxuXG5mdW5jdGlvbiBHbG9iU3luYyAocGF0dGVybiwgb3B0aW9ucykge1xuICBpZiAoIXBhdHRlcm4pXG4gICAgdGhyb3cgbmV3IEVycm9yKCdtdXN0IHByb3ZpZGUgcGF0dGVybicpXG5cbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDMpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2FsbGJhY2sgcHJvdmlkZWQgdG8gc3luYyBnbG9iXFxuJytcbiAgICAgICAgICAgICAgICAgICAgICAgICdTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9pc2FhY3Mvbm9kZS1nbG9iL2lzc3Vlcy8xNjcnKVxuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBHbG9iU3luYykpXG4gICAgcmV0dXJuIG5ldyBHbG9iU3luYyhwYXR0ZXJuLCBvcHRpb25zKVxuXG4gIHNldG9wdHModGhpcywgcGF0dGVybiwgb3B0aW9ucylcblxuICBpZiAodGhpcy5ub3Byb2Nlc3MpXG4gICAgcmV0dXJuIHRoaXNcblxuICB2YXIgbiA9IHRoaXMubWluaW1hdGNoLnNldC5sZW5ndGhcbiAgdGhpcy5tYXRjaGVzID0gbmV3IEFycmF5KG4pXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSArKykge1xuICAgIHRoaXMuX3Byb2Nlc3ModGhpcy5taW5pbWF0Y2guc2V0W2ldLCBpLCBmYWxzZSlcbiAgfVxuICB0aGlzLl9maW5pc2goKVxufVxuXG5HbG9iU3luYy5wcm90b3R5cGUuX2ZpbmlzaCA9IGZ1bmN0aW9uICgpIHtcbiAgYXNzZXJ0Lm9rKHRoaXMgaW5zdGFuY2VvZiBHbG9iU3luYylcbiAgaWYgKHRoaXMucmVhbHBhdGgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICB0aGlzLm1hdGNoZXMuZm9yRWFjaChmdW5jdGlvbiAobWF0Y2hzZXQsIGluZGV4KSB7XG4gICAgICB2YXIgc2V0ID0gc2VsZi5tYXRjaGVzW2luZGV4XSA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgICAgIGZvciAodmFyIHAgaW4gbWF0Y2hzZXQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBwID0gc2VsZi5fbWFrZUFicyhwKVxuICAgICAgICAgIHZhciByZWFsID0gcnAucmVhbHBhdGhTeW5jKHAsIHNlbGYucmVhbHBhdGhDYWNoZSlcbiAgICAgICAgICBzZXRbcmVhbF0gPSB0cnVlXG4gICAgICAgIH0gY2F0Y2ggKGVyKSB7XG4gICAgICAgICAgaWYgKGVyLnN5c2NhbGwgPT09ICdzdGF0JylcbiAgICAgICAgICAgIHNldFtzZWxmLl9tYWtlQWJzKHApXSA9IHRydWVcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aHJvdyBlclxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBjb21tb24uZmluaXNoKHRoaXMpXG59XG5cblxuR2xvYlN5bmMucHJvdG90eXBlLl9wcm9jZXNzID0gZnVuY3Rpb24gKHBhdHRlcm4sIGluZGV4LCBpbkdsb2JTdGFyKSB7XG4gIGFzc2VydC5vayh0aGlzIGluc3RhbmNlb2YgR2xvYlN5bmMpXG5cbiAgLy8gR2V0IHRoZSBmaXJzdCBbbl0gcGFydHMgb2YgcGF0dGVybiB0aGF0IGFyZSBhbGwgc3RyaW5ncy5cbiAgdmFyIG4gPSAwXG4gIHdoaWxlICh0eXBlb2YgcGF0dGVybltuXSA9PT0gJ3N0cmluZycpIHtcbiAgICBuICsrXG4gIH1cbiAgLy8gbm93IG4gaXMgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBvbmUgdGhhdCBpcyAqbm90KiBhIHN0cmluZy5cblxuICAvLyBTZWUgaWYgdGhlcmUncyBhbnl0aGluZyBlbHNlXG4gIHZhciBwcmVmaXhcbiAgc3dpdGNoIChuKSB7XG4gICAgLy8gaWYgbm90LCB0aGVuIHRoaXMgaXMgcmF0aGVyIHNpbXBsZVxuICAgIGNhc2UgcGF0dGVybi5sZW5ndGg6XG4gICAgICB0aGlzLl9wcm9jZXNzU2ltcGxlKHBhdHRlcm4uam9pbignLycpLCBpbmRleClcbiAgICAgIHJldHVyblxuXG4gICAgY2FzZSAwOlxuICAgICAgLy8gcGF0dGVybiAqc3RhcnRzKiB3aXRoIHNvbWUgbm9uLXRyaXZpYWwgaXRlbS5cbiAgICAgIC8vIGdvaW5nIHRvIHJlYWRkaXIoY3dkKSwgYnV0IG5vdCBpbmNsdWRlIHRoZSBwcmVmaXggaW4gbWF0Y2hlcy5cbiAgICAgIHByZWZpeCA9IG51bGxcbiAgICAgIGJyZWFrXG5cbiAgICBkZWZhdWx0OlxuICAgICAgLy8gcGF0dGVybiBoYXMgc29tZSBzdHJpbmcgYml0cyBpbiB0aGUgZnJvbnQuXG4gICAgICAvLyB3aGF0ZXZlciBpdCBzdGFydHMgd2l0aCwgd2hldGhlciB0aGF0J3MgJ2Fic29sdXRlJyBsaWtlIC9mb28vYmFyLFxuICAgICAgLy8gb3IgJ3JlbGF0aXZlJyBsaWtlICcuLi9iYXonXG4gICAgICBwcmVmaXggPSBwYXR0ZXJuLnNsaWNlKDAsIG4pLmpvaW4oJy8nKVxuICAgICAgYnJlYWtcbiAgfVxuXG4gIHZhciByZW1haW4gPSBwYXR0ZXJuLnNsaWNlKG4pXG5cbiAgLy8gZ2V0IHRoZSBsaXN0IG9mIGVudHJpZXMuXG4gIHZhciByZWFkXG4gIGlmIChwcmVmaXggPT09IG51bGwpXG4gICAgcmVhZCA9ICcuJ1xuICBlbHNlIGlmIChpc0Fic29sdXRlKHByZWZpeCkgfHxcbiAgICAgIGlzQWJzb2x1dGUocGF0dGVybi5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBwID09PSAnc3RyaW5nJyA/IHAgOiAnWypdJ1xuICAgICAgfSkuam9pbignLycpKSkge1xuICAgIGlmICghcHJlZml4IHx8ICFpc0Fic29sdXRlKHByZWZpeCkpXG4gICAgICBwcmVmaXggPSAnLycgKyBwcmVmaXhcbiAgICByZWFkID0gcHJlZml4XG4gIH0gZWxzZVxuICAgIHJlYWQgPSBwcmVmaXhcblxuICB2YXIgYWJzID0gdGhpcy5fbWFrZUFicyhyZWFkKVxuXG4gIC8vaWYgaWdub3JlZCwgc2tpcCBwcm9jZXNzaW5nXG4gIGlmIChjaGlsZHJlbklnbm9yZWQodGhpcywgcmVhZCkpXG4gICAgcmV0dXJuXG5cbiAgdmFyIGlzR2xvYlN0YXIgPSByZW1haW5bMF0gPT09IG1pbmltYXRjaC5HTE9CU1RBUlxuICBpZiAoaXNHbG9iU3RhcilcbiAgICB0aGlzLl9wcm9jZXNzR2xvYlN0YXIocHJlZml4LCByZWFkLCBhYnMsIHJlbWFpbiwgaW5kZXgsIGluR2xvYlN0YXIpXG4gIGVsc2VcbiAgICB0aGlzLl9wcm9jZXNzUmVhZGRpcihwcmVmaXgsIHJlYWQsIGFicywgcmVtYWluLCBpbmRleCwgaW5HbG9iU3Rhcilcbn1cblxuXG5HbG9iU3luYy5wcm90b3R5cGUuX3Byb2Nlc3NSZWFkZGlyID0gZnVuY3Rpb24gKHByZWZpeCwgcmVhZCwgYWJzLCByZW1haW4sIGluZGV4LCBpbkdsb2JTdGFyKSB7XG4gIHZhciBlbnRyaWVzID0gdGhpcy5fcmVhZGRpcihhYnMsIGluR2xvYlN0YXIpXG5cbiAgLy8gaWYgdGhlIGFicyBpc24ndCBhIGRpciwgdGhlbiBub3RoaW5nIGNhbiBtYXRjaCFcbiAgaWYgKCFlbnRyaWVzKVxuICAgIHJldHVyblxuXG4gIC8vIEl0IHdpbGwgb25seSBtYXRjaCBkb3QgZW50cmllcyBpZiBpdCBzdGFydHMgd2l0aCBhIGRvdCwgb3IgaWZcbiAgLy8gZG90IGlzIHNldC4gIFN0dWZmIGxpa2UgQCguZm9vfC5iYXIpIGlzbid0IGFsbG93ZWQuXG4gIHZhciBwbiA9IHJlbWFpblswXVxuICB2YXIgbmVnYXRlID0gISF0aGlzLm1pbmltYXRjaC5uZWdhdGVcbiAgdmFyIHJhd0dsb2IgPSBwbi5fZ2xvYlxuICB2YXIgZG90T2sgPSB0aGlzLmRvdCB8fCByYXdHbG9iLmNoYXJBdCgwKSA9PT0gJy4nXG5cbiAgdmFyIG1hdGNoZWRFbnRyaWVzID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnRyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGUgPSBlbnRyaWVzW2ldXG4gICAgaWYgKGUuY2hhckF0KDApICE9PSAnLicgfHwgZG90T2spIHtcbiAgICAgIHZhciBtXG4gICAgICBpZiAobmVnYXRlICYmICFwcmVmaXgpIHtcbiAgICAgICAgbSA9ICFlLm1hdGNoKHBuKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbSA9IGUubWF0Y2gocG4pXG4gICAgICB9XG4gICAgICBpZiAobSlcbiAgICAgICAgbWF0Y2hlZEVudHJpZXMucHVzaChlKVxuICAgIH1cbiAgfVxuXG4gIHZhciBsZW4gPSBtYXRjaGVkRW50cmllcy5sZW5ndGhcbiAgLy8gSWYgdGhlcmUgYXJlIG5vIG1hdGNoZWQgZW50cmllcywgdGhlbiBub3RoaW5nIG1hdGNoZXMuXG4gIGlmIChsZW4gPT09IDApXG4gICAgcmV0dXJuXG5cbiAgLy8gaWYgdGhpcyBpcyB0aGUgbGFzdCByZW1haW5pbmcgcGF0dGVybiBiaXQsIHRoZW4gbm8gbmVlZCBmb3JcbiAgLy8gYW4gYWRkaXRpb25hbCBzdGF0ICp1bmxlc3MqIHRoZSB1c2VyIGhhcyBzcGVjaWZpZWQgbWFyayBvclxuICAvLyBzdGF0IGV4cGxpY2l0bHkuICBXZSBrbm93IHRoZXkgZXhpc3QsIHNpbmNlIHJlYWRkaXIgcmV0dXJuZWRcbiAgLy8gdGhlbS5cblxuICBpZiAocmVtYWluLmxlbmd0aCA9PT0gMSAmJiAhdGhpcy5tYXJrICYmICF0aGlzLnN0YXQpIHtcbiAgICBpZiAoIXRoaXMubWF0Y2hlc1tpbmRleF0pXG4gICAgICB0aGlzLm1hdGNoZXNbaW5kZXhdID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKyspIHtcbiAgICAgIHZhciBlID0gbWF0Y2hlZEVudHJpZXNbaV1cbiAgICAgIGlmIChwcmVmaXgpIHtcbiAgICAgICAgaWYgKHByZWZpeC5zbGljZSgtMSkgIT09ICcvJylcbiAgICAgICAgICBlID0gcHJlZml4ICsgJy8nICsgZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZSA9IHByZWZpeCArIGVcbiAgICAgIH1cblxuICAgICAgaWYgKGUuY2hhckF0KDApID09PSAnLycgJiYgIXRoaXMubm9tb3VudCkge1xuICAgICAgICBlID0gcGF0aC5qb2luKHRoaXMucm9vdCwgZSlcbiAgICAgIH1cbiAgICAgIHRoaXMuX2VtaXRNYXRjaChpbmRleCwgZSlcbiAgICB9XG4gICAgLy8gVGhpcyB3YXMgdGhlIGxhc3Qgb25lLCBhbmQgbm8gc3RhdHMgd2VyZSBuZWVkZWRcbiAgICByZXR1cm5cbiAgfVxuXG4gIC8vIG5vdyB0ZXN0IGFsbCBtYXRjaGVkIGVudHJpZXMgYXMgc3RhbmQtaW5zIGZvciB0aGF0IHBhcnRcbiAgLy8gb2YgdGhlIHBhdHRlcm4uXG4gIHJlbWFpbi5zaGlmdCgpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICsrKSB7XG4gICAgdmFyIGUgPSBtYXRjaGVkRW50cmllc1tpXVxuICAgIHZhciBuZXdQYXR0ZXJuXG4gICAgaWYgKHByZWZpeClcbiAgICAgIG5ld1BhdHRlcm4gPSBbcHJlZml4LCBlXVxuICAgIGVsc2VcbiAgICAgIG5ld1BhdHRlcm4gPSBbZV1cbiAgICB0aGlzLl9wcm9jZXNzKG5ld1BhdHRlcm4uY29uY2F0KHJlbWFpbiksIGluZGV4LCBpbkdsb2JTdGFyKVxuICB9XG59XG5cblxuR2xvYlN5bmMucHJvdG90eXBlLl9lbWl0TWF0Y2ggPSBmdW5jdGlvbiAoaW5kZXgsIGUpIHtcbiAgaWYgKGlzSWdub3JlZCh0aGlzLCBlKSlcbiAgICByZXR1cm5cblxuICB2YXIgYWJzID0gdGhpcy5fbWFrZUFicyhlKVxuXG4gIGlmICh0aGlzLm1hcmspXG4gICAgZSA9IHRoaXMuX21hcmsoZSlcblxuICBpZiAodGhpcy5hYnNvbHV0ZSkge1xuICAgIGUgPSBhYnNcbiAgfVxuXG4gIGlmICh0aGlzLm1hdGNoZXNbaW5kZXhdW2VdKVxuICAgIHJldHVyblxuXG4gIGlmICh0aGlzLm5vZGlyKSB7XG4gICAgdmFyIGMgPSB0aGlzLmNhY2hlW2Fic11cbiAgICBpZiAoYyA9PT0gJ0RJUicgfHwgQXJyYXkuaXNBcnJheShjKSlcbiAgICAgIHJldHVyblxuICB9XG5cbiAgdGhpcy5tYXRjaGVzW2luZGV4XVtlXSA9IHRydWVcblxuICBpZiAodGhpcy5zdGF0KVxuICAgIHRoaXMuX3N0YXQoZSlcbn1cblxuXG5HbG9iU3luYy5wcm90b3R5cGUuX3JlYWRkaXJJbkdsb2JTdGFyID0gZnVuY3Rpb24gKGFicykge1xuICAvLyBmb2xsb3cgYWxsIHN5bWxpbmtlZCBkaXJlY3RvcmllcyBmb3JldmVyXG4gIC8vIGp1c3QgcHJvY2VlZCBhcyBpZiB0aGlzIGlzIGEgbm9uLWdsb2JzdGFyIHNpdHVhdGlvblxuICBpZiAodGhpcy5mb2xsb3cpXG4gICAgcmV0dXJuIHRoaXMuX3JlYWRkaXIoYWJzLCBmYWxzZSlcblxuICB2YXIgZW50cmllc1xuICB2YXIgbHN0YXRcbiAgdmFyIHN0YXRcbiAgdHJ5IHtcbiAgICBsc3RhdCA9IHRoaXMuZnMubHN0YXRTeW5jKGFicylcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICBpZiAoZXIuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgIC8vIGxzdGF0IGZhaWxlZCwgZG9lc24ndCBleGlzdFxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuICB2YXIgaXNTeW0gPSBsc3RhdCAmJiBsc3RhdC5pc1N5bWJvbGljTGluaygpXG4gIHRoaXMuc3ltbGlua3NbYWJzXSA9IGlzU3ltXG5cbiAgLy8gSWYgaXQncyBub3QgYSBzeW1saW5rIG9yIGEgZGlyLCB0aGVuIGl0J3MgZGVmaW5pdGVseSBhIHJlZ3VsYXIgZmlsZS5cbiAgLy8gZG9uJ3QgYm90aGVyIGRvaW5nIGEgcmVhZGRpciBpbiB0aGF0IGNhc2UuXG4gIGlmICghaXNTeW0gJiYgbHN0YXQgJiYgIWxzdGF0LmlzRGlyZWN0b3J5KCkpXG4gICAgdGhpcy5jYWNoZVthYnNdID0gJ0ZJTEUnXG4gIGVsc2VcbiAgICBlbnRyaWVzID0gdGhpcy5fcmVhZGRpcihhYnMsIGZhbHNlKVxuXG4gIHJldHVybiBlbnRyaWVzXG59XG5cbkdsb2JTeW5jLnByb3RvdHlwZS5fcmVhZGRpciA9IGZ1bmN0aW9uIChhYnMsIGluR2xvYlN0YXIpIHtcbiAgdmFyIGVudHJpZXNcblxuICBpZiAoaW5HbG9iU3RhciAmJiAhb3duUHJvcCh0aGlzLnN5bWxpbmtzLCBhYnMpKVxuICAgIHJldHVybiB0aGlzLl9yZWFkZGlySW5HbG9iU3RhcihhYnMpXG5cbiAgaWYgKG93blByb3AodGhpcy5jYWNoZSwgYWJzKSkge1xuICAgIHZhciBjID0gdGhpcy5jYWNoZVthYnNdXG4gICAgaWYgKCFjIHx8IGMgPT09ICdGSUxFJylcbiAgICAgIHJldHVybiBudWxsXG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShjKSlcbiAgICAgIHJldHVybiBjXG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiB0aGlzLl9yZWFkZGlyRW50cmllcyhhYnMsIHRoaXMuZnMucmVhZGRpclN5bmMoYWJzKSlcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICB0aGlzLl9yZWFkZGlyRXJyb3IoYWJzLCBlcilcbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG5cbkdsb2JTeW5jLnByb3RvdHlwZS5fcmVhZGRpckVudHJpZXMgPSBmdW5jdGlvbiAoYWJzLCBlbnRyaWVzKSB7XG4gIC8vIGlmIHdlIGhhdmVuJ3QgYXNrZWQgdG8gc3RhdCBldmVyeXRoaW5nLCB0aGVuIGp1c3RcbiAgLy8gYXNzdW1lIHRoYXQgZXZlcnl0aGluZyBpbiB0aGVyZSBleGlzdHMsIHNvIHdlIGNhbiBhdm9pZFxuICAvLyBoYXZpbmcgdG8gc3RhdCBpdCBhIHNlY29uZCB0aW1lLlxuICBpZiAoIXRoaXMubWFyayAmJiAhdGhpcy5zdGF0KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnRyaWVzLmxlbmd0aDsgaSArKykge1xuICAgICAgdmFyIGUgPSBlbnRyaWVzW2ldXG4gICAgICBpZiAoYWJzID09PSAnLycpXG4gICAgICAgIGUgPSBhYnMgKyBlXG4gICAgICBlbHNlXG4gICAgICAgIGUgPSBhYnMgKyAnLycgKyBlXG4gICAgICB0aGlzLmNhY2hlW2VdID0gdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIHRoaXMuY2FjaGVbYWJzXSA9IGVudHJpZXNcblxuICAvLyBtYXJrIGFuZCBjYWNoZSBkaXItbmVzc1xuICByZXR1cm4gZW50cmllc1xufVxuXG5HbG9iU3luYy5wcm90b3R5cGUuX3JlYWRkaXJFcnJvciA9IGZ1bmN0aW9uIChmLCBlcikge1xuICAvLyBoYW5kbGUgZXJyb3JzLCBhbmQgY2FjaGUgdGhlIGluZm9ybWF0aW9uXG4gIHN3aXRjaCAoZXIuY29kZSkge1xuICAgIGNhc2UgJ0VOT1RTVVAnOiAvLyBodHRwczovL2dpdGh1Yi5jb20vaXNhYWNzL25vZGUtZ2xvYi9pc3N1ZXMvMjA1XG4gICAgY2FzZSAnRU5PVERJUic6IC8vIHRvdGFsbHkgbm9ybWFsLiBtZWFucyBpdCAqZG9lcyogZXhpc3QuXG4gICAgICB2YXIgYWJzID0gdGhpcy5fbWFrZUFicyhmKVxuICAgICAgdGhpcy5jYWNoZVthYnNdID0gJ0ZJTEUnXG4gICAgICBpZiAoYWJzID09PSB0aGlzLmN3ZEFicykge1xuICAgICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoZXIuY29kZSArICcgaW52YWxpZCBjd2QgJyArIHRoaXMuY3dkKVxuICAgICAgICBlcnJvci5wYXRoID0gdGhpcy5jd2RcbiAgICAgICAgZXJyb3IuY29kZSA9IGVyLmNvZGVcbiAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgIH1cbiAgICAgIGJyZWFrXG5cbiAgICBjYXNlICdFTk9FTlQnOiAvLyBub3QgdGVycmlibHkgdW51c3VhbFxuICAgIGNhc2UgJ0VMT09QJzpcbiAgICBjYXNlICdFTkFNRVRPT0xPTkcnOlxuICAgIGNhc2UgJ1VOS05PV04nOlxuICAgICAgdGhpcy5jYWNoZVt0aGlzLl9tYWtlQWJzKGYpXSA9IGZhbHNlXG4gICAgICBicmVha1xuXG4gICAgZGVmYXVsdDogLy8gc29tZSB1bnVzdWFsIGVycm9yLiAgVHJlYXQgYXMgZmFpbHVyZS5cbiAgICAgIHRoaXMuY2FjaGVbdGhpcy5fbWFrZUFicyhmKV0gPSBmYWxzZVxuICAgICAgaWYgKHRoaXMuc3RyaWN0KVxuICAgICAgICB0aHJvdyBlclxuICAgICAgaWYgKCF0aGlzLnNpbGVudClcbiAgICAgICAgY29uc29sZS5lcnJvcignZ2xvYiBlcnJvcicsIGVyKVxuICAgICAgYnJlYWtcbiAgfVxufVxuXG5HbG9iU3luYy5wcm90b3R5cGUuX3Byb2Nlc3NHbG9iU3RhciA9IGZ1bmN0aW9uIChwcmVmaXgsIHJlYWQsIGFicywgcmVtYWluLCBpbmRleCwgaW5HbG9iU3Rhcikge1xuXG4gIHZhciBlbnRyaWVzID0gdGhpcy5fcmVhZGRpcihhYnMsIGluR2xvYlN0YXIpXG5cbiAgLy8gbm8gZW50cmllcyBtZWFucyBub3QgYSBkaXIsIHNvIGl0IGNhbiBuZXZlciBoYXZlIG1hdGNoZXNcbiAgLy8gZm9vLnR4dC8qKiBkb2Vzbid0IG1hdGNoIGZvby50eHRcbiAgaWYgKCFlbnRyaWVzKVxuICAgIHJldHVyblxuXG4gIC8vIHRlc3Qgd2l0aG91dCB0aGUgZ2xvYnN0YXIsIGFuZCB3aXRoIGV2ZXJ5IGNoaWxkIGJvdGggYmVsb3dcbiAgLy8gYW5kIHJlcGxhY2luZyB0aGUgZ2xvYnN0YXIuXG4gIHZhciByZW1haW5XaXRob3V0R2xvYlN0YXIgPSByZW1haW4uc2xpY2UoMSlcbiAgdmFyIGdzcHJlZiA9IHByZWZpeCA/IFsgcHJlZml4IF0gOiBbXVxuICB2YXIgbm9HbG9iU3RhciA9IGdzcHJlZi5jb25jYXQocmVtYWluV2l0aG91dEdsb2JTdGFyKVxuXG4gIC8vIHRoZSBub0dsb2JTdGFyIHBhdHRlcm4gZXhpdHMgdGhlIGluR2xvYlN0YXIgc3RhdGVcbiAgdGhpcy5fcHJvY2Vzcyhub0dsb2JTdGFyLCBpbmRleCwgZmFsc2UpXG5cbiAgdmFyIGxlbiA9IGVudHJpZXMubGVuZ3RoXG4gIHZhciBpc1N5bSA9IHRoaXMuc3ltbGlua3NbYWJzXVxuXG4gIC8vIElmIGl0J3MgYSBzeW1saW5rLCBhbmQgd2UncmUgaW4gYSBnbG9ic3RhciwgdGhlbiBzdG9wXG4gIGlmIChpc1N5bSAmJiBpbkdsb2JTdGFyKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICB2YXIgZSA9IGVudHJpZXNbaV1cbiAgICBpZiAoZS5jaGFyQXQoMCkgPT09ICcuJyAmJiAhdGhpcy5kb3QpXG4gICAgICBjb250aW51ZVxuXG4gICAgLy8gdGhlc2UgdHdvIGNhc2VzIGVudGVyIHRoZSBpbkdsb2JTdGFyIHN0YXRlXG4gICAgdmFyIGluc3RlYWQgPSBnc3ByZWYuY29uY2F0KGVudHJpZXNbaV0sIHJlbWFpbldpdGhvdXRHbG9iU3RhcilcbiAgICB0aGlzLl9wcm9jZXNzKGluc3RlYWQsIGluZGV4LCB0cnVlKVxuXG4gICAgdmFyIGJlbG93ID0gZ3NwcmVmLmNvbmNhdChlbnRyaWVzW2ldLCByZW1haW4pXG4gICAgdGhpcy5fcHJvY2VzcyhiZWxvdywgaW5kZXgsIHRydWUpXG4gIH1cbn1cblxuR2xvYlN5bmMucHJvdG90eXBlLl9wcm9jZXNzU2ltcGxlID0gZnVuY3Rpb24gKHByZWZpeCwgaW5kZXgpIHtcbiAgLy8gWFhYIHJldmlldyB0aGlzLiAgU2hvdWxkbid0IGl0IGJlIGRvaW5nIHRoZSBtb3VudGluZyBldGNcbiAgLy8gYmVmb3JlIGRvaW5nIHN0YXQ/ICBraW5kYSB3ZWlyZD9cbiAgdmFyIGV4aXN0cyA9IHRoaXMuX3N0YXQocHJlZml4KVxuXG4gIGlmICghdGhpcy5tYXRjaGVzW2luZGV4XSlcbiAgICB0aGlzLm1hdGNoZXNbaW5kZXhdID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuXG4gIC8vIElmIGl0IGRvZXNuJ3QgZXhpc3QsIHRoZW4ganVzdCBtYXJrIHRoZSBsYWNrIG9mIHJlc3VsdHNcbiAgaWYgKCFleGlzdHMpXG4gICAgcmV0dXJuXG5cbiAgaWYgKHByZWZpeCAmJiBpc0Fic29sdXRlKHByZWZpeCkgJiYgIXRoaXMubm9tb3VudCkge1xuICAgIHZhciB0cmFpbCA9IC9bXFwvXFxcXF0kLy50ZXN0KHByZWZpeClcbiAgICBpZiAocHJlZml4LmNoYXJBdCgwKSA9PT0gJy8nKSB7XG4gICAgICBwcmVmaXggPSBwYXRoLmpvaW4odGhpcy5yb290LCBwcmVmaXgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHByZWZpeCA9IHBhdGgucmVzb2x2ZSh0aGlzLnJvb3QsIHByZWZpeClcbiAgICAgIGlmICh0cmFpbClcbiAgICAgICAgcHJlZml4ICs9ICcvJ1xuICAgIH1cbiAgfVxuXG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKVxuICAgIHByZWZpeCA9IHByZWZpeC5yZXBsYWNlKC9cXFxcL2csICcvJylcblxuICAvLyBNYXJrIHRoaXMgYXMgYSBtYXRjaFxuICB0aGlzLl9lbWl0TWF0Y2goaW5kZXgsIHByZWZpeClcbn1cblxuLy8gUmV0dXJucyBlaXRoZXIgJ0RJUicsICdGSUxFJywgb3IgZmFsc2Vcbkdsb2JTeW5jLnByb3RvdHlwZS5fc3RhdCA9IGZ1bmN0aW9uIChmKSB7XG4gIHZhciBhYnMgPSB0aGlzLl9tYWtlQWJzKGYpXG4gIHZhciBuZWVkRGlyID0gZi5zbGljZSgtMSkgPT09ICcvJ1xuXG4gIGlmIChmLmxlbmd0aCA+IHRoaXMubWF4TGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGlmICghdGhpcy5zdGF0ICYmIG93blByb3AodGhpcy5jYWNoZSwgYWJzKSkge1xuICAgIHZhciBjID0gdGhpcy5jYWNoZVthYnNdXG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShjKSlcbiAgICAgIGMgPSAnRElSJ1xuXG4gICAgLy8gSXQgZXhpc3RzLCBidXQgbWF5YmUgbm90IGhvdyB3ZSBuZWVkIGl0XG4gICAgaWYgKCFuZWVkRGlyIHx8IGMgPT09ICdESVInKVxuICAgICAgcmV0dXJuIGNcblxuICAgIGlmIChuZWVkRGlyICYmIGMgPT09ICdGSUxFJylcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgLy8gb3RoZXJ3aXNlIHdlIGhhdmUgdG8gc3RhdCwgYmVjYXVzZSBtYXliZSBjPXRydWVcbiAgICAvLyBpZiB3ZSBrbm93IGl0IGV4aXN0cywgYnV0IG5vdCB3aGF0IGl0IGlzLlxuICB9XG5cbiAgdmFyIGV4aXN0c1xuICB2YXIgc3RhdCA9IHRoaXMuc3RhdENhY2hlW2Fic11cbiAgaWYgKCFzdGF0KSB7XG4gICAgdmFyIGxzdGF0XG4gICAgdHJ5IHtcbiAgICAgIGxzdGF0ID0gdGhpcy5mcy5sc3RhdFN5bmMoYWJzKVxuICAgIH0gY2F0Y2ggKGVyKSB7XG4gICAgICBpZiAoZXIgJiYgKGVyLmNvZGUgPT09ICdFTk9FTlQnIHx8IGVyLmNvZGUgPT09ICdFTk9URElSJykpIHtcbiAgICAgICAgdGhpcy5zdGF0Q2FjaGVbYWJzXSA9IGZhbHNlXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChsc3RhdCAmJiBsc3RhdC5pc1N5bWJvbGljTGluaygpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBzdGF0ID0gdGhpcy5mcy5zdGF0U3luYyhhYnMpXG4gICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICBzdGF0ID0gbHN0YXRcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdCA9IGxzdGF0XG4gICAgfVxuICB9XG5cbiAgdGhpcy5zdGF0Q2FjaGVbYWJzXSA9IHN0YXRcblxuICB2YXIgYyA9IHRydWVcbiAgaWYgKHN0YXQpXG4gICAgYyA9IHN0YXQuaXNEaXJlY3RvcnkoKSA/ICdESVInIDogJ0ZJTEUnXG5cbiAgdGhpcy5jYWNoZVthYnNdID0gdGhpcy5jYWNoZVthYnNdIHx8IGNcblxuICBpZiAobmVlZERpciAmJiBjID09PSAnRklMRScpXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgcmV0dXJuIGNcbn1cblxuR2xvYlN5bmMucHJvdG90eXBlLl9tYXJrID0gZnVuY3Rpb24gKHApIHtcbiAgcmV0dXJuIGNvbW1vbi5tYXJrKHRoaXMsIHApXG59XG5cbkdsb2JTeW5jLnByb3RvdHlwZS5fbWFrZUFicyA9IGZ1bmN0aW9uIChmKSB7XG4gIHJldHVybiBjb21tb24ubWFrZUFicyh0aGlzLCBmKVxufVxuIiwidmFyIHdyYXBweSA9IHJlcXVpcmUoJ3dyYXBweScpXG52YXIgcmVxcyA9IE9iamVjdC5jcmVhdGUobnVsbClcbnZhciBvbmNlID0gcmVxdWlyZSgnb25jZScpXG5cbm1vZHVsZS5leHBvcnRzID0gd3JhcHB5KGluZmxpZ2h0KVxuXG5mdW5jdGlvbiBpbmZsaWdodCAoa2V5LCBjYikge1xuICBpZiAocmVxc1trZXldKSB7XG4gICAgcmVxc1trZXldLnB1c2goY2IpXG4gICAgcmV0dXJuIG51bGxcbiAgfSBlbHNlIHtcbiAgICByZXFzW2tleV0gPSBbY2JdXG4gICAgcmV0dXJuIG1ha2VyZXMoa2V5KVxuICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VyZXMgKGtleSkge1xuICByZXR1cm4gb25jZShmdW5jdGlvbiBSRVMgKCkge1xuICAgIHZhciBjYnMgPSByZXFzW2tleV1cbiAgICB2YXIgbGVuID0gY2JzLmxlbmd0aFxuICAgIHZhciBhcmdzID0gc2xpY2UoYXJndW1lbnRzKVxuXG4gICAgLy8gWFhYIEl0J3Mgc29tZXdoYXQgYW1iaWd1b3VzIHdoZXRoZXIgYSBuZXcgY2FsbGJhY2sgYWRkZWQgaW4gdGhpc1xuICAgIC8vIHBhc3Mgc2hvdWxkIGJlIHF1ZXVlZCBmb3IgbGF0ZXIgZXhlY3V0aW9uIGlmIHNvbWV0aGluZyBpbiB0aGVcbiAgICAvLyBsaXN0IG9mIGNhbGxiYWNrcyB0aHJvd3MsIG9yIGlmIGl0IHNob3VsZCBqdXN0IGJlIGRpc2NhcmRlZC5cbiAgICAvLyBIb3dldmVyLCBpdCdzIHN1Y2ggYW4gZWRnZSBjYXNlIHRoYXQgaXQgaGFyZGx5IG1hdHRlcnMsIGFuZCBlaXRoZXJcbiAgICAvLyBjaG9pY2UgaXMgbGlrZWx5IGFzIHN1cnByaXNpbmcgYXMgdGhlIG90aGVyLlxuICAgIC8vIEFzIGl0IGhhcHBlbnMsIHdlIGRvIGdvIGFoZWFkIGFuZCBzY2hlZHVsZSBpdCBmb3IgbGF0ZXIgZXhlY3V0aW9uLlxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGNic1tpXS5hcHBseShudWxsLCBhcmdzKVxuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoY2JzLmxlbmd0aCA+IGxlbikge1xuICAgICAgICAvLyBhZGRlZCBtb3JlIGluIHRoZSBpbnRlcmltLlxuICAgICAgICAvLyBkZS16YWxnbywganVzdCBpbiBjYXNlLCBidXQgZG9uJ3QgY2FsbCBhZ2Fpbi5cbiAgICAgICAgY2JzLnNwbGljZSgwLCBsZW4pXG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgIFJFUy5hcHBseShudWxsLCBhcmdzKVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVsZXRlIHJlcXNba2V5XVxuICAgICAgfVxuICAgIH1cbiAgfSlcbn1cblxuZnVuY3Rpb24gc2xpY2UgKGFyZ3MpIHtcbiAgdmFyIGxlbmd0aCA9IGFyZ3MubGVuZ3RoXG4gIHZhciBhcnJheSA9IFtdXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykgYXJyYXlbaV0gPSBhcmdzW2ldXG4gIHJldHVybiBhcnJheVxufVxuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgaWYgKHN1cGVyQ3Rvcikge1xuICAgICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBpZiAoc3VwZXJDdG9yKSB7XG4gICAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICAgIH1cbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBtaW5pbWF0Y2hcbm1pbmltYXRjaC5NaW5pbWF0Y2ggPSBNaW5pbWF0Y2hcblxudmFyIHBhdGggPSAoZnVuY3Rpb24gKCkgeyB0cnkgeyByZXR1cm4gcmVxdWlyZSgncGF0aCcpIH0gY2F0Y2ggKGUpIHt9fSgpKSB8fCB7XG4gIHNlcDogJy8nXG59XG5taW5pbWF0Y2guc2VwID0gcGF0aC5zZXBcblxudmFyIEdMT0JTVEFSID0gbWluaW1hdGNoLkdMT0JTVEFSID0gTWluaW1hdGNoLkdMT0JTVEFSID0ge31cbnZhciBleHBhbmQgPSByZXF1aXJlKCdicmFjZS1leHBhbnNpb24nKVxuXG52YXIgcGxUeXBlcyA9IHtcbiAgJyEnOiB7IG9wZW46ICcoPzooPyEoPzonLCBjbG9zZTogJykpW14vXSo/KSd9LFxuICAnPyc6IHsgb3BlbjogJyg/OicsIGNsb3NlOiAnKT8nIH0sXG4gICcrJzogeyBvcGVuOiAnKD86JywgY2xvc2U6ICcpKycgfSxcbiAgJyonOiB7IG9wZW46ICcoPzonLCBjbG9zZTogJykqJyB9LFxuICAnQCc6IHsgb3BlbjogJyg/OicsIGNsb3NlOiAnKScgfVxufVxuXG4vLyBhbnkgc2luZ2xlIHRoaW5nIG90aGVyIHRoYW4gL1xuLy8gZG9uJ3QgbmVlZCB0byBlc2NhcGUgLyB3aGVuIHVzaW5nIG5ldyBSZWdFeHAoKVxudmFyIHFtYXJrID0gJ1teL10nXG5cbi8vICogPT4gYW55IG51bWJlciBvZiBjaGFyYWN0ZXJzXG52YXIgc3RhciA9IHFtYXJrICsgJyo/J1xuXG4vLyAqKiB3aGVuIGRvdHMgYXJlIGFsbG93ZWQuICBBbnl0aGluZyBnb2VzLCBleGNlcHQgLi4gYW5kIC5cbi8vIG5vdCAoXiBvciAvIGZvbGxvd2VkIGJ5IG9uZSBvciB0d28gZG90cyBmb2xsb3dlZCBieSAkIG9yIC8pLFxuLy8gZm9sbG93ZWQgYnkgYW55dGhpbmcsIGFueSBudW1iZXIgb2YgdGltZXMuXG52YXIgdHdvU3RhckRvdCA9ICcoPzooPyEoPzpcXFxcXFwvfF4pKD86XFxcXC57MSwyfSkoJHxcXFxcXFwvKSkuKSo/J1xuXG4vLyBub3QgYSBeIG9yIC8gZm9sbG93ZWQgYnkgYSBkb3QsXG4vLyBmb2xsb3dlZCBieSBhbnl0aGluZywgYW55IG51bWJlciBvZiB0aW1lcy5cbnZhciB0d29TdGFyTm9Eb3QgPSAnKD86KD8hKD86XFxcXFxcL3xeKVxcXFwuKS4pKj8nXG5cbi8vIGNoYXJhY3RlcnMgdGhhdCBuZWVkIHRvIGJlIGVzY2FwZWQgaW4gUmVnRXhwLlxudmFyIHJlU3BlY2lhbHMgPSBjaGFyU2V0KCcoKS4qe30rP1tdXiRcXFxcIScpXG5cbi8vIFwiYWJjXCIgLT4geyBhOnRydWUsIGI6dHJ1ZSwgYzp0cnVlIH1cbmZ1bmN0aW9uIGNoYXJTZXQgKHMpIHtcbiAgcmV0dXJuIHMuc3BsaXQoJycpLnJlZHVjZShmdW5jdGlvbiAoc2V0LCBjKSB7XG4gICAgc2V0W2NdID0gdHJ1ZVxuICAgIHJldHVybiBzZXRcbiAgfSwge30pXG59XG5cbi8vIG5vcm1hbGl6ZXMgc2xhc2hlcy5cbnZhciBzbGFzaFNwbGl0ID0gL1xcLysvXG5cbm1pbmltYXRjaC5maWx0ZXIgPSBmaWx0ZXJcbmZ1bmN0aW9uIGZpbHRlciAocGF0dGVybiwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICByZXR1cm4gZnVuY3Rpb24gKHAsIGksIGxpc3QpIHtcbiAgICByZXR1cm4gbWluaW1hdGNoKHAsIHBhdHRlcm4sIG9wdGlvbnMpXG4gIH1cbn1cblxuZnVuY3Rpb24gZXh0IChhLCBiKSB7XG4gIGIgPSBiIHx8IHt9XG4gIHZhciB0ID0ge31cbiAgT2JqZWN0LmtleXMoYSkuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgIHRba10gPSBhW2tdXG4gIH0pXG4gIE9iamVjdC5rZXlzKGIpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICB0W2tdID0gYltrXVxuICB9KVxuICByZXR1cm4gdFxufVxuXG5taW5pbWF0Y2guZGVmYXVsdHMgPSBmdW5jdGlvbiAoZGVmKSB7XG4gIGlmICghZGVmIHx8IHR5cGVvZiBkZWYgIT09ICdvYmplY3QnIHx8ICFPYmplY3Qua2V5cyhkZWYpLmxlbmd0aCkge1xuICAgIHJldHVybiBtaW5pbWF0Y2hcbiAgfVxuXG4gIHZhciBvcmlnID0gbWluaW1hdGNoXG5cbiAgdmFyIG0gPSBmdW5jdGlvbiBtaW5pbWF0Y2ggKHAsIHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gb3JpZyhwLCBwYXR0ZXJuLCBleHQoZGVmLCBvcHRpb25zKSlcbiAgfVxuXG4gIG0uTWluaW1hdGNoID0gZnVuY3Rpb24gTWluaW1hdGNoIChwYXR0ZXJuLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBvcmlnLk1pbmltYXRjaChwYXR0ZXJuLCBleHQoZGVmLCBvcHRpb25zKSlcbiAgfVxuICBtLk1pbmltYXRjaC5kZWZhdWx0cyA9IGZ1bmN0aW9uIGRlZmF1bHRzIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIG9yaWcuZGVmYXVsdHMoZXh0KGRlZiwgb3B0aW9ucykpLk1pbmltYXRjaFxuICB9XG5cbiAgbS5maWx0ZXIgPSBmdW5jdGlvbiBmaWx0ZXIgKHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gb3JpZy5maWx0ZXIocGF0dGVybiwgZXh0KGRlZiwgb3B0aW9ucykpXG4gIH1cblxuICBtLmRlZmF1bHRzID0gZnVuY3Rpb24gZGVmYXVsdHMgKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gb3JpZy5kZWZhdWx0cyhleHQoZGVmLCBvcHRpb25zKSlcbiAgfVxuXG4gIG0ubWFrZVJlID0gZnVuY3Rpb24gbWFrZVJlIChwYXR0ZXJuLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG9yaWcubWFrZVJlKHBhdHRlcm4sIGV4dChkZWYsIG9wdGlvbnMpKVxuICB9XG5cbiAgbS5icmFjZUV4cGFuZCA9IGZ1bmN0aW9uIGJyYWNlRXhwYW5kIChwYXR0ZXJuLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG9yaWcuYnJhY2VFeHBhbmQocGF0dGVybiwgZXh0KGRlZiwgb3B0aW9ucykpXG4gIH1cblxuICBtLm1hdGNoID0gZnVuY3Rpb24gKGxpc3QsIHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gb3JpZy5tYXRjaChsaXN0LCBwYXR0ZXJuLCBleHQoZGVmLCBvcHRpb25zKSlcbiAgfVxuXG4gIHJldHVybiBtXG59XG5cbk1pbmltYXRjaC5kZWZhdWx0cyA9IGZ1bmN0aW9uIChkZWYpIHtcbiAgcmV0dXJuIG1pbmltYXRjaC5kZWZhdWx0cyhkZWYpLk1pbmltYXRjaFxufVxuXG5mdW5jdGlvbiBtaW5pbWF0Y2ggKHAsIHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgYXNzZXJ0VmFsaWRQYXR0ZXJuKHBhdHRlcm4pXG5cbiAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge31cblxuICAvLyBzaG9ydGN1dDogY29tbWVudHMgbWF0Y2ggbm90aGluZy5cbiAgaWYgKCFvcHRpb25zLm5vY29tbWVudCAmJiBwYXR0ZXJuLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gbmV3IE1pbmltYXRjaChwYXR0ZXJuLCBvcHRpb25zKS5tYXRjaChwKVxufVxuXG5mdW5jdGlvbiBNaW5pbWF0Y2ggKHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIE1pbmltYXRjaCkpIHtcbiAgICByZXR1cm4gbmV3IE1pbmltYXRjaChwYXR0ZXJuLCBvcHRpb25zKVxuICB9XG5cbiAgYXNzZXJ0VmFsaWRQYXR0ZXJuKHBhdHRlcm4pXG5cbiAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge31cblxuICBwYXR0ZXJuID0gcGF0dGVybi50cmltKClcblxuICAvLyB3aW5kb3dzIHN1cHBvcnQ6IG5lZWQgdG8gdXNlIC8sIG5vdCBcXFxuICBpZiAoIW9wdGlvbnMuYWxsb3dXaW5kb3dzRXNjYXBlICYmIHBhdGguc2VwICE9PSAnLycpIHtcbiAgICBwYXR0ZXJuID0gcGF0dGVybi5zcGxpdChwYXRoLnNlcCkuam9pbignLycpXG4gIH1cblxuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gIHRoaXMuc2V0ID0gW11cbiAgdGhpcy5wYXR0ZXJuID0gcGF0dGVyblxuICB0aGlzLnJlZ2V4cCA9IG51bGxcbiAgdGhpcy5uZWdhdGUgPSBmYWxzZVxuICB0aGlzLmNvbW1lbnQgPSBmYWxzZVxuICB0aGlzLmVtcHR5ID0gZmFsc2VcbiAgdGhpcy5wYXJ0aWFsID0gISFvcHRpb25zLnBhcnRpYWxcblxuICAvLyBtYWtlIHRoZSBzZXQgb2YgcmVnZXhwcyBldGMuXG4gIHRoaXMubWFrZSgpXG59XG5cbk1pbmltYXRjaC5wcm90b3R5cGUuZGVidWcgPSBmdW5jdGlvbiAoKSB7fVxuXG5NaW5pbWF0Y2gucHJvdG90eXBlLm1ha2UgPSBtYWtlXG5mdW5jdGlvbiBtYWtlICgpIHtcbiAgdmFyIHBhdHRlcm4gPSB0aGlzLnBhdHRlcm5cbiAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnNcblxuICAvLyBlbXB0eSBwYXR0ZXJucyBhbmQgY29tbWVudHMgbWF0Y2ggbm90aGluZy5cbiAgaWYgKCFvcHRpb25zLm5vY29tbWVudCAmJiBwYXR0ZXJuLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgdGhpcy5jb21tZW50ID0gdHJ1ZVxuICAgIHJldHVyblxuICB9XG4gIGlmICghcGF0dGVybikge1xuICAgIHRoaXMuZW1wdHkgPSB0cnVlXG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBzdGVwIDE6IGZpZ3VyZSBvdXQgbmVnYXRpb24sIGV0Yy5cbiAgdGhpcy5wYXJzZU5lZ2F0ZSgpXG5cbiAgLy8gc3RlcCAyOiBleHBhbmQgYnJhY2VzXG4gIHZhciBzZXQgPSB0aGlzLmdsb2JTZXQgPSB0aGlzLmJyYWNlRXhwYW5kKClcblxuICBpZiAob3B0aW9ucy5kZWJ1ZykgdGhpcy5kZWJ1ZyA9IGZ1bmN0aW9uIGRlYnVnKCkgeyBjb25zb2xlLmVycm9yLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cykgfVxuXG4gIHRoaXMuZGVidWcodGhpcy5wYXR0ZXJuLCBzZXQpXG5cbiAgLy8gc3RlcCAzOiBub3cgd2UgaGF2ZSBhIHNldCwgc28gdHVybiBlYWNoIG9uZSBpbnRvIGEgc2VyaWVzIG9mIHBhdGgtcG9ydGlvblxuICAvLyBtYXRjaGluZyBwYXR0ZXJucy5cbiAgLy8gVGhlc2Ugd2lsbCBiZSByZWdleHBzLCBleGNlcHQgaW4gdGhlIGNhc2Ugb2YgXCIqKlwiLCB3aGljaCBpc1xuICAvLyBzZXQgdG8gdGhlIEdMT0JTVEFSIG9iamVjdCBmb3IgZ2xvYnN0YXIgYmVoYXZpb3IsXG4gIC8vIGFuZCB3aWxsIG5vdCBjb250YWluIGFueSAvIGNoYXJhY3RlcnNcbiAgc2V0ID0gdGhpcy5nbG9iUGFydHMgPSBzZXQubWFwKGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHMuc3BsaXQoc2xhc2hTcGxpdClcbiAgfSlcblxuICB0aGlzLmRlYnVnKHRoaXMucGF0dGVybiwgc2V0KVxuXG4gIC8vIGdsb2IgLS0+IHJlZ2V4cHNcbiAgc2V0ID0gc2V0Lm1hcChmdW5jdGlvbiAocywgc2ksIHNldCkge1xuICAgIHJldHVybiBzLm1hcCh0aGlzLnBhcnNlLCB0aGlzKVxuICB9LCB0aGlzKVxuXG4gIHRoaXMuZGVidWcodGhpcy5wYXR0ZXJuLCBzZXQpXG5cbiAgLy8gZmlsdGVyIG91dCBldmVyeXRoaW5nIHRoYXQgZGlkbid0IGNvbXBpbGUgcHJvcGVybHkuXG4gIHNldCA9IHNldC5maWx0ZXIoZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gcy5pbmRleE9mKGZhbHNlKSA9PT0gLTFcbiAgfSlcblxuICB0aGlzLmRlYnVnKHRoaXMucGF0dGVybiwgc2V0KVxuXG4gIHRoaXMuc2V0ID0gc2V0XG59XG5cbk1pbmltYXRjaC5wcm90b3R5cGUucGFyc2VOZWdhdGUgPSBwYXJzZU5lZ2F0ZVxuZnVuY3Rpb24gcGFyc2VOZWdhdGUgKCkge1xuICB2YXIgcGF0dGVybiA9IHRoaXMucGF0dGVyblxuICB2YXIgbmVnYXRlID0gZmFsc2VcbiAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnNcbiAgdmFyIG5lZ2F0ZU9mZnNldCA9IDBcblxuICBpZiAob3B0aW9ucy5ub25lZ2F0ZSkgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBwYXR0ZXJuLmxlbmd0aFxuICAgIDsgaSA8IGwgJiYgcGF0dGVybi5jaGFyQXQoaSkgPT09ICchJ1xuICAgIDsgaSsrKSB7XG4gICAgbmVnYXRlID0gIW5lZ2F0ZVxuICAgIG5lZ2F0ZU9mZnNldCsrXG4gIH1cblxuICBpZiAobmVnYXRlT2Zmc2V0KSB0aGlzLnBhdHRlcm4gPSBwYXR0ZXJuLnN1YnN0cihuZWdhdGVPZmZzZXQpXG4gIHRoaXMubmVnYXRlID0gbmVnYXRlXG59XG5cbi8vIEJyYWNlIGV4cGFuc2lvbjpcbi8vIGF7YixjfWQgLT4gYWJkIGFjZFxuLy8gYXtiLH1jIC0+IGFiYyBhY1xuLy8gYXswLi4zfWQgLT4gYTBkIGExZCBhMmQgYTNkXG4vLyBhe2IsY3tkLGV9Zn1nIC0+IGFiZyBhY2RmZyBhY2VmZ1xuLy8gYXtiLGN9ZHtlLGZ9ZyAtPiBhYmRlZyBhY2RlZyBhYmRlZyBhYmRmZ1xuLy9cbi8vIEludmFsaWQgc2V0cyBhcmUgbm90IGV4cGFuZGVkLlxuLy8gYXsyLi59YiAtPiBhezIuLn1iXG4vLyBhe2J9YyAtPiBhe2J9Y1xubWluaW1hdGNoLmJyYWNlRXhwYW5kID0gZnVuY3Rpb24gKHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGJyYWNlRXhwYW5kKHBhdHRlcm4sIG9wdGlvbnMpXG59XG5cbk1pbmltYXRjaC5wcm90b3R5cGUuYnJhY2VFeHBhbmQgPSBicmFjZUV4cGFuZFxuXG5mdW5jdGlvbiBicmFjZUV4cGFuZCAocGF0dGVybiwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMpIHtcbiAgICBpZiAodGhpcyBpbnN0YW5jZW9mIE1pbmltYXRjaCkge1xuICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9uc1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHRpb25zID0ge31cbiAgICB9XG4gIH1cblxuICBwYXR0ZXJuID0gdHlwZW9mIHBhdHRlcm4gPT09ICd1bmRlZmluZWQnXG4gICAgPyB0aGlzLnBhdHRlcm4gOiBwYXR0ZXJuXG5cbiAgYXNzZXJ0VmFsaWRQYXR0ZXJuKHBhdHRlcm4pXG5cbiAgLy8gVGhhbmtzIHRvIFlldGluZyBMaSA8aHR0cHM6Ly9naXRodWIuY29tL3lldGluZ2xpPiBmb3JcbiAgLy8gaW1wcm92aW5nIHRoaXMgcmVnZXhwIHRvIGF2b2lkIGEgUmVET1MgdnVsbmVyYWJpbGl0eS5cbiAgaWYgKG9wdGlvbnMubm9icmFjZSB8fCAhL1xceyg/Oig/IVxceykuKSpcXH0vLnRlc3QocGF0dGVybikpIHtcbiAgICAvLyBzaG9ydGN1dC4gbm8gbmVlZCB0byBleHBhbmQuXG4gICAgcmV0dXJuIFtwYXR0ZXJuXVxuICB9XG5cbiAgcmV0dXJuIGV4cGFuZChwYXR0ZXJuKVxufVxuXG52YXIgTUFYX1BBVFRFUk5fTEVOR1RIID0gMTAyNCAqIDY0XG52YXIgYXNzZXJ0VmFsaWRQYXR0ZXJuID0gZnVuY3Rpb24gKHBhdHRlcm4pIHtcbiAgaWYgKHR5cGVvZiBwYXR0ZXJuICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2ludmFsaWQgcGF0dGVybicpXG4gIH1cblxuICBpZiAocGF0dGVybi5sZW5ndGggPiBNQVhfUEFUVEVSTl9MRU5HVEgpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdwYXR0ZXJuIGlzIHRvbyBsb25nJylcbiAgfVxufVxuXG4vLyBwYXJzZSBhIGNvbXBvbmVudCBvZiB0aGUgZXhwYW5kZWQgc2V0LlxuLy8gQXQgdGhpcyBwb2ludCwgbm8gcGF0dGVybiBtYXkgY29udGFpbiBcIi9cIiBpbiBpdFxuLy8gc28gd2UncmUgZ29pbmcgdG8gcmV0dXJuIGEgMmQgYXJyYXksIHdoZXJlIGVhY2ggZW50cnkgaXMgdGhlIGZ1bGxcbi8vIHBhdHRlcm4sIHNwbGl0IG9uICcvJywgYW5kIHRoZW4gdHVybmVkIGludG8gYSByZWd1bGFyIGV4cHJlc3Npb24uXG4vLyBBIHJlZ2V4cCBpcyBtYWRlIGF0IHRoZSBlbmQgd2hpY2ggam9pbnMgZWFjaCBhcnJheSB3aXRoIGFuXG4vLyBlc2NhcGVkIC8sIGFuZCBhbm90aGVyIGZ1bGwgb25lIHdoaWNoIGpvaW5zIGVhY2ggcmVnZXhwIHdpdGggfC5cbi8vXG4vLyBGb2xsb3dpbmcgdGhlIGxlYWQgb2YgQmFzaCA0LjEsIG5vdGUgdGhhdCBcIioqXCIgb25seSBoYXMgc3BlY2lhbCBtZWFuaW5nXG4vLyB3aGVuIGl0IGlzIHRoZSAqb25seSogdGhpbmcgaW4gYSBwYXRoIHBvcnRpb24uICBPdGhlcndpc2UsIGFueSBzZXJpZXNcbi8vIG9mICogaXMgZXF1aXZhbGVudCB0byBhIHNpbmdsZSAqLiAgR2xvYnN0YXIgYmVoYXZpb3IgaXMgZW5hYmxlZCBieVxuLy8gZGVmYXVsdCwgYW5kIGNhbiBiZSBkaXNhYmxlZCBieSBzZXR0aW5nIG9wdGlvbnMubm9nbG9ic3Rhci5cbk1pbmltYXRjaC5wcm90b3R5cGUucGFyc2UgPSBwYXJzZVxudmFyIFNVQlBBUlNFID0ge31cbmZ1bmN0aW9uIHBhcnNlIChwYXR0ZXJuLCBpc1N1Yikge1xuICBhc3NlcnRWYWxpZFBhdHRlcm4ocGF0dGVybilcblxuICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9uc1xuXG4gIC8vIHNob3J0Y3V0c1xuICBpZiAocGF0dGVybiA9PT0gJyoqJykge1xuICAgIGlmICghb3B0aW9ucy5ub2dsb2JzdGFyKVxuICAgICAgcmV0dXJuIEdMT0JTVEFSXG4gICAgZWxzZVxuICAgICAgcGF0dGVybiA9ICcqJ1xuICB9XG4gIGlmIChwYXR0ZXJuID09PSAnJykgcmV0dXJuICcnXG5cbiAgdmFyIHJlID0gJydcbiAgdmFyIGhhc01hZ2ljID0gISFvcHRpb25zLm5vY2FzZVxuICB2YXIgZXNjYXBpbmcgPSBmYWxzZVxuICAvLyA/ID0+IG9uZSBzaW5nbGUgY2hhcmFjdGVyXG4gIHZhciBwYXR0ZXJuTGlzdFN0YWNrID0gW11cbiAgdmFyIG5lZ2F0aXZlTGlzdHMgPSBbXVxuICB2YXIgc3RhdGVDaGFyXG4gIHZhciBpbkNsYXNzID0gZmFsc2VcbiAgdmFyIHJlQ2xhc3NTdGFydCA9IC0xXG4gIHZhciBjbGFzc1N0YXJ0ID0gLTFcbiAgLy8gLiBhbmQgLi4gbmV2ZXIgbWF0Y2ggYW55dGhpbmcgdGhhdCBkb2Vzbid0IHN0YXJ0IHdpdGggLixcbiAgLy8gZXZlbiB3aGVuIG9wdGlvbnMuZG90IGlzIHNldC5cbiAgdmFyIHBhdHRlcm5TdGFydCA9IHBhdHRlcm4uY2hhckF0KDApID09PSAnLicgPyAnJyAvLyBhbnl0aGluZ1xuICAvLyBub3QgKHN0YXJ0IG9yIC8gZm9sbG93ZWQgYnkgLiBvciAuLiBmb2xsb3dlZCBieSAvIG9yIGVuZClcbiAgOiBvcHRpb25zLmRvdCA/ICcoPyEoPzpefFxcXFxcXC8pXFxcXC57MSwyfSg/OiR8XFxcXFxcLykpJ1xuICA6ICcoPyFcXFxcLiknXG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIGZ1bmN0aW9uIGNsZWFyU3RhdGVDaGFyICgpIHtcbiAgICBpZiAoc3RhdGVDaGFyKSB7XG4gICAgICAvLyB3ZSBoYWQgc29tZSBzdGF0ZS10cmFja2luZyBjaGFyYWN0ZXJcbiAgICAgIC8vIHRoYXQgd2Fzbid0IGNvbnN1bWVkIGJ5IHRoaXMgcGFzcy5cbiAgICAgIHN3aXRjaCAoc3RhdGVDaGFyKSB7XG4gICAgICAgIGNhc2UgJyonOlxuICAgICAgICAgIHJlICs9IHN0YXJcbiAgICAgICAgICBoYXNNYWdpYyA9IHRydWVcbiAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnPyc6XG4gICAgICAgICAgcmUgKz0gcW1hcmtcbiAgICAgICAgICBoYXNNYWdpYyA9IHRydWVcbiAgICAgICAgYnJlYWtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZSArPSAnXFxcXCcgKyBzdGF0ZUNoYXJcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIHNlbGYuZGVidWcoJ2NsZWFyU3RhdGVDaGFyICVqICVqJywgc3RhdGVDaGFyLCByZSlcbiAgICAgIHN0YXRlQ2hhciA9IGZhbHNlXG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhdHRlcm4ubGVuZ3RoLCBjXG4gICAgOyAoaSA8IGxlbikgJiYgKGMgPSBwYXR0ZXJuLmNoYXJBdChpKSlcbiAgICA7IGkrKykge1xuICAgIHRoaXMuZGVidWcoJyVzXFx0JXMgJXMgJWonLCBwYXR0ZXJuLCBpLCByZSwgYylcblxuICAgIC8vIHNraXAgb3ZlciBhbnkgdGhhdCBhcmUgZXNjYXBlZC5cbiAgICBpZiAoZXNjYXBpbmcgJiYgcmVTcGVjaWFsc1tjXSkge1xuICAgICAgcmUgKz0gJ1xcXFwnICsgY1xuICAgICAgZXNjYXBpbmcgPSBmYWxzZVxuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICBzd2l0Y2ggKGMpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICBjYXNlICcvJzoge1xuICAgICAgICAvLyBjb21wbGV0ZWx5IG5vdCBhbGxvd2VkLCBldmVuIGVzY2FwZWQuXG4gICAgICAgIC8vIFNob3VsZCBhbHJlYWR5IGJlIHBhdGgtc3BsaXQgYnkgbm93LlxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cblxuICAgICAgY2FzZSAnXFxcXCc6XG4gICAgICAgIGNsZWFyU3RhdGVDaGFyKClcbiAgICAgICAgZXNjYXBpbmcgPSB0cnVlXG4gICAgICBjb250aW51ZVxuXG4gICAgICAvLyB0aGUgdmFyaW91cyBzdGF0ZUNoYXIgdmFsdWVzXG4gICAgICAvLyBmb3IgdGhlIFwiZXh0Z2xvYlwiIHN0dWZmLlxuICAgICAgY2FzZSAnPyc6XG4gICAgICBjYXNlICcqJzpcbiAgICAgIGNhc2UgJysnOlxuICAgICAgY2FzZSAnQCc6XG4gICAgICBjYXNlICchJzpcbiAgICAgICAgdGhpcy5kZWJ1ZygnJXNcXHQlcyAlcyAlaiA8LS0gc3RhdGVDaGFyJywgcGF0dGVybiwgaSwgcmUsIGMpXG5cbiAgICAgICAgLy8gYWxsIG9mIHRob3NlIGFyZSBsaXRlcmFscyBpbnNpZGUgYSBjbGFzcywgZXhjZXB0IHRoYXRcbiAgICAgICAgLy8gdGhlIGdsb2IgWyFhXSBtZWFucyBbXmFdIGluIHJlZ2V4cFxuICAgICAgICBpZiAoaW5DbGFzcykge1xuICAgICAgICAgIHRoaXMuZGVidWcoJyAgaW4gY2xhc3MnKVxuICAgICAgICAgIGlmIChjID09PSAnIScgJiYgaSA9PT0gY2xhc3NTdGFydCArIDEpIGMgPSAnXidcbiAgICAgICAgICByZSArPSBjXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIHdlIGFscmVhZHkgaGF2ZSBhIHN0YXRlQ2hhciwgdGhlbiBpdCBtZWFuc1xuICAgICAgICAvLyB0aGF0IHRoZXJlIHdhcyBzb21ldGhpbmcgbGlrZSAqKiBvciArPyBpbiB0aGVyZS5cbiAgICAgICAgLy8gSGFuZGxlIHRoZSBzdGF0ZUNoYXIsIHRoZW4gcHJvY2VlZCB3aXRoIHRoaXMgb25lLlxuICAgICAgICBzZWxmLmRlYnVnKCdjYWxsIGNsZWFyU3RhdGVDaGFyICVqJywgc3RhdGVDaGFyKVxuICAgICAgICBjbGVhclN0YXRlQ2hhcigpXG4gICAgICAgIHN0YXRlQ2hhciA9IGNcbiAgICAgICAgLy8gaWYgZXh0Z2xvYiBpcyBkaXNhYmxlZCwgdGhlbiArKGFzZGZ8Zm9vKSBpc24ndCBhIHRoaW5nLlxuICAgICAgICAvLyBqdXN0IGNsZWFyIHRoZSBzdGF0ZWNoYXIgKm5vdyosIHJhdGhlciB0aGFuIGV2ZW4gZGl2aW5nIGludG9cbiAgICAgICAgLy8gdGhlIHBhdHRlcm5MaXN0IHN0dWZmLlxuICAgICAgICBpZiAob3B0aW9ucy5ub2V4dCkgY2xlYXJTdGF0ZUNoYXIoKVxuICAgICAgY29udGludWVcblxuICAgICAgY2FzZSAnKCc6XG4gICAgICAgIGlmIChpbkNsYXNzKSB7XG4gICAgICAgICAgcmUgKz0gJygnXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc3RhdGVDaGFyKSB7XG4gICAgICAgICAgcmUgKz0gJ1xcXFwoJ1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICBwYXR0ZXJuTGlzdFN0YWNrLnB1c2goe1xuICAgICAgICAgIHR5cGU6IHN0YXRlQ2hhcixcbiAgICAgICAgICBzdGFydDogaSAtIDEsXG4gICAgICAgICAgcmVTdGFydDogcmUubGVuZ3RoLFxuICAgICAgICAgIG9wZW46IHBsVHlwZXNbc3RhdGVDaGFyXS5vcGVuLFxuICAgICAgICAgIGNsb3NlOiBwbFR5cGVzW3N0YXRlQ2hhcl0uY2xvc2VcbiAgICAgICAgfSlcbiAgICAgICAgLy8gbmVnYXRpb24gaXMgKD86KD8hanMpW14vXSopXG4gICAgICAgIHJlICs9IHN0YXRlQ2hhciA9PT0gJyEnID8gJyg/Oig/ISg/OicgOiAnKD86J1xuICAgICAgICB0aGlzLmRlYnVnKCdwbFR5cGUgJWogJWonLCBzdGF0ZUNoYXIsIHJlKVxuICAgICAgICBzdGF0ZUNoYXIgPSBmYWxzZVxuICAgICAgY29udGludWVcblxuICAgICAgY2FzZSAnKSc6XG4gICAgICAgIGlmIChpbkNsYXNzIHx8ICFwYXR0ZXJuTGlzdFN0YWNrLmxlbmd0aCkge1xuICAgICAgICAgIHJlICs9ICdcXFxcKSdcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgY2xlYXJTdGF0ZUNoYXIoKVxuICAgICAgICBoYXNNYWdpYyA9IHRydWVcbiAgICAgICAgdmFyIHBsID0gcGF0dGVybkxpc3RTdGFjay5wb3AoKVxuICAgICAgICAvLyBuZWdhdGlvbiBpcyAoPzooPyFqcylbXi9dKilcbiAgICAgICAgLy8gVGhlIG90aGVycyBhcmUgKD86PHBhdHRlcm4+KTx0eXBlPlxuICAgICAgICByZSArPSBwbC5jbG9zZVxuICAgICAgICBpZiAocGwudHlwZSA9PT0gJyEnKSB7XG4gICAgICAgICAgbmVnYXRpdmVMaXN0cy5wdXNoKHBsKVxuICAgICAgICB9XG4gICAgICAgIHBsLnJlRW5kID0gcmUubGVuZ3RoXG4gICAgICBjb250aW51ZVxuXG4gICAgICBjYXNlICd8JzpcbiAgICAgICAgaWYgKGluQ2xhc3MgfHwgIXBhdHRlcm5MaXN0U3RhY2subGVuZ3RoIHx8IGVzY2FwaW5nKSB7XG4gICAgICAgICAgcmUgKz0gJ1xcXFx8J1xuICAgICAgICAgIGVzY2FwaW5nID0gZmFsc2VcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgY2xlYXJTdGF0ZUNoYXIoKVxuICAgICAgICByZSArPSAnfCdcbiAgICAgIGNvbnRpbnVlXG5cbiAgICAgIC8vIHRoZXNlIGFyZSBtb3N0bHkgdGhlIHNhbWUgaW4gcmVnZXhwIGFuZCBnbG9iXG4gICAgICBjYXNlICdbJzpcbiAgICAgICAgLy8gc3dhbGxvdyBhbnkgc3RhdGUtdHJhY2tpbmcgY2hhciBiZWZvcmUgdGhlIFtcbiAgICAgICAgY2xlYXJTdGF0ZUNoYXIoKVxuXG4gICAgICAgIGlmIChpbkNsYXNzKSB7XG4gICAgICAgICAgcmUgKz0gJ1xcXFwnICsgY1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICBpbkNsYXNzID0gdHJ1ZVxuICAgICAgICBjbGFzc1N0YXJ0ID0gaVxuICAgICAgICByZUNsYXNzU3RhcnQgPSByZS5sZW5ndGhcbiAgICAgICAgcmUgKz0gY1xuICAgICAgY29udGludWVcblxuICAgICAgY2FzZSAnXSc6XG4gICAgICAgIC8vICBhIHJpZ2h0IGJyYWNrZXQgc2hhbGwgbG9zZSBpdHMgc3BlY2lhbFxuICAgICAgICAvLyAgbWVhbmluZyBhbmQgcmVwcmVzZW50IGl0c2VsZiBpblxuICAgICAgICAvLyAgYSBicmFja2V0IGV4cHJlc3Npb24gaWYgaXQgb2NjdXJzXG4gICAgICAgIC8vICBmaXJzdCBpbiB0aGUgbGlzdC4gIC0tIFBPU0lYLjIgMi44LjMuMlxuICAgICAgICBpZiAoaSA9PT0gY2xhc3NTdGFydCArIDEgfHwgIWluQ2xhc3MpIHtcbiAgICAgICAgICByZSArPSAnXFxcXCcgKyBjXG4gICAgICAgICAgZXNjYXBpbmcgPSBmYWxzZVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyBoYW5kbGUgdGhlIGNhc2Ugd2hlcmUgd2UgbGVmdCBhIGNsYXNzIG9wZW4uXG4gICAgICAgIC8vIFwiW3otYV1cIiBpcyB2YWxpZCwgZXF1aXZhbGVudCB0byBcIlxcW3otYVxcXVwiXG4gICAgICAgIC8vIHNwbGl0IHdoZXJlIHRoZSBsYXN0IFsgd2FzLCBtYWtlIHN1cmUgd2UgZG9uJ3QgaGF2ZVxuICAgICAgICAvLyBhbiBpbnZhbGlkIHJlLiBpZiBzbywgcmUtd2FsayB0aGUgY29udGVudHMgb2YgdGhlXG4gICAgICAgIC8vIHdvdWxkLWJlIGNsYXNzIHRvIHJlLXRyYW5zbGF0ZSBhbnkgY2hhcmFjdGVycyB0aGF0XG4gICAgICAgIC8vIHdlcmUgcGFzc2VkIHRocm91Z2ggYXMtaXNcbiAgICAgICAgLy8gVE9ETzogSXQgd291bGQgcHJvYmFibHkgYmUgZmFzdGVyIHRvIGRldGVybWluZSB0aGlzXG4gICAgICAgIC8vIHdpdGhvdXQgYSB0cnkvY2F0Y2ggYW5kIGEgbmV3IFJlZ0V4cCwgYnV0IGl0J3MgdHJpY2t5XG4gICAgICAgIC8vIHRvIGRvIHNhZmVseS4gIEZvciBub3csIHRoaXMgaXMgc2FmZSBhbmQgd29ya3MuXG4gICAgICAgIHZhciBjcyA9IHBhdHRlcm4uc3Vic3RyaW5nKGNsYXNzU3RhcnQgKyAxLCBpKVxuICAgICAgICB0cnkge1xuICAgICAgICAgIFJlZ0V4cCgnWycgKyBjcyArICddJylcbiAgICAgICAgfSBjYXRjaCAoZXIpIHtcbiAgICAgICAgICAvLyBub3QgYSB2YWxpZCBjbGFzcyFcbiAgICAgICAgICB2YXIgc3AgPSB0aGlzLnBhcnNlKGNzLCBTVUJQQVJTRSlcbiAgICAgICAgICByZSA9IHJlLnN1YnN0cigwLCByZUNsYXNzU3RhcnQpICsgJ1xcXFxbJyArIHNwWzBdICsgJ1xcXFxdJ1xuICAgICAgICAgIGhhc01hZ2ljID0gaGFzTWFnaWMgfHwgc3BbMV1cbiAgICAgICAgICBpbkNsYXNzID0gZmFsc2VcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZmluaXNoIHVwIHRoZSBjbGFzcy5cbiAgICAgICAgaGFzTWFnaWMgPSB0cnVlXG4gICAgICAgIGluQ2xhc3MgPSBmYWxzZVxuICAgICAgICByZSArPSBjXG4gICAgICBjb250aW51ZVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBzd2FsbG93IGFueSBzdGF0ZSBjaGFyIHRoYXQgd2Fzbid0IGNvbnN1bWVkXG4gICAgICAgIGNsZWFyU3RhdGVDaGFyKClcblxuICAgICAgICBpZiAoZXNjYXBpbmcpIHtcbiAgICAgICAgICAvLyBubyBuZWVkXG4gICAgICAgICAgZXNjYXBpbmcgPSBmYWxzZVxuICAgICAgICB9IGVsc2UgaWYgKHJlU3BlY2lhbHNbY11cbiAgICAgICAgICAmJiAhKGMgPT09ICdeJyAmJiBpbkNsYXNzKSkge1xuICAgICAgICAgIHJlICs9ICdcXFxcJ1xuICAgICAgICB9XG5cbiAgICAgICAgcmUgKz0gY1xuXG4gICAgfSAvLyBzd2l0Y2hcbiAgfSAvLyBmb3JcblxuICAvLyBoYW5kbGUgdGhlIGNhc2Ugd2hlcmUgd2UgbGVmdCBhIGNsYXNzIG9wZW4uXG4gIC8vIFwiW2FiY1wiIGlzIHZhbGlkLCBlcXVpdmFsZW50IHRvIFwiXFxbYWJjXCJcbiAgaWYgKGluQ2xhc3MpIHtcbiAgICAvLyBzcGxpdCB3aGVyZSB0aGUgbGFzdCBbIHdhcywgYW5kIGVzY2FwZSBpdFxuICAgIC8vIHRoaXMgaXMgYSBodWdlIHBpdGEuICBXZSBub3cgaGF2ZSB0byByZS13YWxrXG4gICAgLy8gdGhlIGNvbnRlbnRzIG9mIHRoZSB3b3VsZC1iZSBjbGFzcyB0byByZS10cmFuc2xhdGVcbiAgICAvLyBhbnkgY2hhcmFjdGVycyB0aGF0IHdlcmUgcGFzc2VkIHRocm91Z2ggYXMtaXNcbiAgICBjcyA9IHBhdHRlcm4uc3Vic3RyKGNsYXNzU3RhcnQgKyAxKVxuICAgIHNwID0gdGhpcy5wYXJzZShjcywgU1VCUEFSU0UpXG4gICAgcmUgPSByZS5zdWJzdHIoMCwgcmVDbGFzc1N0YXJ0KSArICdcXFxcWycgKyBzcFswXVxuICAgIGhhc01hZ2ljID0gaGFzTWFnaWMgfHwgc3BbMV1cbiAgfVxuXG4gIC8vIGhhbmRsZSB0aGUgY2FzZSB3aGVyZSB3ZSBoYWQgYSArKCB0aGluZyBhdCB0aGUgKmVuZCpcbiAgLy8gb2YgdGhlIHBhdHRlcm4uXG4gIC8vIGVhY2ggcGF0dGVybiBsaXN0IHN0YWNrIGFkZHMgMyBjaGFycywgYW5kIHdlIG5lZWQgdG8gZ28gdGhyb3VnaFxuICAvLyBhbmQgZXNjYXBlIGFueSB8IGNoYXJzIHRoYXQgd2VyZSBwYXNzZWQgdGhyb3VnaCBhcy1pcyBmb3IgdGhlIHJlZ2V4cC5cbiAgLy8gR28gdGhyb3VnaCBhbmQgZXNjYXBlIHRoZW0sIHRha2luZyBjYXJlIG5vdCB0byBkb3VibGUtZXNjYXBlIGFueVxuICAvLyB8IGNoYXJzIHRoYXQgd2VyZSBhbHJlYWR5IGVzY2FwZWQuXG4gIGZvciAocGwgPSBwYXR0ZXJuTGlzdFN0YWNrLnBvcCgpOyBwbDsgcGwgPSBwYXR0ZXJuTGlzdFN0YWNrLnBvcCgpKSB7XG4gICAgdmFyIHRhaWwgPSByZS5zbGljZShwbC5yZVN0YXJ0ICsgcGwub3Blbi5sZW5ndGgpXG4gICAgdGhpcy5kZWJ1Zygnc2V0dGluZyB0YWlsJywgcmUsIHBsKVxuICAgIC8vIG1heWJlIHNvbWUgZXZlbiBudW1iZXIgb2YgXFwsIHRoZW4gbWF5YmUgMSBcXCwgZm9sbG93ZWQgYnkgYSB8XG4gICAgdGFpbCA9IHRhaWwucmVwbGFjZSgvKCg/OlxcXFx7Mn0pezAsNjR9KShcXFxcPylcXHwvZywgZnVuY3Rpb24gKF8sICQxLCAkMikge1xuICAgICAgaWYgKCEkMikge1xuICAgICAgICAvLyB0aGUgfCBpc24ndCBhbHJlYWR5IGVzY2FwZWQsIHNvIGVzY2FwZSBpdC5cbiAgICAgICAgJDIgPSAnXFxcXCdcbiAgICAgIH1cblxuICAgICAgLy8gbmVlZCB0byBlc2NhcGUgYWxsIHRob3NlIHNsYXNoZXMgKmFnYWluKiwgd2l0aG91dCBlc2NhcGluZyB0aGVcbiAgICAgIC8vIG9uZSB0aGF0IHdlIG5lZWQgZm9yIGVzY2FwaW5nIHRoZSB8IGNoYXJhY3Rlci4gIEFzIGl0IHdvcmtzIG91dCxcbiAgICAgIC8vIGVzY2FwaW5nIGFuIGV2ZW4gbnVtYmVyIG9mIHNsYXNoZXMgY2FuIGJlIGRvbmUgYnkgc2ltcGx5IHJlcGVhdGluZ1xuICAgICAgLy8gaXQgZXhhY3RseSBhZnRlciBpdHNlbGYuICBUaGF0J3Mgd2h5IHRoaXMgdHJpY2sgd29ya3MuXG4gICAgICAvL1xuICAgICAgLy8gSSBhbSBzb3JyeSB0aGF0IHlvdSBoYXZlIHRvIHNlZSB0aGlzLlxuICAgICAgcmV0dXJuICQxICsgJDEgKyAkMiArICd8J1xuICAgIH0pXG5cbiAgICB0aGlzLmRlYnVnKCd0YWlsPSVqXFxuICAgJXMnLCB0YWlsLCB0YWlsLCBwbCwgcmUpXG4gICAgdmFyIHQgPSBwbC50eXBlID09PSAnKicgPyBzdGFyXG4gICAgICA6IHBsLnR5cGUgPT09ICc/JyA/IHFtYXJrXG4gICAgICA6ICdcXFxcJyArIHBsLnR5cGVcblxuICAgIGhhc01hZ2ljID0gdHJ1ZVxuICAgIHJlID0gcmUuc2xpY2UoMCwgcGwucmVTdGFydCkgKyB0ICsgJ1xcXFwoJyArIHRhaWxcbiAgfVxuXG4gIC8vIGhhbmRsZSB0cmFpbGluZyB0aGluZ3MgdGhhdCBvbmx5IG1hdHRlciBhdCB0aGUgdmVyeSBlbmQuXG4gIGNsZWFyU3RhdGVDaGFyKClcbiAgaWYgKGVzY2FwaW5nKSB7XG4gICAgLy8gdHJhaWxpbmcgXFxcXFxuICAgIHJlICs9ICdcXFxcXFxcXCdcbiAgfVxuXG4gIC8vIG9ubHkgbmVlZCB0byBhcHBseSB0aGUgbm9kb3Qgc3RhcnQgaWYgdGhlIHJlIHN0YXJ0cyB3aXRoXG4gIC8vIHNvbWV0aGluZyB0aGF0IGNvdWxkIGNvbmNlaXZhYmx5IGNhcHR1cmUgYSBkb3RcbiAgdmFyIGFkZFBhdHRlcm5TdGFydCA9IGZhbHNlXG4gIHN3aXRjaCAocmUuY2hhckF0KDApKSB7XG4gICAgY2FzZSAnWyc6IGNhc2UgJy4nOiBjYXNlICcoJzogYWRkUGF0dGVyblN0YXJ0ID0gdHJ1ZVxuICB9XG5cbiAgLy8gSGFjayB0byB3b3JrIGFyb3VuZCBsYWNrIG9mIG5lZ2F0aXZlIGxvb2tiZWhpbmQgaW4gSlNcbiAgLy8gQSBwYXR0ZXJuIGxpa2U6ICouISh4KS4hKHl8eikgbmVlZHMgdG8gZW5zdXJlIHRoYXQgYSBuYW1lXG4gIC8vIGxpa2UgJ2EueHl6Lnl6JyBkb2Vzbid0IG1hdGNoLiAgU28sIHRoZSBmaXJzdCBuZWdhdGl2ZVxuICAvLyBsb29rYWhlYWQsIGhhcyB0byBsb29rIEFMTCB0aGUgd2F5IGFoZWFkLCB0byB0aGUgZW5kIG9mXG4gIC8vIHRoZSBwYXR0ZXJuLlxuICBmb3IgKHZhciBuID0gbmVnYXRpdmVMaXN0cy5sZW5ndGggLSAxOyBuID4gLTE7IG4tLSkge1xuICAgIHZhciBubCA9IG5lZ2F0aXZlTGlzdHNbbl1cblxuICAgIHZhciBubEJlZm9yZSA9IHJlLnNsaWNlKDAsIG5sLnJlU3RhcnQpXG4gICAgdmFyIG5sRmlyc3QgPSByZS5zbGljZShubC5yZVN0YXJ0LCBubC5yZUVuZCAtIDgpXG4gICAgdmFyIG5sTGFzdCA9IHJlLnNsaWNlKG5sLnJlRW5kIC0gOCwgbmwucmVFbmQpXG4gICAgdmFyIG5sQWZ0ZXIgPSByZS5zbGljZShubC5yZUVuZClcblxuICAgIG5sTGFzdCArPSBubEFmdGVyXG5cbiAgICAvLyBIYW5kbGUgbmVzdGVkIHN0dWZmIGxpa2UgKigqLmpzfCEoKi5qc29uKSksIHdoZXJlIG9wZW4gcGFyZW5zXG4gICAgLy8gbWVhbiB0aGF0IHdlIHNob3VsZCAqbm90KiBpbmNsdWRlIHRoZSApIGluIHRoZSBiaXQgdGhhdCBpcyBjb25zaWRlcmVkXG4gICAgLy8gXCJhZnRlclwiIHRoZSBuZWdhdGVkIHNlY3Rpb24uXG4gICAgdmFyIG9wZW5QYXJlbnNCZWZvcmUgPSBubEJlZm9yZS5zcGxpdCgnKCcpLmxlbmd0aCAtIDFcbiAgICB2YXIgY2xlYW5BZnRlciA9IG5sQWZ0ZXJcbiAgICBmb3IgKGkgPSAwOyBpIDwgb3BlblBhcmVuc0JlZm9yZTsgaSsrKSB7XG4gICAgICBjbGVhbkFmdGVyID0gY2xlYW5BZnRlci5yZXBsYWNlKC9cXClbKyo/XT8vLCAnJylcbiAgICB9XG4gICAgbmxBZnRlciA9IGNsZWFuQWZ0ZXJcblxuICAgIHZhciBkb2xsYXIgPSAnJ1xuICAgIGlmIChubEFmdGVyID09PSAnJyAmJiBpc1N1YiAhPT0gU1VCUEFSU0UpIHtcbiAgICAgIGRvbGxhciA9ICckJ1xuICAgIH1cbiAgICB2YXIgbmV3UmUgPSBubEJlZm9yZSArIG5sRmlyc3QgKyBubEFmdGVyICsgZG9sbGFyICsgbmxMYXN0XG4gICAgcmUgPSBuZXdSZVxuICB9XG5cbiAgLy8gaWYgdGhlIHJlIGlzIG5vdCBcIlwiIGF0IHRoaXMgcG9pbnQsIHRoZW4gd2UgbmVlZCB0byBtYWtlIHN1cmVcbiAgLy8gaXQgZG9lc24ndCBtYXRjaCBhZ2FpbnN0IGFuIGVtcHR5IHBhdGggcGFydC5cbiAgLy8gT3RoZXJ3aXNlIGEvKiB3aWxsIG1hdGNoIGEvLCB3aGljaCBpdCBzaG91bGQgbm90LlxuICBpZiAocmUgIT09ICcnICYmIGhhc01hZ2ljKSB7XG4gICAgcmUgPSAnKD89LiknICsgcmVcbiAgfVxuXG4gIGlmIChhZGRQYXR0ZXJuU3RhcnQpIHtcbiAgICByZSA9IHBhdHRlcm5TdGFydCArIHJlXG4gIH1cblxuICAvLyBwYXJzaW5nIGp1c3QgYSBwaWVjZSBvZiBhIGxhcmdlciBwYXR0ZXJuLlxuICBpZiAoaXNTdWIgPT09IFNVQlBBUlNFKSB7XG4gICAgcmV0dXJuIFtyZSwgaGFzTWFnaWNdXG4gIH1cblxuICAvLyBza2lwIHRoZSByZWdleHAgZm9yIG5vbi1tYWdpY2FsIHBhdHRlcm5zXG4gIC8vIHVuZXNjYXBlIGFueXRoaW5nIGluIGl0LCB0aG91Z2gsIHNvIHRoYXQgaXQnbGwgYmVcbiAgLy8gYW4gZXhhY3QgbWF0Y2ggYWdhaW5zdCBhIGZpbGUgZXRjLlxuICBpZiAoIWhhc01hZ2ljKSB7XG4gICAgcmV0dXJuIGdsb2JVbmVzY2FwZShwYXR0ZXJuKVxuICB9XG5cbiAgdmFyIGZsYWdzID0gb3B0aW9ucy5ub2Nhc2UgPyAnaScgOiAnJ1xuICB0cnkge1xuICAgIHZhciByZWdFeHAgPSBuZXcgUmVnRXhwKCdeJyArIHJlICsgJyQnLCBmbGFncylcbiAgfSBjYXRjaCAoZXIpIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IC0gc2hvdWxkIGJlIGltcG9zc2libGUgKi8ge1xuICAgIC8vIElmIGl0IHdhcyBhbiBpbnZhbGlkIHJlZ3VsYXIgZXhwcmVzc2lvbiwgdGhlbiBpdCBjYW4ndCBtYXRjaFxuICAgIC8vIGFueXRoaW5nLiAgVGhpcyB0cmljayBsb29rcyBmb3IgYSBjaGFyYWN0ZXIgYWZ0ZXIgdGhlIGVuZCBvZlxuICAgIC8vIHRoZSBzdHJpbmcsIHdoaWNoIGlzIG9mIGNvdXJzZSBpbXBvc3NpYmxlLCBleGNlcHQgaW4gbXVsdGktbGluZVxuICAgIC8vIG1vZGUsIGJ1dCBpdCdzIG5vdCBhIC9tIHJlZ2V4LlxuICAgIHJldHVybiBuZXcgUmVnRXhwKCckLicpXG4gIH1cblxuICByZWdFeHAuX2dsb2IgPSBwYXR0ZXJuXG4gIHJlZ0V4cC5fc3JjID0gcmVcblxuICByZXR1cm4gcmVnRXhwXG59XG5cbm1pbmltYXRjaC5tYWtlUmUgPSBmdW5jdGlvbiAocGF0dGVybiwgb3B0aW9ucykge1xuICByZXR1cm4gbmV3IE1pbmltYXRjaChwYXR0ZXJuLCBvcHRpb25zIHx8IHt9KS5tYWtlUmUoKVxufVxuXG5NaW5pbWF0Y2gucHJvdG90eXBlLm1ha2VSZSA9IG1ha2VSZVxuZnVuY3Rpb24gbWFrZVJlICgpIHtcbiAgaWYgKHRoaXMucmVnZXhwIHx8IHRoaXMucmVnZXhwID09PSBmYWxzZSkgcmV0dXJuIHRoaXMucmVnZXhwXG5cbiAgLy8gYXQgdGhpcyBwb2ludCwgdGhpcy5zZXQgaXMgYSAyZCBhcnJheSBvZiBwYXJ0aWFsXG4gIC8vIHBhdHRlcm4gc3RyaW5ncywgb3IgXCIqKlwiLlxuICAvL1xuICAvLyBJdCdzIGJldHRlciB0byB1c2UgLm1hdGNoKCkuICBUaGlzIGZ1bmN0aW9uIHNob3VsZG4ndFxuICAvLyBiZSB1c2VkLCByZWFsbHksIGJ1dCBpdCdzIHByZXR0eSBjb252ZW5pZW50IHNvbWV0aW1lcyxcbiAgLy8gd2hlbiB5b3UganVzdCB3YW50IHRvIHdvcmsgd2l0aCBhIHJlZ2V4LlxuICB2YXIgc2V0ID0gdGhpcy5zZXRcblxuICBpZiAoIXNldC5sZW5ndGgpIHtcbiAgICB0aGlzLnJlZ2V4cCA9IGZhbHNlXG4gICAgcmV0dXJuIHRoaXMucmVnZXhwXG4gIH1cbiAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnNcblxuICB2YXIgdHdvU3RhciA9IG9wdGlvbnMubm9nbG9ic3RhciA/IHN0YXJcbiAgICA6IG9wdGlvbnMuZG90ID8gdHdvU3RhckRvdFxuICAgIDogdHdvU3Rhck5vRG90XG4gIHZhciBmbGFncyA9IG9wdGlvbnMubm9jYXNlID8gJ2knIDogJydcblxuICB2YXIgcmUgPSBzZXQubWFwKGZ1bmN0aW9uIChwYXR0ZXJuKSB7XG4gICAgcmV0dXJuIHBhdHRlcm4ubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICByZXR1cm4gKHAgPT09IEdMT0JTVEFSKSA/IHR3b1N0YXJcbiAgICAgIDogKHR5cGVvZiBwID09PSAnc3RyaW5nJykgPyByZWdFeHBFc2NhcGUocClcbiAgICAgIDogcC5fc3JjXG4gICAgfSkuam9pbignXFxcXFxcLycpXG4gIH0pLmpvaW4oJ3wnKVxuXG4gIC8vIG11c3QgbWF0Y2ggZW50aXJlIHBhdHRlcm5cbiAgLy8gZW5kaW5nIGluIGEgKiBvciAqKiB3aWxsIG1ha2UgaXQgbGVzcyBzdHJpY3QuXG4gIHJlID0gJ14oPzonICsgcmUgKyAnKSQnXG5cbiAgLy8gY2FuIG1hdGNoIGFueXRoaW5nLCBhcyBsb25nIGFzIGl0J3Mgbm90IHRoaXMuXG4gIGlmICh0aGlzLm5lZ2F0ZSkgcmUgPSAnXig/IScgKyByZSArICcpLiokJ1xuXG4gIHRyeSB7XG4gICAgdGhpcy5yZWdleHAgPSBuZXcgUmVnRXhwKHJlLCBmbGFncylcbiAgfSBjYXRjaCAoZXgpIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IC0gc2hvdWxkIGJlIGltcG9zc2libGUgKi8ge1xuICAgIHRoaXMucmVnZXhwID0gZmFsc2VcbiAgfVxuICByZXR1cm4gdGhpcy5yZWdleHBcbn1cblxubWluaW1hdGNoLm1hdGNoID0gZnVuY3Rpb24gKGxpc3QsIHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgdmFyIG1tID0gbmV3IE1pbmltYXRjaChwYXR0ZXJuLCBvcHRpb25zKVxuICBsaXN0ID0gbGlzdC5maWx0ZXIoZnVuY3Rpb24gKGYpIHtcbiAgICByZXR1cm4gbW0ubWF0Y2goZilcbiAgfSlcbiAgaWYgKG1tLm9wdGlvbnMubm9udWxsICYmICFsaXN0Lmxlbmd0aCkge1xuICAgIGxpc3QucHVzaChwYXR0ZXJuKVxuICB9XG4gIHJldHVybiBsaXN0XG59XG5cbk1pbmltYXRjaC5wcm90b3R5cGUubWF0Y2ggPSBmdW5jdGlvbiBtYXRjaCAoZiwgcGFydGlhbCkge1xuICBpZiAodHlwZW9mIHBhcnRpYWwgPT09ICd1bmRlZmluZWQnKSBwYXJ0aWFsID0gdGhpcy5wYXJ0aWFsXG4gIHRoaXMuZGVidWcoJ21hdGNoJywgZiwgdGhpcy5wYXR0ZXJuKVxuICAvLyBzaG9ydC1jaXJjdWl0IGluIHRoZSBjYXNlIG9mIGJ1c3RlZCB0aGluZ3MuXG4gIC8vIGNvbW1lbnRzLCBldGMuXG4gIGlmICh0aGlzLmNvbW1lbnQpIHJldHVybiBmYWxzZVxuICBpZiAodGhpcy5lbXB0eSkgcmV0dXJuIGYgPT09ICcnXG5cbiAgaWYgKGYgPT09ICcvJyAmJiBwYXJ0aWFsKSByZXR1cm4gdHJ1ZVxuXG4gIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zXG5cbiAgLy8gd2luZG93czogbmVlZCB0byB1c2UgLywgbm90IFxcXG4gIGlmIChwYXRoLnNlcCAhPT0gJy8nKSB7XG4gICAgZiA9IGYuc3BsaXQocGF0aC5zZXApLmpvaW4oJy8nKVxuICB9XG5cbiAgLy8gdHJlYXQgdGhlIHRlc3QgcGF0aCBhcyBhIHNldCBvZiBwYXRocGFydHMuXG4gIGYgPSBmLnNwbGl0KHNsYXNoU3BsaXQpXG4gIHRoaXMuZGVidWcodGhpcy5wYXR0ZXJuLCAnc3BsaXQnLCBmKVxuXG4gIC8vIGp1c3QgT05FIG9mIHRoZSBwYXR0ZXJuIHNldHMgaW4gdGhpcy5zZXQgbmVlZHMgdG8gbWF0Y2hcbiAgLy8gaW4gb3JkZXIgZm9yIGl0IHRvIGJlIHZhbGlkLiAgSWYgbmVnYXRpbmcsIHRoZW4ganVzdCBvbmVcbiAgLy8gbWF0Y2ggbWVhbnMgdGhhdCB3ZSBoYXZlIGZhaWxlZC5cbiAgLy8gRWl0aGVyIHdheSwgcmV0dXJuIG9uIHRoZSBmaXJzdCBoaXQuXG5cbiAgdmFyIHNldCA9IHRoaXMuc2V0XG4gIHRoaXMuZGVidWcodGhpcy5wYXR0ZXJuLCAnc2V0Jywgc2V0KVxuXG4gIC8vIEZpbmQgdGhlIGJhc2VuYW1lIG9mIHRoZSBwYXRoIGJ5IGxvb2tpbmcgZm9yIHRoZSBsYXN0IG5vbi1lbXB0eSBzZWdtZW50XG4gIHZhciBmaWxlbmFtZVxuICB2YXIgaVxuICBmb3IgKGkgPSBmLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgZmlsZW5hbWUgPSBmW2ldXG4gICAgaWYgKGZpbGVuYW1lKSBicmVha1xuICB9XG5cbiAgZm9yIChpID0gMDsgaSA8IHNldC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBwYXR0ZXJuID0gc2V0W2ldXG4gICAgdmFyIGZpbGUgPSBmXG4gICAgaWYgKG9wdGlvbnMubWF0Y2hCYXNlICYmIHBhdHRlcm4ubGVuZ3RoID09PSAxKSB7XG4gICAgICBmaWxlID0gW2ZpbGVuYW1lXVxuICAgIH1cbiAgICB2YXIgaGl0ID0gdGhpcy5tYXRjaE9uZShmaWxlLCBwYXR0ZXJuLCBwYXJ0aWFsKVxuICAgIGlmIChoaXQpIHtcbiAgICAgIGlmIChvcHRpb25zLmZsaXBOZWdhdGUpIHJldHVybiB0cnVlXG4gICAgICByZXR1cm4gIXRoaXMubmVnYXRlXG4gICAgfVxuICB9XG5cbiAgLy8gZGlkbid0IGdldCBhbnkgaGl0cy4gIHRoaXMgaXMgc3VjY2VzcyBpZiBpdCdzIGEgbmVnYXRpdmVcbiAgLy8gcGF0dGVybiwgZmFpbHVyZSBvdGhlcndpc2UuXG4gIGlmIChvcHRpb25zLmZsaXBOZWdhdGUpIHJldHVybiBmYWxzZVxuICByZXR1cm4gdGhpcy5uZWdhdGVcbn1cblxuLy8gc2V0IHBhcnRpYWwgdG8gdHJ1ZSB0byB0ZXN0IGlmLCBmb3IgZXhhbXBsZSxcbi8vIFwiL2EvYlwiIG1hdGNoZXMgdGhlIHN0YXJ0IG9mIFwiLyovYi8qL2RcIlxuLy8gUGFydGlhbCBtZWFucywgaWYgeW91IHJ1biBvdXQgb2YgZmlsZSBiZWZvcmUgeW91IHJ1blxuLy8gb3V0IG9mIHBhdHRlcm4sIHRoZW4gdGhhdCdzIGZpbmUsIGFzIGxvbmcgYXMgYWxsXG4vLyB0aGUgcGFydHMgbWF0Y2guXG5NaW5pbWF0Y2gucHJvdG90eXBlLm1hdGNoT25lID0gZnVuY3Rpb24gKGZpbGUsIHBhdHRlcm4sIHBhcnRpYWwpIHtcbiAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnNcblxuICB0aGlzLmRlYnVnKCdtYXRjaE9uZScsXG4gICAgeyAndGhpcyc6IHRoaXMsIGZpbGU6IGZpbGUsIHBhdHRlcm46IHBhdHRlcm4gfSlcblxuICB0aGlzLmRlYnVnKCdtYXRjaE9uZScsIGZpbGUubGVuZ3RoLCBwYXR0ZXJuLmxlbmd0aClcblxuICBmb3IgKHZhciBmaSA9IDAsXG4gICAgICBwaSA9IDAsXG4gICAgICBmbCA9IGZpbGUubGVuZ3RoLFxuICAgICAgcGwgPSBwYXR0ZXJuLmxlbmd0aFxuICAgICAgOyAoZmkgPCBmbCkgJiYgKHBpIDwgcGwpXG4gICAgICA7IGZpKyssIHBpKyspIHtcbiAgICB0aGlzLmRlYnVnKCdtYXRjaE9uZSBsb29wJylcbiAgICB2YXIgcCA9IHBhdHRlcm5bcGldXG4gICAgdmFyIGYgPSBmaWxlW2ZpXVxuXG4gICAgdGhpcy5kZWJ1ZyhwYXR0ZXJuLCBwLCBmKVxuXG4gICAgLy8gc2hvdWxkIGJlIGltcG9zc2libGUuXG4gICAgLy8gc29tZSBpbnZhbGlkIHJlZ2V4cCBzdHVmZiBpbiB0aGUgc2V0LlxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmIChwID09PSBmYWxzZSkgcmV0dXJuIGZhbHNlXG5cbiAgICBpZiAocCA9PT0gR0xPQlNUQVIpIHtcbiAgICAgIHRoaXMuZGVidWcoJ0dMT0JTVEFSJywgW3BhdHRlcm4sIHAsIGZdKVxuXG4gICAgICAvLyBcIioqXCJcbiAgICAgIC8vIGEvKiovYi8qKi9jIHdvdWxkIG1hdGNoIHRoZSBmb2xsb3dpbmc6XG4gICAgICAvLyBhL2IveC95L3ovY1xuICAgICAgLy8gYS94L3kvei9iL2NcbiAgICAgIC8vIGEvYi94L2IveC9jXG4gICAgICAvLyBhL2IvY1xuICAgICAgLy8gVG8gZG8gdGhpcywgdGFrZSB0aGUgcmVzdCBvZiB0aGUgcGF0dGVybiBhZnRlclxuICAgICAgLy8gdGhlICoqLCBhbmQgc2VlIGlmIGl0IHdvdWxkIG1hdGNoIHRoZSBmaWxlIHJlbWFpbmRlci5cbiAgICAgIC8vIElmIHNvLCByZXR1cm4gc3VjY2Vzcy5cbiAgICAgIC8vIElmIG5vdCwgdGhlICoqIFwic3dhbGxvd3NcIiBhIHNlZ21lbnQsIGFuZCB0cnkgYWdhaW4uXG4gICAgICAvLyBUaGlzIGlzIHJlY3Vyc2l2ZWx5IGF3ZnVsLlxuICAgICAgLy9cbiAgICAgIC8vIGEvKiovYi8qKi9jIG1hdGNoaW5nIGEvYi94L3kvei9jXG4gICAgICAvLyAtIGEgbWF0Y2hlcyBhXG4gICAgICAvLyAtIGRvdWJsZXN0YXJcbiAgICAgIC8vICAgLSBtYXRjaE9uZShiL3gveS96L2MsIGIvKiovYylcbiAgICAgIC8vICAgICAtIGIgbWF0Y2hlcyBiXG4gICAgICAvLyAgICAgLSBkb3VibGVzdGFyXG4gICAgICAvLyAgICAgICAtIG1hdGNoT25lKHgveS96L2MsIGMpIC0+IG5vXG4gICAgICAvLyAgICAgICAtIG1hdGNoT25lKHkvei9jLCBjKSAtPiBub1xuICAgICAgLy8gICAgICAgLSBtYXRjaE9uZSh6L2MsIGMpIC0+IG5vXG4gICAgICAvLyAgICAgICAtIG1hdGNoT25lKGMsIGMpIHllcywgaGl0XG4gICAgICB2YXIgZnIgPSBmaVxuICAgICAgdmFyIHByID0gcGkgKyAxXG4gICAgICBpZiAocHIgPT09IHBsKSB7XG4gICAgICAgIHRoaXMuZGVidWcoJyoqIGF0IHRoZSBlbmQnKVxuICAgICAgICAvLyBhICoqIGF0IHRoZSBlbmQgd2lsbCBqdXN0IHN3YWxsb3cgdGhlIHJlc3QuXG4gICAgICAgIC8vIFdlIGhhdmUgZm91bmQgYSBtYXRjaC5cbiAgICAgICAgLy8gaG93ZXZlciwgaXQgd2lsbCBub3Qgc3dhbGxvdyAvLngsIHVubGVzc1xuICAgICAgICAvLyBvcHRpb25zLmRvdCBpcyBzZXQuXG4gICAgICAgIC8vIC4gYW5kIC4uIGFyZSAqbmV2ZXIqIG1hdGNoZWQgYnkgKiosIGZvciBleHBsb3NpdmVseVxuICAgICAgICAvLyBleHBvbmVudGlhbCByZWFzb25zLlxuICAgICAgICBmb3IgKDsgZmkgPCBmbDsgZmkrKykge1xuICAgICAgICAgIGlmIChmaWxlW2ZpXSA9PT0gJy4nIHx8IGZpbGVbZmldID09PSAnLi4nIHx8XG4gICAgICAgICAgICAoIW9wdGlvbnMuZG90ICYmIGZpbGVbZmldLmNoYXJBdCgwKSA9PT0gJy4nKSkgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cblxuICAgICAgLy8gb2ssIGxldCdzIHNlZSBpZiB3ZSBjYW4gc3dhbGxvdyB3aGF0ZXZlciB3ZSBjYW4uXG4gICAgICB3aGlsZSAoZnIgPCBmbCkge1xuICAgICAgICB2YXIgc3dhbGxvd2VlID0gZmlsZVtmcl1cblxuICAgICAgICB0aGlzLmRlYnVnKCdcXG5nbG9ic3RhciB3aGlsZScsIGZpbGUsIGZyLCBwYXR0ZXJuLCBwciwgc3dhbGxvd2VlKVxuXG4gICAgICAgIC8vIFhYWCByZW1vdmUgdGhpcyBzbGljZS4gIEp1c3QgcGFzcyB0aGUgc3RhcnQgaW5kZXguXG4gICAgICAgIGlmICh0aGlzLm1hdGNoT25lKGZpbGUuc2xpY2UoZnIpLCBwYXR0ZXJuLnNsaWNlKHByKSwgcGFydGlhbCkpIHtcbiAgICAgICAgICB0aGlzLmRlYnVnKCdnbG9ic3RhciBmb3VuZCBtYXRjaCEnLCBmciwgZmwsIHN3YWxsb3dlZSlcbiAgICAgICAgICAvLyBmb3VuZCBhIG1hdGNoLlxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gY2FuJ3Qgc3dhbGxvdyBcIi5cIiBvciBcIi4uXCIgZXZlci5cbiAgICAgICAgICAvLyBjYW4gb25seSBzd2FsbG93IFwiLmZvb1wiIHdoZW4gZXhwbGljaXRseSBhc2tlZC5cbiAgICAgICAgICBpZiAoc3dhbGxvd2VlID09PSAnLicgfHwgc3dhbGxvd2VlID09PSAnLi4nIHx8XG4gICAgICAgICAgICAoIW9wdGlvbnMuZG90ICYmIHN3YWxsb3dlZS5jaGFyQXQoMCkgPT09ICcuJykpIHtcbiAgICAgICAgICAgIHRoaXMuZGVidWcoJ2RvdCBkZXRlY3RlZCEnLCBmaWxlLCBmciwgcGF0dGVybiwgcHIpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vICoqIHN3YWxsb3dzIGEgc2VnbWVudCwgYW5kIGNvbnRpbnVlLlxuICAgICAgICAgIHRoaXMuZGVidWcoJ2dsb2JzdGFyIHN3YWxsb3cgYSBzZWdtZW50LCBhbmQgY29udGludWUnKVxuICAgICAgICAgIGZyKytcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBubyBtYXRjaCB3YXMgZm91bmQuXG4gICAgICAvLyBIb3dldmVyLCBpbiBwYXJ0aWFsIG1vZGUsIHdlIGNhbid0IHNheSB0aGlzIGlzIG5lY2Vzc2FyaWx5IG92ZXIuXG4gICAgICAvLyBJZiB0aGVyZSdzIG1vcmUgKnBhdHRlcm4qIGxlZnQsIHRoZW5cbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgaWYgKHBhcnRpYWwpIHtcbiAgICAgICAgLy8gcmFuIG91dCBvZiBmaWxlXG4gICAgICAgIHRoaXMuZGVidWcoJ1xcbj4+PiBubyBtYXRjaCwgcGFydGlhbD8nLCBmaWxlLCBmciwgcGF0dGVybiwgcHIpXG4gICAgICAgIGlmIChmciA9PT0gZmwpIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBzb21ldGhpbmcgb3RoZXIgdGhhbiAqKlxuICAgIC8vIG5vbi1tYWdpYyBwYXR0ZXJucyBqdXN0IGhhdmUgdG8gbWF0Y2ggZXhhY3RseVxuICAgIC8vIHBhdHRlcm5zIHdpdGggbWFnaWMgaGF2ZSBiZWVuIHR1cm5lZCBpbnRvIHJlZ2V4cHMuXG4gICAgdmFyIGhpdFxuICAgIGlmICh0eXBlb2YgcCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGhpdCA9IGYgPT09IHBcbiAgICAgIHRoaXMuZGVidWcoJ3N0cmluZyBtYXRjaCcsIHAsIGYsIGhpdClcbiAgICB9IGVsc2Uge1xuICAgICAgaGl0ID0gZi5tYXRjaChwKVxuICAgICAgdGhpcy5kZWJ1ZygncGF0dGVybiBtYXRjaCcsIHAsIGYsIGhpdClcbiAgICB9XG5cbiAgICBpZiAoIWhpdCkgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvLyBOb3RlOiBlbmRpbmcgaW4gLyBtZWFucyB0aGF0IHdlJ2xsIGdldCBhIGZpbmFsIFwiXCJcbiAgLy8gYXQgdGhlIGVuZCBvZiB0aGUgcGF0dGVybi4gIFRoaXMgY2FuIG9ubHkgbWF0Y2ggYVxuICAvLyBjb3JyZXNwb25kaW5nIFwiXCIgYXQgdGhlIGVuZCBvZiB0aGUgZmlsZS5cbiAgLy8gSWYgdGhlIGZpbGUgZW5kcyBpbiAvLCB0aGVuIGl0IGNhbiBvbmx5IG1hdGNoIGFcbiAgLy8gYSBwYXR0ZXJuIHRoYXQgZW5kcyBpbiAvLCB1bmxlc3MgdGhlIHBhdHRlcm4ganVzdFxuICAvLyBkb2Vzbid0IGhhdmUgYW55IG1vcmUgZm9yIGl0LiBCdXQsIGEvYi8gc2hvdWxkICpub3QqXG4gIC8vIG1hdGNoIFwiYS9iLypcIiwgZXZlbiB0aG91Z2ggXCJcIiBtYXRjaGVzIGFnYWluc3QgdGhlXG4gIC8vIFteL10qPyBwYXR0ZXJuLCBleGNlcHQgaW4gcGFydGlhbCBtb2RlLCB3aGVyZSBpdCBtaWdodFxuICAvLyBzaW1wbHkgbm90IGJlIHJlYWNoZWQgeWV0LlxuICAvLyBIb3dldmVyLCBhL2IvIHNob3VsZCBzdGlsbCBzYXRpc2Z5IGEvKlxuXG4gIC8vIG5vdyBlaXRoZXIgd2UgZmVsbCBvZmYgdGhlIGVuZCBvZiB0aGUgcGF0dGVybiwgb3Igd2UncmUgZG9uZS5cbiAgaWYgKGZpID09PSBmbCAmJiBwaSA9PT0gcGwpIHtcbiAgICAvLyByYW4gb3V0IG9mIHBhdHRlcm4gYW5kIGZpbGVuYW1lIGF0IHRoZSBzYW1lIHRpbWUuXG4gICAgLy8gYW4gZXhhY3QgaGl0IVxuICAgIHJldHVybiB0cnVlXG4gIH0gZWxzZSBpZiAoZmkgPT09IGZsKSB7XG4gICAgLy8gcmFuIG91dCBvZiBmaWxlLCBidXQgc3RpbGwgaGFkIHBhdHRlcm4gbGVmdC5cbiAgICAvLyB0aGlzIGlzIG9rIGlmIHdlJ3JlIGRvaW5nIHRoZSBtYXRjaCBhcyBwYXJ0IG9mXG4gICAgLy8gYSBnbG9iIGZzIHRyYXZlcnNhbC5cbiAgICByZXR1cm4gcGFydGlhbFxuICB9IGVsc2UgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi8gaWYgKHBpID09PSBwbCkge1xuICAgIC8vIHJhbiBvdXQgb2YgcGF0dGVybiwgc3RpbGwgaGF2ZSBmaWxlIGxlZnQuXG4gICAgLy8gdGhpcyBpcyBvbmx5IGFjY2VwdGFibGUgaWYgd2UncmUgb24gdGhlIHZlcnkgbGFzdFxuICAgIC8vIGVtcHR5IHNlZ21lbnQgb2YgYSBmaWxlIHdpdGggYSB0cmFpbGluZyBzbGFzaC5cbiAgICAvLyBhLyogc2hvdWxkIG1hdGNoIGEvYi9cbiAgICByZXR1cm4gKGZpID09PSBmbCAtIDEpICYmIChmaWxlW2ZpXSA9PT0gJycpXG4gIH1cblxuICAvLyBzaG91bGQgYmUgdW5yZWFjaGFibGUuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHRocm93IG5ldyBFcnJvcignd3RmPycpXG59XG5cbi8vIHJlcGxhY2Ugc3R1ZmYgbGlrZSBcXCogd2l0aCAqXG5mdW5jdGlvbiBnbG9iVW5lc2NhcGUgKHMpIHtcbiAgcmV0dXJuIHMucmVwbGFjZSgvXFxcXCguKS9nLCAnJDEnKVxufVxuXG5mdW5jdGlvbiByZWdFeHBFc2NhcGUgKHMpIHtcbiAgcmV0dXJuIHMucmVwbGFjZSgvWy1bXFxde30oKSorPy4sXFxcXF4kfCNcXHNdL2csICdcXFxcJCYnKVxufVxuIiwidmFyIHdyYXBweSA9IHJlcXVpcmUoJ3dyYXBweScpXG5tb2R1bGUuZXhwb3J0cyA9IHdyYXBweShvbmNlKVxubW9kdWxlLmV4cG9ydHMuc3RyaWN0ID0gd3JhcHB5KG9uY2VTdHJpY3QpXG5cbm9uY2UucHJvdG8gPSBvbmNlKGZ1bmN0aW9uICgpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZ1bmN0aW9uLnByb3RvdHlwZSwgJ29uY2UnLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBvbmNlKHRoaXMpXG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSlcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnVuY3Rpb24ucHJvdG90eXBlLCAnb25jZVN0cmljdCcsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG9uY2VTdHJpY3QodGhpcylcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KVxufSlcblxuZnVuY3Rpb24gb25jZSAoZm4pIHtcbiAgdmFyIGYgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGYuY2FsbGVkKSByZXR1cm4gZi52YWx1ZVxuICAgIGYuY2FsbGVkID0gdHJ1ZVxuICAgIHJldHVybiBmLnZhbHVlID0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICB9XG4gIGYuY2FsbGVkID0gZmFsc2VcbiAgcmV0dXJuIGZcbn1cblxuZnVuY3Rpb24gb25jZVN0cmljdCAoZm4pIHtcbiAgdmFyIGYgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGYuY2FsbGVkKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGYub25jZUVycm9yKVxuICAgIGYuY2FsbGVkID0gdHJ1ZVxuICAgIHJldHVybiBmLnZhbHVlID0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICB9XG4gIHZhciBuYW1lID0gZm4ubmFtZSB8fCAnRnVuY3Rpb24gd3JhcHBlZCB3aXRoIGBvbmNlYCdcbiAgZi5vbmNlRXJyb3IgPSBuYW1lICsgXCIgc2hvdWxkbid0IGJlIGNhbGxlZCBtb3JlIHRoYW4gb25jZVwiXG4gIGYuY2FsbGVkID0gZmFsc2VcbiAgcmV0dXJuIGZcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gcG9zaXgocGF0aCkge1xuXHRyZXR1cm4gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbn1cblxuZnVuY3Rpb24gd2luMzIocGF0aCkge1xuXHQvLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvYmxvYi9iM2ZjYzI0NWZiMjU1Mzk5MDllZjFkNWVhYTAxZGJmOTJlMTY4NjMzL2xpYi9wYXRoLmpzI0w1NlxuXHR2YXIgc3BsaXREZXZpY2VSZSA9IC9eKFthLXpBLVpdOnxbXFxcXFxcL117Mn1bXlxcXFxcXC9dK1tcXFxcXFwvXStbXlxcXFxcXC9dKyk/KFtcXFxcXFwvXSk/KFtcXHNcXFNdKj8pJC87XG5cdHZhciByZXN1bHQgPSBzcGxpdERldmljZVJlLmV4ZWMocGF0aCk7XG5cdHZhciBkZXZpY2UgPSByZXN1bHRbMV0gfHwgJyc7XG5cdHZhciBpc1VuYyA9IEJvb2xlYW4oZGV2aWNlICYmIGRldmljZS5jaGFyQXQoMSkgIT09ICc6Jyk7XG5cblx0Ly8gVU5DIHBhdGhzIGFyZSBhbHdheXMgYWJzb2x1dGVcblx0cmV0dXJuIEJvb2xlYW4ocmVzdWx0WzJdIHx8IGlzVW5jKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInID8gd2luMzIgOiBwb3NpeDtcbm1vZHVsZS5leHBvcnRzLnBvc2l4ID0gcG9zaXg7XG5tb2R1bGUuZXhwb3J0cy53aW4zMiA9IHdpbjMyO1xuIiwiY29uc3QgYXNzZXJ0ID0gcmVxdWlyZShcImFzc2VydFwiKVxuY29uc3QgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpXG5jb25zdCBmcyA9IHJlcXVpcmUoXCJmc1wiKVxubGV0IGdsb2IgPSB1bmRlZmluZWRcbnRyeSB7XG4gIGdsb2IgPSByZXF1aXJlKFwiZ2xvYlwiKVxufSBjYXRjaCAoX2Vycikge1xuICAvLyB0cmVhdCBnbG9iIGFzIG9wdGlvbmFsLlxufVxuXG5jb25zdCBkZWZhdWx0R2xvYk9wdHMgPSB7XG4gIG5vc29ydDogdHJ1ZSxcbiAgc2lsZW50OiB0cnVlXG59XG5cbi8vIGZvciBFTUZJTEUgaGFuZGxpbmdcbmxldCB0aW1lb3V0ID0gMFxuXG5jb25zdCBpc1dpbmRvd3MgPSAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiKVxuXG5jb25zdCBkZWZhdWx0cyA9IG9wdGlvbnMgPT4ge1xuICBjb25zdCBtZXRob2RzID0gW1xuICAgICd1bmxpbmsnLFxuICAgICdjaG1vZCcsXG4gICAgJ3N0YXQnLFxuICAgICdsc3RhdCcsXG4gICAgJ3JtZGlyJyxcbiAgICAncmVhZGRpcidcbiAgXVxuICBtZXRob2RzLmZvckVhY2gobSA9PiB7XG4gICAgb3B0aW9uc1ttXSA9IG9wdGlvbnNbbV0gfHwgZnNbbV1cbiAgICBtID0gbSArICdTeW5jJ1xuICAgIG9wdGlvbnNbbV0gPSBvcHRpb25zW21dIHx8IGZzW21dXG4gIH0pXG5cbiAgb3B0aW9ucy5tYXhCdXN5VHJpZXMgPSBvcHRpb25zLm1heEJ1c3lUcmllcyB8fCAzXG4gIG9wdGlvbnMuZW1maWxlV2FpdCA9IG9wdGlvbnMuZW1maWxlV2FpdCB8fCAxMDAwXG4gIGlmIChvcHRpb25zLmdsb2IgPT09IGZhbHNlKSB7XG4gICAgb3B0aW9ucy5kaXNhYmxlR2xvYiA9IHRydWVcbiAgfVxuICBpZiAob3B0aW9ucy5kaXNhYmxlR2xvYiAhPT0gdHJ1ZSAmJiBnbG9iID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBFcnJvcignZ2xvYiBkZXBlbmRlbmN5IG5vdCBmb3VuZCwgc2V0IGBvcHRpb25zLmRpc2FibGVHbG9iID0gdHJ1ZWAgaWYgaW50ZW50aW9uYWwnKVxuICB9XG4gIG9wdGlvbnMuZGlzYWJsZUdsb2IgPSBvcHRpb25zLmRpc2FibGVHbG9iIHx8IGZhbHNlXG4gIG9wdGlvbnMuZ2xvYiA9IG9wdGlvbnMuZ2xvYiB8fCBkZWZhdWx0R2xvYk9wdHNcbn1cblxuY29uc3QgcmltcmFmID0gKHAsIG9wdGlvbnMsIGNiKSA9PiB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiID0gb3B0aW9uc1xuICAgIG9wdGlvbnMgPSB7fVxuICB9XG5cbiAgYXNzZXJ0KHAsICdyaW1yYWY6IG1pc3NpbmcgcGF0aCcpXG4gIGFzc2VydC5lcXVhbCh0eXBlb2YgcCwgJ3N0cmluZycsICdyaW1yYWY6IHBhdGggc2hvdWxkIGJlIGEgc3RyaW5nJylcbiAgYXNzZXJ0LmVxdWFsKHR5cGVvZiBjYiwgJ2Z1bmN0aW9uJywgJ3JpbXJhZjogY2FsbGJhY2sgZnVuY3Rpb24gcmVxdWlyZWQnKVxuICBhc3NlcnQob3B0aW9ucywgJ3JpbXJhZjogaW52YWxpZCBvcHRpb25zIGFyZ3VtZW50IHByb3ZpZGVkJylcbiAgYXNzZXJ0LmVxdWFsKHR5cGVvZiBvcHRpb25zLCAnb2JqZWN0JywgJ3JpbXJhZjogb3B0aW9ucyBzaG91bGQgYmUgb2JqZWN0JylcblxuICBkZWZhdWx0cyhvcHRpb25zKVxuXG4gIGxldCBidXN5VHJpZXMgPSAwXG4gIGxldCBlcnJTdGF0ZSA9IG51bGxcbiAgbGV0IG4gPSAwXG5cbiAgY29uc3QgbmV4dCA9IChlcikgPT4ge1xuICAgIGVyclN0YXRlID0gZXJyU3RhdGUgfHwgZXJcbiAgICBpZiAoLS1uID09PSAwKVxuICAgICAgY2IoZXJyU3RhdGUpXG4gIH1cblxuICBjb25zdCBhZnRlckdsb2IgPSAoZXIsIHJlc3VsdHMpID0+IHtcbiAgICBpZiAoZXIpXG4gICAgICByZXR1cm4gY2IoZXIpXG5cbiAgICBuID0gcmVzdWx0cy5sZW5ndGhcbiAgICBpZiAobiA9PT0gMClcbiAgICAgIHJldHVybiBjYigpXG5cbiAgICByZXN1bHRzLmZvckVhY2gocCA9PiB7XG4gICAgICBjb25zdCBDQiA9IChlcikgPT4ge1xuICAgICAgICBpZiAoZXIpIHtcbiAgICAgICAgICBpZiAoKGVyLmNvZGUgPT09IFwiRUJVU1lcIiB8fCBlci5jb2RlID09PSBcIkVOT1RFTVBUWVwiIHx8IGVyLmNvZGUgPT09IFwiRVBFUk1cIikgJiZcbiAgICAgICAgICAgICAgYnVzeVRyaWVzIDwgb3B0aW9ucy5tYXhCdXN5VHJpZXMpIHtcbiAgICAgICAgICAgIGJ1c3lUcmllcyArK1xuICAgICAgICAgICAgLy8gdHJ5IGFnYWluLCB3aXRoIHRoZSBzYW1lIGV4YWN0IGNhbGxiYWNrIGFzIHRoaXMgb25lLlxuICAgICAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoKCkgPT4gcmltcmFmXyhwLCBvcHRpb25zLCBDQiksIGJ1c3lUcmllcyAqIDEwMClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyB0aGlzIG9uZSB3b24ndCBoYXBwZW4gaWYgZ3JhY2VmdWwtZnMgaXMgdXNlZC5cbiAgICAgICAgICBpZiAoZXIuY29kZSA9PT0gXCJFTUZJTEVcIiAmJiB0aW1lb3V0IDwgb3B0aW9ucy5lbWZpbGVXYWl0KSB7XG4gICAgICAgICAgICByZXR1cm4gc2V0VGltZW91dCgoKSA9PiByaW1yYWZfKHAsIG9wdGlvbnMsIENCKSwgdGltZW91dCArKylcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBhbHJlYWR5IGdvbmVcbiAgICAgICAgICBpZiAoZXIuY29kZSA9PT0gXCJFTk9FTlRcIikgZXIgPSBudWxsXG4gICAgICAgIH1cblxuICAgICAgICB0aW1lb3V0ID0gMFxuICAgICAgICBuZXh0KGVyKVxuICAgICAgfVxuICAgICAgcmltcmFmXyhwLCBvcHRpb25zLCBDQilcbiAgICB9KVxuICB9XG5cbiAgaWYgKG9wdGlvbnMuZGlzYWJsZUdsb2IgfHwgIWdsb2IuaGFzTWFnaWMocCkpXG4gICAgcmV0dXJuIGFmdGVyR2xvYihudWxsLCBbcF0pXG5cbiAgb3B0aW9ucy5sc3RhdChwLCAoZXIsIHN0YXQpID0+IHtcbiAgICBpZiAoIWVyKVxuICAgICAgcmV0dXJuIGFmdGVyR2xvYihudWxsLCBbcF0pXG5cbiAgICBnbG9iKHAsIG9wdGlvbnMuZ2xvYiwgYWZ0ZXJHbG9iKVxuICB9KVxuXG59XG5cbi8vIFR3byBwb3NzaWJsZSBzdHJhdGVnaWVzLlxuLy8gMS4gQXNzdW1lIGl0J3MgYSBmaWxlLiAgdW5saW5rIGl0LCB0aGVuIGRvIHRoZSBkaXIgc3R1ZmYgb24gRVBFUk0gb3IgRUlTRElSXG4vLyAyLiBBc3N1bWUgaXQncyBhIGRpcmVjdG9yeS4gIHJlYWRkaXIsIHRoZW4gZG8gdGhlIGZpbGUgc3R1ZmYgb24gRU5PVERJUlxuLy9cbi8vIEJvdGggcmVzdWx0IGluIGFuIGV4dHJhIHN5c2NhbGwgd2hlbiB5b3UgZ3Vlc3Mgd3JvbmcuICBIb3dldmVyLCB0aGVyZVxuLy8gYXJlIGxpa2VseSBmYXIgbW9yZSBub3JtYWwgZmlsZXMgaW4gdGhlIHdvcmxkIHRoYW4gZGlyZWN0b3JpZXMuICBUaGlzXG4vLyBpcyBiYXNlZCBvbiB0aGUgYXNzdW1wdGlvbiB0aGF0IGEgdGhlIGF2ZXJhZ2UgbnVtYmVyIG9mIGZpbGVzIHBlclxuLy8gZGlyZWN0b3J5IGlzID49IDEuXG4vL1xuLy8gSWYgYW55b25lIGV2ZXIgY29tcGxhaW5zIGFib3V0IHRoaXMsIHRoZW4gSSBndWVzcyB0aGUgc3RyYXRlZ3kgY291bGRcbi8vIGJlIG1hZGUgY29uZmlndXJhYmxlIHNvbWVob3cuICBCdXQgdW50aWwgdGhlbiwgWUFHTkkuXG5jb25zdCByaW1yYWZfID0gKHAsIG9wdGlvbnMsIGNiKSA9PiB7XG4gIGFzc2VydChwKVxuICBhc3NlcnQob3B0aW9ucylcbiAgYXNzZXJ0KHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJylcblxuICAvLyBzdW5vcyBsZXRzIHRoZSByb290IHVzZXIgdW5saW5rIGRpcmVjdG9yaWVzLCB3aGljaCBpcy4uLiB3ZWlyZC5cbiAgLy8gc28gd2UgaGF2ZSB0byBsc3RhdCBoZXJlIGFuZCBtYWtlIHN1cmUgaXQncyBub3QgYSBkaXIuXG4gIG9wdGlvbnMubHN0YXQocCwgKGVyLCBzdCkgPT4ge1xuICAgIGlmIChlciAmJiBlci5jb2RlID09PSBcIkVOT0VOVFwiKVxuICAgICAgcmV0dXJuIGNiKG51bGwpXG5cbiAgICAvLyBXaW5kb3dzIGNhbiBFUEVSTSBvbiBzdGF0LiAgTGlmZSBpcyBzdWZmZXJpbmcuXG4gICAgaWYgKGVyICYmIGVyLmNvZGUgPT09IFwiRVBFUk1cIiAmJiBpc1dpbmRvd3MpXG4gICAgICBmaXhXaW5FUEVSTShwLCBvcHRpb25zLCBlciwgY2IpXG5cbiAgICBpZiAoc3QgJiYgc3QuaXNEaXJlY3RvcnkoKSlcbiAgICAgIHJldHVybiBybWRpcihwLCBvcHRpb25zLCBlciwgY2IpXG5cbiAgICBvcHRpb25zLnVubGluayhwLCBlciA9PiB7XG4gICAgICBpZiAoZXIpIHtcbiAgICAgICAgaWYgKGVyLmNvZGUgPT09IFwiRU5PRU5UXCIpXG4gICAgICAgICAgcmV0dXJuIGNiKG51bGwpXG4gICAgICAgIGlmIChlci5jb2RlID09PSBcIkVQRVJNXCIpXG4gICAgICAgICAgcmV0dXJuIChpc1dpbmRvd3MpXG4gICAgICAgICAgICA/IGZpeFdpbkVQRVJNKHAsIG9wdGlvbnMsIGVyLCBjYilcbiAgICAgICAgICAgIDogcm1kaXIocCwgb3B0aW9ucywgZXIsIGNiKVxuICAgICAgICBpZiAoZXIuY29kZSA9PT0gXCJFSVNESVJcIilcbiAgICAgICAgICByZXR1cm4gcm1kaXIocCwgb3B0aW9ucywgZXIsIGNiKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGNiKGVyKVxuICAgIH0pXG4gIH0pXG59XG5cbmNvbnN0IGZpeFdpbkVQRVJNID0gKHAsIG9wdGlvbnMsIGVyLCBjYikgPT4ge1xuICBhc3NlcnQocClcbiAgYXNzZXJ0KG9wdGlvbnMpXG4gIGFzc2VydCh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpXG5cbiAgb3B0aW9ucy5jaG1vZChwLCAwbzY2NiwgZXIyID0+IHtcbiAgICBpZiAoZXIyKVxuICAgICAgY2IoZXIyLmNvZGUgPT09IFwiRU5PRU5UXCIgPyBudWxsIDogZXIpXG4gICAgZWxzZVxuICAgICAgb3B0aW9ucy5zdGF0KHAsIChlcjMsIHN0YXRzKSA9PiB7XG4gICAgICAgIGlmIChlcjMpXG4gICAgICAgICAgY2IoZXIzLmNvZGUgPT09IFwiRU5PRU5UXCIgPyBudWxsIDogZXIpXG4gICAgICAgIGVsc2UgaWYgKHN0YXRzLmlzRGlyZWN0b3J5KCkpXG4gICAgICAgICAgcm1kaXIocCwgb3B0aW9ucywgZXIsIGNiKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgb3B0aW9ucy51bmxpbmsocCwgY2IpXG4gICAgICB9KVxuICB9KVxufVxuXG5jb25zdCBmaXhXaW5FUEVSTVN5bmMgPSAocCwgb3B0aW9ucywgZXIpID0+IHtcbiAgYXNzZXJ0KHApXG4gIGFzc2VydChvcHRpb25zKVxuXG4gIHRyeSB7XG4gICAgb3B0aW9ucy5jaG1vZFN5bmMocCwgMG82NjYpXG4gIH0gY2F0Y2ggKGVyMikge1xuICAgIGlmIChlcjIuY29kZSA9PT0gXCJFTk9FTlRcIilcbiAgICAgIHJldHVyblxuICAgIGVsc2VcbiAgICAgIHRocm93IGVyXG4gIH1cblxuICBsZXQgc3RhdHNcbiAgdHJ5IHtcbiAgICBzdGF0cyA9IG9wdGlvbnMuc3RhdFN5bmMocClcbiAgfSBjYXRjaCAoZXIzKSB7XG4gICAgaWYgKGVyMy5jb2RlID09PSBcIkVOT0VOVFwiKVxuICAgICAgcmV0dXJuXG4gICAgZWxzZVxuICAgICAgdGhyb3cgZXJcbiAgfVxuXG4gIGlmIChzdGF0cy5pc0RpcmVjdG9yeSgpKVxuICAgIHJtZGlyU3luYyhwLCBvcHRpb25zLCBlcilcbiAgZWxzZVxuICAgIG9wdGlvbnMudW5saW5rU3luYyhwKVxufVxuXG5jb25zdCBybWRpciA9IChwLCBvcHRpb25zLCBvcmlnaW5hbEVyLCBjYikgPT4ge1xuICBhc3NlcnQocClcbiAgYXNzZXJ0KG9wdGlvbnMpXG4gIGFzc2VydCh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpXG5cbiAgLy8gdHJ5IHRvIHJtZGlyIGZpcnN0LCBhbmQgb25seSByZWFkZGlyIG9uIEVOT1RFTVBUWSBvciBFRVhJU1QgKFN1bk9TKVxuICAvLyBpZiB3ZSBndWVzc2VkIHdyb25nLCBhbmQgaXQncyBub3QgYSBkaXJlY3RvcnksIHRoZW5cbiAgLy8gcmFpc2UgdGhlIG9yaWdpbmFsIGVycm9yLlxuICBvcHRpb25zLnJtZGlyKHAsIGVyID0+IHtcbiAgICBpZiAoZXIgJiYgKGVyLmNvZGUgPT09IFwiRU5PVEVNUFRZXCIgfHwgZXIuY29kZSA9PT0gXCJFRVhJU1RcIiB8fCBlci5jb2RlID09PSBcIkVQRVJNXCIpKVxuICAgICAgcm1raWRzKHAsIG9wdGlvbnMsIGNiKVxuICAgIGVsc2UgaWYgKGVyICYmIGVyLmNvZGUgPT09IFwiRU5PVERJUlwiKVxuICAgICAgY2Iob3JpZ2luYWxFcilcbiAgICBlbHNlXG4gICAgICBjYihlcilcbiAgfSlcbn1cblxuY29uc3Qgcm1raWRzID0gKHAsIG9wdGlvbnMsIGNiKSA9PiB7XG4gIGFzc2VydChwKVxuICBhc3NlcnQob3B0aW9ucylcbiAgYXNzZXJ0KHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJylcblxuICBvcHRpb25zLnJlYWRkaXIocCwgKGVyLCBmaWxlcykgPT4ge1xuICAgIGlmIChlcilcbiAgICAgIHJldHVybiBjYihlcilcbiAgICBsZXQgbiA9IGZpbGVzLmxlbmd0aFxuICAgIGlmIChuID09PSAwKVxuICAgICAgcmV0dXJuIG9wdGlvbnMucm1kaXIocCwgY2IpXG4gICAgbGV0IGVyclN0YXRlXG4gICAgZmlsZXMuZm9yRWFjaChmID0+IHtcbiAgICAgIHJpbXJhZihwYXRoLmpvaW4ocCwgZiksIG9wdGlvbnMsIGVyID0+IHtcbiAgICAgICAgaWYgKGVyclN0YXRlKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICBpZiAoZXIpXG4gICAgICAgICAgcmV0dXJuIGNiKGVyclN0YXRlID0gZXIpXG4gICAgICAgIGlmICgtLW4gPT09IDApXG4gICAgICAgICAgb3B0aW9ucy5ybWRpcihwLCBjYilcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbn1cblxuLy8gdGhpcyBsb29rcyBzaW1wbGVyLCBhbmQgaXMgc3RyaWN0bHkgKmZhc3RlciosIGJ1dCB3aWxsXG4vLyB0aWUgdXAgdGhlIEphdmFTY3JpcHQgdGhyZWFkIGFuZCBmYWlsIG9uIGV4Y2Vzc2l2ZWx5XG4vLyBkZWVwIGRpcmVjdG9yeSB0cmVlcy5cbmNvbnN0IHJpbXJhZlN5bmMgPSAocCwgb3B0aW9ucykgPT4ge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICBkZWZhdWx0cyhvcHRpb25zKVxuXG4gIGFzc2VydChwLCAncmltcmFmOiBtaXNzaW5nIHBhdGgnKVxuICBhc3NlcnQuZXF1YWwodHlwZW9mIHAsICdzdHJpbmcnLCAncmltcmFmOiBwYXRoIHNob3VsZCBiZSBhIHN0cmluZycpXG4gIGFzc2VydChvcHRpb25zLCAncmltcmFmOiBtaXNzaW5nIG9wdGlvbnMnKVxuICBhc3NlcnQuZXF1YWwodHlwZW9mIG9wdGlvbnMsICdvYmplY3QnLCAncmltcmFmOiBvcHRpb25zIHNob3VsZCBiZSBvYmplY3QnKVxuXG4gIGxldCByZXN1bHRzXG5cbiAgaWYgKG9wdGlvbnMuZGlzYWJsZUdsb2IgfHwgIWdsb2IuaGFzTWFnaWMocCkpIHtcbiAgICByZXN1bHRzID0gW3BdXG4gIH0gZWxzZSB7XG4gICAgdHJ5IHtcbiAgICAgIG9wdGlvbnMubHN0YXRTeW5jKHApXG4gICAgICByZXN1bHRzID0gW3BdXG4gICAgfSBjYXRjaCAoZXIpIHtcbiAgICAgIHJlc3VsdHMgPSBnbG9iLnN5bmMocCwgb3B0aW9ucy5nbG9iKVxuICAgIH1cbiAgfVxuXG4gIGlmICghcmVzdWx0cy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcCA9IHJlc3VsdHNbaV1cblxuICAgIGxldCBzdFxuICAgIHRyeSB7XG4gICAgICBzdCA9IG9wdGlvbnMubHN0YXRTeW5jKHApXG4gICAgfSBjYXRjaCAoZXIpIHtcbiAgICAgIGlmIChlci5jb2RlID09PSBcIkVOT0VOVFwiKVxuICAgICAgICByZXR1cm5cblxuICAgICAgLy8gV2luZG93cyBjYW4gRVBFUk0gb24gc3RhdC4gIExpZmUgaXMgc3VmZmVyaW5nLlxuICAgICAgaWYgKGVyLmNvZGUgPT09IFwiRVBFUk1cIiAmJiBpc1dpbmRvd3MpXG4gICAgICAgIGZpeFdpbkVQRVJNU3luYyhwLCBvcHRpb25zLCBlcilcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgLy8gc3Vub3MgbGV0cyB0aGUgcm9vdCB1c2VyIHVubGluayBkaXJlY3Rvcmllcywgd2hpY2ggaXMuLi4gd2VpcmQuXG4gICAgICBpZiAoc3QgJiYgc3QuaXNEaXJlY3RvcnkoKSlcbiAgICAgICAgcm1kaXJTeW5jKHAsIG9wdGlvbnMsIG51bGwpXG4gICAgICBlbHNlXG4gICAgICAgIG9wdGlvbnMudW5saW5rU3luYyhwKVxuICAgIH0gY2F0Y2ggKGVyKSB7XG4gICAgICBpZiAoZXIuY29kZSA9PT0gXCJFTk9FTlRcIilcbiAgICAgICAgcmV0dXJuXG4gICAgICBpZiAoZXIuY29kZSA9PT0gXCJFUEVSTVwiKVxuICAgICAgICByZXR1cm4gaXNXaW5kb3dzID8gZml4V2luRVBFUk1TeW5jKHAsIG9wdGlvbnMsIGVyKSA6IHJtZGlyU3luYyhwLCBvcHRpb25zLCBlcilcbiAgICAgIGlmIChlci5jb2RlICE9PSBcIkVJU0RJUlwiKVxuICAgICAgICB0aHJvdyBlclxuXG4gICAgICBybWRpclN5bmMocCwgb3B0aW9ucywgZXIpXG4gICAgfVxuICB9XG59XG5cbmNvbnN0IHJtZGlyU3luYyA9IChwLCBvcHRpb25zLCBvcmlnaW5hbEVyKSA9PiB7XG4gIGFzc2VydChwKVxuICBhc3NlcnQob3B0aW9ucylcblxuICB0cnkge1xuICAgIG9wdGlvbnMucm1kaXJTeW5jKHApXG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgaWYgKGVyLmNvZGUgPT09IFwiRU5PRU5UXCIpXG4gICAgICByZXR1cm5cbiAgICBpZiAoZXIuY29kZSA9PT0gXCJFTk9URElSXCIpXG4gICAgICB0aHJvdyBvcmlnaW5hbEVyXG4gICAgaWYgKGVyLmNvZGUgPT09IFwiRU5PVEVNUFRZXCIgfHwgZXIuY29kZSA9PT0gXCJFRVhJU1RcIiB8fCBlci5jb2RlID09PSBcIkVQRVJNXCIpXG4gICAgICBybWtpZHNTeW5jKHAsIG9wdGlvbnMpXG4gIH1cbn1cblxuY29uc3Qgcm1raWRzU3luYyA9IChwLCBvcHRpb25zKSA9PiB7XG4gIGFzc2VydChwKVxuICBhc3NlcnQob3B0aW9ucylcbiAgb3B0aW9ucy5yZWFkZGlyU3luYyhwKS5mb3JFYWNoKGYgPT4gcmltcmFmU3luYyhwYXRoLmpvaW4ocCwgZiksIG9wdGlvbnMpKVxuXG4gIC8vIFdlIG9ubHkgZW5kIHVwIGhlcmUgb25jZSB3ZSBnb3QgRU5PVEVNUFRZIGF0IGxlYXN0IG9uY2UsIGFuZFxuICAvLyBhdCB0aGlzIHBvaW50LCB3ZSBhcmUgZ3VhcmFudGVlZCB0byBoYXZlIHJlbW92ZWQgYWxsIHRoZSBraWRzLlxuICAvLyBTbywgd2Uga25vdyB0aGF0IGl0IHdvbid0IGJlIEVOT0VOVCBvciBFTk9URElSIG9yIGFueXRoaW5nIGVsc2UuXG4gIC8vIHRyeSByZWFsbHkgaGFyZCB0byBkZWxldGUgc3R1ZmYgb24gd2luZG93cywgYmVjYXVzZSBpdCBoYXMgYVxuICAvLyBQUk9GT1VORExZIGFubm95aW5nIGhhYml0IG9mIG5vdCBjbG9zaW5nIGhhbmRsZXMgcHJvbXB0bHkgd2hlblxuICAvLyBmaWxlcyBhcmUgZGVsZXRlZCwgcmVzdWx0aW5nIGluIHNwdXJpb3VzIEVOT1RFTVBUWSBlcnJvcnMuXG4gIGNvbnN0IHJldHJpZXMgPSBpc1dpbmRvd3MgPyAxMDAgOiAxXG4gIGxldCBpID0gMFxuICBkbyB7XG4gICAgbGV0IHRocmV3ID0gdHJ1ZVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXQgPSBvcHRpb25zLnJtZGlyU3luYyhwLCBvcHRpb25zKVxuICAgICAgdGhyZXcgPSBmYWxzZVxuICAgICAgcmV0dXJuIHJldFxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoKytpIDwgcmV0cmllcyAmJiB0aHJldylcbiAgICAgICAgY29udGludWVcbiAgICB9XG4gIH0gd2hpbGUgKHRydWUpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmltcmFmXG5yaW1yYWYuc3luYyA9IHJpbXJhZlN5bmNcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgeyBwcm9taXNpZnkgfSA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xuY29uc3QgdG1wID0gcmVxdWlyZShcInRtcFwiKTtcblxuLy8gZmlsZVxubW9kdWxlLmV4cG9ydHMuZmlsZVN5bmMgPSB0bXAuZmlsZVN5bmM7XG5jb25zdCBmaWxlV2l0aE9wdGlvbnMgPSBwcm9taXNpZnkoKG9wdGlvbnMsIGNiKSA9PlxuICB0bXAuZmlsZShvcHRpb25zLCAoZXJyLCBwYXRoLCBmZCwgY2xlYW51cCkgPT5cbiAgICBlcnIgPyBjYihlcnIpIDogY2IodW5kZWZpbmVkLCB7IHBhdGgsIGZkLCBjbGVhbnVwOiBwcm9taXNpZnkoY2xlYW51cCkgfSlcbiAgKVxuKTtcbm1vZHVsZS5leHBvcnRzLmZpbGUgPSBhc3luYyAob3B0aW9ucykgPT4gZmlsZVdpdGhPcHRpb25zKG9wdGlvbnMpO1xuXG5tb2R1bGUuZXhwb3J0cy53aXRoRmlsZSA9IGFzeW5jIGZ1bmN0aW9uIHdpdGhGaWxlKGZuLCBvcHRpb25zKSB7XG4gIGNvbnN0IHsgcGF0aCwgZmQsIGNsZWFudXAgfSA9IGF3YWl0IG1vZHVsZS5leHBvcnRzLmZpbGUob3B0aW9ucyk7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGF3YWl0IGZuKHsgcGF0aCwgZmQgfSk7XG4gIH0gZmluYWxseSB7XG4gICAgYXdhaXQgY2xlYW51cCgpO1xuICB9XG59O1xuXG5cbi8vIGRpcmVjdG9yeVxubW9kdWxlLmV4cG9ydHMuZGlyU3luYyA9IHRtcC5kaXJTeW5jO1xuY29uc3QgZGlyV2l0aE9wdGlvbnMgPSBwcm9taXNpZnkoKG9wdGlvbnMsIGNiKSA9PlxuICB0bXAuZGlyKG9wdGlvbnMsIChlcnIsIHBhdGgsIGNsZWFudXApID0+XG4gICAgZXJyID8gY2IoZXJyKSA6IGNiKHVuZGVmaW5lZCwgeyBwYXRoLCBjbGVhbnVwOiBwcm9taXNpZnkoY2xlYW51cCkgfSlcbiAgKVxuKTtcbm1vZHVsZS5leHBvcnRzLmRpciA9IGFzeW5jIChvcHRpb25zKSA9PiBkaXJXaXRoT3B0aW9ucyhvcHRpb25zKTtcblxubW9kdWxlLmV4cG9ydHMud2l0aERpciA9IGFzeW5jIGZ1bmN0aW9uIHdpdGhEaXIoZm4sIG9wdGlvbnMpIHtcbiAgY29uc3QgeyBwYXRoLCBjbGVhbnVwIH0gPSBhd2FpdCBtb2R1bGUuZXhwb3J0cy5kaXIob3B0aW9ucyk7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGF3YWl0IGZuKHsgcGF0aCB9KTtcbiAgfSBmaW5hbGx5IHtcbiAgICBhd2FpdCBjbGVhbnVwKCk7XG4gIH1cbn07XG5cblxuLy8gbmFtZSBnZW5lcmF0aW9uXG5tb2R1bGUuZXhwb3J0cy50bXBOYW1lU3luYyA9IHRtcC50bXBOYW1lU3luYztcbm1vZHVsZS5leHBvcnRzLnRtcE5hbWUgPSBwcm9taXNpZnkodG1wLnRtcE5hbWUpO1xuXG5tb2R1bGUuZXhwb3J0cy50bXBkaXIgPSB0bXAudG1wZGlyO1xuXG5tb2R1bGUuZXhwb3J0cy5zZXRHcmFjZWZ1bENsZWFudXAgPSB0bXAuc2V0R3JhY2VmdWxDbGVhbnVwO1xuIiwiLyohXG4gKiBUbXBcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxNyBLQVJBU1pJIElzdHZhbiA8Z2l0aHViQHNwYW0ucmFzemkuaHU+XG4gKlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuLypcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IG9zID0gcmVxdWlyZSgnb3MnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKTtcbmNvbnN0IF9jID0geyBmczogZnMuY29uc3RhbnRzLCBvczogb3MuY29uc3RhbnRzIH07XG5jb25zdCByaW1yYWYgPSByZXF1aXJlKCdyaW1yYWYnKTtcblxuLypcbiAqIFRoZSB3b3JraW5nIGlubmVyIHZhcmlhYmxlcy5cbiAqL1xuY29uc3RcbiAgLy8gdGhlIHJhbmRvbSBjaGFyYWN0ZXJzIHRvIGNob29zZSBmcm9tXG4gIFJBTkRPTV9DSEFSUyA9ICcwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eicsXG5cbiAgVEVNUExBVEVfUEFUVEVSTiA9IC9YWFhYWFgvLFxuXG4gIERFRkFVTFRfVFJJRVMgPSAzLFxuXG4gIENSRUFURV9GTEFHUyA9IChfYy5PX0NSRUFUIHx8IF9jLmZzLk9fQ1JFQVQpIHwgKF9jLk9fRVhDTCB8fCBfYy5mcy5PX0VYQ0wpIHwgKF9jLk9fUkRXUiB8fCBfYy5mcy5PX1JEV1IpLFxuXG4gIC8vIGNvbnN0YW50cyBhcmUgb2ZmIG9uIHRoZSB3aW5kb3dzIHBsYXRmb3JtIGFuZCB3aWxsIG5vdCBtYXRjaCB0aGUgYWN0dWFsIGVycm5vIGNvZGVzXG4gIElTX1dJTjMyID0gb3MucGxhdGZvcm0oKSA9PT0gJ3dpbjMyJyxcbiAgRUJBREYgPSBfYy5FQkFERiB8fCBfYy5vcy5lcnJuby5FQkFERixcbiAgRU5PRU5UID0gX2MuRU5PRU5UIHx8IF9jLm9zLmVycm5vLkVOT0VOVCxcblxuICBESVJfTU9ERSA9IDBvNzAwIC8qIDQ0OCAqLyxcbiAgRklMRV9NT0RFID0gMG82MDAgLyogMzg0ICovLFxuXG4gIEVYSVQgPSAnZXhpdCcsXG5cbiAgLy8gdGhpcyB3aWxsIGhvbGQgdGhlIG9iamVjdHMgbmVlZCB0byBiZSByZW1vdmVkIG9uIGV4aXRcbiAgX3JlbW92ZU9iamVjdHMgPSBbXSxcblxuICAvLyBBUEkgY2hhbmdlIGluIGZzLnJtZGlyU3luYyBsZWFkcyB0byBlcnJvciB3aGVuIHBhc3NpbmcgaW4gYSBzZWNvbmQgcGFyYW1ldGVyLCBlLmcuIHRoZSBjYWxsYmFja1xuICBGTl9STURJUl9TWU5DID0gZnMucm1kaXJTeW5jLmJpbmQoZnMpLFxuICBGTl9SSU1SQUZfU1lOQyA9IHJpbXJhZi5zeW5jO1xuXG5sZXRcbiAgX2dyYWNlZnVsQ2xlYW51cCA9IGZhbHNlO1xuXG4vKipcbiAqIEdldHMgYSB0ZW1wb3JhcnkgZmlsZSBuYW1lLlxuICpcbiAqIEBwYXJhbSB7KE9wdGlvbnN8dG1wTmFtZUNhbGxiYWNrKX0gb3B0aW9ucyBvcHRpb25zIG9yIGNhbGxiYWNrXG4gKiBAcGFyYW0gez90bXBOYW1lQ2FsbGJhY2t9IGNhbGxiYWNrIHRoZSBjYWxsYmFjayBmdW5jdGlvblxuICovXG5mdW5jdGlvbiB0bXBOYW1lKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIGNvbnN0XG4gICAgYXJncyA9IF9wYXJzZUFyZ3VtZW50cyhvcHRpb25zLCBjYWxsYmFjayksXG4gICAgb3B0cyA9IGFyZ3NbMF0sXG4gICAgY2IgPSBhcmdzWzFdO1xuXG4gIHRyeSB7XG4gICAgX2Fzc2VydEFuZFNhbml0aXplT3B0aW9ucyhvcHRzKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIGNiKGVycik7XG4gIH1cblxuICBsZXQgdHJpZXMgPSBvcHRzLnRyaWVzO1xuICAoZnVuY3Rpb24gX2dldFVuaXF1ZU5hbWUoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG5hbWUgPSBfZ2VuZXJhdGVUbXBOYW1lKG9wdHMpO1xuXG4gICAgICAvLyBjaGVjayB3aGV0aGVyIHRoZSBwYXRoIGV4aXN0cyB0aGVuIHJldHJ5IGlmIG5lZWRlZFxuICAgICAgZnMuc3RhdChuYW1lLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICAgIGlmICghZXJyKSB7XG4gICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgICAgICBpZiAodHJpZXMtLSA+IDApIHJldHVybiBfZ2V0VW5pcXVlTmFtZSgpO1xuXG4gICAgICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignQ291bGQgbm90IGdldCBhIHVuaXF1ZSB0bXAgZmlsZW5hbWUsIG1heCB0cmllcyByZWFjaGVkICcgKyBuYW1lKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjYihudWxsLCBuYW1lKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY2IoZXJyKTtcbiAgICB9XG4gIH0oKSk7XG59XG5cbi8qKlxuICogU3luY2hyb25vdXMgdmVyc2lvbiBvZiB0bXBOYW1lLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgZ2VuZXJhdGVkIHJhbmRvbSBuYW1lXG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgdGhlIG9wdGlvbnMgYXJlIGludmFsaWQgb3IgY291bGQgbm90IGdlbmVyYXRlIGEgZmlsZW5hbWVcbiAqL1xuZnVuY3Rpb24gdG1wTmFtZVN5bmMob3B0aW9ucykge1xuICBjb25zdFxuICAgIGFyZ3MgPSBfcGFyc2VBcmd1bWVudHMob3B0aW9ucyksXG4gICAgb3B0cyA9IGFyZ3NbMF07XG5cbiAgX2Fzc2VydEFuZFNhbml0aXplT3B0aW9ucyhvcHRzKTtcblxuICBsZXQgdHJpZXMgPSBvcHRzLnRyaWVzO1xuICBkbyB7XG4gICAgY29uc3QgbmFtZSA9IF9nZW5lcmF0ZVRtcE5hbWUob3B0cyk7XG4gICAgdHJ5IHtcbiAgICAgIGZzLnN0YXRTeW5jKG5hbWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBuYW1lO1xuICAgIH1cbiAgfSB3aGlsZSAodHJpZXMtLSA+IDApO1xuXG4gIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGdldCBhIHVuaXF1ZSB0bXAgZmlsZW5hbWUsIG1heCB0cmllcyByZWFjaGVkJyk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbmQgb3BlbnMgYSB0ZW1wb3JhcnkgZmlsZS5cbiAqXG4gKiBAcGFyYW0geyhPcHRpb25zfG51bGx8dW5kZWZpbmVkfGZpbGVDYWxsYmFjayl9IG9wdGlvbnMgdGhlIGNvbmZpZyBvcHRpb25zIG9yIHRoZSBjYWxsYmFjayBmdW5jdGlvbiBvciBudWxsIG9yIHVuZGVmaW5lZFxuICogQHBhcmFtIHs/ZmlsZUNhbGxiYWNrfSBjYWxsYmFja1xuICovXG5mdW5jdGlvbiBmaWxlKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIGNvbnN0XG4gICAgYXJncyA9IF9wYXJzZUFyZ3VtZW50cyhvcHRpb25zLCBjYWxsYmFjayksXG4gICAgb3B0cyA9IGFyZ3NbMF0sXG4gICAgY2IgPSBhcmdzWzFdO1xuXG4gIC8vIGdldHMgYSB0ZW1wb3JhcnkgZmlsZW5hbWVcbiAgdG1wTmFtZShvcHRzLCBmdW5jdGlvbiBfdG1wTmFtZUNyZWF0ZWQoZXJyLCBuYW1lKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICBpZiAoZXJyKSByZXR1cm4gY2IoZXJyKTtcblxuICAgIC8vIGNyZWF0ZSBhbmQgb3BlbiB0aGUgZmlsZVxuICAgIGZzLm9wZW4obmFtZSwgQ1JFQVRFX0ZMQUdTLCBvcHRzLm1vZGUgfHwgRklMRV9NT0RFLCBmdW5jdGlvbiBfZmlsZUNyZWF0ZWQoZXJyLCBmZCkge1xuICAgICAgLyogaXN0YW5idSBpZ25vcmUgZWxzZSAqL1xuICAgICAgaWYgKGVycikgcmV0dXJuIGNiKGVycik7XG5cbiAgICAgIGlmIChvcHRzLmRpc2NhcmREZXNjcmlwdG9yKSB7XG4gICAgICAgIHJldHVybiBmcy5jbG9zZShmZCwgZnVuY3Rpb24gX2Rpc2NhcmRDYWxsYmFjayhwb3NzaWJsZUVycikge1xuICAgICAgICAgIC8vIHRoZSBjaGFuY2Ugb2YgZ2V0dGluZyBhbiBlcnJvciBvbiBjbG9zZSBoZXJlIGlzIHJhdGhlciBsb3cgYW5kIG1pZ2h0IG9jY3VyIGluIHRoZSBtb3N0IGVkZ2llc3QgY2FzZXMgb25seVxuICAgICAgICAgIHJldHVybiBjYihwb3NzaWJsZUVyciwgbmFtZSwgdW5kZWZpbmVkLCBfcHJlcGFyZVRtcEZpbGVSZW1vdmVDYWxsYmFjayhuYW1lLCAtMSwgb3B0cywgZmFsc2UpKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBkZXRhY2hEZXNjcmlwdG9yIHBhc3NlcyB0aGUgZGVzY3JpcHRvciB3aGVyZWFzIGRpc2NhcmREZXNjcmlwdG9yIGNsb3NlcyBpdCwgZWl0aGVyIHdheSwgd2Ugbm8gbG9uZ2VyIGNhcmVcbiAgICAgICAgLy8gYWJvdXQgdGhlIGRlc2NyaXB0b3JcbiAgICAgICAgY29uc3QgZGlzY2FyZE9yRGV0YWNoRGVzY3JpcHRvciA9IG9wdHMuZGlzY2FyZERlc2NyaXB0b3IgfHwgb3B0cy5kZXRhY2hEZXNjcmlwdG9yO1xuICAgICAgICBjYihudWxsLCBuYW1lLCBmZCwgX3ByZXBhcmVUbXBGaWxlUmVtb3ZlQ2FsbGJhY2sobmFtZSwgZGlzY2FyZE9yRGV0YWNoRGVzY3JpcHRvciA/IC0xIDogZmQsIG9wdHMsIGZhbHNlKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFN5bmNocm9ub3VzIHZlcnNpb24gb2YgZmlsZS5cbiAqXG4gKiBAcGFyYW0ge09wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtGaWxlU3luY09iamVjdH0gb2JqZWN0IGNvbnNpc3RzIG9mIG5hbWUsIGZkIGFuZCByZW1vdmVDYWxsYmFja1xuICogQHRocm93cyB7RXJyb3J9IGlmIGNhbm5vdCBjcmVhdGUgYSBmaWxlXG4gKi9cbmZ1bmN0aW9uIGZpbGVTeW5jKG9wdGlvbnMpIHtcbiAgY29uc3RcbiAgICBhcmdzID0gX3BhcnNlQXJndW1lbnRzKG9wdGlvbnMpLFxuICAgIG9wdHMgPSBhcmdzWzBdO1xuXG4gIGNvbnN0IGRpc2NhcmRPckRldGFjaERlc2NyaXB0b3IgPSBvcHRzLmRpc2NhcmREZXNjcmlwdG9yIHx8IG9wdHMuZGV0YWNoRGVzY3JpcHRvcjtcbiAgY29uc3QgbmFtZSA9IHRtcE5hbWVTeW5jKG9wdHMpO1xuICB2YXIgZmQgPSBmcy5vcGVuU3luYyhuYW1lLCBDUkVBVEVfRkxBR1MsIG9wdHMubW9kZSB8fCBGSUxFX01PREUpO1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAob3B0cy5kaXNjYXJkRGVzY3JpcHRvcikge1xuICAgIGZzLmNsb3NlU3luYyhmZCk7XG4gICAgZmQgPSB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG5hbWU6IG5hbWUsXG4gICAgZmQ6IGZkLFxuICAgIHJlbW92ZUNhbGxiYWNrOiBfcHJlcGFyZVRtcEZpbGVSZW1vdmVDYWxsYmFjayhuYW1lLCBkaXNjYXJkT3JEZXRhY2hEZXNjcmlwdG9yID8gLTEgOiBmZCwgb3B0cywgdHJ1ZSlcbiAgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgdGVtcG9yYXJ5IGRpcmVjdG9yeS5cbiAqXG4gKiBAcGFyYW0geyhPcHRpb25zfGRpckNhbGxiYWNrKX0gb3B0aW9ucyB0aGUgb3B0aW9ucyBvciB0aGUgY2FsbGJhY2sgZnVuY3Rpb25cbiAqIEBwYXJhbSB7P2RpckNhbGxiYWNrfSBjYWxsYmFja1xuICovXG5mdW5jdGlvbiBkaXIob3B0aW9ucywgY2FsbGJhY2spIHtcbiAgY29uc3RcbiAgICBhcmdzID0gX3BhcnNlQXJndW1lbnRzKG9wdGlvbnMsIGNhbGxiYWNrKSxcbiAgICBvcHRzID0gYXJnc1swXSxcbiAgICBjYiA9IGFyZ3NbMV07XG5cbiAgLy8gZ2V0cyBhIHRlbXBvcmFyeSBmaWxlbmFtZVxuICB0bXBOYW1lKG9wdHMsIGZ1bmN0aW9uIF90bXBOYW1lQ3JlYXRlZChlcnIsIG5hbWUpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgIGlmIChlcnIpIHJldHVybiBjYihlcnIpO1xuXG4gICAgLy8gY3JlYXRlIHRoZSBkaXJlY3RvcnlcbiAgICBmcy5ta2RpcihuYW1lLCBvcHRzLm1vZGUgfHwgRElSX01PREUsIGZ1bmN0aW9uIF9kaXJDcmVhdGVkKGVycikge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgIGlmIChlcnIpIHJldHVybiBjYihlcnIpO1xuXG4gICAgICBjYihudWxsLCBuYW1lLCBfcHJlcGFyZVRtcERpclJlbW92ZUNhbGxiYWNrKG5hbWUsIG9wdHMsIGZhbHNlKSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFN5bmNocm9ub3VzIHZlcnNpb24gb2YgZGlyLlxuICpcbiAqIEBwYXJhbSB7T3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge0RpclN5bmNPYmplY3R9IG9iamVjdCBjb25zaXN0cyBvZiBuYW1lIGFuZCByZW1vdmVDYWxsYmFja1xuICogQHRocm93cyB7RXJyb3J9IGlmIGl0IGNhbm5vdCBjcmVhdGUgYSBkaXJlY3RvcnlcbiAqL1xuZnVuY3Rpb24gZGlyU3luYyhvcHRpb25zKSB7XG4gIGNvbnN0XG4gICAgYXJncyA9IF9wYXJzZUFyZ3VtZW50cyhvcHRpb25zKSxcbiAgICBvcHRzID0gYXJnc1swXTtcblxuICBjb25zdCBuYW1lID0gdG1wTmFtZVN5bmMob3B0cyk7XG4gIGZzLm1rZGlyU3luYyhuYW1lLCBvcHRzLm1vZGUgfHwgRElSX01PREUpO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogbmFtZSxcbiAgICByZW1vdmVDYWxsYmFjazogX3ByZXBhcmVUbXBEaXJSZW1vdmVDYWxsYmFjayhuYW1lLCBvcHRzLCB0cnVlKVxuICB9O1xufVxuXG4vKipcbiAqIFJlbW92ZXMgZmlsZXMgYXN5bmNocm9ub3VzbHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGZkUGF0aFxuICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dFxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX3JlbW92ZUZpbGVBc3luYyhmZFBhdGgsIG5leHQpIHtcbiAgY29uc3QgX2hhbmRsZXIgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgaWYgKGVyciAmJiAhX2lzRU5PRU5UKGVycikpIHtcbiAgICAgIC8vIHJlcmFpc2UgYW55IHVuYW50aWNpcGF0ZWQgZXJyb3JcbiAgICAgIHJldHVybiBuZXh0KGVycik7XG4gICAgfVxuICAgIG5leHQoKTtcbiAgfTtcblxuICBpZiAoMCA8PSBmZFBhdGhbMF0pXG4gICAgZnMuY2xvc2UoZmRQYXRoWzBdLCBmdW5jdGlvbiAoKSB7XG4gICAgICBmcy51bmxpbmsoZmRQYXRoWzFdLCBfaGFuZGxlcik7XG4gICAgfSk7XG4gIGVsc2UgZnMudW5saW5rKGZkUGF0aFsxXSwgX2hhbmRsZXIpO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgZmlsZXMgc3luY2hyb25vdXNseS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZmRQYXRoXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBfcmVtb3ZlRmlsZVN5bmMoZmRQYXRoKSB7XG4gIGxldCByZXRocm93bkV4Y2VwdGlvbiA9IG51bGw7XG4gIHRyeSB7XG4gICAgaWYgKDAgPD0gZmRQYXRoWzBdKSBmcy5jbG9zZVN5bmMoZmRQYXRoWzBdKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIHJlcmFpc2UgYW55IHVuYW50aWNpcGF0ZWQgZXJyb3JcbiAgICBpZiAoIV9pc0VCQURGKGUpICYmICFfaXNFTk9FTlQoZSkpIHRocm93IGU7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGZzLnVubGlua1N5bmMoZmRQYXRoWzFdKTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgIC8vIHJlcmFpc2UgYW55IHVuYW50aWNpcGF0ZWQgZXJyb3JcbiAgICAgIGlmICghX2lzRU5PRU5UKGUpKSByZXRocm93bkV4Y2VwdGlvbiA9IGU7XG4gICAgfVxuICB9XG4gIGlmIChyZXRocm93bkV4Y2VwdGlvbiAhPT0gbnVsbCkge1xuICAgIHRocm93IHJldGhyb3duRXhjZXB0aW9uO1xuICB9XG59XG5cbi8qKlxuICogUHJlcGFyZXMgdGhlIGNhbGxiYWNrIGZvciByZW1vdmFsIG9mIHRoZSB0ZW1wb3JhcnkgZmlsZS5cbiAqXG4gKiBSZXR1cm5zIGVpdGhlciBhIHN5bmMgY2FsbGJhY2sgb3IgYSBhc3luYyBjYWxsYmFjayBkZXBlbmRpbmcgb24gd2hldGhlclxuICogZmlsZVN5bmMgb3IgZmlsZSB3YXMgY2FsbGVkLCB3aGljaCBpcyBleHByZXNzZWQgYnkgdGhlIHN5bmMgcGFyYW1ldGVyLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIHRoZSBwYXRoIG9mIHRoZSBmaWxlXG4gKiBAcGFyYW0ge251bWJlcn0gZmQgZmlsZSBkZXNjcmlwdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0c1xuICogQHBhcmFtIHtib29sZWFufSBzeW5jXG4gKiBAcmV0dXJucyB7ZmlsZUNhbGxiYWNrIHwgZmlsZUNhbGxiYWNrU3luY31cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9wcmVwYXJlVG1wRmlsZVJlbW92ZUNhbGxiYWNrKG5hbWUsIGZkLCBvcHRzLCBzeW5jKSB7XG4gIGNvbnN0IHJlbW92ZUNhbGxiYWNrU3luYyA9IF9wcmVwYXJlUmVtb3ZlQ2FsbGJhY2soX3JlbW92ZUZpbGVTeW5jLCBbZmQsIG5hbWVdLCBzeW5jKTtcbiAgY29uc3QgcmVtb3ZlQ2FsbGJhY2sgPSBfcHJlcGFyZVJlbW92ZUNhbGxiYWNrKF9yZW1vdmVGaWxlQXN5bmMsIFtmZCwgbmFtZV0sIHN5bmMsIHJlbW92ZUNhbGxiYWNrU3luYyk7XG5cbiAgaWYgKCFvcHRzLmtlZXApIF9yZW1vdmVPYmplY3RzLnVuc2hpZnQocmVtb3ZlQ2FsbGJhY2tTeW5jKTtcblxuICByZXR1cm4gc3luYyA/IHJlbW92ZUNhbGxiYWNrU3luYyA6IHJlbW92ZUNhbGxiYWNrO1xufVxuXG4vKipcbiAqIFByZXBhcmVzIHRoZSBjYWxsYmFjayBmb3IgcmVtb3ZhbCBvZiB0aGUgdGVtcG9yYXJ5IGRpcmVjdG9yeS5cbiAqXG4gKiBSZXR1cm5zIGVpdGhlciBhIHN5bmMgY2FsbGJhY2sgb3IgYSBhc3luYyBjYWxsYmFjayBkZXBlbmRpbmcgb24gd2hldGhlclxuICogdG1wRmlsZVN5bmMgb3IgdG1wRmlsZSB3YXMgY2FsbGVkLCB3aGljaCBpcyBleHByZXNzZWQgYnkgdGhlIHN5bmMgcGFyYW1ldGVyLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0c1xuICogQHBhcmFtIHtib29sZWFufSBzeW5jXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IHRoZSBjYWxsYmFja1xuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX3ByZXBhcmVUbXBEaXJSZW1vdmVDYWxsYmFjayhuYW1lLCBvcHRzLCBzeW5jKSB7XG4gIGNvbnN0IHJlbW92ZUZ1bmN0aW9uID0gb3B0cy51bnNhZmVDbGVhbnVwID8gcmltcmFmIDogZnMucm1kaXIuYmluZChmcyk7XG4gIGNvbnN0IHJlbW92ZUZ1bmN0aW9uU3luYyA9IG9wdHMudW5zYWZlQ2xlYW51cCA/IEZOX1JJTVJBRl9TWU5DIDogRk5fUk1ESVJfU1lOQztcbiAgY29uc3QgcmVtb3ZlQ2FsbGJhY2tTeW5jID0gX3ByZXBhcmVSZW1vdmVDYWxsYmFjayhyZW1vdmVGdW5jdGlvblN5bmMsIG5hbWUsIHN5bmMpO1xuICBjb25zdCByZW1vdmVDYWxsYmFjayA9IF9wcmVwYXJlUmVtb3ZlQ2FsbGJhY2socmVtb3ZlRnVuY3Rpb24sIG5hbWUsIHN5bmMsIHJlbW92ZUNhbGxiYWNrU3luYyk7XG4gIGlmICghb3B0cy5rZWVwKSBfcmVtb3ZlT2JqZWN0cy51bnNoaWZ0KHJlbW92ZUNhbGxiYWNrU3luYyk7XG5cbiAgcmV0dXJuIHN5bmMgPyByZW1vdmVDYWxsYmFja1N5bmMgOiByZW1vdmVDYWxsYmFjaztcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgZ3VhcmRlZCBmdW5jdGlvbiB3cmFwcGluZyB0aGUgcmVtb3ZlRnVuY3Rpb24gY2FsbC5cbiAqXG4gKiBUaGUgY2xlYW51cCBjYWxsYmFjayBpcyBzYXZlIHRvIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcy5cbiAqIFN1YnNlcXVlbnQgaW52b2NhdGlvbnMgd2lsbCBiZSBpZ25vcmVkLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlbW92ZUZ1bmN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZU9yRGlyTmFtZVxuICogQHBhcmFtIHtib29sZWFufSBzeW5jXG4gKiBAcGFyYW0ge2NsZWFudXBDYWxsYmFja1N5bmM/fSBjbGVhbnVwQ2FsbGJhY2tTeW5jXG4gKiBAcmV0dXJucyB7Y2xlYW51cENhbGxiYWNrIHwgY2xlYW51cENhbGxiYWNrU3luY31cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9wcmVwYXJlUmVtb3ZlQ2FsbGJhY2socmVtb3ZlRnVuY3Rpb24sIGZpbGVPckRpck5hbWUsIHN5bmMsIGNsZWFudXBDYWxsYmFja1N5bmMpIHtcbiAgbGV0IGNhbGxlZCA9IGZhbHNlO1xuXG4gIC8vIGlmIHN5bmMgaXMgdHJ1ZSwgdGhlIG5leHQgcGFyYW1ldGVyIHdpbGwgYmUgaWdub3JlZFxuICByZXR1cm4gZnVuY3Rpb24gX2NsZWFudXBDYWxsYmFjayhuZXh0KSB7XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgIGlmICghY2FsbGVkKSB7XG4gICAgICAvLyByZW1vdmUgY2xlYW51cENhbGxiYWNrIGZyb20gY2FjaGVcbiAgICAgIGNvbnN0IHRvUmVtb3ZlID0gY2xlYW51cENhbGxiYWNrU3luYyB8fCBfY2xlYW51cENhbGxiYWNrO1xuICAgICAgY29uc3QgaW5kZXggPSBfcmVtb3ZlT2JqZWN0cy5pbmRleE9mKHRvUmVtb3ZlKTtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICBpZiAoaW5kZXggPj0gMCkgX3JlbW92ZU9iamVjdHMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgIGlmIChzeW5jIHx8IHJlbW92ZUZ1bmN0aW9uID09PSBGTl9STURJUl9TWU5DIHx8IHJlbW92ZUZ1bmN0aW9uID09PSBGTl9SSU1SQUZfU1lOQykge1xuICAgICAgICByZXR1cm4gcmVtb3ZlRnVuY3Rpb24oZmlsZU9yRGlyTmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVtb3ZlRnVuY3Rpb24oZmlsZU9yRGlyTmFtZSwgbmV4dCB8fCBmdW5jdGlvbigpIHt9KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogVGhlIGdhcmJhZ2UgY29sbGVjdG9yLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9nYXJiYWdlQ29sbGVjdG9yKCkge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAoIV9ncmFjZWZ1bENsZWFudXApIHJldHVybjtcblxuICAvLyB0aGUgZnVuY3Rpb24gYmVpbmcgY2FsbGVkIHJlbW92ZXMgaXRzZWxmIGZyb20gX3JlbW92ZU9iamVjdHMsXG4gIC8vIGxvb3AgdW50aWwgX3JlbW92ZU9iamVjdHMgaXMgZW1wdHlcbiAgd2hpbGUgKF9yZW1vdmVPYmplY3RzLmxlbmd0aCkge1xuICAgIHRyeSB7XG4gICAgICBfcmVtb3ZlT2JqZWN0c1swXSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIGFscmVhZHkgcmVtb3ZlZD9cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSYW5kb20gbmFtZSBnZW5lcmF0b3IgYmFzZWQgb24gY3J5cHRvLlxuICogQWRhcHRlZCBmcm9tIGh0dHA6Ly9ibG9nLnRvbXBhd2xhay5vcmcvaG93LXRvLWdlbmVyYXRlLXJhbmRvbS12YWx1ZXMtbm9kZWpzLWphdmFzY3JpcHRcbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gaG93TWFueVxuICogQHJldHVybnMge3N0cmluZ30gdGhlIGdlbmVyYXRlZCByYW5kb20gbmFtZVxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX3JhbmRvbUNoYXJzKGhvd01hbnkpIHtcbiAgbGV0XG4gICAgdmFsdWUgPSBbXSxcbiAgICBybmQgPSBudWxsO1xuXG4gIC8vIG1ha2Ugc3VyZSB0aGF0IHdlIGRvIG5vdCBmYWlsIGJlY2F1c2Ugd2UgcmFuIG91dCBvZiBlbnRyb3B5XG4gIHRyeSB7XG4gICAgcm5kID0gY3J5cHRvLnJhbmRvbUJ5dGVzKGhvd01hbnkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcm5kID0gY3J5cHRvLnBzZXVkb1JhbmRvbUJ5dGVzKGhvd01hbnkpO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBob3dNYW55OyBpKyspIHtcbiAgICB2YWx1ZS5wdXNoKFJBTkRPTV9DSEFSU1tybmRbaV0gJSBSQU5ET01fQ0hBUlMubGVuZ3RoXSk7XG4gIH1cblxuICByZXR1cm4gdmFsdWUuam9pbignJyk7XG59XG5cbi8qKlxuICogSGVscGVyIHdoaWNoIGRldGVybWluZXMgd2hldGhlciBhIHN0cmluZyBzIGlzIGJsYW5rLCB0aGF0IGlzIHVuZGVmaW5lZCwgb3IgZW1wdHkgb3IgbnVsbC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHNcbiAqIEByZXR1cm5zIHtCb29sZWFufSB0cnVlIHdoZXRoZXIgdGhlIHN0cmluZyBzIGlzIGJsYW5rLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZnVuY3Rpb24gX2lzQmxhbmsocykge1xuICByZXR1cm4gcyA9PT0gbnVsbCB8fCBfaXNVbmRlZmluZWQocykgfHwgIXMudHJpbSgpO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBgb2JqYCBwYXJhbWV0ZXIgaXMgZGVmaW5lZCBvciBub3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIG9iamVjdCBpcyB1bmRlZmluZWRcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9pc1VuZGVmaW5lZChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnO1xufVxuXG4vKipcbiAqIFBhcnNlcyB0aGUgZnVuY3Rpb24gYXJndW1lbnRzLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gaGVscHMgdG8gaGF2ZSBvcHRpb25hbCBhcmd1bWVudHMuXG4gKlxuICogQHBhcmFtIHsoT3B0aW9uc3xudWxsfHVuZGVmaW5lZHxGdW5jdGlvbil9IG9wdGlvbnNcbiAqIEBwYXJhbSB7P0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0FycmF5fSBwYXJzZWQgYXJndW1lbnRzXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBfcGFyc2VBcmd1bWVudHMob3B0aW9ucywgY2FsbGJhY2spIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIFt7fSwgb3B0aW9uc107XG4gIH1cblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAoX2lzVW5kZWZpbmVkKG9wdGlvbnMpKSB7XG4gICAgcmV0dXJuIFt7fSwgY2FsbGJhY2tdO1xuICB9XG5cbiAgLy8gY29weSBvcHRpb25zIHNvIHdlIGRvIG5vdCBsZWFrIHRoZSBjaGFuZ2VzIHdlIG1ha2UgaW50ZXJuYWxseVxuICBjb25zdCBhY3R1YWxPcHRpb25zID0ge307XG4gIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9wdGlvbnMpKSB7XG4gICAgYWN0dWFsT3B0aW9uc1trZXldID0gb3B0aW9uc1trZXldO1xuICB9XG5cbiAgcmV0dXJuIFthY3R1YWxPcHRpb25zLCBjYWxsYmFja107XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgbmV3IHRlbXBvcmFyeSBuYW1lLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzXG4gKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgbmV3IHJhbmRvbSBuYW1lIGFjY29yZGluZyB0byBvcHRzXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBfZ2VuZXJhdGVUbXBOYW1lKG9wdHMpIHtcblxuICBjb25zdCB0bXBEaXIgPSBvcHRzLnRtcGRpcjtcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAoIV9pc1VuZGVmaW5lZChvcHRzLm5hbWUpKVxuICAgIHJldHVybiBwYXRoLmpvaW4odG1wRGlyLCBvcHRzLmRpciwgb3B0cy5uYW1lKTtcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAoIV9pc1VuZGVmaW5lZChvcHRzLnRlbXBsYXRlKSlcbiAgICByZXR1cm4gcGF0aC5qb2luKHRtcERpciwgb3B0cy5kaXIsIG9wdHMudGVtcGxhdGUpLnJlcGxhY2UoVEVNUExBVEVfUEFUVEVSTiwgX3JhbmRvbUNoYXJzKDYpKTtcblxuICAvLyBwcmVmaXggYW5kIHBvc3RmaXhcbiAgY29uc3QgbmFtZSA9IFtcbiAgICBvcHRzLnByZWZpeCA/IG9wdHMucHJlZml4IDogJ3RtcCcsXG4gICAgJy0nLFxuICAgIHByb2Nlc3MucGlkLFxuICAgICctJyxcbiAgICBfcmFuZG9tQ2hhcnMoMTIpLFxuICAgIG9wdHMucG9zdGZpeCA/ICctJyArIG9wdHMucG9zdGZpeCA6ICcnXG4gIF0uam9pbignJyk7XG5cbiAgcmV0dXJuIHBhdGguam9pbih0bXBEaXIsIG9wdHMuZGlyLCBuYW1lKTtcbn1cblxuLyoqXG4gKiBBc3NlcnRzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBvcHRpb25zIGFyZSB2YWxpZCwgYWxzbyBzYW5pdGl6ZXMgb3B0aW9ucyBhbmQgcHJvdmlkZXMgc2FuZSBkZWZhdWx0cyBmb3IgbWlzc2luZ1xuICogb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge09wdGlvbnN9IG9wdGlvbnNcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9hc3NlcnRBbmRTYW5pdGl6ZU9wdGlvbnMob3B0aW9ucykge1xuXG4gIG9wdGlvbnMudG1wZGlyID0gX2dldFRtcERpcihvcHRpb25zKTtcblxuICBjb25zdCB0bXBEaXIgPSBvcHRpb25zLnRtcGRpcjtcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAoIV9pc1VuZGVmaW5lZChvcHRpb25zLm5hbWUpKVxuICAgIF9hc3NlcnRJc1JlbGF0aXZlKG9wdGlvbnMubmFtZSwgJ25hbWUnLCB0bXBEaXIpO1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAoIV9pc1VuZGVmaW5lZChvcHRpb25zLmRpcikpXG4gICAgX2Fzc2VydElzUmVsYXRpdmUob3B0aW9ucy5kaXIsICdkaXInLCB0bXBEaXIpO1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAoIV9pc1VuZGVmaW5lZChvcHRpb25zLnRlbXBsYXRlKSkge1xuICAgIF9hc3NlcnRJc1JlbGF0aXZlKG9wdGlvbnMudGVtcGxhdGUsICd0ZW1wbGF0ZScsIHRtcERpcik7XG4gICAgaWYgKCFvcHRpb25zLnRlbXBsYXRlLm1hdGNoKFRFTVBMQVRFX1BBVFRFUk4pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHRlbXBsYXRlLCBmb3VuZCBcIiR7b3B0aW9ucy50ZW1wbGF0ZX1cIi5gKTtcbiAgfVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAoIV9pc1VuZGVmaW5lZChvcHRpb25zLnRyaWVzKSAmJiBpc05hTihvcHRpb25zLnRyaWVzKSB8fCBvcHRpb25zLnRyaWVzIDwgMClcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdHJpZXMsIGZvdW5kIFwiJHtvcHRpb25zLnRyaWVzfVwiLmApO1xuXG4gIC8vIGlmIGEgbmFtZSB3YXMgc3BlY2lmaWVkIHdlIHdpbGwgdHJ5IG9uY2VcbiAgb3B0aW9ucy50cmllcyA9IF9pc1VuZGVmaW5lZChvcHRpb25zLm5hbWUpID8gb3B0aW9ucy50cmllcyB8fCBERUZBVUxUX1RSSUVTIDogMTtcbiAgb3B0aW9ucy5rZWVwID0gISFvcHRpb25zLmtlZXA7XG4gIG9wdGlvbnMuZGV0YWNoRGVzY3JpcHRvciA9ICEhb3B0aW9ucy5kZXRhY2hEZXNjcmlwdG9yO1xuICBvcHRpb25zLmRpc2NhcmREZXNjcmlwdG9yID0gISFvcHRpb25zLmRpc2NhcmREZXNjcmlwdG9yO1xuICBvcHRpb25zLnVuc2FmZUNsZWFudXAgPSAhIW9wdGlvbnMudW5zYWZlQ2xlYW51cDtcblxuICAvLyBzYW5pdGl6ZSBkaXIsIGFsc28ga2VlcCAobXVsdGlwbGUpIGJsYW5rcyBpZiB0aGUgdXNlciwgcHVycG9ydGVkbHkgc2FuZSwgcmVxdWVzdHMgdXMgdG9cbiAgb3B0aW9ucy5kaXIgPSBfaXNVbmRlZmluZWQob3B0aW9ucy5kaXIpID8gJycgOiBwYXRoLnJlbGF0aXZlKHRtcERpciwgX3Jlc29sdmVQYXRoKG9wdGlvbnMuZGlyLCB0bXBEaXIpKTtcbiAgb3B0aW9ucy50ZW1wbGF0ZSA9IF9pc1VuZGVmaW5lZChvcHRpb25zLnRlbXBsYXRlKSA/IHVuZGVmaW5lZCA6IHBhdGgucmVsYXRpdmUodG1wRGlyLCBfcmVzb2x2ZVBhdGgob3B0aW9ucy50ZW1wbGF0ZSwgdG1wRGlyKSk7XG4gIC8vIHNhbml0aXplIGZ1cnRoZXIgaWYgdGVtcGxhdGUgaXMgcmVsYXRpdmUgdG8gb3B0aW9ucy5kaXJcbiAgb3B0aW9ucy50ZW1wbGF0ZSA9IF9pc0JsYW5rKG9wdGlvbnMudGVtcGxhdGUpID8gdW5kZWZpbmVkIDogcGF0aC5yZWxhdGl2ZShvcHRpb25zLmRpciwgb3B0aW9ucy50ZW1wbGF0ZSk7XG5cbiAgLy8gZm9yIGNvbXBsZXRlbmVzcycgc2FrZSBvbmx5LCBhbHNvIGtlZXAgKG11bHRpcGxlKSBibGFua3MgaWYgdGhlIHVzZXIsIHB1cnBvcnRlZGx5IHNhbmUsIHJlcXVlc3RzIHVzIHRvXG4gIG9wdGlvbnMubmFtZSA9IF9pc1VuZGVmaW5lZChvcHRpb25zLm5hbWUpID8gdW5kZWZpbmVkIDogX3Nhbml0aXplTmFtZShvcHRpb25zLm5hbWUpO1xuICBvcHRpb25zLnByZWZpeCA9IF9pc1VuZGVmaW5lZChvcHRpb25zLnByZWZpeCkgPyAnJyA6IG9wdGlvbnMucHJlZml4O1xuICBvcHRpb25zLnBvc3RmaXggPSBfaXNVbmRlZmluZWQob3B0aW9ucy5wb3N0Zml4KSA/ICcnIDogb3B0aW9ucy5wb3N0Zml4O1xufVxuXG4vKipcbiAqIFJlc29sdmUgdGhlIHNwZWNpZmllZCBwYXRoIG5hbWUgaW4gcmVzcGVjdCB0byB0bXBEaXIuXG4gKlxuICogVGhlIHNwZWNpZmllZCBuYW1lIG1pZ2h0IGluY2x1ZGUgcmVsYXRpdmUgcGF0aCBjb21wb25lbnRzLCBlLmcuIC4uL1xuICogc28gd2UgbmVlZCB0byByZXNvbHZlIGluIG9yZGVyIHRvIGJlIHN1cmUgdGhhdCBpcyBpcyBsb2NhdGVkIGluc2lkZSB0bXBEaXJcbiAqXG4gKiBAcGFyYW0gbmFtZVxuICogQHBhcmFtIHRtcERpclxuICogQHJldHVybnMge3N0cmluZ31cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9yZXNvbHZlUGF0aChuYW1lLCB0bXBEaXIpIHtcbiAgY29uc3Qgc2FuaXRpemVkTmFtZSA9IF9zYW5pdGl6ZU5hbWUobmFtZSk7XG4gIGlmIChzYW5pdGl6ZWROYW1lLnN0YXJ0c1dpdGgodG1wRGlyKSkge1xuICAgIHJldHVybiBwYXRoLnJlc29sdmUoc2FuaXRpemVkTmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHBhdGgucmVzb2x2ZShwYXRoLmpvaW4odG1wRGlyLCBzYW5pdGl6ZWROYW1lKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBTYW5pdGl6ZSB0aGUgc3BlY2lmaWVkIHBhdGggbmFtZSBieSByZW1vdmluZyBhbGwgcXVvdGUgY2hhcmFjdGVycy5cbiAqXG4gKiBAcGFyYW0gbmFtZVxuICogQHJldHVybnMge3N0cmluZ31cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9zYW5pdGl6ZU5hbWUobmFtZSkge1xuICBpZiAoX2lzQmxhbmsobmFtZSkpIHtcbiAgICByZXR1cm4gbmFtZTtcbiAgfVxuICByZXR1cm4gbmFtZS5yZXBsYWNlKC9bXCInXS9nLCAnJyk7XG59XG5cbi8qKlxuICogQXNzZXJ0cyB3aGV0aGVyIHNwZWNpZmllZCBuYW1lIGlzIHJlbGF0aXZlIHRvIHRoZSBzcGVjaWZpZWQgdG1wRGlyLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gdG1wRGlyXG4gKiBAdGhyb3dzIHtFcnJvcn1cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9hc3NlcnRJc1JlbGF0aXZlKG5hbWUsIG9wdGlvbiwgdG1wRGlyKSB7XG4gIGlmIChvcHRpb24gPT09ICduYW1lJykge1xuICAgIC8vIGFzc2VydCB0aGF0IG5hbWUgaXMgbm90IGFic29sdXRlIGFuZCBkb2VzIG5vdCBjb250YWluIGEgcGF0aFxuICAgIGlmIChwYXRoLmlzQWJzb2x1dGUobmFtZSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7b3B0aW9ufSBvcHRpb24gbXVzdCBub3QgY29udGFpbiBhbiBhYnNvbHV0ZSBwYXRoLCBmb3VuZCBcIiR7bmFtZX1cIi5gKTtcbiAgICAvLyBtdXN0IG5vdCBmYWlsIG9uIHZhbGlkIC48bmFtZT4gb3IgLi48bmFtZT4gb3Igc2ltaWxhciBzdWNoIGNvbnN0cnVjdHNcbiAgICBsZXQgYmFzZW5hbWUgPSBwYXRoLmJhc2VuYW1lKG5hbWUpO1xuICAgIGlmIChiYXNlbmFtZSA9PT0gJy4uJyB8fCBiYXNlbmFtZSA9PT0gJy4nIHx8IGJhc2VuYW1lICE9PSBuYW1lKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke29wdGlvbn0gb3B0aW9uIG11c3Qgbm90IGNvbnRhaW4gYSBwYXRoLCBmb3VuZCBcIiR7bmFtZX1cIi5gKTtcbiAgfVxuICBlbHNlIHsgLy8gaWYgKG9wdGlvbiA9PT0gJ2RpcicgfHwgb3B0aW9uID09PSAndGVtcGxhdGUnKSB7XG4gICAgLy8gYXNzZXJ0IHRoYXQgZGlyIG9yIHRlbXBsYXRlIGFyZSByZWxhdGl2ZSB0byB0bXBEaXJcbiAgICBpZiAocGF0aC5pc0Fic29sdXRlKG5hbWUpICYmICFuYW1lLnN0YXJ0c1dpdGgodG1wRGlyKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke29wdGlvbn0gb3B0aW9uIG11c3QgYmUgcmVsYXRpdmUgdG8gXCIke3RtcERpcn1cIiwgZm91bmQgXCIke25hbWV9XCIuYCk7XG4gICAgfVxuICAgIGxldCByZXNvbHZlZFBhdGggPSBfcmVzb2x2ZVBhdGgobmFtZSwgdG1wRGlyKTtcbiAgICBpZiAoIXJlc29sdmVkUGF0aC5zdGFydHNXaXRoKHRtcERpcikpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7b3B0aW9ufSBvcHRpb24gbXVzdCBiZSByZWxhdGl2ZSB0byBcIiR7dG1wRGlyfVwiLCBmb3VuZCBcIiR7cmVzb2x2ZWRQYXRofVwiLmApO1xuICB9XG59XG5cbi8qKlxuICogSGVscGVyIGZvciB0ZXN0aW5nIGFnYWluc3QgRUJBREYgdG8gY29tcGVuc2F0ZSBjaGFuZ2VzIG1hZGUgdG8gTm9kZSA3LnggdW5kZXIgV2luZG93cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBfaXNFQkFERihlcnJvcikge1xuICByZXR1cm4gX2lzRXhwZWN0ZWRFcnJvcihlcnJvciwgLUVCQURGLCAnRUJBREYnKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZm9yIHRlc3RpbmcgYWdhaW5zdCBFTk9FTlQgdG8gY29tcGVuc2F0ZSBjaGFuZ2VzIG1hZGUgdG8gTm9kZSA3LnggdW5kZXIgV2luZG93cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBfaXNFTk9FTlQoZXJyb3IpIHtcbiAgcmV0dXJuIF9pc0V4cGVjdGVkRXJyb3IoZXJyb3IsIC1FTk9FTlQsICdFTk9FTlQnKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGV4cGVjdGVkIGVycm9yIGNvZGUgbWF0Y2hlcyB0aGUgYWN0dWFsIGNvZGUgYW5kIGVycm5vLFxuICogd2hpY2ggd2lsbCBkaWZmZXIgYmV0d2VlbiB0aGUgc3VwcG9ydGVkIG5vZGUgdmVyc2lvbnMuXG4gKlxuICogLSBOb2RlID49IDcuMDpcbiAqICAgZXJyb3IuY29kZSB7c3RyaW5nfVxuICogICBlcnJvci5lcnJubyB7bnVtYmVyfSBhbnkgbnVtZXJpY2FsIHZhbHVlIHdpbGwgYmUgbmVnYXRlZFxuICpcbiAqIENBVkVBVFxuICpcbiAqIE9uIHdpbmRvd3MsIHRoZSBlcnJubyBmb3IgRUJBREYgaXMgLTQwODMgYnV0IG9zLmNvbnN0YW50cy5lcnJuby5FQkFERiBpcyBkaWZmZXJlbnQgYW5kIHdlIG11c3QgYXNzdW1lIHRoYXQgRU5PRU5UXG4gKiBpcyBubyBkaWZmZXJlbnQgaGVyZS5cbiAqXG4gKiBAcGFyYW0ge1N5c3RlbUVycm9yfSBlcnJvclxuICogQHBhcmFtIHtudW1iZXJ9IGVycm5vXG4gKiBAcGFyYW0ge3N0cmluZ30gY29kZVxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX2lzRXhwZWN0ZWRFcnJvcihlcnJvciwgZXJybm8sIGNvZGUpIHtcbiAgcmV0dXJuIElTX1dJTjMyID8gZXJyb3IuY29kZSA9PT0gY29kZSA6IGVycm9yLmNvZGUgPT09IGNvZGUgJiYgZXJyb3IuZXJybm8gPT09IGVycm5vO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIGdyYWNlZnVsIGNsZWFudXAuXG4gKlxuICogSWYgZ3JhY2VmdWwgY2xlYW51cCBpcyBzZXQsIHRtcCB3aWxsIHJlbW92ZSBhbGwgY29udHJvbGxlZCB0ZW1wb3Jhcnkgb2JqZWN0cyBvbiBwcm9jZXNzIGV4aXQsIG90aGVyd2lzZSB0aGVcbiAqIHRlbXBvcmFyeSBvYmplY3RzIHdpbGwgcmVtYWluIGluIHBsYWNlLCB3YWl0aW5nIHRvIGJlIGNsZWFuZWQgdXAgb24gc3lzdGVtIHJlc3RhcnQgb3Igb3RoZXJ3aXNlIHNjaGVkdWxlZCB0ZW1wb3JhcnlcbiAqIG9iamVjdCByZW1vdmFscy5cbiAqL1xuZnVuY3Rpb24gc2V0R3JhY2VmdWxDbGVhbnVwKCkge1xuICBfZ3JhY2VmdWxDbGVhbnVwID0gdHJ1ZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjdXJyZW50bHkgY29uZmlndXJlZCB0bXAgZGlyIGZyb20gb3MudG1wZGlyKCkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7P09wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBjdXJyZW50bHkgY29uZmlndXJlZCB0bXAgZGlyXG4gKi9cbmZ1bmN0aW9uIF9nZXRUbXBEaXIob3B0aW9ucykge1xuICByZXR1cm4gcGF0aC5yZXNvbHZlKF9zYW5pdGl6ZU5hbWUob3B0aW9ucyAmJiBvcHRpb25zLnRtcGRpciB8fCBvcy50bXBkaXIoKSkpO1xufVxuXG4vLyBJbnN0YWxsIHByb2Nlc3MgZXhpdCBsaXN0ZW5lclxucHJvY2Vzcy5hZGRMaXN0ZW5lcihFWElULCBfZ2FyYmFnZUNvbGxlY3Rvcik7XG5cbi8qKlxuICogQ29uZmlndXJhdGlvbiBvcHRpb25zLlxuICpcbiAqIEB0eXBlZGVmIHtPYmplY3R9IE9wdGlvbnNcbiAqIEBwcm9wZXJ0eSB7P2Jvb2xlYW59IGtlZXAgdGhlIHRlbXBvcmFyeSBvYmplY3QgKGZpbGUgb3IgZGlyKSB3aWxsIG5vdCBiZSBnYXJiYWdlIGNvbGxlY3RlZFxuICogQHByb3BlcnR5IHs/bnVtYmVyfSB0cmllcyB0aGUgbnVtYmVyIG9mIHRyaWVzIGJlZm9yZSBnaXZlIHVwIHRoZSBuYW1lIGdlbmVyYXRpb25cbiAqIEBwcm9wZXJ0eSAoP2ludCkgbW9kZSB0aGUgYWNjZXNzIG1vZGUsIGRlZmF1bHRzIGFyZSAwbzcwMCBmb3IgZGlyZWN0b3JpZXMgYW5kIDBvNjAwIGZvciBmaWxlc1xuICogQHByb3BlcnR5IHs/c3RyaW5nfSB0ZW1wbGF0ZSB0aGUgXCJta3N0ZW1wXCIgbGlrZSBmaWxlbmFtZSB0ZW1wbGF0ZVxuICogQHByb3BlcnR5IHs/c3RyaW5nfSBuYW1lIGZpeGVkIG5hbWUgcmVsYXRpdmUgdG8gdG1wZGlyIG9yIHRoZSBzcGVjaWZpZWQgZGlyIG9wdGlvblxuICogQHByb3BlcnR5IHs/c3RyaW5nfSBkaXIgdG1wIGRpcmVjdG9yeSByZWxhdGl2ZSB0byB0aGUgcm9vdCB0bXAgZGlyZWN0b3J5IGluIHVzZVxuICogQHByb3BlcnR5IHs/c3RyaW5nfSBwcmVmaXggcHJlZml4IGZvciB0aGUgZ2VuZXJhdGVkIG5hbWVcbiAqIEBwcm9wZXJ0eSB7P3N0cmluZ30gcG9zdGZpeCBwb3N0Zml4IGZvciB0aGUgZ2VuZXJhdGVkIG5hbWVcbiAqIEBwcm9wZXJ0eSB7P3N0cmluZ30gdG1wZGlyIHRoZSByb290IHRtcCBkaXJlY3Rvcnkgd2hpY2ggb3ZlcnJpZGVzIHRoZSBvcyB0bXBkaXJcbiAqIEBwcm9wZXJ0eSB7P2Jvb2xlYW59IHVuc2FmZUNsZWFudXAgcmVjdXJzaXZlbHkgcmVtb3ZlcyB0aGUgY3JlYXRlZCB0ZW1wb3JhcnkgZGlyZWN0b3J5LCBldmVuIHdoZW4gaXQncyBub3QgZW1wdHlcbiAqIEBwcm9wZXJ0eSB7P2Jvb2xlYW59IGRldGFjaERlc2NyaXB0b3IgZGV0YWNoZXMgdGhlIGZpbGUgZGVzY3JpcHRvciwgY2FsbGVyIGlzIHJlc3BvbnNpYmxlIGZvciBjbG9zaW5nIHRoZSBmaWxlLCB0bXAgd2lsbCBubyBsb25nZXIgdHJ5IGNsb3NpbmcgdGhlIGZpbGUgZHVyaW5nIGdhcmJhZ2UgY29sbGVjdGlvblxuICogQHByb3BlcnR5IHs/Ym9vbGVhbn0gZGlzY2FyZERlc2NyaXB0b3IgZGlzY2FyZHMgdGhlIGZpbGUgZGVzY3JpcHRvciAoY2xvc2VzIGZpbGUsIGZkIGlzIC0xKSwgdG1wIHdpbGwgbm8gbG9uZ2VyIHRyeSBjbG9zaW5nIHRoZSBmaWxlIGR1cmluZyBnYXJiYWdlIGNvbGxlY3Rpb25cbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IEZpbGVTeW5jT2JqZWN0XG4gKiBAcHJvcGVydHkge3N0cmluZ30gbmFtZSB0aGUgbmFtZSBvZiB0aGUgZmlsZVxuICogQHByb3BlcnR5IHtzdHJpbmd9IGZkIHRoZSBmaWxlIGRlc2NyaXB0b3Igb3IgLTEgaWYgdGhlIGZkIGhhcyBiZWVuIGRpc2NhcmRlZFxuICogQHByb3BlcnR5IHtmaWxlQ2FsbGJhY2t9IHJlbW92ZUNhbGxiYWNrIHRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byByZW1vdmUgdGhlIGZpbGVcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IERpclN5bmNPYmplY3RcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBuYW1lIHRoZSBuYW1lIG9mIHRoZSBkaXJlY3RvcnlcbiAqIEBwcm9wZXJ0eSB7ZmlsZUNhbGxiYWNrfSByZW1vdmVDYWxsYmFjayB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gcmVtb3ZlIHRoZSBkaXJlY3RvcnlcbiAqL1xuXG4vKipcbiAqIEBjYWxsYmFjayB0bXBOYW1lQ2FsbGJhY2tcbiAqIEBwYXJhbSB7P0Vycm9yfSBlcnIgdGhlIGVycm9yIG9iamVjdCBpZiBhbnl0aGluZyBnb2VzIHdyb25nXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSB0aGUgdGVtcG9yYXJ5IGZpbGUgbmFtZVxuICovXG5cbi8qKlxuICogQGNhbGxiYWNrIGZpbGVDYWxsYmFja1xuICogQHBhcmFtIHs/RXJyb3J9IGVyciB0aGUgZXJyb3Igb2JqZWN0IGlmIGFueXRoaW5nIGdvZXMgd3JvbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIHRoZSB0ZW1wb3JhcnkgZmlsZSBuYW1lXG4gKiBAcGFyYW0ge251bWJlcn0gZmQgdGhlIGZpbGUgZGVzY3JpcHRvciBvciAtMSBpZiB0aGUgZmQgaGFkIGJlZW4gZGlzY2FyZGVkXG4gKiBAcGFyYW0ge2NsZWFudXBDYWxsYmFja30gZm4gdGhlIGNsZWFudXAgY2FsbGJhY2sgZnVuY3Rpb25cbiAqL1xuXG4vKipcbiAqIEBjYWxsYmFjayBmaWxlQ2FsbGJhY2tTeW5jXG4gKiBAcGFyYW0gez9FcnJvcn0gZXJyIHRoZSBlcnJvciBvYmplY3QgaWYgYW55dGhpbmcgZ29lcyB3cm9uZ1xuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgdGhlIHRlbXBvcmFyeSBmaWxlIG5hbWVcbiAqIEBwYXJhbSB7bnVtYmVyfSBmZCB0aGUgZmlsZSBkZXNjcmlwdG9yIG9yIC0xIGlmIHRoZSBmZCBoYWQgYmVlbiBkaXNjYXJkZWRcbiAqIEBwYXJhbSB7Y2xlYW51cENhbGxiYWNrU3luY30gZm4gdGhlIGNsZWFudXAgY2FsbGJhY2sgZnVuY3Rpb25cbiAqL1xuXG4vKipcbiAqIEBjYWxsYmFjayBkaXJDYWxsYmFja1xuICogQHBhcmFtIHs/RXJyb3J9IGVyciB0aGUgZXJyb3Igb2JqZWN0IGlmIGFueXRoaW5nIGdvZXMgd3JvbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIHRoZSB0ZW1wb3JhcnkgZmlsZSBuYW1lXG4gKiBAcGFyYW0ge2NsZWFudXBDYWxsYmFja30gZm4gdGhlIGNsZWFudXAgY2FsbGJhY2sgZnVuY3Rpb25cbiAqL1xuXG4vKipcbiAqIEBjYWxsYmFjayBkaXJDYWxsYmFja1N5bmNcbiAqIEBwYXJhbSB7P0Vycm9yfSBlcnIgdGhlIGVycm9yIG9iamVjdCBpZiBhbnl0aGluZyBnb2VzIHdyb25nXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSB0aGUgdGVtcG9yYXJ5IGZpbGUgbmFtZVxuICogQHBhcmFtIHtjbGVhbnVwQ2FsbGJhY2tTeW5jfSBmbiB0aGUgY2xlYW51cCBjYWxsYmFjayBmdW5jdGlvblxuICovXG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgdGVtcG9yYXJ5IGNyZWF0ZWQgZmlsZSBvciBkaXJlY3RvcnkuXG4gKlxuICogQGNhbGxiYWNrIGNsZWFudXBDYWxsYmFja1xuICogQHBhcmFtIHtzaW1wbGVDYWxsYmFja30gW25leHRdIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbmV2ZXIgdGhlIHRtcCBvYmplY3QgbmVlZHMgdG8gYmUgcmVtb3ZlZFxuICovXG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgdGVtcG9yYXJ5IGNyZWF0ZWQgZmlsZSBvciBkaXJlY3RvcnkuXG4gKlxuICogQGNhbGxiYWNrIGNsZWFudXBDYWxsYmFja1N5bmNcbiAqL1xuXG4vKipcbiAqIENhbGxiYWNrIGZ1bmN0aW9uIGZvciBmdW5jdGlvbiBjb21wb3NpdGlvbi5cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9yYXN6aS9ub2RlLXRtcC9pc3N1ZXMvNTd8cmFzemkvbm9kZS10bXAjNTd9XG4gKlxuICogQGNhbGxiYWNrIHNpbXBsZUNhbGxiYWNrXG4gKi9cblxuLy8gZXhwb3J0aW5nIGFsbCB0aGUgbmVlZGVkIG1ldGhvZHNcblxuLy8gZXZhbHVhdGUgX2dldFRtcERpcigpIGxhemlseSwgbWFpbmx5IGZvciBzaW1wbGlmeWluZyB0ZXN0aW5nIGJ1dCBpdCBhbHNvIHdpbGxcbi8vIGFsbG93IHVzZXJzIHRvIHJlY29uZmlndXJlIHRoZSB0ZW1wb3JhcnkgZGlyZWN0b3J5XG5PYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLmV4cG9ydHMsICd0bXBkaXInLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfZ2V0VG1wRGlyKCk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cy5kaXIgPSBkaXI7XG5tb2R1bGUuZXhwb3J0cy5kaXJTeW5jID0gZGlyU3luYztcblxubW9kdWxlLmV4cG9ydHMuZmlsZSA9IGZpbGU7XG5tb2R1bGUuZXhwb3J0cy5maWxlU3luYyA9IGZpbGVTeW5jO1xuXG5tb2R1bGUuZXhwb3J0cy50bXBOYW1lID0gdG1wTmFtZTtcbm1vZHVsZS5leHBvcnRzLnRtcE5hbWVTeW5jID0gdG1wTmFtZVN5bmM7XG5cbm1vZHVsZS5leHBvcnRzLnNldEdyYWNlZnVsQ2xlYW51cCA9IHNldEdyYWNlZnVsQ2xlYW51cDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKGsgIT09IFwiZGVmYXVsdFwiICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGNvcmUgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcIkBhY3Rpb25zL2NvcmVcIikpO1xuY29uc3QgYXJ0aWZhY3QgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcIkBhY3Rpb25zL2FydGlmYWN0XCIpKTtcbmNvbnN0IGNoaWxkX3Byb2Nlc3NfMSA9IHJlcXVpcmUoXCJjaGlsZF9wcm9jZXNzXCIpO1xuY29uc3QgcHJvY2Vzc18xID0gcmVxdWlyZShcInByb2Nlc3NcIik7XG5jb25zdCB2aWQgPSBjb3JlLmdldElucHV0KFwidmlkXCIsIHsgcmVxdWlyZWQ6IHRydWUgfSk7XG5jb25zdCB2a2V5ID0gY29yZS5nZXRJbnB1dChcInZrZXlcIiwgeyByZXF1aXJlZDogdHJ1ZSB9KTtcbmNvbnN0IHBhdGggPSBjb3JlLmdldElucHV0KFwicGF0aFwiLCB7IHJlcXVpcmVkOiB0cnVlIH0pO1xuY29uc3QgZm9ybWF0ID0gY29yZS5nZXRJbnB1dChcImZvcm1hdFwiLCB7IHJlcXVpcmVkOiB0cnVlIH0pO1xuY29uc3Qgc2NhblR5cGUgPSBjb3JlLmdldElucHV0KFwic2NhblR5cGVcIiwgeyByZXF1aXJlZDogdHJ1ZSB9KTtcbmNvbnN0IGV4cG9ydGZpbGUgPSBjb3JlLmdldElucHV0KFwiZXhwb3J0XCIsIHsgcmVxdWlyZWQ6IHRydWUgfSk7XG5Db250YWluZXJTY2FuKHZpZCwgdmtleSwgcGF0aCwgZm9ybWF0LCBzY2FuVHlwZSwgZXhwb3J0ZmlsZSk7XG5mdW5jdGlvbiBDb250YWluZXJTY2FuKHZpZCwgdmtleSwgcGF0aCwgZm9ybWF0LCBzY2FuVHlwZSwgZXhwb3J0ZmlsZSkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGAnUGF0aCA6ICAke3BhdGh9J2ApO1xuICAgICAgICBsZXQgY3VybENvbW1hbmRPdXRwdXQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgZXh0O1xuICAgICAgICAgICAgcHJvY2Vzc18xLmVudi5WRVJBQ09ERV9BUElfS0VZX0lEID0gdmlkO1xuICAgICAgICAgICAgcHJvY2Vzc18xLmVudi5WRVJBQ09ERV9BUElfS0VZX1NFQ1JFVCA9IHZrZXk7XG4gICAgICAgICAgICBpZiAoZm9ybWF0ID09ICdqc29uJylcbiAgICAgICAgICAgICAgICBleHQgPSAnLmpzb24nO1xuICAgICAgICAgICAgaWYgKGZvcm1hdCA9PSAndGFibGUnKVxuICAgICAgICAgICAgICAgIGV4dCA9ICcudHh0JztcbiAgICAgICAgICAgIGlmIChmb3JtYXQgPT0gJ2N5Y2xvbmVkeCcpXG4gICAgICAgICAgICAgICAgZXh0ID0gJy54bWwnO1xuICAgICAgICAgICAgbGV0IHNjYW5Db21tYW5kO1xuICAgICAgICAgICAgaWYgKGV4cG9ydGZpbGUgPSAndHJ1ZScpIHtcbiAgICAgICAgICAgICAgICBzY2FuQ29tbWFuZCA9IGBjdXJsIC1mc1MgaHR0cHM6Ly90b29scy52ZXJhY29kZS5jb20vdmVyYWNvZGUtY2xpL2luc3RhbGwgfCBzaCAmJiAuL3ZlcmFjb2RlICR7c2NhblR5cGV9IC0tc291cmNlICR7cGF0aH0gLS10eXBlIGRpcmVjdG9yeSAtLWZvcm1hdCAke2Zvcm1hdH0gLS1vdXRwdXQgcmVzdWx0cyR7ZXh0fSBgO1xuICAgICAgICAgICAgICAgIGNvcmUuaW5mbygnU2NhbiBjb21tYW5kIDonICsgc2NhbkNvbW1hbmQpO1xuICAgICAgICAgICAgICAgIGN1cmxDb21tYW5kT3V0cHV0ID0gKDAsIGNoaWxkX3Byb2Nlc3NfMS5leGVjU3luYykoc2NhbkNvbW1hbmQpO1xuICAgICAgICAgICAgICAgIGNvcmUuaW5mbyhgJHtjdXJsQ29tbWFuZE91dHB1dH1gKTtcbiAgICAgICAgICAgICAgICAvL3N0b3JlIG91dHB1dCBmaWxlcyBhcyBhcnRpZmFjdHNcbiAgICAgICAgICAgICAgICBjb25zdCBhcnRpZmFjdENsaWVudCA9IGFydGlmYWN0LmNyZWF0ZSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFydGlmYWN0TmFtZSA9ICdWZXJhY29kZSBDb250YWluZXIgU2Nhbm5pbmcgUmVzdWx0cyc7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZXMgPSBbYHJlc3VsdHMke2V4dH1gXTtcbiAgICAgICAgICAgICAgICBjb25zdCByb290RGlyZWN0b3J5ID0gcHJvY2Vzcy5jd2QoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZU9uRXJyb3I6IHRydWVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IHVwbG9hZFJlc3VsdCA9IHlpZWxkIGFydGlmYWN0Q2xpZW50LnVwbG9hZEFydGlmYWN0KGFydGlmYWN0TmFtZSwgZmlsZXMsIHJvb3REaXJlY3RvcnksIG9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VybENvbW1hbmRPdXRwdXQgPSAoMCwgY2hpbGRfcHJvY2Vzc18xLmV4ZWNTeW5jKShgY3VybCAtZnNTIGh0dHBzOi8vdG9vbHMudmVyYWNvZGUuY29tL3ZlcmFjb2RlLWNsaS9pbnN0YWxsIHwgc2ggJiYgLi92ZXJhY29kZSAke3NjYW5UeXBlfSAtLXNvdXJjZSAke3BhdGh9IC0tdHlwZSBkaXJlY3RvcnkgLS1mb3JtYXQgJHtmb3JtYXR9YCk7XG4gICAgICAgICAgICAgICAgY29yZS5pbmZvKGAke2N1cmxDb21tYW5kT3V0cHV0fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChleCkge1xuICAgICAgICAgICAgY3VybENvbW1hbmRPdXRwdXQgPSBleC5zdGRvdXQudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi90dW5uZWwnKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG5ldCA9IHJlcXVpcmUoJ25ldCcpO1xudmFyIHRscyA9IHJlcXVpcmUoJ3RscycpO1xudmFyIGh0dHAgPSByZXF1aXJlKCdodHRwJyk7XG52YXIgaHR0cHMgPSByZXF1aXJlKCdodHRwcycpO1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50cycpO1xudmFyIGFzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cblxuZXhwb3J0cy5odHRwT3Zlckh0dHAgPSBodHRwT3Zlckh0dHA7XG5leHBvcnRzLmh0dHBzT3Zlckh0dHAgPSBodHRwc092ZXJIdHRwO1xuZXhwb3J0cy5odHRwT3Zlckh0dHBzID0gaHR0cE92ZXJIdHRwcztcbmV4cG9ydHMuaHR0cHNPdmVySHR0cHMgPSBodHRwc092ZXJIdHRwcztcblxuXG5mdW5jdGlvbiBodHRwT3Zlckh0dHAob3B0aW9ucykge1xuICB2YXIgYWdlbnQgPSBuZXcgVHVubmVsaW5nQWdlbnQob3B0aW9ucyk7XG4gIGFnZW50LnJlcXVlc3QgPSBodHRwLnJlcXVlc3Q7XG4gIHJldHVybiBhZ2VudDtcbn1cblxuZnVuY3Rpb24gaHR0cHNPdmVySHR0cChvcHRpb25zKSB7XG4gIHZhciBhZ2VudCA9IG5ldyBUdW5uZWxpbmdBZ2VudChvcHRpb25zKTtcbiAgYWdlbnQucmVxdWVzdCA9IGh0dHAucmVxdWVzdDtcbiAgYWdlbnQuY3JlYXRlU29ja2V0ID0gY3JlYXRlU2VjdXJlU29ja2V0O1xuICBhZ2VudC5kZWZhdWx0UG9ydCA9IDQ0MztcbiAgcmV0dXJuIGFnZW50O1xufVxuXG5mdW5jdGlvbiBodHRwT3Zlckh0dHBzKG9wdGlvbnMpIHtcbiAgdmFyIGFnZW50ID0gbmV3IFR1bm5lbGluZ0FnZW50KG9wdGlvbnMpO1xuICBhZ2VudC5yZXF1ZXN0ID0gaHR0cHMucmVxdWVzdDtcbiAgcmV0dXJuIGFnZW50O1xufVxuXG5mdW5jdGlvbiBodHRwc092ZXJIdHRwcyhvcHRpb25zKSB7XG4gIHZhciBhZ2VudCA9IG5ldyBUdW5uZWxpbmdBZ2VudChvcHRpb25zKTtcbiAgYWdlbnQucmVxdWVzdCA9IGh0dHBzLnJlcXVlc3Q7XG4gIGFnZW50LmNyZWF0ZVNvY2tldCA9IGNyZWF0ZVNlY3VyZVNvY2tldDtcbiAgYWdlbnQuZGVmYXVsdFBvcnQgPSA0NDM7XG4gIHJldHVybiBhZ2VudDtcbn1cblxuXG5mdW5jdGlvbiBUdW5uZWxpbmdBZ2VudChvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5vcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgc2VsZi5wcm94eU9wdGlvbnMgPSBzZWxmLm9wdGlvbnMucHJveHkgfHwge307XG4gIHNlbGYubWF4U29ja2V0cyA9IHNlbGYub3B0aW9ucy5tYXhTb2NrZXRzIHx8IGh0dHAuQWdlbnQuZGVmYXVsdE1heFNvY2tldHM7XG4gIHNlbGYucmVxdWVzdHMgPSBbXTtcbiAgc2VsZi5zb2NrZXRzID0gW107XG5cbiAgc2VsZi5vbignZnJlZScsIGZ1bmN0aW9uIG9uRnJlZShzb2NrZXQsIGhvc3QsIHBvcnQsIGxvY2FsQWRkcmVzcykge1xuICAgIHZhciBvcHRpb25zID0gdG9PcHRpb25zKGhvc3QsIHBvcnQsIGxvY2FsQWRkcmVzcyk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHNlbGYucmVxdWVzdHMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIHZhciBwZW5kaW5nID0gc2VsZi5yZXF1ZXN0c1tpXTtcbiAgICAgIGlmIChwZW5kaW5nLmhvc3QgPT09IG9wdGlvbnMuaG9zdCAmJiBwZW5kaW5nLnBvcnQgPT09IG9wdGlvbnMucG9ydCkge1xuICAgICAgICAvLyBEZXRlY3QgdGhlIHJlcXVlc3QgdG8gY29ubmVjdCBzYW1lIG9yaWdpbiBzZXJ2ZXIsXG4gICAgICAgIC8vIHJldXNlIHRoZSBjb25uZWN0aW9uLlxuICAgICAgICBzZWxmLnJlcXVlc3RzLnNwbGljZShpLCAxKTtcbiAgICAgICAgcGVuZGluZy5yZXF1ZXN0Lm9uU29ja2V0KHNvY2tldCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgc29ja2V0LmRlc3Ryb3koKTtcbiAgICBzZWxmLnJlbW92ZVNvY2tldChzb2NrZXQpO1xuICB9KTtcbn1cbnV0aWwuaW5oZXJpdHMoVHVubmVsaW5nQWdlbnQsIGV2ZW50cy5FdmVudEVtaXR0ZXIpO1xuXG5UdW5uZWxpbmdBZ2VudC5wcm90b3R5cGUuYWRkUmVxdWVzdCA9IGZ1bmN0aW9uIGFkZFJlcXVlc3QocmVxLCBob3N0LCBwb3J0LCBsb2NhbEFkZHJlc3MpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgb3B0aW9ucyA9IG1lcmdlT3B0aW9ucyh7cmVxdWVzdDogcmVxfSwgc2VsZi5vcHRpb25zLCB0b09wdGlvbnMoaG9zdCwgcG9ydCwgbG9jYWxBZGRyZXNzKSk7XG5cbiAgaWYgKHNlbGYuc29ja2V0cy5sZW5ndGggPj0gdGhpcy5tYXhTb2NrZXRzKSB7XG4gICAgLy8gV2UgYXJlIG92ZXIgbGltaXQgc28gd2UnbGwgYWRkIGl0IHRvIHRoZSBxdWV1ZS5cbiAgICBzZWxmLnJlcXVlc3RzLnB1c2gob3B0aW9ucyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gSWYgd2UgYXJlIHVuZGVyIG1heFNvY2tldHMgY3JlYXRlIGEgbmV3IG9uZS5cbiAgc2VsZi5jcmVhdGVTb2NrZXQob3B0aW9ucywgZnVuY3Rpb24oc29ja2V0KSB7XG4gICAgc29ja2V0Lm9uKCdmcmVlJywgb25GcmVlKTtcbiAgICBzb2NrZXQub24oJ2Nsb3NlJywgb25DbG9zZU9yUmVtb3ZlKTtcbiAgICBzb2NrZXQub24oJ2FnZW50UmVtb3ZlJywgb25DbG9zZU9yUmVtb3ZlKTtcbiAgICByZXEub25Tb2NrZXQoc29ja2V0KTtcblxuICAgIGZ1bmN0aW9uIG9uRnJlZSgpIHtcbiAgICAgIHNlbGYuZW1pdCgnZnJlZScsIHNvY2tldCwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25DbG9zZU9yUmVtb3ZlKGVycikge1xuICAgICAgc2VsZi5yZW1vdmVTb2NrZXQoc29ja2V0KTtcbiAgICAgIHNvY2tldC5yZW1vdmVMaXN0ZW5lcignZnJlZScsIG9uRnJlZSk7XG4gICAgICBzb2NrZXQucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgb25DbG9zZU9yUmVtb3ZlKTtcbiAgICAgIHNvY2tldC5yZW1vdmVMaXN0ZW5lcignYWdlbnRSZW1vdmUnLCBvbkNsb3NlT3JSZW1vdmUpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5UdW5uZWxpbmdBZ2VudC5wcm90b3R5cGUuY3JlYXRlU29ja2V0ID0gZnVuY3Rpb24gY3JlYXRlU29ja2V0KG9wdGlvbnMsIGNiKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIHBsYWNlaG9sZGVyID0ge307XG4gIHNlbGYuc29ja2V0cy5wdXNoKHBsYWNlaG9sZGVyKTtcblxuICB2YXIgY29ubmVjdE9wdGlvbnMgPSBtZXJnZU9wdGlvbnMoe30sIHNlbGYucHJveHlPcHRpb25zLCB7XG4gICAgbWV0aG9kOiAnQ09OTkVDVCcsXG4gICAgcGF0aDogb3B0aW9ucy5ob3N0ICsgJzonICsgb3B0aW9ucy5wb3J0LFxuICAgIGFnZW50OiBmYWxzZSxcbiAgICBoZWFkZXJzOiB7XG4gICAgICBob3N0OiBvcHRpb25zLmhvc3QgKyAnOicgKyBvcHRpb25zLnBvcnRcbiAgICB9XG4gIH0pO1xuICBpZiAob3B0aW9ucy5sb2NhbEFkZHJlc3MpIHtcbiAgICBjb25uZWN0T3B0aW9ucy5sb2NhbEFkZHJlc3MgPSBvcHRpb25zLmxvY2FsQWRkcmVzcztcbiAgfVxuICBpZiAoY29ubmVjdE9wdGlvbnMucHJveHlBdXRoKSB7XG4gICAgY29ubmVjdE9wdGlvbnMuaGVhZGVycyA9IGNvbm5lY3RPcHRpb25zLmhlYWRlcnMgfHwge307XG4gICAgY29ubmVjdE9wdGlvbnMuaGVhZGVyc1snUHJveHktQXV0aG9yaXphdGlvbiddID0gJ0Jhc2ljICcgK1xuICAgICAgICBuZXcgQnVmZmVyKGNvbm5lY3RPcHRpb25zLnByb3h5QXV0aCkudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICB9XG5cbiAgZGVidWcoJ21ha2luZyBDT05ORUNUIHJlcXVlc3QnKTtcbiAgdmFyIGNvbm5lY3RSZXEgPSBzZWxmLnJlcXVlc3QoY29ubmVjdE9wdGlvbnMpO1xuICBjb25uZWN0UmVxLnVzZUNodW5rZWRFbmNvZGluZ0J5RGVmYXVsdCA9IGZhbHNlOyAvLyBmb3IgdjAuNlxuICBjb25uZWN0UmVxLm9uY2UoJ3Jlc3BvbnNlJywgb25SZXNwb25zZSk7IC8vIGZvciB2MC42XG4gIGNvbm5lY3RSZXEub25jZSgndXBncmFkZScsIG9uVXBncmFkZSk7ICAgLy8gZm9yIHYwLjZcbiAgY29ubmVjdFJlcS5vbmNlKCdjb25uZWN0Jywgb25Db25uZWN0KTsgICAvLyBmb3IgdjAuNyBvciBsYXRlclxuICBjb25uZWN0UmVxLm9uY2UoJ2Vycm9yJywgb25FcnJvcik7XG4gIGNvbm5lY3RSZXEuZW5kKCk7XG5cbiAgZnVuY3Rpb24gb25SZXNwb25zZShyZXMpIHtcbiAgICAvLyBWZXJ5IGhhY2t5LiBUaGlzIGlzIG5lY2Vzc2FyeSB0byBhdm9pZCBodHRwLXBhcnNlciBsZWFrcy5cbiAgICByZXMudXBncmFkZSA9IHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiBvblVwZ3JhZGUocmVzLCBzb2NrZXQsIGhlYWQpIHtcbiAgICAvLyBIYWNreS5cbiAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgb25Db25uZWN0KHJlcywgc29ja2V0LCBoZWFkKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uQ29ubmVjdChyZXMsIHNvY2tldCwgaGVhZCkge1xuICAgIGNvbm5lY3RSZXEucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgc29ja2V0LnJlbW92ZUFsbExpc3RlbmVycygpO1xuXG4gICAgaWYgKHJlcy5zdGF0dXNDb2RlICE9PSAyMDApIHtcbiAgICAgIGRlYnVnKCd0dW5uZWxpbmcgc29ja2V0IGNvdWxkIG5vdCBiZSBlc3RhYmxpc2hlZCwgc3RhdHVzQ29kZT0lZCcsXG4gICAgICAgIHJlcy5zdGF0dXNDb2RlKTtcbiAgICAgIHNvY2tldC5kZXN0cm95KCk7XG4gICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoJ3R1bm5lbGluZyBzb2NrZXQgY291bGQgbm90IGJlIGVzdGFibGlzaGVkLCAnICtcbiAgICAgICAgJ3N0YXR1c0NvZGU9JyArIHJlcy5zdGF0dXNDb2RlKTtcbiAgICAgIGVycm9yLmNvZGUgPSAnRUNPTk5SRVNFVCc7XG4gICAgICBvcHRpb25zLnJlcXVlc3QuZW1pdCgnZXJyb3InLCBlcnJvcik7XG4gICAgICBzZWxmLnJlbW92ZVNvY2tldChwbGFjZWhvbGRlcik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChoZWFkLmxlbmd0aCA+IDApIHtcbiAgICAgIGRlYnVnKCdnb3QgaWxsZWdhbCByZXNwb25zZSBib2R5IGZyb20gcHJveHknKTtcbiAgICAgIHNvY2tldC5kZXN0cm95KCk7XG4gICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoJ2dvdCBpbGxlZ2FsIHJlc3BvbnNlIGJvZHkgZnJvbSBwcm94eScpO1xuICAgICAgZXJyb3IuY29kZSA9ICdFQ09OTlJFU0VUJztcbiAgICAgIG9wdGlvbnMucmVxdWVzdC5lbWl0KCdlcnJvcicsIGVycm9yKTtcbiAgICAgIHNlbGYucmVtb3ZlU29ja2V0KHBsYWNlaG9sZGVyKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZGVidWcoJ3R1bm5lbGluZyBjb25uZWN0aW9uIGhhcyBlc3RhYmxpc2hlZCcpO1xuICAgIHNlbGYuc29ja2V0c1tzZWxmLnNvY2tldHMuaW5kZXhPZihwbGFjZWhvbGRlcildID0gc29ja2V0O1xuICAgIHJldHVybiBjYihzb2NrZXQpO1xuICB9XG5cbiAgZnVuY3Rpb24gb25FcnJvcihjYXVzZSkge1xuICAgIGNvbm5lY3RSZXEucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG5cbiAgICBkZWJ1ZygndHVubmVsaW5nIHNvY2tldCBjb3VsZCBub3QgYmUgZXN0YWJsaXNoZWQsIGNhdXNlPSVzXFxuJyxcbiAgICAgICAgICBjYXVzZS5tZXNzYWdlLCBjYXVzZS5zdGFjayk7XG4gICAgdmFyIGVycm9yID0gbmV3IEVycm9yKCd0dW5uZWxpbmcgc29ja2V0IGNvdWxkIG5vdCBiZSBlc3RhYmxpc2hlZCwgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdjYXVzZT0nICsgY2F1c2UubWVzc2FnZSk7XG4gICAgZXJyb3IuY29kZSA9ICdFQ09OTlJFU0VUJztcbiAgICBvcHRpb25zLnJlcXVlc3QuZW1pdCgnZXJyb3InLCBlcnJvcik7XG4gICAgc2VsZi5yZW1vdmVTb2NrZXQocGxhY2Vob2xkZXIpO1xuICB9XG59O1xuXG5UdW5uZWxpbmdBZ2VudC5wcm90b3R5cGUucmVtb3ZlU29ja2V0ID0gZnVuY3Rpb24gcmVtb3ZlU29ja2V0KHNvY2tldCkge1xuICB2YXIgcG9zID0gdGhpcy5zb2NrZXRzLmluZGV4T2Yoc29ja2V0KVxuICBpZiAocG9zID09PSAtMSkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnNvY2tldHMuc3BsaWNlKHBvcywgMSk7XG5cbiAgdmFyIHBlbmRpbmcgPSB0aGlzLnJlcXVlc3RzLnNoaWZ0KCk7XG4gIGlmIChwZW5kaW5nKSB7XG4gICAgLy8gSWYgd2UgaGF2ZSBwZW5kaW5nIHJlcXVlc3RzIGFuZCBhIHNvY2tldCBnZXRzIGNsb3NlZCBhIG5ldyBvbmVcbiAgICAvLyBuZWVkcyB0byBiZSBjcmVhdGVkIHRvIHRha2Ugb3ZlciBpbiB0aGUgcG9vbCBmb3IgdGhlIG9uZSB0aGF0IGNsb3NlZC5cbiAgICB0aGlzLmNyZWF0ZVNvY2tldChwZW5kaW5nLCBmdW5jdGlvbihzb2NrZXQpIHtcbiAgICAgIHBlbmRpbmcucmVxdWVzdC5vblNvY2tldChzb2NrZXQpO1xuICAgIH0pO1xuICB9XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVTZWN1cmVTb2NrZXQob3B0aW9ucywgY2IpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBUdW5uZWxpbmdBZ2VudC5wcm90b3R5cGUuY3JlYXRlU29ja2V0LmNhbGwoc2VsZiwgb3B0aW9ucywgZnVuY3Rpb24oc29ja2V0KSB7XG4gICAgdmFyIGhvc3RIZWFkZXIgPSBvcHRpb25zLnJlcXVlc3QuZ2V0SGVhZGVyKCdob3N0Jyk7XG4gICAgdmFyIHRsc09wdGlvbnMgPSBtZXJnZU9wdGlvbnMoe30sIHNlbGYub3B0aW9ucywge1xuICAgICAgc29ja2V0OiBzb2NrZXQsXG4gICAgICBzZXJ2ZXJuYW1lOiBob3N0SGVhZGVyID8gaG9zdEhlYWRlci5yZXBsYWNlKC86LiokLywgJycpIDogb3B0aW9ucy5ob3N0XG4gICAgfSk7XG5cbiAgICAvLyAwIGlzIGR1bW15IHBvcnQgZm9yIHYwLjZcbiAgICB2YXIgc2VjdXJlU29ja2V0ID0gdGxzLmNvbm5lY3QoMCwgdGxzT3B0aW9ucyk7XG4gICAgc2VsZi5zb2NrZXRzW3NlbGYuc29ja2V0cy5pbmRleE9mKHNvY2tldCldID0gc2VjdXJlU29ja2V0O1xuICAgIGNiKHNlY3VyZVNvY2tldCk7XG4gIH0pO1xufVxuXG5cbmZ1bmN0aW9uIHRvT3B0aW9ucyhob3N0LCBwb3J0LCBsb2NhbEFkZHJlc3MpIHtcbiAgaWYgKHR5cGVvZiBob3N0ID09PSAnc3RyaW5nJykgeyAvLyBzaW5jZSB2MC4xMFxuICAgIHJldHVybiB7XG4gICAgICBob3N0OiBob3N0LFxuICAgICAgcG9ydDogcG9ydCxcbiAgICAgIGxvY2FsQWRkcmVzczogbG9jYWxBZGRyZXNzXG4gICAgfTtcbiAgfVxuICByZXR1cm4gaG9zdDsgLy8gZm9yIHYwLjExIG9yIGxhdGVyXG59XG5cbmZ1bmN0aW9uIG1lcmdlT3B0aW9ucyh0YXJnZXQpIHtcbiAgZm9yICh2YXIgaSA9IDEsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIHZhciBvdmVycmlkZXMgPSBhcmd1bWVudHNbaV07XG4gICAgaWYgKHR5cGVvZiBvdmVycmlkZXMgPT09ICdvYmplY3QnKSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG92ZXJyaWRlcyk7XG4gICAgICBmb3IgKHZhciBqID0gMCwga2V5TGVuID0ga2V5cy5sZW5ndGg7IGogPCBrZXlMZW47ICsraikge1xuICAgICAgICB2YXIgayA9IGtleXNbal07XG4gICAgICAgIGlmIChvdmVycmlkZXNba10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRhcmdldFtrXSA9IG92ZXJyaWRlc1trXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdGFyZ2V0O1xufVxuXG5cbnZhciBkZWJ1ZztcbmlmIChwcm9jZXNzLmVudi5OT0RFX0RFQlVHICYmIC9cXGJ0dW5uZWxcXGIvLnRlc3QocHJvY2Vzcy5lbnYuTk9ERV9ERUJVRykpIHtcbiAgZGVidWcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgaWYgKHR5cGVvZiBhcmdzWzBdID09PSAnc3RyaW5nJykge1xuICAgICAgYXJnc1swXSA9ICdUVU5ORUw6ICcgKyBhcmdzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcmdzLnVuc2hpZnQoJ1RVTk5FTDonKTtcbiAgICB9XG4gICAgY29uc29sZS5lcnJvci5hcHBseShjb25zb2xlLCBhcmdzKTtcbiAgfVxufSBlbHNlIHtcbiAgZGVidWcgPSBmdW5jdGlvbigpIHt9O1xufVxuZXhwb3J0cy5kZWJ1ZyA9IGRlYnVnOyAvLyBmb3IgdGVzdFxuIiwiZXhwb3J0IHsgZGVmYXVsdCBhcyB2MSB9IGZyb20gJy4vdjEuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyB2MyB9IGZyb20gJy4vdjMuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyB2NCB9IGZyb20gJy4vdjQuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyB2NSB9IGZyb20gJy4vdjUuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBOSUwgfSBmcm9tICcuL25pbC5qcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIHZlcnNpb24gfSBmcm9tICcuL3ZlcnNpb24uanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyB2YWxpZGF0ZSB9IGZyb20gJy4vdmFsaWRhdGUuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBzdHJpbmdpZnkgfSBmcm9tICcuL3N0cmluZ2lmeS5qcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIHBhcnNlIH0gZnJvbSAnLi9wYXJzZS5qcyc7IiwiLypcbiAqIEJyb3dzZXItY29tcGF0aWJsZSBKYXZhU2NyaXB0IE1ENVxuICpcbiAqIE1vZGlmaWNhdGlvbiBvZiBKYXZhU2NyaXB0IE1ENVxuICogaHR0cHM6Ly9naXRodWIuY29tL2JsdWVpbXAvSmF2YVNjcmlwdC1NRDVcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMSwgU2ViYXN0aWFuIFRzY2hhblxuICogaHR0cHM6Ly9ibHVlaW1wLm5ldFxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqIGh0dHBzOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKlxuICogQmFzZWQgb25cbiAqIEEgSmF2YVNjcmlwdCBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgUlNBIERhdGEgU2VjdXJpdHksIEluYy4gTUQ1IE1lc3NhZ2VcbiAqIERpZ2VzdCBBbGdvcml0aG0sIGFzIGRlZmluZWQgaW4gUkZDIDEzMjEuXG4gKiBWZXJzaW9uIDIuMiBDb3B5cmlnaHQgKEMpIFBhdWwgSm9obnN0b24gMTk5OSAtIDIwMDlcbiAqIE90aGVyIGNvbnRyaWJ1dG9yczogR3JlZyBIb2x0LCBBbmRyZXcgS2VwZXJ0LCBZZG5hciwgTG9zdGluZXRcbiAqIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBCU0QgTGljZW5zZVxuICogU2VlIGh0dHA6Ly9wYWpob21lLm9yZy51ay9jcnlwdC9tZDUgZm9yIG1vcmUgaW5mby5cbiAqL1xuZnVuY3Rpb24gbWQ1KGJ5dGVzKSB7XG4gIGlmICh0eXBlb2YgYnl0ZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIG1zZyA9IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChieXRlcykpOyAvLyBVVEY4IGVzY2FwZVxuXG4gICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheShtc2cubGVuZ3RoKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbXNnLmxlbmd0aDsgKytpKSB7XG4gICAgICBieXRlc1tpXSA9IG1zZy5jaGFyQ29kZUF0KGkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtZDVUb0hleEVuY29kZWRBcnJheSh3b3Jkc1RvTWQ1KGJ5dGVzVG9Xb3JkcyhieXRlcyksIGJ5dGVzLmxlbmd0aCAqIDgpKTtcbn1cbi8qXG4gKiBDb252ZXJ0IGFuIGFycmF5IG9mIGxpdHRsZS1lbmRpYW4gd29yZHMgdG8gYW4gYXJyYXkgb2YgYnl0ZXNcbiAqL1xuXG5cbmZ1bmN0aW9uIG1kNVRvSGV4RW5jb2RlZEFycmF5KGlucHV0KSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgdmFyIGxlbmd0aDMyID0gaW5wdXQubGVuZ3RoICogMzI7XG4gIHZhciBoZXhUYWIgPSAnMDEyMzQ1Njc4OWFiY2RlZic7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGgzMjsgaSArPSA4KSB7XG4gICAgdmFyIHggPSBpbnB1dFtpID4+IDVdID4+PiBpICUgMzIgJiAweGZmO1xuICAgIHZhciBoZXggPSBwYXJzZUludChoZXhUYWIuY2hhckF0KHggPj4+IDQgJiAweDBmKSArIGhleFRhYi5jaGFyQXQoeCAmIDB4MGYpLCAxNik7XG4gICAgb3V0cHV0LnB1c2goaGV4KTtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59XG4vKipcbiAqIENhbGN1bGF0ZSBvdXRwdXQgbGVuZ3RoIHdpdGggcGFkZGluZyBhbmQgYml0IGxlbmd0aFxuICovXG5cblxuZnVuY3Rpb24gZ2V0T3V0cHV0TGVuZ3RoKGlucHV0TGVuZ3RoOCkge1xuICByZXR1cm4gKGlucHV0TGVuZ3RoOCArIDY0ID4+PiA5IDw8IDQpICsgMTQgKyAxO1xufVxuLypcbiAqIENhbGN1bGF0ZSB0aGUgTUQ1IG9mIGFuIGFycmF5IG9mIGxpdHRsZS1lbmRpYW4gd29yZHMsIGFuZCBhIGJpdCBsZW5ndGguXG4gKi9cblxuXG5mdW5jdGlvbiB3b3Jkc1RvTWQ1KHgsIGxlbikge1xuICAvKiBhcHBlbmQgcGFkZGluZyAqL1xuICB4W2xlbiA+PiA1XSB8PSAweDgwIDw8IGxlbiAlIDMyO1xuICB4W2dldE91dHB1dExlbmd0aChsZW4pIC0gMV0gPSBsZW47XG4gIHZhciBhID0gMTczMjU4NDE5MztcbiAgdmFyIGIgPSAtMjcxNzMzODc5O1xuICB2YXIgYyA9IC0xNzMyNTg0MTk0O1xuICB2YXIgZCA9IDI3MTczMzg3ODtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpICs9IDE2KSB7XG4gICAgdmFyIG9sZGEgPSBhO1xuICAgIHZhciBvbGRiID0gYjtcbiAgICB2YXIgb2xkYyA9IGM7XG4gICAgdmFyIG9sZGQgPSBkO1xuICAgIGEgPSBtZDVmZihhLCBiLCBjLCBkLCB4W2ldLCA3LCAtNjgwODc2OTM2KTtcbiAgICBkID0gbWQ1ZmYoZCwgYSwgYiwgYywgeFtpICsgMV0sIDEyLCAtMzg5NTY0NTg2KTtcbiAgICBjID0gbWQ1ZmYoYywgZCwgYSwgYiwgeFtpICsgMl0sIDE3LCA2MDYxMDU4MTkpO1xuICAgIGIgPSBtZDVmZihiLCBjLCBkLCBhLCB4W2kgKyAzXSwgMjIsIC0xMDQ0NTI1MzMwKTtcbiAgICBhID0gbWQ1ZmYoYSwgYiwgYywgZCwgeFtpICsgNF0sIDcsIC0xNzY0MTg4OTcpO1xuICAgIGQgPSBtZDVmZihkLCBhLCBiLCBjLCB4W2kgKyA1XSwgMTIsIDEyMDAwODA0MjYpO1xuICAgIGMgPSBtZDVmZihjLCBkLCBhLCBiLCB4W2kgKyA2XSwgMTcsIC0xNDczMjMxMzQxKTtcbiAgICBiID0gbWQ1ZmYoYiwgYywgZCwgYSwgeFtpICsgN10sIDIyLCAtNDU3MDU5ODMpO1xuICAgIGEgPSBtZDVmZihhLCBiLCBjLCBkLCB4W2kgKyA4XSwgNywgMTc3MDAzNTQxNik7XG4gICAgZCA9IG1kNWZmKGQsIGEsIGIsIGMsIHhbaSArIDldLCAxMiwgLTE5NTg0MTQ0MTcpO1xuICAgIGMgPSBtZDVmZihjLCBkLCBhLCBiLCB4W2kgKyAxMF0sIDE3LCAtNDIwNjMpO1xuICAgIGIgPSBtZDVmZihiLCBjLCBkLCBhLCB4W2kgKyAxMV0sIDIyLCAtMTk5MDQwNDE2Mik7XG4gICAgYSA9IG1kNWZmKGEsIGIsIGMsIGQsIHhbaSArIDEyXSwgNywgMTgwNDYwMzY4Mik7XG4gICAgZCA9IG1kNWZmKGQsIGEsIGIsIGMsIHhbaSArIDEzXSwgMTIsIC00MDM0MTEwMSk7XG4gICAgYyA9IG1kNWZmKGMsIGQsIGEsIGIsIHhbaSArIDE0XSwgMTcsIC0xNTAyMDAyMjkwKTtcbiAgICBiID0gbWQ1ZmYoYiwgYywgZCwgYSwgeFtpICsgMTVdLCAyMiwgMTIzNjUzNTMyOSk7XG4gICAgYSA9IG1kNWdnKGEsIGIsIGMsIGQsIHhbaSArIDFdLCA1LCAtMTY1Nzk2NTEwKTtcbiAgICBkID0gbWQ1Z2coZCwgYSwgYiwgYywgeFtpICsgNl0sIDksIC0xMDY5NTAxNjMyKTtcbiAgICBjID0gbWQ1Z2coYywgZCwgYSwgYiwgeFtpICsgMTFdLCAxNCwgNjQzNzE3NzEzKTtcbiAgICBiID0gbWQ1Z2coYiwgYywgZCwgYSwgeFtpXSwgMjAsIC0zNzM4OTczMDIpO1xuICAgIGEgPSBtZDVnZyhhLCBiLCBjLCBkLCB4W2kgKyA1XSwgNSwgLTcwMTU1ODY5MSk7XG4gICAgZCA9IG1kNWdnKGQsIGEsIGIsIGMsIHhbaSArIDEwXSwgOSwgMzgwMTYwODMpO1xuICAgIGMgPSBtZDVnZyhjLCBkLCBhLCBiLCB4W2kgKyAxNV0sIDE0LCAtNjYwNDc4MzM1KTtcbiAgICBiID0gbWQ1Z2coYiwgYywgZCwgYSwgeFtpICsgNF0sIDIwLCAtNDA1NTM3ODQ4KTtcbiAgICBhID0gbWQ1Z2coYSwgYiwgYywgZCwgeFtpICsgOV0sIDUsIDU2ODQ0NjQzOCk7XG4gICAgZCA9IG1kNWdnKGQsIGEsIGIsIGMsIHhbaSArIDE0XSwgOSwgLTEwMTk4MDM2OTApO1xuICAgIGMgPSBtZDVnZyhjLCBkLCBhLCBiLCB4W2kgKyAzXSwgMTQsIC0xODczNjM5NjEpO1xuICAgIGIgPSBtZDVnZyhiLCBjLCBkLCBhLCB4W2kgKyA4XSwgMjAsIDExNjM1MzE1MDEpO1xuICAgIGEgPSBtZDVnZyhhLCBiLCBjLCBkLCB4W2kgKyAxM10sIDUsIC0xNDQ0NjgxNDY3KTtcbiAgICBkID0gbWQ1Z2coZCwgYSwgYiwgYywgeFtpICsgMl0sIDksIC01MTQwMzc4NCk7XG4gICAgYyA9IG1kNWdnKGMsIGQsIGEsIGIsIHhbaSArIDddLCAxNCwgMTczNTMyODQ3Myk7XG4gICAgYiA9IG1kNWdnKGIsIGMsIGQsIGEsIHhbaSArIDEyXSwgMjAsIC0xOTI2NjA3NzM0KTtcbiAgICBhID0gbWQ1aGgoYSwgYiwgYywgZCwgeFtpICsgNV0sIDQsIC0zNzg1NTgpO1xuICAgIGQgPSBtZDVoaChkLCBhLCBiLCBjLCB4W2kgKyA4XSwgMTEsIC0yMDIyNTc0NDYzKTtcbiAgICBjID0gbWQ1aGgoYywgZCwgYSwgYiwgeFtpICsgMTFdLCAxNiwgMTgzOTAzMDU2Mik7XG4gICAgYiA9IG1kNWhoKGIsIGMsIGQsIGEsIHhbaSArIDE0XSwgMjMsIC0zNTMwOTU1Nik7XG4gICAgYSA9IG1kNWhoKGEsIGIsIGMsIGQsIHhbaSArIDFdLCA0LCAtMTUzMDk5MjA2MCk7XG4gICAgZCA9IG1kNWhoKGQsIGEsIGIsIGMsIHhbaSArIDRdLCAxMSwgMTI3Mjg5MzM1Myk7XG4gICAgYyA9IG1kNWhoKGMsIGQsIGEsIGIsIHhbaSArIDddLCAxNiwgLTE1NTQ5NzYzMik7XG4gICAgYiA9IG1kNWhoKGIsIGMsIGQsIGEsIHhbaSArIDEwXSwgMjMsIC0xMDk0NzMwNjQwKTtcbiAgICBhID0gbWQ1aGgoYSwgYiwgYywgZCwgeFtpICsgMTNdLCA0LCA2ODEyNzkxNzQpO1xuICAgIGQgPSBtZDVoaChkLCBhLCBiLCBjLCB4W2ldLCAxMSwgLTM1ODUzNzIyMik7XG4gICAgYyA9IG1kNWhoKGMsIGQsIGEsIGIsIHhbaSArIDNdLCAxNiwgLTcyMjUyMTk3OSk7XG4gICAgYiA9IG1kNWhoKGIsIGMsIGQsIGEsIHhbaSArIDZdLCAyMywgNzYwMjkxODkpO1xuICAgIGEgPSBtZDVoaChhLCBiLCBjLCBkLCB4W2kgKyA5XSwgNCwgLTY0MDM2NDQ4Nyk7XG4gICAgZCA9IG1kNWhoKGQsIGEsIGIsIGMsIHhbaSArIDEyXSwgMTEsIC00MjE4MTU4MzUpO1xuICAgIGMgPSBtZDVoaChjLCBkLCBhLCBiLCB4W2kgKyAxNV0sIDE2LCA1MzA3NDI1MjApO1xuICAgIGIgPSBtZDVoaChiLCBjLCBkLCBhLCB4W2kgKyAyXSwgMjMsIC05OTUzMzg2NTEpO1xuICAgIGEgPSBtZDVpaShhLCBiLCBjLCBkLCB4W2ldLCA2LCAtMTk4NjMwODQ0KTtcbiAgICBkID0gbWQ1aWkoZCwgYSwgYiwgYywgeFtpICsgN10sIDEwLCAxMTI2ODkxNDE1KTtcbiAgICBjID0gbWQ1aWkoYywgZCwgYSwgYiwgeFtpICsgMTRdLCAxNSwgLTE0MTYzNTQ5MDUpO1xuICAgIGIgPSBtZDVpaShiLCBjLCBkLCBhLCB4W2kgKyA1XSwgMjEsIC01NzQzNDA1NSk7XG4gICAgYSA9IG1kNWlpKGEsIGIsIGMsIGQsIHhbaSArIDEyXSwgNiwgMTcwMDQ4NTU3MSk7XG4gICAgZCA9IG1kNWlpKGQsIGEsIGIsIGMsIHhbaSArIDNdLCAxMCwgLTE4OTQ5ODY2MDYpO1xuICAgIGMgPSBtZDVpaShjLCBkLCBhLCBiLCB4W2kgKyAxMF0sIDE1LCAtMTA1MTUyMyk7XG4gICAgYiA9IG1kNWlpKGIsIGMsIGQsIGEsIHhbaSArIDFdLCAyMSwgLTIwNTQ5MjI3OTkpO1xuICAgIGEgPSBtZDVpaShhLCBiLCBjLCBkLCB4W2kgKyA4XSwgNiwgMTg3MzMxMzM1OSk7XG4gICAgZCA9IG1kNWlpKGQsIGEsIGIsIGMsIHhbaSArIDE1XSwgMTAsIC0zMDYxMTc0NCk7XG4gICAgYyA9IG1kNWlpKGMsIGQsIGEsIGIsIHhbaSArIDZdLCAxNSwgLTE1NjAxOTgzODApO1xuICAgIGIgPSBtZDVpaShiLCBjLCBkLCBhLCB4W2kgKyAxM10sIDIxLCAxMzA5MTUxNjQ5KTtcbiAgICBhID0gbWQ1aWkoYSwgYiwgYywgZCwgeFtpICsgNF0sIDYsIC0xNDU1MjMwNzApO1xuICAgIGQgPSBtZDVpaShkLCBhLCBiLCBjLCB4W2kgKyAxMV0sIDEwLCAtMTEyMDIxMDM3OSk7XG4gICAgYyA9IG1kNWlpKGMsIGQsIGEsIGIsIHhbaSArIDJdLCAxNSwgNzE4Nzg3MjU5KTtcbiAgICBiID0gbWQ1aWkoYiwgYywgZCwgYSwgeFtpICsgOV0sIDIxLCAtMzQzNDg1NTUxKTtcbiAgICBhID0gc2FmZUFkZChhLCBvbGRhKTtcbiAgICBiID0gc2FmZUFkZChiLCBvbGRiKTtcbiAgICBjID0gc2FmZUFkZChjLCBvbGRjKTtcbiAgICBkID0gc2FmZUFkZChkLCBvbGRkKTtcbiAgfVxuXG4gIHJldHVybiBbYSwgYiwgYywgZF07XG59XG4vKlxuICogQ29udmVydCBhbiBhcnJheSBieXRlcyB0byBhbiBhcnJheSBvZiBsaXR0bGUtZW5kaWFuIHdvcmRzXG4gKiBDaGFyYWN0ZXJzID4yNTUgaGF2ZSB0aGVpciBoaWdoLWJ5dGUgc2lsZW50bHkgaWdub3JlZC5cbiAqL1xuXG5cbmZ1bmN0aW9uIGJ5dGVzVG9Xb3JkcyhpbnB1dCkge1xuICBpZiAoaW5wdXQubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgdmFyIGxlbmd0aDggPSBpbnB1dC5sZW5ndGggKiA4O1xuICB2YXIgb3V0cHV0ID0gbmV3IFVpbnQzMkFycmF5KGdldE91dHB1dExlbmd0aChsZW5ndGg4KSk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg4OyBpICs9IDgpIHtcbiAgICBvdXRwdXRbaSA+PiA1XSB8PSAoaW5wdXRbaSAvIDhdICYgMHhmZikgPDwgaSAlIDMyO1xuICB9XG5cbiAgcmV0dXJuIG91dHB1dDtcbn1cbi8qXG4gKiBBZGQgaW50ZWdlcnMsIHdyYXBwaW5nIGF0IDJeMzIuIFRoaXMgdXNlcyAxNi1iaXQgb3BlcmF0aW9ucyBpbnRlcm5hbGx5XG4gKiB0byB3b3JrIGFyb3VuZCBidWdzIGluIHNvbWUgSlMgaW50ZXJwcmV0ZXJzLlxuICovXG5cblxuZnVuY3Rpb24gc2FmZUFkZCh4LCB5KSB7XG4gIHZhciBsc3cgPSAoeCAmIDB4ZmZmZikgKyAoeSAmIDB4ZmZmZik7XG4gIHZhciBtc3cgPSAoeCA+PiAxNikgKyAoeSA+PiAxNikgKyAobHN3ID4+IDE2KTtcbiAgcmV0dXJuIG1zdyA8PCAxNiB8IGxzdyAmIDB4ZmZmZjtcbn1cbi8qXG4gKiBCaXR3aXNlIHJvdGF0ZSBhIDMyLWJpdCBudW1iZXIgdG8gdGhlIGxlZnQuXG4gKi9cblxuXG5mdW5jdGlvbiBiaXRSb3RhdGVMZWZ0KG51bSwgY250KSB7XG4gIHJldHVybiBudW0gPDwgY250IHwgbnVtID4+PiAzMiAtIGNudDtcbn1cbi8qXG4gKiBUaGVzZSBmdW5jdGlvbnMgaW1wbGVtZW50IHRoZSBmb3VyIGJhc2ljIG9wZXJhdGlvbnMgdGhlIGFsZ29yaXRobSB1c2VzLlxuICovXG5cblxuZnVuY3Rpb24gbWQ1Y21uKHEsIGEsIGIsIHgsIHMsIHQpIHtcbiAgcmV0dXJuIHNhZmVBZGQoYml0Um90YXRlTGVmdChzYWZlQWRkKHNhZmVBZGQoYSwgcSksIHNhZmVBZGQoeCwgdCkpLCBzKSwgYik7XG59XG5cbmZ1bmN0aW9uIG1kNWZmKGEsIGIsIGMsIGQsIHgsIHMsIHQpIHtcbiAgcmV0dXJuIG1kNWNtbihiICYgYyB8IH5iICYgZCwgYSwgYiwgeCwgcywgdCk7XG59XG5cbmZ1bmN0aW9uIG1kNWdnKGEsIGIsIGMsIGQsIHgsIHMsIHQpIHtcbiAgcmV0dXJuIG1kNWNtbihiICYgZCB8IGMgJiB+ZCwgYSwgYiwgeCwgcywgdCk7XG59XG5cbmZ1bmN0aW9uIG1kNWhoKGEsIGIsIGMsIGQsIHgsIHMsIHQpIHtcbiAgcmV0dXJuIG1kNWNtbihiIF4gYyBeIGQsIGEsIGIsIHgsIHMsIHQpO1xufVxuXG5mdW5jdGlvbiBtZDVpaShhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XG4gIHJldHVybiBtZDVjbW4oYyBeIChiIHwgfmQpLCBhLCBiLCB4LCBzLCB0KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWQ1OyIsImV4cG9ydCBkZWZhdWx0ICcwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAnOyIsImltcG9ydCB2YWxpZGF0ZSBmcm9tICcuL3ZhbGlkYXRlLmpzJztcblxuZnVuY3Rpb24gcGFyc2UodXVpZCkge1xuICBpZiAoIXZhbGlkYXRlKHV1aWQpKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKCdJbnZhbGlkIFVVSUQnKTtcbiAgfVxuXG4gIHZhciB2O1xuICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoMTYpOyAvLyBQYXJzZSAjIyMjIyMjIy0uLi4uLS4uLi4tLi4uLi0uLi4uLi4uLi4uLi5cblxuICBhcnJbMF0gPSAodiA9IHBhcnNlSW50KHV1aWQuc2xpY2UoMCwgOCksIDE2KSkgPj4+IDI0O1xuICBhcnJbMV0gPSB2ID4+PiAxNiAmIDB4ZmY7XG4gIGFyclsyXSA9IHYgPj4+IDggJiAweGZmO1xuICBhcnJbM10gPSB2ICYgMHhmZjsgLy8gUGFyc2UgLi4uLi4uLi4tIyMjIy0uLi4uLS4uLi4tLi4uLi4uLi4uLi4uXG5cbiAgYXJyWzRdID0gKHYgPSBwYXJzZUludCh1dWlkLnNsaWNlKDksIDEzKSwgMTYpKSA+Pj4gODtcbiAgYXJyWzVdID0gdiAmIDB4ZmY7IC8vIFBhcnNlIC4uLi4uLi4uLS4uLi4tIyMjIy0uLi4uLS4uLi4uLi4uLi4uLlxuXG4gIGFycls2XSA9ICh2ID0gcGFyc2VJbnQodXVpZC5zbGljZSgxNCwgMTgpLCAxNikpID4+PiA4O1xuICBhcnJbN10gPSB2ICYgMHhmZjsgLy8gUGFyc2UgLi4uLi4uLi4tLi4uLi0uLi4uLSMjIyMtLi4uLi4uLi4uLi4uXG5cbiAgYXJyWzhdID0gKHYgPSBwYXJzZUludCh1dWlkLnNsaWNlKDE5LCAyMyksIDE2KSkgPj4+IDg7XG4gIGFycls5XSA9IHYgJiAweGZmOyAvLyBQYXJzZSAuLi4uLi4uLi0uLi4uLS4uLi4tLi4uLi0jIyMjIyMjIyMjIyNcbiAgLy8gKFVzZSBcIi9cIiB0byBhdm9pZCAzMi1iaXQgdHJ1bmNhdGlvbiB3aGVuIGJpdC1zaGlmdGluZyBoaWdoLW9yZGVyIGJ5dGVzKVxuXG4gIGFyclsxMF0gPSAodiA9IHBhcnNlSW50KHV1aWQuc2xpY2UoMjQsIDM2KSwgMTYpKSAvIDB4MTAwMDAwMDAwMDAgJiAweGZmO1xuICBhcnJbMTFdID0gdiAvIDB4MTAwMDAwMDAwICYgMHhmZjtcbiAgYXJyWzEyXSA9IHYgPj4+IDI0ICYgMHhmZjtcbiAgYXJyWzEzXSA9IHYgPj4+IDE2ICYgMHhmZjtcbiAgYXJyWzE0XSA9IHYgPj4+IDggJiAweGZmO1xuICBhcnJbMTVdID0gdiAmIDB4ZmY7XG4gIHJldHVybiBhcnI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHBhcnNlOyIsImV4cG9ydCBkZWZhdWx0IC9eKD86WzAtOWEtZl17OH0tWzAtOWEtZl17NH0tWzEtNV1bMC05YS1mXXszfS1bODlhYl1bMC05YS1mXXszfS1bMC05YS1mXXsxMn18MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwKSQvaTsiLCIvLyBVbmlxdWUgSUQgY3JlYXRpb24gcmVxdWlyZXMgYSBoaWdoIHF1YWxpdHkgcmFuZG9tICMgZ2VuZXJhdG9yLiBJbiB0aGUgYnJvd3NlciB3ZSB0aGVyZWZvcmVcbi8vIHJlcXVpcmUgdGhlIGNyeXB0byBBUEkgYW5kIGRvIG5vdCBzdXBwb3J0IGJ1aWx0LWluIGZhbGxiYWNrIHRvIGxvd2VyIHF1YWxpdHkgcmFuZG9tIG51bWJlclxuLy8gZ2VuZXJhdG9ycyAobGlrZSBNYXRoLnJhbmRvbSgpKS5cbnZhciBnZXRSYW5kb21WYWx1ZXM7XG52YXIgcm5kczggPSBuZXcgVWludDhBcnJheSgxNik7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBybmcoKSB7XG4gIC8vIGxhenkgbG9hZCBzbyB0aGF0IGVudmlyb25tZW50cyB0aGF0IG5lZWQgdG8gcG9seWZpbGwgaGF2ZSBhIGNoYW5jZSB0byBkbyBzb1xuICBpZiAoIWdldFJhbmRvbVZhbHVlcykge1xuICAgIC8vIGdldFJhbmRvbVZhbHVlcyBuZWVkcyB0byBiZSBpbnZva2VkIGluIGEgY29udGV4dCB3aGVyZSBcInRoaXNcIiBpcyBhIENyeXB0byBpbXBsZW1lbnRhdGlvbi4gQWxzbyxcbiAgICAvLyBmaW5kIHRoZSBjb21wbGV0ZSBpbXBsZW1lbnRhdGlvbiBvZiBjcnlwdG8gKG1zQ3J5cHRvKSBvbiBJRTExLlxuICAgIGdldFJhbmRvbVZhbHVlcyA9IHR5cGVvZiBjcnlwdG8gIT09ICd1bmRlZmluZWQnICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMgJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKGNyeXB0bykgfHwgdHlwZW9mIG1zQ3J5cHRvICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbXNDcnlwdG8uZ2V0UmFuZG9tVmFsdWVzID09PSAnZnVuY3Rpb24nICYmIG1zQ3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKG1zQ3J5cHRvKTtcblxuICAgIGlmICghZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyeXB0by5nZXRSYW5kb21WYWx1ZXMoKSBub3Qgc3VwcG9ydGVkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3V1aWRqcy91dWlkI2dldHJhbmRvbXZhbHVlcy1ub3Qtc3VwcG9ydGVkJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGdldFJhbmRvbVZhbHVlcyhybmRzOCk7XG59IiwiLy8gQWRhcHRlZCBmcm9tIENocmlzIFZlbmVzcycgU0hBMSBjb2RlIGF0XG4vLyBodHRwOi8vd3d3Lm1vdmFibGUtdHlwZS5jby51ay9zY3JpcHRzL3NoYTEuaHRtbFxuZnVuY3Rpb24gZihzLCB4LCB5LCB6KSB7XG4gIHN3aXRjaCAocykge1xuICAgIGNhc2UgMDpcbiAgICAgIHJldHVybiB4ICYgeSBeIH54ICYgejtcblxuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiB4IF4geSBeIHo7XG5cbiAgICBjYXNlIDI6XG4gICAgICByZXR1cm4geCAmIHkgXiB4ICYgeiBeIHkgJiB6O1xuXG4gICAgY2FzZSAzOlxuICAgICAgcmV0dXJuIHggXiB5IF4gejtcbiAgfVxufVxuXG5mdW5jdGlvbiBST1RMKHgsIG4pIHtcbiAgcmV0dXJuIHggPDwgbiB8IHggPj4+IDMyIC0gbjtcbn1cblxuZnVuY3Rpb24gc2hhMShieXRlcykge1xuICB2YXIgSyA9IFsweDVhODI3OTk5LCAweDZlZDllYmExLCAweDhmMWJiY2RjLCAweGNhNjJjMWQ2XTtcbiAgdmFyIEggPSBbMHg2NzQ1MjMwMSwgMHhlZmNkYWI4OSwgMHg5OGJhZGNmZSwgMHgxMDMyNTQ3NiwgMHhjM2QyZTFmMF07XG5cbiAgaWYgKHR5cGVvZiBieXRlcyA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIgbXNnID0gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGJ5dGVzKSk7IC8vIFVURjggZXNjYXBlXG5cbiAgICBieXRlcyA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtc2cubGVuZ3RoOyArK2kpIHtcbiAgICAgIGJ5dGVzLnB1c2gobXNnLmNoYXJDb2RlQXQoaSkpO1xuICAgIH1cbiAgfSBlbHNlIGlmICghQXJyYXkuaXNBcnJheShieXRlcykpIHtcbiAgICAvLyBDb252ZXJ0IEFycmF5LWxpa2UgdG8gQXJyYXlcbiAgICBieXRlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGJ5dGVzKTtcbiAgfVxuXG4gIGJ5dGVzLnB1c2goMHg4MCk7XG4gIHZhciBsID0gYnl0ZXMubGVuZ3RoIC8gNCArIDI7XG4gIHZhciBOID0gTWF0aC5jZWlsKGwgLyAxNik7XG4gIHZhciBNID0gbmV3IEFycmF5KE4pO1xuXG4gIGZvciAodmFyIF9pID0gMDsgX2kgPCBOOyArK19pKSB7XG4gICAgdmFyIGFyciA9IG5ldyBVaW50MzJBcnJheSgxNik7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IDE2OyArK2opIHtcbiAgICAgIGFycltqXSA9IGJ5dGVzW19pICogNjQgKyBqICogNF0gPDwgMjQgfCBieXRlc1tfaSAqIDY0ICsgaiAqIDQgKyAxXSA8PCAxNiB8IGJ5dGVzW19pICogNjQgKyBqICogNCArIDJdIDw8IDggfCBieXRlc1tfaSAqIDY0ICsgaiAqIDQgKyAzXTtcbiAgICB9XG5cbiAgICBNW19pXSA9IGFycjtcbiAgfVxuXG4gIE1bTiAtIDFdWzE0XSA9IChieXRlcy5sZW5ndGggLSAxKSAqIDggLyBNYXRoLnBvdygyLCAzMik7XG4gIE1bTiAtIDFdWzE0XSA9IE1hdGguZmxvb3IoTVtOIC0gMV1bMTRdKTtcbiAgTVtOIC0gMV1bMTVdID0gKGJ5dGVzLmxlbmd0aCAtIDEpICogOCAmIDB4ZmZmZmZmZmY7XG5cbiAgZm9yICh2YXIgX2kyID0gMDsgX2kyIDwgTjsgKytfaTIpIHtcbiAgICB2YXIgVyA9IG5ldyBVaW50MzJBcnJheSg4MCk7XG5cbiAgICBmb3IgKHZhciB0ID0gMDsgdCA8IDE2OyArK3QpIHtcbiAgICAgIFdbdF0gPSBNW19pMl1bdF07XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX3QgPSAxNjsgX3QgPCA4MDsgKytfdCkge1xuICAgICAgV1tfdF0gPSBST1RMKFdbX3QgLSAzXSBeIFdbX3QgLSA4XSBeIFdbX3QgLSAxNF0gXiBXW190IC0gMTZdLCAxKTtcbiAgICB9XG5cbiAgICB2YXIgYSA9IEhbMF07XG4gICAgdmFyIGIgPSBIWzFdO1xuICAgIHZhciBjID0gSFsyXTtcbiAgICB2YXIgZCA9IEhbM107XG4gICAgdmFyIGUgPSBIWzRdO1xuXG4gICAgZm9yICh2YXIgX3QyID0gMDsgX3QyIDwgODA7ICsrX3QyKSB7XG4gICAgICB2YXIgcyA9IE1hdGguZmxvb3IoX3QyIC8gMjApO1xuICAgICAgdmFyIFQgPSBST1RMKGEsIDUpICsgZihzLCBiLCBjLCBkKSArIGUgKyBLW3NdICsgV1tfdDJdID4+PiAwO1xuICAgICAgZSA9IGQ7XG4gICAgICBkID0gYztcbiAgICAgIGMgPSBST1RMKGIsIDMwKSA+Pj4gMDtcbiAgICAgIGIgPSBhO1xuICAgICAgYSA9IFQ7XG4gICAgfVxuXG4gICAgSFswXSA9IEhbMF0gKyBhID4+PiAwO1xuICAgIEhbMV0gPSBIWzFdICsgYiA+Pj4gMDtcbiAgICBIWzJdID0gSFsyXSArIGMgPj4+IDA7XG4gICAgSFszXSA9IEhbM10gKyBkID4+PiAwO1xuICAgIEhbNF0gPSBIWzRdICsgZSA+Pj4gMDtcbiAgfVxuXG4gIHJldHVybiBbSFswXSA+PiAyNCAmIDB4ZmYsIEhbMF0gPj4gMTYgJiAweGZmLCBIWzBdID4+IDggJiAweGZmLCBIWzBdICYgMHhmZiwgSFsxXSA+PiAyNCAmIDB4ZmYsIEhbMV0gPj4gMTYgJiAweGZmLCBIWzFdID4+IDggJiAweGZmLCBIWzFdICYgMHhmZiwgSFsyXSA+PiAyNCAmIDB4ZmYsIEhbMl0gPj4gMTYgJiAweGZmLCBIWzJdID4+IDggJiAweGZmLCBIWzJdICYgMHhmZiwgSFszXSA+PiAyNCAmIDB4ZmYsIEhbM10gPj4gMTYgJiAweGZmLCBIWzNdID4+IDggJiAweGZmLCBIWzNdICYgMHhmZiwgSFs0XSA+PiAyNCAmIDB4ZmYsIEhbNF0gPj4gMTYgJiAweGZmLCBIWzRdID4+IDggJiAweGZmLCBIWzRdICYgMHhmZl07XG59XG5cbmV4cG9ydCBkZWZhdWx0IHNoYTE7IiwiaW1wb3J0IHZhbGlkYXRlIGZyb20gJy4vdmFsaWRhdGUuanMnO1xuLyoqXG4gKiBDb252ZXJ0IGFycmF5IG9mIDE2IGJ5dGUgdmFsdWVzIHRvIFVVSUQgc3RyaW5nIGZvcm1hdCBvZiB0aGUgZm9ybTpcbiAqIFhYWFhYWFhYLVhYWFgtWFhYWC1YWFhYLVhYWFhYWFhYWFhYWFxuICovXG5cbnZhciBieXRlVG9IZXggPSBbXTtcblxuZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXgucHVzaCgoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpKTtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5KGFycikge1xuICB2YXIgb2Zmc2V0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAwO1xuICAvLyBOb3RlOiBCZSBjYXJlZnVsIGVkaXRpbmcgdGhpcyBjb2RlISAgSXQncyBiZWVuIHR1bmVkIGZvciBwZXJmb3JtYW5jZVxuICAvLyBhbmQgd29ya3MgaW4gd2F5cyB5b3UgbWF5IG5vdCBleHBlY3QuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdXVpZGpzL3V1aWQvcHVsbC80MzRcbiAgdmFyIHV1aWQgPSAoYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAwXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDFdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMl1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAzXV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDRdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgNV1dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA2XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDddXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgOF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA5XV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDEwXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDExXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDEyXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDEzXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDE0XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDE1XV0pLnRvTG93ZXJDYXNlKCk7IC8vIENvbnNpc3RlbmN5IGNoZWNrIGZvciB2YWxpZCBVVUlELiAgSWYgdGhpcyB0aHJvd3MsIGl0J3MgbGlrZWx5IGR1ZSB0byBvbmVcbiAgLy8gb2YgdGhlIGZvbGxvd2luZzpcbiAgLy8gLSBPbmUgb3IgbW9yZSBpbnB1dCBhcnJheSB2YWx1ZXMgZG9uJ3QgbWFwIHRvIGEgaGV4IG9jdGV0IChsZWFkaW5nIHRvXG4gIC8vIFwidW5kZWZpbmVkXCIgaW4gdGhlIHV1aWQpXG4gIC8vIC0gSW52YWxpZCBpbnB1dCB2YWx1ZXMgZm9yIHRoZSBSRkMgYHZlcnNpb25gIG9yIGB2YXJpYW50YCBmaWVsZHNcblxuICBpZiAoIXZhbGlkYXRlKHV1aWQpKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKCdTdHJpbmdpZmllZCBVVUlEIGlzIGludmFsaWQnKTtcbiAgfVxuXG4gIHJldHVybiB1dWlkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBzdHJpbmdpZnk7IiwiaW1wb3J0IHJuZyBmcm9tICcuL3JuZy5qcyc7XG5pbXBvcnQgc3RyaW5naWZ5IGZyb20gJy4vc3RyaW5naWZ5LmpzJzsgLy8gKipgdjEoKWAgLSBHZW5lcmF0ZSB0aW1lLWJhc2VkIFVVSUQqKlxuLy9cbi8vIEluc3BpcmVkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9MaW9zSy9VVUlELmpzXG4vLyBhbmQgaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L3V1aWQuaHRtbFxuXG52YXIgX25vZGVJZDtcblxudmFyIF9jbG9ja3NlcTsgLy8gUHJldmlvdXMgdXVpZCBjcmVhdGlvbiB0aW1lXG5cblxudmFyIF9sYXN0TVNlY3MgPSAwO1xudmFyIF9sYXN0TlNlY3MgPSAwOyAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3V1aWRqcy91dWlkIGZvciBBUEkgZGV0YWlsc1xuXG5mdW5jdGlvbiB2MShvcHRpb25zLCBidWYsIG9mZnNldCkge1xuICB2YXIgaSA9IGJ1ZiAmJiBvZmZzZXQgfHwgMDtcbiAgdmFyIGIgPSBidWYgfHwgbmV3IEFycmF5KDE2KTtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBub2RlID0gb3B0aW9ucy5ub2RlIHx8IF9ub2RlSWQ7XG4gIHZhciBjbG9ja3NlcSA9IG9wdGlvbnMuY2xvY2tzZXEgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuY2xvY2tzZXEgOiBfY2xvY2tzZXE7IC8vIG5vZGUgYW5kIGNsb2Nrc2VxIG5lZWQgdG8gYmUgaW5pdGlhbGl6ZWQgdG8gcmFuZG9tIHZhbHVlcyBpZiB0aGV5J3JlIG5vdFxuICAvLyBzcGVjaWZpZWQuICBXZSBkbyB0aGlzIGxhemlseSB0byBtaW5pbWl6ZSBpc3N1ZXMgcmVsYXRlZCB0byBpbnN1ZmZpY2llbnRcbiAgLy8gc3lzdGVtIGVudHJvcHkuICBTZWUgIzE4OVxuXG4gIGlmIChub2RlID09IG51bGwgfHwgY2xvY2tzZXEgPT0gbnVsbCkge1xuICAgIHZhciBzZWVkQnl0ZXMgPSBvcHRpb25zLnJhbmRvbSB8fCAob3B0aW9ucy5ybmcgfHwgcm5nKSgpO1xuXG4gICAgaWYgKG5vZGUgPT0gbnVsbCkge1xuICAgICAgLy8gUGVyIDQuNSwgY3JlYXRlIGFuZCA0OC1iaXQgbm9kZSBpZCwgKDQ3IHJhbmRvbSBiaXRzICsgbXVsdGljYXN0IGJpdCA9IDEpXG4gICAgICBub2RlID0gX25vZGVJZCA9IFtzZWVkQnl0ZXNbMF0gfCAweDAxLCBzZWVkQnl0ZXNbMV0sIHNlZWRCeXRlc1syXSwgc2VlZEJ5dGVzWzNdLCBzZWVkQnl0ZXNbNF0sIHNlZWRCeXRlc1s1XV07XG4gICAgfVxuXG4gICAgaWYgKGNsb2Nrc2VxID09IG51bGwpIHtcbiAgICAgIC8vIFBlciA0LjIuMiwgcmFuZG9taXplICgxNCBiaXQpIGNsb2Nrc2VxXG4gICAgICBjbG9ja3NlcSA9IF9jbG9ja3NlcSA9IChzZWVkQnl0ZXNbNl0gPDwgOCB8IHNlZWRCeXRlc1s3XSkgJiAweDNmZmY7XG4gICAgfVxuICB9IC8vIFVVSUQgdGltZXN0YW1wcyBhcmUgMTAwIG5hbm8tc2Vjb25kIHVuaXRzIHNpbmNlIHRoZSBHcmVnb3JpYW4gZXBvY2gsXG4gIC8vICgxNTgyLTEwLTE1IDAwOjAwKS4gIEpTTnVtYmVycyBhcmVuJ3QgcHJlY2lzZSBlbm91Z2ggZm9yIHRoaXMsIHNvXG4gIC8vIHRpbWUgaXMgaGFuZGxlZCBpbnRlcm5hbGx5IGFzICdtc2VjcycgKGludGVnZXIgbWlsbGlzZWNvbmRzKSBhbmQgJ25zZWNzJ1xuICAvLyAoMTAwLW5hbm9zZWNvbmRzIG9mZnNldCBmcm9tIG1zZWNzKSBzaW5jZSB1bml4IGVwb2NoLCAxOTcwLTAxLTAxIDAwOjAwLlxuXG5cbiAgdmFyIG1zZWNzID0gb3B0aW9ucy5tc2VjcyAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5tc2VjcyA6IERhdGUubm93KCk7IC8vIFBlciA0LjIuMS4yLCB1c2UgY291bnQgb2YgdXVpZCdzIGdlbmVyYXRlZCBkdXJpbmcgdGhlIGN1cnJlbnQgY2xvY2tcbiAgLy8gY3ljbGUgdG8gc2ltdWxhdGUgaGlnaGVyIHJlc29sdXRpb24gY2xvY2tcblxuICB2YXIgbnNlY3MgPSBvcHRpb25zLm5zZWNzICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLm5zZWNzIDogX2xhc3ROU2VjcyArIDE7IC8vIFRpbWUgc2luY2UgbGFzdCB1dWlkIGNyZWF0aW9uIChpbiBtc2VjcylcblxuICB2YXIgZHQgPSBtc2VjcyAtIF9sYXN0TVNlY3MgKyAobnNlY3MgLSBfbGFzdE5TZWNzKSAvIDEwMDAwOyAvLyBQZXIgNC4yLjEuMiwgQnVtcCBjbG9ja3NlcSBvbiBjbG9jayByZWdyZXNzaW9uXG5cbiAgaWYgKGR0IDwgMCAmJiBvcHRpb25zLmNsb2Nrc2VxID09PSB1bmRlZmluZWQpIHtcbiAgICBjbG9ja3NlcSA9IGNsb2Nrc2VxICsgMSAmIDB4M2ZmZjtcbiAgfSAvLyBSZXNldCBuc2VjcyBpZiBjbG9jayByZWdyZXNzZXMgKG5ldyBjbG9ja3NlcSkgb3Igd2UndmUgbW92ZWQgb250byBhIG5ld1xuICAvLyB0aW1lIGludGVydmFsXG5cblxuICBpZiAoKGR0IDwgMCB8fCBtc2VjcyA+IF9sYXN0TVNlY3MpICYmIG9wdGlvbnMubnNlY3MgPT09IHVuZGVmaW5lZCkge1xuICAgIG5zZWNzID0gMDtcbiAgfSAvLyBQZXIgNC4yLjEuMiBUaHJvdyBlcnJvciBpZiB0b28gbWFueSB1dWlkcyBhcmUgcmVxdWVzdGVkXG5cblxuICBpZiAobnNlY3MgPj0gMTAwMDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1dWlkLnYxKCk6IENhbid0IGNyZWF0ZSBtb3JlIHRoYW4gMTBNIHV1aWRzL3NlY1wiKTtcbiAgfVxuXG4gIF9sYXN0TVNlY3MgPSBtc2VjcztcbiAgX2xhc3ROU2VjcyA9IG5zZWNzO1xuICBfY2xvY2tzZXEgPSBjbG9ja3NlcTsgLy8gUGVyIDQuMS40IC0gQ29udmVydCBmcm9tIHVuaXggZXBvY2ggdG8gR3JlZ29yaWFuIGVwb2NoXG5cbiAgbXNlY3MgKz0gMTIyMTkyOTI4MDAwMDA7IC8vIGB0aW1lX2xvd2BcblxuICB2YXIgdGwgPSAoKG1zZWNzICYgMHhmZmZmZmZmKSAqIDEwMDAwICsgbnNlY3MpICUgMHgxMDAwMDAwMDA7XG4gIGJbaSsrXSA9IHRsID4+PiAyNCAmIDB4ZmY7XG4gIGJbaSsrXSA9IHRsID4+PiAxNiAmIDB4ZmY7XG4gIGJbaSsrXSA9IHRsID4+PiA4ICYgMHhmZjtcbiAgYltpKytdID0gdGwgJiAweGZmOyAvLyBgdGltZV9taWRgXG5cbiAgdmFyIHRtaCA9IG1zZWNzIC8gMHgxMDAwMDAwMDAgKiAxMDAwMCAmIDB4ZmZmZmZmZjtcbiAgYltpKytdID0gdG1oID4+PiA4ICYgMHhmZjtcbiAgYltpKytdID0gdG1oICYgMHhmZjsgLy8gYHRpbWVfaGlnaF9hbmRfdmVyc2lvbmBcblxuICBiW2krK10gPSB0bWggPj4+IDI0ICYgMHhmIHwgMHgxMDsgLy8gaW5jbHVkZSB2ZXJzaW9uXG5cbiAgYltpKytdID0gdG1oID4+PiAxNiAmIDB4ZmY7IC8vIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYCAoUGVyIDQuMi4yIC0gaW5jbHVkZSB2YXJpYW50KVxuXG4gIGJbaSsrXSA9IGNsb2Nrc2VxID4+PiA4IHwgMHg4MDsgLy8gYGNsb2NrX3NlcV9sb3dgXG5cbiAgYltpKytdID0gY2xvY2tzZXEgJiAweGZmOyAvLyBgbm9kZWBcblxuICBmb3IgKHZhciBuID0gMDsgbiA8IDY7ICsrbikge1xuICAgIGJbaSArIG5dID0gbm9kZVtuXTtcbiAgfVxuXG4gIHJldHVybiBidWYgfHwgc3RyaW5naWZ5KGIpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB2MTsiLCJpbXBvcnQgdjM1IGZyb20gJy4vdjM1LmpzJztcbmltcG9ydCBtZDUgZnJvbSAnLi9tZDUuanMnO1xudmFyIHYzID0gdjM1KCd2MycsIDB4MzAsIG1kNSk7XG5leHBvcnQgZGVmYXVsdCB2MzsiLCJpbXBvcnQgc3RyaW5naWZ5IGZyb20gJy4vc3RyaW5naWZ5LmpzJztcbmltcG9ydCBwYXJzZSBmcm9tICcuL3BhcnNlLmpzJztcblxuZnVuY3Rpb24gc3RyaW5nVG9CeXRlcyhzdHIpIHtcbiAgc3RyID0gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KHN0cikpOyAvLyBVVEY4IGVzY2FwZVxuXG4gIHZhciBieXRlcyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgYnl0ZXMucHVzaChzdHIuY2hhckNvZGVBdChpKSk7XG4gIH1cblxuICByZXR1cm4gYnl0ZXM7XG59XG5cbmV4cG9ydCB2YXIgRE5TID0gJzZiYTdiODEwLTlkYWQtMTFkMS04MGI0LTAwYzA0ZmQ0MzBjOCc7XG5leHBvcnQgdmFyIFVSTCA9ICc2YmE3YjgxMS05ZGFkLTExZDEtODBiNC0wMGMwNGZkNDMwYzgnO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG5hbWUsIHZlcnNpb24sIGhhc2hmdW5jKSB7XG4gIGZ1bmN0aW9uIGdlbmVyYXRlVVVJRCh2YWx1ZSwgbmFtZXNwYWNlLCBidWYsIG9mZnNldCkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IHN0cmluZ1RvQnl0ZXModmFsdWUpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgbmFtZXNwYWNlID09PSAnc3RyaW5nJykge1xuICAgICAgbmFtZXNwYWNlID0gcGFyc2UobmFtZXNwYWNlKTtcbiAgICB9XG5cbiAgICBpZiAobmFtZXNwYWNlLmxlbmd0aCAhPT0gMTYpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcignTmFtZXNwYWNlIG11c3QgYmUgYXJyYXktbGlrZSAoMTYgaXRlcmFibGUgaW50ZWdlciB2YWx1ZXMsIDAtMjU1KScpO1xuICAgIH0gLy8gQ29tcHV0ZSBoYXNoIG9mIG5hbWVzcGFjZSBhbmQgdmFsdWUsIFBlciA0LjNcbiAgICAvLyBGdXR1cmU6IFVzZSBzcHJlYWQgc3ludGF4IHdoZW4gc3VwcG9ydGVkIG9uIGFsbCBwbGF0Zm9ybXMsIGUuZy4gYGJ5dGVzID1cbiAgICAvLyBoYXNoZnVuYyhbLi4ubmFtZXNwYWNlLCAuLi4gdmFsdWVdKWBcblxuXG4gICAgdmFyIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoMTYgKyB2YWx1ZS5sZW5ndGgpO1xuICAgIGJ5dGVzLnNldChuYW1lc3BhY2UpO1xuICAgIGJ5dGVzLnNldCh2YWx1ZSwgbmFtZXNwYWNlLmxlbmd0aCk7XG4gICAgYnl0ZXMgPSBoYXNoZnVuYyhieXRlcyk7XG4gICAgYnl0ZXNbNl0gPSBieXRlc1s2XSAmIDB4MGYgfCB2ZXJzaW9uO1xuICAgIGJ5dGVzWzhdID0gYnl0ZXNbOF0gJiAweDNmIHwgMHg4MDtcblxuICAgIGlmIChidWYpIHtcbiAgICAgIG9mZnNldCA9IG9mZnNldCB8fCAwO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE2OyArK2kpIHtcbiAgICAgICAgYnVmW29mZnNldCArIGldID0gYnl0ZXNbaV07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBidWY7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmluZ2lmeShieXRlcyk7XG4gIH0gLy8gRnVuY3Rpb24jbmFtZSBpcyBub3Qgc2V0dGFibGUgb24gc29tZSBwbGF0Zm9ybXMgKCMyNzApXG5cblxuICB0cnkge1xuICAgIGdlbmVyYXRlVVVJRC5uYW1lID0gbmFtZTsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWVtcHR5XG4gIH0gY2F0Y2ggKGVycikge30gLy8gRm9yIENvbW1vbkpTIGRlZmF1bHQgZXhwb3J0IHN1cHBvcnRcblxuXG4gIGdlbmVyYXRlVVVJRC5ETlMgPSBETlM7XG4gIGdlbmVyYXRlVVVJRC5VUkwgPSBVUkw7XG4gIHJldHVybiBnZW5lcmF0ZVVVSUQ7XG59IiwiaW1wb3J0IHJuZyBmcm9tICcuL3JuZy5qcyc7XG5pbXBvcnQgc3RyaW5naWZ5IGZyb20gJy4vc3RyaW5naWZ5LmpzJztcblxuZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBybmRzID0gb3B0aW9ucy5yYW5kb20gfHwgKG9wdGlvbnMucm5nIHx8IHJuZykoKTsgLy8gUGVyIDQuNCwgc2V0IGJpdHMgZm9yIHZlcnNpb24gYW5kIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYFxuXG4gIHJuZHNbNl0gPSBybmRzWzZdICYgMHgwZiB8IDB4NDA7XG4gIHJuZHNbOF0gPSBybmRzWzhdICYgMHgzZiB8IDB4ODA7IC8vIENvcHkgYnl0ZXMgdG8gYnVmZmVyLCBpZiBwcm92aWRlZFxuXG4gIGlmIChidWYpIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTY7ICsraSkge1xuICAgICAgYnVmW29mZnNldCArIGldID0gcm5kc1tpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmO1xuICB9XG5cbiAgcmV0dXJuIHN0cmluZ2lmeShybmRzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdjQ7IiwiaW1wb3J0IHYzNSBmcm9tICcuL3YzNS5qcyc7XG5pbXBvcnQgc2hhMSBmcm9tICcuL3NoYTEuanMnO1xudmFyIHY1ID0gdjM1KCd2NScsIDB4NTAsIHNoYTEpO1xuZXhwb3J0IGRlZmF1bHQgdjU7IiwiaW1wb3J0IFJFR0VYIGZyb20gJy4vcmVnZXguanMnO1xuXG5mdW5jdGlvbiB2YWxpZGF0ZSh1dWlkKSB7XG4gIHJldHVybiB0eXBlb2YgdXVpZCA9PT0gJ3N0cmluZycgJiYgUkVHRVgudGVzdCh1dWlkKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdmFsaWRhdGU7IiwiaW1wb3J0IHZhbGlkYXRlIGZyb20gJy4vdmFsaWRhdGUuanMnO1xuXG5mdW5jdGlvbiB2ZXJzaW9uKHV1aWQpIHtcbiAgaWYgKCF2YWxpZGF0ZSh1dWlkKSkge1xuICAgIHRocm93IFR5cGVFcnJvcignSW52YWxpZCBVVUlEJyk7XG4gIH1cblxuICByZXR1cm4gcGFyc2VJbnQodXVpZC5zdWJzdHIoMTQsIDEpLCAxNik7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHZlcnNpb247IiwiLy8gUmV0dXJucyBhIHdyYXBwZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgd3JhcHBlZCBjYWxsYmFja1xuLy8gVGhlIHdyYXBwZXIgZnVuY3Rpb24gc2hvdWxkIGRvIHNvbWUgc3R1ZmYsIGFuZCByZXR1cm4gYVxuLy8gcHJlc3VtYWJseSBkaWZmZXJlbnQgY2FsbGJhY2sgZnVuY3Rpb24uXG4vLyBUaGlzIG1ha2VzIHN1cmUgdGhhdCBvd24gcHJvcGVydGllcyBhcmUgcmV0YWluZWQsIHNvIHRoYXRcbi8vIGRlY29yYXRpb25zIGFuZCBzdWNoIGFyZSBub3QgbG9zdCBhbG9uZyB0aGUgd2F5LlxubW9kdWxlLmV4cG9ydHMgPSB3cmFwcHlcbmZ1bmN0aW9uIHdyYXBweSAoZm4sIGNiKSB7XG4gIGlmIChmbiAmJiBjYikgcmV0dXJuIHdyYXBweShmbikoY2IpXG5cbiAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCduZWVkIHdyYXBwZXIgZnVuY3Rpb24nKVxuXG4gIE9iamVjdC5rZXlzKGZuKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgd3JhcHBlcltrXSA9IGZuW2tdXG4gIH0pXG5cbiAgcmV0dXJuIHdyYXBwZXJcblxuICBmdW5jdGlvbiB3cmFwcGVyKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldXG4gICAgfVxuICAgIHZhciByZXQgPSBmbi5hcHBseSh0aGlzLCBhcmdzKVxuICAgIHZhciBjYiA9IGFyZ3NbYXJncy5sZW5ndGgtMV1cbiAgICBpZiAodHlwZW9mIHJldCA9PT0gJ2Z1bmN0aW9uJyAmJiByZXQgIT09IGNiKSB7XG4gICAgICBPYmplY3Qua2V5cyhjYikuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgICAgICByZXRba10gPSBjYltrXVxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIHJldFxuICB9XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2luZGV4LnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9