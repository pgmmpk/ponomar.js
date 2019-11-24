import test from 'ava';
import stress from './testDb';
import env from '../src/env.js';

const PONOMAR_DB = env('PONOMAR_DB');
const PONOMAR_DUMP = env('PONOMAR_DUMP');

const s = stress(PONOMAR_DB);

test('stress 202010', t => s(t, `${PONOMAR_DUMP}/202010`));
