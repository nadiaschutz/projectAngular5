import { Component, OnInit, OnChanges } from '@angular/core';
//  trigger, style, state, transition, animate
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private oauthService: OAuthService,
    private router: Router,
    private userService: UserService,
  ) { }

  logInForm: FormGroup;

  ngOnInit() {


    if (this.oauthService.getAccessToken()) {
      this.router.navigateByUrl('/dashboard');
    }

    this.logInForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [ Validators.required, Validators.minLength(6)]]
    });

  }

  login() {
    this.userService.login(this.logInForm.get('username').value.toString(), this.logInForm.get('password').value.toString());
  }

  spinnerStatus() {
    return this.userService.returnSpinner();
  }

}
