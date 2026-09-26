import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { compileAndExecuteTehnke } from "../src/tehnke-matrix-engine.mjs";

const fixtureUrl = new URL("./fixtures/numerology-raw-adapter.golden.json", import.meta.url);
const INPUT = Object.freeze({ intentLiteral: "ALEF NUMEROLOGY RAW GOLDEN", operationClass: "CUSTOM",
  functionType: "PERSONALIZADO", matrices: [Object.freeze({ identity: "NUMEROLOGY_RAW", revision: "V0.1",
    authority: "SOURCE_LOCKED", selectors: Object.freeze({ rawByte: 28 }) })], channels: ["KODE"] });

test("matches byte-stable NUMEROLOGY_RAW golden output", () => {
  const expected = JSON.parse(fs.readFileSync(fixtureUrl, "utf8"));
  const first = compileAndExecuteTehnke(INPUT).applications[0].output;
  const second = compileAndExecuteTehnke(INPUT).applications[0].output;
  assert.deepEqual(JSON.parse(JSON.stringify(first)), expected);
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
});