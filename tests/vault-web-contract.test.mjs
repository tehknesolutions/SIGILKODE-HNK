import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("SK-009 Web vault uses user-scoped bearer auth and optimistic RPC", async()=>{
  const source=await readFile(new URL("../apps/web/lib/supabase-vault.ts",import.meta.url),"utf8");
  assert.match(source,/Authorization/);
  assert.match(source,/Bearer/);
  assert.match(source,/sigilkode_artifacts/);
  assert.match(source,/sigilkode_update_artifact/);
  assert.match(source,/p_expected_revision/);
  assert.match(source,/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(source,/service_role/i);
});
