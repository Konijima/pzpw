const sh = require("shelljs");
const colors = require("colors");
const config = require("../package.json");

const helps = {};
const usages = {};

// new

helps.new = `Create a new PipeWrench project.`;
usages.new = `${config.name} new <mod-name>`;
exports.new = function(dirpath, modname) {
    


}

// update

helps.update = `Update your PipeWrench project.`;
usages.update = `${config.name} update`;
exports.update = function(dirpath) {
    


}

// workshop

helps.workshop = `Set or Generate your workshop project.`;
usages.workshop = `${config.name} workshop <set|generate> <path>`;
exports.workshop = function(dirpath, command, path) {
    
    

}

// compile

helps.compile = `Compile your PipeWrench project.`;
usages.compile = `${config.name} compile`;
exports.compile = function(dirpath) {
    
    

}

// help

helps.help = `Show available commands.`;
usages.help = `${config.name} help <command>`;
exports.help = function(_, command) {
    if (!command || command == "")
        for (const [cmd, help] of Object.entries(helps))
            console.log(colors.bold(cmd), " ".repeat(15 - cmd.length), colors.green(help));
    

    if (usages[command])
        console.log(colors.bold("Usage:"), colors.green(usages[command]));
}
