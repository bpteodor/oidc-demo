import {createRouter, createWebHistory} from 'vue-router'
import HomePage from '../views/HomePage.vue'
import ErrorPage from '../views/ErrorPage.vue'
import OauthCallback from "../views/OauthCallback.vue";
import ConfigPage from "../views/ConfigPage.vue";
import AuthCodeFlowPage from "../views/AuthCodeFlowPage.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {path: '/', component: HomePage,},
        {path: '/config', component: ConfigPage},
        {path: '/authorization-code', component: AuthCodeFlowPage},
        {path: '/oauth-callback', component: OauthCallback},
        {path: '/error', component: ErrorPage},
    ]
})


/*router.beforeEach((to, from, next) => {
    console.debug(`[router] to:${to.path}`)

    // handle authorization
    const routeMeta = to.matched && to.matched.length > 0 ? to.matched[0].meta : null;
    if (routeMeta && (routeMeta.requiredScopes || routeMeta.requiredClaim)) {
        console.debug(`[router] protected route ${to.path} ${to.params}`)

        // AM doesn't interpret locale: 'ro-RO' is not evaluated to  'ro', but defaults to 'en'
        const ui_locales = to.query.locale

        userManager.getUser().then(
            async user => {
                // check if user logged or expired or first-app-load
                if (!user || user.expired || !await haveValidToken(user)) {
                    next(false) // cancel current route
                    console.log(`[router] no valid token. starting auth (state:${to.fullPath}, ui_locales:${ui_locales})...`)
                    userManager.signinRedirect({
                        state: to.fullPath,
                        //TODO ui_locales: ui_locales,
                    }).catch(function (err) {
                        console.error(`[router] oidc-auth-error: ${err}`)
                    })
                    return
                }

                if (hasAccess(user, routeMeta)) {
                    next();
                } else {
                    console.error(`no access to ${to.path}`)
                    next('/access-denied');
                }
            },
            err => {
                console.log(`[router] login failed: ${err}`)
                next('/access-denied');
            }
        );
    } else {
        console.debug(`[router] public route ${to.path}`)
        next();
    }
})*/

export default router
