/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_WHATSAPP_NUMBER: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
