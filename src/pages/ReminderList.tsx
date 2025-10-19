import React, { useState, useEffect } from 'react';
import { Card, Loading, EmptyState, Button } from '@/components/ui';
import { ReminderRepository, GiftRepository } from '@/database';
import { Reminder, Gift } from '@/types';
import { ReminderCard } from '@/components/reminders/ReminderCard';

interface ReminderWithGift extends Reminder {
  gift?: Gift;
}

export const ReminderList: React.FC = () => {
  const [reminders, setReminders] = useState<ReminderWithGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('upcoming');

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const userId = 'demo-user';
      
      const reminderRepo = new ReminderRepository();
      const giftRepo = new GiftRepository();
      
      const allReminders = await reminderRepo.getAll(userId);
      
      // 各リマインダーの贈答品情報を取得
      const remindersWithGifts: ReminderWithGift[] = await Promise.all(
        allReminders.map(async (reminder) => {
          const gift = await giftRepo.get(reminder.giftId);
          return {
            ...reminder,
            gift: gift || undefined
          };
        })
      );
      
      setReminders(remindersWithGifts);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (reminderId: string) => {
    try {
      const reminderRepo = new ReminderRepository();
      await reminderRepo.markComplete(reminderId);
      await loadReminders();
    } catch (error) {
      console.error('Failed to complete reminder:', error);
      alert('完了処理に失敗しました');
    }
  };

  const handleDelete = async (reminderId: string) => {
    if (!window.confirm('このリマインダーを削除しますか？')) {
      return;
    }
    
    try {
      const reminderRepo = new ReminderRepository();
      await reminderRepo.delete(reminderId);
      await loadReminders();
    } catch (error) {
      console.error('Failed to delete reminder:', error);
      alert('削除に失敗しました');
    }
  };

  const getFilteredReminders = () => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return reminders.filter(r => !r.completed && r.reminderDate >= now);
      case 'overdue':
        return reminders.filter(r => !r.completed && r.reminderDate < now);
      case 'completed':
        return reminders.filter(r => r.completed);
      default:
        return reminders;
    }
  };

  const filteredReminders = getFilteredReminders();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading size="lg" text="リマインダーを読み込み中..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">リマインダー</h1>
        <p className="text-gray-600 mt-2">
          お返しの予定を管理します
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">全リマインダー</p>
          <p className="text-2xl font-bold text-gray-900">{reminders.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">予定</p>
          <p className="text-2xl font-bold text-blue-600">
            {reminders.filter(r => !r.completed && r.reminderDate >= new Date()).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">期限切れ</p>
          <p className="text-2xl font-bold text-red-600">
            {reminders.filter(r => !r.completed && r.reminderDate < new Date()).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">完了</p>
          <p className="text-2xl font-bold text-green-600">
            {reminders.filter(r => r.completed).length}
          </p>
        </Card>
      </div>

      {/* フィルター */}
      <Card className="p-4 mb-6">
        <div className="flex space-x-2">
          <Button
            variant={filter === 'upcoming' ? 'primary' : 'outline'}
            onClick={() => setFilter('upcoming')}
            size="sm"
          >
            予定
          </Button>
          <Button
            variant={filter === 'overdue' ? 'primary' : 'outline'}
            onClick={() => setFilter('overdue')}
            size="sm"
          >
            期限切れ
          </Button>
          <Button
            variant={filter === 'completed' ? 'primary' : 'outline'}
            onClick={() => setFilter('completed')}
            size="sm"
          >
            完了
          </Button>
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            すべて
          </Button>
        </div>
      </Card>

      {/* リマインダーリスト */}
      {filteredReminders.length === 0 ? (
        <EmptyState
          message="リマインダーがありません"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              gift={reminder.gift}
              onComplete={handleComplete}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
