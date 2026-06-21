# guitars-webapp

React + TypeScript SPA for browsing and managing a personal guitar collection at **guitars.com**. Static site (Vite → S3 + CloudFront) over the GuitarCollection API in [`wbits/guitars`](https://github.com/wbits/guitars).

## Quick start

```sh
cp .env.example .env.local
npm install
npm run dev
```

Set `VITE_GUITARS_API_BASE_URL` in `.env.local`. See [`.agents/runbook.md`](.agents/runbook.md) for env vars, deploy, and CI.

## Documentation

| Audience | Start here |
|----------|------------|
| **AI agents (API/MCP)** | [`wbits/guitars` AGENTS.md](https://github.com/wbits/guitars/blob/master/AGENTS.md) |
| **Architecture (webapp)** | [`.agents/architecture.md`](.agents/architecture.md) |
| **Dev & deploy (webapp)** | [`.agents/runbook.md`](.agents/runbook.md) |
| **Current status** | [`.agents/CONTEXT.md`](.agents/CONTEXT.md) |
