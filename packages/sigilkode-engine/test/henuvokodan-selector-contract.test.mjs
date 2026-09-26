import test from "node:test";
import assert from "node:assert/strict";
import { compileTehnkeIR } from "../src/tehnke-ir.mjs";
import { executeMatrixEngine } from "../src/tehnke-matrix-engine.mjs";

function input(forms) {
  return { intentLiteral: "Validar idioma HNK", matrices: [{
    identity: "HENUVOKODAN", revision: "V0.1", authority: "SOURCE_LOCKED",
    selectors: { lexemeForms: forms }
  }], channels: ["KODE"] };
}

test("normalizes HENUVOKODAN lexemeForms into hashed TEHNKE IR", () => {
  const ir = compileTehnkeIR(input([" pitsa ", "DAYI"]));
  assert.deepEqual(ir.matrices[0].selectors.lexemeForms, ["PITSA", "DAYI"]);
});

test("lexeme selector changes deterministic payload hash", () => {
  assert.notEqual(compileTehnkeIR(input(["PITSA"])).deterministic.payloadHash,
    compileTehnkeIR(input(["DAYI"])).deterministic.payloadHash);
});

test("propagates lexeme selectors end-to-end", () => {
  const ir = compileTehnkeIR(input(["PITSA", "BANKA"]));
  const result = executeMatrixEngine(ir);
  assert.deepEqual(result.applications[0].output.requestedLexemeForms, ["PITSA", "BANKA"]);
});