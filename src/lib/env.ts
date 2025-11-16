export interface AdSenseConfig {
  clientId?: string
  slot?: string
  isDev: boolean
}

/**
 * AdSense関連の環境変数を取得する
 */
export function getAdSenseConfig(): AdSenseConfig {
  return {
    clientId: import.meta.env.VITE_ADSENSE_CLIENT_ID,
    slot: import.meta.env.VITE_ADSENSE_SLOT,
    isDev: import.meta.env.DEV,
  }
}
