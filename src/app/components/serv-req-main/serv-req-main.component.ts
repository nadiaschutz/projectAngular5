import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { UserService } from 'src/app/service/user.service';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { QrequestService } from 'src/app/service/qrequest.service';
import { Router } from '@angular/router';
import { multicast } from 'rxjs/operators';
import { PatientService } from 'src/app/service/patient.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-serv-req-main',
  templateUrl: './serv-req-main.component.html',
  styleUrls: ['./serv-req-main.component.css']
})
export class ServReqMainComponent implements OnInit {
  // figure out how to query client id
  // subject=patient/1876

  // figure out how to query name
  // get /patient?name=
  // get the id# and query /subject=patient/1876 by id#
  // what if i make name as an extension and make a new search query for that?


  // figure out how to query date of birth
  // get /patient?datebirth=
  // get the id# and query /subject=patient/1876 by id#
  // what if i make DoB as an extension and make a new search query for that?


  // figure out how to query region
  // do loop trough the object that comes from FHIR


  // figure out how to query client department
  // do loop trough the object that comes from FHIR

  // figure out how to query status
  // ?status=completed


  // figure out how to query date
  // https://bcip.smilecdr.com/fhir-request/QuestionnaireResponse?authored=2018-11


  name = {
    prefix: 'name=',
    data: null
  };

  clientId = {
    prefix: 'subject=patient/',
    data: null
  };

  dateOfBirth = {
    prefix: 'birthDate=',
    data: null
  };

  status = {
    prefix: 'status=',
    data: null
  };

  date = {
    prefix: 'authored=',
    data: null
  };

// status
  // 1= In Progress -request is assigned there are no impediment to the request being processed
  // 2= Waiting -waiting for additional information
  // 3= Action Required- document/test/medical report needs to be reviews by the clinician
  // 4= Cancelled
  // 5= Suspended
  // 6= Closed

  statusArr = ['In Progress', 'Waiting', 'Action Required', 'Cancelled', 'Suspended', 'Closed'];
  regionArr = [];


  


  // comes from the responce object
  region: string = null;
  clientDepartment: string = null;

  myString;
  str = null;
  private arrOfVar = [this.name, this.clientId, this.dateOfBirth, this.status, this.date];

  constructor(
    private oauthService: OAuthService,
    private userService: UserService,
    private httpClient: HttpClient,
    private qrequestService: QrequestService,
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit() {
  }

  dataSearch() {

    // get data by name
    // if ( this.name.uData !== null ) {
    // this.patientService.getPatientDataByName(this.name.uData).subscribe(
    //   data => this.handleNameSuccess(data),
    //   error => this.handleNameError(error)
    // );
    // }

    // get id from the name search



    // assign this id to this.name.data[]

    console.log(this.dateOfBirth.data);
    console.log(this.date.data);

    this.arrOfVar.forEach((element, index) => {
      if ( element.data !== null ) {
        if (this.str === null) {
          this.str = '?' + element.prefix + element.data;
        } else {
          this.str += '&' + element.prefix + element.data;
        }
      }
    });

    // for (let i = 0; i < this.arrOfVar.length; i++) {
    //   if ( this.arrOfVar[i].data !== null ) {
    //     if (this.str.length < 1) {
    //       this.str.push(this.arrOfVar[i].prefix + this.arrOfVar[i].data );
    //     }

    //      if (this.str.length !== 0) {
    //        this.str.splice(this.str.length - 1);
    //       this.str.push(this.arrOfVar[i].prefix + this.arrOfVar[i].data + '&' );
    //      }
    //   }
    // }





    // if (this.name.data) {
    //     this.str = '?' + this.name.prefix + this.name.data ;
    // }
    // this.name, this.clientId, this.dateOfBirth, this.status, this.date
    // if (this.name.data && this.clientId.data) {
    //   this.str = '?' + this.name.prefix + this.name.data + '&' + this.clientId.prefix + this.clientId.data ;
    // }

    // if (this.name.data && this.status.data) {
    //   this.str = '?' + this.name.prefix + this.name.data + '&' + this.status.prefix + this.status.data ;
    // }

    // if (this.name.data && this.dateOfBirth.data) {
    //   this.str = '?' + this.name.prefix + this.name.data + '&' + this.dateOfBirth.prefix + this.dateOfBirth.data ;
    // }
    // if (this.name.data && this.dateOfBirth.data && this.status.data) {
    //   // tslint:disable-next-line:max-line-length
    //   this.str = '?' + this.name.prefix + this.name.data + '&' + this.dateOfBirth.prefix + this.dateOfBirth.data + '&' + this.status.prefix + this.status.data;
    // }



    console.log(this.str);


    // console.log(this.name, this.status, this.dateOfBirth, this.clientId);

    // this.str = this.name.prefix + this.name.data;
    // test
    // this.str = this.name.prefix + this.name.data;
     // this.str = this.clientId.prefix + this.clientId.data;
    // calling get request with updated string
    this.qrequestService.getData(this.str).subscribe(
      data => this.handleSuccess(data),
      error => this.handleError(error)
    );

    this.str = null;

    this.name.data = null;
    this.clientId.data = null;
    this.dateOfBirth.data = null;
    this.status.data = null;
    this.date.data = null;
  }

  // dataSearch(e) {
  //   return this.qrequestService.getData(e.target.value).subscribe(
  //     data => this.handleSuccess(data),
  //     error => this.handleError(error)
  //   );
  // }


  handleNameSuccess(data) {
    // this.name.data = data
    console.log(data.entry[0].resource.id);
  }
  handleNameError(error) {
    console.log(error);
  }



  handleSuccess(data) {
    console.log(data);
  }
  handleError(error) {
    console.log(error);
  }

}
