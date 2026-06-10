import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

export class CryptoUtil {
  private static getKey(secret: string): Buffer {
    return crypto.createHash('sha256').update(secret).digest();
  }

  /** AES-256-GCM encrypt sensitive PII (Aadhaar, passport, etc.) */
  static encrypt(plaintext: string, secret: string): string {
    const key = this.getKey(secret);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  }

  static decrypt(ciphertext: string, secret: string): string {
    const key = this.getKey(secret);
    const data = Buffer.from(ciphertext, 'base64');
    const iv = data.subarray(0, IV_LENGTH);
    const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }

  /** SHA-256 hash for blacklist matching without storing plaintext */
  static hash(value: string): string {
    return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
  }

  /** Tamper-proof audit log checksum chain */
  static auditChecksum(payload: string, previousChecksum?: string): string {
    const data = previousChecksum ? `${previousChecksum}:${payload}` : payload;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static maskAadhaar(aadhaar: string): string {
    if (aadhaar.length < 4) return '****';
    return `XXXX-XXXX-${aadhaar.slice(-4)}`;
  }
}
