import test from 'ava';
import fs from 'fs';
import JDate from './JDate.js';
import {
    getIndiction,
    getSolarCycle,
    getLunarCycle,
    getConcurrent,
    getFoundation,
    getEpacta,
    getPascha,
    getKeyOfBoundaries,
    default as paschalion,
} from './Paschalion.js';

function readTsv(fname) {
    const lines = fs.readFileSync(fname, 'utf-8').split('\n').slice(1); // strip first line off
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    function parse(year, dateStr) {
        const [monthStr, dayStr] = dateStr.split(' ');
        const month = months.indexOf(monthStr);
        if (month < 0) {
            throw new Error(monthStr);
        }

        return new JDate({year: +year, month: month+1, day: +dayStr});
    }
    // 1941	7449	9	1	1	1	14	7	April 7	П
    // skip the header
    return lines.filter(l=>l.trim().length >= 10).map(line=>line.split('\t')).map(data=>({
        year:       +data[0],
        annoMundi:  +data[1],
        indiction:  +data[2],
        solarCycle: +data[3],
        concurrent: +data[4],
        lunarCycle: +data[5],
        foundation: +data[6],
        epacta:     +data[7],
        pascha:      parse(data[0], data[8]),
        vkey:        data[9],  // вруцелето
    }));
}

test('getIndiction', t => t.is(getIndiction(1948), 1));
test('getSolarCycle', t => t.is(getSolarCycle(1948), 8));
test('getLunarCycle', t => t.is(getLunarCycle(1948), 8));
test('getConcurrent', t => t.is(getConcurrent(1948), 3));
test('getFoundation', t => t.is(getFoundation(1948), 1));
test('getEpacta', t => t.is(getEpacta(1948), 20));

test('paschalion', t => {
    for (const x of readTsv('./src/paschalion_baseline.tsv')) {
        const mess = '' + x.year;

	    // PERFORM SOME SANITY CHECKS. THESE ENSURE THAT OUR COMPUTUS IS CORRECT
        t.true(x.epacta + x.foundation === 21 || x.epacta + x.foundation === 51);

        t.is(getIndiction(x.year), x.indiction, mess);
        t.is(getSolarCycle(x.year), x.solarCycle, mess);
        t.is(getLunarCycle(x.year), x.lunarCycle, mess);
        t.is(getConcurrent(x.year), x.concurrent, mess);
        t.is(getFoundation(x.year), x.foundation, mess);
        t.is(getEpacta(x.year), x.epacta, mess);
        t.deepEqual(getPascha(x.year), x.pascha);
        t.is(getPascha(x.year).dayOfWeek, 0); // sanity
        t.is(getKeyOfBoundaries(x.year), x.vkey);

        // THE CODE BELOW COMPUTES PASCHA FROM THE CONCURRENT AND FOUNDATION
        // SEE HERE FOR EXPLANATION: http://www.magister.msk.ru/library/bible/comment/nkss/nkss22.htm
        const firstSundayOfMarch = (new JDate({year: x.year, month: 3, day: 1})).add( (10 - x.concurrent) % 7 );
        let paschalBoundary = (new JDate({month: 3, day: 1, year: x.year})).add(44 - x.foundation);
        // add the Nicene correction for Indiction 14 (3 days)
        paschalBoundary = paschalBoundary.add(3);
        // check that the full moon is after March 21; if it is not, add another 30 days.
        if (paschalBoundary.jday < (new JDate({month: 3, day: 21, year: x.year})).jday) {
            paschalBoundary = paschalBoundary.add(30);
        }

        let computedPascha = firstSundayOfMarch;
        while (computedPascha.jday < paschalBoundary.jday) {
            computedPascha = computedPascha.add(7);
        }

        t.deepEqual(computedPascha, x.pascha);

        t.deepEqual(paschalion(x.year).pascha, x.pascha);
    }
});