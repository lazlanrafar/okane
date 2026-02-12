import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const _SALT_LENGTH = 64;
const _TAG_LENGTH = 16;

export function encrypt(text: string, secret: string): string {
  if (!secret || secret.length !== 32) {
    throw new Error("Secret key must be 32 characters long");
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, Buffer.from(secret), iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  // Format: iv:encrypted:tag
  return `${iv.toString("hex")}:${encrypted}:${tag.toString("hex")}`;
}

export function decrypt(text: string, secret: string): string {
  if (!secret || secret.length !== 32) {
    throw new Error("Secret key must be 32 characters long");
  }

  const parts = text.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }

  const ivHex = parts[0];
  const encryptedHex = parts[1];
  const tagHex = parts[2];

  if (!ivHex || !encryptedHex || !tagHex) {
    throw new Error("Invalid encrypted text format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, Buffer.from(secret), iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
