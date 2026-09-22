import { NextRequest, NextResponse } from "next/server";
import {
  applyHumanReview,
  createArtifactReview,
  materializeHumanApprovedManifest
} from "@sigilkode/governance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const manifest = body.manifest;
    if (!manifest) throw new TypeError("manifest is required");

    const openedAt = new Date().toISOString();
    const review = createArtifactReview(manifest,{openedAt});
    const decided = applyHumanReview(review,manifest,{
      decision:"APPROVE",
      reviewer:String(body.reviewer || "CREATOR"),
      reviewedAt:new Date().toISOString(),
      explicitHumanSignal:String(body.explicitHumanSignal || "UI_APPROVE_CLICK"),
      rationale:String(body.rationale || "Explicit Creator approval from SIGILKODE web review control.")
    });
    const approvedManifest = materializeHumanApprovedManifest(manifest,decided);

    return NextResponse.json(
      {review:decided,manifest:approvedManifest},
      {headers:{"Cache-Control":"no-store"}}
    );
  } catch (error) {
    return NextResponse.json(
      {error:error instanceof Error ? error.message : "SIGILKODE_REVIEW_FAILED"},
      {status:400,headers:{"Cache-Control":"no-store"}}
    );
  }
}
