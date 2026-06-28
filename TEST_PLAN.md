# QuoteFlows — End-to-End Test Plan

## What this is

A black-box, end-to-end test suite for QuoteFlows, a live multi-tenant SaaS
quoting platform for trades contractors (.NET backend, React frontend, Stripe
Connect payments). The suite drives the application through its real UI and
public API exactly as a user or integrator would — with no access to internal
source, database, or mocks. It runs against a dedicated **staging environment**
that mirrors production (separate Fly.io backend, isolated Postgres, Stripe in
test mode), never against production.

## Testing approach

This is **black-box** testing: tests assert on observable behaviour through the
browser and public endpoints, not on internal implementation. It is one layer of
a defence-in-depth strategy and is deliberately scoped to complement, not
duplicate, the application's existing backend test suite:

- **Backend unit/integration tests (white-box, in the app repo, 300+ tests):**
  cover money math, Stripe webhook idempotency, tenant-isolation query filters,
  JWT refresh-token rotation, and the quote state machine — the logic that is
  server-side and not reachable from a browser.
- **This black-box e2e suite:** covers the user-facing flows, auth gating,
  public-quote access, and the integration of frontend + backend + database as a
  running system.

Stating this boundary is intentional: a senior testing strategy knows _which_
layer owns _which_ risk, rather than testing everything at every layer.

## Why a dedicated staging environment

Automated tests must never run against production: they create and destroy data,
trigger emails, and exercise payment flows. Staging mirrors production but uses
an isolated database (disposable state) and Stripe test mode (no real money),
so tests can register accounts, create quotes, and run the deposit flow freely.
Staging sits behind Vercel deployment protection; the suite authenticates past it
with an automation bypass token supplied via environment variable, so the
environment stays protected from public access while remaining testable.

## Risk-based prioritisation

Tests are prioritised by blast radius — what hurts most if it breaks — not by
how easy they are to write.

### Tier 1 — Critical: money and security

Highest rigor. A failure here means lost money, leaked data, or broken auth.

- Authentication gating: protected routes reject unauthenticated access;
  logged-out users are redirected, not served data.
- Tenant isolation (observable): a user cannot reach another tenant's resources;
  cross-tenant access returns not-found rather than leaking existence.
- The deposit/checkout happy path completes and the quote reflects paid state
  only after payment confirmation.

### Tier 2 — Core business invariants

The quote lifecycle behaves correctly and illegal transitions are rejected.

- Quote creation, send, and the state transitions a user can drive through the UI.
- Expired quotes are not acceptable through the public page.
- Validation: required fields are enforced; bad input is rejected with clear errors.

### Tier 3 — Integration happy paths

The system works as a whole for the primary journeys.

- Sign up → log in → build a quote → send it → view it on the public link.
- The public quote page renders for a valid token.

### Tier 4 — Negative paths and edge cases

What separates real QA from happy-path testing.

- Public quote page with an invalid/unknown token returns not-found, never an error or a leak.
- Malformed form submissions are handled gracefully.
- Auth with bad credentials fails cleanly.

## Engineering practices

- **Page Object Model:** page interactions and selectors live in `pages/`; tests
  read by intent and a UI change is a one-file fix.
- **Stable, non-flaky tests:** waits are on observable conditions, never fixed
  delays — "wait on a condition, never on a timer."
- **Resilient locators:** role- and text-based locators over brittle CSS.
- **Isolated, repeatable data:** tests that need an account create a unique one
  per run and clean up after themselves, so runs don't collide.
- **Secrets never committed:** the staging URL and bypass token come from `.env`
  (gitignored); `.env.example` documents the shape.

## Running

​`
cp .env.example .env   # fill in STAGING_BASE_URL and VERCEL_AUTOMATION_BYPASS_SECRET
npm install
npx playwright install chromium
npx playwright test
​`
