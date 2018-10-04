import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// import * as Rx from 'rxjs';


export class Text {
  status: string;
  div: string;
}

export class Code {
  system: string;
  code: string;
  display: string;
}

// export class RootObject {
//   resourceType: string;
//   id: string;
//   text: Text;
//   url: string;
//   status: string;
//   date: string;
//   code?: Code[];
//   subjectType: string[];

//   item: Item[];
// }

export class Item {
  private linkId: string; private text: string; private type: string;
  get LinkId(): string {
    return this.linkId;
  }

  getText(): string {
    return this.text;
  }

  getType(): string {
    return this.type;
  }

  setLinkId(linkId: string) {
    this.linkId = linkId;
  }

  setText(text: string) {
    this.text = text;
  }

  setType(type: string) {
    this.type = type;
  }
}

class Question {
  private resourceType: string;
  private id: string;
  private url: string;
  private date: Date;
  private code: Code;
  private subjectType: string[];
  private item: Item[];

  getResourceType() {
    return this.resourceType;
  }

  setResourceType(resourceType: string) {
    this.resourceType = resourceType;
  }

  getId() {
    return this.id;
  }

  setId(id: string) {
    this.id = id;
  }

  getUrl() {
    return this.url;
  }

  setUrl(url: string) {
    this.url = url;
  }

  getDate() {
    return this.date;
  }

  setDate(date: Date) {
    this.date = date;
  }

  getCode() {
    return this.code;
  }

  setCode(code: Code) {
    this.code = code;
  }

  getSubjectType() {
    for (const i of this.subjectType) {
      return i;
    }
  }

  setSubjectType(subjectType: string) {
    this.subjectType.push(subjectType);
  }

  getItem() {
    for (const i of this.item) {
      return i;
    }
  }

  setItem(item: Item) {
    this.item.push(item);
  }

}

// fix this to not return a list 
export class Questionnaire {
  private questions: Question[];

  getQuestions() {
    for (const i of this.questions) {
      return i;
    }
  }

  setQuestions(question: Question) {
    this.questions.push(question);
  }
}

export class QuestionnaireResposne {
  private resourceType: string;
  private id: string;
  private url: string;
  private date: Date;
  private code: Code;
  private subjectType: string[];
  private item: Item[];

  getResourceType() {
    return this.resourceType;
  }

  setResourceType(resourceType: string) {
    this.resourceType = resourceType;
  }

  getId() {
    return this.id;
  }

  setId(id: string) {
    this.id = id;
  }

  getUrl() {
    return this.url;
  }

  setUrl(url: string) {
    this.url = url;
  }

  getDate() {
    return this.date;
  }

  setDate(date: Date) {
    this.date = date;
  }

  getCode() {
    return this.code;
  }

  setCode(code: Code) {
    this.code = code;
  }

  getSubjectType() {
    for (const i of this.subjectType) {
      return i;
    }
  }

  setSubjectType(subjectType: string) {
    this.subjectType.push(subjectType);
  }

  getItem() {
    for (const i of this.item) {
      return i;
    }
  }

  setItem(item: Item) {
    this.item.push(item);
  }
}

@Injectable()
export class QuestionnaireService {

  // rootObject: RootObject;
  questionnaireData = new BehaviorSubject<any>(null);

  constructor(private httpClient: HttpClient, private oauthService: OAuthService) { }

  getQuestionnaireData(name) {
    return this.httpClient.get<JSON>(environment.queryURI +
      '/Questionnaire?name=' + name, { headers: this.getHeaders() }).subscribe(res => this.questionnaireData.next(res));
  }

  getAllQuestionnaireData() {
    return this.httpClient.get(environment.queryURI +
    '/Questionnaire', { headers: this.getHeaders() }).subscribe(res => this.questionnaireData.next(res));
  }

  getQuestionnaireFromSource (source, headers) {
    return this.httpClient.get(source, {headers: headers}).subscribe(res => this.questionnaireData.next(res));
  }


  returnQuestionnaire() {
    return this.questionnaireData.asObservable();
  }

  initQuestionnaire() {
    return new Questionnaire();
  }

  getQuestions(qid) {
    const item = new Item();
    this.getQuestionnaireData(qid);
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

// init, init (json), init (query)
// save, sav(destination)
// listquestions (return nested array of strings)
// create responses ()


