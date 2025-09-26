# ShopX Frontend

The store front experience of the ShopX platform, implemented with **Next.js 14 (App Router)**, **React 18**, **TypeScript**, **MobX**, and **GraphQL**. It consumes the GraphQL API served by `e-commerce-backend` (Oracle DB + Redis) and delivers a fully interactive retail journey: campaign-driven homepage, product exploration, cart & wishlist management, authentication, and checkout flows.

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
- **Product detail** – price, description, reviews, recommendations, CTA buttons (“Add to cart”, “Save for later”).
- **Cart workflow** – guest cart stored in local storage with automatic migration once the user authenticates; authenticated carts live server-side with Redis-backed caching and are pulled via the new `getUserContext` aggregate immediately after login.
- **Wishlist** – same hybrid behaviour as cart, with Redis-backed persistence and instant refresh driven by `getUserContext`.
- **Authentication** – login and registration screens with MobX-managed session state; JWT is stored and reattached through a shared GraphQL client.
- **Checkout** – shipping address capture (with address book reuse), order creation, and payment mutation (card/cash/bank transfer) tied to the backend schema.
- **Notification system** – toast stack for success/error/info feedback, used consistently across flows.

---

## Project Structure
```
shopx-frontend/
├── Dockerfile                 # Multi-stage build for production bundles
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router routes
│   │   ├── (routes)/          # Pages (products, cart, wishlist, checkout, auth, CMS)
│   │   └── layout.tsx         # Root layout + Providers
│   ├── components/
│   │   ├── home/              # Homepage sections (hero, highlights, etc.)
│   │   ├── layout/            # Header, footer, shell
│   │   ├── products/          # Catalog widgets (cards, filters, grids)
│   │   └── ui/                # Surface, Button, SectionHeader, toasts, etc.
│   ├── graphql/operations.ts  # Centralised GraphQL queries & mutations
│   ├── hooks/                 # UI-level hooks (debounced search, store access)
│   ├── lib/                   # GraphQL client helper
│   ├── stores/                # MobX root store + domain stores (cart, wishlist, CMS, product, user, UI)
│   ├── styles/                # SCSS modules and design tokens
│   └── types/                 # Shared TypeScript models (products, CMS, auth)
└── README.md
```
MobX stores orchestrate API calls and stateful logic. Components consume them via `useStores()` creating a clear separation between data layer and presentation.

---

## Development Notes
- **Internationalisation**: The UI is currently English-only. Future translation work can leverage Next’s built-in routing or third-party libs; all copy now lives in English for easier globalization.
- **CMS integration**: CMS pages are cached via Redis in the backend. On the frontend we memoize responses in the `CmsStore` to avoid redundant queries during a session.
- **Session hydration**: `UserStore` issues a `GET_USER_CONTEXT` query after login or when a persisted session is detected, ensuring carts, wishlists, and profile data stay in sync with Redis-backed caches.
- **Design tokens**: Global palette, typography, and spacing live in `src/app/globals.scss`. Repurpose or swap with Tailwind/CSS-in-JS if necessary.
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
