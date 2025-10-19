import React, { useState } from 'react';
import { Button, Input, CameraCapture } from '@/components/ui';
import { ReturnRepository, ImageRepository } from '@/database';
import { Return, ReturnFormData } from '@/types';
import { format } from 'date-fns';

interface ReturnFormProps {
  giftId: string;
  returnData?: Return;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ReturnForm: React.FC<ReturnFormProps> = ({
  giftId,
  returnData,
  onSuccess,
  onCancel
}) => {
  const isEdit = !!returnData;
  
  const [formData, setFormData] = useState<ReturnFormData>({
    returnName: returnData?.returnName || '',
    returnDate: returnData?.returnDate || new Date(),
    amount: returnData?.amount,
    memo: returnData?.memo || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);

  const handleInputChange = (field: keyof ReturnFormData, value: string | number | Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.returnName.trim()) {
      newErrors.returnName = 'お返し品名は必須です';
    }
    
    if (!formData.returnDate) {
      newErrors.returnDate = 'お返し日は必須です';
    }
    
    if (formData.amount !== undefined && formData.amount < 0) {
      newErrors.amount = '金額は0以上である必要があります';
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
      const returnRepo = new ReturnRepository();
      const imageRepo = new ImageRepository();
      
      const returnId = returnData?.id || crypto.randomUUID();
      
      const returnRecord: Return = {
        id: returnId,
        giftId: giftId,
        returnName: formData.returnName.trim(),
        returnDate: formData.returnDate,
        amount: formData.amount,
        memo: formData.memo?.trim() || undefined,
        createdAt: returnData?.createdAt || new Date()
      };
      
      if (isEdit) {
        await returnRepo.update(returnRecord);
        // 既存の画像を削除
        await imageRepo.deleteByEntityId(returnId);
      } else {
        await returnRepo.create(returnRecord);
      }
      
      // 画像を保存
      for (let i = 0; i < images.length; i++) {
        await imageRepo.create({
          id: crypto.randomUUID(),
          entityId: returnId,
          entityType: 'return',
          imageUrl: images[i],
          order: i,
          createdAt: new Date()
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Failed to save return:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleCameraCapture = (imageDataUrl: string) => {
    setImages(prev => [...prev, imageDataUrl]);
    setShowCamera(false);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isEdit ? 'お返し情報を編集' : 'お返しを登録'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* お返し品名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                お返し品名 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.returnName}
                onChange={(e) => handleInputChange('returnName', e.target.value)}
                placeholder="カタログギフト、お菓子など"
                disabled={saving}
                error={errors.returnName}
              />
            </div>

            {/* お返し日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                お返し日 <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={format(formData.returnDate, 'yyyy-MM-dd')}
                onChange={(e) => handleInputChange('returnDate', new Date(e.target.value))}
                disabled={saving}
                error={errors.returnDate}
              />
            </div>

            {/* 金額 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                金額（円）
              </label>
              <Input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="5000"
                disabled={saving}
                error={errors.amount}
              />
            </div>

            {/* メモ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メモ
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.memo}
                onChange={(e) => handleInputChange('memo', e.target.value)}
                placeholder="お返しの詳細など"
                rows={3}
                disabled={saving}
              />
            </div>

            {/* 写真 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                写真
              </label>
              
              <div className="space-y-2">
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          alt={`お返し写真 ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                          disabled={saving}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {images.length < 5 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowCamera(true)}
                    disabled={saving}
                  >
                    📷 写真を撮影
                  </Button>
                )}
              </div>
            </div>

            {/* ボタン */}
            <div className="flex space-x-2 pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="flex-1"
              >
                {saving ? '保存中...' : isEdit ? '更新する' : '登録する'}
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

      {/* カメラモーダル */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};
