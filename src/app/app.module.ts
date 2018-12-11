import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes, CanActivate } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { OAuthModule } from 'angular-oauth2-oidc';

import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthComponent } from './components/auth/auth.component';
import { EmployeeComponent } from './components/employee/employee.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NewServiceRequestComponent } from './components/new-service-request/new-service-request.component';
import { NewServiceRequestNoClientComponent } from './components/new-service-request-no-client/new-service-request-no-client.component';
import { DependentComponent } from './components/dependent/dependent.component';
import { EmployeeSummaryComponent } from './components/employee-summary/employee-summary.component';
import { ClientDepartmentComponent } from './components/client-department/client-department.component';
// import {fhir} from './interface/employee.d';

import { FHIRService } from './service/fhir.service';
import { AuthGuardService } from '../app/service/auth-guard.service';
import { QuestionnaireService } from './service/questionnaire.service';
import { PatientService } from './service/patient.service';
import { UserService } from './service/user.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ServReqMainComponent } from './components/serv-req-main/serv-req-main.component';
import { SummaryPageComponent } from './components/summary-page/summary-page.component';

import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { DistrictOfficeComponent } from './components/district-office/district-office.component';
import { ServiceRequestSummaryComponent } from './components/service-request-summary/service-request-summary.component';
<<<<<<< src/app/app.module.ts
import { ListPageComponent } from './components/staff/list-page/list-page.component';
=======
import { ClientOnsubmitSummaryComponent } from './components/client-onsubmit-summary/client-onsubmit-summary.component';
import { TasklistComponent } from './components/tasklist/tasklist.component';
import { DatePipe } from '@angular/common';
>>>>>>> src/app/app.module.ts
// import { EditNewServceRequestComponent } from './components/edit-new-servce-request/edit-new-servce-request.component';


const routes: Routes = [
  { path: 'employeeform', component: EmployeeComponent, canActivate: [AuthGuardService]  },
  { path: 'dependentform', component: DependentComponent, canActivate: [AuthGuardService]  },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuardService] },
  { path: 'servreqmain', component: ServReqMainComponent, canActivate: [AuthGuardService] },
  { path: 'newservicerequest', component: NewServiceRequestComponent, canActivate: [AuthGuardService] },
  // { path: 'edit-service-request', component: EditNewServiceRequestComponent, canActivate: [AuthGuardService] },
  { path: 'newadvicerequest', component: NewServiceRequestNoClientComponent, canActivate: [AuthGuardService] },
  { path: 'district-office', component: DistrictOfficeComponent, canActivate: [AuthGuardService]},
  { path: 'summary', component: SummaryPageComponent, canActivate: [AuthGuardService] },
  { path: 'employeesummary', component: EmployeeSummaryComponent },
  { path: 'newservicerequest', component: NewServiceRequestComponent },
  { path: 'clientdepartment', component: ClientDepartmentComponent },
  { path: 'assigntasks', component: TasklistComponent },
  { path: 'clientsummary', component: ClientOnsubmitSummaryComponent, canActivate: [AuthGuardService] },
  { path: 'service-request-summary', component: ServiceRequestSummaryComponent, canActivate: [AuthGuardService]},
  { path: 'list-page', component: ListPageComponent, canActivate: [AuthGuardService]},
  { path: '', component: AuthComponent }
];

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    EmployeeComponent,
    EmployeeSummaryComponent,
    DependentComponent,
    AuthComponent,
    NavbarComponent,
    SidebarComponent,
    NewServiceRequestComponent,
    NewServiceRequestNoClientComponent,
    ServReqMainComponent,
    SummaryPageComponent,
    ClientDepartmentComponent,
    DistrictOfficeComponent,
    ServiceRequestSummaryComponent,
    ListPageComponent,
    ClientOnsubmitSummaryComponent,
    TasklistComponent
  ],
  imports: [
    RouterModule.forRoot(routes),
    OAuthModule.forRoot(),
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgBootstrapFormValidationModule,
    NgBootstrapFormValidationModule.forRoot(),
  ],
  providers: [
    AuthGuardService,
    UserService,
    QuestionnaireService,
    PatientService,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
