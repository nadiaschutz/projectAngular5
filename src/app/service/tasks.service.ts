import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class TasksService {
  constructor(
    private httpClient: HttpClient,
    private oauthService: OAuthService
  ) {}

  getAllEpisodeOfCare() {
    return this.httpClient.get(environment.queryURI + '/EpisodeOfCare/', {
      headers: this.getHeaders()
    });
  }

  getEpisodeOfCareByID(query: string) {
    return this.httpClient.get(
      environment.queryURI + '/EpisodeOfCare/' + query,
      { headers: this.getHeaders() }
    );
  }

  getAllTasks() {
    return this.httpClient.get(environment.queryURI + '/Task', {
      headers: this.getHeaders()
    });
  }

  getTaskByID(query: string) {
    return this.httpClient.get(environment.queryURI + '/Task/' + query, {
      headers: this.getHeaders()
    });
  }

  updateTask(id, data) {
    console.log(data);
    console.log(this.getHeaders());
    return this.httpClient.put(environment.queryURI + '/Task/' + id, data, {
      headers: this.postFHIRHeaders()
    });
  }

  postTask(data) {
    return this.httpClient.post(environment.queryURI + '/Task/', data, { headers: this.postFHIRHeaders() });
  }

  getAllPractitioners() {
    return this.httpClient.get(environment.queryURI +
      '/Practitioner?_revinclude=PractitionerRole:code=admin', {
      headers: this.getHeaders()
    });
  }

  getPractitionerByID(query: string) {
    return this.httpClient.get(environment.queryURI + '/Practitioner/' + query, {
      headers: this.getHeaders()
    });
  }

  getAllPractitionerRoles() {
    return this.httpClient.get(environment.queryURI + '/PractitionerRole/', {
      headers: this.getHeaders()
    });
  }

  getPractitionerRoleByID(query: string) {
    return this.httpClient.get(environment.queryURI + '/PractitionerRole/' + query, {
      headers: this.getHeaders()
    });
  }

  getAnyFHIRObjectByReference(query: string) {
    return this.httpClient.get(environment.queryURI + query, {
      headers: this.getHeaders()
    });
  }


  getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }

  postFHIRHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }
}
