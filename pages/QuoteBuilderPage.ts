import { Page, Locator, expect } from '@playwright/test';

export class QuoteBuilderPage {
  readonly page: Page;
  readonly jobAddress: Locator;
  readonly scopeOfWork: Locator;
  readonly fromTemplateButton: Locator;
  readonly saveAndSendButton: Locator;
  readonly fixBeforeSending: Locator;

  constructor(page: Page) {
    this.page = page;
    this.jobAddress = page.getByRole('textbox', { name: 'Job address' });
    this.scopeOfWork = page.getByRole('textbox', { name: 'Scope of work' });
    this.fromTemplateButton = page.getByRole('button', { name: 'From template' });
    this.saveAndSendButton = page.getByRole('button', { name: /save & send/i });
    this.fixBeforeSending = page.getByText(/fix before sending/i);
  }

  async goto() {
    await this.page.goto('/quotes/new');
  }

  // Selects a customer by visible name. Handles a custom dropdown (click to
  // open, then click the option). If it's a native <select>, the catch falls
  // back to selectOption.
  async selectCustomer(name: string) {
    const combo = this.page.getByRole('combobox').first();
    await combo.click();
    const option = this.page.getByText(name, { exact: false }).last();
    try {
      await option.click({ timeout: 3000 });
    } catch {
      await combo.selectOption({ label: name });
    }
  }

  async fillBasics(address: string, scope: string) {
    await this.jobAddress.fill(address);
    await this.scopeOfWork.fill(scope);
  }

  async addLineItemFromTemplate(name: RegExp) {
    await this.fromTemplateButton.click();
    await this.page.getByRole('button', { name }).first().click();
  }

  async saveAndSend() {
    await this.saveAndSendButton.click();
    // A confirm dialog appears with its own "Save & send" button.
    await this.page.getByRole('button', { name: /save & send/i }).last().click();
  }
}