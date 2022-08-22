import chalk from 'chalk';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import sh from 'shelljs';
import { Settings } from './settings.js';
import { getCommandHelp, getHelp, getIntro, getProjectPackageJson, getPZPWConfig } from './utils.js';

export class Cli {
    
    private settings: Settings;
    private pzpwConfig?: any;
    readonly args: {[key: string]: (string | number)[]};

    constructor(args: {[key: string]: (string | number)[]}) {
        this.args = args;
    }

    /**
     * Start the cli process
     */
     public async run() {
        this.settings = await Settings.Load();
        this.pzpwConfig = await getPZPWConfig().catch(() => {});

        await this.exec();
    }

    /**
     * Verify that the process is running inside a PZPW project.
     */
    private requirePZPWProject(isRequired: boolean = true) {
        if (isRequired && !this.pzpwConfig)
            throw chalk.red('This command must be executed from the root of your PZPW project.');

        else if (!isRequired && this.pzpwConfig)
            throw chalk.red('This command cannot be executed inside a PZPW project.');
    }

    /**
     * Get the command and parameters
     */
    private getCommand() {
        const commandName = this.args[''].slice(0, 1)[0];
        const commandParams = this.args[''].slice(1);
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
        let command = this.getCommand();

        if (!command.name || command.name === 'help')
            await this.printIntro();

        // Debug Flag
        if (this.args.debug) {
            console.log(chalk.magenta("Command:"), command);
            console.log(chalk.magenta("Settings:"), this.settings.settings, '\n');
        }

        if (command.name === "help" && command.params.length > 0)
            await getCommandHelp(command.params[0] as string, true).then(text => console.log(chalk.grey(text)))
                .catch(_ => console.log(chalk.grey(`Command "${command.params[0] as string}" not found!`)));

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
            await this.versionCommand(command.params);

        else await getHelp().then(text => console.log(chalk.grey(text)));
    }

    /**
     * Create a new pzpw project command
     */
    private async newCommand(params: (string | number)[]) {
        await this.requirePZPWProject(false);


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
        const command = 'pzpw-compiler cachedir ' + params.join(' ');
        console.log(chalk.yellowBright(`- Executing '${command}'...`));
        const result = sh.exec('pzpw-compiler cachedir ' + params.join(' '), { silent: true });
        console.log(chalk.gray(result.stdout));
    }

    /**
     * Update command
     */
    private async updateCommand(params: (string | number)[]) {

        if (params[0] === 'all' || params[0] === 'pzpw') {
            let packageName = 'pzpw';
            if (this.args.pzpw) packageName = this.args.pzpw[0] as  string;
            console.log(chalk.yellowBright(`- Updating pzpw [${packageName}]...`));
            const result = sh.exec(`npm install -g ${packageName}`, { silent: true });
            console.log(chalk.gray(result.stdout));
        }

        if (params[0] === 'all' || params[0] === 'compiler') {
            let packageName = 'pzpw-compiler';
            if (this.args.compiler) packageName = this.args.compiler[0] as  string;
            console.log(chalk.yellowBright(`- Updating compiler [${packageName}]...`));
            const result = sh.exec(`npm install -g ${packageName}`, { silent: true });
            console.log(chalk.gray(result.stdout));
        }

        if (params[0] === 'all' || params[0] === 'project') {
            console.log(chalk.yellowBright(`- Updating project [${resolve('')}]...`));
            this.requirePZPWProject();
            const result = sh.exec('npm update', { silent: true });
            console.log(chalk.gray(result.stdout));
        }

        if (!['all', 'pzpw', 'compiler', 'project'].includes(params[0] as string)) {
            console.log(chalk.gray(await getCommandHelp('update', true)));
        }
    }

    /**
     * Switch branch command
     */
    private async switchCommand(params: (string | number)[]) {
        await this.requirePZPWProject();

        const packageJson = await getProjectPackageJson();

        if (params[0]) {
            const branch = '#' + params[0];

            const pipewrench = packageJson.dependencies['PipeWrench'];
            if (pipewrench.includes('#')) packageJson.dependencies['PipeWrench'] = pipewrench.slice(0, pipewrench.indexOf('#')) + branch;
            else packageJson.dependencies['PipeWrench'] += branch;

            const pipewrenchEvents = packageJson.dependencies['PipeWrench-Events'];
            if (pipewrenchEvents.includes('#')) packageJson.dependencies['PipeWrench-Events'] = pipewrenchEvents.slice(0, pipewrenchEvents.indexOf('#')) + branch;
            else packageJson.dependencies['PipeWrench-Events'] += branch;

            const pipewrenchUtils = packageJson.dependencies['PipeWrench-Utils'];
            if (pipewrenchUtils.includes('#')) packageJson.dependencies['PipeWrench-Utils'] = pipewrenchUtils.slice(0, pipewrenchUtils.indexOf('#')) + branch;
            else packageJson.dependencies['PipeWrench-Utils'] += branch;

            // Update package.json
            console.log(chalk.yellowBright(`- Updating package.json dependecies to branch '${params[0]}'...`));
            await writeFile('package.json', JSON.stringify(packageJson, null, 2), 'utf-8');

            // Update project node_modules
            console.log(chalk.yellowBright('- Updating Project dependencies...'));
            const result = sh.exec('npm update', { silent: true });
            if (result.stdout) console.log(chalk.gray(result.stdout));

            // If error lets revert back
            if (result.stderr) {
                console.log(chalk.red(result.stderr));

                packageJson.dependencies['PipeWrench'] = pipewrench;
                packageJson.dependencies['PipeWrench-Events'] = pipewrenchEvents;
                packageJson.dependencies['PipeWrench-Utils'] = pipewrenchUtils;
                
                console.log(chalk.yellowBright(`- Reverting package.json dependecies...`));
                await writeFile('package.json', JSON.stringify(packageJson, null, 2), 'utf-8');
            }
        }
        else {
            console.log(chalk.gray(await getCommandHelp('switch', true)));
        }
    }

    /**
     * Send a compiler command command
     */
    private async compilerCommand(params: (string | number)[]) {
        const command = 'pzpw-compiler ' + params.join(' ');
        console.log(chalk.yellowBright(`- Executing '${command}'...`));
        const result = sh.exec(command, { silent: true });
        if (result.stderr) {
            console.log(chalk.red(result.stderr));
        }
        else console.log(chalk.gray(result.stdout));
    }

    /**
     * Print the current version command
     */
    private async versionCommand(params: (string | number)[]) {
        await this.printIntro();
    }

}
