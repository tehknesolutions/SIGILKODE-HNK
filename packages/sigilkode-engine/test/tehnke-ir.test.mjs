import assert from "node:assert/strict";
import test from "node:test";
import { compileTehnkeIR, verifyTehnkeReplay } from "../src/tehnke-ir.mjs";

const VECTOR = Object.freeze({
  alef: { literal: "TRANSMUTAR BLOQUEIO CRIATIVO E EXPANDIR FOCO" },
  operation: { class: "ILLUMINATION", function: "FOCO" },
  matrices: [{ identity: "HNK40", revision: "V0.2", authority: "HNK" }],
  channels: ["SIGIL"],
  sourceLockVersion: "RC1"
});

const EXPECTED_HASH = "6b358cde668000fd826f03cd018750b3b028d8844d9c7a8e8f98c5dc24bad664";

test("TEHNKE IR V0.2 compiles deterministically", () => {
  const first = compileTehnkeIR(VECTOR);
  const second = compileTehnkeIR(VECTOR);
  assert.equal(first.version, "TEHNKE-IR/V0.2");
  assert.equal(first.deterministic.payloadHash, EXPECTED_HASH);
  assert.equal(second.deterministic.payloadHash, EXPECTED_HASH);
});

test("TEHNKE replay accepts the golden payload hash", () => {
  assert.equal(verifyTehnkeReplay(VECTOR, EXPECTED_HASH), true);
  assert.equal(verifyTehnkeReplay(VECTOR, "0".repeat(64)), false);
});
