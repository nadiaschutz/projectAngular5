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
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private oauthService: OAuthService,
    private router: Router,
    private userService: UserService,
    private route: ActivatedRoute,
    private patient: PatientService) { }
  logInForm: FormGroup;

  ngOnInit() {


    this.logInForm = this.fb.group({
      username: ['', [Validators.required]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
          Validators.minLength(6)
        ]
      ]
    });

    this.oauthService.redirectUri = environment.redirectUri;
    //   if (this.oauthService.hasValidAccessToken()) {
    //   this.router.navigate(['/dashboard']);
    // }

  }

  login() {
    this.userService.login(this.logInForm.get('username').value.toString(), this.logInForm.get('password').value.toString());
    // if (this.oauthService.hasValidAccessToken()) {
      this.router.navigate(['/dashboard']);
    // }
  }



  // get givenName() {
  //   const claims = this.oauthService.getIdentityClaims();
  //   if (!claims) {
  //     return null;
  //   }
  //   return claims['name'];
  // }

  // getQueryVariable(query, variable) {
  //   const vars = query.split('&');

  //   for (let i = 0; i < vars.length; i++) {
  //     const pair = vars[i].split('=');
  //     if (decodeURIComponent(pair[0]) === variable) {
  //       return decodeURIComponent(pair[1]);
  //     }
  //   }
  //   return null;
  // }


  get username() {
    return this.logInForm.get('username');
  }


  get password() {
    return this.logInForm.get('password');
  }


}
