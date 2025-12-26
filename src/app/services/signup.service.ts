import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  gender: string;
  dob: string;
  country: string;
  state: string;
  city: string;
  address: string;
  pincode: string;
}

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  // Base URL for authentication endpoints
  private baseUrl = '/api/auth';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  signup(userData: SignupData): Observable<any> {
    const apiUrl = `${this.baseUrl}/signUp`;
    console.log('Calling API:', apiUrl);
    console.log('Sending data:', userData);
    return this.http.post<any>(apiUrl, userData, this.httpOptions);
  }

  checkEmailExists(email: string): Observable<any> {
    const apiUrl = `${this.baseUrl}/checkemail`;
    const params = { email: email };
    console.log('Checking email existence:', apiUrl, params);
    // Backend returns plain text, so we use responseType: 'text'
    return this.http.get(apiUrl, { 
      params: params,
      responseType: 'text'
    });
  }
}

