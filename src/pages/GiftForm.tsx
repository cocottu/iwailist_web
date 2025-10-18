import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Input, Select } from '@/components/ui';
import { GiftRepository, PersonRepository } from '@/database';
import { Gift, Person, GiftFormData, GiftCategory, ReturnStatus } from '@/types';

export const GiftForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [formData, setFormData] = useState<GiftFormData>({
    giftName: '',
    personId: '',
    receivedDate: new Date(),
    amount: undefined,
    category: GiftCategory.OTHER,
    returnStatus: ReturnStatus.PENDING,
    memo: ''
  });
  
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      loadGift(id);
    }
  }, [isEdit, id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const userId = 'demo-user';
      
      const personRepo = new PersonRepository();
      const personsData = await personRepo.getAll(userId);
      setPersons(personsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGift = async (giftId: string) => {
    try {
      const giftRepo = new GiftRepository();
      const gift = await giftRepo.get(giftId);
      
      if (gift) {
        setFormData({
          giftName: gift.giftName,
          personId: gift.personId,
          receivedDate: gift.receivedDate,
          amount: gift.amount,
          category: gift.category,
          returnStatus: gift.returnStatus,
          memo: gift.memo || ''
        });
      }
    } catch (error) {
      console.error('Failed to load gift:', error);
    }
  };

  const handleInputChange = (field: keyof GiftFormData, value: any) => {
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
    
    if (!formData.giftName.trim()) {
      newErrors.giftName = '贈答品名は必須です';
    }
    
    if (!formData.personId) {
      newErrors.personId = '贈り主を選択してください';
    }
    
    if (!formData.receivedDate) {
      newErrors.receivedDate = '受け取り日は必須です';
    } else if (formData.receivedDate > new Date()) {
      newErrors.receivedDate = '受け取り日は未来の日付にできません';
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
      const userId = 'demo-user';
      const giftRepo = new GiftRepository();
      
      const giftData: Gift = {
        id: id || crypto.randomUUID(),
        userId,
        personId: formData.personId,
        giftName: formData.giftName.trim(),
        receivedDate: formData.receivedDate,
        amount: formData.amount,
        category: formData.category,
        returnStatus: formData.returnStatus,
        memo: formData.memo?.trim() || undefined,
        createdAt: isEdit ? new Date() : new Date(), // 編集時は既存の日時を保持
        updatedAt: new Date()
      };
      
      if (isEdit) {
        await giftRepo.update(giftData);
      } else {
        await giftRepo.create(giftData);
      }
      
      navigate(`/gifts/${giftData.id}`);
    } catch (error) {
      console.error('Failed to save gift:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = Object.values(GiftCategory).map(category => ({
    value: category,
    label: category
  }));

  const statusOptions = [
    { value: ReturnStatus.PENDING, label: '未対応' },
    { value: ReturnStatus.COMPLETED, label: '対応済' },
    { value: ReturnStatus.NOT_REQUIRED, label: '不要' }
  ];

  const personOptions = persons.map(person => ({
    value: person.id,
    label: person.name
  }));

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? '贈答品を編集' : '贈答品を登録'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? '贈答品の情報を編集できます' : '新しい贈答品の情報を入力してください'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
            
            <div className="space-y-4">
              <Input
                label="贈答品名"
                value={formData.giftName}
                onChange={(e) => handleInputChange('giftName', e.target.value)}
                error={errors.giftName}
                required
                placeholder="例: 結婚祝い"
              />
              
              <Select
                label="贈り主"
                options={[
                  { value: '', label: '選択してください' },
                  ...personOptions
                ]}
                value={formData.personId}
                onChange={(e) => handleInputChange('personId', e.target.value)}
                error={errors.personId}
                required
              />
              
              <Input
                label="受け取り日"
                type="date"
                value={formData.receivedDate.toISOString().split('T')[0]}
                onChange={(e) => handleInputChange('receivedDate', new Date(e.target.value))}
                error={errors.receivedDate}
                required
              />
              
              <Input
                label="金額"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', e.target.value ? Number(e.target.value) : undefined)}
                error={errors.amount}
                placeholder="例: 30000"
                helperText="任意項目です"
              />
              
              <Select
                label="カテゴリ"
                options={categoryOptions}
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value as GiftCategory)}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  お返し状況 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {statusOptions.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="returnStatus"
                        value={option.value}
                        checked={formData.returnStatus === option.value}
                        onChange={(e) => handleInputChange('returnStatus', e.target.value as ReturnStatus)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">その他</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メモ
              </label>
              <textarea
                value={formData.memo}
                onChange={(e) => handleInputChange('memo', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="特記事項があれば入力してください"
              />
            </div>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              loading={saving}
              disabled={saving}
            >
              {isEdit ? '更新する' : '登録する'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
