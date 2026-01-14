![Numida](../../../logo.numida.png)

# First-Time Loan Application - Server Setup

This is a Flask REST API server for the First-Time Loan Application system.

## Prerequisites

- Python 3.9+ OR Docker
- pip (Python package manager)

## Installation Options

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create a virtual environment (recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the server:
   ```bash
   python app.py
   ```

5. The server will be available at http://localhost:5001

## API Documentation

### Base URL
```
http://localhost:5001
```

### Endpoints

#### 1. Home
**GET** `/`

Returns welcome message and API version.

**Response:**
```json
{
  "message": "Welcome to the Loan Application API",
  "version": "1.0.0"
}
```

#### 2. Health Check
**GET** `/api/health`

Check if the server is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-07T10:30:00"
}
```

#### 3. Request OTP
**POST** `/api/auth/request-otp`

Request an OTP for phone number authentication.

**Request Body:**
```json
{
  "phone_number": "+256700000000"
}
```

**Response (Success):**
```json
{
  "message": "OTP sent successfully",
  "phone_number": "+256700000000"
}
```

**Response (Error):**
```json
{
  "error": "Invalid phone number format"
}
```

**Note:** For testing purposes, the OTP is hard-coded to `0000`.

#### 4. Verify OTP
**POST** `/api/auth/verify-otp`

Verify OTP and create a session.

**Request Body:**
```json
{
  "phone_number": "+256700000000",
  "otp": "0000"
}
```

**Response (Success):**
```json
{
  "message": "Authentication successful",
  "session_token": "550e8400-e29b-41d4-a716-446655440000",
  "phone_number": "+256700000000"
}
```

**Response (Error):**
```json
{
  "error": "Invalid OTP"
}
```

#### 5. Get Application Status
**GET** `/api/application/status`

Get the current application status for the authenticated user.

**Headers:**
```
Authorization: Bearer <session_token>
```

**Response (No Application):**
```json
{
  "has_application": false
}
```

**Response (Has Application):**
```json
{
  "has_application": true,
  "application": {
    "id": "app-123",
    "full_name": "John Doe",
    "national_id": "CM12345678",
    "email": "john@example.com",
    "date_of_birth": "1990-01-01",
    "loan_amount": 50000,
    "loan_term": 12,
    "purpose": "Business expansion",
    "status": "approved",
    "submitted_at": "2026-01-07T10:30:00",
    "decision_reason": "Automated decision based on initial criteria"
  }
}
```

#### 6. Submit Application
**POST** `/api/application/submit`

Submit a new loan application.

**Headers:**
```
Authorization: Bearer <session_token>
```

**Request Body:**
```json
{
  "full_name": "John Doe",
  "national_id": "CM12345678",
  "email": "john@example.com",
  "date_of_birth": "1990-01-01",
  "loan_amount": 50000,
  "loan_term": 12,
  "purpose": "Business expansion"
}
```

**Validation Rules:**
- `full_name`: Required, minimum 2 characters
- `national_id`: Required, minimum 5 characters
- `email`: Optional, must be valid email format if provided
- `date_of_birth`: Required, must be at least 18 years old (format: YYYY-MM-DD)
- `loan_amount`: Required, must be between 1000 and 5000000
- `loan_term`: Required, must be one of: 3, 6, 12, 18, 24, 36
- `purpose`: Required, cannot be empty

**Response (Success):**
```json
{
  "message": "Application submitted successfully",
  "application": {
    "id": "app-123",
    "status": "approved",
    ...
  }
}
```

**Response (Validation Error):**
```json
{
  "errors": {
    "full_name": "Full name must be at least 2 characters",
    "loan_amount": "Loan amount must be at least 1000"
  }
}
```

**Response (Duplicate Application):**
```json
{
  "error": "Application already exists"
}
```

## Application Decision Logic

The system automatically evaluates applications based on simple criteria:

- **Approved**: Small loans (< 50,000) for applicants aged 25-59
- **Pending**: High-value loans (≥ 1,000,000) or senior applicants (≥ 60)
- **Approved** (default): Most other cases

This is intentionally simplified for testing purposes.

## Testing Notes

- The server stores data in memory (not persistent)
- OTP is hard-coded to `0000` for testing
- Restart the server to reset all data
- Authentication is simplified for this exercise

## Troubleshooting

### Port Already in Use
If port 5001 is already in use, modify the port in:
- `docker-compose.yaml` (for Docker)
- `app.py` (for local Python)

### CORS Issues
The server has CORS enabled for all origins. If you encounter CORS issues, ensure:
- The frontend is making requests to the correct URL
- The Authorization header is included in authenticated requests

## Development

To run the server in development mode with auto-reload:

```bash
export FLASK_ENV=development
python app.py
```

## Notes for QA Testing

This application has been designed with intentional variations from the specification and includes subtle bugs for QA testing purposes. Some known areas to investigate:

- Validation edge cases
- Duplicate submission handling
- Session management
- Error handling consistency
- Status persistence
- Date validation edge cases

Happy testing! 🚀

```json
{
  "message": "Welcome to the Numida API"
}
```
