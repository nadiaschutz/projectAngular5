import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class QrequestService {

  // private API_URL = 'https://thx.smilecdr.com:8000/';
 private API_URL = 'https://bcip.smilecdr.com/fhir-request/QuestionnaireResponse';

  constructor(private http: HttpClient) { }


  getData(query: string) {
    return this.http.get(this.API_URL + query);
  }

}
