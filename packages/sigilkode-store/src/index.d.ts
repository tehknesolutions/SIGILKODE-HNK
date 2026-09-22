export type StoredAuthority = "CANDIDATE" | "HUMAN_APPROVED";
export interface StoredArtifact {
  id: string;
  ownerId: string;
  stableId: string;
  revision: number;
  authorityState: StoredAuthority;
  manifest: Record<string,unknown>;
  render?: Record<string,unknown> | null;
  createdAt: string;
  updatedAt: string;
}
export interface ArtifactStore {
  saveNew(input: Omit<StoredArtifact,"id"|"revision"|"createdAt"|"updatedAt">): Promise<StoredArtifact>;
  update(input: StoredArtifact, expectedRevision:number): Promise<StoredArtifact>;
  get(id:string): Promise<StoredArtifact | null>;
  list(ownerId:string): Promise<StoredArtifact[]>;
}
export function createEphemeralArtifactStore(): ArtifactStore;
