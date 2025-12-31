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
    this.title = page.getByRole('heading', { name: '贈答品を登録' });
    this.giftNameInput = page.locator('input[placeholder="例: 結婚祝い"]');
    this.personSelect = page.locator('select').first();
    this.receivedDateInput = page.locator('input[type="date"]');
    this.categorySelect = page.locator('select').nth(1);
    this.returnStatusSelect = page.locator('input[name="returnStatus"]');
    this.amountInput = page.locator('input[placeholder="例: 30000"]');
    this.memoTextarea = page.locator('textarea[placeholder="特記事項があれば入力してください"]');
    this.submitButton = page.getByRole('button', { name: '登録する' });
    this.cancelButton = page.getByRole('button', { name: 'キャンセル' });
    this.validationErrors = page.locator('.error, [role="alert"]');
  }

  async goto() {
    await this.page.goto('/gifts/new');
    await this.waitForLoad();
  }

  async gotoEdit(giftId: string) {
    await this.page.goto(`/gifts/${giftId}/edit`);
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.title.waitFor({ state: 'visible' });
  }

  async fillGiftName(name: string) {
    await this.giftNameInput.fill(name);
  }

  async selectPerson(personName: string) {
    await this.page.waitForFunction(
      (name) => {
        const select = document.querySelectorAll('select')[0];
        if (!select || !('options' in select)) return false;
        return Array.from(select.options).some((option) => option.value === name || option.textContent === name);
      },
      personName,
      { timeout: 5000 }
    );
    try {
      const result = await this.personSelect.selectOption({ value: personName });
      if (result.length === 0) {
        throw new Error('No matching value');
      }
    } catch {
      await this.personSelect.selectOption({ label: personName });
    }
  }

  async fillReceivedDate(date: string) {
    await this.receivedDateInput.fill(date);
  }

  async selectCategory(category: string) {
    try {
      const result = await this.categorySelect.selectOption({ value: category });
      if (result.length === 0) {
        throw new Error('No matching value');
      }
    } catch {
      await this.categorySelect.selectOption({ label: category }).catch(async () => {
        await this.categorySelect.selectOption({ value: 'その他' });
      });
    }
  }

  async selectReturnStatus(status: string) {
    const statusValueMap: Record<string, 'pending' | 'completed' | 'not_required'> = {
      'pending': 'pending',
      'completed': 'completed',
      'not_required': 'not_required',
      '未対応': 'pending',
      '対応済': 'completed',
      '不要': 'not_required',
    };
    const labelMap: Record<'pending' | 'completed' | 'not_required', string> = {
      pending: '未対応',
      completed: '対応済',
      not_required: '不要',
    };
    const normalized = statusValueMap[status] ?? 'pending';
    const label = labelMap[normalized];
    await this.page.getByRole('radio', { name: label }).check();
  }

  async fillAmount(amount: number) {
    await this.amountInput.fill(amount.toString());
  }

  async fillMemo(memo: string) {
    await this.memoTextarea.fill(memo);
  }

  async submit() {
    // 現在のURLを取得
    const currentUrl = this.page.url();
    
    // 登録ボタンをクリック
    await this.submitButton.click();
    
    // URLが変わるか、ナビゲーションを待機
    const detailUrlPattern = /\/gifts\/(?!new$)[^/]+$/;
    
    try {
      await this.page.waitForURL((url) => {
        if (url.href === currentUrl) return false;
        return detailUrlPattern.test(url.pathname) || url.pathname === '/gifts';
      }, { timeout: 30000 });
    } catch {
      const pageUrl = this.page.url();
      throw new Error(`Form submission did not redirect. Current URL: ${pageUrl}`);
    }
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
