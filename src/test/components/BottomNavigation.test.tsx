import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { MemoryRouter } from 'react-router-dom'

// テスト用のラッパーコンポーネント
const TestWrapper = ({ children, initialEntries = ['/'] }: { children: React.ReactNode, initialEntries?: string[] }) => (
  <MemoryRouter initialEntries={initialEntries}>
    {children}
  </MemoryRouter>
)

describe('BottomNavigation', () => {
  it('正しくレンダリングされる', () => {
    render(
      <TestWrapper>
        <BottomNavigation />
      </TestWrapper>
    )
    
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('ナビゲーションアイテムが正しく表示される', () => {
    render(
      <TestWrapper>
        <BottomNavigation />
      </TestWrapper>
    )
    
    expect(screen.getByText('ホーム')).toBeInTheDocument()
    expect(screen.getByText('贈答品')).toBeInTheDocument()
    expect(screen.getByText('お返し')).toBeInTheDocument()
    expect(screen.getByText('リマインダー')).toBeInTheDocument()
  })

  it('アイコンが正しく表示される', () => {
    render(
      <TestWrapper>
        <BottomNavigation />
      </TestWrapper>
    )
    
    expect(screen.getByText('🏠')).toBeInTheDocument()
    expect(screen.getByText('🎁')).toBeInTheDocument()
    expect(screen.getByText('↩️')).toBeInTheDocument()
    expect(screen.getByText('⏰')).toBeInTheDocument()
  })

  it('ホームページでアクティブ状態が正しく表示される', () => {
    render(
      <TestWrapper initialEntries={['/']}>
        <BottomNavigation />
      </TestWrapper>
    )
    
    const homeLink = screen.getByText('ホーム').closest('a')
    expect(homeLink).toHaveClass('text-blue-600')
  })

  it('ギフトページでアクティブ状態が正しく表示される', () => {
    render(
      <TestWrapper initialEntries={['/gifts']}>
        <BottomNavigation />
      </TestWrapper>
    )
    
    const giftsLink = screen.getByText('贈答品').closest('a')
    expect(giftsLink).toHaveClass('text-blue-600')
  })

  it('ギフト詳細ページでアクティブ状態が正しく表示される', () => {
    render(
      <TestWrapper initialEntries={['/gifts/1']}>
        <BottomNavigation />
      </TestWrapper>
    )
    
    const giftsLink = screen.getByText('贈答品').closest('a')
    expect(giftsLink).toHaveClass('text-blue-600')
  })

  it('お返しページでアクティブ状態が正しく表示される', () => {
    render(
      <TestWrapper initialEntries={['/returns']}>
        <BottomNavigation />
      </TestWrapper>
    )
    
    const returnsLink = screen.getByText('お返し').closest('a')
    expect(returnsLink).toHaveClass('text-blue-600')
  })

  it('リマインダーページでアクティブ状態が正しく表示される', () => {
    render(
      <TestWrapper initialEntries={['/reminders']}>
        <BottomNavigation />
      </TestWrapper>
    )
    
    const remindersLink = screen.getByText('リマインダー').closest('a')
    expect(remindersLink).toHaveClass('text-blue-600')
  })

  it('非アクティブなリンクが正しいスタイルを持つ', () => {
    render(
      <TestWrapper initialEntries={['/']}>
        <BottomNavigation />
      </TestWrapper>
    )
    
    const giftsLink = screen.getByText('贈答品').closest('a')
    expect(giftsLink).toHaveClass('text-gray-500')
    expect(giftsLink).not.toHaveClass('text-blue-600')
  })

  it('リンクが正しいパスに設定されている', () => {
    render(
      <TestWrapper>
        <BottomNavigation />
      </TestWrapper>
    )
    
    expect(screen.getByText('ホーム').closest('a')).toHaveAttribute('href', '/')
    expect(screen.getByText('贈答品').closest('a')).toHaveAttribute('href', '/gifts')
    expect(screen.getByText('お返し').closest('a')).toHaveAttribute('href', '/returns')
    expect(screen.getByText('リマインダー').closest('a')).toHaveAttribute('href', '/reminders')
  })

  it('基本のスタイルが適用される', () => {
    render(
      <TestWrapper>
        <BottomNavigation />
      </TestWrapper>
    )
    
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0', 'bg-white', 'border-t', 'border-gray-200', 'md:hidden')
  })

  it('グリッドレイアウトが正しく適用される', () => {
    render(
      <TestWrapper>
        <BottomNavigation />
      </TestWrapper>
    )
    
    const nav = screen.getByRole('navigation')
    const grid = nav.querySelector('.grid')
    expect(grid).toHaveClass('grid-cols-5', 'h-16')
  })

  it('リンクの基本スタイルが適用される', () => {
    render(
      <TestWrapper>
        <BottomNavigation />
      </TestWrapper>
    )
    
    const homeLink = screen.getByText('ホーム').closest('a')
    expect(homeLink).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'text-xs', 'font-medium', 'transition-colors')
  })

  it('アイコンのスタイルが正しく適用される', () => {
    render(
      <TestWrapper>
        <BottomNavigation />
      </TestWrapper>
    )
    
    const homeIcon = screen.getByText('🏠')
    expect(homeIcon).toHaveClass('text-lg', 'mb-1')
  })

  it('レスポンシブデザインでデスクトップでは非表示になる', () => {
    render(
      <TestWrapper>
        <BottomNavigation />
      </TestWrapper>
    )
    
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('md:hidden')
  })

  it('複数のアクティブ状態が同時に存在しない', () => {
    render(
      <TestWrapper initialEntries={['/gifts']}>
        <BottomNavigation />
      </TestWrapper>
    )
    
    const activeLinks = screen.getAllByText(/ホーム|贈答品|お返し|リマインダー/).filter(link => 
      link.closest('a')?.classList.contains('text-blue-600')
    )
    expect(activeLinks).toHaveLength(1)
  })

  it('ネストしたパスでも正しくアクティブ状態が判定される', () => {
    render(
      <TestWrapper initialEntries={['/gifts/new']}>
        <BottomNavigation />
      </TestWrapper>
    )
    
    const giftsLink = screen.getByText('贈答品').closest('a')
    expect(giftsLink).toHaveClass('text-blue-600')
  })
})
