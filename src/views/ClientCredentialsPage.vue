<template>
  <page-template>
    <div class="cc-page page container" @click="showClientDropdown = false">
      <h1 class="title">Client Credentials Flow</h1>

      <!-- No provider selected -->
      <div v-if="!provider" class="no-provider-hint">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        No OpenID Provider selected. Go to
        <router-link to="/config">Configuration</router-link> to add one.
      </div>

      <template v-else>

        <!-- ── Client card ─────────────────────────────────────────── -->
        <app-card title="Client" class="mb-3">
          <div class="row g-3">

            <!-- Client ID + pre-configured client picker -->
            <div class="col-md-6">
              <label class="form-label">Client ID <span class="text-danger">*</span></label>
              <div class="input-group">
                <input v-model="form.clientId" type="text" class="form-control" placeholder="my-client" required />
                <div v-if="provider.clients && provider.clients.length" class="dropdown">
                  <button
                    type="button"
                    class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split"
                    title="Select pre-configured client"
                    @click.stop="showClientDropdown = !showClientDropdown"
                  ></button>
                  <ul class="dropdown-menu dropdown-menu-end" :class="{ show: showClientDropdown }">
                    <li><h6 class="dropdown-header">Pre-configured clients</h6></li>
                    <li v-for="client in provider.clients" :key="client.id">
                      <button type="button" class="dropdown-item" @click.stop="selectClient(client)">
                        <span class="fw-semibold">{{ client.clientId }}</span>
                        <span v-if="client.scopes" class="ms-2 text-muted small">{{ client.scopes }}</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <input-group v-model="form.clientSecret" type="password" label="Client Secret" placeholder="(required for confidential clients)" autocomplete="off" />
            </div>

            <div class="col-md-6">
              <label class="form-label">Token Endpoint Auth Method</label>
              <select v-model="form.tokenEndpointAuthMethod" class="form-select">
                <option value="client_secret_basic">client_secret_basic — HTTP Basic</option>
                <option value="client_secret_post">client_secret_post — POST body</option>
              </select>
            </div>

            <div class="col-md-6">
              <input-group v-model="form.scopes" label="Scopes" placeholder="read write" hint="Space-separated list of requested scopes." />
            </div>

          </div>
        </app-card>

        <!-- ── Token request preview ───────────────────────────────── -->
        <app-card class="mb-4" header-class="d-flex align-items-center justify-content-between" body-class="p-0">
          <template #header>
            Token Request
            <button class="btn btn-sm btn-default" title="Copy as curl" @click="copyCurl">
              <i class="bi" :class="curlCopied ? 'bi-check-lg' : 'bi-clipboard'"></i>
              {{ curlCopied ? 'Copied' : 'Copy curl' }}
            </button>
          </template>
          <pre class="request-preview">{{ requestPreview }}</pre>
        </app-card>

        <!-- ── Request button ──────────────────────────────────────── -->
        <div class="mb-5">
          <button class="btn btn-primary btn-lg" :disabled="!canRequest || loading" @click="requestToken">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i v-else class="bi bi-send me-2"></i>
            {{ loading ? 'Requesting…' : 'Request Token' }}
          </button>
          <span v-if="!form.clientId" class="ms-3 text-muted" style="font-size:0.85rem">Client ID is required.</span>
        </div>

        <!-- ── Error ──────────────────────────────────────────────── -->
        <div v-if="error" class="request-error mb-4">
          <i class="bi bi-x-octagon-fill me-2"></i>
          <span>{{ error }}</span>
        </div>

        <!-- ── Tokens section ──────────────────────────────────────── -->
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
import axios from 'axios'
import PageTemplate from '../components/layout/PageTemplate.vue'
import TokenViewer from '../components/ui/TokenViewer.vue'
import InputGroup from '../components/ui/InputGroup.vue'
import AppCard from '../components/ui/AppCard.vue'
import { useProvidersStore } from '../components/stores/providers'
import type { OPRecord, ClientRecord } from '../components/stores/providers'

export interface CcFlowResult {
  access_token?: string
  token_type?: string
  expires_in?: number
  scope?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export default defineComponent({
  name: 'ClientCredentialsPage',
  components: { PageTemplate, TokenViewer, InputGroup, AppCard },

  setup() {
    return { providers: useProvidersStore() }
  },

  data() {
    return {
      form: {
        clientId: '',
        clientSecret: '',
        tokenEndpointAuthMethod: 'client_secret_basic' as 'client_secret_basic' | 'client_secret_post',
        scopes: '',
      },
      showClientDropdown: false,
      curlCopied: false,
      loading: false,
      error: '',
      flowResult: null as CcFlowResult | null,
    }
  },

  computed: {
    provider(): OPRecord | null {
      return this.providers.selected
    },

    requestPreview(): string {
      if (!this.provider?.tokenEndpoint) {
        return '(No provider selected or token endpoint not configured)'
      }

      const endpoint = this.provider.tokenEndpoint
      const clientId = this.form.clientId || '<client_id>'
      const lines: string[] = [`POST ${endpoint}`]

      if (this.form.tokenEndpointAuthMethod === 'client_secret_basic') {
        const secret = this.form.clientSecret || '<client_secret>'
        const encoded = btoa(`${clientId}:${secret}`)
        lines.push(`  Authorization: Basic ${encoded}`)
      }

      lines.push(`  Content-Type: application/x-www-form-urlencoded`)
      lines.push(``)
      lines.push(`  grant_type=client_credentials`)
      lines.push(`  client_id=${clientId}`)

      if (this.form.tokenEndpointAuthMethod === 'client_secret_post' && this.form.clientSecret) {
        lines.push(`  client_secret=${this.form.clientSecret}`)
      }

      if (this.form.scopes) {
        lines.push(`  scope=${this.form.scopes}`)
      }

      return lines.join('\n')
    },

    curlCommand(): string {
      if (!this.provider?.tokenEndpoint) return ''

      const clientId = this.form.clientId || '<client_id>'
      const endpoint = this.provider.tokenEndpoint
      const parts: string[] = [`curl -s -X POST '${endpoint}'`]

      if (this.form.tokenEndpointAuthMethod === 'client_secret_basic') {
        const secret = this.form.clientSecret || '<client_secret>'
        parts.push(`  -u '${clientId}:${secret}'`)
      }

      parts.push(`  -d 'grant_type=client_credentials'`)
      parts.push(`  -d 'client_id=${clientId}'`)

      if (this.form.tokenEndpointAuthMethod === 'client_secret_post' && this.form.clientSecret) {
        parts.push(`  -d 'client_secret=${this.form.clientSecret}'`)
      }

      if (this.form.scopes) {
        parts.push(`  -d 'scope=${this.form.scopes}'`)
      }

      return parts.join(' \\\n')
    },

    canRequest(): boolean {
      return !!this.provider?.tokenEndpoint && !!this.form.clientId
    },
  },

  methods: {
    selectClient(client: ClientRecord) {
      this.form.clientId = client.clientId
      this.form.clientSecret = client.clientSecret
      this.form.scopes = client.scopes
      this.showClientDropdown = false
    },

    async copyCurl() {
      await navigator.clipboard.writeText(this.curlCommand)
      this.curlCopied = true
      setTimeout(() => { this.curlCopied = false }, 2000)
    },

    async requestToken() {
      if (!this.provider || !this.form.clientId) return

      this.loading = true
      this.error = ''
      this.flowResult = null

      const params = new URLSearchParams()
      params.append('grant_type', 'client_credentials')
      params.append('client_id', this.form.clientId)

      if (this.form.tokenEndpointAuthMethod === 'client_secret_post' && this.form.clientSecret) {
        params.append('client_secret', this.form.clientSecret)
      }

      if (this.form.scopes) {
        params.append('scope', this.form.scopes)
      }

      const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
      const axiosExtra =
        this.form.tokenEndpointAuthMethod === 'client_secret_basic' && this.form.clientSecret
          ? { auth: { username: this.form.clientId, password: this.form.clientSecret } }
          : {}

      try {
        const response = await axios.post(this.provider.tokenEndpoint, params, { headers, ...axiosExtra })
        this.flowResult = response.data
        if (response.data.access_token) {
          this.providers.setAccessToken(response.data.access_token)
        }
      } catch (e: any) {
        const errData = e?.response?.data
        this.error = errData?.error_description || errData?.error || e?.message || 'Token request failed.'
      } finally {
        this.loading = false
      }
    },

    clearResult() {
      this.flowResult = null
      this.error = ''
    },
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

.request-preview {
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

.request-error {
  padding: 0.75rem 1.25rem;
  border: 1px solid var(--c-danger);
  border-radius: 8px;
  color: var(--c-danger);
  font-size: 0.88rem;
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
