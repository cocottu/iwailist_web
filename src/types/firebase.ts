/**
 * Firebase関連の型定義
 */
import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

// ユーザー型
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Firestoreドキュメント型
export interface FirestoreGift {
  personId: string;
  giftName: string;
  receivedDate: Timestamp;
  amount?: number;
  category: string;
  returnStatus: 'pending' | 'completed' | 'not_required';
  memo?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  syncStatus?: 'synced' | 'pending' | 'error';
}

export interface FirestorePerson {
  name: string;
  furigana?: string;
  relationship: string;
  contact?: string;
  memo?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreReturn {
  returnName: string;
  returnDate: Timestamp;
  amount?: number;
  memo?: string;
  createdAt: Timestamp;
}

export interface FirestoreImage {
  entityId: string;
  entityType: 'gift' | 'return';
  imageUrl: string;
  storagePath: string;
  order: number;
  createdAt: Timestamp;
}

export interface FirestoreReminder {
  giftId: string;
  reminderDate: Timestamp;
  message: string;
  completed: boolean;
  createdAt: Timestamp;
}

// 同期関連の型
export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: 'gifts' | 'persons' | 'returns' | 'images';
  documentId: string;
  data?: unknown;
  timestamp: Date;
  retryCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  lastError?: string;
}

export interface SyncResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: SyncError[];
}

export interface SyncError {
  operation: SyncOperation;
  error: Error;
  timestamp: Date;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingOperations: number;
  isOnline: boolean;
}

// 認証エラー型
export enum AuthErrorCode {
  EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use',
  INVALID_EMAIL = 'auth/invalid-email',
  WEAK_PASSWORD = 'auth/weak-password',
  USER_NOT_FOUND = 'auth/user-not-found',
  WRONG_PASSWORD = 'auth/wrong-password',
  TOO_MANY_REQUESTS = 'auth/too-many-requests',
  NETWORK_REQUEST_FAILED = 'auth/network-request-failed',
}

// Firebase User → User変換ヘルパー
export const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
    updatedAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now()),
  };
};
