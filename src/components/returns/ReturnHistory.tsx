import React, { useState, useEffect } from 'react';
import { Button, Badge, EmptyState, Loading } from '@/components/ui';
import { ReturnRepository, ImageRepository } from '@/database';
import { Return, Image as ImageType } from '@/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { ReturnForm } from './ReturnForm';

interface ReturnHistoryProps {
  giftId: string;
  onReturnAdded?: () => void;
}

export const ReturnHistory: React.FC<ReturnHistoryProps> = ({ giftId, onReturnAdded }) => {
  const [returns, setReturns] = useState<Return[]>([]);
  const [returnImages, setReturnImages] = useState<Record<string, ImageType[]>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReturn, setEditingReturn] = useState<Return | undefined>();
  const [selectedImageModal, setSelectedImageModal] = useState<{
    returnId: string;
    imageIndex: number;
  } | null>(null);

  useEffect(() => {
    loadReturns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giftId]);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const returnRepo = new ReturnRepository();
      const imageRepo = new ImageRepository();
      
      const returnsData = await returnRepo.getByGiftId(giftId);
      setReturns(returnsData);
      
      // 各お返しの画像を読み込む
      const imagesMap: Record<string, ImageType[]> = {};
      for (const returnData of returnsData) {
        const images = await imageRepo.getByEntityId(returnData.id);
        imagesMap[returnData.id] = images.sort((a, b) => a.order - b.order);
      }
      setReturnImages(imagesMap);
    } catch (error) {
      console.error('Failed to load returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReturn = () => {
    setEditingReturn(undefined);
    setShowForm(true);
  };

  const handleEditReturn = (returnData: Return) => {
    setEditingReturn(returnData);
    setShowForm(true);
  };

  const handleDeleteReturn = async (returnId: string) => {
    if (!window.confirm('このお返し情報を削除しますか？')) {
      return;
    }
    
    try {
      const returnRepo = new ReturnRepository();
      const imageRepo = new ImageRepository();
      
      // 関連画像も削除
      await imageRepo.deleteByEntityId(returnId);
      await returnRepo.delete(returnId);
      
      await loadReturns();
      if (onReturnAdded) {
        onReturnAdded();
      }
    } catch (error) {
      console.error('Failed to delete return:', error);
      alert('削除に失敗しました');
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingReturn(undefined);
    await loadReturns();
    if (onReturnAdded) {
      onReturnAdded();
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingReturn(undefined);
  };

  const openImageModal = (returnId: string, imageIndex: number) => {
    setSelectedImageModal({ returnId, imageIndex });
  };

  const closeImageModal = () => {
    setSelectedImageModal(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImageModal) return;
    
    const images = returnImages[selectedImageModal.returnId] || [];
    let newIndex = selectedImageModal.imageIndex;
    
    if (direction === 'prev') {
      newIndex = newIndex > 0 ? newIndex - 1 : images.length - 1;
    } else {
      newIndex = newIndex < images.length - 1 ? newIndex + 1 : 0;
    }
    
    setSelectedImageModal({
      ...selectedImageModal,
      imageIndex: newIndex
    });
  };

  if (loading) {
    return <Loading size="sm" text="お返し履歴を読み込み中..." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">お返し履歴</h3>
        <Button
          variant="primary"
          onClick={handleAddReturn}
          size="sm"
        >
          ＋ お返しを登録
        </Button>
      </div>

      {returns.length === 0 ? (
        <EmptyState
          message="まだお返しが登録されていません"
          action={{
            label: 'お返しを登録',
            onClick: handleAddReturn
          }}
        />
      ) : (
        <div className="space-y-3">
          {returns.map((returnData) => (
            <div
              key={returnData.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {returnData.returnName}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {format(returnData.returnDate, 'yyyy年M月d日(E)', { locale: ja })}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditReturn(returnData)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDeleteReturn(returnData.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    削除
                  </button>
                </div>
              </div>

              {returnData.amount && (
                <div className="mb-2">
                  <Badge status="info">
                    ¥{returnData.amount.toLocaleString()}
                  </Badge>
                </div>
              )}

              {returnData.memo && (
                <p className="text-sm text-gray-700 mb-2">{returnData.memo}</p>
              )}

              {/* 画像ギャラリー */}
              {returnImages[returnData.id] && returnImages[returnData.id].length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {returnImages[returnData.id].map((image, index) => (
                    <img
                      key={image.id}
                      src={image.imageUrl}
                      alt={`${returnData.returnName} ${index + 1}`}
                      className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openImageModal(returnData.id, index)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* お返しフォームモーダル */}
      {showForm && (
        <ReturnForm
          giftId={giftId}
          returnData={editingReturn}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* 画像モーダル */}
      {selectedImageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeImageModal}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
            onClick={closeImageModal}
          >
            ×
          </button>
          
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('prev');
            }}
          >
            ‹
          </button>
          
          <div className="max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={returnImages[selectedImageModal.returnId][selectedImageModal.imageIndex].imageUrl}
              alt="お返し写真"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <p className="text-white text-center mt-2">
              {selectedImageModal.imageIndex + 1} / {returnImages[selectedImageModal.returnId].length}
            </p>
          </div>
          
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('next');
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};
