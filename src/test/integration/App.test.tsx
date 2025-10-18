import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '@/App'
import { MemoryRouter } from 'react-router-dom'

// データベース初期化のモック
vi.mock('@/database', () => ({
  initializeDB: vi.fn(() => Promise.resolve()),
}))

// ページコンポーネントのモック
vi.mock('@/pages/Dashboard', () => ({
  Dashboard: () => <div data-testid="dashboard">Dashboard</div>
}))

vi.mock('@/pages/GiftList', () => ({
  GiftList: () => <div data-testid="gift-list">Gift List</div>
}))

vi.mock('@/pages/GiftDetail', () => ({
  GiftDetail: () => <div data-testid="gift-detail">Gift Detail</div>
}))

vi.mock('@/pages/GiftForm', () => ({
  GiftForm: () => <div data-testid="gift-form">Gift Form</div>
}))

vi.mock('@/pages/PersonList', () => ({
  PersonList: () => <div data-testid="person-list">Person List</div>
}))

vi.mock('@/pages/PersonDetail', () => ({
  PersonDetail: () => <div data-testid="person-detail">Person Detail</div>
}))

vi.mock('@/pages/PersonForm', () => ({
  PersonForm: () => <div data-testid="person-form">Person Form</div>
}))

vi.mock('@/pages/Statistics', () => ({
  Statistics: () => <div data-testid="statistics">Statistics</div>
}))

// レイアウトコンポーネントのモック
vi.mock('@/components/layout/Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">
      <header>Header</header>
      <main>{children}</main>
    </div>
  )
}))

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('アプリケーションが正しくレンダリングされる', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('layout')).toBeInTheDocument()
    })

    expect(screen.getByText('Header')).toBeInTheDocument()
  })

  it('ルートパスでダッシュボードが表示される', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    })
  })

  it('ギフト一覧ページが表示される', async () => {
    // ブラウザの履歴を変更してページを移動
    window.history.pushState({}, '', '/gifts')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('gift-list')).toBeInTheDocument()
    })
  })

  it('ギフト新規作成ページが表示される', async () => {
    window.history.pushState({}, '', '/gifts/new')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('gift-form')).toBeInTheDocument()
    })
  })

  it('ギフト詳細ページが表示される', async () => {
    window.history.pushState({}, '', '/gifts/1')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('gift-detail')).toBeInTheDocument()
    })
  })

  it('ギフト編集ページが表示される', async () => {
    window.history.pushState({}, '', '/gifts/1/edit')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('gift-form')).toBeInTheDocument()
    })
  })

  it('人物一覧ページが表示される', async () => {
    window.history.pushState({}, '', '/persons')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('person-list')).toBeInTheDocument()
    })
  })

  it('人物新規作成ページが表示される', async () => {
    window.history.pushState({}, '', '/persons/new')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('person-form')).toBeInTheDocument()
    })
  })

  it('人物詳細ページが表示される', async () => {
    window.history.pushState({}, '', '/persons/1')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('person-detail')).toBeInTheDocument()
    })
  })

  it('人物編集ページが表示される', async () => {
    window.history.pushState({}, '', '/persons/1/edit')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('person-form')).toBeInTheDocument()
    })
  })

  it('統計ページが表示される', async () => {
    window.history.pushState({}, '', '/statistics')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('statistics')).toBeInTheDocument()
    })
  })

  it('データベースが初期化される', async () => {
    const { initializeDB } = await import('@/database')
    
    render(<App />)

    await waitFor(() => {
      expect(initializeDB).toHaveBeenCalled()
    })
  })

  it('存在しないルートの場合、ダッシュボードが表示される', async () => {
    window.history.pushState({}, '', '/nonexistent')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    })
  })
})
