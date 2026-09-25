import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { compileAndExecuteTehnke } from "../src/tehnke-matrix-engine.mjs";

const golden = JSON.parse(fs.readFileSync(new URL("./fixtures/hnk-canon-adapter.golden.json", import.meta.url), "utf8"));

const INPUT = Object.freeze({
  intentLiteral: "ALEF CANON PROVENANCE",
  operationClass: "CUSTOM",
  functionType: "PERSONALIZADO",
  matrices: [Object.freeze({
    identity: "HNK_CANON",
    revision: "V0.1",
    authority: "HNK_CANONICAL",
    selectors: Object.freeze({ canonRecordIds: Object.freeze(["HNK-CANON-R001-054"]) })
  })],
  channels: ["SIGIL"]
});

test("propagates canonical contribution provenance through Matrix Engine", () => {
  const result = compileAndExecuteTehnke(INPUT);
  const output = result.applications[0].output;
  assert.equal(output.contributions.length, 1);
  assert.equal(output.contributions[0].provenance.recordId, "HNK-CANON-R001-054");
  assert.equal(output.semanticInference, false);
});

test("matches byte-stable HNK canonical golden output", () => {
  const first = compileAndExecuteTehnke(INPUT).applications[0].output;
  const second = compileAndExecuteTehnke(INPUT).applications[0].output;
  assert.deepEqual(JSON.parse(JSON.stringify(first)), golden);
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
});