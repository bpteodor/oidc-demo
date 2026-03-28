<template>
  <div class="modal fade" ref="el" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isNew ? 'New Client' : 'Edit Client' }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          <input-group id="cm-clientid" v-model="form.clientId" label="Client ID" required placeholder="my-client" :error="errors.clientId" />
          <input-group id="cm-secret" v-model="form.clientSecret" label="Client Secret" placeholder="(optional)" autocomplete="off" />
          <input-group id="cm-scopes" v-model="form.scopes" label="Scopes" placeholder="openid profile email" hint="Space-separated list of scopes." />

          <div class="mb-3">
            <label class="form-label">Grant Types</label>
            <div class="d-flex flex-wrap gap-3">
              <div v-for="g in GRANT_TYPES" :key="g.value" class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="`cm-grant-${g.value}`"
                  :value="g.value"
                  v-model="form.grants"
                />
                <label class="form-check-label" :for="`cm-grant-${g.value}`">{{ g.label }}</label>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button v-if="!isNew" class="btn btn-danger me-auto" type="button" @click="remove">Delete</button>
          <button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancel</button>
          <button class="btn btn-primary" type="button" @click="save">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Modal } from 'bootstrap'
import { useProvidersStore } from '../components/stores/providers'
import InputGroup from '../components/ui/InputGroup.vue'

interface ClientForm {
  clientId: string
  clientSecret: string
  scopes: string
  grants: string[]
}

const GRANT_TYPES = [
  { value: 'code', label: 'Authorization Code' },
  { value: 'implicit', label: 'Implicit' },
  { value: 'client_credentials', label: 'Client Credentials' },
  { value: 'password', label: 'Resource Owner Password' },
]

export default defineComponent({
  name: 'ClientModal',
  components: { InputGroup },
  emits: ['saved', 'deleted'],

  setup() {
    return { providers: useProvidersStore(), GRANT_TYPES }
  },

  data() {
    return {
      bsModal: null as Modal | null,
      providerId: '',
      editId: null as string | null,
      form: { clientId: '', clientSecret: '', scopes: '', grants: [] } as ClientForm,
      errors: {} as Partial<Record<keyof ClientForm, string>>,
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
    open(providerId: string, clientId?: string) {
      this.providerId = providerId
      this.editId = clientId ?? null
      this.errors = {}
      this.form = { clientId: '', clientSecret: '', scopes: '', grants: [] }
      if (clientId) {
        const provider = this.providers.getById(providerId)
        const client = provider?.clients.find(c => c.id === clientId)
        if (client) {
          this.form = {
            clientId: client.clientId,
            clientSecret: client.clientSecret,
            scopes: client.scopes,
            grants: [...client.grants],
          }
        }
      }
      this.bsModal?.show()
    },

    validate(): boolean {
      this.errors = {}
      if (!this.form.clientId.trim()) this.errors.clientId = 'Client ID is required.'
      return Object.keys(this.errors).length === 0
    },

    save() {
      if (!this.validate()) return
      this.providers.saveClient(this.providerId, {
        ...(this.isNew ? {} : {id: this.editId as string}),
        ...this.form,
      })
      this.bsModal?.hide()
      this.$emit('saved')
    },

    remove() {
      if (!this.isNew && this.editId) {
        this.providers.removeClient(this.providerId, this.editId)
        this.bsModal?.hide()
        this.$emit('deleted')
      }
    },
  },
})
</script>
