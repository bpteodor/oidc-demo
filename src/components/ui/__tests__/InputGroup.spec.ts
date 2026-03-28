import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InputGroup from '../InputGroup.vue'

describe('InputGroup', () => {
  it('renders label text', () => {
    const wrapper = mount(InputGroup, { props: { label: 'My Label', modelValue: '' } })
    expect(wrapper.find('label').text()).toContain('My Label')
  })

  it('binds label for to input id', () => {
    const wrapper = mount(InputGroup, { props: { id: 'my-field', label: 'Label', modelValue: '' } })
    expect(wrapper.find('label').attributes('for')).toBe('my-field')
    expect(wrapper.find('input').attributes('id')).toBe('my-field')
  })

  it('shows required asterisk when required is set', () => {
    const wrapper = mount(InputGroup, { props: { label: 'Label', modelValue: '', required: true } })
    expect(wrapper.find('.text-danger').text()).toBe('*')
  })

  it('does not show asterisk without required', () => {
    const wrapper = mount(InputGroup, { props: { label: 'Label', modelValue: '' } })
    expect(wrapper.find('.text-danger').exists()).toBe(false)
  })

  it('shows invalid-feedback and is-invalid class when error is set', () => {
    const wrapper = mount(InputGroup, { props: { label: 'Label', modelValue: '', error: 'Required field' } })
    expect(wrapper.find('.invalid-feedback').text()).toBe('Required field')
    expect(wrapper.find('input').classes()).toContain('is-invalid')
  })

  it('does not show error elements without error prop', () => {
    const wrapper = mount(InputGroup, { props: { label: 'Label', modelValue: '' } })
    expect(wrapper.find('.invalid-feedback').exists()).toBe(false)
    expect(wrapper.find('input').classes()).not.toContain('is-invalid')
  })

  it('shows hint text when hint is set', () => {
    const wrapper = mount(InputGroup, { props: { label: 'Label', modelValue: '', hint: 'Helpful hint' } })
    expect(wrapper.find('.form-text').text()).toBe('Helpful hint')
  })

  it('does not show form-text without hint prop', () => {
    const wrapper = mount(InputGroup, { props: { label: 'Label', modelValue: '' } })
    expect(wrapper.find('.form-text').exists()).toBe(false)
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(InputGroup, { props: { label: 'Label', modelValue: '' } })
    await wrapper.find('input').setValue('hello')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello'])
  })

  it('sets the input value from modelValue prop', () => {
    const wrapper = mount(InputGroup, { props: { label: 'Label', modelValue: 'prefilled' } })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('prefilled')
  })

  it('disables input when disabled is set', () => {
    const wrapper = mount(InputGroup, { props: { label: 'Label', modelValue: '', disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('applies type prop to input', () => {
    const wrapper = mount(InputGroup, { props: { label: 'Label', modelValue: '', type: 'url' } })
    expect(wrapper.find('input').attributes('type')).toBe('url')
  })

  it('defaults input type to text', () => {
    const wrapper = mount(InputGroup, { props: { label: 'Label', modelValue: '' } })
    expect(wrapper.find('input').attributes('type')).toBe('text')
  })

  it('applies placeholder prop to input', () => {
    const wrapper = mount(InputGroup, { props: { label: 'Label', modelValue: '', placeholder: 'Enter value' } })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter value')
  })
})
