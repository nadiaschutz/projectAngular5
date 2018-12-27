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

  userID: string;
  ngOnInit() {
    this.userID = this.oauthService.getIdentityClaims()['name'];
  }

  logout() {
    this.userService.logout();
    this.userID = '';
  }
  redirectToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }
}
