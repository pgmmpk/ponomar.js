# ponomar.js
[![Actions Status](https://github.com/pgmmpk/ponomar.js/workflows/Node%20CI/badge.svg)](https://github.com/pgmmpk/ponomar.js/actions)

JS libraries to compute liturgical readings.

Includes usefult tools:

- sunrise/sunset computation
- Julian/Gregorian date convertion
- Ponomar api to load day's commemorations and liturgical readings

## Building

If you checked out this repository without the `--recursive` flag, you need to
fetch ponomar data sub-module with:
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

1. Run Ponomar's `Dump.pm` tool to dump PERL Ponomar output for each day and each language. This creates
   a number of JSON files.
    ```
    mkdir dump
    PONOMAR_DB=ponomar/Ponomar/languages perl -I../perl-ponomar-api/lib \
        Dump.pm 1/1/2019 1/1/2020 dump/2019
    PONOMAR_DB=ponomar/Ponomar/languages perl -I../perl-ponomar-api/lib \
        Dump.pm 1/1/2020 1/1/2021 dump/2020
    PONOMAR_DB=ponomar/Ponomar/languages perl -I../perl-ponomar-api/lib \
        Dump.pm 1/1/2021 1/1/2022 dump/2021
    PONOMAR_DB=ponomar/Ponomar/languages perl -I../perl-ponomar-api/lib \
        Dump.pm 1/1/2022 1/1/2023 dump/2022
    PONOMAR_DB=ponomar/Ponomar/languages perl -I../perl-ponomar-api/lib \
        Dump.pm 1/1/2023 1/1/2024 dump/2023
    ```
2. Set an environment variable `PONOMAR_DUMP` that points to the root directory containing these
   JSON files. Optional (by default will use `ponomar/Ponomar/languages`)
3. Run `make strss` (not a typo) to make this code repeat the same computaions in 
   JavaScript and compare the result with the dumped JSON files.
    ```
    make strss
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
* longitude
* latitude
* local time offset from UTC (in hours)

For example, to compute sunrize and sunset time in NYC on November 14 2019 (Gregorian),
we need the following:
* `JDate.fromGregorian({year: 2019, month: 11, day: 14})` - the date
* `-74.02` - the longitude
* `40.72` - the latitude
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
3. Database object, representing Ponomar data files (see more below)

```js
import { Ponomar, JDate, DatabaseFs } from 'Ponomar';

const db = new DatabaseFs('ponomar/Ponomar/languages').lang('en');
const today = new JDate();
const ponomar = new Ponomar(db, today);

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

#### Ponomar Database objects

`Database` object represents liturgical data (Triodion, Pentecostarion, Menaion, etc.).
It is an abstract class, that uses data access `Engine` to actually access data. There are
several implementations of `Database` class.

1. `DatabaseFs` - reads data from disk (can only be used with `node` programs as file
   access is not available in browsers)
   ```js
   const db = new DatabaseFs('ponomar/Ponomar/languages');
   ```

2. `DatabaseHttp` - reads data (in JSON format) from a URL
   ```js
   const db = await DatabaseHttl.load('https://ponomar.net/db.json');
   ```
   Note that we load asynchronously.
