import { Component, OnInit } from '@angular/core';
import { StaffService } from '../../service/staff.service';
import { ExportToCsv } from 'export-to-csv';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { UserService } from '../../service/user.service';
import { UtilService } from '../../service/util.service';
import { ReportingService } from '../../service/reporting.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import * as ReportingInterfaces from '../../interface/reporting-interfaces';
import { Reporting } from '../../interface/reporting';
import { Organization } from '../../interface/FHIR';
import * as moment from 'moment';


export interface NameValueLookup {
  text?: string;
  value?: string;
}

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent implements OnInit {

  serviceRequestData = [];
  datePickerConfig: Partial<BsDatepickerConfig>;
  DATE_FORMAT = 'YYYY-MM-DD';
  dateRange = {};
  dateRangeYear = false;
  dateRangeQuarter = false;
  dateRangeMonth = false;
  dateRangeButtonSelected = false;
  dateRangeCalendarSelected = false;
  regions = [{name: 'Select Region', value: null}];
  psohpTypes = ['Select Type', 'HACAT1', 'HACAT2', 'HACAT3', 'FTWORK',
  'SUBUYB', 'SUREMG', 'SUSURB', 'THSOTT', 'THPPC1', 'THPPC3', 'THCRC1', 'THCRC2', 'THCRC3'];
  clientDepartments = ['Select Department'];
  statuses = ['Select Status', 'RECEIVED', 'VALIDATED', 'ASSIGNED', 'SCHEDULED', 'WORK COMPLETED', 'CLOSED'];
  milestones = ['Select Status', 'RECEIVED', 'VALIDATED', 'ASSIGNED', 'SCHEDULED', 'WORK COMPLETED', 'CLOSED'];
  reportingFormGroup: FormGroup;
  dataSets = ['Select Data Set', 'Service Request', 'Care Plan',
  'Vaccines', 'Full Log'];
  fullLogTypes = ['Select Full Log', 'Dependents', 'Assign', 'Task', 'Requisition'];
  showFullLogTypes = false;
  episodeOfCareList = [];
  questionnaireResponseList = [];
  patientsList = {};
  organizationsList = {};
  carePlanList = [];
  practitionerList = [];
  diagnosticsTestList = [];
  consultationList = [];
  medicalInformationList = [];
  associatedEoCAndQResponseIds = [];
  observation = {};

  assesmentTypeList: NameValueLookup[] = [];
  assesmentCatList: NameValueLookup[] = [];

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
  // If a service request is selected, then build the entire SR object
  // For Labs/Vaccines, query the respective resources

  constructor(private staffService: StaffService, private userService: UserService,
    private fb: FormBuilder, private utilService: UtilService,
    private reportingService: ReportingService) { }

  // This screen needs a date range picker: year, quarter, and month
  // a date picker: start date and end date
  // Selections for data set include: PSOHP office, region, type, department, category, charge back, status, and milestone
  // this task has 2 parts: building the screen, and having the data exported to a csv
  // Get data to populate dropdowns for Regions/Types/Department/Category/Status/Milestones

  ngOnInit() {
    // this.preLoadServiceRequestData();
    this.initializeDatePicker();
    this.getAllRegions();
    this.getAllClientDeparments();
    this.reportingFormGroup = this.fb.group({
      psohpService: new FormControl(null),
      assesmentType: new FormControl(null),
      assesmentCat: new FormControl(null),
      region: new FormControl(null),
      department: new FormControl(null),
      status: new FormControl(''),
      milestone: new FormControl(''),
      serviceRequest: new FormControl(''),
      vaccines: new FormControl(''),
      dataSet: new FormControl(''),
      dateRange: new FormControl(''),
      fullLogType: new FormControl('')
    });
  }

  initializeDatePicker() {
    this.datePickerConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue', dateInputFormat: this.DATE_FORMAT, rangeInputFormat: this.DATE_FORMAT }
    );
  }

  getAllRegions() {
    this.userService.fetchAllRegionalOffices().subscribe(data => {
      data['entry'].forEach(element => {
        this.regions.push({name: element.resource.name, value: 'Organization/' + element.resource.id});
      });
    });
  }

  getAllClientDeparments() {
    this.userService.fetchAllClientDepartments().subscribe(data => {
      let arrToSort = [];
      data['entry'].forEach(element => {
        arrToSort.push(element.resource.name);
      });
      arrToSort = arrToSort.sort((a, b) => {
        const textA = a.toUpperCase();
        const textB = b.toUpperCase();
        if (textA < textB) { return -1; }
        if (textA > textB) { return 1; }
        return 0;
      });
      arrToSort.forEach(department => {
        this.clientDepartments.push(department);
      });
    });
  }

  onDataSetChange() {
    const selectedDataSet = this.reportingFormGroup.value.dataSet;
    if (selectedDataSet === 'Full Log') {
      this.showFullLogTypes = true;
    } else {
      this.showFullLogTypes = false;
    }
  }

  onCalendarChange() {
    this.dateRangeYear = false;
    this.dateRangeQuarter = false;
    this.dateRangeMonth = false;
    this.dateRangeCalendarSelected = true;
  }

  setDateRangeFromButtons(selectedType) {
    const currentDate = this.utilService.getCurrentDate();
    this.dateRange['to'] = currentDate;
    const fromDate = new Date(currentDate);
    if (selectedType === 'Year') {
      this.dateRangeYear = true;
      this.dateRangeQuarter = false;
      this.dateRangeMonth = false;
      this.dateRangeCalendarSelected = false;
      this.reportingFormGroup.patchValue({ dateRange: null });
      fromDate.setFullYear(fromDate.getFullYear() - 1);
    } else if (selectedType === 'Quarter') {
      this.dateRangeYear = false;
      this.dateRangeQuarter = true;
      this.dateRangeMonth = false;
      this.dateRangeCalendarSelected = false;
      this.reportingFormGroup.patchValue({ dateRange: null });
      fromDate.setMonth(fromDate.getMonth() - 3);
    } else if (selectedType === 'Month') {
      this.dateRangeYear = false;
      this.dateRangeQuarter = false;
      this.dateRangeMonth = true;
      this.dateRangeCalendarSelected = false;
      this.reportingFormGroup.patchValue({ dateRange: null });
      fromDate.setMonth(fromDate.getMonth() - 1);
    }
    this.dateRange['from'] = this.utilService.getDate(fromDate);
  }

  async buildQueryParameters() {
    let searchParameters = '?_include=*&_revinclude=*&_revinclude:recurse=Observation:context';
    const region = this.reportingFormGroup.value.region;
    if (region) {
      searchParameters += '&patient:Patient.branch.psohpRegion.name=' + region;
    }
    const department = this.reportingFormGroup.value.department;
    if (department) {
      searchParameters += '&patient:Patient.workplace.name=' + department;
    }
    if (this.dateRangeYear || this.dateRangeQuarter || this.dateRangeMonth) {
      searchParameters += '&date=ge' + this.dateRange['from'] + '&date=le' + this.dateRange['to'];
    }
    if (this.reportingFormGroup.value.dateRange &&
      Array.isArray(this.reportingFormGroup.value.dateRange) &&
      this.reportingFormGroup.value.dateRange.length === 2 &&
      moment(this.reportingFormGroup.value.dateRange[0]).isValid() &&
      moment(this.reportingFormGroup.value.dateRange[1]).isValid()) {
        searchParameters +=
      '&date=ge' + moment(this.reportingFormGroup.value.dateRange[0]).format(this.DATE_FORMAT) +
      '&date=le' + moment(this.reportingFormGroup.value.dateRange[1]).format(this.DATE_FORMAT);
    }
    const dataSet = this.reportingFormGroup.value.dataSet;
    if (dataSet) {
      if (dataSet === 'Service Request') {
        const data = await this.reportingService.fetchEpisodeOfCareFromSearchParams(searchParameters);
        this.processEpisodeAndRelatedData(data);
      }
      if (dataSet === 'Care Plan') {
        // Query for Episode of Care by including CarePlan and Questionnaire Response
        const data = await this.reportingService.fetchCarePlanFromSearchParams(searchParameters);
        this.processCarePlanAndRelatedData(data);
      }
      if (dataSet === 'Requisition') {
        // Check the type of requisition and query
      }
      if (dataSet === 'Full Log') {
        const fullLogType = this.reportingFormGroup.value.fullLogType;
        if (fullLogType === 'Dependents') {
          // Query for dependents
          const data = await this.reportingService.fetchServReqAlongWithPatients();
          this.processServReqDataForFullLogDependents(data);
        } else if (fullLogType === 'Assign') {
          // Query for Assign
        } else if (fullLogType === 'Task') {
          // Query for Tasks
          const data = await this.reportingService.fetchTasks();
          this.processDataForFullLogTask(data);
        }
      }
    }
  }

  processDataForFullLogTask(data) {
    if (data['entry']) {
      const resultList = [];
      data['entry'].forEach(element => {
        const task = element.resource;
        const temp = {};
        temp['Service Request ID'] = this.utilService.getIdFromReference(task.context.reference);
        temp['Task ID'] = task.id;
        temp['Date Created'] = task['authoredOn'];
        const assignorFHIRId = this.utilService.getIdFromReference(task.requester.agent.reference);
        this.utilService.getUserPRIFromFHIRId(assignorFHIRId).then(pri => {
          temp['Assignor User ID'] = pri;
        });
        if (task.status === 'completed') {
          temp['Date Closed'] = this.utilService.getDate(task.meta.lastUpdated);
        } else {
          temp['Date Closed'] = this.utilService.getDate(task.meta.lastUpdated);
        }
        temp['Result'] = task['status'];
        resultList.push(temp);
      });
      this.exportToCSV(resultList);
    }
  }

  processServReqDataForFullLogDependents(data) {
    const patientList = [];
    const fhirIdToNames = {};
    const dependentList = [];
    const questionnaireResponseList = [];
    data['entry'].forEach(element => {
      const resource = element.resource;
      if (resource.resourceType === 'Patient') {
        let isPatientAnEmployee = false;
        let dependentlink = '';
        const name = this.utilService.getNameFromResource(resource);
        fhirIdToNames[resource.id] = name;
        resource.extension.forEach(extension => {
          if (extension.url === 'https://bcip.smilecdr.com/fhir/employeetype') {
            if (extension.valueString === 'Employee') {
              isPatientAnEmployee = true;
            }
            if (extension.valueString === 'Dependent') {
              isPatientAnEmployee = false;
            }
          }
          if (extension.url === 'https://bcip.smilecdr.com/fhir/dependentlink') {
            dependentlink = extension.valueString;
          }
        });
        if (isPatientAnEmployee) {
          // Patient List has patient FHIR id as key and dependent link as value
          patientList[resource.id] = dependentlink;
        } else {
          // Dependent List has dependent link as key and patient FHIR id as value
          if (dependentList[dependentlink]) {
            dependentList[dependentlink].push(resource.id);
          } else {
            dependentList[dependentlink] = [];
            dependentList[dependentlink].push(resource.id);
          }
        }
      }
      // QuestionnaireResponseList has the QR id as key and value as patient ID
      if (resource.resourceType === 'QuestionnaireResponse') {
        if (resource.subject) {
          questionnaireResponseList[resource.id] = this.utilService.getIdFromReference(resource.subject.reference);
        }
      }
    });
    const resultList = [];
    for (const patientId of Object.keys(patientList)) {
      const employeeName = fhirIdToNames[patientId];
      const dependents = dependentList[patientList[patientId]];
      for (const questionnaireResponseId of Object.keys(questionnaireResponseList)) {
        const temp = {};
        if (questionnaireResponseList[questionnaireResponseId] === patientId) {
          temp['Service Request ID'] = questionnaireResponseId;
          temp['Employee Name'] = employeeName;
          temp['Dependent Name'] = '-';
          resultList.push(temp);
        }
        if (dependents && dependents.length > 0) {
          for (const dependentId of dependents) {
            if (questionnaireResponseList[questionnaireResponseId] === dependentId) {
              temp['Service Request ID'] = questionnaireResponseId;
              temp['Employee Name'] = employeeName;
              temp['Dependent Name'] = fhirIdToNames[dependentId];
              resultList.push(temp);
            }
          }
        }
      }
    }
    this.exportToCSV(resultList);
  }

  preLoadServiceRequestData() {
    this.staffService.getAllEpisodeOfCareAndRelatedData().subscribe(data => {
      data['entry'].forEach(element => {
        if (element.resource.resourceType === 'EpisodeOfCare') {
          this.episodeOfCareList.push(element.resource);
        }
        if (element.resource.resourceType === 'QuestionnaireResponse') {
          this.questionnaireResponseList.push(element.resource);
        }
        if (element.resource.resourceType === 'Patient') {
          // this.patientsList.push(element.resource);
        }
        if (element.resource.resourceType === 'Practitioner') {
          this.practitionerList.push(element.resource);
        }
        if (element.resource.resourceType === 'CarePlan') {
          this.carePlanList.push(element.resource);
        }
      });
      this.processServiceRequestData();
    });
  }

  buildQuery(form: FormGroup) {
    const queryObj = {};
    queryObj['_include:recurse'] = '*';
    if (form.value.department) {
      queryObj['patient:Patient.workplace'] = form.value.department;
    }
    if (form.value.region) {
      queryObj['organization:Organization.name'] = form.value.department;
    }
  }

  export() {
    let assessmentCode = '';
    if (this.reportingFormGroup.get('assesmentCat').value !== null) {
      assessmentCode = this.reportingFormGroup.get('assesmentCat').value;
    } else {
      if (this.reportingFormGroup.get('assesmentType').value !== null) {
        assessmentCode = this.reportingFormGroup.get('assesmentType').value;
      } else {
        if (this.reportingFormGroup.get('psohpService').value !== null) {
          assessmentCode = this.reportingFormGroup.get('psohpService').value;
        }
      }
    }
    if (this.reportingFormGroup.value.dataSet === 'Service Request') {
      this.exportToCSV(this.serviceRequestData);
    }
    if (this.reportingFormGroup.value.dataSet === 'Care Plan') {
      const arr = new Array;
      if (assessmentCode.length > 0 && assessmentCode !== 'Select') {
        this.carePlanList.forEach(carePlan => {
          if (carePlan.identifier[0].value === assessmentCode) {
            arr.push(carePlan);
          }
        });
        // this.processCarePlan(arr);
      } else {
        // this.processCarePlan(this.carePlanList);
      }
    }
    if (this.reportingFormGroup.value.dataSet === 'Diagnostics Test' ||
      this.reportingFormGroup.value.dataSet === 'Consultation' ||
      this.reportingFormGroup.value.dataSet === 'Medical Information') {
      this.processProcedureRequestData(this.reportingFormGroup.value.dataSet);
    }
    // this.resetData();
  }

  processCarePlanAndRelatedData(data) {
    data['entry'].forEach(element => {
      if (element.resource.resourceType === 'EpisodeOfCare') {
        this.episodeOfCareList.push(element.resource);
      }
      if (element.resource.resourceType === 'QuestionnaireResponse') {
        this.questionnaireResponseList.push(element.resource);
      }
      if (element.resource.resourceType === 'Patient') {
        this.patientsList[element.resource.id] = element.resource;
      }
      if (element.resource.resourceType === 'Practitioner') {
        this.practitionerList.push(element.resource);
      }
      if (element.resource.resourceType === 'CarePlan') {
        this.carePlanList.push(element.resource);
      }
      if (element.resource.resourceType === 'Organization') {
        this.organizationsList[element.resource.id] = element.resource;
      }
    });
    this.processCarePlan();
  }

  processCarePlan() {
    if (this.carePlanList.length > 0) {
      const carePlanResultList = [];
      this.carePlanList.forEach(carePlan => {
        let episodeOfCareId = '';
        if (carePlan.context) {
          episodeOfCareId = this.utilService.getIdFromReference(carePlan.context.reference);
        }
        carePlan.activity.forEach(activity => {
          if (activity.detail.status === 'completed' && activity.progress) {
            const temp = {};
            if (episodeOfCareId !== '') {
              temp['Service Request Id'] = this.associatedEoCAndQResponseIds[episodeOfCareId];
            } else {
              temp['Service Request Id'] = '';
            }
            temp['Careplan Code'] = carePlan.id;
            temp['Careplan Activity No.'] = activity.detail.description;
            const latestProgressItem = activity.progress[activity.progress.length - 1];
            if (latestProgressItem.authorReference) {
              temp['User ID that completed the activity'] =
              this.utilService.getIdFromReference(latestProgressItem.authorReference.reference);
            } else {
              temp['User ID that completed the activity'] = '';
            }
            temp['Timestamp when activity was done'] =
              this.utilService.getDateTime(latestProgressItem.time);
            carePlanResultList.push(temp);
          }
        });
      });
      this.exportToCSV(carePlanResultList);
    }
  }

  // This method builds Procedure Request data. This is used for: Diagnostics Test, Consultation, Medical information and Immuizations
  processProcedureRequestData(typeOfProcedureRequest: string) {
    this.staffService.getProcedureRequestFromIdentifier(typeOfProcedureRequest).subscribe(data => {
      data['entry'].forEach(element => {
        if (element.resource.identifier[0].value === 'Diagnostics Test') {
          this.diagnosticsTestList.push(element.resource);
        }
        if (element.resource.identifier[0].value === 'Consultation') {
          this.consultationList.push(element.resource);
        }
        if (element.resource.identifier[0].value === 'Medical Information') {
          this.medicalInformationList.push(element.resource);
        }
      });
      if (typeOfProcedureRequest === 'Diagnostics Test') {
        this.processDiagnosticsTest();
      }
      if (typeOfProcedureRequest === 'Consultation') {
        this.processConsultations();
      }
      if (typeOfProcedureRequest === 'Medical Information') {
        this.processMedicalInformation();
      }
    });
  }

  processDiagnosticsTest() {
    if (this.diagnosticsTestList.length > 0) {
      const diagnosticTestResultList = [];
      this.diagnosticsTestList.forEach(data => {
        console.log(data);
        const temp = {};
      });
    }
  }

  processConsultations() {
    this.consultationList.forEach(data => {
      console.log(data);
    });
  }

  processMedicalInformation() {
    this.medicalInformationList.forEach(data => {
      console.log(data);
    });
  }

  processEpisodeAndRelatedData(data) {
    data['entry'].forEach(element => {
      if (element.resource.resourceType === 'EpisodeOfCare') {
        this.episodeOfCareList.push(element.resource);
      }
      if (element.resource.resourceType === 'QuestionnaireResponse') {
        this.questionnaireResponseList.push(element.resource);
      }
      if (element.resource.resourceType === 'Patient') {
        this.patientsList[element.resource.id] = element.resource;
      }
      if (element.resource.resourceType === 'Practitioner') {
        this.practitionerList.push(element.resource);
      }
      if (element.resource.resourceType === 'CarePlan') {
        this.carePlanList.push(element.resource);
      }
      if (element.resource.resourceType === 'Organization') {
        this.organizationsList[element.resource.id] = element.resource;
      }
      if (element.resource.resourceType === 'Observation') {
        this.observation = element.resource;
      }
    });
    this.processServiceRequestData();
  }

  async processServiceRequestData() {
    this.episodeOfCareList.forEach(episode => {
      const resultObj = {};
      const episodeOfCareId = episode.id;
      if (episodeOfCareId) {
        const temp = {};
        const patientId = this.utilService.getIdFromReference(episode.patient.reference);
        const patient = this.patientsList[patientId];
        patient.extension.forEach(extension => {
          if (extension.url === 'https://bcip.smilecdr.com/fhir/employeetype') {
            if (extension.value === 'Employee') {
              temp['Client Type'] = '1';
            }
            if (extension.value === 'Dependent') {
              temp['Client Type'] = '2';
            }
          }
        });
        // Assessment Code and Exam by code from Observation
        if (this.observation !== {}) {
          if (this.observation['performer']) {
            temp['Exam Done by Code'] = '2';
          }
          if (this.observation['component']) {
            this.observation['component'].forEach(observationComponent => {
              if (observationComponent.code.coding[0].system === 'ASSESSMENT') {
                if (observationComponent.code.coding[0].code === 'MEETSREQ') {
                  temp['Assessment Code'] = '1';
                }
                if (observationComponent.code.coding[0].code === 'MEETSREQ_NO') {
                  temp['Assessment Code'] = '2';
                }
                if (observationComponent.code.coding[0].code === 'MISSING-MED') {
                  temp['Assessment Code'] = '3';
                }
                if (observationComponent.code.coding[0].code === 'NOASSESMENT') {
                  temp['Assessment Code'] = '4';
                }
              }
            });
          }
        }
        this.questionnaireResponseList.forEach(async questionnaireResponse => {
          if (questionnaireResponse.context.reference.includes(episodeOfCareId)) {
            if (questionnaireResponse.identifier.value === 'SERVREQ') {
              // Fetch Charge Back and Branch from Author of QR of SERVREQ type
              if (questionnaireResponse.author) {
                const authorFHIRId = this.utilService.getIdFromReference(questionnaireResponse.author.reference);
                const practitionerRoles = await this.reportingService.fetchPractitionerRolesWithPractitionerIdAsync(authorFHIRId);
                if (practitionerRoles['entry']) {
                  practitionerRoles['entry'].forEach(practitionerRoleElement => {
                    const practitionerRole = practitionerRoleElement.resource;
                    if (practitionerRole.specialty) {
                      practitionerRole.specialty.forEach(specialty => {
                        if (specialty.coding[0].system === 'https://bcip.smilecdr.com/fhir/clientchargeback') {
                          temp['Charge Back'] = '1';
                        }
                      });
                    }
                    if (practitionerRole.location) {
                      temp['Submitting Department Branch'] = this.utilService.getIdFromReference(practitionerRole.location[0].reference);
                    }
                  });
                }
              }
              this.associatedEoCAndQResponseIds[episodeOfCareId] = questionnaireResponse.id;
              questionnaireResponse['item'].forEach(item => {
                if (item.linkId === 'PSOHPSERV') {
                  temp['Psohp Service'] = item.answer[0].valueCoding.code;
                }
                if (item.linkId === 'REGOFFICE') {
                  temp['Regional Office'] = item.answer[0].valueCoding.display;
                }
                if (item.linkId === 'OHAGOCC') {
                  temp['OHAG Occupation'] = item.answer[0].valueCoding.display;
                }
                if (item.linkId === 'ASSESTYPE') {
                  temp['Assessment Type'] = item.answer[0].valueCoding.display;
                }
                if (item.linkId === 'ASSESCAT') {
                  temp['Assessment Category'] = item.answer[0].valueCoding.display;
                }
                if (item.linkId === 'USERDEPT') {
                  temp['Submitting Department'] = item.answer[0].valueCoding.display;
                }
                if (item.linkId === 'REGOFFICE') {
                  temp['PSOHP Region'] = item.answer[0].valueCoding.display;
                }
                if (item.linkId === 'OHAGOCC') {
                  temp['OHAG Occupation'] = item.answer[0].valueCoding.display;
                }
              });
            }
            // Assessment Cat
            const statusArray = {};
            if (questionnaireResponse.identifier.value === 'STATUS') {
              questionnaireResponse['item'].forEach(statusItem => {
                if (statusItem.answer) {
                  statusItem.answer.forEach(answer => {
                    if (answer.valueCoding && answer.valueCoding.system === 'https://bcip.smilecdr.com/fhir/WorkOrderMlestone') {
                      statusArray[statusItem.linkId] = answer.valueCoding.code.substring(0, answer.valueCoding.code.indexOf(','));
                    }
                  });
                }
              });
            }
            // Build resut object
            resultObj['Service Request Id'] = episode.id;
            if (temp['Psohp Service']) {
              resultObj['Psohp Service'] = temp['Psohp Service'];
            } else {
              resultObj['Psohp Service'] = '';
            }
            if (temp['Assessment Type']) {
              resultObj['Assessment Type'] = temp['Assessment Type'];
            } else {
              resultObj['Assessment Type'] = '';
            }
            if (temp['Assessment Category']) {
              resultObj['Assessment Category'] = temp['Assessment Category'];
            } else {
              resultObj['Assessment Category'] = '';
            }
            // Region, department, and Branch
            if (temp['PSOHP Region']) {
              resultObj['PSOHP Region'] = temp['PSOHP Region'];
            } else {
              resultObj['PSOHP Region'] = '';
            }
            if (temp['Submitting Department']) {
              resultObj['Submitting Department'] = temp['Submitting Department'];
            } else {
              resultObj['Submitting Department'] = '';
            }
            if (temp['Submitting Department Branch']) {
              resultObj['Submitting Department Branch'] = temp['Submitting Department Branch'];
            } else {
              resultObj['Submitting Department Branch'] = '';
            }
            if (temp['Charge Back']) {
              resultObj['Charge Back'] = temp['Charge Back'];
            } else {
              resultObj['Charge Back'] = '2';
            }
            if (temp['Client Type']) {
              resultObj['Client Type'] = temp['Client Type'];
            }
            // OHAG Occupation
            if (temp['OHAG Occupation']) {
              resultObj['OHAG Occupation'] = temp['OHAG Occupation'];
            } else {
              resultObj['OHAG Occupation'] = '';
            }
            // Set status and dates
            if (statusArray['Received']) {
              resultObj['Received'] = statusArray['Received'];
            } else {
              resultObj['Received'] = '';
            }
            if (statusArray['Validated']) {
              resultObj['Validated'] = statusArray['Validated'];
            } else {
              resultObj['Validated'] = '';
            }
            if (statusArray['Assigned']) {
              resultObj['Assigned'] = statusArray['Assigned'];
            } else {
              resultObj['Assigned'] = '';
            }
            if (statusArray['Scheduled']) {
              resultObj['Scheduled'] = statusArray['Scheduled'];
            } else {
              resultObj['Scheduled'] = '';
            }
            if (statusArray['Work-Completed']) {
              resultObj['Work Completed'] = statusArray['Work-Completed'];
            } else {
              resultObj['Work Completed'] = '';
            }
            if (statusArray['Closed']) {
              resultObj['Closed'] = statusArray['Closed'];
            } else {
              resultObj['Closed'] = '';
            }
            // Assessment code and exam done by code
            if (temp['Assessment Code']) {
              resultObj['Assessment Code'] = temp['Assessment Code'];
            } else {
              resultObj['Assessment Code'] = '';
            }
            if (temp['Exam Done by Code']) {
              resultObj['Exam Done by Code'] = temp['Exam Done by Code'];
            } else {
              resultObj['Exam Done by Code'] = '';
            }
          }
        });
        this.serviceRequestData.push(resultObj);
      }
    });
    console.log(this.serviceRequestData);
    this.exportToCSV(this.serviceRequestData);
  }

  exportToCSV(data) {
    console.log(data);
    if (Array.isArray(data)) {
      const options = {
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true
      };

      const csvExporter = new ExportToCsv(options);
      csvExporter.generateCsv(data);
      this.resetData();
    }
  }

  psohpChanged() {
    const psohpValue = this.reportingFormGroup.get('psohpService').value;
    const temp = this.psophNext.filter(p => p.type === psohpValue).map(item => item.value);
    this.assesmentTypeList = temp;
    this.assesmentCatList = [];
    // reset
    this.reportingFormGroup.patchValue({ assesmentType: null });
    this.reportingFormGroup.patchValue({ assesmentCat: null });
  }

  assessTypeChanged() {
    const assesTypeValue = this.reportingFormGroup.get('assesmentType').value;
    const temp = this.typeNext.filter(p => p.type === assesTypeValue).map(item => item.value);
    this.assesmentCatList = temp;
    // reset
    this.reportingFormGroup.patchValue({ assesmentCat: null });
  }

  assessCATChanged() {
    const assesCATValue = this.reportingFormGroup.get('assesmentCat').value;
  }

  resetData() {
    this.carePlanList = [];
  }

}
