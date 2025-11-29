import { test, expect } from '@playwright/test';
import { loginWithBasicAuth } from './helpers/test-helpers';

test.describe('法的事項ページのテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginWithBasicAuth(page);
  });

  test('運営者情報ページにアクセスできる', async ({ page }) => {
    await page.goto('/legal/operator');
    await expect(page.getByRole('heading', { name: '運営者情報' })).toBeVisible();
    await expect(page.getByText(/cocottu/)).toBeVisible();
    await expect(page.getByText(/個人開発プロジェクト/)).toBeVisible();
  });

  test('プライバシーポリシーページにアクセスできる', async ({ page }) => {
    await page.goto('/legal/privacy');
    await expect(page.getByRole('heading', { name: 'プライバシーポリシー' })).toBeVisible();
    await expect(page.getByText('目次')).toBeVisible();
    await expect(page.getByText('1. 収集する情報の種類')).toBeVisible();
  });

  test('お問い合わせページにアクセスできる', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: 'お問い合わせ' })).toBeVisible();
    await expect(page.getByLabelText(/お問い合わせ内容/)).toBeVisible();
  });

  test('設定ページから法的事項ページにアクセスできる', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: '設定' })).toBeVisible();
    
    // 一般設定タブをクリック
    await page.getByRole('button', { name: '一般設定' }).click();
    
    // 運営者情報リンクをクリック
    await page.getByRole('link', { name: /運営者情報/ }).click();
    await expect(page).toHaveURL('/legal/operator');
    await expect(page.getByRole('heading', { name: '運営者情報' })).toBeVisible();
    
    // 設定に戻る
    await page.goto('/settings');
    await page.getByRole('button', { name: '一般設定' }).click();
    
    // プライバシーポリシーリンクをクリック
    await page.getByRole('link', { name: /プライバシーポリシー/ }).click();
    await expect(page).toHaveURL('/legal/privacy');
    await expect(page.getByRole('heading', { name: 'プライバシーポリシー' })).toBeVisible();
    
    // 設定に戻る
    await page.goto('/settings');
    await page.getByRole('button', { name: '一般設定' }).click();
    
    // お問い合わせリンクをクリック
    await page.getByRole('link', { name: /お問い合わせ/ }).click();
    await expect(page).toHaveURL('/contact');
    await expect(page.getByRole('heading', { name: 'お問い合わせ' })).toBeVisible();
  });

  test('運営者情報ページから関連リンクにアクセスできる', async ({ page }) => {
    await page.goto('/legal/operator');
    
    // プライバシーポリシーリンクをクリック
    await page.getByRole('link', { name: 'プライバシーポリシー' }).click();
    await expect(page).toHaveURL('/legal/privacy');
    
    // 運営者情報に戻る
    await page.goto('/legal/operator');
    
    // お問い合わせリンクをクリック
    await page.getByRole('link', { name: 'お問い合わせ' }).click();
    await expect(page).toHaveURL('/contact');
  });

  test('プライバシーポリシーページの目次リンクが機能する', async ({ page }) => {
    await page.goto('/legal/privacy');
    
    // 目次から「1. 収集する情報の種類」をクリック
    const tocLink = page.getByRole('link', { name: '1. 収集する情報の種類' });
    await tocLink.click();
    
    // ページがスクロールして該当セクションに移動することを確認
    // (実際のスクロール動作はブラウザ依存のため、URLが変わらないことを確認)
    await expect(page).toHaveURL('/legal/privacy');
    
    // セクションが見えることを確認
    await expect(page.getByRole('heading', { name: '1. 収集する情報の種類' })).toBeVisible();
  });

  test('お問い合わせフォームのバリデーションが機能する', async ({ page }) => {
    await page.goto('/contact');
    
    // 必須項目を入力せずに送信を試みる
    await page.getByRole('button', { name: '送信する' }).click();
    
    // エラーメッセージが表示されることを確認
    await expect(page.getByText('お問い合わせ内容を入力してください')).toBeVisible();
    await expect(page.getByText('プライバシーポリシーへの同意が必要です')).toBeVisible();
  });

  test('お問い合わせフォームでメールアドレスの形式チェックが機能する', async ({ page }) => {
    await page.goto('/contact');
    
    // 無効なメールアドレスを入力
    await page.getByLabelText(/メールアドレス/).fill('invalid-email');
    
    // 必須項目を入力
    await page.getByLabelText(/お問い合わせ内容/).fill('Test message');
    await page.getByLabelText(/プライバシーポリシー/).check();
    
    // 送信を試みる
    await page.getByRole('button', { name: '送信する' }).click();
    
    // エラーメッセージが表示されることを確認
    await expect(page.getByText('有効なメールアドレスを入力してください')).toBeVisible();
  });

  test('お問い合わせフォームで確認モーダルが表示される', async ({ page }) => {
    await page.goto('/contact');
    
    // フォームに入力
    await page.getByLabelText(/お名前/).fill('テストユーザー');
    await page.getByLabelText(/メールアドレス/).fill('test@example.com');
    await page.getByLabelText(/お問い合わせ内容/).fill('テストメッセージ');
    await page.getByLabelText(/プライバシーポリシー/).check();
    
    // 送信ボタンをクリック
    await page.getByRole('button', { name: '送信する' }).click();
    
    // 確認モーダルが表示されることを確認
    await expect(page.getByRole('heading', { name: '送信内容の確認' })).toBeVisible();
    await expect(page.getByText('テストユーザー')).toBeVisible();
    await expect(page.getByText('test@example.com')).toBeVisible();
    await expect(page.getByText('テストメッセージ')).toBeVisible();
    
    // キャンセルボタンをクリック
    await page.getByRole('button', { name: 'キャンセル' }).click();
    
    // モーダルが閉じることを確認
    await expect(page.getByRole('heading', { name: '送信内容の確認' })).not.toBeVisible();
  });
});
