import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import * as FHIR from '../interface/FHIR';


@Injectable({
  providedIn: 'root'
})
export class ReportingService {

  constructor(private httpClient: HttpClient, private oauthService: OAuthService) { }

  fetchAllEpisodeOfCare() {
    return this.httpClient.get(environment.queryURI + '/EpisodeOfCare', {headers: this.getHeaders()}).toPromise();
  }

  fetchQuestionnaireResponseFromEpisodeOfCare(episodeOfCareId) {
    return this.httpClient.get(environment.queryURI +
      '/QuestionnaireResponse?context=' + episodeOfCareId, {headers: this.getHeaders()}).toPromise();
  }

  fetchEpisodeOfCareFromSearchParams(searchParams) {
    return this.httpClient.get(environment.queryURI + '/EpisodeOfCare' + searchParams, {headers: this.getHeaders()}).toPromise();
  }

  fetchCarePlanFromSearchParams(searchParams) {
    return this.httpClient.get(environment.queryURI + '/CarePlan' + searchParams, {headers: this.getHeaders()}).toPromise();
  }

  fetchServReqAlongWithPatients() {
    return this.httpClient.get(environment.queryURI +
      '/QuestionnaireResponse?identifier=SERVREQ&_include=QuestionnaireResponse:subject', {headers: this.getHeaders()}).toPromise();
  }

  getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }

  getPostHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }

  call() {
    return this.httpClient.get(environment.queryURI +
      '/Organization?name=test', {headers: this.getHeaders()}).toPromise();
  }

  delete(id) {
    // return this.httpClient.delete(environment.queryURI +
    //   '/Organization/' + id, {headers: this.getPostHeaders()}).toPromise();
  }
}
