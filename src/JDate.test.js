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
    const jdate = JDate.fromGregorian({year: 2016, month: 3, day: 30});

    t.is(jdate.jday, 2457478);

    const jdate2 = JDate.fromJulianDay(2457478);
    t.is(jdate2.year, 2016);
    t.is(jdate2.month, 3);
    t.is(jdate2.day, 17);
});

test('toGregorian', t => {
    const jdate = JDate.fromGregorian({ year: 2016, month: 3, day: 30 });
    const gdate = jdate.toGregorian();

    t.deepEqual(gdate, { year: 2016, month: 3, day: 30 });
});

test('dayOfWeek', t => {
    const jdate = JDate.fromGregorian({ year: 2019, month: 11, day: 16 });

    t.is(jdate.dayOfWeek, 6);
});

test('dayOfYear', t => {
    let jdate = JDate.fromGregorian({ year: 2019, month: 11, day: 16 });
    t.is(jdate.dayOfYear, 306);

    jdate = new JDate({ year: 2020, month: 2, day: 29 });
    t.is(jdate.dayOfYear, 366);

    jdate = new JDate({ year: 2019, month: 2, day: 28 });
    t.is(jdate.dayOfYear, 58);

    jdate = new JDate({ year: 2019, month: 3, day: 1 });
    t.is(jdate.dayOfYear, 59);

    jdate = new JDate({ year: 2019, month: 1, day: 1 });
    t.is(jdate.dayOfYear, 0);  // Jan 1st is 0!
});
