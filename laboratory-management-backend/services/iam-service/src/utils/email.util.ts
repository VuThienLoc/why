import * as emailjs from "@emailjs/nodejs";

export async function sendResetPasswordEmail(to: string, token: string) {
  const frontendUrl = process.env.WEB_URL || process.env.FRONTEND_URL;
  if (!frontendUrl) throw new Error("WEB_URL or FRONTEND_URL is not set");

  const link = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

  return emailjs.send(
    "service_fcws2d3",
    "template_euzpdze",
    {
      email: to,
      link: link,
    },
    { publicKey: "HJqJTqSwgXJViD-nw", privateKey: `${process.env.EMAILJS_PRIVATE_KEY}` },
  );
}