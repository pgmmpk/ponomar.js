import test from 'ava';
import { scanFilter, parseSaints, parseFastingRules, parseCommands, parseLife } from './parsing.js';
import { toString, unscan } from '@innodatalabs/lxmlx-js';

test('scanFilter', t => {
    const xmltext = `<TOP>
<ONE Cmd="x &gt; y"/>
<TWO Cmd="x &lt; y"/>
<THREE Cmd="x === y"/>
</TOP>`;
    const result = unscan(scanFilter(xmltext, {x: 1, y: 2}));
    const xmltextFiltered = toString(result);
    t.is(xmltextFiltered, `<TOP>

<TWO Cmd="x &lt; y"/>

</TOP>`);
});

test('parseSaints', t => {
    const xmltext = `<DAY>
<SAINT CId="33" Cmd="x == 0" />
<SAINT CId="22" Cmd="x != 0" />
</DAY>`;

    const saints0 = [...parseSaints(
        xmltext,
        'book',
        { x: 0 }
    )];
    t.deepEqual(saints0, [{
        cid: "33",
        menologion: '',
        src: 'book',
        type: null,
    }]);

    const saints1 = [...parseSaints(
        xmltext,
        'book',
        {x: 1}
    )];
    t.deepEqual(saints1, [{
        cid: "22",
        menologion: '',
        src: 'book',
        type: null,
    }]);
});

test('parseFastingRuls', t => {
    const xmltext = `<FASTING>
<PERIOD Cmd="x == 0">
    <RULE Case="111"/>
</PERIOD>
<PERIOD>
    <RULE Cmd="x != 0" Case="101"/>
</PERIOD>
</FASTING>`;

    const rules0 = [...parseFastingRules(
        xmltext,
        { x: 0 }
    )];
    t.deepEqual(rules0, ['111']);

    const rules1 = [...parseFastingRules(
        xmltext,
        { x: 1 }
    )];
    t.deepEqual(rules1, ['101']);
});

test('parseCommands', t => {
    const xmltext = `<DATA>
<COMMAND Name="A" Value="3" Comment="comment1" Cmd="x == 0" />
<COMMAND Name="B" Value="4" Comment="comment2" Cmd="x != 0" />
</DATA>`;

    const cmd0 = [...parseCommands(
        xmltext,
        { x: 0 }
    )];
    t.deepEqual(cmd0, [{
        name: 'A',
        comment: 'comment1',
        value: "3",
    }]);

    const cmd1 = [...parseCommands(
        xmltext,
        { x: 1 }
    )];
    t.deepEqual(cmd1, [{
        name: 'B',
        comment: 'comment2',
        value: "4",
    }]);
});

test('parseLife', t => {
    const xmltext = `<SAINT>
<NAME Nominative="Mike" Short="K" />
<INFO X="Y" />
<LIFE>Life is here</LIFE>
<SERVICE Type="3">
    <MATINS>
        <SCRIPTURE EffWeek="23" Reading="Mathew 1:4" Pericope="5" Type="unknown" />
    </MATINS>
</SERVICE>
</SAINT>`;

    const [saint, services] = parseLife(
        xmltext,
        { x: 0 }
    );
    t.deepEqual(saint, {
        name: {
            Nominative: 'Mike', Short: 'K',
        },
        info: {
            X: 'Y',
        },
        life: {
            Text: 'Life is here'
        },
        ref: null,
        type: '3',
    });
    t.deepEqual(services, [{
        type: 'matins',
        readings: [
            { effWeek: '23', pericope: '5', reading: 'Mathew 1:4', type: 'unknown'}
        ],
    }]);
});
