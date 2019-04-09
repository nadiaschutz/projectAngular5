import { Component, OnInit, ViewChild, SkipSelf, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { UserService } from '../../service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { QuestionnaireService } from '../../service/questionnaire.service';
import { Item } from '../models/item.model';
import { Element } from '../models/element.model';
import { forEach } from '@angular/router/src/utils/collection';
import { ItemToSend } from '../models/itemToSend.model';
import { PatientService } from 'src/app/service/patient.service';
import { formatDate } from '@angular/common';
import { DatePipe } from '@angular/common';
import { StaffService } from '../../service/staff.service';

import * as FHIR from '../../interface/FHIR';
import { link } from 'fs';


// for custom form components to work
import { Validators } from '@angular/forms';
import { Field } from '../dynamic-forms/field.interface';
import { FieldConfig } from '../dynamic-forms/field-config.interface';
import { DynamicFormComponent } from '../dynamic-forms/dynamic-form.component';
import { CustomValidator } from '../dynamic-forms/custom-validator';
import { FileDetector } from 'protractor';
import { ValueAddress } from 'src/app/interface/organization';
import { element } from '@angular/core/src/render3/instructions';
import { e } from '@angular/core/src/render3';
import { runInThisContext } from 'vm';
import { IfStmt } from '@angular/compiler';
import { DraggableItemService } from 'ngx-bootstrap';
import { filter } from 'rxjs/operators';

class TextInput {
  static create(event: FieldConfig) {
    return {
      type: event.type,
      label: event.label,
      inputType: event.inputType,
      name: event.name,
      typeElem: event.typeElem,
    };
  }
}


class CommentInput {
  static create(event: FieldConfig) {
    return {
      type: event.type,
      label: event.label,
      inputType: event.inputType,
      name: event.name,
      typeElem: event.typeElem,
    };
  }
}

class SelectField {
  static create(event: FieldConfig) {
    return {
      type: event.type,
      label: event.label,
      inputType: event.inputType,
      name: event.name,
      typeElem: event.typeElem,
    };
  }
}


@Component({
  selector: 'app-new-service-request',
  templateUrl: './new-service-request.component.html',
  styleUrls: ['./new-service-request.component.scss'],
  providers: [DatePipe]
})
export class NewServiceRequestComponent implements OnInit, AfterViewInit {
  // @ViewChild('advReqForm') form: NgForm;
  // serviceRequestResponce: ServiceRequestResponce = {
  // };

  // tslint:disable-next-line:max-line-length
  listOfCode = ['HACAT1', 'HACAT2', 'HACAT3', 'FTWORK', 'SUBUYB', 'SUREMG', 'SUSURB', 'THSOTT', 'THPPC1', 'THPPC3', 'THCRC1', 'THCRC3', 'THREC3', 'IMREVW'];
  listOfCodes = [
    ['HA', 'PREP', 'HACAT1'],
    ['HA', 'PREP', 'HACAT2'],
    ['HA', 'PREP', 'HACAT3'],
    ['HA', 'PERIOD', 'HACAT1'],
    ['HA', 'PERIOD', 'HACAT2'],
    ['HA', 'PERIOD', 'HACAT3'],

    ['SUPER', 'SUBUYB'],
    ['SUPER', 'SUREMG'],
    ['SUPER', 'SUSURB'],

    ['PTH', 'THSOTT'],
    ['PTH', 'THPPC1'],
    ['PTH', 'THPPC3'],
    ['PTH', 'THCRC1'],
    ['PTH', 'THCRC3'],
    ['PTH', 'THREC3'],

    ['FTWORK'],
    ['IMREVW']

  ];
  options = [];

  style = 'col-11';
  configuration;
  userName;
  userRole;
  loaded = false;
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
  config: FieldConfig[] = [];

  departmentList = [];
  currentUserDepartment;

  // formId = 'TEST4';
  formCreated = false;

  responseId = null;
  clientId = null;
  smileUserId = null;
  clientGivenName = null;
  clientFamilyName = null;
  clientBoD = null;

  documents;
  fileLink = [];
  documentReference = {};

  disableInputsForReview = false;
  createdsuccessfully = false;

  today = new Date();
  todayPiped;


  dependents = false;
  employeeType;
  dependentsList = [];
  dependentBoolean = false;
  dependentNumber = null;
  qrequest: any;

  questionsList = [];

  submitingFormData: {
    formId: any;
    itemToSend: any;
  };

  // itemToSend: FHIR.QuestionnaireResponse;
  itemReference;

  itemsToSend = [];

  itemToSend: ItemToSend = {
    resourceType: '',
    questionnaire: null,
    status: null,
    subject: null,
    authored: null,
    item: []
  };

  items: Item[];

  item: Item = {
    linkId: '',
    text: '',
    answer: null,
    code: null
  };


  trackByEl(index: number, el: any): string {
    return el.linkId;
  }

  constructor(
    public translate: TranslateService,
    private questionnaireService: QuestionnaireService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private patientService: PatientService,
    private oauthService: OAuthService,
    private datePipe: DatePipe,
    private staffService: StaffService
  ) {

  }

  ngOnInit() {
    this.userRole = sessionStorage.getItem('userRole');
    console.log('userRole', this.userRole);
    this.todayPiped = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
    console.log(this.formCreated);
    this.employeeType = sessionStorage.getItem('emplType');
    if (this.employeeType === 'Employee') {
      const depList = sessionStorage.getItem('dependents');
      this.dependentsList = JSON.parse(depList);
    }


    this.clientGivenName = sessionStorage.getItem('emplGiven');
    this.clientFamilyName = sessionStorage.getItem('emplFam');
    this.activatedRoute.data.subscribe(data => this.getFormData(data.fields));
    this.activatedRoute.data.subscribe(data => this.populateDeptNames(data.departments));
    this.userName = sessionStorage.getItem('userName');
    this.currentUserDepartment = sessionStorage.getItem('userDept');
    this.createdsuccessfully = false;
    this.clientId = sessionStorage.getItem('patientSummaryId');


    if (!this.clientId) {
      this.router.navigateByUrl('/dashboard');
    }

    console.log(this.dependentsList);
  }

  wrap() {
    const x = $('.field-holder-2 form-input');
    for (let i = 0; i < x.length; i++) {
      $(x[i]).wrap('<div class=\'' + this.style + '\'></div>');
    }
  }

  addDiv() {
    const sections = $('.dynamic-form .' + this.style);
    for (let i = 0; i < sections.length; i += 2) {
      sections.slice(i, i + 2).wrapAll('<div class=\'row\'></div>');
    }
  }


  populateDeptNames(data: any) {
    data.entry.forEach(department => {
      if (department['resource']['name']) {
        this.departmentList.push(department['resource']['name']);
      }
    });
  }



  onCancel() {
    sessionStorage.removeItem('patientSummaryId');
    this.router.navigate(['/servreqmain']);
  }


  // submit(value: { [name: string]: any }) {
  async submit() {
    const value = this.form.getRawValue;
    const list = Object.entries(value)
      .filter(([key]) => key.includes('dependent'))
      .map(([key, val]) => ({
        key, val
      }));

    if (list.length) {
      this.dependentsList.forEach((el, ind) => {
        list.forEach((listItem, index) => {
          if (index === ind) {
            el.value = listItem.val;
          }
        });
      });
    }



    this.items.forEach(indivElem => {

      // tslint:disable-next-line:forin
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          if (key === indivElem.linkId) {
            indivElem.answer = value[key];
            if (typeof indivElem.answer === 'string') {
              this.options.forEach(option => {
                if (option.display === indivElem.answer) {
                  indivElem.code = option.code;
                }
              });
            }
          }
        }
      }
    });

    // console.log('ITEMS on submit after change', this.items);


    const selectItems = [];
    let resultItem;
    this.items.forEach((indivElem) => {
      if (typeof indivElem.answer === 'string') {
        this.listOfCodes.forEach(code => {
          code.forEach((co) => {
            if (indivElem.code === co) {
              if (selectItems.indexOf(indivElem) < 0) {
                selectItems.push(indivElem);
              }
            }
          });
        });
      }
    });

    // console.log(selectItems);


    resultItem = {
      answer: selectItems.map(x => x.answer).join('-'),
      code: selectItems[selectItems.length - 1].code,
      linkId: selectItems[0].linkId,
      system: selectItems[0].system,
      text: selectItems[0].text,
    };


    this.items.forEach((item) => {
      selectItems.forEach((select, index) => {
        if (index > 0) {
          this.items = this.items.filter(filtered => filtered.linkId !== select.linkId);
        }
      });

      if (item.linkId === resultItem.linkId) {
        item.answer = resultItem.answer;
        item.code = resultItem.code;
        item.system = resultItem.system;
        item.text = resultItem.text;
      }

    });

    // this.disableInputsForReview = true;
    this.savingData();

    for (const request of this.itemsToSend) {
      const questionnaireResponse = await this.staffService.createQuestionnaireResponseAsync(request).catch(error => {
        console.error(error);
      });
      this.formCreated = true;
      this.createEpisodeOfCare(questionnaireResponse);
    }

  }

  async createEpisodeOfCare(questionnaireResponse) {
    const episodeOfCare = new FHIR.EpisodeOfCare();
    episodeOfCare.resourceType = 'EpisodeOfCare';
    episodeOfCare.status = 'planned';

    const type = new FHIR.CodeableConcept();
    type.text = 'Episode of Care';
    episodeOfCare.type = [type];

    const managingOrganization = new FHIR.Reference();
    managingOrganization.reference = 'Organization/NOHIS';

    const patient = new FHIR.Reference();
    patient.reference = questionnaireResponse.subject.reference;
    episodeOfCare.patient = patient;

    const period = new FHIR.Period();
    period.start = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    episodeOfCare.period = period;

    const createdEpisodeOfCare = await this.staffService.saveEpisodeOfCareAsync(JSON.stringify(episodeOfCare)).catch(error => {
      console.error(error);
    });
    console.log(createdEpisodeOfCare);

    // Updating Questionnaire response with the newly created episode of care's id as context
    const reference = new FHIR.Reference();
    reference.reference = '/EpisodeOfCare/' + createdEpisodeOfCare['id'];
    questionnaireResponse['context'] = reference;
    const updatedQR = await this.staffService.updateQuestionnaireResponseAsync(questionnaireResponse).catch(error => {
      console.error(error);
    });
    console.log(updatedQR);
    const psohpServiceType = this.getServiceTypeFromQuestionnaireResponse(questionnaireResponse);
    this.createCarePlan(createdEpisodeOfCare, psohpServiceType);
  }

  async createCarePlan(episodeOfCare, psohpServiceType) {
    if (psohpServiceType.length > 0) {
      const carePlanTemplates = await this.staffService.fetchAllCarePlanTemplatesAsync();
      for (const carePlanTemplateEntry of carePlanTemplates['entry']) {
        const carePlanTemplate = carePlanTemplateEntry.resource;
        if (psohpServiceType === carePlanTemplate['identifier'][0]['value']) {
          console.log(psohpServiceType);
          const carePlan = new FHIR.CarePlan();
          carePlan.resourceType = 'CarePlan';
          carePlan.status = 'active';
          carePlan.intent = 'plan';
          carePlan.subject = episodeOfCare.patient;

          const episodeOfCareReference = new FHIR.Reference();
          episodeOfCareReference.reference =
            'EpisodeOfCare/' + episodeOfCare.id;
          carePlan.context = episodeOfCareReference;

          carePlan.activity = carePlanTemplate['activity'];
          carePlan.description = carePlanTemplate['description'];
          carePlan.identifier = carePlanTemplate['identifier'];

          console.log(carePlan);
          const createdCarePlan = await this.staffService.saveCarePlanAsync(JSON.stringify(carePlan)).catch(error => {
            console.error(error);
          });
          console.log(createdCarePlan);
        }
      }
    }
  }

  getServiceTypeFromQuestionnaireResponse(questionnaireResponse) {

    let serviceType = '';
    if (questionnaireResponse['item']) {
      questionnaireResponse.item.forEach(item => {
        if (item['linkId'] === 'PSOHPSERV') {
          for (const answer of item['answer']) {
            if (answer['valueCoding']) {
              serviceType = answer['valueCoding']['code'];
            }
          }
        }
      });
    } else {
      console.log('buggy one', questionnaireResponse);
    }
    return serviceType;

  }

  backToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

  savingData() {
    // getting itemReference
    this.questionnaireService.newDocumentSubject.subscribe(
      data => this.getDocument(data),
      error => this.handleError(error)
    );

    // pushing document into items arr
    if (this.itemReference) {
      this.items.push(this.itemReference);
    }


    // creating itemToSend
    this.createItemToSend(this.clientId, this.clientGivenName, this.clientFamilyName);
    this.mapItemToItems();
    if (this.dependentsList.length > 0) {
      this.dependentsList.forEach(depend => {
        if (depend.value === true) {
          this.createItemToSend(depend.id, depend.given, depend.family);
        }
      });

    }
    // adding extra items to itemToSend.item[]
    this.mapItemToItems();
    // console.log(this.itemsToSend);
  }



  createItemToSend(id, givenName, famName) {


    this.itemToSend = {
      resourceType: 'QuestionnaireResponse',
      questionnaire: {
        reference: 'Questionnaire/' + this.formId
      },
      status: 'in-progress',
      authored: new Date,
      identifier: {
        value: 'SERVREQ'
      },
      subject: {
        reference: 'Patient/' + id,
        display: givenName + ' ' + famName
      },
      item: []
    };

    this.itemsToSend.push(this.itemToSend);


  }

  mapItemToItems() {
    const itemsFiltered = this.items.filter(itemToStay => itemToStay.answer !== null);
    this.itemToSend.item = itemsFiltered.map(el => {


      if (el.linkId !== '') {

        return {
          linkId: el.linkId,
          text: el.text,
          answer:
            el.text === 'Document' ? [
              {
                valueReference: {
                  reference: el.answer
                }
              }
            ] :
              typeof (el.answer) === 'boolean' ? [
                {
                  valueCoding: {
                    code: el.code,
                    system: el.system,
                    display: el.answer
                  }
                }
              ] :
                typeof (el.answer) === 'string' ? [
                  {
                    valueCoding: {
                      code: el.code,
                      system: el.system,
                      display: el.answer
                    }
                  },
                  // {
                  //   valueString: el.answer
                  // }
                ] :
                  null
        };

      }


    });
  }

  getDocument(data) {
    this.itemReference = data;
  }



  handleErrorClientError(error) {
    console.log(error);
  }


  getFormData(data) {
    this.qrequest = data.item;
    console.log('QREQ', this.qrequest);

    this.configuration = this.qrequest.map(el => {
      // text
      // if (el.type === 'text') {
      if (el.code[1].code === 'PHONE') {
        const formField = this.textInput(el);
        const enableWhen = this.populateEnableWhenObj(el);

        formField['placeholder'] = 'type your phone';
        formField['validation'] = el.enableWhen ? [
          Validators.pattern(
            '^[(]{0,1}[0-9]{3}[)]{0,1}[-s.]{0,1}[0-9]{3}[-s.]{0,1}[0-9]{4}$'
          )
        ] : [
            Validators.required,
            Validators.pattern(
              '^[(]{0,1}[0-9]{3}[)]{0,1}[-s.]{0,1}[0-9]{3}[-s.]{0,1}[0-9]{4}$'
            )
          ];
        // formField['enableWhenQ'] = el.enableWhen ? el.enableWhen[0].question : false;
        // formField['enableWhenA'] = el.enableWhen ? el.enableWhen[0].answerCoding.display : false;
        formField['enableWhen'] = el.enableWhen ? enableWhen : false;
        formField['required'] = el.required ? true : false;
        formField['value'] = null;
        formField['elementClass'] = el.enableWhen ? 'enable-when-hide' : 'enable-when-show';
        return formField;


      } else if (el.code[1].code === 'DATE') {


        const enableWhen = this.populateEnableWhenObj(el);
        return {
          type: 'date',
          typeElem: el.code[1].code,
          label: el.text,
          inputType: 'text',
          placeholder: 'datepicker',
          name: el.linkId,
          enableWhen: el.enableWhen ? enableWhen : false,
          required: el.required ? true : false,
          // enableWhenQ: el.enableWhen ? el.enableWhen[0].question : false,
          // enableWhenA: el.enableWhen ? el.enableWhen[0].answerCoding.display : false,
          elementClass: el.enableWhen ? 'enable-when-hide' : 'enable-when-show',
          value: null
        };

      } else if (el.code[1].code === 'TEXT') {

        if (el.code[0].code === 'AUTHOR') {
          const formField = this.textInput(el);
          formField['readonly'] = true;
          formField['required'] = el.required ? true : false;
          return formField;
        } else if (el.code[0].code === 'DATECR') {
          const formField = this.textInput(el);
          formField['readonly'] = true;
          formField['required'] = el.required ? true : false;
          return formField;
        } else if (el.code[0].code === 'USERDEPT') {
          if (this.userRole === 'clientdept') {
            const options = this.departmentList;

            const enableWhen = this.populateEnableWhenObj(el);

            return {
              type: 'selectSr',
              typeElem: el.code[1].code,
              label: el.text,
              name: el.linkId,
              enableWhen: el.enableWhen ? enableWhen : false,
              options: options,
              flag: el.enableWhen ? false : true,
              placeholder: 'Select an option',
              required: el.required ? true : false,
              // validation: el.enableWhen ? [Validators.required] : null,
              validation: el.enableWhen ? undefined : [Validators.required],
              // validation: [Validators.required],
              value: null,
              elementClass: el.enableWhen ? 'enable-when-hide' : 'enable-when-show',
              disable: true
            };
          } else {
            const formField = this.textInput(el);
            formField['readonly'] = true;
            formField['required'] = el.required ? true : false;
            return formField;
          }

        } else {
          const formField = this.textInput(el);
          const enableWhen = this.populateEnableWhenObj(el);
          formField['placeholder'] = 'type your text';
          formField['validation'] = el.enableWhen ? undefined : [Validators.required];
          formField['required'] = el.required ? true : false;
          formField['enableWhen'] = el.enableWhen ? enableWhen : false;
          formField['value'] = null;

          formField['flag'] = el.enableWhen ? false : true;
          formField['elementClass'] = el.enableWhen ? 'enable-when-hide' : 'enable-when-show';
          // flag: el.enableWhen ? false : true,
          return formField;
        }

      } else if (el.code[1].code === 'EMAIL') {


        const enableWhen = this.populateEnableWhenObj(el);

        const formField = this.textInput(el);
        formField['placeholder'] = 'type your email';
        formField['validation'] = el.enableWhen ? [Validators.email] : [Validators.required, Validators.email];
        formField['required'] = el.required ? true : false;
        formField['enableWhen'] = el.enableWhen ? enableWhen : false;
        formField['value'] = null;

        formField['flag'] = el.enableWhen ? false : true;
        formField['elementClass'] = el.enableWhen ? 'enable-when-hide' : 'enable-when-show';
        // flag: el.enableWhen ? false : true,
        return formField;


      } else if (el.code[1].code === 'COMMENT') {


        const enableWhen = this.populateEnableWhenObj(el);

        const formField = this.commentInput(el);
        formField['placeholder'] = 'type your text';
        formField['validation'] = undefined;
        formField['enableWhen'] = el.enableWhen ? enableWhen : false;
        // formField['enableWhenQ'] = el.enableWhen ? el.enableWhen[0].question : false;
        // formField['enableWhenA'] = el.enableWhen ? el.enableWhen[0].answerCoding.display : false;
        formField['value'] = null;
        formField['required'] = el.required ? true : false;
        formField['flag'] = el.enableWhen ? false : true;

        formField['elementClass'] = el.enableWhen ? 'enable-when-hide' : 'enable-when-show';

        // flag: el.enableWhen ? false : true,
        return formField;

      } else if (el.code[1].code === 'SELECT') {


        const options = [];

        el.option.forEach(el1 => {
          this.options.push(
            {
              display: el1.valueCoding.display,
              code: el1.valueCoding.code
            }
          );
        });
        el.option.forEach(el1 => {
          options.push(el1.valueCoding.display);
        });
        const enableWhen = this.populateEnableWhenObj(el);

        if (el.code[0].code === 'OHAGOCC' || el.code[0].code === 'ENVMODIF' || el.code[0].code === 'EXPMODIF') {
          console.log(el.code[0].code);
          return {
            type: 'selectSr',
            typeElem: el.code[1].code,
            label: el.text,
            name: el.linkId,
            enableWhen: el.enableWhen ? enableWhen : false,
            options: options,
            flag: el.enableWhen ? false : true,
            placeholder: 'Select an option',
            validation: undefined,
            required: el.required ? true : false,
            // validation: [Validators.required],
            value: null,
            elementClass: el.enableWhen ? 'enable-when-hide' : 'enable-when-show',
          };
        } else {
          const enableWhenQ = [];
          return {
            type: 'selectSr',
            typeElem: el.code[1].code,
            label: el.text,
            name: el.linkId,
            enableWhen: el.enableWhen ? enableWhen : false,
            options: options,
            flag: el.enableWhen ? false : true,
            placeholder: 'Select an option',
            validation: el.enableWhen ? undefined : [Validators.required],
            required: el.required ? true : false,
            // validation: [Validators.required],
            value: null,
            elementClass: el.enableWhen ? 'enable-when-hide' : 'enable-when-show',
          };
        }
      } else if (el.code[1].code === 'BOOL') {
        if (el.code[0].code === 'DEPENDINV') {
          // console.log(this.dependentsList);
          if (this.dependentsList.length < 1) {
            console.log('this.dependentsList.length < 1');

            return {
              type: 'checkbox',
              label: el.text + ' (Disabled)',
              name: el.linkId,
              typeElem: el.code[1].code,
              elementClass: el.enableWhen ? 'enable-when-hide' : 'enable-when-show',
              value: el.enableWhen ? null : false,
              disabled: true
            };

          } else if (this.dependentsList.length > 0) {
            console.log('this.dependentsList.length > 0');

            return {
              type: 'checkbox',
              label: el.text,
              name: el.linkId,
              typeElem: el.code[1].code,
              elementClass: el.enableWhen ? 'enable-when-hide' : 'enable-when-show',
              value: el.enableWhen ? null : false,
              disabled: false
            };
          }
        } else {

          const enableWhen = this.populateEnableWhenObj(el);
          return {
            type: 'checkbox',
            label: el.text,
            name: el.linkId,
            typeElem: el.code[1].code,
            enableWhen: el.enableWhen ? enableWhen : false,
            // enableWhenQ: el.enableWhen ? el.enableWhen[0].question : false,
            // enableWhenA: el.enableWhen ? el.enableWhen[0].answerCoding.display : false,
            elementClass: el.enableWhen ? 'enable-when-hide' : 'enable-when-show',

            // placeholder: 'Select an option',
            // validation: el.enableWhen ? null : [Validators.required],
            value: el.enableWhen ? null : false,
          };
        }


      }
    });

    if (this.dependentsList.length > 0) {
      this.dependentsList.forEach((dependent, index) => {
        const enableWhen = [{
          enableWhenQ: 'DEPENDINV',
          enableWhenA: 'true',
        }];
        this.configuration.push(
          {
            type: 'depend',
            name: 'dependent' + '-' + index,
            label: dependent.family + ' ' + dependent.given,
            enableWhen: enableWhen,
            elementClass: 'enable-when-hide',
            // placeholder: 'Select an option',
            // validation: el.enableWhen ? null : [Validators.required],
            value: false,
          }
        );
      });

    }
    console.log('CONFIG AFTER DEPENDENTS PUSH', this.configuration);


    this.configuration.push(
      {
        type: 'doc',
        class: 'documents',
        name: 'doc'
      },
      {
        type: 'line',
        name: 'line'
      },
      {
        type: 'button',
        name: 'submit',
        label: 'Submit'
      }
    );

    this.config = this.configuration;

    // maping part of the data from the server to item
    this.items = this.qrequest.map(el => ({
      ...this.item,
      linkId: el.linkId,
      text: el.text,
      code: el.code[0].code,
      system: el.code[0].system

    }));
    console.log('ITEMS', this.items);

    console.log('THIS.OPTIONS', this.options);
  }

  populateEnableWhenObj(el) {
    const enableWhen = [];
    if (el.enableWhen) {
      el.enableWhen.forEach(elem => {
        enableWhen.push(
          {
            enableWhenQ: elem.question,
            enableWhenA: elem.answerCoding.display
          });
      });
    }
    return enableWhen;
  }




  textInput(data) {
    return TextInput.create({
      type: 'input',
      label: data.text,
      inputType: 'text',
      name: data.linkId,
      readonly: false,
      typeElem: data.code[1].code,
      // enableWhenQ: data.enableWhen ? data.enableWhen[0].question : false,
      // enableWhenA: data.enableWhen ? data.enableWhen[0].answerCoding.code : false,
    });
  }

  commentInput(data) {
    return CommentInput.create({
      type: 'comment',
      label: data.text,
      name: data.linkId,
      typeElem: data.code[1].code,
      // enableWhenQ: data.enableWhen ? data.enableWhen[0].question : false,
      // enableWhenA: data.enableWhen ? data.enableWhen[0].answerCoding.code : false,
    });
  }


  // options: options,
  // validation: [Validators.required]

  selectField(data) {
    return SelectField.create({
      type: 'selectSr',
      typeElem: data.code[1].code,
      label: data.text,
      inputType: 'text',
      placeholder: 'Select an option',
      name: data.linkId,
      validation: [Validators.required],
      // enableWhenQ: data.enableWhen ? data.enableWhen[0].question : false,
      // enableWhenA: data.enableWhen ? data.enableWhen[0].answerCoding.display : false,
    });
  }
  /************************************************/
  // settingFunction() {
  ngAfterViewInit() {
    setTimeout(() => {
      let previousValid = this.form.valid;
      this.form.changes.subscribe(() => {
        if (this.form.valid !== previousValid) {
          previousValid = this.form.valid;
          this.form.setDisabled('submit', !previousValid);
        }
      });

      this.form.setDisabled('submit', true);
      if (this.router.url.indexOf('/newservicerequest') > -1) {
        this.form.setValue('AUTHOR', this.userName);
        this.form.setValue('USERDEPT', this.currentUserDepartment);
        this.form.setDisabled('USERDEPT', true);
        this.form.setValue('DATECR', this.todayPiped);
      }

    });

    // if you want to style 2 form fields per a row do these :
    // this.wrap();
    // this.addDiv();
  }


  // checks FHIR data for items with enableWhen and changes show/hide class on the form based on enableWhen options
  public checkEnableWhen(value, index) {
    console.log(this.form);
    // console.log(this.form.value.ASSESTYPE);
    this.config.forEach(elemOfConfig => {
      if (this.router.url.indexOf('/newservicerequest') > -1) {
        if (this.form.value.ASSESTYPE === 'Pre-Placement' && this.userRole === 'clientdept') {
          this.form.setDisabled('USERDEPT', false);
        } else {
          this.form.setDisabled('USERDEPT', true);
          this.form.setValue('USERDEPT', this.currentUserDepartment);
        }
      }
      if (elemOfConfig.enableWhen) {


        for (const formElem of elemOfConfig.enableWhen) {
          if (index === formElem.enableWhenQ) {
            if (value === formElem.enableWhenA) {
              // console.log(elemOfConfig);
              elemOfConfig.elementClass = 'enable-when-show';
              elemOfConfig.flag = true;
              if (elemOfConfig.typeElem !== 'BOOL') {


                if (elemOfConfig.typeElem === 'PHONE') {
                  console.log(elemOfConfig.type);
                  this.form.setRequired(elemOfConfig.name, [
                    Validators.required,
                    Validators.pattern(
                      '^[(]{0,1}[0-9]{3}[)]{0,1}[-s.]{0,1}[0-9]{3}[-s.]{0,1}[0-9]{4}$'
                    )
                  ]);
                } else if (elemOfConfig.typeElem === 'EMAIL') {
                  console.log(elemOfConfig.type);
                  this.form.setRequired(elemOfConfig.name, [Validators.required, Validators.email]);
                } else {

                  this.form.setRequired(elemOfConfig.name, [Validators.required]);
                }
              }
              return;
            } else {
              elemOfConfig.flag = false;
              elemOfConfig.elementClass = 'enable-when-hide';
              this.form.removeRequired(elemOfConfig.name);
              this.form.setValue(elemOfConfig.name, null);
              if (elemOfConfig.options) {
                elemOfConfig.options.forEach(option => {
                  this.config.forEach(configElement => {
                    if (configElement.enableWhen) {
                      configElement.enableWhen.forEach(enableW => {
                        if (enableW.enableWhenA === option && configElement.elementClass === 'enable-when-show') {
                          configElement.elementClass = 'enable-when-hide';
                          configElement.validation = undefined;
                          this.form.removeRequired(configElement.name);
                          this.form.setValue(configElement.name, null);
                        }
                      });
                    }
                  });
                });
              }
            }
          }
        }
      }
    });

  }

  // public checkEnableWhen(value, index) {
  //   this.config.forEach(el => {
  //     if (el.enableWhenA && el.enableWhenQ) {
  //       if (index === el.enableWhenQ) {

  //         if (value === el.enableWhenA) {

  //           el.elementClass = 'enable-when-show';
  //           el.flag = true;

  //         } else {
  //           el.flag = false;
  //           el.elementClass = 'enable-when-hide';
  //           this.form.setValue(el.name, null);
  //           this.config.forEach(elem => {
  //             if (elem.enableWhenA && elem.enableWhenQ) {
  //               if (el.name === elem.enableWhenQ && elem.elementClass === 'enable-when-show') {
  //                 elem.elementClass = 'enable-when-hide';
  //                 this.form.setValue(elem.name, null);
  //               }
  //             }

  //           });
  //         }
  //       }
  //     }
  //   });
  // }




  handleError(error) {
    console.log(error);
  }


  // getting response from thr server on "next"
  handleSuccessOnSave(data) {
    console.log(data);

    this.formCreated = true;
  }

  onOk() {
    this.router.navigateByUrl('/dashboard');
  }

  handleErrorOnSave(error) {
    console.log(error);
  }


}
