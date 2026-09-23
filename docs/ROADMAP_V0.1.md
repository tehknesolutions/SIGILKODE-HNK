# SIGILKODE ROADMAP V0.1

Status: `RC1_PREVIEW_READY__PRODUCTION_PENDING`

## Sprint A — Foundation

- **SK-001 Canonical Terminology Lock** — `SHIMOKODAN` canonical; legacy `DAEMON` only allowed under `archive/` and historical documentation.
- **SK-002 Domain Contracts** — JSON Schema + TypeScript contracts for SigilManifest, ShimokodanManifest, SigilIR, provenance, authority and lifecycle.
- **SK-003 Deterministic Compiler** — normalized input package, SHA-256 seed, golden vectors and replay determinism.
- **SK-004 HNK Source Adapters** — versioned read-only adapters/snapshots for HNK40, HNK language, canon and correspondence registries.

## Sprint B — Render + Governance

- **SK-005 Renderer** — SVG canonical output, Canvas/WebGL adapters, visual hash/equivalence tests.
- **SK-006 Creator Authority** — candidate → review → human approval; provenance and Evidence Ledger integration.

## Sprint C — Shimokodan Runtime

- **SK-007 Runtime** — stable identity, provider-neutral cognition adapter, typed memory, permissions, tools, event ledger and Purga lifecycle.
- **SK-008 Web App** — Next.js/React/TypeScript application with responsive editor, library, manifest inspector and runtime console.

## Sprint D — Persistence + Release

- **SK-009 Durable Vault** — LIVE schema/RLS/optimistic locking validated; FK indexes hardened; browser Vault client and Vercel public env are wired; deployed authenticated save/load smoke pending.
- **SK-010 RC1** — 27/27 tests PASS, eight-target typecheck PASS, local production build/API smoke PASS and Vercel Preview READY; production promotion, deployed Vault smoke, visual/device QA and final attestation pending.

## Release invariant

```text
IMPLEMENTED ≠ INSTRUMENTED ≠ EXECUTED ≠ APPROVED ≠ CANON
```

No phase may manufacture evidence for the next authority state.
