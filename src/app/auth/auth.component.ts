import { Component, OnInit } from '@angular/core';
//  trigger, style, state, transition, animate
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  constructor(private oauthService: OAuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.fragment.subscribe(params => {
      if (params) {
        const patient = this.getQueryVariable(params, 'patient');
        sessionStorage.setItem('patient', patient);
      }
    });
  }

  goToIndex() {
    this.router.navigate(['/dashboard']);
  }

  login() {
    this.oauthService.initImplicitFlow('/dashboard');

    if (navigator.onLine) {
      this.oauthService.initImplicitFlow('/dashboard');
    } else {
      alert('Not connected to Internet.');
    }
  }

  logout() {
    this.oauthService.logOut();
  }

  get givenName() {
    const claims = this.oauthService.getIdentityClaims();
    if (!claims) {
      return null;
    }
    return claims['name'];
  }

  getQueryVariable(query, variable) {
    const vars = query.split('&');

    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) === variable) {
        return decodeURIComponent(pair[1]);
      }
    }

    return null;
  }



}
