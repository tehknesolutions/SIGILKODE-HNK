import assert from "node:assert/strict";
import test from "node:test";
import {
  applyMatrixAdapter,
  clearMatrixAdapters,
  hasMatrixAdapter,
  registerMatrixAdapter
} from "../src/tehnke-matrix-adapters.mjs";

const HASH = "00010203040506ffffffffffffffffffffffffffffffffffffffffffffffffff";

test("unknown matrices use deterministic identity adapter", () => {
  clearMatrixAdapters();
  const result = applyMatrixAdapter({ identity: "UNKNOWN", state: "APPLIED" });
  assert.equal(result.adapter, "IDENTITY");
  assert.equal(result.output, null);
});

test("HNK40 is a built-in structural-only adapter", () => {
  clearMatrixAdapters();
  assert.equal(hasMatrixAdapter("hnk40"), true);
  const result = applyMatrixAdapter({ identity: "HNK40", state: "APPLIED" }, { sourcePayloadHash: HASH });
  assert.equal(result.adapter, "HNK40");
  assert.deepEqual(result.output.glyphIds, ["G01", "G02", "G03", "G04", "G05", "G06", "G07"]);
  assert.equal(result.output.authority, "STRUCTURAL_ONLY");
  assert.equal(result.output.semanticInference, false);
  assert.equal(result.output.glyphs[0].glyphId, "G01");
});

test("HNK40 replay is deterministic", () => {
  clearMatrixAdapters();
  const a = applyMatrixAdapter({ identity: "HNK40" }, { sourcePayloadHash: HASH });
  const b = applyMatrixAdapter({ identity: "HNK40" }, { sourcePayloadHash: HASH });
  assert.deepEqual(a.output, b.output);
});

test("registered adapters remain explicit and isolated", () => {
  clearMatrixAdapters();
  registerMatrixAdapter("TEST", application => ({ identity: application.identity }));
  assert.equal(hasMatrixAdapter("test"), true);
  assert.deepEqual(applyMatrixAdapter({ identity: "TEST" }).output, { identity: "TEST" });
  clearMatrixAdapters();
  assert.equal(hasMatrixAdapter("TEST"), false);
  assert.equal(hasMatrixAdapter("HNK40"), true);
});
