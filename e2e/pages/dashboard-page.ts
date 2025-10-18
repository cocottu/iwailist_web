import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly title: Locator;
  readonly description: Locator;
  readonly pendingReturnsCard: Locator;
  readonly monthlyAmountCard: Locator;
  readonly completedReturnsCard: Locator;
  readonly totalAmountCard: Locator;
  readonly quickActionGiftButton: Locator;
  readonly quickActionPersonButton: Locator;
  readonly recentGiftsSection: Locator;
  readonly viewAllGiftsLink: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1');
    this.description = page.locator('text=祝い品の管理状況を確認できます');
    this.pendingReturnsCard = page.locator('text=未対応');
    this.monthlyAmountCard = page.locator('text=今月');
    this.completedReturnsCard = page.locator('text=対応済');
    this.totalAmountCard = page.locator('text=総額');
    this.quickActionGiftButton = page.locator('text=贈答品を登録');
    this.quickActionPersonButton = page.locator('text=人物を登録');
    this.recentGiftsSection = page.locator('text=最近の贈答品');
    this.viewAllGiftsLink = page.locator('text=すべて見る →');
    this.emptyState = page.locator('text=まだ贈答品が登録されていません');
  }

  async goto() {
    await this.page.goto('/');
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.title.waitFor({ state: 'visible' });
  }

  async clickGiftRegistration() {
    await this.quickActionGiftButton.click();
  }

  async clickPersonRegistration() {
    await this.quickActionPersonButton.click();
  }

  async clickViewAllGifts() {
    await this.viewAllGiftsLink.click();
  }

  async getPendingReturnsCount(): Promise<string> {
    return await this.pendingReturnsCard.locator('..').locator('text=/\\d+件/').textContent() || '0件';
  }

  async getMonthlyAmount(): Promise<string> {
    return await this.monthlyAmountCard.locator('..').locator('text=/\\d+円/').textContent() || '0円';
  }

  async getCompletedReturnsCount(): Promise<string> {
    return await this.completedReturnsCard.locator('..').locator('text=/\\d+件/').textContent() || '0件';
  }

  async getTotalAmount(): Promise<string> {
    return await this.totalAmountCard.locator('..').locator('text=/\\d+円/').textContent() || '0円';
  }

  async isRecentGiftsEmpty(): Promise<boolean> {
    return await this.emptyState.isVisible();
  }
}
