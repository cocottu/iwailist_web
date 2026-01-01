import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui';
import { Reminder, Gift } from '@/types';
import { format, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale/ja';

interface ReminderCardProps {
  reminder: Reminder;
  gift?: Gift;
  onComplete: (reminderId: string) => void;
  onDelete: (reminderId: string) => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  gift,
  onComplete,
  onDelete
}) => {
  const daysUntil = differenceInDays(reminder.reminderDate, new Date());
  
  const getUrgencyBadge = () => {
    if (reminder.completed) {
      return <Badge status="completed">完了</Badge>;
    }
    
    if (daysUntil < 0) {
      return <Badge status="pending">期限切れ</Badge>;
    } else if (daysUntil === 0) {
      return <Badge status="pending">今日</Badge>;
    } else if (daysUntil <= 3) {
      return <Badge status="pending">あと{daysUntil}日</Badge>;
    } else if (daysUntil <= 7) {
      return <Badge status="info">あと{daysUntil}日</Badge>;
    } else {
      return <Badge status="not_required">あと{daysUntil}日</Badge>;
    }
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all ${
        reminder.completed ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            {getUrgencyBadge()}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {format(reminder.reminderDate, 'M月d日(E)', { locale: ja })}
            </span>
          </div>
          <p className="text-gray-900 dark:text-white font-medium">{reminder.message}</p>
        </div>
        
        {!reminder.completed && (
          <button
            onClick={() => onComplete(reminder.id)}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 ml-2"
            title="完了にする"
          >
            ✓
          </button>
        )}
      </div>
      
      {gift && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <Link
            to={`/gifts/${gift.id}`}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            📦 {gift.giftName}
          </Link>
        </div>
      )}
      
      <div className="flex justify-end mt-2 space-x-2">
        <button
          onClick={() => onDelete(reminder.id)}
          className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
        >
          削除
        </button>
      </div>
    </div>
  );
};
