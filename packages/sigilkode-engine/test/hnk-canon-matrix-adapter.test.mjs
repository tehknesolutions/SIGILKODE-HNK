import test from "node:test";
import assert from "node:assert/strict";
import { applyMatrixAdapter, clearMatrixAdapters, hasMatrixAdapter } from "../src/tehnke-matrix-adapters.mjs";

const HASH = "0".repeat(64);
function application(ids, authority = "HNK_CANONICAL") {
  return Object.freeze({
    order: 1, identity: "HNK_CANON", revision: "V0.1", authority,
    channels: Object.freeze(["SIGIL"]),
    selectors: Object.freeze({ canonRecordIds: Object.freeze(ids) }), state: "APPLIED"
  });
}

test("registers HNK_CANON", () => {
  clearMatrixAdapters();
  assert.equal(hasMatrixAdapter("HNK_CANON"), true);
});

test("emits only resolved canonical contributions with provenance", () => {
  clearMatrixAdapters();
  const result = applyMatrixAdapter(application(["HNK-CANON-R001-054", "HNK-CANON-DOES-NOT-EXIST"]), { sourcePayloadHash: HASH });
  assert.equal(result.output.authority, "HNK_CANONICAL");
  assert.equal(result.output.semanticInference, false);
  assert.equal(result.output.contributions.length, 1);
  assert.equal(result.output.contributions[0].canonItemId, "HNK-CANON-R001-054");
  assert.deepEqual(result.output.unresolvedRecordIds, ["HNK-CANON-DOES-NOT-EXIST"]);
  assert.equal(result.output.contributions[0].provenance.recordId, "HNK-CANON-R001-054");
});

test("de-duplicates selectors preserving first order", () => {
  clearMatrixAdapters();
  const result = applyMatrixAdapter(application(["HNK-CANON-R001-056", "HNK-CANON-R001-054", "HNK-CANON-R001-056"]), { sourcePayloadHash: HASH });
  assert.deepEqual(result.output.requestedRecordIds, ["HNK-CANON-R001-056", "HNK-CANON-R001-054"]);
});

test("accepts an empty selector set as a canonical no-op", () => {
  clearMatrixAdapters();
  const result = applyMatrixAdapter(application([]), { sourcePayloadHash: HASH });
  assert.deepEqual(result.output.contributions, []);
  assert.deepEqual(result.output.unresolvedRecordIds, []);
});

test("fails closed on authority escalation", () => {
  clearMatrixAdapters();
  assert.throws(() => applyMatrixAdapter(application(["HNK-CANON-R001-054"], "STRUCTURAL_ONLY"), { sourcePayloadHash: HASH }), /HNK_CANONICAL/);
});

test("replay hash is stable for identical input", () => {
  clearMatrixAdapters();
  const a = applyMatrixAdapter(application(["HNK-CANON-R001-054"]), { sourcePayloadHash: HASH });
  const b = applyMatrixAdapter(application(["HNK-CANON-R001-054"]), { sourcePayloadHash: HASH });
  assert.equal(a.output.replayHash, b.output.replayHash);
});