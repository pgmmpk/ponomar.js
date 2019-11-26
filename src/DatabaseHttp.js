import { Database } from './Database.js';

export class EngineHttp {
    constructor(db) {
        this.db = db;
    }

    static async load(url) {
        const request = await fetch(url);
        const db = await requiest.json();

        return new EngineHttp(db);
    }

    has(name) {
        return this.db[name] !== undeifined;
    }
    get(name) {
        return this.db[name];
    }
}

export class DatabaseHttp extends Database {
    constructor(url, lang) {
        super(lang, new EngineHttp(url));
    }
}
