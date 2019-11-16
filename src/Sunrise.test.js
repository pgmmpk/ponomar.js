import test from 'ava';
import JDate from './JDate.js';

/*
 * Test data collected with the following code (also useful for comparative debugging):
 *   https://github.com/troglobit/sun
 *
 * Steps:
 * - compile as spec'ed in the docs
 * - start in the interactive mode
 * - specify longtitude/lattitude and the date
 *
 * NOTE: Program above does not provide observation = 'amature'. I just assumed its correct
 * and tabulated here to avoid regression.
 *
 * And the following web application (accepting occasional one-minute differences):
 *   https://www.timeanddate.com/sun/usa/new-york
 */
const testData = [
    // NYC
    {
        date: '2019/11/14',
        lon: -74.02, lat: 40.72,
        tzoffset: -5.0,
        observation: 'default',
        expect: '06:41 16:39'
    },
    {
        date: '2019/11/14',
        lon: -74.02, lat: 40.72,
        tzoffset: -5.0,
        observation: 'civil',
        expect: '06:12 17:08'
    },
    {
        date: '2019/11/14',
        lon: -74.02, lat: 40.72,
        tzoffset: -5.0,
        observation: 'nautical',
        expect: '05:39 17:41'
    },
    {
        date: '2019/11/14',
        lon: -74.02, lat: 40.72,
        tzoffset: -5.0,
        observation: 'amature',
        expect: '05:23 17:57'
    },
    {
        date: '2019/11/14',
        lon: -74.02, lat: 40.72,
        tzoffset: -5.0,
        observation: 'astronomical',
        expect: '05:07 18:13'
    },
    // SPB
    {
        date: '2019/11/14',
        lon: 30.3350986, lat: 59.9342802,
        tzoffset: +3.0,
        observation: 'default',
        expect: '08:52 16:33'
    },
    // SPB: white nights
    {
        date: '2019/06/20',
        lon: 30.3350986, lat: 59.9342802,
        tzoffset: +3.0,
        observation: 'default',
        expect: '03:34 22:25'
    },
    {
        date: '2019/06/20',
        lon: 30.3350986, lat: 59.9342802,
        tzoffset: +3.0,
        observation: 'astronomical',
        expect: '01:00 01:00'
    },
    // SPB: winter
    {
        date: '2019/12/22',
        lon: 30.3350986, lat: 59.9342802,
        tzoffset: +3.0,
        observation: 'default',
        expect: '10:00 15:54'
    },
    {
        date: '2019/12/22',
        lon: 30.3350986, lat: 59.9342802,
        tzoffset: +3.0,
        observation: 'astronomical',
        expect: '07:14 18:39'
    },
    // Canberra, AU
    {
        date: '2019/11/14',
        lon: 149.128684, lat: -35.282000,
        tzoffset: +11.0,
        observation: 'default',
        expect: '05:49 19:45'
    },
];

test('stress', t => {

    t.plan(testData.length);

    testData.forEach(x => {
        const [year, month, day] = x.date.split('/').map(x=>+x);
        const date = JDate.fromGregorian({month, day, year});

        const [sunrise, sunset] = date.getSunriseSunset(x.lon, x.lat, {
            tzoffset: x.tzoffset, observation: x.observation
        });
        t.is(sunrise + ' ' + sunset, x.expect, JSON.stringify(x, 2));
    });
});

