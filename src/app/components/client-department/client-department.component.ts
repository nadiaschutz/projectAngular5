import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
@Component({
  selector: 'app-client-department',
  templateUrl: './client-department.component.html',
  styleUrls: ['./client-department.component.css']
})
export class ClientDepartmentComponent implements OnInit {


  constructor(
    private userService: UserService
  ) { }

  ngOnInit() {

    const departments = [];


  }

}
