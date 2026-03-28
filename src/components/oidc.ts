/**
 * @see https://github.com/IdentityModel/oidc-client-js/wiki
 */

import {Log, User, UserManager, UserManagerSettings, WebStorageStateStore} from 'oidc-client-ts'
import axios from "axios";

const APP_CONFIG = window.APP_CONFIG
Log.setLogger(console)
Log.setLevel(Log.INFO)

const defaultIfEmpty = (s: string | undefined, _def: string) => s ? s : _def;

class EnhancedUserManager extends UserManager {

    constructor(settings: UserManagerSettings) {
        super(settings)
    }

    /**
     * Get the user who is logged in.
     * If the user was deleted (expired) it restarts authentication.
     */
    getValidUser() {
        const self = this
        return new Promise((resolve: (u: User) => void, reject: (e: any) => void) => {
            self.getUser().then(function (user) {
                if (user == null) {
                    console.info("[oidc] renewing...")
                    self.signinRedirect().then(() => console.log("[oidc] renewed"))
                    //return resolve(null)
                } else {
                    return resolve(user)
                }
            }).catch(function (err) {
                console.error(err)
                return reject(err)
            });
        })
    }

    /**
     * call introspection to validate the token
     */
    introspectToken(accessToken: string) {

        return this.metadataService.getMetadata().then(metadata => {
            //console.debug("[oidc] metadata", metadata)
            if (!metadata.introspection_endpoint) {
                console.error("[oidc] introspection not set up", this.settings)
                return false
            }

            const data = new URLSearchParams({token: accessToken});

            return axios.post(metadata.introspection_endpoint, data, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                auth: {
                    username: this.settings.client_id,
                    password: defaultIfEmpty(this.settings.client_secret, ""),
                }
            }).then((r) => {
                console.info("[oidc] introspection", r)
                return r.data.active
            }).catch(e => {
                console.error("[oidc] introspection failed", e)
                return false
            })
        })

    }
}

export const userManager = new EnhancedUserManager({
    userStore: new WebStorageStateStore(),
    authority: APP_CONFIG.oauth.discoveryEndpoint,
    client_id: APP_CONFIG.oauth.clientId,
    redirect_uri: APP_CONFIG.oauth.redirectUri,
    response_type: APP_CONFIG.oauth.responseType,
    scope: APP_CONFIG.oauth.scopes,
    post_logout_redirect_uri: APP_CONFIG.oauth.post_logout_redirect_uri,
    //silent_redirect_uri: window.location.origin + '/static/silent-renew.html',
    accessTokenExpiringNotificationTimeInSeconds: 10,
    automaticSilentRenew: false,
    filterProtocolClaims: false,
    loadUserInfo: true,
    response_mode: 'query',
})

userManager.events.addAccessTokenExpiring(function () {
    console.warn('[oidc] AccessToken Expiring!');
});

userManager.events.addAccessTokenExpired(function () {
    console.info('[oidc] AccessToken Expired');
    userManager.removeUser().then(() => {
        console.debug("[oidc] removed expired user from store")
    })
});

userManager.events.addSilentRenewError(function () {
    console.error('[oidc] Silent Renew Error');
});
