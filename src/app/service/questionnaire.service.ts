import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// import * as Rx from 'rxjs';

@Injectable()
export class QuestionnaireService {

  // rootObject: RootObject;
  questionnaireData = new BehaviorSubject<any>(null);


  constructor(private httpClient: HttpClient, private oauthService: OAuthService) { }

  getQuestionnaireData(pid) {
    return this.httpClient.get(environment.queryURI +
      // '/Quesntionnaire/' + pid, { headers: this.getHeaders() }).subscribe(res => this.questionnaireData.next(res));
      '/Quesntionnaire/' + pid, { headers: this.getHeaders() }).subscribe(res => this.questionnaireData.next(res));

  }

  getAllQuestionnaireData() {
    return this.httpClient.get(environment.queryURI +
      // '/Questionnaire/', { headers: this.getHeaders() }).subscribe(data => console.log(data));
    '/Quesntionnaire', { headers: this.getHeaders() }).subscribe(res => this.questionnaireData.next(res));

  }


  // createQuestionnaireObject(quesntionnaireData) {
  //   const questions = [];
  //   const items = [];


  //   for (let i = 0; i < quesntionnaireData['entry'].length; i++) {
  //     if (quesntionnaireData['entry'][i]['resource']['resourceType']) {
  //       if (quesntionnaireData['entry'][i]['resource']['resourceType'] === 'Questionnaire') {
  //         // if (quesntionnaireData['entry'][i]['resource']['item']) {
  //         //   for (let j = 0; j < quesntionnaireData['entry'][j]['resource']['item'].length; j++) {
  //         //     items.push(quesntionnaireData['entry'][j]['resource']['item']);
  //         //   }
  //         // }
  //         questions.push(quesntionnaireData['entry'][i]['resource']);
  //       }
  //     }
  //   }
  //   console.log(questions[1]);
  // }



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


// export interface Text {
//   status: string;
//   div: string;
// }

// export interface Code {
//   system: string;
//   code: string;
//   display: string;
// }

// export interface RootObject {
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

// class Item {
//   private linkId: string; private text: string; private type: string;
//   get LinkId(): string {
//     return this.linkId;
//   }

//   getText(): string {
//     return this.text;
//   }

//   getType(): string {
//     return this.type;
//   }

//   setLinkId(linkId: string) {
//     this.linkId = linkId;
//   }

//   setText(text: string) {
//     this.text = text;
//   }

//   setType(type: string) {
//     this.type = type;
//   }
// }

// class Question {
//   private resourceType: string;
//   private id: string;
//   private url: string;
//   private date: Date;
//   private code: Code;
//   private subjectType: string[];
//   private item: Item[];

//   getResourceType() {
//     return this.resourceType;
//   }

//   setResourceType(resourceType: string) {
//     this.resourceType = resourceType;
//   }

//   getId() {
//     return this.id;
//   }

//   setId(id: string) {
//     this.id = id;
//   }

//   getUrl() {
//     return this.url;
//   }

//   setUrl(url: string) {
//     this.url = url;
//   }

//   getDate() {
//     return this.date;
//   }

//   setDate(date: Date) {
//     this.date = date;
//   }

//   getCode() {
//     return this.code;
//   }

//   setCode(code: Code) {
//     this.code = code;
//   }

//   getSubjectType() {
//     for (const i of this.subjectType) {
//       return i;
//     }
//   }

//   setSubjectType(subjectType: string) {
//     this.subjectType.push(subjectType);
//   }

//   getItem() {
//     for (const i of this.item) {
//       return i;
//     }
//   }

//   setItem(item: Item) {
//     this.item.push(item);
//   }

// }

// class Quesntionnaire {
//   private questions: Question[];

//   getQuestions() {
//     for (const i of this.questions) {
//       return i;
//     }
//   }

//   setQuestions(question: Question) {
//     this.questions.push(question);
//   }
// }

// class QuesntionnaireResposne {
//   private resourceType: string;
//   private id: string;
//   private url: string;
//   private date: Date;
//   private code: Code;
//   private subjectType: string[];
//   private item: Item[];

//   getResourceType() {
//     return this.resourceType;
//   }

//   setResourceType(resourceType: string) {
//     this.resourceType = resourceType;
//   }

//   getId() {
//     return this.id;
//   }

//   setId(id: string) {
//     this.id = id;
//   }

//   getUrl() {
//     return this.url;
//   }

//   setUrl(url: string) {
//     this.url = url;
//   }

//   getDate() {
//     return this.date;
//   }

//   setDate(date: Date) {
//     this.date = date;
//   }

//   getCode() {
//     return this.code;
//   }

//   setCode(code: Code) {
//     this.code = code;
//   }

//   getSubjectType() {
//     for (const i of this.subjectType) {
//       return i;
//     }
//   }

//   setSubjectType(subjectType: string) {
//     this.subjectType.push(subjectType);
//   }

//   getItem() {
//     for (const i of this.item) {
//       return i;
//     }
//   }

//   setItem(item: Item) {
//     this.item.push(item);
//   }

// }
