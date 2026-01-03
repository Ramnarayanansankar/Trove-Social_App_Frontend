import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Post {
  postId: number;
  caption: string;
  imageUrls: string[];
  date: string;
}

export interface PostSummaryResponse {
  totalCount: number;
  posts: Post[];
  startIndex: number;
  endIndex: number;
  hasMore: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  // Base URL for post endpoints
  private baseUrl = 'http://localhost:8081/api/auth';

  constructor(private http: HttpClient) { }

  // Create post with images and caption
  createPost(files: File[], caption: string, userId: string): Observable<any> {
    const apiUrl = `${this.baseUrl}/createPost`;
    console.log('=== Create Post Request ===');
    console.log('API URL:', apiUrl);
    console.log('Files count:', files.length);
    console.log('Caption:', caption);
    console.log('User ID:', userId);
    
    const formData = new FormData();
    
    // Append all files
    files.forEach((file, index) => {
      formData.append('files', file);
      console.log(`File ${index + 1}:`, file.name, file.size, 'bytes');
    });
    
    // Append other fields
    formData.append('caption', caption);
    formData.append('posttype', 'photo');
    formData.append('id', userId);
    
    // Don't set Content-Type header for FormData - browser will set it automatically with boundary
    return this.http.post(apiUrl, formData).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('=== Create Post Failed ===');
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

  // Get post summary for a user with pagination
  getPostSummary(userId: string, startIndex: number, endIndex: number): Observable<PostSummaryResponse> {
    const apiUrl = `${this.baseUrl}/postSummary/${userId}?startIndex=${startIndex}&endIndex=${endIndex}`;
    console.log('=== Fetching Post Summary ===');
    console.log('API URL:', apiUrl);
    console.log('User ID:', userId);
    console.log('Start Index:', startIndex);
    console.log('End Index:', endIndex);
    
    return this.http.get<PostSummaryResponse>(apiUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('=== Get Post Summary Failed ===');
        console.error('Status:', error.status);
        console.error('Status Text:', error.statusText);
        console.error('Request URL:', error.url);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
        return throwError(() => error);
      })
    );
  }

  // Get image from URL (returns blob)
  getImage(imageUrl: string): Observable<Blob> {
    console.log('=== Fetching Image ===');
    console.log('Image URL:', imageUrl);
    
    return this.http.get(imageUrl, { responseType: 'blob' }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('=== Get Image Failed ===');
        console.error('Status:', error.status);
        console.error('Image URL:', imageUrl);
        console.error('Error message:', error.message);
        return throwError(() => error);
      })
    );
  }
}

