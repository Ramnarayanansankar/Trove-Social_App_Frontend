import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  private apiUrl = 'http://localhost:8081/signUp';

  constructor(private http: HttpClient) { }

  signup(userData: SignupData): Observable<any> {
    return this.http.post(this.apiUrl, userData);
  }
}

