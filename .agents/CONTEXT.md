# Context — last updated 2026-06-21

## What this project is

React SPA for guitars.com — static site on S3 + CloudFront calling the GuitarCollection API.

## Repos

| | |
|---|---|
| **This repo** | `wbits/guitars-webapp` — UI only |
| **API + MCP** | [`wbits/guitars`](https://github.com/wbits/guitars) |

## Recent focus

- Agent docs split: frontend here, API/MCP/crawler in `guitars`
- MCP server **moved** to `guitars/mcp/`

## Quick verify

```bash
npm install && npm test && npm run dev
```
