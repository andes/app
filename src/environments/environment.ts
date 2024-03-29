// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

const _package = require('../../package.json');

export const environment = {
    production: false,
    environmentName: 'development',
    API: '//localhost:3002/api',
    WS: '//localhost:3002', // para websocket
    APIStatusCheck: false,
    version: _package.version,
    MAPS_KEY: '',
    HOTJAR_KEY: '',
    ANALYTICS_KEY: '',
    PASSWORD_RECOVER: '',
    SITE_KEY: ''
};
