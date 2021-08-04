const _package = require('../../package.json');
import { analytics, apiKeys, captcha, hotjar, password_recovery } from './apiKeyMaps';

export const environment = {
  production: false,
  environmentName: 'development',
  API: '//localhost:3002/api',
  WS: '//localhost:3002',
  APIStatusCheck: false,
  version: _package.version,
  MAPS_KEY: apiKeys.develop,
  HOTJAR_KEY: hotjar.key,
  ANALYTICS_KEY: analytics.key,
  PASSWORD_RECOVER: password_recovery.key,
  SITE_KEY: captcha.key
};
