import paschalion from './Paschalion.js';
import Database from './Database.js';
import evaluate from './evaluate.js';
import assert from './assert.js';
import { parseCommands, parseFastingRules, parseSaints, parseLife } from './parsing.js';

export default class Ponomar {
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
