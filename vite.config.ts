import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    base: "/demo/",
    plugins: [vue()],
    server: {
        port: 3000,
        // https://vitejs.dev/config/#server-proxy
        /*proxy: {
            '^/auth': {
                target: 'https://openid.local:9000',
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
    test: {
        environment: 'jsdom',
    },
})
