import { ref, watchEffect } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'oidc-demo-theme'

const theme = ref<Theme>(
  (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'dark'
)

// Keep <html data-theme="…"> in sync whenever theme changes
watchEffect(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem(STORAGE_KEY, theme.value)
})

export function useTheme() {
  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }
  return { theme, toggle }
}
