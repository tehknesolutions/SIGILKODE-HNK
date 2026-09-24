import { createHash } from "node:crypto";
import { getHnkGlyph, glyphIdFromByte, HNK_SOURCE_LOCK_VERSION, validateHnkSourceSnapshots } from "@sigilkode/hnk-source-adapters";

export const HNK40_MATRIX_ADAPTER_VERSION = "SIGILKODE-HNK40-MATRIX-ADAPTER/V0.1";

function sha256(value) {
  return createHash("sha256").update(String(value), "utf8").digest("hex");
}

export function applyHnk40Matrix(application, context = {}) {
  const validation = validateHnkSourceSnapshots();
  if (!validation.ok) throw new Error(`HNK40 source snapshots invalid: ${validation.errors.join("; ")}`);
  const seed = String(context.sourcePayloadHash ?? context.payloadHash ?? "");
  if (!/^[0-9a-f]{64}$/i.test(seed)) throw new TypeError("HNK40 adapter requires SHA-256 sourcePayloadHash");
  const bytes = seed.match(/../g).map(pair => Number.parseInt(pair, 16));
  const glyphIds = Object.freeze(bytes.slice(0, 7).map(glyphIdFromByte));
  const glyphs = Object.freeze(glyphIds.map(glyphId => Object.freeze({ ...getHnkGlyph(glyphId) })));
  const replayHash = sha256(JSON.stringify({ version: HNK40_MATRIX_ADAPTER_VERSION, sourcePayloadHash: seed.toLowerCase(), glyphIds }));
  return Object.freeze({
    version: HNK40_MATRIX_ADAPTER_VERSION,
    sourceLock: HNK_SOURCE_LOCK_VERSION,
    authority: "STRUCTURAL_ONLY",
    semanticInference: false,
    glyphIds,
    glyphs,
    replayHash
  });
}
