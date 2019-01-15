import { Component, OnInit } from '@angular/core';
import { OAuthService, AuthConfig, JwksValidationHandler } from 'angular-oauth2-oidc';
import { environment } from '../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { PatientService } from './service/patient.service';
import { UserService } from './service/user.service';

import * as Dependent from './interface/patient';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'nohis';
  sessionObject;
  showNavBars = false;

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
      scope: 'openid profile cdr_all_user_authorities',
      oidc: false
    });
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
    this.router.events.subscribe(() => {
      if (this.oauthService.getAccessToken()) {
        this.showNavBars = true;
      } else {
        this.showNavBars = false;
      }
    });
  }

  returnTokenStatus() {
    return this.oauthService.hasValidAccessToken();
  }

  ngOnInit() {

  }

  onActivate(event) {
    window.scroll(0, 0);
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
