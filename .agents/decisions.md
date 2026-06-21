# Decisions

Fixed choices — do not reverse lightly without discussion.

## Architecture

- **Frontend-only repo.** No Lambda, DynamoDB, or API Gateway code here.
- **API contract** lives in `src/domain/` (zod). Backend implementation is in `wbits/guitars`.
- **Prices** stored as integer minor units (cents) in API; UI uses major units via `src/lib/money.ts`.

## Auth

- Production: Cognito JWT as bearer token; collection scoped to token `sub`.
- Local dev: optional static bearer token — never bake production tokens into the bundle.
- Clients never send `owner` on POST/PUT; API assigns it.

## Webapp

- Native `fetch` + thin `apiClient` — no axios.
- TanStack Query for server state; react-hook-form + zod for forms.
- Tailwind CSS, no UI kit.
- Collection routes behind `<AuthGate>`.

## MCP (AI agent access)

- **REST ≠ MCP.** Existing `/guitar` routes stay for the webapp; MCP is an adapter layer.
- **Phase 1:** local stdio MCP server in `mcp/` (this repo), calls REST API over HTTPS.
- **Phase 2:** new `/mcp` route on existing API Gateway + Node Lambda (in `wbits/guitars`), same Cognito auth. End goal: any guitars.com user with an account.
- Phase 1 tool handlers should be **transport-agnostic** so Phase 2 can reuse them.
- Market crawl: no REST trigger today; optional MCP tool dispatches GitHub Actions `crawl.yml` in `wbits/guitars`.

## Agent documentation

- **`AGENTS.md`** at repo root points to **`.agents/`** for all agent context.
- Plans and configs that lived only in `~/.cursor/` should be mirrored under `.agents/`.
- Session notes in `.agents/sessions/YYYY-MM-DD.md`.

## Git

- Commits and deploy only on user request.
- Do not commit `.env`, tokens, or secrets in example configs.
