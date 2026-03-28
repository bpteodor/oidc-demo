// predefined configurations
window.CONFIG = [
  {
    name: "STIHL.dev",
    discovery: "https://stihl.dev-servicelayers.io/auth/oauth2/consumer/.well-known/openid-configuration",
    clients: [
      {
        client_id: "demo",
        scopes: "openid profile email dealerOrg",
        grants: ["code"],
      },
      {
        client_id: "admin-ui",
        scopes: "openid profile email dealer_admin",
        grants: ["code"],
      },
      {
        client_id: "admin_svc",
        client_secret: "test",
        //scopes: "",
        grants: ["code"],
      },
    ],
  },
  {
    name: "STIHL.tui",
    discovery: "https://stihl.tui-servicelayers.io/auth/oauth2/consumer/.well-known/openid-configuration",
    clients: [
      {
        client_id: "demo",
        //client_secret: "",
        scopes: "openid profile email dealerOrg",
        grants: ["code"],
      },
    ],
  },
  {
    name: "my-OIDC",
    discovery: "https://openid.local:9000/.well-known/openid-configuration",
    clients: [
      {
        client_id: "test-app1",
        client_secret: "secret",
        scopes: "openid profile email",
        grants: ["code"],
      },
      {
        client_id: "test-app2",
        client_secret: "secret",
        scopes: "openid profile email",
        grants: ["code"],
      },
    ],
  },
];
