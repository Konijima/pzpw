import { homedir } from "os";
import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import { APP_PATH } from "./utils.js";

export type SettingValue = string | number | boolean;

export interface ISettings {
    [key: string]: unknown
}

export class Settings {

    public readonly settings: ISettings;

    constructor(settings?: ISettings) {
        this.settings = settings || {
            cachedir: join(homedir(), 'Zomboid'),
        };
    }

    /**
     * Load global settings
     * @returns 
     */
    public static async Load() {
        let settings: ISettings;
        try {
            const loadPath = join(APP_PATH, "global-settings.json");
            const content = await readFile(loadPath, 'utf-8');
            settings = JSON.parse(content) as ISettings;
        }
        catch(error) { /** ignore */ }
        return new Settings(settings);
    }

    /**
     * Get setting by key
     * @param key 
     * @returns 
     */
    public get(key: string) {
        return this.settings[key];
    }
    
    /**
     * Set setting by key
     * @param key 
     * @param value 
     */
    public set(key: string, value: SettingValue) {
        this.settings[key] = value;
    }

    /**
     * Save current settings
     */
    public async save() {
        const savePath = join(APP_PATH, "global-settings.json");
        await writeFile(savePath, JSON.stringify(this.settings), 'utf-8');
    }
}