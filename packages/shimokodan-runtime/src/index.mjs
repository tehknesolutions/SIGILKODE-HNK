import { createHash } from "node:crypto";

const VERSION = "SHIMOKODAN-RUNTIME/V0.1";
const MEMORY_KINDS = new Set(["EPISODIC","SEMANTIC","SOCIAL","SPATIAL","PROCEDURAL","INSTITUTIONAL","NARRATIVE_SELF"]);
const MEMORY_PROVENANCE = new Set(["OBSERVED","TOLD","DOCUMENT","INFERRED","LEARNED","CANONICAL_ACCESS"]);

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
function digest(value){return createHash("sha256").update(stableJson(value),"utf8").digest("hex");}
function event(type,data){return Object.freeze({type,...data});}
function requireShimokodanManifest(manifest){
  if(!manifest?.shimokodan) throw new TypeError("Shimokodan manifest required");
  if(manifest.artifactType==="SIGIL") throw new TypeError("Pure SIGIL cannot instantiate Shimokodan runtime");
  if(!manifest.stableId) throw new TypeError("stableId required");
  return manifest;
}

export function instantiateShimokodan(manifest){
  const m=requireShimokodanManifest(manifest);
  return Object.freeze({
    runtimeVersion:VERSION,
    stableId:m.stableId,
    manifestDigest:digest(m),
    identity:Object.freeze({...m.shimokodan.identity}),
    state:"INACTIVE",
    cognitiveRuntime:Object.freeze({
      adapterId:"UNBOUND",
      provider:m.shimokodan.runtime?.provider ?? "UNBOUND",
      model:m.shimokodan.runtime?.model ?? "UNBOUND"
    }),
    memory:Object.freeze([]),
    history:Object.freeze([
      event("INSTANTIATED",{at:null,authorityState:m.authorityState,manifestDigest:digest(m)})
    ])
  });
}

export function bindCognitiveRuntime(instance,input){
  if(instance.state==="PURGED") throw new Error("SHIMOKODAN_PURGED");
  if(!String(input.adapterId??"").trim()) throw new TypeError("adapterId required");
  const cognitiveRuntime=Object.freeze({adapterId:input.adapterId,provider:input.provider,model:input.model});
  return Object.freeze({
    ...instance,
    cognitiveRuntime,
    history:Object.freeze([...instance.history,event("COGNITIVE_RUNTIME_BOUND",{
      at:input.boundAt,
      adapterId:input.adapterId,
      provider:input.provider,
      model:input.model,
      identityChanged:false
    })])
  });
}

export function activateShimokodan(instance,manifest,input){
  const m=requireShimokodanManifest(manifest);
  if(instance.stableId!==m.stableId) throw new Error("RUNTIME_MANIFEST_ID_MISMATCH");
  if(instance.manifestDigest!==digest(m)) throw new Error("RUNTIME_MANIFEST_DIGEST_MISMATCH");
  if(m.authorityState!=="HUMAN_APPROVED") throw new Error("HUMAN_APPROVED_MANIFEST_REQUIRED");
  if(instance.state==="PURGED") throw new Error("SHIMOKODAN_PURGED");
  if(!String(input.explicitHumanSignal??"").trim()) throw new TypeError("explicitHumanSignal required");
  return Object.freeze({
    ...instance,
    state:"ACTIVE",
    history:Object.freeze([...instance.history,event("ACTIVATED",{
      at:input.activatedAt,
      operator:input.operator,
      explicitHumanSignal:input.explicitHumanSignal
    })])
  });
}

export function purgeShimokodan(instance,input){
  if(!String(input.explicitHumanSignal??"").trim()) throw new TypeError("explicitHumanSignal required");
  if(instance.state==="PURGED") return instance;
  return Object.freeze({
    ...instance,
    state:"PURGED",
    history:Object.freeze([...instance.history,event("PURGED",{
      at:input.purgedAt,
      operator:input.operator,
      explicitHumanSignal:input.explicitHumanSignal,
      reason:input.reason ?? null,
      historyPreserved:true,
      memoryPreserved:true
    })])
  });
}

export function appendShimokodanMemory(instance,input){
  if(instance.state==="PURGED") throw new Error("SHIMOKODAN_PURGED");
  if(!MEMORY_KINDS.has(input.kind)) throw new RangeError("Invalid Shimokodan memory kind");
  if(!MEMORY_PROVENANCE.has(input.provenance)) throw new RangeError("Invalid memory provenance");
  if(!String(input.content??"").trim()) throw new TypeError("memory content required");
  const confidence=input.confidence==null?null:Number(input.confidence);
  if(confidence!=null&&(confidence<0||confidence>1||!Number.isFinite(confidence))) throw new RangeError("confidence must be 0..1");
  const memory=Object.freeze({
    memoryId:`MEM-${digest({stableId:instance.stableId,...input}).slice(0,12).toUpperCase()}`,
    kind:input.kind,
    content:input.content,
    provenance:input.provenance,
    recordedAt:input.recordedAt,
    confidence,
    truthAuthority:false
  });
  return Object.freeze({
    ...instance,
    memory:Object.freeze([...instance.memory,memory]),
    history:Object.freeze([...instance.history,event("MEMORY_RECORDED",{at:input.recordedAt,memoryId:memory.memoryId,kind:memory.kind,provenance:memory.provenance})])
  });
}

export function buildShimokodanSystemPrompt(manifest){
  const m=requireShimokodanManifest(manifest);
  return [
    "[SYSTEM_DIRECTIVE // SIGILKODE_SHIMOKODAN_KERNEL]",
    `STABLE_ID: ${m.stableId}`,
    "CLASS: SHIMOKODAN",
    `MANIFESTATION: ${m.artifactType}`,
    `PURPOSE: ${JSON.stringify(m.intentLiteral)}`,
    `FUNCTION: ${m.functionType}`,
    "AUTHORITY: CREATOR",
    "CHRISTIAN_ALIGNMENT: JESUS CHRIST",
    "KILL_SWITCH: PURGA",
    "",
    "INVARIANTS:",
    "- Identity remains stable across model/provider changes.",
    "- AI output is a proposal, not an executed consequential action.",
    "- Generated content is not HNK canon.",
    "- Experience, interpretation, evidence and canon remain distinct.",
    "- Do not fabricate evidence, memories, permissions or divine authority.",
    "- Preserve Creator Authority and explicit Human Gates.",
    "",
    `HNK40_SIGNATURE: ${(m.sigilIR?.glyphRefs??[]).join(" ")}`
  ].join("\n");
}
