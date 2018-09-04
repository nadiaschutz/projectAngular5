import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../service/user.service';
// import { subscription } from 'rxjs/subscription';
import { environment } from '../../environments/environment';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  // patientSubscription: subscription;


  constructor(
    private oauthService: OAuthService,
    private userService: UserService,
    private router: Router


  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    // this.patientSubscription.unsubscribe();
  }

}
