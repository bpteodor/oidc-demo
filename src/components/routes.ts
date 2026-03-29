import {createRouter, createWebHistory} from 'vue-router'
import HomePage from '../views/HomePage.vue'
import ErrorPage from '../views/ErrorPage.vue'
import OauthCallback from "../views/OauthCallback.vue";
import ConfigPage from "../views/ConfigPage.vue";
import AuthCodeFlowPage from "../views/AuthCodeFlowPage.vue";
import ClientCredentialsPage from "../views/ClientCredentialsPage.vue";
import IntrospectionPage from "../views/IntrospectionPage.vue";
import UserInfoPage from "../views/UserInfoPage.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {path: '/', component: HomePage,},
        {path: '/config', component: ConfigPage},
        {path: '/authorization-code', component: AuthCodeFlowPage},
        {path: '/client-credentials', component: ClientCredentialsPage},
        {path: '/oauth-callback', component: OauthCallback},
        {path: '/token-info', component: IntrospectionPage},
        {path: '/user-info', component: UserInfoPage},
        {path: '/error', component: ErrorPage},
    ]
})

export default router
