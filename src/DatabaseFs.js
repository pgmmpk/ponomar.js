import fs from 'fs';
import { Database } from './Database.js';

export class EngineFs {
    constructor(baseDir) {
        const expectedFile = `${baseDir}/xml/Commands/Fasting.xml`;
        if (!fs.existsSync(expectedFile)) {
            throw new Error('bad baseDir: ' + baseDir);
        }
        this.baseDir = baseDir;
    }

    has(name) {
        return fs.existsSync(this.baseDir + '/' + name);
    }
    get(name) {
        return fs.readFileSync(this.baseDir + '/' + name, 'utf8');
    }
}

export class DatabaseFs extends Database {
    constructor(baseDir) {
        super(new EngineFs(baseDir));
    }
}
