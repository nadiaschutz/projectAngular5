import { Component, OnInit, AfterViewInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { UserService } from '../../service/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, AfterViewInit {
  constructor(
    private oauthService: OAuthService,
    private userService: UserService,
    private router: Router,

  ) {}

  userName;
  userRole;
  userDept;
  hasLoggedIn;
  testName;
  ngOnInit() {
    // this.userService.subscribeUserDept().subscribe (
    //   data => this.userDept = data,
    //   error => console.log(error)
    // );

    // if (sessionStorage.getItem('userRole') === null) {
    //   this.userService.subscribeRoleData().subscribe(
    //     data => {
    //       this.userRole = data;
    //   this.hasLoggedIn = true;

    //     },
    //     error => console.log(error)
    //   );
    // } else {
    //   this.userRole = sessionStorage.getItem('userRole');
    // }



    // this.userRole = sessionStorage.getItem('userRole');








    // this.userName = sessionStorage.getItem('userName');

    // this.userRole = sessionStorage.getItem('userName'));
    // sessionStorage.setItem('myname', 'bob');
    // this.userRole = sessionStorage.getItem('myname'));

    // this.sessionStorage.observe('userRole').subscribe(value => {
    //   this.userRole = value;
    //   this.hasLoggedIn = true;
    // });

    // this.userRole = sessionStorage.getItem('userRole')
    // this.sessionStorage.observe('userName').subscribe(value => {
    //   this.userName = value;
    //   console.log(this.userName);
    //   this.hasLoggedIn = true;

    // });
    // if (sessionStorage.getItem('userName') !== null) {
    // }



    // if (sessionStorage.getItem('userName') === null) {
    //   this.userName = this.oauthService.getIdentityClaims()['sub'];
    // } else {
    //   this.userName = sessionStorage.getItem('userName');
    // }


  }

  ngAfterViewInit() {
    this.userRole = sessionStorage.getItem('userRole');
    this.userName = sessionStorage.getItem('userName');
    if (sessionStorage.getItem('userName') || sessionStorage.getItem('userRole')
    ) {
      this.hasLoggedIn = true;
    }

  }

  logout() {
    this.userService.logout();
  }
  redirectToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }
}
