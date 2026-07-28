import crypto from 'crypto';

export interface FingerprintSignals {
  canvasHash?: string;
  webglHash?: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
  fontsHash?: string;
  useragent?: string;
}

/**
 * Computes a deterministic SHA-256 device fingerprint hash from hardware signals
 */
export const computeDeviceFingerprintHash = (signals: FingerprintSignals): string => {
  const normalized = [
    signals.canvasHash || 'no-canvas',
    signals.webglHash || 'no-webgl',
    signals.screenResolution || '1920x1080',
    signals.timezone || 'UTC',
    signals.language || 'en-US',
    signals.fontsHash || 'default-fonts',
    signals.useragent || 'unknown',
  ].join('|');

  return crypto.createHash('sha256').update(normalized).digest('hex');
};

/**
 * Detects fingerprint anomaly or potential device cloning
 */
export const detectFingerprintAnomaly = (
  storedHash: string | null,
  currentHash: string
): { isCloned: boolean; isNewDevice: boolean } => {
  if (!storedHash) {
    return { isCloned: false, isNewDevice: true };
  }
  if (storedHash !== currentHash) {
    return { isCloned: true, isNewDevice: true };
  }
  return { isCloned: false, isNewDevice: false };
};
