/**
 * データ移行ユーティリティ
 * IndexedDB → Firestore への初回データ移行
 */
import { GiftRepository } from '../database/repositories/giftRepository';
import { PersonRepository } from '../database/repositories/personRepository';
import { firestoreGiftRepository } from '../repositories/firebase/giftRepository';
import { firestorePersonRepository } from '../repositories/firebase/personRepository';
import { isFirebaseEnabled } from '../lib/firebase';

const giftRepository = new GiftRepository();
const personRepository = new PersonRepository();

interface MigrationResult {
  success: boolean;
  giftsCount: number;
  personsCount: number;
  imagesCount: number;
  errors: string[];
}

class DataMigration {
  private readonly MIGRATION_KEY = 'dataMigrationCompleted';

  /**
   * 移行が完了しているかチェック
   */
  isMigrationCompleted(): boolean {
    return localStorage.getItem(this.MIGRATION_KEY) === 'true';
  }

  /**
   * 移行完了をマーク
   */
  markMigrationCompleted(): void {
    localStorage.setItem(this.MIGRATION_KEY, 'true');
  }

  /**
   * 移行をリセット（開発用）
   */
  resetMigration(): void {
    localStorage.removeItem(this.MIGRATION_KEY);
  }

  /**
   * 初回データ移行を実行
   */
  async migrateToFirestore(userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      giftsCount: 0,
      personsCount: 0,
      imagesCount: 0,
      errors: [],
    };

    if (!isFirebaseEnabled()) {
      result.success = false;
      result.errors.push('Firebase is not enabled');
      return result;
    }

    if (this.isMigrationCompleted()) {
      console.log('Migration already completed');
      return result;
    }

    try {
      console.log('Starting data migration...');

      // 人物データを移行
      result.personsCount = await this.migratePersons(userId, result.errors);

      // 贈答品データを移行
      result.giftsCount = await this.migrateGifts(userId, result.errors);

      // 画像データを移行（実装は省略 - Storage容量を考慮）
      // result.imagesCount = await this.migrateImages(userId, result.errors);

      // 移行完了をマーク
      this.markMigrationCompleted();

      console.log('Migration completed:', result);
    } catch (error) {
      console.error('Migration error:', error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  /**
   * 人物データを移行
   */
  private async migratePersons(userId: string, errors: string[]): Promise<number> {
    try {
      const localPersons = await personRepository.getAll(userId);
      console.log(`Migrating ${localPersons.length} persons...`);

      let migratedCount = 0;
      for (const person of localPersons) {
        try {
          await firestorePersonRepository.create(userId, person);
          migratedCount++;
        } catch (error) {
          console.error(`Failed to migrate person ${person.id}:`, error);
          errors.push(`Person ${person.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      console.log(`Migrated ${migratedCount} persons`);
      return migratedCount;
    } catch (error) {
      console.error('Person migration error:', error);
      errors.push(`Person migration: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return 0;
    }
  }

  /**
   * 贈答品データを移行
   */
  private async migrateGifts(userId: string, errors: string[]): Promise<number> {
    try {
      const localGifts = await giftRepository.getAll(userId);
      console.log(`Migrating ${localGifts.length} gifts...`);

      let migratedCount = 0;
      for (const gift of localGifts) {
        try {
          await firestoreGiftRepository.create(userId, gift);
          migratedCount++;
        } catch (error) {
          console.error(`Failed to migrate gift ${gift.id}:`, error);
          errors.push(`Gift ${gift.giftName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      console.log(`Migrated ${migratedCount} gifts`);
      return migratedCount;
    } catch (error) {
      console.error('Gift migration error:', error);
      errors.push(`Gift migration: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return 0;
    }
  }

}

export const dataMigration = new DataMigration();
