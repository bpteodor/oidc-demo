<template>
  <div class="page-template">
    <my-header v-if="isNotInIframe" />

    <div class="page-body">
      <aside v-if="isNotInIframe" class="page-sidebar">
        <slot name="sidebar-top" />

        <nav class="sidebar-nav">
          <router-link v-for="item in menuItems" :key="item.label" :to="item.path" class="sidebar-nav__item"
            :class="{ 'sidebar-nav__item--active': isActive(item) }">
            <i v-if="item.icon" :class="['sidebar-nav__icon', item.icon]" />
            <span class="sidebar-nav__label">{{ item.label }}</span>
          </router-link>
        </nav>

        <div v-if="$slots['sidebar-bottom']" class="sidebar-bottom">
          <slot name="sidebar-bottom" />
        </div>
      </aside>

      <main class="page-main">
        <slot />
      </main>
    </div>

    <my-footer v-if="isNotInIframe" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import MyHeader from './MyHeader.vue'
import MyFooter from './MyFooter.vue'

export interface MenuItem {
  label: string
  path: string
  icon?: string
  /** Use true for exact path matching (e.g. root "/"). Defaults to prefix match. */
  exact?: boolean
}

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { label: 'Configuration', path: '/config', icon: 'bi bi-grid-3x3-gap', exact: true },
  { label: 'Auth Code Flow', path: '/authorization-code', icon: 'bi bi-lock', exact: true },
  { label: 'Client Credentials', path: '/client-credentials', icon: 'bi bi-key', exact: true },
  { label: 'UserInfo', path: '/user-info', icon: 'bi bi-person-badge', exact: true },
  { label: 'Introspection', path: '/token-info', icon: 'bi bi-search', exact: true },
]

export default defineComponent({
  name: 'PageTemplate',
  components: { MyHeader, MyFooter },

  props: {
    menuItems: {
      type: Array as PropType<MenuItem[]>,
      default: () => DEFAULT_MENU_ITEMS,
    },
  },

  computed: {
    isNotInIframe(): boolean {
      return window.self === window.top
    },
  },

  methods: {
    isActive(item: MenuItem): boolean {
      const current = this.$route.path
      if (item.exact) return current === item.path
      return current === item.path || current.startsWith(item.path + '/')
    },
  },
})
</script>

<style scoped>
/* ── layout shell ─────────────────────────────────────────────── */
.page-template {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-body {
  display: flex;
  flex: 1;
}

/* ── sidebar ──────────────────────────────────────────────────── */
.page-sidebar {
  width: 256px;
  flex-shrink: 0;
  background: var(--c-bg-sidebar);
  border-right: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: var(--hdr-height);
  height: calc(100vh - var(--hdr-height));
  overflow-y: auto;
}

/* ── sidebar nav ──────────────────────────────────────────────── */
.sidebar-nav {
  padding: 32px 24px;
  flex: 1;
}

.sidebar-nav__item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 1.25rem;
  color: var(--c-text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-right: 4px solid transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.sidebar-nav__item:hover {
  background: var(--c-accent-muted);
  color: var(--c-text-primary);
}

.sidebar-nav__item--active {
  color: var(--c-accent);
  border-right-color: var(--c-accent);
  background: var(--c-accent-muted);
  font-weight: 600;
}

.sidebar-nav__icon {
  font-size: 1rem;
  flex-shrink: 0;
  width: 1.1rem;
  text-align: center;
}

/* ── sidebar bottom ───────────────────────────────────────────── */
.sidebar-bottom {
  border-top: 1px solid var(--c-border);
  padding: 0.5rem 0;
}

/* ── main content ─────────────────────────────────────────────── */
.page-main {
  flex: 1;
  min-width: 0;
}
</style>
