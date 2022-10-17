import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Luv2ShopFormService {
  constructor() {}
  // get the months for the dropdown list in the form
  getCreditCardMonths(startMonth: number): Observable<number[]> {
    let data: number[] = [];
    //build an array for the 'Month' dropdown list
    // start at current month and loop
    for (let theMonth = startMonth; theMonth <= 12; theMonth++) {
      data.push(theMonth);
    }
    // the "of" operator wrap the object as an Observable
    return of(data);
  }
  // get the years for the dropdown list in the form
  getCreditCardYears(): Observable<number[]> {
    let data: number[] = [];
    // build an array for "year" downlist
    // start at current year and loop for next 10 years
    let startYear = new Date().getFullYear();
    let endYear = startYear + 10;
    for (let theYear = startYear; theYear <= endYear; theYear++) {
      data.push(theYear);
    }
    return of(data);
  }
}
