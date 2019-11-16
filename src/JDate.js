import { getSunriseSunset } from './Sunrise.js';
// http://www.magister.msk.ru/library/bible/comment/nkss/nkss22.htm

const GREGORIAN_INCEPTION_AS_GREGORIAN_DATE = [1582, 10, 15];
const GREGORIAN_INCEPTION_AS_JULIAN_DATE = [1582, 10, 5];

function getJulianDay(ymd, options) {
    options = Object.assign({
        fromJulianDate: true
    }, options);

    let [year, month, day] = ymd;

    if (month < 1 || month > 12) {
        throw new Error('bad month value: ' + month);
    }

    if (day < 1 || day > 31) {
        throw new Error('bad day value: ' + month);
    }

    // before Gregorian reform calendars are assumed to be identical
    if (!options.fromJulianDate && ymd < GREGORIAN_INCEPTION_AS_GREGORIAN_DATE) {
        if ( ymd > GREGORIAN_INCEPTION_AS_JULIAN_DATE) {
            [year, month, day] = GREGORIAN_INCEPTION_AS_JULIAN_DATE;
        }
        options.fromJulianDate = true;
    }

    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    let jday = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;

    if (!options.fromJulianDate) {
        jday -= Math.floor(y / 100);
        jday += Math.floor(y / 400);
        jday += 38;
    }

    return jday;
}

function getYmd(jday, options) {
    options = Object.assign({
        julian: true
    }, options);

    let f = jday + 1401;
    if (!options.julian) {
        f += Math.floor((Math.floor((4 * jday + 274277) / 146097) * 3) / 4) - 38;
    }

    let e = f * 4 + 3;
    let g = Math.floor((e % 1461) / 4);
    let h = 5 * g + 2;

    let day = Math.floor((h % 153) / 5) + 1;
    let month = ( Math.floor(h / 153) + 2 ) % 12 + 1;
    let year = Math.floor(e / 1461) - 4716 + Math.floor((14 - month) / 12);

    return [year, month, day];
}

// function julianToGregorian(ymd) {
//     if (ymd < GREGORIAN_INCEPTION_AS_JULIAN_DATE) {
//         return ymd;
//     }
//     const jday = getJulianDay(ymd, {fromJulianDate: true});
//     return getYmd(jday, {julian: false});
// }

function gregorianToJulian(ymd) {
    if (ymd < GREGORIAN_INCEPTION_AS_GREGORIAN_DATE) {
        if ( ymd > GREGORIAN_INCEPTION_AS_JULIAN_DATE) {
            return GREGORIAN_INCEPTION_AS_JULIAN_DATE;
        }
        return ymd;
    }
    const jday = getJulianDay(ymd, {fromJulianDate: false});
    return getYmd(jday, {julian: true});
}

/**
  Julian date
 */
export default class JDate {
    constructor({year, month, day}) {
        if (year === undefined) {
            throw new Error('bad year value: ' + year);
        }
        if (month === undefined || month < 1 || month > 12) {
            throw new Error('bad month value: ' + month);
        }
        if (day === undefined || day < 1 || day > 31) {
            throw new Error('bad day value: ' + day);
        }
        this.jday = getJulianDay([year, month, day]);
        [this.year, this.month, this.day] = [year, month, day];
    }

    static fromJulianDay(jday) {
        const [year, month, day] = getYmd(jday);
        return new this({
            year: year,
            month: month,
            day: day,
        });
    }

    static fromGregorian({month, day, year}) {
        [year, month, day] = gregorianToJulian([year, month, day]);
        return new this({
            year: year,
            month: month,
            day: day,
        });
    }

    get dayOfWeek() {
        return (this.jday + 1) % 7;
    }

    add(days) {
        return JDate.fromJulianDay(this.jday + days);
    }

    toGregorian() {
        const [year, month, day] = getYmd(this.jday, {julian: false});
        return { year, month, day };
    }

    /**
     * Returns a tuple of two strings: sunrise and sunset times formatted as HH:MM
     *
     * @param {*} longtitude
     * @param {*} lattitude
     * @param {*} options
     *      - tzoffset offset (in hours) to UTC.
     *      - observation one of "default", "civil", "nautical", "amature", "astronomical",
     *            or an object specifying the observation altitude and whether refraction
     *            correction is needed. For example: { altit: 12.0, upperLimb: false }.
     * ```
     * const tzoffset = new Date().getTimezoneOffset() / -60.0;
     * ```
     */
    getSunriseSunset(longtitude, lattitude, options) {
        return getSunriseSunset(this.jday, longtitude, lattitude, options);
    }
}