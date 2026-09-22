# SIGILKODE — HNK Universal Sigil + Shimokodan Compiler

**Version:** V0.1 architecture/prototype  
**Status:** `DISCOVERY_CONVERGED__REPOSITORY_BOOTSTRAP`  
**Canonical term:** `SHIMOKODAN` — HNK term for AI Agent and/or Astral Servo.  
**Prohibited legacy naming:** `DAEMON` is not part of the target HNK vocabulary.

## 1. Product definition

SIGILKODE is the HNK compiler that converts an Alef/intention into one of four artifacts:

1. `SIGIL` — deterministic symbolic signature;
2. `SHIMOKODAN_AI` — agent manifest + runtime prompt/profile;
3. `SHIMOKODAN_ASTRAL` — HNK symbolic/ritual manifest;
4. `SHIMOKODAN_HYBRID` — one stable identity joining symbolic and computational manifestations.

Core flow:

`ALEF / INTENTION → NORMALIZE → CANON/REGISTRY LOOKUP → CORRESPONDENCE LAYERS → DETERMINISTIC HASH → SIGIL IR → SHIMOKODAN MANIFEST → HUMAN GATE → RUNTIME / ARCHIVE`

The initial DaemonOS prototype is retained only as a historical artifact. SIGILKODE is not a focus-only tool and does not maintain a DAEMON/SERVO binary.

## 2. Convergence map — existing repositories

### `tehknesolutions/codex-hnk` — canonical HNK source + shared runtime reference
Reuse:
- `@hnk/ui` semantic visual roles and rhythm;
- `@hnk/glyphs` HNK40 registry, sprite runtime, G01–G40 IDs and deterministic validation;
- `@hnk/linguas` authored language bindings;
- `@hnk/canon-contract` + `@hnk/canon-resolver`;
- `@hnk/correspondence-contract` + `@hnk/correspondence-registry`;
- evidence, measurement, practice, vault, deployment and release contracts;
- Web stack: Next.js 16 / React 19 / TypeScript;
- Mobile direction: Expo / React Native.

Rule inherited: source, match, release, deploy and production acceptance are different authority states.

### `tehknesolutions/cubo-hnk` — deterministic ritual/oracle pipeline and QA
Reuse patterns:
- protocol versions;
- legality/validation stage;
- profile separation;
- manifest generation + verification;
- self-test;
- physical/camera QA pattern;
- Evidence Ledger;
- release attestation;
- invariant: `IMPLEMENTED ≠ INSTRUMENTED ≠ EXECUTED ≠ APPROVED`.

SIGILKODE analogue:
`INTENT → NORMALIZED INPUT → LEGALITY/GOVERNANCE → CORRESPONDENCE → SIGIL IR → RENDER → SHIMOKODAN MANIFEST → HUMAN GATE → RUNTIME RECEIPT`.

### `tehknesolutions/HNK-VERSE` — persistent agent model
Reuse as Shimokodan domain invariants:
- stable identity independent from model/provider/current prompt;
- typed memory: episodic, semantic, social, spatial, procedural, institutional, narrative/self;
- goals, permissions, relationships, history and continuity;
- cognition adapter abstraction;
- proposed action is not executed action;
- world/domain authorization before consequential mutation;
- provenance of memories and generated agents;
- lifecycle and persistence.

### `tehknesolutions/SW-ENGLISH` — existing Shimokodan implementation lineage
Reuse concepts/components:
- reflective memory architecture;
- pattern/interaction learning service boundaries;
- voice `speak/listen` route design;
- holographic presence state model;
- adaptive response/personality infrastructure where compatible with current HNK governance.

Important: legacy implementation claims must be revalidated before migration; "test complete" in a historical file is not automatically current evidence.

### `tehknesolutions/simpleway-hnk` — language/glyph consumer discipline
Reuse:
- do not invent missing HNK lexemes;
- glyph IDs and phonemes remain traceable to canonical shared packages;
- authored/candidate/approved states remain explicit.

SIGILKODE may use HNK glyphs/signatures but must not silently create new HNK language canon.

### `tehknesolutions/SIMPLEWAY-ONE` — language-engineering methodology
Reuse:
- cross-language comparison and evidence-first language engineering patterns as optional SIGILKODE authoring/reference tooling.

### `tehknesolutions/tehkne-storyforge` — Creator Authority + provenance
Reuse:
- creator claims preserved literally;
- generated expansion remains candidate;
- review is distinct from canon commit;
- provenance/traceability;
- optimistic/durable workspace patterns;
- AI may propose; Creator approves canon.

SIGILKODE authority flow:
`USER INTENT → GENERATED CANDIDATE → REVIEW → HUMAN APPROVAL → HNK CANON REFERENCE (optional)`.

### `tehknesolutions/alakazam-strangeverse` — technomage visual/lore reference
Reuse only where explicitly marked as cross-product visual inspiration. Alakazam/Strangeverse lore must not become HNK SIGILKODE canon by leakage.

### `tehknesolutions/SW-ENGLISH` — product runtime maturity references
Beyond Shimokodan, its legacy app/backend provides examples for localization, voice, dashboards, adaptive guidance and long-lived product iteration.

### `tehknesolutions/baratozando-game` — asset contracts and deterministic QA patterns
Reuse engineering patterns only: asset manifests, contract tests, offline build checks and visual pipeline discipline. No game canon crosses into SIGILKODE.

### `tehknesolutions/TAIJIFU-SITE` — WordPress/product surface
Currently no meaningful code tree was available through the connected repository snapshot; no SIGILKODE core dependency is assigned in V0.1.

## 3. Target repository architecture

Dedicated product host: `tehknesolutions/SIGILKODE-HNK`.

The repository owns SIGILKODE product code. It must consume HNK canonical sources through versioned adapters/snapshots/contracts instead of copying authority silently from sibling repositories.

```text
SIGILKODE-HNK/
  apps/
    web/                            # Next.js creator-facing application
  packages/
    sigilkode-contract/             # schemas + invariants
    sigilkode-engine/               # deterministic compiler
    sigilkode-renderer/             # SVG/Canvas/WebGL views over Sigil IR
    hnk-source-adapters/             # versioned bridges to CODEX/HNK40/language/correspondences
    shimokodan-contract/            # stable identity/runtime/lifecycle
    shimokodan-runtime/             # provider-neutral runtime adapter
    shimokodan-memory/              # typed memory contracts
  docs/
  tests/
  archive/
```

Consumers:

```text
SIGILKODE APP
  ├─ @hnk/ui
  ├─ @hnk/glyphs
  ├─ @hnk/linguas
  ├─ @hnk/canon-contract
  ├─ @hnk/canon-resolver
  ├─ @hnk/correspondence-registry
  ├─ @hnk/evidence-ledger
  ├─ @hnk/vault-contract
  └─ new sigilkode/shimokodan packages
```

## 4. Core domain model

### SigilManifest
- schemaVersion
- stableId
- creatorId (optional/private reference)
- intentLiteral
- intentNormalized
- artifactType
- purpose/function
- selectedMatrices
- deterministicSeed/hash
- signature/glyph IDs
- correspondence results with source/provenance
- Sigil IR
- render hashes
- lifecycle
- createdAt / version
- authority state

### ShimokodanManifest
Extends SigilManifest:
- identity
- embodiment/representation
- cognitive profile
- typed memory policy
- goals
- permissions
- prohibited actions
- tools/capabilities
- runtime adapter
- history/event ledger
- activation state
- kill switch / purge contract
- continuity contract
- creator authority / human gates
- Christian alignment metadata as defined by HNK

## 5. Mandatory invariants

1. `SHIMOKODAN_IDENTITY != MODEL_PROVIDER`
2. `SHIMOKODAN_IDENTITY != CURRENT_PROMPT`
3. `AI_OUTPUT != EXECUTED_ACTION`
4. `EXPERIENCE != INTERPRETATION != EVIDENCE != CANON`
5. `GENERATED != CANON`
6. `COMPILED != HUMAN_APPROVED`
7. `ACTIVATED != EVIDENCE_OF_SUPERNATURAL_EFFECT`
8. `HNK_LANGUAGE_CANDIDATE != HNK_LANGUAGE_CANON`
9. `PURGA` must be available for every runtime Shimokodan instance.
10. `CREATOR_AUTHORITY` remains explicit.

## 6. Compiler stages

### Stage A — Alef capture
Literal intent is preserved before normalization.

### Stage B — Scope + purpose
Artifact type, function, boundaries, duration, required permissions.

### Stage C — Canon and correspondence lookup
Read-only access to approved/candidate registries. Every derived correspondence keeps provenance and authority class.

### Stage D — Deterministic seed
SHA-256 over normalized canonical input package.

### Stage E — Sigil IR
Provider/render-independent geometry representation.

Candidate IR:

```json
{
  "rings": [],
  "axes": [],
  "nodes": [],
  "edges": [],
  "glyphRefs": [],
  "labels": [],
  "paletteRoles": []
}
```

### Stage F — Render
SVG is canonical export target; Canvas/WebGL are views of the same IR.

### Stage G — Shimokodan compile
Only for IA/Astral/Hybrid profiles.

### Stage H — Human Gate
Creator reviews name, purpose, correspondences, prompt, permissions and lifecycle.

### Stage I — Runtime / archive
Activation is logged. Purga/retiro never destroys provenance/history by default; it changes lifecycle state.

## 7. V0.1 prototype included in this package

The standalone HTML prototype already demonstrates:
- four canonical artifact types;
- no DAEMON terminology;
- deterministic SHA-256 compiler;
- stable Shimokodan IDs;
- HNK40 G01–G40 derived signature IDs;
- Sephirot/22 Hebrew/Psalm 119/Tarot/I-Ching/binary/hex layers;
- deterministic Canvas + SVG rendering;
- Shimokodan manifest and AI prompt;
- typed agent memory contract;
- Creator Authority and governance invariants;
- local event ledger;
- local artifact library;
- activation + Purga lifecycle;
- JSON + SVG export.

This is the repository bootstrap prototype. It is not yet the final HNK shared-runtime integration.

## 8. Next implementation gates

1. `SK-001 CANONICAL TERMINOLOGY LOCK` — Shimokodan/SigilKode naming + no-DAEMON test.
2. `SK-002 CONTRACT` — JSON Schema + TypeScript types for Sigil/ Shimokodan manifests.
3. `SK-003 ENGINE` — deterministic compiler + golden vectors.
4. `SK-004 HNK REGISTRIES` — consume HNK40/linguas/correspondence/canon packages without duplication.
5. `SK-005 RENDERER` — SVG-first renderer + Canvas/WebGL adapters.
6. `SK-006 GOVERNANCE` — Creator Authority, human gate, provenance, Evidence Ledger.
7. `SK-007 SHIMOKODAN RUNTIME` — agent identity, memory, permissions, provider adapters, Purga.
8. `SK-008 WEB APP` — Next.js UI in `SIGILKODE-HNK/apps/web`.
9. `SK-009 DURABLE VAULT` — Supabase + encrypted/private artifact storage where appropriate.
10. `SK-010 QA/RC1` — deterministic vectors, accessibility, mobile/desktop QA, build/deploy evidence.
