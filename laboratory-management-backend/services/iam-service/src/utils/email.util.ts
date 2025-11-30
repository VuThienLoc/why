import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';

// const oauthCredentials = new OAuth2Client({
//   client_id: process.env.GOOGLE_CLIENT_ID as any,
//   clientSecret: process.env.GOOGLE_SECRET as any,
// })

// oauthCredentials.setCredentials({
//   refresh_token: process.env.GOOGLE_REFRESH_TOKEN as any,
// });

// const accessToken = await oauthCredentials.getAccessToken();

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    type: "OAuth2",
    user: "vuthienloct@gmail.com",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});