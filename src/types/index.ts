// 関係性の列挙型
export enum Relationship {
  FAMILY = '家族',
  RELATIVE = '親戚',
  FRIEND = '友人',
  COLLEAGUE = '会社関係',
  ACQUAINTANCE = '知人',
  OTHER = 'その他'
}

// カテゴリの列挙型
export enum GiftCategory {
  WEDDING = '結婚祝い',
  BIRTH = '出産祝い',
  HOSPITAL = 'お見舞い',
  CELEBRATION = 'お祝い',
  CONDOLENCE = '香典・お悔やみ',
  SEASONAL = '季節の贈り物',
  OTHER = 'その他'
}

// お返し状況の列挙型
export enum ReturnStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  NOT_REQUIRED = 'not_required'
}

// 人物情報の型
export interface Person {
  id: string;
  userId: string;
  name: string;
  furigana?: string;
  relationship: Relationship;
  contact?: string;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 贈答品情報の型
export interface Gift {
  id: string;
  userId: string;
  personId: string;
  giftName: string;
  receivedDate: Date;
  amount?: number;
  category: GiftCategory;
  returnStatus: ReturnStatus;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus?: 'synced' | 'pending' | 'error';
}

// お返し情報の型
export interface Return {
  id: string;
  giftId: string;
  returnName: string;
  returnDate: Date;
  amount?: number;
  memo?: string;
  createdAt: Date;
}

// 画像情報の型
export interface Image {
  id: string;
  entityId: string;
  entityType: 'gift' | 'return';
  imageUrl: string;
  imageData?: Blob; // IndexedDBに保存されるBlobデータ（オプショナル）
  order: number;
  createdAt: Date;
}

// リマインダー情報の型
export interface Reminder {
  id: string;
  userId: string;
  giftId: string;
  reminderDate: Date;
  message: string;
  completed: boolean;
  createdAt: Date;
}

// フィルター条件の型
export interface GiftFilters {
  returnStatus?: ReturnStatus;
  category?: GiftCategory;
  personId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchText?: string;
}

// 同期キューの型
export interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  collection: string;
  documentId: string;
  data: unknown;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;
  lastError?: string;
  timestamp: Date;
}

// エラーの型
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  AUTH = 'AUTH_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  STORAGE = 'STORAGE_ERROR',
  PERMISSION = 'PERMISSION_ERROR'
}

export class AppError extends Error {
  constructor(
    public type: ErrorType,
    public message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 統計情報の型
export interface Statistics {
  totalGifts: number;
  pendingReturns: number;
  completedReturns: number;
  totalAmount: number;
  monthlyAmount: number;
  categoryBreakdown: Record<GiftCategory, number>;
  recentGifts: Gift[];
}

// フォーム用の型
export interface GiftFormData {
  giftName: string;
  personId: string;
  receivedDate: Date;
  amount?: number;
  category: GiftCategory;
  returnStatus: ReturnStatus;
  memo?: string;
}

export interface PersonFormData {
  name: string;
  furigana?: string;
  relationship: Relationship;
  contact?: string;
  memo?: string;
}

export interface ReturnFormData {
  returnName: string;
  returnDate: Date;
  amount?: number;
  memo?: string;
}
