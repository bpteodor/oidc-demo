<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { useTheme } from './composables/useTheme'

export default {
  name: "App",

  setup() {
    // Initialise theme (sets data-theme on <html> via watchEffect)
    useTheme()
  },
};
</script>
