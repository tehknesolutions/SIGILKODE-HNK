export type ArtifactType =
  | "SIGIL"
  | "SHIMOKODAN_AI"
  | "SHIMOKODAN_ASTRAL"
  | "SHIMOKODAN_HYBRID";

export interface CompileInput {
  artifactType: ArtifactType;
  intentLiteral: string;
  functionType: string;
  matrices?: string[];
  sourceLockVersion?: string;
}

export interface CompileResult {
  schemaVersion: "HNK-SIGILKODE-MANIFEST/V0.1";
  stableId: string;
  artifactType: ArtifactType;
  intentLiteral: string;
  intentNormalized: string;
  functionType: string;
  selectedMatrices: string[];
  deterministicSeed: string;
  authorityState: "CANDIDATE";
  lifecycle: "COMPILED";
  correspondences: Record<string, unknown>;
  sigilIR: {
    version: "SIGIL-IR/V0.1";
    rings: number[];
    axes: number[];
    nodes: Array<{ id: string; angle: number; radius: number }>;
    edges: Array<{ from: string; to: string }>;
    glyphRefs: string[];
    paletteRoles: string[];
  };
  provenance: Array<Record<string, string>>;
  shimokodan?: Record<string, unknown>;
}

export function normalizeIntent(value: string): string;
export function compileArtifact(input: CompileInput): CompileResult;
export function verifyReplay(input: CompileInput, expectedStableId: string): boolean;
