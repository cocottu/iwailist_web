/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_API_KEY?: string
  readonly VITE_DEBUG?: string
  // 必要に応じて他の環境変数を追加
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
