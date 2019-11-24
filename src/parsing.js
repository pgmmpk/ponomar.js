import { fromString, scan, withPeer, ENTER, EXIT, TEXT } from '@innodatalabs/lxmlx-js';
import evaluate from './evaluate.js';
import assert from './assert.js';

/**
 * Hides parts of XML tree that do not pass expression in "Cmd" attribute.
 */
export function* scanFilter(text, context) {
    const xml = fromString(text);
    const stack = [];
    let skip = false;
    for (const e of scan(xml)) {
        if (e.type === ENTER) {
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
        } else if (e.type === EXIT) {
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

export function* parseSaints(text, source, context) {
    const stack = [];
    let skip = 0;
    for (const e of scanFilter(text, context)) {
        if (e.type === ENTER) {
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

export function* parseFastingRules(text, context) {
    for (const e of scanFilter(text, context)) {
        if (e.type === ENTER) {
            assert(e.tag === 'FASTING' || e.tag === 'PERIOD' || e.tag === 'RULE', e);
            assert(e.attrib.Tone === undefined, e);
            if (e.tag === 'RULE') {
                yield e.attrib.Case;
            }
        }
    }
}

export function* parseCommands(text, context) {
    for (const e of scanFilter(text, context)) {
        if (e.type === ENTER) {
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
export function parseLife(text, context) {
    const services = [];
    const saint = {
        info: null,
        life: null,
        name: null,
        ref: null,
    };

    let readingLife = false;
    let serviceType;
    for (const [e, p] of withPeer(scanFilter(text, context))) {
        if (e.type === ENTER) {
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
        } else if (e.type === EXIT) {
            if (p.tag === 'LIFE') {
                readingLife = false;
            } else if (_SERVICES.includes(p.tag)) {
                serviceType = undefined;
            }
        } else if (e.type === TEXT && readingLife) {
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