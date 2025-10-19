/**
 * 画像処理ユーティリティ
 * Phase 2: カメラ撮影機能
 */

import { ErrorType, AppError } from '@/types';

/**
 * 画像圧縮オプション
 */
export interface CompressOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number; // 0-1
}

/**
 * デフォルトの圧縮オプション
 */
export const DEFAULT_COMPRESS_OPTIONS: CompressOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85
};

/**
 * 画像を圧縮する
 * @param file ファイルまたはBlob
 * @param options 圧縮オプション
 * @returns 圧縮されたBlob
 */
export async function compressImage(
  file: File | Blob,
  options: Partial<CompressOptions> = {}
): Promise<Blob> {
  const finalOptions: CompressOptions = {
    ...DEFAULT_COMPRESS_OPTIONS,
    ...options
  };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new AppError(
          ErrorType.STORAGE,
          'ファイルの読み込みに失敗しました'
        ));
        return;
      }
      img.src = e.target.result as string;
    };

    reader.onerror = () => {
      reject(new AppError(
        ErrorType.STORAGE,
        'ファイルの読み込みに失敗しました',
        reader.error || undefined
      ));
    };

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // リサイズ計算
        if (width > finalOptions.maxWidth || height > finalOptions.maxHeight) {
          const ratio = Math.min(
            finalOptions.maxWidth / width,
            finalOptions.maxHeight / height
          );
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new AppError(
            ErrorType.STORAGE,
            'Canvas contextの取得に失敗しました'
          ));
          return;
        }

        // 画像を描画
        ctx.drawImage(img, 0, 0, width, height);

        // Blobに変換
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new AppError(
                ErrorType.STORAGE,
                '画像の圧縮に失敗しました'
              ));
            }
          },
          'image/jpeg',
          finalOptions.quality
        );
      } catch (error) {
        reject(new AppError(
          ErrorType.STORAGE,
          '画像の処理中にエラーが発生しました',
          error as Error
        ));
      }
    };

    img.onerror = () => {
      reject(new AppError(
        ErrorType.STORAGE,
        '画像の読み込みに失敗しました'
      ));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 画像のサイズを取得する
 * @param file ファイルまたはBlob
 * @returns 画像のサイズ（幅、高さ）
 */
export async function getImageDimensions(
  file: File | Blob
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new AppError(
          ErrorType.STORAGE,
          'ファイルの読み込みに失敗しました'
        ));
        return;
      }
      img.src = e.target.result as string;
    };

    reader.onerror = () => {
      reject(new AppError(
        ErrorType.STORAGE,
        'ファイルの読み込みに失敗しました',
        reader.error || undefined
      ));
    };

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };

    img.onerror = () => {
      reject(new AppError(
        ErrorType.STORAGE,
        '画像の読み込みに失敗しました'
      ));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * ファイルサイズをフォーマットする
 * @param bytes バイト数
 * @returns フォーマットされた文字列
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 画像ファイルかどうかを確認する
 * @param file ファイル
 * @returns 画像ファイルの場合true
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * サポートされている画像形式かどうかを確認する
 * @param file ファイル
 * @returns サポートされている場合true
 */
export function isSupportedImageFormat(file: File): boolean {
  const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return supportedFormats.includes(file.type);
}

/**
 * サムネイルを生成する
 * @param file ファイルまたはBlob
 * @param size サムネイルのサイズ（正方形）
 * @returns サムネイルのBlob
 */
export async function generateThumbnail(
  file: File | Blob,
  size: number = 200
): Promise<Blob> {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.8
  });
}
