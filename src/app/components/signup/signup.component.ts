import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SignupService, SignupData } from '../../services/signup.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  countries = [
    'United States', 'India', 'United Kingdom', 'Canada', 'Australia',
    'Germany', 'France', 'Japan', 'China', 'Brazil', 'Mexico', 'Spain'
  ];

  states: { [key: string]: string[] } = {
    'United States': ['California', 'New York', 'Texas', 'Florida', 'Illinois'],
    'India': ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat'],
    'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    'Canada': ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
    'Australia': ['New South Wales', 'Victoria', 'Queensland', 'Western Australia']
  };

  cities: { [key: string]: string[] } = {
    'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany'],
    'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem']
  };

  availableStates: string[] = [];
  availableCities: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private signupService: SignupService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.signupForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z]+$/)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)]],
      gender: ['', Validators.required],
      dob: ['', [Validators.required, this.dateValidator]],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(10)]],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{5,6}$/)]]
    });

    // Watch for country changes
    this.signupForm.get('country')?.valueChanges.subscribe(country => {
      this.onCountryChange(country);
    });

    // Watch for state changes
    this.signupForm.get('state')?.valueChanges.subscribe(state => {
      this.onStateChange(state);
    });
  }

  onCountryChange(country: string): void {
    this.availableStates = this.states[country] || [];
    this.signupForm.patchValue({ state: '', city: '' });
    this.availableCities = [];
  }

  onStateChange(state: string): void {
    const country = this.signupForm.get('country')?.value;
    const stateKey = `${country}-${state}`;
    this.availableCities = this.cities[state] || [];
    this.signupForm.patchValue({ city: '' });
  }

  dateValidator(control: any) {
    if (!control.value) {
      return null;
    }
    const selectedDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    
    if (age < 13 || (age === 13 && monthDiff < 0) || (age === 13 && monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
      return { invalidAge: true };
    }
    
    if (selectedDate > today) {
      return { futureDate: true };
    }
    
    return null;
  }

  get f() {
    return this.signupForm.controls;
  }

  getFieldError(fieldName: string): string {
    const field = this.f[fieldName];
    if (field?.errors && (field.dirty || field.touched || this.submitted)) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'password') {
          return 'Password must contain at least one uppercase, one lowercase, one number, and one special character';
        }
        if (fieldName === 'phoneNumber') {
          return 'Please enter a valid phone number';
        }
        if (fieldName === 'pincode') {
          return 'Pincode must be 5-6 digits';
        }
        if (fieldName === 'firstName' || fieldName === 'lastName') {
          return 'Only letters are allowed';
        }
        return 'Invalid format';
      }
      if (field.errors['invalidAge']) {
        return 'You must be at least 13 years old';
      }
      if (field.errors['futureDate']) {
        return 'Date of birth cannot be in the future';
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      password: 'Password',
      phoneNumber: 'Phone Number',
      gender: 'Gender',
      dob: 'Date of Birth',
      country: 'Country',
      state: 'State',
      city: 'City',
      address: 'Address',
      pincode: 'Pincode'
    };
    return labels[fieldName] || fieldName;
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.signupForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formData: SignupData = this.signupForm.value;

    this.signupService.signup(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Signup successful! Welcome to Trove Social App.';
        this.signupForm.reset();
        this.submitted = false;
        console.log('Signup successful:', response);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
        console.error('Signup error:', error);
      }
    });
  }
}

