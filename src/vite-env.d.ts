/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENV: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_DEBUG_MODE: string
  // 他の環境変数もここに追加
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}