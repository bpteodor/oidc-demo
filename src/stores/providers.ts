import {defineStore} from 'pinia'

export interface OPRecord {
    id: string
    name: string
    discoveryUrl: string
    issuer: string
    authorizationEndpoint: string
    tokenEndpoint: string
    userinfoEndpoint: string
    jwksUri: string
    endSessionEndpoint: string
    introspectionEndpoint: string
    scopesSupported: string
}

const STORAGE_KEY = 'oidc_demo_providers'

export const useProvidersStore = defineStore('providers', {
    state: () => ({
        providers: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as OPRecord[],
        selectedId: localStorage.getItem(STORAGE_KEY + '_selected') || '',
    }),

    getters: {
        getById: (state) => (id: string) => state.providers.find(p => p.id === id),
        selected: (state) => state.providers.find(p => p.id === state.selectedId) ?? null,
    },

    actions: {
        select(id: string) {
            this.selectedId = id
            localStorage.setItem(STORAGE_KEY + '_selected', id)
        },

        _persist() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.providers))
        },

        save(record: Omit<OPRecord, 'id'> & { id?: string }) {
            if (!record.id) {
                const newRecord = {...record, id: Date.now().toString()}
                this.providers.push(newRecord)
                this.select(newRecord.id)
            } else {
                const idx = this.providers.findIndex(p => p.id === record.id)
                if (idx >= 0) {
                    this.providers[idx] = record as OPRecord
                }
            }
            this._persist()
        },

        remove(id: string) {
            this.providers = this.providers.filter(p => p.id !== id)
            if (this.selectedId === id) {
                this.select(this.providers[0]?.id ?? '')
            }
            this._persist()
        },
    },
})
