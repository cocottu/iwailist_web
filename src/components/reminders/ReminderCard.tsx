import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button } from '@/components/ui';
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
      className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
        reminder.completed ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            {getUrgencyBadge()}
            <span className="text-sm text-gray-500">
              {format(reminder.reminderDate, 'M月d日(E)', { locale: ja })}
            </span>
          </div>
          <p className="text-gray-900 font-medium">{reminder.message}</p>
        </div>
        
        {!reminder.completed && (
          <button
            onClick={() => onComplete(reminder.id)}
            className="text-green-600 hover:text-green-800 ml-2"
            title="完了にする"
          >
            ✓
          </button>
        )}
      </div>
      
      {gift && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <Link
            to={`/gifts/${gift.id}`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            📦 {gift.giftName}
          </Link>
        </div>
      )}
      
      <div className="flex justify-end mt-2 space-x-2">
        <button
          onClick={() => onDelete(reminder.id)}
          className="text-xs text-red-600 hover:text-red-800"
        >
          削除
        </button>
      </div>
    </div>
  );
};
