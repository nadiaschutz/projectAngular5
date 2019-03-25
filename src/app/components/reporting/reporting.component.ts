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
  regions = ['Select Region'];
  psohpTypes = ['Select Type', 'HACAT1', 'HACAT2', 'HACAT3', 'FTWORK',
  'SUBUYB', 'SUREMG', 'SUSURB', 'THSOTT', 'THPPC1', 'THPPC3', 'THCRC1', 'THCRC2', 'THCRC3'];
  clientDepartments = ['Select Department'];
  statuses = ['Select Status', 'RECEIVED', 'VALIDATED', 'ASSIGNED', 'SCHEDULED', 'WORK COMPLETED', 'CLOSED'];
  milestones = ['Select Status', 'RECEIVED', 'VALIDATED', 'ASSIGNED', 'SCHEDULED', 'WORK COMPLETED', 'CLOSED'];
  reportingFormGroup: FormGroup;
  dataSets = ['Select Data Set', 'Service Request', 'Care Plan', 'Diagnostics Test',
  'Consultation', 'Medical Information', 'Vaccines', 'Full Log'];
  episodeOfCareList = [];
  questionnaireResponseList = [];
  patientsList = [];
  carePlanList = [];
  practitionerList = [];
  diagnosticsTestList = [];
  consultationList = [];
  medicalInformationList = [];
  associatedEoCAndQResponseIds = [];

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
    private fb: FormBuilder, private utilService: UtilService, private reportingService: ReportingService) { }

  // This screen needs a date range picker: year, quarter, and month
  // a date picker: start date and end date
  // Selections for data set include: PSOHP office, region, type, department, category, charge back, status, and milestone
  // this task has 2 parts: building the screen, and having the data exported to a csv
  // Get data to populate dropdowns for Regions/Types/Department/Category/Status/Milestones

  ngOnInit() {
    this.preLoadServiceRequestData();
    this.initializeDatePicker();
    this.getAllRegions();
    this.getAllClientDeparments();
    this.reportingFormGroup = this.fb.group({
      psohpService: new FormControl(null),
      assesmentType: new FormControl(null),
      assesmentCat: new FormControl(null),
      region: new FormControl(''),
      department: new FormControl(''),
      status: new FormControl(''),
      milestone: new FormControl(''),
      serviceRequest: new FormControl(''),
      vaccines: new FormControl(''),
      dataSet: new FormControl(''),
      dateRange: new FormControl('')
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
        this.regions.push(element.resource.name);
      });
    });
  }

  getAllClientDeparments() {
    this.userService.fetchAllClientDepartments().subscribe(data => {
      data['entry'].forEach(element => {
        this.clientDepartments.push(element.resource.name);
      });
    });
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
          this.patientsList.push(element.resource);
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

  async testAwait() {
    const episodeData = await this.reportingService.fetchAllEpisodeOfCare();
    const questionnaireResponseList = [];
    for (const episode of episodeData['entry']) {
      const questionnaireResponses = await this.reportingService.fetchQuestionnaireResponseFromEpisodeOfCare(episode.resource.id);
      for (const questionnaireResponse of questionnaireResponses['entry']) {
        console.log(questionnaireResponse.resource);
      }
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
        this.processCarePlan(arr);
      } else {
        this.processCarePlan(arr);
      }
    }
    if (this.reportingFormGroup.value.dataSet === 'Diagnostics Test' ||
    this.reportingFormGroup.value.dataSet === 'Consultation' ||
    this.reportingFormGroup.value.dataSet === 'Medical Information') {
      this.processProcedureRequestData(this.reportingFormGroup.value.dataSet);
    }
    // this.resetData();
  }

  processCarePlan(carePlans) {
    console.log(carePlans);
    if (carePlans.length > 0) {
      const carePlanResultList = [];
      carePlans.forEach(carePlan => {
        const episodeOfCareId = this.utilService.getIdFromReference(carePlan.context.reference);
        carePlan.activity.forEach(activity => {
          if (activity.detail.status === 'completed' && activity.progress) {
            const temp = {};
            temp['Service Request Id'] = this.associatedEoCAndQResponseIds[episodeOfCareId];
            temp['Careplan Code'] = carePlan.id;
            temp['Careplan Activity No.'] = activity.detail.description;
            const latestProgressItem = activity.progress[activity.progress.length - 1];
            if (latestProgressItem.authorReference) {
              temp ['User ID that completed the activity'] = latestProgressItem.authorReference;
            } else {
              temp ['User ID that completed the activity'] = '';
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

  processServiceRequestData() {
    this.episodeOfCareList.forEach(episode => {
      const temp = {};
      const episodeOfCareId = episode.id;
      if (episodeOfCareId) {
        temp['Service Request Id'] = episode.id;
        this.questionnaireResponseList.forEach(questionnaireResponse => {
          if (questionnaireResponse.context.reference.includes(episodeOfCareId)) {
            if (questionnaireResponse.identifier.value === 'SERVREQ') {
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
              });
            }
            if (questionnaireResponse.identifier.value === 'STATUS') {
              questionnaireResponse['item'].forEach(statusItem => {
                if (statusItem.answer) {
                  if (statusItem.answer[1] && statusItem.answer[1]['valueDate']) {
                    temp[statusItem.text] = statusItem.answer[1].valueDate;
                  } else {
                    temp[statusItem.text] = '';
                  }
                } else {
                  temp[statusItem.text] = '';
                }
              });
            }
          }
        });
        this.serviceRequestData.push(temp);
      }
    });
  }

  exportToCSV(data) {
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
    this.reportingFormGroup.patchValue({assesmentType: null});
    this.reportingFormGroup.patchValue({assesmentCat: null});
  }

  assessTypeChanged() {
    const assesTypeValue = this.reportingFormGroup.get('assesmentType').value;
    const temp = this.typeNext.filter(p => p.type === assesTypeValue).map(item => item.value);
    this.assesmentCatList = temp;
    // reset
    this.reportingFormGroup.patchValue({assesmentCat: null});
  }

  assessCATChanged() {
    const assesCATValue = this.reportingFormGroup.get('assesmentCat').value;
  }

  resetData() {
    this.carePlanList = [];
  }

}
