import { spawnSync } from "node:child_process";

const result = spawnSync(process.execPath, [
  "--test",
  "packages/sigilkode-engine/test/tehnke-sk0112.test.mjs"
], { stdio: "inherit" });

if (result.error) throw result.error;
process.exit(result.status ?? 1);
