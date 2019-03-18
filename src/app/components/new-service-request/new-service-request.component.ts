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
      name: event.name
    };
  }
}


class CommentInput {
  static create(event: FieldConfig) {
    return {
      type: event.type,
      label: event.label,
      inputType: event.inputType,
      name: event.name
    };
  }
}

class SelectField {
  static create(event: FieldConfig) {
    return {
      type: event.type,
      label: event.label,
      inputType: event.inputType,
      name: event.name
    };
  }
}


@Component({
  selector: 'app-new-service-request',
  templateUrl: './new-service-request.component.html',
  styleUrls: ['./new-service-request.component.scss']
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
  loaded = false;
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
  config: FieldConfig[] = [];

  departmentList = [];
  currentUserDepartment;

  formId = 'TEST4';
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
  myDay;
  dd: any;
  mm: any;
  yyyy: any;
  time: any;
  hr: any;
  min: any;
  sec: any;
  msec: any;

  dependents = false;

  dependentsList;
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
    private oauthService: OAuthService
  ) {

  }

  ngOnInit() {
    console.log(this.formCreated);

    const depList = sessionStorage.getItem('dependents');
    this.dependentsList = JSON.parse(depList);
    this.activatedRoute.data.subscribe(data => this.getFormData(data.fields));
    this.activatedRoute.data.subscribe(data => this.populateDeptNames(data.departments));
    this.userName = sessionStorage.getItem('userName');
    this.currentUserDepartment = sessionStorage.getItem('userDept');
    this.createdsuccessfully = false;
    this.clientId = sessionStorage.getItem('patientSummaryId');

    if (!this.clientId) {
      this.router.navigateByUrl('/dashboard');
    }
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
    data.entry.forEach(element => {
      if (element['resource']['name']) {
        this.departmentList.push(element['resource']['name']);
      }
    });
  }



  /**
   *
   * @param $event
   *s
   * This function builds a new DocumentReference object,
   * Inserts the appropriate data from the response into declared
   * Objects, stringifies the object, and posts said string to the
   * FHIR server.
   */

  addDocument($event) {

    const documentReference = new FHIR.DocumentReference;
    const documentReferenceCodeableConcept = new FHIR.CodeableConcept;
    const documentReferenceCoding = new FHIR.Coding;
    const content = new FHIR.Content;
    const contentAttachment = new FHIR.Attachment;
    const contentCode = new FHIR.Coding;
    let file;
    let trimmedFile = '';
    let size: number;
    let type;
    const date = new Date().toJSON();
    const fileList = $event.target.files;
    const reader = new FileReader();
    if (fileList[0]) {
      size = fileList[0].size;
      type = fileList[0].type;
      reader.readAsDataURL(fileList[0]);
    }
    const self = this;
    reader.onloadend = function () {

      file = reader.result;
      trimmedFile = file.split(',').pop();

      documentReference.resourceType = 'DocumentReference';

      contentAttachment.size = size;
      contentAttachment.contentType = type;
      contentAttachment.data = trimmedFile;
      contentAttachment.creation = date;
      contentAttachment.title = fileList[0].name;

      contentCode.code = 'urn:ihe:pcc:xphr:2007';
      contentCode.display = 'Personal Health Records';

      content.format = contentCode;
      content.attachment = contentAttachment;

      documentReferenceCoding.code = '51851-4';
      documentReferenceCoding.system = 'http://loinc.org';
      documentReferenceCoding.display = 'Administrative note';

      documentReferenceCodeableConcept.coding = [documentReferenceCoding];
      documentReferenceCodeableConcept.text = 'Administrative note';

      documentReference.instant = date;
      documentReference.type = documentReferenceCodeableConcept;
      documentReference.content = [content];


      self.questionnaireService.postDataFile(JSON.stringify(documentReference)).subscribe(
        data => self.documents = data,
        error => self.handleError(error)
      );
      return reader.result;

    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };

  }

  retrieveDocuments(data) {
    this.documents.push(data);
  }

  downloadFile(incomingFile) {

    const byteCharacters = atob(incomingFile['content'][0]['attachment']['data']);

    const byteNumbers = new Array(byteCharacters.length);
    for (let index = 0; index < byteCharacters.length; index++) {
      byteNumbers[index] = byteCharacters.charCodeAt(index);
    }

    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], { 'type': incomingFile['content'][0]['attachment']['contentType'] });

    if (navigator.msSaveBlob) {
      const filename = incomingFile['content'][0]['attachment']['title'];
      navigator.msSaveBlob(blob, filename);
    } else {
      const fileLink = document.createElement('a');
      fileLink.href = URL.createObjectURL(blob);
      fileLink.setAttribute('visibility', 'hidden');
      fileLink.download = incomingFile['content'][0]['attachment']['title'];
      document.body.appendChild(fileLink);
      fileLink.click();
      document.body.removeChild(fileLink);
    }


    // const linkSource =
    //   'data:' +
    //   name['content'][0]['attachment']['contentType'] +
    //   ';base64,' +
    //   name['content'][0]['attachment']['data'];
    // console.log(linkSource);
    // const downloadLink = document.createElement('a');
    // const fileName = name['content'][0]['attachment']['title'];

    // downloadLink.href = linkSource;
    // downloadLink.download = fileName;
    // downloadLink.click();
  }

  // convertBase64ToFile (data) {
  //   const obj = data;
  //   this.fileLink = [];
  //   const binaryString = data.content[0].attachment.data;

  //   const binary = atob(binaryString.replace(/\s/g, ''));
  //   const len = binary.length;
  //   const buffer = new ArrayBuffer(len);
  //   const view = new Uint8Array(buffer);
  //   for (let i = 0; i < len; i++) {
  //       view[i] = binary.charCodeAt(i);
  //   }

  //   const blob = new Blob( [view], { type: data.content[0].attachment.contentType });
  //   const fileOfBlob = new File ([blob], data.content[0].attachment.title );
  //   const url = URL.createObjectURL(blob);
  //   console.log('url: ', url);
  //   this.fileLink.push(url);

  // }


  onCancel() {
    sessionStorage.removeItem('patientSummaryId');
    this.router.navigate(['/servreqmain']);
  }

  // onSave() {
  //   // this.savingData();
  //   const questionnaireResponse = new FHIR.QuestionnaireResponse;
  //   const questionnaireIdentifier = new FHIR.Identifier;

  //   questionnaireIdentifier.value = 'SERVREQ';
  //   questionnaireResponse.resourceType = 'QuestionnaireResponse';
  //   questionnaireResponse.identifier = questionnaireIdentifier;

  //   const questionnaireReference = new FHIR.Reference;
  //   questionnaireReference.reference = 'Questionnaire/' + this.formId;
  //   questionnaireResponse.questionnaire = questionnaireReference;


  //   questionnaireResponse.status = 'in-progress';

  //   questionnaireResponse.authored = new Date;

  //   const subjectReference = new FHIR.Reference;
  //   subjectReference.reference = 'Patient/' + this.clientId;
  //   subjectReference.display = this.clientGivenName + ' ' + this.clientFamilyName;
  //   questionnaireResponse.subject = subjectReference;

  //   const items = [];

  //   for (const questions of this.questionsList) {
  //     for (const question of questions) {
  //       if (question['answer'] && question['answer'].length > 0) {

  //         const item = new FHIR.QuestionnaireResponseItem;
  //         if (!question['enableWhen']) {
  //           item.linkId = question['linkId'];
  //           item.text = question['text'];
  //           item.answer = this.fetchAnswer(question);
  //           items.push(item);
  //         } else if (question['enableWhen'] && question['enabled']) {
  //           item.linkId = question['linkId'];
  //           item.text = question['text'];
  //           item.answer = this.fetchAnswer(question);
  //           items.push(item);
  //         }
  //       }
  //     }
  //   }

  //   if (this.documentReference) {
  //     const documentItem = new FHIR.QuestionnaireResponseItem;
  //     documentItem.linkId = this.documentReference['linkId'];
  //     documentItem.text = this.documentReference['text'];
  //     documentItem.answer = this.fetchAnswer(this.documentReference);

  //     items.push(documentItem);
  //   }
  //   questionnaireResponse.item = items;
  //   this.questionnaireService.saveRequest(questionnaireResponse).subscribe(
  //     data => this.handleSuccessOnSave(data),
  //     error => this.handleErrorOnSave(error)
  //   );
  // }

  fetchAnswer(question): FHIR.Answer[] {
    const answerArray = new Array<FHIR.Answer>();
    const answer = new FHIR.Answer;
    if (question['type'] === 'choice' || question['type'] === 'text') {
      answer.valueString = question['answer'];
    }
    if (question['type'] === 'boolean') {
      answer.valueBoolean = question['answer'];
    }
    if (question['type'] === 'Reference') {
      const answerReference = new FHIR.Reference;
      answerReference.reference = question['answer'];
      answer.valueReference = answerReference;
    }
    answerArray.push(answer);
    return answerArray;
  }



  submit(value: { [name: string]: any }) {


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

    // // console.log('ITEMS on submit before change', this.items);
    // for (const [name, value] of Object.entries(values))
    //   if (itemsByLinkId.has(name)) {
    //     const indivElem = itemsByLinkId.get(name)
    //     indivElem.answer = value
    //     if (typeof value === "string" && codeByDisplay.has(value))
    //       indivElem.code = codeByDisplay.get(value)
    //   }


    // const flatCodes = new Set()
    // for (const code of this.listOfCodes)
    //   for (const co of code) flatCodes.add(co)
    // console.log('ITEMS on submit before change', this.items);

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


      // if (foundItem) {
      //   foundItem.answer = resultItem.answer;
      //   foundItem.code = resultItem.code;
      //   foundItem.system = resultItem.system;
      //   foundItem.text = resultItem.text;
      // }
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
      this.questionnaireService
        .saveRequest(request)
        .subscribe(
          data => this.handleSuccessOnSave(data),
          error => this.handleErrorOnSave(error)
        );
    }

  }

  onEdit() {
    this.disableInputsForReview = false;
  }

  backToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

  savingData() {
    // this.getDate();

    // const questionnaireResponse = new FHIR.QuestionnaireResponse;
    // const questionnaireIdentifier = new FHIR.Identifier;

    // questionnaireIdentifier.value = 'SERVREQ';

    // questionnaireResponse.resourceType = 'QuestionnaireResponse';

    // const questionnaireReference = new FHIR.Reference;
    // questionnaireReference.reference = 'Questionnaire/' + this.formId;

    // questionnaireResponse.status = 'in-progress';

    // questionnaireResponse.authored = new Date;

    // const subjectReference = new FHIR.Reference;
    // subjectReference.reference = 'Patient/' + this.clientId;
    // subjectReference.display = this.clientGivenName + ' ' + this.clientFamilyName;

    // questionnaireResponse.identifier = questionnaireIdentifier;
    // questionnaireResponse.subject = subjectReference;

    // const items = [];

    // for (const questions of this.questionsList) {
    //   for (const question of questions) {
    //     const item = new FHIR.QuestionnaireResponseItem;
    //     if (!question['enableWhen']) {
    //       item.linkId = question['linkId'];
    //       item.text = question['text'];
    //       item.answer = question['answer'];
    //       items.push(item);
    //     } else if (question['enableWhen'] && question['enabled']) {
    //       item.linkId = question['linkId'];
    //       item.text = question['text'];
    //       item.answer = question['answer'];
    //       items.push(item);
    //     }
    //   }
    // }


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
    this.createItemToSend(this.clientId, sessionStorage.getItem('emplGiven'), sessionStorage.getItem('emplFam'));
    this.mapItemToItems();
    if (this.dependentsList) {
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
        formField['value'] = null;
        formField['elementClass'] = el.enableWhen ? 'enable-when-hide' : 'enable-when-show';
        return formField;


      } else if (el.code[1].code === 'DATE') {


        const enableWhen = this.populateEnableWhenObj(el);
        return {
          type: 'date',
          label: el.text,
          inputType: 'text',
          placeholder: 'datepicker',
          name: el.linkId,
          enableWhen: el.enableWhen ? enableWhen : false,
          // enableWhenQ: el.enableWhen ? el.enableWhen[0].question : false,
          // enableWhenA: el.enableWhen ? el.enableWhen[0].answerCoding.display : false,
          elementClass: el.enableWhen ? 'enable-when-hide' : 'enable-when-show',
          value: null
        };

      } else if (el.code[1].code === 'TEXT') {

        if (el.code[0].code === 'AUTHOR') {

          const formField = this.textInput(el);
          // formField['placeholder'] = 'type your text';
          formField['readonly'] = true;
          // formField['validation'] = el.enableWhen ? null : [
          //   Validators.required
          // ];
          return formField;
        } else if (el.code[0].code === 'USERDEPT') {

          const formField = this.textInput(el);
          formField['readonly'] = true;
          // formField['placeholder'] = 'type your text';
          // formField['validation'] = el.enableWhen ? null : [
          //   Validators.required
          // ];
          return formField;
        } else {
          const formField = this.textInput(el);


          const enableWhen = this.populateEnableWhenObj(el);
          formField['placeholder'] = 'type your text';
          formField['validation'] = el.enableWhen ? undefined : [Validators.required];

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

        formField['flag'] = el.enableWhen ? false : true;

        formField['elementClass'] = el.enableWhen ? 'enable-when-hide' : 'enable-when-show';

        // flag: el.enableWhen ? false : true,
        return formField;

      } else if (el.code[1].code === 'SELECT') {
        //  const enableWhenQ = [];
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



        // if (el.enableWhen) {
        //   el.enableWhen.forEach(el1 => {
        //     enableWhen.push(
        //       {
        //         enableWhenQ: el1.question,
        //         nableWhenA: el1.answerCoding.display
        //       }
        //     );
        //   });
        // }
        // if (el.enableWhen) {

        //   el.enableWhen.forEach(el1 => {
        //     enableWhenQ.push(el1.question);
        //   });
        // }




        return {
          type: 'selectSr',
          label: el.text,
          name: el.linkId,
          enableWhen: el.enableWhen ? enableWhen : false,
          // enableWhenQ: el.enableWhen ? enableWhenQ : false,
          // enableWhenA: el.enableWhen ? el.enableWhen[0].answerCoding.display : false,
          options: options,
          flag: el.enableWhen ? false : true,
          placeholder: 'Select an option',
          // validation: el.enableWhen ? [Validators.required] : null,
          validation: el.enableWhen ? undefined : [Validators.required],
          // validation: [Validators.required],
          value: null,
          elementClass: el.enableWhen ? 'enable-when-hide' : 'enable-when-show',
        };
      } else if (el.code[1].code === 'BOOL') {
        const enableWhen = this.populateEnableWhenObj(el);
        return {
          type: 'checkbox',
          label: el.text,
          name: el.linkId,
          typeElem: 'checkbox',
          enableWhen: el.enableWhen ? enableWhen : false,
          // enableWhenQ: el.enableWhen ? el.enableWhen[0].question : false,
          // enableWhenA: el.enableWhen ? el.enableWhen[0].answerCoding.display : false,
          elementClass: el.enableWhen ? 'enable-when-hide' : 'enable-when-show',

          // placeholder: 'Select an option',
          // validation: el.enableWhen ? null : [Validators.required],
          value: el.enableWhen ? null : false,
        };

      }
    });

    if (this.dependentsList !== []) {
      this.dependentsList.forEach((dependent, index) => {
        const enableWhen = {
          enableWhenQ: 'DEPENDINV',
          enableWhenA: 'true',
        };
        this.configuration.push(
          {
            type: 'depend',
            name: 'dependent' + '-' + index,
            label: dependent.family + ' ' + dependent.given,
            enable: enableWhen,
            elementClass: 'enable-when-hide',
            // placeholder: 'Select an option',
            // validation: el.enableWhen ? null : [Validators.required],
            value: false,
          }
        );
      });

    }


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
      readonly: false
      // enableWhenQ: data.enableWhen ? data.enableWhen[0].question : false,
      // enableWhenA: data.enableWhen ? data.enableWhen[0].answerCoding.code : false,
    });
  }

  commentInput(data) {
    return CommentInput.create({
      type: 'comment',
      label: data.text,
      name: data.linkId,
      // enableWhenQ: data.enableWhen ? data.enableWhen[0].question : false,
      // enableWhenA: data.enableWhen ? data.enableWhen[0].answerCoding.code : false,
    });
  }


  // options: options,
  // validation: [Validators.required]

  selectField(data) {
    return SelectField.create({
      type: 'selectSr',
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
      // this.form.setDisabled('1', true);
      // this.form.setDisabled('14', true);
      // this.form.setReadOnly('AUTHOR', true);
      this.form.setValue('AUTHOR', this.userName);
      this.form.setValue('USERDEPT', this.currentUserDepartment);

    });

    // if you want to style 2 form fields per a row do these :
    // this.wrap();
    // this.addDiv();
  }

  public checkEnableWhen(value, index) {
    this.config.forEach(elemOfConfig => {
      if (elemOfConfig.enableWhen) {
        for (const formElem of elemOfConfig.enableWhen) {
          if (index === formElem.enableWhenQ) {
            if (value === formElem.enableWhenA) {
              elemOfConfig.elementClass = 'enable-when-show';
              elemOfConfig.flag = true;
              return;
            } else {
              elemOfConfig.flag = false;
              elemOfConfig.elementClass = 'enable-when-hide';
              this.form.setValue(elemOfConfig.name, null);
              if (elemOfConfig.options) {
                elemOfConfig.options.forEach(option => {
                  this.config.forEach(configElement => {
                    if (configElement.enableWhen) {
                      configElement.enableWhen.forEach(enableW => {
                        if (enableW.enableWhenA === option && configElement.elementClass === 'enable-when-show') {
                          configElement.elementClass = 'enable-when-hide';
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

