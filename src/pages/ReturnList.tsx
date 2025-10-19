import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Loading, EmptyState, Input } from '@/components/ui';
import { ReturnRepository, GiftRepository, ImageRepository } from '@/database';
import { Return, Gift, Image as ImageType } from '@/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';

interface ReturnWithGift extends Return {
  gift?: Gift;
  images?: ImageType[];
}

export const ReturnList: React.FC = () => {
  const [returns, setReturns] = useState<ReturnWithGift[]>([]);
  const [filteredReturns, setFilteredReturns] = useState<ReturnWithGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadReturns();
  }, []);

  useEffect(() => {
    filterReturns();
  }, [searchText, returns]);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const userId = 'demo-user';
      
      const giftRepo = new GiftRepository();
      const returnRepo = new ReturnRepository();
      const imageRepo = new ImageRepository();
      
      // 全ての贈答品を取得
      const gifts = await giftRepo.getAll(userId);
      
      // 各贈答品のお返しを取得
      const allReturns: ReturnWithGift[] = [];
      for (const gift of gifts) {
        const giftReturns = await returnRepo.getByGiftId(gift.id);
        
        for (const returnData of giftReturns) {
          // お返しの画像を取得
          const images = await imageRepo.getByEntityId(returnData.id);
          
          allReturns.push({
            ...returnData,
            gift: gift,
            images: images.sort((a, b) => a.order - b.order)
          });
        }
      }
      
      // 日付の新しい順にソート
      allReturns.sort((a, b) => b.returnDate.getTime() - a.returnDate.getTime());
      
      setReturns(allReturns);
      setFilteredReturns(allReturns);
    } catch (error) {
      console.error('Failed to load returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReturns = () => {
    if (!searchText.trim()) {
      setFilteredReturns(returns);
      return;
    }
    
    const search = searchText.toLowerCase();
    const filtered = returns.filter(returnData => 
      returnData.returnName.toLowerCase().includes(search) ||
      returnData.memo?.toLowerCase().includes(search) ||
      returnData.gift?.giftName.toLowerCase().includes(search)
    );
    
    setFilteredReturns(filtered);
  };

  const getTotalAmount = () => {
    return filteredReturns.reduce((sum, returnData) => sum + (returnData.amount || 0), 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading size="lg" text="お返し一覧を読み込み中..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">お返し一覧</h1>
          <p className="text-gray-600 mt-2">
            全{filteredReturns.length}件のお返し記録
          </p>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">お返し総数</p>
          <p className="text-3xl font-bold text-gray-900">{filteredReturns.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">お返し総額</p>
          <p className="text-3xl font-bold text-gray-900">
            ¥{getTotalAmount().toLocaleString()}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">平均金額</p>
          <p className="text-3xl font-bold text-gray-900">
            ¥{filteredReturns.length > 0 
              ? Math.round(getTotalAmount() / filteredReturns.length).toLocaleString() 
              : 0}
          </p>
        </Card>
      </div>

      {/* 検索バー */}
      <Card className="p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="お返し品名、メモ、贈答品名で検索..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          {searchText && (
            <Button
              variant="outline"
              onClick={() => setSearchText('')}
            >
              クリア
            </Button>
          )}
        </div>
      </Card>

      {/* お返しリスト */}
      {filteredReturns.length === 0 ? (
        <EmptyState
          message={searchText ? '検索結果が見つかりません' : 'まだお返しが登録されていません'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReturns.map((returnData) => (
            <Card
              key={returnData.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* 画像 */}
              {returnData.images && returnData.images.length > 0 && (
                <img
                  src={returnData.images[0].imageUrl}
                  alt={returnData.returnName}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-4">
                {/* お返し情報 */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {returnData.returnName}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">お返し日:</span>
                    <span className="text-gray-900">
                      {format(returnData.returnDate, 'yyyy年M月d日', { locale: ja })}
                    </span>
                  </div>
                  
                  {returnData.amount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">金額:</span>
                      <Badge status="info">
                        ¥{returnData.amount.toLocaleString()}
                      </Badge>
                    </div>
                  )}
                  
                  {returnData.gift && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">元の贈答品:</span>
                      <Link
                        to={`/gifts/${returnData.gift.id}`}
                        className="text-blue-600 hover:text-blue-800 truncate max-w-[150px]"
                      >
                        {returnData.gift.giftName}
                      </Link>
                    </div>
                  )}
                  
                  {returnData.images && returnData.images.length > 1 && (
                    <div className="flex items-center text-sm text-gray-500">
                      📷 {returnData.images.length}枚の写真
                    </div>
                  )}
                </div>
                
                {returnData.memo && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {returnData.memo}
                  </p>
                )}
                
                {/* アクションボタン */}
                {returnData.gift && (
                  <Link to={`/gifts/${returnData.gift.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      贈答品詳細を見る
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
