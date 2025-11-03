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
    this.title = page.getByRole('heading', { name: '贈答品一覧' });
    this.description = page.getByText(/件の贈答品が登録されています/);
    this.newGiftButton = page.getByRole('button', { name: '新規登録' });
    this.searchInput = page.locator('input[placeholder="贈答品名で検索..."]');
    this.categorySelect = page.locator('select').first();
    this.statusSelect = page.locator('select').nth(1);
    this.resetButton = page.getByRole('button', { name: 'リセット' });
    this.giftCards = page.locator('[data-testid="gift-card"]');
    this.emptyState = page.locator('text=贈答品が見つかりません');
  }

  async goto() {
    await this.page.goto('/gifts');
    await this.waitForLoad();
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
    try {
      const result = await this.categorySelect.selectOption({ value: category });
      if (result.length === 0) {
        throw new Error('No category selected');
      }
    } catch {
      await this.categorySelect.selectOption({ label: category }).catch(async () => {
        await this.categorySelect.selectOption({ value: 'その他' });
      });
    }
  }

  async filterByStatus(status: string) {
    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'completed': 'completed',
      'not_required': 'not_required',
      '未対応': 'pending',
      '対応済': 'completed',
      '不要': 'not_required',
    };
    const value = statusMap[status] ?? status;
    await this.statusSelect.selectOption({ value });
  }

  async resetFilters() {
    await this.resetButton.click();
  }

  async getGiftCount(): Promise<number> {
    let lastCount: number | null = null;
    let stableIterations = 0;
    for (let i = 0; i < 20; i++) {
      const summaryText = await this.description.textContent();
      const match = summaryText?.match(/(\d+)件/);
      if (match) {
        const count = Number(match[1]);
        if (lastCount === count) {
          stableIterations += 1;
          if (stableIterations >= 2) {
            return count;
          }
        } else {
          stableIterations = 0;
        }
        lastCount = count;
      }
      await this.page.waitForTimeout(100);
    }
    if (lastCount !== null) {
      return lastCount;
    }
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
