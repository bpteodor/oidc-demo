<template>
  <div id="app">

    <div class="page-wrapper">
      <my-header v-show="isNotInIframe" ref="header"></my-header>

      <router-view></router-view>
    </div>

    <my-footer v-show="isNotInIframe"></my-footer>

  </div>
</template>

<script lang="ts">
import MyHeader from "./components/MyHeader.vue"
import MyFooter from "./components/MyFooter.vue"
import { useTheme } from './composables/useTheme'

export default {
  name: "App",
  components: {MyHeader, MyFooter},

  setup() {
    // Initialise theme (sets data-theme on <html> via watchEffect)
    useTheme()
  },

  computed: {
    isNotInIframe: function () {
      return window.self === window.top
    },
  },
};
</script>
