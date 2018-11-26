import { Component, OnInit } from '@angular/core';
import {OAuthService} from 'angular-oauth2-oidc';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(
      private oauthService: OAuthService,
  ) { }

  ngOnInit() {
  }
    logout() {
        this.oauthService.logOut();
    }
}
