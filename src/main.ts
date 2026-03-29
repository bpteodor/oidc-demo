import {createApp} from 'vue'
import {createPinia} from 'pinia'
import router from './components/routes'

import App from './App.vue'
import './assets/scss/application.scss'

// declare configuration
declare global {
    interface ClientConfig{
        client_id: string,
        client_secret?: string,
        scopes?: string,
        grants?: string[], // todo define allowed grant types
        auth_method?: 'client_secret_basic'|'client_secret_post'|'none' // todo add more methods?
    }
    interface IdPConfig {
        name: string,
        discovery: string,
        clients: ClientConfig[],
    }
    interface Window {
        CONFIG: IdPConfig[]
    }
}

// initialize app
export const app = createApp(App)
    .use(createPinia())
    .use(router)
    .mount('#app')


console.log(`fragment: ${window.location.hash}`)