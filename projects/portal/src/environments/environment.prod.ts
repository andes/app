import { captcha } from '../../../../src/environments/apiKeyMaps';

export const environment = {
  production: true,
  API: '/api',
  APIStatusCheck: false,
  SITE_KEY: captcha.key
};
