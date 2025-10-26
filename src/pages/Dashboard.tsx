import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Loading, EmptyState } from '@/components/ui';
import { GiftRepository, PersonRepository, ReminderRepository } from '@/database';
import { Gift, Statistics, GiftCategory, Person, Reminder } from '@/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { ReminderCard } from '@/components/reminders/ReminderCard';
import { useAuth } from '@/contexts/AuthContext';
import { syncManager } from '@/services/syncManager';
import { isFirebaseEnabled } from '@/lib/firebase';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recentGifts, setRecentGifts] = useState<Gift[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [overdueReminders, setOverdueReminders] = useState<Reminder[]>([]);
  const [reminderGifts, setReminderGifts] = useState<Record<string, Gift>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // ユーザーID取得
      const userId = user?.uid || 'demo-user';
      
      // Firebaseが有効な場合、最初に同期を実行
      if (isFirebaseEnabled() && user?.uid && navigator.onLine) {
        console.log('[Dashboard] Syncing data before load...');
        try {
          await syncManager.triggerSync(user.uid);
          console.log('[Dashboard] Sync completed');
        } catch (error) {
          console.error('[Dashboard] Sync failed:', error);
          // 同期に失敗してもローカルデータは表示する
        }
      }
      
      const giftRepo = new GiftRepository();
      const personRepo = new PersonRepository();
      const reminderRepo = new ReminderRepository();
      
      // 統計データ取得
      const stats = await giftRepo.getStatistics(userId);
      
      // 最近の贈答品取得（最新5件）
      const allGifts = await giftRepo.getAll(userId);
      const recent = allGifts.slice(0, 5);
      
      // 人物情報も取得
      const personsData = await personRepo.getAll(userId);
      setPersons(personsData);
      
      // リマインダー取得
      const upcoming = await reminderRepo.getUpcoming(userId, 7);
      const overdue = await reminderRepo.getOverdue(userId);
      setUpcomingReminders(upcoming);
      setOverdueReminders(overdue);
      
      // リマインダーの贈答品情報を取得
      const reminderGiftMap: Record<string, Gift> = {};
      for (const reminder of [...upcoming, ...overdue]) {
        const gift = await giftRepo.get(reminder.giftId);
        if (gift) {
          reminderGiftMap[reminder.giftId] = gift;
        }
      }
      setReminderGifts(reminderGiftMap);
      
      setStatistics({
        totalGifts: stats.total,
        pendingReturns: stats.pending,
        completedReturns: stats.completed,
        totalAmount: stats.totalAmount,
        monthlyAmount: stats.monthlyAmount,
        categoryBreakdown: {} as Record<GiftCategory, number>, // Phase 1では未実装
        recentGifts: recent
      });
      
      setRecentGifts(recent);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPersonName = (personId: string) => {
    const person = persons.find(p => p.id === personId);
    return person?.name || '不明な人物';
  };

  const handleCompleteReminder = async (reminderId: string) => {
    try {
      const reminderRepo = new ReminderRepository();
      await reminderRepo.markComplete(reminderId);
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to complete reminder:', error);
      alert('完了処理に失敗しました');
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (!window.confirm('このリマインダーを削除しますか？')) {
      return;
    }
    
    try {
      const reminderRepo = new ReminderRepository();
      await reminderRepo.delete(reminderId);
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to delete reminder:', error);
      alert('削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading size="lg" text="データを読み込み中..." />
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          message="データの読み込みに失敗しました"
          action={{
            label: '再読み込み',
            onClick: loadDashboardData
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ダッシュボード</h1>
        <p className="text-gray-600">祝い品の管理状況を確認できます</p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-lg">⚠️</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">未対応</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.pendingReturns}件
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">今月</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.monthlyAmount.toLocaleString()}円
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">対応済</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.completedReturns}件
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">総額</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.totalAmount.toLocaleString()}円
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* クイックアクション */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/gifts/new">
            <Button size="lg" className="flex items-center">
              <span className="mr-2">🎁</span>
              贈答品を登録
            </Button>
          </Link>
          <Link to="/persons/new">
            <Button variant="outline" size="lg" className="flex items-center">
              <span className="mr-2">👤</span>
              人物を登録
            </Button>
          </Link>
        </div>
      </div>

      {/* リマインダーアラート */}
      {(overdueReminders.length > 0 || upcomingReminders.length > 0) && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">リマインダー</h2>
            <Link to="/reminders" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              すべて見る →
            </Link>
          </div>
          
          {/* 期限切れリマインダー */}
          {overdueReminders.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-red-600 mb-2">⚠️ 期限切れ</h3>
              <div className="space-y-2">
                {overdueReminders.slice(0, 3).map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    gift={reminderGifts[reminder.giftId]}
                    onComplete={handleCompleteReminder}
                    onDelete={handleDeleteReminder}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* 予定リマインダー */}
          {upcomingReminders.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-blue-600 mb-2">📅 今後の予定</h3>
              <div className="space-y-2">
                {upcomingReminders.slice(0, 3).map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    gift={reminderGifts[reminder.giftId]}
                    onComplete={handleCompleteReminder}
                    onDelete={handleDeleteReminder}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 最近の贈答品 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">最近の贈答品</h2>
          <Link to="/gifts" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            すべて見る →
          </Link>
        </div>
        
        {recentGifts.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              message="まだ贈答品が登録されていません"
              action={{
                label: '最初の贈答品を登録',
                onClick: () => window.location.href = '/gifts/new'
              }}
              icon={<span className="text-4xl">🎁</span>}
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {recentGifts.map((gift) => (
              <Card key={gift.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-medium text-gray-900">{gift.giftName}</h3>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        gift.returnStatus === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : gift.returnStatus === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {gift.returnStatus === 'pending' ? '未対応' : 
                         gift.returnStatus === 'completed' ? '対応済' : '不要'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {getPersonName(gift.personId)} • {gift.category}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(gift.receivedDate, 'yyyy年M月d日', { locale: ja })}
                      {gift.amount && ` • ${gift.amount.toLocaleString()}円`}
                    </p>
                  </div>
                  <Link 
                    to={`/gifts/${gift.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    詳細 →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
