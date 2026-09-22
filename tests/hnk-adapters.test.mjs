import test from "node:test";
import assert from "node:assert/strict";
import {
  SIGILKODE_CANON_DEPENDENCY_IDS,
  getHebrewCorrespondences,
  getHnkGlyph,
  getHnkLexeme,
  materializeHnkContext,
  searchHnkCanon,
  validateHnkSourceSnapshots
} from "../packages/hnk-source-adapters/src/index.mjs";

test("SK-004 locked HNK source snapshots validate", () => {
  const result = validateHnkSourceSnapshots();
  assert.equal(result.ok, true, result.errors.join("; "));
});

test("SK-004 HNK40 adapter resolves real locked glyph metadata", () => {
  const g01 = getHnkGlyph("G01");
  const g40 = getHnkGlyph("G40");
  assert.equal(g01.phonemeIpa, "/a/");
  assert.equal(g01.worldId, "W1");
  assert.equal(g40.phonemeIpa, "/y/");
  assert.equal(g40.worldId, "W4");
});

test("SK-004 language adapter preserves authority classes without promotion", () => {
  assert.equal(getHnkLexeme("PITSA").authority, "FROZEN");
  assert.equal(getHnkLexeme("DAYI").authority, "CANDIDATE");
  assert.equal(getHnkLexeme("BANKA").meaning, null);
  assert.equal(getHnkLexeme("HENUVOKODAN").authority, "REFERENCE");
});

test("SK-004 correspondence adapter preserves BETH planetary disagreement", () => {
  const records = getHebrewCorrespondences("BETH").filter((item) => item.domain === "PLANET");
  assert.deepEqual([...new Set(records.map((item) => item.value))].sort(), ["MERCURY", "SATURN"]);
  assert.ok(records.every((item) => item.decision === "REFERENCE"));
});

test("SK-004 canon adapter exposes explicit SigilKode dependencies", () => {
  const compiler = searchHnkCanon("Symbolic System Compiler");
  assert.equal(compiler.length, 1);
  assert.equal(compiler[0].canon_item_id, "HNK-CANON-R001-061");
  assert.equal(SIGILKODE_CANON_DEPENDENCY_IDS.length, 8);
});

test("SK-004 materialized context reports conflicts instead of choosing silently", () => {
  const hash = "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";
  const context = materializeHnkContext({ hash, intentNormalized: "PITSA DAYI" });
  assert.equal(context.glyphSignature.length, 7);
  assert.deepEqual(context.languageMatches.map((item) => item.transliteration).sort(), ["DAYI", "PITSA"]);
  assert.equal(context.canonDependencies.length, 8);
  assert.ok(Array.isArray(context.selectedHebrew.conflicts));
});
