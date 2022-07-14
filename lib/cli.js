const sh = require("shelljs");
const path = require("path");
const prompt = require("prompt");
const colors = require("colors");
const config = require("../package.json");

const helps = {};
const usages = {};

const templateRepository = "https://github.com/Konijima/PipeWrenchTemplate";

sh.config.silent = true;

// new

helps.new = `Create a new PipeWrench project.`;
usages.new = `${config.name} new <ModID> <ModName> <Author>`;
exports.new = async function(dirpath, ModID, ModName, Author) {
    
    prompt.start();

    // Validate mod name
    const result = await prompt.get([
        {
            name: "ModID",
            pattern: /^[A-Za-z0-9_-]*$/,
            default: ModID,
            allowEmpty: false,
            required: true,
            message: "ModID can only contain alphanumeric, dash and underscore"
        },
        {
            name: "ModName",
            default: ModName,
            allowEmpty: false,
            required: true,
            message: "ModName is required",
            before: function(value) { return value.trim(); }
        },
        {
            name: "Author",
            default: Author,
            allowEmpty: true,
            before: function(value) { return value.trim(); }
        },
    ]);

    ModID = result["ModID"];
    ModName = result["ModName"];
    Author = result["Author"];

    // Download the latest repository

    console.log(colors.bold("Cloning template repository..."));
    const cloneResult = sh.exec(`git clone ${templateRepository} "${ModID}"`);
    if (cloneResult.code != 0) {
        sh.rm(ModID);
        return console.log(colors.red(cloneResult.stderr));
    }

    // Setup Project

    console.log(colors.bold("Moving into project directory..."));
    sh.cd(ModID);

    console.log(colors.bold("Running 'npm install'..."));
    const npmInstallResult = sh.exec("npm install");
    if (npmInstallResult.code != 0) {
        sh.rm(ModID);
        return console.log(colors.red(npmInstallResult.stderr));
    }

    // Completed

    console.log(colors.green(`Project ${ModID} has been created successfully!`));
    console.log(colors.green(`Type 'cd ${ModID}' to enter your project directory.`));

}

// update

helps.update = `Update ${config.name}, require sudo to execute.`;
usages.update = `${config.name} update`;
exports.update = function(dirpath) {
    
    console.log(colors.bold(`Updating ${config.name}...`));
    const updateResult = sh.exec(`npm install -g ${config.name}`);
    if (updateResult.code != 0) {
        return console.log(colors.red(updateResult.stderr));
    }
    console.log(colors.green(`${config.name} has been updated!`));

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

// version

helps.version = `Check the current version of ${config.name}.`;
usages.version = `${config.name} version`;
exports.version = function(dirpath) {
    
    console.log(colors.green(`Current ${config.name} version '${config.version}', run '${config.name} update'`));

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
