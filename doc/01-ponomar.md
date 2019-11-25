# Ponomar object

Properties:

1. `saints` - an array of Saint/Commemoration objects, see [./02-saint.md].
2. `tone` - a number indicating current day's Tone (1..8).
3. `dayRank` - rank of this day - the `max` of the ranks of each saint.
4. `fastingCode` - fastings instruction as a cryptic bit-mapped code.
5. `commands` - internal (initialized only if there are liturgy readings this day).