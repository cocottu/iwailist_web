import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/react'
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

const setAdSenseConfig = (clientId?: string) => {
  mockedGetAdSenseConfig.mockImplementation(() => ({
    clientId,
    slot: '',
    isDev: true,
  }))
}

describe('AdScript', () => {
  const importComponent = async () => (await import('@/components/ads/AdScript')).default

  beforeEach(() => {
    setAdSenseConfig('')
  })

  afterEach(() => {
    cleanup()
    document.head.innerHTML = ''
    mockedGetAdSenseConfig.mockReset()
    setAdSenseConfig('')
  })

  it('環境変数が未設定の場合はスクリプトを追加しない', async () => {
    const AdScript = await importComponent()
    render(<AdScript />)

    expect(
      document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')
    ).toBeNull()
  })

  it('環境変数が設定されている場合はスクリプトを追加しクリーンアップする', async () => {
    setAdSenseConfig('ca-pub-test')

    const AdScript = await importComponent()
    const { unmount } = render(<AdScript />)

    await waitFor(() => {
      const script = document.querySelector(
        'script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-test"]'
      ) as HTMLScriptElement | null
      expect(script).not.toBeNull()
      expect(script?.async).toBe(true)
      expect(script?.crossOrigin).toBe('anonymous')
    })

    unmount()

    await waitFor(() => {
      expect(
        document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')
      ).toBeNull()
    })
  })

  it('既にスクリプトが存在する場合は新規追加しない', async () => {
    setAdSenseConfig('ca-pub-test')

    const existingScript = document.createElement('script')
    existingScript.src =
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=existing'
    document.head.appendChild(existingScript)

    const AdScript = await importComponent()
    render(<AdScript />)

    await waitFor(() => {
      const scripts = document.querySelectorAll(
        'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
      )
      expect(scripts).toHaveLength(1)
    })
  })
})
