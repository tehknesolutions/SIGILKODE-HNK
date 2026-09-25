import { createHash } from "node:crypto";
import {
  HNK_SOURCE_LOCK_VERSION,
  resolveHnkCanonicalRecord,
  validateHnkSourceSnapshots
} from "@sigilkode/hnk-source-adapters";

export const HNK_CANON_MATRIX_ADAPTER_VERSION = "SIGILKODE-HNK-CANON-MATRIX-ADAPTER/V0.1";

function sha256(value) {
  return createHash("sha256").update(String(value), "utf8").digest("hex");
}

function uniqueIds(ids) {
  const seen = new Set();
  const out = [];
  for (const raw of ids ?? []) {
    if (typeof raw !== "string") throw new TypeError("canonRecordIds entries must be strings");
    const id = raw.trim().toUpperCase();
    if (!id) throw new RangeError("canonRecordIds entries must not be empty");
    if (!seen.has(id)) { seen.add(id); out.push(id); }
  }
  return Object.freeze(out);
}
export function applyHnkCanonMatrix(application, context = {}) {
  if (application?.authority !== "HNK_CANONICAL") {
    throw new RangeError("HNK_CANON requires HNK_CANONICAL authority");
  }
  const validation = validateHnkSourceSnapshots();
  if (!validation.ok) throw new Error(`HNK canonical source snapshots invalid: ${validation.errors.join("; ")}`);
  const seed = String(context.sourcePayloadHash ?? context.payloadHash ?? "");
  if (!/^[0-9a-f]{64}$/i.test(seed)) throw new TypeError("HNK_CANON adapter requires SHA-256 sourcePayloadHash");

  const requestedRecordIds = uniqueIds(application?.selectors?.canonRecordIds ?? []);
  const contributions = [];
  const unresolvedRecordIds = [];
  for (const id of requestedRecordIds) {
    const record = resolveHnkCanonicalRecord(id);
    if (!record) { unresolvedRecordIds.push(id); continue; }
    const provenance = Object.freeze({ ...record.provenance });
    const contributionId = sha256(JSON.stringify({
      version: HNK_CANON_MATRIX_ADAPTER_VERSION,
      sourceLock: HNK_SOURCE_LOCK_VERSION,
      recordId: record.canon_item_id
    }));
    contributions.push(Object.freeze({ contributionId, matrixIdentity: "HNK_CANON",
      authority: "HNK_CANONICAL", canonItemId: record.canon_item_id,
      ...(record.source_item_id ? { sourceItemId: record.source_item_id } : {}),
      kind: record.kind, name: record.name, ...(record.definition ? { definition: record.definition } : {}),
      constraints: Object.freeze([...(record.constraints ?? [])]), provenance }));
  }
  const replayPayload = {
    version: HNK_CANON_MATRIX_ADAPTER_VERSION,
    sourceLock: HNK_SOURCE_LOCK_VERSION,
    sourcePayloadHash: seed.toLowerCase(), requestedRecordIds,
    contributionIds: contributions.map((item) => item.contributionId), unresolvedRecordIds
  };
  return Object.freeze({
    version: HNK_CANON_MATRIX_ADAPTER_VERSION,
    sourceLock: HNK_SOURCE_LOCK_VERSION,
    authority: "HNK_CANONICAL", semanticInference: false,
    requestedRecordIds, contributions: Object.freeze(contributions),
    unresolvedRecordIds: Object.freeze(unresolvedRecordIds),
    replayHash: sha256(JSON.stringify(replayPayload))
  });
}