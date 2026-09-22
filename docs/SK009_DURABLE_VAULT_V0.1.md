# SK-009 — Durable Vault V0.1

State: `SOURCE_IMPLEMENTED__LIVE_BACKEND_PENDING`

Implemented:
- persistence contract;
- ephemeral reference store;
- optimistic revision semantics;
- Supabase schema candidate;
- owner-scoped RLS;
- artifact, review, runtime instance and append-style runtime event tables;
- security-invoker optimistic update RPC.

Not yet claimed:
- migration applied to a live Supabase project;
- live RLS validation;
- Security Advisor clean state;
- cross-device persistence;
- production readiness.

Required live gate:
1. apply migration to an authorized dedicated project;
2. create two temporary users;
3. prove A cannot read/update B;
4. prove stale revision cannot overwrite newer revision;
5. verify event ownership;
6. inspect Security Advisor;
7. remove temporary data/users;
8. record evidence before marking SK-009 live.
