export type VaultSession = {
  accessToken: string;
  refreshToken: string | null;
  userId: string;
  email: string | null;
};

export type VaultArtifact = {
  id: string;
  owner_id: string;
  stable_id: string;
  artifact_type: "SIGIL" | "SHIMOKODAN_AI" | "SHIMOKODAN_ASTRAL" | "SHIMOKODAN_HYBRID";
  authority_state: "CANDIDATE" | "HUMAN_APPROVED";
  lifecycle: "DRAFT" | "COMPILED" | "ACTIVE" | "RETIRED";
  revision: number;
  manifest: Record<string,unknown>;
  render: Record<string,unknown> | null;
  created_at: string;
  updated_at: string;
};

const SESSION_KEY="sigilkode.supabase.session.v0.1";

function cfg(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/,"") ?? "";
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
  return {url,key,configured:Boolean(url&&key)};
}

async function parse(response:Response){
  const payload=await response.json().catch(()=>({}));
  if(!response.ok){
    const message=(payload as any)?.msg || (payload as any)?.message || (payload as any)?.error_description || (payload as any)?.error || "SUPABASE_REQUEST_FAILED";
    throw new Error(String(message));
  }
  return payload;
}

function authHeaders(accessToken?:string){
  const {key}=cfg();
  return {
    "apikey":key,
    ...(accessToken?{"Authorization":`Bearer ${accessToken}`}:{}),
    "Content-Type":"application/json"
  };
}

function normalizeSession(payload:any):VaultSession|null{
  if(!payload?.access_token || !payload?.user?.id) return null;
  return {
    accessToken:String(payload.access_token),
    refreshToken:payload.refresh_token ? String(payload.refresh_token) : null,
    userId:String(payload.user.id),
    email:payload.user.email ? String(payload.user.email) : null
  };
}

export function isVaultConfigured(){return cfg().configured;}

export function readStoredSession():VaultSession|null{
  if(typeof window==="undefined") return null;
  try {
    const raw=window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as VaultSession : null;
  } catch { return null; }
}

export function storeSession(session:VaultSession|null){
  if(typeof window==="undefined") return;
  if(!session) window.localStorage.removeItem(SESSION_KEY);
  else window.localStorage.setItem(SESSION_KEY,JSON.stringify(session));
}

export async function signInPassword(email:string,password:string){
  const {url,configured}=cfg();
  if(!configured) throw new Error("SIGILKODE_VAULT_NOT_CONFIGURED");
  const response=await fetch(`${url}/auth/v1/token?grant_type=password`,{
    method:"POST",headers:authHeaders(),body:JSON.stringify({email,password})
  });
  const payload=await parse(response);
  const session=normalizeSession(payload);
  if(!session) throw new Error("SUPABASE_SESSION_NOT_RETURNED");
  storeSession(session);
  return session;
}

export async function signUpPassword(email:string,password:string){
  const {url,configured}=cfg();
  if(!configured) throw new Error("SIGILKODE_VAULT_NOT_CONFIGURED");
  const response=await fetch(`${url}/auth/v1/signup`,{
    method:"POST",headers:authHeaders(),body:JSON.stringify({email,password})
  });
  const payload=await parse(response);
  const session=normalizeSession(payload);
  if(session) storeSession(session);
  return {
    session,
    userId:payload?.user?.id ? String(payload.user.id) : null,
    emailConfirmationRequired:!session
  };
}

export async function listVaultArtifacts(session:VaultSession){
  const {url}=cfg();
  const response=await fetch(`${url}/rest/v1/sigilkode_artifacts?select=*&order=updated_at.desc`,{
    headers:authHeaders(session.accessToken),cache:"no-store"
  });
  return await parse(response) as VaultArtifact[];
}

export async function createVaultArtifact(session:VaultSession,input:{
  stableId:string;artifactType:VaultArtifact["artifact_type"];authorityState:VaultArtifact["authority_state"];
  lifecycle:VaultArtifact["lifecycle"];manifest:Record<string,unknown>;render:Record<string,unknown>|null;
}){
  const {url}=cfg();
  const response=await fetch(`${url}/rest/v1/sigilkode_artifacts`,{
    method:"POST",
    headers:{...authHeaders(session.accessToken),"Prefer":"return=representation"},
    body:JSON.stringify({
      owner_id:session.userId,
      stable_id:input.stableId,
      artifact_type:input.artifactType,
      authority_state:input.authorityState,
      lifecycle:input.lifecycle,
      manifest:input.manifest,
      render:input.render
    })
  });
  const rows=await parse(response) as VaultArtifact[];
  if(!rows[0]) throw new Error("SIGILKODE_VAULT_INSERT_EMPTY");
  return rows[0];
}

export async function updateVaultArtifact(session:VaultSession,current:VaultArtifact,input:{
  authorityState:VaultArtifact["authority_state"];lifecycle:VaultArtifact["lifecycle"];
  manifest:Record<string,unknown>;render:Record<string,unknown>|null;
}){
  const {url}=cfg();
  const response=await fetch(`${url}/rest/v1/rpc/sigilkode_update_artifact`,{
    method:"POST",
    headers:authHeaders(session.accessToken),
    body:JSON.stringify({
      p_id:current.id,
      p_expected_revision:current.revision,
      p_authority_state:input.authorityState,
      p_lifecycle:input.lifecycle,
      p_manifest:input.manifest,
      p_render:input.render
    })
  });
  return await parse(response) as VaultArtifact;
}
