export const SIGILKODE_SCHEMA_VERSION = "HNK-SIGILKODE-MANIFEST/V0.1" as const;

export type ArtifactType =
  | "SIGIL"
  | "SHIMOKODAN_AI"
  | "SHIMOKODAN_ASTRAL"
  | "SHIMOKODAN_HYBRID";

export type AuthorityState =
  | "DRAFT"
  | "CANDIDATE"
  | "HUMAN_APPROVED"
  | "HNK_CANON_REFERENCE";

export type LifecycleState =
  | "DRAFT"
  | "COMPILED"
  | "ACTIVE"
  | "RETIRED";

export type MemoryKind =
  | "EPISODIC"
  | "SEMANTIC"
  | "SOCIAL"
  | "SPATIAL"
  | "PROCEDURAL"
  | "INSTITUTIONAL"
  | "NARRATIVE_SELF";

export interface ProvenanceRef {
  source: string;
  revision?: string;
  authority: "CANON" | "APPROVED" | "CANDIDATE" | "REFERENCE" | "LOCAL";
  locator?: string;
}

export interface CorrespondenceValue<T = string> {
  value: T;
  provenance: ProvenanceRef;
}

export interface SigilIR {
  version: "SIGIL-IR/V0.1";
  rings: number[];
  axes: number[];
  nodes: Array<{ id: string; angle: number; radius: number }>;
  edges: Array<{ from: string; to: string }>;
  glyphRefs: string[];
  paletteRoles: string[];
}

export interface ShimokodanIdentity {
  stableId: string;
  name: string;
  origin: "SIGILKODE";
  provenance: ProvenanceRef[];
}

export interface ShimokodanRuntimeContract {
  provider: string | "UNBOUND";
  model: string | "UNBOUND";
  promptVersion: string;
  permissions: string[];
  prohibitedActions: string[];
  memoryPolicy: MemoryKind[];
  killSwitch: "PURGA";
  continuity: "STABLE_ID_ABOVE_MODEL";
}

export interface SigilManifest {
  schemaVersion: typeof SIGILKODE_SCHEMA_VERSION;
  stableId: string;
  artifactType: ArtifactType;
  intentLiteral: string;
  intentNormalized: string;
  functionType: string;
  selectedMatrices: string[];
  deterministicSeed: string;
  authorityState: AuthorityState;
  lifecycle: LifecycleState;
  correspondences: Record<string, CorrespondenceValue<unknown>>;
  sigilIR: SigilIR;
  provenance: ProvenanceRef[];
}

export interface ShimokodanManifest extends SigilManifest {
  artifactType: Exclude<ArtifactType, "SIGIL">;
  shimokodan: {
    identity: ShimokodanIdentity;
    runtime: ShimokodanRuntimeContract;
    goals: string[];
  };
}

export const SIGILKODE_INVARIANTS = Object.freeze([
  "SHIMOKODAN_IDENTITY != MODEL_PROVIDER",
  "SHIMOKODAN_IDENTITY != CURRENT_PROMPT",
  "AI_OUTPUT != EXECUTED_ACTION",
  "EXPERIENCE != INTERPRETATION != EVIDENCE != CANON",
  "GENERATED != CANON",
  "COMPILED != HUMAN_APPROVED",
  "ACTIVATED != EVIDENCE_OF_SUPERNATURAL_EFFECT",
  "HNK_LANGUAGE_CANDIDATE != HNK_LANGUAGE_CANON"
] as const);
