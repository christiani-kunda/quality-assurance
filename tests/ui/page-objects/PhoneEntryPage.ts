import { Page, Locator } from '@playwright/test';

export class PhoneEntryPage {
  readonly page: Page;
  readonly phoneInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.phoneInput = page.locator('input[type="tel"], input[placeholder*="phone" i]');
    this.submitButton = page.getByRole('button', { name: /send|request|continue|next/i });
    this.errorMessage = page.locator('.error-message, .field-error, [role="alert"]');
  }

  async enterPhoneNumber(phoneNumber: string) {
    await this.phoneInput.fill(phoneNumber);
  }

  async submit() {
    await this.submitButton.click();
  }

  async requestOTP(phoneNumber: string) {
    await this.enterPhoneNumber(phoneNumber);
    await this.submit();
  }
}

