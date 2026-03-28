<template>
  <div class="modal fade" ref="el" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isNew ? 'New Provider' : (form.name || 'Edit Provider') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          <input-group id="pm-name" v-model="form.name" label="Name" required placeholder="My Provider" :error="errors.name" hint="A short label to identify this provider." />

          <div class="mb-3">
            <label class="form-label">Discovery URL</label>
            <div class="input-group">
              <input
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
            <div class="form-text">Enter the OpenID Connect discovery URL to auto-fill the endpoints below.</div>
          </div>

          <div v-if="!showManual && !discoveryLoaded" class="mb-3">
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="showManual = true">
              Enter endpoints manually
            </button>
          </div>

          <template v-if="showManual || discoveryLoaded">
            <input-group id="pm-issuer" v-model="form.issuer" type="url" label="Issuer" required :error="errors.issuer" />
            <input-group id="pm-auth" v-model="form.authorizationEndpoint" type="url" label="Authorization Endpoint" required :error="errors.authorizationEndpoint" />
            <input-group id="pm-token" v-model="form.tokenEndpoint" type="url" label="Token Endpoint" required :error="errors.tokenEndpoint" />
            <input-group id="pm-userinfo" v-model="form.userinfoEndpoint" type="url" label="UserInfo Endpoint" />
            <input-group id="pm-jwks" v-model="form.jwksUri" type="url" label="JWKS URI" required :error="errors.jwksUri" />
            <input-group id="pm-endsession" v-model="form.endSessionEndpoint" type="url" label="End Session Endpoint" />
            <input-group id="pm-introspect" v-model="form.introspectionEndpoint" type="url" label="Introspection Endpoint" />
            <input-group id="pm-scopes" v-model="form.scopesSupported" label="Scopes Supported" placeholder="openid profile email" hint="Space-separated list of supported scopes." />
          </template>
        </div>

        <div class="modal-footer">
          <button v-if="!isNew" class="btn btn-danger me-auto" type="button" @click="remove">Delete</button>
          <button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancel</button>
          <button class="btn btn-primary" type="button" :disabled="loading" @click="save">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import { Modal } from 'bootstrap'
import { useProvidersStore } from '../components/stores/providers'
import InputGroup from '../components/ui/InputGroup.vue'

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
  name: 'ProviderModal',
  components: { InputGroup },
  emits: ['saved', 'deleted'],

  setup() {
    return { providers: useProvidersStore() }
  },

  data() {
    return {
      bsModal: null as Modal | null,
      editId: null as string | null,
      form: emptyForm(),
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
      return this.editId === null
    },
  },

  mounted() {
    this.bsModal = new Modal(this.$refs.el as HTMLElement)
  },

  beforeUnmount() {
    this.bsModal?.dispose()
  },

  methods: {
    open(id?: string) {
      this.editId = id ?? null
      this.form = emptyForm()
      this.discoveryUrl = ''
      this.discoveryLoaded = false
      this.showManual = false
      this.errors = {}
      this.discoveryError = ''
      if (id) {
        const rec = this.providers.getById(id)
        if (rec) {
          this.form = {
            name: rec.name,
            issuer: rec.issuer,
            authorizationEndpoint: rec.authorizationEndpoint,
            tokenEndpoint: rec.tokenEndpoint,
            userinfoEndpoint: rec.userinfoEndpoint,
            jwksUri: rec.jwksUri,
            endSessionEndpoint: rec.endSessionEndpoint,
            introspectionEndpoint: rec.introspectionEndpoint,
            scopesSupported: rec.scopesSupported,
          }
          this.discoveryUrl = rec.discoveryUrl
          this.discoveryLoaded = !!rec.issuer
        }
      }
      this.bsModal?.show()
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
      if (!this.form.name.trim()) this.errors.name = 'Name is required.'
      if (this.showManual || this.discoveryLoaded) {
        if (!this.form.issuer.trim()) this.errors.issuer = 'Issuer is required.'
        if (!this.form.authorizationEndpoint.trim()) this.errors.authorizationEndpoint = 'Authorization endpoint is required.'
        if (!this.form.tokenEndpoint.trim()) this.errors.tokenEndpoint = 'Token endpoint is required.'
        if (!this.form.jwksUri.trim()) this.errors.jwksUri = 'JWKS URI is required.'
      }
      return Object.keys(this.errors).length === 0
    },

    save() {
      if (!this.validate()) return
      this.providers.save({
        ...(this.isNew ? {} : {id: this.editId as string}),
        ...this.form,
        discoveryUrl: this.discoveryUrl,
      })
      this.bsModal?.hide()
      this.$emit('saved')
    },

    remove() {
      if (!this.isNew && this.editId) {
        this.providers.remove(this.editId)
        this.bsModal?.hide()
        this.$emit('deleted')
      }
    },
  },
})
</script>
