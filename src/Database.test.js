import test from 'ava';
import Database from './Database.js';


test('findBottomUp', t => {
    const db = new Database('../ponomar/Ponomar/languages');
    const result = db.findBottomUp('en', 'xml/pentecostarion/20.xml');
    t.is(result, '../ponomar/Ponomar/languages/xml/pentecostarion/20.xml');
});

test('findTopDown', t => {
    const db = new Database('../ponomar/Ponomar/languages');

    t.plan(1);
    for( const fname of db.findTopDown('cu', 'xml/Commands/Fasting.xml')) {
        t.is(fname, '../ponomar/Ponomar/languages/xml/Commands/Fasting.xml');
    }
});