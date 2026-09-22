import { readFileSync } from "node:fs";

function loadJson(relativeUrl) {
  return JSON.parse(readFileSync(new URL(relativeUrl, import.meta.url), "utf8"));
}

const SOURCE_LOCK = loadJson("../../../sources/HNK_SOURCE_LOCK_V0.1.json");
const HNK40 = loadJson("../../../sources/materialized/hnk40.v0.1.json");
const LANGUAGE = loadJson("../../../sources/materialized/hnk-language.v0.1.json");
const CANON = loadJson("../../../sources/materialized/hnk-canon.v0.1.json");
const CORR = loadJson("../../../sources/materialized/hnk-correspondences.v0.1.json");

export const HNK_SOURCE_LOCK_VERSION = "HNK-SOURCE-LOCK/V0.1";

export const SIGILKODE_CANON_DEPENDENCY_IDS = Object.freeze([
  "HNK-CANON-R001-054",
  "HNK-CANON-R001-056",
  "HNK-CANON-R001-059",
  "HNK-CANON-R001-060",
  "HNK-CANON-R001-061",
  "HNK-CANON-R001-062",
  "HNK-CANON-R001-067",
  "HNK-CANON-R001-080"
]);

const GLYPH_BY_ID = new Map(HNK40.entries.map((entry) => [entry.glyphId, Object.freeze(entry)]));
const LEXEME_BY_FORM = new Map(LANGUAGE.lexemes.map((entry) => [entry.transliteration, Object.freeze(entry)]));
const CANON_BY_ID = new Map(CANON.records.map((entry) => [entry.canon_item_id, Object.freeze(entry)]));
const LETTER_POSITION = new Map(CORR.letters.map(([id, position]) => [id, position]));
const LETTERS = CORR.letters.map(([id]) => id);

function sourceRef(tradition) {
  const source = CORR.sources[tradition];
  return source ? Object.freeze({ ...source }) : undefined;
}

function record(letter, domain, value, tradition, extra = {}) {
  const position = LETTER_POSITION.get(letter);
  return Object.freeze({
    subject_id: `HEBREW_${letter}`,
    domain,
    value,
    tradition_id: tradition,
    system_version: "1.0.0",
    origin: "HISTORICAL_SOURCE",
    claim_kind: "CORRESPONDENCE",
    evidence_scope: "SOURCE_SCOPED",
    decision: "REFERENCE",
    ordinals: Object.freeze({
      hebrew_letter_position: position,
      ...(extra.tarotNumber == null ? {} : { tarot_card_number: extra.tarotNumber }),
      ...(domain !== "TREE_PATH" ? {} : { path_number: position + 10 })
    }),
    sources: Object.freeze(sourceRef(tradition) ? [sourceRef(tradition)] : []),
    source_snapshot: "hnk-correspondences.v0.1.json"
  });
}

function maybePush(out, letter, domain, mapping, tradition) {
  const value = mapping?.[letter];
  if (value == null) return;
  if (typeof value === "object") out.push(record(letter, domain, value.title, tradition, { tarotNumber: value.number }));
  else out.push(record(letter, domain, value, tradition));
}

export function getHebrewCorrespondences(letterId) {
  const letter = String(letterId ?? "").replace(/^HEBREW_/i, "").toUpperCase();
  if (!LETTER_POSITION.has(letter)) return [];

  const out = [];
  maybePush(out, letter, "LETTER_CLASS", CORR.mappings.letter_class, "SEFER_YETZIRAH_REFERENCE_A");
  maybePush(out, letter, "ELEMENT", CORR.mappings.sefer.element, "SEFER_YETZIRAH_REFERENCE_A");
  maybePush(out, letter, "PLANET", CORR.mappings.sefer.planet, "SEFER_YETZIRAH_REFERENCE_A");
  maybePush(out, letter, "ZODIAC", CORR.mappings.sefer.zodiac, "SEFER_YETZIRAH_REFERENCE_A");

  maybePush(out, letter, "ELEMENT", CORR.mappings.golden_dawn.element, "GOLDEN_DAWN_STANDARD");
  maybePush(out, letter, "PLANET", CORR.mappings.golden_dawn.planet, "GOLDEN_DAWN_STANDARD");
  maybePush(out, letter, "ZODIAC", CORR.mappings.golden_dawn.zodiac, "GOLDEN_DAWN_STANDARD");
  maybePush(out, letter, "TAROT_TRUMP", CORR.mappings.golden_dawn.tarot, "GOLDEN_DAWN_STANDARD");
  maybePush(out, letter, "TREE_PATH", CORR.mappings.golden_dawn.tree_path, "GOLDEN_DAWN_STANDARD");

  if (letter !== "ALEPH") {
    maybePush(out, letter, "ELEMENT", CORR.del_debbio.explicit_element, "DEL_DEBBIO_KABBALAH_HERMETICA");
    maybePush(out, letter, "PLANET", CORR.mappings.golden_dawn.planet, "DEL_DEBBIO_KABBALAH_HERMETICA");
    maybePush(out, letter, "ZODIAC", CORR.mappings.golden_dawn.zodiac, "DEL_DEBBIO_KABBALAH_HERMETICA");
    maybePush(out, letter, "TAROT_TRUMP", CORR.mappings.golden_dawn.tarot, "DEL_DEBBIO_KABBALAH_HERMETICA");
    maybePush(out, letter, "TREE_PATH", CORR.mappings.golden_dawn.tree_path, "DEL_DEBBIO_KABBALAH_HERMETICA");
  }

  maybePush(out, letter, "TAROT_TRUMP", CORR.mappings.levi_tarot, "ELIPHAS_LEVI_SEQUENCE");
  maybePush(out, letter, "TAROT_TRUMP", CORR.mappings.thoth_tarot, "CROWLEY_THOTH");

  return out;
}

function conflictsFor(records) {
  const byDomain = new Map();
  for (const item of records) {
    const group = byDomain.get(item.domain) ?? [];
    group.push(item);
    byDomain.set(item.domain, group);
  }
  const conflicts = [];
  for (const [domain, group] of byDomain) {
    const values = [...new Set(group.map((item) => item.value))];
    const traditions = [...new Set(group.map((item) => item.tradition_id))];
    if (group.length > 1 && (values.length > 1 || traditions.length > 1)) {
      conflicts.push(Object.freeze({ domain, values: Object.freeze(values), traditions: Object.freeze(traditions) }));
    }
  }
  return conflicts;
}

export function getHnkGlyph(glyphId) {
  return GLYPH_BY_ID.get(String(glyphId ?? "").toUpperCase());
}

export function glyphIdFromByte(byte) {
  if (!Number.isInteger(byte) || byte < 0 || byte > 255) throw new RangeError("byte must be 0..255");
  return `G${String((byte % 40) + 1).padStart(2, "0")}`;
}

export function getHnkLexeme(form) {
  return LEXEME_BY_FORM.get(String(form ?? "").trim().toUpperCase());
}

export function searchHnkCanon(query) {
  const needle = String(query ?? "").trim().toLocaleLowerCase("pt-BR");
  if (!needle) return [...CANON.records];
  return CANON.records.filter((item) =>
    [
      item.canon_item_id,
      item.source_item_id,
      item.name,
      item.kind,
      item.definition,
      ...(item.constraints ?? [])
    ].join(" ").toLocaleLowerCase("pt-BR").includes(needle)
  );
}

function languageMatches(intentNormalized) {
  const tokens = new Set(String(intentNormalized).split(/[^A-ZÁ-ÚÀ-ÙÂ-ÛÃ-ÕÇ]+/u).filter(Boolean));
  return LANGUAGE.lexemes
    .filter((entry) => tokens.has(entry.transliteration))
    .map((entry) => Object.freeze({
      ...entry,
      provenance: Object.freeze({
        repository: LANGUAGE.source.repository,
        commit: LANGUAGE.source.commit,
        path: LANGUAGE.source.path,
        blob_sha: LANGUAGE.source.blob_sha,
        authority: entry.authority
      })
    }));
}

function sourceLockEntry(repository) {
  return SOURCE_LOCK.sources.find((entry) => entry.repository === repository);
}

export function validateHnkSourceSnapshots() {
  const errors = [];
  const codexLock = sourceLockEntry("tehknesolutions/codex-hnk");
  if (!codexLock) errors.push("codex-hnk source lock missing");

  for (const snapshot of [HNK40, LANGUAGE, CANON, CORR]) {
    if (snapshot.source?.commit !== codexLock?.commit) {
      errors.push(`${snapshot.snapshot_schema}: source commit drift`);
    }
  }

  if (HNK40.entries.length !== 40) errors.push(`HNK40 expected 40 entries, got ${HNK40.entries.length}`);
  if (new Set(HNK40.entries.map((entry) => entry.glyphId)).size !== 40) errors.push("HNK40 duplicate glyph id");
  if (LANGUAGE.lexemes.length !== 33) errors.push(`HNK language expected 33 lexemes, got ${LANGUAGE.lexemes.length}`);
  if (LANGUAGE.phrases.length !== 7) errors.push(`HNK language expected 7 phrases, got ${LANGUAGE.phrases.length}`);
  if (CANON.records.length !== 22) errors.push(`HNK canon expected 22 records, got ${CANON.records.length}`);
  if (CORR.letters.length !== 22) errors.push(`Correspondence snapshot expected 22 letters, got ${CORR.letters.length}`);

  for (const id of SIGILKODE_CANON_DEPENDENCY_IDS) {
    if (!CANON_BY_ID.has(id)) errors.push(`SigilKode canon dependency missing: ${id}`);
  }

  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

export function materializeHnkContext({ hash, intentNormalized }) {
  if (!/^[0-9a-f]{64}$/i.test(String(hash))) throw new TypeError("hash must be SHA-256 hex");
  const validation = validateHnkSourceSnapshots();
  if (!validation.ok) throw new Error(`HNK source snapshots invalid: ${validation.errors.join("; ")}`);

  const bytes = String(hash).match(/../g).map((pair) => Number.parseInt(pair, 16));
  const glyphSignature = bytes.slice(0, 7).map((byte) => {
    const glyphId = glyphIdFromByte(byte);
    return Object.freeze({
      ...getHnkGlyph(glyphId),
      provenance: Object.freeze({
        repository: HNK40.source.repository,
        commit: HNK40.source.commit,
        path: HNK40.source.path,
        blob_sha: HNK40.source.blob_sha,
        authority: HNK40.source.package_status
      })
    });
  });

  const letterIndex = bytes[1] % LETTERS.length;
  const letter = LETTERS[letterIndex];
  const correspondences = getHebrewCorrespondences(letter);
  const canonDependencies = SIGILKODE_CANON_DEPENDENCY_IDS.map((id) => Object.freeze({
    ...CANON_BY_ID.get(id),
    provenance: Object.freeze({
      repository: CANON.source.repository,
      commit: CANON.source.commit,
      path: CANON.source.path,
      blob_sha: CANON.source.blob_sha,
      authority: CANON.source.status
    })
  }));

  return Object.freeze({
    sourceLock: HNK_SOURCE_LOCK_VERSION,
    glyphSignature: Object.freeze(glyphSignature),
    selectedHebrew: Object.freeze({
      id: `HEBREW_${letter}`,
      position: letterIndex + 1,
      correspondences: Object.freeze(correspondences),
      conflicts: Object.freeze(conflictsFor(correspondences))
    }),
    languageMatches: Object.freeze(languageMatches(intentNormalized)),
    canonDependencies: Object.freeze(canonDependencies)
  });
}
