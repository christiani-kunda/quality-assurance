import { Page, Locator } from '@playwright/test';

export class DecisionPage {
  readonly page: Page;
  readonly statusBadge: Locator;
  readonly statusMessage: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.statusBadge = page.locator('.status-badge');
    this.statusMessage = page.locator('.decision-message');
    this.logoutButton = page.getByRole('button', { name: /logout|sign out/i });
  }

  async getStatus(): Promise<string> {
    const text = await this.statusBadge.textContent();
    return text?.toLowerCase() || '';
  }

  async isApproved(): Promise<boolean> {
    const status = await this.getStatus();
    return status.includes('approved');
  }

  async isRejected(): Promise<boolean> {
    const status = await this.getStatus();
    return status.includes('rejected');
  }

  async isPending(): Promise<boolean> {
    const status = await this.getStatus();
    return status.includes('pending');
  }

  async logout() {
    await this.logoutButton.click();
  }
}

