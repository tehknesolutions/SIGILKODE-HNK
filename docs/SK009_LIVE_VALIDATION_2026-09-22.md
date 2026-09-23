# SK-009 — Live Durable Vault Validation — 2026-09-22

Status: `LIVE_SCHEMA_RLS_OPTIMISTIC_LOCKING_PASS`

Target backend: existing CODEX-HNK Supabase project `codex-hnk-app`.

## Applied migrations

1. `sigilkode_v0_1_durable_vault`
2. `sigilkode_v0_1_index_hardening`

## Schema evidence

Created four owner-scoped tables:

- `public.sigilkode_artifacts`
- `public.sigilkode_reviews`
- `public.sigilkode_runtime_instances`
- `public.sigilkode_runtime_events`

RLS is enabled on all four. The initial migration installed 11 policies.

## Executed isolation probe

The live validation used two temporary synthetic Auth users inside a controlled test transaction/workflow and removed all temporary rows/users afterward.

Observed results:

```text
owner_a_can_read        = 1
owner_b_visible_rows    = 0
owner_b_updated_rows    = 0
valid_revision_rpc_result = 2
stale_revision_rejected = true
final_revision          = 2
```

Interpretation:

- owner A can read its own artifact;
- owner B cannot read owner A's artifact;
- owner B cannot update owner A's artifact;
- a valid optimistic update advances revision 1 → 2;
- a stale revision is rejected.

Post-test cleanup evidence:

```text
sigilkode_artifacts          = 0
sigilkode_reviews            = 0
sigilkode_runtime_instances  = 0
sigilkode_runtime_events     = 0
auth.users                   = 0
migration_present            = true
```

No synthetic test user or test artifact was left in the live project.

## Advisors

### Security

No SigilKode-specific security lint was reported after the migrations.

The project still contains pre-existing CODEX-HNK notices outside SigilKode:

- six HNK-LINGUAS pilot tables with RLS enabled but no policies;
- the known `public.complete_codex_day(...)` authenticated `SECURITY DEFINER` warning.

These are outside the SK-009 migration and were not modified by this gate.

Reference:
https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

### Performance

The first advisor pass found three SigilKode foreign keys without covering indexes. A follow-up migration added:

- `sigilkode_reviews_owner_idx`
- `sigilkode_runtime_artifact_idx`
- `sigilkode_events_owner_idx`

The second advisor pass no longer reported unindexed SigilKode foreign keys. It reports the new indexes as unused, which is expected while all SigilKode live tables are empty.

## Authority boundary

This validates database behavior only.

`LIVE_SCHEMA_PASS != WEB_APP_PERSISTENCE_INTEGRATED != PRODUCTION_RC`

SK-009 database foundation is live and validated. Client/server persistence wiring remains a separate implementation gate.
