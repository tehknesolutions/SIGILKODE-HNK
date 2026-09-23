# SK-009 — Durable Vault V0.1

State: `LIVE_SCHEMA_RLS_VALIDATED__WEB_PERSISTENCE_PENDING`

## Implemented and live-validated

- persistence contract;
- ephemeral reference store;
- optimistic revision semantics;
- Supabase durable schema applied to the authorized `codex-hnk-app` backend;
- four SigilKode tables created with RLS enabled;
- eleven owner-scoped policies present;
- artifact, review, runtime instance and runtime event tables;
- `security invoker` optimistic update RPC;
- two-user live RLS probe:
  - owner A could read its artifact: `1`;
  - owner B visible rows: `0`;
  - owner B updated rows: `0`;
  - valid optimistic update advanced revision `1 → 2`;
  - stale revision was rejected;
- temporary probe users and rows removed after validation;
- SigilKode foreign-key advisor gaps remediated with covering indexes.

## Advisor state after DDL

Security Advisor reported **no SigilKode-specific warning**. Remaining security findings belong to pre-existing Codex/HNK tables/functions, including the known `complete_codex_day` SECURITY DEFINER warning.

Performance Advisor no longer reports unindexed foreign keys for SigilKode. Newly created indexes are naturally reported as unused immediately after creation; that is informational, not a defect.

## Migrations

- `sigilkode_v0_1_durable_vault`
- `sigilkode_v0_1_index_hardening`

## Still pending

- Web authentication and Supabase client wiring;
- cross-device persistence through the real Web UI;
- browser/device QA;
- production deployment;
- RC1 release attestation.

## Release invariant

`IMPLEMENTED != LIVE_VALIDATED != WEB_WIRED != PRODUCTION_READY`
