<template>
  <div>
    <span :id="id"
          :class="$props.readClass"
          v-if="readonly"
    >{{ modelValue }}</span>

    <input :id="id"
           :name="name"
           :class="$props.editClass"
           :value="modelValue"
           :required="required"
           :type="type"
           @input="updateValue($event)"
           :placeholder="placeholder"
           :autocomplete="autocomplete"
           :autofocus="autofocus"
           v-else/>

    <div class="error text-danger"
         v-for="(error,i) in validationErrors"
         :key="i">
      <div>{{ (error as any).$message }}</div>
    </div>

  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "EditableText",
  emits: ['update:modelValue'],
  props: {
    id: String,
    name: String,
    modelValue: String,
    readonly: {type: Boolean, default: true},
    readClass: {type: String, default: ''},
    editClass: {type: String, default: 'form-input'},
    required: {type: Boolean, default: false},
    type: {type: String, default: 'text'},
    label: String,
    placeholder: String,
    validation: Object,
    autocomplete: String,
    appendIcon: {type: String, default: null},
    autofocus: {type: Boolean, default: false},
    validationErrors: Array,
  },
  methods: {
    updateValue(e: Event) {
      this.$emit('update:modelValue', (<HTMLInputElement>e.target).value)
    }
  }
});
</script>

<style scoped>
.error {
  font-size: 0.9rem;
}
</style>
