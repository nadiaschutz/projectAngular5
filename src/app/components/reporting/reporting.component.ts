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

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent implements OnInit {

  datePickerConfig: Partial<BsDatepickerConfig>;
  DATE_FORMAT = 'YYYY-MM-DD';
  regions = ['Select Region'];
  psohpTypes = ['Select Type', 'HACAT1', 'HACAT2', 'HACAT3', 'FTWORK', 'SUBUYB', 'SUREMG', 'SUSURB',
  'THSOTT', 'THPPC1', 'THPPC3', 'THCRC1', 'THCRC2', 'THCRC3'];
  clientDepartments = ['Select Department'];
  statuses = ['Select Status', 'RECEIVED', 'VALIDATED', 'ASSIGNED', 'SCHEDULED', 'WORK COMPLETED', 'CLOSED'];
  reportingFormGroup: FormGroup;

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
    this.staffService.getEpisodeOfCareAndRelatedData('13693').subscribe(data => {
      console.log(data);
    });
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
      console.log(this.regions);
    });
  }

  getAllClientDeparments() {
    this.userService.fetchAllClientDepartments().subscribe(data => {
      data['entry'].forEach(element => {
        this.clientDepartments.push(element.resource.name);
      });
      console.log(this.clientDepartments);
    });
  }

  export() {
    this.staffService.getEpisodeOfCareAndRelatedData('13693').subscribe(data => {
      console.log(data);
    });
  }

  // This method builds Service Request Data
  // The needed columns in the csv are:
  // 1.Service Request id 2.PSOHP service 3.Assessment type 4.Assessment category
  // 5.PSOHP region 6.Submitting department code 7.Submitting Department Branch
  // 8.Charge back 9.Cliet Type 10.OHAG Occupation 11.Received Date
  // 12.Validated Date 13.Assigned Date 14.Scheduled Date 15.Work completed date
  // 16.Closed date 17. Assessment code and 18. Exam by code
  buildServiceRequestData(data) {
    const temp = {};
    if (data.resource.resourceType === 'EpisodeOfCare') {
    } else if (data.resource.resourceType === 'QuestionnaireResponse') {
    } else if (data.resource.resourceType === 'Patient') {
    }
  }

  exportToCSV(data) {
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
