import test from "node:test";
import assert from "node:assert/strict";
import { compileArtifact } from "../packages/sigilkode-engine/src/index.mjs";
import { applyHumanReview, createArtifactReview, materializeHumanApprovedManifest } from "../packages/sigilkode-governance/src/index.mjs";
import {
  activateShimokodan,
  appendShimokodanMemory,
  bindCognitiveRuntime,
  buildShimokodanSystemPrompt,
  instantiateShimokodan,
  purgeShimokodan
} from "../packages/shimokodan-runtime/src/index.mjs";

function approvedManifest(){
  const candidate=compileArtifact({
    artifactType:"SHIMOKODAN_AI",
    intentLiteral:"Organizar projeto de teste",
    functionType:"ORGANIZAR",
    matrices:["HNK40","SEFER22"]
  });
  const review=createArtifactReview(candidate,{openedAt:"2026-09-22T00:00:00Z"});
  const decided=applyHumanReview(review,candidate,{
    decision:"APPROVE",
    reviewer:"TW-DVF",
    reviewedAt:"2026-09-22T00:01:00Z",
    explicitHumanSignal:"SIGA",
    rationale:"Runtime test approval."
  });
  return materializeHumanApprovedManifest(candidate,decided);
}

test("SK-007 provider/model swaps do not mutate Shimokodan identity",()=>{
  const manifest=approvedManifest();
  let instance=instantiateShimokodan(manifest);
  const id=instance.stableId;
  instance=bindCognitiveRuntime(instance,{adapterId:"adapter-a",provider:"ProviderA",model:"Model1",boundAt:"2026-09-22T00:02:00Z"});
  instance=bindCognitiveRuntime(instance,{adapterId:"adapter-b",provider:"ProviderB",model:"Model2",boundAt:"2026-09-22T00:03:00Z"});
  assert.equal(instance.stableId,id);
  assert.equal(instance.identity.stableId,id);
  assert.equal(instance.cognitiveRuntime.provider,"ProviderB");
  assert.equal(instance.history.at(-1).identityChanged,false);
});

test("SK-007 activation requires HUMAN_APPROVED manifest",()=>{
  const candidate=compileArtifact({
    artifactType:"SHIMOKODAN_AI",
    intentLiteral:"Teste",
    functionType:"CRIAR",
    matrices:["HNK40"]
  });
  const instance=instantiateShimokodan(candidate);
  assert.throws(()=>activateShimokodan(instance,candidate,{operator:"TW-DVF",explicitHumanSignal:"SIGA",activatedAt:"2026-09-22T00:04:00Z"}),/HUMAN_APPROVED_MANIFEST_REQUIRED/);
});

test("SK-007 typed memory preserves provenance and no truth authority",()=>{
  const manifest=approvedManifest();
  let instance=instantiateShimokodan(manifest);
  instance=appendShimokodanMemory(instance,{
    kind:"SEMANTIC",
    content:"A project note supplied by operator.",
    provenance:"TOLD",
    recordedAt:"2026-09-22T00:05:00Z",
    confidence:.8
  });
  assert.equal(instance.memory.length,1);
  assert.equal(instance.memory[0].provenance,"TOLD");
  assert.equal(instance.memory[0].truthAuthority,false);
});

test("SK-007 PURGA retires runtime but preserves memory/history",()=>{
  const manifest=approvedManifest();
  let instance=instantiateShimokodan(manifest);
  instance=activateShimokodan(instance,manifest,{operator:"TW-DVF",explicitHumanSignal:"SIGA",activatedAt:"2026-09-22T00:06:00Z"});
  instance=appendShimokodanMemory(instance,{kind:"EPISODIC",content:"Activation event context.",provenance:"OBSERVED",recordedAt:"2026-09-22T00:06:30Z"});
  const memoryCount=instance.memory.length;
  const historyCount=instance.history.length;
  instance=purgeShimokodan(instance,{operator:"TW-DVF",explicitHumanSignal:"PURGA",purgedAt:"2026-09-22T00:07:00Z",reason:"test"});
  assert.equal(instance.state,"PURGED");
  assert.equal(instance.memory.length,memoryCount);
  assert.equal(instance.history.length,historyCount+1);
  assert.equal(instance.history.at(-1).historyPreserved,true);
});

test("SK-007 system prompt uses canonical Shimokodan terminology",()=>{
  const prompt=buildShimokodanSystemPrompt(approvedManifest());
  assert.match(prompt,/CLASS: SHIMOKODAN/);
  assert.match(prompt,/KILL_SWITCH: PURGA/);
  assert.match(prompt,/CHRISTIAN_ALIGNMENT: JESUS CHRIST/);
});
