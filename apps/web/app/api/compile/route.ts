import { NextRequest, NextResponse } from "next/server";
import { compileArtifact } from "@sigilkode/engine";
import { renderSigilSvgWithDigest } from "@sigilkode/renderer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const manifest = compileArtifact({
      artifactType: body.artifactType,
      intentLiteral: body.intentLiteral,
      functionType: body.functionType,
      matrices: Array.isArray(body.matrices) ? body.matrices : []
    });
    const render = renderSigilSvgWithDigest(manifest,{size:1000,includeMetadata:true});
    return NextResponse.json({
      manifest,
      render:{svg:render.svg,sha256:render.sha256,rendererVersion:render.rendererVersion}
    },{headers:{"Cache-Control":"no-store"}});
  } catch (error) {
    return NextResponse.json(
      {error:error instanceof Error ? error.message : "SIGILKODE_COMPILE_FAILED"},
      {status:400,headers:{"Cache-Control":"no-store"}}
    );
  }
}
