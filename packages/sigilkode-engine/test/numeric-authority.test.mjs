import test from "node:test";
import assert from "node:assert/strict";
import { deriveRawNumerology, getNumericAuthorityRegistry } from "@sigilkode/hnk-source-adapters";

test("registry keeps RAW protocol separate from interpretive profiles", () => {
  const registry = getNumericAuthorityRegistry();
  assert.equal(registry.raw.id, "HNK-NUMERIC-RAW/V0.1");
  assert.equal(registry.raw.authority, "HNK_AUTHORED_CANDIDATE");
  assert.equal(registry.raw.semanticInference, false);
  assert.equal(registry.profiles.NUMERIA_ORDINAL_V1.status, "BLOCKED_SOURCE_NOT_MATERIALIZED");
  assert.equal(registry.profiles.SEAL_26.status, "BLOCKED_SOURCE_NOT_MATERIALIZED");
});

test("RAW derives only protocol-defined arithmetic properties", () => {
  const x = deriveRawNumerology(28);
  assert.deepEqual(x, { rawByte: 28, nRaw: 29, digitSum: 11, digitalRoot: 2,
    binary: "11101", hexadecimal: "1D", parity: "ODD", isPrime: true,
    primeFactors: [29], triangularIndex: null });
});

test("RAW boundaries are deterministic", () => {
  assert.equal(deriveRawNumerology(0).nRaw, 1);
  assert.equal(deriveRawNumerology(255).nRaw, 256);
  assert.throws(() => deriveRawNumerology(256), /0\.\.255/);
});