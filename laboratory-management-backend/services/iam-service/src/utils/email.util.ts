import * as emailjs from "@emailjs/nodejs";

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const { to, subject, html } = options;

  if (!process.env.EMAILJS_SERVICE_ID ||
      !process.env.EMAILJS_TEMPLATE_ID_GENERIC ||
      !process.env.EMAILJS_PUBLIC_KEY) {
    throw new Error("EmailJS env vars not set");
  }

  const result = await emailjs.send(
    process.env.EMAILJS_SERVICE_ID,
    process.env.EMAILJS_TEMPLATE_ID_GENERIC,
    {
      to_email: to,
      subject,
      message_html: html,
    },
    { publicKey: process.env.EMAILJS_PUBLIC_KEY }
  );

  return result;
}

export async function sendResetPasswordEmail(to: string, token: string) {
  const frontendUrl = process.env.WEB_URL || process.env.FRONTEND_URL;
  if (!frontendUrl) throw new Error("WEB_URL or FRONTEND_URL is not set");

  const link = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

  return emailjs.send(
    "service_fcws2d3",
    "template_euzpdze",
    {
      to_email: to,
      reset_link: link,
    },
    { publicKey: "HJqJTqSwgXJViD-nw" }
  );
}