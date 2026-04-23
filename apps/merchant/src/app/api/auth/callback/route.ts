import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { merchantAppOrigin } from "@/lib/merchant-app-url";
import { saveSession } from "@/lib/session-cache";
import shopify from "@/lib/shopify";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { session } = await shopify.auth.callback({ rawRequest: req });

    await saveSession(session);

    await prisma.merchant.upsert({
      where: { shop: session.shop },
      create: {
        shop: session.shop,
        isActive: true,
        accessToken: session.accessToken ?? null,
        scopes: session.scope ?? null,
      },
      update: {
        isActive: true,
        uninstalledAt: null,
        accessToken: session.accessToken ?? null,
        scopes: session.scope ?? null,
      },
    });

    await shopify.webhooks.register({ session });

    const host = req.nextUrl.searchParams.get("host");
    return NextResponse.redirect(
      `${merchantAppOrigin()}/?shop=${session.shop}&host=${host ?? ""}`,
    );
  } catch (error) {
    console.error("Auth callback failed", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
