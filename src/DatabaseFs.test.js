import test from 'ava';
import { DatabaseFs } from './DatabaseFs.js';

const PONOMAR_DB = process.env.PONOMAR_DB || 'ponomar/Ponomar/languages';
const db = new DatabaseFs(PONOMAR_DB);

test('triodion', t => {
    const result = db.lang('en').triodion(20);
    t.is(result, `<DAY>\r
<SAINT SId="0" CId="9820" Tone="((ndayP - dow) / 7) % 8"/>\r
</DAY>`);
});

test('lives', t => {
    t.plan(1);
    for ( const text of db.lang('cu').lives(923)) {
        t.is(text, `<SAINT>\r
<NAME Nominative="Прпⷣбнагѡ ѳѡмы̀ ю҆ро́дивагѡ (ок. 546-560)"/>\r
<NAME Short="Прпⷣбнагѡ ѳѡмы̀"/>\r
</SAINT>\r
`);
    }
});