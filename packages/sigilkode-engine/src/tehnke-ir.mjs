import { createHash } from "node:crypto";

export const TEHNKE_IR_VERSION = "TEHNKE-IR/V0.2";
export const TEHNKE_COMPILER_VERSION = "SIGILKODE-TEHNKE-COMPILER/V0.2";

export const OPERATION_CLASSES = Object.freeze([
  "EVOCATION",
  "DIVINATION",
  "ENCHANTMENT",
  "INVOCATION",
  "ILLUMINATION",
  "CUSTOM"
]);

const OPERATION_SET = new Set(OPERATION_CLASSES);

function normalize(value) {
  return String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toUpperCase();
}

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalizeCanonRecordIds(value) {
  if (value == null) return Object.freeze([]);
  if (!Array.isArray(value)) throw new TypeError("canonRecordIds must be an array");
  return Object.freeze(value.map((id) => {
    if (typeof id !== "string") throw new TypeError("canonRecordIds entries must be strings");
    const normalized = normalize(id);
    if (!normalized) throw new RangeError("canonRecordIds entries must not be empty");
    return normalized;
  }));
}

function normalizeLexemeForms(value) {
  if (value == null) return Object.freeze([]);
  if (!Array.isArray(value)) throw new TypeError("lexemeForms must be an array");
  return Object.freeze(value.map((form) => {
    if (typeof form !== "string") throw new TypeError("lexemeForms entries must be strings");
    const normalized = normalize(form);
    if (!normalized) throw new RangeError("lexemeForms entries must not be empty");
    return normalized;
  }));
}

function canonicalMatrix(matrix) {
  if (typeof matrix === "string") {
    return Object.freeze({
      identity: normalize(matrix),
      revision: "UNSPECIFIED",
      authority: "REFERENCE",
      channels: Object.freeze([])
    });
  }

  const identity = normalize(matrix?.identity);
  if (!identity) throw new RangeError("matrix.identity is required");

  const selectors = matrix?.selectors == null ? undefined : Object.freeze({
    ...(matrix.selectors?.canonRecordIds != null ? { canonRecordIds: normalizeCanonRecordIds(matrix.selectors.canonRecordIds) } : {}),
    ...(matrix.selectors?.lexemeForms != null ? { lexemeForms: normalizeLexemeForms(matrix.selectors.lexemeForms) } : {})
  });

  return Object.freeze({
    identity,
    revision: String(matrix?.revision || "UNSPECIFIED"),
    authority: normalize(matrix?.authority || "REFERENCE"),
    channels: Object.freeze([...(matrix?.channels || [])].map(normalize).filter(Boolean).sort()),
    ...(selectors ? { selectors } : {})
  });
}

function canonicalChannel(channel) {
  if (typeof channel === "string") {
    return Object.freeze({ type: normalize(channel), deterministic: true });
  }
  const type = normalize(channel?.type);
  if (!type) throw new RangeError("channel.type is required");
  return Object.freeze({
    type,
    deterministic: channel?.deterministic !== false
  });
}

export function serializeTehnkeIRPayload(payload) {
  return JSON.stringify(payload);
}

export function compileTehnkeIR(input) {
  const literal = String(input?.alef?.literal ?? input?.intentLiteral ?? "").trim();
  if (!literal) throw new RangeError("ALEF literal is required");

  const normalized = normalize(input?.alef?.normalized || literal);
  const operationClass = normalize(input?.operation?.class || input?.operationClass || "CUSTOM");
  if (!OPERATION_SET.has(operationClass)) throw new RangeError("Invalid operation class");

  const operationFunction = normalize(
    input?.operation?.function || input?.functionType || "PERSONALIZADO"
  );

  const matrices = [...(input?.matrices || [])]
    .map(canonicalMatrix)
    .sort((a, b) => `${a.identity}@${a.revision}`.localeCompare(`${b.identity}@${b.revision}`));

  const channels = [...(input?.channels || ["SIGIL"])]
    .map(canonicalChannel)
    .sort((a, b) => a.type.localeCompare(b.type));

  const sourceLockVersion = String(input?.sourceLockVersion || "UNSPECIFIED");

  const canonicalPayload = Object.freeze({
    version: TEHNKE_IR_VERSION,
    alef: Object.freeze({ literal, normalized }),
    operation: Object.freeze({ class: operationClass, function: operationFunction }),
    matrices: Object.freeze(matrices),
    channels: Object.freeze(channels),
    sourceLockVersion,
    compilerVersion: TEHNKE_COMPILER_VERSION
  });

  const payloadHash = sha256(serializeTehnkeIRPayload(canonicalPayload));

  return Object.freeze({
    version: TEHNKE_IR_VERSION,
    alef: canonicalPayload.alef,
    operation: canonicalPayload.operation,
    matrices: canonicalPayload.matrices,
    channels: canonicalPayload.channels,
    provenance: Object.freeze([
      Object.freeze({ source: "USER_INTENT", authority: "LOCAL", locator: "alef.literal" }),
      Object.freeze({ source: sourceLockVersion, authority: "REFERENCE", locator: "sourceLockVersion" })
    ]),
    deterministic: Object.freeze({
      compilerVersion: TEHNKE_COMPILER_VERSION,
      sourceLockVersion,
      payloadHash
    })
  });
}

export function verifyTehnkeReplay(input, expectedPayloadHash) {
  return compileTehnkeIR(input).deterministic.payloadHash === expectedPayloadHash;
}
