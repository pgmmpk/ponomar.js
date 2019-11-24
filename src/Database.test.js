import test from 'ava';
import Database from './Database.js';


test('findBottomUp', t => {
    const PONOMAR_DB = process.env['PONOMAR_DB'];
    if (PONOMAR_DB === undefined) {
        console.error('skipped');
        return t.assert(true);
    }
    const db = new Database(PONOMAR_DB);
    const result = db.findBottomUp('en', 'xml/pentecostarion/20.xml');
    t.is(result, `${PONOMAR_DB}/xml/pentecostarion/20.xml`);
});

test('findTopDown', t => {
    const PONOMAR_DB = process.env['PONOMAR_DB'];
    if (PONOMAR_DB === undefined) {
        console.error('skipped');
        return t.assert(true);
    }
    const db = new Database(PONOMAR_DB);

    t.plan(1);
    for( const fname of db.findTopDown('cu', 'xml/Commands/Fasting.xml')) {
        t.is(fname, `${PONOMAR_DB}/xml/Commands/Fasting.xml`);
    }
});