import { Component } from '@angular/core';
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
export class AppComponent {

  title = 'nohis';
  sessionObject;
  showNavBars = false;

  constructor(
    private oauthService: OAuthService,
    private router: Router
  ) {

    this.configureWithNewConfigApi();
    this.oauthService.loadDiscoveryDocument();
    this.router.events.subscribe(() => {
      if (this.oauthService.hasValidAccessToken()) {
        this.showNavBars = true;
      } else {
        this.showNavBars = false;
      }
    });
  }

  returnTokenStatus() {
    return this.oauthService.hasValidAccessToken();
  }

  onActivate(event) {
    window.scroll(0, 0);
  }
  private configureWithNewConfigApi() {
    this.oauthService.redirectUri = environment.redirectUri;
    this.oauthService.clientId = environment.clientId;
    this.oauthService.scope = environment.scope;
    this.oauthService.oidc = false;
    this.oauthService.issuer = environment.issuer;
  }
}
