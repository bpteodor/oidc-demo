<template>
  <div id="callback-page" class="container-fluid container h-100">
    <my-overlay :active="!$route.query.error && !err" :spinner="true">

      <!-- todo show error -->

    </my-overlay>
  </div>
</template>

<script lang="ts">
import {userManager} from '../components/oidc'
import {defineComponent} from "vue";
import MyOverlay from "../components/ui/MyOverlay.vue";

export default defineComponent({
  name: 'OpenIdConnectCallback',
  components: {MyOverlay,},
  data() {
    return {
      err: '',
    }
  },
  computed: {},
  methods: {},
  mounted() {

    console.info("processing callback...")

    userManager.signinRedirectCallback().then((user) => {

      window.tokenChecked = true

      const _goto = user.state as string
      console.log(`welcome ${user.profile.given_name}, redirecting you back to ${_goto}...`)
      this.$router.push(_goto ? _goto : "/")

      if (_goto) {
        //this.setLocale(_goto)
      }

    }).catch((oauth_error) => {
      //console.error(`Failed to get token: ${oauth_error}`);
      this.err = oauth_error // usually "No matching state found in storage"
    })
  }
})
</script>
