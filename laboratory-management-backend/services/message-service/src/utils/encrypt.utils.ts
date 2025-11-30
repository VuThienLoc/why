import crypto from "crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;

export function encryptText(plain: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGO,
    Buffer.from(process.env.MESSAGE_ENCRYPTION_KEY!, "hex"),
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptText(payload: string): string {
  if (!payload) return payload;

  const buffer = Buffer.from(payload, "base64");

  if (buffer.length < IV_LENGTH + 16) return payload;

  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encryptedText = buffer.subarray(IV_LENGTH + 16);

  const decipher = crypto.createDecipheriv(
    ALGO,
    Buffer.from(process.env.MESSAGE_ENCRYPTION_KEY!, "hex"),
    iv
  );
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
