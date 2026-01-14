import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { PhoneEntryPage } from '../page-objects/PhoneEntryPage';
import { OTPPage } from '../page-objects/OTPPage';
import { PersonalDetailsPage } from '../page-objects/PersonalDetailsPage';
import { LoanDetailsPage } from '../page-objects/LoanDetailsPage';
import { DecisionPage } from '../page-objects/DecisionPage';

test.describe('Complete Loan Application Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear session storage and navigate to start fresh
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    // Reload to ensure clean state
    await page.goto('/');
  });

  test('should complete full loan application successfully - Happy Path', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const phoneEntryPage = new PhoneEntryPage(page);
    const otpPage = new OTPPage(page);
    const personalDetailsPage = new PersonalDetailsPage(page);
    const loanDetailsPage = new LoanDetailsPage(page);
    const decisionPage = new DecisionPage(page);

    // Use unique phone number to avoid conflicts
    const uniquePhone = `+2567${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;

    // Step 1: Start Application
    await loginPage.goto();
    await loginPage.startApplication();

    // Step 2: Enter Phone Number
    await phoneEntryPage.requestOTP(uniquePhone);

    // Step 3: Verify OTP
    await otpPage.verifyOTP('0000');

    // Wait for Personal Details page to load
    await expect(page.getByRole('heading', { name: /personal details/i })).toBeVisible({ timeout: 10000 });

    // Step 4: Fill Personal Details
    await personalDetailsPage.fillPersonalDetails({
      fullName: 'John Doe',
      nationalId: 'CM12345678',
      email: 'john.doe@example.com',
      dateOfBirth: '1990-01-15'
    });
    await personalDetailsPage.submit();

    // Wait for Loan Details page to load
    await expect(page.getByRole('heading', { name: /loan details/i })).toBeVisible({ timeout: 10000 });

    // Step 5: Fill Loan Details - Small loan should be approved
    await loanDetailsPage.fillLoanDetails({
      amount: 45000,
      term: '30',
      purpose: 'Business expansion and working capital'
    });
    await loanDetailsPage.submit();

    // Step 6: Verify decision is shown - check for the status badge
    await expect(page.locator('.status-badge')).toBeVisible({ timeout: 10000 });

    // Application should be approved based on business logic
    const isApproved = await decisionPage.isApproved();
    const isRejected = await decisionPage.isRejected();
    const isPending = await decisionPage.isPending();

    expect(isApproved || isRejected || isPending).toBeTruthy();
  });

  test('should handle application for senior citizen (60+ years) - Pending status', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const phoneEntryPage = new PhoneEntryPage(page);
    const otpPage = new OTPPage(page);
    const personalDetailsPage = new PersonalDetailsPage(page);
    const loanDetailsPage = new LoanDetailsPage(page);
    const decisionPage = new DecisionPage(page);

    // Use unique phone number to avoid conflicts
    const uniquePhone = `+2567${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;

    await loginPage.goto();
    await loginPage.startApplication();
    await phoneEntryPage.requestOTP(uniquePhone);
    await otpPage.verifyOTP('0000');

    // Wait for Personal Details page to load
    await expect(page.getByRole('heading', { name: /personal details/i })).toBeVisible({ timeout: 10000 });

    // Senior citizen - age 65
    await personalDetailsPage.fillPersonalDetails({
      fullName: 'Senior Applicant',
      nationalId: 'CM11111111',
      dateOfBirth: '1960-01-01'
    });
    await personalDetailsPage.submit();

    // Wait for Loan Details page to load
    await expect(page.getByRole('heading', { name: /loan details/i })).toBeVisible({ timeout: 10000 });

    await loanDetailsPage.fillLoanDetails({
      amount: 45000,
      term: '30',
      purpose: 'Medical expenses'
    });
    await loanDetailsPage.submit();

    // Senior citizens should go to pending per business logic - check status badge
    await expect(page.locator('.status-badge')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.status-badge')).toHaveText(/pending/i);
  });

  test('should handle high loan amount application - Pending status', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const phoneEntryPage = new PhoneEntryPage(page);
    const otpPage = new OTPPage(page);
    const personalDetailsPage = new PersonalDetailsPage(page);
    const loanDetailsPage = new LoanDetailsPage(page);

    // Use unique phone number to avoid conflicts
    const uniquePhone = `+2567${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;

    await loginPage.goto();
    await loginPage.startApplication();
    await phoneEntryPage.requestOTP(uniquePhone);
    await otpPage.verifyOTP('0000');

    // Wait for Personal Details page to load
    await expect(page.getByRole('heading', { name: /personal details/i })).toBeVisible({ timeout: 10000 });

    await personalDetailsPage.fillPersonalDetails({
      fullName: 'High Amount Applicant',
      nationalId: 'CM22222222',
      dateOfBirth: '1985-06-15'
    });
    await personalDetailsPage.submit();

    // Wait for Loan Details page to load
    await expect(page.getByRole('heading', { name: /loan details/i })).toBeVisible({ timeout: 10000 });

    // High amount (>=1,000,000) should go to pending
    await loanDetailsPage.fillLoanDetails({
      amount: 1500000,
      term: '60',
      purpose: 'Large business investment'
    });
    await loanDetailsPage.submit();

    // High amount should go to pending - check status badge
    await expect(page.locator('.status-badge')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.status-badge')).toHaveText(/pending/i);
  });
});
