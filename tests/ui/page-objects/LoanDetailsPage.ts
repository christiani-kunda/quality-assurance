import { Page, Locator } from '@playwright/test';

export class LoanDetailsPage {
  readonly page: Page;
  readonly loanAmountInput: Locator;
  readonly loanTermSelect: Locator;
  readonly purposeInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loanAmountInput = page.locator('input#loanAmount');
    this.loanTermSelect = page.locator('select#loanTerm');
    this.purposeInput = page.locator('textarea#purpose');
    this.submitButton = page.getByRole('button', { name: /submit|apply/i });
    this.errorMessages = page.locator('.error-message, .field-error, [role="alert"]');
  }

  async fillLoanDetails(data: {
    amount: string | number;
    term: string | number;
    purpose: string;
  }) {
    await this.loanAmountInput.fill(data.amount.toString());
    await this.loanTermSelect.selectOption(data.term.toString());
    await this.purposeInput.fill(data.purpose);
  }

  async submit() {
    await this.submitButton.click();
  }
}

