"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createVaultArtifact,
  isVaultConfigured,
  listVaultArtifacts,
  readStoredSession,
  signInPassword,
  signUpPassword,
  storeSession,
  updateVaultArtifact,
  type VaultArtifact,
  type VaultSession
} from "../lib/supabase-vault";

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

  const [vaultSession,setVaultSession]=useState<VaultSession|null>(null);
  const [vaultArtifacts,setVaultArtifacts]=useState<VaultArtifact[]>([]);
  const [savedArtifact,setSavedArtifact]=useState<VaultArtifact|null>(null);
  const [vaultEmail,setVaultEmail]=useState("");
  const [vaultPassword,setVaultPassword]=useState("");
  const [vaultMessage,setVaultMessage]=useState("");
  const vaultConfigured=isVaultConfigured();

  const manifest=result?.manifest;
  const conflicts=manifest?.correspondences?.hebrewReference?.conflicts ?? [];
  const sourceCount=manifest?.correspondences?.hnkCanonDependencies?.length ?? 0;
  const glyphs=(manifest?.sigilIR?.glyphRefs ?? []).join(" ");
  const runtimeLifecycle=runtimeState?.state ?? "UNBOUND";

  const modeLabel=useMemo(()=>MODES.find(x=>x.id===artifactType)?.label ?? artifactType,[artifactType]);

  useEffect(()=>{
    const session=readStoredSession();
    if(session){
      setVaultSession(session);
      void refreshVault(session);
    }
  },[]);

  async function postJson(url:string,body:Record<string,unknown>) {
    const response=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const payload=await response.json();
    if(!response.ok) throw new Error(payload.error || "SIGILKODE_REQUEST_FAILED");
    return payload;
  }

  async function refreshVault(session=vaultSession) {
    if(!session) return;
    try {
      const rows=await listVaultArtifacts(session);
      setVaultArtifacts(rows);
      setVaultMessage(`VAULT SINCRONIZADO · ${rows.length} ARTEFATO(S)`);
    } catch(e) {
      setVaultMessage(e instanceof Error ? e.message : "Falha ao sincronizar Vault");
    }
  }

  async function auth(action:"SIGN_IN"|"SIGN_UP") {
    setLoading(true); setError(""); setVaultMessage("");
    try {
      if(action==="SIGN_IN"){
        const session=await signInPassword(vaultEmail.trim(),vaultPassword);
        setVaultSession(session);
        setVaultPassword("");
        await refreshVault(session);
      } else {
        const response=await signUpPassword(vaultEmail.trim(),vaultPassword);
        if(response.session){
          setVaultSession(response.session);
          setVaultPassword("");
          await refreshVault(response.session);
        } else {
          setVaultMessage("CADASTRO CRIADO · CONFIRME O EMAIL ANTES DE ENTRAR");
        }
      }
    } catch(e) {
      setVaultMessage(e instanceof Error ? e.message : "Falha de autenticação");
    } finally {
      setLoading(false);
    }
  }

  function signOutVault(){
    storeSession(null);
    setVaultSession(null);
    setVaultArtifacts([]);
    setSavedArtifact(null);
    setVaultMessage("SESSÃO LOCAL DO VAULT ENCERRADA");
  }

  async function compile() {
    setLoading(true); setError("");
    try {
      const payload=await postJson("/api/compile",{artifactType,intentLiteral,functionType,matrices});
      setResult(payload);
      setReview(null);
      setRuntimeState(null);
      setSystemPrompt("");
      setSavedArtifact(null);
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

  async function saveVault(){
    if(!vaultSession || !manifest) return;
    setLoading(true); setError(""); setVaultMessage("");
    try {
      const lifecycle=(runtimeLifecycle==="ACTIVE"?"ACTIVE":runtimeLifecycle==="PURGED"?"RETIRED":manifest.lifecycle ?? "COMPILED") as VaultArtifact["lifecycle"];
      const input={
        authorityState:manifest.authorityState as VaultArtifact["authority_state"],
        lifecycle,
        manifest:manifest as Record<string,unknown>,
        render:(result?.render ?? null) as Record<string,unknown>|null
      };
      let row:VaultArtifact;
      if(savedArtifact && savedArtifact.stable_id===manifest.stableId){
        row=await updateVaultArtifact(vaultSession,savedArtifact,input);
      }else{
        row=await createVaultArtifact(vaultSession,{
          stableId:manifest.stableId,
          artifactType,
          ...input
        });
      }
      setSavedArtifact(row);
      setVaultMessage(`SALVO NO VAULT · REVISION ${row.revision}`);
      await refreshVault(vaultSession);
    }catch(e){
      setVaultMessage(e instanceof Error ? e.message : "Falha ao salvar no Vault");
    }finally{
      setLoading(false);
    }
  }

  function loadVault(row:VaultArtifact){
    const m:any=row.manifest;
    setArtifactType(row.artifact_type);
    setIntentLiteral(String(m.intentLiteral ?? ""));
    setFunctionType(String(m.functionType ?? "ORGANIZAR"));
    setMatrices(Array.isArray(m.selectedMatrices)?m.selectedMatrices:[]);
    setResult({manifest:row.manifest,render:row.render});
    setReview(null);
    setRuntimeState(null);
    setSystemPrompt("");
    setSavedArtifact(row);
    setVaultMessage(`CARREGADO · ${row.stable_id} · REVISION ${row.revision}`);
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
          <span>VAULT <b>{vaultSession?"BOUND":vaultConfigured?"READY":"UNCONFIGURED"}</b></span>
        </div>
      </header>

      <section className="hero">
        <p className="heroKicker">ALEF → SIGIL IR → HUMAN GATE → SHIMOKODAN</p>
        <h2>Compile intenção em uma estrutura HNK rastreável.</h2>
        <p>Fonte, conflito, autoridade, aprovação e runtime permanecem separados. O sistema preserva correspondências históricas sem promovê-las silenciosamente a cânone.</p>
      </section>

      <section className="vaultBar">
        <div className="vaultIdentity">
          <span>// DURABLE VAULT</span>
          <b>{vaultSession?.email ?? (vaultConfigured?"AUTENTICAÇÃO NECESSÁRIA":"ENV NÃO CONFIGURADO")}</b>
          <small>{vaultMessage || "RLS owner-scoped · optimistic revision · cross-device workspace"}</small>
        </div>
        {!vaultSession ? <div className="vaultAuth">
          <input type="email" placeholder="email" value={vaultEmail} onChange={e=>setVaultEmail(e.target.value)} disabled={!vaultConfigured}/>
          <input type="password" placeholder="senha" value={vaultPassword} onChange={e=>setVaultPassword(e.target.value)} disabled={!vaultConfigured}/>
          <button onClick={()=>auth("SIGN_IN")} disabled={loading || !vaultConfigured || !vaultEmail || !vaultPassword}>ENTRAR</button>
          <button onClick={()=>auth("SIGN_UP")} disabled={loading || !vaultConfigured || !vaultEmail || !vaultPassword}>CRIAR CONTA</button>
        </div> : <div className="vaultActions">
          <button onClick={saveVault} disabled={loading || !manifest}>SALVAR / ATUALIZAR</button>
          <button onClick={()=>refreshVault()} disabled={loading}>SINCRONIZAR</button>
          <button onClick={signOutVault}>SAIR</button>
        </div>}
      </section>

      {vaultSession && vaultArtifacts.length>0 && <section className="vaultLibrary">
        {vaultArtifacts.slice(0,8).map(row=><button key={row.id} className={savedArtifact?.id===row.id?"vaultCard active":"vaultCard"} onClick={()=>loadVault(row)}>
          <span>{row.artifact_type.replaceAll("_"," · ")}</span>
          <b>{row.stable_id}</b>
          <small>{row.authority_state} · {row.lifecycle} · r{row.revision}</small>
        </button>)}
      </section>}

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
            <div><span>VAULT REVISION</span><b>{savedArtifact?.revision ?? "—"}</b></div>
            <div><span>VAULT UPDATED</span><b>{savedArtifact?.updated_at ? new Date(savedArtifact.updated_at).toLocaleString("pt-BR") : "—"}</b></div>
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

      <footer>SK-009 DURABLE WORKSPACE · SOURCE-LOCKED HNK CONTEXT · CREATOR AUTHORITY · GOVERNED RUNTIME</footer>
    </main>
  );
}
