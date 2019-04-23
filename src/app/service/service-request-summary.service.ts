import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { QuestionnaireService } from './questionnaire.service';
import { QrequestService } from './qrequest.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestSummaryService {
  questId;
  data;
  constructor(private questionnaireService: QuestionnaireService, private qrequestService: QrequestService) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<any> | Promise<any> | any {
    const selectedServiceRequestID = sessionStorage.getItem('selectedServiceRequestID');
    return this.qrequestService.getAllQuestionnaireResponseData(selectedServiceRequestID);
  }
}
