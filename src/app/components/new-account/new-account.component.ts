import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  NgControlStatusGroup,
  NgControl
} from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';

import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';

import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as FHIR from '../../interface/FHIR';
import * as SMILE from '../../interface/SMILE';
import * as uuid from 'uuid';

export interface AccountType {
  value: string;
  viewValue: string;
}

export interface RoleType {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.scss']
})
export class NewAccountComponent implements OnInit {

  accountFormGroup: FormGroup;
  regionalOffices = [];
  districtOffices = [];
  deptName = [];
  deptBranch = [];
  practitionerPieces = {};
  confirmSubmit = false;
  successHeaderCheck;
  activateSubmitButton = null;

  constructor(
    private fb: FormBuilder,
    private httpClient: HttpClient,
    public translate: TranslateService,
    private oauthService: OAuthService,
    private userService: UserService,
    private patientService: PatientService,
    private router: Router
  ) {}

  accountTypes: AccountType[] = [
    { value: 'Client Department', viewValue: 'Client Department' },
    { value: 'PSOHP', viewValue: 'PSOHP' }
  ];

  roleTypes: RoleType[] = [
    { value: 'Super User', viewValue: 'Super User' },
    { value: 'Manager', viewValue: 'Manager' },
    { value: 'Clinician', viewValue: 'Clinician' },
    { value: 'Registry', viewValue: 'Registry' },
    { value: 'Administrative Officer', viewValue: 'Administrative Officer' },
    { value: 'Client Department', viewValue: 'Client Department' },
    { value: 'Business User', viewValue: 'Business User' }
  ];

  ngOnInit() {

    /**
     * Initializes list for regional offices on our system
     */
    this.userService
      .fetchAllRegionalOffices()
      .subscribe(
        data => this.populateRegionalOffices(data),
        error => this.handleError(error)
      );

    /**
     * Initializes list for district offices on our system
     */
    this.userService
      .fetchAllDistrictOffices()
      .subscribe(
        data => this.populateDistrictOffices(data),
        error => this.handleError(error)
      );

    /**
     * Initializes the names of all departments on our system
     */
    this.userService.fetchAllDepartmentNames().subscribe (
      data => this.populateDeptNames(data),
      error => this.handleError(error)
    );

    /**
     * Initializes the list of branches from our system
     */
    this.userService.fetchAllDepartmentBranches().subscribe (
      data => this.populateDeptBranches(data),
      error => this.handleError(error)
    );

    /**
     * Builds the form object that is used in the component.
     */
    this.accountFormGroup = this.fb.group({
      given: new FormControl('', [
        Validators.required,
        Validators.minLength(2)
      ]),
      family: new FormControl('', [
        Validators.required,
        Validators.minLength(2)
      ]),
      pri: new FormControl('', [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(9)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ]),
      role: new FormControl('', Validators.required),
      roleDescription: new FormControl('', Validators.required),
      phoneNumber: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      regionalOffice: new FormControl('', Validators.required),
      districtOffice: new FormControl('', Validators.required),
      departmentName: new FormControl('', Validators.required),
      departmentBranch: new FormControl('', Validators.required),
    });
  }

  /**
   * This is the core piece to the New Account Component. Builds a Practitioner
   * FHIR object, populates the fields, makes a POST request, then takes the response,
   * and calls othewr functions to pass the ID generated by the server, and proceed to
   * create & populate other objects.
   */
  createPractitioner() {

    // Initialize the base classes we need
    const practitioner = new FHIR.Practitioner;
    const pracName = new FHIR.HumanName;
    const pracIdentifier = new FHIR.Identifier;
    const pracEx = new FHIR.Extension;

    practitioner.extension = [pracEx];
    // Set the identifier for the Practitioner
    pracIdentifier.system =  'http://www.acme.org/practitioners';
    pracIdentifier.value = 'testID';

    // Set the users name
    pracName.family = this.accountFormGroup.get('family').value;
    pracName.given = [this.accountFormGroup.get('given').value];

    // Add all objects back to the base class
    practitioner.name = [pracName];
    practitioner.identifier = [pracIdentifier];
    practitioner.resourceType = 'Practitioner';

    // Stringify the object for posting
    const finalJSON  = JSON.stringify(practitioner);

    /**
     * Calls the savePractitioner function in the user service.
     * On success, it'll create the Practitioner, followed by capturing
     * the response in capturePractitionerPieces, then create the
     * PractitionerRole and User Account with the captured data.
     *
     * If uncesseful, it'll throw an error.
     */

      this.userService.savePractitioner(finalJSON).subscribe(
        data => {
          this.successHeaderCheck = true;
          this.disableInputsBeforeSubmission();
          this.confirmSubmit = !this.confirmSubmit;
          console.log('Success! A practitioner has been created: ', data);
          this.capturePractitionerPieces(data);
          this.createUser(this.practitionerPieces);
          this.createPractitionerRoleForOffices(this.practitionerPieces);
          this.createPractitionerRoleForDepartments(this.practitionerPieces);
        },
        error => this.handleError(error)
      );
  }

  // Creates a Smile CDR user in the system. Note that this is not a FHIR object,
  // but is linked to & related to a FHIR object (specifically Practitioner), based
  // on the FHIR object's ID.
  createUser(practitioner: any) {

    // Initialize FHIR Objects being used
    const smileUser = new SMILE.UserAccount;
    const authorities = new SMILE.Authority;
    const authoritiestwo = new SMILE.Authority;
    const launchContext = new SMILE.DefaultLaunchContext;

    // Set the permissions for the user in question

    //  TODO: create conditional logic to
    //  add different permissions based on roles selected
    authorities.permission = 'ROLE_SUPERUSER';
    authoritiestwo.permission = 'ROLE_FHIR_CLIENT_SUPERUSER';

    // Set up the launch context of the user, this is used to link the
    //  acounnt with a Practitioner FHIR object
    launchContext.contextType = 'practitioner';
    launchContext.resourceId = practitioner['id'];

    // Add all data from the form and other objects to the base Smile User object
    smileUser.defaultLaunchContexts = [launchContext];
    smileUser.authorities = [authorities, authoritiestwo];
    smileUser.givenName = this.accountFormGroup.get('given').value;
    smileUser.familyName = this.accountFormGroup.get('family').value;
    smileUser.username = this.accountFormGroup.get('pri').value;
    smileUser.email = this.accountFormGroup.get('email').value;
    smileUser.password = this.accountFormGroup.get('password').value;

    // Stringify the object for posting
    const finalJSON  = JSON.stringify(smileUser);

    // Call the user service to POST the user to the JSON Admin API endpoint
    this.userService.createAccount(finalJSON).subscribe(
      data => console.log('Success! Account Created!', data),
      error => this.handleError(error)
    );

  }

  /**
   * Craetes a PractionerRole that is associated with a Practitioner. Important
   * for describing futher details of the Practitioner (workplace, time & availability,
   * etc...). Builds a Role describing the District & Regional Offices they are associated
   * with.
   *
   * Takes a Practitioner objcet as an input
   * @param practitioner
   */
  createPractitionerRoleForOffices(practitioner: any) {

    const practitionerRole = new FHIR.PractitionerRole;
    const practitionerRef = new FHIR.Reference;
    const practitionerOrg = new FHIR.Reference;
    const practitionerLoc = new FHIR.Reference;
    const practitionerCode = new FHIR.CodeableConcept;
    const practitionerCoding = new FHIR.Coding;
    const practitionerPhone = new FHIR.ContactPoint;
    const practitionerEmail = new FHIR.ContactPoint;

    practitionerPhone.system = 'phone';
    practitionerPhone.use = 'work';
    practitionerPhone.value = this.accountFormGroup.get('phoneNumber').value;

    practitionerEmail.system = 'email';
    practitionerEmail.use = 'work';
    practitionerEmail.value = this.accountFormGroup.get('email').value;

    practitionerRef.reference = 'Practitioner/' + practitioner.id;
    practitionerOrg.reference = 'Organization/' + this.accountFormGroup.get('regionalOffice').value;
    practitionerLoc.reference = 'Location/' + this.accountFormGroup.get('districtOffice').value;


    practitionerCoding.system = 'https://bcip.smilecdr.com/fhir/practitionerrole';
    practitionerCoding.display = this.accountFormGroup.get('role').value;

    if (this.cleanRoleValue(this.accountFormGroup.get('role').value) === 'superuser') {
      practitionerCoding.code = 'superuser';
    }

    if (this.cleanRoleValue(this.accountFormGroup.get('role').value) === 'manager') {
      practitionerCoding.code = 'manager';
    }

    if (this.cleanRoleValue(this.accountFormGroup.get('role').value) === 'clinician') {
      practitionerCoding.code = 'clinician';
    }

    if (this.cleanRoleValue(this.accountFormGroup.get('role').value) === 'registry') {
      practitionerCoding.code = 'registry';
    }

    if (this.cleanRoleValue(this.accountFormGroup.get('role').value) === 'administrativeofficer') {
      practitionerCoding.code = 'admin';
    }

    if (this.cleanRoleValue(this.accountFormGroup.get('role').value) === 'clientdepartment') {
      practitionerCoding.code = 'clientdept';
    }

    if (this.cleanRoleValue(this.accountFormGroup.get('role').value) === 'businessuser') {
        practitionerCoding.code = 'businessuser';
    }

    practitionerCode.coding = [practitionerCoding];
    practitionerCode.text = this.accountFormGroup.get('roleDescription').value;


    practitionerRole.telecom = [practitionerPhone, practitionerEmail];
    practitionerRole.organization = practitionerOrg;
    practitionerRole.location = [practitionerLoc];
    practitionerRole.practitioner = practitionerRef;
    practitionerRole.resourceType = 'PractitionerRole';
    practitionerRole.active = true;
    practitionerRole.code = [practitionerCode];

    const finalJSON  = JSON.stringify(practitionerRole);

    this.userService.savePractitionerRole(finalJSON).subscribe(
      data => console.log('Success! A role has been assigned: ', data),
      error => this.handleError(error)
    );
  }

  /**
   * Craetes a PractionerRole that is associated with a Practitioner. Important
   * for describing futher details of the Practitioner (workplace, time & availability,
   * etc...). Builds a Role describing the Department & Branch they are associated
   * with.
   *
   * Takes a Practitioner objcet as an input
   * @param practitioner
   */
  createPractitionerRoleForDepartments(practitioner) {

    const practitionerRole = new FHIR.PractitionerRole;
    const practitionerRef = new FHIR.Reference;
    const practitionerOrg = new FHIR.Reference;
    const practitionerLoc = new FHIR.Reference;
    const practitionerCode = new FHIR.CodeableConcept;
    const practitionerCoding = new FHIR.Coding;
    const practitionerPhone = new FHIR.ContactPoint;
    const practitionerEmail = new FHIR.ContactPoint;

    practitionerPhone.system = 'phone';
    practitionerPhone.use = 'work';
    practitionerPhone.value = this.accountFormGroup.get('phoneNumber').value;

    practitionerEmail.system = 'email';
    practitionerEmail.use = 'work';
    practitionerEmail.value = this.accountFormGroup.get('email').value;

    practitionerRef.reference = 'Practitioner/' + practitioner.id;
    practitionerOrg.reference = 'Organization/' + this.accountFormGroup.get('departmentName').value;
    practitionerLoc.reference = 'Location/' + this.accountFormGroup.get('departmentBranch').value;


    practitionerCoding.system = 'https://bcip.smilecdr.com/fhir/practitionerrole';
    practitionerCoding.display = this.accountFormGroup.get('role').value;

    if (this.cleanRoleValue(this.accountFormGroup.get('role').value) === 'superuser') {
      practitionerCoding.code = 'superuser';
    }

    if (this.cleanRoleValue(this.accountFormGroup.get('role').value) === 'manager') {
      practitionerCoding.code = 'manager';
    }

    if (this.cleanRoleValue(this.accountFormGroup.get('role').value) === 'clinician') {
      practitionerCoding.code = 'clinician';
    }

    if (this.cleanRoleValue(this.accountFormGroup.get('role').value) === 'registry') {
      practitionerCoding.code = 'registry';
    }

    if (this.cleanRoleValue(this.accountFormGroup.get('role').value) === 'administrativeofficer') {
      practitionerCoding.code = 'admin';
    }

    if (this.cleanRoleValue(this.accountFormGroup.get('role').value) === 'clientdepartment') {
      practitionerCoding.code = 'clientdept';
    }

    if (this.cleanRoleValue(this.accountFormGroup.get('role').value) === 'businessuser') {
        practitionerCoding.code = 'businessuser';
    }

    practitionerCode.coding = [practitionerCoding];
    practitionerCode.text = this.accountFormGroup.get('roleDescription').value;


    practitionerRole.telecom = [practitionerPhone, practitionerEmail];
    practitionerRole.organization = practitionerOrg;
    practitionerRole.location = [practitionerLoc];
    practitionerRole.practitioner = practitionerRef;
    practitionerRole.resourceType = 'PractitionerRole';
    practitionerRole.active = true;
    practitionerRole.code = [practitionerCode];

    const finalJSON  = JSON.stringify(practitionerRole);

    this.userService.savePractitionerRole(finalJSON).subscribe(
      data => console.log('Success! A role has been assigned: ', data),
      error => this.handleError(error)
    );
  }
  /**
   * Captures the response from the server after posting a Practitioner object,
   * only taking the ID, and name info from the form, to resue in other objects.
   * Important for the User Object and PractitionerRole, as they both depend on
   * the Practitioner ID from the server response. Takes in an Object.
   * @param data
   */
  capturePractitionerPieces(data) {

    // Create a custom, temporary object for storing the data fields
    const temp = {};

    // Only add values from the data input if data exists
    if (data) {
        temp['id'] = data['id'];
        temp['family'] = this.accountFormGroup.get('family').value;
        temp['given'] = this.accountFormGroup.get('given').value;
        temp['role'] = this.accountFormGroup.get('role').value;
        temp['phone'] = this.accountFormGroup.get('phoneNumber').value;
        temp['email'] = this.accountFormGroup.get('email').value;
        temp['roleDescription'] = this.accountFormGroup.get('roleDescription').value;
        temp['regionalOffice'] = this.accountFormGroup.get('regionalOffice').value;
        temp['districtOffice'] = this.accountFormGroup.get('districtOffice').value;
        temp['departmentName'] = this.accountFormGroup.get('departmentName').value;
        temp['departmentBranch'] = this.accountFormGroup.get('departmentBranch').value;
    }

    /**
     * Store the values from the temp object into the practitionerPieces object.
     */

    this.practitionerPieces = temp;

  }

  /**
   * Takes in a Role string, and converts it to lowercase, making it easier to
   * compare the value when applying condidtional logic. To keep values consistent,
   * we also trim any spaces, in the off change we have a role with two words,
   * such as Super User.
   * @param role
   */
  cleanRoleValue(role: string) {
    return role.toLowerCase().replace(/\s/g, '');
  }

  /**
   * Used in conjunction with the user service. Gets all Regional Offices
   * stored on the server to link to a Practitioner.
   * @param data
   */
  populateRegionalOffices(data: any) {
    data.entry.forEach(element => {
      this.regionalOffices.push(element.resource);
    });
  }

  /**
   * Used in conjunction with the user service. Gets all District Offices
   * stored on the server to link to a Practitioner.
   * @param data
   */
  populateDistrictOffices(data: any) {
    data.entry.forEach(element => {
      this.districtOffices.push(element.resource);
    });
  }

  /**
   * Used in conjunction with the user service. Gets all Department Names
   * stored on the server to link to a Practitioner.
   * @param data
   */
  populateDeptNames(data: any) {
    data.entry.forEach(element => {
      this.deptName.push(element.resource);
    });
  }

  /**
   * Used in conjunction with the user service. Gets all Department Branches
   * stored on the server to link to a Practitioner.
   * @param data
   */
  populateDeptBranches(data: any) {
    data.entry.forEach(element => {
      this.deptBranch.push(element.resource);
    });
  }

  /**
   * Displays the error message from the server in the case a subscription fails.
   * @param error
   */
  handleError(error: any) {
    console.log(error);
  }

  /**
   * Disables inputs when returning back to edit the account details. Useful
   * for disabling the textboxes during the confirmation screen. Also allows
   * for the header at the top to change text, asking the user if they want
   * to continue before posting the data to the server.
   */
  disableInputsBeforeSubmission() {

    if (this.validateForm()) {
      this.confirmSubmit = true;
      this.accountFormGroup.disable();
      this.accountFormGroup.updateValueAndValidity();

    }

  }

  /**
   * Enables inputs when returning back to edit the account details. Useful
   * for disabling the textboxes during the confirmation screen
   */
  returnToEditInputs() {

    this.activateSubmitButton = false;
    this.confirmSubmit = false;
    this.accountFormGroup.enable();
    this.accountFormGroup.updateValueAndValidity();

  }

  /**
   * Checks the form to see if it's valid, and set a flag to true.
   * Important for making sure the submit button turns on properly,
   * as disabling any inputs in an Angular Form means the entire form
   * object is invalid, regardless of whether or not the form really is
   * valid.
   */
  validateForm() {
    if (this.accountFormGroup.valid) {
      this.activateSubmitButton = true;
    }
    return this.activateSubmitButton;
  }

}
