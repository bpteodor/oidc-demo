<template>
  <header id="header">
    <nav class="app-navbar">
      <div class="app-navbar__inner">

        <!-- Brand -->
        <a class="app-brand" href="/">
          <img src="/favicon-32x32.png" height="32px"/>
          <span class="app-brand__name">OIDC Demo</span>
        </a>

        <!-- OP status badge -->
        <div class="op-status" :class="providersStore.selectedId ? 'op-status--connected' : 'op-status--none'">
          <span class="op-status__dot"></span>
          <span>{{ providersStore.selectedId ? (providersStore.providers.find(p => p.id === providersStore.selectedId)?.name ?? 'Connected') : 'No OP' }}</span>
        </div>

        <!-- Theme toggle -->
        <button class="theme-toggle" :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleTheme">
          <i :class="theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars'"></i>
        </button>

        <!-- User area -->
        <div class="app-user" v-if="isUserLoggedIn">
          <div class="app-user__info">
            <i :class="['app-user__role-icon', roleIcon]" :title="role"></i>
            <span class="app-user__name" :title="username">{{ name }}</span>
          </div>
          <button class="logout-btn" title="Logout" @click="logout">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>

      </div>
    </nav>
  </header>
</template>

<script lang="ts">
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
      //userManager.signoutRedirect()
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
    //userManager.getUser().then((u) => { this.updateUserData(u) })
    //userManager.events.addUserLoaded(this.updateUserData)
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
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: color 0.15s;
}

.app-brand:hover .app-brand__name {
  color: var(--hdr-accent);
}

/* ── theme toggle ──────────────────────────────────────────────── */
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 6px;
  border: 1px solid var(--hdr-border);
  background: var(--hdr-surface);
  color: var(--hdr-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.theme-toggle:hover {
  color: var(--hdr-accent);
  border-color: var(--hdr-accent);
  background: var(--hdr-surface-h);
}

/* ── logout button ─────────────────────────────────────────────── */
.logout-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 6px;
  border: 1px solid var(--hdr-border);
  background: var(--hdr-surface);
  color: var(--hdr-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.logout-btn:hover {
  background: var(--hdr-surface-h);
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
