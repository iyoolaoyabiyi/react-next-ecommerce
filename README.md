# Audiophile E‑commerce – Technical Documentation

## 1. Overview

Audiophile is a Next.js 10 storefront for a premium audio brand. It delivers statically generated category and product pages, a Redux-powered shopping cart, and a verified checkout flow that persists orders to a Convex backend and dispatches transactional email. Chakra UI provides design tokens and layout primitives, while React Hook Form handles form state. The codebase follows an atomic design-inspired component hierarchy (`atoms`, `molecules`, `organisms`, `templates`) to promote reuse and clear separation of concerns.

## 2. Technology Stack

- **Framework**: Next.js 10 (Pages Router, SSG + API routes)
- **Language**: TypeScript (strict mode)
- **UI Layer**: React 17, Chakra UI 1.x, Framer Motion for animations
- **State Management**: Redux Toolkit with persisted cart storage and Chakra `useDisclosure` for modal state
- **Forms**: React Hook Form (with custom Chakra form controls)
- **Data Layer**: Static JSON product catalog (`src/data/products.json`) accessed via utility helpers
- **Backend Integrations**: Convex (order persistence) and Nodemailer (order confirmation email)
- **Testing/Tooling**: ESLint, Prettier, custom integration scripts under `tests/`

## 3. Project Structure

```text
src/
  components/         # Atomic component library (flattened .tsx files per component)
  constants/          # Shared constants (e.g., shipping fees)
  data/               # Static product catalog (JSON)
  emails/             # Templated transactional email content
  hooks/              # Reusable hooks (e.g., cart totals)
  lib/                # Integration logic (Convex client, email sender)
  models/             # Domain typings (Product, Order, CartItem)
  pages/              # Next.js routes (static + dynamic + API endpoints)
  store/              # Redux store slices and context providers
  styles/             # Chakra theme configuration and component overrides
  utils/              # General utilities (product helpers, local storage)
tests/                # Node-based integration scripts for Convex and email flows
```

Components follow atomic design naming. After the recent flattening, each component resides directly under its tier folder (e.g., `components/atoms/Logo.tsx`), simplifying imports (`components/atoms/Logo`) and eliminating `index.tsx` indirection.

## 4. Routing and Data Flow

- **Static Pages**
  - `pages/index.tsx`: Home page template (`components/templates/HomePage`) with curated hero, promotions, and category links.
  - `pages/[category]/index.tsx`: Category listing generated via `getStaticPaths` and `getStaticProps` using `utils/products`.
  - `pages/[category]/[slug].tsx`: Product detail pages with gallery, features, and related products.
  - `pages/checkout/index.tsx`: Checkout experience with billing/shipping form, payment selection, and cart summary.
  - `pages/order-confirmation.tsx`: Displays receipt based on Convex lookup or session storage fallback.

- **API Routes**
  - `pages/api/checkout.ts`: Validates incoming checkout payloads with Zod, creates the order in Convex, and triggers confirmation email sending.
  - `pages/api/orders/[id].ts`: Fetches a stored order for client-side confirmation or debugging tools.

SSG keeps the storefront performant. Dynamic routes rely on `utils/products` to translate the static JSON catalog into typed product DTOs. Use `utils/products.getProductsPaths()` to expand the SKU set.

## 5. State Management

- **Redux Toolkit Store (`src/store/index.ts`)**
  - `CartSlice`: Manages cart line items and handles persistence to `localStorage` via `utils/localStorage.saveCart`.
  - `UISlice`: Tracks mobile navigation state.
  - Selectors: exported helpers (`cartItems`, `totalAmount`, `totalQuantity`, `isNavOpen`) ensure component decoupling from slice internals.

- **Modal Context (`src/store/ModalContextProvider.tsx`)**
  - Uses Chakra `useDisclosure` for cart and checkout modals.
  - Injected at the top-level `_app.tsx`, providing `useModal()` to any component needing modal state.
  - Locks page scrolling when modals are open.

- **Custom Hooks**
  - `useCartTotals` computes subtotal, shipping, tax, and grand total from the Redux cart.

## 6. UI Composition

Key components include:

- **Atoms**: minimal UI primitives (Logo, MenuIcon, ProductQuantity, Radio, etc.).
- **Molecules**: structured pieces combining atoms (NavLinks, CartItem, ProductGallery, Summary).
- **Organisms**: page sections (Header, Footer, CheckoutForm, CartModal, ProductDetails).
- **Templates**: full-page compositions orchestrating organisms for specific routes.

Atoms and molecules are Chakra-first components but abstract away design details. Organisms encapsulate business logic (e.g., `CheckoutForm` handles form validation and API submission) while templates orchestrate page-level layout and metadata (`Head` tags).

## 7. Styling System

- Chakra theme lives in `src/styles/theme.ts` and extends:
  - Custom color palette (`accent`, `bg`, `textLight`, etc.)
  - Typography (Manrope for headings/body)
  - Component style overrides (`styles/components/button.ts`, `input.ts`, `text.ts`)
  - Global styles for focus, headings, and layout defaults
- Use Chakra responsive props (object syntax) throughout components.
- Animations rely on Framer Motion where needed (e.g., hero reveal, best gear showcase).

## 8. Checkout Workflow

1. User submits `CheckoutForm`.
2. Form validated client-side via React Hook Form; shipping fee pulled from `constants/fees`.
3. Payload posted to `/api/checkout` (typed by `models/Order`).
4. API route:
   - Validates payload with Zod.
   - Persists to Convex via `lib/convex.createOrderInConvex`.
   - Fetches saved order (ensuring email payload matches persisted data) and triggers `lib/email.sendOrderConfirmationEmail`.
5. Client clears cart, stores confirmation payload in `sessionStorage`, and redirects to `/order-confirmation?orderId=...`.
6. Confirmation page fetches by order id and renders summary (leveraging `SummaryItem`, `SummaryLine` molecules).

## 9. Integrations

- **Convex (`src/lib/convex.ts`)**
  - Caches the HTTP client per runtime.
  - Normalizes base URL from `CONVEX_BASE_URL`, `NEXT_PUBLIC_CONVEX_URL`, or `CONVEX_DEPLOYMENT`.
  - Supports secure calls via `CONVEX_FUNCTION_KEY`.
  - Provides helper functions `createOrderInConvex` (mutation) and `getOrderFromConvex` (query).

- **Email (`src/lib/email.ts`)**
  - Lazily loads environment variables from `.env` / `.env.local` when running server-side.
  - Configures a Nodemailer transporter using `SMTP_*` credentials.
  - Builds the email subject/body from `emails/orderConfirmationTemplate.ts`.

## 10. Utilities & Data

- `utils/products.ts`: Reads `src/data/products.json`, generates category lists, product paths, and trimmed product objects for SSG.
- `utils/localStorage.ts`: Loads/saves the cart state safely (returns `undefined` on failures).
- `constants/fees.ts`: Base shipping fee and tax rate used across checkout and summary components.

## 11. Scripts and Tooling

Package scripts (`package.json`):

- `dev`: `next dev` with `NODE_OPTIONS=--openssl-legacy-provider`
- `build`: `next build`
- `start`: Production server
- `lint`: ESLint with auto-fix (`--fix`)
- `test:convex`: Runs `tests/convex.test.ts` via `tsx`
- `test:email`: Runs `tests/email.test.ts` via `tsx`

> **Node version note**: `--openssl-legacy-provider` is only accepted by Node 16.x and 17.x. Use Node 16.20.2 (recommended) or remove the flag if you upgrade the toolchain.

### Testing Utilities

- `tests/convex.test.ts`: Integration tester for Convex order creation; requires `CONVEX_BASE_URL` (or `NEXT_PUBLIC_CONVEX_URL`) and optionally `CONVEX_FUNCTION_KEY`.
- `tests/email.test.ts`: Sends a sample order confirmation. By default it swaps in a mock Nodemailer transport unless `SMTP_TEST_LIVE=true`.

Run with `npm run test:convex` / `npm run test:email` after configuring environment variables.

## 12. Environment Configuration

Set the following in `.env.local` (server-side secrets never leak to the client unless prefixed with `NEXT_PUBLIC_`):

| Variable | Purpose |
| --- | --- |
| `CONVEX_BASE_URL` or `NEXT_PUBLIC_CONVEX_URL` | Convex deployment base URL |
| `CONVEX_FUNCTION_KEY` | Optional auth key for protected Convex functions |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Email transport credentials |
| `SMTP_SECURE` | `"true"` if TLS required (defaults to false) |
| `EMAIL_FROM` | From address override for transactional email |
| `EMAIL_TO` | Target address for `tests/email.test.ts` dry runs |
| `NEXT_PUBLIC_*` | Add client-visible envs here (none required by default) |

Ensure `.env.local` is not committed. The email helper automatically loads `.env` and `.env.local` on the server.

## 13. Deployment Considerations

- Pre-rendered pages rely on the static product catalog. Updating `src/data/products.json` requires redeploying the Next.js app.
- Convex and SMTP credentials must be configured in production hosting environments (Vercel, Netlify, etc.).
- Because the build script expects `NODE_OPTIONS=--openssl-legacy-provider`, use a compatible Node runtime (16.x) or remove/replace that flag.
- To serve optimized images, consider Next.js `next/image` upgrades if migrating to a newer Next release.

## 14. Extensibility Guidelines

- **Adding Products**: Update `src/data/products.json`; ensure the structure matches `models/Product`.
- **Adding Pages**: Place new routes under `pages/`; reuse atoms/molecules/organisms where possible. Maintain SSG by exposing `getStaticPaths`/`getStaticProps` when using dynamic routes.
- **Extending Checkout**: Update `models/Order`, `constants/fees`, and adjust Zod schema in `pages/api/checkout.ts`. Keep API schema synchronized with front-end form validation.
- **Styling Changes**: Extend Chakra theme tokens instead of inline styles to maintain consistency.
- **State Enhancements**: Use Redux Toolkit slices for cross-cutting state; register new slices in `src/store/index.ts`.

## 15. Known Constraints & Future Work

- Build scripts currently depend on the legacy OpenSSL provider flag.
- ESLint configuration warns about unspecified React version; configure `settings.react.version` if linting noise becomes an issue.
- Component-level tests are not present; consider adding Jest/React Testing Library coverage for critical flows (cart, checkout).
- Convex and email tests require live credentials; add mocks or CI-safe fallbacks for automated pipelines.

---

For questions or onboarding, start with `npm install`, set up `.env.local`, run `npm run dev`, and inspect the component library under `src/components`. The atomic structure and Redux hooks provide clear entry points for feature work.
