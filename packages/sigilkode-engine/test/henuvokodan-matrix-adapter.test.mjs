import test from "node:test";
import assert from "node:assert/strict";
import { applyMatrixAdapter, clearMatrixAdapters, hasMatrixAdapter } from "../src/tehnke-matrix-adapters.mjs";

const HASH = "1".repeat(64);
function application(forms, authority = "SOURCE_LOCKED") {
  return Object.freeze({
    order: 1, identity: "HENUVOKODAN", revision: "V0.1", authority,
    channels: Object.freeze(["KODE"]),
    selectors: Object.freeze({ lexemeForms: Object.freeze(forms) }), state: "APPLIED"
  });
}

test("registers HENUVOKODAN adapter", () => {
  clearMatrixAdapters();
  assert.equal(hasMatrixAdapter("HENUVOKODAN"), true);
});

test("emits source-locked lexeme contribution without promoting authority", () => {
  clearMatrixAdapters();
  const result = applyMatrixAdapter(application(["PITSA", "DAYI"]), { sourcePayloadHash: HASH });
  assert.deepEqual(result.output.contributions.map(x => x.transliteration), ["PITSA", "DAYI"]);
  assert.deepEqual(result.output.contributions.map(x => x.lexemeAuthority), ["FROZEN", "CANDIDATE"]);
  assert.equal(result.output.semanticInference, false);
  assert.ok(result.output.contributions.every(x => x.provenance.sourceLock === "HNK-SOURCE-LOCK/V0.1"));
});
test("does not invent meaning for unrecovered lexemes", () => {
  clearMatrixAdapters();
  const result = applyMatrixAdapter(application(["BANKA"]), { sourcePayloadHash: HASH });
  assert.equal(result.output.contributions[0].meaning, null);
  assert.equal(result.output.contributions[0].certainty, "UNRECOVERED");
});

test("reports unknown lexemes instead of fabricating contributions", () => {
  clearMatrixAdapters();
  const result = applyMatrixAdapter(application(["NAOEXISTE"]), { sourcePayloadHash: HASH });
  assert.deepEqual(result.output.contributions, []);
  assert.deepEqual(result.output.unresolvedLexemeForms, ["NAOEXISTE"]);
});

test("de-duplicates forms preserving first order and replay is stable", () => {
  clearMatrixAdapters();
  const app = application([" dayi ", "PITSA", "DAYI"]);
  const a = applyMatrixAdapter(app, { sourcePayloadHash: HASH });
  const b = applyMatrixAdapter(app, { sourcePayloadHash: HASH });
  assert.deepEqual(a.output.requestedLexemeForms, ["DAYI", "PITSA"]);
  assert.equal(a.output.replayHash, b.output.replayHash);
});

test("fails closed on non source-locked matrix authority", () => {
  clearMatrixAdapters();
  assert.throws(() => applyMatrixAdapter(application(["PITSA"], "REFERENCE"), { sourcePayloadHash: HASH }), /SOURCE_LOCKED/);
});