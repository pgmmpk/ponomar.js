import test from 'ava';
import evaluate from './evaluate.js';


test('smoke', t => {
    const result = evaluate('x + y', {x: 1, y: 2});
    t.is(result, 3);
});
