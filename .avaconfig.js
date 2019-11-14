const hooks = require('require-extension-hooks');

// Setup js files to be processed by `require-extension-hooks-babel`
hooks('js').exclude(({filename}) => filename.match(/\/node_modules\//)).plugin('babel').push();

