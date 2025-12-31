# Google AdSense 設定ガイド

このドキュメントでは、Iwailist WebアプリケーションにGoogle AdSenseを統合する手順を説明します。

## 📋 目次

1. [前提条件](#前提条件)
2. [Google AdSenseへの申請](#google-adsenseへの申請)
3. [環境変数の設定](#環境変数の設定)
4. [コンポーネントの配置](#コンポーネントの配置)
5. [動作確認](#動作確認)
6. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

- ✅ 本番環境でアプリケーションが公開されている
- ✅ 独自ドメインまたはFirebase Hostingで運用している
- ✅ HTTPSでアクセス可能（AdSenseの必須要件）
- ✅ コンテンツポリシーに準拠している

---

## Google AdSenseへの申請

### ステップ1: AdSenseアカウントの作成

1. [Google AdSense](https://www.google.com/adsense/)にアクセス
2. Googleアカウントでログイン
3. 「今すぐ始める」をクリック
4. サイトのURLを入力して申請

### ステップ2: サイトの審査

- **審査期間**: 通常1〜2週間（場合によっては数週間かかることもあります）
- **審査内容**:
  - サイトのコンテンツ品質
  - プライバシーポリシーの有無
  - 利用規約の有無
  - ユーザー体験の質
  - トラフィック量

### ステップ3: 審査通過後の設定

1. AdSenseダッシュボードにログイン
2. 「広告」→「広告ユニット」から新しい広告ユニットを作成
3. 広告の種類を選択（例: 表示広告、インフィード広告など）
4. 広告サイズとスタイルを設定
5. 広告コードを取得（後で使用します）

---

## 環境変数の設定

### ステップ1: 広告IDの取得

AdSenseダッシュボードから以下を取得します：

- **クライアントID**: `ca-pub-XXXXXXXXXXXXXXXX` 形式
- **スロットID**: 各広告ユニットごとに異なる数値ID

### ステップ2: 環境変数ファイルの編集

#### 開発環境（`.env.local`）

```bash
# Google AdSense Configuration
VITE_ADSENSE_CLIENT_ID=ca-pub-1234567890123456
VITE_ADSENSE_SLOT=1234567890
```

#### 本番環境（GitHub Secrets / 環境変数）

CI/CDパイプラインで使用する環境変数として設定：

- `VITE_ADSENSE_CLIENT_ID`: AdSenseクライアントID
- `VITE_ADSENSE_SLOT`: 広告スロットID

**GitHub Actionsでの設定方法**:

1. リポジトリの「Settings」→「Secrets and variables」→「Actions」
2. 「New repository secret」をクリック
3. 以下のシークレットを追加:
   - `VITE_ADSENSE_CLIENT_ID`
   - `VITE_ADSENSE_SLOT`

### ステップ3: 環境変数の確認

`.env.example`ファイルを参照して、正しい形式で設定されているか確認してください：

```bash
# Google AdSense Configuration (Optional)
# AdSenseのクライアントID（例: ca-pub-1234567890123456）
VITE_ADSENSE_CLIENT_ID=
# 広告スロットID（各広告ユニットごとに異なる）
VITE_ADSENSE_SLOT=
```

---

## コンポーネントの配置

### ステップ1: AdScriptコンポーネントの追加

`src/App.tsx`またはメインのレイアウトコンポーネントに`AdScript`を追加します：

```tsx
import AdScript from '@/components/ads/AdScript';

function App() {
  return (
    <Router>
      <AdScript /> {/* これを追加 */}
      {/* その他のコンポーネント */}
    </Router>
  );
}
```

**重要**: `AdScript`は1回だけ読み込む必要があります。通常は`App.tsx`のルートレベルに配置します。

### ステップ2: AdBannerコンポーネントの配置

広告を表示したいページに`AdBanner`コンポーネントを配置します：

```tsx
import AdBanner from '@/components/ads/AdBanner';

function Dashboard() {
  return (
    <div>
      <h1>ダッシュボード</h1>
      
      {/* 広告を表示したい位置に配置 */}
      <AdBanner 
        format="auto"        // オプション: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
        responsive={true}    // オプション: レスポンシブ表示
        className="my-4"     // オプション: カスタムCSSクラス
      />
      
      {/* その他のコンテンツ */}
    </div>
  );
}
```

### ステップ3: 推奨される配置場所

広告を効果的に配置するための推奨場所：

1. **ダッシュボードページ**: コンテンツの上部または下部
2. **リストページ**: リスト項目の間（適度な間隔を空ける）
3. **詳細ページ**: コンテンツの下部

**注意**: 
- 広告を過度に配置しない（ユーザー体験を損なう）
- コンテンツの主要部分を広告で隠さない
- AdSenseのポリシーに準拠した配置を行う

---

## 動作確認

### 開発環境での確認

1. 環境変数を設定（`.env.local`）
2. 開発サーバーを起動:
   ```bash
   npm run dev
   ```
3. ブラウザでアプリケーションにアクセス
4. 開発モードでは、広告の代わりにプレースホルダーが表示されます：
   ```
   広告スペース（開発モード）
   AdSense設定後に広告が表示されます
   ```

### 本番環境での確認

1. 環境変数が正しく設定されているか確認
2. アプリケーションをビルド:
   ```bash
   npm run build
   ```
3. 本番環境にデプロイ
4. ブラウザで本番サイトにアクセス
5. 広告が表示されることを確認

**注意**: 
- AdSenseの審査が通過していない場合、広告は表示されません
- 初回表示までに数時間かかる場合があります
- 広告ブロッカーが有効な場合は表示されません

---

## トラブルシューティング

### 広告が表示されない

#### 1. 環境変数の確認

```bash
# 開発環境で確認
console.log(import.meta.env.VITE_ADSENSE_CLIENT_ID);
console.log(import.meta.env.VITE_ADSENSE_SLOT);
```

環境変数が正しく読み込まれているか確認してください。

#### 2. AdSenseの審査状況

- AdSenseダッシュボードで審査が通過しているか確認
- 審査が通過していない場合、広告は表示されません

#### 3. ブラウザのコンソール確認

開発者ツール（F12）のコンソールでエラーメッセージを確認：

```javascript
// 正常な場合
"AdSense script loaded successfully"

// エラーの場合
"Failed to load AdSense script"
"AdSense error: ..."
```

#### 4. 広告ブロッカーの確認

- ブラウザの広告ブロッカー拡張機能を無効化
- プライベートモードで確認

#### 5. ドメインの確認

- AdSenseに登録したドメインと一致しているか確認
- サブドメインの場合は、AdSenseで許可されているか確認

### 開発モードでプレースホルダーが表示されない

- 環境変数が設定されていない場合、本番環境では何も表示されません
- 開発環境（`npm run dev`）では、プレースホルダーが表示されるはずです

### スクリプトが重複読み込みされる

`AdScript`コンポーネントは重複読み込みを防ぐ機能が組み込まれていますが、複数の場所に配置している場合は削除してください。

### 広告のレイアウトが崩れる

- `className`プロパティでカスタムスタイルを追加
- `format`プロパティで広告の形式を変更
- `responsive={false}`でレスポンシブ表示を無効化

---

## 実装済みの機能

### コンポーネント

- ✅ `src/components/ads/AdBanner.tsx` - 広告バナーコンポーネント
- ✅ `src/components/ads/AdScript.tsx` - AdSenseスクリプトローダー

### 機能

- ✅ 環境変数による設定管理
- ✅ 開発モードでのプレースホルダー表示
- ✅ スクリプトの重複読み込み防止
- ✅ エラーハンドリング
- ✅ レスポンシブ対応

---

## 参考資料

- [Google AdSense公式サイト](https://www.google.com/adsense/)
- [AdSenseヘルプセンター](https://support.google.com/adsense)
- [AdSenseポリシー](https://support.google.com/adsense/answer/48182)
- [PHASE5_COMPLETED.md](../PHASE5_COMPLETED.md) - 実装完了報告

---

## 次のステップ

広告が正常に表示されたら：

1. 広告の配置を最適化（クリック率の向上）
2. 複数の広告ユニットを作成してA/Bテスト
3. AdSenseダッシュボードでパフォーマンスを監視
4. 収益レポートを確認

---

**最終更新**: 2025-01-XX  
**関連ドキュメント**: [PHASE5_COMPLETED.md](../PHASE5_COMPLETED.md)
