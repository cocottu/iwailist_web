/**
 * カメラキャプチャコンポーネント
 * Phase 2: カメラ撮影機能
 * react-webcamを使用した実装
 */

import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from './Button';
import { compressImage } from '@/utils/imageProcessing';

/**
 * カメラキャプチャのプロパティ
 */
export interface CameraCaptureProps {
  /** 撮影完了時のコールバック */
  onCapture: (dataURL: string) => void;
  /** キャンセル時のコールバック */
  onCancel: () => void;
  /** デフォルトのカメラの向き */
  defaultFacingMode?: 'user' | 'environment';
  /** 画像圧縮オプション */
  compressOptions?: {
    maxWidth: number;
    maxHeight: number;
    quality: number;
  };
}

/**
 * カメラキャプチャコンポーネント
 * カメラからの写真撮影機能を提供する
 */
export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onCancel,
  defaultFacingMode = 'environment',
  compressOptions
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(defaultFacingMode);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 写真を撮影する
   */
  const handleCapture = useCallback(async () => {
    if (!webcamRef.current) {
      setError('カメラが準備できていません');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // react-webcamのgetScreenshotメソッドで撮影
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (!imageSrc) {
        throw new Error('写真の撮影に失敗しました');
      }

      // 圧縮処理
      if (compressOptions) {
        // Data URLをBlobに変換
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        
        // 圧縮
        const compressedBlob = await compressImage(blob, compressOptions);
        
        // BlobをData URLに変換
        const reader = new FileReader();
        const compressedDataURL = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(compressedBlob);
        });
        
        setCapturedImage(compressedDataURL);
      } else {
        setCapturedImage(imageSrc);
      }
    } catch (err) {
      console.error('Failed to capture photo:', err);
      setError(err instanceof Error ? err.message : '写真の撮影に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  }, [compressOptions]);

  /**
   * 撮影した写真を確定する
   */
  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  /**
   * 撮影した写真を破棄して再撮影する
   */
  const handleRetake = () => {
    setCapturedImage(null);
    setError(null);
  };

  /**
   * カメラを切り替える
   */
  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  /**
   * カメラエラーハンドリング
   */
  const handleUserMediaError = (error: string | DOMException) => {
    console.error('Camera error:', error);
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        setError('カメラへのアクセスが拒否されました。ブラウザの設定を確認してください。');
      } else if (error.name === 'NotFoundError') {
        setError('カメラが見つかりませんでした。');
      } else {
        setError(`カメラエラー: ${error.message}`);
      }
    } else {
      setError(`カメラエラー: ${error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="flex flex-col h-full">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
          <h2 className="text-lg font-semibold">写真を撮影</h2>
          <button
            onClick={onCancel}
            className="text-white hover:text-gray-300"
            aria-label="閉じる"
          >
            <svg
              className="w-6 h-6"
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
        </div>

        {/* カメラプレビュー/撮影画像 */}
        <div className="flex-1 relative bg-black">
          {capturedImage ? (
            // 撮影した画像を表示
            <img
              src={capturedImage}
              alt="撮影した写真"
              className="w-full h-full object-contain"
            />
          ) : (
            // カメラプレビュー（react-webcamを使用）
            <div className="w-full h-full relative">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: facingMode,
                  width: { ideal: 1920 },
                  height: { ideal: 1080 }
                }}
                onUserMediaError={handleUserMediaError}
                className="w-full h-full object-cover"
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>処理中...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* エラー表示 */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
              <div className="text-white text-center px-4">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-lg font-semibold mb-2">カメラエラー</p>
                <p className="text-sm mb-4">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setError(null);
                    setFacingMode(defaultFacingMode);
                  }}
                  className="mt-4"
                >
                  再試行
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* コントロール */}
        <div className="bg-gray-900 p-4">
          {capturedImage ? (
            // 撮影後のコントロール
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                onClick={handleRetake}
                disabled={isProcessing}
                className="text-white border-white hover:bg-gray-700"
              >
                再撮影
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isProcessing}
              >
                この写真を使う
              </Button>
            </div>
          ) : (
            // 撮影前のコントロール
            <div className="flex items-center justify-around">
              {/* カメラ切り替えボタン */}
              <button
                onClick={handleSwitchCamera}
                disabled={isProcessing}
                className="text-white p-3 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="カメラを切り替え"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>

              {/* 撮影ボタン - 常に表示 */}
              <button
                onClick={handleCapture}
                disabled={isProcessing || !!error}
                className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center"
                aria-label="撮影"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-600"></div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-400"></div>
                )}
              </button>

              {/* スペーサー（レイアウトのバランスをとるため） */}
              <div className="w-8 h-8" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
