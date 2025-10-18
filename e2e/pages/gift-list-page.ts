import { Page, Locator } from '@playwright/test';

export class GiftListPage {
  readonly page: Page;
  readonly title: Locator;
  readonly description: Locator;
  readonly newGiftButton: Locator;
  readonly searchInput: Locator;
  readonly categorySelect: Locator;
  readonly statusSelect: Locator;
  readonly resetButton: Locator;
  readonly giftCards: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1');
    this.description = page.locator('text=件の贈答品が登録されています');
    this.newGiftButton = page.locator('text=新規登録');
    this.searchInput = page.locator('input[placeholder="贈答品名で検索..."]');
    this.categorySelect = page.locator('select').first();
    this.statusSelect = page.locator('select').nth(1);
    this.resetButton = page.locator('text=リセット');
    this.giftCards = page.locator('[data-testid="gift-card"]');
    this.emptyState = page.locator('text=贈答品が見つかりません');
  }

  async goto() {
    await this.page.goto('/gifts');
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.title.waitFor({ state: 'visible' });
  }

  async clickNewGift() {
    await this.newGiftButton.click();
  }

  async searchGifts(searchText: string) {
    await this.searchInput.fill(searchText);
  }

  async filterByCategory(category: string) {
    await this.categorySelect.selectOption({ value: category });
  }

  async filterByStatus(status: string) {
    await this.statusSelect.selectOption({ value: status });
  }

  async resetFilters() {
    await this.resetButton.click();
  }

  async getGiftCount(): Promise<number> {
    return await this.giftCards.count();
  }

  async isGiftListEmpty(): Promise<boolean> {
    return await this.emptyState.isVisible();
  }

  async getGiftCardByIndex(index: number): Promise<Locator> {
    return this.giftCards.nth(index);
  }

  async getGiftNameByIndex(index: number): Promise<string> {
    const giftCard = await this.getGiftCardByIndex(index);
    return await giftCard.locator('h3').textContent() || '';
  }

  async clickGiftDetailByIndex(index: number) {
    const giftCard = await this.getGiftCardByIndex(index);
    await giftCard.locator('text=詳細を見る').click();
  }
}
