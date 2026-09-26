import test from "node:test";
import assert from "node:assert/strict";
import { applyMatrixAdapter, clearMatrixAdapters, hasMatrixAdapter } from "../src/tehnke-matrix-adapters.mjs";

const HASH = "2".repeat(64);
function application(rawByte, authority = "SOURCE_LOCKED") {
  return Object.freeze({ order: 1, identity: "NUMEROLOGY_RAW", revision: "V0.1", authority,
    channels: Object.freeze(["KODE"]), selectors: Object.freeze({ rawByte }), state: "APPLIED" });
}

test("registers NUMEROLOGY_RAW adapter", () => {
  clearMatrixAdapters();
  assert.equal(hasMatrixAdapter("NUMEROLOGY_RAW"), true);
});

test("derives RAW protocol only and preserves candidate authority", () => {
  clearMatrixAdapters();
  const result = applyMatrixAdapter(application(28), { sourcePayloadHash: HASH });
  assert.equal(result.output.nRaw, 29);
  assert.equal(result.output.authority, "HNK_AUTHORED_CANDIDATE");
  assert.equal(result.output.status, "EVIDENCE_MATERIALIZED_CANDIDATE");
  assert.equal(result.output.semanticInference, false);
});
test("replay is deterministic for identical RAW byte", () => {
  clearMatrixAdapters();
  const a = applyMatrixAdapter(application(255), { sourcePayloadHash: HASH });
  const b = applyMatrixAdapter(application(255), { sourcePayloadHash: HASH });
  assert.equal(a.output.replayHash, b.output.replayHash);
  assert.equal(a.output.nRaw, 256);
});

test("fails closed outside source-locked matrix authority", () => {
  clearMatrixAdapters();
  assert.throws(() => applyMatrixAdapter(application(28, "REFERENCE"), { sourcePayloadHash: HASH }), /SOURCE_LOCKED/);
});

test("rejects invalid RAW byte rather than coercing it", () => {
  clearMatrixAdapters();
  assert.throws(() => applyMatrixAdapter(application(256), { sourcePayloadHash: HASH }), /0\.\.255/);
  assert.throws(() => applyMatrixAdapter(application("28"), { sourcePayloadHash: HASH }), /0\.\.255/);
});