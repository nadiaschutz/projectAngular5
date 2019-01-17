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

  getEpisodeOfCareFromId(episodeOfCareId) {
    return this.http.get<FHIR.EpisodeOfCare>(environment.queryURI + '/EpisodeOfCare/' + episodeOfCareId, {headers: this.getHeaders()});
  }

  updateEpisodeOfCare(id, data) {
    return this.http.put(environment.queryURI + '/EpisodeOfCare/' + id, data, {headers: this.getPostHeaders()});
  }

  fetchAllCarePlanTemplates() {
    return this.http.get(environment.queryURI + '/CarePlan?status=draft', {headers: this.getHeaders()});
  }

  saveCarePlan(carePlanData) {
    return this.http.post(environment.queryURI + '/CarePlan', carePlanData, {headers: this.getPostHeaders()});
  }

  getCarePlan(id) {
    return this.http.get<FHIR.CarePlan>(environment.queryURI + '/CarePlan/' + id, {headers: this.getHeaders()});
  }

  getCarePlanForEpisodeOfCareId(episodeOfCareId) {
    return this.http.get(environment.queryURI + '/CarePlan?context=' + episodeOfCareId, {headers: this.getHeaders()});
  }

  updateCarePlan(id, carePlanData) {
    return this.http.put(environment.queryURI + '/CarePlan/' + id, carePlanData, {headers: this.getPostHeaders()});
  }

  getAllUnassignedQuestionnaireResponses() {
    return this.http.get(environment.queryURI + '/QuestionnaireResponse', {headers: this.getHeaders()});
  }

  saveEpisodeOfCare(data) {
    return this.http.post<FHIR.EpisodeOfCare>(environment.queryURI + '/EpisodeOfCare', data, {headers: this.getPostHeaders()});
  }

  getAllEpisodeOfCare() {
    return this.http.get(environment.queryURI + '/EpisodeOfCare?_include=*&_revinclude=*', {headers: this.getHeaders()});
  }

  getEpisodeOfCareAndRelatedData(episodeOfCareId) {
    return this.http.get(environment.queryURI + '/EpisodeOfCare?_include=*&_revinclude=*&_id='
    + episodeOfCareId, {headers: this.getHeaders()});
  }

  getAllPractitioners() {
    return this.http.get(environment.queryURI +
      '/Practitioner?_revinclude=PractitionerRole:code=admin', {
      headers: this.getHeaders()
    });
  }

  getPractitionerByID(query: string) {
    return this.http.get(environment.queryURI + '/Practitioner/' + query, {
      headers: this.getHeaders()
    });
  }

  getAllPractitionerRoles() {
    return this.http.get(environment.queryURI + '/PractitionerRole/', {
      headers: this.getHeaders()
    });
  }

  getPractitionerRoleByID(query: string) {
    return this.http.get(environment.queryURI + '/PractitionerRole/' + query, {
      headers: this.getHeaders()
    });
  }

  getAllTasksForEpisodeOfCare(episodeOfCareId) {
    return this.http.get(environment.queryURI + '/Task?context=' + episodeOfCareId, {
      headers: this.getHeaders()
    });
  }

  getAnyFHIRObjectByReference(query: string) {
    return this.http.get(environment.queryURI + query, {
      headers: this.getHeaders()
    });
  }

  updateTask(id, data) {
    return this.http.put(environment.queryURI + '/Task/' + id, data, {
      headers: this.getPostHeaders()
    });
  }

  saveTask(data) {
    return this.http.post(environment.queryURI + '/Task/', data, { headers: this.getPostHeaders() });
  }

  getTaskByID(query: string) {
    return this.http.get(environment.queryURI + '/Task/' + query, {
      headers: this.getHeaders()
    });
  }

  getAllTasks() {
    return this.http.get(environment.queryURI + '/Task', {headers: this.getHeaders()});
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

  getCommunicationRelatedToEpisodeOfCare(episodeOfCareId) {
    return this.http.get(environment.queryURI +
      '/Communication?context=' + episodeOfCareId, {headers: this.getHeaders()});
  }

  createCommunication(communicationData) {
    return this.http.post<FHIR.Communication>(environment.queryURI +
      '/Communication/', communicationData, {headers: this.getPostHeaders()});
  }

  updateCommunication(id, communicationData) {
    return this.http.put<FHIR.Communication>(environment.queryURI +
      '/Communication/' + id, communicationData, {headers: this.getPostHeaders()});
  }

  getAllClinicians() {
    return this.http.get(environment.queryURI +
      '/Practitioner?_has:PractitionerRole:practitioner:role=clinician', {
      headers: this.getHeaders()
    });
  }

  getClinicianById(id: string) {
    return this.http.get(environment.queryURI +
      '/Practitioner/' +  id, {
      headers: this.getHeaders()
    });
  }

  getClinicianAssignedToEpisode(episodeOfCareId) {
    return this.http.get(environment.queryURI + '/Task?code=clinician&status=ready&context=' + episodeOfCareId, {
      headers: this.getNoCacheHeaders()
    });
  }

  getNoCacheHeaders() {
    const headers = new HttpHeaders({
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken(),
      'Cache-Control': 'no-cache'
    });
    return headers;
  }

}
