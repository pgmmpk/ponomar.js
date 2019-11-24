(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('fs'), require('@innodatalabs/lxmlx-js')) :
    typeof define === 'function' && define.amd ? define(['exports', 'fs', '@innodatalabs/lxmlx-js'], factory) :
    (global = global || self, factory(global.ponomar = {}, global.fs, global.lxmlxJs));
}(this, (function (exports, fs, lxmlxJs) { 'use strict';

    fs = fs && fs.hasOwnProperty('default') ? fs['default'] : fs;

    /**
    =head3 DESCRIPTION

    Modified version of C<Astro::Sunrise> to work with dates on the Julian Calendar. Dependency on C<DateTime> removed.
    Removed wrapper methods, which have been moved to C<Ponomar::JDate>. Basic computation kept in tact.

    =head3 SPECIAL THANKS

    Modified from C<Astro::Sunrise>, which is by
    Ron Hill
    L<rkhill@firstlight.net>.

    =head3 COPYRIGHT and LICENSE

    Here is the copyright information provided by Ron Hill in Astro::Sunrise:

    Written as DAYLEN.C, 1989-08-16. Modified to SUNRISET.C, 1992-12-01.

    Copyright Paul Schlyter, 1989, 1992. Released to the public domain by Paul Schlyter, December 1992.

    Permission is hereby granted, free of charge, to any person obtaining a
    copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included
    in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
    THE AUTHOR BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT
    OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.

    =head3 SEE ALSO

    L<Astro::Sunrise>
     */


    function sunRiseSet(d, lon, lat, altit, upperLimb) {
        const sidtime = revolution( GMST0(d) + 180.0 + lon);
        const [sRA, sdec, sr] = sunRAdec(d);
        const tsouth = 12.0 - rev180(sidtime - sRA) / 15.0;
        const sradius = 0.2666 / sr;

        if (upperLimb) {
            altit -= sradius;
        }

        // Compute the diurnal arc that the Sun traverses to reach
        // the specified altitude altit:
        const cost = ( sind(altit) - sind(lat) * sind(sdec)) / ( cosd(lat) * cosd(sdec) );
        let t;
        if (cost >= 1.0) {
            console.warn('Sun never rises!');
            t = 0.0;  // sun always below altit
        } else if (cost <= -1.0) {
            console.warn('Sun never sets!');
            t = 12.0; // sun always above altit
        } else {
            t = acosd(cost) / 15.0;  //The diurnal arc, hours
        }

        // Store rise and set times - in hours UT
        return [tsouth - t, tsouth + t];
    }

    /**
     * computes GMST0, the Greenwich Mean Sidereal Time
     * at 0h UT (i.e. the sidereal time at the Greenwhich meridian at
     * 0h UT).  GMST is then the sidereal time at Greenwich at any
     * time of the day..
     */
    function GMST0(d) {
        return revolution( ( 180.0 + 356.0470 + 282.9404 ) + ( 0.9856002585 + 4.70935E-5 ) * d );
    }

    /**
    # Computes the Sun's ecliptic longitude and distance
    # at an instant given in d, number of days since
    # 2000 Jan 0.0.
    # _RETURN
    # ecliptic longitude and distance
    # ie. $True_solar_longitude, $Solar_distance
     */
    function sunpos(d) {
        // Compute mean elements
        const Mean_anomaly_of_sun = revolution( 356.0470 + 0.9856002585 * d );
        const Mean_longitude_of_perihelion = 282.9404 + 4.70935E-5 * d;
        const Eccentricity_of_Earth_orbit  = 0.016709 - 1.151E-9 * d;

        // Compute true longitude and radius vector
        const Eccentric_anomaly =
          Mean_anomaly_of_sun + Eccentricity_of_Earth_orbit * RAD2DEG *
          sind(Mean_anomaly_of_sun) *
          ( 1.0 + Eccentricity_of_Earth_orbit * cosd(Mean_anomaly_of_sun) );

        const x = cosd(Eccentric_anomaly) - Eccentricity_of_Earth_orbit;

        const y =
          Math.sqrt( 1.0 - Eccentricity_of_Earth_orbit * Eccentricity_of_Earth_orbit ) *
            sind(Eccentric_anomaly);

        const Solar_distance = Math.sqrt( x*x + y*y );
        const True_anomaly = atan2d( y, x );

        let True_solar_longitude = True_anomaly + Mean_longitude_of_perihelion;
        if (True_solar_longitude >= 360.0) {
            True_solar_longitude -= 360.0; // Make it 0..360 degrees
        }

        return [Solar_distance, True_solar_longitude];
    }

    // compute RA and dec
    // Sun's Right Ascension (RA) and Declination (dec)
    function sunRAdec(d) {
        // Compute Sun's ecliptical coordinates
        const [r, lon] = sunpos(d);

        // Compute ecliptic rectangular coordinates (z=0)
        let x = r * cosd(lon);
        let y = r * sind(lon);

        // Compute obliquity of ecliptic (inclination of Earth's axis)
        const obl_ecl = 23.4393 - 3.563E-7 * d;

        // Convert to equatorial rectangular coordinates - x is unchanged
        let z = y * sind(obl_ecl);
        y = y * cosd(obl_ecl);

        // Convert to spherical coordinates
        const RA  = atan2d( y, x );
        const dec = atan2d( z, Math.sqrt( x*x + y*y ) );

        return [RA, dec, r];

    }

    const RAD2DEG = 180.0 / Math.PI;

    function sind(x) { return Math.sin(x / RAD2DEG); }
    function cosd(x) { return Math.cos(x / RAD2DEG); }
    function acosd(x) { return Math.acos(x) * RAD2DEG; }
    function atan2d(x, y) { return Math.atan2(x, y) * RAD2DEG; }

    /**
    # _GIVEN
    # any angle
    #
    # _THEN
    #
    # reduces any angle to within the first revolution
    # by subtracting or adding even multiples of 360.0
    #
    #
    # _RETURN
     */
    function revolution(x) {
        return ( x - 360.0 * Math.floor( x / 360.0 ) );
    }

    /**
    # _GIVEN
    #
    # any angle
    #
    # _THEN
    #
    # Reduce input to within +180..+180 degrees
    #
    #
    # _RETURN
    #
    # angle that was reduced
     */
    function rev180(x) {
        return ( x - 360.0 * Math.floor( x / 360.0 + 0.5 ) );
    }

    /**
    =item getSunrise($longitude, $latitude, $TimeZone, [$DST, $ALT])

    Return the sunrise/sunset for a given day.

     Eastern longitude is entered as a positive number
     Western longitude is entered as a negative number
     Northern latitude is entered as a positive number
     Southern latitude is entered as a negative number

    Example:

    C<< ($sunrise, $sunset) = $date->getSunrise($longitude, $latitude, $TimeZone, $DST, $ALT); >>

    Returns the sunrise and sunset times, in HH:MM format.
    Note: C<$Time Zone> is the offset from UTC and $<DST> is daylight
    saving time (C<1> means DST is in effect and C<0> means it is not).  If C<$ALT> is not specified,
    a default altitude of C<-.0833> is used. Note that adding C<1> to C<$TimeZone> during DST
    and specifying C<$DST> as C<0> is the same as indicating the
    Time Zone correctly and specifying C<$DST> as C<1>.

    There are a number of values of C<$ALT> to choose from.  The default is
    C<-0.833> because this is what most countries use. Here is the list of other common values:

    =over 4

    =item C<0> degrees

    Center of Sun's disk touches a mathematical horizon

    =item C<-0.25> degrees

    Sun's upper limb touches a mathematical horizon

    =item C<-0.583> degrees

    Center of Sun's disk touches the horizon; atmospheric refraction accounted for

    =item C<-0.833> degrees, DEFAULT

    Sun's supper limb touches the horizon; atmospheric refraction accounted for

    =item C<-6> degrees, CIVIL

    Civil twilight (one can no longer read outside without artificial illumination)

    =item C<-12> degrees, NAUTICAL

    Nautical twilight (navigation using a sea horizon no longer possible)

    =item C<-15> degrees, AMATEUR

    Amateur astronomical twilight (the sky is dark enough for most astronomical observations)

    =item C<-18> degrees, ASTRONOMICAL

    Astronomical twilight (the sky is completely dark)




    */

    /* This macro computes times for sunrise/sunset.                      */




    const OBSERVATIONS = {
        // Sunrise/Sunset
        // Sunrise/set is considered to occur when the Sun's upper limb is
        // 35 arc minutes below the horizon (this accounts for the refraction
        // of the Earth's atmosphere).
        'default': { altit: -35.0 / 60.0, upperLimb: true },

        // Civil twilight.
        // Civil twilight starts/ends when the Sun's center is 6 degrees below
        // the horizon.
        'civil': { altit: -6.0, upperLimb: false },

        // Nautical twilight.
        // Nautical twilight starts/ends when the Sun's center is 12 degrees
        // below the horizon.
        'nautical': { altit: -12.0, upperLimb: false },

        // Amature twilight.
        // Amature astronomical twilight starts/ends when the Sun's center is 15 degrees
        // below the horizon.
        'amature': { altit: -15.0, upperLimb: false },

        // Astronomical twilight.
        // Astronomical twilight starts/ends when the Sun's center is 18 degrees
        // below the horizon.
        'astronomical': { altit: -18.0, upperLimb: false },
    };

    function getSunriseSunset(jday, lon, lat, options) {
        const { observation, tzoffset } = Object.assign({
            observation: 'default',
            tzoffset: 0.0,
        }, options);

        let alt;
        let upperLimb;
        if (typeof observation === 'string') {
            if (OBSERVATIONS[observation] === undefined) {
                throw new Error('Unrecognized observation type. Expect one of: ' +
                    '"default", "civil", "nautical", "amature", or "astronomical".\n' +
                    'Alternatively, you can pass an object with "altit" and "upperLimb" keys ' +
                    'to set custom observation parameters.'
                );
            }
            ({ altit: alt, upperLimb } = OBSERVATIONS[observation]);
        } else {
            ({ altit: alt, upperLimb } = observation);
        }

    	// NOTE: 2451545 IS THE JULIAN DAY OF DECEMBER 19, 1999 (ACCORDING TO THE JULIAN CALENDAR)
        const d = jday - 2451544 + 0.5 - lon / 360.0;
        let [sunrise, sunset] = sunRiseSet(d, lon, lat, alt, upperLimb);

        const sunriseStr = formatHourMinute(getHourMinute(sunrise + tzoffset));
        const sunsetStr = formatHourMinute(getHourMinute(sunset + tzoffset));

        return [sunriseStr, sunsetStr];
    }


    function getHourMinute(t) {
        //t += 0.5 / 60.0;  // add 30 seconds for correct rounding

        while (t < 0.0) t += 24.0;
        while (t >= 24.0) t -= 24.0;

        const hour = Math.floor(t);
        const minute = Math.floor(60.0 * (t - hour));

        return  { hour, minute };
    }

    function formatHourMinute({hour, minute}) {
        const dec2 = x => x < 10 ? '0' + x.toString() : x.toString();

        return dec2(hour) + ':' + dec2(minute);
    }

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
    class JDate {
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

        get dayOfYear() {
            const jbar = this.jday + 32083;
            const da   = (jbar + 1460) % 1461 + 1;
            if (da === 1461) {
                return 366; // Feb 29!
            }

            return (da + 59 + 364) % 365; // Jan 1 is doy 0
        }

        add(days) {
            return JDate.fromJulianDay(this.jday + days);
        }

        daysSince(other) {
            return this.jday - other.jday;
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

    /**
     * Returns indiction for the given year.
     */
    function getIndiction(year) {
        if (year < 313) {
            throw new Error('year is before 312AD!');
        }

        return (year - 312 + 14) % 15 + 1;
    }

    /**
     * Returns solar cycle for the given year.
     */
    function getSolarCycle(year) {
        return (year + 20 + 27) % 28 + 1;
    }

    /**
     * Returns lunar (Metonic) cycle for the given year.
     */
    function getLunarCycle(year) {
        return (year - 2 + 18) % 19 + 1;
    }

    /**
     * Given a year AD, returns the concurrent (a number from 1 to 7).
     *
     * The concurrent numbers are associated with the Slavonic вруцелѣто letters so 
     * that 1 => А, 2 => В, etc.
     */
    function getConcurrent(year) {
        const krugSolntsu = (year + 20) % 28;
        let vrutseleto = krugSolntsu + Math.floor(krugSolntsu / 4);
        vrutseleto = (vrutseleto + 6) % 7 + 1;
    	return vrutseleto;
    }

    /**
     * Given a year AD, returns the foundation (the "age of the moon" on March 1 of that year)
     */
    function getFoundation(year) {
    	const osnovanie = (((year + 1) % 19) * 11) % 30;
    	return osnovanie === 0 ? 29 : osnovanie;
    }

    /**
     * Given
     *
     * a year AD, returns the Epacta. Note that this is not the Roman Epacta (the age of the moon on January 1). 
     * Rather, this is the number that needs to be added to make the Foundation C<21> (or C<51>).
     */
    function getEpacta(year) {
        return (51 - getFoundation(year)) % 30;
    }

    /**
     * Returns Julian date of the Pascha for the given year.
     */
    function getPascha(year) {
    	// Use the Gaussian formulae to calculate the Alexandria Paschallion
    	const a = year % 4;
    	const b = year % 7;
    	const c = year % 19;
    	const d = (19 * c + 15) % 30;
    	const e = (2 * a + 4 * b - d + 34) % 7;
    	const month = Math.floor((d + e + 114) / 31);  // Month of pascha e.g. march=3
    	const day  = ((d + e + 114) % 31) + 1; // Day of pascha in the month

    	return new JDate({day: day, month: month, year: year});
    }

    const letters  = ["А", "Б", "В", "Г", "Д", "Е", "Ж", "Ѕ", "З", "И", "І", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "Ꙋ", "Ф", "Х", "Ѿ", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "Ь", "Ѣ", "Ю", "Ѫ", "Ѧ"];

    /**
     * Given a year AD, returns the Key of Boundaries, a letter indicating the structure of the year.
     */
    function getKeyOfBoundaries(year) {
        const pascha = getPascha(year);
        const boundary = new JDate({year: year, month: 3, day: 22});

        return letters[pascha.jday - boundary.jday];
    }

    /**
     * Convenience function that returns all Pascha-related information in one object.
     */
    function paschalion(year) {
        return {
            pascha: getPascha(year),
            indiction: getIndiction(year),
            solarCycle: getSolarCycle(year),
            lunarCycle: getLunarCycle(year),
            concurrent: getConcurrent(year),
            foundation: getFoundation(year),
            epacta: getEpacta(year),
            keyOfBoundaries: getKeyOfBoundaries(year),
        };
    }

    class Database {
        constructor(baseDir) {
            const expectedFile = `${baseDir}/xml/Commands/Fasting.xml`;
            if (!fs.existsSync(expectedFile)) {
                throw new Error('bad baseDir: ' + baseDir);
            }

            this.baseDir = baseDir;
        }

        findBottomUp(lang, path) {
            const parts = lang.split('/');
            for (let i = parts.length; i >= 0; i--) {
                const p = [this.baseDir, ...parts.slice(0, i), path];
                const candidate = p.join('/');

                if (fs.existsSync(candidate)) {
                    return candidate;
                }
            }

            throw new Error('Failed to locate ' + path);
        }

        * findTopDown(lang, path) {
            const parts = lang.split('/');
            for (let i = 0; i <= parts.length; i++) {
                const p = [this.baseDir, ...parts.slice(0, i), path];
                const candidate = p.join('/');

                if (fs.existsSync(candidate)) {
                    yield candidate;
                }
            }
        }

        readBottomUp(lang, path) {
            const fname = this.findBottomUp(lang, path);

            return fs.readFileSync(fname);
        }

        *readTopDown(lang, path) {
            for (const fname of this.findTopDown(lang, path)) {
                yield fs.readFileSync(fname);
            }
        }
    }

    /**
     * Use like this:
     * 
     * const result = evaluate("x+y", {x:5, y:6});
     * // 11
     */

    function evaluate(command, context) {
        const args = Object.keys(context);
        const f = Function.apply(null, [...args, 'return (' + command + ');']);

        return f.apply(null, args.map(x=>context[x]));
    }

    function assert(x, message) {
        if (!x) {
            throw new Error('Assertion failed: ' + JSON.stringify(message));
        }
    }

    /**
     * Hides parts of XML tree that do not pass expression in "Cmd" attribute.
     */
    function* scanFilter(text, context) {
        const xml = lxmlxJs.fromString(text);
        const stack = [];
        let skip = false;
        for (const e of lxmlxJs.scan(xml)) {
            if (e.type === lxmlxJs.ENTER) {
                if (skip) {
                    stack.push(false);
                    continue;
                }
                if (e.attrib.Cmd !== undefined) {
                    const take = evaluate(e.attrib.Cmd, context);
                    if (!take) {
                        skip = true;
                        stack.push(true);
                        continue;
                    }
                }
                stack.push(false);
                yield e;
            } else if (e.type === lxmlxJs.EXIT) {
                if (stack.pop()) {
                    skip = false;
                    continue;
                } else if (!skip) {
                    yield e;
                }
            } else if (!skip) {
                yield e;
            }
        }
    }

    function* parseSaints(text, source, context) {
        for (const e of scanFilter(text, context)) {
            if (e.type === lxmlxJs.ENTER) {
                assert(e.tag === 'SAINT' || e.tag === 'DAY', e);
                if (e.tag === 'SAINT') {
                    assert(e.attrib.CId !== undefined, e);
                    const tone = e.attrib.Tone === undefined ? null : evaluate(e.attrib.Tone, context);
                    yield {
                        cid: e.attrib.CId,
                        // sid: e.attrib.SId,
                        src: source,
                        menologion: e.attrib.Src || '',
                        // tone: (tone + 7) % 8 + 1,
                        type: tone,
                    };
                }
            }
        }
    }

    function* parseFastingRules(text, context) {
        for (const e of scanFilter(text, context)) {
            if (e.type === lxmlxJs.ENTER) {
                assert(e.tag === 'FASTING' || e.tag === 'PERIOD' || e.tag === 'RULE', e);
                assert(e.attrib.Tone === undefined, e);
                if (e.tag === 'RULE') {
                    yield e.attrib.Case;
                }
            }
        }
    }

    function* parseCommands(text, context) {
        for (const e of scanFilter(text, context)) {
            if (e.type === lxmlxJs.ENTER) {
                assert(e.tag === 'COMMAND' || e.tag === 'DATA', e);
                if (e.tag === 'COMMAND') {
                    yield {
                        name: e.attrib.Name,
                        value: e.attrib.Value,
                        comment: e.attrib.Comment,
                    };
                }
            }
        }
    }

    const _SERVICES = ['VESPERS', 'MATINS', 'LITURGY', 'SEXTE', 'PRIMES', 'TERCE', 'NONE'];
    function parseLife(text, context) {
        const services = [];
        const saint = {
            info: null,
            life: null,
            name: null,
            ref: null,
        };

        let readingLife = false;
        let serviceType;
        for (const [e, p] of lxmlxJs.withPeer(scanFilter(text, context))) {
            if (e.type === lxmlxJs.ENTER) {
                if (e.tag === 'NAME') {
                    if (saint.name) {
                        saint.name = { ...saint.name, ...e.attrib };
                    } else {
                        saint.name = { ...e.attrib };
                    }
                    delete saint.name.Cmd;
                } else if (e.tag === 'INFO') {
                    if (saint.info) {
                        saint.info = { ...saint.info, ...e.attrib };
                    } else {
                        saint.info = { ...e.attrib };
                    }
                } else if (e.tag === 'REF') {
                    if (e.attrib.Type === undefined) {
                        saint.ref = e.attrib.CId;
                    }
                } else if (e.tag === 'SERVICE') {
                    saint.type = e.attrib.Type || null;  // aka rank
                    context.dRank = +saint.type;
                } else if (e.tag === 'SCRIPTURE') {
                    if (serviceType !== undefined) {
                        const reading = {
                            effWeek: e.attrib.EffWeek || null,
                            pericope: e.attrib.Pericope || null,
                            reading: e.attrib.Reading,
                            type: e.attrib.Type || null,
                        };
                        for (const s of services) {
                            if (s.type === serviceType) {
                                s.readings.push(reading);
                            }
                        }
                    }
                } else if (e.tag === 'LIFE') {
                    saint.life = { ...e.attrib, Text: '' };
                    delete saint.life.Cmd;
                    readingLife = true;
                } else if (_SERVICES.includes(e.tag)) {
                    serviceType = e.tag.toLowerCase();
                    if (serviceType === 'primes') {
                        serviceType = 'prime';  // to follow Perl
                    }
                    services.push({
                        type: serviceType,
                        readings: [],
                    });
                }
            } else if (e.type === lxmlxJs.EXIT) {
                if (p.tag === 'LIFE') {
                    readingLife = false;
                } else if (_SERVICES.includes(p.tag)) {
                    serviceType = undefined;
                }
            } else if (e.type === lxmlxJs.TEXT && readingLife) {
                saint.life.Text = saint.life.Text + e.text.replace(/\r/g, "");
            }
        }

        services.forEach(s => {
            if (s.readings.length === 0) {
                delete s.readings;
            }
        });

        return [saint, services];
    }

    class Ponomar {
        constructor(baseDir, date, lang) {
            this.db = new Database(baseDir);
            this.date = date;
            this.lang = lang;

            this.init();
        }

        init() {
            const year = this.date.year;
            const thisPascha = paschalion(year).pascha;
            const nextPascha = paschalion(year + 1).pascha;
            const lastPascha = paschalion(year - 1).pascha;
            const nday = this.date.daysSince(thisPascha);
            const ndayP = this.date.daysSince(lastPascha);

            let directory;
            let filename;
            if (nday >= -70 && nday < 0) {
                directory = 'triodion';
                filename = -nday;
            } else if (nday < -70) {
                directory = 'pentecostarion';
                filename = ndayP + 1;
            } else {
                directory = 'pentecostarion';
                filename = nday + 1;
            }

            function dec2(x) {
                return x < 10 ? '0' + x : '' + x;
            }

            this.saints = [];

            const ctx = {
                dow: this.date.dayOfWeek,
                doy: this.date.dayOfYear,
                nday,
                ndayP,
                ndayF: this.date.daysSince(nextPascha),
                Year: this.date.year,
                GS: 1,
            };

            // pentacostion
            let filepath = `xml/${directory}/${dec2(filename)}.xml`;
            this.saints.push(...parseSaints(
                this.db.readBottomUp(this.lang, filepath),
                'pentecostarion',
                ctx,
            ));

            assert(this.saints.length > 0);
            this.tone = this.saints.reduce((total,x)=>x.type !== null ? +x.type : total, 0);
            if (this.tone === 0) {
                this.tone = 8;
            }
            // assert(this.tone > 0);  // -1 is a valid tone ? weird -MK

            // menaion
            filepath = `xml/${dec2(this.date.month)}/${dec2(this.date.day)}.xml`;
            this.saints.push(...parseSaints(
                this.db.readBottomUp(this.lang, filepath),
                'menaion',
                ctx,
            ));

            // read lives into saint object
            this.saints.forEach(saint => {
                saint.info = null;
                saint.life = null;
                saint.name = null;
                saint.ref  = null;

                for (const text of this.db.readTopDown(this.lang, `xml/lives/${saint.cid}.xml`)) {
                    const [s, svc] = parseLife(text, {...ctx, dRank: +saint.type});
                    for (const key of Object.keys(s)) {
                        if (key === 'name' || key === 'info') {
                            if (s[key] !== null) {
                                if (saint[key]) {
                                    saint[key] = { ...saint[key], ...s[key] };
                                } else {
                                    saint[key] = s[key];
                                }
                            }
                        } else {
                            saint[key] = s[key];
                        }
                        if (s[key] !== null) {
                            if ((key === 'name' || key === 'info') && saint[key]) {
                                saint[key] = {...saint[key], ...s[key]};
                            } else {
                                saint[key] = s[key];
                            }
                        }
                    }
                    if (svc.length > 0) {
                        if (saint.services === undefined) {
                            saint.services = svc;
                        } else {
                            saint.services.push(...svc);
                        }
                    }
                }
            });

            this.dayRank = this.saints.reduce((tot, x) => {
                if (x.type === null) return tot;
                return Math.max(tot, +x.type);
            }, -1);
            ctx.dRank = this.dayRank;

            const fasting = [];
            for (const text of this.db.readTopDown(this.lang, 'xml/Commands/Fasting.xml')) {
                fasting.push(...parseFastingRules(text, ctx));
            }
            this.fastingCode = fasting[fasting.length-1];

            this.commands = [];
            const haveLiturgy = this.saints.reduce((total, saint) => {
                if (total) return true;
                if (saint.services !== undefined) {
                    for (const service of saint.services) {
                        if (service.type === 'liturgy') return true;
                    }
                }
                return false;
            }, false);

            if (haveLiturgy) {
                // load commands
                this.commands.push(...parseCommands(
                    this.db.readBottomUp(this.lang, 'xml/Commands/DivineLiturgy.xml'), ctx)
                );
            }
        }

        execCommand(rank) {
            this.saints.forEach(saint => {
                if (saint.src === 'pentecostarion' && (
                    (+saint.cid >= 9000 && +saint.cid <= 9315) ||
                    (+saint.cid >= 9849 && +saint.cid <= 9900)
                )) {
                    saint.services.forEach(service => this._execCommand(service, rank));
                }
            });
        }

        get dRank() {
            return this.saints.reduce( (total, saint) => {
                if (saint.src !== 'menaion') return total;
                if (saint.type === null) return total;
                if (+saint.type > total) return +saint.type;
                return total;
            }, -1);
        }

        _any(name, ctx) {
            for (const cmd of this.commands) {
                if (cmd.name === name && evaluate(cmd.value, ctx)) {
                    return true;
                }
            }
            return false;
        }

        _execCommand(service, rank) {
            if (service.type !== 'liturgy' || service.readings === undefined) {
                return;
            }

            const thisPascha = paschalion(this.date.year).pascha;
            const nextPascha = paschalion(this.date.year + 1).pascha;
            const lastPascha = paschalion(this.date.year - 1).pascha;
            const todayCtx = {
                dRank: rank,
                dow: this.date.dayOfWeek,
                doy: this.date.dayOfYear,
                nday: this.date.daysSince(thisPascha),
                ndayP: this.date.daysSince(lastPascha),
                ndayF: this.date.daysSince(nextPascha),
            };

            // step 0. first check if transfer is implemented
            // transfer is not implemented during the Pentecostarion / Lenten Triodion periods
            // (this information is coded in DivineLiturgy.xml)
            // or the user may override transfer by calling addCommands('Transfer', 0)
            for (const cmd of this.commands) {
                if (cmd.name === 'Transfer' && !evaluate(cmd.value, todayCtx)) {
                    return;
                }
            }

            // step 1. Check if readings today are suppressed or transferred
            for (const cmd of this.commands) {
                if (evaluate(cmd.value, todayCtx) &&
                        (cmd.name === 'Suppress' || cmd.name === 'Class3Transfers')) {
                    // TODO: we have to figure out if today has Menaion readings.
                    // if (grep { $_ -> hasReadings() } map { $_ -> getServices('liturgy') } $self -> { parent } -> { ponomar } -> getSaints('menaion')) {
                    delete service.readings;
                    return;
                }
            }

            const needTomorrow = this._any('TransferRulesB', todayCtx);
            if (needTomorrow) {
                const tomorrow = this.date.add(1);
                const tomorrowPonomar = new Ponomar(this.db.baseDir, tomorrow, this.lang);
                const tomorrowCtx = {
                    dRank: tomorrowPonomar.dRank,
                    dow: tomorrow.dayOfWeek,
                    doy: tomorrow.dayOfYear,
                    nday: tomorrow.daysSince(thisPascha),
                    ndayP: tomorrow.daysSince(lastPascha),
                    ndayF: tomorrow.daysSince(nextPascha),
                    GS: 1,
                };

                const haveTomorrow = this._any('Class3Transfers', tomorrowCtx);
                if (haveTomorrow) {
                    tomorrowPonomar.saints.filter(
                            s=>s.src==='pentecostarion' && s.services !== undefined).forEach(s => {
                        s.services.forEach(svc => {
                            if (svc.type === 'liturgy') {
                                service.readings.push(...svc.readings);
                            }
                        });
                    });
                }
            }

            const needYesterday = this._any('TransferRulesF', todayCtx);
            if (needYesterday) {
                const yesterday = this.date.add(-1);
                const yesterdayPonomar = new Ponomar(this.db.baseDir, yesterday, this.lang);
                const yesterdayCtx = {
                    dRank: yesterdayPonomar.dRank,
                    dow: yesterday.dayOfWeek,
                    doy: yesterday.dayOfYear,
                    nday: yesterday.daysSince(thisPascha),
                    ndayP: yesterday.daysSince(lastPascha),
                    ndayF: yesterday.daysSince(nextPascha),
                    GS: 1,
                };

                const haveYesterday = this._any('Class3Transfers', yesterdayCtx);
                if (haveYesterday) {
                    yesterdayPonomar.saints.filter(
                            s => s.src === 'pentecostarion' && s.services !== undefined).forEach(s => {
                        s.services.forEach(svc => {
                            if (svc.type === 'liturgy') {
                                service.readings.push(...svc.readings);
                            }
                        });
                    });
                }
            }
        }
    }

    exports.JDate = JDate;
    exports.Ponomar = Ponomar;
    exports.paschalion = paschalion;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
