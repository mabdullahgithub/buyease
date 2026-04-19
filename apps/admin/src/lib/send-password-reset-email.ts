import { Resend } from "resend";

type SendResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Sends the admin password reset email via Resend.
 * Requires RESEND_API_KEY and RESEND_FROM_EMAIL (verified sender in Resend).
 */
export async function sendAdminPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return {
      ok: false,
      error:
        "Email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL on the server.",
    };
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject: "Reset your BuyEase Admin password",
    html: `
      <p>You requested a password reset for the <strong>BuyEase Admin</strong> panel.</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#0d9488;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Reset password</a></p>
      <p style="color:#666;font-size:14px;">This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
      <p style="color:#666;font-size:12px;">If the button does not work, copy and paste this URL into your browser:<br/><span style="word-break:break-all;">${resetUrl}</span></p>
    `,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
