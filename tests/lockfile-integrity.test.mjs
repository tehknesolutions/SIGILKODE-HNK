import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("pnpm lockfile is a single YAML document with all workspace importers", async()=>{
  const text=await readFile(new URL("../pnpm-lock.yaml",import.meta.url),"utf8");
  const docs=text.match(/^---$/gm) ?? [];
  assert.equal(docs.length,1,"pnpm-lock.yaml must contain exactly one YAML document");

  for(const importer of [
    "apps/web:",
    "packages/hnk-source-adapters:",
    "packages/shimokodan-runtime:",
    "packages/sigilkode-contract:",
    "packages/sigilkode-engine:",
    "packages/sigilkode-governance:",
    "packages/sigilkode-renderer:",
    "packages/sigilkode-store:"
  ]){
    assert.ok(text.includes("\n  "+importer+"\n"),"missing importer: "+importer);
  }
});
