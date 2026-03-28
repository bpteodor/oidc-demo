<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { onMounted } from 'vue'
import { useTheme } from './composables/useTheme'
import { useProvidersStore } from './components/stores/providers'

export default {
  name: "App",

  setup() {
    // Initialise theme (sets data-theme on <html> via watchEffect)
    useTheme()

    const providers = useProvidersStore()
    onMounted(() => { providers.resolveAll() })
  },
};
</script>
