# Veracode Container/IaC/Secrets Scanning Action

Veracode Container/IaC/Secrets Scanning Action runs the Veracode-CLI as an action on any GitHub pipeline

## About

The `Container/IaC/Secrets Scanning Action` is designed to be used in a CI/CD pipeline to scan a local folder, remote repository, image or archive for 3rd party library vulnerabilities, infrastrucre as code misconfigurations and stored secrets.

For more information on Pipeline Scan visit Veracode Help Center Page: https://docs.veracode.com/r/Veracode_Container_Security

## Usage

Intended usage is to add a job to your CI/CD pipeline, run the scans it and returns the results.  
A build can be failed upon findings, as well the action will automatically generate SBOM files in most popular formats for you. The formats are  cyclonedx-xml, cyclonedx-json, spdx-tag-value, spdx-json and github.  
  
If the action will run within a PR, it will automatically add a comment with all results to the PR. This is done for easy review and approval processes.  
![](/media/pr-comment.png)  
![](/media/pr-comment1.png)  
  
If the parameter `fail_build` is set to `true`, the action will fail the step upon findings. If set to `false`, the step will not show as failed.  
![](/media/fail-build.png)  
  
The full output of the action can still be reviewed on the action run overview and on the command line output.  
 ![](/media/action-overview.png)  
 ![](/media/command-line-output.png)  
   

The tool will need some information passed to it as parameters (many are optional):

* Required
  * vid
    * the Veracode API ID
  * vkey
    * the Veracode API Secret Key
  * command
    * The command to run (scan|sbom) 
    * Default is 'scan'
  * source
    * The source to be scanned. Can be a folder, can be a remote repository, can be an image name or can be an image archive name
    * Default is './'
  * format
    * Format in which to output and store the scan results. Enter one of the following values (json|table) for the `scan` command
    * Format in which to output and store the scan results. Enter one of the following values (cyclonedx-xml, cyclonedx-json, spdx-tag-value, spdx-json, github) for the `sbom` command
    * Default is 'table'
  * type
    * Which type of scan to run (image|archive|repo|directory)
    * Default is 'directory'

* Optional
  * fail_build
    * Fail the build upon findings. Takes true or false
  * debug
    * Enable heavy debug logging. Takes true or false


## Examples  
All examples follow the same strucutre.
  

The basic yml  
  
  ```yml 
  Veracode-container_iac_secrets-scan:
      runs-on: ubuntu-latest
      name: Verracode Container/IaC/Secrets scan

      steps:
        - name: checkout
          uses: actions/checkout@v3

        - name: Veracode Container/IaC/Secrets action step
          uses: veracode/container_iac_secrets_scanning@v1.0.0
          with:
            vid: ${{ secrets.VID }}
            vkey: ${{ secrets.VKEY }}
            command: "scan" 
            type: "directory"
            source: "./"
            format: "json"
            debug: false
            fail_build: true
  ``` 
  

Only create SBOM  
  
  ```yml 
  Veracode-container_iac_secrets-scan:
      runs-on: ubuntu-latest
      name: Verracode Container/IaC/Secrets scan

      steps:
        - name: checkout
          uses: actions/checkout@v3

        - name: Veracode Container/IaC/Secrets action step
          uses: veracode/container_iac_secrets_scanning@v1.0.0
          with:
            vid: ${{ secrets.VID }}
            vkey: ${{ secrets.VKEY }}
            command: "sbom" 
            type: "directory"
            source: "./"
            format: "cyclonedx-json"
            debug: false
            fail_build: false
  ```     
 
## Compile the action  
The action comes pre-compiled as transpiled JavaScript. If you want to fork and build it on your own you need NPM to be installed, use `ncc` to compile all node modules into a single file, so they don't need to be installed on every action run. The command to build is simply  

```sh
ncc build ./src/index.ts  
```
