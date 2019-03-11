import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../service/user.service';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  constructor(
    private userService: UserService,
    private oauthService: OAuthService,
    private router: Router
  ) {}

  roleInSession = 'emptyClass';
  ngOnInit() {
    this.roleInSession = sessionStorage.getItem('userRole');
  }


  clientPage() {
    this.router.navigate(['/dashboard']);
  }

  serviceRequestPage() {
    this.router.navigate(['/servreqmain']);
  }
  districtOfficePage() {
    this.router.navigateByUrl('/district-office');
  }
  staffUI() {
    this.router.navigateByUrl('/staff/list-page');
  }

  adviceRequestPage() {
    this.router.navigateByUrl('/newadvicerequest');
  }

  clientDepartmentPage() {
    this.router.navigateByUrl('/clientdepartment');
  }

  acccountCreation() {
    this.router.navigateByUrl('/newaccount');
  }

  adminHomeScreen() {
    this.router.navigateByUrl('/adminhome');
  }

  labRequisition() {
    this.router.navigateByUrl('/staff/lab-requisition');
  }

  reporting() {
    this.router.navigateByUrl('/reporting');
  }
}
