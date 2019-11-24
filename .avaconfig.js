const { JSDOM } = require('jsdom');
const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
global.DOMParser = dom.window.DOMParser;
global.document = dom.window.document;
global.XMLSerializer = dom.window.XMLSerializer;

const hooks = require('require-extension-hooks');

// Setup js files to be processed by `require-extension-hooks-babel`
hooks('js').exclude(({filename}) => filename.match(/\/node_modules\//)).plugin('babel').push();

