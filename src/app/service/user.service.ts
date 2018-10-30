import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';

import { environment } from '../../environments/environment';
import {Router} from '@angular/router';

@Injectable()
export class UserService {

  constructor(private httpClient: HttpClient, private oauthService: OAuthService, private router: Router
  ) { }


  // TODO Move all calls to FHIR resources into fhir.service.ts

  createUserAccount(type: string) {

  }

  logout() {

    // Uses the OAuthService library to revoke token and log the user out
    this.oauthService.logOut();
    // if (!this.oauthService.hasValidAccessToken()) {
    //     this.router.navigate(['/']);
    // }

    // const header = this.getHeaders();

      // this.httpClient.post(environment.logoutURI + '/logout?cb=none&revoke=token', {}, { headers: header, withCredentials: true })
    //   .subscribe(item => {
    //     console.log(item);
    //   }, err => {
    //     console.log(err);
    //   });
  }

  login(user: string, pass: string) {

       // Get headers for the login portion of the site
      const header = this.getLoginHeaders();

      // Posts a body containing the call for The “Resource Owner Password Credentials” Flow
      // This takes three inputs, a username and password, and a header.
      // scopeURL is an environment variable that a user sets, containing scopes that are relevant
      // to the user & use case.
      this.httpClient.post(environment.loginLink,
        'grant_type=password&client_id=' + user
        + '&username=admin&password=' + pass
        + '&redirect_uri=https://nohis.smilecdr.com&scope=' + environment.scopeUrl,
          {headers: header});
      this.oauthService.fetchTokenUsingPasswordFlow(user, pass, header);


  }

  // Initialize headers for the login section
  getLoginHeaders(): HttpHeaders {
        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded ',
            'Accept': 'application/json'
        });
        return headers;
    }

    getHeaders(): HttpHeaders {
        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded ',
            'Accept': 'application/json'
        });
        return headers;
    }

    // TODO - check if function is in use, and delete if not being used
  postFHIRHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken()

      // 'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      // 'Access-Control-Allow-Origin': '*'
    });
    return headers;
  }
}
