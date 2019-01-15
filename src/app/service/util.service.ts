import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  switchSortChoice;
  order;

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

  getCurrentDate() {
    return formatDate(new Date(), 'yyyy-MM-dd', 'en');
  }

  getDate(dateTime) {
    return formatDate(new Date(dateTime), 'yyyy-MM-dd', 'en');
  }

  getDateTime(dateTime) {
    return formatDate(new Date(dateTime), 'dd-MM-yyyy, HH:mm:ss', 'en');
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
}
