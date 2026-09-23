# TEHNKÉ-MAGIK — Compiler Specification V0.2

Status: **CANONICAL DESIGN / PRE-IMPLEMENTATION**  
Parent: **SK-011 — TEHNKÉ-MAGIK Compiler V0.2 / TEHNKÉ IR**

## 1. Canonical definition

**TEHNKÉ-MAGIK** is the HNK discipline for transforming Will/Intent into Manifestation through the integration of consciousness, spirit, symbol, language, information, technology and action.

**SIGILKODE** is the computational compiler, laboratory, runtime and ledger of TEHNKÉ-MAGIK.

The compiler does not reduce ALEF to a sigil. A sigil is one possible manifestation channel.

## 2. Fundamental equations

```text
ALEF != PHRASE != SIGIL
TEHNKE_IR != RENDER
GENERATED != CANON
COMPILED != HUMAN_APPROVED
AI_OUTPUT != EXECUTED_ACTION
SHIMOKODAN_IDENTITY != MODEL_PROVIDER
PURGA != HISTORY_DELETION
```

## 3. Pipeline

```text
ALEF
  ↓
INTENT ENGINE
  ↓
OPERATION CLASS
  ↓
MATRIX STACK
  ↓
TEHNKÉ IR
  ↓
MANIFESTATION BUNDLE
  ├─ SIGIL / GLYPH
  ├─ NUMBER / HEX / BINARY
  ├─ COLOR / GEOMETRY
  ├─ SOUND / VOICE
  ├─ GNOSIS PROFILE
  ├─ ACTION
  ├─ KODE
  └─ SHIMOKODAN
       ↓
    HUMAN GATE
       ↓
     RUNTIME
       ↓
 TELEMETRY / VAULT
       ↓
      PURGA
```

## 4. Backward-compatible migration

V0.1 currently compiles `SIGIL-IR/V0.1` and the artifact classes `SIGIL`, `SHIMOKODAN_AI`, `SHIMOKODAN_ASTRAL`, and `SHIMOKODAN_HYBRID`.

V0.2 MUST NOT silently reinterpret V0.1 manifests.

Migration rules:

1. Preserve `compileArtifact()` V0.1 behavior until explicit version selection exists.
2. Introduce `TEHNKE-IR/V0.2` as a new representation rather than renaming historical V0.1 data in place.
3. A V0.2 TEHNKÉ IR may contain a compatibility `sigil` channel capable of producing the existing `SIGIL-IR/V0.1` geometry during the migration window.
4. Existing stable IDs and golden vectors remain historical evidence and MUST NOT be rewritten.
5. Every migration is explicit, versioned and attributable.

## 5. TEHNKÉ IR V0.2 candidate contract

```ts
interface TehnkeIRV02 {
  version: "TEHNKE-IR/V0.2";
  alef: {
    literal: string;
    normalized: string;
  };
  operation: {
    class: OperationClass;
    function: string;
  };
  matrices: MatrixApplication[];
  channels: ManifestationChannel[];
  gnosis?: GnosisProfile;
  lifecycle?: LifecyclePolicy;
  provenance: ProvenanceRecord[];
  deterministic: {
    compilerVersion: string;
    sourceLockVersion: string;
    payloadHash: string;
  };
}
```

## 6. Operation classes

The initial operation-class layer is:

```text
EVOCATION
DIVINATION
ENCHANTMENT
INVOCATION
ILLUMINATION
CUSTOM
```

Operation class is not the same as function. `ILLUMINATION`, for example, can contain specific functions such as focus, discipline, creativity, learning or transmutation.

## 7. Matrix Engine

A matrix is executable transformation/correspondence logic, not a UI label.

Minimum Matrix contract:

```text
identity
source
revision
authority
vocabulary
correspondences
transformation_rules
geometry_rules
number_rules
color_rules
sound_rules
compatibility
output_channels
provenance
```

Initial matrix families include HNK canonical matrices, HNK40, HNK/HENUVOKODAN resources where applicable, Sefer/Sephirotic references already admitted by Source Lock, HEX, binary, numerological mappings and future version-locked matrices.

A matrix contribution MUST be attributable to its source/revision. Matrix selection MUST alter compilation only through declared rules.

## 8. Manifestation Bundle

One ALEF may compile into multiple synchronized channels:

```text
SIGIL
GLYPH
COLOR
NUMBER
HEX
BINARY
GEOMETRY
SOUND
VOICE
KODE
ACTION
SHIMOKODAN
```

A bundle is a set of manifestations sharing the same originating ALEF and compilation provenance.

## 9. Gnosis Engine

Gnosis is a first-class activation profile.

Candidate contract:

```text
mode
induction
duration
breath
visual_focus
sound
frequency
mantra_or_voice
gesture
anchor
activation_peak
release
```

No single induction method is hard-coded as universal.

## 10. ACTION / Psychomagic manifestation

`ACTION` is an Assiah manifestation channel.

Lifecycle:

```text
GENERATED → PREPARED → EXECUTED → COMPLETED → REFLECTED
```

Generation never implies execution. Execution requires a distinct event in the ledger.

## 11. Shimokodan V0.2

A Shimokodan is a persistent agent manifestation.

Candidate contract:

```text
identity
purpose
alef
manifestation_bundle
matrices
capabilities
constraints
anchor
gnosis
activation
state
feeding
telemetry
lifecycle
purge
history
```

Supported identity classes continue to include AI, ASTRAL and HYBRID.

The computational provider is an implementation dependency, not the Shimokodan identity.

## 12. Lifecycle and Purga

Persistent manifestations define lifecycle policy at compilation time where applicable:

```text
activation_conditions
active_state
pause_or_dormancy
termination_condition
purge_protocol
archive_policy
```

Purga terminates/deactivates runtime according to policy while preserving historical evidence.

## 13. Human Gate

Human Gate does not determine whether HNK is true. It determines whether a specific generated/compiled manifestation receives the required human authority transition.

No compiler output silently becomes HNK canon.

## 14. Source Lock and Creator Authority

HNK canonical authority and external/reference knowledge are separate authority layers.

External matrices may contribute techniques, correspondences and research knowledge, but they do not silently override HNK canonical authority.

All imported knowledge used by deterministic compilation must be revision-addressable through Source Lock or another explicit provenance mechanism.

## 15. Determinism

For deterministic channels:

```text
same ALEF normalized
+ same operation
+ same matrix revisions
+ same compiler version
+ same source lock
= same deterministic TEHNKÉ IR payload/hash
```

Non-deterministic/adaptive channels must declare that property and record the execution/provider context separately.

## 16. V0.2 implementation order

1. TEHNKÉ IR schema + serializer + hash.
2. V0.1 compatibility bridge.
3. Matrix Engine contract.
4. HNK Source Adapter → Matrix adapters.
5. Operation Class layer.
6. Manifestation Bundle.
7. Gnosis Engine.
8. ACTION compiler.
9. Shimokodan V0.2 contract/lifecycle.
10. Visual Compiler UI.
11. Durable Vault migration.
12. V0.2 release attestation.

## 17. Release gates

- V0.1 historical golden vectors remain valid.
- V0.2 deterministic replay is tested.
- Every Matrix contribution has provenance.
- `GENERATED != CANON` remains enforced.
- `GENERATED_ACTION != EXECUTED_ACTION` remains enforced.
- Shimokodan activation obeys Human Gate policy.
- Purga preserves history.
- Source Lock remains intact.
- V0.2 ships with release manifest and attestation.

## 18. Architectural declaration

**SIGILKODE V0.2 = TEHNKÉ-MAGIK COMPILER.**

The visual workbench is an interface to the compiler; it is not the compiler itself.
