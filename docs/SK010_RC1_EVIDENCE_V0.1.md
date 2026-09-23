# SK-010 — RC1 Evidence V0.1

State: `RC1_PREVIEW_READY__PRODUCTION_PENDING`

This document records observed evidence only. It does not convert implementation into HNK canon and does not treat an unexecuted check as a PASS.

## 1. Domain/runtime tests

Independent Windows execution:

```text
tests 27
pass 27
fail 0
duration_ms 819.3792
```

Covered gates include:
- deterministic compiler / golden replay;
- HNK40 signature bounds;
- canonical Shimokodan terminology;
- HNK source snapshots/adapters;
- historical correspondence conflict preservation;
- SVG-first deterministic renderer;
- Creator Authority / Human Gate;
- runtime identity independence from model/provider;
- typed memory provenance;
- activation requiring `HUMAN_APPROVED`;
- Purga preserving memory/history;
- Durable Vault optimistic revision contract;
- Web API/UI authority boundary contracts;
- browser Vault bearer-auth / optimistic-RPC contract.

## 2. Typecheck

Independent Windows execution passed all eight configured targets:

```text
@sigilkode/contract
@sigilkode/hnk-source-adapters
@sigilkode/engine
@sigilkode/renderer
@sigilkode/governance
@sigilkode/shimokodan-runtime
@sigilkode/store
@sigilkode/web
TYPECHECK_ALL=PASS
```

## 3. Local production build

Next.js 16.3.3 production build completed successfully.

Observed routes:

```text
○ /
○ /_not-found
ƒ /api/compile
ƒ /api/review
ƒ /api/runtime
```

## 4. Local runtime smoke

Production server responded successfully and the full API authority/lifecycle chain executed:

```text
HOME_STATUS=200
HOME_HAS_SIGILKODE=True
COMPILE_AUTHORITY=CANDIDATE
REVIEW_AUTHORITY=HUMAN_APPROVED
RUNTIME_STATE=ACTIVE
PURGE_STATE=PURGED
```

Representative compile stable id:

`SK-25AD0620DE23`

## 5. Durable Vault — live Supabase evidence

The authorized HNK Supabase backend contains the live SigilKode schema.

Observed two-user probe:

```text
owner A read = 1
owner B visible rows = 0
owner B updated rows = 0
valid optimistic revision = 2
stale revision rejected = true
```

Temporary probe users/data were removed after validation.

SigilKode-specific missing-FK-index findings were remediated by the hardening migration. Security Advisor reported no SigilKode-specific warning after DDL.

## 6. Vercel Preview

Project:

`tw-da-vincis-projects/sigilkode-hnk`

Observed READY preview deployment:

- deployment id: `dpl_H7qmstzfvL71mPSQuuqFC3Bpnqtf`
- URL: `https://sigilkode-8uvdhidmn-tw-da-vincis-projects.vercel.app`
- target: `preview`
- state: `READY`
- runtime: Node.js 22.x
- framework: Next.js 16.3.3

Observed cloud build:
- workspace install completed;
- Next.js detected;
- production compilation succeeded;
- TypeScript succeeded;
- static generation succeeded;
- API lambdas produced for compile/review/runtime;
- build output deployed successfully.

The preview is protected by Vercel Authentication. Direct unauthenticated API requests are therefore expected to receive a protected-deployment response; this is not recorded as an application API failure.

## 7. Vercel environment wiring

The Vercel project has public client configuration for the authorized Supabase project in Production, Preview and Development:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

No service-role credential is embedded in the browser client.

## 8. pnpm 12 / workspace compatibility remediation

The workspace is configured with:

```yaml
pmOnFail: ignore
```

to prevent pnpm 12 package-manager self-management metadata from creating a multi-document lockfile that breaks ecosystem consumers. Current `pnpm-lock.yaml` is a single dependency document.

CI order was also corrected to setup pnpm before enabling setup-node's pnpm cache.

## 9. GitHub Actions limitation

GitHub-hosted Actions remains blocked before step execution:

```text
runner_id=0
runner_name=""
steps=[]
NOT_EXECUTED_PRESTEP_INFRA_FAILURE
```

Therefore GitHub Actions is neither marked PASS nor treated as a code-test failure.

## 10. Remaining RC1 gates

- authenticated browser save/load through the deployed Vault surface;
- desktop/mobile visual QA;
- production promotion/deployment;
- production smoke;
- Git/Vercel automatic deployment integration, if approved;
- final release attestation.

## Release boundary

```text
IMPLEMENTED
!= TESTED
!= LIVE_BACKEND_VALIDATED
!= PREVIEW_READY
!= PRODUCTION_READY
!= HNK_CANON
```
