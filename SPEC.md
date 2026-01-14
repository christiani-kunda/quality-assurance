![Numida](../logo.numida.png)

# First-Time Loan Application – Functional Specification

## 1. Overview

This document describes the expected behaviour of a **First-Time Loan Application** flow.

The application allows a new customer to:
- Register basic personal details
- Apply for a loan for the first time
- Receive a loan decision
- View the outcome of their application

This specification represents the **intended behaviour** of the system.

## 2. Assumptions

- The user is a **first-time applicant** (no prior loans)
- The system is running in a **non-production environment**
- Authentication is simplified for the purpose of this exercise
- All currency values are assumed to be in **local currency**
- External integrations (e.g. credit bureaus, payments) are mocked or simplified

## 3. Authentication (Phone Number + OTP)

For this assessment, authentication is intentionally simplified.

### 3.1 Login Method
- The user authenticates using their **phone number**.
- After entering a phone number, the user must enter a **One-Time Password (OTP)** sent via SMS.
- For testing purposes, the OTP is **hard-coded** to `0000`.

### 3.2 Session Behaviour
- After successful OTP verification, the user is considered **logged in**.
- The user’s phone number is used as the primary identifier to:
  - Look up the user’s application and loan status
  - Prevent duplicate applications (see “Application Start” and “Submission” rules)

### 3.3 Validation Rules
- Phone number must be in a valid format (as defined by the application).
- OTP must match the expected value (`0000`) to succeed.
- Failed OTP attempts should show a clear validation message.

## 4. User Journey (High-Level)

1. User lands on the application homepage  
2. User starts a new loan application  
3. User completes required personal details  
4. User submits a loan request  
5. System processes the application  
6. User receives a loan decision (Approved / Rejected / Pending)

## 5. Functional Requirements

### 6.1 Application Start

- The user must be able to start a new loan application
- Only one active application is allowed per user (identified by phone number)
- If an application is already in progress, the user should be informed

### 6.2 Personal Details Capture

The user must provide the following:

| Field | Required | Rules |
|------|----------|-------|
| Full Name | Yes | Minimum 2 characters |
| National ID | Yes | Must be unique |
| Phone Number | Yes | Valid format (already validated during authentication) |
| Email Address | No | Must be valid if provided |
| Date of Birth | Yes | User must be ≥ 18 years old |

### 6.3 Loan Request Details

The user must specify:

| Field | Required | Rules |
|------|----------|-------|
| Loan Amount | Yes | Must be within allowed range |
| Loan Term | Yes | Fixed set of allowed terms |
| Purpose | Yes | Free-text |

Rules:
- Loan amount must be greater than zero
- Loan term must be one of the supported values
- Purpose cannot be empty

### 5.4 Application Submission

- User can submit the application only once all required fields are valid
- The system must validate inputs before submission
- Duplicate submissions should be prevented for the same authenticated user (phone number)

### 5.5 Application Processing

Upon submission:
- The system evaluates the application
- Processing may take a short amount of time
- The user should receive feedback that processing is in progress

### 5.6 Loan Decision

The system returns one of the following statuses:

| Status | Description |
|--------|-------------|
| Approved | Loan approved and ready for disbursement |
| Rejected | Application rejected |
| Pending | Application requires further review |

Rules:
- The decision must be clearly communicated to the user
- Decision must persist if the user refreshes or returns later

### 5.7 Error Handling

- Validation errors should be shown clearly to the user
- System errors should display a generic error message
- The user should not see raw system or API errors

## 6. Non-Functional Requirements

### 6.1 Usability
- The flow should be simple and easy to follow
- Required fields should be clearly indicated
- Error messages should be understandable

### 6.2 Reliability
- The system should prevent data corruption
- Partial submissions should not result in inconsistent state

### 6.3 Performance
- User actions should respond within a reasonable time
- Processing feedback should be shown if actions take longer

## 7. API Behaviour (High-Level Expectations)

- APIs should validate inputs
- APIs should return appropriate status codes
- Error responses should be structured and consistent
- Duplicate requests should be handled gracefully

## 8. Constraints & Limitations

- This is a simplified reference implementation
- Some business rules may be intentionally incomplete
- Not all edge cases are documented
- External systems are mocked

## 9. Out of Scope

The following are intentionally out of scope:
- Loan repayment
- Repeat loans
- Payments or disbursement
- Authentication edge cases
- Admin or back-office flows

## 10. Notes for Candidates

- This document represents **intended behaviour**, not guaranteed behaviour
- Part of this exercise is identifying **gaps, inconsistencies, or deviations**
- You are encouraged to question assumptions and document findings
- Do not modify application code to “fix” issues — document them instead

## 11. Open Questions (Intentionally Left Unanswered)

- What happens if the user abandons the flow halfway?
- How are retries handled?
- Are there rate limits?
- What happens if the same National ID is reused?

These are intentionally left open for you to identify and reason about.
