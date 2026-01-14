import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { PhoneEntryPage } from '../page-objects/PhoneEntryPage';
import { OTPPage } from '../page-objects/OTPPage';
import { PersonalDetailsPage } from '../page-objects/PersonalDetailsPage';
import { LoanDetailsPage } from '../page-objects/LoanDetailsPage';

test.describe('Loan Details Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to loan details page
    const loginPage = new LoginPage(page);
    const phoneEntryPage = new PhoneEntryPage(page);
    const otpPage = new OTPPage(page);
    const personalDetailsPage = new PersonalDetailsPage(page);

    // Use unique phone number to avoid backend conflicts
    const uniquePhone = `+2567${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;

    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.goto('/');

    await loginPage.startApplication();
    await phoneEntryPage.requestOTP(uniquePhone);

    // Wait for OTP page to load
    await expect(page.getByRole('heading', { name: /verify otp/i })).toBeVisible({ timeout: 5000 });

    await otpPage.verifyOTP('0000');

    // Wait for Personal Details page to load
    await expect(page.getByRole('heading', { name: /personal details/i })).toBeVisible({ timeout: 10000 });

    await personalDetailsPage.fillPersonalDetails({
      fullName: 'Test User',
      nationalId: 'CM99999999',
      dateOfBirth: '1990-01-01'
    });
    await personalDetailsPage.submit();

    // Wait for Loan Details page to load
    await expect(page.getByRole('heading', { name: /loan details/i })).toBeVisible({ timeout: 10000 });
  });

  test('should reject loan amount below minimum (1,000)', async ({ page }) => {
    const loanDetailsPage = new LoanDetailsPage(page);

    await loanDetailsPage.fillLoanDetails({
      amount: 999,
      term: '30',
      purpose: 'Business needs'
    });
    await loanDetailsPage.submit();

    // Should show validation error
    await expect(loanDetailsPage.errorMessages).toBeVisible({ timeout: 3000 });
  });

  test('should accept loan amount at minimum boundary (1,000)', async ({ page }) => {
    const loanDetailsPage = new LoanDetailsPage(page);

    await loanDetailsPage.fillLoanDetails({
      amount: 1000,
      term: '30',
      purpose: 'Business needs'
    });
    await loanDetailsPage.submit();

    // Should proceed to decision page
    await expect(page.locator('.status-badge')).toBeVisible({ timeout: 10000 });
  });

  test('should reject loan amount above maximum (5,000,000)', async ({ page }) => {
    const loanDetailsPage = new LoanDetailsPage(page);

    await loanDetailsPage.fillLoanDetails({
      amount: 5000001,
      term: '30',
      purpose: 'Large investment'
    });
    await loanDetailsPage.submit();

    // Should show validation error
    await expect(loanDetailsPage.errorMessages).toBeVisible({ timeout: 3000 });
  });

  test('should accept loan amount at maximum boundary (5,000,000)', async ({ page }) => {
    const loanDetailsPage = new LoanDetailsPage(page);

    await loanDetailsPage.fillLoanDetails({
      amount: 5000000,
      term: '60',
      purpose: 'Large business expansion'
    });
    await loanDetailsPage.submit();

    // Should proceed to decision page
    await expect(page.locator('.status-badge')).toBeVisible({ timeout: 10000 });
  });

  test('should reject zero or negative loan amount', async ({ page }) => {
    const loanDetailsPage = new LoanDetailsPage(page);

    await loanDetailsPage.loanAmountInput.fill('0');
    await loanDetailsPage.loanTermSelect.selectOption('30');
    await loanDetailsPage.purposeInput.fill('Testing');
    await loanDetailsPage.submit();

    // Should show validation error
    await expect(loanDetailsPage.errorMessages).toBeVisible({ timeout: 3000 });
  });

  test('SPEC MISMATCH: Test allowed loan terms', async ({ page }) => {
    const loanDetailsPage = new LoanDetailsPage(page);

    // According to SPEC.md section 6.3, terms should be 3, 6, 12, 18, 24, 36 months
    // But app.py line 16 shows ALLOWED_LOAN_TERMS = [15, 30, 45, 60] (days, not months)

    await loanDetailsPage.fillLoanDetails({
      amount: 50000,
      term: '30', // This should work based on code
      purpose: 'Business needs'
    });
    await loanDetailsPage.submit();

    // Document the discrepancy - should verify what terms are actually available
    await expect(page.locator('.status-badge')).toBeVisible({ timeout: 10000 });
  });

  test('should require purpose field', async ({ page }) => {
    const loanDetailsPage = new LoanDetailsPage(page);

    await loanDetailsPage.loanAmountInput.fill('50000');
    await loanDetailsPage.loanTermSelect.selectOption('30');
    // Skip purpose field
    await loanDetailsPage.submit();

    // Should show validation error or prevent submission
    const hasError = await loanDetailsPage.errorMessages.isVisible().catch(() => false);
    const stillOnPage = await loanDetailsPage.loanAmountInput.isVisible();

    expect(hasError || stillOnPage).toBeTruthy();
  });

  test('should accept valid loan details and submit', async ({ page }) => {
    const loanDetailsPage = new LoanDetailsPage(page);

    await loanDetailsPage.fillLoanDetails({
      amount: 250000,
      term: '45',
      purpose: 'Working capital for seasonal business expansion'
    });
    await loanDetailsPage.submit();

    // Should show decision
    await expect(page.locator('.status-badge')).toBeVisible({ timeout: 10000 });
  });
});

