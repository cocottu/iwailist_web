#!/usr/bin/env node

/**
 * Pre-commit フックスクリプト
 * コミット前にセキュリティチェックとコード品質チェックを実行します
 */

const { execSync } = require('child_process');
const SecurityChecker = require('./security-check');

class PreCommitHook {
  constructor() {
    this.checks = [
      { name: 'セキュリティチェック', fn: () => this.runSecurityCheck() },
      { name: 'ESLintチェック', fn: () => this.runESLint() },
      { name: 'TypeScriptチェック', fn: () => this.runTypeScriptCheck() },
      { name: 'テスト実行', fn: () => this.runTests() },
    ];
  }

  // セキュリティチェック実行
  runSecurityCheck() {
    console.log('🔍 セキュリティチェックを実行中...');
    const checker = new SecurityChecker();
    checker.run();
    console.log('✅ セキュリティチェック完了\n');
  }

  // ESLintチェック実行
  runESLint() {
    console.log('🔍 ESLintチェックを実行中...');
    try {
      execSync('npm run lint', { stdio: 'inherit' });
      console.log('✅ ESLintチェック完了\n');
    } catch (error) {
      console.error('❌ ESLintエラーが検出されました');
      throw error;
    }
  }

  // TypeScriptチェック実行
  runTypeScriptCheck() {
    console.log('🔍 TypeScriptチェックを実行中...');
    try {
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
      console.log('✅ TypeScriptチェック完了\n');
    } catch (error) {
      console.error('❌ TypeScriptエラーが検出されました');
      throw error;
    }
  }

  // テスト実行
  runTests() {
    console.log('🔍 テストを実行中...');
    try {
      execSync('npm run test:run', { stdio: 'inherit' });
      console.log('✅ テスト完了\n');
    } catch (error) {
      console.error('❌ テストが失敗しました');
      throw error;
    }
  }

  // 全チェック実行
  async run() {
    console.log('🚀 Pre-commit フックを開始します...\n');
    
    const startTime = Date.now();
    let passedChecks = 0;
    
    for (const check of this.checks) {
      try {
        console.log(`📋 ${check.name}を実行中...`);
        check.fn();
        passedChecks++;
      } catch (error) {
        console.error(`❌ ${check.name}が失敗しました`);
        console.error(error.message);
        process.exit(1);
      }
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('🎉 すべてのチェックが完了しました！');
    console.log(`📊 実行時間: ${duration}秒`);
    console.log(`✅ 通過したチェック: ${passedChecks}/${this.checks.length}`);
    console.log('🚀 コミットを続行できます');
  }
}

// メイン実行
if (require.main === module) {
  const hook = new PreCommitHook();
  hook.run().catch(error => {
    console.error('💥 Pre-commit フックが失敗しました:', error.message);
    process.exit(1);
  });
}

module.exports = PreCommitHook;
