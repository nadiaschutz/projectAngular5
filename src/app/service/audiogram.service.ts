import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

import { tap, mergeMap } from 'rxjs/operators';
import { Observable , of, merge } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudiogramService {

  constructor(private http: HttpClient, private oauthService: OAuthService) { }

  getEOCById(eocId) {
    return this.http.get(environment.queryURI + '/EpisodeOfCare?_include=*&_revinclude=*&_id=' + eocId, { headers: this.getHeaders() });
  }

  getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }
}
