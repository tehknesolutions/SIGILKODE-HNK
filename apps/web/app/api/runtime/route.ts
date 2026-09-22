import { NextRequest, NextResponse } from "next/server";
import {
  activateShimokodan,
  buildShimokodanSystemPrompt,
  instantiateShimokodan,
  purgeShimokodan
} from "@sigilkode/shimokodan-runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = String(body.action || "").toUpperCase();

    if (action === "ACTIVATE") {
      const manifest = body.manifest;
      let instance = instantiateShimokodan(manifest);
      instance = activateShimokodan(instance,manifest,{
        operator:String(body.operator || "CREATOR"),
        explicitHumanSignal:String(body.explicitHumanSignal || "UI_ACTIVATE_CLICK"),
        activatedAt:new Date().toISOString()
      });
      return NextResponse.json(
        {instance,systemPrompt:buildShimokodanSystemPrompt(manifest)},
        {headers:{"Cache-Control":"no-store"}}
      );
    }

    if (action === "PURGE") {
      const instance = body.instance;
      if (!instance) throw new TypeError("instance is required");
      const purged = purgeShimokodan(instance,{
        operator:String(body.operator || "CREATOR"),
        explicitHumanSignal:String(body.explicitHumanSignal || "UI_PURGA_CLICK"),
        purgedAt:new Date().toISOString(),
        reason:String(body.reason || "Operator-requested Purga")
      });
      return NextResponse.json(
        {instance:purged},
        {headers:{"Cache-Control":"no-store"}}
      );
    }

    throw new RangeError("action must be ACTIVATE or PURGE");
  } catch (error) {
    return NextResponse.json(
      {error:error instanceof Error ? error.message : "SIGILKODE_RUNTIME_FAILED"},
      {status:400,headers:{"Cache-Control":"no-store"}}
    );
  }
}
