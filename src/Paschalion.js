import JDate from './JDate.js';

/**
 * Returns indiction for the given year.
 */
export function getIndiction(year) {
    if (year < 313) {
        throw new Error('year is before 312AD!');
    }

    return (year - 312 + 14) % 15 + 1;
}

/**
 * Returns solar cycle for the given year.
 */
export function getSolarCycle(year) {
    return (year + 20 + 27) % 28 + 1;
}

/**
 * Returns lunar (Metonic) cycle for the given year.
 */
export function getLunarCycle(year) {
    return (year - 2 + 18) % 19 + 1;
}

/**
 * Given a year AD, returns the concurrent (a number from 1 to 7).
 *
 * The concurrent numbers are associated with the Slavonic вруцелѣто letters so 
 * that 1 => А, 2 => В, etc.
 */
export function getConcurrent(year) {
    const krugSolntsu = (year + 20) % 28;
    let vrutseleto = krugSolntsu + Math.floor(krugSolntsu / 4);
    vrutseleto = (vrutseleto + 6) % 7 + 1;
	return vrutseleto;
}

/**
 * Given a year AD, returns the foundation (the "age of the moon" on March 1 of that year)
 */
export function getFoundation(year) {
	const osnovanie = (((year + 1) % 19) * 11) % 30;
	return osnovanie === 0 ? 29 : osnovanie;
}

/**
 * Given
 *
 * a year AD, returns the Epacta. Note that this is not the Roman Epacta (the age of the moon on January 1). 
 * Rather, this is the number that needs to be added to make the Foundation C<21> (or C<51>).
 */
export function getEpacta(year) {
    return (51 - getFoundation(year)) % 30;
}

/**
 * Returns Julian date of the Pascha for the given year.
 */
export function getPascha(year) {
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
export function getKeyOfBoundaries(year) {
    const pascha = getPascha(year);
    const boundary = new JDate({year: year, month: 3, day: 22});

    return letters[pascha.jday - boundary.jday];
}

/**
 * Convenience function that returns all Pascha-related information in one object.
 */
export default function paschalion(year) {
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