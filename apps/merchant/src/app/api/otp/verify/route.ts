import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { withGuards } from "@/lib/middleware-stack";
import { otpVerifyLimiter } from "@/lib/rate-limit";
import { parseBody, phoneE164 } from "@/lib/validation";

const verifyOtpSchema = z.object({
  phone: phoneE164,
  code: z.string().trim().length(6, "OTP code must be 6 digits").regex(/^\d{6}$/, "OTP code must be numeric"),
  shop: z.string().trim().min(1).max(255),
  orderId: z.string().max(255).optional(),
});

export const POST = withGuards(
  { requiredFeature: "whatsappOtp", checkOrderLimit: false, rateLimiter: otpVerifyLimiter },
  async (req: NextRequest) => {
    const body = await req.json();
    const parsed = parseBody(verifyOtpSchema, body);
    if (!parsed.success) return parsed.response;

    const { phone, code, shop, orderId } = parsed.data;

    // TODO: Implement OTP verification logic
    return NextResponse.json(
      {
        message: "OTP verification not yet implemented",
        phone,
        code,
        shop,
        orderId,
      },
      { status: 501 },
    );
  },
);
