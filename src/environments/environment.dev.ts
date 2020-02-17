const _package = require('../../package.json');
import { apiKeys, hotjar } from './apiKeyMaps';

export const environment = {
  production: false,
  environmentName: 'development',
  API: '//localhost:3002/api',
  WS: '//localhost:3002',
  APIStatusCheck: false,
  version: _package.version,
  MAPS_KEY: apiKeys.develop,
  HOTJAR_KEY: hotjar.key
};
