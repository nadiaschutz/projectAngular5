import { Component, OnInit, ViewChild, SkipSelf, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { QuestionnaireService } from '../../service/questionnaire.service';
import { Item } from '../models/item.model';
import { ItemToSend } from '../models/itemToSend.model';
import { formatDate } from '@angular/common';
import { DatePipe } from '@angular/common';
import { StaffService } from '../../service/staff.service';
import { AdminHomeScreenService } from 'src/app/service/admin-home-screen.service';
import * as FHIR from '../../interface/FHIR';

// for custom form components to work
import { Validators } from '@angular/forms';
import { Field } from '../dynamic-forms/field.interface';
import { FieldConfig } from '../dynamic-forms/field-config.interface';
import { DynamicFormComponent } from '../dynamic-forms/dynamic-form.component';


class TextInput {
  static create(event: FieldConfig) {
    return {
      type: event.type,
      label: event.label,
      inputType: event.inputType,
      name: event.name,
      typeElem: event.typeElem,
      readonly: event.readonly,
      required: event.required,
      value: event.value,
      flag: event.flag,
      elementClass: event.elementClass,
      enableWhen: event.enableWhen,
      validation: event.validation
    };
  }
}

class Checkbox {
  static create(event: FieldConfig) {
    return {
      type: event.type,
      label: event.label,
      name: event.name,
      typeElem: event.typeElem,
      required: event.required,
      enableWhen: event.enableWhen,
      elementClass: event.elementClass,
      value: event.value,
      disabled: event.disabled,
    };
  }
}

class SelectField {
  static create(event: FieldConfig) {
    return {
      type: event.type,
      typeElem: event.typeElem,
      label: event.label,
      name: event.name,
      enableWhen: event.enableWhen,
      options: event.options,
      flag: event.flag,
      placeholder: event.placeholder,
      required: event.required,
      validation: event.validation,
      value: event.value,
      elementClass: event.elementClass,
      disabled: event.disabled,
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

  options = [];

  style = 'col-11';
  configuration;
  userName;
  userRole;
  userLRO = false;
  loaded = false;
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
  config: FieldConfig[] = [];

  departmentList = [];
  regionalOfficeList = [];
  distrOfficeList = [];
  currentUserDepartment;

  formId;
  servReqType;
  formCreated = false;

  responseId = null;
  clientId = null;
  smileUserId = null;
  clientGivenName = null;
  clientFamilyName = null;
  clientBoD = null;
  userFHIRId = '';

  documents;
  fileLink = [];
  documentReference = {};
  regionalOffices;
  prePlacement = false;

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
  itemReference = [];

  itemsToSend = [];

  itemToSend: ItemToSend = {
    resourceType: '',
    questionnaire: null,
    status: null,
    subject: null,
    authored: null,
    author: null,
    item: []
  };

  items: Item[];

  item: Item = {
    linkId: '',
    text: '',
    answer: null,
    code: null
  };

  phoneValidatorCustom = '^[(]{0,1}[0-9]{3}[)]{0,1}[-s.]{0,1}[0-9]{3}[-s.]{0,1}[0-9]{4}$';


  trackByEl(index: number, el: any): string {
    return el.linkId;
  }

  constructor(
    public translate: TranslateService,
    private questionnaireService: QuestionnaireService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private datePipe: DatePipe,
    private staffService: StaffService,
    private adminHomeScreenService: AdminHomeScreenService
  ) {}

  ngOnInit() {
    this.getAllFormDataBeforeLoadingPage();

    // sets the formId based on url (serv request || contact us pages )
    if (this.router.url.indexOf('/newservicerequest') > -1) {
      this.formId = 'TEST4';
      this.servReqType = 'SERVREQ';
    } else {
      this.formId = '1953';
      this.servReqType = 'ADCOIN';
    }

    this.setVarsFromSessionStorage();

    //returns to homepage if no clientId
    if (this.servReqType === 'SERVREQ') {
      if (!this.clientId) {
        this.router.navigateByUrl('/dashboard');
      }
    }
    console.log(this.dependentsList);
  }

  getAllFormDataBeforeLoadingPage(){
    this.activatedRoute.data.subscribe(data => this.getRegionalOfficesData(data.offices));
    this.activatedRoute.data.subscribe(data => this.populateDeptNames(data.departments));
    this.activatedRoute.data.subscribe(data => this.getFormData(data.fields));
  };

  getRegionalOfficesData(data) {
    console.log(data);
    if (data['entry']) {
      data['entry'].forEach(branch => {
        this.regionalOfficeList.push({
          name: branch.resource.name,
          id: branch.resource.id
        });
      });
    }
  }

  // sets departments for select field
  populateDeptNames(data: any) {
    data.entry.forEach(department => {
      if (department['resource']['name']) {
        this.departmentList.push(department['resource']['name']);
      }
    });
  }

  setVarsFromSessionStorage(){
    this.userLRO = JSON.parse(sessionStorage.getItem('userLRO'));
    this.userRole = sessionStorage.getItem('userRole');
    this.userFHIRId = sessionStorage.getItem('userFHIRID');
    console.log('userRole', this.userRole);
    this.todayPiped = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
    console.log(this.formCreated);
    this.employeeType = sessionStorage.getItem('emplType');
    if (this.employeeType === 'Employee') {
      const depList = sessionStorage.getItem('dependents');
      this.dependentsList = JSON.parse(depList);
    }
    this.prePlacement = JSON.parse(sessionStorage.getItem('prePlacement'));
    this.clientGivenName = sessionStorage.getItem('emplGiven');
    this.clientFamilyName = sessionStorage.getItem('emplFam');
    this.userName = sessionStorage.getItem('userName');
    this.currentUserDepartment = sessionStorage.getItem('userDept');
    this.createdsuccessfully = false;
    this.clientId = sessionStorage.getItem('patientSummaryId');
  };


  onCancel() {
    sessionStorage.removeItem('patientSummaryId');
    this.router.navigate(['/servreqmain']);
  }


  // submits the form
  async submit() {
    // gets all the values of each fields, including null
    const value = this.form.getRawValue;
    let codeItem: any = null;

    // dependent in values
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

    // assigns Code and Answer to items
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

    // adds PSOHPCODE item into the the arr of items
    this.items.forEach(item => {
      if (item.code.indexOf('-PSOHPCODE') > -1) {
        codeItem = {
          answer: item.code.substring(0, item.code.indexOf('-')),
          code: item.code.substring(0, item.code.indexOf('-')),
          linkId: 'PSOHPCODE',
          system: 'https://bcip.smilecdr.com/fhir/PSOHPCODE'
        };
        // tslint:disable-next-line:max-line-length
        item.code = item.code.substring(0, item.code.indexOf('-'));
      }
    });

    // pushes extra PSOHPCODE item into itmes arr
    if (codeItem) {
      this.items.push(codeItem);
    }

    // prepares data for sending to the server
    this.savingData();

    for (const request of this.itemsToSend) {
      const questionnaireResponse = await this.staffService.createQuestionnaireResponseAsync(request).catch(error => {
        console.error(error);
      });
      this.formCreated = true;
      if (this.servReqType !== 'ADCOIN') {
        this.createEpisodeOfCare(questionnaireResponse);
      } else {
        const psohpServiceType = this.getServiceTypeFromQuestionnaireResponse(questionnaireResponse);
        this.createCommunicationRequest(questionnaireResponse['id'], psohpServiceType);
      }
    }
  }

  async createCommunicationRequest(questionnaireResponse, psohpServiceType) {
    const commRequest = new FHIR.CommunicationRequest;
    const topic = new FHIR.Reference;
    const requester = new FHIR.Requester;
    const requesterReference = new FHIR.Reference;

    requesterReference.reference = 'Practitioner/' + sessionStorage.getItem('userFHIRID');
    requester.agent = requesterReference;

    topic.reference = 'QuestionnaireResponse/' + questionnaireResponse;

    commRequest.resourceType = 'CommunicationRequest';
    commRequest.status = 'draft';
    commRequest.authoredOn = new Date();
    commRequest.topic = [topic];
    commRequest.requester = requester;

    const createdCommRequest = await this.staffService.saveCommunicationRequestAsync(JSON.stringify(commRequest)).catch(error => {
      console.error(error);
    });
    this.createCarePlanAdcoin(createdCommRequest, psohpServiceType);

  }

  async createEpisodeOfCare(questionnaireResponse) {
    const episodeOfCare = new FHIR.EpisodeOfCare();
    episodeOfCare.resourceType = 'EpisodeOfCare';
    episodeOfCare.status = 'waitlist';

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

  async createCarePlanAdcoin(commRequest, psohpServiceType) {
    if (psohpServiceType.length > 0) {
      const carePlanTemplates = await this.staffService.fetchAllCarePlanTemplatesAsync();
      for (const carePlanTemplateEntry of carePlanTemplates['entry']) {
        const carePlanTemplate = carePlanTemplateEntry.resource;
        if (psohpServiceType === carePlanTemplate['identifier'][0]['value']) {
          console.log(psohpServiceType);
          const carePlan = new FHIR.CarePlan();
          const subject = new FHIR.Reference();
          const supportingInfo = new FHIR.Reference;

          subject.reference = 'Group/16054';

          carePlan.resourceType = 'CarePlan';
          carePlan.status = 'active';
          carePlan.intent = 'plan';
          carePlan.subject = subject;

          supportingInfo.reference = commRequest['resourceType'] + '/' + commRequest['id'];
          carePlan.supportingInfo = [supportingInfo];

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
        if (item['linkId'] === 'PSOHPCODE') {
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
      this.itemReference.forEach(ref => {
        this.items.push(ref);
      });
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
    const thing = {
         resourceType: 'QuestionnaireResponse',
         questionnaire: {
           reference: `Questionnaire/${this.formId}`
         },
         status: 'in-progress',
         authored: new Date,
         author: {
           reference: `Practitioner/${this.userFHIRId}`
         },
         identifier: {
           value: 'SERVREQ'
         },
         item: []
     };
     const subject = this.servReqType === 'SERVREQ' ? { subject: { reference: `Patient/${id}`, display: `${givenName} ${famName}` } } : null
     this.itemToSend = this.servReqType === 'SERVREQ'? { ...thing, ...subject }: { ...thing}
     this.itemsToSend.push(this.itemToSend);
 }


  // takes items from items arr and pushes into itemToSend in digestible format
  mapItemToItems() {
    const itemsFiltered = this.items.filter(itemToStay => itemToStay.answer !== null);
    this.itemToSend.item = itemsFiltered.map(el => {
      if (el.linkId !== '') {
        if (el.text) {
          return {
            linkId: el.linkId,
            text: el.text,
            answer:
              el.text === 'Document' ? [{valueReference: {reference: el.answer}}] :
                typeof (el.answer) === 'boolean' ? [
                  {valueCoding: {code: el.code, system: el.system, display: el.answer}}
                ] :
                  typeof (el.answer) === 'string' ? [{valueCoding: {code: el.code,system: el.system,display: el.answer}}] : null
          };
        } else {
          return {
            linkId: el.linkId,
            answer: [{valueCoding: {code: el.code,system: el.system,}}]
          };
        }
      }
    });
  }

  getDocument(data) {
    data.forEach(document => {
      this.itemReference.push(document);
    });
  }


  handleErrorClientError(error) {
    console.log(error);
  }

  // turns questionarie data into arr of form fields (shows those fields on the form)
  /**
  if you get an error on dynamic-form.components.ts,
  there are 95% chances that the issue is not in dynamic-form.components.ts
  but in data representation, or data absence ===> look into getFormData(data){}
  **/
  getFormData(data) {
    this.qrequest = data.item;
    console.log('QREQ', this.qrequest);

    this.configuration = this.qrequest.map(el => {
      if (el.code[1].code === 'PHONE') {
        const enableWhen = this.populateEnableWhenObj(el);
        const formField = this.textInput(el, enableWhen);
        formField['placeholder'] = 'type your phone';
        formField['validation'] = el.enableWhen ? [
          Validators.pattern(this.phoneValidatorCustom)] : [
            Validators.required, Validators.pattern(this.phoneValidatorCustom)
          ];
        return formField;
      } else if (el.code[1].code === 'DATE') {
        const enableWhen = this.populateEnableWhenObj(el);
        const formField = this.textInput(el, enableWhen);
        formField['type'] = 'date';
        formField['placeholder'] = 'datepicker';
        return formField;
      } else if (el.code[1].code === 'TEXT') {
        if (el.code[0].code === 'AUTHOR') {
          const formField = this.textInput(el, undefined);
          formField['readonly'] = true;
          return formField;
        } else if (el.code[0].code === 'DATECR') {
          const formField = this.textInput(el, undefined);
          formField['readonly'] = true;
          return formField;
        } else if (el.code[0].code === 'USERDEPT') {
          if (this.userRole === 'clientdept') {
            const options = this.departmentList;
            const enableWhen = this.populateEnableWhenObj(el);
            const formField = this.selectField(el, options, enableWhen);
            return formField;
          } else {
            const formField = this.textInput(el, undefined);
            // formField['readonly'] = true;
            return formField;
          }
        } else {
          const enableWhen = this.populateEnableWhenObj(el);
          const formField = this.textInput(el, enableWhen);
          formField['placeholder'] = 'type your text';
          return formField;
        }
      } else if (el.code[1].code === 'EMAIL') {
        const enableWhen = this.populateEnableWhenObj(el);
        const formField = this.textInput(el, enableWhen);
        formField['placeholder'] = 'type your email';
        formField['validation'] = el.enableWhen ? [Validators.email] : [Validators.required, Validators.email];
        return formField;
      } else if (el.code[1].code === 'COMMENT') {
        const enableWhen = this.populateEnableWhenObj(el);
        const formField = this.textInput(el, enableWhen);
        formField['type'] = 'comment';
        formField['validation'] = undefined;
        return formField;
      } else if (el.code[1].code === 'SELECT') {
        const options = [];
        // sets this.options for Code
        if (el.option) {
          el.option.forEach(el1 => {
            this.options.push(
              {
                display: el1.valueCoding.display,
                code: el1.valueCoding.code
              }
            );
            options.push(el1.valueCoding.display);
          });
        }

        const enableWhen = this.populateEnableWhenObj(el);

        // only for preplacemt for a client from a different department
        if (this.prePlacement) {
          if (el.code[0].code === 'PSOHPSERV' || el.code[0].code === 'ASSESTYPE') {
            const formField = this.textInput(el, enableWhen);
            formField['validation'] = undefined;
            formField['elementClass'] = 'enable-when-show';
            return formField;
          }
          if (el.code[0].code === 'ASSESCAT') {
            const formField = this.selectField(el, options, enableWhen);
            formField['validation'] = undefined;
            formField['elementClass'] = 'enable-when-show';
            return formField;
          }
        }
        if (el.code[0].code === 'OHAGOCC' || el.code[0].code === 'ENVMODIF' || el.code[0].code === 'EXPMODIF') {
          console.log(el.code[0].code);
          const formField = this.selectField(el, options, enableWhen);
          formField['validation'] = undefined;
          return formField;
        } else if (el.code[0].code === 'REGOFFICE') {
          if (this.regionalOfficeList) {
            this.regionalOfficeList.forEach(el2 => {
              this.options.push(
                {
                  display: el2.name,
                  code: el2.id
                }
              );
              options.push(el2.name);
            });
          }
          const formField = this.selectField(el, options, enableWhen);
          formField['validation'] = undefined;
          return formField;
        } else if (el.code[0].code === 'DISTROFFICE') {
          const formField = this.selectField(el, this.distrOfficeList, enableWhen);
          formField['validation'] = undefined;
          return formField;
        } else {
          const formField = this.selectField(el, options, enableWhen);
          formField['validation'] = undefined;
          return formField;
        }
      } else if (el.code[1].code === 'BOOL') {
        const enableWhen = this.populateEnableWhenObj(el);

        if (el.code[0].code === 'DEPENDINV') {
          if (this.dependentsList.length < 1) {
            const formField = this.checkbox(el, enableWhen);
            formField['disabled'] = true;
            formField['label'] = el.text + ' (Disabled)';
            return formField;
          } else if (this.dependentsList.length > 0) {
            console.log('this.dependentsList.length > 0');
            const formField = this.checkbox(el, enableWhen);
            return formField;
          }
        } else if (el.code[0].code === 'LROREQ') {
          if (!this.userLRO) {
            console.log('!this.userLro');
            const formField = this.checkbox(el, enableWhen);
            formField['disabled'] = true;
            formField['label'] = el.text + ' (Disabled)';
            return formField;
          } else {
            const formField = this.checkbox(el, enableWhen);
            return formField;
          }
        } else {
          const formField = this.checkbox(el, enableWhen);
          return formField;
        }
      }
    });

    // checks for dependents and shows on the form
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
            value: false,
          }
        );
      });

    }
    console.log('CONFIG AFTER DEPENDENTS PUSH', this.configuration);

    // styling and buttons
    const elementClass = this.servReqType === 'ADCOIN' ? 'documents enable-when-hide' : 'documents enable-when-show'
    this.configuration.push({ type: 'doc', elementClass, name: 'doc'});


    this.configuration.push(
      {type: 'line', name: 'line'},
      {type: 'button',name: 'submit',label: 'Submit'}
    );

    this.config = this.configuration;

    // mapping part of the data from the server to this.items
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


  textInput(data, enableWhen) {
    return TextInput.create({
      type: 'input',
      label: data.text,
      inputType: 'text',
      name: data.linkId,
      readonly: false,
      typeElem: data.code[1].code,
      required: data.required ? true : false,
      value: null,
      flag: data.enableWhen ? false : true,
      elementClass: data.enableWhen ? 'enable-when-hide' : 'enable-when-show',
      enableWhen: data.enableWhen ? enableWhen : false,
      validation: data.enableWhen ? undefined : [Validators.required],
    });
  }

  checkbox(data, enableWhen) {
    return Checkbox.create({
      type: 'checkbox',
      label: data.text,
      name: data.linkId,
      typeElem: data.code[1].code,
      required: data.required ? true : false,
      enableWhen: data.enableWhen ? enableWhen : false,
      elementClass: data.enableWhen ? 'enable-when-hide' : 'enable-when-show',
      value: data.enableWhen ? null : false,
      disabled: false
    });
  }


  selectField(data, opt, enableWhen) {
    return SelectField.create({
      type: 'select',
      typeElem: data.code[1].code,
      label: data.text,
      name: data.linkId,
      enableWhen: data.enableWhen ? enableWhen : false,
      options: opt,
      flag: data.enableWhen ? false : true,
      placeholder: 'Select an option',
      required: data.required ? true : false,
      validation: data.enableWhen ? undefined : [Validators.required],
      value: null,
      elementClass: data.enableWhen ? 'enable-when-hide' : 'enable-when-show',
      disabled: false
    });
  }

  // setting function. sets values and the form after form is rendered on page
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
      this.form.setValue('AUTHOR', this.userName);
      this.form.setValue('USERDEPT', this.currentUserDepartment);
      this.form.setValue('DATECR', this.todayPiped);
      if (this.servReqType === 'SERVREQ' && this.prePlacement) {
        console.log(this.servReqType);
        this.form.setDisabled('PSOHPSERV', true);
        this.form.setValue('PSOHPSERV', 'Occupational Health Assessment');
        this.form.setDisabled('ASSESTYPE', true);
        this.form.setValue('ASSESTYPE', 'Pre-Placement');
      }
    });
  }


  // checks FHIR data for items with enableWhen and changes show/hide class on the form based on enableWhen options
  public checkEnableWhen(value, index) {
    if (index === 'REGOFFICE') {
      if (value !== '') {
        // get district office dropdown items
        this.distrOfficeList = [];
        if (this.regionalOfficeList) {
          this.regionalOfficeList.forEach(el => {
            if (el.name === value) {
              this.adminHomeScreenService.getDistrictOffices(el.id)
                .subscribe(locations => {
                  if (locations['entry']) {
                    locations['entry'].forEach(distrOffice => {
                      this.distrOfficeList.push(distrOffice['resource']['name']);
                    });
                  }
                },
                  (err) => {
                    console.log('District locations list error => ', err);
                  });
            }
          });
        }
      }
    }

    this.config.forEach(elemOfConfig => {
      if (elemOfConfig.name === 'DISTROFFICE') {
        elemOfConfig.options = this.distrOfficeList;
      }
      // checks for form type and sets disabled particular fields
      if (this.servReqType === 'SERVREQ') {
        if (this.form.value.ASSESTYPE === 'Pre-Placement' && this.userRole === 'clientdept') {
          console.log('elemOfConfig', elemOfConfig);
          this.form.setDisabled('USERDEPT', false);
        } else {
          this.form.setDisabled('USERDEPT', true);
          this.form.setValue('USERDEPT', this.currentUserDepartment);
        }
      }

      if (elemOfConfig.enableWhen) {
        for (const formElem of elemOfConfig.enableWhen) {
          // checks the form field(index) with code of the question
          if (index === formElem.enableWhenQ) {
            // checks the field answer  with code of the answer
            if (value === formElem.enableWhenA) {
              elemOfConfig.elementClass = 'enable-when-show';
              if (elemOfConfig.typeElem !== 'BOOL') {
                if (elemOfConfig.typeElem === 'PHONE') {
                  if (elemOfConfig.required) {
                    this.form.setRequired(elemOfConfig.name, [
                      Validators.required,
                      Validators.pattern(
                        this.phoneValidatorCustom
                      )
                    ]);
                  } else {
                    this.form.setRequired(elemOfConfig.name, [
                      Validators.pattern(
                        this.phoneValidatorCustom
                      )
                    ]);
                  }
                } else if (elemOfConfig.typeElem === 'EMAIL') {
                  if (elemOfConfig.required) {
                    this.form.setRequired(elemOfConfig.name, [Validators.required, Validators.email]);
                  } else {
                    this.form.setRequired(elemOfConfig.name, [Validators.email]);
                  }
                } else {
                  if (elemOfConfig.required) {
                    this.form.setRequired(elemOfConfig.name, [Validators.required]);
                  }
                }
              }
              return;


              // hides form fields
            } else {
              elemOfConfig.flag = false;
              elemOfConfig.elementClass = 'enable-when-hide';
              this.form.removeRequired(elemOfConfig.name);
              this.form.setValue(elemOfConfig.name, null);
              this.form.setPristine(elemOfConfig.name);
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
                          this.form.setPristine(configElement.name);
                        }
                      });
                    }
                  });
                });
              }
            }
          }
        }
      } else {
        if (index === 'SERVTP') {
          if (value === 'Request to NOHIS Superuser') {
            if (elemOfConfig.type === 'doc') {
              elemOfConfig.elementClass = 'documents enable-when-hide';
            }
          } else {
            if (elemOfConfig.type === 'doc') {
              elemOfConfig.elementClass = 'documents enable-when-show';
            }
          }
        }
      }
    });
  }


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
