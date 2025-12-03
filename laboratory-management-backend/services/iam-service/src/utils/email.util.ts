import * as emailjs from "@emailjs/nodejs";

export async function sendResetPasswordEmail(to: string, token: string) {
  const frontendUrl = process.env.FRONTEND_URL || "https://ojt-project-ya2d.vercel.app";

  const link = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
  console.log("[send reset]", to);

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