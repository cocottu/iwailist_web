import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Input, Select } from '@/components/ui';
import { PersonRepository } from '@/database';
import { Person, PersonFormData, Relationship } from '@/types';

export const PersonForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [formData, setFormData] = useState<PersonFormData>({
    name: '',
    furigana: '',
    relationship: Relationship.OTHER,
    contact: '',
    memo: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      loadPerson(id);
    } else {
      setLoading(false);
    }
  }, [isEdit, id]);

  const loadPerson = async (personId: string) => {
    try {
      setLoading(true);
      const personRepo = new PersonRepository();
      const person = await personRepo.get(personId);
      
      if (person) {
        setFormData({
          name: person.name,
          furigana: person.furigana || '',
          relationship: person.relationship,
          contact: person.contact || '',
          memo: person.memo || ''
        });
      }
    } catch (error) {
      console.error('Failed to load person:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PersonFormData, value: any) => {
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
    
    if (!formData.name.trim()) {
      newErrors.name = '氏名は必須です';
    }
    
    if (formData.name.length > 100) {
      newErrors.name = '氏名は100文字以内で入力してください';
    }
    
    if (formData.furigana && formData.furigana.length > 100) {
      newErrors.furigana = 'フリガナは100文字以内で入力してください';
    }
    
    if (formData.contact && formData.contact.length > 200) {
      newErrors.contact = '連絡先は200文字以内で入力してください';
    }
    
    if (formData.memo && formData.memo.length > 500) {
      newErrors.memo = 'メモは500文字以内で入力してください';
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
      const personRepo = new PersonRepository();
      
      const personData: Person = {
        id: id || crypto.randomUUID(),
        userId,
        name: formData.name.trim(),
        furigana: formData.furigana?.trim() || undefined,
        relationship: formData.relationship,
        contact: formData.contact?.trim() || undefined,
        memo: formData.memo?.trim() || undefined,
        createdAt: isEdit ? new Date() : new Date(), // 編集時は既存の日時を保持
        updatedAt: new Date()
      };
      
      if (isEdit) {
        await personRepo.update(personData);
      } else {
        await personRepo.create(personData);
      }
      
      navigate(`/persons/${personData.id}`);
    } catch (error) {
      console.error('Failed to save person:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const relationshipOptions = Object.values(Relationship).map(rel => ({
    value: rel,
    label: rel
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
            {isEdit ? '人物を編集' : '人物を登録'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? '人物の情報を編集できます' : '新しい人物の情報を入力してください'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
            
            <div className="space-y-4">
              <Input
                label="氏名"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                required
                placeholder="例: 田中太郎"
              />
              
              <Input
                label="フリガナ"
                value={formData.furigana}
                onChange={(e) => handleInputChange('furigana', e.target.value)}
                error={errors.furigana}
                placeholder="例: タナカタロウ"
                helperText="任意項目です"
              />
              
              <Select
                label="関係性"
                options={relationshipOptions}
                value={formData.relationship}
                onChange={(e) => handleInputChange('relationship', e.target.value as Relationship)}
                required
              />
              
              <Input
                label="連絡先"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                error={errors.contact}
                placeholder="例: 電話番号、メールアドレスなど"
                helperText="任意項目です"
              />
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
              {errors.memo && (
                <p className="mt-1 text-sm text-red-600">{errors.memo}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.memo?.length || 0}/500文字
              </p>
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
