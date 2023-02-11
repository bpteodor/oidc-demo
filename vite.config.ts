import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    base: "/auth/demo/",
    plugins: [vue()],
    server: {
        // https://vitejs.dev/config/#server-proxy
        /*proxy: {
            '^/ddc/svc/.*|/ddc/login|/ddc/logout': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                //rewrite: (path) => path.replace(/^\/api/, '')
            },
            '^/auth': {
                target: 'https://stihl.dev-servicelayers.io',
                ws: true,
                changeOrigin: true,
            },
        }*/
    },
    css: {
        preprocessorOptions: {
            scss: {
                // deactivates warning
                charset: false
            }
        }
    },
})
