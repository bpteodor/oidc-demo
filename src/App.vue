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

export default {
  name: "App",
  components: {MyHeader, MyFooter},
  computed: {
    isNotInIframe: function () {
      return window.self === window.top
    },
  },
};
</script>

