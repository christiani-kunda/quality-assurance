![Numida](../logo.numida.png)

# First-Time Loan Application - Quick Start Guide

This guide will help you get the First-Time Loan Application system up and running quickly.

## Prerequisites

- **Frontend & Backend**: Docker 22+ installed and running
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)

## Quick Start

### 1. Start the Backend Server

```bash
cd quality-assurance
docker compose up --build
```

The API will be available at http://localhost:5001
The application will be available at http://localhost:5173

### 3. Test the Application

1. Open http://localhost:5173 in your browser
2. Click "Start Application"
3. Enter a phone number (any valid format, e.g., `+256700000000`)
4. Use OTP: `0000`
5. Fill in personal and loan details
6. Submit and view decision

## Testing Credentials

- **Phone Number**: Any valid format (e.g., `+256700000000`, `0700000000`)
- **OTP**: `0000` (hard-coded for testing)

## API Endpoints

Base URL: `http://localhost:5001`

| Method | Endpoint                    | Description                  |
|--------|-----------------------------|------------------------------|
| POST   | /api/auth/request-otp       | Request OTP                  |
| POST   | /api/auth/verify-otp        | Verify OTP & create session  |
| GET    | /api/application/status     | Check application status (auth required) |
| POST   | /api/application/submit     | Submit application (auth required) |
| GET    | /api/health                 | Health check                 |
| GET    | /                           | Welcome message              |

## Application Flow

1. **Login** → Enter phone number → Receive OTP
2. **Verify OTP** → Enter `0000` → Create session
3. **Personal Details** → Full name, National ID, Email, Date of Birth
4. **Loan Details** → Amount, Term, Purpose
5. **Decision** → View approval status

## Resetting Data

The application stores data in memory. To reset all data:
- **Restart the backend server**
- Clear browser sessionStorage (Application tab in DevTools)

## Next Steps

- Review [README.md](README.md) for QA assessment instructions
- Read [SPEC.md](SPEC.md) for detailed application specification
- See [server/README.md](server/README.md) for backend API documentation
- See [web/README.md](web/README.md) for frontend documentation

Happy testing! 🚀
