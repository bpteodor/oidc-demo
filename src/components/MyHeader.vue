<template>
  <header id="header">

    <nav class="navbar navbar-expand-lg">
      <div class="container">

        <a class="navbar-brand">
          <img id="logo" src="../assets/img/logo.svg" alt="logo">
        </a>


        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent"
                aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation"
                v-if="isUserLoggedIn">
          <i class="navbar-toggler-icon"></i>
        </button>

        <div id="navbarContent" class="collapse navbar-collapse justify-content-end" v-if="isUserLoggedIn">
          <ul class="navbar-nav ml-auto">

            <li class="nav-item ml-auto">
              <div id="logged-user" class="nav-text">
                <i :class="roleIcon" :title="role"></i> <span :title="username">{{ name }}</span>
              </div>
            </li>
            <li class="nav-item ml-auto" v-if="ddcRole">
              <button id="settings-link" type="button" class="btn nav-link" role="button"
                      data-bs-toggle="offcanvas" data-bs-target="#ocSettings">
                <i class="bi bi-gear"></i> {{ $t('ddc.button.settings') }}
              </button>
            </li>
            <li class="nav-item ml-auto">
              <button id="logout-link" type="submit" class="btn nav-link" @click="logout">
                <i class="bi bi-box-arrow-right"></i> {{ $t('ddc.button.logout') }}
              </button>
            </li>

          </ul>
        </div>

      </div>
    </nav>

  </header>
</template>

<script lang="ts">
import {userManager} from '../services/oidc'
import {defineComponent} from "vue";
import {User} from "oidc-client-ts";

export default defineComponent({
  name: "MyHeader",
  components: {},
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
      //console.debug(`[StihlHeader] updateUserData(${user})`)
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
        case 'superAdmin':
          return 'Super Admin'
        case 'orgSuperAdmin':
          return 'Support Admin'
        case 'userAdmin':
          return 'User Admin'
      }
      return ''
    }
  },
  mounted() {
    userManager.getUser().then((u) => {
      this.updateUserData(u)
    })
    userManager.events.addUserLoaded(this.updateUserData) // register for addUserLoaded event
    //userManager.getUser() // triggers addUserLoaded event
  },
})
</script>

<style scoped>

</style>
