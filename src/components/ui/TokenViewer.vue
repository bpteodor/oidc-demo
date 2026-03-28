<template>
  <div class="token-viewer">
    <div class="token-viewer__header">
      <span class="token-viewer__label">{{ label }}</span>
      <div class="token-viewer__actions">
        <button class="btn btn-sm btn-default" @click="showDecoded = !showDecoded">
          <i class="bi" :class="showDecoded ? 'bi-eye-slash' : 'bi-eye'"></i>
          {{ showDecoded ? 'Raw' : 'Decode' }}
        </button>
        <button class="btn btn-sm btn-default" title="Copy token" @click="copy">
          <i class="bi" :class="copied ? 'bi-check-lg' : 'bi-clipboard'"></i>
        </button>
      </div>
    </div>

    <div class="token-viewer__body">
      <template v-if="!showDecoded">
        <pre class="token-raw">{{ token }}</pre>
      </template>
      <template v-else-if="isJwt">
        <div class="token-section">
          <div class="token-section__title">Header</div>
          <pre class="token-json">{{ formattedHeader }}</pre>
        </div>
        <div class="token-section">
          <div class="token-section__title">Payload</div>
          <pre class="token-json">{{ formattedPayload }}</pre>
          <div v-if="expiryInfo" class="token-expiry" :class="{ 'token-expiry--expired': expiryInfo.expired }">
            <i class="bi" :class="expiryInfo.expired ? 'bi-x-circle-fill' : 'bi-check-circle-fill'"></i>
            {{ expiryInfo.text }}
          </div>
        </div>
        <div class="token-section token-section--sig">
          <div class="token-section__title">Signature</div>
          <span class="token-sig-value">{{ parts[2] }}</span>
        </div>
      </template>
      <template v-else>
        <pre class="token-raw">{{ token }}</pre>
        <div class="token-not-jwt">Not a JWT — cannot decode.</div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

function decodeJwtPart(part: string): Record<string, unknown> | null {
  try {
    const padded = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=')
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

export default defineComponent({
  name: 'TokenViewer',

  props: {
    label: { type: String, required: true },
    token: { type: String, required: true },
  },

  data() {
    return {
      showDecoded: false,
      copied: false,
    }
  },

  computed: {
    parts(): string[] {
      return this.token.split('.')
    },

    isJwt(): boolean {
      return this.parts.length === 3
    },

    formattedHeader(): string {
      const decoded = decodeJwtPart(this.parts[0])
      return decoded ? JSON.stringify(decoded, null, 2) : this.parts[0]
    },

    formattedPayload(): string {
      const decoded = decodeJwtPart(this.parts[1])
      return decoded ? JSON.stringify(decoded, null, 2) : this.parts[1]
    },

    expiryInfo(): { expired: boolean; text: string } | null {
      const payload = decodeJwtPart(this.parts[1]) as Record<string, unknown> | null
      if (!payload || typeof payload['exp'] !== 'number') return null
      const exp = payload['exp'] as number
      const now = Math.floor(Date.now() / 1000)
      const expired = now >= exp
      const diff = Math.abs(exp - now)
      const mins = Math.floor(diff / 60)
      const secs = diff % 60
      const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
      return {
        expired,
        text: expired ? `Expired ${timeStr} ago` : `Expires in ${timeStr}`,
      }
    },
  },

  methods: {
    async copy() {
      await navigator.clipboard.writeText(this.token)
      this.copied = true
      setTimeout(() => { this.copied = false }, 2000)
    },
  },
})
</script>

<style scoped>
.token-viewer {
  border: 1px solid var(--c-border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--c-bg-surface);
}

.token-viewer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  background: var(--c-bg-elevated);
  border-bottom: 1px solid var(--c-border);
}

.token-viewer__label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--c-text-secondary);
}

.token-viewer__actions {
  display: flex;
  gap: 0.4rem;
}

.token-viewer__body {
  padding: 1rem;
}

.token-raw {
  font-size: 0.75rem;
  word-break: break-all;
  white-space: pre-wrap;
  color: var(--c-text-secondary);
  margin: 0;
  background: var(--c-bg-code);
  padding: 0.75rem;
  border-radius: 6px;
}

.token-section {
  margin-bottom: 1rem;
}

.token-section:last-child {
  margin-bottom: 0;
}

.token-section__title {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-accent);
  margin-bottom: 0.35rem;
}

.token-json {
  font-size: 0.78rem;
  margin: 0;
  background: var(--c-bg-code);
  padding: 0.75rem;
  border-radius: 6px;
  color: var(--c-text-secondary);
}

.token-section--sig .token-sig-value {
  font-family: monospace;
  font-size: 0.72rem;
  color: var(--c-text-muted);
  word-break: break-all;
}

.token-expiry {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--c-success);
}

.token-expiry--expired {
  color: var(--c-danger);
}

.token-not-jwt {
  font-size: 0.8rem;
  color: var(--c-text-muted);
  margin-top: 0.5rem;
}
</style>
