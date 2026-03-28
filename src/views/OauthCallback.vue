<template>
  <div id="callback-page" class="container-fluid container h-100">
    <my-overlay :active="!done" :spinner="true">
      <div v-if="err" class="callback-error">
        <i class="bi bi-x-octagon-fill callback-error__icon"></i>
        <div class="callback-error__title">Authentication Failed</div>
        <pre class="callback-error__detail">{{ err }}</pre>
        <router-link to="/" class="btn btn-default btn-sm mt-3">Go Home</router-link>
      </div>
    </my-overlay>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import MyOverlay from '../components/ui/MyOverlay.vue'
import type { AcFlowConfig, AcFlowPkce } from './AuthCodeFlowPage.vue'

const STORAGE_CONFIG = 'ac_flow_config'
const STORAGE_PKCE   = 'ac_flow_pkce'
const STORAGE_RESULT = 'ac_flow_result'

export default defineComponent({
  name: 'OpenIdConnectCallback',
  components: { MyOverlay },

  data() {
    return {
      err: '',
      done: false,
    }
  },

  methods: {
    async handleCustomFlow(config: AcFlowConfig) {
      const query = this.$route.query
      sessionStorage.removeItem(STORAGE_CONFIG)

      // OAuth error returned by the provider
      if (query['error']) {
        sessionStorage.removeItem(STORAGE_PKCE)
        this.err = query['error_description']
          ? `${query['error']}: ${query['error_description']}`
          : String(query['error'])
        this.done = true
        return
      }

      const code = query['code'] as string
      const returnedState = query['state'] as string

      if (!code) {
        this.err = 'No authorization code received.'
        this.done = true
        return
      }

      // Verify state to prevent CSRF
      const rawPkce = sessionStorage.getItem(STORAGE_PKCE)
      sessionStorage.removeItem(STORAGE_PKCE)

      if (!rawPkce) {
        this.err = 'No flow state found in storage. The request may have originated from a different tab or the session expired.'
        this.done = true
        return
      }

      const pkce: AcFlowPkce = JSON.parse(rawPkce)

      if (pkce.state && returnedState !== pkce.state) {
        this.err = 'State parameter mismatch — possible CSRF attack. Request rejected.'
        this.done = true
        return
      }

      // Exchange authorization code for tokens
      const params = new URLSearchParams()
      params.append('grant_type', 'authorization_code')
      params.append('code', code)
      params.append('redirect_uri', config.redirectUri)
      params.append('client_id', config.clientId)

      if (config.pkce && pkce.codeVerifier) {
        params.append('code_verifier', pkce.codeVerifier)
      }

      if (config.tokenEndpointAuthMethod === 'client_secret_post' && config.clientSecret) {
        params.append('client_secret', config.clientSecret)
      }

      const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
      const axiosExtra =
        config.tokenEndpointAuthMethod === 'client_secret_basic' && config.clientSecret
          ? { auth: { username: config.clientId, password: config.clientSecret } }
          : {}

      try {
        const response = await axios.post(config.tokenEndpoint, params, { headers, ...axiosExtra })
        sessionStorage.setItem(STORAGE_RESULT, JSON.stringify(response.data))
        this.$router.push('/authorization-code')
      } catch (e: any) {
        const errData = e?.response?.data
        this.err = errData?.error_description || errData?.error || e?.message || 'Token exchange failed.'
        this.done = true
      }
    },
  },

  mounted() {
    console.info('[callback] processing...')

    const rawConfig = sessionStorage.getItem(STORAGE_CONFIG)

    if (rawConfig) {
      // Custom Authorization Code flow initiated from AuthCodeFlowPage
      try {
        const config: AcFlowConfig = JSON.parse(rawConfig)
        this.handleCustomFlow(config)
      } catch {
        sessionStorage.removeItem(STORAGE_CONFIG)
        sessionStorage.removeItem(STORAGE_PKCE)
        this.err = 'Corrupted flow configuration in storage.'
        this.done = true
      }
    }
  },
})
</script>

<style scoped>
.callback-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 0.75rem;
  text-align: center;
  padding: 2rem;
}

.callback-error__icon {
  font-size: 2.5rem;
  color: var(--c-danger);
}

.callback-error__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--c-text-primary);
}

.callback-error__detail {
  font-size: 0.82rem;
  color: var(--c-text-muted);
  background: var(--c-bg-code);
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  max-width: 560px;
  white-space: pre-wrap;
  word-break: break-word;
  text-align: left;
}
</style>
