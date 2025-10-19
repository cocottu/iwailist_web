import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { ReminderRepository } from '@/database';
import { Reminder } from '@/types';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

interface ReminderFormProps {
  giftId: string;
  giftName: string;
  reminderData?: Reminder;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ReminderForm: React.FC<ReminderFormProps> = ({
  giftId,
  giftName,
  reminderData,
  onSuccess,
  onCancel
}) => {
  const isEdit = !!reminderData;
  
  const [reminderDate, setReminderDate] = useState<Date>(
    reminderData?.reminderDate || addWeeks(new Date(), 1)
  );
  const [message, setMessage] = useState(
    reminderData?.message || `${giftName}のお返しを準備する`
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleQuickDate = (days: number) => {
    const newDate = addDays(new Date(), days);
    setReminderDate(newDate);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!message.trim()) {
      newErrors.message = 'メッセージは必須です';
    }
    
    if (!reminderDate) {
      newErrors.reminderDate = 'リマインダー日は必須です';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      const userId = 'demo-user';
      const reminderRepo = new ReminderRepository();
      
      const reminder: Reminder = {
        id: reminderData?.id || crypto.randomUUID(),
        userId: userId,
        giftId: giftId,
        reminderDate: reminderDate,
        message: message.trim(),
        completed: reminderData?.completed || false,
        createdAt: reminderData?.createdAt || new Date()
      };
      
      if (isEdit) {
        await reminderRepo.update(reminder);
      } else {
        await reminderRepo.create(reminder);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Failed to save reminder:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isEdit ? 'リマインダーを編集' : 'リマインダーを設定'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 贈答品名 */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">対象の贈答品</p>
              <p className="font-medium text-gray-900">{giftName}</p>
            </div>

            {/* メッセージ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                リマインダーメッセージ <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) setErrors(prev => ({ ...prev, message: '' }));
                }}
                placeholder="お返しを準備する、連絡するなど"
                rows={3}
                disabled={saving}
              />
              {errors.message && (
                <p className="text-sm text-red-500 mt-1">{errors.message}</p>
              )}
            </div>

            {/* リマインダー日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                リマインダー日 <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={format(reminderDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  setReminderDate(new Date(e.target.value));
                  if (errors.reminderDate) setErrors(prev => ({ ...prev, reminderDate: '' }));
                }}
                disabled={saving}
                error={errors.reminderDate}
              />
              
              {/* クイック選択ボタン */}
              {!isEdit && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDate(1)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    disabled={saving}
                  >
                    明日
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDate(3)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    disabled={saving}
                  >
                    3日後
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDate(7)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    disabled={saving}
                  >
                    1週間後
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDate(14)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    disabled={saving}
                  >
                    2週間後
                  </button>
                  <button
                    type="button"
                    onClick={() => setReminderDate(addMonths(new Date(), 1))}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    disabled={saving}
                  >
                    1ヶ月後
                  </button>
                </div>
              )}
            </div>

            {/* ボタン */}
            <div className="flex space-x-2 pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="flex-1"
              >
                {saving ? '保存中...' : isEdit ? '更新する' : '設定する'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={saving}
              >
                キャンセル
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
