const _package = require('../../package.json');
import { apiKeys, hotjar, analytics } from './apiKeyMaps';

export const environment = {
    production: false,
    environmentName: 'demo',
    API: '/api',
    WS: '/',
    APIStatusCheck: true,
    version: _package.version,
    MAPS_KEY: apiKeys.develop,
    HOTJAR_KEY: hotjar.key,
    ANALYTICS_KEY: analytics.key,
};
