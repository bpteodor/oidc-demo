<template>
  <page-template>
    <div id="error-page" class="container container-md page">
      <h1 class="title text-danger">Error</h1>
      <p>There was an error</p>
    </div>
  </page-template>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import PageTemplate from '../components/layout/PageTemplate.vue'

//TODO

export default defineComponent({
  name: "ErrorPage",
  components: { PageTemplate },
  props: {
    status: null,
  },
})
</script>
