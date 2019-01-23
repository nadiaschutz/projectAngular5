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

  userName;
  userRole;
  hasLoggedIn ;
  ngOnInit() {

    this.hasLoggedIn = false;

    this.userService.subscribeRoleData().subscribe(
      data => {
        this.userRole = data;
      },
      error => console.log (error)
    );

    if (this.userRole) {
      this.userName = this.userName + '\n' + this.userRole;
    }

    this.userService.subscribeUserNameData().subscribe (
      data => {
        if (data) {
          this.userName = data;
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
