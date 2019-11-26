export default {
    input: 'src/index.js',
    output: {
        name: 'ponomar',
        file: 'build/index.js',
        format: 'umd',
        sourcemap: true,
        globals: {
            '@innodatalabs/lxmlx-js': 'lxmlx',
            'fs': 'fs',
        }
    },
    external: ['fs', '@innodatalabs/lxmlx-js'], // tells Rollup 'I know what I'm doing here'
};
