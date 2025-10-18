import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils/testUtils'
import { Statistics } from '@/pages/Statistics'
import { GiftRepository, PersonRepository } from '@/database'

// リポジトリのモック
vi.mock('@/database', () => ({
  GiftRepository: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(),
  })),
  PersonRepository: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(),
  })),
}))

describe('Statistics', () => {
  let mockGiftRepo: any
  let mockPersonRepo: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockGiftRepo = {
      getAll: vi.fn(),
    }
    
    mockPersonRepo = {
      getAll: vi.fn(),
    }
    
    ;(GiftRepository as any).mockImplementation(() => mockGiftRepo)
    ;(PersonRepository as any).mockImplementation(() => mockPersonRepo)
  })

  it('ローディング状態が正しく表示される', () => {
    mockGiftRepo.getAll.mockImplementation(() => new Promise(() => {}))
    mockPersonRepo.getAll.mockImplementation(() => new Promise(() => {}))

    render(<Statistics />)
    
    expect(screen.getByText('データを読み込み中...')).toBeInTheDocument()
  })

  it('データがない場合のEmptyStateが表示される', async () => {
    mockGiftRepo.getAll.mockResolvedValue([])
    mockPersonRepo.getAll.mockResolvedValue([])

    render(<Statistics />)

    await waitFor(() => {
      expect(screen.getByText('統計・分析')).toBeInTheDocument()
    })

    expect(screen.getByText('2025年のデータがありません')).toBeInTheDocument()
  })

  it('統計データが正しく表示される', async () => {
    const mockGifts = [
      {
        id: '1',
        userId: 'demo-user',
        personId: '1',
        giftName: 'テストギフト1',
        category: 'birthday' as any,
        amount: 5000,
        receivedDate: new Date('2025-01-01'),
        returnStatus: 'pending' as any,
        memo: 'テスト用',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        userId: 'demo-user',
        personId: '2',
        giftName: 'テストギフト2',
        category: 'wedding' as any,
        amount: 10000,
        receivedDate: new Date('2025-02-01'),
        returnStatus: 'completed' as any,
        memo: 'テスト用',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const mockPersons = [
      {
        id: '1',
        userId: 'demo-user',
        name: '田中太郎',
        furigana: 'たなかたろう',
        relationship: 'friend' as any,
        contact: '090-1234-5678',
        memo: 'テスト用',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        userId: 'demo-user',
        name: '佐藤花子',
        furigana: 'さとうはなこ',
        relationship: 'family' as any,
        contact: '090-9876-5432',
        memo: 'テスト用',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    mockGiftRepo.getAll.mockResolvedValue(mockGifts)
    mockPersonRepo.getAll.mockResolvedValue(mockPersons)

    render(<Statistics />)

    await waitFor(() => {
      expect(screen.getByText('統計・分析')).toBeInTheDocument()
    })

    // 統計カードの確認
    expect(screen.getByText('2件')).toBeInTheDocument()
    expect(screen.getByText('15,000円')).toBeInTheDocument()
  })

  it('エラー時のEmptyStateが表示される', async () => {
    mockGiftRepo.getAll.mockRejectedValue(new Error('Database error'))
    mockPersonRepo.getAll.mockRejectedValue(new Error('Database error'))

    render(<Statistics />)

    await waitFor(() => {
      expect(screen.getByText('統計・分析')).toBeInTheDocument()
    })

    // エラー時は空のデータとして扱われる
    expect(screen.getByText('2025年のデータがありません')).toBeInTheDocument()
  })

  it('年選択が正しく表示される', async () => {
    const mockGifts = [
      {
        id: '1',
        userId: 'demo-user',
        personId: '1',
        giftName: 'テストギフト1',
        category: 'birthday' as any,
        amount: 5000,
        receivedDate: new Date('2025-01-01'),
        returnStatus: 'pending' as any,
        memo: 'テスト用',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    mockGiftRepo.getAll.mockResolvedValue(mockGifts)
    mockPersonRepo.getAll.mockResolvedValue([])

    render(<Statistics />)

    await waitFor(() => {
      expect(screen.getByText('統計・分析')).toBeInTheDocument()
    })

    expect(screen.getByText('対象年:')).toBeInTheDocument()
    expect(screen.getByText('2025年')).toBeInTheDocument()
  })

  it('ページタイトルが正しく表示される', async () => {
    mockGiftRepo.getAll.mockResolvedValue([])
    mockPersonRepo.getAll.mockResolvedValue([])

    render(<Statistics />)

    await waitFor(() => {
      expect(screen.getByText('統計・分析')).toBeInTheDocument()
    })

    expect(screen.getByText('贈答品の受取状況を分析できます')).toBeInTheDocument()
  })
})