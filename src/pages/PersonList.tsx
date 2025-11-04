import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Input, Select, Loading, EmptyState } from '@/components/ui';
import { PersonRepository, GiftRepository } from '@/database';
import { Person, Gift, Relationship } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { syncManager } from '@/services/syncManager';
import { isFirebaseEnabled } from '@/lib/firebase';
// import { format } from 'date-fns';
// import { ja } from 'date-fns/locale';

export const PersonList: React.FC = () => {
  const { user } = useAuth();
  const [persons, setPersons] = useState<Person[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState('');

  const loadPersons = useCallback(async () => {
    try {
      const userId = user?.uid || 'demo-user';
      const personRepo = new PersonRepository();
      
      let personsData: Person[];
      if (searchText) {
        personsData = await personRepo.search(userId, searchText);
      } else {
        personsData = await personRepo.getAll(userId);
      }
      
      // 関係性でフィルタリング
      if (relationshipFilter) {
        personsData = personsData.filter(p => p.relationship === relationshipFilter);
      }
      
      setPersons(personsData);
    } catch (error) {
      console.error('Failed to load persons:', error);
    }
  }, [searchText, relationshipFilter, user?.uid]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const userId = user?.uid || 'demo-user';
        
        // Firebaseが有効な場合、最初に同期を実行
        if (isFirebaseEnabled() && user?.uid && navigator.onLine) {
          console.log('[PersonList] Syncing data before load...');
          try {
            await syncManager.triggerSync(user.uid);
            console.log('[PersonList] Sync completed');
          } catch (error) {
            console.error('[PersonList] Sync failed:', error);
            // 同期に失敗してもローカルデータは表示する
          }
        }
        
        const giftRepo = new GiftRepository();
        const giftsData = await giftRepo.getAll(userId);
        setGifts(giftsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.uid]);

  useEffect(() => {
    loadPersons();
  }, [loadPersons]);

  const getPersonGifts = (personId: string) => {
    return gifts.filter(g => g.personId === personId);
  };

  const getPersonGiftStats = (personId: string) => {
    const personGifts = getPersonGifts(personId);
    const totalAmount = personGifts.reduce((sum, g) => sum + (g.amount || 0), 0);
    const pendingCount = personGifts.filter(g => g.returnStatus === 'pending').length;
    
    return {
      count: personGifts.length,
      totalAmount,
      pendingCount
    };
  };

  const relationshipOptions = [
    { value: '', label: 'すべての関係性' },
    ...Object.values(Relationship).map(rel => ({
      value: rel,
      label: rel
    }))
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
          <h1 className="text-2xl font-bold text-gray-900">人物一覧</h1>
          <p className="text-gray-600 mt-1">
            {persons.length}人の人物が登録されています
          </p>
        </div>
        <Link to="/persons/new" className="mt-4 sm:mt-0">
          <Button size="lg" className="flex items-center">
            <span className="mr-2">+</span>
            新規登録
          </Button>
        </Link>
      </div>

      {/* フィルター */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="検索"
              placeholder="名前で検索..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div>
            <Select
              label="関係性"
              options={relationshipOptions}
              value={relationshipFilter}
              onChange={(e) => setRelationshipFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* 人物一覧 */}
      {persons.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            message="人物が見つかりません"
            action={{
              label: '最初の人物を登録',
              onClick: () => window.location.href = '/persons/new'
            }}
            icon={<span className="text-4xl">👤</span>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {persons.map((person) => {
            const stats = getPersonGiftStats(person.id);
            
            return (
              <Card
                key={person.id}
                className="p-6 hover:shadow-md transition-shadow"
                data-testid="person-card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {person.name}
                    </h3>
                    {person.furigana && (
                      <p className="text-sm text-gray-500 mb-2">
                        {person.furigana}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mb-2">
                      {person.relationship}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">贈答品数:</span>
                    <span className="text-gray-900 font-medium">
                      {stats.count}件
                    </span>
                  </div>
                  {stats.totalAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">総額:</span>
                      <span className="text-gray-900 font-medium">
                        {stats.totalAmount.toLocaleString()}円
                      </span>
                    </div>
                  )}
                  {stats.pendingCount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">未対応:</span>
                      <span className="text-yellow-600 font-medium">
                        {stats.pendingCount}件
                      </span>
                    </div>
                  )}
                </div>
                
                {person.memo && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {person.memo}
                  </p>
                )}
                
                <div className="flex justify-end">
                  <Link to={`/persons/${person.id}`}>
                    <Button variant="outline" size="sm">
                      詳細を見る
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
