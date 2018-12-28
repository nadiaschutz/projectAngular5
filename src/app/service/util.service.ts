import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  getNameFromResource(resource: string) {
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

  getDate(dateTime) {
    return formatDate(new Date(dateTime), 'yyyy-MM-dd', 'en');
  }

  getDateTime(dateTime) {
    return formatDate(new Date(dateTime), 'dd-MM-yyyy, HH:mm:ss', 'en');
  }

}
