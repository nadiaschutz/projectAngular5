import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import * as FHIR from '../interface/FHIR';

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  selectedEpisodeId = '';

  constructor(private http: HttpClient, private oauthService: OAuthService) { }

  setSelectedEpisodeId(data) {
    this.selectedEpisodeId = data;
  }

  getSelectedEpisodeId() {
    return this.selectedEpisodeId;
  }

  updateEpisodeOfCare(id, data) {
    return this.http.put(environment.queryURI + '/EpisodeOfCare/' + id, data, {headers: this.getHeaders()});
  }

  getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }

  delete(id) {
    return this.http.delete(environment.queryURI + '/EpisodeOfCare/' + id, {headers: this.getHeaders()});
  }

  fetchAllCarePlanTemplates() {
    return this.http.get(environment.queryURI + '/CarePlan?status=draft', {headers: this.getHeaders()});
  }

  postCarePlan(carePlanData) {
    return this.http.post(environment.queryURI + '/CarePlan', carePlanData, {headers: this.getHeaders()});
  }

  getAllUnassignedQuestionnaireResponses() {
    // return this.http.get(environment.queryURI + '/QuestionnaireResponse?context:missing=true', {headers: this.getHeaders()});
    return this.http.get(environment.queryURI + '/QuestionnaireResponse', {headers: this.getHeaders()});
  }

  saveEpisodeOfCare(data) {
    return this.http.post<FHIR.EpisodeOfCare>(environment.queryURI + '/EpisodeOfCare', data, {headers: this.getHeaders()});
  }

  getAllEpisodeOfCare() {
    return this.http.get(environment.queryURI + '/EpisodeOfCare?_include=*&_revinclude=*', {headers: this.getHeaders()});
  }

  getEpisodeOfCareAndRelatedData(episodeOfCareId) {
    return this.http.get(environment.queryURI + '/EpisodeOfCare?_include=*&_revinclude=*&_id='
    + episodeOfCareId, {headers: this.getHeaders()});
  }

}
