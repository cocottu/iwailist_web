import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// localStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Firebaseのモック
vi.mock('@/lib/firebase', () => ({
  isFirebaseEnabled: vi.fn(() => true),
}))

// リポジトリのモック
const mockGiftRepoGetAll = vi.fn()
const mockPersonRepoGetAll = vi.fn()
const mockFirestoreGiftCreate = vi.fn()
const mockFirestorePersonCreate = vi.fn()

vi.mock('@/database/repositories/giftRepository', () => ({
  GiftRepository: vi.fn().mockImplementation(() => ({
    getAll: mockGiftRepoGetAll,
  })),
}))

vi.mock('@/database/repositories/personRepository', () => ({
  PersonRepository: vi.fn().mockImplementation(() => ({
    getAll: mockPersonRepoGetAll,
  })),
}))

vi.mock('@/repositories/firebase/giftRepository', () => ({
  firestoreGiftRepository: {
    create: mockFirestoreGiftCreate,
  },
}))

vi.mock('@/repositories/firebase/personRepository', () => ({
  firestorePersonRepository: {
    create: mockFirestorePersonCreate,
  },
}))

// isFirebaseEnabledをインポート
import { isFirebaseEnabled } from '@/lib/firebase'

describe('utils/dataMigration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    mockGiftRepoGetAll.mockResolvedValue([])
    mockPersonRepoGetAll.mockResolvedValue([])
    mockFirestoreGiftCreate.mockResolvedValue(undefined)
    mockFirestorePersonCreate.mockResolvedValue(undefined)
    ;(isFirebaseEnabled as any).mockReturnValue(true)
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('DataMigration', () => {
    it('isMigrationCompletedが正しく動作する', async () => {
      const { dataMigration } = await import('@/utils/dataMigration')

      expect(dataMigration.isMigrationCompleted()).toBe(false)

      localStorageMock.setItem('dataMigrationCompleted', 'true')

      expect(dataMigration.isMigrationCompleted()).toBe(true)
    })

    it('markMigrationCompletedが正しく動作する', async () => {
      const { dataMigration } = await import('@/utils/dataMigration')

      dataMigration.markMigrationCompleted()

      expect(localStorageMock.setItem).toHaveBeenCalledWith('dataMigrationCompleted', 'true')
    })

    it('resetMigrationが正しく動作する', async () => {
      const { dataMigration } = await import('@/utils/dataMigration')

      dataMigration.resetMigration()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('dataMigrationCompleted')
    })

    it('Firebaseが無効な場合はエラーを返す', async () => {
      ;(isFirebaseEnabled as any).mockReturnValue(false)

      // 新しくモジュールをインポート
      vi.resetModules()
      const { dataMigration } = await import('@/utils/dataMigration')

      const result = await dataMigration.migrateToFirestore('test-user')

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Firebase is not enabled')
    })

    it('既に移行が完了している場合は何もしない', async () => {
      localStorageMock.setItem('dataMigrationCompleted', 'true')

      const { dataMigration } = await import('@/utils/dataMigration')

      const result = await dataMigration.migrateToFirestore('test-user')

      expect(result.success).toBe(true)
      expect(result.giftsCount).toBe(0)
      expect(result.personsCount).toBe(0)
    })

    it('人物データを移行する', async () => {
      const mockPersons = [
        { id: 'person-1', name: '田中太郎', userId: 'test-user' },
        { id: 'person-2', name: '佐藤花子', userId: 'test-user' },
      ]
      mockPersonRepoGetAll.mockResolvedValue(mockPersons)

      const { dataMigration } = await import('@/utils/dataMigration')

      const result = await dataMigration.migrateToFirestore('test-user')

      expect(result.personsCount).toBe(2)
      expect(mockFirestorePersonCreate).toHaveBeenCalledTimes(2)
    })

    it('贈答品データを移行する', async () => {
      const mockGifts = [
        { id: 'gift-1', giftName: 'テストギフト', userId: 'test-user' },
      ]
      mockGiftRepoGetAll.mockResolvedValue(mockGifts)

      const { dataMigration } = await import('@/utils/dataMigration')

      const result = await dataMigration.migrateToFirestore('test-user')

      expect(result.giftsCount).toBe(1)
      expect(mockFirestoreGiftCreate).toHaveBeenCalledTimes(1)
    })

    it('人物移行エラー時にエラーを記録する', async () => {
      const mockPersons = [
        { id: 'person-1', name: '田中太郎', userId: 'test-user' },
      ]
      mockPersonRepoGetAll.mockResolvedValue(mockPersons)
      mockFirestorePersonCreate.mockRejectedValue(new Error('Firestore error'))

      const { dataMigration } = await import('@/utils/dataMigration')

      const result = await dataMigration.migrateToFirestore('test-user')

      expect(result.personsCount).toBe(0)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('贈答品移行エラー時にエラーを記録する', async () => {
      const mockGifts = [
        { id: 'gift-1', giftName: 'テストギフト', userId: 'test-user' },
      ]
      mockGiftRepoGetAll.mockResolvedValue(mockGifts)
      mockFirestoreGiftCreate.mockRejectedValue(new Error('Firestore error'))

      const { dataMigration } = await import('@/utils/dataMigration')

      const result = await dataMigration.migrateToFirestore('test-user')

      expect(result.giftsCount).toBe(0)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('移行完了後にマークされる', async () => {
      const { dataMigration } = await import('@/utils/dataMigration')

      await dataMigration.migrateToFirestore('test-user')

      expect(localStorageMock.setItem).toHaveBeenCalledWith('dataMigrationCompleted', 'true')
    })

    it('全体エラー時の結果を確認する', async () => {
      mockPersonRepoGetAll.mockRejectedValue(new Error('Database error'))
      mockGiftRepoGetAll.mockRejectedValue(new Error('Database error'))

      const { dataMigration } = await import('@/utils/dataMigration')

      const result = await dataMigration.migrateToFirestore('test-user')

      // エラーが記録されていることを確認
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})
