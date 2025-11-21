import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '../../services/authService';
import * as firebaseAuth from 'firebase/auth';
import * as firebaseFirestore from 'firebase/firestore';
import * as firebaseLib from '../../lib/firebase';
import { AuthErrorCode } from '../../types/firebase';

// Firebase関連のモック
vi.mock('firebase/auth', () => {
  return {
    createUserWithEmailAndPassword: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signInWithRedirect: vi.fn(),
    getRedirectResult: vi.fn(),
    GoogleAuthProvider: vi.fn().mockImplementation(() => ({
      setCustomParameters: vi.fn(),
    })),
    signOut: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    updateProfile: vi.fn(),
    setPersistence: vi.fn(),
    browserLocalPersistence: 'browserLocalPersistence',
    AuthErrorCode: {
      EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
      INVALID_EMAIL: 'auth/invalid-email',
      WEAK_PASSWORD: 'auth/weak-password',
      USER_NOT_FOUND: 'auth/user-not-found',
      WRONG_PASSWORD: 'auth/wrong-password',
      TOO_MANY_REQUESTS: 'auth/too-many-requests',
      NETWORK_REQUEST_FAILED: 'auth/network-request-failed',
      POPUP_CLOSED_BY_USER: 'auth/popup-closed-by-user',
      POPUP_BLOCKED: 'auth/popup-blocked',
      UNAUTHORIZED_DOMAIN: 'auth/unauthorized-domain',
      CANCELLED_POPUP_REQUEST: 'auth/cancelled-popup-request',
      ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL: 'auth/account-exists-with-different-credential',
    }
  };
});

vi.mock('firebase/firestore', () => {
  return {
    doc: vi.fn(),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
    serverTimestamp: vi.fn(),
    getFirestore: vi.fn(),
  };
});

vi.mock('../../lib/firebase', () => {
  return {
    auth: {
      currentUser: null,
    },
    db: {},
    isFirebaseEnabled: vi.fn().mockReturnValue(true),
  };
});

describe('authService', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'http://example.com/photo.jpg',
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
  };

  const mockUserCredential = {
    user: mockUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (firebaseLib.isFirebaseEnabled as any).mockReturnValue(true);
    (firebaseLib.auth as any).currentUser = null;
    localStorage.clear();
  });

  describe('signUpWithEmail', () => {
    it('正常にサインアップできる', async () => {
      (firebaseAuth.createUserWithEmailAndPassword as any).mockResolvedValue(mockUserCredential);
      (firebaseFirestore.doc as any).mockReturnValue('doc-ref');

      const result = await authService.signUpWithEmail('test@example.com', 'password123', 'Test User');

      expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        firebaseLib.auth,
        'test@example.com',
        'password123'
      );
      expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'Test User' });
      expect(firebaseFirestore.setDoc).toHaveBeenCalled();
      expect(result.uid).toBe(mockUser.uid);
    });

    it('Firebaseが無効な場合はエラーを投げる', async () => {
      (firebaseLib.isFirebaseEnabled as any).mockReturnValue(false);

      await expect(
        authService.signUpWithEmail('test@example.com', 'password', 'name')
      ).rejects.toThrow('Firebase is not enabled');
    });

    it('エラー発生時に適切にハンドリングする', async () => {
      const error = { code: 'auth/email-already-in-use' };
      (firebaseAuth.createUserWithEmailAndPassword as any).mockRejectedValue(error);

      await expect(
        authService.signUpWithEmail('test@example.com', 'password', 'name')
      ).rejects.toThrow('このメールアドレスは既に使用されています');
    });
  });

  describe('signInWithEmail', () => {
    it('正常にログインできる', async () => {
      (firebaseAuth.signInWithEmailAndPassword as any).mockResolvedValue(mockUserCredential);

      const result = await authService.signInWithEmail('test@example.com', 'password');

      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        firebaseLib.auth,
        'test@example.com',
        'password'
      );
      expect(result.uid).toBe(mockUser.uid);
    });

    it('エラー発生時に適切にハンドリングする', async () => {
      const error = { code: 'auth/user-not-found' };
      (firebaseAuth.signInWithEmailAndPassword as any).mockRejectedValue(error);

      await expect(
        authService.signInWithEmail('test@example.com', 'password')
      ).rejects.toThrow('ユーザーが見つかりません');
    });
  });

  describe('signInWithGoogle', () => {
    it('Googleログインプロセスを開始する', async () => {
      await authService.signInWithGoogle();

      expect(firebaseAuth.signInWithRedirect).toHaveBeenCalled();
      expect(localStorage.getItem('authRedirectPending')).toBe('true');
    });

    it('エラー発生時に適切にハンドリングする', async () => {
      const error = { code: 'auth/popup-closed-by-user' };
      (firebaseAuth.signInWithRedirect as any).mockRejectedValue(error);

      await expect(authService.signInWithGoogle()).rejects.toThrow('ログインがキャンセルされました');
      expect(localStorage.getItem('authRedirectPending')).toBeNull();
    });
  });

  describe('handleRedirectResult', () => {
    it('認証結果がない場合はnullを返す', async () => {
      (firebaseAuth.getRedirectResult as any).mockResolvedValue(null);
      
      const result = await authService.handleRedirectResult();
      
      expect(result).toBeNull();
      expect(localStorage.getItem('authRedirectPending')).toBeNull();
    });

    it('新規ユーザーの場合、Firestoreにプロファイルを作成する', async () => {
      (firebaseAuth.getRedirectResult as any).mockResolvedValue({ user: mockUser });
      (firebaseFirestore.doc as any).mockReturnValue('doc-ref');
      (firebaseFirestore.getDoc as any).mockResolvedValue({ exists: () => false });

      const result = await authService.handleRedirectResult();

      expect(firebaseFirestore.setDoc).toHaveBeenCalled();
      expect(result?.uid).toBe(mockUser.uid);
    });

    it('既存ユーザーの場合、プロファイル作成をスキップする', async () => {
      (firebaseAuth.getRedirectResult as any).mockResolvedValue({ user: mockUser });
      (firebaseFirestore.doc as any).mockReturnValue('doc-ref');
      (firebaseFirestore.getDoc as any).mockResolvedValue({ exists: () => true });

      await authService.handleRedirectResult();

      expect(firebaseFirestore.setDoc).not.toHaveBeenCalled();
    });

     it('エラー発生時に適切にハンドリングする', async () => {
      const error = { code: 'auth/network-request-failed' };
      (firebaseAuth.getRedirectResult as any).mockRejectedValue(error);

      await expect(authService.handleRedirectResult()).rejects.toThrow('ネットワークエラーが発生しました');
      expect(localStorage.getItem('authRedirectPending')).toBeNull();
    });
  });

  describe('signOut', () => {
    it('正常にログアウトできる', async () => {
      await authService.signOut();
      expect(firebaseAuth.signOut).toHaveBeenCalled();
    });
  });

  describe('sendPasswordReset', () => {
    it('パスワードリセットメールを送信できる', async () => {
      await authService.sendPasswordReset('test@example.com');
      expect(firebaseAuth.sendPasswordResetEmail).toHaveBeenCalledWith(firebaseLib.auth, 'test@example.com');
    });
  });

  describe('setPersistence', () => {
    it('永続化設定を行える', async () => {
        await authService.setPersistence();
        expect(firebaseAuth.setPersistence).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('現在のユーザーを取得できる', () => {
      (firebaseLib.auth as any).currentUser = mockUser;
      expect(authService.getCurrentUser()).toBe(mockUser);
    });

    it('Firebaseが無効な場合はnullを返す', () => {
      (firebaseLib.isFirebaseEnabled as any).mockReturnValue(false);
      expect(authService.getCurrentUser()).toBeNull();
    });
  });

  describe('isRedirectPending', () => {
      it('pending状態を正しく判定できる', () => {
          localStorage.setItem('authRedirectPending', 'true');
          expect(authService.isRedirectPending()).toBe(true);
          
          localStorage.setItem('authRedirectPending', 'false');
          expect(authService.isRedirectPending()).toBe(false);
          
          localStorage.removeItem('authRedirectPending');
          expect(authService.isRedirectPending()).toBe(false);
      });
  });
});
