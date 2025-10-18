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
    this.title = page.locator('h1');
    this.nameInput = page.locator('input[name="name"]');
    this.furiganaInput = page.locator('input[name="furigana"]');
    this.relationshipSelect = page.locator('select[name="relationship"]');
    this.memoTextarea = page.locator('textarea[name="memo"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.cancelButton = page.locator('text=キャンセル');
    this.validationErrors = page.locator('.error, [role="alert"]');
  }

  async goto() {
    await this.page.goto('/persons/new');
  }

  async gotoEdit(personId: string) {
    await this.page.goto(`/persons/${personId}/edit`);
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
    await this.relationshipSelect.selectOption({ label: relationship });
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
