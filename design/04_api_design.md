# API・インターフェース設計書

## 1. Firebase API使用方法

### 1.1 Firebase Authentication

**初期化**:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
```

**認証メソッド**:
```typescript
// Email/Password サインアップ
signUpWithEmail(email: string, password: string): Promise<User>

// Email/Password ログイン
signInWithEmail(email: string, password: string): Promise<User>

// Google OAuth
signInWithGoogle(): Promise<User>

// ログアウト
signOut(): Promise<void>

// 認証状態監視
onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe
```

### 1.2 Firestore Database

**コレクション操作**:
```typescript
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

const db = getFirestore(app);

// ドキュメント作成/更新
async function createGift(userId: string, gift: Gift): Promise<void> {
  const giftRef = doc(collection(db, 'users', userId, 'gifts'));
  await setDoc(giftRef, {
    ...gift,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

// ドキュメント取得
async function getGift(userId: string, giftId: string): Promise<Gift | null> {
  const giftRef = doc(db, 'users', userId, 'gifts', giftId);
  const snapshot = await getDoc(giftRef);
  return snapshot.exists() ? snapshot.data() as Gift : null;
}

// クエリ
async function getGiftsByStatus(userId: string, status: string): Promise<Gift[]> {
  const giftsRef = collection(db, 'users', userId, 'gifts');
  const q = query(
    giftsRef,
    where('returnStatus', '==', status),
    orderBy('receivedDate', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gift));
}

// リアルタイムリスナー
function subscribeToGifts(userId: string, callback: (gifts: Gift[]) => void): Unsubscribe {
  const giftsRef = collection(db, 'users', userId, 'gifts');
  return onSnapshot(giftsRef, (snapshot) => {
    const gifts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gift));
    callback(gifts);
  });
}
```

### 1.3 Firebase Storage

**画像アップロード**:
```typescript
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storage = getStorage(app);

async function uploadImage(
  userId: string,
  file: File,
  path: string
): Promise<string> {
  // 画像圧縮
  const compressedBlob = await compressImage(file, {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.8
  });
  
  // アップロード
  const storageRef = ref(storage, `users/${userId}/${path}`);
  await uploadBytes(storageRef, compressedBlob);
  
  // URL取得
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

// 画像削除
async function deleteImage(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
```

## 2. 内部API設計 (Custom Hooks)

### 2.1 データ管理フック

```typescript
// 贈答品管理
interface UseGiftsReturn {
  gifts: Gift[];
  loading: boolean;
  error: Error | null;
  createGift: (gift: Omit<Gift, 'id'>) => Promise<void>;
  updateGift: (id: string, gift: Partial<Gift>) => Promise<void>;
  deleteGift: (id: string) => Promise<void>;
  getGiftById: (id: string) => Gift | undefined;
  refetch: () => Promise<void>;
}

function useGifts(filters?: GiftFilters): UseGiftsReturn;

// 人物管理
interface UsePersonsReturn {
  persons: Person[];
  loading: boolean;
  error: Error | null;
  createPerson: (person: Omit<Person, 'id'>) => Promise<void>;
  updatePerson: (id: string, person: Partial<Person>) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  getPersonById: (id: string) => Person | undefined;
}

function usePersons(): UsePersonsReturn;

// お返し管理
interface UseReturnsReturn {
  returns: Return[];
  loading: boolean;
  createReturn: (giftId: string, returnData: Omit<Return, 'id'>) => Promise<void>;
  getReturnsByGiftId: (giftId: string) => Return[];
}

function useReturns(giftId?: string): UseReturnsReturn;
```

### 2.2 認証フック

```typescript
interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

function useAuth(): UseAuthReturn;
```

### 2.3 画像管理フック

```typescript
interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<string>;
  uploadImages: (files: File[]) => Promise<string[]>;
  deleteImage: (url: string) => Promise<void>;
  uploading: boolean;
  progress: number;
  error: Error | null;
}

function useImageUpload(): UseImageUploadReturn;
```

### 2.4 カメラフック (Phase 2実装予定)

```typescript
interface UseCameraReturn {
  stream: MediaStream | null;
  devices: MediaDeviceInfo[];
  currentDeviceId: string | null;
  isActive: boolean;
  error: Error | null;
  startCamera: (deviceId?: string) => Promise<void>;
  stopCamera: () => void;
  switchCamera: () => Promise<void>;
  capturePhoto: () => Promise<Blob>;
}

function useCamera(): UseCameraReturn;
```

### 2.5 同期管理フック (Phase 2-3実装予定)

```typescript
interface UseSyncReturn {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  pendingChanges: number;
  sync: () => Promise<void>;
  isOnline: boolean;
  retrySync: () => Promise<void>;
  clearSyncQueue: () => Promise<void>;
}

function useSync(): UseSyncReturn;

// 同期APIの詳細実装
interface SyncManager {
  // 同期キューに追加
  addToSyncQueue(operation: SyncOperation): Promise<void>;
  
  // 同期実行
  executeSync(): Promise<SyncResult>;
  
  // 競合解決
  resolveConflict(localData: any, remoteData: any): ConflictResolution;
  
  // 同期状態取得
  getSyncStatus(): SyncStatus;
  
  // 同期キュークリア
  clearSyncQueue(): Promise<void>;
}

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  documentId: string;
  data: any;
  timestamp: Date;
  retryCount: number;
}

interface SyncResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: SyncError[];
}

interface ConflictResolution {
  action: 'use_local' | 'use_remote' | 'merge' | 'manual';
  data: any;
  reason: string;
}
```

## 3. Service Worker API (Phase 2実装予定)

### 3.1 Service Workerライフサイクル

```typescript
// service-worker.ts

// インストール
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/src/main.tsx',
        '/assets/icons/icon-192.png',
        '/assets/icons/icon-512.png'
      ]);
    })
  );
});

// アクティベーション
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// フェッチ
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### 3.2 Background Sync API

```typescript
// Background Sync登録
async function registerBackgroundSync() {
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register('sync-data');
}

// Service Worker内でのSync処理
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  const db = await openIndexedDB();
  const pendingItems = await db.getAll('syncQueue');
  
  for (const item of pendingItems) {
    try {
      await syncToFirestore(item);
      await db.delete('syncQueue', item.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```

### 3.3 Push Notifications API

```typescript
// 通知許可リクエスト
async function requestNotificationPermission(): Promise<boolean> {
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// 通知表示
async function showNotification(title: string, options: NotificationOptions) {
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    body: options.body,
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/badge.png',
    tag: options.tag,
    data: options.data
  });
}

// Service Worker内での通知クリック処理
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

## 4. Camera API仕様 (Phase 2実装予定)

### 4.1 カメラアクセス

```typescript
// カメラストリーム取得
async function getCameraStream(
  constraints?: MediaStreamConstraints
): Promise<MediaStream> {
  const defaultConstraints: MediaStreamConstraints = {
    video: {
      facingMode: 'environment', // リアカメラ優先
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    },
    audio: false
  };
  
  return await navigator.mediaDevices.getUserMedia(
    constraints || defaultConstraints
  );
}

// デバイス一覧取得
async function getCameraDevices(): Promise<MediaDeviceInfo[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === 'videoinput');
}

// 写真撮影
function capturePhoto(videoElement: HTMLVideoElement): Blob {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const context = canvas.getContext('2d')!;
  context.drawImage(videoElement, 0, 0);
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/jpeg', 0.9);
  });
}
```

### 4.2 画像処理

```typescript
// 画像圧縮
interface CompressOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

async function compressImage(
  file: File | Blob,
  options: CompressOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      
      // リサイズ計算
      if (width > options.maxWidth || height > options.maxHeight) {
        const ratio = Math.min(
          options.maxWidth / width,
          options.maxHeight / height
        );
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => resolve(blob!),
        'image/jpeg',
        options.quality
      );
    };
    
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// サムネイル生成
async function generateThumbnail(blob: Blob): Promise<Blob> {
  return compressImage(blob, {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.7
  });
}
```

## 5. IndexedDB API

### 5.1 データベース操作

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// 統一された型定義
interface Gift {
  id: string;
  userId: string;
  personId: string;
  giftName: string;
  receivedDate: Date;
  amount?: number;
  category: string;
  returnStatus: 'pending' | 'completed' | 'not_required';
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus?: 'synced' | 'pending' | 'error';
}

interface Person {
  id: string;
  userId: string;
  name: string;
  furigana?: string;
  relationship: string;
  contact?: string;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Return {
  id: string;
  giftId: string;
  returnName: string;
  returnDate: Date;
  amount?: number;
  memo?: string;
  createdAt: Date;
}

interface Image {
  id: string;
  entityId: string;
  entityType: 'gift' | 'return';
  imageUrl: string;
  order: number;
  createdAt: Date;
}

interface IwailistDB extends DBSchema {
  gifts: {
    key: string;
    value: Gift;
    indexes: {
      'userId': string;
      'personId': string;
      'receivedDate': Date;
      'returnStatus': string;
    };
  };
  persons: {
    key: string;
    value: Person;
    indexes: { 'userId': string };
  };
  images: {
    key: string;
    value: Image;
    indexes: { 
      'entityId': string;
      'entityType': string;
    };
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'status': string };
  };
}

// データベース接続
async function getDB(): Promise<IDBPDatabase<IwailistDB>> {
  return openDB<IwailistDB>('IwailistDB', 1, {
    upgrade(db) {
      // gifts ストア
      const giftStore = db.createObjectStore('gifts', { keyPath: 'id' });
      giftStore.createIndex('userId', 'userId');
      giftStore.createIndex('personId', 'personId');
      giftStore.createIndex('receivedDate', 'receivedDate');
      giftStore.createIndex('returnStatus', 'returnStatus');
      
      // persons ストア
      const personStore = db.createObjectStore('persons', { keyPath: 'id' });
      personStore.createIndex('userId', 'userId');
      
      // images ストア
      const imageStore = db.createObjectStore('images', { keyPath: 'id' });
      imageStore.createIndex('entityId', 'entityId');
      
      // syncQueue ストア
      const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
      syncStore.createIndex('status', 'status');
    }
  });
}

// CRUD操作
class GiftRepository {
  async create(gift: Gift): Promise<void> {
    const db = await getDB();
    await db.add('gifts', gift);
  }
  
  async get(id: string): Promise<Gift | undefined> {
    const db = await getDB();
    return await db.get('gifts', id);
  }
  
  async getAll(userId: string): Promise<Gift[]> {
    const db = await getDB();
    return await db.getAllFromIndex('gifts', 'userId', userId);
  }
  
  async update(gift: Gift): Promise<void> {
    const db = await getDB();
    await db.put('gifts', gift);
  }
  
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('gifts', id);
  }
  
  async query(userId: string, filters: GiftFilters): Promise<Gift[]> {
    const db = await getDB();
    let gifts = await db.getAllFromIndex('gifts', 'userId', userId);
    
    // フィルタリング
    if (filters.returnStatus) {
      gifts = gifts.filter(g => g.returnStatus === filters.returnStatus);
    }
    if (filters.category) {
      gifts = gifts.filter(g => g.category === filters.category);
    }
    if (filters.dateRange) {
      gifts = gifts.filter(g => 
        g.receivedDate >= filters.dateRange!.start &&
        g.receivedDate <= filters.dateRange!.end
      );
    }
    
    return gifts;
  }
}
```

## 6. エラーハンドリング

### 6.1 エラー型定義

```typescript
enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  AUTH = 'AUTH_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  STORAGE = 'STORAGE_ERROR',
  PERMISSION = 'PERMISSION_ERROR'
}

class AppError extends Error {
  constructor(
    public type: ErrorType,
    public message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

### 6.2 エラーハンドリング戦略

```typescript
// グローバルエラーハンドラー
function handleError(error: AppError): void {
  switch (error.type) {
    case ErrorType.NETWORK:
      // ネットワークエラー: リトライキューに追加
      addToSyncQueue(error);
      showToast('オフラインです。オンライン復帰時に同期します。');
      break;
      
    case ErrorType.AUTH:
      // 認証エラー: ログイン画面にリダイレクト
      redirectToLogin();
      break;
      
    case ErrorType.VALIDATION:
      // バリデーションエラー: フォームエラー表示
      showValidationError(error.message);
      break;
      
    case ErrorType.STORAGE:
      // ストレージエラー: 容量警告
      showToast('ストレージ容量が不足しています。');
      break;
      
    case ErrorType.PERMISSION:
      // パーミッションエラー: 許可リクエスト
      requestPermission();
      break;
  }
  
  // エラーログ送信
  logError(error);
}

// エラーハンドリングの詳細実装
class ErrorHandler {
  private retryQueue: Map<string, RetryItem> = new Map();
  private maxRetries = 3;
  private retryDelay = 1000; // 1秒

  async handleError(error: AppError, context?: ErrorContext): Promise<void> {
    // エラーログ記録
    await this.logError(error, context);
    
    // リトライ可能なエラーの場合
    if (this.isRetryableError(error)) {
      await this.scheduleRetry(error, context);
    }
    
    // ユーザー通知
    this.notifyUser(error);
  }

  private async logError(error: AppError, context?: ErrorContext): Promise<void> {
    const errorLog = {
      type: error.type,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // ローカルストレージに保存
    localStorage.setItem(`error_${Date.now()}`, JSON.stringify(errorLog));
    
    // オンライン時はFirebaseに送信
    if (navigator.onLine) {
      await this.sendErrorToFirebase(errorLog);
    }
  }

  private isRetryableError(error: AppError): boolean {
    return error.type === ErrorType.NETWORK || 
           (error.type === ErrorType.STORAGE && error.message.includes('quota'));
  }

  private async scheduleRetry(error: AppError, context?: ErrorContext): Promise<void> {
    const retryId = `${error.type}_${Date.now()}`;
    const retryItem: RetryItem = {
      id: retryId,
      error,
      context,
      retryCount: 0,
      nextRetry: Date.now() + this.retryDelay
    };
    
    this.retryQueue.set(retryId, retryItem);
    await this.processRetryQueue();
  }

  private async processRetryQueue(): Promise<void> {
    const now = Date.now();
    const readyToRetry = Array.from(this.retryQueue.values())
      .filter(item => item.nextRetry <= now && item.retryCount < this.maxRetries);
    
    for (const item of readyToRetry) {
      try {
        await this.retryOperation(item);
        this.retryQueue.delete(item.id);
      } catch (error) {
        item.retryCount++;
        item.nextRetry = Date.now() + (this.retryDelay * Math.pow(2, item.retryCount));
        
        if (item.retryCount >= this.maxRetries) {
          this.retryQueue.delete(item.id);
          await this.handleMaxRetriesExceeded(item);
        }
      }
    }
  }
}

interface ErrorContext {
  operation: string;
  userId?: string;
  data?: any;
  timestamp: Date;
}

interface RetryItem {
  id: string;
  error: AppError;
  context?: ErrorContext;
  retryCount: number;
  nextRetry: number;
}
```

## 7. API使用量最適化

### 7.1 Firestore読み取り削減

- **ローカルキャッシュ優先**: IndexedDBから読み込み
- **差分同期**: `updatedAt`フィールドで変更分のみ取得
- **ページネーション**: 初回は20件、以降は追加読み込み

### 7.2 Storage使用量削減

- **画像圧縮**: アップロード前に自動圧縮
- **遅延アップロード**: Wi-Fi接続時のみ自動アップロード
- **サムネイル**: ローカルで生成、クラウドに保存しない

