import {createApp} from 'vue'
import {createPinia} from 'pinia'
import router from './components/routes'

import App from './App.vue'
import './assets/scss/application.scss'

declare global {
    interface Window {
        APP_CONFIG: any         // app config loaded externally
        tokenChecked: boolean   // true if the token was checked for validity
    }
}

// initialize app
export const app = createApp(App)
    .use(createPinia())
    .use(router)
    .mount('#app')


console.log(`fragment: ${window.location.hash}`)