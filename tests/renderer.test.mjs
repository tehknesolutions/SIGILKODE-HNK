import test from "node:test";
import assert from "node:assert/strict";
import { compileArtifact } from "../packages/sigilkode-engine/src/index.mjs";
import { renderSigilSvg, renderSigilSvgWithDigest } from "../packages/sigilkode-renderer/src/index.mjs";

const INPUT = {
  artifactType: "SIGIL",
  intentLiteral: "PITSA DAYI",
  functionType: "CRIAR",
  matrices: ["HNK40","SEFER22","HEX"]
};

test("SK-005 renderer is deterministic over identical Sigil IR", () => {
  const manifest = compileArtifact(INPUT);
  const a = renderSigilSvgWithDigest(manifest);
  const b = renderSigilSvgWithDigest(compileArtifact({...INPUT}));
  assert.equal(a.svg, b.svg);
  assert.equal(a.sha256, b.sha256);
  assert.equal(a.rendererVersion, "SIGILKODE-SVG/V0.1");
});

test("SK-005 renderer exposes stable id and HNK40 refs without semantic invention", () => {
  const manifest = compileArtifact(INPUT);
  const svg = renderSigilSvg(manifest);
  assert.match(svg, /data-renderer="SIGILKODE-SVG\/V0\.1"/);
  assert.match(svg, new RegExp(manifest.stableId));
  for (const id of manifest.sigilIR.glyphRefs) assert.match(svg, new RegExp(id));
  assert.doesNotMatch(svg, /supernatural efficacy/i);
});
