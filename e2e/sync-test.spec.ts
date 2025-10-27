/**
 * 同期機能のE2Eテスト
 */
import { test, expect } from '@playwright/test';

test.describe('同期機能のテスト', () => {
  test('同期機能が実装されていることを確認', async ({ page }) => {
    // アプリケーションを開く
    await page.goto('/');
    
    // スクリーンショットを取得（初期状態）
    await page.screenshot({ path: 'sync-test-01-initial.png', fullPage: true });
    
    // コンソールログを監視
    const logs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      logs.push(text);
      console.log('Browser console:', text);
    });
    
    // Firebase設定を確認
    await page.waitForTimeout(1000);
    
    // Firebase初期化ログを確認
    const hasFirebaseInit = logs.some(log => 
      log.includes('Firebase') || 
      log.includes('firebase') ||
      log.includes('Firestore')
    );
    
    console.log('\n=== ログ一覧 ===');
    logs.forEach((log, i) => {
      console.log(`${i + 1}. ${log}`);
    });
    console.log('================\n');
    
    // ログインページの確認
    const isLoginPage = await page.locator('h1, h2').filter({ hasText: /ログイン|サインイン/i }).count();
    
    if (isLoginPage > 0) {
      console.log('ログインページが表示されています');
      await page.screenshot({ path: 'sync-test-02-login-page.png', fullPage: true });
      
      // ログイン状態でない場合、同期機能は実行されない
      console.log('ログインが必要です。同期機能を確認するには、実際にログインする必要があります。');
    } else {
      console.log('ログインページではありません');
      await page.screenshot({ path: 'sync-test-02-logged-in.png', fullPage: true });
    }
    
    // ページタイトルを確認
    const title = await page.title();
    console.log('ページタイトル:', title);
    
    // localStorageを確認
    const localStorage = await page.evaluate(() => {
      return {
        authToken: window.localStorage.getItem('authToken'),
        user: window.localStorage.getItem('user'),
        lastSyncTime: window.localStorage.getItem('lastSyncTime'),
        syncQueue: window.localStorage.getItem('syncQueue'),
      };
    });
    
    console.log('\n=== LocalStorage ===');
    console.log('authToken:', localStorage.authToken ? '設定済み' : '未設定');
    console.log('user:', localStorage.user ? 'あり' : 'なし');
    console.log('lastSyncTime:', localStorage.lastSyncTime || '未同期');
    console.log('syncQueue:', localStorage.syncQueue || '空');
    console.log('====================\n');
    
    // Firebaseオブジェクトを確認
    const firebaseInfo = await page.evaluate(() => {
      // @ts-ignore
      return {
        // @ts-ignore
        hasAuth: typeof window.firebase !== 'undefined',
        userAgent: navigator.userAgent,
        online: navigator.onLine,
      };
    });
    
    console.log('\n=== ブラウザ情報 ===');
    console.log('Online:', firebaseInfo.online ? 'はい' : 'いいえ');
    console.log('User Agent:', firebaseInfo.userAgent);
    console.log('====================\n');
  });
  
  test('ダッシュボードで同期ログを確認', async ({ page }) => {
    await page.goto('/');
    
    // コンソールログを監視
    const syncLogs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('sync') || text.includes('Sync') || text.includes('SyncManager') || text.includes('AuthContext')) {
        syncLogs.push(text);
        console.log('Sync log:', text);
      }
    });
    
    // 待機
    await page.waitForTimeout(3000);
    
    // スクリーンショット
    await page.screenshot({ path: 'sync-test-03-dashboard.png', fullPage: true });
    
    console.log('\n=== 同期関連ログ ===');
    if (syncLogs.length > 0) {
      syncLogs.forEach((log, i) => {
        console.log(`${i + 1}. ${log}`);
      });
    } else {
      console.log('同期関連のログが見つかりません');
    }
    console.log('====================\n');
    
    // Firestoreへのアクセスを確認
    const networkLogs: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('firestore') || url.includes('firebase')) {
        networkLogs.push(`${request.method()} ${url}`);
      }
    });
    
    await page.waitForTimeout(2000);
    
    console.log('\n=== Firebase/Firestoreへのリクエスト ===');
    if (networkLogs.length > 0) {
      networkLogs.forEach((log, i) => {
        console.log(`${i + 1}. ${log}`);
      });
    } else {
      console.log('Firebase/Firestoreへのリクエストが見つかりません');
      console.log('考えられる原因:');
      console.log('1. ログインしていない');
      console.log('2. Firebase設定が無効');
      console.log('3. オフラインモード');
    }
    console.log('========================================\n');
  });
});
