import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GiftRepository } from '@/database/repositories/giftRepository'
import { mockGifts } from '@/test/mocks/mockData'
import { Gift } from '@/types'

// データベースのモック
const mockDB = {
  add: vi.fn(),
  get: vi.fn(),
  getAllFromIndex: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/database/schema', () => ({
  getDB: vi.fn(() => Promise.resolve(mockDB))
}))

// リポジトリのモックを無効化して実際の実装を使用
vi.unmock('@/database/repositories/giftRepository')

describe('GiftRepository Integration Tests', () => {
  let giftRepository: GiftRepository

  beforeEach(() => {
    vi.clearAllMocks()
    giftRepository = new GiftRepository()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('贈答品が正しく作成される', async () => {
      const gift = mockGifts[0]
      mockDB.add.mockResolvedValue(undefined)

      await giftRepository.create(gift)

      expect(mockDB.add).toHaveBeenCalledWith('gifts', gift)
    })

    it('作成時にエラーが発生した場合、適切に処理される', async () => {
      const gift = mockGifts[0]
      const error = new Error('Database error')
      mockDB.add.mockRejectedValue(error)

      await expect(giftRepository.create(gift)).rejects.toThrow('Database error')
    })
  })

  describe('get', () => {
    it('IDで贈答品が正しく取得される', async () => {
      const gift = mockGifts[0]
      mockDB.get.mockResolvedValue(gift)

      const result = await giftRepository.get('1')

      expect(mockDB.get).toHaveBeenCalledWith('gifts', '1')
      expect(result).toEqual(gift)
    })

    it('存在しないIDの場合、undefinedが返される', async () => {
      mockDB.get.mockResolvedValue(undefined)

      const result = await giftRepository.get('nonexistent')

      expect(result).toBeUndefined()
    })
  })

  describe('getAll', () => {
    it('ユーザーIDで全ての贈答品が取得される', async () => {
      const userId = 'demo-user'
      mockDB.getAllFromIndex.mockResolvedValue(mockGifts)

      const result = await giftRepository.getAll(userId)

      expect(mockDB.getAllFromIndex).toHaveBeenCalledWith('gifts', 'userId', userId)
      expect(result).toEqual(mockGifts)
    })

    it('贈答品がない場合、空配列が返される', async () => {
      const userId = 'demo-user'
      mockDB.getAllFromIndex.mockResolvedValue([])

      const result = await giftRepository.getAll(userId)

      expect(result).toEqual([])
    })
  })

  describe('update', () => {
    it('贈答品が正しく更新される', async () => {
      const gift = { ...mockGifts[0], giftName: 'Updated Gift' }
      mockDB.put.mockResolvedValue(undefined)

      await giftRepository.update(gift)

      expect(mockDB.put).toHaveBeenCalledWith('gifts', gift)
    })
  })

  describe('delete', () => {
    it('贈答品が正しく削除される', async () => {
      const giftId = '1'
      mockDB.delete.mockResolvedValue(undefined)

      await giftRepository.delete(giftId)

      expect(mockDB.delete).toHaveBeenCalledWith('gifts', giftId)
    })
  })

  describe('query', () => {
    beforeEach(() => {
      mockDB.getAllFromIndex.mockResolvedValue(mockGifts)
    })

    it('フィルターなしで全ての贈答品が返される', async () => {
      const userId = 'demo-user'
      const result = await giftRepository.query(userId)

      expect(result).toEqual(mockGifts)
    })

    it('お返し状況でフィルタリングされる', async () => {
      const userId = 'demo-user'
      const filters = { returnStatus: 'pending' as any }
      
      const result = await giftRepository.query(userId, filters)

      expect(result).toHaveLength(1)
      expect(result[0].returnStatus).toBe('pending')
    })

    it('カテゴリでフィルタリングされる', async () => {
      const userId = 'demo-user'
      const filters = { category: 'お祝い' as any }
      
      const result = await giftRepository.query(userId, filters)

      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('お祝い')
    })

    it('人物IDでフィルタリングされる', async () => {
      const userId = 'demo-user'
      const filters = { personId: '1' }
      
      const result = await giftRepository.query(userId, filters)

      expect(result).toHaveLength(1)
      expect(result[0].personId).toBe('1')
    })

    it('検索テキストでフィルタリングされる', async () => {
      const userId = 'demo-user'
      const filters = { searchText: 'テスト' }
      
      const result = await giftRepository.query(userId, filters)

      expect(result).toHaveLength(1)
      expect(result[0].giftName).toContain('テスト')
    })

    it('複数のフィルターが同時に適用される', async () => {
      const userId = 'demo-user'
      const filters = { 
        returnStatus: 'pending' as any,
        category: 'お祝い' as any,
        searchText: 'テスト'
      }
      
      const result = await giftRepository.query(userId, filters)

      expect(result).toHaveLength(1)
      expect(result[0].returnStatus).toBe('pending')
      expect(result[0].category).toBe('お祝い')
      expect(result[0].giftName).toContain('テスト')
    })

    it('日付範囲でフィルタリングされる', async () => {
      const userId = 'demo-user'
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')
      const filters = { dateRange: { start: startDate, end: endDate } }
      
      const result = await giftRepository.query(userId, filters)

      expect(result).toHaveLength(3) // すべての贈答品が2024年1月の範囲内
      expect(result[0].receivedDate).toBeInstanceOf(Date)
    })
  })

  describe('getByPersonId', () => {
    it('人物IDで贈答品が取得される', async () => {
      const userId = 'demo-user'
      const personId = '1'
      const personGifts = [mockGifts[0]]
      mockDB.getAllFromIndex.mockResolvedValue(personGifts)

      const result = await giftRepository.getByPersonId(userId, personId)

      expect(mockDB.getAllFromIndex).toHaveBeenCalledWith('gifts', 'personId', personId)
      expect(result).toEqual(personGifts)
    })
  })

  describe('getPendingReturns', () => {
    it('未対応のお返しが取得される', async () => {
      const userId = 'demo-user'
      const pendingGifts = [mockGifts[0]]
      mockDB.getAllFromIndex.mockResolvedValue(pendingGifts)

      const result = await giftRepository.getPendingReturns(userId)

      expect(mockDB.getAllFromIndex).toHaveBeenCalledWith('gifts', 'returnStatus', 'pending')
      expect(result).toEqual(pendingGifts)
    })
  })

  describe('getStatistics', () => {
    it('統計データが正しく計算される', async () => {
      const userId = 'demo-user'
      const gifts = [
        { ...mockGifts[0], returnStatus: 'pending' as any, amount: 5000 },
        { ...mockGifts[1], returnStatus: 'completed' as any, amount: 3000 },
        { ...mockGifts[2], returnStatus: 'pending' as any, amount: 8000 },
      ]
      mockDB.getAllFromIndex.mockResolvedValue(gifts)

      const result = await giftRepository.getStatistics(userId)

      expect(result.total).toBe(3)
      expect(result.pending).toBe(2)
      expect(result.completed).toBe(1)
      expect(result.totalAmount).toBe(16000)
      expect(result.monthlyAmount).toBe(16000)
    })

    it('贈答品がない場合の統計データ', async () => {
      const userId = 'demo-user'
      mockDB.getAllFromIndex.mockResolvedValue([])

      const result = await giftRepository.getStatistics(userId)

      expect(result).toEqual({
        total: 0,
        pending: 0,
        completed: 0,
        totalAmount: 0,
        monthlyAmount: 0,
      })
    })

    it('金額が設定されていない贈答品も正しく処理される', async () => {
      const userId = 'demo-user'
      const gifts = [
        { ...mockGifts[0], amount: undefined },
        { ...mockGifts[1], amount: 3000 },
      ]
      mockDB.getAllFromIndex.mockResolvedValue(gifts)

      const result = await giftRepository.getStatistics(userId)

      expect(result.totalAmount).toBe(3000)
      expect(result.monthlyAmount).toBe(3000)
    })
  })
})
