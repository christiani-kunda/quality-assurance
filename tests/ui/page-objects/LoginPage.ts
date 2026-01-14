import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly startButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startButton = page.getByRole('button', { name: /start application/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async startApplication() {
    await this.startButton.click();
  }
}
