import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { getAdSenseConfig } from '@/lib/env'

vi.mock('@/lib/env', () => {
  return {
    getAdSenseConfig: vi.fn(() => ({
      clientId: '',
      slot: '',
      isDev: true,
    })),
  }
})

const mockedGetAdSenseConfig = getAdSenseConfig as unknown as ReturnType<typeof vi.fn>

const setAdSenseConfig = (config: { clientId?: string; slot?: string; isDev?: boolean }) => {
  mockedGetAdSenseConfig.mockImplementation(() => ({
    clientId: config.clientId ?? '',
    slot: config.slot ?? '',
    isDev: config.isDev ?? true,
  }))
}

describe('AdBanner', () => {
  const importComponent = async () => (await import('@/components/ads/AdBanner')).default

  beforeEach(() => {
    setAdSenseConfig({})
  })

  afterEach(() => {
    cleanup()
    delete (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle
    mockedGetAdSenseConfig.mockReset()
    setAdSenseConfig({})
  })

  it('環境変数が未設定の場合は開発用プレースホルダーを表示する', async () => {
    const AdBanner = await importComponent()
    render(<AdBanner />)

    expect(screen.getByText('広告スペース（開発モード）')).toBeInTheDocument()
    expect(screen.getByText('AdSense設定後に広告が表示されます')).toBeInTheDocument()
  })

  it('環境変数が設定されている場合は広告タグとadsbygoogleのpushを行う', async () => {
    setAdSenseConfig({
      clientId: 'ca-pub-test',
      slot: '123456',
      isDev: true,
    })
    ;(window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle = []

    const AdBanner = await importComponent()
    const { container } = render(
      <AdBanner format="rectangle" responsive={false} className="custom-class" />
    )

    const adElement = container.querySelector('ins.adsbygoogle')
    expect(adElement).not.toBeNull()
    expect(adElement).toHaveAttribute('data-ad-client', 'ca-pub-test')
    expect(adElement).toHaveAttribute('data-ad-slot', '123456')
    expect(adElement).toHaveAttribute('data-ad-format', 'rectangle')
    expect(adElement).toHaveAttribute('data-full-width-responsive', 'false')

    await waitFor(() => {
      const queue = (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle
      expect(queue).toBeDefined()
      expect(queue).toHaveLength(1)
    })
  })

  it('本番環境では設定がない場合に何も描画しない', async () => {
    setAdSenseConfig({
      clientId: '',
      slot: '',
      isDev: false,
    })

    const AdBanner = await importComponent()
    const { container } = render(<AdBanner />)

    expect(container.firstChild).toBeNull()
  })
})
