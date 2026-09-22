function clone(value){return structuredClone(value);}
export function createEphemeralArtifactStore(){
  const rows=new Map();
  return Object.freeze({
    async saveNew(input){
      const now=new Date().toISOString();
      const id=`SKA-${crypto.randomUUID()}`;
      const row=Object.freeze({...clone(input),id,revision:1,createdAt:now,updatedAt:now});
      rows.set(id,row); return clone(row);
    },
    async update(input,expectedRevision){
      const current=rows.get(input.id);
      if(!current) throw new Error("ARTIFACT_NOT_FOUND");
      if(current.ownerId!==input.ownerId) throw new Error("ARTIFACT_OWNER_MISMATCH");
      if(current.revision!==expectedRevision) throw new Error("ARTIFACT_REVISION_CONFLICT");
      const row=Object.freeze({...clone(input),revision:current.revision+1,createdAt:current.createdAt,updatedAt:new Date().toISOString()});
      rows.set(input.id,row); return clone(row);
    },
    async get(id){const row=rows.get(id);return row?clone(row):null;},
    async list(ownerId){return [...rows.values()].filter(x=>x.ownerId===ownerId).map(clone);}
  });
}
