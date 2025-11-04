import { Page, Locator } from '@playwright/test';

export class PersonFormPage {
  readonly page: Page;
  readonly title: Locator;
  readonly nameInput: Locator;
  readonly furiganaInput: Locator;
  readonly relationshipSelect: Locator;
  readonly memoTextarea: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly validationErrors: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole('heading', { name: '人物を登録' });
    this.nameInput = page.locator('input[placeholder="例: 田中太郎"]');
    this.furiganaInput = page.locator('input[placeholder="例: タナカタロウ"]');
    this.relationshipSelect = page.locator('select');
    this.memoTextarea = page.locator('textarea[placeholder="特記事項があれば入力してください"]');
    this.submitButton = page.getByRole('button', { name: '登録する' });
    this.cancelButton = page.getByRole('button', { name: 'キャンセル' });
    this.validationErrors = page.locator('.error, [role="alert"]');
  }

  async goto() {
    await this.page.goto('/persons/new');
    await this.waitForLoad();
  }

  async gotoEdit(personId: string) {
    await this.page.goto(`/persons/${personId}/edit`);
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.title.waitFor({ state: 'visible' });
  }

  async fillName(name: string) {
    await this.nameInput.fill(name);
  }

  async fillFurigana(furigana: string) {
    await this.furiganaInput.fill(furigana);
  }

  async selectRelationship(relationship: string) {
    const relationshipMap: Record<string, string> = {
      '家族': '家族',
      '親戚': '親戚',
      '友人': '友人',
      '同僚': '会社関係',
      '会社関係': '会社関係',
      '知人': '知人',
      'その他': 'その他',
    };
    const value = relationshipMap[relationship] ?? relationship;
    try {
      const result = await this.relationshipSelect.selectOption({ value });
      if (result.length === 0) {
        throw new Error('No matching value');
      }
    } catch {
      await this.relationshipSelect.selectOption({ label: relationship });
    }
  }

  async fillMemo(memo: string) {
    await this.memoTextarea.fill(memo);
  }

  async submit() {
    const detailUrlPattern = /\/persons\/(?!new$)[^/]+$/;
    await Promise.all([
      this.page.waitForURL((url) => detailUrlPattern.test(url)),
      this.submitButton.click(),
    ]);
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async fillForm(personData: {
    name: string;
    furigana?: string;
    relationship: string;
    memo?: string;
  }) {
    await this.fillName(personData.name);
    
    if (personData.furigana) {
      await this.fillFurigana(personData.furigana);
    }
    
    await this.selectRelationship(personData.relationship);
    
    if (personData.memo) {
      await this.fillMemo(personData.memo);
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
