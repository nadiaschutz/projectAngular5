// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  base_href: '',
  domain: 'http://localhost:4200',
  issuer: 'https://bcip.smilecdr.com/smartauth',
  loginUrl: 'http://localhost:4200',
  queryURI: 'https://bcip.smilecdr.com/fhir-request',
  logoutURI: 'https://bcip.smilecdr.com/smartauth',
  redirectUri: 'http://localhost:4200',
  clientId: 'NOHIS',
  scope: 'launch/patient openid profile cdr_all_user_authorities',
  scopeUrl: 'launch%2Fpatient%20openid%20profile%20cdr_all_user_authorities',
  loginLink: 'https://bcip.smilecdr.com/smartauth/oauth/token',
  jsonAPI: 'https://bcip.smilecdr.com/json-admin'
};

/*
 * In development mode, for easier debugging, you can ignore zone related error
 * stack frames such as `zone.run`/`zoneDelegate.invokeTask` by importing the
 * below file. Don't forget to comment it out in production mode
 * because it will have a performance impact when errors are thrown
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
