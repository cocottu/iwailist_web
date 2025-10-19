import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Input, Select, Badge, Loading, EmptyState } from '@/components/ui';
import { GiftRepository, PersonRepository } from '@/database';
import { Gift, Person, GiftFilters, GiftCategory, ReturnStatus } from '@/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { logger } from '@/utils/logger';

export const GiftList: React.FC = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<GiftFilters>({});
  const [searchText, setSearchText] = useState('');

  const loadGifts = useCallback(async () => {
    try {
      const userId = 'demo-user';
      const giftRepo = new GiftRepository();
      
      const giftFilters: GiftFilters = {
        ...filters,
        searchText: searchText || undefined
      };
      
      const giftsData = await giftRepo.query(userId, giftFilters);
      setGifts(giftsData);
    } catch (error) {
      logger.error('Failed to load gifts:', error);
    }
  }, [filters, searchText]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const userId = 'demo-user';
        
        const personRepo = new PersonRepository();
        const personsData = await personRepo.getAll(userId);
        setPersons(personsData);
      } catch (error) {
        logger.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    loadGifts();
  }, [loadGifts]);

  const handleFilterChange = (key: keyof GiftFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const getPersonName = (personId: string) => {
    const person = persons.find(p => p.id === personId);
    return person?.name || '不明な人物';
  };

  const getStatusBadge = (status: ReturnStatus) => {
    switch (status) {
      case 'pending':
        return <Badge status="pending">未対応</Badge>;
      case 'completed':
        return <Badge status="completed">対応済</Badge>;
      case 'not_required':
        return <Badge status="not_required">不要</Badge>;
      default:
        return <Badge status="info">不明</Badge>;
    }
  };

  const categoryOptions = [
    { value: '', label: 'すべてのカテゴリ' },
    ...Object.values(GiftCategory).map(category => ({
      value: category,
      label: category
    }))
  ];

  const statusOptions = [
    { value: '', label: 'すべての状況' },
    { value: 'pending', label: '未対応' },
    { value: 'completed', label: '対応済' },
    { value: 'not_required', label: '不要' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading size="lg" text="データを読み込み中..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">贈答品一覧</h1>
          <p className="text-gray-600 mt-1">
            {gifts.length}件の贈答品が登録されています
          </p>
        </div>
        <Link to="/gifts/new" className="mt-4 sm:mt-0">
          <Button size="lg" className="flex items-center">
            <span className="mr-2">+</span>
            新規登録
          </Button>
        </Link>
      </div>

      {/* フィルター */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              label="検索"
              placeholder="贈答品名で検索..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div>
            <Select
              label="カテゴリ"
              options={categoryOptions}
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            />
          </div>
          <div>
            <Select
              label="お返し状況"
              options={statusOptions}
              value={filters.returnStatus || ''}
              onChange={(e) => handleFilterChange('returnStatus', e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({});
                setSearchText('');
              }}
              className="w-full"
            >
              リセット
            </Button>
          </div>
        </div>
      </Card>

      {/* 贈答品一覧 */}
      {gifts.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            message="贈答品が見つかりません"
            action={{
              label: '最初の贈答品を登録',
              onClick: () => window.location.href = '/gifts/new'
            }}
            icon={<span className="text-4xl">🎁</span>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gifts.map((gift) => (
            <Card key={gift.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {gift.giftName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {getPersonName(gift.personId)}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    {format(gift.receivedDate, 'yyyy年M月d日', { locale: ja })}
                  </p>
                </div>
                {getStatusBadge(gift.returnStatus)}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">カテゴリ:</span>
                  <span className="text-gray-900">{gift.category}</span>
                </div>
                {gift.amount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">金額:</span>
                    <span className="text-gray-900 font-medium">
                      {gift.amount.toLocaleString()}円
                    </span>
                  </div>
                )}
              </div>
              
              {gift.memo && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {gift.memo}
                </p>
              )}
              
              <div className="flex justify-end">
                <Link to={`/gifts/${gift.id}`}>
                  <Button variant="outline" size="sm">
                    詳細を見る
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
