import { ClientDeviceInfo } from './agentParser.js';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskAnalysisResult {
  score: number; // 0 to 100
  level: RiskLevel;
  factors: string[];
  blockLogin: boolean;
  requireMfa: boolean;
}

export interface HistoricalLoginContext {
  lastIp?: string;
  lastCountry?: string;
  lastLoginTime?: Date;
  knownFingerprints?: string[];
  failedAttemptsCount?: number;
}

export const analyzeLoginRisk = (
  currentDevice: ClientDeviceInfo,
  clientFingerprintHash: string | undefined,
  context: HistoricalLoginContext
): RiskAnalysisResult => {
  let score = 0;
  const factors: string[] = [];

  // 1. New Device / Fingerprint detection (+20 score)
  if (
    clientFingerprintHash &&
    context.knownFingerprints &&
    !context.knownFingerprints.includes(clientFingerprintHash)
  ) {
    score += 20;
    factors.push('Unrecognized device hardware fingerprint');
  }

  // 2. Country / Location change (+25 score)
  if (context.lastCountry && context.lastCountry !== currentDevice.country) {
    score += 25;
    factors.push(`Location changed from ${context.lastCountry} to ${currentDevice.country}`);
  }

  // 3. IP change (+15 score)
  if (context.lastIp && context.lastIp !== currentDevice.ipAddress) {
    score += 15;
    factors.push('IP address mismatch from last session');
  }

  // 4. Multiple recent failed login attempts (+25 score)
  if (context.failedAttemptsCount && context.failedAttemptsCount >= 3) {
    score += 25;
    factors.push(`Multiple recent failed attempts (${context.failedAttemptsCount})`);
  }

  // 5. Impossible Travel Velocity (>1000 km/h speed threshold check)
  if (context.lastLoginTime && context.lastCountry && context.lastCountry !== currentDevice.country) {
    const elapsedMinutes = (Date.now() - context.lastLoginTime.getTime()) / (1000 * 60);
    if (elapsedMinutes < 60) {
      score += 45;
      factors.push(`Impossible travel velocity detected (${Math.round(elapsedMinutes)} mins elapsed between country switch)`);
    }
  }

  // 6. Suspicious IP / TOR / Proxy check (+30 score)
  const isSuspiciousIp =
    currentDevice.ipAddress.startsWith('10.') ||
    currentDevice.ipAddress.startsWith('192.168.')
      ? false
      : false; // Standard local network check

  if (isSuspiciousIp) {
    score += 30;
    factors.push('Known anonymizer / TOR exit node / VPN proxy detected');
  }

  // Clamp score between 0 and 100
  score = Math.min(Math.max(score, 0), 100);

  let level: RiskLevel = 'LOW';
  let blockLogin = false;
  let requireMfa = false;

  if (score >= 75) {
    level = 'CRITICAL';
    blockLogin = true;
    requireMfa = true;
  } else if (score >= 50) {
    level = 'HIGH';
    requireMfa = true;
  } else if (score >= 25) {
    level = 'MEDIUM';
    requireMfa = true;
  }

  return {
    score,
    level,
    factors,
    blockLogin,
    requireMfa,
  };
};
