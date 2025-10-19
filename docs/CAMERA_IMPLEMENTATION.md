# カメラ機能実装ガイド

## 概要

Phase 2のカメラ撮影機能が実装されました。このドキュメントでは、実装された機能の詳細と使用方法について説明します。

## 実装された機能

### 1. カメラ撮影機能
- ブラウザのMediaDevices APIを使用したカメラアクセス
- フロント/リアカメラの切り替え
- リアルタイムプレビュー
- 写真撮影とプレビュー

### 2. 画像処理
- 自動画像圧縮（最大1920x1080）
- JPEG形式での保存（品質: 85%）
- サムネイル生成（将来拡張用）
- ファイルサイズの最適化

### 3. データ保存
- IndexedDBへのData URL形式での保存
- 画像の順序管理
- エンティティ（贈答品/お返し）との紐付け

## アーキテクチャ

### ファイル構成

```
src/
├── components/ui/
│   └── CameraCapture.tsx          # カメラUIコンポーネント
├── hooks/
│   └── useCamera.ts               # カメラ操作フック
├── utils/
│   ├── camera.ts                  # カメラ機能ユーティリティ
│   └── imageProcessing.ts         # 画像処理ユーティリティ
└── pages/
    ├── GiftForm.tsx               # カメラ統合済み
    └── GiftDetail.tsx             # 画像表示機能統合済み
```

## 実装詳細

### 1. カメラユーティリティ (`src/utils/camera.ts`)

#### 主要な関数

```typescript
// カメラストリームの取得
getCameraStream(constraints?: CameraConstraints): Promise<MediaStream>

// カメラデバイスのリスト取得
getCameraDevices(): Promise<CameraDevice[]>

// 写真撮影
capturePhoto(videoElement: HTMLVideoElement, quality?: number): Promise<Blob>

// ストリームの停止
stopCameraStream(stream: MediaStream): void

// BlobとData URLの相互変換
blobToDataURL(blob: Blob): Promise<string>
dataURLToBlob(dataURL: string): Blob
```

#### エラーハンドリング

- `NotAllowedError`: カメラアクセスが拒否された場合
- `NotFoundError`: カメラが見つからない場合
- `AppError`: カスタムエラー型で統一的に処理

### 2. 画像処理ユーティリティ (`src/utils/imageProcessing.ts`)

#### 主要な関数

```typescript
// 画像圧縮
compressImage(
  file: File | Blob,
  options?: Partial<CompressOptions>
): Promise<Blob>

// 画像サイズの取得
getImageDimensions(file: File | Blob): Promise<{ width: number; height: number }>

// サムネイル生成
generateThumbnail(file: File | Blob, size?: number): Promise<Blob>

// ファイルサイズのフォーマット
formatFileSize(bytes: number): string
```

#### デフォルト圧縮オプション

```typescript
{
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85
}
```

### 3. カメラフック (`src/hooks/useCamera.ts`)

#### 使用例

```typescript
const {
  stream,
  devices,
  isActive,
  isProcessing,
  error,
  startCamera,
  stopCamera,
  switchCamera,
  capturePhotoAsDataURL,
  capturePhotoAsBlob
} = useCamera({
  defaultFacingMode: 'environment',
  autoStart: true,
  compress: true
});
```

#### 主要なプロパティ

- `stream`: 現在のMediaStreamオブジェクト
- `devices`: 利用可能なカメラデバイスのリスト
- `isActive`: カメラが起動中かどうか
- `isProcessing`: 処理中かどうか
- `error`: エラー情報

#### 主要なメソッド

- `startCamera(deviceId?)`: カメラを起動
- `stopCamera()`: カメラを停止
- `switchCamera()`: カメラを切り替え
- `capturePhotoAsDataURL(videoElement)`: 写真撮影（Data URL）
- `capturePhotoAsBlob(videoElement)`: 写真撮影（Blob）

### 4. カメラキャプチャコンポーネント (`src/components/ui/CameraCapture.tsx`)

#### プロパティ

```typescript
interface CameraCaptureProps {
  onCapture: (dataURL: string) => void;
  onCancel: () => void;
  defaultFacingMode?: 'user' | 'environment';
  compressOptions?: {
    maxWidth: number;
    maxHeight: number;
    quality: number;
  };
}
```

#### 機能

1. **カメラプレビュー**
   - リアルタイムでカメラ映像を表示
   - フルスクリーンモーダル形式

2. **撮影コントロール**
   - 撮影ボタン（大きな円形ボタン）
   - カメラ切り替えボタン（複数デバイスがある場合）
   - キャンセルボタン

3. **撮影後の確認**
   - 撮影した写真のプレビュー
   - 再撮影/確定の選択

4. **エラーハンドリング**
   - カメラアクセスエラーの表示
   - 再試行機能

## 使用方法

### GiftFormでの使用例

```typescript
const [images, setImages] = useState<string[]>([]);
const [showCamera, setShowCamera] = useState(false);

// カメラ起動ボタン
<Button onClick={() => setShowCamera(true)}>
  写真を撮影
</Button>

// カメラキャプチャモーダル
{showCamera && (
  <CameraCapture
    onCapture={(dataURL) => {
      setImages([...images, dataURL]);
      setShowCamera(false);
    }}
    onCancel={() => setShowCamera(false)}
  />
)}
```

### 画像の保存

```typescript
const imageRepo = new ImageRepository();

for (let i = 0; i < images.length; i++) {
  const imageData: Image = {
    id: crypto.randomUUID(),
    entityId: giftId,
    entityType: 'gift',
    imageUrl: images[i], // Data URL形式
    order: i,
    createdAt: new Date()
  };
  await imageRepo.create(imageData);
}
```

### 画像の読み込みと表示

```typescript
const imageRepo = new ImageRepository();
const giftImages = await imageRepo.getByEntityId(giftId);

// 画像を順序通りに並べ替え
const sortedImages = giftImages.sort((a, b) => a.order - b.order);

// 画像を表示
{sortedImages.map((image, index) => (
  <img key={image.id} src={image.imageUrl} alt={`写真 ${index + 1}`} />
))}
```

## セキュリティとプライバシー

### カメラアクセス

- ユーザーの明示的な許可が必要
- HTTPSまたはlocalhostでのみ動作
- ブラウザの権限設定に従う

### データ保存

- すべての画像はローカル（IndexedDB）に保存
- 外部サーバーへの送信なし
- ユーザーのデバイス内で完結

### 画像圧縮

- 自動的に画像を圧縮してストレージを節約
- 品質とファイルサイズのバランスを最適化
- 個人情報の保護（機密情報はハードコーディングしない）

## ブラウザ対応

### 必要なAPI

- **MediaDevices API**: カメラアクセス
- **Canvas API**: 画像処理
- **FileReader API**: Data URL変換
- **IndexedDB**: データ保存

### 対応ブラウザ

- ✅ Chrome 53+
- ✅ Firefox 36+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Chrome for Android 53+
- ✅ Safari for iOS 11+

### 非対応の場合

- エラーメッセージを表示
- 代替手段（ファイル選択）は将来実装予定

## パフォーマンス最適化

### 画像圧縮

- デフォルトで最大1920x1080にリサイズ
- JPEG品質85%で最適化
- 典型的なファイルサイズ: 200KB-500KB

### メモリ管理

- 使用後はMediaStreamを適切に停止
- コンポーネントのアンマウント時にリソースをクリーンアップ
- Data URLは必要な場合のみ保持

### レンダリング最適化

- カメラプレビューはフルスクリーンモーダル
- 画像ギャラリーは遅延読み込み（将来実装）
- サムネイル表示（将来実装）

## トラブルシューティング

### カメラが起動しない

1. **ブラウザの対応確認**
   - MediaDevices APIがサポートされているか確認

2. **権限の確認**
   - ブラウザの設定でカメラ権限を確認
   - HTTPSまたはlocalhostでアクセスしているか確認

3. **デバイスの確認**
   - カメラデバイスが接続されているか確認
   - 他のアプリケーションでカメラが使用されていないか確認

### 画像が保存されない

1. **IndexedDBの確認**
   - ブラウザのDevToolsでIndexedDBを確認
   - ストレージ容量を確認

2. **エラーログの確認**
   - コンソールでエラーメッセージを確認

### 画像が表示されない

1. **Data URL形式の確認**
   - 正しいData URL形式で保存されているか確認
   - `data:image/jpeg;base64,`で始まるか確認

2. **画像の読み込み確認**
   - ImageRepositoryから正しく読み込まれているか確認

## 今後の拡張予定

### Phase 3以降

1. **ファイル選択機能**
   - ギャラリーからの画像選択
   - ファイルアップロード

2. **画像編集機能**
   - トリミング
   - 回転
   - フィルター適用

3. **クラウド同期**
   - Firebase Storageへのアップロード
   - デバイス間での画像同期
   - 画像のバックアップ

4. **OCR/AI機能**
   - テキスト認識
   - 金額の自動抽出
   - カテゴリの自動分類

5. **パフォーマンス改善**
   - WebPフォーマット対応
   - Progressive loading
   - サムネイルの自動生成

## 参考資料

- [MDN: MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- [MDN: Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Web.dev: Media capture and constraints](https://web.dev/media-capturing-images/)

## まとめ

Phase 2のカメラ機能実装により、以下が可能になりました：

✅ ブラウザからのカメラアクセス  
✅ リアルタイムプレビュー  
✅ 写真撮影と圧縮  
✅ IndexedDBへの保存  
✅ 画像の表示とギャラリー  
✅ フロント/リアカメラの切り替え  

次のPhaseでは、クラウド同期とさらなる画像機能の拡張を予定しています。
