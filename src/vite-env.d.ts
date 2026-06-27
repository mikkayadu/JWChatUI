/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API origin. Empty in dev (Vite proxy); set per environment. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
