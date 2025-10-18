import { Page, Locator } from '@playwright/test';

export class GiftFormPage {
  readonly page: Page;
  readonly title: Locator;
  readonly giftNameInput: Locator;
  readonly personSelect: Locator;
  readonly receivedDateInput: Locator;
  readonly categorySelect: Locator;
  readonly returnStatusSelect: Locator;
  readonly amountInput: Locator;
  readonly memoTextarea: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly validationErrors: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1');
    this.giftNameInput = page.locator('input[name="giftName"]');
    this.personSelect = page.locator('select[name="personId"]');
    this.receivedDateInput = page.locator('input[name="receivedDate"]');
    this.categorySelect = page.locator('select[name="category"]');
    this.returnStatusSelect = page.locator('select[name="returnStatus"]');
    this.amountInput = page.locator('input[name="amount"]');
    this.memoTextarea = page.locator('textarea[name="memo"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.cancelButton = page.locator('text=キャンセル');
    this.validationErrors = page.locator('.error, [role="alert"]');
  }

  async goto() {
    await this.page.goto('/gifts/new');
  }

  async gotoEdit(giftId: string) {
    await this.page.goto(`/gifts/${giftId}/edit`);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.title.waitFor({ state: 'visible' });
  }

  async fillGiftName(name: string) {
    await this.giftNameInput.fill(name);
  }

  async selectPerson(personName: string) {
    await this.personSelect.selectOption({ label: personName });
  }

  async fillReceivedDate(date: string) {
    await this.receivedDateInput.fill(date);
  }

  async selectCategory(category: string) {
    await this.categorySelect.selectOption({ label: category });
  }

  async selectReturnStatus(status: string) {
    await this.returnStatusSelect.selectOption({ label: status });
  }

  async fillAmount(amount: number) {
    await this.amountInput.fill(amount.toString());
  }

  async fillMemo(memo: string) {
    await this.memoTextarea.fill(memo);
  }

  async submit() {
    await this.submitButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async fillForm(giftData: {
    giftName: string;
    personId: string;
    receivedDate: string;
    category: string;
    returnStatus: string;
    amount?: number;
    memo?: string;
  }) {
    await this.fillGiftName(giftData.giftName);
    await this.selectPerson(giftData.personId);
    await this.fillReceivedDate(giftData.receivedDate);
    await this.selectCategory(giftData.category);
    await this.selectReturnStatus(giftData.returnStatus);
    
    if (giftData.amount) {
      await this.fillAmount(giftData.amount);
    }
    
    if (giftData.memo) {
      await this.fillMemo(giftData.memo);
    }
  }

  async hasValidationErrors(): Promise<boolean> {
    return await this.validationErrors.count() > 0;
  }

  async getValidationErrors(): Promise<string[]> {
    const errors = [];
    const count = await this.validationErrors.count();
    for (let i = 0; i < count; i++) {
      const errorText = await this.validationErrors.nth(i).textContent();
      if (errorText) {
        errors.push(errorText);
      }
    }
    return errors;
  }
}
