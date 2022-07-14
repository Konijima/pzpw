#!/usr/bin/env node

const config = require("../package.json");
const sh = require("shelljs");
const colors = require("colors");
const cli = require("../lib/cli");

const currentDir = sh.pwd().toString();
const command = process.argv[2] || "";
const args = process.argv.slice(3) || [];

try {
    if (command == "")
        return cli["help"](currentDir, ...args);
    
    if (typeof(cli[command]) == "function")
        return cli[command](currentDir, ...args);
    
    throw new Error(`The command '${command}' doesn't exist, type '${config.name} help' for a list of commands.`);
}
catch(error) {
    if (error instanceof Error) {
        console.log(colors.red(error.message));
    }
    else console.log(colors.red(error));
}
