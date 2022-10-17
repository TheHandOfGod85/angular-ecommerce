import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { Country } from '../common/country';
import { State } from '../common/state';

@Injectable({
  providedIn: 'root',
})
export class Luv2ShopFormService {
  private countriesUrl = 'http://localhost:8080/api/countries';
  private stateUrl = 'http://localhost:8080/api/states';
  constructor(private httpClient: HttpClient) {}
  // get the countries from the api
  getCountries(): Observable<Country[]> {
    return this.httpClient
      .get<GetResponseCountries>(this.countriesUrl)
      .pipe(map((response) => response._embedded.countries));
  }
  getStates(theCountryCode: string): Observable<State[]> {
    // search url
    const searchStateUrl = `${this.stateUrl}/search/findByCountryCode?code=${theCountryCode}`;
    return this.httpClient
      .get<GetResponseStates>(searchStateUrl)
      .pipe(map((response) => response._embedded.states));
  }
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
// interface to map the JSON response
interface GetResponseCountries {
  _embedded: {
    countries: Country[];
  };
}
// interface to map the JSON response
interface GetResponseStates {
  _embedded: {
    states: State[];
  };
}
