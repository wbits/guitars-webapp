# Backlog — ideas and planned work

## MCP server — Phase 1

- [x] Scaffold `mcp/` package (SDK, tsconfig, stdio entrypoint)
- [x] Node `api-client.ts` with env-based auth
- [x] Tools: `create_guitar`, `update_guitar`, `list_guitars`, `get_guitar`
- [x] Optional tool: `trigger_market_crawl` via `gh workflow run`
- [x] `mcp/README.md` + example Cursor MCP config
- [x] Vitest tests for config, API client, tool input mapping

## MCP server — Phase 2 (future, `wbits/guitars` repo)

- [ ] API Gateway route `POST /mcp` (Streamable HTTP)
- [ ] Node.js Lambda with MCP SDK
- [ ] Reuse Cognito JWT authorizer — per-user collection scoping
- [ ] User-facing docs: connect any MCP client with Cognito token

## Webapp

- [ ] UI to toggle `marketCrawlEnabled` (backend endpoint exists; no webapp hook yet)
- [ ] (Add items as they come up)

## Backend (track in `wbits/guitars`, not here)

- [ ] `POST /admin/market-crawl` REST endpoint (alternative to GitHub Actions trigger)
