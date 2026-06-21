# AGENTS.md — guitars-webapp

Read this file at the start of a session. This repo is the React frontend for **guitars.com** — a personal guitar collection UI over the GuitarCollection HTTP API.

## Project in one sentence

**guitars-webapp** — a Vite + React SPA for browsing and managing a guitar collection, deployed as a static site to S3 + CloudFront, backed by the Go Lambda API in [`wbits/guitars`](https://github.com/wbits/guitars).

## Read first (order)

| # | File | Why |
|---|------|-----|
| 1 | [`.agents/CONTEXT.md`](CONTEXT.md) | Current status, URLs, open work |
| 2 | [`.agents/decisions.md`](decisions.md) | Fixed choices (especially MCP architecture) |
| 3 | [`README.md`](../README.md) | Human workflow, API contract, deploy |
| 4 | [`src/domain/guitar.ts`](../src/domain/guitar.ts) | API request/response schemas (zod) |

After substantive changes, update `.agents/CONTEXT.md` briefly.

## Folder structure

```
guitars-webapp/
├── AGENTS.md                 ← pointer to .agents/ (Cursor entrypoint)
├── README.md
├── src/
│   ├── api/                  ← fetch wrapper + React Query hooks
│   ├── components/
│   ├── domain/               ← zod schemas mirroring API contract
│   ├── lib/                  ← Cognito, token, money helpers
│   └── pages/
├── mcp/                      ← (planned) local MCP server for AI agents
│
├── .agents/                  ← agent context & session memory
│   ├── AGENTS.md             ← this file
│   ├── CONTEXT.md
│   ├── decisions.md
│   ├── backlog.md
│   ├── plans/
│   ├── config/
│   └── sessions/
│
├── template.yaml             ← S3 + CloudFront SAM stack
└── .github/workflows/deploy.yml
```

## Related repos

| Repo | Role |
|------|------|
| [`wbits/guitars-webapp`](https://github.com/wbits/guitars-webapp) | This repo — React static site |
| [`wbits/guitars`](https://github.com/wbits/guitars) | Go Lambda API, DynamoDB, Cognito, market crawler |

There is **no backend in this repo**. API behavior is defined by the client contract in `src/domain/` and `src/api/`.

## Core commands

```bash
cp .env.example .env.local   # fill in API URL + auth
npm install
npm run dev                  # http://localhost:5173
npm test
npm run build
```

Deploy (manual): see `README.md` and `Makefile` (`make build`, `make deploy`, `make invalidate`).

## API contract (client view)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/guitar` | List caller's guitars |
| GET | `/guitar/{id}` | Single guitar |
| POST | `/guitar` | Create |
| PUT | `/guitar/{id}` | Replace |
| DELETE | `/guitar/{id}` | Delete |

Prices are **minor units** (cents) in API bodies. The UI converts via `src/lib/money.ts`. Clients do not send `owner`; the API assigns it from the Cognito JWT.

## Auth

- **Production:** Amazon Cognito — ID token in `sessionStorage`, sent as `Authorization: Bearer …`
- **Local dev:** `VITE_GUITARS_BEARER_TOKEN` or token pasted on `/settings`
- Never commit production tokens

## Rules for agents

1. **Minimal diffs** — match existing patterns; no drive-by refactors.
2. **Schema source of truth** — `src/domain/` for API shapes; keep webapp and future MCP in sync.
3. **No backend assumptions** — if the API needs changing, that work belongs in `wbits/guitars`.
4. **Tests** — run `npm test` for touched areas; Vitest + Testing Library.
5. **Commits / deploy** — only when the user explicitly asks.
6. **Update context** — after substantive sessions: `.agents/CONTEXT.md` and optionally `.agents/sessions/YYYY-MM-DD.md`.
7. **Secrets** — never commit `.env`, bearer tokens, or real values in example configs.

## Active plan: MCP server

See [`.agents/plans/mcp-server.md`](plans/mcp-server.md) and [`.agents/backlog.md`](backlog.md).

**Phase 1 (next):** local stdio MCP adapter in `mcp/` calling the existing REST API.  
**Phase 2 (future):** hosted MCP on API Gateway + Cognito in `wbits/guitars`.

## Common tasks

| Task | Action |
|------|--------|
| Add/edit guitar form field | `src/domain/guitar.ts` → `GuitarForm` → API hooks in `src/api/guitars.ts` |
| New API endpoint (client) | `src/domain/` schema → `src/api/` → page/component |
| Auth change | `src/lib/cognito-auth.ts`, `src/lib/token.ts`, `AuthGate` |
| Deploy webapp | push to `master` (CI) or manual `make build deploy invalidate` |

## Open work

See [`.agents/backlog.md`](backlog.md).
