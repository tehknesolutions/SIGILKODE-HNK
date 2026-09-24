import assert from "node:assert/strict";
import test from "node:test";
import {
  applyMatrixAdapter,
  clearMatrixAdapters,
  hasMatrixAdapter,
  registerMatrixAdapter
} from "../src/tehnke-matrix-adapters.mjs";

test("unknown matrices use deterministic identity adapter", () => {
  clearMatrixAdapters();
  const result = applyMatrixAdapter({ identity: "HNK40", state: "APPLIED" });
  assert.equal(result.adapter, "IDENTITY");
  assert.equal(result.output, null);
});

test("registered adapters are explicit and isolated", () => {
  clearMatrixAdapters();
  registerMatrixAdapter("HNK40", application => ({ identity: application.identity }));
  assert.equal(hasMatrixAdapter("hnk40"), true);
  const result = applyMatrixAdapter({ identity: "HNK40", state: "APPLIED" });
  assert.equal(result.adapter, "HNK40");
  assert.deepEqual(result.output, { identity: "HNK40" });
  clearMatrixAdapters();
});
