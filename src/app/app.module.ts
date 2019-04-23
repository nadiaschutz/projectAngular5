import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes, CanActivate } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DatePipe, TitleCasePipe } from '@angular/common';

import { OAuthModule } from 'angular-oauth2-oidc';
import { AngularStickyThingsModule } from '@w11k/angular-sticky-things';
import { AvatarModule } from 'ngx-avatar';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { AuthGuardService } from '../app/service/auth-guard.service';
import { QuestionnaireService } from './service/questionnaire.service';
import { PatientService } from './service/patient.service';
import { UserService } from './service/user.service';
import { StaffService } from '../app/service/staff.service';
import { AdminHomeScreenService } from '../app/service/admin-home-screen.service';
import { AudiogramService } from '../app/service/audiogram.service';

import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthComponent } from './components/auth/auth.component';
import { EmployeeComponent } from './components/employee/employee.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NewServiceRequestComponent } from './components/new-service-request/new-service-request.component';
import { EmployeeSummaryComponent } from './components/employee-summary/employee-summary.component';
import { ClientDepartmentComponent } from './components/client-department/client-department.component';
import { LabRequisitionComponent } from './components/staff/lab-requisition/lab-requisition.component';
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
import { EditNewServiceRequestComponent } from './components/edit-new-service-request/edit-new-service-request.component';
import { ListPageComponent } from './components/staff/list-page/list-page.component';
import { WorkScreenComponent } from './components/staff/work-screen/work-screen.component';
import { CreateTaskComponent } from './components/staff/create-task/create-task.component';
import { DistrictOfficeAddComponent } from './components/district-office-add/district-office-add.component';
import { AdminHomeScreenComponent } from './components/admin-home-screen/admin-home-screen.component';


import { InputComponent } from './components/dynamic-forms/input.component';
import { CommentComponent } from './components/dynamic-forms/comment.component';
import { ButtonComponent } from './components/dynamic-forms/button.component';
import { DependFormComponent } from './components/dynamic-forms/dependForm.component';
import { SelectComponent } from './components/dynamic-forms/select.component';
// import { SelectSrComponent } from './components/dynamic-forms/select-sr.component';
import { LineComponent } from './components/dynamic-forms/line.component';
import { HeaderComponent } from './components/dynamic-forms/header.component';
import { DateComponent } from './components/dynamic-forms/date.component';
import { DocComponent } from './components/dynamic-forms/doc.components';
import { CheckboxComponent } from './components/dynamic-forms/checkbox.component';
// import { CheckboxSrComponent } from './components/dynamic-forms/checkbox-sr.component';
import { DynamicFieldDirective } from './components/dynamic-forms/dynamic-field.directive';
import { DynamicFormComponent } from './components/dynamic-forms/dynamic-form.component';
import { DemoComponent } from './components/demo/demo.component';


import { DepartmentListResolverService } from './service/department-list-resolver.service';

import { FormBuilderComponent } from './components/form-builder/form-builder.component';
import { ImmunizationScreenComponent } from './components/staff/clinical/immunization-screen/immunization-screen.component';
import { AudiogramComponent } from './components/staff/audiogram/audiogram.component';
import { AudiogramNewComponent } from './components/staff/audiogram-new/audiogram-new.component';
import { AudiogramDetailComponent } from './components/staff/audiogram-detail/audiogram-detail.component';
import { AssessmentFunctionComponent } from './components/staff/clinical/assessment-function/assessment-function.component';
import { SchedulerComponent } from './components/staff/clinical/scheduler/scheduler.component';
import { CancelRequestComponent } from './components/staff/cancel-request/cancel-request.component';
import { NewServReqService } from './service/new-serv-req.service';
import { DependentComponent } from './components/dependent/dependent.component';
import { ReportingComponent } from './components/reporting/reporting.component';
import { AddNewClientDepartmentComponent } from './components/add-new-client-department/add-new-client-department.component';
import { DocumentManagementComponent } from './components/document-management/document-management.component';
import { MilestoneTrackingComponent } from './components/milestone-tracking/milestone-tracking.component';
import { ValidateRequestComponent } from './components/staff/validate-request/validate-request.component';

const routes: Routes = [
  { path: 'employeeform', component: EmployeeComponent, canActivate: [AuthGuardService] },
  { path: 'dependentform', component: DependentComponent, canActivate: [AuthGuardService] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuardService] },
  { path: 'servreqmain', component: ServReqMainComponent, canActivate: [AuthGuardService] },
  {
    path: 'newservicerequest',
    component: NewServiceRequestComponent,
    canActivate: [AuthGuardService],
    resolve: {
      fields: NewServReqService,
      departments: DepartmentListResolverService
    },
  },
  {
    path: 'newadvicerequest',
    component: NewServiceRequestComponent,
    canActivate: [AuthGuardService],
    resolve: {
      fields: NewServReqService,
      departments: DepartmentListResolverService
    },
  },
  { path: 'edit-service-request', component: EditNewServiceRequestComponent, canActivate: [AuthGuardService] },
  { path: 'staff/validate-request/:eocId', component: ValidateRequestComponent, canActivate: [AuthGuardService] },
  { path: 'district-office', component: DistrictOfficeComponent, canActivate: [AuthGuardService] },
  { path: 'district-office-add', component: DistrictOfficeAddComponent, canActivate: [AuthGuardService] },
  { path: 'summary', component: SummaryPageComponent, canActivate: [AuthGuardService] },
  { path: 'employeesummary', component: EmployeeSummaryComponent, canActivate: [AuthGuardService] },
  { path: 'newaccount', component: NewAccountComponent, canActivate: [AuthGuardService] },
  { path: 'clientdepartment', component: ClientDepartmentComponent, canActivate: [AuthGuardService] },
  { path: 'addnewclientdepartment', component: AddNewClientDepartmentComponent, canActivate: [AuthGuardService] },
  { path: 'assigntasks', component: TasklistComponent, canActivate: [AuthGuardService] },
  { path: 'clientsummary/:clientId', component: ClientOnsubmitSummaryComponent, canActivate: [AuthGuardService] },
  { path: 'service-request-summary', component: ServiceRequestSummaryComponent, canActivate: [AuthGuardService] },
  { path: 'staff/list-page', component: ListPageComponent, canActivate: [AuthGuardService] },
  { path: 'staff/work-screen/:eocId', component: WorkScreenComponent, canActivate: [AuthGuardService] },
  { path: 'staff/lab-requisition/:eocId', component: LabRequisitionComponent, canActivate: [AuthGuardService] },
  { path: 'staff/cancel-request/:eocId', component: CancelRequestComponent, canActivate: [AuthGuardService] },
  { path: 'staff/clinical/immunization-screen/:eocId', component: ImmunizationScreenComponent, canActivate: [AuthGuardService] },
  { path: 'staff/audiogram/:eocId', component: AudiogramComponent, canActivate: [AuthGuardService] },
  { path: 'staff/audiogram/new/:eocId', component: AudiogramNewComponent, canActivate: [AuthGuardService] },
  { path: 'staff/audiogram/detail/:eocId', component: AudiogramDetailComponent, canActivate: [AuthGuardService] },
  { path: 'staff/clinical/assessment-screen/:eocId', component: AssessmentFunctionComponent, canActivate: [AuthGuardService] },
  { path: 'staff/clinical/scheduler', component: SchedulerComponent, canActivate: [AuthGuardService] },
  { path: 'staff/document-management/:eocId', component: DocumentManagementComponent, canActivate: [AuthGuardService] },
  { path: 'demo', component: DemoComponent, canActivate: [AuthGuardService] },
  { path: 'adminhome', component: AdminHomeScreenComponent, canActivate: [AuthGuardService] },
  { path: 'form-builder', component: FormBuilderComponent, canActivate: [AuthGuardService] },
  { path: 'data-extract', component: ReportingComponent, canActivate: [AuthGuardService] },
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
    ServReqMainComponent,
    SummaryPageComponent,
    ClientDepartmentComponent,
    DistrictOfficeComponent,
    ServiceRequestSummaryComponent,
    ListPageComponent,
    ClientOnsubmitSummaryComponent,
    TasklistComponent,
    EditNewServiceRequestComponent,
    WorkScreenComponent,
    CreateTaskComponent,
    NewAccountComponent,
    WorkScreenComponent,
    InputComponent,
    CommentComponent,
    ButtonComponent,
    DependFormComponent,
    SelectComponent,
    // SelectSrComponent,
    LineComponent,
    HeaderComponent,
    DateComponent,
    DocComponent,
    CheckboxComponent,
    // CheckboxSrComponent,
    DynamicFieldDirective,
    DynamicFormComponent,
    DemoComponent,
    DistrictOfficeAddComponent,
    LabRequisitionComponent,
    AdminHomeScreenComponent,
    FormBuilderComponent,
    ImmunizationScreenComponent,
    AudiogramComponent,
    AudiogramNewComponent,
    AudiogramDetailComponent,
    AssessmentFunctionComponent,
    SchedulerComponent,
    CancelRequestComponent,
    ReportingComponent,
    AddNewClientDepartmentComponent,
    DocumentManagementComponent,
    MilestoneTrackingComponent,
    ValidateRequestComponent

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
    AvatarModule,
    AngularStickyThingsModule
  ],
  providers: [
    AuthGuardService,
    UserService,
    QuestionnaireService,
    PatientService,
    DatePipe,
    TitleCasePipe,
    StaffService,
    AdminHomeScreenService,
    AudiogramService,
    NewServiceRequestComponent
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    InputComponent,
    CommentComponent,
    ButtonComponent,
    DependFormComponent,
    SelectComponent,
    // SelectSrComponent,
    LineComponent,
    HeaderComponent,
    DateComponent,
    DocComponent,
    // RadiobuttonComponent,
    CheckboxComponent,
    // CheckboxSrComponent,
  ]
})
export class AppModule { }
