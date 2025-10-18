import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Select } from '@/components/ui/Select'

const mockOptions = [
  { value: 'option1', label: 'オプション1' },
  { value: 'option2', label: 'オプション2' },
  { value: 'option3', label: 'オプション3' },
]

describe('Select', () => {
  it('正しくレンダリングされる', () => {
    render(<Select options={mockOptions} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('オプションが正しく表示される', () => {
    render(<Select options={mockOptions} />)
    expect(screen.getByText('オプション1')).toBeInTheDocument()
    expect(screen.getByText('オプション2')).toBeInTheDocument()
    expect(screen.getByText('オプション3')).toBeInTheDocument()
  })

  it('ラベルが正しく表示される', () => {
    render(<Select options={mockOptions} label="テストラベル" />)
    expect(screen.getByText('テストラベル')).toBeInTheDocument()
  })

  it('必須マークが正しく表示される', () => {
    render(<Select options={mockOptions} label="テストラベル" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('プレースホルダーが正しく表示される', () => {
    render(<Select options={mockOptions} placeholder="選択してください" />)
    expect(screen.getByText('選択してください')).toBeInTheDocument()
  })

  it('プレースホルダーオプションは無効化される', () => {
    render(<Select options={mockOptions} placeholder="選択してください" />)
    const placeholderOption = screen.getByText('選択してください')
    expect(placeholderOption).toHaveAttribute('disabled')
  })

  it('エラーメッセージが正しく表示される', () => {
    render(<Select options={mockOptions} error="エラーメッセージ" />)
    expect(screen.getByText('エラーメッセージ')).toBeInTheDocument()
  })

  it('ヘルパーテキストが正しく表示される', () => {
    render(<Select options={mockOptions} helperText="ヘルパーテキスト" />)
    expect(screen.getByText('ヘルパーテキスト')).toBeInTheDocument()
  })

  it('エラーがある場合、ヘルパーテキストは表示されない', () => {
    render(<Select options={mockOptions} error="エラーメッセージ" helperText="ヘルパーテキスト" />)
    expect(screen.getByText('エラーメッセージ')).toBeInTheDocument()
    expect(screen.queryByText('ヘルパーテキスト')).not.toBeInTheDocument()
  })

  it('エラー状態で正しいスタイルが適用される', () => {
    render(<Select options={mockOptions} error="エラーメッセージ" />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('border-red-500')
  })

  it('無効状態で正しいスタイルが適用される', () => {
    render(<Select options={mockOptions} disabled />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('bg-gray-100', 'cursor-not-allowed')
    expect(select).toBeDisabled()
  })

  it('カスタムクラスが正しく適用される', () => {
    render(<Select options={mockOptions} className="custom-class" />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('custom-class')
  })

  it('変更イベントが正しく発火する', () => {
    const handleChange = vi.fn()
    render(<Select options={mockOptions} onChange={handleChange} />)
    
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'option2' } })
    
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: 'option2' })
    }))
  })

  it('フォーカスイベントが正しく発火する', () => {
    const handleFocus = vi.fn()
    render(<Select options={mockOptions} onFocus={handleFocus} />)
    
    const select = screen.getByRole('combobox')
    fireEvent.focus(select)
    
    expect(handleFocus).toHaveBeenCalledTimes(1)
  })

  it('ブラーイベントが正しく発火する', () => {
    const handleBlur = vi.fn()
    render(<Select options={mockOptions} onBlur={handleBlur} />)
    
    const select = screen.getByRole('combobox')
    fireEvent.blur(select)
    
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('その他のpropsが正しく渡される', () => {
    render(<Select options={mockOptions} data-testid="test-select" name="test-select" />)
    const select = screen.getByTestId('test-select')
    expect(select).toHaveAttribute('name', 'test-select')
  })

  it('空のオプション配列でも正しく動作する', () => {
    render(<Select options={[]} placeholder="オプションなし" />)
    expect(screen.getByText('オプションなし')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('ラベルなしでも正しく動作する', () => {
    render(<Select options={mockOptions} placeholder="ラベルなし選択" />)
    expect(screen.getByText('ラベルなし選択')).toBeInTheDocument()
  })

  it('複数の属性が同時に適用される', () => {
    render(
      <Select
        options={mockOptions}
        label="複合テスト"
        required
        error="エラーメッセージ"
        disabled
        className="custom-class"
        placeholder="複合選択"
      />
    )
    
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('custom-class', 'border-red-500', 'bg-gray-100', 'cursor-not-allowed')
    expect(select).toBeDisabled()
    expect(screen.getByText('複合テスト')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
    expect(screen.getByText('エラーメッセージ')).toBeInTheDocument()
    expect(screen.getByText('複合選択')).toBeInTheDocument()
  })

  it('オプションの値とラベルが正しく設定される', () => {
    render(<Select options={mockOptions} />)
    const select = screen.getByRole('combobox')
    const options = select.querySelectorAll('option')
    
    expect(options[0]).toHaveValue('option1')
    expect(options[0]).toHaveTextContent('オプション1')
    expect(options[1]).toHaveValue('option2')
    expect(options[1]).toHaveTextContent('オプション2')
    expect(options[2]).toHaveValue('option3')
    expect(options[2]).toHaveTextContent('オプション3')
  })
})
