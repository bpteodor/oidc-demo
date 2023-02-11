<template>
  <div id="callback-page" class="container-fluid container h-100">
    <overlay :active="!$route.query.error && !err" :spinner="true">

      <ddc-error :title="errorTitle" :summary="errorSummary" :message="errorDetails" v-if="$route.query.error || err"/>

    </overlay>
  </div>
</template>

<script lang="ts">
import {userManager} from '../services/oidc'
import Overlay from "../components/Overlay.vue";
import axios from "axios";
import DdcError from "../components/DdcError.vue";
import {defineComponent} from "vue";

export default defineComponent({
  name: 'OpenIdConnectCallback',
  components: {Overlay, DdcError},
  data() {
    return {
      err: '',
    }
  },
  computed: {
    errorTitle(): string {
      if (this.$route.query.error) return 'Oauth error'
      return 'Token endpoint error'
    },
    errorSummary(): string {
      if (this.$route.query.error) return this.$route.query.error as string
      return ''
    },
    errorDetails(): string {
      if (this.$route.query.error) return this.$route.query.error_description as string
      return this.err
    }
  },
  methods: {
    setLocale(_goto: string) {
      const loc = this.$getUrlParam(_goto, 'locale')
      if (loc) {
        this.$setLocale(this.$i18n, loc)

      } else {
        const i18n = this.$i18n

        // get locale from server. improve by sending the locale in #url-fragment ?
        axios.get(import.meta.env.VITE_DDC_SVC + '/lang', {responseType: 'text'})
            .then(resp => {
              console.log(`browser locale ${resp.data}`)
              this.$setLocale(i18n, resp.data)
            })
            .catch(() => {
              console.log("no locale from server")
            })
      }

      if (loc) this.$setLocale(this.$i18n, loc)
    },
  },
  mounted() {

    console.info("processing callback...")

    userManager.signinRedirectCallback().then((user) => {

      window.tokenChecked = true

      const _goto = user.state as string
      console.log(`welcome ${user.profile.given_name}, redirecting you back to ${_goto}...`)
      this.$router.push(_goto ? _goto : "/")

      if (_goto) {
        this.setLocale(_goto)
      }

    }).catch((oauth_error) => {
      //console.error(`Failed to get token: ${oauth_error}`);
      this.err = oauth_error // usually "No matching state found in storage"
    })
  }
})
</script>
