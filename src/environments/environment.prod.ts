let _package = require('../../package.json');
import { apiKeys } from './apiKeyMaps';

export const environment = {
  production: true,
  environmentName: 'produccion',
  API: '/api',
  WS: '/',
  APIStatusCheck: true,
  version: _package.version,
  MAPS_KEY: apiKeys.produccion
};
