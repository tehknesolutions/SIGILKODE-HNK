import { createHash } from "node:crypto";

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
const HEBREW_22 = Object.freeze([
  "ALEPH","BETH","GIMEL","DALETH","HE","VAV","ZAYIN","CHETH","TETH","YOD","KAPH",
  "LAMED","MEM","NUN","SAMEKH","AYIN","PE","TZADDI","QOPH","RESH","SHIN","TAV"
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
    sourceLockVersion: String(input.sourceLockVersion || "HNK-SOURCE-LOCK/V0.1")
  });
}

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function bytes(hash) {
  return hash.match(/../g).map((pair) => Number.parseInt(pair, 16));
}

function glyphId(byte) {
  return `G${String((byte % 40) + 1).padStart(2, "0")}`;
}

function candidateCorrespondence(name, value, locator) {
  return Object.freeze({
    value,
    provenance: Object.freeze({
      source: "SIGILKODE_BUILTIN_V0.1",
      revision: "V0.1",
      authority: "CANDIDATE",
      locator
    })
  });
}

function buildSigilIR(hash) {
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
    glyphRefs: Object.freeze(b.slice(0, 7).map(glyphId)),
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
  const sigilIR = buildSigilIR(hash);

  const base = {
    schemaVersion: SCHEMA,
    stableId,
    artifactType: canonical.artifactType,
    intentLiteral: canonical.intentLiteral,
    intentNormalized: canonical.intentNormalized,
    functionType: canonical.functionType,
    selectedMatrices: canonical.matrices,
    deterministicSeed: hash,
    authorityState: "CANDIDATE",
    lifecycle: "COMPILED",
    correspondences: Object.freeze({
      sephira: candidateCorrespondence("sephira", SEPHIROT[b[0] % 10], "hash.byte[0]"),
      hebrew22: candidateCorrespondence("hebrew22", HEBREW_22[b[1] % 22], "hash.byte[1]"),
      hnk40Signature: candidateCorrespondence(
        "hnk40Signature",
        sigilIR.glyphRefs,
        "hash.bytes[0..6] modulo 40; deterministic signature only, not semantic glyph mapping"
      ),
      hexColor: candidateCorrespondence("hexColor", `#${hash.slice(0, 6)}`, "hash[0..5]")
    }),
    sigilIR,
    provenance: Object.freeze([
      Object.freeze({
        source: canonical.sourceLockVersion,
        authority: "REFERENCE",
        locator: "sources/HNK_SOURCE_LOCK_V0.1.json"
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
        origin: "SIGILKODE"
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
