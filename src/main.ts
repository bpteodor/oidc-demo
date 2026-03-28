import {createApp} from 'vue'
import {createPinia} from 'pinia'
import axios from "axios"
import router from './components/routes'

import App from './App.vue'
import './assets/scss/application.scss'

declare global {
    interface Window {
        APP_CONFIG: any         // app config loaded externally
        tokenChecked: boolean   // true if the token was checked for validity
    }
}

axios.defaults.timeout = window.APP_CONFIG.axios.defaults.timout

// initialize app
export const app = createApp(App)
    .use(createPinia())
    .use(router)
    .mount('#app')


console.log(`fragment: ${window.location.hash}`)