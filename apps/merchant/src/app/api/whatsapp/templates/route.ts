import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET(): Promise<NextResponse> {
  const templates = await prisma.whatsAppTemplate.findMany({
    where: { isActive: true },
    select: {
      messageType: true,
      metaTemplateName: true,
      body: true,
      variables: true,
      metaStatus: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(templates);
}
