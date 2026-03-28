<template>
  <div class="mb-3">
    <label v-if="label" :for="id" class="form-label">
      {{ label }} <span v-if="required" class="text-danger">*</span>
    </label>
    <input
      :id="id"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      class="form-control"
      :class="{ 'is-invalid': error }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <div v-if="error" class="invalid-feedback">{{ error }}</div>
    <div v-if="hint" class="form-text">{{ hint }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'InputGroup',
  props: {
    id: String,
    label: String,
    modelValue: { type: String, default: '' },
    type: { type: String, default: 'text' },
    placeholder: String,
    required: Boolean,
    disabled: Boolean,
    error: String,
    hint: String,
    autocomplete: String,
  },
  emits: ['update:modelValue'],
})
</script>
