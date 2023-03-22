"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const inputName = (0, core_1.getInput)("name");
greet(inputName);
function greet(name) {
    console.log(`'hello ${name}'`);
}
