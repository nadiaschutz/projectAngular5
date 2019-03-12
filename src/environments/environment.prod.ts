export const environment = {
  production: true,
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
