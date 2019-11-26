
export class Engine {
    has(name) {
        throw new Error('not implemented ' + name);
    }
    get(name) {
        throw new Error('not implemented ' + name);
    }
}

export class Database {
    constructor(engine) {
        this._lang;
        this.engine = engine;
    }

    lang(l) {
        this._lang = l;
        return this;
    }

    _findBottomUp(path) {
        if (this._lang === undefined) {
            throw new Error('lang() not set');
        }
        const parts = this._lang.split('/');
        for (let i = parts.length; i >= 0; i--) {
            const p = [...parts.slice(0, i), path];
            const candidate = p.join('/');

            if (this.engine.has(candidate)) {
                return candidate;
            }
        }

        throw new Error('Failed to locate ' + path);
    }

    * _findTopDown(path) {
        if (this._lang === undefined) {
            throw new Error('lang() not set');
        }
        const parts = this._lang.split('/');
        for (let i = 0; i <= parts.length; i++) {
            const p = [...parts.slice(0, i), path];
            const candidate = p.join('/');

            if (this.engine.has(candidate)) {
                yield candidate;
            }
        }
    }

    _read(path) {
        const fname = this._findBottomUp(path);
        return this.engine.get(fname);
    }

    * _readTopDown(path) {
        for (const fname of this._findTopDown(path)) {
            yield this.engine.get(fname);
        }
    }

    triodion(day) {
        return this._read(`xml/triodion/${dec2(day)}.xml`);
    }

    pentecostarion(day) {
        return this._read(`xml/pentecostarion/${dec2(day)}.xml`);
    }

    menaion(month, day) {
        return this._read(`xml/${dec2(month)}/${dec2(day)}.xml`);
    }

    * lives(cid) {
        for (const text of this._readTopDown(`xml/lives/${dec2(cid)}.xml`)) {
            yield text;
        }
    }

    fasting() {
        return this._read(`xml/Commands/Fasting.xml`);
    }

    divineLiturgy() {
        return this._read(`xml/Commands/DivineLiturgy.xml`);
    }
}

const dec2 = x => x < 10 ? '0' + x : '' + x;
