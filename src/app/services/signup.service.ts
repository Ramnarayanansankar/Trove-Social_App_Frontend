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
  photoUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  // Base URL for authentication endpoints
  private baseUrl = 'http://localhost:8081/api/auth';

  constructor(private http: HttpClient) { }

  // Upload profile picture (MultipartFile)
  uploadImage(file: File): Observable<string> {
    const apiUrl = `${this.baseUrl}/upload`;
    console.log('=== Upload Image Request ===');
    console.log('API URL:', apiUrl);
    console.log('File name:', file.name);
    console.log('File size:', file.size, 'bytes');
    console.log('File type:', file.type);
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Don't set Content-Type header for FormData - browser will set it automatically with boundary
    // Backend returns plain text (photoUrl), so we use responseType: 'text'
    return this.http.post(apiUrl, formData, { 
      responseType: 'text'
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('=== Image Upload Failed ===');
        console.error('Status:', error.status);
        console.error('Status Text:', error.statusText);
        console.error('Request URL:', error.url);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
        console.error('Full error:', error);
        return throwError(() => error);
      })
    );
  }

  // Signup with JSON data
  signup(signupData: SignupData): Observable<any> {
    const apiUrl = `${this.baseUrl}/signUp`;
    console.log('=== Signup Request ===');
    console.log('API URL:', apiUrl);
    console.log('Signup Data:', signupData);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.post<any>(apiUrl, signupData, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('=== Signup Request Failed ===');
        console.error('Status:', error.status);
        console.error('Status Text:', error.statusText);
        console.error('Request URL:', error.url);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
        console.error('Full error:', error);
        return throwError(() => error);
      })
    );
  }

  checkEmailExists(email: string): Observable<any> {
    const apiUrl = `${this.baseUrl}/checkEmail`;
    const params = { email: email };
    console.log('Checking email existence - URL:', apiUrl, params);
    // Backend returns plain text, so we use responseType: 'text'
    return this.http.get(apiUrl, { 
      params: params
    });
  }

  checkPhoneNumberExists(phoneNumber: string): Observable<any> {
    const apiUrl = `${this.baseUrl}/checkphonenumber`;
    const params = { phoneNumber: phoneNumber };
    console.log('Checking phone number existence - URL:', apiUrl, params);
    // Backend returns plain text, so we use responseType: 'text'
    return this.http.get(apiUrl, { 
      params: params,
      responseType: 'text'
    });
  }
}

