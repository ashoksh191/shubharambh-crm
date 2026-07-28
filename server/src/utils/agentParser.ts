import { Request } from 'express';
import useragent from 'useragent';

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
  const agent = useragent.parse(userAgentStr);

  const device = agent.device.toString() !== 'Other 0.0.0' ? agent.device.toString() : 'Desktop';
  const browser = `${agent.family} ${agent.major}.${agent.minor}`;
  const os = agent.os.toString();

  return {
    ipAddress,
    userAgent: userAgentStr,
    device,
    browser,
    os,
    country: 'India', // Local project scope fallback
  };
};
