import test from "node:test";
import assert from "node:assert/strict";
import {
  HNK_SOURCE_LOCK_VERSION,
  resolveHnkCanonicalRecord,
  validateHnkSourceSnapshots
} from "@sigilkode/hnk-source-adapters";

test("resolves an exact HNK canonical id with locked provenance", () => {
  assert.equal(validateHnkSourceSnapshots().ok, true);
  const record = resolveHnkCanonicalRecord("HNK-CANON-R001-054");
  assert.equal(record.canon_item_id, "HNK-CANON-R001-054");
  assert.equal(record.provenance.sourceLock, HNK_SOURCE_LOCK_VERSION);
  assert.match(record.provenance.commit, /^[0-9a-f]{40}$/i);
  assert.match(record.provenance.blob_sha, /^[0-9a-f]{40}$/i);
  assert.equal(Object.isFrozen(record), true);
  assert.equal(Object.isFrozen(record.provenance), true);
});

test("does not infer an unknown canonical id", () => {
  assert.equal(resolveHnkCanonicalRecord("HNK-CANON-DOES-NOT-EXIST"), undefined);
});

test("rejects malformed canonical selector types", () => {
  assert.throws(() => resolveHnkCanonicalRecord({}), /canon item id/i);
});
