import chalk from 'chalk';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { Settings } from './settings.js';
import { getCommandHelp, getHelp, getIntro, getPZPWConfig } from './utils.js';

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
            throw chalk.red('This command cannot be executed from the root of your PZPW project.');
    }

    /**
     *  
     * @returns 
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
     * Execute commands
     */
    private async exec() {
        let command = this.getCommand();

        const shortIntro = (!command.name || command.name === 'help');
        await getIntro().then(text => console.log(chalk.greenBright((!shortIntro) ? text.split('\n').slice(0, 4).join('\n') : text)));

        // Debug Flag
        if (this.args.debug) {
            console.log(chalk.magenta("Command:"), command);
            console.log(chalk.magenta("Settings:"), this.settings.settings, '\n');
        }

        if (command.name === "help" && command.params.length > 0)
            await getCommandHelp(command.params[0] as string, true).then(text => console.log(chalk.grey(text)))
                .catch(_ => console.log(chalk.grey(`Command "${command.params[0] as string}" not found!`)));

        else await getHelp().then(text => console.log(chalk.grey(text)));
    }

}
