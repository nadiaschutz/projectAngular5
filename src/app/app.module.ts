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
import { NewAccountComponent } from './components/new-account/new-account.component';
import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { DistrictOfficeComponent } from './components/district-office/district-office.component';
import { ServiceRequestSummaryComponent } from './components/service-request-summary/service-request-summary.component';
import { ClientOnsubmitSummaryComponent } from './components/client-onsubmit-summary/client-onsubmit-summary.component';
import { TasklistComponent } from './components/tasklist/tasklist.component';
import { DatePipe } from '@angular/common';
import { StaffService } from '../app/service/staff.service';
import { EditNewServiceRequestComponent } from './components/edit-new-service-request/edit-new-service-request.component';
import { EditEmployeeComponent } from './components/edit-employee/edit-employee.component';
import { ListPageComponent } from './components/staff/list-page/list-page.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { WorkScreenComponent } from './components/staff/work-screen/work-screen.component';
import { CreateTaskComponent } from './components/staff/create-task/create-task.component';

import { InputComponent } from './components/dynamic-forms/input.component';
import { ButtonComponent } from './components/dynamic-forms/button.component';
import { SelectComponent } from './components/dynamic-forms/select.component';
import { LineComponent } from './components/dynamic-forms/line.component';
import { HeaderComponent } from './components/dynamic-forms/header.component';
import { DateComponent } from './components/dynamic-forms/date.component';
// import { RadiobuttonComponent } from './components/dynamic-forms/radiobutton.component';
import { CheckboxComponent } from './components/dynamic-forms/checkbox.component';
import { DynamicFieldDirective } from './components/dynamic-forms/dynamic-field.directive';
import { DynamicFormComponent } from './components/dynamic-forms/dynamic-form.component';
import { DemoComponent } from './components/demo/demo.component';
// import { DynamicFormModule } from './components/dynamic-forms/dynamic-form.module';


const routes: Routes = [
  { path: 'employeeform', component: EmployeeComponent, canActivate: [AuthGuardService]  },
  { path: 'dependentform', component: DependentComponent, canActivate: [AuthGuardService]  },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuardService] },
  { path: 'servreqmain', component: ServReqMainComponent, canActivate: [AuthGuardService] },
  { path: 'newservicerequest', component: NewServiceRequestComponent, canActivate: [AuthGuardService] },
  { path: 'edit-service-request', component: EditNewServiceRequestComponent, canActivate: [AuthGuardService] },
  { path: 'newadvicerequest', component: NewServiceRequestNoClientComponent, canActivate: [AuthGuardService] },
  { path: 'district-office', component: DistrictOfficeComponent, canActivate: [AuthGuardService]},
  { path: 'summary', component: SummaryPageComponent, canActivate: [AuthGuardService] },
  { path: 'employeesummary', component: EmployeeSummaryComponent },
  { path: 'newaccount', component: NewAccountComponent},
  { path: 'newservicerequest', component: NewServiceRequestComponent },
  { path: 'clientdepartment', component: ClientDepartmentComponent, canActivate: [AuthGuardService] },
  { path: 'assigntasks', component: TasklistComponent },
  { path: 'clientsummary', component: ClientOnsubmitSummaryComponent, canActivate: [AuthGuardService] },
  { path: 'service-request-summary/:id', component: ServiceRequestSummaryComponent, canActivate: [AuthGuardService]},
  { path: 'staff/list-page', component: ListPageComponent, canActivate: [AuthGuardService]},
  { path: 'staff/work-screen', component: WorkScreenComponent, canActivate: [AuthGuardService]},
  { path: 'service-request-summary', component: ServiceRequestSummaryComponent, canActivate: [AuthGuardService]},
  { path: 'list-page', component: ListPageComponent, canActivate: [AuthGuardService]},
  { path: 'demo', component: DemoComponent, canActivate: [AuthGuardService]},
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
    TasklistComponent,
    EditEmployeeComponent,
    EditNewServiceRequestComponent,
    WorkScreenComponent,
    CreateTaskComponent,
    NewAccountComponent,
    WorkScreenComponent,
    InputComponent,
    ButtonComponent,
    SelectComponent,
    LineComponent,
    HeaderComponent,
    DateComponent,
    // RadiobuttonComponent,
    CheckboxComponent,
    DynamicFieldDirective,
    DynamicFormComponent,
    DemoComponent
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
    BsDatepickerModule.forRoot(),
  ],
  providers: [
    AuthGuardService,
    UserService,
    QuestionnaireService,
    PatientService,
    DatePipe,
    StaffService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    InputComponent,
    ButtonComponent,
    SelectComponent,
    LineComponent,
    HeaderComponent,
    DateComponent,
    // RadiobuttonComponent,
    CheckboxComponent
  ]
})
export class AppModule { }
