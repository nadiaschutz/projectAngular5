import { Component, OnInit } from '@angular/core';
import { OAuthService, AuthConfig, JwksValidationHandler } from 'angular-oauth2-oidc';
import { environment } from '../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { PatientService } from './service/patient.service';
import { UserService } from './service/user.service';

import * as Dependent from './interface/patient';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'nohis';

  sessionObject;

  constructor(private oauthService: OAuthService,
    private userService: UserService,
    private patientService: PatientService,
    private router: Router) {

    // this.configureWithNewConfigApi();
    this.oauthService.configure({
      loginUrl: 'http://localhost:4200',
      issuer: 'https://bcip.smilecdr.com/smartauth',
      clientId: 'NOHIS',
      // redirectUri: 'https://nohis.smilecdr.com/dashboard',
      redirectUri: 'http://localhost:4200/dashboard',
      scope: 'launch/patient openid patient/*.read patient/*.write profile'
    });
    this.oauthService.loadDiscoveryDocumentAndTryLogin();

  }

  returnTokenStatus() {
    return this.oauthService.hasValidAccessToken();
  }

  ngOnInit() {

  }

  private configureWithNewConfigApi() {
    this.oauthService.redirectUri = environment.redirectUri;
    this.oauthService.clientId = environment.clientId;
    this.oauthService.scope = environment.scope;
    this.oauthService.oidc = true;
    this.oauthService.issuer = environment.issuer;
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();

    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }
}
