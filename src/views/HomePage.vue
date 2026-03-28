<template>
  <page-template>
    <div id="home" class="container container-md page">
      <h1 class="title">OpenID Connect - Demo</h1>

      <h5>Welcome to my demo application.</h5>

      <p>In order to start testing your OIDC configuration you have to configure the following</p>

      <ol>
        <li>Go to <code>Configuration</code> to add a new OpenID Provider</li>
        <li>Start a <code>Authorization Code Flow</code> or a <code>Client Credentials Flow</code></li>
        <li>Verify the token by calling the <code>Introspection</code> or load user profile data by calling the <code>User Info</code></li>
      </ol>

    </div>
  </page-template>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import PageTemplate, { type MenuItem } from '../components/layout/PageTemplate.vue'

export default defineComponent({
  name: "HomePage",
  components: { PageTemplate },
})
</script>
