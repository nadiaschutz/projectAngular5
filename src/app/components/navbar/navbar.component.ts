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
  hasLoggedIn = false;
  ngOnInit() {

    this.userService.subscribeUserNameData().subscribe (
      data => {
        if (data) {
          this.hasLoggedIn = true;
          this.userID = data;
        } else {
          this.hasLoggedIn = false;
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
