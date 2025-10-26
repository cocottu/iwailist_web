# OCR/AI解析機能の設計ドキュメント

## 概要

レシートや招待状の写真から自動的に情報を抽出し、贈答品登録を簡単にする機能の設計ドキュメントです。
Phase 6以降での実装を想定しています。

## 目的

- レシート撮影から金額・日付を自動抽出
- 招待状から贈り主の名前を自動抽出
- 手入力の手間を削減
- 入力ミスを防止

## ユースケース

### ケース1: レシート撮影
1. ユーザーがレシートを撮影
2. OCRで文字を認識
3. 金額・日付・店名を抽出
4. 贈答品登録フォームに自動入力

### ケース2: 招待状から情報抽出
1. 招待状の写真を撮影
2. OCRで文字を認識
3. 差出人の名前・日付を抽出
4. 人物登録フォームに自動入力

### ケース3: 手書きメモの認識
1. 手書きメモを撮影
2. OCRで文字を認識
3. メモ内容を抽出
4. 贈答品のメモ欄に入力

---

## OCR技術の選択

### オプション1: Tesseract.js（推奨：Phase 5.5）

**特徴**:
- ✅ 完全無料
- ✅ ブラウザ内で処理（オフライン対応）
- ✅ 日本語対応
- ⚠️ 精度がやや劣る
- ⚠️ 処理速度が遅い

**コスト**: $0

**使用方法**:
```typescript
import { createWorker } from 'tesseract.js';

async function recognizeText(imageFile: File): Promise<string> {
  const worker = await createWorker('jpn');
  const { data: { text } } = await worker.recognize(imageFile);
  await worker.terminate();
  return text;
}
```

### オプション2: Google Cloud Vision API（推奨：Phase 6）

**特徴**:
- ✅ 高精度
- ✅ 高速処理
- ✅ 日本語対応が優れている
- ✅ 手書き文字も認識可能
- ⚠️ 有料（従量課金）
- ⚠️ オンライン接続必須

**コスト**:
- 月1,000リクエストまで無料
- それ以降: $1.50 / 1,000リクエスト

**使用方法**:
```typescript
import { ImageAnnotatorClient } from '@google-cloud/vision';

async function recognizeText(imageFile: File): Promise<string> {
  const client = new ImageAnnotatorClient();
  const [result] = await client.textDetection(imageFile);
  return result.fullTextAnnotation?.text || '';
}
```

### オプション3: Azure Computer Vision API

**特徴**:
- ✅ 高精度
- ✅ 日本語対応
- ⚠️ 有料
- ⚠️ オンライン接続必須

**コスト**:
- Free Tier: 5,000リクエスト/月
- それ以降: $1.00 / 1,000リクエスト

---

## AI解析機能の設計

### 1. テキスト抽出後の解析

```typescript
interface ExtractedData {
  amounts: number[];       // 抽出した金額
  dates: Date[];          // 抽出した日付
  names: string[];        // 抽出した名前
  categories: string[];   // 推測されるカテゴリ
  raw: string;           // 生のテキスト
}

async function analyzeText(text: string): Promise<ExtractedData> {
  return {
    amounts: extractAmounts(text),
    dates: extractDates(text),
    names: extractNames(text),
    categories: predictCategory(text),
    raw: text,
  };
}
```

### 2. 金額の抽出

```typescript
function extractAmounts(text: string): number[] {
  // 正規表現で金額を抽出
  const patterns = [
    /¥\s?([0-9,]+)/g,           // ¥1,000
    /([0-9,]+)\s?円/g,          // 1,000円
    /金額[:\s]*([0-9,]+)/g,    // 金額: 1,000
  ];
  
  const amounts: number[] = [];
  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const amount = parseInt(match[1].replace(/,/g, ''));
      if (!isNaN(amount)) {
        amounts.push(amount);
      }
    }
  });
  
  return amounts;
}
```

### 3. 日付の抽出

```typescript
function extractDates(text: string): Date[] {
  const patterns = [
    /(\d{4})年(\d{1,2})月(\d{1,2})日/g,  // 2024年10月26日
    /(\d{4})\/(\d{1,2})\/(\d{1,2})/g,   // 2024/10/26
    /(\d{4})-(\d{1,2})-(\d{1,2})/g,     // 2024-10-26
  ];
  
  const dates: Date[] = [];
  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      const day = parseInt(match[3]);
      dates.push(new Date(year, month, day));
    }
  });
  
  return dates;
}
```

### 4. カテゴリの推測

```typescript
function predictCategory(text: string): string[] {
  const keywords = {
    '結婚祝い': ['結婚', '婚礼', 'ウェディング', '披露宴'],
    '出産祝い': ['出産', '誕生', 'ベビー', '赤ちゃん'],
    'お見舞い': ['お見舞い', '入院', '快気'],
    'お祝い': ['お祝い', '祝賀'],
    '香典': ['香典', 'お悔やみ', '葬儀', '告別式'],
  };
  
  const categories: string[] = [];
  Object.entries(keywords).forEach(([category, words]) => {
    if (words.some(word => text.includes(word))) {
      categories.push(category);
    }
  });
  
  return categories;
}
```

---

## データモデル設計

### OCRResult（OCR結果）

```typescript
interface OCRResult {
  id: string;
  userId: string;
  imageId: string;         // 元の画像ID
  rawText: string;         // 抽出した生テキスト
  extractedData: ExtractedData;
  confidence: number;      // 信頼度（0-1）
  processingTime: number;  // 処理時間（ミリ秒）
  provider: 'tesseract' | 'google-vision' | 'azure';
  createdAt: Date;
}
```

### AIAnalysis（AI解析結果）

```typescript
interface AIAnalysis {
  id: string;
  ocrResultId: string;
  suggestedGift: Partial<Gift>;  // 提案される贈答品データ
  suggestedPerson: Partial<Person>;  // 提案される人物データ
  confidence: number;
  createdAt: Date;
}
```

---

## UI設計

### 1. OCR撮影画面

```
┌──────────────────────────────────────┐
│ レシート/招待状を撮影                │
├──────────────────────────────────────┤
│ [カメラプレビュー]                   │
│                                      │
│     📷                               │
│                                      │
│ [撮影ボタン]                         │
├──────────────────────────────────────┤
│ ヒント:                              │
│ • レシート全体が映るように           │
│ • 明るい場所で撮影                   │
│ • 文字がはっきり見えるように         │
└──────────────────────────────────────┘
```

### 2. OCR結果確認画面

```
┌──────────────────────────────────────┐
│ 抽出結果を確認                       │
├──────────────────────────────────────┤
│ 金額: ¥50,000 ✓                     │
│       [修正]                         │
│                                      │
│ 日付: 2024/10/26 ✓                  │
│       [修正]                         │
│                                      │
│ カテゴリ: 結婚祝い ✓                 │
│       [修正]                         │
├──────────────────────────────────────┤
│ 生テキスト:                          │
│ [────────────────]                   │
│ │ 結婚祝い                     │     │
│ │ 金額: 50,000円               │     │
│ │ 2024年10月26日               │     │
│ [────────────────]                   │
├──────────────────────────────────────┤
│ [この内容で登録] [再撮影]           │
└──────────────────────────────────────┘
```

### 3. 贈答品登録フォーム（OCR連携）

```
┌──────────────────────────────────────┐
│ 贈答品を登録                         │
├──────────────────────────────────────┤
│ [📷 レシートから読み取る]           │
│                                      │
│ 贈答品名: [____________] *           │
│ 贈り主: [選択 ▼] *                  │
│ 金額: [50,000] ← OCRで自動入力      │
│ 日付: [2024/10/26] ← OCRで自動入力  │
│ カテゴリ: [結婚祝い ▼] ← AI推測     │
│                                      │
│ [登録する]                           │
└──────────────────────────────────────┘
```

---

## 実装手順

### Phase 5.5: Tesseract.js実装（4-5時間）

1. **Tesseract.jsの導入**（1時間）
   ```bash
   npm install tesseract.js
   ```
   - Workerの初期化
   - 日本語言語データの読み込み
   - 基本的なOCR機能の実装

2. **画像前処理**（1時間）
   - コントラスト調整
   - ノイズ除去
   - リサイズ
   - グレースケール変換

3. **テキスト解析機能**（2時間）
   - 金額抽出
   - 日付抽出
   - カテゴリ推測
   - 正規表現パターンの最適化

4. **UI実装**（1時間）
   - OCR撮影画面
   - 結果確認画面
   - フォーム連携

### Phase 6: Google Cloud Vision API移行（3-4時間）

1. **Google Cloud Visionの導入**（1時間）
   - APIキーの取得
   - SDK導入
   - 認証設定

2. **API連携**（1時間）
   - Vision APIの呼び出し
   - エラーハンドリング
   - レート制限対応

3. **プロバイダー切り替え機能**（1時間）
   - Tesseract.js / Google Visionの切り替え
   - フォールバック機能
   - コスト管理

4. **精度向上**（1時間）
   - 結果の比較
   - 信頼度の評価
   - パラメータチューニング

---

## コスト試算

### Tesseract.js（無料）
- コスト: $0
- 処理時間: 5-10秒/画像
- 精度: 70-80%

### Google Cloud Vision API
- 月間想定リクエスト: 500リクエスト
- 無料枠: 1,000リクエスト/月
- コスト: $0（無料枠内）

超過した場合:
- 1,000リクエスト: $1.50
- 月間2,000リクエスト: $1.50（1,000は無料）

### 推奨戦略
1. Phase 5.5でTesseract.jsを実装
2. ユーザーが増えてきたらGoogle Cloud Visionに移行
3. 無料枠を超えそうな場合は警告表示

---

## パフォーマンス最適化

### 1. 画像の前処理
```typescript
async function preprocessImage(imageFile: File): Promise<File> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // 画像を読み込み
  const img = new Image();
  img.src = URL.createObjectURL(imageFile);
  await img.decode();
  
  // リサイズ（最大1920x1920）
  const maxSize = 1920;
  let width = img.width;
  let height = img.height;
  
  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height);
    width *= ratio;
    height *= ratio;
  }
  
  canvas.width = width;
  canvas.height = height;
  
  // コントラスト調整
  ctx.filter = 'contrast(1.2) brightness(1.1)';
  ctx.drawImage(img, 0, 0, width, height);
  
  // Blobに変換
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      resolve(new File([blob!], imageFile.name, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.9);
  });
}
```

### 2. キャッシング
- OCR結果のキャッシュ
- 同じ画像の再処理を避ける
- IndexedDBに保存

### 3. バックグラウンド処理
- Web Workerで処理
- UIのブロックを防ぐ
- 進捗表示

---

## セキュリティとプライバシー

### 1. データの取り扱い
- ✅ 画像はローカルで処理（Tesseract.js）
- ⚠️ Google Visionの場合はクラウド送信
- ✅ OCR結果はユーザーのみアクセス可能
- ✅ 画像は必要に応じて削除可能

### 2. APIキーの管理
- 環境変数で管理
- ハードコーディング禁止
- バックエンドプロキシ経由（推奨）

---

## テスト計画

### 単体テスト
- テキスト抽出のテスト
- 金額・日付抽出のテスト
- カテゴリ推測のテスト

### 統合テスト
- 画像からフォーム入力までの流れ
- エラーケースのテスト

### 精度テスト
- 様々なレシートでテスト
- 手書き文字のテスト
- 低解像度画像のテスト

---

## まとめ

OCR/AI解析機能は非常に有用ですが、実装には時間がかかります。
段階的なアプローチで実装することを推奨します。

**Phase 5.5推奨**: Tesseract.js実装（無料、オフライン対応）
**Phase 6推奨**: Google Cloud Vision API移行（高精度）

**想定実装時間**: 
- Phase 5.5: 4-5時間
- Phase 6: 3-4時間

**優先度**: 中
**難易度**: 中〜高
