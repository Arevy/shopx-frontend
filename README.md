# ShopX storefront

The customer-facing web app, built with **Next.js 15.5.28 (Pages Router), React 18.3.1, TypeScript, and MobX**. It consumes the GraphQL API in `e-commerce-backend` and does not connect directly to Oracle. This is an independent Git repository, not a package in a Yarn monorepo.

## Run this repository independently

Run the commands in this section from this repository root. The integration workspace is optional; provide reachable GraphQL/Redis endpoints for your own environment.

Server GraphQL proxy failures use structured operational logs with fixed messages and safe error codes; raw error objects and request payloads are excluded. The optional ShopX control-plane monitoring stack collects sanitized container output and gateway availability without adding a runtime dependency here. Configure it through the [control-plane observability guide](https://github.com/Arevy/shopx-control-plane/blob/master/docs/observability.md). Browser JavaScript errors and distributed traces are not collected in this phase.

This repository owns its source, lockfile, Dockerfile, tests, and [standalone Compose configuration](compose.yaml). It does not require the parent ShopX directory or sibling checkouts. Other services are accessed through configurable network endpoints and must implement the expected GraphQL/API contract; a different API schema requires a client adapter.

From this repository, create the private container configuration only if it does not already exist:

```bash
cp .env.docker.example .env.docker
```

Edit `.env.docker` for your external services, then run:

```bash
docker compose --env-file .env.docker up -d --build --wait
docker compose --env-file .env.docker ps
docker compose --env-file .env.docker logs --tail 80
docker compose --env-file .env.docker down
```

The standalone project has its own Compose name. Change `APP_PORT` if the workspace stack already occupies the default host port. `host.docker.internal` reaches services published on the host; `localhost` inside a container refers to that container. Use a reachable hostname for remote APIs/databases. Do not copy private environment files into images.

Set `GRAPHQL_UPSTREAM_ENDPOINT` to the backend and `REDIS_URL` to the desired cache instance. Set `SERVER_SERVICES_TOKEN` privately for cache tools. Product-image URLs and `SHOPX_PUBLIC_API_ORIGIN` must use an origin reachable by both the browser and the Next.js process; a backend returning `localhost` image URLs will not work with container-side image optimization unless that origin is routed appropriately. Use a shared public/LAN hostname for standalone deployments.

In the full local workspace, use the parent `docker-compose.yml` / `node scripts/compose.mjs up` instead. It orchestrates shared dependencies and configures service DNS centrally; it does not merge these Git repositories or require their standalone Compose projects to run alongside it.

## Start the application

Compose uses **Node 22.23.4** and installs Linux dependencies from `yarn.lock`. The Node engine is `>=22.23.4 <23`. On the Mac, run `nvm install && nvm use` before `yarn install --frozen-lockfile`.

From this repository in the existing ShopX workspace:

```bash
cd ..
node scripts/compose.mjs up
```

Open **http://localhost:3100** or **http://shopx.localhost**. The workspace README (`../README.md`, integration workspace only) covers Oracle, Redis, and the other applications. Admin uses 3000, GraphQL 4000, and RN web 8083. Parent scripts are not included in a standalone clone.

Compose mounts `src/`, `public/`, and `local/` for live recompilation. To run `npm run dev` on the Mac, first stop Compose's `frontend` service to free port 3100, and keep the backend available. In a fresh checkout, copy `.env.example` to `.env.local` only if that file does not already exist, then adjust its values. The legacy workspace setup updates existing configuration rather than requiring it to be discarded.

## Catalog and visual identity

The storefront uses graphite surfaces and lime actions, with the shared visual values in [SCSS tokens](src/styles/_tokens.scss). Product photos use a white stage and `contain` sizing so the complete item stays visible. Product cards, homepage collections, navigation, cart and detail layouts adapt to narrow screens. The footer links to actual routes and published CMS content.

Current product prices are displayed in **EUR**, using the selected interface language. VAT labels and catalog actions are translated in all six locale packs. The backend owns the real-model catalog, photos and dated retail reference prices; this app does not fetch supplier pages or substitute mock products. See the backend catalog maintenance guide when working in the full workspace. Historical order amounts are not converted by a display-format change.

New clients share the graphite/lime identity with admin and RN; each repository owns its tokens and can be deployed independently. Configure a platform's branding in its own theme rather than importing another checkout at runtime.

## Configuration

In Compose, the Next.js server uses `http://backend:4000/graphql` and `redis://redis:6379/1`; browsers use `/api/serverSideServices/graphql` on their own origin. Nginx routes this path to Next.js. `SHOPX_PUBLIC_API_ORIGIN` configures the image origin allowed by Next.js.

For standalone host development, settings are resolved by [env.ts](src/config/env.ts) and [apiEndpoints.ts](src/config/apiEndpoints.ts). Example configuration with the proxy enabled:

```dotenv
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
NEXT_PUBLIC_SITE_NAME=ShopX
NEXT_PUBLIC_USE_SERVER_SERVICES=true
NEXT_PUBLIC_SERVER_SERVICES_BASE_PATH=/api/serverSideServices
GRAPHQL_UPSTREAM_ENDPOINT=http://127.0.0.1:4000/graphql
REDIS_CACHE_PREFIX=shopx:frontend
REDIS_CACHE_TTL=300
```

- `.env.example` sets `NEXT_PUBLIC_USE_SERVER_SERVICES=false`; the current workspace enables it. With `true`, browsers use the Next.js proxy; with `false`, they use the GraphQL endpoint directly.
- `GRAPHQL_UPSTREAM_ENDPOINT` is the backend destination for Next.js. Pointing it back to the Next.js proxy would create a loop.
- `REDIS_URL` is `redis://redis:6379/1` in Compose. The legacy host setup requires a separately configured Redis endpoint if Compose Redis is not exposed to it.
- `SERVER_SERVICES_TOKEN` protects cache tools and stays on the server. A development fallback exists; use a private value in a deployed environment.
- `NEXT_PUBLIC_*` values are exposed to browsers and embedded during the Next.js build. Changing them for production requires a rebuild. Never put credentials in these variables.

The local database is `oracle19 / ORCLCDB / AREVY`, accessed through the backend. Investigate an empty catalog by checking the database identity and proxy, not by executing the destructive `sql_script.txt`.

The [backend SQL guide](https://github.com/Arevy/e-commerce-backend/blob/master/README.md#schema-and-sql-script) explains the corrected demo reset and isolated tests. The new constraints have not been migrated into `AREVY`; starting the storefront requires no data reset.

### Starter data and local access

The backend owns the [versioned general-store pack and additive installer](https://github.com/Arevy/e-commerce-backend/blob/master/docs/data-seeding.md). The recovered workspace now includes 45 products in 14 categories and seven published CMS pages, including new tech, home and lifestyle content. The storefront reads these records through GraphQL; startup does not seed or reset the database.

The private workspace guide at `../docs/local-accounts.private.md` lists two new `CUSTOMER` accounts with saved addresses, carts, wishlists and pending orders. It also lists the `SUPPORT` profiles used by the admin portal. Existing accounts and passwords were preserved. The guide is machine-local and is not part of a standalone clone; independent platforms provide their own compatible backend, data, credentials and cache/session isolation.

## Features and routes

| Route                           | Existing implementation                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| `/`                             | Products and CMS content, hero/highlight sections, featured products, and rich-text content |
| `/products`, `/products/[id]`   | Catalog, search/category filters, product details, reviews, and shopping actions            |
| `/auth/login`, `/auth/register` | Backend login and registration                                                              |
| `/account`                      | Profile, saved addresses, and account information                                           |
| `/cart`, `/wishlist`            | Guest data stored locally and synchronized with the backend after login                     |
| `/checkout`                     | Saved/new profile address, order creation, and payment registration                         |
| `/cms/[slug]`                   | Published CMS content                                                                       |
| `/impersonate`                  | Redeem a short-lived ticket issued by support                                               |

The UI includes i18next resources for **en, ro, fr, de, ar, he**, a language selector, and RTL direction support for Arabic/Hebrew. Translation resources do not establish complete RTL layout verification.

Product imagery comes from GraphQL `image.url`, served by the backend at `/products/:id/image`. Missing images use UI fallbacks, not mock product records. Toast notifications provide success/error/information feedback.

## Data, sessions, and checkout

[ApiService](src/lib/apiService.ts) owns transport and session errors. [MobX stores](src/stores) own authentication, catalog, cart, wishlist, CMS, and UI state. `UserStore` hydrates `getUserContext` after login or when restoring a persisted identity; the server remains authoritative. Revoked/expired sessions clear local session state and require another login.

`CartStore` owns checkout submission and cart synchronization; `UserStore` handles account, impersonation, and address operations. Components consume store loading/error state through `useStores()` instead of duplicating business logic. `CmsStore` also memoizes pages during the browser session; this is separate from Redis caches.

The default shopper cookie is `sid`. Sign in again after changing databases or revoking sessions. The new private general-store accounts belong to recovered `AREVY`; older `SHOPX_LOCAL` credentials belong to a separate database.

Checkout saves addresses to the profile and submits product selections to the backend. The backend calculates the order total from Oracle and that total is used for payment registration. The resulting payment is **PENDING**, without a bank processor. Orders do not yet store address snapshots. Unlike RN checkout, the storefront does not persist a pending order for payment retry; handling intermediate failures remains open.

## GraphQL caching

The proxy caches only eligible anonymous public queries allowed by [operationMetadata.ts](src/server/graphql/operationMetadata.ts). Requests containing cookies or Authorization headers, private queries, and mutations reach the backend.

The server derives `graphql:public-v2:...` keys from queries and variables under the application's Redis prefix. Client `cacheKey` / `x-cache-key` values do not determine the stored key. `REDIS_CACHE_TTL` defaults to 300 seconds; individual calls can request their own TTL. Old names such as `products:list` and `cms:page` are not the actual storage keys.

Existing store options still express caching intent: product lists request 600 seconds, categories 600 seconds, and product details/CMS 900 seconds. Helpers such as `createCacheKey` remain in the client, but server eligibility and key derivation are authoritative. New private operations must not become cacheable just because a caller provides a key.

Backend cache invalidation does not remove responses already cached by Next.js. After catalog/CMS writes, anonymous responses may remain until their TTL expires or the relevant proxy cache is explicitly invalidated.

## Cache tools

All routes below require `?api=<SERVER_SERVICES_TOKEN>` and operate only on the storefront Redis prefix, normally `shopx:frontend`. Supply the private token locally; do not commit it or paste it into shared logs.

| Route, relative to the storefront                     | Methods      | Behavior                                                               |
| ----------------------------------------------------- | ------------ | ---------------------------------------------------------------------- |
| `/api/serverSideServices/cache`                       | GET          | List actual keys, without the application prefix                       |
| `/api/serverSideServices/cache`                       | DELETE       | Clear all entries under this application's prefix                      |
| `/api/serverSideServices/cache`                       | POST         | `flushAll`, `flushNamespace`, or `flushKey`                            |
| `/api/serverSideServices/cache/[key]`                 | GET / DELETE | Inspect value/TTL or remove one URL-encoded key                        |
| `/api/serverSideServices/cache/namespace/[namespace]` | GET / DELETE | List or remove matching keys; a trailing wildcard is added when needed |

With `SERVER_SERVICES_TOKEN` already set in your local shell, list keys:

```bash
curl -sS --get --data-urlencode "api=$SERVER_SERVICES_TOKEN" http://localhost:3100/api/serverSideServices/cache
```

Use the exact returned key, without adding `shopx:frontend:`. In the following POST body, replace the placeholder with a key from that listing. The API's field is named `namespace` even for a single-key deletion:

```json
{ "action": "flushKey", "namespace": "<exact-key-from-listing>" }
```

POST that body to `/api/serverSideServices/cache?api=<token>`. `{"action":"flushNamespace","namespace":"graphql:public-v2"}` removes the current public-query namespace; `{"action":"flushAll"}` clears the app prefix. These operations change cache state, not Oracle records. Admin has a separate prefix and [its own tools](https://github.com/Arevy/ShopX-Admin-Portal/blob/master/README.md#cache-tools).

## Commands and verification

On a fresh clone, install from `yarn.lock` and run `npm run build` before the separate `npx tsc --noEmit` check. Next generates `.next/types/routes.d.ts`, referenced by `next-env.d.ts`; generated `.next/` files stay outside Git.

| Command                  | Purpose                                                             |
| ------------------------ | ------------------------------------------------------------------- |
| `npm run dev`            | Next.js development on port 3100                                    |
| `npm run build`          | Production Next.js build, including configured checks               |
| `npm start`              | Runs `prestart` (`next build`), then serves on 3100                 |
| `npx tsc --noEmit`       | Separate TypeScript check                                           |
| `npm run lint`           | ESLint through `next lint`                                          |
| `npm run test:contracts` | Three tests for public-cache isolation and runtime homepage loading |

The current three contract tests and production build passed on October 27, 2026, including runtime homepage loading. The earlier October 12 run had two contract tests; lint passed during the October 11 checks. Workspace `../scripts/browser-smoke.cjs` and `../scripts/smoke.mjs` create temporary QA data and require valid SUPPORT credentials for the active database. API smoke passes against recovered `AREVY`, covering authenticated commerce and private-cache isolation. Chrome passed storefront login and the shared backend wishlist. `../scripts/verify-data.mjs` verifies the new accounts and persisted starter content through the storefront proxy. See the workspace verification record (`../docs/development-status.md`, integration workspace only) for limits; API checkout evidence does not by itself prove every storefront checkout interaction.

`next build` and `next dev` use the same `.next` directory. Stop this repository's development server before building, then restart it afterward.

## Troubleshooting

| Symptom                                 | Check                                                                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Empty catalog or homepage               | Backend `/health/ready`, active Oracle schema, public GraphQL query, then proxy response; do not reset recovered data          |
| GraphQL/CORS error                      | Check proxy upstream reachability. For direct browser requests, verify `CORS_ALLOWED_ORIGINS` in the backend                   |
| Images fail in Next.js optimization     | The public image origin must be allowed by Next.js and reachable from its container; Compose defaults to `api.shopx.localhost` |
| Login expires or support revokes access | Sign in again; the cookie must identify an active backend session                                                              |
| `ORA-28001`                             | Follow the backend's [password recovery guidance](https://github.com/Arevy/e-commerce-backend/blob/master/README.md#expired-oracle-passwords)                    |
| Node engine mismatch                    | Select Node 22 for the workspace and reinstall dependencies for that runtime                                                   |
| Stale content after admin changes       | Check browser store state, backend cache, and Next.js public cache separately                                                  |

## Code organization and Docker

- [src/pages](src/pages): `*.page.tsx` route entrypoints and `*.api.ts` API routes, configured in [next.config.mjs](next.config.mjs). Thin route files delegate to page modules; `_app.page.tsx` and `_document.page.tsx` own providers and document markup.
- [src/routes](src/routes): navigation metadata; [src/hooks](src/hooks) and [src/components](src/components): store access and shared UI.
- [src/stores](src/stores), [src/graphql](src/graphql), [ApiService](src/lib/apiService.ts): data flows.
- [src/server](src/server): Redis and the GraphQL cache/proxy.
- [src/i18n](src/i18n), [local](local), [src/styles](src/styles): translations and SCSS. Shared styles use the `@styles` alias; `experimental.typedRoutes` is currently disabled in Next.js configuration; preserve existing route/link conventions when adding screens.

The Dockerfile uses Node 22 bookworm-slim. Compose selects `development` with `next dev`; `production` builds the app and runs the existing build through Next CLI without `prestart`. `NEXT_PUBLIC_*` must be correct at build time. Compose uses recovered `AREVY` and its own persistent Redis. Public catalog/connectivity were checked through port 3100 and Nginx, including Chrome.

## Remaining work

Payment-provider integration, shipping/inventory, checkout recovery/idempotency, complete accessibility and RTL audits, analytics, and optional offline/PWA support remain development directions. Translation infrastructure already exists; adding it is no longer a pending task. See the workspace status (`../docs/development-status.md`, integration workspace only) for verified scope. No workspace license file is present; the older README's claim of an inherited monorepo license was not substantiated.

## Managed platform configuration

The optional factory deployment reuses this production image across independent stores. Set the server-only `SHOPX_PLATFORM_API_ORIGIN` to that store's backend origin and `SHOPX_PLATFORM_ID` to its immutable ID. Keep `GRAPHQL_UPSTREAM_ENDPOINT` and Redis/cache configuration scoped to that same store.

`/api/platform-config` checks the backend's identity and forwards public configuration only. A MobX `PlatformStore` refreshes on focus and every 30 seconds while visible, updates the business name and maps branding to the existing SCSS tokens. No setting is inferred from an incoming tenant header. When the optional server settings are absent, the endpoint returns `configuration: null` and the original branding remains.

`/api/products/:id/image` proxies managed relative product-image URLs to the configured backend, including requests from Next's image optimizer. The destination is server configuration, never a client-provided URL. Existing absolute image URLs remain supported.

The Docker production target also supports repositories with an empty `public/` directory. There are no sibling build contexts or imports. The local integration workspace's factory controls provisioning; cloning this repository alone still works with an existing compatible GraphQL backend.

## Runtime business customization

Compatible managed stores can publish `experience` alongside their public branding: HTTPS logo, tagline, hero heading/description, announcement, footer/contact, typography, corner style, catalog density and featured/new-arrival/editorial visibility. Optional blank copy falls back to existing translations; supplied business copy is plain text and is not translated automatically. The HTTPS logo loads directly in the browser, not through a backend URL fetcher.

MobX validates settings before applying them. Public configuration refreshes on focus and every 30 seconds while visible; no frontend rebuild is needed to publish content or theme changes. Missing `experience` preserves default presentation. Products, accounts and transactions still come from the commerce API. Factory configuration changes never reseed the catalog or change a store's backend identity.

The central editor and revision/retry workflow live in the independently deployed control console. This repository does not import that repository or require its management API at runtime.

The homepage loads its catalog from the runtime backend with `getServerSideProps`. Reusable Docker images no longer carry an empty build-time homepage that waits for ISR regeneration on the first visit. No authenticated session is forwarded by this public homepage loader.

## Security maintenance

The reviewed baseline is Next.js 15.5.28 with React 18 Pages Router, sharp 0.35.5 and Node 22.23.4. Image optimization limits each fetched response to 6 MiB and its disk cache to 100 MiB. Keep the lockfile and production image aligned when updating dependencies. Rebuild and recreate running containers; updating a manifest alone does not patch a running server.
