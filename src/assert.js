export default function(x, message) {
    if (!x) {
        throw new Error('Assertion failed: ' + JSON.stringify(message));
    }
}