import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';

import { distinctUntilChanged } from 'rxjs/operators';

import { TitleCasePipe } from '@angular/common';
import { UserService } from '../../service/user.service';

import { TranslateService } from '@ngx-translate/core';
import * as FHIR from '../../interface/FHIR';
import * as SMILE from '../../interface/SMILE';
import { AdminHomeScreenService } from 'src/app/service/admin-home-screen.service';
import { PatientService } from '../../service/patient.service';

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

  role;
  regionalOffice;
  districtOffice;
  departmentName;
  departmentBranch;

  regionalOffices = [];
  districtOffices = [];
  jobLocationList = [];
  employeeDepartmentList = [];

  practitionerPieces = {};
  confirmSubmit = false;
  successHeaderCheck;
  activateSubmitButton = null;
  chargeback = false;

  showSuccessMessage = false;
  showFailureMessage = false;
  failureMessage = '';

  constructor(
    private fb: FormBuilder,
    public translate: TranslateService,
    private userService: UserService,
    private titleCase: TitleCasePipe,
    private adminHomeScreenService: AdminHomeScreenService,
    private patientService: PatientService
  ) { }

  accountTypes: AccountType[] = [
    { value: 'Client Department', viewValue: 'Client Department' },
    { value: 'PSOHP', viewValue: 'PSOHP' }
  ];

  roleTypes: RoleType[] = [
    { value: 'superuser', viewValue: 'Super User' },
    { value: 'manager', viewValue: 'Manager' },
    { value: 'clinician', viewValue: 'Clinician' },
    { value: 'registry', viewValue: 'Registry' },
    { value: 'admin', viewValue: 'Administrative Officer' },
    { value: 'clientdept', viewValue: 'Client Department' },
    { value: 'businessuser', viewValue: 'Business User' }
  ];

  ngOnInit() {
    this.showSuccessMessage = false;
    this.showFailureMessage = false;
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
    // this.userService
    //   .fetchAllDistrictOffices()
    //   .subscribe(
    //     data => this.populateDistrictOffices(data),
    //     error => this.handleError(error)
    //   );

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
        Validators.minLength(9),
        Validators.maxLength(9)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ]),
      role: new FormControl('', Validators.required),
      roleDescription: new FormControl(''),
      phoneNumber: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10)
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      regionalOffice: new FormControl(''),
      districtOffice: new FormControl(''),
      departmentName: new FormControl('', Validators.required),
      departmentBranch: new FormControl('', Validators.required),
      chargeback: new FormControl(''),
      lro: new FormControl('')
    });

    this.onChanges();
    this.getAndSetDepartmentList();

  }

  onChanges(): void {
    // listen to one particular field for form change
    this.accountFormGroup.get('departmentName')
      .valueChanges
      .subscribe(val => {
        if (val !== '') {
          console.log(val);
          // get job locations dropdown items
          this.adminHomeScreenService.getJobLocations({ organization: val })
            .subscribe(locations => {
              this.jobLocationList = this.extractKeyValuePairsFromBundle(locations);
              this.accountFormGroup.get('departmentBranch').enable();
              console.log(this.jobLocationList);
            },
              (err) => {
                console.log('Job locations list error => ', err);
              });
        } else {
          this.accountFormGroup.get('departmentBranch').disable();
          this.jobLocationList = [];
        }
      });

      this.accountFormGroup.get('regionalOffice')
      .valueChanges
      .subscribe(val => {
        if (val !== '') {
          // get job locations dropdown items
          this.adminHomeScreenService.getDistrictLocations({ organization: val })
            .subscribe(locations => {
              this.districtOffices = this.extractKeyValuePairsFromBundle(locations);
              this.accountFormGroup.get('districtOffice').enable();
              console.log(this.districtOffices);
            },
            (err) => {
              console.log('Job locations list error => ', err);
            });
          } else {
          this.accountFormGroup.get('districtOffice').disable();
          this.districtOffices = [];
        }
      });
  }


  getAndSetDepartmentList() {
    let arrToSort = [];
    this.adminHomeScreenService.getDepartmentNames()
      .subscribe(bundle => {
        arrToSort = this.extractKeyValuePairsFromBundle(bundle);

        this.employeeDepartmentList = arrToSort.sort((obj1, obj2) => {
          const textA = obj1.name.toUpperCase();
          const textB = obj2.name.toUpperCase();
          if (textA > textB) {
            return 1;
          }
          if (textA < textB) {
            return -1;
          }
          return 0;
        });
      },
        (err) => console.log('Employee Department list error', err));
  }
  /**
   * This is the core piece to the New Account Component. Builds a Practitioner
   * FHIR object, populates the fields, makes a POST request, then takes the response,
   * and calls othewr functions to pass the ID generated by the server, and proceed to
   * create & populate other objects.
   */
  async createPractitioner() {

    const employeePRI = this.accountFormGroup.value.id;
    let employeeWithPRI = {};
    await this.patientService.getEmployeeWithPRIAsync(employeePRI).then(async data => {
      if (data['entry']) {
        employeeWithPRI = data;
      } else {
        await this.patientService.getUserWithPRIAsync(employeePRI).then(userData => {
          if (userData['entry']) {
            employeeWithPRI = userData;
          }
        });
      }
    }).catch(error => {
      console.log(error);
    });

    if (employeeWithPRI['id']) {
      // An employee records exists with the same PRI
      this.showSuccessMessage = false;
      this.showFailureMessage = true;
      this.failureMessage = 'An employee with the same PRI exists';
    } else {
      // Initialize the base classes we need
      const practitioner = new FHIR.Practitioner;
      const pracName = new FHIR.HumanName;
      const pracIdentifier = new FHIR.Identifier;

      // Set the identifier for the Practitioner
      pracIdentifier.system = 'https://bcip.smilecdr.com/smile/Practitioners';
      pracIdentifier.value = this.accountFormGroup.get('pri').value;

      // Set the users name
      pracName.family = this.accountFormGroup.get('family').value;
      pracName.given = [this.accountFormGroup.get('given').value];

      // Add all objects back to the base class
      practitioner.name = [pracName];
      practitioner.identifier = [pracIdentifier];
      practitioner.resourceType = 'Practitioner';

      // Stringify the object for posting
      const finalJSON = JSON.stringify(practitioner);

      /**
       * Calls the savePractitioner function in the user service.
       * On success, it'll create the Practitioner, followed by capturing
       * the response in capturePractitionerPieces, then create the
       * PractitionerRole and User Account with the captured data.
       *
       * If uncesseful, it'll throw an error.
       */

      if (this.accountFormGroup.get('departmentName').value &&
        this.accountFormGroup.get('departmentBranch').value) {
        this.userService.savePractitioner(finalJSON).subscribe(
          data => {
            this.successHeaderCheck = true;
            this.disableInputsBeforeSubmission();
            this.confirmSubmit = !this.confirmSubmit;
            console.log('Success! A practitioner has been created: ', data);
            this.capturePractitionerPieces(data);
            this.createUser(data);
            if (this.accountFormGroup.get('regionalOffice').value) {
              this.createPractitionerRoleForOffices(this.practitionerPieces);
            }
            this.createPractitionerRoleForDepartments(this.practitionerPieces);
            this.showFailureMessage = false;
            this.showSuccessMessage = true;
          },
          error => {
            this.handleError(error);
          },
          () => {
            this.practitionerPieces = {};
          }
        );
      }
    }

  }

  // Creates a Smile CDR user in the system. Note that this is not a FHIR object,
  // but is linked to & related to a FHIR object (specifically Practitioner), based
  // on the FHIR object's ID.
  createUser(practitioner: any) {
    this.mapAuthorities().then(
      authorities => {
        const smileUser = new SMILE.UserAccount;
        const launchContext = new SMILE.DefaultLaunchContext;

        launchContext.contextType = 'practitioner';
        launchContext.resourceId = practitioner['id'];
        smileUser.defaultLaunchContexts = [launchContext];

        smileUser.authorities = authorities;
        smileUser.givenName = this.accountFormGroup.get('given').value;
        smileUser.familyName = this.accountFormGroup.get('family').value;
        const username = this.accountFormGroup.get('given').value.toLocaleLowerCase() + '.'
        + this.accountFormGroup.get('family').value.toLocaleLowerCase();
        // smileUser.username = this.accountFormGroup.get('pri').value;
        smileUser.username = username;
        smileUser.email = this.accountFormGroup.get('email').value;
        smileUser.password = this.accountFormGroup.get('password').value;

        const finalJSON = JSON.stringify(smileUser);
        console.log(finalJSON, smileUser);

        this.userService.createAccount(finalJSON).subscribe(
          data => console.log('Success! Account Created!', data),
          error => this.handleError(error)
        );
      }
    );
    // Set up the launch context of the user, this is used to link the
    //  acounnt with a Practitioner FHIR object

  }

  async mapAuthorities() {

    const authorityList = new Array<SMILE.Authority>();
    const selectedRole = this.accountFormGroup.get('role').value;

    await this.userService.getPermissionListAsync().then(
      role => {
        if (role) {
          const permissionSet = role[selectedRole];
          if (permissionSet) {
            for (const permission of permissionSet) {
              const authorities = new SMILE.Authority;
              authorities.permission = permission['permission'];
              if (permission['argument']) {
                authorities.argument = permission['argument'];
              }
              authorityList.push(authorities);
            }
          }
        }
      }).catch(
        error => {
          console.log(error);
        }
      );
    console.log(authorityList);

    return authorityList;

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
    const practitionerChargeBack = new FHIR.CodeableConcept;
    const practitionerChargeBackCoding = new FHIR.Coding;
    const practitionerLRO = new FHIR.CodeableConcept;
    const practitionerLROCoding = new FHIR.Coding;
    practitionerPhone.system = 'phone';
    practitionerPhone.use = 'work';
    practitionerPhone.value = this.accountFormGroup.get('phoneNumber').value;

    practitionerEmail.system = 'email';
    practitionerEmail.use = 'work';
    practitionerEmail.value = this.accountFormGroup.get('email').value;

    practitionerRef.reference = 'Practitioner/' + practitioner['id'];
    practitionerOrg.reference = 'Organization/' + this.accountFormGroup.get('regionalOffice').value;
    practitionerLoc.reference = 'Location/' + this.accountFormGroup.get('districtOffice').value;

    if (this.accountFormGroup.get('lro').value === true) {
      practitionerLROCoding.system = 'https://bcip.smilecdr.com/fhir/lroclient';
      practitionerLROCoding.code = 'LROCLIENT';
      practitionerLROCoding.display = 'LRO Client';
      practitionerLRO.coding = [practitionerLROCoding];
    }

    if (this.chargeback) {
      practitionerChargeBackCoding.system = 'https://bcip.smilecdr.com/fhir/clientchargeback';
      practitionerChargeBackCoding.code = 'CHARGEBACK';
      practitionerChargeBackCoding.display = 'Charge Back Client';
      practitionerChargeBack.coding = [practitionerChargeBackCoding];
    }

    practitionerCoding.system = 'https://bcip.smilecdr.com/fhir/practitionerrole';
    practitionerCoding.display = this.titleCase.transform(
      this.accountFormGroup.get('role').value
    );

    practitionerCoding.code = this.accountFormGroup.get('role').value;

    practitionerCode.coding = [practitionerCoding];
    practitionerCode.text = this.accountFormGroup.get('roleDescription').value;

    if (this.chargeback || this.accountFormGroup.get('lro').value === true) {
      practitionerRole.specialty = [];
      if (this.chargeback) {
        practitionerRole.specialty.push(practitionerChargeBack);
      }
      if (this.accountFormGroup.get('lro').value === true) {
        practitionerRole.specialty.push(practitionerLRO);
      }
    }

    practitionerRole.telecom = [practitionerPhone, practitionerEmail];
    practitionerRole.organization = practitionerOrg;
    practitionerRole.location = [practitionerLoc];
    practitionerRole.practitioner = practitionerRef;
    practitionerRole.resourceType = 'PractitionerRole';
    practitionerRole.active = true;
    practitionerRole.code = [practitionerCode];

    const finalJSON = JSON.stringify(practitionerRole);

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
    const practitionerChargeBack = new FHIR.CodeableConcept;
    const practitionerChargeBackCoding = new FHIR.Coding;
    const practitionerLRO = new FHIR.CodeableConcept;
    const practitionerLROCoding = new FHIR.Coding;
    const identifier = new FHIR.Identifier;
    practitionerPhone.system = 'phone';
    practitionerPhone.use = 'work';
    practitionerPhone.value = this.accountFormGroup.get('phoneNumber').value;

    practitionerEmail.system = 'email';
    practitionerEmail.use = 'work';
    practitionerEmail.value = this.accountFormGroup.get('email').value;

    practitionerRef.reference = 'Practitioner/' + practitioner['id'];
    practitionerOrg.reference = this.accountFormGroup.get('departmentName').value;
    practitionerLoc.reference = this.accountFormGroup.get('departmentBranch').value;
    console.log(practitionerOrg.reference, practitionerLoc.reference, this.accountFormGroup.get('role').value);

    if (this.accountFormGroup.get('lro').value === true) {
      practitionerLROCoding.system = 'https://bcip.smilecdr.com/fhir/lroclient';
      practitionerLROCoding.code = 'LROCLIENT';
      practitionerLROCoding.display = 'LRO Client';
      practitionerLRO.coding = [practitionerLROCoding];
    }

    if (this.chargeback) {
      practitionerChargeBackCoding.system = 'https://bcip.smilecdr.com/fhir/clientchargeback';
      practitionerChargeBackCoding.code = 'CHARGEBACK';
      practitionerChargeBackCoding.display = 'Charge Back Client';
      practitionerChargeBack.coding = [practitionerChargeBackCoding];
    }


    practitionerCoding.system = 'https://bcip.smilecdr.com/fhir/practitionerrole';
    practitionerCoding.display = this.titleCase.transform(
      this.accountFormGroup.get('role').value
    );

    practitionerCoding.code = this.accountFormGroup.get('role').value;

    practitionerCode.coding = [practitionerCoding];
    practitionerCode.text = this.accountFormGroup.get('roleDescription').value;

    if (this.chargeback || this.accountFormGroup.get('lro').value === true) {
      practitionerRole.specialty = [];
      if (this.chargeback) {
        practitionerRole.specialty.push(practitionerChargeBack);
      }
      if (this.accountFormGroup.get('lro').value === true) {
        practitionerRole.specialty.push(practitionerLRO);
      }
    }

    identifier.value = 'DEPT&BRANCH';

    practitionerRole.identifier = [identifier];
    practitionerRole.telecom = [practitionerPhone, practitionerEmail];
    practitionerRole.organization = practitionerOrg;
    practitionerRole.location = [practitionerLoc];
    practitionerRole.practitioner = practitionerRef;
    practitionerRole.resourceType = 'PractitionerRole';
    practitionerRole.active = true;
    practitionerRole.code = [practitionerCode];

    const finalJSON = JSON.stringify(practitionerRole);

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
    if (data.entry) {
      data.entry.forEach(element => {
        this.districtOffices.push(element.resource);
      });
    }
  }

  /**
   * Used in conjunction with the user service. Gets all Department Branches
   * stored on the server to link to a Practitioner.
   * @param data
   */

  updateCheckbox(e) {
    this.chargeback = e.target.checked;
  }


  extractKeyValuePairsFromBundle(bundle) {
    if (bundle && bundle['entry']) {
      const bundleEntries = bundle['entry'];
      const list = bundleEntries.map(item => {
        if (item && item.resource) {
          const temp = {
            id: item.resource.resourceType + '/' + item.resource.id,
            name: item.resource.name
          };

          return temp;
        }
        return { value: null, text: null };
      });

      return list;
    }
    return [];
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
