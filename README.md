# Trove Social App - Frontend

Angular-based frontend application for Trove Social Media App.

## Features

- User signup with comprehensive form validation
- Responsive design
- Modern UI with gradient backgrounds
- Form validation with real-time error messages

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (v17 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install Angular CLI globally (if not already installed):
```bash
npm install -g @angular/cli
```

## Development Server

Run `ng serve` or `npm start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── signup/
│   │       ├── signup.component.ts
│   │       ├── signup.component.html
│   │       └── signup.component.css
│   ├── services/
│   │   └── signup.service.ts
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.component.css
│   ├── app.module.ts
│   └── app-routing.module.ts
├── index.html
├── main.ts
└── styles.css
```

## Signup Form Fields

The signup form includes the following fields:
- First Name
- Last Name
- Email
- Password
- Phone Number
- Gender
- Date of Birth
- Country
- State
- City
- Address
- Pincode

## API Configuration

Update the API URL in `src/app/services/signup.service.ts` to point to your backend API endpoint.

## Form Validation

- All fields are required
- Email validation
- Password strength validation (min 8 chars, uppercase, lowercase, number, special character)
- Phone number format validation
- Date of birth validation (minimum age 13)
- Pincode format validation (5-6 digits)
- Name fields accept only letters

## License

This project is private and proprietary.

