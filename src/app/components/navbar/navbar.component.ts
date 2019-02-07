import { Component, OnInit, AfterViewInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { UserService } from '../../service/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, AfterViewInit, AfterViewChecked {
  constructor(
    private oauthService: OAuthService,
    private userService: UserService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  userName;
  userRole;
  userDept;
  hasLoggedIn;

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.userRole = sessionStorage.getItem('userRole');
    this.userName = sessionStorage.getItem('userName');
    if (sessionStorage.getItem('userName') || sessionStorage.getItem('userRole')
    ) {
      this.hasLoggedIn = true;
    }

  }

  ngAfterViewChecked() {
    if (sessionStorage.getItem('userName') || sessionStorage.getItem('userRole')
    ) {
      this.hasLoggedIn = true;
      this.cdRef.detectChanges();
    }
  }

  logout() {
    this.userService.logout();
  }

  redirectToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }
}
