<template>
  <div id="home-page" class="container-fluid container h-100">

    <ddc-error :title="$t('ddc.error.title')" :message="$t('ddc.error.generic')" v-if="!status"/>
    <ddc-error :title="$t('ddc.error.title403')" :message="$t('ddc.error.403')" v-if="status===403"/>

  </div>
</template>

<script lang="ts">
import DdcError from "../components/DdcError.vue";
import {defineComponent} from "vue";

export default defineComponent({
  name: "GenericError",
  components: {DdcError},
  props: {
    status: null,
  },
})
</script>