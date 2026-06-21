# Runbook

Dev, build, deploy, and CI for **guitars-webapp**.

## Prerequisites

- Node 20+, npm 10+
- AWS CLI + SAM CLI (for infrastructure and manual deploy)
- `gh` CLI (optional — only for MCP market-crawl tool)

## Local development

```sh
cp .env.example .env.local   # fill in values
npm install
npm run dev                  # http://localhost:5173
```

### Environment variables

All webapp vars are `VITE_`-prefixed (inlined at build time):

| Variable | Purpose |
|----------|---------|
| `VITE_GUITARS_API_BASE_URL` | API base URL (no trailing slash). **Required.** |
| `VITE_GUITARS_BEARER_TOKEN` | Shared token for local dev when Cognito is not configured |
| `VITE_COGNITO_REGION` | Cognito region (e.g. `eu-central-1`) |
| `VITE_COGNITO_USER_POOL_ID` | User pool id — enables sign-in when set with client id |
| `VITE_COGNITO_CLIENT_ID` | App client id (`guitars-webapp`) |

When all three Cognito vars are set, the app uses `/login` and `/register`. Otherwise use bearer token (env or `/settings`).

Cognito ids come from the [`wbits/guitars`](https://github.com/wbits/guitars) stack outputs (`CognitoUserPoolId`, `CognitoUserPoolClientId`).

### npm scripts

| Command | Effect |
|---------|--------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `tsc --noEmit` + `vite build` → `dist/` |
| `npm run preview` | Serve production build locally |
| `npm test` | Vitest once |
| `npm run test:watch` | Vitest watch mode |
| `npm run lint` | `tsc --noEmit` |

The `Makefile` mirrors common targets (`install`, `dev`, `test`, `lint`, `build`) and adds `deploy` / `invalidate`.

### Quick verify

```bash
npm install
npm test
npm run dev
```

## Manual deploy

### One-time stack (S3 + CloudFront)

```sh
sam deploy \
  --template-file template.yaml \
  --stack-name guitars-webapp \
  --capabilities CAPABILITY_IAM \
  --resolve-s3 \
  --parameter-overrides BucketName=my-guitars-webapp-bucket
```

### Build and upload

```sh
export VITE_GUITARS_API_BASE_URL=https://guitars.brouwers.club
export VITE_COGNITO_REGION=eu-central-1
export VITE_COGNITO_USER_POOL_ID=eu-central-1_XXXXX
export VITE_COGNITO_CLIENT_ID=xxxxxxxx
export BUCKET=my-guitars-webapp-bucket
export DIST=E1ABCDEFGHIJKL

make build
make deploy
make invalidate
```

## Continuous deployment

`.github/workflows/deploy.yml` runs on every push to `master`:

1. `npm ci`
2. `npx vitest run`
3. `npm run build`
4. `aws s3 sync dist/ s3://$BUCKET --delete`
5. `aws cloudfront create-invalidation --paths "/*"`

AWS credentials via OIDC — no static access keys in the repo.

### GitHub configuration

| Kind | Name | Purpose |
|------|------|---------|
| Secret | `AWS_DEPLOY_ROLE_ARN` | IAM role for OIDC (trust `token.actions.githubusercontent.com`) |
| Variable | `GUITARS_API_BASE_URL` | Build → `VITE_GUITARS_API_BASE_URL` |
| Variable | `COGNITO_REGION` | Build → `VITE_COGNITO_REGION` (default `eu-central-1`) |
| Variable | `COGNITO_USER_POOL_ID` | Build → `VITE_COGNITO_USER_POOL_ID` |
| Variable | `COGNITO_CLIENT_ID` | Build → `VITE_COGNITO_CLIENT_ID` |
| Variable | `GUITARS_BUCKET` | S3 bucket from `template.yaml` outputs |
| Variable | `GUITARS_DISTRIBUTION_ID` | CloudFront distribution ID |
| Variable (opt.) | `AWS_REGION` | Defaults to `eu-west-1` |

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Blank page after refresh on deep link | CloudFront SPA rewrite + error mappings in `template.yaml` |
| 401 on API calls | Token expired — sign in again; check Cognito config |
| No token in dev | Set `VITE_GUITARS_BEARER_TOKEN` or paste on `/settings` |
| Build missing API URL | `VITE_GUITARS_API_BASE_URL` must be set at build time |
