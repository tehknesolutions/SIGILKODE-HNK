export interface HnkSourceValidation {
  ok: boolean;
  errors: string[];
}

export interface MaterializedHnkContext {
  sourceLock: string;
  glyphSignature: Array<Record<string, unknown>>;
  selectedHebrew: {
    id: string;
    position: number;
    correspondences: Array<Record<string, unknown>>;
    conflicts: Array<{ domain: string; values: string[]; traditions: string[] }>;
  };
  languageMatches: Array<Record<string, unknown>>;
  canonDependencies: Array<Record<string, unknown>>;
}

export const HNK_SOURCE_LOCK_VERSION: "HNK-SOURCE-LOCK/V0.1";
export const SIGILKODE_CANON_DEPENDENCY_IDS: readonly string[];

export function validateHnkSourceSnapshots(): HnkSourceValidation;
export function getHnkGlyph(glyphId: string): Record<string, unknown> | undefined;
export function glyphIdFromByte(byte: number): string;
export function getHnkLexeme(form: string): Record<string, unknown> | undefined;
export interface HnkCanonicalRecord extends Record<string, unknown> {
  canon_item_id: string;
  provenance: Readonly<{
    sourceLock: "HNK-SOURCE-LOCK/V0.1";
    repository: string;
    commit: string;
    path: string;
    blob_sha: string;
    sourceStatus: string;
    recordId: string;
  }>;
}

export function resolveHnkCanonicalRecord(canonItemId: string): Readonly<HnkCanonicalRecord> | undefined;
export function searchHnkCanon(query: string): Array<Record<string, unknown>>;
export function getHebrewCorrespondences(letterId: string): Array<Record<string, unknown>>;
export function materializeHnkContext(input: {
  hash: string;
  intentNormalized: string;
}): MaterializedHnkContext;
