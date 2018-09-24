import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';

import { environment } from '../../environments/environment';

export interface Text {
  status: string;
  div: string;
}

export interface Code {
  system: string;
  code: string;
  display: string;
}

export interface Item2 {
  linkId: string;
  text: string;
  type: string;
}

export interface Item {
  linkId: string;
  text: string;
  type: string;
  item: Item2[];
}

export interface RootObject {
  resourceType: string;
  id: string;
  text: Text;
  url: string;
  status: string;
  date: string;
  code?: Code[];
  subjectType: string[];
  item: Item[];
}

class QuestionItem {
  constructor () {}
}

class Question {
  constructor (public resourceType: string,
    public id: string, public url: string, public date: string,
    public code: Code, public subjectType: string[], public item: Item[]) {}
}

class Quesntionnaire {
  static create(question: Question) {
    return new Question(question.resourceType, question.id, question.url,
    question.date, question.code, question.subjectType, question.item);
  }
}

export class QuestionnaireService {

  constructor(private httpClient: HttpClient, private oauthService: OAuthService) { }
  getQuestionnaireData(pid) {
    return this.httpClient.get<JSON>(environment.queryURI +
      '/Quesntionnaire/' + pid, { headers: this.getHeaders() }).subscribe(data => console.log(data));

    // return this._http.get(environment.queryURI + '/Patient/' + pid, { headers: this.getHeaders() });
  }

  getAllQuestionnaireData() {
    return this.httpClient.get<JSON>(environment.queryURI +
      '/Questionnaire/', { headers: this.getHeaders() }).subscribe(data => console.log(data));

  }




  logout() {
    const header = this.getHeaders();

    this.httpClient.post(environment.logoutURI + '/logout?cb=none&revoke=token', {}, { headers: header, withCredentials: true })
      .subscribe(item => {
        console.log(item);
      }, err => {
        console.log(err);
      });
  }

  getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }
}

