import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

import { tap, mergeMap } from 'rxjs/operators';
import { Observable, of, merge } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminHomeScreenService {

  constructor(private http: HttpClient, private oauthService: OAuthService) { }

  getAllQRIncludeRefs() {
    const loggedInUserId = sessionStorage.getItem('userFHIRID');

    return this.http.get(environment.queryURI + '/QuestionnaireResponse?_include:recurse=*&identifier=SERVREQ&context.care-manager='
      + loggedInUserId, { headers: this.getHeaders() })
      .pipe(
        mergeMap((qrs) => this.getAndAddStatusForQRs(qrs))
      );
  }

  getQRStatuses(eocIds) {
    const loggedInUserId = sessionStorage.getItem('userFHIRID');

    let obj = Object.assign({}, eocIds, { 'context.care-manager': loggedInUserId });
    const query = this.encodeData(obj);

    // console.log('Original for getQRStatuses =>', eocIds);
    // console.log('Query Obj for getQRStatuses =>', this.encodeData(obj));

    return this.http.post(environment.queryURI + '/QuestionnaireResponse/_search', query,
      { headers: this.getHeaders().append('Content-Type', 'application/x-www-form-urlencoded') }).toPromise();
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
        identifier: 'MILESTONE'
      };

      return this.getQRStatuses(query);
    }
    // return bundle;
  }

  getTasksAssignedToLoggedInClinician() {
    const loggedInUserId = sessionStorage.getItem('userFHIRID');

    return this.http.get(environment.queryURI + '/Task?' +
      '&owner=Practitioner/' + loggedInUserId + '&status=ready&_include=*', { headers: this.getHeaders() });
  }

  getAllQRTaskIncludeRefs() {
    const loggedInUserId = sessionStorage.getItem('userFHIRID');

    return this.http.get(environment.queryURI + '/EpisodeOfCare?_has:QuestionnaireResponse:context:identifier=SERVREQ' +
      '&care-manager=Practitioner/' + loggedInUserId + '&_revinclude=Task:context&_include=*', { headers: this.getHeaders() });
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
      obj = { type: 'DEPTBRANCH' };
    }

    // console.log('Query Obj for getJobLocations =>', this.encodeData(obj));

    const query = this.encodeData(obj);
    // console.log(query);

    return this.http.get(
      environment.queryURI + '/Location?identifier=department-location&' + query,
      { headers: this.getHeaders() }
    );
  }

  getDistrictLocations(queryObj?) {
    let obj = {};

    if (queryObj) {
      obj = { type: 'organization', ...queryObj };
    } else {
      obj = { type: 'organization' };
    }

    // // console.log('Query Obj for getJobLocations =>', this.encodeData(obj));

    const query = queryObj['organization'];

    return this.http.get(
      environment.queryURI + '/Location?identifier=psohp-location&organization=' + query,
      { headers: this.getHeaders() }
    );
  }

  getJobLocationsClientDept(query) {
    return this.http.get(
      environment.queryURI + '/Location?organization=' + query,
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
    return Object.keys(obj).map(function (key) {
      if (key.indexOf('dup-') === -1) {
        return [key, obj[key]].map(encodeURIComponent).join('=');
      } else {
        let tempKey = key;
        tempKey = tempKey.slice(tempKey.indexOf('dup') + 4);
        return [tempKey, obj[key]].map(encodeURIComponent).join('=');
      }
    }).join('&');
  }

  extractStatusFromStatusQR(statusFHIRObj) {
    if (statusFHIRObj && statusFHIRObj.resource && statusFHIRObj.resource.item
      && Array.isArray(statusFHIRObj.resource.item) && statusFHIRObj.resource.item.length > 0) {
      const obj = statusFHIRObj.resource;
      const status = this.sortMilestone(obj);
      return status;
    }

    return null;
  }

  sortMilestone(obj) {
    if (obj) {
      const arr = [];
      obj['item'].forEach(element => {
        if (element.answer) {
          arr.push(element);
        }
      });
      console.log(arr);
      arr.sort(function (a, b) {
        if (a['answer'] && b['answer']) {
          if (a['answer'][0]['valueDateTime'] && b['answer'][0]['valueDateTime']) {
            return (
              new Date(b['answer'][0]['valueDateTime']).getTime() -
              new Date(a['answer'][0]['valueDateTime']).getTime()
            );
          }
        }
      });

      return arr[0]['linkId'];

    }
  }

  async getAndAddStatusForQRs(qrs) {
    console.log('Tap ORG result =>', qrs);

    const statusBundle = await this.getStatusForQRs(qrs);
    console.log('statusBundle =>', statusBundle);

    if (statusBundle && statusBundle['entry'] && Array.isArray(statusBundle['entry']) && statusBundle['entry'].length > 0) {
      qrs['entry'] = qrs['entry'].map(qr => {
        const matchedStatusItem = statusBundle['entry'].find(statusItem =>
          statusItem.resource && statusItem.resource.context && qr.resource && qr.resource.context
          && qr.resource.context.reference && statusItem.resource.context.reference == qr.resource.context.reference);

        const statusStr = this.extractStatusFromStatusQR(matchedStatusItem);  // can be status text or null

        qr.resource['displayStatus'] = statusStr;

        return qr;
      });

      // console.log('tap qrs', qrs);
    }

    return qrs;
  }
}
