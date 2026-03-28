window.APP_CONFIG = {
    "oauth": {
        "discoveryEndpoint": "https://stihl.dev-servicelayers.io/auth/oauth2/consumer/",
        "clientId": "demo",
        "redirectUri": "http://localhost:3000/demo/oauth-callback",
        "scopes": "openid profile email dealerOrg",
        "responseType": "code",
        "post_logout_redirect_uri": "http://localhost:3000/demo/",
    }
}