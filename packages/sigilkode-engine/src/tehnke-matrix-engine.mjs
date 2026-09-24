import { compileTehnkeIR } from "./tehnke-ir.mjs";
import { applyMatrixAdapter } from "./tehnke-matrix-adapters.mjs";

export const MATRIX_ENGINE_VERSION = "SIGILKODE-MATRIX-ENGINE/V0.1";

function normalize(value) {
  return String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toUpperCase();
}

export function bridgeSigilV01ToTehnke(input = {}) {
  const literal = String(input.intentLiteral ?? input.intent ?? input.alef ?? "").trim();
  if (!literal) throw new RangeError("V0.1 intent is required");

  return compileTehnkeIR({
    intentLiteral: literal,
    operationClass: input.operationClass || "CUSTOM",
    functionType: input.functionType || input.function || "PERSONALIZADO",
    matrices: input.matrices || [],
    channels: input.channels || ["SIGIL"],
    sourceLockVersion: input.sourceLockVersion || "SIGIL-IR/V0.1"
  });
}

export function executeMatrixEngine(ir) {
  if (ir?.version !== "TEHNKE-IR/V0.2") throw new RangeError("TEHNKE-IR/V0.2 required");

  const applications = ir.matrices.map((matrix, index) => applyMatrixAdapter(Object.freeze({
    order: index + 1,
    identity: normalize(matrix.identity),
    revision: matrix.revision,
    authority: matrix.authority,
    channels: Object.freeze([...matrix.channels]),
    state: "APPLIED"
  }), {
    sourcePayloadHash: ir.deterministic.payloadHash,
    alef: ir.alef,
    operation: ir.operation
  }));

  return Object.freeze({
    version: MATRIX_ENGINE_VERSION,
    alef: ir.alef,
    operation: ir.operation,
    applications: Object.freeze(applications),
    manifestation: Object.freeze(ir.channels.map(channel => Object.freeze({
      type: channel.type,
      deterministic: channel.deterministic,
      state: "READY"
    }))),
    provenance: ir.provenance,
    sourcePayloadHash: ir.deterministic.payloadHash
  });
}

export function compileAndExecuteTehnke(input) {
  const ir = input?.version === "TEHNKE-IR/V0.2" ? input : compileTehnkeIR(input);
  return executeMatrixEngine(ir);
}
