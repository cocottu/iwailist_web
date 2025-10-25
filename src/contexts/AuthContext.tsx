/**
 * 認証コンテキスト
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, isFirebaseEnabled } from '../lib/firebase';
import { User, convertFirebaseUser } from '../types/firebase';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // リダイレクト処理中は必ずローディング状態にする
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseEnabled() || !auth) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    // 認証の初期化処理
    const initializeAuth = async () => {
      console.log('[DEBUG] AuthContext: initializeAuth starting...');
      console.log('[DEBUG] AuthContext: isRedirectPending:', authService.isRedirectPending());
      
      try {
        // 認証状態の永続化設定を最初に行う
        console.log('[DEBUG] AuthContext: Setting persistence...');
        await authService.setPersistence();
        console.log('[DEBUG] AuthContext: Persistence set successfully');
      } catch (error) {
        console.error('[DEBUG] AuthContext: Persistence error:', error);
      }

      // 認証状態の監視を先に設定（リダイレクト結果を逃さないため）
      if (!isMounted) return;

      unsubscribe = onAuthStateChanged(
        auth!,
        async (firebaseUser: FirebaseUser | null) => {
          if (!isMounted) return;
          
          console.log('Auth state changed:', firebaseUser ? firebaseUser.email : 'null');
          
          if (firebaseUser) {
            try {
              // トークンをローカルストレージに保存
              const token = await firebaseUser.getIdToken();
              localStorage.setItem('authToken', token);

              // ユーザー情報を設定
              setUser(convertFirebaseUser(firebaseUser));
              console.log('User authenticated:', firebaseUser.email);
            } catch (error) {
              console.error('Error getting user token:', error);
              setUser(null);
            }
          } else {
            // ログアウト状態
            localStorage.removeItem('authToken');
            setUser(null);
            console.log('User signed out');
          }
          
          // リダイレクト処理中でなければローディング解除
          if (!authService.isRedirectPending()) {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Auth state change error:', error);
          if (isMounted && !authService.isRedirectPending()) {
            setLoading(false);
          }
        }
      );

      // リダイレクト認証の結果を処理（onAuthStateChangedの後に実行）
      // iframe内では実行しない（親ウィンドウでのみ処理）
      const isIframe = window.self !== window.top;
      if (!isIframe) {
        try {
          console.log('[DEBUG] AuthContext: Calling handleRedirectResult...');
          const redirectUser = await authService.handleRedirectResult();
          
          if (redirectUser) {
            console.log('[DEBUG] AuthContext: Redirect authentication successful!');
            console.log('Redirect authentication successful:', redirectUser);
            // onAuthStateChangedが自動的にユーザー情報を設定する
          } else {
            console.log('[DEBUG] AuthContext: No redirect result');
            console.log('No redirect result found');
          }
        } catch (error) {
          console.error('[DEBUG] AuthContext: Redirect error:', error);
          console.error('Redirect result handling error:', error);
          if (typeof error === 'object' && error !== null) {
            console.error('[DEBUG] AuthContext: Error details:', {
              code: (error as any).code,
              message: (error as any).message,
            });
          }
        } finally {
          // リダイレクト処理が完了したらローディング解除
          if (isMounted) {
            setLoading(false);
            console.log('[DEBUG] AuthContext: Redirect processing completed, loading set to false');
          }
        }
      } else {
        console.log('[DEBUG] AuthContext: Skipping handleRedirectResult in iframe');
        // iframe内ではリダイレクト処理をしない
        if (isMounted && !authService.isRedirectPending()) {
          setLoading(false);
        }
      }
      
      console.log('[DEBUG] AuthContext: initializeAuth completed');
    };

    // 認証初期化を開始
    initializeAuth();

    // トークンの定期更新 (55分ごと)
    const tokenRefreshInterval = setInterval(async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken(true); // 強制更新
          localStorage.setItem('authToken', token);
          console.log('Auth token refreshed');
        } catch (error) {
          console.error('Token refresh failed:', error);
          // 再ログイン促進
          await authService.signOut();
        }
      }
    }, 55 * 60 * 1000); // 55分

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
      clearInterval(tokenRefreshInterval);
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<void> => {
    setLoading(true);
    try {
      const user = await authService.signUpWithEmail(email, password, displayName);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const user = await authService.signInWithEmail(email, password);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    console.log('[DEBUG] AuthContext: signInWithGoogle called');
    setLoading(true);
    try {
      console.log('[DEBUG] AuthContext: Calling authService.signInWithGoogle...');
      await authService.signInWithGoogle();
      console.log('[DEBUG] AuthContext: This line should not be reached');
      // signInWithRedirectはページをリダイレクトするため、この行には到達しない
      // 認証完了後、ページが再読み込みされ、handleRedirectResultで処理される
    } catch (error) {
      // エラーが発生した場合のみloading状態を解除
      console.error('[DEBUG] AuthContext: Google sign-in error:', error);
      console.error('Failed to initiate Google sign-in:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    await authService.sendPasswordReset(email);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: user !== null,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    sendPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
