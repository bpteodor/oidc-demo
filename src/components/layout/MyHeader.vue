<template>
  <header id="header">
    <nav class="app-navbar">
      <div class="app-navbar__inner">

        <!-- Brand -->
        <a class="app-brand" href="/">
          <i class="bi bi-shield-fill app-brand__icon"></i>
          <span class="app-brand__name">OIDC Demo</span>
        </a>

        <!-- OP selector -->
        <div class="op-bar">
          <span class="op-bar__label">Provider</span>

          <div class="op-bar__select-wrap">
            <select
              class="op-bar__select"
              :value="providersStore.selectedId"
              @change="onSelectOP"
            >
              <option value="" disabled>— none —</option>
              <option v-for="op in providersStore.providers" :key="op.id" :value="op.id">{{ op.name }}</option>
            </select>
            <i class="bi bi-chevron-down op-bar__chevron"></i>
          </div>

          <button
            class="op-bar__btn op-bar__btn--icon"
            :disabled="!providersStore.selectedId"
            title="Edit provider"
            @click="editOP"
          >
            <i class="bi bi-pencil-square"></i>
          </button>

          <button class="op-bar__btn op-bar__btn--add" title="New provider" @click="addOP">
            <i class="bi bi-plus-lg"></i>
            <span>New</span>
          </button>
        </div>

        <!-- OP status badge -->
        <div class="op-status" :class="providersStore.selectedId ? 'op-status--connected' : 'op-status--none'">
          <span class="op-status__dot"></span>
          <span>{{ providersStore.selectedId ? (providersStore.providers.find(p => p.id === providersStore.selectedId)?.name ?? 'Connected') : 'No OP' }}</span>
        </div>

        <!-- Theme toggle -->
        <button class="op-bar__btn op-bar__btn--icon theme-toggle" :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleTheme">
          <i :class="theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars'"></i>
        </button>

        <!-- User area -->
        <div class="app-user" v-if="isUserLoggedIn">
          <div class="app-user__info">
            <i :class="['app-user__role-icon', roleIcon]" :title="role"></i>
            <span class="app-user__name" :title="username">{{ name }}</span>
          </div>
          <button class="op-bar__btn op-bar__btn--icon" title="Logout" @click="logout">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>

      </div>
    </nav>
  </header>
</template>

<script lang="ts">
import {userManager} from '../../services/oidc'
import {defineComponent} from "vue";
import {User} from "oidc-client-ts";
import {useProvidersStore} from '../stores/providers'
import {useTheme} from '../../composables/useTheme'

export default defineComponent({
  name: "MyHeader",
  components: {},

  setup() {
    const { theme, toggle } = useTheme()
    return {
      providersStore: useProvidersStore(),
      theme,
      toggleTheme: toggle,
    }
  },

  data: function () {
    return {
      isUserLoggedIn: false,
      name: '',
      username: '',
      roleIcon: '',
      role: '',
      ddcRole: '',
    }
  },
  methods: {
    onSelectOP(e: Event) {
      this.providersStore.select((e.target as HTMLSelectElement).value)
    },
    editOP() {
      this.$router.push(`/op/${this.providersStore.selectedId}`)
    },
    addOP() {
      this.$router.push('/op/new')
    },
    updateUserData: function (user: User | null) {
      if (user) {
        this.isUserLoggedIn = true
        this.ddcRole = user.profile.ddc_role ? user.profile.ddc_role as string : ''
        this.name = user.profile.given_name + " " + user.profile.family_name
        this.username = user.profile.email ? user.profile.email : ''
        this.roleIcon = user.profile.admin_roles === 'superAdmin' ? 'bi bi-person-plus' : 'bi bi-person'
        this.role = this.roleDisplayNames(user.profile.admin_roles)
      } else {
        console.warn("[StihlHeader] no user data")
      }
    },
    logout: function () {
      userManager.signoutRedirect()
      return false
    },
    roleDisplayNames: (role: string | unknown) => {
      switch (role) {
        case 'superAdmin':    return 'Super Admin'
        case 'orgSuperAdmin': return 'Support Admin'
        case 'userAdmin':     return 'User Admin'
      }
      return ''
    }
  },
  mounted() {
    userManager.getUser().then((u) => { this.updateUserData(u) })
    userManager.events.addUserLoaded(this.updateUserData)
  },
})
</script>

<style scoped>
/* ── shell ─────────────────────────────────────────────────────── */
.app-navbar {
  height: var(--hdr-height);
  background: var(--hdr-bg);
  border-bottom: 1px solid var(--hdr-border);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: background 0.2s, border-color 0.2s;
}

.app-navbar__inner {
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* ── brand ─────────────────────────────────────────────────────── */
.app-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  flex-shrink: 0;
}

.app-brand__icon {
  font-size: 1.15rem;
  color: var(--hdr-accent);
  filter: drop-shadow(0 0 6px var(--hdr-icon-glow));
}

.app-brand__name {
  color: var(--hdr-text);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: color 0.15s;
}

.app-brand:hover .app-brand__name {
  color: var(--hdr-accent);
}

/* ── OP bar ────────────────────────────────────────────────────── */
.op-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.op-bar__label {
  color: var(--hdr-muted);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.op-bar__select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.op-bar__select {
  appearance: none;
  background: var(--hdr-surface);
  border: 1px solid var(--hdr-border);
  color: var(--hdr-text);
  font-size: 0.875rem;
  height: 34px;
  padding: 0 2rem 0 0.75rem;
  border-radius: 6px;
  min-width: 200px;
  max-width: 320px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  outline: none;
}

.op-bar__select:hover,
.op-bar__select:focus {
  border-color: var(--hdr-accent);
  background: var(--hdr-surface-h);
}

.op-bar__select option {
  background: var(--hdr-surface);
  color: var(--hdr-text);
}

.op-bar__chevron {
  position: absolute;
  right: 0.5rem;
  color: var(--hdr-muted);
  font-size: 0.75rem;
  pointer-events: none;
}

/* ── shared button base ────────────────────────────────────────── */
.op-bar__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 34px;
  padding: 0 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--hdr-border);
  background: var(--hdr-surface);
  color: var(--hdr-text);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  white-space: nowrap;
}

.op-bar__btn:hover {
  background: var(--hdr-surface-h);
  border-color: var(--hdr-accent);
  color: var(--hdr-text);
}

.op-bar__btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}

/* icon-only variant */
.op-bar__btn--icon {
  padding: 0 0.6rem;
  width: 34px;
  justify-content: center;
}

/* add/new variant — accent fill */
.op-bar__btn--add {
  background: var(--hdr-accent);
  border-color: var(--hdr-accent);
  color: var(--hdr-btn-add-text);
  font-weight: 600;
}

.op-bar__btn--add:hover {
  background: var(--hdr-accent-h);
  border-color: var(--hdr-accent-h);
  color: var(--hdr-btn-add-text);
}

/* theme toggle — subtle highlight on hover */
.theme-toggle:hover {
  color: var(--hdr-accent);
  border-color: var(--hdr-accent);
}

/* ── user area ─────────────────────────────────────────────────── */
.app-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
  flex-shrink: 0;
}

.app-user__info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--hdr-text);
  font-size: 0.875rem;
}

.app-user__role-icon {
  color: var(--hdr-muted);
}

.app-user__name {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── OP status badge ────────────────────────────────────────────── */
.op-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 0.75rem;
  height: 30px;
  border-radius: 999px;
  border: 1px solid var(--hdr-border);
  background: var(--hdr-surface);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--hdr-muted);
  white-space: nowrap;
  flex-shrink: 0;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.op-status--connected {
  border-color: var(--hdr-connected-border);
  background: var(--hdr-connected-bg);
  color: var(--hdr-accent);
}

.op-status__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--hdr-muted);
  flex-shrink: 0;
  transition: background 0.15s, box-shadow 0.15s;
}

.op-status--connected .op-status__dot {
  background: var(--hdr-accent);
  box-shadow: var(--hdr-dot-shadow);
}
</style>
