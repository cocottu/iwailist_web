/**
 * Firestore Reminder Repository
 */
import { Timestamp } from 'firebase/firestore';
import { firestoreService, where, orderBy } from '../../services/firestoreService';
import { Reminder } from '../../types';
import { FirestoreReminder } from '../../types/firebase';

class FirestoreReminderRepository {
  /**
   * リマインダーを作成
   */
  async create(userId: string, reminder: Omit<Reminder, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'reminders');
    const reminderId = crypto.randomUUID();

    const firestoreReminder: Omit<FirestoreReminder, 'createdAt'> = {
      giftId: reminder.giftId,
      reminderDate: Timestamp.fromDate(reminder.reminderDate),
      message: reminder.message,
      completed: reminder.completed,
    };

    await firestoreService.createDocument(collectionPath, reminderId, firestoreReminder);
    return reminderId;
  }

  /**
   * リマインダーを取得
   */
  async get(userId: string, reminderId: string): Promise<Reminder | null> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'reminders');
    const firestoreReminder = await firestoreService.getDocument<FirestoreReminder & { id: string }>(
      collectionPath,
      reminderId
    );

    if (!firestoreReminder) {
      return null;
    }

    return this.convertToReminder(firestoreReminder, userId);
  }

  /**
   * 全リマインダーを取得
   */
  async getAll(userId: string): Promise<Reminder[]> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'reminders');
    const firestoreReminders = await firestoreService.queryDocuments<FirestoreReminder & { id: string }>(
      collectionPath,
      [orderBy('reminderDate', 'asc')]
    );

    return firestoreReminders.map((fr) => this.convertToReminder(fr, userId));
  }

  /**
   * 贈答品のリマインダーを取得
   */
  async getByGiftId(userId: string, giftId: string): Promise<Reminder[]> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'reminders');
    const firestoreReminders = await firestoreService.queryDocuments<FirestoreReminder & { id: string }>(
      collectionPath,
      [
        where('giftId', '==', giftId),
        orderBy('reminderDate', 'asc')
      ]
    );

    return firestoreReminders.map((fr) => this.convertToReminder(fr, userId));
  }

  /**
   * 未完了のリマインダーを取得
   */
  async getIncomplete(userId: string): Promise<Reminder[]> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'reminders');
    const firestoreReminders = await firestoreService.queryDocuments<FirestoreReminder & { id: string }>(
      collectionPath,
      [
        where('completed', '==', false),
        orderBy('reminderDate', 'asc')
      ]
    );

    return firestoreReminders.map((fr) => this.convertToReminder(fr, userId));
  }

  /**
   * リマインダーを更新
   */
  async update(userId: string, reminderId: string, updates: Partial<Reminder>): Promise<void> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'reminders');

    const firestoreUpdates: Partial<FirestoreReminder> = {};

    if (updates.giftId !== undefined) firestoreUpdates.giftId = updates.giftId;
    if (updates.reminderDate !== undefined) {
      firestoreUpdates.reminderDate = Timestamp.fromDate(updates.reminderDate);
    }
    if (updates.message !== undefined) firestoreUpdates.message = updates.message;
    if (updates.completed !== undefined) firestoreUpdates.completed = updates.completed;

    await firestoreService.updateDocument(collectionPath, reminderId, firestoreUpdates);
  }

  /**
   * リマインダーを完了にする
   */
  async markComplete(userId: string, reminderId: string): Promise<void> {
    await this.update(userId, reminderId, { completed: true });
  }

  /**
   * リマインダーを削除
   */
  async delete(userId: string, reminderId: string): Promise<void> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'reminders');
    await firestoreService.deleteDocument(collectionPath, reminderId);
  }

  /**
   * 贈答品の全リマインダーを削除
   */
  async deleteByGiftId(userId: string, giftId: string): Promise<void> {
    const reminders = await this.getByGiftId(userId, giftId);
    
    for (const reminder of reminders) {
      await this.delete(userId, reminder.id);
    }
  }

  /**
   * FirestoreReminder → Reminder変換
   */
  private convertToReminder(firestoreReminder: FirestoreReminder & { id: string }, userId: string): Reminder {
    return {
      id: firestoreReminder.id,
      userId: userId,
      giftId: firestoreReminder.giftId,
      reminderDate: firestoreReminder.reminderDate.toDate(),
      message: firestoreReminder.message,
      completed: firestoreReminder.completed,
      createdAt: firestoreReminder.createdAt.toDate(),
    };
  }
}

export const firestoreReminderRepository = new FirestoreReminderRepository();
