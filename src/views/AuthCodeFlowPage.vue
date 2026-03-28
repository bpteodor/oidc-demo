<template>
  <page-template>
    <div class="ac-page page container">
      <h1 class="title">Authorization Code Flow</h1>

      <!-- No provider selected -->
      <div v-if="!provider" class="no-provider-hint">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        No OpenID Provider selected. Go to
        <router-link to="/config">Configuration</router-link> to add one.
      </div>

      <template v-else>

        <!-- ── Configuration card ──────────────────────────────── -->
        <app-card title="Client" class="mb-3">
          <div class="row g-3">

              <div class="col-md-6">
                <input-group v-model="form.clientId" label="Client ID" required placeholder="my-client" />
              </div>

              <div class="col-md-6">
                <input-group v-model="form.clientSecret" type="password" label="Client Secret" placeholder="(leave empty for public client)" autocomplete="off" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Token Endpoint Auth Method</label>
                <select v-model="form.tokenEndpointAuthMethod" class="form-select">
                  <option value="client_secret_basic">client_secret_basic — HTTP Basic</option>
                  <option value="client_secret_post">client_secret_post — POST body</option>
                  <option value="none">none — public client</option>
                </select>
              </div>

              <div class="col-md-6">
                <input-group v-model="form.redirectUri" type="url" label="Redirect URI" />
              </div>

            </div>
        </app-card>

        <!-- ── Request parameters card ─────────────────────────── -->
        <app-card title="Request Parameters" class="mb-3">
          <div class="row g-3">

            <div class="col-12">
              <input-group v-model="form.scopes" label="Scopes" placeholder="openid profile email" hint="Space-separated list of requested scopes." />
            </div>

            <div class="col-md-6">
              <input-group v-model="form.acrValues" label="ACR Values" placeholder="urn:mace:incommon:iap:silver" hint="Space-separated list of requested Authentication Context Class References." />
            </div>

            <div class="col-md-6">
              <input-group v-model="form.loginHint" label="Login Hint" placeholder="user@example.com" hint="Pre-fill the username/email on the login page." />
            </div>

            <div class="col-12">
              <div class="d-flex align-items-center gap-2">
                <div class="form-check form-switch mb-0">
                  <input v-model="form.pkce" class="form-check-input" type="checkbox" id="pkceToggle" />
                  <label class="form-check-label" for="pkceToggle">Use PKCE (Proof Key for Code Exchange)</label>
                </div>
                <span v-if="form.pkce" class="badge-pkce">S256</span>
              </div>
              <div class="form-text mt-1">Adds <code>code_challenge</code> and <code>code_challenge_method=S256</code> to the request.</div>
            </div>

          </div>
        </app-card>

        <!-- ── Authorization URL preview ──────────────────────── -->
        <app-card class="mb-4" header-class="d-flex align-items-center justify-content-between" body-class="p-0">
          <template #header>
            Authorization URL
            <button class="btn btn-sm btn-default" title="Copy URL" @click="copyUrl">
              <i class="bi" :class="urlCopied ? 'bi-check-lg' : 'bi-clipboard'"></i>
              {{ urlCopied ? 'Copied' : 'Copy' }}
            </button>
          </template>
          <pre class="auth-url-preview">{{ authorizationUrl }}</pre>
        </app-card>

        <!-- ── Start button ────────────────────────────────────── -->
        <div class="mb-5">
          <button class="btn btn-primary btn-lg" :disabled="!canStart" @click="startFlow">
            <i class="bi bi-box-arrow-right me-2"></i>Start Authentication
          </button>
          <span v-if="!form.clientId" class="ms-3 text-muted" style="font-size:0.85rem">Client ID is required.</span>
        </div>

        <!-- ── Tokens section ──────────────────────────────────── -->
        <template v-if="flowResult">
          <div class="section-divider"></div>
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h3 class="section-title mb-0">Received Tokens</h3>
            <button class="btn btn-sm btn-default" @click="clearResult">
              <i class="bi bi-x-circle me-1"></i>Clear
            </button>
          </div>

          <div v-if="flowResult.access_token" class="mb-4">
            <token-viewer label="Access Token" :token="flowResult.access_token" />
          </div>

          <div v-if="flowResult.id_token" class="mb-4">
            <token-viewer label="ID Token" :token="flowResult.id_token" />
          </div>

          <div v-if="flowResult.refresh_token" class="mb-4">
            <token-viewer label="Refresh Token" :token="flowResult.refresh_token" />
          </div>

          <app-card v-if="flowResult.expires_in || flowResult.token_type || flowResult.scope" title="Token Metadata" class="mb-4">
            <table class="meta-table">
              <tr v-if="flowResult.token_type"><td>token_type</td><td><code>{{ flowResult.token_type }}</code></td></tr>
              <tr v-if="flowResult.expires_in"><td>expires_in</td><td><code>{{ flowResult.expires_in }}s</code></td></tr>
              <tr v-if="flowResult.scope"><td>scope</td><td><code>{{ flowResult.scope }}</code></td></tr>
            </table>
          </app-card>

        </template>

      </template>
    </div>
  </page-template>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageTemplate from '../components/layout/PageTemplate.vue'
import TokenViewer from '../components/ui/TokenViewer.vue'
import InputGroup from '../components/ui/InputGroup.vue'
import AppCard from '../components/ui/AppCard.vue'
import { useProvidersStore } from '../components/stores/providers'
import type { OPRecord } from '../components/stores/providers'

export interface AcFlowConfig {
  providerId: string
  authorizationEndpoint: string
  tokenEndpoint: string
  clientId: string
  clientSecret: string
  tokenEndpointAuthMethod: 'client_secret_basic' | 'client_secret_post' | 'none'
  scopes: string
  acrValues: string
  pkce: boolean
  loginHint: string
  redirectUri: string
}

export interface AcFlowPkce {
  codeVerifier: string
  state: string
  nonce: string
}

export interface AcFlowResult {
  access_token?: string
  id_token?: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
  scope?: string
}

const STORAGE_CONFIG = 'ac_flow_config'
const STORAGE_PKCE   = 'ac_flow_pkce'
const STORAGE_RESULT = 'ac_flow_result'

// ── PKCE helpers ──────────────────────────────────────────────────────────────

function randomBase64Url(bytes: number): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return btoa(String.fromCharCode(...arr)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function sha256Base64Url(plain: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function buildAuthUrl(endpoint: string, params: Array<[string, string]>): string {
  const qs = params
    .filter(([, v]) => v.length > 0)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
  return `${endpoint}?${qs}`
}

function formatAuthUrlForDisplay(endpoint: string, params: Array<[string, string]>): string {
  const filtered = params.filter(([, v]) => v.length > 0)
  if (!filtered.length) return endpoint
  const lines = filtered.map(([k, v], i) => `  ${i === 0 ? '?' : '&'}${k}=${v}`)
  return endpoint + '\n' + lines.join('\n')
}

// ── Component ─────────────────────────────────────────────────────────────────

export default defineComponent({
  name: 'AuthCodeFlowPage',
  components: { PageTemplate, TokenViewer, InputGroup, AppCard },

  setup() {
    return { providers: useProvidersStore() }
  },

  data() {
    const defaultRedirectUri =
      window.APP_CONFIG?.oauth?.redirectUri ||
      window.location.origin + import.meta.env.BASE_URL + 'oauth-callback'

    return {
      form: {
        clientId: window.APP_CONFIG?.oauth?.clientId || '',
        clientSecret: '',
        tokenEndpointAuthMethod: 'client_secret_basic' as AcFlowConfig['tokenEndpointAuthMethod'],
        redirectUri: defaultRedirectUri,
        scopes: window.APP_CONFIG?.oauth?.scopes || 'openid profile email',
        acrValues: '',
        loginHint: '',
        pkce: true,
      },
      urlCopied: false,
      flowResult: null as AcFlowResult | null,
    }
  },

  computed: {
    provider(): OPRecord | null {
      return this.providers.selected
    },

    authorizationUrl(): string {
      if (!this.provider?.authorizationEndpoint) {
        return '(No provider selected or authorization endpoint not configured)'
      }

      const params: Array<[string, string]> = [
        ['response_type', 'code'],
        ['client_id', this.form.clientId || '<client_id>'],
        ['redirect_uri', this.form.redirectUri],
        ['scope', this.form.scopes || 'openid'],
      ]

      if (this.form.loginHint)  params.push(['login_hint', this.form.loginHint])
      if (this.form.acrValues)  params.push(['acr_values', this.form.acrValues])

      if (this.form.pkce) {
        params.push(['code_challenge', '<code_challenge>'])
        params.push(['code_challenge_method', 'S256'])
      }

      params.push(['state', '<state>'])
      params.push(['nonce', '<nonce>'])

      return formatAuthUrlForDisplay(this.provider.authorizationEndpoint, params)
    },

    canStart(): boolean {
      return !!this.provider?.authorizationEndpoint && !!this.form.clientId
    },
  },

  methods: {
    async copyUrl() {
      const url = this.authorizationUrl.replace(/\n\s*/g, '')
      await navigator.clipboard.writeText(url)
      this.urlCopied = true
      setTimeout(() => { this.urlCopied = false }, 2000)
    },

    async startFlow() {
      if (!this.provider || !this.form.clientId) return

      const state = randomBase64Url(16)
      const nonce = randomBase64Url(16)

      let codeVerifier = ''
      let codeChallenge = ''

      if (this.form.pkce) {
        codeVerifier = randomBase64Url(32)
        codeChallenge = await sha256Base64Url(codeVerifier)
      }

      // Persist flow config for the callback page
      const config: AcFlowConfig = {
        providerId: this.providers.selectedId,
        authorizationEndpoint: this.provider.authorizationEndpoint,
        tokenEndpoint: this.provider.tokenEndpoint,
        clientId: this.form.clientId,
        clientSecret: this.form.clientSecret,
        tokenEndpointAuthMethod: this.form.tokenEndpointAuthMethod,
        scopes: this.form.scopes,
        acrValues: this.form.acrValues,
        pkce: this.form.pkce,
        loginHint: this.form.loginHint,
        redirectUri: this.form.redirectUri,
      }

      const pkce: AcFlowPkce = { codeVerifier, state, nonce }

      sessionStorage.setItem(STORAGE_CONFIG, JSON.stringify(config))
      sessionStorage.setItem(STORAGE_PKCE, JSON.stringify(pkce))

      // Build real authorization URL
      const params: Array<[string, string]> = [
        ['response_type', 'code'],
        ['client_id', this.form.clientId],
        ['redirect_uri', this.form.redirectUri],
        ['scope', this.form.scopes || 'openid'],
      ]

      if (this.form.loginHint)  params.push(['login_hint', this.form.loginHint])
      if (this.form.acrValues)  params.push(['acr_values', this.form.acrValues])
      if (this.form.pkce)       params.push(['code_challenge', codeChallenge], ['code_challenge_method', 'S256'])

      params.push(['state', state], ['nonce', nonce])

      window.location.href = buildAuthUrl(this.provider.authorizationEndpoint, params)
    },

    clearResult() {
      this.flowResult = null
      sessionStorage.removeItem(STORAGE_RESULT)
    },
  },

  mounted() {
    // Pick up token result stored by OauthCallback after the flow completes
    const raw = sessionStorage.getItem(STORAGE_RESULT)
    if (raw) {
      try {
        this.flowResult = JSON.parse(raw)
        sessionStorage.removeItem(STORAGE_RESULT)
      } catch {
        sessionStorage.removeItem(STORAGE_RESULT)
      }
    }
  },
})
</script>

<style scoped>
.no-provider-hint {
  padding: 1rem 1.25rem;
  border: 1px solid var(--c-warning);
  border-radius: 8px;
  color: var(--c-warning);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.auth-url-preview {
  font-size: 0.78rem;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  padding: 1rem 1.25rem;
  color: var(--c-text-secondary);
  background: var(--c-bg-code);
  border-radius: 0 0 8px 8px;
}

.badge-pkce {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--c-accent-muted);
  color: var(--c-accent);
  border: 1px solid var(--c-accent);
}

.section-divider {
  border-top: 1px solid var(--c-border);
  margin: 2rem 0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--c-text-primary);
}

.meta-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.meta-table td {
  padding: 0.3rem 0.75rem 0.3rem 0;
  color: var(--c-text-secondary);
  vertical-align: top;
}

.meta-table td:first-child {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--c-text-muted);
  white-space: nowrap;
  width: 120px;
}
</style>
