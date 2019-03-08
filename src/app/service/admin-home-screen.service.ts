import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

import { tap, mergeMap } from 'rxjs/operators';
import { Observable , of, merge } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminHomeScreenService {

  constructor(private http: HttpClient, private oauthService: OAuthService) { }

  getAllQRIncludeRefs() {
    const loggedInUserId = sessionStorage.getItem('userFHIRID');

    return this.http.get(environment.queryURI + '/QuestionnaireResponse?_include:recurse=*&identifier=SERVREQ&context.care-manager=' + loggedInUserId, { headers: this.getHeaders() })
      .pipe(
        mergeMap((qrs) => this.getAndAddStatusForQRs(qrs))
      );
  }

  getQRStatuses(eocIds) {
    // https://bcip.smilecdr.com/fhir-request/QuestionnaireResponse?context=EpisodeOfCare/13123&identifier=STATUS

    const loggedInUserId = sessionStorage.getItem('userFHIRID');

    let obj = Object.assign({}, eocIds, { 'context.care-manager': loggedInUserId });
    const query = this.encodeData(obj);
    
    // console.log('Original for getQRStatuses =>', eocIds);
    // console.log('Query Obj for getQRStatuses =>', this.encodeData(obj));

    return this.http.post(environment.queryURI + '/QuestionnaireResponse/_search', query, { headers: this.getHeaders().append('Content-Type', 'application/x-www-form-urlencoded') }).toPromise();
  }

  getStatusForQRs(bundle) {
    if (bundle['entry']) {
      const extractEOCIds = bundle['entry']
        .filter(item => item.resource.resourceType === 'QuestionnaireResponse')
        .map(item => item.resource.context.reference)
        .join(',');
      
      // console.log(extractEOCIds);

      const query = {
        context: extractEOCIds,
        identifier: 'STATUS'
      };

      return this.getQRStatuses(query);
    }
    // return bundle;
  }
  
  getAllQRTaskIncludeRefs() {
    const loggedInUserId = sessionStorage.getItem('userFHIRID');

    return this.http.get(environment.queryURI + '/EpisodeOfCare?_has:QuestionnaireResponse:context:identifier=SERVREQ&care-manager=Practitioner/' + loggedInUserId + '&_revinclude=Task:context&_include=*', { headers: this.getHeaders() });
  }
  
  getDepartmentNames() {
    return this.http.get(
      environment.queryURI + '/Organization?type=CLIENTDEPT',
      { headers: this.getHeaders() }
    );
  }

  getJobLocations(queryObj?) {
    let obj = {};

    if (queryObj) {
      obj = { type: 'DEPTBRANCH', ...queryObj };
    } else {
      obj = { type: 'DEPTBRANCH' }
    }

    // console.log('Query Obj for getJobLocations =>', this.encodeData(obj));

    const query = this.encodeData(obj);
    // console.log(query);

    return this.http.get(
      environment.queryURI + '/Location?' + query,
      { headers: this.getHeaders() }
    );
  }

  getPsophServiceFromQR(QR_Id) {
    // https://bcip.smilecdr.com/fhir-request/Questionnaire?_id=TEST1
    return this.http.get(
      environment.queryURI + '/Questionnaire/' + QR_Id,
      { headers: this.getHeaders() }
    );
  }

  searchQR(queryObj) {
    const loggedInUserId = sessionStorage.getItem('userFHIRID');

    let obj = Object.assign({}, queryObj, { 'context.care-manager': loggedInUserId });
    const query = this.encodeData(obj);
    
    // console.log('Original for serachQR =>', queryObj);
    // console.log('Query Obj for searchQR =>', this.encodeData(obj));

    return this.http.get(
      environment.queryURI + '/QuestionnaireResponse?' + query,
      { headers: this.getHeaders() }
    ).pipe(mergeMap((qrs) => this.getAndAddStatusForQRs(qrs)));
  }

  searchEOC(queryObj) {
    const loggedInUserId = sessionStorage.getItem('userFHIRID');
    
    let obj = Object.assign({}, queryObj, { 'care-manager': loggedInUserId });
    const query = this.encodeData(obj);
    
    // console.log('Original for searchEOC =>', queryObj);
    // console.log('Query Obj for searchEOC =>', this.encodeData(obj));

    return this.http.post(
      environment.queryURI + '/EpisodeOfCare/_search', query,
      { headers: this.getHeaders().append('Content-Type', 'application/x-www-form-urlencoded') }
    );
  }

  getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }

  encodeData(obj) {
    return Object.keys(obj).map(function(key) {
      if (key.indexOf('dup-') == -1)
        return [key, obj[key]].map(encodeURIComponent).join('=');
      else {
        let tempKey = key;
        tempKey = tempKey.slice(tempKey.indexOf('dup') + 4);
        return [tempKey, obj[key]].map(encodeURIComponent).join('=');
      }
    }).join('&');
  }

  extractStatusFromStatusQR(statusFHIRObj) {
    if (statusFHIRObj && statusFHIRObj.resource && statusFHIRObj.resource.item && Array.isArray(statusFHIRObj.resource.item) && statusFHIRObj.resource.item.length > 0) {
      const obj = statusFHIRObj.resource.item.find(item => item && item.hasOwnProperty('answer'));
      if (obj && obj['answer']) {
        return obj['text'];
      } 
    }

    return null;
  }

  async getAndAddStatusForQRs(qrs) {
    console.log('Tap ORG result =>', qrs);

    const statusBundle = await this.getStatusForQRs(qrs);
    console.log('statusBundle =>', statusBundle);

    if (statusBundle && statusBundle['entry'] && Array.isArray(statusBundle['entry']) && statusBundle['entry'].length > 0) {
      qrs['entry'] = qrs['entry'].map(qr => {
        const matchedStatusItem = statusBundle['entry'].find(statusItem => 
          statusItem.resource && statusItem.resource.context && qr.resource && qr.resource.context && qr.resource.context.reference && statusItem.resource.context.reference == qr.resource.context.reference);
        
        const statusStr = this.extractStatusFromStatusQR(matchedStatusItem);  // can be status text or null

        qr.resource['displayStatus'] = statusStr;

        return qr;
      });

      // console.log('tap qrs', qrs);
    }

    return qrs;
  }
}