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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseEnabled() || !auth) {
      setLoading(false);
      return;
    }

    // 認証状態の永続化設定
    authService.setPersistence().catch(console.error);

    // 認証状態の監視を先に設定
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
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
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setLoading(false);
      }
    );

    // リダイレクト認証の結果を処理
    authService.handleRedirectResult()
      .then((user) => {
        if (user) {
          console.log('Redirect authentication successful:', user);
          // onAuthStateChangedで既に処理されているため、ここでは何もしない
        } else {
          console.log('No redirect result found');
        }
      })
      .catch((error) => {
        console.error('Redirect result handling error:', error);
        // エラーが発生した場合は、loading状態を解除
        setLoading(false);
      });

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
      unsubscribe();
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
    setLoading(true);
    try {
      await authService.signInWithGoogle();
      // signInWithRedirectはページをリダイレクトするため、この行には到達しない
      // 認証完了後、ページが再読み込みされ、handleRedirectResultで処理される
    } catch (error) {
      // エラーが発生した場合のみloading状態を解除
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
