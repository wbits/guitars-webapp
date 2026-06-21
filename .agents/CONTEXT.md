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

- **MCP server Phase 1** implemented in `mcp/` — local stdio adapter with guitar CRUD tools + optional crawl trigger
- Agent documentation in `.agents/` (architecture, API, runbook)

## Not started yet

- Phase 2 hosted MCP on API Gateway (`wbits/guitars` repo)
- Wire MCP into Cursor (build `mcp/` and configure `.cursor/mcp.json`)

## Quick verify

```bash
npm install && npm test && npm run dev
```

Full setup: [runbook.md](runbook.md).
