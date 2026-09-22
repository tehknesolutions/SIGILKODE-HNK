export type ShimokodanRuntimeState = "INACTIVE" | "ACTIVE" | "PURGED";
export type ShimokodanMemoryKind =
  | "EPISODIC" | "SEMANTIC" | "SOCIAL" | "SPATIAL"
  | "PROCEDURAL" | "INSTITUTIONAL" | "NARRATIVE_SELF";

export interface ShimokodanInstance {
  runtimeVersion: "SHIMOKODAN-RUNTIME/V0.1";
  stableId: string;
  manifestDigest: string;
  identity: Record<string, unknown>;
  state: ShimokodanRuntimeState;
  cognitiveRuntime: {
    adapterId: string;
    provider: string;
    model: string;
  };
  memory: Array<Record<string, unknown>>;
  history: Array<Record<string, unknown>>;
}

export function instantiateShimokodan(manifest: Record<string, any>): ShimokodanInstance;
export function bindCognitiveRuntime(instance: ShimokodanInstance, input: {
  adapterId: string;
  provider: string;
  model: string;
  boundAt: string;
}): ShimokodanInstance;
export function activateShimokodan(instance: ShimokodanInstance, manifest: Record<string, any>, input: {
  operator: string;
  explicitHumanSignal: string;
  activatedAt: string;
}): ShimokodanInstance;
export function purgeShimokodan(instance: ShimokodanInstance, input: {
  operator: string;
  explicitHumanSignal: string;
  purgedAt: string;
  reason?: string;
}): ShimokodanInstance;
export function appendShimokodanMemory(instance: ShimokodanInstance, input: {
  kind: ShimokodanMemoryKind;
  content: string;
  provenance: "OBSERVED" | "TOLD" | "DOCUMENT" | "INFERRED" | "LEARNED" | "CANONICAL_ACCESS";
  recordedAt: string;
  confidence?: number;
}): ShimokodanInstance;
export function buildShimokodanSystemPrompt(manifest: Record<string, any>): string;
