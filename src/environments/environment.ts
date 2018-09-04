// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  base_href: '',
  domain: 'http://localhost:4200',
  issuer: 'https://try.smilecdr.com:9200',
  queryURI: 'https://try.smilecdr.com:8000',
  logoutURI: 'https://try.smilecdr.com:9200',
  redirectUri: 'http://localhost:4200',
  clientId: 'moh_dhdr_test',
  scope: 'launch/patient openid patient/*.read profile',

};

/*
 * In development mode, for easier debugging, you can ignore zone related error
 * stack frames such as `zone.run`/`zoneDelegate.invokeTask` by importing the
 * below file. Don't forget to comment it out in production mode
 * because it will have a performance impact when errors are thrown
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
