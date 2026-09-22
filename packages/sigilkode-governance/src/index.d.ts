export type ReviewDecision = "APPROVE" | "EDIT" | "REJECT";

export interface ArtifactReview {
  reviewVersion: "SIGILKODE-REVIEW/V0.1";
  reviewId: string;
  stableId: string;
  manifestDigest: string;
  proposalAuthority: "CANDIDATE";
  status: "PENDING_HUMAN_REVIEW" | "REVIEWED";
  automaticPromotionAllowed: false;
  creatorDecisionRequired: true;
  review: null | {
    decision: ReviewDecision;
    reviewer: string;
    reviewedAt: string;
    explicitHumanSignal: string;
    rationale: string;
    humanDecision: true;
  };
}

export interface RuntimeEvidenceLedger {
  ledgerVersion: "SIGILKODE-RUNTIME-EVIDENCE/V0.1";
  stableId: string;
  events: Array<Record<string, unknown>>;
  automaticTruthInference: false;
  causalClaimPermitted: false;
  metaphysicalProofPermitted: false;
  canonPromotionPermitted: false;
  ledgerDigest: string;
}

export function digestManifest(manifest: Record<string, any>): string;
export function createArtifactReview(manifest: Record<string, any>, input: { openedAt: string }): ArtifactReview;
export function applyHumanReview(review: ArtifactReview, manifest: Record<string, any>, input: {
  decision: ReviewDecision;
  reviewer: string;
  reviewedAt: string;
  explicitHumanSignal: string;
  rationale: string;
}): ArtifactReview;
export function materializeHumanApprovedManifest(manifest: Record<string, any>, review: ArtifactReview): Record<string, any>;
export function createRuntimeEvidenceLedger(manifest: Record<string, any>): RuntimeEvidenceLedger;
export function appendRuntimeEvidence(ledger: RuntimeEvidenceLedger, input: {
  eventType: "ACTIVATE" | "PURGA" | "OBSERVATION" | "INTERPRETATION" | "ACTION_PROPOSED" | "ACTION_EXECUTED";
  occurredAt: string;
  data?: Record<string, unknown>;
}): RuntimeEvidenceLedger;
