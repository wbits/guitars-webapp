# Decisions — guitars-webapp

## Scope

- **Frontend-only repo.** API, crawler, MCP → [`wbits/guitars`](https://github.com/wbits/guitars).
- **API contract mirror** in `src/domain/` (zod). Server source of truth is Go domain.

## Webapp

- Native `fetch`, TanStack Query, react-hook-form + zod, Tailwind.
- Prices: minor units in API; major units in UI via `src/lib/money.ts`.
- Cognito ID token for production auth.

## Git

- Commits/deploy on user request only.
- No secrets in repo.
