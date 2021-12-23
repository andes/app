module.exports = {
    packages: {
        '@angular/core': {
            ignorableDeepImportMatchers: [
                /rxjs/,
            ]
        },
        '@digitalascetic/ngx-pica': {
            ignorableDeepImportMatchers: [
                /rxjs/,
            ]
        },
    },
};