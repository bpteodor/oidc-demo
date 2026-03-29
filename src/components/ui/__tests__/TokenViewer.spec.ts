import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TokenViewer from '../TokenViewer.vue'

// ── JWT helpers ───────────────────────────────────────────────────────────────

function toBase64Url(obj: object): string {
  return btoa(JSON.stringify(obj))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

const HEADER_B64 = toBase64Url({ alg: 'HS256', typ: 'JWT' })

function makeJwt(payload: object): string {
  return `${HEADER_B64}.${toBase64Url(payload)}.fakesignature`
}

const JWT_FUTURE  = makeJwt({ sub: 'user1', exp: 9_999_999_999 })
const JWT_EXPIRED = makeJwt({ sub: 'user1', exp: 1 })
const JWT_NO_EXP  = makeJwt({ sub: 'user1' })
const OPAQUE      = 'some-opaque-token-string'

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('TokenViewer', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders the label', () => {
    const wrapper = mount(TokenViewer, { props: { label: 'Access Token', token: OPAQUE } })
    expect(wrapper.find('.token-viewer__label').text()).toBe('Access Token')
  })

  it('shows raw token by default', () => {
    const wrapper = mount(TokenViewer, { props: { label: 'Token', token: JWT_FUTURE } })
    expect(wrapper.find('pre.token-raw').exists()).toBe(true)
    expect(wrapper.find('pre.token-raw').text()).toBe(JWT_FUTURE)
  })

  it('shows Decode button initially', () => {
    const wrapper = mount(TokenViewer, { props: { label: 'Token', token: JWT_FUTURE } })
    const buttonTexts = wrapper.findAll('button').map(b => b.text())
    expect(buttonTexts.some(t => t.includes('Decode'))).toBe(true)
    expect(buttonTexts.some(t => t.includes('Raw'))).toBe(false)
  })

  it('switches to decoded view when Decode is clicked', async () => {
    const wrapper = mount(TokenViewer, { props: { label: 'Token', token: JWT_FUTURE } })
    await wrapper.findAll('button').find(b => b.text().includes('Decode'))!.trigger('click')
    expect(wrapper.find('pre.token-raw').exists()).toBe(false)
    expect(wrapper.find('.token-section').exists()).toBe(true)
  })

  it('shows Header, Payload and Signature sections for a valid JWT', async () => {
    const wrapper = mount(TokenViewer, { props: { label: 'Token', token: JWT_FUTURE } })
    await wrapper.findAll('button').find(b => b.text().includes('Decode'))!.trigger('click')
    const titles = wrapper.findAll('.token-section__title').map(el => el.text())
    expect(titles).toContain('Header')
    expect(titles).toContain('Payload')
    expect(titles).toContain('Signature')
  })

  it('shows "Not a JWT" message for an opaque token in decoded view', async () => {
    const wrapper = mount(TokenViewer, { props: { label: 'Token', token: OPAQUE } })
    await wrapper.findAll('button').find(b => b.text().includes('Decode'))!.trigger('click')
    expect(wrapper.find('.token-not-jwt').exists()).toBe(true)
  })

  it('shows valid expiry info for a non-expired JWT', async () => {
    const wrapper = mount(TokenViewer, { props: { label: 'Token', token: JWT_FUTURE } })
    await wrapper.findAll('button').find(b => b.text().includes('Decode'))!.trigger('click')
    const expiry = wrapper.find('.token-expiry')
    expect(expiry.exists()).toBe(true)
    expect(expiry.classes()).not.toContain('token-expiry--expired')
    expect(expiry.text()).toContain('Expires in')
  })

  it('shows expired info for an expired JWT', async () => {
    const wrapper = mount(TokenViewer, { props: { label: 'Token', token: JWT_EXPIRED } })
    await wrapper.findAll('button').find(b => b.text().includes('Decode'))!.trigger('click')
    const expiry = wrapper.find('.token-expiry')
    expect(expiry.exists()).toBe(true)
    expect(expiry.classes()).toContain('token-expiry--expired')
    expect(expiry.text()).toContain('Expired')
  })

  it('shows no expiry info for JWT without exp claim', async () => {
    const wrapper = mount(TokenViewer, { props: { label: 'Token', token: JWT_NO_EXP } })
    await wrapper.findAll('button').find(b => b.text().includes('Decode'))!.trigger('click')
    expect(wrapper.find('.token-expiry').exists()).toBe(false)
  })

  it('switches back to raw view when Raw is clicked', async () => {
    const wrapper = mount(TokenViewer, { props: { label: 'Token', token: JWT_FUTURE } })
    await wrapper.findAll('button').find(b => b.text().includes('Decode'))!.trigger('click')
    await wrapper.findAll('button').find(b => b.text().includes('Raw'))!.trigger('click')
    expect(wrapper.find('pre.token-raw').exists()).toBe(true)
  })

  it('calls clipboard.writeText with the token on copy', async () => {
    const wrapper = mount(TokenViewer, { props: { label: 'Token', token: JWT_FUTURE } })
    await wrapper.find('button[title="Copy token"]').trigger('click')
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(JWT_FUTURE)
  })
})
