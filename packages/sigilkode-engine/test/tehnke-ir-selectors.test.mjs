import test from "node:test";
import assert from "node:assert/strict";
import { compileTehnkeIR } from "../src/tehnke-ir.mjs";

const base = {
  intentLiteral: "ALEF TEST",
  operationClass: "CUSTOM",
  functionType: "PERSONALIZADO",
  channels: ["SIGIL"]
};

test("normalizes explicit canonical selectors into the hashed IR", () => {
  const ir = compileTehnkeIR({
    ...base,
    matrices: [{ identity: "HNK_CANON", selectors: { canonRecordIds: [" hnk-canon-r001-054 "] } }]
  });
  assert.deepEqual(ir.matrices[0].selectors.canonRecordIds, ["HNK-CANON-R001-054"]);
  assert.equal(Object.isFrozen(ir.matrices[0].selectors.canonRecordIds), true);
});

test("selector changes change deterministic payload hash", () => {
  const a = compileTehnkeIR({ ...base, matrices: [{ identity: "HNK_CANON", selectors: { canonRecordIds: ["HNK-CANON-R001-054"] } }] });
  const b = compileTehnkeIR({ ...base, matrices: [{ identity: "HNK_CANON", selectors: { canonRecordIds: ["HNK-CANON-R001-056"] } }] });
  assert.notEqual(a.deterministic.payloadHash, b.deterministic.payloadHash);
});

test("legacy matrix descriptors remain valid without selectors", () => {
  const ir = compileTehnkeIR({ ...base, matrices: ["HNK40"] });
  assert.equal(ir.matrices[0].identity, "HNK40");
  assert.equal(ir.matrices[0].selectors, undefined);
});

test("rejects malformed canonical selector entries", () => {
  assert.throws(() => compileTehnkeIR({
    ...base,
    matrices: [{ identity: "HNK_CANON", selectors: { canonRecordIds: [{}] } }]
  }), /canonRecordIds entries must be strings/i);
});
