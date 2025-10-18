import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '@/components/layout/Header'
import { MemoryRouter } from 'react-router-dom'

// テスト用のラッパーコンポーネント
const TestWrapper = ({ children, initialEntries = ['/'] }: { children: React.ReactNode, initialEntries?: string[] }) => (
  <MemoryRouter initialEntries={initialEntries}>
    {children}
  </MemoryRouter>
)

describe('Header', () => {
  it('正しくレンダリングされる', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )
    
    expect(screen.getByText('祝い品管理')).toBeInTheDocument()
    expect(screen.getByText('祝')).toBeInTheDocument()
  })

  it('ナビゲーションリンクが正しく表示される', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )
    
    expect(screen.getByRole('link', { name: 'ホーム' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '贈答品' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '人物' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '統計' })).toBeInTheDocument()
  })

  it('ホームページでアクティブ状態が正しく表示される', () => {
    render(
      <TestWrapper initialEntries={['/']}>
        <Header />
      </TestWrapper>
    )
    
    const homeLink = screen.getByRole('link', { name: 'ホーム' })
    expect(homeLink).toHaveClass('bg-blue-100', 'text-blue-700')
  })

  it('ギフトページでアクティブ状態が正しく表示される', () => {
    render(
      <TestWrapper initialEntries={['/gifts']}>
        <Header />
      </TestWrapper>
    )
    
    const giftsLink = screen.getByRole('link', { name: '贈答品' })
    expect(giftsLink).toHaveClass('bg-blue-100', 'text-blue-700')
  })

  it('ギフト詳細ページでアクティブ状態が正しく表示される', () => {
    render(
      <TestWrapper initialEntries={['/gifts/1']}>
        <Header />
      </TestWrapper>
    )
    
    const giftsLink = screen.getByRole('link', { name: '贈答品' })
    expect(giftsLink).toHaveClass('bg-blue-100', 'text-blue-700')
  })

  it('人物ページでアクティブ状態が正しく表示される', () => {
    render(
      <TestWrapper initialEntries={['/persons']}>
        <Header />
      </TestWrapper>
    )
    
    const personsLink = screen.getByRole('link', { name: '人物' })
    expect(personsLink).toHaveClass('bg-blue-100', 'text-blue-700')
  })

  it('統計ページでアクティブ状態が正しく表示される', () => {
    render(
      <TestWrapper initialEntries={['/statistics']}>
        <Header />
      </TestWrapper>
    )
    
    const statisticsLink = screen.getByRole('link', { name: '統計' })
    expect(statisticsLink).toHaveClass('bg-blue-100', 'text-blue-700')
  })

  it('非アクティブなリンクが正しいスタイルを持つ', () => {
    render(
      <TestWrapper initialEntries={['/']}>
        <Header />
      </TestWrapper>
    )
    
    const giftsLink = screen.getByRole('link', { name: '贈答品' })
    expect(giftsLink).toHaveClass('text-gray-500', 'hover:text-gray-700')
    expect(giftsLink).not.toHaveClass('bg-blue-100', 'text-blue-700')
  })

  it('ロゴリンクがホームページに正しくリンクしている', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )
    
    const logoLink = screen.getByRole('link', { name: /祝い品管理/ })
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('レスポンシブデザインでナビゲーションが隠される', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )
    
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('hidden', 'md:flex')
  })
})
