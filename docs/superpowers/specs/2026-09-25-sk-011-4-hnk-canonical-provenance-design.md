# SK-011.4 — HNK Canonical Matrix Adapter / Provenance Layer

**Status:** DESIGN APPROVED
**Date:** 2026-09-25
**Base:** `main@1dfd703a02fad1d2eeda43775d89dffbdd51d9f9`
**Parent:** SK-011 — TEHNKÉ-MAGIK Compiler V0.2

## Intent

Connect source-locked HNK canonical authority to the TEHNKÉ Matrix Engine without converting structural selection, historical correspondence, generated material, or model inference into HNK canon.

The adapter is an authority bridge, not a second source of truth.

## Canonical pipeline

```text
ALEF
  ↓
TEHNKE_IR/V0.2
  ↓
Matrix Engine
  ↓
HNK Canonical Adapter
  ↓
HNK Source Lock
  ↓
locked source / revision / record
  ↓
explicit contribution
  ↓
field-level provenance
  ↓
Matrix Application Output
```

## Invariants

```text
SOURCE != INTERPRETATION
STRUCTURAL != SEMANTIC
GENERATED != CANON
COMPILED != HUMAN_APPROVED
MATRIX_CONTRIBUTION => PROVENANCE
UNRESOLVED_AUTHORITY => NO_CANONICAL_CONTRIBUTION
HNK40_STRUCTURAL_SELECTION != HNK_CANONICAL_SEMANTICS
```

Existing V0.1 and SK-011.1–SK-011.3 behavior remains backward compatible.

## Authority model

SK-011.4 recognizes authority classes explicitly instead of inferring authority from file location or adapter identity.

Initial classes:

- `HNK_CANONICAL` — source-locked HNK records explicitly materialized as canonical/approved authority.
- `SOURCE_SCOPED_REFERENCE` — historical/reference correspondence valid only within its attributed source/tradition.
- `STRUCTURAL_ONLY` — deterministic structure with no semantic promotion; HNK40 remains here.
- `GENERATED` — compiler-produced material; never canonical merely because compilation succeeded.

An adapter may emit only the authority actually supported by its resolved source record.

## Source-lock resolution

The implementation MUST reuse `@sigilkode/hnk-source-adapters` and `sources/HNK_SOURCE_LOCK_V0.1.json`.

It MUST NOT duplicate canonical HNK datasets inside `sigilkode-engine`.

Resolution is fail-closed:

1. validate source snapshots;
2. resolve requested canonical record through the materialized source adapter;
3. verify source-lock/revision metadata;
4. emit a contribution only when the requested authority is supported;
5. otherwise return an explicit non-applied/no-contribution result or throw for malformed authority requests.

No network lookup is part of deterministic compilation.

## Canonical contribution contract

Each canonical contribution must carry enough evidence to explain exactly why it exists.

```ts
interface HnkCanonicalContribution {
  contributionId: string;
  matrixIdentity: "HNK_CANON";
  authority: "HNK_CANONICAL";
  canonItemId: string;
  sourceItemId?: string;
  kind: string;
  name: string;
  definition?: string;
  constraints: readonly string[];
  provenance: {
    sourceLock: "HNK-SOURCE-LOCK/V0.1";
    repository: string;
    commit: string;
    path: string;
    blobSha: string;
    sourceStatus: string;
    recordId: string;
  };
}
```

`contributionId` must be deterministic for the same adapter version + source lock + record identity.

## Adapter output

The HNK canonical adapter output must distinguish resolution from contribution:

```ts
interface HnkCanonicalMatrixOutput {
  version: "SIGILKODE-HNK-CANON-MATRIX-ADAPTER/V0.1";
  sourceLock: "HNK-SOURCE-LOCK/V0.1";
  authority: "HNK_CANONICAL";
  semanticInference: false;
  requestedRecordIds: readonly string[];
  contributions: readonly HnkCanonicalContribution[];
  unresolvedRecordIds: readonly string[];
  replayHash: string;
}
```

`semanticInference` remains `false`: records are selected only through explicit identifiers/locked rules defined by the input contract, never by free-form model interpretation.

## Selection boundary

SK-011.4 does not invent a semantic classifier from ALEF text to HNK doctrine.

The canonical adapter consumes explicit canonical record identifiers supplied by the Matrix application descriptor. If the current TEHNKE_IR matrix descriptor cannot carry these selectors without breaking compatibility, add an optional, deterministic `parameters`/`selectors` field with canonical serialization and hashing.

No hidden keyword matching is allowed to promote an ALEF into a canonical HNK assertion.

## HNK40 boundary

`HNK40` remains registered as a separate adapter with:

```text
authority = STRUCTURAL_ONLY
semanticInference = false
```

SK-011.4 MUST NOT reinterpret HNK40 glyph selection as proof of HNK canonical meaning.

A future explicitly approved mapping may compose HNK40 and HNK_CANON, but composition must preserve separate provenance for each contribution.

## Provenance propagation

The Matrix Engine currently exposes IR-level provenance. SK-011.4 adds adapter-output provenance at contribution granularity.

The engine must preserve both:

```text
IR provenance
+ Matrix application identity/revision/order
+ Adapter version
+ Source lock version
+ Canonical record provenance
+ Replay hash
```

No renderer or UI is allowed to erase the distinction between these layers.

## Determinism

For deterministic channels:

```text
same TEHNKE_IR
+ same adapter version
+ same source-lock revision
+ same explicit selectors
= same contributions + same replayHash
```

Canonical serialization must be stable before hashing.

## Failure behavior

- malformed source hash / selector type: throw deterministic validation error;
- missing canonical record: include in `unresolvedRecordIds`, emit no contribution for it;
- source snapshot drift: fail closed;
- unsupported authority escalation: fail closed;
- duplicate selector: de-duplicate deterministically while preserving canonical selector order;
- empty selector set: valid no-op output with zero contributions.

## Files / boundaries

Expected implementation surface:

- `packages/hnk-source-adapters/src/index.mjs` — expose exact canonical record resolution with locked provenance; no duplicated authority.
- `packages/hnk-source-adapters/src/index.d.ts` — type the resolver.
- `packages/sigilkode-engine/src/hnk-canon-matrix-adapter.mjs` — new deterministic adapter.
- `packages/sigilkode-engine/src/tehnke-matrix-adapters.mjs` — register `HNK_CANON`.
- `packages/sigilkode-engine/src/tehnke-matrix-adapters.d.ts` — adapter typing if required.
- `packages/sigilkode-engine/src/tehnke-ir.mjs` / `.d.ts` — only if optional selectors must enter the hashed IR contract.
- `packages/sigilkode-engine/test/*` — focused TDD, replay and regression tests.
- `packages/sigilkode-engine/test/fixtures/hnk-canon-adapter.golden.json` — deterministic golden fixture.

## Non-goals

SK-011.4 does not:

- create new HNK doctrine;
- approve candidate HNK semantics;
- infer spiritual truth from an ALEF;
- replace Human Gate;
- implement Operation Classes beyond the existing contract;
- implement Gnosis Engine, Manifestation Bundle, ACTION, Shimokodan V0.2 or UI redesign;
- change HNK40 from `STRUCTURAL_ONLY`;
- fetch mutable upstream sources during compilation.

## Acceptance gates

1. Existing V0.1 and SK-011.1–SK-011.3 tests remain green.
2. `HNK_CANON` is registered deterministically.
3. Exact canonical IDs resolve only through source-locked materialized authority.
4. Every emitted canonical contribution contains record-level provenance.
5. Unknown canonical IDs never generate guessed contributions.
6. HNK40 remains `STRUCTURAL_ONLY` and `semanticInference:false`.
7. Same inputs/revisions produce byte-stable replay output/hash.
8. Source drift fails closed.
9. Golden fixture locks canonical adapter semantics.
10. Repository-wide `pnpm check` and `pnpm build:web` pass before merge.
11. CI execution evidence is distinguished from Vercel deployment evidence.

## Architectural consequence

After SK-011.4, SIGILKODE can state not merely that a Matrix ran, but exactly which HNK authority contributed each canonical datum, from which locked revision, without granting canonical status to structural or generated output.

This is the provenance boundary required before richer TEHNKÉ-MAGIK compilation can safely compose operation classes, gnosis, manifestation channels and persistent Shimokodan behavior.
