import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { withGuards } from "@/lib/middleware-stack";
import { otpSendLimiter } from "@/lib/rate-limit";
import { parseBody, phoneE164 } from "@/lib/validation";

const sendOtpSchema = z.object({
  phone: phoneE164,
  shop: z.string().trim().min(1).max(255),
  orderId: z.string().max(255).optional(),
});

export const POST = withGuards(
  { requiredFeature: "whatsappOtp", checkOrderLimit: false, rateLimiter: otpSendLimiter },
  async (req: NextRequest) => {
    const body = await req.json();
    const parsed = parseBody(sendOtpSchema, body);
    if (!parsed.success) return parsed.response;

    const { phone, shop, orderId } = parsed.data;

    // TODO: Implement OTP sending logic (WhatsApp/SMS provider integration)
    return NextResponse.json(
      {
        message: "OTP sending not yet implemented",
        phone,
        shop,
        orderId,
      },
      { status: 501 },
    );
  },
);
