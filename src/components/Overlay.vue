<template>
  <div class="position-relative h-100 stihl-overlay-wrap">

    <slot></slot>

    <div class="position-absolute overlay stihl-overlay" v-if="active">
      <spinner v-if="spinner" :class="spinnerClass"/>
    </div>

  </div>
</template>

<script lang="ts">
import Spinner from "./Spinner.vue";
import {defineComponent} from "vue";

export default defineComponent({
  name: 'StihlOverlay',
  components: {Spinner},
  props: {
    active: {type: Boolean, default: true},
    spinner: Boolean,
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