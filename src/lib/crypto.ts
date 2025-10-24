// src/lib/crypto.ts
import crypto from "crypto";

export function sha256(input: string) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export function generate6DigitCode() {
  // 6 chiffres, non “000000”
  const n = Math.floor(100000 + Math.random() * 900000);
  return String(n);
}
