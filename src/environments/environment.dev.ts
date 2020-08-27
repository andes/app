const _package = require('../../package.json');
import { apiKeys, analytics, hotjar } from './apiKeyMaps';

export const environment = {
  production: false,
  environmentName: 'development',
  API: 'https://demo.andes.gob.ar/api',
  WS: '//localhost:3002',
  APIStatusCheck: false,
  version: _package.version,
  MAPS_KEY: apiKeys.develop,
  HOTJAR_KEY: hotjar.key,
  ANALYTICS_KEY: analytics.key,
};
