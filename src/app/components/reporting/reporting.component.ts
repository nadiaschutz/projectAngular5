import { Component, OnInit } from '@angular/core';
import { StaffService } from '../../service/staff.service';
import { ExportToCsv } from 'export-to-csv';

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent implements OnInit {

  constructor(private staffService: StaffService) { }

  // This screen needs a date range picker: year, quarter, and month
  // a date picker: start date and end date
  // Selections for data set include: PSOHP office, region, type, department, category, charge back, status, and milestone
  // this task has 2 parts: building the screen, and having the data exported to a csv

  ngOnInit() {
    this.staffService.getEpisodeOfCareAndRelatedData('13693').subscribe(data => {
      console.log(data);
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
