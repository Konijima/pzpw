import chalk from 'chalk';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { Settings } from './settings.js';
import { getPZPWConfig } from './utils.js';

export class Cli {
    
    private settings: Settings;
    private pzpwConfig?: any;
    readonly args: {[key: string]: (string | number)[]};

    constructor(args: {[key: string]: (string | number)[]}) {
        this.args = args;
    }

    /**
     * Start the compiler process
     */
     public async run() {
        this.settings = await Settings.Load();
        this.pzpwConfig = await getPZPWConfig().catch(() => {});

        await this.exec();
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

        
    }

}
