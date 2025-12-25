import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}

