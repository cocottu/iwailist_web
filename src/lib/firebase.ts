/**
 * Firebase初期化とエクスポート
 */
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// 環境変数から現在の環境を取得
export const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';

// 環境判定ヘルパー
export const isDevelopment = (): boolean => APP_ENV === 'development';
export const isStaging = (): boolean => APP_ENV === 'staging';
export const isProduction = (): boolean => APP_ENV === 'production';

// 環境に応じた機能フラグ
export const FEATURE_FLAGS = {
  enableDebugMode: isDevelopment(),
  enablePerformanceMonitoring: isProduction() || isStaging(),
  enableAnalytics: isProduction(),
  enableErrorReporting: isProduction() || isStaging(),
  showDevTools: isDevelopment(),
};

// Firebase設定
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 環境変数のチェック
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const missingEnvVars = requiredEnvVars.filter(
  (key) => !import.meta.env[key]
);

if (missingEnvVars.length > 0) {
  console.warn(
    `Missing Firebase environment variables: ${missingEnvVars.join(', ')}`
  );
  console.warn('Firebase features will be disabled.');
}

// Firebase初期化
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

try {
  if (missingEnvVars.length === 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // 環境に応じたログ出力
    if (isDevelopment()) {
      console.log('🔧 Running in DEVELOPMENT mode');
      console.log('Firebase Project:', firebaseConfig.projectId);
      console.log('Firebase initialized successfully');
    } else if (isStaging()) {
      console.log('🧪 Running in STAGING mode');
      console.log('Firebase Project:', firebaseConfig.projectId);
      console.log('Firebase initialized successfully');
    } else if (isProduction()) {
      console.log('🚀 Running in PRODUCTION mode');
      // 本番環境では詳細なログを抑制
    }
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// エクスポート
export { app, auth, db, storage };

// Firebase有効性チェック
export const isFirebaseEnabled = (): boolean => {
  return app !== null && auth !== null && db !== null && storage !== null;
};

// Firebase設定診断
export const getFirebaseConfigStatus = () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✓ Set' : '✗ Missing',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✓ Set' : '✗ Missing',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✓ Set' : '✗ Missing',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ? '✓ Set' : '✗ Missing',
  };
  
  console.log('Firebase Configuration Status:');
  console.table(config);
  
  return {
    isConfigured: missingEnvVars.length === 0,
    missing: missingEnvVars,
    status: config,
  };
};
