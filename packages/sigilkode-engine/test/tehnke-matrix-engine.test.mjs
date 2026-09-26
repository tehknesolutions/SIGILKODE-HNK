import assert from "node:assert/strict";
import test from "node:test";
import {
  bridgeSigilV01ToTehnke,
  compileAndExecuteTehnke,
  executeMatrixEngine
} from "../src/tehnke-matrix-engine.mjs";

test("V0.1 bridge compiles into TEHNKE-IR/V0.2 without mutating legacy input", () => {
  const legacy = Object.freeze({ intent: "Expandir foco", channels: ["SIGIL"] });
  const ir = bridgeSigilV01ToTehnke(legacy);
  assert.equal(ir.version, "TEHNKE-IR/V0.2");
  assert.equal(ir.alef.literal, "Expandir foco");
  assert.equal(ir.deterministic.sourceLockVersion, "SIGIL-IR/V0.1");
  assert.equal(legacy.intent, "Expandir foco");
});

test("Matrix Engine preserves canonical TEHNKE matrix order and source hash", () => {
  const ir = bridgeSigilV01ToTehnke({
    intent: "Criar sigilo",
    matrices: ["HNK40", { identity: "HENUVOKODAN", revision: "CANON", authority: "SOURCE_LOCKED" }],
    channels: ["SIGIL", "GLYPH"]
  });
  assert.deepEqual(ir.matrices.map(x => x.identity), ["HENUVOKODAN", "HNK40"]);
  const result = executeMatrixEngine(ir);
  assert.deepEqual(result.applications.map(x => x.identity), ir.matrices.map(x => x.identity));
  assert.equal(result.sourcePayloadHash, ir.deterministic.payloadHash);
  assert.ok(result.manifestation.every(x => x.state === "READY"));
});

test("compileAndExecuteTehnke accepts native V0.2 input", () => {
  const result = compileAndExecuteTehnke({
    intentLiteral: "Manifestar forma",
    operationClass: "ENCHANTMENT",
    matrices: ["HNK40"],
    channels: ["SIGIL"]
  });
  assert.equal(result.version, "SIGILKODE-MATRIX-ENGINE/V0.1");
  assert.equal(result.applications[0].state, "APPLIED");
});
