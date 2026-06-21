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

Manual: set `VITE_*` env vars, then `make build deploy invalidate`. See previous full example in git history or [`guitars-webapp` deploy docs](https://github.com/wbits/guitars-webapp).

GitHub vars: `GUITARS_API_BASE_URL`, `COGNITO_*`, `GUITARS_BUCKET`, `GUITARS_DISTRIBUTION_ID`, secret `AWS_DEPLOY_ROLE_ARN`.

## MCP

The MCP server is **not in this repo**. See [`wbits/guitars/mcp`](https://github.com/wbits/guitars/tree/master/mcp).

## Troubleshooting

| Symptom | Check |
|---------|-------|
| 401 on API | Token expired; Cognito config |
| Deep link 404 after refresh | CloudFront SPA rewrite in `template.yaml` |
| Missing API URL at build | `VITE_GUITARS_API_BASE_URL` must be set at build time |
