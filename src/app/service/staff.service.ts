import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  constructor(private http: HttpClient, private oauthService: OAuthService) { }

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
}
