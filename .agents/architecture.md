# Architecture — guitars-webapp

Frontend-only. Backend architecture: [`wbits/guitars/.agents/architecture.md`](https://github.com/wbits/guitars/blob/master/.agents/architecture.md).

## Stack

- Vite + React 18 + TypeScript (strict)
- react-router-dom v6, TanStack Query v5
- react-hook-form + zod, Tailwind CSS
- Native `fetch` via `src/api/client.ts`
- Cognito (production) or bearer token (local dev)
- Vitest + Testing Library

## Source layout

```
src/
├── api/         fetch + React Query hooks
├── components/  AuthGate, GuitarForm, galleries, …
├── domain/      zod schemas mirroring API contract
├── lib/         Cognito, token, money helpers
└── pages/       route screens
```

## Web routes

| Path | Purpose |
|------|---------|
| `/guitars` | Collection mosaic |
| `/guitars/new` | Create |
| `/guitars/:id` | Detail + gallery |
| `/guitars/:id/edit` | Edit |
| `/login`, `/register` | Cognito auth |
| `/settings` | Token / sign-out |
| `/collections/:userId` | Public collection + viewer assistant chat |

Collection routes use `<AuthGate>`.

## guitars-assistant (viewer, tier 1)

On `/collections/:userId`, a chat panel calls `POST /assistant/chat` on the API. The API returns a filter spec + message; this app applies [`filterGuitars`](../src/lib/filter-guitars.ts) client-side to the already-loaded guitar list. No list-endpoint query params.

Tier 2 (owner BYOK) is implemented; see Profile page in webapp. Photo analysis BYOK still planned.

## Auth

Cognito **ID token** in `sessionStorage` → `Authorization: Bearer …`. Local fallback: `VITE_GUITARS_BEARER_TOKEN` or `/settings` paste.

## Static hosting

`template.yaml` — S3 + CloudFront + SPA rewrite. Deploy: [runbook.md](runbook.md).

## API & MCP

HTTP API and MCP server live in **`wbits/guitars`**. This app is one REST client among others (browser, MCP).
