
let _package = require('../../package.json');
import { apiKeys } from './apiKeyMaps';

export const environment = {
  production: false,
  environmentName: 'development',
  WS: '//localhost:3002',
  API: 'https://demo.andes.gob.ar/api',
  APIStatusCheck: false,
  version: _package.version,
  MAPS_KEY: apiKeys.develop
};
