import { createHash } from "node:crypto";
import {
  HNK_SOURCE_LOCK_VERSION,
  materializeHnkContext
} from "@sigilkode/hnk-source-adapters";

const SCHEMA = "HNK-SIGILKODE-MANIFEST/V0.1";
const ARTIFACT_TYPES = new Set([
  "SIGIL",
  "SHIMOKODAN_AI",
  "SHIMOKODAN_ASTRAL",
  "SHIMOKODAN_HYBRID"
]);
const SEPHIROT = Object.freeze([
  "KETHER","CHOKHMAH","BINAH","CHESED","GEVURAH",
  "TIPHERETH","NETZACH","HOD","YESOD","MALKUTH"
]);

export function normalizeIntent(value) {
  return String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toUpperCase();
}

function canonicalInput(input) {
  if (!ARTIFACT_TYPES.has(input?.artifactType)) {
    throw new RangeError("Invalid artifactType");
  }
  const intentLiteral = String(input?.intentLiteral ?? "").trim();
  if (!intentLiteral) throw new RangeError("intentLiteral is required");

  return Object.freeze({
    artifactType: input.artifactType,
    intentLiteral,
    intentNormalized: normalizeIntent(intentLiteral),
    functionType: normalizeIntent(input.functionType || "PERSONALIZADO"),
    matrices: [...new Set((input.matrices || []).map(normalizeIntent))].sort(),
    sourceLockVersion: String(input.sourceLockVersion || HNK_SOURCE_LOCK_VERSION)
  });
}

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function bytes(hash) {
  return hash.match(/../g).map((pair) => Number.parseInt(pair, 16));
}

function candidateValue(value, locator, rationale) {
  return Object.freeze({
    value,
    provenance: Object.freeze({
      source: "SIGILKODE_AUTHORED_CANDIDATE",
      revision: "V0.1",
      authority: "CANDIDATE",
      locator,
      rationale
    })
  });
}

function buildSigilIR(hash, glyphRefs) {
  const b = bytes(hash);
  const nodeCount = 12 + (b[0] % 11);
  const nodes = Array.from({ length: nodeCount }, (_, index) => Object.freeze({
    id: `N${String(index + 1).padStart(2, "0")}`,
    angle: Number(((index / nodeCount) * 360).toFixed(6)),
    radius: Number((0.54 + (b[(index + 1) % b.length] / 255) * 0.4).toFixed(6))
  }));
  const edges = nodes.map((node, index) => Object.freeze({
    from: node.id,
    to: nodes[(index + 1) % nodes.length].id
  }));
  return Object.freeze({
    version: "SIGIL-IR/V0.1",
    rings: Object.freeze([0.2, 0.4, 0.6, 0.8, 1]),
    axes: Object.freeze(Array.from({ length: 12 }, (_, i) => i * 30)),
    nodes: Object.freeze(nodes),
    edges: Object.freeze(edges),
    glyphRefs: Object.freeze([...glyphRefs]),
    paletteRoles: Object.freeze(["VOID", "PRIMARY", "SECONDARY", "ORIGIN"])
  });
}

export function compileArtifact(input) {
  const canonical = canonicalInput(input);
  const deterministicPayload = JSON.stringify({
    artifactType: canonical.artifactType,
    intentNormalized: canonical.intentNormalized,
    functionType: canonical.functionType,
    matrices: canonical.matrices,
    sourceLockVersion: canonical.sourceLockVersion
  });
  const hash = sha256(deterministicPayload);
  const b = bytes(hash);
  const stableId = `SK-${hash.slice(0, 12).toUpperCase()}`;

  const hnk = materializeHnkContext({
    hash,
    intentNormalized: canonical.intentNormalized
  });
  const glyphIds = hnk.glyphSignature.map((entry) => entry.glyphId);
  const sigilIR = buildSigilIR(hash, glyphIds);

  const base = {
    schemaVersion: SCHEMA,
    stableId,
    artifactType: canonical.artifactType,
    intentLiteral: canonical.intentLiteral,
    intentNormalized: canonical.intentNormalized,
    functionType: canonical.functionType,
    selectedMatrices: canonical.matrices,
    deterministicSeed: hash,
    sourceLockVersion: canonical.sourceLockVersion,
    authorityState: "CANDIDATE",
    lifecycle: "COMPILED",
    correspondences: Object.freeze({
      sephiraCandidate: candidateValue(
        SEPHIROT[b[0] % 10],
        "hash.byte[0] modulo 10",
        "SIGILKODE deterministic authored candidate; not inherited historical correspondence."
      ),
      hexColorCandidate: candidateValue(
        `#${hash.slice(0, 6)}`,
        "sha256[0..5]",
        "Deterministic UI/sigil color candidate; no sacred meaning is inferred from the hex value."
      ),
      hnk40Signature: Object.freeze({
        value: Object.freeze(glyphIds),
        glyphs: hnk.glyphSignature,
        provenance: Object.freeze({
          source: "@hnk/glyphs materialized snapshot",
          sourceLock: hnk.sourceLock,
          authority: "PREPRODUCTION_NOT_OFFICIAL",
          rule: "hash bytes modulo 40 select existing G01..G40 identities; selection does not infer glyph semantics"
        })
      }),
      hebrewReference: hnk.selectedHebrew,
      hnkLanguageMatches: hnk.languageMatches,
      hnkCanonDependencies: hnk.canonDependencies
    }),
    sigilIR,
    provenance: Object.freeze([
      Object.freeze({
        source: canonical.sourceLockVersion,
        authority: "REFERENCE",
        locator: "sources/HNK_SOURCE_LOCK_V0.1.json"
      }),
      Object.freeze({
        source: "tehknesolutions/codex-hnk",
        authority: "VERSION_LOCKED_SOURCE",
        locator: "sources/materialized/*"
      }),
      Object.freeze({
        source: "USER_INTENT",
        authority: "LOCAL",
        locator: "intentLiteral"
      })
    ])
  };

  if (canonical.artifactType === "SIGIL") return Object.freeze(base);

  return Object.freeze({
    ...base,
    shimokodan: Object.freeze({
      identity: Object.freeze({
        stableId,
        name: `SHIMOKODAN-${hash.slice(0, 6).toUpperCase()}`,
        origin: "SIGILKODE",
        modelIndependent: true
      }),
      goals: Object.freeze([canonical.functionType, canonical.intentNormalized]),
      runtime: Object.freeze({
        provider: "UNBOUND",
        model: "UNBOUND",
        promptVersion: "SIGILKODE-SHIMOKODAN/V0.1",
        permissions: Object.freeze(["PROPOSE", "ANALYZE", "ORGANIZE", "RESPOND"]),
        prohibitedActions: Object.freeze([
          "SILENT_CANON_MUTATION",
          "FABRICATE_EVIDENCE",
          "OVERRIDE_CREATOR_AUTHORITY",
          "IMPERSONATE_DIVINE_AUTHORITY"
        ]),
        memoryPolicy: Object.freeze([
          "EPISODIC","SEMANTIC","SOCIAL","SPATIAL","PROCEDURAL","INSTITUTIONAL","NARRATIVE_SELF"
        ]),
        killSwitch: "PURGA",
        continuity: "STABLE_ID_ABOVE_MODEL"
      })
    })
  });
}

export function verifyReplay(input, expectedStableId) {
  return compileArtifact(input).stableId === expectedStableId;
}
