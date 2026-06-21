# AGENTS.md — guitars-webapp

Read this file at the start of a session. This repo is the React frontend for **guitars.com** — a personal guitar collection UI over the GuitarCollection HTTP API.

## Project in one sentence

**guitars-webapp** — a Vite + React SPA for browsing and managing a guitar collection, deployed as a static site to S3 + CloudFront, backed by the Go Lambda API in [`wbits/guitars`](https://github.com/wbits/guitars).

## Read first (order)

| # | File | Why |
|---|------|-----|
| 1 | [`.agents/CONTEXT.md`](CONTEXT.md) | Current status, open work |
| 2 | [`.agents/architecture.md`](architecture.md) | System design, stack, routes |
| 3 | [`.agents/api-contract.md`](api-contract.md) | HTTP endpoints and payloads |
| 4 | [`.agents/decisions.md`](decisions.md) | Fixed choices (especially MCP) |
| 5 | [`.agents/runbook.md`](runbook.md) | Dev, deploy, CI |
| 6 | [`src/domain/guitar.ts`](../src/domain/guitar.ts) | Zod schemas (source of truth for shapes) |

After substantive changes, update `.agents/CONTEXT.md` briefly.

## Folder structure

```
guitars-webapp/
├── AGENTS.md                 ← pointer to .agents/
├── README.md                 ← minimal human entry + doc index
├── src/                      ← React app
├── mcp/                      ← local MCP server for AI agents
├── .agents/                  ← documentation & session memory
├── template.yaml             ← S3 + CloudFront SAM stack
└── .github/workflows/deploy.yml
```

There is **no backend in this repo**. See [architecture.md](architecture.md) for repo boundaries.

## Rules for agents

1. **Minimal diffs** — match existing patterns; no drive-by refactors.
2. **Schema source of truth** — `src/domain/` for API shapes; keep webapp and future MCP in sync.
3. **No backend assumptions** — API changes belong in `wbits/guitars`.
4. **Tests** — run `npm test` for touched areas.
5. **Commits / deploy** — only when the user explicitly asks.
6. **Update context** — after substantive sessions: `.agents/CONTEXT.md` and optionally `.agents/sessions/YYYY-MM-DD.md`.
7. **Secrets** — never commit `.env`, bearer tokens, or real values in example configs.
8. **Documentation** — prefer updating `.agents/` over expanding `README.md`.

## Active plan: MCP server

See [`.agents/plans/mcp-server.md`](plans/mcp-server.md) and [`.agents/backlog.md`](backlog.md).

**Phase 1 (next):** local stdio MCP adapter in `mcp/`.  
**Phase 2 (future):** hosted MCP on API Gateway in `wbits/guitars`.

## Common tasks

| Task | Action |
|------|--------|
| Add/edit guitar form field | `src/domain/guitar.ts` → `GuitarForm` → `src/api/guitars.ts` |
| New API endpoint (client) | `src/domain/` → `src/api/` → page/component; update [api-contract.md](api-contract.md) |
| Auth change | `src/lib/cognito-auth.ts`, `src/lib/token.ts`, `AuthGate` |
| Deploy webapp | push to `master` (CI) or [runbook.md](runbook.md) manual steps |
| Architecture change | update [architecture.md](architecture.md) and [decisions.md](decisions.md) |

## Open work

See [`.agents/backlog.md`](backlog.md).
