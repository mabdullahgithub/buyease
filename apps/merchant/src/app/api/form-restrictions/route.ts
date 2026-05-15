import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { withGuards } from "@/lib/middleware-stack";
import { parseBody } from "@/lib/validation";

const SELECT = {
  productRestrictionMode: true,
  restrictedProducts: true,
  restrictedCollections: true,
} as const;

const restrictedProductSchema = z.object({
  id: z.string().min(1).max(50),
  title: z.string().max(200),
  imageUrl: z.string().max(500).default(""),
  isSoldOut: z.boolean().default(false),
});

const restrictedCollectionSchema = z.object({
  id: z.string().min(1).max(50),
  title: z.string().max(200),
  imageUrl: z.string().max(500).default(""),
});

const formRestrictionsSchema = z.object({
  productRestrictionMode: z.enum(["none", "enable-only", "disable-for"]).default("none"),
  restrictedProducts: z.array(restrictedProductSchema).max(200).default([]),
  restrictedCollections: z.array(restrictedCollectionSchema).max(200).default([]),
});

const EMPTY_RESPONSE = {
  productRestrictionMode: "none",
  restrictedProducts: [],
  restrictedCollections: [],
};

export const GET = withGuards({ skipPlanGate: true }, async (_req, ctx) => {
  const config = await prisma.formDesignConfig.findUnique({
    where: { shop: ctx.shop },
    select: SELECT,
  });

  if (!config) {
    return NextResponse.json(EMPTY_RESPONSE);
  }

  return NextResponse.json(config);
});

export const PUT = withGuards({ skipPlanGate: true }, async (req: NextRequest, ctx) => {
  const rawBody = await req.json();
  const parsed = parseBody(formRestrictionsSchema, rawBody);
  if (!parsed.success) {
    return parsed.response;
  }

  const updated = await prisma.formDesignConfig.upsert({
    where: { shop: ctx.shop },
    create: { shop: ctx.shop, ...parsed.data },
    update: parsed.data,
    select: SELECT,
  });

  return NextResponse.json(updated);
});
