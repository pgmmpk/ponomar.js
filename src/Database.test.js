import test from 'ava';
import { Database } from './Database.js';

class MockEngine {
    constructor(map) {
        this.map = map;
    }

    has(name) {
        return this.map[name] !== undefined;
    }

    get(name) {
        return this.map[name];
    }
}

test('triodion', t => {
    const db = new Database(new MockEngine({
        'en/xml/triodion/20.xml': 'Hello',
        'ru/xml/triodion/20.xml': 'Привет',
    }));
    t.is(db.lang('en').triodion(20), 'Hello');
    t.is(db.lang('ru').triodion(20), 'Привет');
});

test('pentecostarion', t => {
    const db = new Database(new MockEngine({
        'en/xml/pentecostarion/20.xml': 'Hello',
        'ru/xml/pentecostarion/20.xml': 'Привет',
    }));
    t.is(db.lang('en').pentecostarion(20), 'Hello');
    t.is(db.lang('ru').pentecostarion(20), 'Привет');
});

test('menaion', t => {
    const db = new Database(new MockEngine({
        'en/xml/10/12.xml': 'Hello',
        'ru/xml/10/12.xml': 'Привет',
    }));
    t.is(db.lang('en').menaion(10, 12), 'Hello');
    t.is(db.lang('ru').menaion(10, 12), 'Привет');
});

test('lives', t => {
    const db = new Database(new MockEngine({
        'en/xml/lives/923.xml': 'en-923',
        'xml/lives/923.xml': 'root-923',
    }));
    const result = [...db.lang('en').lives(923)];
    t.deepEqual(result, ['root-923', 'en-923']);
});

test('fasting', t => {
    const db = new Database(new MockEngine({
        'en/xml/Commands/Fasting.xml': 'en-Fasting',
        'xml/Commands/Fasting.xml': 'root-Fasting',
    }));
    const result = db.lang('en').fasting();
    t.is(result, 'en-Fasting');
});

test('divineLiturgy', t => {
    const db = new Database(new MockEngine({
        'en/xml/Commands/DivineLiturgy.xml': 'en-Liturgy',
        'xml/Commands/DivineLiturgy.xml': 'root-Liturgy',
    }));
    const result = db.lang('en').divineLiturgy();
    t.deepEqual(result, 'en-Liturgy');
});