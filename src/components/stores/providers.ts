import {defineStore} from 'pinia'

export interface ClientRecord {
    id: string
    clientId: string
    clientSecret: string
    scopes: string
    grants: string[]
}

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
    clients: ClientRecord[]
}

const STORAGE_KEY = 'oidc_providers'

function loadInitialProviders(): OPRecord[] {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
        try { return JSON.parse(stored) } catch { /* fall through */ }
    }
    return (window.CONFIG || []).map((c, i) => ({
        id: `preset_${i}`,
        name: c.name || '',
        discoveryUrl: c.discovery || '',
        issuer: '',
        authorizationEndpoint: '',
        tokenEndpoint: '',
        userinfoEndpoint: '',
        jwksUri: '',
        endSessionEndpoint: '',
        introspectionEndpoint: '',
        scopesSupported: '',
        clients: (c.clients || []).map((cl, j) => ({
            id: `preset_${i}_${j}`,
            clientId: cl.client_id || '',
            clientSecret: cl.client_secret || '',
            scopes: cl.scopes || '',
            grants: cl.grants || [],
        })),
    }))
}

export const useProvidersStore = defineStore('providers', {
    state: () => {
        const providers = loadInitialProviders()
        const storedId = localStorage.getItem(STORAGE_KEY + '_selected') || ''
        const selectedId = providers.find(p => p.id === storedId)
            ? storedId
            : (providers[0]?.id ?? '')
        return { providers, selectedId }
    },

    getters: {
        getById: (state) => (id: string) => state.providers.find(p => p.id === id),
        selected: (state) => state.providers.find(p => p.id === state.selectedId) ?? null,
    },

    actions: {
        select(id: string) {
            this.selectedId = id
            localStorage.setItem(STORAGE_KEY + '_selected', id)
            this.resolveDiscovery(id)
        },

        _persist() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.providers))
        },

        save(record: Omit<OPRecord, 'id' | 'clients'> & { id?: string }) {
            if (!record.id) {
                const newRecord: OPRecord = {...record, id: Date.now().toString(), clients: []}
                this.providers.push(newRecord)
                this.select(newRecord.id)
            } else {
                const idx = this.providers.findIndex(p => p.id === record.id)
                if (idx >= 0) {
                    this.providers[idx] = {...this.providers[idx], ...record} as OPRecord
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

        async resolveDiscovery(id: string) {
            const provider = this.providers.find(p => p.id === id)
            if (!provider?.discoveryUrl || provider.issuer) return
            try {
                const res = await fetch(provider.discoveryUrl)
                if (!res.ok) return
                const d = await res.json()
                const idx = this.providers.findIndex(p => p.id === id)
                if (idx < 0) return
                this.providers[idx] = {
                    ...this.providers[idx],
                    issuer: d.issuer || '',
                    authorizationEndpoint: d.authorization_endpoint || '',
                    tokenEndpoint: d.token_endpoint || '',
                    userinfoEndpoint: d.userinfo_endpoint || '',
                    jwksUri: d.jwks_uri || '',
                    endSessionEndpoint: d.end_session_endpoint || '',
                    introspectionEndpoint: d.introspection_endpoint || '',
                    scopesSupported: Array.isArray(d.scopes_supported)
                        ? d.scopes_supported.join(' ')
                        : (d.scopes_supported || ''),
                }
                this._persist()
            } catch { /* ignore network errors */ }
        },

        async resolveAll() {
            const pending = this.providers
                .filter(p => p.discoveryUrl && !p.issuer)
                .map(p => p.id)
            await Promise.all(pending.map(id => this.resolveDiscovery(id)))
        },

        saveClient(providerId: string, client: Omit<ClientRecord, 'id'> & { id?: string }) {
            const provider = this.providers.find(p => p.id === providerId)
            if (!provider) return
            if (!client.id) {
                provider.clients.push({...client, id: Date.now().toString()})
            } else {
                const idx = provider.clients.findIndex(c => c.id === client.id)
                if (idx >= 0) provider.clients[idx] = client as ClientRecord
            }
            this._persist()
        },

        removeClient(providerId: string, clientId: string) {
            const provider = this.providers.find(p => p.id === providerId)
            if (!provider) return
            provider.clients = provider.clients.filter(c => c.id !== clientId)
            this._persist()
        },
    },
})
