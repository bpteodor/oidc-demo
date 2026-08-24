# demo
my OIDC demo

## Build & Run locally

```sh
cd oidc-demo
npm i
npm run dev
```

# chart

```sh
# image
docker build .
# chart
helm dependency update  helm/oidc-demo
helm package helm/oidc-demo
```
