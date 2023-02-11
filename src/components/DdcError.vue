<template>
  <div :id="id" class="container d-flex align-content-center h-100">
    <div class="row align-self-center">
      <h2 id="title">{{ title }}</h2>
      <h5 v-if="summary">{{ summary }}</h5>
      <p v-if="message">{{ message }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'DdcError',
  props: {
    id: String,
    title: String,
    summary: String,
    message: String,
  }
})
</script>