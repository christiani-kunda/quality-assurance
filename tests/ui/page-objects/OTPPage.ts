import { Page, Locator } from '@playwright/test';

export class OTPPage {
  readonly page: Page;
  readonly otpInput: Locator;
  readonly verifyButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.otpInput = page.locator('input#otp, input[type="text"][maxlength="4"]');
    this.verifyButton = page.getByRole('button', { name: /verify|confirm|continue|next/i });
    this.errorMessage = page.locator('.error-message, .field-error, [role="alert"]');
  }

  async enterOTP(otp: string) {
    await this.otpInput.fill(otp);
  }

  async verify() {
    await this.verifyButton.click();
  }

  async verifyOTP(otp: string) {
    await this.enterOTP(otp);
    await this.verify();
  }
}

