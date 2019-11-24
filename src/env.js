export default function(name, message) {
    const v = process.env[name];
    if (v === undefined) {
        throw new Error(`Environment valiable ${name} not set: ${message}`)
    }
    return v;
}
