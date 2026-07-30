export interface ClientFingerprintData {
  canvasHash: string;
  webglHash: string;
  screenResolution: string;
  timezone: string;
  language: string;
  fontsHash: string;
  fingerprintHash: string;
}

/**
 * Generates canvas 2D render hash
 */
const getCanvasHash = (): string => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Shubharambh Security CRM 2026', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Shubharambh Security CRM 2026', 4, 17);

    return simpleStringHash(canvas.toDataURL());
  } catch (_e) {
    return 'canvas-blocked';
  }
};

/**
 * Generates WebGL hardware renderer signature hash
 */
const getWebGLHash = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'no-webgl';

    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return simpleStringHash(`${vendor}~${renderer}`);
    }
    return 'webgl-basic';
  } catch (_e) {
    return 'webgl-blocked';
  }
};

const simpleStringHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
};

export const generateDeviceFingerprint = async (): Promise<ClientFingerprintData> => {
  const canvasHash = getCanvasHash();
  const webglHash = getWebGLHash();
  const screenResolution = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const language = navigator.language || 'en-US';
  const fontsHash = simpleStringHash(navigator.userAgent);

  const rawString = `${canvasHash}:${webglHash}:${screenResolution}:${timezone}:${language}:${fontsHash}`;
  const fingerprintHash = simpleStringHash(rawString);

  return {
    canvasHash,
    webglHash,
    screenResolution,
    timezone,
    language,
    fontsHash,
    fingerprintHash,
  };
};
