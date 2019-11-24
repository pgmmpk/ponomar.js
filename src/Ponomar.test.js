import test from 'ava';
import Ponomar from './Ponomar';
import JDate from './JDate.js';
import env from './env.js';

const PONOMAR_DB = env('PONOMAR_DB', 'location of ponomar XML database, e.g. "../ponomar/Ponomar/languages"');

test('smoke', t => {
    const date = new JDate({year: 2019, month: 11, day: 8});
    const p = new Ponomar(PONOMAR_DB, date, 'en');

    debugger
    t.is(p.tone, 5);
    t.is(p.dRank, 4);
    t.deepEqual(p.saints, [
        {
            cid: '9208', info: null, menologion: '', ref: null, src: 'pentecostarion', type: '0',
            life: null,
            name: { Nominative: 'Thursday of the 23<sup>rd</sup> week after Pentecost', Short: 'Thursday of the 23<sup>rd</sup> week after Pentecost' },
            services: [
                { type: 'prime' },
                {
                    type: 'liturgy',
                    readings: [
                        { effWeek: '23', pericope: '265', reading: 'I Thess_2:9-14a', type: 'apostol' },
                        { effWeek: '25', pericope: '70', reading: 'Lk_13:1-9', type: 'gospel' },
                    ]
                },
            ]
        },
        {
            cid: '154701', info: null, menologion: '', ref: null, menologion: '', src: 'menaion', type: '4',
            name: { Nominative: 'Synaxis of the Chief of the Heavenly Hosts, Archangel Michael and the Other Heavenly Bodiless Powers: Archangels Gabriel, Raphael, Uriel, Selaphiel, Jehudiel, Barachiel, and Jeremiel', Short: 'Bodiless Hosts' },
            life: {
                Id: 'bulgakov',
                Text: `
<p> Commander Michael, whose name in Hebrew means “Who is like God?,” or “Who is Equal to God?,” is the leader of heavenly Powers and is why in Holy Scriptures he is called the “Commander of the Powers of the Lord” (<a href="bible=Josh#5:14">Joshua 5:14</a>), “One of the chief princes” (<a href="bible=Dan#10:13">Dan. 10:13</a>) “Your great prince” (<a href="bible=Dan#10:21,12:1">Dan. 10:21; 12: 1</a>). In church hymns he is hymned as “leader of the angelic choir”, “Intercessor to the Tri-solar Divinity”. Celebrating him, the Holy Church celebrates also all the bodiless Powers, and is why the same feast is called the Synaxis. This feast was established in the fourth century. The reason why the Holy Angels is commemorated in November is that November is the ninth month from March (which originally was the first month of the year) and there are nine orders of angels. These nine orders, according to the teaching of the Holy Church, are divided into three hierarchies: the highest, the middle and the lowest; each hierarchy has three ranks. To the highest hierarchy belong<ul><li>The six-winged Seraphim (<a href="bible=Isa#6:2">Is. 6: 2</a>),</li><li>The many-eyed Cherubim (<a href="bible=Gen#3:24">Gen. 3:24</a>), and</li><li>The God-bearing Thrones (<a href="bible=Col#1:16">Col. 1: 16</a>);</li></ul> to the middle hierarchy belong<ul><li>The Dominions (<a href="bible=Col#1:16">Col. 1:16</a>),</li><li>The Powers (<a href="bible=I_Pet#3:22">1 Pet. 3: 22</a>), and</li><li>The Authorities (<a href="bible=I_Pet#3:22">1 Pet. 3:22</a>;<a href="bible=Col#1:16"> Col. 1:16)</a>;</li></ul>To the lowest hierarchy belong the<ul><li>Principalities (<a href="bible=Col#1:16">Col. 1:16</a>),</li><li>The Archangels (<a href="bible=I_Thess#4:16">1 Thess. 4:16</a>), and</li><li>The Angels (<a href="bible=I_Pet#3:22">1 Pet. 3:22</a>).</li></ul>Besides the Archangels Michael and Gabriel (March 26 and July 13) the following archangels are known both in the Holy Scriptures and Holy Tradition: Raphael, the physician of God (<a href="bible=Tobit#3:17,12:15">Tobit 3:17; 12:15</a>), Uriel, the fire or light of God (<a href="bible=III_Esdra#5:16">3 Esdras 5:16</a>), Salaphiel, the prayer of God (<a href="bible=III_Esdra#5:16">3 Esdras 5:16</a>), Jegudiel, the glorifier of God, Barachiel, the blessing of God, and Jeremiel, the exaltation of God (<a href="bible=III_Esdra#4:36">3 Esdras 4:36</a>). </p>
`,
                Translator: 'Archpriest Eugene Tarris'
            },
            services: [
                {
                    type: 'vespers',
                    readings: [
                        {
                            effWeek: null,
                            pericope: null,
                            reading: 'Josh_5:13-15',
                            type: '1',
                        },
                        {
                            effWeek: null,
                            pericope: null,
                            reading: 'Judg_6:2, 7, 11-24',
                            type: '2',
                        },
                        {
                            effWeek: null,
                            pericope: null,
                            reading: 'Isa_14:7-20',
                            type: '3',
                        },
                    ]
                },
                {
                    type: 'matins',
                    readings: [
                        {
                            effWeek: null,
                            pericope: '52',
                            reading: 'Mt_13:24-30, 36b-43',
                            type: '1',
                        },
                    ]
                },
                {
                    type: 'liturgy',
                    readings: [
                        {
                            effWeek: null,
                            pericope: '305',
                            reading: 'Heb_2:2-10',
                            type: 'apostol',
                        },
                        {
                            effWeek: null,
                            pericope: '51',
                            reading: 'Lk_10:16-21',
                            type: 'gospel',
                        },
                    ]
                },
                {
                    type: 'liturgy',
                },
            ],
        },
        {
            cid: '11080000', info: null, menologion: '', ref: null, src: 'menaion', type: '0',
            life: null,
            name: { Nominative: 'Venerable Martha, Princess of Pskov († 1300)', Short: 'Venerable Martha' },
        },
    ]);
});
