<template>
  <page-template>
    <div class="page container" @click="showClientDropdown = false">
      <h1 class="title">Token Introspection</h1>

      <!-- No provider selected -->
      <div v-if="!provider" class="no-provider-hint">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        No OpenID Provider selected. Go to
        <router-link to="/config">Configuration</router-link> to add one.
      </div>

      <template v-else>

        <!-- ── Token input ──────────────────────────────────────── -->
        <app-card title="Access Token" class="mb-3">
          <textarea
            v-model="token"
            class="form-control font-monospace token-input"
            rows="4"
            placeholder="Paste an access token or obtain one via Auth Code Flow or Client Credentials…"
          />
        </app-card>

        <!-- ── Client credentials ──────────────────────────────── -->
        <app-card title="Client" class="mb-3">
          <div class="row g-3">

            <div class="col-md-6">
              <label class="form-label">Client ID</label>
              <div class="input-group">
                <input v-model="form.clientId" type="text" class="form-control" placeholder="my-client" />
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
              <input-group v-model="form.clientSecret" type="password" label="Client Secret" placeholder="(optional)" autocomplete="off" />
            </div>

            <div class="col-md-6">
              <label class="form-label">Token Endpoint Auth Method</label>
              <select v-model="form.tokenEndpointAuthMethod" class="form-select">
                <option value="client_secret_basic">client_secret_basic — HTTP Basic</option>
                <option value="client_secret_post">client_secret_post — POST body</option>
              </select>
            </div>

          </div>
        </app-card>

        <!-- ── Request preview ──────────────────────────────────── -->
        <app-card class="mb-4" body-class="p-0">
          <template #header>Request Preview</template>
          <pre class="request-preview">{{ requestPreview }}</pre>
        </app-card>

        <!-- ── Introspect button ─────────────────────────────────── -->
        <div class="mb-5">
          <button class="btn btn-primary btn-lg" :disabled="!canIntrospect || loading" @click="introspect">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i v-else class="bi bi-search me-2"></i>
            {{ loading ? 'Introspecting…' : 'Introspect Token' }}
          </button>
          <span v-if="!token" class="ms-3 text-muted" style="font-size:0.85rem">Token is required.</span>
          <span v-else-if="!provider.introspectionEndpoint" class="ms-3 text-muted" style="font-size:0.85rem">
            Provider has no introspection endpoint.
          </span>
        </div>

        <!-- ── Error ─────────────────────────────────────────────── -->
        <div v-if="error" class="request-error mb-4">
          <i class="bi bi-x-octagon-fill me-2"></i>
          <span>{{ error }}</span>
        </div>

        <!-- ── Result ─────────────────────────────────────────────── -->
        <template v-if="result !== null">
          <div class="section-divider"></div>
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h3 class="section-title mb-0">
              Introspection Response
              <span v-if="result.active === true" class="ms-2 badge-active">active</span>
              <span v-else-if="result.active === false" class="ms-2 badge-inactive">inactive</span>
            </h3>
            <button class="btn btn-sm btn-default" @click="result = null">
              <i class="bi bi-x-circle me-1"></i>Clear
            </button>
          </div>

          <app-card class="mb-4" body-class="p-0">
            <pre class="result-json">{{ JSON.stringify(result, null, 2) }}</pre>
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
import InputGroup from '../components/ui/InputGroup.vue'
import AppCard from '../components/ui/AppCard.vue'
import { useProvidersStore } from '../components/stores/providers'
import type { OPRecord, ClientRecord } from '../components/stores/providers'

export default defineComponent({
  name: 'IntrospectionPage',
  components: { PageTemplate, InputGroup, AppCard },

  setup() {
    return { providers: useProvidersStore() }
  },

  data() {
    return {
      token: '',
      form: {
        clientId: window.APP_CONFIG?.oauth?.clientId || '',
        clientSecret: '',
        tokenEndpointAuthMethod: 'client_secret_basic' as 'client_secret_basic' | 'client_secret_post',
      },
      showClientDropdown: false,
      loading: false,
      error: '',
      result: null as Record<string, unknown> | null,
    }
  },

  computed: {
    provider(): OPRecord | null {
      return this.providers.selected
    },

    requestPreview(): string {
      if (!this.provider?.introspectionEndpoint) {
        return '(No introspection endpoint configured for this provider)'
      }
      const endpoint = this.provider.introspectionEndpoint
      const clientId = this.form.clientId || '<client_id>'
      const lines: string[] = [`POST ${endpoint}`]

      if (this.form.tokenEndpointAuthMethod === 'client_secret_basic') {
        const secret = this.form.clientSecret || '<client_secret>'
        const encoded = btoa(`${clientId}:${secret}`)
        lines.push(`  Authorization: Basic ${encoded}`)
      }

      lines.push(`  Content-Type: application/x-www-form-urlencoded`)
      lines.push(``)
      lines.push(`  token=${this.token ? this.token.slice(0, 20) + '…' : '<token>'}`)

      if (this.form.tokenEndpointAuthMethod === 'client_secret_post') {
        lines.push(`  client_id=${clientId}`)
        if (this.form.clientSecret) lines.push(`  client_secret=***`)
      }

      return lines.join('\n')
    },

    canIntrospect(): boolean {
      return !!this.provider?.introspectionEndpoint && !!this.token
    },
  },

  methods: {
    selectClient(client: ClientRecord) {
      this.form.clientId = client.clientId
      this.form.clientSecret = client.clientSecret
      this.showClientDropdown = false
    },

    async introspect() {
      if (!this.provider?.introspectionEndpoint || !this.token) return

      this.loading = true
      this.error = ''
      this.result = null

      const params = new URLSearchParams()
      params.append('token', this.token)

      if (this.form.tokenEndpointAuthMethod === 'client_secret_post') {
        if (this.form.clientId) params.append('client_id', this.form.clientId)
        if (this.form.clientSecret) params.append('client_secret', this.form.clientSecret)
      }

      const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
      const axiosExtra =
        this.form.tokenEndpointAuthMethod === 'client_secret_basic' && this.form.clientId
          ? { auth: { username: this.form.clientId, password: this.form.clientSecret } }
          : {}

      try {
        const response = await axios.post(this.provider.introspectionEndpoint, params, { headers, ...axiosExtra })
        this.result = response.data
      } catch (e: any) {
        const errData = e?.response?.data
        this.error = errData?.error_description || errData?.error || e?.message || 'Introspection request failed.'
      } finally {
        this.loading = false
      }
    },
  },

  mounted() {
    if (this.providers.accessToken) {
      this.token = this.providers.accessToken
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

.token-input {
  font-size: 0.78rem;
  resize: vertical;
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

.result-json {
  font-size: 0.82rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  padding: 1rem 1.25rem;
  color: var(--c-text-secondary);
  background: var(--c-bg-code);
  border-radius: 0 0 8px 8px;
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

.badge-active {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 2px 7px;
  border-radius: 4px;
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
  border: 1px solid #16a34a;
}

.badge-inactive {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 2px 7px;
  border-radius: 4px;
  background: rgba(239, 68, 68, 0.12);
  color: var(--c-danger);
  border: 1px solid var(--c-danger);
}
</style>
