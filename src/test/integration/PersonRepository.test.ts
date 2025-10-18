import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PersonRepository } from '@/database/repositories/personRepository'
import { mockPersons } from '@/test/mocks/mockData'
import { Person } from '@/types'

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
vi.unmock('@/database/repositories/personRepository')

describe('PersonRepository Integration Tests', () => {
  let personRepository: PersonRepository

  beforeEach(() => {
    vi.clearAllMocks()
    personRepository = new PersonRepository()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('人物が正しく作成される', async () => {
      const person = mockPersons[0]
      mockDB.add.mockResolvedValue(undefined)

      await personRepository.create(person)

      expect(mockDB.add).toHaveBeenCalledWith('persons', person)
    })

    it('作成時にエラーが発生した場合、適切に処理される', async () => {
      const person = mockPersons[0]
      const error = new Error('Database error')
      mockDB.add.mockRejectedValue(error)

      await expect(personRepository.create(person)).rejects.toThrow('Database error')
    })
  })

  describe('get', () => {
    it('IDで人物が正しく取得される', async () => {
      const person = mockPersons[0]
      mockDB.get.mockResolvedValue(person)

      const result = await personRepository.get('1')

      expect(mockDB.get).toHaveBeenCalledWith('persons', '1')
      expect(result).toEqual(person)
    })

    it('存在しないIDの場合、undefinedが返される', async () => {
      mockDB.get.mockResolvedValue(undefined)

      const result = await personRepository.get('nonexistent')

      expect(result).toBeUndefined()
    })
  })

  describe('getAll', () => {
    it('ユーザーIDで全ての人物が取得される', async () => {
      const userId = 'demo-user'
      mockDB.getAllFromIndex.mockResolvedValue(mockPersons)

      const result = await personRepository.getAll(userId)

      expect(mockDB.getAllFromIndex).toHaveBeenCalledWith('persons', 'userId', userId)
      expect(result).toEqual(mockPersons)
    })

    it('人物がない場合、空配列が返される', async () => {
      const userId = 'demo-user'
      mockDB.getAllFromIndex.mockResolvedValue([])

      const result = await personRepository.getAll(userId)

      expect(result).toEqual([])
    })
  })

  describe('update', () => {
    it('人物が正しく更新される', async () => {
      const person = { ...mockPersons[0], name: 'Updated Name' }
      mockDB.put.mockResolvedValue(undefined)

      await personRepository.update(person)

      expect(mockDB.put).toHaveBeenCalledWith('persons', person)
    })
  })

  describe('delete', () => {
    it('人物が正しく削除される', async () => {
      const personId = '1'
      mockDB.delete.mockResolvedValue(undefined)

      await personRepository.delete(personId)

      expect(mockDB.delete).toHaveBeenCalledWith('persons', personId)
    })
  })

  describe('search', () => {
    beforeEach(() => {
      mockDB.getAllFromIndex.mockResolvedValue(mockPersons)
    })

    it('名前で検索される', async () => {
      const userId = 'demo-user'
      const searchText = '田中'
      
      const result = await personRepository.search(userId, searchText)

      expect(result).toHaveLength(1)
      expect(result[0].name).toContain('田中')
    })

    it('ふりがなで検索される', async () => {
      const userId = 'demo-user'
      const personsWithFurigana = [
        { ...mockPersons[0], furigana: 'たなかたろう' },
        { ...mockPersons[1], furigana: 'さとうはなこ' },
      ]
      mockDB.getAllFromIndex.mockResolvedValue(personsWithFurigana)
      
      const result = await personRepository.search(userId, 'たなか')

      expect(result).toHaveLength(1)
      expect(result[0].furigana).toContain('たなか')
    })

    it('メモで検索される', async () => {
      const userId = 'demo-user'
      const personsWithMemo = [
        { ...mockPersons[0], memo: 'テスト用の人物データ' },
        { ...mockPersons[1], memo: '職場の同僚' },
      ]
      mockDB.getAllFromIndex.mockResolvedValue(personsWithMemo)
      
      const result = await personRepository.search(userId, 'テスト')

      expect(result).toHaveLength(1)
      expect(result[0].memo).toContain('テスト')
    })

    it('大文字小文字を区別しない検索', async () => {
      const userId = 'demo-user'
      const searchText = 'TANAKA'
      
      // モックデータを設定
      mockDB.getAllFromIndex.mockResolvedValue(mockPersons)
      
      const result = await personRepository.search(userId, searchText)

      expect(result).toHaveLength(1)
      expect(result[0].name).toContain('田中')
    })

    it('部分一致で検索される', async () => {
      const userId = 'demo-user'
      const searchText = '太郎'
      
      const result = await personRepository.search(userId, searchText)

      expect(result).toHaveLength(1)
      expect(result[0].name).toContain('太郎')
    })

    it('複数の条件で検索される', async () => {
      const userId = 'demo-user'
      const personsWithMultipleFields = [
        { ...mockPersons[0], name: '田中太郎', furigana: 'たなかたろう', memo: '友人' },
        { ...mockPersons[1], name: '佐藤花子', furigana: 'さとうはなこ', memo: '同僚' },
      ]
      mockDB.getAllFromIndex.mockResolvedValue(personsWithMultipleFields)
      
      const result = await personRepository.search(userId, 'たなか')

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('田中太郎')
    })

    it('検索結果がない場合、空配列が返される', async () => {
      const userId = 'demo-user'
      const searchText = '存在しない名前'
      
      const result = await personRepository.search(userId, searchText)

      expect(result).toEqual([])
    })
  })

  describe('getByName', () => {
    beforeEach(() => {
      mockDB.getAllFromIndex.mockResolvedValue(mockPersons)
    })

    it('正確な名前で人物が取得される', async () => {
      const userId = 'demo-user'
      const name = '田中太郎'
      
      const result = await personRepository.getByName(userId, name)

      expect(result).toEqual(mockPersons[0])
    })

    it('存在しない名前の場合、undefinedが返される', async () => {
      const userId = 'demo-user'
      const name = '存在しない名前'
      
      const result = await personRepository.getByName(userId, name)

      expect(result).toBeUndefined()
    })

    it('複数の人物がいる場合、最初に一致した人物が返される', async () => {
      const userId = 'demo-user'
      const personsWithSameName = [
        { ...mockPersons[0], name: '田中太郎' },
        { ...mockPersons[1], name: '田中太郎' },
      ]
      mockDB.getAllFromIndex.mockResolvedValue(personsWithSameName)
      
      const result = await personRepository.getByName(userId, '田中太郎')

      expect(result).toEqual(personsWithSameName[0])
    })
  })
})
