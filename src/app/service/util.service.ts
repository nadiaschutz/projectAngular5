import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';
import * as FHIR from '../interface/FHIR';
import { QuestionnaireService } from '../service/questionnaire.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(
    private http: HttpClient,
    private oauthService: OAuthService
  ) { }

  switchSortChoice;
  order;
  itemReference;
  documents = [];

  getNameFromResource(resource) {
    let lastName = '';
    let firstName = '';
    if (resource && resource['name']) {
      resource['name'].forEach(resourceName => {
        lastName = resourceName['family'];
        resourceName.given.forEach(givenName => {
          firstName += givenName;
        });
      });
      return firstName + ' ' + lastName;
    }
  }

  getIdFromReference(reference) {
    return reference.substring(reference.indexOf('/') + 1, reference.length);
  }

  getCurrentDateTime() {
    return formatDate(new Date(), 'dd-MM-yyyy, HH:mm:ss', 'en');
  }

  getCurrentDate() {
    return formatDate(new Date(), 'yyyy-MM-dd', 'en');
  }

  getDate(dateTime) {
    return formatDate(new Date(dateTime), 'yyyy-MM-dd', 'en');
  }

  getDateTime(dateTime) {
    return formatDate(new Date(dateTime), 'dd-MM-yyyy, HH:mm:ss', 'en');
  }

  convertUTCForDisplay(dateTime) {
    return formatDate(new Date(dateTime), 'dd-MM-yyyy T HH:mm:ss', 'en');
  }

  getPatientJsonObjectFromPatientFhirObject(patientFHIR) {
    const patientJSON = {};
    patientJSON['name'] = this.getNameFromResource(patientFHIR);
    patientJSON['dob'] = patientFHIR['birthDate'];
    patientJSON['id'] = patientFHIR['id'];
    patientFHIR.telecom.forEach(eachTelecomItem => {
      patientJSON[eachTelecomItem.system] = eachTelecomItem.value;
    });
    patientFHIR.extension.forEach(eachExtension => {
      if (eachExtension.url === 'https://bcip.smilecdr.com/fhir/branch') {
        patientJSON['branch'] = eachExtension.valueString;
      } else if (eachExtension.url === 'https://bcip.smilecdr.com/fhir/crossreferenceone') {
        patientJSON['crossreferenceone'] = eachExtension.valueString;
      } else if (eachExtension.url === 'https://bcip.smilecdr.com/fhir/dependentlink') {
        patientJSON['dependentlink'] = eachExtension.valueString;
      } else if (eachExtension.url === 'https://bcip.smilecdr.com/fhir/crossreferencetwo') {
        patientJSON['crossreferencetwo'] = eachExtension.valueString;
      } else if (eachExtension.url === 'https://bcip.smilecdr.com/fhir/jobtile') {
        patientJSON['jobtile'] = eachExtension.valueString;
      } else if (eachExtension.url === 'https://bcip.smilecdr.com/fhir/workplace') {
        patientJSON['workplace'] = eachExtension.valueString;
      } else if (eachExtension.url === 'https://bcip.smilecdr.com/fhir/employeetype') {
        patientJSON['employeetype'] = eachExtension.valueString;
      }
    });
    patientFHIR.identifier.forEach(eachIdentifier => {
      if (eachIdentifier.system === 'https://bcip.smilecdr.com/fhir/employeeid') {
        patientJSON['employeeId'] = eachIdentifier.value;
      }
    });
    patientJSON['preferredLanguage'] = patientFHIR.communication[0].language.coding[0].display;
    patientJSON['address'] = {};
    patientJSON['address']['line'] = patientFHIR['address'][0]['line'][0];
    patientJSON['address']['city'] = patientFHIR['address'][0]['city'];
    patientJSON['address']['country'] = patientFHIR['address'][0]['country'];
    patientJSON['address']['postalCode'] = patientFHIR['address'][0]['postalCode'];
    patientJSON['address']['state'] = patientFHIR['address'][0]['state'];
    return patientJSON;
  }

  /**
   * Takes in an array and sorts the values given. Calls the natural compare function
   * to handle the comparison between elements of an array
   * @param colName the name of the column you wish to sort
   * @param arrayToSort the array you want to sort
   */
  sortArray(colName, arrayToSort) {
    this.order = colName;

    /**
     * If true, will sort in descending order,
     * if false, will sort in ascending order
     */
    this.switchSortChoice = !this.switchSortChoice;
    const temp = [...arrayToSort];
    temp.sort((a, b) => {
      const aTemp = a[colName] ? a[colName].toString() : '';
      const bTemp = b[colName] ? b[colName].toString() : '';

      return this.naturalCompare(aTemp, bTemp, this.switchSortChoice);
    });
    arrayToSort = [...temp];
    return arrayToSort;
  }

  naturalCompare(a, b, choice: boolean) {
    const ax = [];
    const bx = [];

    a.replace(/(\d+)|(\D+)/g, (_, $1, $2) => { ax.push([$1 || Infinity, $2 || '']); });
    b.replace(/(\d+)|(\D+)/g, (_, $1, $2) => { bx.push([$1 || Infinity, $2 || '']); });

    if (choice === true) {
      while (ax.length && bx.length) {
        const an = ax.shift();
        const bn = bx.shift();
        const nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
        if (nn) {
          return nn;
        }
      }
      return ax.length - bx.length;
    }

    if (choice === false) {
      while (ax.length && bx.length) {
        const an = ax.shift();
        const bn = bx.shift();
        const nn = (bn[0] - an[0]) || bn[1].localeCompare(an[1]);
        if (nn) {
          return nn;
        }
      }
      return bx.length - ax.length;
    }

  }

  auditEventHandler() {
    const auditEvent = new FHIR.AuditEvent;
    const agent = new FHIR.Agent;
    // agent.
  }

  getResourceFromReferenceAsync(reference) {
    return this.http.get(environment.queryURI + '/' + reference, { headers: this.getHeaders() }).toPromise();
  }

  getNoCacheHeaders() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken(),
      'Cache-Control': 'no-cache'
    });
    return headers;
  }

  getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }

  getPostHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }

}
