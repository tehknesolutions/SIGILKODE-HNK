import { createHash } from "node:crypto";
import { deriveRawNumerology, getNumericAuthorityRegistry } from "@sigilkode/hnk-source-adapters";

export const NUMEROLOGY_RAW_MATRIX_ADAPTER_VERSION = "SIGILKODE-NUMEROLOGY-RAW-MATRIX-ADAPTER/V0.1";
const sha256 = value => createHash("sha256").update(String(value), "utf8").digest("hex");

export function applyNumerologyRawMatrix(application, context = {}) {
  if (application?.authority !== "SOURCE_LOCKED") throw new RangeError("NUMEROLOGY_RAW requires SOURCE_LOCKED authority");
  const rawByte = application?.selectors?.rawByte;
  if (!Number.isInteger(rawByte) || rawByte < 0 || rawByte > 255) throw new RangeError("rawByte must be 0..255");
  const seed = String(context.sourcePayloadHash ?? context.payloadHash ?? "");
  if (!/^[0-9a-f]{64}$/i.test(seed)) throw new TypeError("NUMEROLOGY_RAW adapter requires SHA-256 sourcePayloadHash");
  const registry = getNumericAuthorityRegistry();
  const derived = deriveRawNumerology(rawByte);
  const replayPayload = { version: NUMEROLOGY_RAW_MATRIX_ADAPTER_VERSION, sourcePayloadHash: seed.toLowerCase(), rawByte, nRaw: derived.nRaw };
  return Object.freeze({ version: NUMEROLOGY_RAW_MATRIX_ADAPTER_VERSION, authority: registry.raw.authority,
    status: registry.raw.status, semanticInference: false, ...derived, replayHash: sha256(JSON.stringify(replayPayload)) });
}
