import crypto from "crypto"

export function hashPassword(password: string): string {
  // In production, use bcrypt: const bcrypt = require('bcrypt');
  // For now, using crypto as a placeholder
  return crypto
    .createHash("sha256")
    .update(password + process.env.PASSWORD_SALT)
    .digest("hex")
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(16).toString("hex")
}
