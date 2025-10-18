import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Loading } from '@/components/ui/Loading'

describe('Loading', () => {
  it('正しくレンダリングされる', () => {
    render(<Loading />)
    const svg = screen.getByRole('img', { hidden: true })
    expect(svg).toBeInTheDocument()
  })

  it('デフォルトサイズ（md）が適用される', () => {
    render(<Loading />)
    const svg = screen.getByRole('img', { hidden: true })
    expect(svg).toHaveClass('h-8', 'w-8')
  })

  it('小サイズ（sm）が正しく適用される', () => {
    render(<Loading size="sm" />)
    const svg = screen.getByRole('img', { hidden: true })
    expect(svg).toHaveClass('h-4', 'w-4')
  })

  it('中サイズ（md）が正しく適用される', () => {
    render(<Loading size="md" />)
    const svg = screen.getByRole('img', { hidden: true })
    expect(svg).toHaveClass('h-8', 'w-8')
  })

  it('大サイズ（lg）が正しく適用される', () => {
    render(<Loading size="lg" />)
    const svg = screen.getByRole('img', { hidden: true })
    expect(svg).toHaveClass('h-12', 'w-12')
  })

  it('テキストが正しく表示される', () => {
    render(<Loading text="読み込み中..." />)
    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('テキストなしでも正しく動作する', () => {
    render(<Loading />)
    const svg = screen.getByRole('img', { hidden: true })
    expect(svg).toBeInTheDocument()
    expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument()
  })

  it('カスタムクラスが正しく適用される', () => {
    render(<Loading className="custom-class" />)
    const container = screen.getByRole('img', { hidden: true }).closest('div')
    expect(container).toHaveClass('custom-class')
  })

  it('基本のスタイルが適用される', () => {
    render(<Loading />)
    const container = screen.getByRole('img', { hidden: true }).closest('div')
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')
  })

  it('SVGの基本スタイルが適用される', () => {
    render(<Loading />)
    const svg = screen.getByRole('img', { hidden: true })
    expect(svg).toHaveClass('animate-spin', 'text-blue-600')
    expect(svg).toHaveAttribute('fill', 'none')
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
  })

  it('テキストのスタイルが正しく適用される', () => {
    render(<Loading text="テストテキスト" />)
    const text = screen.getByText('テストテキスト')
    expect(text).toHaveClass('mt-2', 'text-sm', 'text-gray-600')
  })

  it('アニメーションクラスが適用される', () => {
    render(<Loading />)
    const svg = screen.getByRole('img', { hidden: true })
    expect(svg).toHaveClass('animate-spin')
  })

  it('複数のpropsが同時に適用される', () => {
    render(<Loading size="lg" text="大きなローディング" className="custom-class" />)
    
    const svg = screen.getByRole('img', { hidden: true })
    expect(svg).toHaveClass('h-12', 'w-12', 'animate-spin', 'text-blue-600')
    
    expect(screen.getByText('大きなローディング')).toBeInTheDocument()
    
    const container = svg.closest('div')
    expect(container).toHaveClass('custom-class')
  })

  it('長いテキストでも正しく表示される', () => {
    const longText = 'これは非常に長いローディングメッセージです。複数行にわたって表示される可能性があります。'
    render(<Loading text={longText} />)
    expect(screen.getByText(longText)).toBeInTheDocument()
  })

  it('空のテキストでも正しく動作する', () => {
    render(<Loading text="" />)
    const svg = screen.getByRole('img', { hidden: true })
    expect(svg).toBeInTheDocument()
  })

  it('SVGの内部構造が正しい', () => {
    render(<Loading />)
    const svg = screen.getByRole('img', { hidden: true })
    
    // circle要素の確認
    const circle = svg.querySelector('circle')
    expect(circle).toHaveClass('opacity-25')
    expect(circle).toHaveAttribute('cx', '12')
    expect(circle).toHaveAttribute('cy', '12')
    expect(circle).toHaveAttribute('r', '10')
    expect(circle).toHaveAttribute('stroke', 'currentColor')
    expect(circle).toHaveAttribute('stroke-width', '4')
    
    // path要素の確認
    const path = svg.querySelector('path')
    expect(path).toHaveClass('opacity-75')
    expect(path).toHaveAttribute('fill', 'currentColor')
  })
})
