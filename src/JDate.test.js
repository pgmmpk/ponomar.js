import test from 'ava';
import JDate from './JDate.js';


test('smoke', t => {
    const jdate = new JDate({day: 1, month: 2, year: 1948});

    t.is(jdate.jday, 2432596);
    t.is(jdate.day, 1);
    t.is(jdate.month, 2);
    t.is(jdate.year, 1948);
});

test('smoke2', t => {
    const jdate = JDate.fromGregorianDate({year: 2016, month: 3, day: 30});

    t.is(jdate.jday, 2457478);

    const jdate2 = JDate.fromJulianDay(2457478);
    t.is(jdate2.year, 2016);
    t.is(jdate2.month, 3);
    t.is(jdate2.day, 17);
});

test('toGregorian', t => {
    const jdate = JDate.fromGregorianDate({ year: 2016, month: 3, day: 30 });
    const gdate = jdate.toGregorian();

    t.deepEqual(gdate, { year: 2016, month: 3, day: 30 });
});
