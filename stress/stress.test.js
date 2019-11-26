import test from 'ava';
import stress from './stress';
import { DatabaseFs } from '../src/DatabaseFs.js';
import fs from 'fs';

const db = new DatabaseFs(process.env.PONOMAR_DB || 'ponomar/Ponomar/languages');
const PONOMAR_DUMP = process.env.PONOMAR_DUMP || 'dump';

test('stress', t => {
    t.plan(15337);  // for years 2019, 2020, 2021, 2022, 2023
    for (const subdir of fs.readdirSync(PONOMAR_DUMP)) {
        console.log(subdir);
        const s = stress(db);
        s(t, `${PONOMAR_DUMP}/${subdir}`);
    }
});
