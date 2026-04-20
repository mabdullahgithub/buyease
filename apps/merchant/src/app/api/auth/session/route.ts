import { NextResponse } from "next/server";
import { authenticateEmbeddedRequest } from "@/lib/embedded-auth";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const authenticated = await authenticateEmbeddedRequest(request);
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        ok: true,
        shop: authenticated.shop,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
