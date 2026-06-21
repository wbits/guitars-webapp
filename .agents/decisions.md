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

## Collection visibility

- **“Show hidden” on owner collection list** — checkbox loads `includeHidden=true`; hidden guitars show a badge on mosaic tiles.
- **Hide/show on owned guitar detail** — toggle without deleting; hidden state shown in hero.

## Add guitar (BYOK)

- **Photo-first wizard** when BYOK is configured and usable — photo step → analyzing → review form with “Suggested” badges on AI fields.
- **Manual form fallback** — when BYOK unavailable or user chooses manual path.
- **Default off gallery** — “Add to collection gallery” unchecked by default on photo-first create; calls hide after create.

## Similar guitars

- **Tag cloud + similar page** — detail page “More like this…” when analysis tags exist; source guitar included in results.

## Agent commands

- **`/cpd`** — commit, push, deploy; full workflow in API repo [`.cursor/skills/cpd/SKILL.md`](../../guitars/.cursor/skills/cpd/SKILL.md).

## Git

- Commits/deploy on user request only.
- No secrets in repo.
