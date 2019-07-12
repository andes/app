const webpack = require('webpack');
const pkg = require('./package.json');

module.exports = (config, options) => {
    // config.plugins.push(
    //     new webpack.DefinePlugin({
    //         'APP_VERSION': JSON.stringify(pkg.version),
    //     }),
    // );
    const TARGET = process.env.APP_TARGET || null;
    if (TARGET) {
        config.resolve.extensions = [
            '.' + TARGET.toLocaleLowerCase() + '.ts',
            ...config.resolve.extensions,
        ];
    }

    return config;
};