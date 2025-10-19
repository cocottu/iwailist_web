# システムアーキテクチャ設計書

## 1. 全体構成

### 1.1 システム構成図

```mermaid
graph TB
    subgraph Browser["ブラウザ環境"]
        UI[React UI<br/>TypeScript + Vite]
        SW[Service Worker<br/>キャッシュ・同期管理<br/>Phase 2]
        IDB[(IndexedDB<br/>ローカルストレージ)]
        Camera[Camera API<br/>写真撮影<br/>Phase 2]
    end
    
    subgraph Firebase["Firebase (Spark Plan) - Phase 3"]
        Auth[Authentication<br/>認証管理]
        FS[(Firestore<br/>クラウドDB)]
        Storage[(Storage<br/>画像保管)]
        Hosting[Hosting<br/>配信]
    end
    
    UI -->|データ操作| IDB
    UI -->|カメラ制御<br/>Phase 2| Camera
    SW -->|キャッシュ| UI
    SW -->|Background Sync| IDB
    IDB <-->|双方向同期<br/>Phase 3| FS
    UI -->|認証<br/>Phase 3| Auth
    UI -->|画像アップロード<br/>Phase 3| Storage
    Hosting -->|配信| Browser
    Auth -->|認可| FS
    Auth -->|認可| Storage
```

### 1.2 アーキテクチャパターン

**オフラインファーストアーキテクチャ**を採用:

1. **ローカルファースト**: すべての操作はまずIndexedDBに保存
2. **バックグラウンド同期**: オンライン時にFirestoreと自動同期
3. **キャッシュ優先**: Service Workerによるアプリケーションシェルのキャッシュ

## 2. レイヤー構成

```mermaid
graph LR
    subgraph Presentation["プレゼンテーション層"]
        Components[Reactコンポーネント]
        Hooks[カスタムフック]
    end
    
    subgraph Business["ビジネスロジック層"]
        Services[サービス層]
        State[状態管理]
    end
    
    subgraph Data["データアクセス層"]
        LocalDB[IndexedDB管理]
        CloudDB[Firebase管理]
        Sync[同期マネージャー]
    end
    
    Components --> Hooks
    Hooks --> Services
    Services --> State
    Services --> LocalDB
    Services --> CloudDB
    LocalDB <--> Sync
    CloudDB <--> Sync
```

### 2.1 各層の責務

| 層 | 責務 | 主要技術 |
|---|---|---|
| プレゼンテーション層 | UI表示、ユーザー入力処理 | React, TypeScript |
| ビジネスロジック層 | データ処理、バリデーション、状態管理 | React Context/Hooks |
| データアクセス層 | データ永続化、同期処理 | IndexedDB, Firestore |

## 3. 技術スタック詳細

### 3.1 フロントエンド

```mermaid
graph TD
    Vite[Vite<br/>ビルドツール]
    React[React 19+<br/>UIフレームワーク]
    TS[TypeScript<br/>型安全性]
    Router[React Router<br/>ルーティング]
    
    Vite --> React
    React --> TS
    React --> Router
```

**主要ライブラリ**:
- **React 19**: UIフレームワーク
- **TypeScript 5.2+**: 型安全な開発
- **Vite 7**: 高速ビルド・開発サーバー
- **React Router 6**: SPAルーティング
- **Chart.js 4**: グラフ表示
- **date-fns 3**: 日付処理

### 3.2 データストレージ

**ローカル (IndexedDB)**:
- 全データのローカルキャッシュ
- オフライン時の読み書き
- ライブラリ: `idb` (Promise-based wrapper)

**クラウド (Firestore)**:
- マルチデバイス同期
- バックアップ
- NoSQLドキュメント指向DB

### 3.3 PWA対応 (Phase 2実装完了)

**Service Worker**:
- アプリケーションシェルのキャッシュ
- オフライン動作
- Background Sync API
- Push Notifications

**Manifest**:
- アプリアイコン、スプラッシュ画面
- インストール可能なPWA

## 4. データフロー

### 4.1 データ書き込みフロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant UI as React UI
    participant Service as サービス層
    participant IDB as IndexedDB
    participant Sync as 同期マネージャー
    participant FS as Firestore
    
    User->>UI: データ入力
    UI->>Service: データ保存リクエスト
    Service->>IDB: ローカル保存
    IDB-->>Service: 保存完了
    Service-->>UI: 即座にレスポンス
    
    alt オンライン時
        Sync->>IDB: 未同期データ取得
        Sync->>FS: クラウドに同期
        FS-->>Sync: 同期完了
    else オフライン時
        Sync->>IDB: 同期待ちフラグ設定
        Note over Sync: オンライン復帰時に自動同期
    end
```

### 4.2 データ読み込みフロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant UI as React UI
    participant Service as サービス層
    participant IDB as IndexedDB
    participant FS as Firestore
    
    User->>UI: データ表示リクエスト
    UI->>Service: データ取得
    Service->>IDB: ローカルから取得
    IDB-->>Service: データ返却
    Service-->>UI: 即座に表示
    
    alt オンライン時
        Service->>FS: 最新データ確認
        FS-->>Service: 更新があれば取得
        Service->>IDB: ローカル更新
        Service-->>UI: UI更新
    end
```

## 5. パフォーマンス戦略

### 5.1 最適化手法

| 手法 | 適用箇所 | 効果 |
|---|---|---|
| Code Splitting | ルート単位でのコード分割 | 初期ロード時間短縮 |
| Lazy Loading | 画像・重いコンポーネント | メモリ節約 |
| Service Worker Cache | 静的アセット | オフライン動作 |
| 画像圧縮 | アップロード時 | ストレージ節約 |
| IndexedDB | データキャッシュ | 高速読み込み |

### 5.2 目標指標

- **初回ロード**: < 3秒
- **画面遷移**: < 200ms
- **データ保存**: < 100ms (ローカル)

## 6. エラーハンドリング戦略

```mermaid
graph TD
    Error[エラー発生]
    Type{エラー種別}
    Network[ネットワークエラー]
    Auth[認証エラー]
    Data[データエラー]
    
    Error --> Type
    Type -->|接続失敗| Network
    Type -->|認証失敗| Auth
    Type -->|バリデーション| Data
    
    Network -->|Queue| Retry[リトライキュー]
    Auth -->|Redirect| Login[ログイン画面]
    Data -->|Notify| UserMsg[ユーザー通知]
    
    Retry -->|Online| Sync[再同期]
```

**エラー対応方針**:
- **ネットワークエラー**: リトライキューに追加、オンライン復帰時に自動再試行
- **認証エラー**: ログイン画面にリダイレクト、セッション再構築
- **データエラー**: ユーザーフレンドリーなメッセージ表示

## 7. スケーラビリティ考慮

### 7.1 現在の設計
- 個人利用を想定
- Firebase Spark Plan (無料枠)
- 単一ユーザーのマルチデバイス対応

### 7.2 将来の拡張性
- **Phase 5対応**: 複数人での共有機能
- **有料プランへの移行**: Blaze Planへのスムーズな移行パス
- **マイクロサービス化**: 必要に応じて機能を分離可能な設計

