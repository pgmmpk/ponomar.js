/**
 * Use like this:
 * 
 * const result = evaluate("x+y", {x:5, y:6});
 * // 11
 */

export default function evaluate(command, context) {
    const args = Object.keys(context);
    const f = Function.apply(null, [...args, 'return (' + command + ');']);

    return f.apply(null, args.map(x=>context[x]));
}