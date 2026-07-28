import crypto from 'crypto';
import { config } from '../config/index.js';

// Cache for spent nonces (5-minute TTL)
const nonceCache = new Map<string, number>();

// Clean up expired nonces every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [nonce, timestamp] of nonceCache.entries()) {
    if (now - timestamp > 5 * 60 * 1000) {
      nonceCache.delete(nonce);
    }
  }
}, 2 * 60 * 1000);

export const verifyRequestSignature = (
  signature: string | undefined,
  timestampStr: string | undefined,
  nonce: string | undefined,
  body: any
): { isValid: boolean; error?: string } => {
  if (!signature || !timestampStr || !nonce) {
    return { isValid: false, error: 'Missing required request signature headers (X-Signature, X-Timestamp, X-Nonce)' };
  }

  const timestamp = parseInt(timestampStr, 10);
  const now = Date.now();

  // 1. Enforce 5-minute freshness window (Requirement 16)
  if (isNaN(timestamp) || Math.abs(now - timestamp) > 5 * 60 * 1000) {
    return { isValid: false, error: 'Request timestamp expired or out of sync (> 5 minutes old)' };
  }

  // 2. Prevent Nonce Replay Attacks
  if (nonceCache.has(nonce)) {
    return { isValid: false, error: 'Replay attack detected! Nonce has already been consumed.' };
  }

  // 3. Compute expected HMAC-SHA256 signature
  const bodyString = typeof body === 'string' ? body : JSON.stringify(body || {});
  const payloadToSign = `${timestamp}.${nonce}.${bodyString}`;

  const expectedSignature = crypto
    .createHmac('sha256', config.jwt.accessSecret)
    .update(payloadToSign)
    .digest('hex');

  if (signature !== expectedSignature) {
    return { isValid: false, error: 'Invalid HMAC request signature. Payload tampering detected.' };
  }

  // Store nonce in cache
  nonceCache.set(nonce, now);
  return { isValid: true };
};
