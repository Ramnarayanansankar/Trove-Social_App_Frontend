import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface LoginData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  // Base URL for authentication endpoints
  private baseUrl = '/api/auth';
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
}

