<template>
  <div class="card">
    <div v-if="title || $slots.header" class="card-header" :class="headerClass">
      <slot name="header">{{ title }}</slot>
    </div>
    <div class="card-body" :class="bodyClass">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppCard',
  props: {
    title: String,
    headerClass: String,
    bodyClass: String,
  },
})
</script>
