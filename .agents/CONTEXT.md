# Context — last updated 2026-06-21

## What this project is

React + TypeScript SPA for managing a personal guitar collection at **guitars.com**. Thin UI over the GuitarCollection HTTP API (Go Lambda on AWS API Gateway + DynamoDB).

## Live & repos

| | |
|---|---|
| **Site** | Static bundle on S3 + CloudFront (see `README.md` for deploy) |
| **API** | [`wbits/guitars`](https://github.com/wbits/guitars) — separate repo |
| **GitHub (this repo)** | `wbits/guitars-webapp` |
| **Branch** | `master` |
| **Agent docs** | `.agents/` (this file + AGENTS.md, decisions, backlog, plans, sessions) |

## Current stack

- Vite + React 18 + TypeScript (strict)
- react-router-dom v6, TanStack Query v5
- react-hook-form + zod, Tailwind CSS
- Amazon Cognito (production) or bearer token (local dev)
- Vitest + Testing Library

## Recent focus

- Planning an **MCP server** so AI agents can manage guitars via the API
- Architecture agreed: **Phase 1** local stdio adapter in this repo; **Phase 2** hosted MCP on existing API Gateway in `wbits/guitars`
- Agent documentation setup: `AGENTS.md` + `.agents/` (mirroring Cursor global plan storage)

## Not started yet

- `mcp/` package implementation (see `.agents/plans/mcp-server.md`)
- Phase 2 hosted MCP (backend repo change)

## Environment (local)

Copy `.env.example` → `.env.local`. Required: `VITE_GUITARS_API_BASE_URL`. Auth: Cognito vars or `VITE_GUITARS_BEARER_TOKEN`.

## Quick verify

```bash
npm install
npm test
npm run dev
```
