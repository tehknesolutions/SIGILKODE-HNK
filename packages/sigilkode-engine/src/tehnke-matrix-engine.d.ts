import type { TehnkeIRInput, TehnkeIRV02, OperationClass } from "./tehnke-ir.js";

export interface SigilV01BridgeInput {
  intentLiteral?: string;
  intent?: string;
  alef?: string;
  operationClass?: OperationClass;
  functionType?: string;
  function?: string;
  matrices?: TehnkeIRInput["matrices"];
  channels?: TehnkeIRInput["channels"];
  sourceLockVersion?: string;
}

export interface MatrixEngineResult {
  version: "SIGILKODE-MATRIX-ENGINE/V0.1";
  alef: TehnkeIRV02["alef"];
  operation: TehnkeIRV02["operation"];
  applications: ReadonlyArray<{
    order: number;
    identity: string;
    revision: string;
    authority: string;
    channels: readonly string[];
    state: "APPLIED";
  }>;
  manifestation: ReadonlyArray<{
    type: string;
    deterministic: boolean;
    state: "READY";
  }>;
  provenance: TehnkeIRV02["provenance"];
  sourcePayloadHash: string;
}

export const MATRIX_ENGINE_VERSION: "SIGILKODE-MATRIX-ENGINE/V0.1";
export function bridgeSigilV01ToTehnke(input: SigilV01BridgeInput): TehnkeIRV02;
export function executeMatrixEngine(ir: TehnkeIRV02): MatrixEngineResult;
export function compileAndExecuteTehnke(input: TehnkeIRInput | TehnkeIRV02): MatrixEngineResult;
