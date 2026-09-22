import test from "node:test";
import assert from "node:assert/strict";
import { compileArtifact } from "../packages/sigilkode-engine/src/index.mjs";
import {
  appendRuntimeEvidence,
  applyHumanReview,
  createArtifactReview,
  createRuntimeEvidenceLedger,
  materializeHumanApprovedManifest
} from "../packages/sigilkode-governance/src/index.mjs";

const manifest = compileArtifact({
  artifactType: "SHIMOKODAN_HYBRID",
  intentLiteral: "Criar um agente de teste",
  functionType: "CRIAR",
  matrices: ["HNK40"]
});

test("SK-006 generated artifact requires explicit human decision", () => {
  const review = createArtifactReview(manifest,{openedAt:"2026-09-22T00:00:00Z"});
  assert.equal(review.status,"PENDING_HUMAN_REVIEW");
  assert.equal(review.automaticPromotionAllowed,false);
  assert.throws(()=>materializeHumanApprovedManifest(manifest,review),/EXPLICIT_HUMAN_APPROVAL_REQUIRED/);
});

test("SK-006 explicit human approval yields HUMAN_APPROVED, never HNK_CANON", () => {
  const review = createArtifactReview(manifest,{openedAt:"2026-09-22T00:00:00Z"});
  const decided = applyHumanReview(review,manifest,{
    decision:"APPROVE",
    reviewer:"TW-DVF",
    reviewedAt:"2026-09-22T00:01:00Z",
    explicitHumanSignal:"SIGA",
    rationale:"Approved for SigilKode artifact use."
  });
  const approved = materializeHumanApprovedManifest(manifest,decided);
  assert.equal(approved.authorityState,"HUMAN_APPROVED");
  assert.equal(approved.governanceReceipt.automaticCanonPromotion,false);
  assert.equal(approved.governanceReceipt.canonPromotionPermitted,false);
});

test("SK-006 PURGA preserves event history and cannot prove metaphysical claims", () => {
  let ledger=createRuntimeEvidenceLedger(manifest);
  ledger=appendRuntimeEvidence(ledger,{eventType:"ACTIVATE",occurredAt:"2026-09-22T00:02:00Z",data:{mode:"runtime"}});
  ledger=appendRuntimeEvidence(ledger,{eventType:"PURGA",occurredAt:"2026-09-22T00:03:00Z",data:{reason:"operator request"}});
  assert.equal(ledger.events.length,2);
  assert.equal(ledger.events[0].eventType,"ACTIVATE");
  assert.equal(ledger.events[1].eventType,"PURGA");
  assert.equal(ledger.metaphysicalProofPermitted,false);
  assert.equal(ledger.canonPromotionPermitted,false);
});
