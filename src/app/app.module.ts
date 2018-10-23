import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { OAuthModule } from 'angular-oauth2-oidc';

import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreateAccountComponent } from './components/create-account/create-account.component';
import { AuthComponent } from './components/auth/auth.component';
import { EmployeeComponent } from './components/employee/employee.component';
import { PsohpRegionalComponent } from './components/psohp-regional/psohp-regional.component';
import { EmployeeSummaryComponent } from './components/employee-summary/employee-summary.component';
import { ServiceRequestComponent } from './components/service-request/service-request.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NewServiceRequestComponent } from './components/new-service-request/new-service-request.component';
import { NewServiceRequestNoClientComponent } from './components/new-service-request-no-client/new-service-request-no-client.component';
// import {fhir} from './interface/employee.d';

import { FHIRService } from './service/fhir.service';
import { AuthGuardService } from '../app/service/auth-guard.service';
import { QuestionnaireService } from './service/questionnaire.service';
import { PatientService } from './service/patient.service';
import { UserService } from './service/user.service';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatStepperModule } from '@angular/material/stepper';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';



const routes: Routes = [
  { path: 'employee-summary', component: EmployeeSummaryComponent },
  { path: 'employeeform', component: EmployeeComponent },
  { path: 'newaccount', component: CreateAccountComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'servicerequest', component: ServiceRequestComponent },
  { path: 'newservicerequest', component: NewServiceRequestComponent },
  { path: 'psohpform', component: PsohpRegionalComponent },
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
    CreateAccountComponent,
    AuthComponent,
    PsohpRegionalComponent,
    EmployeeSummaryComponent,
    ServiceRequestComponent,
    NavbarComponent,
    SidebarComponent,
    NewServiceRequestComponent,
    NewServiceRequestNoClientComponent
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
    // fhir,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatIconModule,
    MatSlideToggleModule,
    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatGridListModule,
    MatStepperModule
  ],
  providers: [
    AuthGuardService,
    UserService,
    QuestionnaireService,
    PatientService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
