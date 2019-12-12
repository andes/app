const _package = require('../../package.json');
import { apiKeys, hotjar } from './apiKeyMaps';

export const environment = {
    production: false,
    environmentName: 'testing',
    API: '/api',
    WS: '/',
    APIStatusCheck: true,
    version: _package.version,
    MAPS_KEY: apiKeys.develop,
    HOTJAR_KEY: hotjar.key
};
