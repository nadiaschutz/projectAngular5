import { Component, OnInit, OnDestroy } from '@angular/core';
import { StaffService } from '../../../../service/staff.service';
import { UtilService } from '../../../../service/util.service';
import { UserService } from '../../../../service/user.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as FHIR from '../../../../interface/FHIR';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { PatientService } from 'src/app/service/patient.service';
@Component({
  selector: 'app-immunization-screen',
  templateUrl: './immunization-screen.component.html',
  styleUrls: ['./immunization-screen.component.scss']
})
export class ImmunizationScreenComponent implements OnInit {

  clinicalQuestionnaireArray = [];
  clinicialFormGroup: FormGroup;
  vaccinationFormGroup: FormGroup;

  showVaccineForm = false;

  constructor(private staffService: StaffService,
    private utilService: UtilService,
    private formBuilder: FormBuilder,
    private oAuthService: OAuthService,
    private userService: UserService,
    private router: Router) { }

  ngOnInit() {
    let enableClinicalPiece = false;

    if (sessionStorage.getItem('userRole')) {
      if (sessionStorage.getItem('userRole') === 'clinician') {
        this.clinicialFormGroup = this.formBuilder.group({
          historyNotes: new FormControl('')
        });
        this.vaccinationFormGroup = this.formBuilder.group({
          dateAdministered: new FormControl(''),
          vaccine: new FormControl(''),
          dose: new FormControl(''),
          site: new FormControl(''),
          productName: new FormControl(''),
          lotNumber: new FormControl(''),
          expirationDate: new FormControl(''),
          diluentLotNumber: new FormControl(''),
          adminBy: new FormControl('')
        });
        this.staffService
          .getAnyFHIRObjectByCustomQuery(
            'Questionnaire?identifier=IMMUNREV&_language=en-CA'
          )
          .subscribe(
            data => {
              this.processClinicalQuestionnaire(data);
            },
            error => {
              console.log(error);
            },
            () => {
              enableClinicalPiece = true;
            }
          );
      }
    }

  }

  processClinicalQuestionnaire(data) {
    if (data) {
      if (data['entry']) {
        for (const currentEntry of data['entry']) {
          const individualEntry = currentEntry['resource'];
          individualEntry['item'].forEach(element => {
            const temp = {};
            temp['id'] = element['linkId'];
            temp['text'] = element['text'];
            temp['type'] = element['type'];
            temp['code'] = element['code'];
            if (element.item) {
              temp['items'] = new Array();
              element.item.forEach(items => {
                const itemObj = {
                  id: items['linkId'],
                  code: items['code'],
                  type: items['type'],
                  text: items['text'],
                  checked: false
                };
                if (items['item']) {
                  itemObj['item'] = items['item'];
                }
                temp['items'].push(itemObj);
              });
            }
            this.clinicalQuestionnaireArray.push(temp);
          });
          console.log(this.clinicalQuestionnaireArray);
        }
      }
    }
  }

}