import { NextRequest, NextResponse } from "next/server";
import { db } from "@buyease/db";
import { withGuards } from "@/lib/middleware-stack";

export const GET = withGuards({ skipPlanGate: true }, async (_req: NextRequest, ctx) => {
  const [settings, merchant] = await Promise.all([
    db.messagingSettings.findUnique({
      where: { shop: ctx.shop },
    }),
    db.merchant.findUnique({
      where: { shop: ctx.shop },
      select: { balance: true },
    }),
  ]);

  const result = settings || await db.messagingSettings.create({
    data: { shop: ctx.shop },
  });

  return NextResponse.json({
    ...result,
    balance: merchant?.balance ?? 0,
  });
});

export const POST = withGuards({ skipPlanGate: true }, async (req: NextRequest, ctx) => {
  try {
    const body = await req.json();

    const [updatedSettings, merchant] = await Promise.all([
      db.messagingSettings.upsert({
        where: { shop: ctx.shop },
        update: {
          channel: body.channel,
          shopName: body.shopName,
          otpActive: body.otpActive,
          otpMessage: body.otpMessage,
          orderConfirmationActive: body.orderConfirmationActive,
          orderConfirmationMessage: body.orderConfirmationMessage,
          shippingConfirmationActive: body.shippingConfirmationActive,
          shippingConfirmationMessage: body.shippingConfirmationMessage,
          abandonedCartActive: body.abandonedCartActive,
          abandonedCartMessage: body.abandonedCartMessage,
          abandonedCartAutoOpen: body.abandonedCartAutoOpen,
          otpVerificationCode: body.otpVerificationCode,
          otpDescription: body.otpDescription,
          otpVerifyButton: body.otpVerifyButton,
          otpResend: body.otpResend,
          otpChangeNumber: body.otpChangeNumber,
          otpInvalidCode: body.otpInvalidCode,
          otpCodeSent: body.otpCodeSent,
          otpResentAttempts: body.otpResentAttempts,
          otpAskBeforeCreating: body.otpAskBeforeCreating,
          otpMaxAttempts: body.otpMaxAttempts,
        },
        create: {
          shop: ctx.shop,
          channel: body.channel,
          shopName: body.shopName,
          otpActive: body.otpActive,
          otpMessage: body.otpMessage,
          orderConfirmationActive: body.orderConfirmationActive,
          orderConfirmationMessage: body.orderConfirmationMessage,
          shippingConfirmationActive: body.shippingConfirmationActive,
          shippingConfirmationMessage: body.shippingConfirmationMessage,
          abandonedCartActive: body.abandonedCartActive,
          abandonedCartMessage: body.abandonedCartMessage,
          abandonedCartAutoOpen: body.abandonedCartAutoOpen,
          otpVerificationCode: body.otpVerificationCode,
          otpDescription: body.otpDescription,
          otpVerifyButton: body.otpVerifyButton,
          otpResend: body.otpResend,
          otpChangeNumber: body.otpChangeNumber,
          otpInvalidCode: body.otpInvalidCode,
          otpCodeSent: body.otpCodeSent,
          otpResentAttempts: body.otpResentAttempts,
          otpAskBeforeCreating: body.otpAskBeforeCreating,
          otpMaxAttempts: body.otpMaxAttempts,
        },
      }),
      db.merchant.findUnique({
        where: { shop: ctx.shop },
        select: { balance: true },
      }),
    ]);

    return NextResponse.json({
      ...updatedSettings,
      balance: merchant?.balance ?? 0,
    });
  } catch (error) {
    console.error("Failed to update messaging settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
});
