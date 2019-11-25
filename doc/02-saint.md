# Saint object

Properties:

1. `cid` - a unique id of this saint (string).
2. `ref` - ? (optional)
3. `src` - set to `pentecostarion` if saint comes from Paschal cycle (e.g. Triodion). Or set to `mineon`
           if saint info comes from Minea.
4. `type` - the rank of this saint/commemoration, integer (0...6)
5. `name` - optional. An object representing the name (Nomonative, Generative, Short).
6. `info` - optional. Other information about this saint (ReposeDate, etc).
7. `life` - optional. Text of the saint's life.
8. `services` - list of Service objects. See [03-service.md].

