import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ImageRepository } from '@/database/repositories/imageRepository'
import { mockImages } from '@/test/mocks/mockData'
import { Image } from '@/types'

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

vi.unmock('@/database/repositories/imageRepository')

describe('ImageRepository Integration Tests', () => {
  let imageRepository: ImageRepository

  beforeEach(() => {
    vi.clearAllMocks()
    imageRepository = new ImageRepository()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('画像が正しく作成される', async () => {
      const newImage: Image = { ...mockImages[0], id: 'new-image-id' }
      mockDB.add.mockResolvedValue(undefined)

      await imageRepository.create(newImage)

      expect(mockDB.add).toHaveBeenCalledWith('images', newImage)
    })

    it('作成時にエラーが発生した場合、適切に処理される', async () => {
      const newImage: Image = { ...mockImages[0], id: 'new-image-id' }
      const error = new Error('Database error')
      mockDB.add.mockRejectedValue(error)

      await expect(imageRepository.create(newImage)).rejects.toThrow('Database error')
    })
  })

  describe('get', () => {
    it('IDで画像が正しく取得される', async () => {
      const image = mockImages[0]
      mockDB.get.mockResolvedValue(image)

      const result = await imageRepository.get('1')

      expect(mockDB.get).toHaveBeenCalledWith('images', '1')
      expect(result).toEqual(image)
    })

    it('存在しないIDの場合、undefinedが返される', async () => {
      mockDB.get.mockResolvedValue(undefined)

      const result = await imageRepository.get('nonexistent')

      expect(result).toBeUndefined()
    })
  })

  describe('getByEntityId', () => {
    it('エンティティIDで画像が正しく取得される', async () => {
      const entityId = '1'
      const entityImages = [mockImages[0]]
      mockDB.getAllFromIndex.mockResolvedValue(entityImages)

      const result = await imageRepository.getByEntityId(entityId)

      expect(mockDB.getAllFromIndex).toHaveBeenCalledWith('images', 'entityId', entityId)
      expect(result).toEqual(entityImages)
    })

    it('エンティティIDに対応する画像がない場合、空配列が返される', async () => {
      const entityId = 'nonexistent-entity'
      mockDB.getAllFromIndex.mockResolvedValue([])

      const result = await imageRepository.getByEntityId(entityId)

      expect(result).toEqual([])
    })
  })

  describe('update', () => {
    it('画像が正しく更新される', async () => {
      const updatedImage = { ...mockImages[0], imageUrl: 'updated-url' }
      mockDB.put.mockResolvedValue(undefined)

      await imageRepository.update(updatedImage)

      expect(mockDB.put).toHaveBeenCalledWith('images', updatedImage)
    })
  })

  describe('delete', () => {
    it('画像が正しく削除される', async () => {
      const imageId = '1'
      mockDB.delete.mockResolvedValue(undefined)

      await imageRepository.delete(imageId)

      expect(mockDB.delete).toHaveBeenCalledWith('images', imageId)
    })
  })

  describe('getByEntityType', () => {
    it('エンティティタイプで画像が正しく取得される', async () => {
      const entityType = 'gift'
      const giftImages = [mockImages[0]]
      mockDB.getAllFromIndex.mockResolvedValue(giftImages)

      const result = await imageRepository.getByEntityType(entityType)

      expect(mockDB.getAllFromIndex).toHaveBeenCalledWith('images', 'entityType', entityType)
      expect(result).toEqual(giftImages)
    })
  })

  describe('エラーハンドリング', () => {
    it('データベース接続エラーが適切に処理される', async () => {
      const error = new Error('Connection failed')
      mockDB.getAllFromIndex.mockRejectedValue(error)

      await expect(imageRepository.getByEntityId('1')).rejects.toThrow('Connection failed')
    })

    it('更新時のエラーが適切に処理される', async () => {
      const image = mockImages[0]
      const error = new Error('Update failed')
      mockDB.put.mockRejectedValue(error)

      await expect(imageRepository.update(image)).rejects.toThrow('Update failed')
    })

    it('削除時のエラーが適切に処理される', async () => {
      const imageId = '1'
      const error = new Error('Delete failed')
      mockDB.delete.mockRejectedValue(error)

      await expect(imageRepository.delete(imageId)).rejects.toThrow('Delete failed')
    })
  })
})