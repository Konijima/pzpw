const sh = require("shelljs");
const path = require("path");
const prompt = require("prompt");
const colors = require("colors");
const config = require("../package.json");
const { writeFileSync, readFileSync, existsSync } = require("fs");

const helps = {};
const usages = {};

const templateRepository = "https://github.com/Konijima/pzpw-template";

sh.config.silent = false;

function isValidWorkingDirectory() {
    return existsSync('pzpw-config.json');
}

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

    console.log(colors.bold("Deleting .git..."));
    sh.rm("-fR", [".git"]);
    
    console.log(colors.bold("Running 'npm install'..."));
    const npmInstallResult = sh.exec("npm install");
    if (npmInstallResult.code != 0) {
        sh.rm(ModID);
        return console.log(colors.red(npmInstallResult.stderr));
    }

    try {
        console.log(colors.bold(`Reading ${config.name}-config.json...`));
        let pzpwConfigStr = readFileSync(`${config.name}-config.json`);
        let pzpwConfig = JSON.parse(pzpwConfigStr);
        pzpwConfig.mods = {
            [ModID]: {
                "name": ModName,
                "description": "My new mod description."
            }
        }
        pzpwConfig.workshop.title = ModName;
        pzpwConfig.workshop.author = Author;
        pzpwConfig.workshop.mods = [ModID];
        console.log(colors.bold(`Writing ${config.name}-config.json...`));
        writeFileSync(`${config.name}-config.json`, JSON.stringify(pzpwConfig, null, 4), "utf-8");
    }
    catch(error) {
        console.log(colors.red(`There was an error setting ${config.name}-config.json`));
        console.log(error.message);
    }

    sh.cp('-r', `./.templates/mod_assets`, `./assets/mods/${ModID}`);
    sh.cp('-r', `./.templates/mod_src`, `./src/${ModID}`);
    sh.mkdir(`./src/${ModID}/client/${ModID}`);
    sh.touch([`./src/${ModID}/client/${ModID}/_.ts`])
    sh.mkdir(`./src/${ModID}/server/${ModID}`);
    sh.touch([`./src/${ModID}/server/${ModID}/_.ts`])
    sh.mkdir(`./src/${ModID}/shared/${ModID}`);
    sh.touch([`./src/${ModID}/shared/${ModID}/_.ts`])

    // Compile

    console.log(colors.bold("Compiling project..."));
    sh.exec("npm run compile-distribution");

    // Completed

    console.log(colors.green(`Project ${ModID} has been created successfully!`));
    console.log(colors.green(`Type 'cd ${ModID}' to enter your project directory.`));
}

// add

helps.add = `Add an additional mod to your project.`;
usages.add = `${config.name} add <ModID> <ModName>`;
exports.add = async function(dirpath, ModID, ModName) {

    if (!isValidWorkingDirectory())
        return console.log(colors.red(`Command must be executed at the root of your project directory.`));

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
        }
    ]);

    ModID = result["ModID"];
    ModName = result["ModName"];

    try {
        console.log(colors.bold(`Reading ${config.name}-config.json...`));
        let pzpwConfigStr = readFileSync(`${config.name}-config.json`);
        let pzpwConfig = JSON.parse(pzpwConfigStr);

        if (pzpwConfig.mods[ModID]) {
            console.log(colors.red(`${ModID} already exist in the project!`));
            return;
        }

        pzpwConfig.mods[ModID] = {
            "name": ModName,
            "description": "My new mod description.",
            "poster": "poster.png",
            "icon": "icon.png"
        }
        pzpwConfig.workshop.mods.push(ModID);

        console.log(colors.bold(`Writing ${config.name}-config.json...`));
        writeFileSync(`${config.name}-config.json`, JSON.stringify(pzpwConfig, null, 4), "utf-8");
    }
    catch(error) {
        console.log(colors.red(`There was an error setting ${config.name}-config.json`));
        console.log(error.message);
    }

    sh.cp('-r', `./.templates/mod_assets`, `./assets/mods/${ModID}`);
    sh.cp('-r', `./.templates/mod_src`, `./src/${ModID}`);
    sh.mkdir(`./src/${ModID}/client/${ModID}`);
    sh.touch([`./src/${ModID}/client/${ModID}/_.ts`])
    sh.mkdir(`./src/${ModID}/server/${ModID}`);
    sh.touch([`./src/${ModID}/server/${ModID}/_.ts`])
    sh.mkdir(`./src/${ModID}/shared/${ModID}`);
    sh.touch([`./src/${ModID}/shared/${ModID}/_.ts`])

    console.log(colors.green(`${ModID} has been added!`));
}

// switch

helps.switch = `Switch PipeWrench branch.`;
usages.switch = `${config.name} switch <stable|unstable>`;
exports.switch = function(dirpath, type) {

    if (!["stable", "unstable"].includes(type)) {
    if (!isValidWorkingDirectory())
        return console.log(colors.red(`Command must be executed at the root of your project directory.`));
        return console.log(colors.bold("usage:"), colors.green(usages.switch));
    }

}

// update

helps.update = `Update ${config.name} and project dependencies.`;
usages.update = `${config.name} update <all|pzpw|project>`;
exports.update = function(dirpath, type) {
    
    if (!["all", "pzpw", "project"].includes(type)) {
        return console.log(colors.bold("usage:"), colors.green(usages.update));
    }

    if (["all", "pzpw"].includes(type)) {
        console.log(colors.bold(`Updating ${config.name}...`));
        let updateResult = sh.exec(`npm install -g ${config.name}`);
        if (updateResult.code != 0) {
            return console.log(colors.red(updateResult.stderr));
        }
        console.log(colors.green(`${config.name} has been updated!`));
    }

    if (["all", "project"].includes(type)) {
        if (!isValidWorkingDirectory())
            return console.log(colors.red(`Command must be executed at the root of your project directory.`));
        
        console.log(colors.bold(`Updating project dependencies...`));
        updateResult = sh.exec(`npm update`);
        if (updateResult.code != 0) {
            return console.log(colors.red(updateResult.stderr));
        }
        console.log(colors.green(`Project dependencies has been updated!`));
    }
}

// compile

helps.compile = `Compile your PipeWrench project.`;
usages.compile = `${config.name} compile <distribution|development|workshop|declaration>`;
exports.compile = function(dirpath, type) {
    
    if (!isValidWorkingDirectory())
        return console.log(colors.red(`Command must be executed at the root of your project directory.`));

    if (["development", "dev"].includes(type)) {
        sh.exec("npm run compile-development")
    }
    else if (type == "workshop") {
        sh.exec("npm run compile-workshop")
    }
    else if (["declaration", "dec", "typing"].includes(type)) {
        sh.exec("npm run compile-declaration")
    }
    else if (["dist", "distribution"].includes(type)) {
        sh.exec("npm run compile-distribution")
    }
    else {
        console.log(usages.compile);
    }

}

// cachedir

helps.cachedir = `Set project cachedir, e.g: C:\Users\Konijima\Zomboid.`;
usages.cachedir = `${config.name} cachedir <set|unset>`;
exports.cachedir = async function(dirpath, command, path) {

    if (!isValidWorkingDirectory())
        return console.log(colors.red(`Command must be executed at the root of your project directory.`));

    switch(command) {
        case "set":
            if (existsSync(path)) {
                await writeFileSync(".cachedir", path);
            }
            else {
                console.log(colors.red(`path '${path}' is invalid!`));
            }
            break
        case "unset":
            sh.rm(".cachedir");
            break;
        default:
            return console.log(colors.bold("usage:"), colors.green(usages.cachedir));
    }
}

// version

helps.version = `Check current ${config.name} version.`;
usages.version = `${config.name} version`;
exports.version = function(dirpath) {
    
    console.log(colors.cyan.bold(`Current version ${config.version}`));

    let latestVersion = '';
    const versionResust = sh.exec(`npm show ${config.name} version`);
    if (versionResust.code == 0) {
        latestVersion = versionResust.stdout.replace('\n', '');
    }

    if (latestVersion == config.version) {
        console.log(colors.green(`${config.name} is up-to-date`));
    }
    else if (latestVersion != "") {
        console.log(colors.red(`${config.name} is not up-to-date.`));
        console.log(colors.yellow.bold(`Latest version ${latestVersion}, use '${config.name} update' to update`));
    }
    else {
        console.log(colors.red(`Couldn't find latest ${config.name} version on npm registry`));
    }
}

// git

helps.git = `Link your PipeWrench project to a git repository.`;
usages.git = `${config.name} git`;
exports.git = async function(dirpath, gitUrl, gitBranch, gitPush) {

    if (!isValidWorkingDirectory())
        return console.log(colors.red(`Command must be executed at the root of your project directory.`));

    if (existsSync(".git"))
        return console.log(colors.red(`There is already a git associated with this project.`));

    prompt.start();

    // Validate mod name
    let result = await prompt.get([
        {
            name: "gitUrl",
            description: "Git URL",
            pattern: /(?:git|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|\#[-\d\w._]+?)$/,
            default: gitUrl,
            allowEmpty: false,
            required: true,
            message: "Git URL must end with .git"
        },
        {
            name: 'gitBranch',
            description: 'Branch name?',
            allowEmpty: false,
            warning: 'You must specify the branch name.',
            default: 'master'
        },
        {
            name: 'gitPush',
            description: 'Do you want to push your first commit now?',
            validator: /y[es]*|n[o]?/,
            warning: 'Must respond yes or no',
            default: 'no'
        },
    ]);

    gitUrl = result["gitUrl"];
    gitBranch = result["gitBranch"];
    gitPush = result["gitPush"];

    sh.exec(`git init`);
    sh.exec(`git add .`);
    sh.exec(`git commit -m "First commit"`);
    sh.exec(`git remote add origin ${gitUrl}`);

    if (gitPush == "yes") {
        sh.exec(`git push -u origin ${gitBranch}`);
    }
}

// help

helps.help = `Show available commands.`;
usages.help = `${config.name} help <command>`;
exports.help = function(_, command) {
    if (!command || command == "") {
        for (const [cmd, help] of Object.entries(helps)) {
            console.log(colors.bold(cmd), ".".repeat(15 - cmd.length), colors.green(help));
        }
        return;
    }
    
    command = command.toLowerCase();

    if (helps[command]) {
        console.log(colors.bold(`${command}:`), helps[command]);
    }
    else {
        throw new Error(`The command '${command}' doesn't exist, type '${config.name} help' for a list of commands.`);
    }

    if (usages[command]) {
        console.log(colors.bold("usage:"), colors.green(usages[command]));
    }
}
