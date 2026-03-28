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
        client_id: "admin_ui",
        scopes: "openid profile email dealerOrg",
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
];
