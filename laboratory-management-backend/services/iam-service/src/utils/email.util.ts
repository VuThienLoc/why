import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = process.env.EMAIL_FROM;

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }

  if (!from) {
    throw new Error("EMAIL_FROM is not set");
  }

  const { to, subject, html } = options;

  const result = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  return result;
}

export async function sendResetPasswordEmail(to: string, token: string) {
  const frontendUrl = process.env.WEB_URL || process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error("WEB_URL or FRONTEND_URL is not set");
  }

  const link = `${frontendUrl}/reset-password?token=${encodeURIComponent(
    token
  )}`;

  const text = `Reset your password using this link: ${link}`;

  const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
            <h2 style="margin: 0 0 12px; color: #111;">Password reset requested</h2>
            <p style="margin: 0 0 16px;">We received a request to reset your password. Click the button below to set a new password.</p>
            <p style="margin: 0 0 16px;">If you did not request this, you can safely ignore this email.</p>
            <div style="margin: 24px 0;">
              <a href="${link}" style="background:#2563eb;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:600">Reset Password</a>
            </div>
            <p style="margin: 0 0 8px; color:#555;">Or copy and paste this link into your browser:</p>
            <p style="margin: 0; word-break: break-all; color:#2563eb;">
              <a href="${link}" style="color:#2563eb;">${link}</a>
            </p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="font-size:12px; color:#666; margin:0;">This link may expire based on your security settings.</p>
          </div>
        `;

  return sendEmail({
    to,
    subject: "Reset your password",
    html,
  });
}