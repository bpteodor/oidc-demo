import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '../LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('renders a spinner-border element', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.find('.spinner-border').exists()).toBe(true)
  })

  it('renders visually-hidden loading text for accessibility', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.find('.visually-hidden').text()).toBe('Loading...')
  })

  it('applies class prop to the spinner element', () => {
    const wrapper = mount(LoadingSpinner, { props: { class: 'spinner-border-sm' } })
    expect(wrapper.find('.spinner-border').classes()).toContain('spinner-border-sm')
  })

  it('renders inside a centering flex wrapper', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.find('.spinner-wrap').exists()).toBe(true)
  })
})
