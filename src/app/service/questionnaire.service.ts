import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { delay } from 'rxjs/operators';


import * as $ from 'jquery';

import { v4 } from 'uuid';


const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

// import * as FHIR from 'fhir';

// Maintains a reference
// Auth (headers should have auth conetext, established by oauth 2)

@Injectable()
export class QuestionnaireService {

  public newServRespSubject = new BehaviorSubject<Object>(null);
  newServRespSubject$ = this.newServRespSubject.asObservable();

  public newServFormIdSubject = new BehaviorSubject<Object>(null);
  newServFormIdSubject$ = this.newServFormIdSubject.asObservable();

  public newResponseIdSubject = new BehaviorSubject<Object>(null);
  newResponseIdSubject$ = this.newResponseIdSubject.asObservable();


  constructor(private http: HttpClient, private oauthService: OAuthService) {}

  getForm(query: string) {
    // tslint:disable-next-line:max-line-length
    return this.http.get(environment.queryURI + '/Questionnaire/' + query, { headers: this.getHeaders() } );
  }


  getDocument(query: string) {
    // tslint:disable-next-line:max-line-length
    return this.http.get(environment.queryURI + '/DocumentReference/' + query, { headers: this.getHeaders() } );
  }

  getResponse(query: string) {
    // tslint:disable-next-line:max-line-length
    return this.http.get(environment.queryURI + '/QuestionnaireResponse/' + query, { headers: this.getHeaders() } );
  }

  postDataFile(data: string) {
    return this.http.post(environment.queryURI + '/DocumentReference/', data, {headers: this.getHeaders()});
  }

  saveRequest(data: any) {
    return this.http.post(environment.queryURI + '/QuestionnaireResponse', data, { headers: this.getHeaders() });
  }
  changeRequest(data: any) {
    return this.http.put(environment.queryURI + '/QuestionnaireResponse/' + data['id'], data, { headers: this.getHeaders() });
  }

  deleteServiceRequest(serviceRequestId: string) {
    return this.http.delete(environment.queryURI + '/QuestionnaireResponse/' + serviceRequestId, {headers: this.getHeaders()});
  }
  // This function takes in a generic query
  getDocumentReferenceByQuery(query: string) {
    return this.http.get(environment.queryURI + query, { headers: this.getHeaders() } );
  }

  getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }

  shareServiceResponseData(data) {
    this.newServRespSubject.next(data);
    // 9
    console.log('responseId from service');
    console.log(data);
  }

  shareServiceFormId(data) {
    this.newServFormIdSubject.next(data);
    // 11
    console.log('service response object from service');
    console.log(data);
  }

  shareResponseId(data) {
    this.newResponseIdSubject.next(data);
    console.log('service response ID from service');
    console.log(data);
  }

  getAllUnassignedQuestionnaireResponses() {
    // return this.http.get(environment.queryURI + '/QuestionnaireResponse?context:missing=true', {headers: this.getHeaders()});
    return this.http.get(environment.queryURI + '/QuestionnaireResponse', {headers: this.getHeaders()});
  }

  saveEpisodeOfCare(data) {
    return this.http.post(environment.queryURI + '/EpisodeOfCare', data, {headers: this.getHeaders()});
  }

  getAllEpisodeOfCare() {
    return this.http.get(environment.queryURI + '/EpisodeOfCare?_include=*&_revinclude=*', {headers: this.getHeaders()});
  }

}
