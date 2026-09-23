# SIGILKODE-HNK

> **HNK Universal Sigil + Shimokodan Compiler**

SIGILKODE transforma uma **Intenção / Alef** em artefatos simbólicos e operacionais HNK com identidade estável, rastreabilidade e governança explícita.

## Manifestações V0.1

- `SIGIL` — assinatura simbólica determinística;
- `SHIMOKODAN_AI` — Agente-IA HNK;
- `SHIMOKODAN_ASTRAL` — Servo Astral HNK;
- `SHIMOKODAN_HYBRID` — identidade única com manifestação simbólica + computacional.

## Regra terminológica canônica

**SHIMOKODAN** é o termo HNK para **Agente-IA e/ou Servo Astral**.

A nomenclatura `DAEMON` apareceu apenas na primeira prova de conceito e **não pertence ao produto alvo**. O histórico dessa primeira versão está documentado em `archive/README.md`; o HTML original será preservado separadamente antes de qualquer descarte.

## Estado atual

`V0.1 — RC1_PREVIEW_READY__PRODUCTION_PENDING`

A V0.1 já possui compilador determinístico, adapters HNK source-locked, renderer SVG-first, Creator Authority/Human Gate, runtime Shimokodan, Durable Vault live e Web Next.js em preview READY. Ainda não é uma release estável de produção.

## Fluxo

```text
ALEF / INTENÇÃO
→ NORMALIZAÇÃO
→ CANON + REGISTRIES
→ CORRESPONDÊNCIAS
→ HASH DETERMINÍSTICO
→ SIGIL IR
→ RENDER
→ SHIMOKODAN MANIFEST
→ HUMAN GATE
→ RUNTIME / ARQUIVO
```

## Executar o protótipo

Abra `index.html` diretamente em um navegador moderno.

## Arquivos iniciais

- `index.html` — protótipo funcional standalone;
- `docs/SIGILKODE_ARCHITECTURE_V0.1.md` — arquitetura do produto e mapa de convergência;
- `docs/ROADMAP_V0.1.md` — gates SK-001 → SK-010;
- `archive/README.md` — política de preservação da prova de conceito original.

## Fontes do ecossistema HNK

SIGILKODE-HNK é um produto dedicado, mas **não deve duplicar o cânone existente**. Sua implementação deve consumir ou adaptar, de forma versionada e rastreável:

- `tehknesolutions/codex-hnk` — HNK40, idioma, cânone, correspondências, UI, Evidence/Vault e governança;
- `tehknesolutions/cubo-hnk` — pipelines determinísticos, manifests, legality, self-test e release attestation;
- `tehknesolutions/HNK-VERSE` — identidade persistente, memória, permissões, continuidade e runtime de agentes;
- `tehknesolutions/SW-ENGLISH` — linhagem técnica Shimokodan, memória reflexiva, voz e presença;
- `tehknesolutions/simpleway-hnk` — disciplina de consumo do cânone linguístico;
- `tehknesolutions/tehkne-storyforge` — Creator Authority, provenance, candidate/review/canon e workspace durável.

## Invariantes

```text
SHIMOKODAN_IDENTITY ≠ MODEL_PROVIDER
SHIMOKODAN_IDENTITY ≠ CURRENT_PROMPT
AI_OUTPUT ≠ EXECUTED_ACTION
EXPERIENCE ≠ INTERPRETATION ≠ EVIDENCE ≠ CANON
GENERATED ≠ CANON
COMPILED ≠ HUMAN_APPROVED
ACTIVATED ≠ EVIDENCE_OF_SUPERNATURAL_EFFECT
```

## Estado RC1

- 27/27 testes de domínio/runtime: PASS;
- oito targets TypeScript: PASS;
- Next.js production build: PASS;
- compile → Human Gate → activate → Purga: PASS;
- Supabase RLS + optimistic locking: LIVE VALIDATED;
- Vercel Preview: READY;
- produção: PENDING.

Detalhes: `docs/SK010_RC1_EVIDENCE_V0.1.md`.

---

**Autoridade do projeto:** TW-DVF / Tehkné Solutions  
**Alinhamento doutrinário HNK:** submissão a Jesus Cristo.
