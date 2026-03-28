<template>
  <header id="header">
    <nav class="app-navbar">
      <div class="app-navbar__inner">

        <!-- Brand -->
        <a class="app-brand" href="/">
          <span class="app-brand__pill"></span>
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
import {userManager} from '../services/oidc'
import {defineComponent} from "vue";
import {User} from "oidc-client-ts";
import {useProvidersStore} from '../stores/providers'

export default defineComponent({
  name: "MyHeader",
  components: {},

  setup() {
    return {providersStore: useProvidersStore()}
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
/* ── tokens ────────────────────────────────────────────────────── */
:root {
  --hdr-bg:        #0f172a;
  --hdr-border:    #1e293b;
  --hdr-accent:    #e9640c;
  --hdr-text:      #e2e8f0;
  --hdr-muted:     #94a3b8;
  --hdr-surface:   #1e293b;
  --hdr-surface-h: #2d3f55;
  --hdr-height:    56px;
}

/* ── shell ─────────────────────────────────────────────────────── */
.app-navbar {
  height: var(--hdr-height);
  background: var(--hdr-bg);
  border-bottom: 1px solid var(--hdr-border);
  position: sticky;
  top: 0;
  z-index: 1000;
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

.app-brand__pill {
  width: 8px;
  height: 28px;
  background: var(--hdr-accent);
  border-radius: 4px;
}

.app-brand__name {
  color: var(--hdr-text);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
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
  background: #1e293b;
  color: #e2e8f0;
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
  color: #fff;
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
  color: #fff;
}

.op-bar__btn--add:hover {
  background: #c8530a;
  border-color: #c8530a;
  color: #fff;
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
</style>
