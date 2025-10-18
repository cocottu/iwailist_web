import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ReturnRepository } from '@/database/repositories/returnRepository'
import { mockReturns } from '@/test/mocks/mockData'
import { Return } from '@/types'

// データベースのモック
const mockDB = {
  add: vi.fn(),
  get: vi.fn(),
  getAllFromIndex: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  transaction: vi.fn(),
}

vi.mock('@/database/schema', () => ({
  getDB: vi.fn(() => Promise.resolve(mockDB))
}))

vi.unmock('@/database/repositories/returnRepository')

describe('ReturnRepository Integration Tests', () => {
  let returnRepository: ReturnRepository

  beforeEach(() => {
    vi.clearAllMocks()
    returnRepository = new ReturnRepository()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('お返しが正しく作成される', async () => {
      const newReturn: Return = { ...mockReturns[0], id: 'new-return-id' }
      mockDB.add.mockResolvedValue(undefined)

      await returnRepository.create(newReturn)

      expect(mockDB.add).toHaveBeenCalledWith('returns', newReturn)
    })

    it('作成時にエラーが発生した場合、適切に処理される', async () => {
      const newReturn: Return = { ...mockReturns[0], id: 'new-return-id' }
      const error = new Error('Database error')
      mockDB.add.mockRejectedValue(error)

      await expect(returnRepository.create(newReturn)).rejects.toThrow('Database error')
    })
  })

  describe('get', () => {
    it('IDでお返しが正しく取得される', async () => {
      const returnData = mockReturns[0]
      mockDB.get.mockResolvedValue(returnData)

      const result = await returnRepository.get('1')

      expect(mockDB.get).toHaveBeenCalledWith('returns', '1')
      expect(result).toEqual(returnData)
    })

    it('存在しないIDの場合、undefinedが返される', async () => {
      mockDB.get.mockResolvedValue(undefined)

      const result = await returnRepository.get('nonexistent')

      expect(result).toBeUndefined()
    })
  })

  describe('update', () => {
    it('お返しが正しく更新される', async () => {
      const updatedReturn = { ...mockReturns[0], returnName: 'Updated Return' }
      mockDB.put.mockResolvedValue(undefined)

      await returnRepository.update(updatedReturn)

      expect(mockDB.put).toHaveBeenCalledWith('returns', updatedReturn)
    })
  })

  describe('delete', () => {
    it('お返しが正しく削除される', async () => {
      const returnId = '1'
      mockDB.delete.mockResolvedValue(undefined)

      await returnRepository.delete(returnId)

      expect(mockDB.delete).toHaveBeenCalledWith('returns', returnId)
    })
  })

  describe('getByGiftId', () => {
    it('贈答品IDでお返しが正しく取得される', async () => {
      const giftId = '1'
      const giftReturns = [mockReturns[0]]
      mockDB.getAllFromIndex.mockResolvedValue(giftReturns)

      const result = await returnRepository.getByGiftId(giftId)

      expect(mockDB.getAllFromIndex).toHaveBeenCalledWith('returns', 'giftId', giftId)
      expect(result).toEqual(giftReturns)
    })

    it('贈答品IDに対応するお返しがない場合、空配列が返される', async () => {
      const giftId = 'nonexistent-gift'
      mockDB.getAllFromIndex.mockResolvedValue([])

      const result = await returnRepository.getByGiftId(giftId)

      expect(result).toEqual([])
    })
  })

  describe('deleteByGiftId', () => {
    it('贈答品IDに関連するすべてのお返しが削除される', async () => {
      const giftId = 'gift-1'
      const giftReturns = [mockReturns[0], { ...mockReturns[0], id: 'return-2' }]
      
      // トランザクションのモックを設定
      const mockStore = {
        delete: vi.fn().mockResolvedValue(undefined)
      }
      const mockTx = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve()
      }
      
      mockDB.getAllFromIndex.mockResolvedValue(giftReturns)
      mockDB.transaction.mockReturnValue(mockTx)

      await returnRepository.deleteByGiftId(giftId)

      expect(mockDB.getAllFromIndex).toHaveBeenCalledWith('returns', 'giftId', giftId)
      expect(mockDB.transaction).toHaveBeenCalledWith('returns', 'readwrite')
      expect(mockStore.delete).toHaveBeenCalledTimes(giftReturns.length)
    })

    it('贈答品IDに関連するお返しがない場合でもエラーにならない', async () => {
      const giftId = 'nonexistent-gift'
      
      const mockStore = {
        delete: vi.fn()
      }
      const mockTx = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve()
      }
      
      mockDB.getAllFromIndex.mockResolvedValue([])
      mockDB.transaction.mockReturnValue(mockTx)

      await expect(returnRepository.deleteByGiftId(giftId)).resolves.not.toThrow()
      expect(mockStore.delete).not.toHaveBeenCalled()
    })
  })

  describe('エラーハンドリング', () => {
    it('データベース接続エラーが適切に処理される', async () => {
      const error = new Error('Connection failed')
      mockDB.getAllFromIndex.mockRejectedValue(error)

      await expect(returnRepository.getByGiftId('1')).rejects.toThrow('Connection failed')
    })

    it('更新時のエラーが適切に処理される', async () => {
      const returnData = mockReturns[0]
      const error = new Error('Update failed')
      mockDB.put.mockRejectedValue(error)

      await expect(returnRepository.update(returnData)).rejects.toThrow('Update failed')
    })

    it('削除時のエラーが適切に処理される', async () => {
      const returnId = '1'
      const error = new Error('Delete failed')
      mockDB.delete.mockRejectedValue(error)

      await expect(returnRepository.delete(returnId)).rejects.toThrow('Delete failed')
    })
  })
})