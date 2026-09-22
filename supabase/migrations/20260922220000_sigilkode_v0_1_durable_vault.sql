-- SIGILKODE V0.1 durable vault candidate
-- Source-level only until applied and validated against an authorized Supabase project.

create extension if not exists pgcrypto;

create table if not exists public.sigilkode_artifacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  stable_id text not null,
  artifact_type text not null check (artifact_type in ('SIGIL','SHIMOKODAN_AI','SHIMOKODAN_ASTRAL','SHIMOKODAN_HYBRID')),
  authority_state text not null check (authority_state in ('CANDIDATE','HUMAN_APPROVED')),
  lifecycle text not null check (lifecycle in ('DRAFT','COMPILED','ACTIVE','RETIRED')),
  revision bigint not null default 1 check (revision > 0),
  manifest jsonb not null,
  render jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, stable_id, revision)
);

create table if not exists public.sigilkode_reviews (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references public.sigilkode_artifacts(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  review_id text not null,
  manifest_digest text not null,
  decision text not null check (decision in ('APPROVE','EDIT','REJECT')),
  reviewer text not null,
  explicit_human_signal text not null,
  rationale text not null,
  reviewed_at timestamptz not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sigilkode_runtime_instances (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references public.sigilkode_artifacts(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  stable_id text not null,
  runtime_state text not null check (runtime_state in ('INACTIVE','ACTIVE','PURGED')),
  revision bigint not null default 1 check (revision > 0),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sigilkode_runtime_events (
  id bigint generated always as identity primary key,
  runtime_instance_id uuid not null references public.sigilkode_runtime_instances(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  event_digest text not null,
  previous_digest text,
  payload jsonb not null,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists sigilkode_artifacts_owner_idx on public.sigilkode_artifacts(owner_id);
create index if not exists sigilkode_artifacts_stable_idx on public.sigilkode_artifacts(stable_id);
create index if not exists sigilkode_reviews_artifact_idx on public.sigilkode_reviews(artifact_id);
create index if not exists sigilkode_runtime_owner_idx on public.sigilkode_runtime_instances(owner_id);
create index if not exists sigilkode_events_runtime_idx on public.sigilkode_runtime_events(runtime_instance_id);

alter table public.sigilkode_artifacts enable row level security;
alter table public.sigilkode_reviews enable row level security;
alter table public.sigilkode_runtime_instances enable row level security;
alter table public.sigilkode_runtime_events enable row level security;

create policy "artifact owner read" on public.sigilkode_artifacts for select to authenticated using ((select auth.uid()) = owner_id);
create policy "artifact owner insert" on public.sigilkode_artifacts for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "artifact owner update" on public.sigilkode_artifacts for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "artifact owner delete" on public.sigilkode_artifacts for delete to authenticated using ((select auth.uid()) = owner_id);

create policy "review owner read" on public.sigilkode_reviews for select to authenticated using ((select auth.uid()) = owner_id);
create policy "review owner insert" on public.sigilkode_reviews for insert to authenticated with check ((select auth.uid()) = owner_id);

create policy "runtime owner read" on public.sigilkode_runtime_instances for select to authenticated using ((select auth.uid()) = owner_id);
create policy "runtime owner insert" on public.sigilkode_runtime_instances for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "runtime owner update" on public.sigilkode_runtime_instances for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create policy "event owner read" on public.sigilkode_runtime_events for select to authenticated using ((select auth.uid()) = owner_id);
create policy "event owner insert" on public.sigilkode_runtime_events for insert to authenticated with check ((select auth.uid()) = owner_id);

create or replace function public.sigilkode_update_artifact(
  p_id uuid,
  p_expected_revision bigint,
  p_authority_state text,
  p_lifecycle text,
  p_manifest jsonb,
  p_render jsonb
) returns public.sigilkode_artifacts
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_row public.sigilkode_artifacts;
begin
  update public.sigilkode_artifacts
     set authority_state = p_authority_state,
         lifecycle = p_lifecycle,
         manifest = p_manifest,
         render = p_render,
         revision = revision + 1,
         updated_at = now()
   where id = p_id
     and owner_id = (select auth.uid())
     and revision = p_expected_revision
  returning * into v_row;

  if v_row.id is null then
    raise exception 'SIGILKODE_REVISION_CONFLICT_OR_NOT_FOUND';
  end if;

  return v_row;
end;
$$;

grant execute on function public.sigilkode_update_artifact(uuid,bigint,text,text,jsonb,jsonb) to authenticated;
