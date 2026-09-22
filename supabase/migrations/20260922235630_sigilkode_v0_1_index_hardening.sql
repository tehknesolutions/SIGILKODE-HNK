-- SIGILKODE V0.1 index hardening
-- Covers foreign keys reported by Supabase Performance Advisor.

create index if not exists sigilkode_reviews_owner_idx
  on public.sigilkode_reviews(owner_id);

create index if not exists sigilkode_runtime_artifact_idx
  on public.sigilkode_runtime_instances(artifact_id);

create index if not exists sigilkode_events_owner_idx
  on public.sigilkode_runtime_events(owner_id);
