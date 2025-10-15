# ShopX Frontend

The store front experience of the ShopX platform, implemented with **Next.js 14 (Pages Router)**, **React 18**, **TypeScript**, **MobX**, and **GraphQL**. It consumes the GraphQL API served by `e-commerce-backend` (Oracle DB + Redis) and delivers a fully interactive retail journey: campaign-driven homepage, product exploration, cart & wishlist management, authentication, and checkout flows.

---

## Environments

| Surface              | URL / Port           | Purpose                               |
|----------------------|----------------------|---------------------------------------|
| Frontend (this app)  | `http://localhost:3100` | Customer-facing store experience       |
| Admin portal         | `http://localhost:3000` | Internal merchandising & CMS tooling  |
| GraphQL backend      | `http://localhost:4000/graphql` | Data source for both UIs              |

> ℹ️  Ports are coordinated across the monorepo: the admin portal stays on 3000 while the store front runs on 3100 to avoid conflicts.

---

## Requirements
- Node.js **20.9+** (matches the backend’s minimum – use `nvm use` if an `.nvmrc` is present).
- Yarn Classic (`npm install --global yarn@1`) – the repo is optimized for Yarn 1 workspaces.
- A running instance of `e-commerce-backend` (Oracle + Redis). Ensure the GraphQL endpoint is reachable; seed `sql_script.txt` to populate sample data including CMS pages.

---

## Getting Started
```bash
# 1. Install dependencies
yarn install

# 2. Provide environment variables
cp .env.example .env.local   # adjust NEXT_PUBLIC_GRAPHQL_ENDPOINT if needed

# 3. Start the dev server
yarn dev                     # launches http://localhost:3100
```

Environment variables accepted at runtime (`.env`, `.env.local`, or `.env.production`):
```dotenv
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
NEXT_PUBLIC_SITE_NAME=ShopX
```
Any variable prefixed with `NEXT_PUBLIC_` is automatically exposed to the browser. For private values (e.g. feature flags) use backend-driven storage instead.

---

## Feature Overview
- **CMS-driven homepage** – dynamic hero, highlights, featured products, new arrivals, and a rich-text block fed by the admin portal’s WYSIWYG editor.
- **Catalog browsing** – server-sourced product list with category filtering, instant search, wishlist toggles, and graceful loading states.
- **Product imagery** – all catalog, cart, and wishlist views render the backend-hosted `/products/:id/image` URL returned by GraphQL for a consistent media pipeline.
- **Product detail** – price, description, reviews, recommendations, CTA buttons (“Add to cart”, “Save for later”).
- **Cart workflow** – guest cart stored in local storage with automatic migration once the user authenticates; authenticated carts live server-side with Redis-backed caching and are pulled via the new `getUserContext` aggregate immediately after login.
- **Wishlist** – same hybrid behaviour as cart, with Redis-backed persistence and instant refresh driven by `getUserContext`.
- **Authentication** – login and registration screens backed by HTTP-only session cookies; MobX only persists lightweight profile data and automatically refreshes the server context after sign-in.
- **Admin impersonation** – dedicated `/impersonate` route redeems short-lived tokens issued from the admin portal and swaps the active session cookie before redirecting to the homepage.
- **Checkout** – shipping address capture (with address book reuse), order creation, and payment mutation (card/cash/bank transfer) tied to the backend schema.
- **Notification system** – toast stack for success/error/info feedback, used consistently across flows.

---

## Project Structure
```
shopx-frontend/
├── Dockerfile                 # Multi-stage build for production bundles
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header/        # Header.tsx + Header.module.scss + index.ts
│   │   │   ├── Footer/        # Footer + styles
│   │   │   └── LanguageSelector/
│   │   └── ui/                # Button, Surface, SectionHeader, ToastStack, etc.
│   ├── config/                # Environment helpers
│   ├── graphql/               # Operations & generated types
│   ├── hooks/                 # UI-level hooks (disclosure, debounced search)
│   ├── i18n/                  # Translation provider & helpers
│   ├── lib/                   # GraphQL client helper, utilities
│   ├── pages/
│   │   ├── *.page.tsx         # Route entrypoints (e.g. index.page.tsx, cart/index.page.tsx)
│   │   └── <route>/           # Page implementations + `Route.ts` metadata
│   ├── routes/                # Centralised navigation metadata & helpers
│   ├── stores/                # MobX stores (cart, wishlist, cms, user, etc.)
│   ├── styles/                # Design tokens, mixins, globals (SCSS)
│   └── types/                 # Shared TypeScript models & SCSS declarations
└── README.md
```
Route files use the custom extension pattern configured in `next.config.mjs` (`pageExtensions: ['page.tsx', ...]`). A thin `*.page.tsx` re-export lives next to each page module (for example `src/pages/cart/index.page.tsx` re-exports `./CartPage`) so the Next.js router stays lightweight while the implementation remains in a dedicated folder. MobX stores orchestrate API calls and stateful logic, which components consume via `useStores()` to keep data and presentation decoupled.

---

## Development Notes
- **Internationalisation**: The UI is currently English-only. Future translation work can leverage Next’s built-in routing or third-party libs; all copy now lives in English for easier globalization.
- **CMS integration**: CMS pages are cached via Redis in the backend. On the frontend we memoize responses in the `CmsStore` to avoid redundant queries during a session.
- **Session hydration**: `UserStore` issues a `GET_USER_CONTEXT` query after login or when a persisted session is detected, ensuring carts, wishlists, and profile data stay in sync with Redis-backed caches. If the backend revokes the session (e.g., via the admin portal), shared helpers detect the `Authentication required` error, clear local state, and prompt the shopper to sign back in.
- **Design tokens & SCSS**: Global palette, typography, and spacing live in `src/styles/globals.scss`. Sass imports use the alias `@styles/...`, configured via `next.config.mjs` so component styles no longer rely on deep relative paths.
- **Custom App & Document**: The Pages Router entrypoints (`src/pages/_app.page.tsx` and `src/pages/_document.page.tsx`) host the providers and custom document markup directly—no intermediate exports required.
- **Typed routes**: `next.config.mjs` disables `typedRoutes` due to the custom linking strategy. Re-enable once all dynamic routes are upgraded to `Route` types.
- **Testing**: TypeScript compile (`tsc --noEmit`) is wired into CI. Add Playwright or Testing Library tests for end-to-end confidence.
- **Docker**: `yarn build` creates a production bundle inside `/app/.next`. The Dockerfile first builds with dependencies, then copies the minimal runtime image ready for `yarn start`.

---

## Operational Checklist
1. **Backend up & seeded** – ensures product/catalog/ CMS data is available.
2. **Environment set** – `NEXT_PUBLIC_GRAPHQL_ENDPOINT` points to the live GraphQL API.
3. **Run `yarn build`** – compiles the Next.js app for production.
4. **Run `yarn start`** – serves the compiled bundle on port 3100.

---

## Troubleshooting
| Symptom | Likely cause | Resolution |
|---------|--------------|------------|
| `ORA-28001` in backend logs | Oracle password expired | Update `.env` with a fresh password or enable automatic rotation (`DB_PASSWORD_ROTATE=true`). |
| CORS errors from frontend | Backend missing origin | Ensure `CORS_ALLOWED_ORIGINS` includes `http://localhost:3100` (adds automatically if variable is unset). |
| `node` engine mismatch | Local Node < 20 | `nvm use 20` or install a compatible Node.js version. |
| Empty catalog/homepage | Backend not seeded | Run `sql_script.txt` to repopulate sample data, including CMS pages. |

---

## Roadmap Ideas
- **i18n/Localization** – Integrate Next.js i18n routing and provide translation dictionaries.
- **Analytics instrumentation** – Hook events into your analytics stack (Segment, GA4, etc.).
- **Accessibility polish** – Conduct an a11y audit to refine keyboard navigation and ARIA coverage.
- **Offline-ready PWA** – Cache key assets and data for intermittent connectivity.
- **Payment provider integration** – Swap the mock GraphQL payment mutation for Stripe, Adyen, or Braintree.

---

## License
This project inherits the monorepo license. Review the root LICENSE file for details.
