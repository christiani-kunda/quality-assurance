# Test Suite Documentation

## 📋 Overview

This directory contains comprehensive automated tests for the First-Time Loan Application System. The test suite covers both API-level and UI-level testing to ensure quality and reliability.

---

## 🏗️ Architecture

```
tests/
├── api/                         # API/Backend Tests (pytest)
│   ├── conftest.py              # Shared fixtures and configuration
│   ├── requirements.txt         # Python dependencies
│   └── test_app.py              # Application submission tests
│
└── ui/                          # UI/Frontend Tests (Playwright)
    ├── playwright.config.ts     # Playwright configuration
    ├── tsconfig.json            # TypeScript configuration
    ├── package.json             # Node dependencies
    ├── page-objects/            # Page Object Models
    │   ├── LoginPage.ts
    │   ├── PhoneEntryPage.ts
    │   ├── OTPPage.ts
    │   ├── PersonalDetailsPage.ts
    │   ├── LoanDetailsPage.ts
    │   └── DecisionPage.ts
    └── tests/                   # Test specifications
        ├── loan-application-flow.spec.ts
        ├── authentication.spec.ts
        ├── validation.spec.ts
        └── loan-validation.spec.ts
```

---

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose**: For running the application
- **Python 3.11+**: For API tests
- **Node.js 18+**: For UI tests
- **Modern Browser**: Chrome/Chromium

### 1. Start the Application

```bash
cd quality-assurance
docker-compose up -d
```

Wait for services to be ready:
- Frontend: http://localhost:5173
- Backend: http://localhost:5001

Verify services are running:
```bash
curl http://localhost:5001/api/health
```

### 2. Run API Tests

```bash
cd tests/api

# Install dependencies
pip install -r requirements.txt

# Run all tests
pytest -v

# Run with coverage
pytest --cov --cov-report=html

# Run specific test file
pytest test_auth.py -v

# Run specific test
pytest test_app.py::TestApp::test_verify_otp_with_correct_code -v
```

### 3. Run UI Tests

```bash
cd tests/ui

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Run all tests
npx playwright test

# Run tests with UI mode (interactive)
npx playwright test --ui

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/authentication.spec.ts

# View test report
npx playwright show-report
```

---

## 📊 Test Coverage

### API Tests (60% of test effort)

| Component | Tests         | Coverage  |
|-----------|---------------|-----------|
| Application | 40+ tests     | 90+%      |
| **Total** | **40+ tests** | **~90+%** |

**Key Test Areas**:
- ✅ OTP request and verification
- ✅ Session management
- ✅ Input validation (age, amount, format)
- ✅ Boundary testing
- ✅ Business logic (approval rules)
- ✅ Error handling
- ✅ Bug documentation tests

### UI Tests (30% of test effort)

| Component | Tests | Coverage |
|-----------|-------|----------|
| Complete Flow | 3 tests | Happy path, edge cases |
| Authentication | 6 tests | Phone, OTP validation |
| Personal Details | 7 tests | Field validation |
| Loan Details | 8 tests | Amount, term validation |
| **Total** | **24+ tests** | **~70%** |

**Key Test Areas**:
- ✅ End-to-end user flows
- ✅ Multi-step form navigation
- ✅ Form validation messages
- ✅ Decision page rendering
- ✅ Session persistence
- ✅ Error state handling

---

## 🎯 Test Strategy

### Test Pyramid

```
       /\
      /  \     Manual Exploratory (10%)
     /____\    
    /      \   UI Automated (30%)
   /________\  
  /          \ API Automated (60%)
 /____________\
```

### Why This Approach?

1. **API-First**: Faster execution, catches issues early
2. **UI for Integration**: Tests complete user experience
3. **Manual for Discovery**: Human insight on usability

---

## 🧪 Test Data

### Test Phone Numbers
- Pattern: `+25670xxxxxxx` or `07xxxxxxxx`
- Examples: `+256700000001`, `0700000002`
- Range: `0700000001` through `0700000050`
- Generated uniquely per test in order to test all scenarios
- 
### Test National IDs
- Pattern: `CM` + 8 alphanumeric characters
- Examples: `CM12345678`, `CM87654321`
- Generated uniquely per test to avoid conflicts

### Test OTP
- **Hardcoded**: `0000` (per specification)
- Used for all OTP verification in tests

### Test Users

| Scenario | Age | Loan Amount | Expected Result |
|----------|-----|-------------|-----------------|
| Happy Path | 30 | 45,000 | Approved |
| Senior Citizen | 65 | 45,000 | Pending |
| High Amount | 35 | 1,500,000 | Pending |
| Boundary Age | 18 | 30,000 | Approved |
| Underage | 17 | 30,000 | Validation Error |

---

## 🐛 Known Issues

Tests document the following bugs:

#### 1. **Specs talks about rejected state, however it is always pending or approved** (BUG-002)
-  Submit application for phone `+256700000001`
- If rejected, submit another application with same phone
- Second submission succeeds (should be prevented)

#### 2. **National ID Uniqueness is not enforced** (BUG-003)
#### Description
Multiple users with different phone numbers can submit applications using the same National ID. This violates the uniqueness constraint implied by "National ID" as a government identifier.

#### Expected Behavior
- National ID should be unique across all applications
- Reject submission if National ID already exists in system
- Clear error message: "National ID already registered"

#### Actual Behavior
- No uniqueness check performed
- Multiple applications can share the same National ID

#### 3. **Loan term default value different from what's displayed** (BUG-4)
-  The default loan term value is 12 while what's displayed is 15 days
-  Secondly, to set 15 days requires to set another one and select it again


## Specification Gaps & Inconsistencies

#### 1. **Loan Term Unit Mismatch** (GAP-001)
#### Description
**SPEC.md Section 6.3** states:
> "Loan Term: Fixed set of allowed terms"
> Table shows: 3, 6, 12, 18, 24, 36 **months**

**app.py Line 16** defines:
```python
ALLOWED_LOAN_TERMS = [15, 30, 45, 60]  # in days
```

#### Issue
- Specification says MONTHS (3, 6, 12, 18, 24, 36)
- Code implements DAYS (15, 30, 45, 60)
- Units are completely different
- Values don't align (30 days ≠ 1 month)

#### Impact
- Requirements ambiguity
- Frontend may display wrong units
- Business logic misalignment
- User confusion about loan duration

#### Questions for Stakeholders
1. Are loan terms in days or months?
2. What are the exact allowed values?
3. Should terms be configurable or hardcoded?
4. Does this match production business rules?

#### Recommendation
- **Immediate**: Clarify with product owner
- **Short-term**: Update spec OR code to align
- **Document**: Choose days vs months consistently
- **Test**: Verify frontend displays correct unit

#### 2. **Session Token Expiration Not Defined** (GAP-002)

**Severity**: Medium  
**Type**: Missing Specification

#### Description
- Sessions are created but never expire
- No timeout mechanism implemented
- No refresh token flow

#### Questions
- Should sessions expire after time period?
- Should sessions expire after inactivity?
- Should users be logged out after application submission?

#### Impact
- Security: Long-lived tokens are risk
- UX: Users stay logged in indefinitely

#### Recommendation
- Define session lifetime (e.g., 30 minutes)
- Implement token expiration
- Add refresh mechanism if needed

---

## 📈 CI/CD Integration

Tests run automatically in GitHub Actions on:
- Push to `main` or `develop` branches
- Pull requests
- Manual workflow dispatch

### Workflow Files
- `.github/workflows/test.yml` - Main test workflow

### Artifacts
- Playwright HTML report
- Pytest coverage report
- Test result summaries

---

## 🔧 Advanced Usage

### API Tests

#### Run with pytest options
```bash
# Run with detailed output
pytest -vv

# Stop on first failure
pytest -x

# Run only tests matching pattern
pytest -k "test_app"

# Run with coverage and generate XML report
pytest --cov --cov-report=xml

# Show slowest tests
pytest --durations=5
```

#### Debug a failing test
```bash
# Run with print statements visible
pytest -s test_app.py

# Drop into debugger on failure
pytest --pdb test_app.py
```

### UI Tests

#### Run with Playwright options
```bash
# Run specific browser
npx playwright test --project=chromium

# Run tests with trace
npx playwright test --trace on

# Debug mode (step through tests)
npx playwright test --debug

# Run with specific tag
npx playwright test --grep "happy path"

# Run without parallelization
npx playwright test --workers=1

# Update screenshots (if using visual comparison)
npx playwright test --update-snapshots
```

#### View test traces
```bash
# After test run, open trace viewer
npx playwright show-trace trace.zip
```

---

## 🏃 Performance

### API Tests
- **Execution Time**: ~2 seconds
- **Tests**: 40+ tests
- **Parallel**: No (sequential to avoid data conflicts)

### UI Tests
- **Execution Time**: ~1 minutes
- **Tests**: 24 tests
- **Parallel**: No (single worker mode)
- **Browser**: Chromium only

---

## 🔍 Debugging Failed Tests

### API Test Failures

1. **Check service is running**
   ```bash
   curl http://localhost:5001/api/health
   ```

2. **Check test output**
   ```bash
   pytest -vv --tb=short
   ```

3. **Inspect test data**
   - Tests use unique phone numbers to avoid conflicts
   - Check `conftest.py` for fixture definitions

4. **Clear application state**
   ```bash
   docker-compose restart
   ```

### UI Test Failures

1. **Check services are accessible**
   ```bash
   curl http://localhost:5173
   curl http://localhost:5001/api/health
   ```

2. **View test artifacts**
   - Screenshots: `tests/ui/test-results/`
   - Videos: `tests/ui/test-results/`
   - Trace: `tests/ui/test-results/`

3. **Run in headed mode**
   ```bash
   npx playwright test --headed --debug
   ```

4. **Check browser logs**
   - Playwright captures console logs automatically
   - View in HTML report

---

## 🧹 Cleanup

### Reset test environment
```bash
# Stop and remove containers
docker-compose down

# Remove volumes (full reset)
docker-compose down -v

# Start fresh
docker-compose up -d
```

### Clean test artifacts
```bash
# API test artifacts
cd tests/api
rm -rf .pytest_cache htmlcov .coverage

# UI test artifacts
cd tests/ui
rm -rf test-results playwright-report node_modules
```

---

## 📚 Additional Resources

- **Test Plan**: `TEST_PLAN.md` - Comprehensive testing strategy
- **Application Spec**: `SPEC.md` - Functional requirements
- **Quick Start**: `QUICK_START.md` - Application setup

---

## 🤝 Contributing

### Adding New Tests

#### API Test
```python
# tests/api/test_new_feature.py
class TestNewFeature:
    def test_scenario_name(self, authenticated_session, valid_application_data):
        session, phone = authenticated_session
        # Your test logic here
        response = session.post(f"{BASE_URL}/api/endpoint", json=data)
        assert response.status_code == 200
```

#### UI Test
```typescript
// tests/ui/tests/new-feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('New Feature Tests', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    // Your test logic here
    await expect(page.locator('.element')).toBeVisible();
  });
});
```

### Best Practices

1. **One assertion per test** (when possible)
2. **Descriptive test names** describing expected behavior
3. **Clean up after tests** (use fixtures)
4. **Avoid hardcoded waits** (use Playwright auto-waiting)
5. **Use Page Objects** for UI tests (maintainability)
6. **Document bug tests** with clear comments

---

## 📞 Support

For questions or issues:
1. Check this README first
2. Review test output for error messages
3. Check if it is not among known issues
4. Verify services are running correctly

---

## 📝 License

This test suite is part of the Quality Assurance assessment project.

---

**Last Updated**: January 14, 2026  
**Version**: 1.0.0  
**Status**: Active Development

