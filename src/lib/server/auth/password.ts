import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string, salt?: Buffer): Promise<{ salt: string; hash: string }> {
  const secretSalt = salt ?? randomBytes(16);
  const derived = (await scryptAsync(password, secretSalt, 64)) as Buffer;

  return {
    salt: secretSalt.toString('hex'),
    hash: derived.toString('hex')
  };
}

export async function verifyPassword(password: string, saltHex: string, hashHex: string): Promise<boolean> {
  const salt = Buffer.from(saltHex, 'hex');
  const expectedHash = Buffer.from(hashHex, 'hex');
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;

  if (derived.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(derived, expectedHash);
}
