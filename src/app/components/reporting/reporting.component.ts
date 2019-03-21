import { Component, OnInit } from '@angular/core';
import { StaffService } from '../../service/staff.service';
import { ExportToCsv } from 'export-to-csv';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { UserService } from '../../service/user.service';
import { UtilService } from '../../service/util.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import * as ReportingInterfaces from '../../interface/reporting-interfaces';
import { Reporting } from '../../interface/reporting';


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
  // If a service request is selected, then build the entire SR object
  // For Labs/Vaccines, query the respective resources

  constructor(private staffService: StaffService, private userService: UserService,
    private fb: FormBuilder, private utilService: UtilService) { }

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
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      all: new FormControl(''),
      region: new FormControl(''),
      psohpType: new FormControl(''),
      department: new FormControl(''),
      status: new FormControl(''),
      serviceRequest: new FormControl(''),
      vaccines: new FormControl(''),
      dataSet: new FormControl(''),
      jobLocation: new FormControl({ value: '', disabled: true}),
      psohp: new FormControl(''),
      // assesmentType: new FormControl('', Validators.required),
      // assesmentCat: new FormControl('', Validators.required),
      // processingLocation: new FormControl('', Validators.required),
      // changeBack: new FormControl('', Validators.required),
      // dateFrom: new FormControl(''),
      // dateEnd: new FormControl(''),
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

  export() {
    if (this.reportingFormGroup.value.dataSet === 'Service Request') {
      this.exportToCSV(this.serviceRequestData);
    }
    if (this.reportingFormGroup.value.dataSet === 'Care Plan') {
      this.staffService.fetchAllCarePlans().subscribe(data => {
        data['entry'].forEach(element => {
          this.carePlanList.push(element.resource);
        });
        this.processCarePlan();
      });
    }
    if (this.reportingFormGroup.value.dataSet === 'Diagnostics Test' ||
    this.reportingFormGroup.value.dataSet === 'Consultation' ||
    this.reportingFormGroup.value.dataSet === 'Medical Information') {
      this.processProcedureRequestData(this.reportingFormGroup.value.dataSet);
    }
  }

  processCarePlan() {
    if (this.carePlanList.length > 0) {
      const carePlanResultList = [];
      this.carePlanList.forEach(carePlan => {
        const episodeOfCareId = this.utilService.getIdFromReference(carePlan.context.reference);
        if (carePlan.identifier[0].value === 'HACAT1') {
          console.log(carePlan.identifier[0].value);
        }
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
    console.log(data);
    console.log(data[0]);
    console.log(Array.isArray(data));
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
    }
  }

  sampleExport() {
    const data = [{
      'Assigned': '',
      'Closed': '',
      'OHAG Occupation': 'Health Care Workers-Nurses',
      'Psohp Service': 'HACAT1',
      'Received': '',
      'Regional Office': 'Atlantic-Halifax',
      'Scheduled': '',
      'Service Request Id': '14654',
      'Validated': '',
      'Waiting': '',
      'Work-Completed': '2019-03-17'
    }];
    console.log(typeof(data));
    console.log(data[0]);
    console.log(data);
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
  }

}
