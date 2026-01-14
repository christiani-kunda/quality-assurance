![Numida](../../../logo.numida.png)

# First-Time Loan Application - Frontend

A React + TypeScript application for the First-Time Loan Application system built with Vite.

## Prerequisites

- Node.js 18+ and npm/yarn
- The backend server must be running on http://localhost:5001

## Installation

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to http://localhost:5173

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## Application Flow

### 1. Login Page
- Initial landing page with "Start Application" button

### 2. Phone Number Entry
- User enters their phone number
- Validates phone number format
- Sends OTP request to backend

### 3. OTP Verification
- User enters the OTP (use `0000` for testing)
- Verifies OTP with backend
- Creates authenticated session

### 4. Personal Details
- Full Name (required, min 2 characters)
- National ID (required)
- Email Address (optional, must be valid format)
- Date of Birth (required, must be 18+)

### 5. Loan Details
- Loan Amount (required, between 1,000 - 5,000,000)
- Loan Term (required, select from: 3, 6, 12, 18, 24, 36 months)
- Purpose (required, text area)

### 6. Decision Page
- Displays application status: Approved, Rejected, or Pending
- Shows application summary
- Allows user to logout

## Features

- Multi-step form with validation
- Session management using sessionStorage
- Real-time form validation
- Error handling with user-friendly messages
- Responsive design
- Clean, modern UI

## Testing Credentials

- **Phone Number**: Any valid format (e.g., `+256700000000`, `0700000000`)
- **OTP**: `0000` (hard-coded for testing)

## API Integration

The frontend communicates with the backend REST API at `http://localhost:5001`:

- `POST /api/auth/request-otp` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP and create session
- `GET /api/application/status` - Check application status
- `POST /api/application/submit` - Submit loan application

## State Management

The application uses React's built-in state management with hooks:
- `useState` for local component state
- `useEffect` for side effects and API calls
- `sessionStorage` for session persistence

## Styling

Custom CSS with:
- Gradient background
- Card-based layout
- Responsive design for mobile and desktop
- Form validation feedback
- Status-based color coding

## Development Notes

- Built with React 19 and TypeScript
- Uses Vite for fast development experience
- No external UI libraries (vanilla CSS)
- REST API communication using fetch
- Client-side routing handled by conditional rendering

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript support required

## Troubleshooting

### Cannot connect to backend
- Ensure backend server is running on http://localhost:5001
- Check browser console for CORS errors
- Verify network connectivity

### Form validation errors
- Check that all required fields are filled
- Verify date format is YYYY-MM-DD
- Ensure loan amount is within valid range
- Check that email format is valid (if provided)

### Session expired
- Click logout and login again
- Clear sessionStorage if needed
- Restart the application

## Notes for QA Testing

This application has intentional variations from the specification and subtle bugs for testing purposes. Areas to investigate:

- Form validation edge cases
- Multi-step navigation
- Session persistence
- Error handling
- Responsive design
- Accessibility
- Browser compatibility

Happy testing! 🚀
