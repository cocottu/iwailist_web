#!/usr/bin/env node

/**
 * PWAアイコン生成スクリプト
 * 
 * このスクリプトはSVGテンプレートから複数サイズのPNGアイコンを生成します。
 * 実行には sharp パッケージが必要です: npm install sharp
 * 
 * 使用方法:
 *   node scripts/generate-pwa-icons.js
 * 
 * または、手動で以下のサイズのPNGアイコンを作成してください:
 *   - public/pwa-192x192.png (192x192px)
 *   - public/pwa-512x512.png (512x512px)
 *   - public/pwa-maskable-192x192.png (192x192px, マスカブル対応)
 *   - public/pwa-maskable-512x512.png (512x512px, マスカブル対応)
 * 
 * オンラインツールの推奨:
 *   - https://realfavicongenerator.net/
 *   - https://www.pwabuilder.com/imageGenerator
 */

console.log(`
📱 PWAアイコン生成について

このプロジェクトではPWAアイコンが必要です。
以下のいずれかの方法でアイコンを生成してください:

【方法1】オンラインツールを使用（推奨）
  1. https://www.pwabuilder.com/imageGenerator にアクセス
  2. public/pwa-icon-template.svg をアップロード
  3. 生成されたアイコンをダウンロード
  4. public/ ディレクトリに配置

【方法2】手動で作成
  必要なファイル:
  - public/pwa-192x192.png (192x192px)
  - public/pwa-512x512.png (512x512px)
  - public/pwa-maskable-192x192.png (192x192px)
  - public/pwa-maskable-512x512.png (512x512px)

【方法3】sharpパッケージを使用
  1. npm install sharp
  2. このスクリプトを更新してSVG→PNG変換を実装
  3. node scripts/generate-pwa-icons.js を実行

現在はプレースホルダーとしてSVGテンプレートを用意しています。
デプロイ前に必ずPNGアイコンを生成してください。
`);

// 将来的にsharpを使った自動生成を実装する場合のサンプルコード
/*
const sharp = require('sharp');
const fs = require('fs');

const sizes = [
  { size: 192, output: 'public/pwa-192x192.png', padding: 0 },
  { size: 512, output: 'public/pwa-512x512.png', padding: 0 },
  { size: 192, output: 'public/pwa-maskable-192x192.png', padding: 38 }, // 20% padding
  { size: 512, output: 'public/pwa-maskable-512x512.png', padding: 102 }, // 20% padding
];

async function generateIcons() {
  const svgBuffer = fs.readFileSync('public/pwa-icon-template.svg');
  
  for (const { size, output, padding } of sizes) {
    await sharp(svgBuffer)
      .resize(size - padding * 2, size - padding * 2)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 59, g: 130, b: 246, alpha: 1 }
      })
      .png()
      .toFile(output);
    
    console.log(`✅ Generated: ${output}`);
  }
  
  console.log('🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);
*/
