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
    this.title = page.getByRole('heading', { name: '人物一覧' });
    this.description = page.getByText(/件の人物が登録されています/);
    this.newPersonButton = page.getByRole('button', { name: '新規登録' });
    this.searchInput = page.locator('input[placeholder="名前で検索..."]');
    this.relationshipSelect = page.locator('select');
    this.personCards = page.locator('[data-testid="person-card"]');
    this.emptyState = page.locator('text=人物が見つかりません');
  }

  async goto() {
    await this.page.goto('/persons');
    await this.waitForLoad();
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

  async getPersonCount(): Promise<number> {
    for (let i = 0; i < 10; i++) {
      const count = await this.page.evaluate(async () => {
        return await new Promise<number>((resolve) => {
          try {
            const request = indexedDB.open('IwailistDB', 1);
            request.onsuccess = () => {
              const db = request.result;
              const tx = db.transaction('persons', 'readonly');
              const store = tx.objectStore('persons');
              const getAllRequest = store.getAll();
              getAllRequest.onsuccess = () => {
                const persons = getAllRequest.result as Array<{ userId?: string }>;
                resolve(persons.filter((p) => (p.userId || 'demo-user') === 'demo-user').length);
              };
              getAllRequest.onerror = () => resolve(0);
            };
            request.onerror = () => resolve(0);
          } catch (error) {
            resolve(0);
          }
        });
      });
      if (count > 0) {
        return count;
      }
      await this.page.waitForTimeout(100);
    }
    return 0;
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
