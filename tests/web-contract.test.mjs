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

test("SK-008 review API uses explicit Creator Authority gate", async()=>{
  const route=await readFile(new URL("../apps/web/app/api/review/route.ts",import.meta.url),"utf8");
  assert.match(route,/createArtifactReview/);
  assert.match(route,/applyHumanReview/);
  assert.match(route,/materializeHumanApprovedManifest/);
  assert.match(route,/UI_APPROVE_CLICK/);
});

test("SK-008 runtime API exposes ACTIVATE and PURGE without canon mutation", async()=>{
  const route=await readFile(new URL("../apps/web/app/api/runtime/route.ts",import.meta.url),"utf8");
  assert.match(route,/ACTIVATE/);
  assert.match(route,/PURGE/);
  assert.match(route,/activateShimokodan/);
  assert.match(route,/purgeShimokodan/);
});

test("SK-008 UI exposes four canonical artifact manifestations and authority boundaries", async()=>{
  const page=await readFile(new URL("../apps/web/app/page.tsx",import.meta.url),"utf8");
  for(const token of ["SIGIL","SHIMOKODAN_AI","SHIMOKODAN_ASTRAL","SHIMOKODAN_HYBRID"]) assert.match(page,new RegExp(token));
  assert.match(page,/GENERATED ≠ CANON/);
  assert.match(page,/COMPILED ≠ HUMAN_APPROVED/);
  assert.match(page,/PURGA ≠ HISTORY DELETION/);
});
