# Monorepo layout

- `apps/web`: customer-facing Next.js surface containing routes, UI and public assets.
- `services/api`: Node/Express edge for static delivery plus future BFF/domain endpoints.
- `services/workers` / `services/integrations`: reserved for async jobs and external webhooks.
- `packages/shared`: cross-cutting TypeScript utilities/constants shared via path aliases.
- `packages/ui`: placeholder for a reusable design system built on top of Radix + Tailwind.
- `domains/*`: documentation and contracts for billing, auth, tenants and other bounded contexts.
- `infra/*`: terraform/k8s/github automation separated from product code.
- `scripts`: operational CLIs (seeding, migrations, onboarding helpers).
- `tests`: home for e2e/contract/perf suites decoupled from unit tests colocated with code.
- `docs/runbooks`: incident and support procedures to keep SaaS operations discoverable.
