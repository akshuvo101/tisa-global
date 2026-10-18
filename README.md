# TISA Global

TISA Global is a travel-assistance web application for destination and service discovery, event research, and customer travel enquiries. It pairs a public-facing travel experience with Supabase-backed customer and administrator workflows.

**Live demo:** [tisa-global.vercel.app](https://tisa-global.vercel.app) · **Source:** [github.com/akshuvo101/tisa-global](https://github.com/akshuvo101/tisa-global)

> This project supports travel research and assistance requests; it is not a live booking or payment platform, visa authority, or source of official travel advice.

## Contents

- [Overview and features](#overview-and-features)
- [Screenshots](#screenshots)
- [Workflows and routes](#workflows-and-routes)
- [Technology](#technology)
- [Authentication and database](#authentication-and-database)
- [Integrations](#integrations)
- [Getting started](#getting-started)
- [Quality checks](#quality-checks)
- [Deployment](#deployment)
- [Security and limitations](#security-and-limitations)
- [Contributing and license](#contributing-and-license)
- [Developer](#developer)

## Overview and features

Travel planning can involve destination research, service enquiries, document exchange, and follow-up with providers. TISA Global connects these steps in one application for prospective travelers, signed-in customers, and TISA administrators.

- **Discovery:** destination guides, active service catalog entries, repository-maintained package examples, events, and published articles.
- **Assistance workflow:** customers can submit and track requests, exchange messages and documents, view quotes and booking records, manage profile and notification settings, and access trip information.
- **Operations:** administrators can manage customers, requests, documents, quotes, booking records, events, articles, services, notifications, and integration configuration.
- **AI and planning:** TISA AI provides Gemini-backed travel assistance; optional web search supports selected research. Planner estimates and public saved plans are planning aids, not live quotes. Public `/trips` data is browser-local, separate from authenticated `/account/trips`.
- **Responsive interface:** App Router UI with dark/light themes, responsive layouts, travel imagery, and reduced-motion support.

Database-backed workflows require a configured Supabase project and appropriate schema, policies, and data. Package pricing and availability are demo/planning information. A TISA booking record is not confirmation from a travel supplier.

## Screenshots

No product screenshots are currently checked into the repository. Desktop and mobile captures of discovery, AI assistance, and the customer workspace would improve the project showcase. Remove personal or document data before sharing screenshots.

## Workflows and routes

1. Visitors explore destinations, services, packages, events, and articles, or submit a contact enquiry.
2. Signed-in customers create an assistance request with trip details.
3. Administrators review requests and coordinate documents, messages, quotes, and booking records.
4. Customers follow operational updates in their account workspace. Planner saves on public `/trips` remain browser-local.

| Route group | Main routes | Purpose/access |
|---|---|---|
| Public | `/`, `/about`, `/contact`, `/explore`, `/destinations/[id]`, `/services`, `/services/[slug]`, `/packages`, `/packages/[id]`, `/events`, `/events/[slug]`, `/articles`, `/articles/[slug]` | Information and discovery |
| AI and planning | `/ai`, `/planner`, `/trips`, `/trips/[id]` | AI assistance and planning; public trip saves use browser storage |
| Authentication | `/login`, `/signup`, `/auth/callback` | Password and Google OAuth through Supabase (OAuth provider setup required) |
| Customer | `/request`, `/account` and nested account pages | Authenticated request submission and customer workspace |
| Administration | `/admin` and nested admin pages | Administrator operations |

API handlers under `/api` support account data, requests and related messages/documents, quotes, bookings, notifications, services, events, contact, AI, destination imagery, administrator operations, and integration webhooks. Protected APIs perform authorization checks server-side.

## Technology

| Technology | Role |
|---|---|
| Next.js 16.3.8, React 19.2.8 | App Router, server-rendered pages, UI, and API handlers |
| TypeScript 5.9.3 | Strictly typed application code |
| Tailwind CSS 4.3.3 | Responsive styling and theme tokens |
| Supabase (`@supabase/ssr`, `@supabase/supabase-js`) | PostgreSQL, Auth, RLS, Storage, and server/browser clients |
| Google GenAI SDK, Zod | Gemini integration and runtime validation |
| React Markdown, Remark, Rehype | Article rendering and sanitization |
| Lucide React | Interface icons |
| Node test runner, `tsx` | TypeScript tests |
| Vercel | Live deployment platform |

Versions above were checked with `npm ls next react typescript tailwindcss --depth=0`. The project uses Geist via `next/font/google`; Tailwind v4 is integrated through PostCSS.

## Authentication and database

Supabase Auth supports password and Google sign-in/sign-up. Cookie-aware clients are used on the server and browser. [`proxy.ts`](proxy.ts) refreshes sessions and redirects unauthenticated requests to `/login`; layouts and protected APIs also enforce access.

The application roles are `customer` and `admin`. Customer data is scoped to the signed-in user; admin workflows require the administrator role. The repository contains 14 SQL migrations defining the portal schema, RLS policies, grants, and a private `tisa-documents` bucket with customer-folder and admin access rules.

**Migration warning:** `20260929_tisa_core.sql` and `20261001_tisa_core_clean.sql` both unconditionally create the same enum types. The directory should not be treated as a directly executable sequence without resolving the baseline and testing the chosen migration set on a non-production database.

## Integrations

| Integration | Status |
|---|---|
| Supabase | Required for authentication and persisted customer/admin workflows. Contact storage has an additional setup gap described below. |
| Gemini | Server-side AI responses when `GEMINI_API_KEY` is configured; model names/fallbacks are configurable. |
| Tavily | Optional web search for selected AI research workflows. Results are not authoritative verification. |
| Unsplash | Optional destination image endpoint, requiring `UNSPLASH_ACCESS_KEY`. |
| Event provider | Optional HTTP/JSON source; administrator-triggered sync creates records/drafts for review. No scheduled sync. |
| Resend / WhatsApp webhook | Optional outbound notification adapters; credentials do not guarantee delivery. |
| Flight / hotel / visa | Disabled future registry entries; no live provider search, booking, or visa decision. |

## Getting started

### Requirements and installation

- Node.js 20.9 or later and npm.
- A Supabase project for authenticated and database-backed workflows.

```bash
git clone https://github.com/akshuvo101/tisa-global.git
cd tisa-global
npm ci
```

Create `.env.local` in the repository root:

```env
# Required for Supabase-backed features
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Optional canonical URL (defaults to https://tisa-global.vercel.app)
NEXT_PUBLIC_SITE_URL=

# Optional AI and search
GEMINI_API_KEY=
GEMINI_MODEL=
GEMINI_FALLBACK_MODEL=
GEMINI_SECOND_FALLBACK_MODEL=
TAVILY_API_KEY=

# Optional destination imagery and event feed
UNSPLASH_ACCESS_KEY=
TISA_EVENT_PROVIDER_URL=
TISA_EVENT_PROVIDER_API_KEY=

# Optional outbound notifications and incoming webhook auth
RESEND_API_KEY=
RESEND_FROM_EMAIL=
TISA_WHATSAPP_WEBHOOK_URL=
TISA_WHATSAPP_WEBHOOK_SECRET=
TISA_WEBHOOK_SECRET=

# Reserved disabled provider slots
TISA_FLIGHT_PROVIDER_URL=
TISA_HOTEL_PROVIDER_URL=
TISA_VISA_PROVIDER_URL=
```

These names are based on source usage. The committed [`.env.example`](.env.example) uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`, but the app reads `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; use the latter. Some optional names above are not listed in the example file.

### Database preparation

Review [`supabase/migrations/`](supabase/migrations/) and resolve the duplicate core enum creation before applying a migration sequence. Test against a disposable/non-production Supabase project, then verify tables, roles, RLS policies, grants, and the private document bucket. There is no migration script in `package.json` or `supabase/config.toml`; `npm run dev` does not provision the database.

The public contact API validates enquiries and attempts to insert into `contact_messages`, but no migration creates that table or its anonymous insert policy. Contact persistence requires manual schema setup with narrowly scoped anonymous insert permission; do not allow public reads or updates.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Provider-backed features require their optional configuration.

## Quality checks

Available commands:

```bash
npm run lint
npx tsc --noEmit
npm run test:articles
npx tsx --test tests/web-search.test.ts
npm run build
npm run start
```

`npm run start` serves the production build after `npm run build`.

Checks actually run for this README update:

- `npx tsc --noEmit` — passed.
- `npm run test:articles` — passed, 4 tests.
- `npx tsx --test tests/web-search.test.ts` — passed, 7 tests.
- `npm run build` — passed.
- `npm run lint` — failed with ESLint errors in application files; no application files were changed for this documentation task.

## Deployment

The live demo runs on Vercel. For another deployment, import the repository, configure Supabase and any required providers, prepare the database, set `NEXT_PUBLIC_SITE_URL` to the deployed origin if different from the default, and deploy with the standard Next.js build. Verify auth, RLS, request workflows, and each enabled provider in the target environment.

## Security and limitations

- Keep provider credentials and webhook secrets server-side. Supabase URL, publishable key, and `NEXT_PUBLIC_SITE_URL` are public; never expose a service-role key in client code.
- Enforce authorization with RLS and server-side ownership/role checks, not UI visibility alone. Customer documents contain sensitive identity information; keep storage private and signed links short-lived.
- The incoming webhook checks `TISA_WEBHOOK_SECRET` but inserts using a session Supabase client. Its migration has an admin-only RLS policy, so this write path needs authorization testing; the shared secret alone may not satisfy RLS.
- The public AI endpoint has no evident application-level throttling or complete request-schema validation. Apply appropriate abuse controls before high-volume exposure.
- No live flight/hotel inventory, payment gateway, customer checkout, or enabled visa provider is implemented. AI and travel content can be incomplete or outdated and are not official advice.
- Email and WhatsApp depend on successful provider configuration. Event sync is admin-triggered, and planner saves are browser-local.

## Contributing and license

There is no `CONTRIBUTING.md` or checked-in CI workflow. For contributions, describe database/environment requirements and run relevant checks. No `LICENSE` file is present; public repository visibility does not grant reuse or redistribution rights.

## Developer

- **Portfolio:** [https://akshuvo.vercel.app](https://akshuvo.vercel.app/)
- **GitHub:** [https://github.com/akshuvo101](https://github.com/akshuvo101)
- **LinkedIn:** [https://www.linkedin.com/in/ak-shuvo-a81187246/](https://www.linkedin.com/in/ak-shuvo-a81187246/)
