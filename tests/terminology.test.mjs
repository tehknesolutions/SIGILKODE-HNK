import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const ROOT = new URL("../", import.meta.url);
const ALLOWED_HISTORY = new Set([
  "README.md",
  "docs/SIGILKODE_ARCHITECTURE_V0.1.md",
  "docs/ROADMAP_V0.1.md"
]);

async function walk(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if ([".git", "node_modules", "archive"].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path, out);
    else out.push(path);
  }
  return out;
}

test("SK-001 no legacy DAEMON token leaks into executable/runtime source", async () => {
  const rootPath = new URL("..", import.meta.url).pathname;
  const files = await walk(rootPath);
  const offenders = [];
  for (const path of files) {
    const rel = relative(rootPath, path).replaceAll("\\", "/");
    if (ALLOWED_HISTORY.has(rel)) continue;
    if (![".mjs", ".js", ".ts", ".tsx", ".html", ".json", ".yaml", ".yml"].includes(extname(path))) continue;
    const text = await readFile(path, "utf8");
    if (/\bDAEMON(?:_OS)?\b/i.test(text)) offenders.push(rel);
  }
  assert.deepEqual(offenders, []);
});
