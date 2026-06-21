# Runbook — guitars-webapp

## Prerequisites

Node 20+, npm 10+.

## Local development

```sh
cp .env.example .env.local
npm install
npm run dev                  # http://localhost:5173
```

### Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_GUITARS_API_BASE_URL` | API URL (**required**) |
| `VITE_GUITARS_BEARER_TOKEN` | Dev token when Cognito unset |
| `VITE_COGNITO_*` | Cognito sign-in (production-like local) |

Cognito ids from [`wbits/guitars`](https://github.com/wbits/guitars) stack outputs.

### Scripts

| Command | Effect |
|---------|--------|
| `npm run dev` | Vite HMR |
| `npm run build` | Production bundle → `dist/` |
| `npm test` | Vitest |
| `npm run lint` | `tsc --noEmit` |

`Makefile`: `install`, `dev`, `test`, `build`, `deploy`, `invalidate`.

## Deploy

CI: `.github/workflows/deploy.yml` on push to `master`.

Manual:

```sh
export VITE_GUITARS_API_BASE_URL=https://your-api.example.com
export VITE_COGNITO_REGION=eu-central-1
export VITE_COGNITO_USER_POOL_ID=eu-central-1_XXXXX
export VITE_COGNITO_CLIENT_ID=xxxxxxxx
export BUCKET=my-guitars-webapp-bucket
export DIST=E1ABCDEFGHIJKL

make build
make deploy
make invalidate
```

GitHub: secret `AWS_DEPLOY_ROLE_ARN`; vars `GUITARS_API_BASE_URL`, `COGNITO_*`, `GUITARS_BUCKET`, `GUITARS_DISTRIBUTION_ID`.

## MCP

Not in this repo — [`wbits/guitars/mcp`](https://github.com/wbits/guitars/tree/master/mcp).

## Troubleshooting

| Symptom | Check |
|---------|-------|
| 401 on API | Token expired; Cognito config |
| Deep link 404 after refresh | CloudFront SPA rewrite in `template.yaml` |
| Missing API URL at build | `VITE_GUITARS_API_BASE_URL` must be set at build time |
