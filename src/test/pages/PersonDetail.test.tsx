import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@/test/utils/testUtils'
import { PersonDetail } from '@/pages/PersonDetail'
import { mockPerson, mockGifts } from '@/test/mocks/mockData'
import { PersonRepository, GiftRepository } from '@/database'

// react-router-domのモック
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => mockNavigate,
  }
})

// AuthContextのモック
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id', email: 'test@example.com' },
    loading: false,
    isAuthenticated: true,
  }),
}))

// リポジトリのモック
vi.mock('@/database', () => ({
  PersonRepository: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    delete: vi.fn(),
  })),
  GiftRepository: vi.fn().mockImplementation(() => ({
    getByPersonId: vi.fn(),
    delete: vi.fn(),
  })),
}))

describe('PersonDetail', () => {
  let mockPersonRepo: any
  let mockGiftRepo: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()

    mockPersonRepo = {
      get: vi.fn(),
      delete: vi.fn(),
    }
    mockGiftRepo = {
      getByPersonId: vi.fn(),
      delete: vi.fn(),
    }

    ;(PersonRepository as any).mockImplementation(() => mockPersonRepo)
    ;(GiftRepository as any).mockImplementation(() => mockGiftRepo)
  })

  it('ローディング状態が正しく表示される', () => {
    mockPersonRepo.get.mockImplementation(() => new Promise(() => {}))
    
    render(<PersonDetail />)
    
    expect(screen.getByText('データを読み込み中...')).toBeInTheDocument()
  })

  it('人物の詳細が正しく表示される', async () => {
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockGiftRepo.getByPersonId.mockResolvedValue([])

    render(<PersonDetail />)

    await waitFor(() => {
      expect(screen.getAllByText('田中太郎').length).toBeGreaterThan(0)
    })

    expect(screen.getByText('基本情報')).toBeInTheDocument()
    expect(screen.getByText('たなかたろう')).toBeInTheDocument()
    expect(screen.getByText('友人')).toBeInTheDocument()
  })

  it('人物が見つからない場合はEmptyStateを表示', async () => {
    mockPersonRepo.get.mockResolvedValue(null)

    render(<PersonDetail />)

    await waitFor(() => {
      expect(screen.getByText('人物が見つかりません')).toBeInTheDocument()
    })

    expect(screen.getByText('一覧に戻る')).toBeInTheDocument()
  })

  it('連絡先が正しく表示される', async () => {
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockGiftRepo.getByPersonId.mockResolvedValue([])

    render(<PersonDetail />)

    await waitFor(() => {
      expect(screen.getByText('090-1234-5678')).toBeInTheDocument()
    })
  })

  it('メモが正しく表示される', async () => {
    mockPersonRepo.get.mockResolvedValue({ ...mockPerson, memo: 'テスト用のメモ' })
    mockGiftRepo.getByPersonId.mockResolvedValue([])

    render(<PersonDetail />)

    await waitFor(() => {
      expect(screen.getByText('メモ')).toBeInTheDocument()
      expect(screen.getByText('テスト用のメモ')).toBeInTheDocument()
    })
  })

  it('統計情報が正しく表示される', async () => {
    const giftWithAmount = [
      { ...mockGifts[0], amount: 5000, returnStatus: 'pending' },
      { ...mockGifts[1], amount: 3000, returnStatus: 'completed' },
    ]
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockGiftRepo.getByPersonId.mockResolvedValue(giftWithAmount)

    render(<PersonDetail />)

    await waitFor(() => {
      expect(screen.getByText('統計情報')).toBeInTheDocument()
    })

    expect(screen.getByText('2件')).toBeInTheDocument()
    expect(screen.getByText('8,000円')).toBeInTheDocument()
  })

  it('贈答品履歴が正しく表示される', async () => {
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockGiftRepo.getByPersonId.mockResolvedValue([mockGifts[0]])

    render(<PersonDetail />)

    await waitFor(() => {
      expect(screen.getByText('贈答品履歴')).toBeInTheDocument()
    })

    expect(screen.getByText('テストギフト')).toBeInTheDocument()
  })

  it('贈答品がない場合はEmptyStateを表示', async () => {
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockGiftRepo.getByPersonId.mockResolvedValue([])

    render(<PersonDetail />)

    await waitFor(() => {
      expect(screen.getByText('まだ贈答品が登録されていません')).toBeInTheDocument()
    })
  })

  it('編集リンクが正しく設定される', async () => {
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockGiftRepo.getByPersonId.mockResolvedValue([])

    render(<PersonDetail />)

    await waitFor(() => {
      const editLinks = screen.getAllByText('編集')
      expect(editLinks.length).toBeGreaterThan(0)
    })
  })

  it('削除ボタンが正しく動作する - キャンセル', async () => {
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockGiftRepo.getByPersonId.mockResolvedValue([])

    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<PersonDetail />)

    await waitFor(() => {
      expect(screen.getByText('削除')).toBeInTheDocument()
    })

    const deleteButton = screen.getByText('削除')
    fireEvent.click(deleteButton)

    expect(mockPersonRepo.delete).not.toHaveBeenCalled()
  })

  it('削除ボタンが正しく動作する - 確認', async () => {
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockGiftRepo.getByPersonId.mockResolvedValue([mockGifts[0]])
    mockPersonRepo.delete.mockResolvedValue(undefined)
    mockGiftRepo.delete.mockResolvedValue(undefined)

    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<PersonDetail />)

    await waitFor(() => {
      expect(screen.getByText('削除')).toBeInTheDocument()
    })

    const deleteButton = screen.getByText('削除')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockGiftRepo.delete).toHaveBeenCalled()
      expect(mockPersonRepo.delete).toHaveBeenCalledWith('1', 'demo-user')
      expect(mockNavigate).toHaveBeenCalledWith('/persons')
    })
  })

  it('お返し状況バッジが正しく表示される', async () => {
    const giftWithPending = { ...mockGifts[0], returnStatus: 'pending' }
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockGiftRepo.getByPersonId.mockResolvedValue([giftWithPending])

    render(<PersonDetail />)

    await waitFor(() => {
      expect(screen.getByText('未対応')).toBeInTheDocument()
    })
  })

  it('詳細を見るボタンが正しく表示される', async () => {
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockGiftRepo.getByPersonId.mockResolvedValue([mockGifts[0]])

    render(<PersonDetail />)

    await waitFor(() => {
      expect(screen.getByText('詳細を見る')).toBeInTheDocument()
    })
  })

  it('贈答品を登録リンクが正しく表示される', async () => {
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockGiftRepo.getByPersonId.mockResolvedValue([])

    render(<PersonDetail />)

    await waitFor(() => {
      const registerLinks = screen.getAllByRole('link', { name: /贈答品を登録/ })
      expect(registerLinks.length).toBeGreaterThan(0)
    })
  })

  it('フリガナがない場合は表示されない', async () => {
    const personWithoutFurigana = { ...mockPerson, furigana: undefined }
    mockPersonRepo.get.mockResolvedValue(personWithoutFurigana)
    mockGiftRepo.getByPersonId.mockResolvedValue([])

    render(<PersonDetail />)

    await waitFor(() => {
      expect(screen.getAllByText('田中太郎').length).toBeGreaterThan(0)
    })

    expect(screen.queryByText('たなかたろう')).not.toBeInTheDocument()
  })

  it('連絡先がない場合は表示されない', async () => {
    const personWithoutContact = { ...mockPerson, contact: undefined }
    mockPersonRepo.get.mockResolvedValue(personWithoutContact)
    mockGiftRepo.getByPersonId.mockResolvedValue([])

    render(<PersonDetail />)

    await waitFor(() => {
      expect(screen.getAllByText('田中太郎').length).toBeGreaterThan(0)
    })

    expect(screen.queryByText('090-1234-5678')).not.toBeInTheDocument()
  })

  it('メタ情報が正しく表示される', async () => {
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockGiftRepo.getByPersonId.mockResolvedValue([])

    render(<PersonDetail />)

    await waitFor(() => {
      expect(screen.getByText('メタ情報')).toBeInTheDocument()
    })
  })
})
