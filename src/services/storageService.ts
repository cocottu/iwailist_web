/**
 * Firebase Storage サービス
 */
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { storage, isFirebaseEnabled, getEnvironmentStoragePath } from '../lib/firebase';
import { compressImage } from '../utils/imageProcessing';

interface UploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

class StorageService {
  /**
   * 画像をアップロード
   */
  async uploadImage(
    userId: string,
    file: File | Blob,
    path: string,
    options: UploadOptions = {}
  ): Promise<{ url: string; path: string }> {
    if (!isFirebaseEnabled() || !storage) {
      throw new Error('Firebase Storage is not enabled');
    }

    try {
      // 画像圧縮
      const compressedBlob = await compressImage(file, {
        maxWidth: options.maxWidth || 1920,
        maxHeight: options.maxHeight || 1920,
        quality: options.quality || 0.8,
      });

      // ストレージパス生成
      const storagePath = getEnvironmentStoragePath(`users/${userId}/${path}`);
      const storageRef = ref(storage, storagePath);

      // アップロード
      await uploadBytes(storageRef, compressedBlob, {
        contentType: 'image/jpeg',
      });

      // ダウンロードURL取得
      const downloadURL = await getDownloadURL(storageRef);

      return {
        url: downloadURL,
        path: storagePath,
      };
    } catch (error) {
      console.error('Storage upload error:', error);
      throw new Error('画像のアップロードに失敗しました');
    }
  }

  /**
   * 複数画像を一括アップロード
   */
  async uploadImages(
    userId: string,
    files: (File | Blob)[],
    basePath: string,
    options: UploadOptions = {}
  ): Promise<Array<{ url: string; path: string }>> {
    const uploadPromises = files.map((file, index) => {
      const fileName = `${Date.now()}_${index}.jpg`;
      const path = `${basePath}/${fileName}`;
      return this.uploadImage(userId, file, path, options);
    });

    return Promise.all(uploadPromises);
  }

  /**
   * 画像を削除
   */
  async deleteImage(storagePath: string): Promise<void> {
    if (!isFirebaseEnabled() || !storage) {
      throw new Error('Firebase Storage is not enabled');
    }

    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Storage delete error:', error);
      // 存在しないファイルの削除エラーは無視
      if ((error as { code?: string }).code !== 'storage/object-not-found') {
        throw new Error('画像の削除に失敗しました');
      }
    }
  }

  /**
   * 複数画像を一括削除
   */
  async deleteImages(storagePaths: string[]): Promise<void> {
    const deletePromises = storagePaths.map((path) =>
      this.deleteImage(path).catch((error) => {
        console.error(`Failed to delete ${path}:`, error);
      })
    );

    await Promise.all(deletePromises);
  }

  /**
   * ディレクトリ内の全画像を削除
   */
  async deleteDirectory(userId: string, dirPath: string): Promise<void> {
    if (!isFirebaseEnabled() || !storage) {
      throw new Error('Firebase Storage is not enabled');
    }

    try {
      const storagePath = getEnvironmentStoragePath(`users/${userId}/${dirPath}`);
      const storageRef = ref(storage, storagePath);
      const listResult = await listAll(storageRef);

      // すべてのファイルを削除
      const deletePromises = listResult.items.map((itemRef) =>
        deleteObject(itemRef).catch(console.error)
      );

      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Directory delete error:', error);
      throw new Error('ディレクトリの削除に失敗しました');
    }
  }

  /**
   * ダウンロードURL取得
   */
  async getDownloadURL(storagePath: string): Promise<string> {
    if (!isFirebaseEnabled() || !storage) {
      throw new Error('Firebase Storage is not enabled');
    }

    try {
      const storageRef = ref(storage, storagePath);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Get download URL error:', error);
      throw new Error('画像URLの取得に失敗しました');
    }
  }

  /**
   * ストレージ使用量を取得（概算）
   */
  async getStorageUsage(userId: string): Promise<number> {
    if (!isFirebaseEnabled() || !storage) {
      return 0;
    }

    try {
      const storagePath = getEnvironmentStoragePath(`users/${userId}`);
      const storageRef = ref(storage, storagePath);
      const listResult = await listAll(storageRef);

      // 各ファイルのメタデータを取得してサイズを合計
      // 注: getMetadata()は追加のAPI呼び出しが必要なため、実装は省略
      // 実際の使用量はFirebase Consoleで確認することを推奨

      return listResult.items.length;
    } catch (error) {
      console.error('Get storage usage error:', error);
      return 0;
    }
  }
}

export const storageService = new StorageService();
