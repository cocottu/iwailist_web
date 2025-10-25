import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Layout } from '@/components/layout/Layout'
import { MemoryRouter } from 'react-router-dom'

// date-fnsモック（実際の関数を使用）
vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns')>()
  return {
    ...actual,
    formatDistanceToNow: actual.formatDistanceToNow,
  }
})

vi.mock('date-fns/locale', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns/locale')>()
  return {
    ...actual,
    ja: actual.ja,
  }
})

// モック
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { 
      uid: 'test-uid', 
      displayName: 'Test User',
      email: 'test@example.com',
      photoURL: null
    },
    isAuthenticated: true,
    signOut: vi.fn(),
  }),
}))

vi.mock('@/hooks/useSync', () => ({
  useSync: () => ({
    isSyncing: false,
    lastSyncTime: new Date('2024-01-01'),
    pendingOperations: 0,
    sync: vi.fn(),
    retrySync: vi.fn(),
    clearSyncQueue: vi.fn(),
    error: null,
    isOnline: true,
  }),
}))

vi.mock('@/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => true,
}))

// テスト用のラッパーコンポーネント
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
)

describe('Layout', () => {
  it('正しくレンダリングされる', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>テストコンテンツ</div>
        </Layout>
      </TestWrapper>
    )
    
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument()
  })

  it('Headerコンポーネントが含まれる', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>テストコンテンツ</div>
        </Layout>
      </TestWrapper>
    )
    
    expect(screen.getByText('祝い品管理')).toBeInTheDocument()
  })

  it('BottomNavigationコンポーネントが含まれる', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>テストコンテンツ</div>
        </Layout>
      </TestWrapper>
    )
    
    expect(screen.getAllByText('ホーム')).toHaveLength(2) // HeaderとBottomNavigationの両方に存在
    expect(screen.getAllByText('贈答品')).toHaveLength(2) // HeaderとBottomNavigationの両方に存在
    expect(screen.getAllByText('リマインダー')).toHaveLength(2) // HeaderとBottomNavigationの両方に存在
    expect(screen.getByText('人物')).toBeInTheDocument() // Headerにのみ存在
  })

  it('子要素が正しくレンダリングされる', () => {
    render(
      <TestWrapper>
        <Layout>
          <div data-testid="test-content">テストコンテンツ</div>
        </Layout>
      </TestWrapper>
    )
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  it('複数の子要素が正しくレンダリングされる', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>子要素1</div>
          <div>子要素2</div>
          <div>子要素3</div>
        </Layout>
      </TestWrapper>
    )
    
    expect(screen.getByText('子要素1')).toBeInTheDocument()
    expect(screen.getByText('子要素2')).toBeInTheDocument()
    expect(screen.getByText('子要素3')).toBeInTheDocument()
  })

  it('基本のスタイルが適用される', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>テストコンテンツ</div>
        </Layout>
      </TestWrapper>
    )
    
    const container = screen.getByText('テストコンテンツ').closest('div')?.parentElement?.parentElement
    expect(container).toHaveClass('min-h-screen', 'bg-gray-50')
  })

  it('メインコンテンツのスタイルが適用される', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>テストコンテンツ</div>
        </Layout>
      </TestWrapper>
    )
    
    const main = screen.getByText('テストコンテンツ').closest('main')
    expect(main).toHaveClass('pb-16', 'md:pb-0')
  })

  it('空の子要素でも正しく動作する', () => {
    render(
      <TestWrapper>
        <Layout>
          {null}
        </Layout>
      </TestWrapper>
    )
    
    expect(screen.getByText('祝い品管理')).toBeInTheDocument()
    expect(screen.getAllByText('ホーム')).toHaveLength(2) // HeaderとBottomNavigationの両方に存在
  })

  it('nullの子要素でも正しく動作する', () => {
    render(
      <TestWrapper>
        <Layout>
          {null}
        </Layout>
      </TestWrapper>
    )
    
    expect(screen.getByText('祝い品管理')).toBeInTheDocument()
    expect(screen.getAllByText('ホーム')).toHaveLength(2) // HeaderとBottomNavigationの両方に存在
  })

  it('条件付きレンダリングの子要素が正しく動作する', () => {
    const showContent = true
    render(
      <TestWrapper>
        <Layout>
          {showContent && <div>条件付きコンテンツ</div>}
        </Layout>
      </TestWrapper>
    )
    
    expect(screen.getByText('条件付きコンテンツ')).toBeInTheDocument()
  })

  it('レスポンシブデザインのスタイルが適用される', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>テストコンテンツ</div>
        </Layout>
      </TestWrapper>
    )
    
    const main = screen.getByText('テストコンテンツ').closest('main')
    expect(main).toHaveClass('pb-16', 'md:pb-0')
  })

  it('レイアウト構造が正しい', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>テストコンテンツ</div>
        </Layout>
      </TestWrapper>
    )
    
    // Headerが最初に来る
    const header = screen.getByText('祝い品管理').closest('header')
    expect(header).toBeInTheDocument()
    
    // mainが2番目に来る
    const main = screen.getByText('テストコンテンツ').closest('main')
    expect(main).toBeInTheDocument()
    
    // BottomNavigationが最後に来る
    const bottomNav = screen.getAllByText('ホーム')[1].closest('nav') // 2番目の「ホーム」はBottomNavigation
    expect(bottomNav).toBeInTheDocument()
  })

  it('複雑な子要素構造でも正しく動作する', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>
            <h1>タイトル</h1>
            <p>説明文</p>
            <button>ボタン</button>
          </div>
        </Layout>
      </TestWrapper>
    )
    
    expect(screen.getByText('タイトル')).toBeInTheDocument()
    expect(screen.getByText('説明文')).toBeInTheDocument()
    // 複数のボタンがある（同期ボタン、ユーザーメニューボタン、テスト用ボタン）
    expect(screen.getByText('ボタン')).toBeInTheDocument()
  })
})
