// This is the configuration file for babel
/* eslint-env node */
module.exports = {
    presets: [
        '@babel/preset-env',
        ['@babel/preset-react', { runtime: 'classic' }],
        '@babel/preset-typescript',
    ],
    plugins: [
        ['babel-plugin-polyfill-corejs3', {
            method: 'usage-global',
            version: require('core-js/package.json').version,
        }],
    ],
};
