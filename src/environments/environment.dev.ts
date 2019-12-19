
let _package = require('../../package.json');
import { apiKeys } from './apiKeyMaps';

export const environment = {
  production: true,
  environmentName: 'development',
  WS: '//localhost:3002',
  API: '//localhost:3002/api',
  APIStatusCheck: false,
  version: _package.version,
  MAPS_KEY: apiKeys.develop
};
