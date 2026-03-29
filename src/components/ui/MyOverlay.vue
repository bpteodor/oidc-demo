<template>
  <div class="position-relative h-100 my-overlay-wrap" :class="wrapClass">

    <slot></slot>

    <div class="position-absolute overlay my-overlay" v-if="active">
      <loading-spinner v-if="showSpinner" :class="spinnerClass"/>
    </div>

  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue"
import LoadingSpinner from "./LoadingSpinner.vue";

export default defineComponent({
  name: 'MyOverlay',
  components: {LoadingSpinner},
  props: {
    active: {type: Boolean, default: true},
    showSpinner: {type: Boolean, default: true},
    wrapClass: null,
    spinnerClass: null,
  }
})
</script>

<style scoped>
.overlay {
  inset: 0;
  z-index: 10;
  opacity: 0.85;
}
</style>