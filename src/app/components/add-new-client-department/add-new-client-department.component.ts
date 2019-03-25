import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as FHIR from '../../interface/FHIR';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-add-new-client-department',
  templateUrl: './add-new-client-department.component.html',
  styleUrls: ['./add-new-client-department.component.scss']
})
export class AddNewClientDepartmentComponent implements OnInit {
  clientDepartmentName = '';
  clientDepartmentCreationSuccess = false;

  constructor(
    private router: Router,
    private userService: UserService,
  ) { }

  ngOnInit() {
  }


  backToCreateBranch() {
    this.router.navigateByUrl('/clientdepartment');
  }

  createClientDepartment(data) {
    if (this.clientDepartmentName !== '') {
      console.log(this.clientDepartmentName);
      const clientDepartment = new FHIR.Organization();
      clientDepartment.resourceType = 'Organization';

      clientDepartment.active = true;
      clientDepartment.name = this.clientDepartmentName;
      const typeCoding = new FHIR.Coding();

      typeCoding.system = 'https:bcip.smilecdr.com/fhir/clientDepartment';
      typeCoding.code = 'CLIENTDEPT';
      typeCoding.display = 'Client Department';

      const type = new FHIR.CodeableConcept();
      type.text = 'Client Department';
      type.coding = [typeCoding];
      clientDepartment.type = [type];
      // console.log(clientDepartment);
      this.saveClientDepartment(JSON.stringify(clientDepartment));

    }
  }
  saveClientDepartment(clientDepartmentData) {
    this.userService.saveClientDepartment(clientDepartmentData).subscribe(data => {
      console.log(data);
      if (data) {
        // console.log(data.name);
        // sessionStorage.setItem('newClientDept', data.name);
        sessionStorage.setItem('newClientDept', JSON.stringify(data));
        this.clientDepartmentCreationSuccess = true;
      }
    });
  }
}
