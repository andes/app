
let _package = require('../../package.json');
import { apiKeys } from './apiKeyMaps';

export const environment = {
  production: false,
  environmentName: 'development',
  API: '//localhost:3002/api',
  APIStatusCheck: false,
  version: _package.version,
  MAPS_KEY: apiKeys.develop
};
