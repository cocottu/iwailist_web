#!/usr/bin/env node

/**
 * セキュリティチェックスクリプト
 * コミット前に機密情報が含まれていないかチェックします
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// チェック対象のパターン
const SENSITIVE_PATTERNS = [
  // APIキー・トークン
  /sk-[a-zA-Z0-9]{20,}/g,
  /pk_[a-zA-Z0-9]{20,}/g,
  /[a-zA-Z0-9]{32,}/g, // 長い文字列（APIキーの可能性）
  
  // パスワード・シークレット
  /password\s*[:=]\s*["'][^"']+["']/gi,
  /secret\s*[:=]\s*["'][^"']+["']/gi,
  /token\s*[:=]\s*["'][^"']+["']/gi,
  /key\s*[:=]\s*["'][^"']+["']/gi,
  
  // データベース接続文字列
  /mongodb:\/\/[^/]+\/[^/]+/g,
  /postgres:\/\/[^/]+\/[^/]+/g,
  /mysql:\/\/[^/]+\/[^/]+/g,
  
  // 個人情報
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // メールアドレス
  /0\d{1,4}-\d{1,4}-\d{4}/g, // 電話番号
  
  // 機密URL
  /https:\/\/[a-zA-Z0-9.-]+\.internal/g,
  /https:\/\/[a-zA-Z0-9.-]+\.local/g,
];

// 除外するファイル・ディレクトリ
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  'test-results',
  'playwright-report',
  '.env.example',
  'SECURITY.md',
  'scripts/security-check.js',
];

// 除外するファイル拡張子
const EXCLUDE_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
];

class SecurityChecker {
  constructor() {
    this.violations = [];
    this.checkedFiles = 0;
  }

  // ファイルが除外対象かチェック
  shouldExclude(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    
    // 除外パターンにマッチするかチェック
    for (const pattern of EXCLUDE_PATTERNS) {
      if (relativePath.includes(pattern)) {
        return true;
      }
    }
    
    // 除外拡張子にマッチするかチェック
    const ext = path.extname(filePath);
    if (EXCLUDE_EXTENSIONS.includes(ext)) {
      return true;
    }
    
    return false;
  }

  // ファイルをチェック
  checkFile(filePath) {
    if (this.shouldExclude(filePath)) {
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.checkedFiles++;
      
      // 各パターンでチェック
      SENSITIVE_PATTERNS.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            this.violations.push({
              file: filePath,
              pattern: pattern.toString(),
              match: match,
              line: this.getLineNumber(content, match)
            });
          });
        }
      });
    } catch (error) {
      // バイナリファイルなどはスキップ
      if (error.code !== 'EISDIR') {
        console.warn(`Warning: Could not read ${filePath}: ${error.message}`);
      }
    }
  }

  // マッチした文字列の行番号を取得
  getLineNumber(content, match) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(match)) {
        return i + 1;
      }
    }
    return 0;
  }

  // ディレクトリを再帰的にチェック
  checkDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.checkDirectory(fullPath);
      } else if (stat.isFile()) {
        this.checkFile(fullPath);
      }
    });
  }

  // チェック実行
  run() {
    console.log('🔍 セキュリティチェックを開始します...\n');
    
    // srcディレクトリをチェック
    if (fs.existsSync('src')) {
      this.checkDirectory('src');
    }
    
    // ルートディレクトリの設定ファイルをチェック
    const rootFiles = [
      'package.json',
      'vite.config.ts',
      'tailwind.config.js',
      'tsconfig.json',
      'playwright.config.ts',
      'vitest.config.ts'
    ];
    
    rootFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.checkFile(file);
      }
    });
    
    // 結果を表示
    this.displayResults();
  }

  // 結果を表示
  displayResults() {
    console.log(`📊 チェック完了: ${this.checkedFiles} ファイルをチェックしました\n`);
    
    if (this.violations.length === 0) {
      console.log('✅ セキュリティチェック: 問題は見つかりませんでした');
      console.log('🎉 安全にコミットできます！');
      process.exit(0);
    } else {
      console.log('❌ セキュリティ違反が検出されました:');
      console.log('');
      
      this.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ファイル: ${violation.file}`);
        console.log(`   行: ${violation.line}`);
        console.log(`   マッチ: ${violation.match}`);
        console.log(`   パターン: ${violation.pattern}`);
        console.log('');
      });
      
      console.log('🚨 これらの問題を修正してからコミットしてください');
      console.log('💡 詳細は SECURITY.md を参照してください');
      process.exit(1);
    }
  }
}

// メイン実行
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const checker = new SecurityChecker();
  checker.run();
}

export default SecurityChecker;
