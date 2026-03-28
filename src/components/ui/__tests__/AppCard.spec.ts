import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppCard from '../AppCard.vue'

describe('AppCard', () => {
  it('has the card class on the root element', () => {
    const wrapper = mount(AppCard)
    expect(wrapper.find('.card').exists()).toBe(true)
  })

  it('renders title prop in card-header', () => {
    const wrapper = mount(AppCard, { props: { title: 'My Title' } })
    expect(wrapper.find('.card-header').text()).toBe('My Title')
  })

  it('renders header slot content', () => {
    const wrapper = mount(AppCard, {
      slots: { header: 'Slot Header <button>Action</button>' },
    })
    expect(wrapper.find('.card-header').text()).toContain('Slot Header')
    expect(wrapper.find('.card-header button').exists()).toBe(true)
  })

  it('header slot takes precedence over title prop', () => {
    const wrapper = mount(AppCard, {
      props: { title: 'Prop Title' },
      slots: { header: 'Slot Title' },
    })
    expect(wrapper.find('.card-header').text()).toBe('Slot Title')
  })

  it('does not render card-header when no title and no header slot', () => {
    const wrapper = mount(AppCard)
    expect(wrapper.find('.card-header').exists()).toBe(false)
  })

  it('renders default slot inside card-body', () => {
    const wrapper = mount(AppCard, {
      props: { title: 'T' },
      slots: { default: '<p class="body-content">Body</p>' },
    })
    expect(wrapper.find('.card-body .body-content').text()).toBe('Body')
  })

  it('applies bodyClass to card-body', () => {
    const wrapper = mount(AppCard, { props: { title: 'T', bodyClass: 'p-0' } })
    expect(wrapper.find('.card-body').classes()).toContain('p-0')
  })

  it('applies headerClass to card-header', () => {
    const wrapper = mount(AppCard, {
      props: { title: 'T', headerClass: 'd-flex align-items-center' },
    })
    const header = wrapper.find('.card-header')
    expect(header.classes()).toContain('d-flex')
    expect(header.classes()).toContain('align-items-center')
  })
})
