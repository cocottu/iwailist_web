import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@/test/utils/testUtils'
import { ReturnHistory } from '@/components/returns/ReturnHistory'
import { ReturnRepository, ImageRepository } from '@/database'

// ReturnFormコンポーネントのモック
vi.mock('@/components/returns/ReturnForm', () => ({
  ReturnForm: ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => (
    <div data-testid="return-form">
      <button onClick={onSuccess}>保存成功</button>
      <button onClick={onCancel}>フォームキャンセル</button>
    </div>
  ),
}))

// リポジトリのモック
vi.mock('@/database', () => ({
  ReturnRepository: vi.fn().mockImplementation(() => ({
    getByGiftId: vi.fn(),
    delete: vi.fn(),
  })),
  ImageRepository: vi.fn().mockImplementation(() => ({
    getByEntityId: vi.fn(),
    deleteByEntityId: vi.fn(),
  })),
}))

describe('ReturnHistory', () => {
  let mockReturnRepo: any
  let mockImageRepo: any
  const mockOnReturnAdded = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    mockReturnRepo = {
      getByGiftId: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(undefined),
    }
    mockImageRepo = {
      getByEntityId: vi.fn().mockResolvedValue([]),
      deleteByEntityId: vi.fn().mockResolvedValue(undefined),
    }

    ;(ReturnRepository as any).mockImplementation(() => mockReturnRepo)
    ;(ImageRepository as any).mockImplementation(() => mockImageRepo)
  })

  it('ローディング状態が正しく表示される', () => {
    mockReturnRepo.getByGiftId.mockImplementation(() => new Promise(() => {}))

    render(<ReturnHistory giftId="gift-1" />)

    expect(screen.getByText('お返し履歴を読み込み中...')).toBeInTheDocument()
  })

  it('お返しがない場合はEmptyStateを表示', async () => {
    mockReturnRepo.getByGiftId.mockResolvedValue([])

    render(<ReturnHistory giftId="gift-1" />)

    await waitFor(() => {
      expect(screen.getByText('まだお返しが登録されていません')).toBeInTheDocument()
    })
  })

  it('お返しを登録ボタンでフォームが表示される', async () => {
    mockReturnRepo.getByGiftId.mockResolvedValue([])

    render(<ReturnHistory giftId="gift-1" />)

    await waitFor(() => {
      expect(screen.getByText('＋ お返しを登録')).toBeInTheDocument()
    })

    const addButton = screen.getByText('＋ お返しを登録')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByTestId('return-form')).toBeInTheDocument()
    })
  })

  it('フォーム成功時にコールバックが呼ばれる', async () => {
    mockReturnRepo.getByGiftId.mockResolvedValue([])

    render(<ReturnHistory giftId="gift-1" onReturnAdded={mockOnReturnAdded} />)

    await waitFor(() => {
      expect(screen.getByText('＋ お返しを登録')).toBeInTheDocument()
    })

    const addButton = screen.getByText('＋ お返しを登録')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByTestId('return-form')).toBeInTheDocument()
    })

    const successButton = screen.getByText('保存成功')
    fireEvent.click(successButton)

    await waitFor(() => {
      expect(mockOnReturnAdded).toHaveBeenCalled()
    })
  })

  it('フォームキャンセル時にフォームが閉じる', async () => {
    mockReturnRepo.getByGiftId.mockResolvedValue([])

    render(<ReturnHistory giftId="gift-1" />)

    await waitFor(() => {
      expect(screen.getByText('＋ お返しを登録')).toBeInTheDocument()
    })

    const addButton = screen.getByText('＋ お返しを登録')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByTestId('return-form')).toBeInTheDocument()
    })

    const cancelButton = screen.getByText('フォームキャンセル')
    fireEvent.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByTestId('return-form')).not.toBeInTheDocument()
    })
  })

  it('お返し履歴ヘッダーが表示される', async () => {
    mockReturnRepo.getByGiftId.mockResolvedValue([])

    render(<ReturnHistory giftId="gift-1" />)

    await waitFor(() => {
      expect(screen.getByText('お返し履歴')).toBeInTheDocument()
    })
  })

  it('EmptyStateからお返しを登録できる', async () => {
    mockReturnRepo.getByGiftId.mockResolvedValue([])

    render(<ReturnHistory giftId="gift-1" />)

    await waitFor(() => {
      expect(screen.getByText('お返しを登録')).toBeInTheDocument()
    })

    const registerButton = screen.getByText('お返しを登録')
    fireEvent.click(registerButton)

    await waitFor(() => {
      expect(screen.getByTestId('return-form')).toBeInTheDocument()
    })
  })
})
