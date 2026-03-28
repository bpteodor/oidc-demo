<template>
  <div class="d-flex h-100 align-items-center justify-content-center spinner-wrap">

    <div class="spinner-border text-primary" :class="$props.class" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>

  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'LoadingSpinner',
  props: {
    class: null,
  }
})
</script>