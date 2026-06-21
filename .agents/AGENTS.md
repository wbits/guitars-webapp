# AGENTS.md — guitars-webapp

Read this at the start of a session. This repo is the **React frontend** for guitars.com — a static SPA over the GuitarCollection API.

## Project in one sentence

**guitars-webapp** — Vite + React SPA deployed to S3 + CloudFront; all backend logic lives in [`wbits/guitars`](https://github.com/wbits/guitars).

## Read first (order)

| # | File | Why |
|---|------|-----|
| 1 | [`.agents/CONTEXT.md`](CONTEXT.md) | Current status |
| 2 | [`.agents/architecture.md`](architecture.md) | Routes, stack, hosting |
| 3 | [`.agents/runbook.md`](runbook.md) | Dev, build, deploy |
| 4 | [`.agents/decisions.md`](decisions.md) | Fixed choices |
| 5 | [`src/domain/guitar.ts`](../src/domain/guitar.ts) | Zod mirror of API contract |
| 6 | **[`wbits/guitars` API docs](https://github.com/wbits/guitars/blob/master/.agents/api-contract.md)** | Server-side API reference |
| 7 | **[`wbits/guitars` MCP](https://github.com/wbits/guitars/tree/master/mcp)** | AI agent tools (not in this repo) |

After substantive changes, update `.agents/CONTEXT.md` briefly.

## Related repos

| Repo | Role |
|------|------|
| **`wbits/guitars-webapp`** (this repo) | React UI |
| [`wbits/guitars`](https://github.com/wbits/guitars) | API, crawler, MCP, infra |

There is **no backend in this repo**.

## Rules for agents

1. **Minimal diffs** — match existing React/Query/form patterns.
2. **API contract** — `src/domain/` zod schemas; sync with Go API in `guitars` when payloads change.
3. **Backend / MCP / crawler** — work in `wbits/guitars`, not here.
4. **Tests** — `npm test` for touched areas.
5. **Commits / deploy** — only when the user explicitly asks.
6. **Documentation** — frontend docs in this `.agents/`; API/MCP docs in `guitars`.

## Common tasks

| Task | Action |
|------|--------|
| Form field | `src/domain/guitar.ts` → `GuitarForm` → `src/api/guitars.ts` |
| New API client endpoint | `src/domain/` → `src/api/` → UI; update `guitars` api-contract if server changed |
| Deploy webapp | push to `master` or [runbook.md](runbook.md) |
| MCP / agent tools | [`guitars/mcp`](https://github.com/wbits/guitars/tree/master/mcp) |
