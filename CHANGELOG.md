# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-10-19

### Added - PWA対応 (Phase 2)

#### Service Worker
- Service Workerによるアプリケーションシェルのキャッシュ
- オフライン動作対応（ネットワークなしでも利用可能）
- 複数のキャッシュ戦略を実装:
  - CacheFirst: 静的リソース（フォント、画像）
  - NetworkFirst: API リクエスト
  - AutoUpdate: アプリケーション本体

#### PWA UI コンポーネント
- `OfflineIndicator`: オフライン状態を表示するインジケーター
- `PWAInstallPrompt`: ホーム画面への追加を促すプロンプト
- `UpdatePrompt`: 新バージョン利用可能時の更新通知

#### カスタムフック
- `useOnlineStatus()`: オンライン/オフライン状態の検知
- `usePWAInstall()`: PWAインストール機能の提供
- `useSWUpdate()`: Service Worker更新管理

#### テスト
- PWA機能のE2Eテストを追加・拡充
- オフライン動作のテストケース追加
- Service Worker登録テスト
- キャッシュ戦略のテスト

#### ドキュメント
- `docs/PWA_SETUP.md`: PWAセットアップガイドを追加
- README.md にPWA機能の説明を追加
- アイコン生成スクリプトとテンプレートを追加

#### 設定
- `vite.config.ts`: PWA設定を最適化
  - Workbox キャッシュ戦略
  - マニフェスト詳細設定
  - 開発モードでのPWA有効化
- ビルド最適化（コード分割、チャンク最適化）

### Changed
- `App.tsx`: PWA UIコンポーネントを統合
- プロジェクト構造を更新（`src/hooks/` ディレクトリを追加）

### Technical Details
- Vite PWA Plugin v1.1.0 を使用
- Workbox によるService Worker自動生成
- IndexedDB と Service Worker の連携
- オフラインファースト戦略の実装

---

## [0.1.0] - 2025-XX-XX

### Added - Phase 1 基本機能

#### コア機能
- 贈答品の登録・管理（一覧、詳細、編集、削除）
- 人物の登録・管理（一覧、詳細、編集、削除）
- ダッシュボード（統計情報表示）
- 統計・分析機能

#### データ管理
- IndexedDBによるローカルストレージ
- リポジトリパターンの実装
- データベーススキーマ設計

#### UI/UX
- レスポンシブデザイン（モバイル、タブレット、PC対応）
- Tailwind CSS によるモダンなデザイン
- 再利用可能なUIコンポーネント
- ダークモード対応の準備

#### テスト
- 単体テスト（Vitest）
- 統合テスト
- E2Eテスト（Playwright）
- コンポーネントテスト

#### セキュリティ
- セキュリティチェックスクリプト
- 機密情報のハードコーディング検出
- pre-commitフック

#### 技術スタック
- React 19
- TypeScript 5.9
- Vite 7.1
- IndexedDB (idb 8.0)
- React Router 7.9
- Chart.js 4.5
- date-fns 4.1

---

## 今後の予定

### Phase 3: クラウド同期
- Firebase統合
- 認証機能（Email/Password、Google OAuth）
- Firestore同期
- Background Sync API

### Phase 4: 高度な機能
- カメラ撮影機能
- お返し管理
- リマインダー機能
- 詳細分析機能

### Phase 5: 将来機能
- 広告表示
- OCR/AI解析
- 複数人での共有機能
