/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface AppConfig {
  oauth?: {
    clientId?: string
    redirectUri?: string
    scopes?: string
  }
}

interface ProviderConfig {
  name?: string
  discovery?: string
  clients?: Array<{
    client_id?: string
    client_secret?: string
    scopes?: string
    grants?: string[]
  }>
}

declare interface Window {
  APP_CONFIG?: AppConfig
  CONFIG?: ProviderConfig[]
}
