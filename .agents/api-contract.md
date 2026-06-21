# API contract (client view)

The GuitarCollection HTTP API is implemented in [`wbits/guitars`](https://github.com/wbits/guitars). This repo defines the **client contract** in `src/domain/` (zod) and `src/api/` (fetch helpers).

All requests:

- `Accept: application/json`
- `Authorization: Bearer <token>`
- `Content-Type: application/json` (when body present)

Errors: non-2xx responses include `{ "error": "..." }` when available. `401` triggers session invalidation in the webapp.

## Guitars

| Method | Path | Client | Description |
|--------|------|--------|-------------|
| GET | `/guitar` | `listGuitars()` | List guitars owned by the signed-in user |
| GET | `/guitar/{id}` | `getGuitar(id)` | Single guitar |
| POST | `/guitar` | `createGuitar(input)` | Create |
| PUT | `/guitar/{id}` | `updateGuitar(id, input)` | Full replace |
| DELETE | `/guitar/{id}` | `deleteGuitar(id)` | Delete |

Schema: [`src/domain/guitar.ts`](../src/domain/guitar.ts).

### POST/PUT body (`GuitarInput`)

Clients **do not send** `id` or `owner`; the API assigns those.

| Field | Type | Notes |
|-------|------|-------|
| `brand` | string | Required |
| `typeName` | string | Required |
| `buildYear` | int | 1800 … current year + 1 |
| `priceAmount` | int | **Minor units** (cents) |
| `priceCurrency` | `"EUR"` \| `"USD"` | |
| `pictures` | string[] | Absolute http(s) URLs |
| `coverPictureIndex` | int | Index into `pictures` for mosaic thumbnail |
| `serialNumber` | string? | |
| `color` | string? | |
| `country` | string? | |
| `factory` | string? | |
| `description` | string? | Optional HTML |

The UI accepts decimal major units and converts via [`src/lib/money.ts`](../src/lib/money.ts).

### Response (`Guitar`)

Same fields as input, plus:

- `id` — server-generated
- `owner` — Cognito user id (`sub`); optional on legacy records

### Legacy records

Guitars created before per-user ownership have no `owner`. They are hidden from the list until the signed-in user opens them (direct link) and saves once from the edit form, which backfills ownership.

## Current user

| Method | Path | Client | Description |
|--------|------|--------|-------------|
| GET | `/me` | `getCurrentUser()` | Profile + `isAdmin` flag |
| PATCH | `/me` | `updateProfile({ username })` | Update username |

Schema: [`src/api/me.ts`](../src/api/me.ts).

## Collections

| Method | Path | Client | Description |
|--------|------|--------|-------------|
| GET | `/collections` | `listCollectionOwners()` | All collection owners (public directory) |
| GET | `/collections/{userId}/guitar` | `listUserGuitars(userId)` | Another user's guitars |
| DELETE | `/collections/{userId}/market-log` | `clearCollectionMarketLogs(userId)` | Admin: clear market logs |

`PATCH /collections/{userId}/market-crawl` exists on the backend (admin toggle for crawler opt-in) but has no webapp UI yet.

Schema: [`src/api/collections.ts`](../src/api/collections.ts).

## Market logs

| Method | Path | Client | Description |
|--------|------|--------|-------------|
| GET | `/guitar/{id}/market-log` | `listMarketLogs(guitarId)` | Marketplace price observations |

Populated by the weekly crawler in `wbits/guitars`. Schema: [`src/domain/marketLog.ts`](../src/domain/marketLog.ts).

## Uploads

| Method | Path | Client | Description |
|--------|------|--------|-------------|
| POST | `/upload/presign` | `presignUpload(contentType)` | Get presigned URL for picture upload |

Flow: presign → PUT to S3 URL → append `publicUrl` to guitar `pictures[]`.

Schema: [`src/api/uploads.ts`](../src/api/uploads.ts).
