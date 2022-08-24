import sh from "shelljs";
import chalk from "chalk";
import { join, resolve } from "path";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { PZPWConfig } from "pzpw-config-schema";
import { Settings } from "./settings.js";
import { copyDirRecursiveTo, getCommandHelp, getHelp, getIntro, getProjectPackageJson, getPZPWConfig } from "./utils.js";

export class Cli {
    
    private settings: Settings;
    private pzpwConfig?: PZPWConfig;
    readonly args: {[key: string]: (string | number)[]};

    constructor(args: {[key: string]: (string | number)[]}) {
        this.args = args;
    }

    /**
     * Start the cli process
     */
     public async run() {
        this.settings = await Settings.Load();
        await getPZPWConfig().then(pzpwConfig => this.pzpwConfig = pzpwConfig).catch(() => { /** ignore */ });

        await this.exec();
    }

    /**
     * Verify that the process is running inside a PZPW project.
     */
    private requirePZPWProject(isRequired = true) {
        if (isRequired && !this.pzpwConfig)
            throw chalk.red("This command must be executed from the root of your PZPW project.");

        else if (!isRequired && this.pzpwConfig)
            throw chalk.red("This command cannot be executed inside a PZPW project.");
    }

    /**
     * Get the command and parameters
     */
    private getCommand() {
        const commandName = this.args[""].slice(0, 1)[0];
        const commandParams = this.args[""].slice(1);
        return {
            name: commandName,
            params: commandParams,
        };
    }

    /**
     * Print full intro
     */
    private async printIntro() {
        await getIntro().then(text => console.log(chalk.greenBright(text)));
    }

    /**
     * Execute commands
     */
    private async exec() {
        const command = this.getCommand();

        if (!command.name || command.name === "help")
            await this.printIntro();

        // Debug Flag
        if (this.args.debug) {
            console.log(chalk.magenta("Command:"), command);
            console.log(chalk.magenta("Settings:"), this.settings.settings, "\n");
        }

        if (command.name === "help" && command.params.length > 0)
            await getCommandHelp(command.params[0] as string, true).then(text => console.log(chalk.grey(text)))
                .catch(() => console.log(chalk.grey(`Command "${command.params[0] as string}" not found!`)));

        else if (command.name === "new")
            await this.newCommand(command.params);

        else if (command.name === "add")
            await this.addCommand(command.params);

        else if (command.name === "cachedir")
            await this.cachedirCommand(command.params);

        else if (command.name === "update")
            await this.updateCommand(command.params);

        else if (command.name === "switch")
            await this.switchCommand(command.params);

        else if (command.name === "compiler")
            await this.compilerCommand(command.params);

        else if (command.name === "version")
            await this.versionCommand();

        else await getHelp().then(text => console.log(chalk.grey(text)));
    }

    /**
     * Create a new pzpw project command
     */
    private async newCommand(params: (string | number)[]) {
        await this.requirePZPWProject(false);

        // Get the mod id
        const modId = params[0] as string;
        if (!modId || modId.length === 0) throw chalk.red("You must provide a mod id as first parameter!");

        // Get the mod name
        const modName = params[1] as string;
        if (!modName || modName.length === 0) throw chalk.red("You must provide a mod name as second parameter!");

        // Get the mod author
        let modAuthor = params[2] as string;
        if (!modAuthor) modAuthor = this.settings.get<string>("defaultAuthor");
        if (!modAuthor || modAuthor.length === 0) throw chalk.red("You must provide a mod author as third parameter!");

        const templateRepo = (this.args.repo?.length > 0) ? this.args.repo[0] as string : this.settings.get<string>("templateRepo");
        const templateBranch = (this.args.branch?.length > 0) ? this.args.branch[0] as string : this.settings.get<string>("templateBranch");

        console.log(chalk.yellowBright(`- Cloning template '${templateRepo}' branch '${templateBranch}'...`));

        // Clone the template
        const result = sh.exec(`git clone ${(templateBranch.length > 0) ? "-b " + templateBranch : ""} ${templateRepo} ${modId}`, { silent: true });

        // Clone result
        if (String(result.stderr).startsWith("fatal:")) throw chalk.red(result.stderr);
        console.log(chalk.gray(result.stderr.trim()));

        // Unlink .git from template
        console.log(chalk.yellowBright(`- Unlinking .git from template...`));
        await rm(join(modId, ".git"), { recursive: true });

        // Set pzpw-config.json
        console.log(chalk.yellowBright(`- Updating pzpw-config.json...`));
        const modConfig = JSON.parse(await readFile(join(modId, "pzpw-config.json"), "utf-8")) as PZPWConfig;
        modConfig.mods[modId] = {
            name: modName,
            description: ""
        };
        modConfig.workshop.title = modName;
        modConfig.workshop.mods.push(modId);
        modConfig.workshop.author = [modAuthor];
        await writeFile(join(modId, "pzpw-config.json"), JSON.stringify(modConfig, null, 2), "utf-8");

        // Prepare mod assets
        console.log(chalk.yellowBright(`- Prepare '${modId}' assets...`));
        await copyDirRecursiveTo(join(modId, ".templates", "mod_assets"), join(modId, "assets", "mods", modId));

        // Prepare mod source
        console.log(chalk.yellowBright(`- Prepare '${modId}' source...`));
        await mkdir(join(modId, "src", modId, "client", modId), { recursive: true });
        await mkdir(join(modId, "src", modId, "server", modId), { recursive: true });
        await mkdir(join(modId, "src", modId, "shared", modId), { recursive: true });
        await mkdir(join(modId, "src", modId, "shared", "Translate", "EN"), { recursive: true });

        // Update readme
        console.log(chalk.yellowBright(`- Updating README.md...`));
        let readme = await readFile(join(modId, "README.md"), "utf-8");
        readme = readme.replaceAll("{modName}", modName);
        readme = readme.replaceAll("{author}", modAuthor);
        readme = readme.replaceAll("{modId}", modId);
        readme = readme.replaceAll("{year}", new Date().getFullYear().toString());
        await writeFile(join(modId, "README.md"), readme, 'utf-8');

        // Update license
        console.log(chalk.yellowBright(`- Updating LICENSE...`));
        let license = await readFile(join(modId, 'assets', "LICENSE"), "utf-8");
        license = license.replaceAll("<author>", modAuthor);
        license = license.replaceAll("<year>", new Date().getFullYear().toString());
        await writeFile(join(modId, "assets", "LICENSE"), license, 'utf-8');
    }

    /**
     * Add a mod to a pzpw project command
     */
    private async addCommand(params: (string | number)[]) {
        await this.requirePZPWProject();
    }

    /**
     * Get or set game cachedir path command
     */
    private async cachedirCommand(params: (string | number)[]) {
        const command = "pzpw-compiler cachedir " + params.join(" ");
        console.log(chalk.yellowBright(`- Executing '${command}'...`));
        const result = sh.exec("pzpw-compiler cachedir " + params.join(" "), { silent: true });
        console.log(chalk.gray(result.stdout));
    }

    /**
     * Update command
     */
    private async updateCommand(params: (string | number)[]) {

        if (params[0] === "all" || params[0] === "pzpw") {
            let packageName = "pzpw";
            if (this.args.pzpw) packageName = this.args.pzpw[0] as  string;
            console.log(chalk.yellowBright(`- Updating pzpw [${packageName}]...`));
            const result = sh.exec(`npm install -g ${packageName}`, { silent: true });
            console.log(chalk.gray(result.stdout));
        }

        if (params[0] === "all" || params[0] === "compiler") {
            let packageName = "pzpw-compiler";
            if (this.args.compiler) packageName = this.args.compiler[0] as  string;
            console.log(chalk.yellowBright(`- Updating compiler [${packageName}]...`));
            const result = sh.exec(`npm install -g ${packageName}`, { silent: true });
            console.log(chalk.gray(result.stdout));
        }

        if (params[0] === "all" || params[0] === "project") {
            console.log(chalk.yellowBright(`- Updating project [${resolve("")}]...`));
            this.requirePZPWProject();
            const result = sh.exec("npm update", { silent: true });
            console.log(chalk.gray(result.stdout));
        }

        if (!["all", "pzpw", "compiler", "project"].includes(params[0] as string)) {
            console.log(chalk.gray(await getCommandHelp("update", true)));
        }
    }

    /**
     * Switch branch command
     */
    private async switchCommand(params: (string | number)[]) {
        await this.requirePZPWProject();

        const packageJson = await getProjectPackageJson();

        if (params[0]) {
            const branch = "#" + params[0];

            const pipewrench = packageJson.dependencies["PipeWrench"];
            if (pipewrench.includes("#")) packageJson.dependencies["PipeWrench"] = pipewrench.slice(0, pipewrench.indexOf("#")) + branch;
            else packageJson.dependencies["PipeWrench"] += branch;

            const pipewrenchEvents = packageJson.dependencies["PipeWrench-Events"];
            if (pipewrenchEvents.includes("#")) packageJson.dependencies["PipeWrench-Events"] = pipewrenchEvents.slice(0, pipewrenchEvents.indexOf("#")) + branch;
            else packageJson.dependencies["PipeWrench-Events"] += branch;

            const pipewrenchUtils = packageJson.dependencies["PipeWrench-Utils"];
            if (pipewrenchUtils.includes("#")) packageJson.dependencies["PipeWrench-Utils"] = pipewrenchUtils.slice(0, pipewrenchUtils.indexOf("#")) + branch;
            else packageJson.dependencies["PipeWrench-Utils"] += branch;

            // Update package.json
            console.log(chalk.yellowBright(`- Updating package.json dependecies to branch '${params[0]}'...`));
            await writeFile("package.json", JSON.stringify(packageJson, null, 2), "utf-8");

            // Update project node_modules
            console.log(chalk.yellowBright("- Updating Project dependencies..."));
            const result = sh.exec("npm update", { silent: true });
            if (result.stdout) console.log(chalk.gray(result.stdout));

            // If error lets revert back
            if (result.stderr) {
                console.log(chalk.red(result.stderr));

                packageJson.dependencies["PipeWrench"] = pipewrench;
                packageJson.dependencies["PipeWrench-Events"] = pipewrenchEvents;
                packageJson.dependencies["PipeWrench-Utils"] = pipewrenchUtils;
                
                console.log(chalk.yellowBright(`- Reverting package.json dependecies...`));
                await writeFile("package.json", JSON.stringify(packageJson, null, 2), "utf-8");
            }
        }
        else {
            console.log(chalk.gray(await getCommandHelp("switch", true)));
        }
    }

    /**
     * Send a compiler command command
     */
    private async compilerCommand(params: (string | number)[]) {
        const command = "pzpw-compiler " + params.join(" ");
        console.log(chalk.yellowBright(`- Executing "${command}"...`));
        const result = sh.exec(command, { silent: true });
        if (result.stderr) {
            console.log(chalk.red(result.stderr));
        }
        else console.log(chalk.gray(result.stdout));
    }

    /**
     * Print the current version command
     */
    private async versionCommand() {
        await this.printIntro();
    }

}
