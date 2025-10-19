/**
 * Firestore Image Repository
 */
import { firestoreService, where, orderBy } from '../../services/firestoreService';
import { storageService } from '../../services/storageService';
import { Image } from '../../types';
import { FirestoreImage } from '../../types/firebase';

class FirestoreImageRepository {
  /**
   * 画像を作成（アップロードとFirestoreへの保存）
   */
  async create(
    userId: string,
    entityId: string,
    entityType: 'gift' | 'return',
    file: File | Blob,
    order: number
  ): Promise<string> {
    const imageId = crypto.randomUUID();

    // Storage にアップロード
    const { url, path } = await storageService.uploadImage(
      userId,
      file,
      `${entityType}s/${entityId}/${imageId}.jpg`
    );

    // Firestore にメタデータ保存
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'images');

    const firestoreImage: Omit<FirestoreImage, 'createdAt'> = {
      entityId,
      entityType,
      imageUrl: url,
      storagePath: path,
      order,
    };

    await firestoreService.createDocument(collectionPath, imageId, firestoreImage);

    return imageId;
  }

  /**
   * 複数画像を一括作成
   */
  async createMultiple(
    userId: string,
    entityId: string,
    entityType: 'gift' | 'return',
    files: (File | Blob)[]
  ): Promise<string[]> {
    const imageIds: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const imageId = await this.create(userId, entityId, entityType, files[i], i);
      imageIds.push(imageId);
    }

    return imageIds;
  }

  /**
   * 画像を取得
   */
  async get(userId: string, imageId: string): Promise<Image | null> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'images');
    const firestoreImage = await firestoreService.getDocument<
      FirestoreImage & { id: string }
    >(collectionPath, imageId);

    if (!firestoreImage) {
      return null;
    }

    return this.convertToImage(firestoreImage);
  }

  /**
   * エンティティIDで画像を取得
   */
  async getByEntityId(userId: string, entityId: string): Promise<Image[]> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'images');
    const firestoreImages = await firestoreService.queryDocuments<
      FirestoreImage & { id: string }
    >(collectionPath, [
      where('entityId', '==', entityId),
      orderBy('order', 'asc'),
    ]);

    return firestoreImages.map((fi) => this.convertToImage(fi));
  }

  /**
   * 画像を更新（順序変更）
   */
  async updateOrder(userId: string, imageId: string, newOrder: number): Promise<void> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'images');
    await firestoreService.updateDocument(collectionPath, imageId, { order: newOrder });
  }

  /**
   * 画像を削除
   */
  async delete(userId: string, imageId: string): Promise<void> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'images');

    // Firestoreから画像メタデータ取得
    const firestoreImage = await firestoreService.getDocument<
      FirestoreImage & { id: string }
    >(collectionPath, imageId);

    if (!firestoreImage) {
      return;
    }

    // Storageから画像削除
    await storageService.deleteImage(firestoreImage.storagePath);

    // Firestoreからメタデータ削除
    await firestoreService.deleteDocument(collectionPath, imageId);
  }

  /**
   * エンティティの全画像を削除
   */
  async deleteByEntityId(userId: string, entityId: string): Promise<void> {
    const images = await this.getByEntityId(userId, entityId);

    const deletePromises = images.map((image) =>
      this.delete(userId, image.id).catch(console.error)
    );

    await Promise.all(deletePromises);
  }

  /**
   * FirestoreImage → Image変換
   */
  private convertToImage(firestoreImage: FirestoreImage & { id: string }): Image {
    return {
      id: firestoreImage.id,
      entityId: firestoreImage.entityId,
      entityType: firestoreImage.entityType,
      imageUrl: firestoreImage.imageUrl,
      order: firestoreImage.order,
      createdAt: firestoreImage.createdAt.toDate(),
    };
  }
}

export const firestoreImageRepository = new FirestoreImageRepository();
