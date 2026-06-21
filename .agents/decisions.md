# Decisions — guitars-webapp

## Scope

- **Frontend-only repo.** API, crawler, MCP → [`wbits/guitars`](https://github.com/wbits/guitars).
- **API contract mirror** in `src/domain/` (zod). Server source of truth is Go domain.

## Webapp

- Native `fetch`, TanStack Query, react-hook-form + zod, Tailwind.
- Prices: minor units in API; major units in UI via `src/lib/money.ts`.
- Cognito ID token for production auth.

## guitars-assistant (viewer)

- **Chat starts closed** — only the “Ask about this collection” button until the user opens the panel; no `defaultOpen` on load.
- **Voice input** — browser speech API (mic toggle) on the collection assistant; auto-send on final transcript when supported.
- **Client-side filtering** — assistant response drives `filterGuitars` on the loaded collection; no API list filters in v1.

Tiers, photo analysis, BYOK: see API repo [`.agents/decisions.md`](https://github.com/wbits/guitars/blob/master/.agents/decisions.md).

## Git

- Commits/deploy on user request only.
- No secrets in repo.
