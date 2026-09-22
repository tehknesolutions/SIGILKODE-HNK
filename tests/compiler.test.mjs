import test from "node:test";
import assert from "node:assert/strict";
import { compileArtifact, normalizeIntent, verifyReplay } from "../packages/sigilkode-engine/src/index.mjs";

const GOLDEN_INPUT = Object.freeze({
  artifactType: "SHIMOKODAN_HYBRID",
  intentLiteral: "Criar   um Shimokodan de teste",
  functionType: "criar",
  matrices: ["SEPHIROT", "HNK40"]
});

test("SK-001 terminology: runtime class is Shimokodan", () => {
  const result = compileArtifact(GOLDEN_INPUT);
  assert.equal(result.artifactType, "SHIMOKODAN_HYBRID");
  assert.ok(result.shimokodan);
  assert.match(result.shimokodan.identity.name, /^SHIMOKODAN-/);
  assert.equal(result.shimokodan.runtime.killSwitch, "PURGA");
});

test("SK-003 deterministic replay matches golden stable id", () => {
  const first = compileArtifact(GOLDEN_INPUT);
  const second = compileArtifact({
    ...GOLDEN_INPUT,
    matrices: ["HNK40", "SEPHIROT"]
  });
  assert.equal(normalizeIntent(GOLDEN_INPUT.intentLiteral), "CRIAR UM SHIMOKODAN DE TESTE");
  assert.equal(first.stableId, "SK-47A81AFC222C");
  assert.equal(first.deterministicSeed, "47a81afc222cd5a6fbe9bb853d5544b1246532b71855519c532fc5e3be48c4e7");
  assert.deepEqual(first, second);
  assert.equal(verifyReplay(GOLDEN_INPUT, "SK-47A81AFC222C"), true);
});

test("HNK40 signature stays inside G01..G40", () => {
  const result = compileArtifact(GOLDEN_INPUT);
  const ids = result.correspondences.hnk40Signature.value;
  assert.equal(ids.length, 7);
  for (const id of ids) assert.match(id, /^G(?:0[1-9]|[1-3][0-9]|40)$/);
});

test("SIGIL does not compile an agent runtime", () => {
  const result = compileArtifact({
    artifactType: "SIGIL",
    intentLiteral: "Símbolo de teste",
    functionType: "criar",
    matrices: ["HNK40"]
  });
  assert.equal("shimokodan" in result, false);
});
