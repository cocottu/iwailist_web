import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Loading, EmptyState } from '@/components/ui';
import { PersonRepository, GiftRepository } from '@/database';
import { Person, Gift } from '@/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export const PersonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPersonDetail(id);
    }
  }, [id]);

  const loadPersonDetail = async (personId: string) => {
    try {
      setLoading(true);
      const userId = 'demo-user';
      
      const personRepo = new PersonRepository();
      const giftRepo = new GiftRepository();
      
      const personData = await personRepo.get(personId);
      if (!personData) {
        throw new Error('人物が見つかりません');
      }
      
      setPerson(personData);
      
      const giftsData = await giftRepo.getByPersonId(userId, personId);
      setGifts(giftsData);
    } catch (error) {
      console.error('Failed to load person detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!person || !window.confirm('この人物を削除しますか？関連する贈答品も削除されます。')) {
      return;
    }
    
    try {
      const personRepo = new PersonRepository();
      const giftRepo = new GiftRepository();
      
      // 関連する贈答品を削除
      for (const gift of gifts) {
        await giftRepo.delete(gift.id);
      }
      
      // 人物を削除
      await personRepo.delete(person.id);
      
      navigate('/persons');
    } catch (error) {
      console.error('Failed to delete person:', error);
      alert('削除に失敗しました');
    }
  };

  const getStatusBadge = (status: string) => {
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

  const getGiftStats = () => {
    const totalAmount = gifts.reduce((sum, g) => sum + (g.amount || 0), 0);
    const pendingCount = gifts.filter(g => g.returnStatus === 'pending').length;
    const completedCount = gifts.filter(g => g.returnStatus === 'completed').length;
    
    return {
      totalAmount,
      pendingCount,
      completedCount,
      totalCount: gifts.length
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading size="lg" text="データを読み込み中..." />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          message="人物が見つかりません"
          action={{
            label: '一覧に戻る',
            onClick: () => navigate('/persons')
          }}
        />
      </div>
    );
  }

  const stats = getGiftStats();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link to="/persons" className="text-gray-500 hover:text-gray-700 mr-4">
            ← 一覧に戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{person.name}</h1>
        </div>
        <div className="flex space-x-2">
          <Link to={`/persons/${person.id}/edit`}>
            <Button variant="outline">編集</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            削除
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* メイン情報 */}
        <div className="lg:col-span-2">
          {/* 基本情報 */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">氏名:</span>
                <span className="text-gray-900 font-medium">{person.name}</span>
              </div>
              
              {person.furigana && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">フリガナ:</span>
                  <span className="text-gray-900">{person.furigana}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500">関係性:</span>
                <span className="text-gray-900">{person.relationship}</span>
              </div>
              
              {person.contact && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">連絡先:</span>
                  <span className="text-gray-900">{person.contact}</span>
                </div>
              )}
            </div>
          </Card>

          {/* メモ */}
          {person.memo && (
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">メモ</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{person.memo}</p>
            </Card>
          )}

          {/* 贈答品履歴 */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">贈答品履歴</h2>
              <Link to="/gifts/new">
                <Button size="sm">新しい贈答品を登録</Button>
              </Link>
            </div>
            
            {gifts.length === 0 ? (
              <EmptyState
                message="まだ贈答品が登録されていません"
                action={{
                  label: '最初の贈答品を登録',
                  onClick: () => window.location.href = '/gifts/new'
                }}
                icon={<span className="text-2xl">🎁</span>}
              />
            ) : (
              <div className="space-y-4">
                {gifts.map((gift) => (
                  <div key={gift.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{gift.giftName}</h3>
                      {getStatusBadge(gift.returnStatus)}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{gift.category}</span>
                      <span>{format(gift.receivedDate, 'yyyy年M月d日', { locale: ja })}</span>
                    </div>
                    {gift.amount && (
                      <div className="text-sm text-gray-700 mt-1">
                        {gift.amount.toLocaleString()}円
                      </div>
                    )}
                    <div className="mt-2">
                      <Link to={`/gifts/${gift.id}`}>
                        <Button variant="outline" size="sm">
                          詳細を見る
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* 統計情報 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">統計情報</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">贈答品数:</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.totalCount}件
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">総額:</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.totalAmount.toLocaleString()}円
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">未対応:</span>
                <span className="text-sm font-medium text-yellow-600">
                  {stats.pendingCount}件
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">対応済:</span>
                <span className="text-sm font-medium text-green-600">
                  {stats.completedCount}件
                </span>
              </div>
            </div>
          </Card>

          {/* アクション */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">アクション</h3>
            <div className="space-y-3">
              <Link to={`/persons/${person.id}/edit`} className="block">
                <Button className="w-full">編集する</Button>
              </Link>
              <Link to="/gifts/new" className="block">
                <Button variant="outline" className="w-full">
                  贈答品を登録
                </Button>
              </Link>
            </div>
          </Card>

          {/* メタ情報 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">メタ情報</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <p>作成日: {format(person.createdAt, 'yyyy年M月d日 HH:mm', { locale: ja })}</p>
              <p>更新日: {format(person.updatedAt, 'yyyy年M月d日 HH:mm', { locale: ja })}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
