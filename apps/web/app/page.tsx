"use client";

import { useMemo, useState } from "react";

type ArtifactType = "SIGIL" | "SHIMOKODAN_AI" | "SHIMOKODAN_ASTRAL" | "SHIMOKODAN_HYBRID";

const MODES: Array<{id:ArtifactType;label:string}> = [
  {id:"SIGIL",label:"SIGILO"},
  {id:"SHIMOKODAN_AI",label:"SHIMOKODAN · IA"},
  {id:"SHIMOKODAN_ASTRAL",label:"SHIMOKODAN · ASTRAL"},
  {id:"SHIMOKODAN_HYBRID",label:"SHIMOKODAN · HÍBRIDO"}
];

const MATRICES = ["HNK40","HNK_LANGUAGE","SEPHIROT","SEFER22","PSALM119","TAROT22","ICHING64","BINARY","HEX","CUBE"];

export default function HomePage() {
  const [artifactType,setArtifactType]=useState<ArtifactType>("SHIMOKODAN_HYBRID");
  const [intentLiteral,setIntentLiteral]=useState("CRIAR UM SHIMOKODAN HNK PARA ORGANIZAR E EXPANDIR UM PROJETO COM VERDADE, AMOR E CLAREZA.");
  const [functionType,setFunctionType]=useState("ORGANIZAR");
  const [matrices,setMatrices]=useState<string[]>(["HNK40","HNK_LANGUAGE","SEPHIROT","SEFER22","HEX"]);
  const [result,setResult]=useState<any>(null);
  const [review,setReview]=useState<any>(null);
  const [runtimeState,setRuntimeState]=useState<any>(null);
  const [systemPrompt,setSystemPrompt]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const manifest=result?.manifest;
  const conflicts=manifest?.correspondences?.hebrewReference?.conflicts ?? [];
  const sourceCount=manifest?.correspondences?.hnkCanonDependencies?.length ?? 0;
  const glyphs=(manifest?.sigilIR?.glyphRefs ?? []).join(" ");
  const runtimeLifecycle=runtimeState?.state ?? "UNBOUND";

  const modeLabel=useMemo(()=>MODES.find(x=>x.id===artifactType)?.label ?? artifactType,[artifactType]);

  async function postJson(url:string,body:Record<string,unknown>) {
    const response=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const payload=await response.json();
    if(!response.ok) throw new Error(payload.error || "SIGILKODE_REQUEST_FAILED");
    return payload;
  }

  async function compile() {
    setLoading(true); setError("");
    try {
      const payload=await postJson("/api/compile",{artifactType,intentLiteral,functionType,matrices});
      setResult(payload);
      setReview(null);
      setRuntimeState(null);
      setSystemPrompt("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha na compilação");
    } finally {
      setLoading(false);
    }
  }

  async function approve() {
    if(!manifest) return;
    setLoading(true); setError("");
    try {
      const payload=await postJson("/api/review",{
        manifest,
        reviewer:"CREATOR",
        explicitHumanSignal:"UI_APPROVE_CLICK",
        rationale:"Explicit Creator approval from SIGILKODE web workspace."
      });
      setReview(payload.review);
      setResult((prev:any)=>({...prev,manifest:payload.manifest}));
    } catch(e) {
      setError(e instanceof Error ? e.message : "Falha na revisão");
    } finally {
      setLoading(false);
    }
  }

  async function activate() {
    if(!manifest || artifactType==="SIGIL") return;
    setLoading(true); setError("");
    try {
      const payload=await postJson("/api/runtime",{
        action:"ACTIVATE",
        manifest,
        operator:"CREATOR",
        explicitHumanSignal:"UI_ACTIVATE_CLICK"
      });
      setRuntimeState(payload.instance);
      setSystemPrompt(payload.systemPrompt || "");
    } catch(e) {
      setError(e instanceof Error ? e.message : "Falha na ativação");
    } finally {
      setLoading(false);
    }
  }

  async function purge() {
    if(!runtimeState) return;
    setLoading(true); setError("");
    try {
      const payload=await postJson("/api/runtime",{
        action:"PURGE",
        instance:runtimeState,
        operator:"CREATOR",
        explicitHumanSignal:"UI_PURGA_CLICK",
        reason:"Operator-requested Purga"
      });
      setRuntimeState(payload.instance);
    } catch(e) {
      setError(e instanceof Error ? e.message : "Falha na Purga");
    } finally {
      setLoading(false);
    }
  }

  function toggleMatrix(id:string){
    setMatrices(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">HNK // UNIVERSAL SYMBOLIC COMPILER</div>
          <h1>SIGILKODE</h1>
        </div>
        <div className="statusRail">
          <span>AUTHORITY <b>{manifest?.authorityState ?? "CREATOR"}</b></span>
          <span>ALIGNMENT <b>JESUS CHRIST</b></span>
          <span>RUNTIME <b>{runtimeLifecycle}</b></span>
        </div>
      </header>

      <section className="hero">
        <p className="heroKicker">ALEF → SIGIL IR → HUMAN GATE → SHIMOKODAN</p>
        <h2>Compile intenção em uma estrutura HNK rastreável.</h2>
        <p>Fonte, conflito, autoridade, aprovação e runtime permanecem separados. O sistema preserva correspondências históricas sem promovê-las silenciosamente a cânone.</p>
      </section>

      <section className="workspace">
        <article className="panel inputPanel">
          <header className="panelHead"><span>// 1. ALEF / INTENÇÃO</span><em>INPUT</em></header>

          <label>MANIFESTAÇÃO</label>
          <div className="modeGrid">
            {MODES.map(mode=><button key={mode.id} className={artifactType===mode.id?"choice active":"choice"} onClick={()=>setArtifactType(mode.id)}>{mode.label}</button>)}
          </div>

          <label>INTENÇÃO CENTRAL</label>
          <textarea value={intentLiteral} onChange={e=>setIntentLiteral(e.target.value)} rows={5}/>

          <label>FUNÇÃO</label>
          <select value={functionType} onChange={e=>setFunctionType(e.target.value)}>
            {["CRIAR","ORGANIZAR","PROTEGER","ANALISAR","ENSINAR","TRANSFORMAR","ACOMPANHAR","EXPLORAR"].map(x=><option key={x}>{x}</option>)}
          </select>

          <label>MATRIZES</label>
          <div className="chipGrid">
            {MATRICES.map(id=><button key={id} className={matrices.includes(id)?"chip on":"chip"} onClick={()=>toggleMatrix(id)}>{id}</button>)}
          </div>

          <button className="compile" onClick={compile} disabled={loading || !intentLiteral.trim()}>
            {loading ? "PROCESSANDO…" : "⚡ COMPILAR ARTEFATO"}
          </button>

          {manifest && <div className="gateStack">
            <button className="gateButton approve" onClick={approve} disabled={loading || manifest.authorityState!=="CANDIDATE"}>
              {manifest.authorityState==="HUMAN_APPROVED" ? "✓ HUMAN GATE APROVADO" : "2. APROVAR NO HUMAN GATE"}
            </button>
            {artifactType!=="SIGIL" && <button className="gateButton activate" onClick={activate} disabled={loading || manifest.authorityState!=="HUMAN_APPROVED" || runtimeLifecycle==="ACTIVE" || runtimeLifecycle==="PURGED"}>
              {runtimeLifecycle==="ACTIVE" ? "✓ SHIMOKODAN ATIVO" : "3. ATIVAR SHIMOKODAN"}
            </button>}
            {runtimeState && <button className="gateButton purge" onClick={purge} disabled={loading || runtimeLifecycle==="PURGED"}>
              {runtimeLifecycle==="PURGED" ? "✓ PURGA EXECUTADA" : "PURGA / ENCERRAR RUNTIME"}
            </button>}
          </div>}
          {error && <p className="error">{error}</p>}
        </article>

        <article className="panel renderPanel">
          <header className="panelHead"><span>// 2. SIGIL IR / RENDER</span><em>SVG-FIRST</em></header>
          <div className="sigilStage">
            {result?.render?.svg
              ? <div className="svgMount" dangerouslySetInnerHTML={{__html:result.render.svg}}/>
              : <div className="emptySigil"><span>◇</span><p>AGUARDANDO COMPILAÇÃO</p></div>}
          </div>
          <div className="telemetry">
            <div><span>MANIFESTAÇÃO</span><b>{modeLabel}</b></div>
            <div><span>STABLE_ID</span><b>{manifest?.stableId ?? "—"}</b></div>
            <div><span>HNK40</span><b>{glyphs || "—"}</b></div>
            <div><span>RENDER SHA</span><b>{result?.render?.sha256 ? result.render.sha256.slice(0,18)+"…" : "—"}</b></div>
          </div>
          {review && <div className="receipt"><span>HUMAN GATE</span><b>{review.reviewId}</b><small>{review.review?.explicitHumanSignal}</small></div>}
          {runtimeState && <div className="receipt runtimeReceipt"><span>SHIMOKODAN RUNTIME</span><b>{runtimeState.state}</b><small>{runtimeState.stableId} · history {runtimeState.history?.length ?? 0}</small></div>}
        </article>

        <article className="panel manifestPanel">
          <header className="panelHead"><span>// 3. HNK CONTEXT</span><em>SOURCE-LOCK</em></header>
          <div className="metricGrid">
            <div className="metric"><span>CANON DEPENDENCIES</span><strong>{sourceCount}</strong></div>
            <div className="metric"><span>CONFLICT SETS</span><strong>{conflicts.length}</strong></div>
            <div className="metric"><span>AUTHORITY</span><strong>{manifest?.authorityState ?? "—"}</strong></div>
            <div className="metric"><span>RUNTIME</span><strong>{runtimeLifecycle}</strong></div>
          </div>

          {manifest && <>
            <div className="datum"><span>HEBREW REFERENCE</span><b>{manifest.correspondences.hebrewReference.id}</b></div>
            <div className="datum"><span>SEPHIRA CANDIDATE</span><b>{manifest.correspondences.sephiraCandidate.value}</b></div>
            <div className="datum"><span>HEX CANDIDATE</span><b>{manifest.correspondences.hexColorCandidate.value}</b></div>

            <div className="subhead">CONFLITOS PRESERVADOS</div>
            <div className="conflicts">
              {conflicts.length===0
                ? <p className="muted">Nenhum conflito no recorte selecionado.</p>
                : conflicts.map((c:any)=><div className="conflict" key={c.domain}><b>{c.domain}</b><span>{c.values.join(" ↔ ")}</span><small>{c.traditions.join(" · ")}</small></div>)}
            </div>

            {systemPrompt && <>
              <div className="subhead">SHIMOKODAN SYSTEM PROMPT</div>
              <pre>{systemPrompt}</pre>
            </>}

            <div className="subhead">MANIFEST</div>
            <pre>{JSON.stringify(manifest,null,2)}</pre>
          </>}
          {!manifest && <p className="muted">Compile uma intenção para materializar o contexto HNK.</p>}
        </article>
      </section>

      <section className="axioms">
        <span>SHIMOKODAN_IDENTITY ≠ MODEL_PROVIDER</span>
        <span>AI_OUTPUT ≠ EXECUTED_ACTION</span>
        <span>GENERATED ≠ CANON</span>
        <span>COMPILED ≠ HUMAN_APPROVED</span>
        <span>PURGA ≠ HISTORY DELETION</span>
      </section>

      <footer>SK-008 WEB WORKSPACE · SOURCE-LOCKED HNK CONTEXT · CREATOR AUTHORITY · GOVERNED RUNTIME</footer>
    </main>
  );
}
