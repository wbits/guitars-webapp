# Context — last updated 2026-06-21

## What this project is

React + TypeScript SPA for managing a personal guitar collection at **guitars.com**. Thin UI over the GuitarCollection HTTP API (Go Lambda on AWS API Gateway + DynamoDB).

## Live & repos

| | |
|---|---|
| **Site** | Static bundle on S3 + CloudFront |
| **API** | [`wbits/guitars`](https://github.com/wbits/guitars) — separate repo |
| **GitHub (this repo)** | `wbits/guitars-webapp` |
| **Branch** | `master` |
| **Documentation** | `.agents/` — architecture, API, runbook, plans, sessions |

## Recent focus

- Agent documentation: `AGENTS.md` + `.agents/` structure
- README slimmed down; detailed docs moved to `.agents/architecture.md`, `api-contract.md`, `runbook.md`
- MCP server planned (Phase 1 local, Phase 2 hosted on API Gateway)

## Not started yet

- `mcp/` package (see `.agents/plans/mcp-server.md`)
- Phase 2 hosted MCP (backend repo)

## Quick verify

```bash
npm install && npm test && npm run dev
```

Full setup: [runbook.md](runbook.md).
