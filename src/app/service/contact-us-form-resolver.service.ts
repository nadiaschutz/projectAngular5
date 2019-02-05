import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { QuestionnaireService } from './questionnaire.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactUsFormResolverService implements Resolve<any> {
  formId = '1953';


  constructor(private questionnaireService: QuestionnaireService) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<any> | Promise<any> | any {
    return this.questionnaireService.getForm(this.formId);
  }
}
