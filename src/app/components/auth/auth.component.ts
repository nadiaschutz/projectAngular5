import { Component, OnInit, OnChanges } from '@angular/core';
//  trigger, style, state, transition, animate
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { UserService } from '../../service/user.service';

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
  versionNumber;
  ngOnInit() {

    this.versionNumber = '0.7.52';

    if (this.oauthService.getAccessToken()) {
      this.router.navigateByUrl('/dashboard');
    }

    // if (!this.oauthService.hasValidAccessToken()) {
    //   sessionStorage.clear();
    // }

    this.logInForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [ Validators.required, Validators.minLength(6)]]
    });

  }

  login() {
    const user = this.logInForm.get('username').value.toString().trim();
    const pass = this.logInForm.get('password').value.toString().trim();
    this.userService.login(user, pass);
  }

  spinnerStatus() {
    return this.userService.returnSpinner();
  }

  errorFlag() {
    return this.userService.returnErrorFlag();
  }

}
