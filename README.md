# ponomar.js
JS libraries to compute liturgical readings.

Includes usefult tools:

- sunrise/sunset computation
- Julian/Gregorian date convertion

## Building

```bash
npm i
make
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