<template>
  <page-template>
    <div class="config-layout">

      <!-- ── Provider list panel ─────────────────────────────────── -->
      <div class="provider-panel">
        <div class="provider-panel__head">
          <span class="provider-panel__title">Providers</span>
          <button class="provider-panel__add-btn" title="New provider" @click="startNew">
            <i class="bi bi-plus-lg"></i>
            <span>New</span>
          </button>
        </div>

        <div class="provider-list">
          <p v-if="providers.providers.length === 0" class="provider-list__empty">
            No providers yet.
          </p>
          <button
            v-for="op in providers.providers"
            :key="op.id"
            class="provider-item"
            :class="{
              'provider-item--selected': providers.selectedId === op.id,
              'provider-item--editing': formMode === op.id,
            }"
            @click="activate(op.id)"
          >
            <span class="provider-item__dot" :class="{ 'provider-item__dot--on': providers.selectedId === op.id }"></span>
            <span class="provider-item__name">{{ op.name }}</span>
            <i class="bi bi-chevron-right provider-item__arrow"></i>
          </button>
        </div>
      </div>

      <!-- ── Form panel ───────────────────────────────────────────── -->
      <div class="form-panel">

        <!-- Empty state -->
        <div v-if="formMode === null" class="form-empty">
          <i class="bi bi-shield-lock form-empty__icon"></i>
          <p class="form-empty__hint">Select a provider to edit, or create a new one.</p>
          <button class="btn btn-primary" @click="startNew">
            <i class="bi bi-plus-lg me-1"></i>New Provider
          </button>
        </div>

        <!-- Form -->
        <div v-else class="op-form">
          <h2 class="op-form__title">{{ isNew ? 'New Provider' : form.name || 'Edit Provider' }}</h2>

          <!-- Discovery -->
          <div class="card mb-4">
            <div class="card-header">Discovery</div>
            <div class="card-body">
              <div class="mb-3">
                <label for="discoveryUrl" class="form-label">Discovery URL</label>
                <div class="input-group">
                  <input
                    id="discoveryUrl"
                    v-model="discoveryUrl"
                    type="url"
                    class="form-control"
                    placeholder="https://example.com/.well-known/openid-configuration"
                    :disabled="loading"
                  />
                  <button class="btn btn-secondary" type="button" :disabled="!discoveryUrl || loading" @click="fetchDiscovery">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    {{ loading ? 'Fetching…' : 'Fetch' }}
                  </button>
                </div>
                <div v-if="discoveryError" class="validation-error mt-1">{{ discoveryError }}</div>
                <div class="form-text">Enter the OpenID Connect discovery URL to auto-fill the configuration below.</div>
              </div>
            </div>
          </div>

          <!-- Configuration -->
          <div class="card mb-4">
            <div class="card-header">
              Configuration
              <button v-if="!showManual" class="btn btn-sm btn-default float-end" type="button" @click="showManual = true">
                Enter manually
              </button>
            </div>
            <div class="card-body">

              <div class="mb-3">
                <label for="opName" class="form-label">Name <span class="text-danger">*</span></label>
                <input id="opName" v-model="form.name" type="text" class="form-control" :class="{ 'is-invalid': errors.name }" placeholder="My Provider" />
                <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
                <div class="form-text">A short label to identify this provider.</div>
              </div>

              <template v-if="showManual || discoveryLoaded">

                <div class="mb-3">
                  <label for="issuer" class="form-label">Issuer <span class="text-danger">*</span></label>
                  <input id="issuer" v-model="form.issuer" type="url" class="form-control" :class="{ 'is-invalid': errors.issuer }" placeholder="https://example.com" />
                  <div v-if="errors.issuer" class="invalid-feedback">{{ errors.issuer }}</div>
                </div>

                <div class="mb-3">
                  <label for="authorizationEndpoint" class="form-label">Authorization Endpoint <span class="text-danger">*</span></label>
                  <input id="authorizationEndpoint" v-model="form.authorizationEndpoint" type="url" class="form-control" :class="{ 'is-invalid': errors.authorizationEndpoint }" />
                  <div v-if="errors.authorizationEndpoint" class="invalid-feedback">{{ errors.authorizationEndpoint }}</div>
                </div>

                <div class="mb-3">
                  <label for="tokenEndpoint" class="form-label">Token Endpoint <span class="text-danger">*</span></label>
                  <input id="tokenEndpoint" v-model="form.tokenEndpoint" type="url" class="form-control" :class="{ 'is-invalid': errors.tokenEndpoint }" />
                  <div v-if="errors.tokenEndpoint" class="invalid-feedback">{{ errors.tokenEndpoint }}</div>
                </div>

                <div class="mb-3">
                  <label for="userinfoEndpoint" class="form-label">UserInfo Endpoint</label>
                  <input id="userinfoEndpoint" v-model="form.userinfoEndpoint" type="url" class="form-control" />
                </div>

                <div class="mb-3">
                  <label for="jwksUri" class="form-label">JWKS URI <span class="text-danger">*</span></label>
                  <input id="jwksUri" v-model="form.jwksUri" type="url" class="form-control" :class="{ 'is-invalid': errors.jwksUri }" />
                  <div v-if="errors.jwksUri" class="invalid-feedback">{{ errors.jwksUri }}</div>
                </div>

                <div class="mb-3">
                  <label for="endSessionEndpoint" class="form-label">End Session Endpoint</label>
                  <input id="endSessionEndpoint" v-model="form.endSessionEndpoint" type="url" class="form-control" />
                </div>

                <div class="mb-3">
                  <label for="introspectionEndpoint" class="form-label">Introspection Endpoint</label>
                  <input id="introspectionEndpoint" v-model="form.introspectionEndpoint" type="url" class="form-control" />
                </div>

                <div class="mb-3">
                  <label for="scopesSupported" class="form-label">Scopes Supported</label>
                  <input id="scopesSupported" v-model="form.scopesSupported" type="text" class="form-control" placeholder="openid profile email" />
                  <div class="form-text">Space-separated list of supported scopes.</div>
                </div>

              </template>
            </div>
          </div>

          <!-- Actions -->
          <div class="d-flex gap-2 mb-5">
            <button class="btn btn-primary" type="button" :disabled="loading" @click="save">Save</button>
            <button class="btn btn-default" type="button" @click="cancel">Cancel</button>
            <button v-if="!isNew" class="btn btn-danger ms-auto" type="button" @click="remove">Delete</button>
          </div>

        </div>
      </div>

    </div>
  </page-template>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import { useProvidersStore } from '../components/stores/providers'
import PageTemplate from '../components/layout/PageTemplate.vue'

interface OPForm {
  name: string
  issuer: string
  authorizationEndpoint: string
  tokenEndpoint: string
  userinfoEndpoint: string
  jwksUri: string
  endSessionEndpoint: string
  introspectionEndpoint: string
  scopesSupported: string
}

function emptyForm(): OPForm {
  return {
    name: '',
    issuer: '',
    authorizationEndpoint: '',
    tokenEndpoint: '',
    userinfoEndpoint: '',
    jwksUri: '',
    endSessionEndpoint: '',
    introspectionEndpoint: '',
    scopesSupported: '',
  }
}

export default defineComponent({
  name: 'ConfigPage',
  components: { PageTemplate },

  setup() {
    return { providers: useProvidersStore() }
  },

  data() {
    return {
      // null = nothing open; 'new' = creating; string id = editing
      formMode: null as string | null,
      form: emptyForm() as OPForm,
      discoveryUrl: '',
      discoveryLoaded: false,
      showManual: false,
      loading: false,
      discoveryError: '',
      errors: {} as Partial<Record<keyof OPForm, string>>,
    }
  },

  computed: {
    isNew(): boolean {
      return this.formMode === 'new'
    },
  },

  methods: {
    activate(id: string) {
      this.providers.select(id)
      this.startEdit(id)
    },

    startNew() {
      this.formMode = 'new'
      this.form = emptyForm()
      this.discoveryUrl = ''
      this.discoveryLoaded = false
      this.showManual = false
      this.errors = {}
      this.discoveryError = ''
    },

    startEdit(id: string) {
      const record = this.providers.getById(id)
      if (!record) return
      this.formMode = id
      this.discoveryUrl = record.discoveryUrl
      this.form = {
        name: record.name,
        issuer: record.issuer,
        authorizationEndpoint: record.authorizationEndpoint,
        tokenEndpoint: record.tokenEndpoint,
        userinfoEndpoint: record.userinfoEndpoint,
        jwksUri: record.jwksUri,
        endSessionEndpoint: record.endSessionEndpoint,
        introspectionEndpoint: record.introspectionEndpoint,
        scopesSupported: record.scopesSupported,
      }
      this.discoveryLoaded = !!record.issuer
      this.showManual = false
      this.errors = {}
      this.discoveryError = ''
    },

    async fetchDiscovery() {
      this.discoveryError = ''
      this.loading = true
      try {
        const res = await axios.get(this.discoveryUrl)
        const d = res.data
        this.form.issuer = d.issuer || ''
        this.form.authorizationEndpoint = d.authorization_endpoint || ''
        this.form.tokenEndpoint = d.token_endpoint || ''
        this.form.userinfoEndpoint = d.userinfo_endpoint || ''
        this.form.jwksUri = d.jwks_uri || ''
        this.form.endSessionEndpoint = d.end_session_endpoint || ''
        this.form.introspectionEndpoint = d.introspection_endpoint || ''
        this.form.scopesSupported = Array.isArray(d.scopes_supported)
          ? d.scopes_supported.join(' ')
          : (d.scopes_supported || '')
        this.discoveryLoaded = true
      } catch (e: any) {
        this.discoveryError = e?.response?.data?.error_description || e?.message || 'Failed to fetch discovery document.'
      } finally {
        this.loading = false
      }
    },

    validate(): boolean {
      this.errors = {}
      const f = this.form
      if (!f.name.trim()) this.errors.name = 'Name is required.'
      if (this.showManual || this.discoveryLoaded) {
        if (!f.issuer.trim()) this.errors.issuer = 'Issuer is required.'
        if (!f.authorizationEndpoint.trim()) this.errors.authorizationEndpoint = 'Authorization endpoint is required.'
        if (!f.tokenEndpoint.trim()) this.errors.tokenEndpoint = 'Token endpoint is required.'
        if (!f.jwksUri.trim()) this.errors.jwksUri = 'JWKS URI is required.'
      }
      return Object.keys(this.errors).length === 0
    },

    save() {
      if (!this.validate()) return
      this.providers.save({
        ...(this.isNew ? {} : { id: this.formMode as string }),
        ...this.form,
        discoveryUrl: this.discoveryUrl,
      })
      // After saving a new provider the store auto-selects it — switch to edit mode for it
      if (this.isNew) {
        this.formMode = this.providers.selectedId
      }
    },

    cancel() {
      this.formMode = null
    },

    remove() {
      if (typeof this.formMode === 'string' && this.formMode !== 'new') {
        this.providers.remove(this.formMode)
        this.formMode = null
      }
    },
  },

  mounted() {
    // Auto-open the active provider on load
    if (this.providers.selectedId) {
      this.startEdit(this.providers.selectedId)
    }
  },
})
</script>

<style scoped>
/* ── overall layout ──────────────────────────────────────────── */
.config-layout {
  display: flex;
  height: 100%;
  min-height: calc(100vh - var(--hdr-height));
}

/* ── provider list panel ─────────────────────────────────────── */
.provider-panel {
  width: 240px;
  flex-shrink: 0;
  border-right: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
}

.provider-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1rem 0.75rem;
  border-bottom: 1px solid var(--c-border);
}

.provider-panel__title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-text-muted);
}

.provider-panel__add-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  height: 28px;
  padding: 0 0.6rem;
  border-radius: 5px;
  border: 1px solid var(--c-border);
  background: transparent;
  color: var(--c-text-secondary);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.provider-panel__add-btn:hover {
  background: var(--c-accent-muted);
  border-color: var(--c-accent);
  color: var(--c-accent);
}

/* ── provider list ───────────────────────────────────────────── */
.provider-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.provider-list__empty {
  padding: 1.5rem 1rem;
  font-size: 0.85rem;
  color: var(--c-text-muted);
  text-align: center;
  margin: 0;
}

.provider-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.55rem 1rem;
  background: transparent;
  border: none;
  border-right: 3px solid transparent;
  color: var(--c-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.provider-item:hover {
  background: var(--c-accent-muted);
  color: var(--c-text-primary);
}

.provider-item--editing {
  color: var(--c-accent);
  border-right-color: var(--c-accent);
  background: var(--c-accent-muted);
  font-weight: 600;
}

.provider-item__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--c-border);
  transition: background 0.15s, box-shadow 0.15s;
}

.provider-item__dot--on {
  background: var(--c-accent);
  box-shadow: 0 0 6px var(--c-accent);
}

.provider-item__name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.provider-item__arrow {
  font-size: 0.65rem;
  color: var(--c-text-muted);
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s;
}

.provider-item:hover .provider-item__arrow,
.provider-item--editing .provider-item__arrow {
  opacity: 1;
}

/* ── form panel ──────────────────────────────────────────────── */
.form-panel {
  flex: 1;
  overflow-y: auto;
  min-width: 0;
}

.form-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 320px;
  gap: 1rem;
  color: var(--c-text-muted);
}

.form-empty__icon {
  font-size: 2.5rem;
  opacity: 0.35;
}

.form-empty__hint {
  margin: 0;
  font-size: 0.9rem;
}

.op-form {
  max-width: 640px;
  padding: 2rem 2rem 1rem;
}

.op-form__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--c-text-primary);
}
</style>
