module.exports = (config, options) => {
    const TARGET = process.env.APP_TARGET || null;
    if (TARGET) {
        config.resolve.extensions = [
            '.' + TARGET.toLocaleLowerCase() + '.ts',
            ...config.resolve.extensions,
        ];
    }
    config.resolve.extensions.push('.mjs');
    config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
    });
    return config;
};
