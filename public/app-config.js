window.APP_CONFIG = {
    "oauth": {
        "discoveryEndpoint": "https://c109-teo.stihl.dev-servicelayers.io/auth/oauth2/consumer/",
        "clientId": "ddc-ui",
        "redirectUri": "http://localhost:3000/ddc/ui/openid-connect-callback",
        "scopes": "openid profile email dealerOrg stihl_ddc dealer_admin",
        "responseType": "code",
        "post_logout_redirect_uri": "http://localhost:3000/ddc/ui/",
    },
    "legal": {
        "terms_url": "/auth/XUI/themes/stihl/pdfs/STIHL-Terms_v1_de_en_es_fr.pdf",
        "privacy_url": "/auth/XUI/themes/stihl/pdfs/STIHL-Privacy-Policy_v1_de_en_es_fr.pdf",
        "imprint_url": "/auth/XUI/themes/stihl/html/imprint.html"
    },
    crmUserLink: "https://stihlgroup-q90.crm4.dynamics.com/main.aspx?app=STIHLMobileCRM&forceUCI=1&pagetype=entityrecord&etn=contact&id={{crm-id}}",
    axios: {
        defaults: {
            timout: 10000,
        }
    }
}