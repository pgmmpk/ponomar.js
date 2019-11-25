# ponomar.js
[![Actions Status](https://github.com/pgmmpk/ponomar.js/workflows/.github/workflows/nodejs.yml/badge.svg)](https://github.com/pgmmpk/ponomar.js/actions)

JS libraries to compute liturgical readings.

Includes usefult tools:

- sunrise/sunset computation
- Julian/Gregorian date convertion
- Ponomar api to load day's commemorations and liturgical readings

## Building

If you checket out withor `--recursive` flag, you need to fetch ponomar data sub-module with:
```
git submodule update --init --recursive
```

Then, lint, test, and build:
```bash
npm i
make
```

### Stress testing
Stress does comparison with legacy PERL Ponomar software. Steps are:

1. Run Ponomar's `Dump.pm` tool to dump Ponomar output for each day and each language. This creates
   a number of JSON files.
    ```
    mkdir dump
    PONOMAR_DB=ponomar/Ponomar/languages perl -I../perl-ponomar-api/lib \
        Dump.pm 1/1/2019 4/1/2019 dump/201901
    PONOMAR_DB=ponomar/Ponomar/languages perl -I../perl-ponomar-api/lib \
        Dump.pm 4/1/2019 7/1/2019 dump/201904
    PONOMAR_DB=ponomar/Ponomar/languages perl -I../perl-ponomar-api/lib \
        Dump.pm 7/1/2019 10/1/2019 dump/201907
    PONOMAR_DB=ponomar/Ponomar/languages perl -I../perl-ponomar-api/lib \
        Dump.pm 10/1/2019 1/1/2020 dump/201910
    ```
2. Set an environment variable `PONOMAR_DUMP` that points to the root directory containing these
   JSON files.
3. Run `make stress` to make this code repeat the same compuations in JavaScript and comapre
   the result with the dumped JSON files.
    ```
    PONOMAR_DB=ponomar/Ponomar/languages \
    PONOMAR_DUMP=dump \
    make stress
    ```

## Using

### Julian date to Gregorian date
```js
import { JDate } from 'ponomar';

const jdate = new JDate({year: 2019, month: 11, day: 14});
const gdate = jdate.toGregorian();  // convert to Gregorian calendar
// { year: 2019, month: 11, day: 1 }
```

### Gregorian date to Julian date
```js
const jdate = JDate.fromGregorian({year: 2019, month: 11, day: 1});
// { year: 2019, month: 11, day: 14 }
```

### Sunrise and Sunset at a given location

Input required:
* Julian date (year, month, day)
* longtitude
* lattitude
* local time offset from UTC (in hours)

For example, to compute sunrize and sunset time in NYC on November 14 2019 (Gregorian),
we need the following:
* `JDate.fromGregorian({year: 2019, month: 11, day: 14})` - the date
* `-74.02` - the longtitude
* `40.72` - the lattitude
* `-5.0` - offset between local time and Greenwich time

Putting all this together:
```js
const jdate = JDate.fromGregorian({year: 2019, month: 11, day: 14});
const [sunrise, sunset] = jdate.getSunriseSunset(-74.02, 40.72, {tzoffset: -5.0})
// 06:41 16:39
```

### Computing Pascha

```js
import { paschalion } from 'ponomar';

const year = 2016;
const info = paschalion(year);
console.log(info.pascha);          // Julian date of Pascha
console.log(info.indiction);       // Indiction of this year
console.log(info.solarCycle);      // Solar cycle
console.log(info.lunarCycle);      // Lunar cycle
console.log(info.concurrent);      // concurrent
console.log(info.foundation);      // foundation
console.log(info.epacta);          // epacta
console.log(info.keyOfBoundaries)  // slavonic key of this year
```

### Ponomar API

To use `Ponomar` API one needs:
1. Date (a JDate object)
2. Language (suported languages: `cu`, `cu/ru`, `en`, `fr`, `el`, `zh/Hans`, `zh/Hant`)
3. Location of the Ponomar database

```js
import { Ponomar, JDate } from 'Ponomar';

const today = new JDate();
const ponomar = new Ponomar('ponomar/Ponomar/languages', today, 'en');

console.log(ponomar.tone);
// 8
ponomar.saints.forEach(saint => {
    console.log(saint.name, saint.info);
    saint.services.forEach(service => {
        console.log('\t', service.type);
        service.readings.forEach(reading => {
            console.log(reading.reading, reading.pericope);
        });
        const iconUrl = service.icons;
    });
});
```
