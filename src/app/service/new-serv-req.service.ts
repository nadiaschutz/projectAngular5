import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { QuestionnaireService } from './questionnaire.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NewServReqService implements Resolve<any> {
  formId;


  constructor(private questionnaireService: QuestionnaireService, private router: Router) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<any> | Promise<any> | any {
    if (this.router.url.indexOf('/employeesummary') > -1) {
      this.formId = 'TEST4';
    } else {
      this.formId = '1953';
    }

    return this.questionnaireService.getForm(this.formId);
  }
}
