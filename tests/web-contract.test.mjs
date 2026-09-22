import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("SK-008 compile API is Node-only and no-store", async()=>{
  const route=await readFile(new URL("../apps/web/app/api/compile/route.ts",import.meta.url),"utf8");
  assert.match(route,/runtime = "nodejs"/);
  assert.match(route,/Cache-Control":"no-store"/);
  assert.match(route,/compileArtifact/);
  assert.match(route,/renderSigilSvgWithDigest/);
});

test("SK-008 UI exposes four canonical artifact manifestations", async()=>{
  const page=await readFile(new URL("../apps/web/app/page.tsx",import.meta.url),"utf8");
  for(const token of ["SIGIL","SHIMOKODAN_AI","SHIMOKODAN_ASTRAL","SHIMOKODAN_HYBRID"]) assert.match(page,new RegExp(token));
  assert.match(page,/GENERATED ≠ CANON/);
  assert.match(page,/COMPILED ≠ HUMAN_APPROVED/);
});
