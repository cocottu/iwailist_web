/**
 * 運営者専用ルート保護コンポーネント
 * 運営者のみアクセスできるルートを保護する
 */

import { useState, useEffect, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/utils/admin';
import { Loading } from '@/components/ui';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAuthenticated || !user) {
        setIsAdminUser(false);
        setLoading(false);
        return;
      }

      try {
        const adminStatus = await isAdmin(user.uid);
        setIsAdminUser(adminStatus);
      } catch (error) {
        console.error('Failed to check admin status:', error);
        setIsAdminUser(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, isAuthenticated, authLoading]);

  // 認証状態の読み込み中
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loading size="lg" text="読み込み中..." />
      </div>
    );
  }

  // 未ログインの場合はログインページへリダイレクト
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 運営者ではない場合はホームへリダイレクト
  if (!isAdminUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
