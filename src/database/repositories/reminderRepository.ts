import { getDB } from '../schema';
import { Reminder } from '@/types';

export class ReminderRepository {
  async create(reminder: Reminder): Promise<void> {
    const db = await getDB();
    await db.add('reminders', reminder);
  }
  
  async get(id: string): Promise<Reminder | undefined> {
    const db = await getDB();
    return await db.get('reminders', id);
  }
  
  async getAll(userId: string): Promise<Reminder[]> {
    const db = await getDB();
    const reminders = await db.getAllFromIndex('reminders', 'userId', userId);
    // リマインダー日の順にソート
    return reminders.sort((a, b) => a.reminderDate.getTime() - b.reminderDate.getTime());
  }
  
  async getByGiftId(giftId: string): Promise<Reminder[]> {
    const db = await getDB();
    return await db.getAllFromIndex('reminders', 'giftId', giftId);
  }
  
  async getUpcoming(userId: string, days: number = 7): Promise<Reminder[]> {
    const allReminders = await this.getAll(userId);
    
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return allReminders.filter(r => 
      !r.completed && 
      r.reminderDate >= now && 
      r.reminderDate <= futureDate
    );
  }
  
  async getOverdue(userId: string): Promise<Reminder[]> {
    const allReminders = await this.getAll(userId);
    
    const now = new Date();
    return allReminders.filter(r => 
      !r.completed && 
      r.reminderDate < now
    );
  }
  
  async update(reminder: Reminder): Promise<void> {
    const db = await getDB();
    await db.put('reminders', reminder);
  }
  
  async markComplete(id: string): Promise<void> {
    const reminder = await this.get(id);
    if (reminder) {
      reminder.completed = true;
      await this.update(reminder);
    }
  }
  
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('reminders', id);
  }
  
  async deleteByGiftId(giftId: string): Promise<void> {
    const db = await getDB();
    const reminders = await this.getByGiftId(giftId);
    const tx = db.transaction('reminders', 'readwrite');
    const store = tx.objectStore('reminders');
    
    for (const reminder of reminders) {
      await store.delete(reminder.id);
    }
    
    await tx.done;
  }
}
