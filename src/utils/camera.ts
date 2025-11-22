/**
 * カメラユーティリティ
 * Phase 2: カメラ撮影機能
 */

import { ErrorType, AppError } from '@/types';

/**
 * カメラストリーム取得のオプション
 */
export interface CameraConstraints {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
}

/**
 * カメラデバイス情報
 */
export interface CameraDevice {
  deviceId: string;
  label: string;
  facingMode?: 'user' | 'environment';
}

/**
 * カメラストリームを取得する
 * @param constraints カメラ制約条件
 * @returns MediaStreamオブジェクト
 */
export async function getCameraStream(
  constraints?: CameraConstraints
): Promise<MediaStream> {
  try {
    // カメラAPIのサポート確認
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new AppError(
        ErrorType.PERMISSION,
        'お使いのブラウザはカメラ機能に対応していません'
      );
    }

    const defaultConstraints: MediaStreamConstraints = {
      video: {
        facingMode: constraints?.facingMode || 'environment', // リアカメラ優先
        width: { ideal: constraints?.width || 1920 },
        height: { ideal: constraints?.height || 1080 }
      },
      audio: false
    };

    const stream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
    return stream;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new AppError(
          ErrorType.PERMISSION,
          'カメラへのアクセスが拒否されました。ブラウザの設定を確認してください',
          error
        );
      } else if (error.name === 'NotFoundError') {
        throw new AppError(
          ErrorType.PERMISSION,
          'カメラが見つかりません',
          error
        );
      }
    }
    throw new AppError(
      ErrorType.PERMISSION,
      'カメラの起動に失敗しました',
      error as Error
    );
  }
}

/**
 * 利用可能なカメラデバイスのリストを取得する
 * @returns カメラデバイスの配列
 */
export async function getCameraDevices(): Promise<CameraDevice[]> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new AppError(
        ErrorType.PERMISSION,
        'お使いのブラウザはカメラデバイスの列挙に対応していません'
      );
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    return videoDevices.map(device => ({
      deviceId: device.deviceId,
      label: device.label || `カメラ ${device.deviceId.substring(0, 5)}`,
      facingMode: inferFacingMode(device.label)
    }));
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      ErrorType.PERMISSION,
      'カメラデバイスの取得に失敗しました',
      error as Error
    );
  }
}

/**
 * デバイスラベルから向きを推測する
 * @param label デバイスラベル
 * @returns カメラの向き
 */
function inferFacingMode(label: string): 'user' | 'environment' | undefined {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('front') || lowerLabel.includes('user')) {
    return 'user';
  } else if (lowerLabel.includes('back') || lowerLabel.includes('rear') || lowerLabel.includes('environment')) {
    return 'environment';
  }
  return undefined;
}

/**
 * ビデオ要素から写真を撮影する
 * @param videoElement ビデオ要素
 * @param quality 画質（0-1）
 * @returns Blobオブジェクト
 */
export async function capturePhoto(
  videoElement: HTMLVideoElement,
  quality: number = 0.9
): Promise<Blob> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new AppError(
        ErrorType.STORAGE,
        'Canvas contextの取得に失敗しました'
      );
    }

    // ビデオフレームをキャンバスに描画
    context.drawImage(videoElement, 0, 0);

    // CanvasをBlobに変換
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new AppError(
              ErrorType.STORAGE,
              '画像の生成に失敗しました'
            ));
          }
        },
        'image/jpeg',
        quality
      );
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      ErrorType.STORAGE,
      '写真の撮影に失敗しました',
      error as Error
    );
  }
}

/**
 * メディアストリームを停止する
 * @param stream メディアストリーム
 */
export function stopCameraStream(stream: MediaStream): void {
  stream.getTracks().forEach(track => track.stop());
}

/**
 * BlobをData URLに変換する
 * @param blob Blobオブジェクト
 * @returns Data URL文字列
 */
export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new AppError(
          ErrorType.STORAGE,
          'Data URLへの変換に失敗しました'
        ));
      }
    };
    reader.onerror = () => {
      reject(new AppError(
        ErrorType.STORAGE,
        'ファイルの読み込みに失敗しました',
        reader.error || undefined
      ));
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Data URLをBlobに変換する
 * @param dataURL Data URL文字列
 * @returns Blobオブジェクト
 */
export function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}
