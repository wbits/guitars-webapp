# guitars-webapp

A small React + TypeScript single-page app for browsing and managing a personal
guitar collection. It is a thin UI over the **GuitarCollection** HTTP API at
[`wbits/guitars`](https://github.com/wbits/guitars) — a Go AWS Lambda fronted
by API Gateway.

The app is shipped as a static bundle (Vite build) and deployed to S3 +
CloudFront.

## Stack

- Vite + React 18 + TypeScript (strict)
- react-router-dom v6
- TanStack Query (React Query v5) for data fetching, caching, mutations
- react-hook-form + zod for form state and validation
- Tailwind CSS (no UI kit)
- Native `fetch` wrapped in a tiny typed `apiClient`
- Amazon Cognito (production) or a shared bearer token (local dev)
- Vitest + @testing-library/react

## Project layout

```
src/
├── api/         fetch wrapper + typed CRUD helpers and React Query hooks
├── components/  AuthGate, GuitarForm, GuitarMosaicGrid, PictureGallery, …
├── domain/      zod schema + TS types mirroring the API contract
├── lib/         Cognito auth, token resolution, money conversion + formatting
├── pages/       routes: GuitarList, GuitarNew, GuitarView, GuitarEdit, Login, …
├── App.tsx      shell layout + nav
└── main.tsx     React Query provider + router + AuthGate wiring
```

## Routes

| Path                  | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| `/`                   | Redirects to `/guitars`                              |
| `/guitars`            | Mosaic overview of your guitars, sorted by brand     |
| `/guitars/new`        | Create form                                          |
| `/guitars/:id`        | Detail view + picture gallery + delete modal         |
| `/guitars/:id/edit`   | Edit form (prefilled)                                |
| `/login`              | Cognito sign-in (when Cognito is configured)         |
| `/register`           | Cognito registration (when Cognito is configured)    |
| `/settings`           | Token info / sign-out helper                         |

All collection routes are wrapped in `<AuthGate>`, which requires a valid API
credential before rendering.

## Authentication

Production uses **Amazon Cognito**. After sign-in the app stores the Cognito
access token in `sessionStorage` and sends it as
`Authorization: Bearer <token>` on every API request. The API maps the token
to a user id (`sub`) and scopes the collection to that caller.

When the three Cognito env vars below are **not** set at build time, the app
falls back to a legacy shared bearer token for local development:

1. **Build-time env var** (`VITE_GUITARS_BEARER_TOKEN`), or
2. **Runtime override** pasted on `/settings` (stored in `sessionStorage`).

Do not bake a production bearer token into the bundle — use Cognito instead.

## API contract (client view)

| Method | Path             | Description                                |
| ------ | ---------------- | ------------------------------------------ |
| GET    | `/guitar`        | List guitars owned by the signed-in user   |
| GET    | `/guitar/{id}`   | Retrieve a single guitar                   |
| POST   | `/guitar`        | Add a new guitar                           |
| PUT    | `/guitar/{id}`   | Replace an existing guitar                 |
| DELETE | `/guitar/{id}`   | Remove a guitar                            |

Responses include `owner` (Cognito user id). Clients do **not** send `owner` in
POST/PUT bodies; the API assigns it from the authenticated user.

POST/PUT bodies include `coverPictureIndex` — the index into `pictures` for the
thumbnail shown on the collection overview. Prices are in **minor units**
(cents).

### Legacy records

Guitars created before per-user ownership was introduced have no `owner`. They
are hidden from the list until the signed-in user opens them (by direct link)
and saves once from the edit form, which backfills ownership.

## Local development

Prerequisites: Node 20+, npm 10+.

```sh
cp .env.example .env.local   # then fill in the values
npm install
npm run dev                  # http://localhost:5173
```

Environment variables (all `VITE_`-prefixed so they are inlined into the
bundle):

| Variable                      | Purpose                                                                 |
| ----------------------------- | ----------------------------------------------------------------------- |
| `VITE_GUITARS_API_BASE_URL`   | Base URL of the GuitarCollection API (no trailing slash). Required.     |
| `VITE_GUITARS_BEARER_TOKEN`   | Optional shared token for local dev when Cognito is not configured.     |
| `VITE_COGNITO_REGION`         | Cognito region (e.g. `eu-central-1`). Enables sign-in when set with the two below. |
| `VITE_COGNITO_USER_POOL_ID`  | Cognito user pool id.                                                   |
| `VITE_COGNITO_CLIENT_ID`      | Cognito app client id (`guitars-webapp`).                               |

Useful scripts:

| Command            | Effect                                            |
| ------------------ | ------------------------------------------------- |
| `npm run dev`      | Vite dev server with HMR.                         |
| `npm run build`    | `tsc --noEmit` + `vite build` (writes to `dist`). |
| `npm run preview`  | Serves the production build locally.              |
| `npm test`         | Runs the Vitest suite once.                       |
| `npm run test:watch` | Vitest in watch mode.                           |
| `npm run lint`     | `tsc --noEmit`.                                   |

The `Makefile` mirrors the most common scripts (`install`, `dev`, `test`,
`lint`, `build`) and adds `deploy` / `invalidate` for the static-hosting flow.

## Building and deploying

The app is hosted as a static bundle behind CloudFront. The included
`template.yaml` is a SAM/CloudFormation template that provisions:

- An S3 bucket (private, with Origin Access Control).
- A CloudFront distribution.
- A CloudFront Function that rewrites SPA paths (anything without a file
  extension) to `/index.html`, so deep links survive a refresh.
- 403/404 → 200 + `/index.html` error mappings as a belt-and-braces SPA
  fallback.

Outputs include the bucket name and distribution ID.

One-time stack creation (example):

```sh
sam deploy \
  --template-file template.yaml \
  --stack-name guitars-webapp \
  --capabilities CAPABILITY_IAM \
  --resolve-s3 \
  --parameter-overrides BucketName=my-guitars-webapp-bucket
```

After the stack exists, build and upload:

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

AWS credentials are obtained via OIDC — **no static access keys are stored in
the repo**. Configure in the GitHub repo:

| Kind              | Name                       | Purpose                                                                |
| ----------------- | -------------------------- | ---------------------------------------------------------------------- |
| Secret            | `AWS_DEPLOY_ROLE_ARN`      | IAM role the workflow assumes (must trust `token.actions.githubusercontent.com`). |
| Variable          | `GUITARS_API_BASE_URL`     | Exposed to the build as `VITE_GUITARS_API_BASE_URL`. Required.         |
| Variable          | `COGNITO_REGION`           | Exposed as `VITE_COGNITO_REGION`. Defaults to `eu-central-1` if unset. |
| Variable          | `COGNITO_USER_POOL_ID`     | Exposed as `VITE_COGNITO_USER_POOL_ID`. Required for production auth.  |
| Variable          | `COGNITO_CLIENT_ID`        | Exposed as `VITE_COGNITO_CLIENT_ID`. Required for production auth.     |
| Variable          | `GUITARS_BUCKET`           | Name of the S3 bucket (from `template.yaml` outputs).                  |
| Variable          | `GUITARS_DISTRIBUTION_ID`  | CloudFront distribution ID (from `template.yaml` outputs).             |
| Variable (opt.)   | `AWS_REGION`               | Defaults to `eu-west-1` if unset.                                      |

Cognito ids come from the [`wbits/guitars`](https://github.com/wbits/guitars)
API stack outputs (`CognitoUserPoolId`, `CognitoUserPoolClientId`).
