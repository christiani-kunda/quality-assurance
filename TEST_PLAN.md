# Test Plan: First-Time Loan Application System

## Document Information
- **Project**: First-Time Loan Application System
- **Version**: 1.0.0
- **Date**: January 14, 2026
- **Author**: Christian Iradukunda

---

## 1. Executive Summary

This test plan outlines the quality assurance strategy for the First-Time Loan Application System. The plan covers automated UI testing, API testing, and manual exploratory testing to ensure the application meets functional requirements and provides a reliable user experience.

### Key Objectives
- Validate complete loan application flow from authentication to decision
- Verify input validation and error handling
- Test business logic for loan submission
- Identify bugs, gaps, and potential risks
- Establish automated regression testing capability

---

## 2. Test Scope

### 2.1 In Scope

#### Functional Testing
- **Authentication Flow**
  - Phone number entry and validation
  - OTP request and verification
  - Session management

- **Application Form**
  - Personal details capture and validation
  - Loan details capture and validation
  - Multi-step form navigation

- **Business Logic**
  - Loan decision rules (approve/pending)
  - Age-based eligibility (18+ years)
  - Loan amount boundaries (1,000 - 5,000,000)
  - Loan term validation

- **API Endpoints**
  - `/api/auth/request-otp`
  - `/api/auth/verify-otp`
  - `/api/application/status`
  - `/api/application/submit`
  - `/api/health`

- **Data Validation**
  - Phone number format validation
  - Email format validation (optional field)
  - National ID validation
  - Date of birth validation and age calculation
  - Loan amount and term validation

### 2.2 Out of Scope

The following are explicitly excluded from this assessment:

- **Security Testing**: Penetration testing, encryption analysis, token expiration edge cases
- **Performance Testing**: Load testing, stress testing, scalability analysis
- **Browser Compatibility**: Limited to Chromium only (can be expanded)
- **Mobile Testing**: Responsive design and mobile-specific flows
- **Accessibility**: WCAG compliance, screen reader testing
- **Internationalization**: Multi-language support, locale-specific formatting
- **Database Testing**: Data integrity, backup/recovery (in-memory storage)
- **Payment/Disbursement**: Downstream loan processing (out of spec)
- **Admin Flows**: Back-office functionality, reporting

---

## 3. Test Strategy

### 3.1 Test Pyramid Approach

```
           /\
          /  \   Manual Exploratory (10%)
         /____\  
        /      \  UI Automated Tests (30%)
       /________\
      /          \  API Automated Tests (60%)
     /____________\
```

### 3.2 Testing Levels

#### Level 1: API Testing (Priority 1)
- **Tool**: pytest + requests
- **Coverage Target**: 90%+
- **Focus**: Core business logic, validation rules, error handling
- **Execution**: Fast, runs in < 30 seconds
- **Benefits**: Catches issues early, highly maintainable

#### Level 2: UI Testing (Priority 2)
- **Tool**: Playwright (TypeScript)
- **Coverage Target**: 70%+ of critical paths
- **Focus**: User workflows, integration testing, visual validation
- **Execution**: Moderate speed, runs in < 3 minutes
- **Benefits**: Tests complete user experience

#### Level 3: Manual Exploratory (Priority 3)
- **Focus**: Edge cases, usability, bug discovery
- **Execution**: Ad-hoc, time-boxed sessions
- **Benefits**: Human insight, creativity in finding issues

### 3.3 Test Data Strategy

#### Phone Numbers
- Pattern: `+25670xxxxxxx` or `07xxxxxxxx`
- Test pool: `0700000001` through `0700000050`
- Unique generation for parallel tests

#### National IDs
- Pattern: `CM` + 8 alphanumeric characters
- Unique generation using UUID to avoid conflicts
- Document bug: uniqueness not enforced

#### OTP
- Hardcoded: `0000` (per specification)
- Document bug: case-insensitive comparison

#### Test Users
| Scenario | Name | Age | Loan Amount | Expected Decision |
|----------|------|-----|-------------|-------------------|
| Happy Path | John Doe | 30 | 45,000 | Approved |
| Senior | Senior Applicant | 65 | 45,000 | Pending |
| High Amount | Big Borrower | 35 | 1,500,000 | Pending |
| Boundary Age | Just Adult | 18 | 30,000 | Approved |
| Underage | Too Young | 17 | 30,000 | Rejected |

---

## 4. Test Coverage

### 4.1 Critical Path Tests (Must Pass)

1. **Complete Happy Path**
   - Start → Phone → OTP → Personal Details → Loan Details → Approved Decision

2. **Authentication**
   - Valid phone number → OTP sent
   - Correct OTP → Session created

3. **Core Validations**
   - Age >= 18 years
   - Loan amount: 1,000 - 5,000,000
   - Required fields not empty

### 4.2 Validation Tests (High Priority)

#### Personal Details
- [x] Full name minimum 2 characters
- [x] National ID required
- [x] Email format validation (optional)
- [x] Date of birth format validation
- [x] Age calculation and 18+ enforcement
- [x] Boundary testing: exactly 18 years old

#### Loan Details
- [x] Loan amount minimum boundary (1,000)
- [x] Loan amount maximum boundary (5,000,000)
- [x] Loan amount zero/negative rejection
- [x] Loan term validation
- [x] Purpose required

#### Authentication
- [x] Phone number format validation
- [x] Various valid phone formats
- [x] OTP verification success/failure
- [x] Session token generation

### 4.3 Business Logic Tests

- [x] Small loan + young adult (25-60) → Approved
- [x] Large loan (>= 1M) → Pending
- [x] Senior citizen (>= 60) → Pending
- [x] Decision persistence after refresh

### 4.4 Edge Cases & Bug Tests

- [x] **BUG**: Duplicate submission prevention incomplete (app.py:156)
- [x] **BUG**: National ID uniqueness not enforced
- [x] **BUG**: Default loan term different from what's displayed on the UI
- [x] **MISMATCH**: Loan term spec vs implementation (months vs days)

---

## 5. Test Automation Architecture

### 5.1 UI Tests Structure

```
tests/ui/
├── playwright.config.ts      # Playwright configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies
├── page-objects/             # Page Object Models
│   ├── LoginPage.ts
│   ├── PhoneEntryPage.ts
│   ├── OTPPage.ts
│   ├── PersonalDetailsPage.ts
│   ├── LoanDetailsPage.ts
│   └── DecisionPage.ts
└── tests/                    # Test specifications
    ├── loan-application-flow.spec.ts
    ├── authentication.spec.ts
    ├── validation.spec.ts
    └── loan-validation.spec.ts
```

**Design Patterns**:
- **Page Object Model**: Encapsulates page interactions, improves maintainability
- **Separation of Concerns**: Locators in POMs, assertions in tests
- **Descriptive Naming**: Test names describe expected behavior
- **Test Independence**: Each test clears session storage

### 5.2 API Tests Structure

```
tests/api/
├── conftest.py               # Fixtures and test configuration
├── requirements.txt          # Python dependencies
└── test_app.py               # Application submission tests
```

**Design Patterns**:
- **Fixtures**: Reusable authenticated sessions, test data
- **Test Classes**: Group related tests logically
- **Unique Data Generation**: Avoid test interference
- **Clear Assertions**: Single responsibility per test

---

## 6. Test Execution

### 6.1 Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for UI tests)
- Python 3.11+ (for API tests)
- Application running on:
  - Frontend: `http://localhost:5173`
  - Backend: `http://localhost:5001`

### 6.2 Execution Commands

#### Start Application
```bash
cd quality-assurance
docker-compose up -d
```

#### Run API Tests
```bash
cd tests/api
pip install -r requirements.txt
pytest -v
pytest --cov  # With coverage report
```

#### Run UI Tests
```bash
cd tests/ui
npm install
npx playwright install chromium
npx playwright test
npx playwright show-report
```

### 6.3 CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests
- Scheduled nightly runs (recommended)

See `.github/workflows/test.yml` for configuration.

---

## 7. Identified Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| No duplicate application check by national ID | Medium | High | Test documents behavior, recommend uniqueness constraint |
| Spec/code mismatch on loan terms | Low | High | Clarify requirements with stakeholders |
| In-memory storage loses data on restart | Low | High | Document in test setup, use fresh containers |
| Session tokens never expire | Medium | Medium | Out of scope for assessment, note for future |
| No rate limiting on OTP requests | Medium | Low | Out of scope, recommend for production |

---

## 8. Test Prioritization

Given the 3 hour time constraint, tests are prioritized:

### Priority 1 (Critical - Must Complete)
- Complete happy path flow (UI + API)
- Authentication tests
- Core validation tests (age, amount, required fields)
- Health check

### Priority 2 (High - Should Complete)
- Boundary testing (age 18, amounts at min/max)
- Business logic tests (approval rules)
- Error handling and validation messages
- Bug documentation tests

### Priority 3 (Nice to Have - If Time Permits)
- Edge case exploration
- Multiple phone format validation
- Session management edge cases
- Performance baseline measurements

---

## 9. Assumptions & Constraints

### Assumptions
- OTP is hardcoded to `0000` (per SPEC.md section 3.1)
- Application uses in-memory storage (data resets on restart)
- First-time applicants only (no repeat loans)
- Single currency (local currency, no conversion)
- Simplified authentication (no MFA, no password)

### Constraints
- Time-boxed to 2-3 hours
- Limited to Chromium browser for UI tests
- Single test worker to avoid race conditions
- Application is tested as it is still in development (bugs expected)

---

## 10. Test Deliverables

- [x] Playwright UI test suite with Page Object Models
- [x] pytest API test suite with fixtures
- [x] Test plan document (this file)
- [x] Test execution, Bugs and gaps documentation README
- [x] CI/CD workflow configuration
- [ ] Test execution report (generated on run)
- [ ] Coverage report (generated on run)

---

## 11. Exit Criteria

### Must Meet
- All Priority 1 tests implemented and passing
- Critical path (happy path) works end-to-end
- At least 3 bugs/gaps documented.
- Test suite runs successfully in CI/CD

### Should Meet
- 85%+ code coverage on API endpoints
- All validation tests implemented
- Boundary tests for key fields
- Test documentation complete

### Nice to Have
- 90%+ test coverage
- All edge cases tested
- Performance benchmarks established
- Cross-browser tests configured
- Add reproduction steps for bugs (screenshots,screen recordings , logs)

---

## 12. Future Recommendations

### Short-term (Next Sprint)
1. Implement national ID uniqueness check
2. Clarify loan term specification (months vs days)
3. Add duplicate submission prevention by national ID
4. Add session token expiration

### Medium-term (1-2 months)
1. Add cross-browser testing (Firefox, Safari)
2. Implement visual regression testing
3. Add performance monitoring
4. Expand test data variety
5. Add API rate limiting

### Long-term (3+ months)
1. Security audit and penetration testing
2. Load and stress testing
3. Accessibility compliance testing
4. Mobile responsive testing
5. Production monitoring and alerting

---

**Document Version History**

| Version | Date | Author               | Changes |
|---------|------|----------------------|---------|
| 1.0 | 2026-01-14 | Christian Iradukunda | Initial test plan created |

