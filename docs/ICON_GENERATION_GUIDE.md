# PWAアイコン生成ガイド

## 提供された画像からアイコンを生成する方法

### 必要なアイコンサイズ

以下の4つのPNGファイルが必要です：

```
public/
├── pwa-192x192.png              (192x192px, 通常アイコン)
├── pwa-512x512.png              (512x512px, 通常アイコン)
├── pwa-maskable-192x192.png     (192x192px, マスカブル)
└── pwa-maskable-512x512.png     (512x512px, マスカブル)
```

## 方法1: PWA Builder（推奨・最も簡単）

### 手順

1. **PWA Builderにアクセス**
   - URL: https://www.pwabuilder.com/imageGenerator

2. **画像をアップロード**
   - 提供されたロゴ画像をアップロード
   - 推奨サイズ: 最低512x512px以上

3. **オプション設定**
   - "Padding": 0-10%程度（画像が切れないように調整）
   - "Background Color": 白色（#ffffff）または透明
   - "Generate Maskable Icons": チェックを入れる

4. **ダウンロード**
   - "Generate"ボタンをクリック
   - ZIPファイルをダウンロード

5. **ファイルを配置**
   ```bash
   # ZIPを解凍後、以下のファイルをコピー
   cp android-chrome-192x192.png public/pwa-192x192.png
   cp android-chrome-512x512.png public/pwa-512x512.png
   cp android-chrome-maskable-192x192.png public/pwa-maskable-192x192.png
   cp android-chrome-maskable-512x512.png public/pwa-maskable-512x512.png
   ```

---

## 方法2: RealFaviconGenerator

### 手順

1. **サイトにアクセス**
   - URL: https://realfavicongenerator.net/

2. **画像をアップロード**
   - "Select your Favicon image"ボタンをクリック
   - ロゴ画像をアップロード

3. **Android Chrome設定**
   - "Android Chrome"セクションで設定
   - "Picture for manifest": 提供された画像を使用
   - "Margin": 適切に調整
   - "Theme color": #3B82F6（アプリのテーマカラー）

4. **生成とダウンロード**
   - 画面下部の"Generate your Favicons and HTML code"をクリック
   - "Favicon package"をダウンロード

5. **必要なファイルを配置**
   ```bash
   # 必要なファイルだけをコピー
   cp android-chrome-192x192.png public/pwa-192x192.png
   cp android-chrome-512x512.png public/pwa-512x512.png
   # マスカブル版は別途作成が必要
   ```

---

## 方法3: ImageMagick（コマンドライン）

### 前提条件
- ImageMagickがインストールされていること

### 手順

```bash
# ImageMagickのインストール（未インストールの場合）
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick

# 画像を配置（元の画像をlogo-original.pngとして保存）
cd public/

# 通常アイコンの生成
convert logo-original.png -resize 192x192 -background white -gravity center -extent 192x192 pwa-192x192.png
convert logo-original.png -resize 512x512 -background white -gravity center -extent 512x512 pwa-512x512.png

# マスカブル版の生成（パディングを追加）
convert logo-original.png -resize 154x154 -background white -gravity center -extent 192x192 pwa-maskable-192x192.png
convert logo-original.png -resize 410x410 -background white -gravity center -extent 512x512 pwa-maskable-512x512.png
```

---

## 方法4: Figma/Photoshop

### Figmaの場合

1. **新規ファイル作成**
   - 512x512pxのフレームを作成

2. **画像をインポート**
   - ロゴ画像をドラッグ&ドロップ

3. **サイズ調整**
   - 画像を中央配置
   - 通常版: フレームいっぱいに配置
   - マスカブル版: 80%サイズに縮小（周囲に余白）

4. **エクスポート**
   - フレームを選択 → Export
   - PNG形式、各サイズでエクスポート

### Photoshopの場合

1. **新規ドキュメント作成**
   - サイズ: 512x512px
   - 解像度: 72 dpi
   - カラーモード: RGB

2. **画像を配置**
   - ロゴ画像をインポート
   - 中央配置

3. **サイズ調整**
   - 通常版: 画像をフレーム全体に配置
   - マスカブル版: 80%に縮小して配置

4. **書き出し**
   - "Web用に保存" → PNG-24
   - 各サイズで書き出し

---

## マスカブルアイコンとは？

マスカブルアイコンは、Android等のプラットフォームで様々な形状（円形、角丸、スクウォークル等）にマスクされても、重要な部分が切れないように設計されたアイコンです。

### セーフゾーン
- **中央80%**: 絶対に切れてはいけない重要な部分
- **外側20%**: 切れても問題ない余白

### 推奨設定
```
512x512px の場合:
- セーフゾーン: 中央410x410px
- パディング: 各辺51px
```

---

## 検証方法

### 1. ローカルで確認

```bash
# ビルド
npm run build

# プレビュー
npm run preview
```

ブラウザで http://localhost:4173 にアクセスし、DevToolsで確認：
1. Application タブ → Manifest
2. アイコンが正しく表示されているか確認

### 2. Lighthouseで確認

1. Chrome DevTools → Lighthouse
2. "Progressive Web App" カテゴリをチェック
3. "Generate report" をクリック
4. アイコン関連の項目を確認

### 3. Maskable.appで確認

マスカブルアイコンの表示を確認：
1. https://maskable.app/editor にアクセス
2. 生成したマスカブルアイコンをアップロード
3. 各種シェイプでの表示を確認

---

## トラブルシューティング

### アイコンが表示されない

1. **ファイル名を確認**
   - 正確に以下の名前になっているか確認
   - `pwa-192x192.png`
   - `pwa-512x512.png`
   - `pwa-maskable-192x192.png`
   - `pwa-maskable-512x512.png`

2. **ファイルパスを確認**
   - `public/` ディレクトリに配置されているか

3. **キャッシュをクリア**
   ```bash
   # Service Workerをアンインストール
   # DevTools > Application > Service Workers > Unregister
   
   # ブラウザキャッシュをクリア
   # DevTools > Application > Clear storage > Clear site data
   ```

4. **ビルドし直す**
   ```bash
   npm run build
   npm run preview
   ```

### マスカブルアイコンで画像が切れる

- 画像を80%サイズに縮小
- 周囲に十分な余白（20%）を確保
- Maskable.appで事前確認

### 画質が悪い

- 元画像のサイズを確認（最低512x512px以上推奨）
- ベクター形式（SVG）から変換すると品質が良い
- エクスポート時のPNG品質設定を確認

---

## 推奨ワークフロー

```bash
# 1. 画像を準備
# 提供されたロゴ画像を使用

# 2. PWA Builderで生成（最も簡単）
# https://www.pwabuilder.com/imageGenerator

# 3. ダウンロードしたファイルを配置
mv ~/Downloads/pwa-assets/* public/

# 4. ファイル名を確認・リネーム
ls -la public/pwa-*.png

# 5. ビルドして確認
npm run build
npm run preview

# 6. Lighthouseでテスト
# Chrome DevTools > Lighthouse > Generate report
```

---

## チェックリスト

アイコン生成が完了したら、以下を確認：

- [ ] `public/pwa-192x192.png` が存在する
- [ ] `public/pwa-512x512.png` が存在する
- [ ] `public/pwa-maskable-192x192.png` が存在する
- [ ] `public/pwa-maskable-512x512.png` が存在する
- [ ] 各ファイルのサイズが正しい（192x192、512x512）
- [ ] 画像が鮮明で、ぼやけていない
- [ ] マスカブルアイコンで重要部分が切れない
- [ ] ビルドが成功する
- [ ] ローカルプレビューでアイコンが表示される
- [ ] Lighthouseスコアで問題が出ない

---

## 参考リンク

- [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Maskable.app Editor](https://maskable.app/editor)
- [MDN - Web app manifests](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Google - Adaptive icon support](https://web.dev/maskable-icon/)

---

**次のステップ:** アイコン生成後は `docs/PWA_IMPLEMENTATION_SUMMARY.md` の該当チェックボックスを更新してください。
