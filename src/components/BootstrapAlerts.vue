<template>
  <div :id="id"
       class="alert alert-dismissible fade show" :class="a.class ? a.class : 'alert-danger'"
       role="alert"
       v-for="(a,i) in alerts"
       :key="i"
  >
    {{ a.message }}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>
</template>


<script lang="ts">

import {defineComponent, PropType} from "vue";

export interface BootstrapAlert {
  class?: string;
  message: string
}

export default defineComponent({
  name: 'BootstrapAlerts',
  props: {
    id: String,
    alerts: Object as PropType<BootstrapAlert[]>,
  }
})
</script>