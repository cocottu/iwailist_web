import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/ui/Input'

describe('Input', () => {
  it('正しくレンダリングされる', () => {
    render(<Input placeholder="テスト入力" />)
    expect(screen.getByPlaceholderText('テスト入力')).toBeInTheDocument()
  })

  it('ラベルが正しく表示される', () => {
    render(<Input label="テストラベル" />)
    expect(screen.getByText('テストラベル')).toBeInTheDocument()
  })

  it('必須マークが正しく表示される', () => {
    render(<Input label="テストラベル" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('エラーメッセージが正しく表示される', () => {
    render(<Input error="エラーメッセージ" />)
    expect(screen.getByText('エラーメッセージ')).toBeInTheDocument()
  })

  it('ヘルパーテキストが正しく表示される', () => {
    render(<Input helperText="ヘルパーテキスト" />)
    expect(screen.getByText('ヘルパーテキスト')).toBeInTheDocument()
  })

  it('エラーがある場合、ヘルパーテキストは表示されない', () => {
    render(<Input error="エラーメッセージ" helperText="ヘルパーテキスト" />)
    expect(screen.getByText('エラーメッセージ')).toBeInTheDocument()
    expect(screen.queryByText('ヘルパーテキスト')).not.toBeInTheDocument()
  })

  it('エラー状態で正しいスタイルが適用される', () => {
    render(<Input error="エラーメッセージ" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-500')
  })

  it('無効状態で正しいスタイルが適用される', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('bg-gray-100', 'cursor-not-allowed')
    expect(input).toBeDisabled()
  })

  it('カスタムクラスが正しく適用される', () => {
    render(<Input className="custom-class" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('入力イベントが正しく発火する', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'テスト入力' } })
    
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: 'テスト入力' })
    }))
  })

  it('フォーカスイベントが正しく発火する', () => {
    const handleFocus = vi.fn()
    render(<Input onFocus={handleFocus} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    
    expect(handleFocus).toHaveBeenCalledTimes(1)
  })

  it('ブラーイベントが正しく発火する', () => {
    const handleBlur = vi.fn()
    render(<Input onBlur={handleBlur} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.blur(input)
    
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('その他のpropsが正しく渡される', () => {
    render(<Input data-testid="test-input" type="email" placeholder="メールアドレス" />)
    const input = screen.getByTestId('test-input')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'メールアドレス')
  })

  it('ラベルなしでも正しく動作する', () => {
    render(<Input placeholder="ラベルなし入力" />)
    expect(screen.getByPlaceholderText('ラベルなし入力')).toBeInTheDocument()
  })

  it('複数の属性が同時に適用される', () => {
    render(
      <Input
        label="複合テスト"
        required
        error="エラーメッセージ"
        disabled
        className="custom-class"
        placeholder="複合入力"
      />
    )
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class', 'border-red-500', 'bg-gray-100', 'cursor-not-allowed')
    expect(input).toBeDisabled()
    expect(screen.getByText('複合テスト')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
    expect(screen.getByText('エラーメッセージ')).toBeInTheDocument()
  })
})
