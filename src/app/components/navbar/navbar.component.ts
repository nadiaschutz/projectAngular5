import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { UserService } from '../../service/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  constructor(
    private oauthService: OAuthService,
    private userService: UserService,
    private router: Router
  ) {}

  userID;
  hasLoggedIn ;
  ngOnInit() {

    this.hasLoggedIn = false;

    this.userService.subscribeUserNameData().subscribe (
      data => {
        if (data) {
          this.userID = data;
          if (this.oauthService.hasValidAccessToken()) {
            this.hasLoggedIn = true;
          } else {
            this.hasLoggedIn = false;
          }
        }
      }
    );
  }


  logout() {
    this.userService.logout();
  }
  redirectToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }


}
