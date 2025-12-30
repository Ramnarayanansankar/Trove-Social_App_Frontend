import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';

export interface LoginData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  // Base URL for authentication endpoints
  private baseUrl = 'http://localhost:8081/api/auth';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  // Set to true to use mock response for frontend testing
  private useMock = false;

  constructor(private http: HttpClient) { }

  login(loginData: LoginData): Observable<any> {
    if (this.useMock) {
      // Mock response for frontend testing
      console.log('Using mock login response');
      console.log('Login data:', loginData);
      return of({
        success: true,
        message: 'Login successful',
        user: {
          email: loginData.email,
          firstName: 'User'
        }
      }).pipe(delay(1000));
    }

    const apiUrl = `${this.baseUrl}/login`;
    console.log('Calling API:', apiUrl);
    console.log('Sending data:', loginData);
    return this.http.post<any>(apiUrl, loginData, this.httpOptions);
  }

  getPhoto(photoUrl: string): Observable<Blob> {
    const apiUrl = `${this.baseUrl}/getPhoto`;
    console.log('=== GetPhoto API Request ===');
    console.log('API URL:', apiUrl);
    console.log('Photo URL parameter:', photoUrl);
    console.log('Request Method: POST');
    console.log('Request Body:', { photoUrl: photoUrl });
    
    // Spring Resource is returned as binary data, so we use responseType: 'blob'
    // This will correctly handle the Resource response from Java backend
    // Using POST method with photoUrl in request body
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.post(apiUrl, { photoUrl: photoUrl }, {
      headers: headers,
      responseType: 'blob'
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('=== GetPhoto API Error ===');
        console.error('Status:', error.status);
        console.error('Status Text:', error.statusText);
        console.error('URL:', error.url);
        console.error('Message:', error.message);
        console.error('Error object:', error);
        
        if (error.status === 0) {
          console.error('Status 0 indicates:');
          console.error('- CORS issue: Backend may not allow requests from localhost:4200');
          console.error('- Backend not running on localhost:8081');
          console.error('- Network connectivity issue');
          console.error('Please check:');
          console.error('1. Backend CORS configuration allows requests from http://localhost:4200');
          console.error('2. Backend is running on http://localhost:8081');
          console.error('3. The /getPhoto endpoint is correctly configured');
        }
        
        return throwError(() => error);
      })
    );
  }
}

