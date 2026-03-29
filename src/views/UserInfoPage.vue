<template>
  <page-template>
    <div class="page container">
      <h1 class="title">UserInfo</h1>

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
            placeholder="Paste an access token or obtain one via Auth Code Flow…"
          />
        </app-card>

        <!-- ── Request preview ──────────────────────────────────── -->
        <app-card class="mb-4" body-class="p-0">
          <template #header>Request Preview</template>
          <pre class="request-preview">{{ requestPreview }}</pre>
        </app-card>

        <!-- ── Call button ──────────────────────────────────────── -->
        <div class="mb-5">
          <button class="btn btn-primary btn-lg" :disabled="!canCall || loading" @click="callUserInfo">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i v-else class="bi bi-person-badge me-2"></i>
            {{ loading ? 'Calling…' : 'Call UserInfo' }}
          </button>
          <span v-if="!token" class="ms-3 text-muted" style="font-size:0.85rem">Token is required.</span>
          <span v-else-if="!provider.userinfoEndpoint" class="ms-3 text-muted" style="font-size:0.85rem">
            Provider has no userinfo endpoint.
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
            <h3 class="section-title mb-0">Claims</h3>
            <button class="btn btn-sm btn-default" @click="result = null">
              <i class="bi bi-x-circle me-1"></i>Clear
            </button>
          </div>

          <app-card class="mb-3" body-class="p-0">
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
import AppCard from '../components/ui/AppCard.vue'
import { useProvidersStore } from '../components/stores/providers'
import type { OPRecord } from '../components/stores/providers'

export default defineComponent({
  name: 'UserInfoPage',
  components: { PageTemplate, AppCard },

  setup() {
    return { providers: useProvidersStore() }
  },

  data() {
    return {
      token: '',
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
      if (!this.provider?.userinfoEndpoint) {
        return '(No userinfo endpoint configured for this provider)'
      }
      const tokenSnippet = this.token ? this.token.slice(0, 20) + '…' : '<access_token>'
      return [
        `GET ${this.provider.userinfoEndpoint}`,
        `  Authorization: Bearer ${tokenSnippet}`,
      ].join('\n')
    },

    canCall(): boolean {
      return !!this.provider?.userinfoEndpoint && !!this.token
    },
  },

  methods: {
    async callUserInfo() {
      if (!this.provider?.userinfoEndpoint || !this.token) return

      this.loading = true
      this.error = ''
      this.result = null

      try {
        const response = await axios.get(this.provider.userinfoEndpoint, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        this.result = response.data
      } catch (e: any) {
        const errData = e?.response?.data
        this.error = errData?.error_description || errData?.error || e?.message || 'UserInfo request failed.'
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
</style>
