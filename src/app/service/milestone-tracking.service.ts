import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import * as FHIR from '../interface/FHIR';

@Injectable({
  providedIn: 'root'
})
export class MilestoneTrackingService {

  constructor(private http: HttpClient, private oauthService: OAuthService) { }

  setSelectedEpisodeId(data) {
    sessionStorage.setItem('selectedEpisodeId', data);
  }

  getSelectedEpisodeId() {
    return sessionStorage.getItem('selectedEpisodeId');
  }
}
