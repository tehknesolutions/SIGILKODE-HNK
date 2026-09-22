import test from "node:test";
import assert from "node:assert/strict";
import { createEphemeralArtifactStore } from "../packages/sigilkode-store/src/index.mjs";

test("SK-009 ephemeral contract enforces owner and optimistic revision", async()=>{
  const store=createEphemeralArtifactStore();
  const first=await store.saveNew({
    ownerId:"owner-a",
    stableId:"SK-TEST",
    authorityState:"CANDIDATE",
    manifest:{stableId:"SK-TEST"},
    render:null
  });
  assert.equal(first.revision,1);
  const second=await store.update({...first,authorityState:"HUMAN_APPROVED"},1);
  assert.equal(second.revision,2);
  await assert.rejects(()=>store.update(second,1),/ARTIFACT_REVISION_CONFLICT/);
  assert.equal((await store.list("owner-a")).length,1);
  assert.equal((await store.list("owner-b")).length,0);
});
