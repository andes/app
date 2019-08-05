module.exports = (config, options) => {
    const TARGET = process.env.APP_TARGET || null;
    if (TARGET) {
        config.resolve.extensions = [
            '.' + TARGET.toLocaleLowerCase() + '.ts',
            ...config.resolve.extensions,
        ];
    }

    return config;
};