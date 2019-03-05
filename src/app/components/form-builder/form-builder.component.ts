import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  NgControlStatusGroup
} from '@angular/forms';
import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';
import { Router } from '@angular/router';
import { QrequestService } from 'src/app/service/qrequest.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { TranslateService } from '@ngx-translate/core';
import { TitleCasePipe } from '@angular/common';
import * as FHIR from '../../interface/FHIR';

export interface AllDropDownType {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent implements OnInit {
  constructor(
    public translate: TranslateService,
    private router: Router,
    private userService: UserService,
    private patientService: PatientService,
    private fb: FormBuilder,
    private oauthService: OAuthService
  ) {}

  testVar;
  questionnaireItemsGroup = [];
  questionnaireFormGroup: FormGroup;
  subItemGroup: FormGroup;
  linkSubItemToItem = false;
  currentItem;
  incremement = 0;
  questionnaireForDisplay;

  questionType: AllDropDownType[] = [
    { value: 'group', viewValue: 'group' },
    { value: 'display', viewValue: 'display' },
    { value: 'boolean', viewValue: 'boolean' },
    { value: 'decimal', viewValue: 'decimal' },
    { value: 'integer', viewValue: 'integer' },
    { value: 'date', viewValue: 'date' },
    { value: 'dateTime +', viewValue: 'dateTime +' }
  ];

  languageType: AllDropDownType[] = [
    { value: 'en-CA', viewValue: 'English' },
    { value: 'fr', viewValue: 'French' }
  ];

  ngOnInit() {
    this.questionnaireFormGroup = this.fb.group({
      identifier: new FormControl(''),
      question: new FormControl(''),
      code: new FormControl(''),
      type: new FormControl(''),
      language: new FormControl(''),
      category: new FormControl('')
    });

    this.subItemGroup = this.fb.group({
      question: new FormControl(''),
      code: new FormControl(''),
      type: new FormControl(''),
      category: new FormControl('')
    });
  }

  newQuestionnaireItem($event) {
    const item = new FHIR.Item();
    this.incremement += 0.01;
    const fixedNum = Number(this.incremement.toFixed(2));
    console.log(this.incremement, fixedNum);
    const linkId = Number(this.currentItem['linkId']) + fixedNum;

    item.linkId = linkId.toString();
    item.text = this.subItemGroup.get('question').value;
    item.type = this.subItemGroup.get('type').value;

    // this.currentItem['item'];
    this.currentItem['item'].push(item);
    console.log(this.currentItem);
    // this.newQuestionnaireCategory();
  }

  newQuestionnaireCategory() {
    const mainItem = new FHIR.Item;
    const coding = new FHIR.Coding;

    coding.code = this.questionnaireFormGroup.get('code').value;

    const linkId = this.questionnaireItemsGroup.length + 1;

    mainItem.linkId = linkId.toString();
    mainItem.text = this.questionnaireFormGroup.get('question').value;
    mainItem.type = this.questionnaireFormGroup.get('type').value;
    mainItem.item = [];
    this.questionnaireItemsGroup.push(mainItem);
    this.incremement = 0;
    this.currentItem = mainItem;
    // console.log(this.currentItem);
  }

  saveQuestionnaire() {
    const baseQuestionnaire = new FHIR.Questionnaire();
    const questionnaireIdentifier = new FHIR.Identifier();

    questionnaireIdentifier.value = this.questionnaireFormGroup.get(
      'identifier'
    ).value;
    baseQuestionnaire.resourceType = 'Questionnaire';
    baseQuestionnaire.identifier = [questionnaireIdentifier];
    baseQuestionnaire.item = this.questionnaireItemsGroup;
    baseQuestionnaire.status = 'active';

    baseQuestionnaire.language = this.questionnaireFormGroup.get(
      'language'
    ).value;
    this.questionnaireForDisplay = JSON.stringify(baseQuestionnaire, undefined, 2);
    console.log(baseQuestionnaire);
  }

  saveItems() {}

  showSubItemBasedOnSelection(event) {
    if (event.includes('group')) {
      this.linkSubItemToItem = !this.linkSubItemToItem;
    }
  }
}
