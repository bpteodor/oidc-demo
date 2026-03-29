import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyOverlay from '../MyOverlay.vue'

describe('MyOverlay', () => {
  it('renders slot content', () => {
    const wrapper = mount(MyOverlay, { slots: { default: '<p class="inner">Content</p>' } })
    expect(wrapper.find('.inner').text()).toBe('Content')
  })

  it('shows overlay div when active is true (default)', () => {
    const wrapper = mount(MyOverlay)
    expect(wrapper.find('.my-overlay').exists()).toBe(true)
  })

  it('hides overlay div when active is false', () => {
    const wrapper = mount(MyOverlay, { props: { active: false } })
    expect(wrapper.find('.my-overlay').exists()).toBe(false)
  })

  it('shows LoadingSpinner by default when active', () => {
    const wrapper = mount(MyOverlay)
    expect(wrapper.findComponent({ name: 'LoadingSpinner' }).exists()).toBe(true)
  })

  it('hides LoadingSpinner when showSpinner is false', () => {
    const wrapper = mount(MyOverlay, { props: { showSpinner: false } })
    expect(wrapper.findComponent({ name: 'LoadingSpinner' }).exists()).toBe(false)
  })

  it('applies wrapClass to the root wrapper element', () => {
    const wrapper = mount(MyOverlay, { props: { wrapClass: 'custom-class' } })
    expect(wrapper.find('.my-overlay-wrap').classes()).toContain('custom-class')
  })
})
