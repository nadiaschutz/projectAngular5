import { Component } from '@angular/core';
import {
  OAuthService,
} from 'angular-oauth2-oidc';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'NOHIS';
  sessionObject;
  showNavBars = false;

  constructor(private oauthService: OAuthService, private router: Router) {
    this.configureWithNewConfigApi();
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
    this.oauthService.loadDiscoveryDocument();
  }
}
