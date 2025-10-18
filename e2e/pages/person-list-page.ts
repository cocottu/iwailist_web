import { Page, Locator } from '@playwright/test';

export class PersonListPage {
  readonly page: Page;
  readonly title: Locator;
  readonly description: Locator;
  readonly newPersonButton: Locator;
  readonly searchInput: Locator;
  readonly relationshipSelect: Locator;
  readonly personCards: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1');
    this.description = page.locator('text=人の人物が登録されています');
    this.newPersonButton = page.locator('text=新規登録');
    this.searchInput = page.locator('input[placeholder="名前で検索..."]');
    this.relationshipSelect = page.locator('select');
    this.personCards = page.locator('[data-testid="person-card"]');
    this.emptyState = page.locator('text=人物が見つかりません');
  }

  async goto() {
    await this.page.goto('/persons');
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.title.waitFor({ state: 'visible' });
  }

  async clickNewPerson() {
    await this.newPersonButton.click();
  }

  async searchPersons(searchText: string) {
    await this.searchInput.fill(searchText);
  }

  async filterByRelationship(relationship: string) {
    await this.relationshipSelect.selectOption({ value: relationship });
  }

  async getPersonCount(): Promise<number> {
    return await this.personCards.count();
  }

  async isPersonListEmpty(): Promise<boolean> {
    return await this.emptyState.isVisible();
  }

  async getPersonCardByIndex(index: number): Promise<Locator> {
    return this.personCards.nth(index);
  }

  async getPersonNameByIndex(index: number): Promise<string> {
    const personCard = await this.getPersonCardByIndex(index);
    return await personCard.locator('h3').textContent() || '';
  }

  async clickPersonDetailByIndex(index: number) {
    const personCard = await this.getPersonCardByIndex(index);
    await personCard.locator('text=詳細を見る').click();
  }
}
