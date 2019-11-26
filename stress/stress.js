import Ponomar from '../src/Ponomar.js';
import JDate from '../src/JDate.js';
import fs from 'fs';


function* testDb(root) {
    for (const file of fs.readdirSync(root)) {
        if (file.endsWith('.json')) {
            console.log(file);
            yield JSON.parse(fs.readFileSync(`${root}/${file}`));
        }
    }
}

function objPonomar(ponomar) {
    return normalize(JSON.parse(JSON.stringify({
        tone: ponomar.tone,
        fastings: ponomar.fastingCode,
        saints: ponomar.saints
    })));
}

function normalize(ponomar) {
    for (const saint of ponomar.saints) {
        if (saint.services) {
            saint.services = saint.services.filter(x => x.readings && x.readings.length > 0);
            if (saint.services.length === 0) {
                delete saint.services;
            }
        }
    }
    return ponomar;
}

export default db => (t, root) => {
    for (const { date, langs } of testDb(root)) {
        const [year, month, day] = date.split('/').map(x => +x);
        const jdate = new JDate({ year: year, month: month, day: day });
        for (const lang of Object.keys(langs)) {
            // if (date + ' ' + lang !== '2023/12/31 zh/Hant') continue;
            // debugger
            const model = {
                ponomar: normalize(langs[lang].ponomar),
                ponomarReordered: normalize(langs[lang].ponomarReordered),
            };
            const p = new Ponomar(db.lang(lang), jdate);
            const ponomarData = objPonomar(p);
            const execRank = Math.max(...p.saints.map(x => x.type));
            p.execCommand(execRank);
            const ponomarDataReordered = objPonomar(p);

            t.deepEqual(model, {
                ponomar: ponomarData,
                ponomarReordered: ponomarDataReordered,
            }, date + ' ' + lang);
        }
    }
};
