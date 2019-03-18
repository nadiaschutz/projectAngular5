import { Component, OnInit } from '@angular/core';
import { StaffService } from '../../service/staff.service';
import { ExportToCsv } from 'export-to-csv';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { UserService } from '../../service/user.service';
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
  psohpTypes = ['Select Type', 'HACAT1', 'HACAT2', 'HACAT3', 'FTWORK', 'SUBUYB', 'SUREMG', 'SUSURB',
  'THSOTT', 'THPPC1', 'THPPC3', 'THCRC1', 'THCRC2', 'THCRC3'];
  clientDepartments = ['Select Department'];
  statuses = ['Select Status', 'RECEIVED', 'VALIDATED', 'ASSIGNED', 'SCHEDULED', 'WORK COMPLETED', 'CLOSED'];
  reportingFormGroup: FormGroup;
  dataSets = ['Select Data Set', 'Service Request', 'Lab', 'Vaccines', 'Full Log'];
  episodeOfCareList = [];
  questionnaireResponseList = [];
  patientsList = [];
  carePlanList = [];
  practitionerList = [];
  // If a service request is selected, then build the entire SR object
  // For Labs/Vaccines, query the respective resources

  constructor(private staffService: StaffService, private userService: UserService, private fb: FormBuilder) { }

  // This screen needs a date range picker: year, quarter, and month
  // a date picker: start date and end date
  // Selections for data set include: PSOHP office, region, type, department, category, charge back, status, and milestone
  // this task has 2 parts: building the screen, and having the data exported to a csv
  // Get data to populate dropdowns for Regions/Types/Department/Category/Status/Milestones

  ngOnInit() {
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
      // console.log(this.regions);
    });
  }

  getAllClientDeparments() {
    this.userService.fetchAllClientDepartments().subscribe(data => {
      data['entry'].forEach(element => {
        this.clientDepartments.push(element.resource.name);
      });
      // console.log(this.clientDepartments);
    });
  }

  export() {
    if (this.reportingFormGroup.value.dataSet === 'Service Request') {
      // this.buildServiceRequestData();
    }
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

  processServiceRequestData() {
    this.episodeOfCareList.forEach(episode => {
      const episodeOfCareId = episode.id;
      const relatedQuestionnaireResponses = new Array;
      this.questionnaireResponseList.forEach(questionnaireResponse => {
        if (questionnaireResponse.context.reference.contains(episodeOfCareId)) {
          console.log(episodeOfCareId);
          console.log(questionnaireResponse);
        }
      });
    });
  }

  // This method builds Service Request Data
  // The needed columns in the csv are:
  // 1.Service Request id 2.PSOHP service 3.Assessment type 4.Assessment category
  // 5.PSOHP region 6.Submitting department code 7.Submitting Department Branch
  // 8.Charge back 9.Cliet Type 10.OHAG Occupation 11.Received Date
  // 12.Validated Date 13.Assigned Date 14.Scheduled Date 15.Work completed date
  // 16.Closed date 17. Assessment code and 18. Exam by code
  buildServiceRequestData() {
    this.staffService.getAllEpisodeOfCare().subscribe(data => {
      const tempArr = [];
      data['entry'].forEach(episodeOfCare => {
        const episodeOfCareId = episodeOfCare.resource.id;
        if (episodeOfCareId === '14654') {
          const temp = {};
          this.staffService.getEpisodeOfCareAndRelatedData(episodeOfCareId).subscribe(data1 => {
            data1['entry'].forEach(element => {
              const resource = element.resource;
              if (resource.resourceType === 'EpisodeOfCare') {
                temp['Service Request Id'] = resource['id'];
              }
              if (resource.resourceType === 'QuestionnaireResponse') {
                // console.log(resource);
                if (resource.identifier.value === 'SERVREQ') {
                  resource['item'].forEach(item => {
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
                if (resource.identifier.value === 'STATUS') {
                  resource['item'].forEach(statusItem => {
                    if (!temp[statusItem.text]) {
                      if (statusItem.answer) {
                        if (statusItem.answer[1]) {
                          temp[statusItem.text] = statusItem.answer[1].valueDate;
                        } else {
                          temp[statusItem.text] = '';
                        }
                      } else {
                        temp[statusItem.text] = '';
                      }
                    }
                  });
                }
              }
            });
            console.log(temp);
            tempArr.push(temp);
            this.serviceRequestData.push(temp);
          });
        }
      });
      console.log(tempArr);
      // console.log(this.serviceRequestData);
      // this.exportToCSV(this.serviceRequestData);
      this.exportToCSV(tempArr);
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
