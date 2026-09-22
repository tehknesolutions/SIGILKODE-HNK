export interface RenderOptions {
  size?: number;
  includeMetadata?: boolean;
  title?: string;
}

export interface RenderedSvg {
  svg: string;
  sha256: string;
  rendererVersion: "SIGILKODE-SVG/V0.1";
}

export function renderSigilSvg(manifest: Record<string, any>, options?: RenderOptions): string;
export function renderSigilSvgWithDigest(manifest: Record<string, any>, options?: RenderOptions): RenderedSvg;
