import test from "node:test";
import assert from "node:assert/strict";
import { compileTehnkeIR } from "../src/tehnke-ir.mjs";
import { executeMatrixEngine } from "../src/tehnke-matrix-engine.mjs";

function input(rawByte) {
  return { intentLiteral: "Validar numerologia RAW", matrices: [{
    identity: "NUMEROLOGY_RAW", revision: "V0.1", authority: "SOURCE_LOCKED",
    selectors: { rawByte }
  }], channels: ["KODE"] };
}

test("includes rawByte in hashed TEHNKE IR", () => {
  const ir = compileTehnkeIR(input(28));
  assert.equal(ir.matrices[0].selectors.rawByte, 28);
});

test("rawByte changes deterministic payload hash", () => {
  assert.notEqual(compileTehnkeIR(input(28)).deterministic.payloadHash,
    compileTehnkeIR(input(29)).deterministic.payloadHash);
});

test("propagates rawByte end-to-end", () => {
  const result = executeMatrixEngine(compileTehnkeIR(input(28)));
  assert.equal(result.applications[0].output.rawByte, 28);
  assert.equal(result.applications[0].output.nRaw, 29);
});