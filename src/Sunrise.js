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


export function sunRiseSet(d, lon, lat, altit, upperLimb) {
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

export const ALT_DEFAULT = -35/60;
export const ALT_CIVIL   = -6.0;
export const ALT_NAUTICAL= -12.0;
export const ALT_AMATEUR = -15.0;
export const ALT_ASTRONOMICAL = -18.0;

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

export function getSunriseSunset(jday, lon, lat, options) {
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
