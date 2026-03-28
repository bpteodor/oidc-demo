# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server on http://localhost:3000 (base path: /auth/demo/)
npm run build    # type-check + build
npm run preview  # preview the build
```

There is no test runner configured (vitest is a dev dependency but has no config or test files yet).

## Architecture

**Stack:** Vue 3 (Options API) · TypeScript · Vite · Bootstrap 5 + Bootstrap Icons · Pinia · `oidc-client-ts`

### Runtime config

`public/app-config.js` is loaded before the bundle and populates `window.APP_CONFIG`. It holds OIDC settings (`discoveryEndpoint`, `clientId`, `redirectUri`, etc.) and axios timeout. This file is the entry point for environment-specific configuration — it is not bundled.

### Page layout

All pages except `OauthCallback` use `src/components/ui/PageTemplate.vue`, which owns the full vertical layout:

- MyHeader:  top bar (hidden inside iframes)
- Page Content: (flex: 1, page content slot)
  - Page-Sidebar  (left, 220 px sticky, nav links)
- MyFooter: sticks to bottom, for small pages (hidden inside iframes)

`App.vue` only renders `<router-view>` and initialises the theme. Header/footer iframe detection lives in `PageTemplate`.

`PageTemplate` accepts a `menuItems` prop (`MenuItem[]`) to drive the sidebar nav. Items support `exact: true` for exact-path active matching vs. prefix matching.

### Theme system

`src/composables/useTheme.ts` holds a module-level reactive `theme` ref (`'light' | 'dark'`). A `watchEffect` writes `data-theme` on `<html>` and persists to `localStorage`. All colours are CSS custom properties defined in `src/assets/scss/_custom.scss` under `:root`/`[data-theme="light"]` and `[data-theme="dark"]` — no SCSS variable overrides. Bootstrap is imported clean.

### OIDC / provider state

`src/stores/providers.ts` (Pinia) persists OIDC provider configs to `localStorage` (`oidc_demo_providers`). A "selected" provider ID is also persisted separately.

`src/services/oidc.ts` wraps `oidc-client-ts`'s `UserManager` with two additions: `getValidUser()` (redirects to login if no user) and `introspectToken()` (calls the introspection endpoint with client credentials via axios).

### Routing

| Path | Component |
|------|-----------|
| `/` | `HomePage` |
| `/op/:id` | `OPConfigPage` — use `id === 'new'` to create, otherwise edit existing provider |
| `/oauth-callback` | `OauthCallback` — processes the redirect, then pushes to `user.state` |
| `/error` | `ErrorPage` |
