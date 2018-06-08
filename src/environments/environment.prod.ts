let _package = require('../../package.json');

export const environment = {
  production: true,
  environmentName: 'produccion',
  API: '/api',
  APIStatusCheck: true,
  version: _package.version
};
