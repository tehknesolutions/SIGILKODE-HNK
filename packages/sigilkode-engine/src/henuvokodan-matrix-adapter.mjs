import { createHash } from "node:crypto";
import { HNK_SOURCE_LOCK_VERSION, resolveHnkLexeme, validateHnkSourceSnapshots } from "@sigilkode/hnk-source-adapters";

export const HENUVOKODAN_MATRIX_ADAPTER_VERSION = "SIGILKODE-HENUVOKODAN-MATRIX-ADAPTER/V0.1";
const sha256 = value => createHash("sha256").update(String(value), "utf8").digest("hex");

function uniqueForms(forms) {
  const seen = new Set(), out = [];
  for (const raw of forms ?? []) {
    if (typeof raw !== "string") throw new TypeError("lexemeForms entries must be strings");
    const form = raw.trim().toUpperCase();
    if (!form) throw new RangeError("lexemeForms entries must not be empty");
    if (!seen.has(form)) { seen.add(form); out.push(form); }
  }
  return Object.freeze(out);
}

export function applyHenuvokodanMatrix(application, context = {}) {
  if (application?.authority !== "SOURCE_LOCKED") throw new RangeError("HENUVOKODAN requires SOURCE_LOCKED authority");
  const validation = validateHnkSourceSnapshots();
  if (!validation.ok) throw new Error(`HENUVOKODAN source snapshots invalid: ${validation.errors.join("; ")}`);
  const seed = String(context.sourcePayloadHash ?? context.payloadHash ?? "");
  if (!/^[0-9a-f]{64}$/i.test(seed)) throw new TypeError("HENUVOKODAN adapter requires SHA-256 sourcePayloadHash");
  const requestedLexemeForms = uniqueForms(application?.selectors?.lexemeForms ?? []);
  const contributions = [], unresolvedLexemeForms = [];
  for (const form of requestedLexemeForms) {
    const lexeme = resolveHnkLexeme(form);
    if (!lexeme) { unresolvedLexemeForms.push(form); continue; }
    contributions.push(Object.freeze({ contributionId: sha256(`${HENUVOKODAN_MATRIX_ADAPTER_VERSION}:${lexeme.id}`),
      matrixIdentity: "HENUVOKODAN", transliteration: lexeme.transliteration, meaning: lexeme.meaning ?? null,
      lexemeAuthority: lexeme.authority, certainty: lexeme.certainty, lessons: Object.freeze([...(lexeme.lessons ?? [])]),
      provenance: Object.freeze({ ...lexeme.provenance }) }));
  }
  const replayPayload = { version: HENUVOKODAN_MATRIX_ADAPTER_VERSION, sourceLock: HNK_SOURCE_LOCK_VERSION,
    sourcePayloadHash: seed.toLowerCase(), requestedLexemeForms,
    contributionIds: contributions.map(x => x.contributionId), unresolvedLexemeForms };
  return Object.freeze({
    version: HENUVOKODAN_MATRIX_ADAPTER_VERSION, sourceLock: HNK_SOURCE_LOCK_VERSION,
    authority: "SOURCE_LOCKED", semanticInference: false, requestedLexemeForms,
    contributions: Object.freeze(contributions), unresolvedLexemeForms: Object.freeze(unresolvedLexemeForms),
    replayHash: sha256(JSON.stringify(replayPayload))
  });
}
