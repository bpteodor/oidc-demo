// predefined configurations
window.CONFIG = [
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
      {
        client_id: "client1",
        client_secret: "secret",
        scopes: "openid profile email",
        grants: ["client_credentials"],
      },
      {
        client_id: "client2",
        client_secret: "secret",
        scopes: "offline_access",
      },
    ],
  },
];
