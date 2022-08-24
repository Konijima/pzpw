import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import { APP_PATH } from "./utils.js";

export type SettingValue = string | number | boolean;

export interface ISettings {
    [key: string]: unknown

    defaultAuthor: string
    templateRepo: string
    templateBranch: string
}

export class Settings {

    public readonly settings: ISettings;

    constructor(settings?: ISettings) {
        this.settings = settings || {
            defaultAuthor: "",
            templateRepo: "https://github.com/Konijima/pzpw-template.git",
            templateBranch: "v2.0",
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
    public get<T>(key: string) {
        return this.settings[key] as T;
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