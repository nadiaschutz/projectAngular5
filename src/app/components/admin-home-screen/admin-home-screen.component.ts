import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import {
    FormBuilder,
    FormGroup,
    FormControl
} from '@angular/forms';

import { distinctUntilChanged } from 'rxjs/operators';
import * as moment from 'moment';

import { UserService } from '../../service/user.service';

import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AdminHomeScreenService } from '../../service/admin-home-screen.service';
import { UtilService } from '../../service/util.service';
import { StaffService } from '../../service/staff.service';

export interface NameValueLookup {
  text?: string;
  value?: string;
}

@Component({
  selector: 'app-admin-home-screen',
  templateUrl: './admin-home-screen.component.html',
  styleUrls: ['./admin-home-screen.component.scss']
})
export class AdminHomeScreenComponent implements OnInit {

  adminHomeFormGroup: FormGroup;
  // activateSubmitButton = null;
  datePickerConfig: Partial<BsDatepickerConfig>;
  showAdvanceSearch = false;
  // minDate: Date;
  // maxDate: Date;

  DATE_FORMAT = 'YYYY-MM-DD';

  jobLocationList: NameValueLookup[] = [];
  employeeDepartmentList: NameValueLookup[] = [];
  // psohpList: NameValueLookup[] = [];
  assesmentTypeList: NameValueLookup[] = [];
  assesmentCatList: NameValueLookup[] = [];

  // original data store for resources
  qrList = [];
  eocList = [];
  practList = [];
  patList = [];

  // Tasks List
  tasksList = [];
  taskPractList = [];


  // final obj to render for component
  serviceRequestList = [];
  serviceTaskRequestList = [];

  activeTab = 'all'; // all, todo, waiting
  psohpCodes = {
    HACAT1: 'Health Assessment-Periodic-Cat 1 (HACAT1)',
    HACAT2: 'Health Assessment-Periodic-Cat 2 (HACAT2)',
    HACAT3: 'Health Assessment-Periodic-Cat 3 (HACAT3)',
    FTWORK: 'Fitness to Work Evaluation (FTWORK)',
    SUBUYB: 'Superannuation-Buy-Back (SUBUYB)',
    SUREMG: 'Superannuation-Medical Grounds (SUREMG)',
    SUSURB: 'Superannuation-Supplemental Retirement Benefits (SUSURB)',
    THSOTT: 'Posting and Travel Health-Short-Term Travel (THSOTT)',
    THPPC1: 'Posting and Travel Health-Pre-Posting-Cat 1 (THPPC1)',
    THPPC3: 'Posting and Travel Health-Pre-Posting-Cat 3 (THPPC3)',
    THCRC1: 'Posting and Travel Health-Cross-Posting-Cat 1 (THCRC1)',
    THCRC3: 'Posting and Travel Health-Cross-Posting Cat 3 (THCRC3)',
    THREC3: 'Posting and Travel Health-Return Posting-Cat 3 (THREC3)',
    IMREVW: 'Immunization Review (IMREVW)',
  };

  psohpList = [
    {
      value: 'Health Assessment',
      text: 'Health Assessment'
    },
    {
      value: 'FTWORK',
      text: 'Fitness to work (FTWORK)'
    },
    {
      value: 'Superannuation',
      text: 'Superannuation'
    },
    {
      value: 'Posting and Travel Health',
      text: 'Posting and Travel Health'
    },
    {
      value: 'IMREVW',
      text: 'Immunization review (IMREVW)'
    }
  ];

  psophNext = [
    {
      type: 'Health Assessment',
      value: {
        text: 'Pre-Placement',
        value: 'Pre-Placement'
      }
    },
    {
      type: 'Health Assessment',
      value: {
        text: 'Periodic',
        value: 'Periodic'
      }
    },
    {
      type: 'Superannuation',
      value: {
        text: 'Buy Back',
        value: 'SUBUYB'
      }
    },
    {
      type: 'Superannuation',
      value: {
        text: 'Medical Grounds',
        value: 'SUREMG'
      }
    },
    {
      type: 'Superannuation',
      value: {
        text: 'Supplemental Retirement Benefits',
        value: 'SUSURB'
      }
    },
    {
      type: 'Posting and Travel Health',
      value: {
        text: 'Short Term Travel',
        value: 'THSOTT'
      }
    },
    {
      type: 'Posting and Travel Health',
      value: {
        text: 'Pre-Posting Cat 1',
        value: 'THPPC1'
      }
    },
    {
      type: 'Posting and Travel Health',
      value: {
        text: 'Pre-Posting Cat 3',
        value: 'THPPC3'
      }
    },
    {
      type: 'Posting and Travel Health',
      value: {
        text: 'Cross-Posting Cat 1',
        value: 'THCRC1'
      }
    },
    {
      type: 'Posting and Travel Health',
      value: {
        text: 'Cross-Posting Cat 3',
        value: 'THCRC3'
      }
    },
    {
      type: 'Posting and Travel Health',
      value: {
        text: 'return-posting cat 3',
        value: 'THREC3'
      }
    }
  ];

  typeNext = [
    {
      type: 'Pre-Placement',
      value: {
        text: 'Cat 1',
        value: 'HACAT1'
      }
    },
    {
      type: 'Pre-Placement',
      value: {
        text: 'Cat 2',
        value: 'HACAT2'
      }
    },
    {
      type: 'Pre-Placement',
      value: {
        text: 'Cat 3',
        value: 'HACAT3'
      }
    },
    {
      type: 'Periodic',
      value: {
        text: 'Cat 1',
        value: 'HACAT1'
      }
    },
    {
      type: 'Periodic',
      value: {
        text: 'Cat 2',
        value: 'HACAT2'
      }
    },
    {
      type: 'Periodic',
      value: {
        text: 'Cat 3',
        value: 'HACAT3'
      }
    }
  ];

  constructor(
    private fb: FormBuilder,
    public translate: TranslateService,
    private router: Router,
    private adminHomeScreenService: AdminHomeScreenService,
    private utilService: UtilService,
    private staffService: StaffService,
    private userService: UserService
  ) {

    // this.minDate = new Date();
    // this.maxDate = new Date();
    // this.minDate.setDate(this.minDate.getDate() - 43800);
    // this.maxDate.setDate(this.maxDate.getDate());
  }

  ngOnInit() {
    // get questionare responses
    this.getQRs();

    // Get Task Response
    this.getTasksForQRs();

    // get and set the departments dropdown
    this.getAndSetDepartmentList();

    // get and set the psoph service dropdown
    this.getAndSetLocations();



    this.adminHomeFormGroup = this.fb.group({
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      dob: new FormControl(''),
      pri: new FormControl(''),
      employeeDepartment: new FormControl(''),
      jobLocation: new FormControl({ value: '', disabled: true}),
      psohpService: new FormControl(null),
      assesmentType: new FormControl(null),
      assesmentCat: new FormControl(null),
      // assesmentType: new FormControl('', Validators.required),
      // assesmentCat: new FormControl('', Validators.required),
      serviceRequest: new FormControl(''),
      // processingLocation: new FormControl('', Validators.required),
      // changeBack: new FormControl('', Validators.required),
      // dateFrom: new FormControl(''),
      // dateEnd: new FormControl(''),
      dateRange: new FormControl('')
    });

    this.onChanges();
  }

  setTab(tab) {
    this.activeTab = tab;
    console.log('Tab Set =>', this.activeTab);
  }

  psohpChanged() {
    const psohpValue = this.adminHomeFormGroup.get('psohpService').value;
    const temp = this.psophNext.filter(p => p.type === psohpValue).map(item => item.value);


    this.assesmentTypeList = temp;
    this.assesmentCatList = [];

    // reset
    this.adminHomeFormGroup.patchValue({assesmentType: null});
    this.adminHomeFormGroup.patchValue({assesmentCat: null});
  }

  assessTypeChanged() {
    const assesTypeValue = this.adminHomeFormGroup.get('assesmentType').value;
    const temp = this.typeNext.filter(p => p.type === assesTypeValue).map(item => item.value);
    this.assesmentCatList = temp;

    // reset
    this.adminHomeFormGroup.patchValue({assesmentCat: null});
  }

  assessCATChanged() {
    const assesCATValue = this.adminHomeFormGroup.get('assesmentCat').value;
  }

  onChanges(): void {
    // list to whole form for value changes
    // this.adminHomeFormGroup.valueChanges.subscribe(val => {
    //   this.formattedMessage =
    //     `Hello, My name is ${val.name} and my email is ${val.email}. I would like to tell you that ${val.message}.`;
    // });

    // listen to one aprticular field for form change
    this.adminHomeFormGroup.get('employeeDepartment')
      .valueChanges
      .pipe(distinctUntilChanged((a, b) => {
        return JSON.stringify(a) === JSON.stringify(b);
      }))
      .subscribe(val => {
        if (val !== '') {
          // get job locations dropdown items
          this.adminHomeScreenService.getJobLocations({ organization: val })
            .subscribe(locations => {
              console.log('job list =>', locations);
              this.jobLocationList = this.extractKeyValuePairsFromBundle(locations);
              this.adminHomeFormGroup.get('jobLocation').enable();
            },
            (err) => {
              console.log('Job locations list error => ', err);
            });
        } else {
          this.adminHomeFormGroup.get('jobLocation').disable();
          this.jobLocationList = [];
        }
      });
  }

  onSubmit(form: FormGroup) {

    console.log('Form Data submitted =>', form.value);

    const queryObj = {};
    queryObj['_include:recurse'] = '*';
    queryObj['identifier'] = 'SERVREQ';

    if (form.value.lastName && form.value.lastName !== '') {
      queryObj['patient:Patient.family'] = form.value.lastName;
    }
    if (form.value.firstName && form.value.firstName !== '') {
      queryObj['patient:Patient.given'] = form.value.firstName;
    }
    if (form.value.dob && form.value.dob !== '' && moment(form.value.dob).isValid()) {
      queryObj['patient:Patient.birthdate'] = moment(form.value.dob).format(this.DATE_FORMAT);
    }
    if (form.value.pri && form.value.pri !== '') {
      queryObj['patient:Patient.identifier'] = 'https://bcip.smilecdr.com/fhir/employeeid|' + form.value.pri;
    }
    if (form.value.employeeDepartment && form.value.employeeDepartment !== '') {
      const obj = this.employeeDepartmentList.find(item => item.value === form.value.employeeDepartment);
      if (obj && obj.text) {
        queryObj['patient:Patient.workplace'] = obj.text;
      }
    }
    if (form.value.jobLocation && form.value.jobLocation !== '') {
      const obj = this.jobLocationList.find(item => item.value === form.value.jobLocation);

      if (obj && obj.text) {
        queryObj['patient:Patient.branch'] = obj.text;
      }
    }


    // console.log(form.value['psohpService']);
    let code = '';
    if (form.value['assesmentCat']) {
      code = form.value['assesmentCat'] ;
    }
    if (form.value['psohpService'] === 'FTWORK' || form.value['psohpService'] === 'IMREVW') {
      code = form.value['psohpService'];
    }
    if (form.value['assesmentType']) {
      code = form.value['assesmentType'];
      console.log(code);
    }
    // const title = this.psohpCodes[code];

    if (code && code !== '') {
      queryObj['psohpService'] = code;
    }
    if (form.value.serviceRequest && form.value.serviceRequest !== '') {
      queryObj['_id'] = form.value.serviceRequest;
    }
    if (form.value.dateRange && Array.isArray(form.value.dateRange) && form.value.dateRange.length === 2 &&
        moment(form.value.dateRange[0]).isValid() && moment(form.value.dateRange[1]).isValid()) {
      queryObj['1dup-context.date'] = 'ge' + moment(form.value.dateRange[0]).format(this.DATE_FORMAT); // form
      queryObj['2dup-context.date'] = 'le' + moment(form.value.dateRange[1]).format(this.DATE_FORMAT); // to
    }

    // clear internal data store for resources
    this.clearInternalResourceData();

    this.adminHomeScreenService.searchQR(queryObj)
      .subscribe((bundle) => {
        console.log('Search bundle QR =>', bundle);

        if (bundle && bundle['entry']) {
          // we loop through all the entries
          // for each entry, check what resource it is. and add it to the internal arr of tems
          bundle['entry'].forEach(element => {
            const resource = element.resource;
            if (resource.resourceType === 'QuestionnaireResponse') {
                this.qrList.push(resource);
            } else if (resource.resourceType === 'EpisodeOfCare') {
                this.eocList.push(resource);
            } else if (resource.resourceType === 'Patient') {
                this.patList.push(resource);
            } else if (resource.resourceType === 'Practitioner') {
                this.practList.push(resource);
            }
          });

          // create our service request obj to render for UI comp
          this.mapRenderingList();
        }
      },
      (err) => console.log(err),
      () => {
        // now get tasks data based on EpisodeOfCares in internal db

        // first we get all the id's for EpisodeOfCares
        const eocIds = this.eocList.map(item => item.id);

        if (eocIds && Array.isArray(eocIds) && eocIds.length > 0) {
          const queryObject = {
            '_has:QuestionnaireResponse:context:identifier': 'SERVREQ',
            '_revinclude': 'Task:context',
            '_include': '*',
            '_id': eocIds.join(',')
          };

          this.adminHomeScreenService.searchEOC(queryObject)
            .subscribe((bundle) => {
              console.log('Search bundle EOC =>', bundle);

              if (bundle && bundle['entry']) {
                // we loop through all the entries
                // for each entry, check what resource it is. and add it to the internal arr of tems
                bundle['entry'].forEach(element => {
                  const resource = element.resource;
                  if (resource.resourceType === 'Task') {
                    this.tasksList.push(resource);
                  } else if (resource.resourceType === 'Practitioner') {
                    this.taskPractList.push(resource);
                  }
                });

                // create our service request obj to render for UI comp
                this.mapTaskRenderingList();
              }
            },
            err => console.log(err),
            () => {
              console.log('completed search Eoc');
            });
        }
      });
  }

  clear() {
    this.adminHomeFormGroup.reset();  // reset form
    this.clearInternalResourceData(); // clear internal data

    // get all serv req and tasks again
    this.getQRs();
    this.getTasksForQRs();
  }

  clearInternalResourceData() {
    // original data store for resources
    this.qrList = [];
    this.eocList = [];
    this.practList = [];
    this.patList = [];

    // Tasks List
    this.tasksList = [];
    this.taskPractList = [];


    // final obj to render for component
    this.serviceRequestList = [];
    this.serviceTaskRequestList = [];
  }

  getQRs() {
    this.adminHomeScreenService.getAllQRIncludeRefs()
      .subscribe(list => {
        // we loop through all the entries
        // for each entry, check what resource it is. and add it to the internal arr of tems
        if (list && list['entry']) {
          list['entry'].forEach(element => {
            const resource = element.resource;
            if (resource.resourceType === 'QuestionnaireResponse') {
                this.qrList.push(resource);
            } else if (resource.resourceType === 'EpisodeOfCare') {
                this.eocList.push(resource);
            } else if (resource.resourceType === 'Patient') {
                this.patList.push(resource);
            } else if (resource.resourceType === 'Practitioner') {
                this.practList.push(resource);
            }
          });

          // create our service request obj to render for UI comp
          this.mapRenderingList();
        }
      },
      err => {
        console.log(err);
      });
  }

  getTasksForQRs() {
    // get Tasks
    this.adminHomeScreenService.getTasksAssignedToLoggedInClinician().subscribe(list => {
      if (list && list['entry']) {
        // for each entry, check what resource it is. and add it to the internal arr of tems
        list['entry'].forEach(element => {
          const resource = element.resource;
          if (resource.resourceType === 'Task') {
            console.log(resource);
            this.tasksList.push(resource);
          } else if (resource.resourceType === 'Practitioner') {
            this.taskPractList.push(resource);
          }
        });

        // create our service request obj to render for UI comp
        this.mapTaskRenderingList();
      }
    }, err => {
      console.log(err);
    });
    // this.adminHomeScreenService.getAllQRTaskIncludeRefs()
    //   .subscribe(list => {
    //     // console.log(list);
    //     // we loop through all the entries

    //     if (list && list['entry']) {
    //       // for each entry, check what resource it is. and add it to the internal arr of tems
    //       list['entry'].forEach(element => {
    //         const resource = element.resource;
    //         if (resource.resourceType === 'Task') {
    //           console.log(resource);
    //           this.tasksList.push(resource);
    //         } else if (resource.resourceType === 'Practitioner') {
    //           this.taskPractList.push(resource);
    //         }
    //       });

    //       // create our service request obj to render for UI comp
    //       this.mapTaskRenderingList();
    //     }
    //   },
    //   err => {
    //     console.log(err);
    //   });
  }

  getAndSetDepartmentList() {
    this.adminHomeScreenService.getDepartmentNames()
      .subscribe(bundle => {
        console.log('employee department => ', bundle);
        this.employeeDepartmentList = this.extractKeyValuePairsFromBundle(bundle);
      },
      (err) => console.log('Employee Department list error', err));
  }

  getAndSetLocations() {
    
    this.datePickerConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue', dateInputFormat: this.DATE_FORMAT, rangeInputFormat: this.DATE_FORMAT }
    );
  }

  mapRenderingList() {
    // note:
    // id == qr.id
    // header ==  qr.item[x].text == 'psoph service' (field beside id in comp)
    // clientDepartment === from patient's extention prop, look for /workplace in url
    // client nae == patient name
    // days in queue == eoc's period.start
    // status = qr's status prop
    // daytoday === calc based on days in quue and today
    // caremanager == eoc's practitioner name

    console.log('qr list', this.qrList);

    this.qrList.forEach(item => {
      // console.log(item);
      const temp = {};

      const eoc = this.eocList.find(i => (i.resourceType + '/' + i.id) === item.context.reference);
      const patient = this.patList.find(i => eoc && eoc.patient
        && eoc.patient.reference && eoc.patient.reference === i.resourceType + '/' + i.id);

      if (eoc && eoc['careManager']) {
        temp['careManager'] = this.getPractitioner(eoc['careManager']['reference'], false);
      } else {
        temp['careManager'] = 'Unassigned';
      }
      temp['id'] = item['id'];
      temp['header'] = this.getHeader(item, 'PSOHPSERV');
      temp['clientDepartment'] = this.getClientDepartment(patient);
      temp['clientName'] = this.getClientName(patient);
      temp['daysInQueue'] = this.getDaysInQueue(eoc['period']['start']);
      temp['status'] = item['displayStatus'] ? item['displayStatus'] : 'On-Hold';
      temp['dateToday'] = moment(eoc.period.start).format('MMM DD YYYY'); // formatDate(new Date(), 'MMM dd yyyy', 'en');
      temp['eocId'] = eoc && eoc.id ? eoc.id : null;

      this.serviceRequestList.push(temp);
    });

  }

  mapTaskRenderingList() {

    this.tasksList.forEach(item => {
      const temp = {};
      // console.log(item)
      if (item['owner']) {
        temp['careManager'] = this.getPractitioner(item['owner']['reference'], true);
      } else {
        temp['careManager'] = 'Unassigned';
      }
      temp['id'] = item['id'];
      temp['title'] = item['description'];
      temp['instructions'] = item['note'] != null ? item['note'][0].text : '';
      temp['status'] = item['status'];
      temp['authoredOn'] = item['authoredOn'] != null ? moment(item['authoredOn']).format('MMM DD YYYY') : null;
      temp['eocId'] = item.context.reference.replace('EpisodeOfCare/', '');

      this.serviceTaskRequestList.push(temp);
    });
  }

  toggleAdvanceSearch() {
    if (this.showAdvanceSearch) {
      this.showAdvanceSearch = false;
    } else {
      this.showAdvanceSearch = true;
    }
  }

  validateForm() {
    // console.log('this',this.adminHomeFormGroup.value)
    // if (this.adminHomeFormGroup.valid) {
    //   this.activateSubmitButton = true;
    // }

    // return this.activateSubmitButton;

    // check if even one value in form is filled
    let valueFilled = false;
    const form = this.adminHomeFormGroup.value;

    if (form.dateRange !== '' || form.dob !== '' || form.employeeDepartment !== '' ||
        form.firstName !== '' || form.lastName !== '' || form.pri !== '' ||
        form.assesmentCat !== '' || form.assesmentType !== '' || form.psohpService !== '' ||
        form.serviceRequest !== '') {
      valueFilled = true;
    }

    return !(this.adminHomeFormGroup.valid && valueFilled);
  }

  getDaysInQueue(startDateString) {
    if (startDateString.length > 0) {
      return moment().diff(moment(startDateString), 'days');
    }

    return null;
  }

  setEOCID(data) {
    sessionStorage.setItem('selectedEpisodeId', data);
    this.router.navigateByUrl('/staff/work-screen');
  }

  getClientName(patientReference) {
    let lastName = '';
    let firstName = '';
    if (patientReference) {
      patientReference['name'].forEach(patientName => {
        lastName = patientName['family'];
        firstName = patientName['given'][0];
      });

      return firstName + ' ' + lastName;
    }
  }

  getClientDepartment(patientNameResource) {
    let dept = '';
    patientNameResource.extension.forEach(extension => {
      if (extension.url === 'https://bcip.smilecdr.com/fhir/workplace') {
        dept = extension.valueString;
      }
    });

    return dept;
  }

  getIdFromReference(reference) {
    return reference.substring(reference.indexOf('/') + 1, reference.length);
  }

  getHeader(qr, itemText) {
    let serviceType = '';
    if (qr['item']) {
      qr.item.forEach(item => {
        if (item['linkId'] === itemText) {
          for (const answer of item['answer']) {
            if (answer['valueCoding']) {
              serviceType = answer['valueCoding']['display'];
            }
          }
        }
      });
    } else {
      console.log('buggy one', qr);
    }
    return serviceType;
  }

  getPractitioner(pracId, isTaskRequest) {
    let resource;

    if (isTaskRequest) {
      resource = this.taskPractList.find(item => item.resourceType + '/' + item.id === pracId);
      // this.taskPractList[this.getIdFromReference(pracId)];
    } else {
      resource = this.practList.find(item => item.resourceType + '/' + item.id === pracId);
      // this.practList[this.getIdFromReference(pracId)];
    }

    let lastName = '';
    let firstName = '';
    if (resource && resource['name']) {
      resource['name'].forEach(resourceName => {
        lastName = resourceName['family'];
        resourceName.given.forEach(givenName => {
          firstName += givenName;
        });
      });

      return firstName + ' ' + lastName;
    }
  }

  extractKeyValuePairsFromBundle(bundle) {
    if (bundle && bundle['entry']) {
      const bundleEntries = bundle['entry'];

      const list = bundleEntries.map(item => {
        if (item && item.resource) {
          const temp = {
            value: item.resource.resourceType + '/' + item.resource.id,
            text: item.resource.name
          };

          return temp;
        }
        return { value: null, text: null };
      });

      return list;
    }

    return [];
  }

  extractPsophListFromQuestionnaire(resource) {
    if (resource && resource.item && Array.isArray(resource.item) && resource.item.length > 0) {
      const psophItem = resource.item.find(item => item && item.text && item.text === 'PSOHP Service');

      if (psophItem && psophItem.option && Array.isArray(psophItem.option) && psophItem.option.length > 0) {
        const list = psophItem.option.map(item => {
          const temp = {
            value: item.valueCoding.code,
            text: item.valueCoding.code
          };

          return temp;
        });

        return list;
      }
    }
    return [];
  }

  renderItemsBasedOnTab(item) {
    if (this.activeTab.toLowerCase() === 'all') {
      return true;
    } else {
      return item && item.status && item.status.toLowerCase() === this.activeTab.toLowerCase();
    }
  }

  renderTaskItemsBasedOnTab(task) {
    // console.log(task);
    const activeTab = this.activeTab.toLowerCase();

    if (activeTab === 'all') {
      return true;
    } else {
      const qr = this.serviceRequestList.find(item => item.eocId === task.eocId);

      if (qr && qr.status && qr.status.toLowerCase() === activeTab) { return true; }

      return false;
    }
  }

  taskCompleted(taskId) {
    console.log('Mark as completed task id =>', taskId);

    this.staffService.getTaskByID(taskId).subscribe(task => {
      task['status'] = 'completed';
      this.staffService
        .updateTask(task['id'], JSON.stringify(task))
        .subscribe(updatedTask => {
          // console.log(updatedTask);
          const taskIndex = this.tasksList.findIndex(item => item.id === taskId);

          this.tasksList[taskIndex] = updatedTask;

          this.serviceTaskRequestList = [];

          this.mapTaskRenderingList();
        });
    });
  }
}
