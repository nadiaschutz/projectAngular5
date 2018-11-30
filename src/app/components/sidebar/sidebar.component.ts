import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
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
    this.router.navigateByUrl('/list-page');
  }

  adviceRequestPage() {
    this.router.navigateByUrl('/newadvicerequest');
  }


}
