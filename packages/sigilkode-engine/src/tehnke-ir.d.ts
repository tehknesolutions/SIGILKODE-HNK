export type OperationClass =
  | "EVOCATION"
  | "DIVINATION"
  | "ENCHANTMENT"
  | "INVOCATION"
  | "ILLUMINATION"
  | "CUSTOM";

export interface MatrixApplicationInput {
  identity: string;
  revision?: string;
  authority?: string;
  channels?: string[];
}

export interface ManifestationChannelInput {
  type: string;
  deterministic?: boolean;
}

export interface TehnkeIRInput {
  alef?: { literal: string; normalized?: string };
  intentLiteral?: string;
  operation?: { class?: OperationClass; function?: string };
  operationClass?: OperationClass;
  functionType?: string;
  matrices?: Array<string | MatrixApplicationInput>;
  channels?: Array<string | ManifestationChannelInput>;
  sourceLockVersion?: string;
}

export interface TehnkeIRV02 {
  version: "TEHNKE-IR/V0.2";
  alef: { literal: string; normalized: string };
  operation: { class: OperationClass; function: string };
  matrices: Array<{
    identity: string;
    revision: string;
    authority: string;
    channels: string[];
  }>;
  channels: Array<{ type: string; deterministic: boolean }>;
  provenance: Array<{ source: string; authority: string; locator: string }>;
  deterministic: {
    compilerVersion: "SIGILKODE-TEHNKE-COMPILER/V0.2";
    sourceLockVersion: string;
    payloadHash: string;
  };
}

export const TEHNKE_IR_VERSION: "TEHNKE-IR/V0.2";
export const TEHNKE_COMPILER_VERSION: "SIGILKODE-TEHNKE-COMPILER/V0.2";
export const OPERATION_CLASSES: readonly OperationClass[];
export function serializeTehnkeIRPayload(payload: unknown): string;
export function compileTehnkeIR(input: TehnkeIRInput): TehnkeIRV02;
export function verifyTehnkeReplay(input: TehnkeIRInput, expectedPayloadHash: string): boolean;
