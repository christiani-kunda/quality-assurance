import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { PhoneEntryPage } from '../page-objects/PhoneEntryPage';
import { OTPPage } from '../page-objects/OTPPage';

test.describe('Authentication Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
  });

  test('should successfully request OTP with valid phone number', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const phoneEntryPage = new PhoneEntryPage(page);

    await loginPage.goto();
    await loginPage.startApplication();
    await phoneEntryPage.requestOTP('+256700000001');

    // Should navigate to OTP page - check for the heading specifically
    await expect(page.getByRole('heading', { name: /verify otp/i })).toBeVisible({ timeout: 5000 });
  });

  test('should reject invalid phone number format', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const phoneEntryPage = new PhoneEntryPage(page);

    await loginPage.goto();
    await loginPage.startApplication();
    await phoneEntryPage.enterPhoneNumber('invalid');
    await phoneEntryPage.submit();

    // Should show error message
    await expect(phoneEntryPage.errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('should verify OTP successfully with correct code', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const phoneEntryPage = new PhoneEntryPage(page);
    const otpPage = new OTPPage(page);

    await loginPage.goto();
    await loginPage.startApplication();
    await phoneEntryPage.requestOTP('+256700000004');
    await otpPage.verifyOTP('0000');

    // Should navigate to personal details page
    await expect(page.getByRole('heading', { name: /personal details/i })).toBeVisible({ timeout: 5000 });
  });

  test('should reject incorrect OTP', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const phoneEntryPage = new PhoneEntryPage(page);
    const otpPage = new OTPPage(page);

    await loginPage.goto();
    await loginPage.startApplication();
    await phoneEntryPage.requestOTP('+256700000005');
    await otpPage.enterOTP('9999');
    await otpPage.verify();

    // Should show error message
    await expect(otpPage.errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('BUG TEST: OTP should be case-sensitive', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const phoneEntryPage = new PhoneEntryPage(page);
    const otpPage = new OTPPage(page);

    await loginPage.goto();
    await loginPage.startApplication();
    await phoneEntryPage.requestOTP('+256700000006');

    // This test documents the bug - OTP is case-insensitive in app.py line 103
    await otpPage.verifyOTP('ABCD');

    // This SHOULD fail but might pass due to the bug
    // Expected: error message shown
    // Actual: might succeed due to case-insensitive comparison
  });

  test('should handle multiple phone number formats', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const phoneEntryPage = new PhoneEntryPage(page);

    await loginPage.goto();
    await loginPage.startApplication();

    // Test different valid formats
    const validFormats = [
      '0700000007',
      '+256700000007',
      '256700000007'
    ];

    for (const format of validFormats) {
      await phoneEntryPage.enterPhoneNumber(format);
      await phoneEntryPage.submit();

      // Should either proceed to OTP or show no error
      const hasError = await phoneEntryPage.errorMessage.isVisible().catch(() => false);
      expect(hasError).toBeFalsy();

      // Go back for next iteration
      await page.goto('/');
      await loginPage.startApplication();
    }
  });
});

