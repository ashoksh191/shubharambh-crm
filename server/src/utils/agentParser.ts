import { Request } from 'express';
import { UAParser } from 'ua-parser-js';

export interface ClientDeviceInfo {
  ipAddress: string;
  userAgent: string;
  device: string;
  browser: string;
  os: string;
  country: string;
}

export const parseClientDeviceInfo = (req: Request): ClientDeviceInfo => {
  const ipAddress =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  const userAgentStr = req.headers['user-agent'] || 'Unknown User-Agent';
  const parser = new UAParser(userAgentStr);
  const result = parser.getResult();

  const device = result.device.model
    ? `${result.device.vendor || ''} ${result.device.model}`.trim()
    : result.device.type
    ? result.device.type.toUpperCase()
    : 'Desktop';

  const browser = result.browser.name
    ? `${result.browser.name} ${result.browser.version || ''}`.trim()
    : 'Unknown Browser';

  const os = result.os.name
    ? `${result.os.name} ${result.os.version || ''}`.trim()
    : 'Unknown OS';

  return {
    ipAddress,
    userAgent: userAgentStr,
    device,
    browser,
    os,
    country: 'India', // Local project scope fallback
  };
};
