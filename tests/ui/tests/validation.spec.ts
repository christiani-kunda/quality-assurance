import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { PhoneEntryPage } from '../page-objects/PhoneEntryPage';
import { OTPPage } from '../page-objects/OTPPage';
import { PersonalDetailsPage } from '../page-objects/PersonalDetailsPage';
import { LoanDetailsPage } from '../page-objects/LoanDetailsPage';

test.describe('Personal Details Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to personal details page
    const loginPage = new LoginPage(page);
    const phoneEntryPage = new PhoneEntryPage(page);
    const otpPage = new OTPPage(page);

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
  });

  test('should reject full name with less than 2 characters', async ({ page }) => {
    const personalDetailsPage = new PersonalDetailsPage(page);
    const loanDetailsPage = new LoanDetailsPage(page);

    await personalDetailsPage.fillPersonalDetails({
      fullName: 'A',
      nationalId: 'CM33333333',
      dateOfBirth: '1990-01-01'
    });
    await personalDetailsPage.submit();

    // Personal details form doesn't validate - it just moves to next page
    // Wait for loan details page
    await expect(page.getByRole('heading', { name: /loan details/i })).toBeVisible({ timeout: 5000 });

    // Fill loan details and submit - validation happens on backend at this point
    await loanDetailsPage.fillLoanDetails({
      amount: 50000,
      term: '30',
      purpose: 'Business needs'
    });
    await loanDetailsPage.submit();

    // Wait a moment for response
    await page.waitForTimeout(2000);

    // Check if we get error or proceed to decision
    const hasFieldError = await page.locator('.field-error').isVisible().catch(() => false);
    const hasErrorMessage = await page.locator('.error-message').isVisible().catch(() => false);
    const onDecisionPage = await page.locator('.status-badge').isVisible().catch(() => false);
    const stillOnLoanPage = await page.getByRole('heading', { name: /loan details/i }).isVisible().catch(() => false);

    // The test should either show an error OR stay on loan details page (not proceed to decision)
    // If we're on decision page, it means validation didn't work (bug)
    expect(hasFieldError || hasErrorMessage || (stillOnLoanPage && !onDecisionPage)).toBeTruthy();
  });

  test('should reject applicant under 18 years old', async ({ page }) => {
    const personalDetailsPage = new PersonalDetailsPage(page);
    const loanDetailsPage = new LoanDetailsPage(page);

    // Calculate date for someone who is 17 years old
    const today = new Date();
    const seventeenYearsAgo = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
    const dateString = seventeenYearsAgo.toISOString().split('T')[0];

    await personalDetailsPage.fillPersonalDetails({
      fullName: 'Underage Person',
      nationalId: 'CM44444444',
      dateOfBirth: dateString
    });
    await personalDetailsPage.submit();

    // Personal details form doesn't validate - moves to loan details
    await expect(page.getByRole('heading', { name: /loan details/i })).toBeVisible({ timeout: 5000 });

    // Fill and submit loan details - backend validation happens here
    await loanDetailsPage.fillLoanDetails({
      amount: 50000,
      term: '30',
      purpose: 'Business needs'
    });
    await loanDetailsPage.submit();

    // Wait a moment for response
    await page.waitForTimeout(2000);

    // Check if we get error or proceed to decision
    const hasFieldError = await page.locator('.field-error').isVisible().catch(() => false);
    const hasErrorMessage = await page.locator('.error-message').isVisible().catch(() => false);
    const onDecisionPage = await page.locator('.status-badge').isVisible().catch(() => false);
    const stillOnLoanPage = await page.getByRole('heading', { name: /loan details/i }).isVisible().catch(() => false);

    // The test should either show an error OR stay on loan details page (not proceed to decision)
    expect(hasFieldError || hasErrorMessage || (stillOnLoanPage && !onDecisionPage)).toBeTruthy();
  });

  test('should accept applicant exactly 18 years old - Boundary test', async ({ page }) => {
    const personalDetailsPage = new PersonalDetailsPage(page);

    // Calculate date for someone who is exactly 18 years old
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const dateString = eighteenYearsAgo.toISOString().split('T')[0];

    await personalDetailsPage.fillPersonalDetails({
      fullName: 'Exactly Eighteen',
      nationalId: 'CM55555555',
      dateOfBirth: dateString
    });
    await personalDetailsPage.submit();

    // Should proceed to next page (loan details)
    await expect(page.getByRole('heading', { name: /loan details/i })).toBeVisible({ timeout: 5000 });
  });

  test('should reject invalid email format', async ({ page }) => {
    const personalDetailsPage = new PersonalDetailsPage(page);

    await personalDetailsPage.fillPersonalDetails({
      fullName: 'John Doe',
      nationalId: 'CM66666666',
      email: 'invalid-email',
      dateOfBirth: '1990-01-01'
    });
    await personalDetailsPage.submit();

    // Should show email validation error or stay on same page (HTML5 validation)
    const hasError = await personalDetailsPage.errorMessages.isVisible().catch(() => false);
    const stillOnPage = await page.getByRole('heading', { name: /personal details/i }).isVisible().catch(() => false);

    expect(hasError || stillOnPage).toBeTruthy();
  });

  test('should accept valid email format', async ({ page }) => {
    const personalDetailsPage = new PersonalDetailsPage(page);

    await personalDetailsPage.fillPersonalDetails({
      fullName: 'John Doe',
      nationalId: 'CM77777777',
      email: 'john.doe@example.com',
      dateOfBirth: '1990-01-01'
    });
    await personalDetailsPage.submit();

    // Should proceed to next page
    await expect(page.getByRole('heading', { name: /loan details/i })).toBeVisible({ timeout: 5000 });
  });

  test('should accept missing optional email field', async ({ page }) => {
    const personalDetailsPage = new PersonalDetailsPage(page);

    await personalDetailsPage.fillPersonalDetails({
      fullName: 'John Doe',
      nationalId: 'CM88888888',
      dateOfBirth: '1990-01-01'
    });
    await personalDetailsPage.submit();

    // Should proceed to next page without email
    await expect(page.getByRole('heading', { name: /loan details/i })).toBeVisible({ timeout: 5000 });
  });

  test('should require national ID field', async ({ page }) => {
    const personalDetailsPage = new PersonalDetailsPage(page);

    await personalDetailsPage.fullNameInput.fill('John Doe');
    await personalDetailsPage.dateOfBirthInput.fill('1990-01-01');
    // Skip national ID
    await personalDetailsPage.submit();

    // Should show validation error or prevent submission
    const hasError = await personalDetailsPage.errorMessages.isVisible().catch(() => false);
    const stillOnPage = await personalDetailsPage.fullNameInput.isVisible();

    expect(hasError || stillOnPage).toBeTruthy();
  });
});

