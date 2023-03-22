import { getInput } from "@actions/core"
const inputName = getInput("name")

function greet(name:string){

console.log('hello ${name}')
}

