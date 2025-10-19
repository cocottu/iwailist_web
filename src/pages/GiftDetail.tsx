import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Loading, EmptyState } from '@/components/ui';
import { GiftRepository, PersonRepository, ImageRepository } from '@/database';
import { Gift, Person, Image } from '@/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';

export const GiftDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gift, setGift] = useState<Gift | null>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadGiftDetail(id);
    }
  }, [id]);

  const loadGiftDetail = async (giftId: string) => {
    try {
      setLoading(true);
      // const _userId = 'demo-user';
      
      const giftRepo = new GiftRepository();
      const personRepo = new PersonRepository();
      const imageRepo = new ImageRepository();
      
      const giftData = await giftRepo.get(giftId);
      if (!giftData) {
        throw new Error('贈答品が見つかりません');
      }
      
      setGift(giftData);
      
      if (giftData.personId) {
        const personData = await personRepo.get(giftData.personId);
        setPerson(personData || null);
      }

      // 画像を読み込む
      const giftImages = await imageRepo.getByEntityId(giftId);
      setImages(giftImages.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Failed to load gift detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!gift || !window.confirm('この贈答品を削除しますか？')) {
      return;
    }
    
    try {
      const giftRepo = new GiftRepository();
      const imageRepo = new ImageRepository();
      
      // 画像も削除
      await imageRepo.deleteByEntityId(gift.id);
      await giftRepo.delete(gift.id);
      navigate('/gifts');
    } catch (error) {
      console.error('Failed to delete gift:', error);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading size="lg" text="データを読み込み中..." />
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          message="贈答品が見つかりません"
          action={{
            label: '一覧に戻る',
            onClick: () => navigate('/gifts')
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link to="/gifts" className="text-gray-500 hover:text-gray-700 mr-4">
            ← 一覧に戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{gift.giftName}</h1>
        </div>
        <div className="flex space-x-2">
          <Link to={`/gifts/${gift.id}/edit`}>
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
          {/* 写真ギャラリー */}
          {images.length > 0 && (
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">写真</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className="aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={image.imageUrl}
                      alt={`写真 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">お返し状況:</span>
                {getStatusBadge(gift.returnStatus)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500">贈り主:</span>
                <span className="text-gray-900">
                  {person ? (
                    <Link 
                      to={`/persons/${person.id}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {person.name}
                    </Link>
                  ) : (
                    '不明な人物'
                  )}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500">受け取り日:</span>
                <span className="text-gray-900">
                  {format(gift.receivedDate, 'yyyy年M月d日', { locale: ja })}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500">カテゴリ:</span>
                <span className="text-gray-900">{gift.category}</span>
              </div>
              
              {gift.amount && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">金額:</span>
                  <span className="text-gray-900 font-medium">
                    {gift.amount.toLocaleString()}円
                  </span>
                </div>
              )}
            </div>
          </Card>

          {gift.memo && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">メモ</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{gift.memo}</p>
            </Card>
          )}
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* 人物情報 */}
          {person && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">贈り主情報</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">氏名:</span>
                  <p className="text-gray-900 font-medium">{person.name}</p>
                </div>
                {person.furigana && (
                  <div>
                    <span className="text-sm text-gray-500">フリガナ:</span>
                    <p className="text-gray-900">{person.furigana}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-500">関係性:</span>
                  <p className="text-gray-900">{person.relationship}</p>
                </div>
                {person.contact && (
                  <div>
                    <span className="text-sm text-gray-500">連絡先:</span>
                    <p className="text-gray-900">{person.contact}</p>
                  </div>
                )}
                {person.memo && (
                  <div>
                    <span className="text-sm text-gray-500">メモ:</span>
                    <p className="text-gray-900 text-sm">{person.memo}</p>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Link to={`/persons/${person.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    人物詳細を見る
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* アクション */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">アクション</h3>
            <div className="space-y-3">
              <Link to={`/gifts/${gift.id}/edit`} className="block">
                <Button className="w-full">編集する</Button>
              </Link>
              {gift.returnStatus === 'pending' && (
                <Button variant="outline" className="w-full">
                  お返しを記録
                </Button>
              )}
            </div>
          </Card>

          {/* メタ情報 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">メタ情報</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <p>作成日: {format(gift.createdAt, 'yyyy年M月d日 HH:mm', { locale: ja })}</p>
              <p>更新日: {format(gift.updatedAt, 'yyyy年M月d日 HH:mm', { locale: ja })}</p>
            </div>
          </Card>
        </div>
      </div>

      {/* 画像モーダル */}
      {selectedImageIndex !== null && images[selectedImageIndex] && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            aria-label="閉じる"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex(Math.max(0, selectedImageIndex - 1));
            }}
            disabled={selectedImageIndex === 0}
            className="absolute left-4 text-white hover:text-gray-300 disabled:opacity-30"
            aria-label="前の画像"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <img
            src={images[selectedImageIndex].imageUrl}
            alt={`写真 ${selectedImageIndex + 1}`}
            className="max-w-full max-h-full object-contain p-4"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex(Math.min(images.length - 1, selectedImageIndex + 1));
            }}
            disabled={selectedImageIndex === images.length - 1}
            className="absolute right-4 text-white hover:text-gray-300 disabled:opacity-30"
            aria-label="次の画像"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <div className="absolute bottom-4 text-white text-sm">
            {selectedImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
};
