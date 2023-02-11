<template>
  <div id="home" class="container container-md">

    <h1 class="title">Demo</h1>

    <h5>Test OpenID Connect requests and debug responses.</h5>

    <form class="form">

      <div class="mb-3">
        <label for="clientId" class="form-label">Client Id</label>
        <select id="clientId" class="form-select" v-model="authForm.clientId">
          <option v-for="client in clients" :key="client">{{ client }}</option>
        </select>
        <div class="form-text">Only public clients are available for testing.</div>
      </div>

      <div class="mb-3">
        <label class="form-check-label">Scopes</label>
        <div class="form-check">
          <div class="form-check form-check-inline" v-for="scope in scopes" :key="scope">
            <input :id="scope" type="checkbox" v-model="authForm.scope" class="form-check-input">
            <label :for="scope" class="form-check-label">{{ scope }}</label>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <div class="form-check">
          <input id="mfa" type="checkbox" v-model="authForm.mfa" class="form-check-input">
          <label for="mfa" class="form-check-label">2nd Factor Authentication</label>
        </div>
      </div>

    </form>

  </div>
</template>

<script lang="ts">
//import DataTable, {TableColumns, TableItem} from '../components/DataTable.vue'
//import SyncSelectorModal from "./SyncSelectorModal.vue";
//import Multiselect from '@vueform/multiselect'
import Overlay from "../components/Overlay.vue";
import BootstrapAlerts from "../components/BootstrapAlerts.vue";
import {defineComponent} from "vue";
//import {DisplayableOrg, OrganizationData, UserData} from "../services/utils";
//import {i18n} from "../lang";

export default defineComponent({
  name: "HomePage",
  components: {BootstrapAlerts, Overlay},
  data() {
    return {
      authForm: {
        clientId: '',
        scope: ["openid"],
        mfa: false,
      },
      clients: [] as string[],
      scopes: ["openid", "profile", "email"],
    }
  },
  computed: {},
  methods: {

    startLogin() {

    },

  },

  mounted() {
    this.clients = [
      "demo",
      "imsp",
      "admin-ui",
    ]
    this.authForm.clientId = this.clients[0]
  }
});
</script>
