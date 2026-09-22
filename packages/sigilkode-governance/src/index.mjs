import { createHash } from "node:crypto";

const REVIEW_VERSION = "SIGILKODE-REVIEW/V0.1";
const LEDGER_VERSION = "SIGILKODE-RUNTIME-EVIDENCE/V0.1";

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function digest(value) {
  return createHash("sha256").update(stableJson(value), "utf8").digest("hex");
}

function requireCandidate(manifest) {
  if (!manifest?.stableId) throw new TypeError("manifest stableId is required");
  if (manifest.authorityState !== "CANDIDATE") {
    throw new Error(`MANIFEST_NOT_CANDIDATE: ${manifest.authorityState}`);
  }
  return manifest;
}

export function digestManifest(manifest) {
  return digest(manifest);
}

export function createArtifactReview(manifest, { openedAt }) {
  const m = requireCandidate(manifest);
  const manifestDigest = digestManifest(m);
  return Object.freeze({
    reviewVersion: REVIEW_VERSION,
    reviewId: `SKR-${manifestDigest.slice(0, 12).toUpperCase()}`,
    stableId: m.stableId,
    manifestDigest,
    openedAt: String(openedAt),
    proposalAuthority: "CANDIDATE",
    status: "PENDING_HUMAN_REVIEW",
    automaticPromotionAllowed: false,
    creatorDecisionRequired: true,
    review: null
  });
}

export function applyHumanReview(review, manifest, input) {
  requireCandidate(manifest);
  if (review.status !== "PENDING_HUMAN_REVIEW") throw new Error("REVIEW_ALREADY_FINAL");
  if (review.stableId !== manifest.stableId) throw new Error("REVIEW_STABLE_ID_MISMATCH");
  if (review.manifestDigest !== digestManifest(manifest)) throw new Error("REVIEW_MANIFEST_DIGEST_MISMATCH");
  if (!["APPROVE","EDIT","REJECT"].includes(input.decision)) throw new RangeError("Invalid review decision");
  if (!String(input.reviewer ?? "").trim()) throw new TypeError("reviewer is required");
  if (!String(input.explicitHumanSignal ?? "").trim()) throw new TypeError("explicitHumanSignal is required");
  if (!String(input.rationale ?? "").trim()) throw new TypeError("rationale is required");

  return Object.freeze({
    ...review,
    status: "REVIEWED",
    review: Object.freeze({
      decision: input.decision,
      reviewer: input.reviewer,
      reviewedAt: input.reviewedAt,
      explicitHumanSignal: input.explicitHumanSignal,
      rationale: input.rationale,
      humanDecision: true
    })
  });
}

export function materializeHumanApprovedManifest(manifest, review) {
  requireCandidate(manifest);
  if (review.stableId !== manifest.stableId || review.manifestDigest !== digestManifest(manifest)) {
    throw new Error("REVIEW_DOES_NOT_BIND_MANIFEST");
  }
  if (review.status !== "REVIEWED" || review.review?.decision !== "APPROVE" || review.review?.humanDecision !== true) {
    throw new Error("EXPLICIT_HUMAN_APPROVAL_REQUIRED");
  }

  return Object.freeze({
    ...manifest,
    authorityState: "HUMAN_APPROVED",
    governanceReceipt: Object.freeze({
      reviewId: review.reviewId,
      reviewer: review.review.reviewer,
      reviewedAt: review.review.reviewedAt,
      explicitHumanSignal: review.review.explicitHumanSignal,
      rationale: review.review.rationale,
      humanDecision: true,
      automaticCanonPromotion: false,
      canonPromotionPermitted: false,
      boundary: "HUMAN_APPROVED_SIGILKODE_ARTIFACT_IS_NOT_HNK_CANON"
    })
  });
}

function projectLedger(ledger) {
  return {
    ledgerVersion: ledger.ledgerVersion,
    stableId: ledger.stableId,
    events: ledger.events,
    automaticTruthInference: false,
    causalClaimPermitted: false,
    metaphysicalProofPermitted: false,
    canonPromotionPermitted: false
  };
}

export function createRuntimeEvidenceLedger(manifest) {
  if (!manifest?.stableId) throw new TypeError("manifest stableId is required");
  const base = {
    ledgerVersion: LEDGER_VERSION,
    stableId: manifest.stableId,
    events: Object.freeze([]),
    automaticTruthInference: false,
    causalClaimPermitted: false,
    metaphysicalProofPermitted: false,
    canonPromotionPermitted: false
  };
  return Object.freeze({ ...base, ledgerDigest: digest(projectLedger(base)) });
}

export function appendRuntimeEvidence(ledger, input) {
  const allowed = new Set(["ACTIVATE","PURGA","OBSERVATION","INTERPRETATION","ACTION_PROPOSED","ACTION_EXECUTED"]);
  if (!allowed.has(input.eventType)) throw new RangeError("Invalid runtime evidence eventType");
  const previousDigest = ledger.ledgerDigest;
  const eventCore = Object.freeze({
    eventType: input.eventType,
    occurredAt: input.occurredAt,
    data: Object.freeze({ ...(input.data ?? {}) }),
    previousDigest
  });
  const event = Object.freeze({
    ...eventCore,
    eventDigest: digest(eventCore),
    evidenceBoundary: "EVENT_RECORD_ONLY_NOT_TRUTH_CAUSALITY_METAPHYSICAL_PROOF_OR_CANON"
  });
  const next = {
    ...ledger,
    events: Object.freeze([...ledger.events, event])
  };
  return Object.freeze({
    ...next,
    ledgerDigest: digest(projectLedger(next))
  });
}
