<template>
  <div id="home-page" class="container-fluid container h-100">

    <h1 class="title text-danger">Error</h1>

    <p>There was an error</p>

  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

//TODO

export default defineComponent({
  name: "ErrorPage",
  props: {
    status: null,
  },
})
</script>