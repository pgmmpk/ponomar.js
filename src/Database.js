import fs from 'fs';

export default class Database {
    constructor(baseDir) {
        const expectedFile = `${baseDir}/xml/Commands/Fasting.xml`;
        if (!fs.existsSync(expectedFile)) {
            throw new Error('bad baseDir: ' + baseDir);
        }

        this.baseDir = baseDir;
    }

    findBottomUp(lang, path) {
        const parts = lang.split('/');
        for (let i = parts.length; i >= 0; i--) {
            const p = [this.baseDir, ...parts.slice(0, i), path];
            const candidate = p.join('/');

            if (fs.existsSync(candidate)) {
                return candidate;
            }
        }

        throw new Error('Failed to locate ' + path);
    }

    * findTopDown(lang, path) {
        const parts = lang.split('/');
        for (let i = 0; i <= parts.length; i++) {
            const p = [this.baseDir, ...parts.slice(0, i), path];
            const candidate = p.join('/');

            if (fs.existsSync(candidate)) {
                yield candidate;
            }
        }
    }

    readBottomUp(lang, path) {
        const fname = this.findBottomUp(lang, path);

        return fs.readFileSync(fname);
    }

    *readTopDown(lang, path) {
        for (const fname of this.findTopDown(lang, path)) {
            yield fs.readFileSync(fname);
        }
    }
}
