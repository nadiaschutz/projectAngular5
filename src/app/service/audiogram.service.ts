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

    getAllEOC(eocId) {
        return this.http.get(environment.queryURI + '/EpisodeOfCare?_id=' + eocId + '&_revinclude=*', { headers: this.getHeaders() });
    }

    getObservationById(observationId: any) {
        return this.http.get(environment.queryURI + '/Observation?_id=' + observationId + '&_include=*', { headers: this.getHeaders() });
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

  postDevice(deviceRequestData) {
      return this.http.post(environment.queryURI + '/Device', deviceRequestData, {headers: this.getPostHeaders()});
  }

  getBundleFromOrganizationName(workplace) {
    return this.http.get(environment.queryURI + '/Organization?name=' + workplace /*+ 'Canadian Coast Guard (CCG)'*/  , { headers: this.getHeaders() });
  }

    getLocations(resourceType , id) {
        return this.http.get<JSON>(environment.queryURI +
            '/Location?type=DEPTBRANCH&organization=' + resourceType + '/' + id , { headers: this.getHeaders() });
    }

    saveAudiogramRequest(audiogramRequestData) {
        return this.http.post(environment.queryURI + '/Observation', audiogramRequestData, {headers: this.getPostHeaders()});
    }
}
