
let _package = require('../../package.json');
import { apiKeys } from './apiKeyMaps';

export const environment = {
  production: true,
  environmentName: 'development',
  WS: 'http://localhost:3002',
  API: 'http://localhost:3002/api',
  APIStatusCheck: false,
  version: _package.version,
  MAPS_KEY: apiKeys.develop
};
