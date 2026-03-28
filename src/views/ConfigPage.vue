<template>
  <page-template>
    <div class="config-page">

      <!-- Header -->
      <div class="config-header">
        <h1 class="config-header__title">Providers</h1>
        <button class="btn btn-primary btn-sm" @click="openNewProvider">
          <i class="bi bi-plus-lg me-1"></i>New Provider
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="providers.providers.length === 0" class="config-empty">
        <i class="bi bi-shield-lock config-empty__icon"></i>
        <p class="config-empty__text">No providers configured yet.</p>
        <button class="btn btn-primary" @click="openNewProvider">
          <i class="bi bi-plus-lg me-1"></i>New Provider
        </button>
      </div>

      <!-- Provider cards -->
      <div v-else class="provider-list">
        <div
          v-for="op in providers.providers"
          :key="op.id"
          class="provider-card"
          :class="{ 'provider-card--active': providers.selectedId === op.id }"
        >
          <!-- Provider row -->
          <div class="provider-card__head">
            <span class="provider-card__dot" :class="{ 'provider-card__dot--on': providers.selectedId === op.id }"></span>
            <div class="provider-card__info">
              <span class="provider-card__name">{{ op.name }}</span>
              <span class="provider-card__url">{{ op.discoveryUrl || op.issuer || '—' }}</span>
            </div>
            <div class="provider-card__actions">
              <button
                class="btn btn-sm"
                :class="providers.selectedId === op.id ? 'btn-success' : 'btn-outline-secondary'"
                title="Set as active provider"
                @click="providers.select(op.id)"
              >
                <i class="bi bi-check2-circle me-1"></i>{{ providers.selectedId === op.id ? 'Active' : 'Select' }}
              </button>
              <button class="btn btn-sm btn-outline-secondary" title="Edit provider" @click="openEditProvider(op.id)">
                <i class="bi bi-pencil"></i>
              </button>
            </div>
          </div>

          <!-- Clients section -->
          <div class="provider-card__clients">
            <div class="clients-bar">
              <span class="clients-bar__label">Clients</span>
              <button class="btn btn-sm btn-outline-secondary" @click="openNewClient(op.id)">
                <i class="bi bi-plus me-1"></i>Add
              </button>
            </div>

            <p v-if="op.clients.length === 0" class="clients-empty">No clients defined.</p>

            <table v-else class="clients-table">
              <thead>
                <tr>
                  <th>Client ID</th>
                  <th>Scopes</th>
                  <th>Grants</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="client in op.clients" :key="client.id">
                  <td class="client-id">
                    <i class="bi bi-key me-1 text-muted"></i>{{ client.clientId }}
                  </td>
                  <td class="client-scopes">{{ client.scopes || '—' }}</td>
                  <td class="client-grants">
                    <span v-for="g in client.grants" :key="g" class="badge bg-secondary me-1">{{ g }}</span>
                  </td>
                  <td class="client-action">
                    <button class="btn btn-sm btn-outline-secondary" title="Edit client" @click="openEditClient(op.id, client.id)">
                      <i class="bi bi-pencil"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <provider-modal ref="providerModal" />
    <client-modal ref="clientModal" />
  </page-template>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useProvidersStore } from '../components/stores/providers'
import PageTemplate from '../components/layout/PageTemplate.vue'
import ProviderModal from './ProviderModal.vue'
import ClientModal from './ClientModal.vue'

export default defineComponent({
  name: 'ConfigPage',
  components: { PageTemplate, ProviderModal, ClientModal },

  setup() {
    return { providers: useProvidersStore() }
  },

  methods: {
    openNewProvider() {
      (this.$refs.providerModal as InstanceType<typeof ProviderModal>).open()
    },
    openEditProvider(id: string) {
      (this.$refs.providerModal as InstanceType<typeof ProviderModal>).open(id)
    },
    openNewClient(providerId: string) {
      (this.$refs.clientModal as InstanceType<typeof ClientModal>).open(providerId)
    },
    openEditClient(providerId: string, clientId: string) {
      (this.$refs.clientModal as InstanceType<typeof ClientModal>).open(providerId, clientId)
    },
  },
})
</script>

<style scoped>
/* ── page shell ──────────────────────────────────────────────── */
.config-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

/* ── header ──────────────────────────────────────────────────── */
.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.config-header__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--c-text-primary);
  margin: 0;
}

/* ── empty state ─────────────────────────────────────────────── */
.config-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 1rem;
  color: var(--c-text-muted);
}

.config-empty__icon {
  font-size: 2.5rem;
  opacity: 0.35;
}

.config-empty__text {
  margin: 0;
  font-size: 0.9rem;
}

/* ── provider list ───────────────────────────────────────────── */
.provider-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── provider card ───────────────────────────────────────────── */
.provider-card {
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-bg-surface);
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.provider-card--active {
  border-color: var(--c-accent);
  box-shadow: 0 0 0 3px var(--c-accent-muted);
}

.provider-card__head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--c-border);
}

.provider-card__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--c-border-light);
  transition: background 0.15s, box-shadow 0.15s;
}

.provider-card__dot--on {
  background: var(--c-accent);
  box-shadow: 0 0 6px var(--c-accent);
}

.provider-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.provider-card__name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--c-text-primary);
}

.provider-card__url {
  font-size: 0.75rem;
  color: var(--c-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.provider-card__actions {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}

/* ── clients section ─────────────────────────────────────────── */
.provider-card__clients {
  padding: 0.75rem 1rem 0.9rem;
}

.clients-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.clients-bar__label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-text-muted);
}

.clients-empty {
  font-size: 0.8rem;
  color: var(--c-text-muted);
  margin: 0.25rem 0 0;
}

/* ── clients table ───────────────────────────────────────────── */
.clients-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.clients-table th {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--c-text-muted);
  padding: 0.3rem 0.5rem 0.3rem 0;
  border-bottom: 1px solid var(--c-border);
}

.clients-table td {
  padding: 0.4rem 0.5rem 0.4rem 0;
  border-bottom: 1px solid var(--c-border);
  color: var(--c-text-secondary);
  vertical-align: middle;
}

.clients-table tr:last-child td {
  border-bottom: none;
}

.client-id {
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--c-text-primary) !important;
  white-space: nowrap;
}

.client-scopes {
  color: var(--c-text-muted) !important;
  font-size: 0.75rem;
}

.client-action {
  width: 40px;
  text-align: right;
}
</style>
