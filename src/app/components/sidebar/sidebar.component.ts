import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
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


}
