import { Page, Locator } from '@playwright/test';

export class PersonalDetailsPage {
  readonly page: Page;
  readonly fullNameInput: Locator;
  readonly nationalIdInput: Locator;
  readonly emailInput: Locator;
  readonly dateOfBirthInput: Locator;
  readonly nextButton: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fullNameInput = page.locator('input#fullName');
    this.nationalIdInput = page.locator('input#nationalId');
    this.emailInput = page.locator('input#email');
    this.dateOfBirthInput = page.locator('input#dob');
    this.nextButton = page.getByRole('button', { name: /next|continue/i });
    this.errorMessages = page.locator('.error-message, .field-error, [role="alert"]');
  }

  async fillPersonalDetails(data: {
    fullName: string;
    nationalId: string;
    email?: string;
    dateOfBirth: string;
  }) {
    await this.fullNameInput.fill(data.fullName);
    await this.nationalIdInput.fill(data.nationalId);
    if (data.email) {
      await this.emailInput.fill(data.email);
    }
    await this.dateOfBirthInput.fill(data.dateOfBirth);
  }

  async submit() {
    await this.nextButton.click();
  }
}

