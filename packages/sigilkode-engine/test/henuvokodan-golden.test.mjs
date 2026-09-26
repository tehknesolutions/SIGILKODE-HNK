import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { compileAndExecuteTehnke } from "../src/tehnke-matrix-engine.mjs";

const fixtureUrl = new URL("./fixtures/henuvokodan-adapter.golden.json", import.meta.url);
const INPUT = Object.freeze({ intentLiteral: "ALEF HENUVOKODAN GOLDEN", operationClass: "CUSTOM",
  functionType: "PERSONALIZADO", matrices: [Object.freeze({ identity: "HENUVOKODAN", revision: "V0.1",
    authority: "SOURCE_LOCKED", selectors: Object.freeze({ lexemeForms: Object.freeze(["PITSA", "DAYI", "BANKA"]) }) })],
  channels: ["KODE"] });

test("matches byte-stable HENUVOKODAN golden output", () => {
  const expected = JSON.parse(fs.readFileSync(fixtureUrl, "utf8"));
  const first = compileAndExecuteTehnke(INPUT).applications[0].output;
  const second = compileAndExecuteTehnke(INPUT).applications[0].output;
  assert.deepEqual(JSON.parse(JSON.stringify(first)), expected);
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
});