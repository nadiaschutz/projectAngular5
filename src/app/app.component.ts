import { Component } from '@angular/core';
import { OAuthService, AuthConfig, JwksValidationHandler } from 'angular-oauth2-oidc';
import { environment } from '../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'nohis';
  constructor(private oauthService: OAuthService,
    private router: Router) {

    this.configureWithNewConfigApi();

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
