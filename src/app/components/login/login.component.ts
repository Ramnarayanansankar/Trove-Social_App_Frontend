import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService, LoginData } from '../../services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      this.router.navigate(['/home']);
      return;
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  getFieldError(fieldName: string): string {
    const field = this.f[fieldName];
    if (field?.errors && (field.touched || this.submitted)) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `Password must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    const loginData: LoginData = this.loginForm.value;
    
    console.log('Submitting login form with data:', loginData);

    this.loginService.login(loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Login Response received:', response);
        
        // Store user data in localStorage
        // Extract user data from backend response
        // Handle different possible response structures
        const firstName = response?.user?.firstName || 
                         response?.firstName || 
                         response?.data?.firstName ||
                         response?.data?.user?.firstName ||
                         response?.user?.username ||
                         response?.username ||
                         response?.data?.username ||
                         'User';
        const lastName = response?.user?.lastName || 
                        response?.lastName || 
                        response?.data?.lastName ||
                        response?.data?.user?.lastName ||
                        '';
        
        const userData = {
          email: loginData.email,
          firstName: firstName,
          lastName: lastName
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Show success message briefly before navigation
        this.successMessage = 'Login successful! Redirecting...';
        
        // Navigate to homepage after a short delay
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login Error Details:', error);
        console.error('Error Status:', error.status);
        console.error('Error Message:', error.message);
        
        // Handle different error scenarios
        if (error.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check if the backend is running.';
        } else if (error.status === 401) {
          this.errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Invalid data. Please check your input.';
        } else if (error.status === 500) {
          this.errorMessage = error.error?.message || 'Server error. Please try again later.';
        } else {
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        }
      }
    });
  }
}

