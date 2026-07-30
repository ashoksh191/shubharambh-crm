import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Isolated Upload Storage Path (Outside Web Root)
export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads_isolated');

// Ensure isolated storage directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export interface UploadedFileValidationResult {
  valid: boolean;
  error?: string;
  detectedType?: string;
}

/**
 * Validates magic bytes of initial buffer to verify real file content type
 */
export const validateMagicBytes = (buffer: Buffer): UploadedFileValidationResult => {
  if (!buffer || buffer.length < 4) {
    return { valid: false, error: 'File buffer is empty or corrupted.' };
  }

  // 1. JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedType: 'image/jpeg' };
  }

  // 2. PNG: 89 50 4E 47 (89 'P' 'N' 'G')
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { valid: true, detectedType: 'image/png' };
  }

  // 3. WEBP: RIFF...WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return { valid: true, detectedType: 'image/webp' };
  }

  // 4. PDF: %PDF- (25 50 44 46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { valid: true, detectedType: 'application/pdf' };
  }

  return {
    valid: false,
    error: 'File content does not match allowed types (JPEG, PNG, WEBP, PDF). File content may be spoofed or malicious.',
  };
};

/**
 * Sanitizes filename to prevent directory traversal and execution
 */
export const sanitizeFilename = (originalName: string): string => {
  // Strip path traversal characters, null bytes, and non-alphanumeric chars
  const cleanName = path.basename(originalName).replace(/[\x00\r\n\t]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_');
  const ext = path.extname(cleanName).toLowerCase();
  const safeBase = path.basename(cleanName, ext).substring(0, 30);
  const randomHash = crypto.randomBytes(8).toString('hex');
  return `${safeBase}_${randomHash}${ext}`;
};

/**
 * Upload Guard Middleware to validate raw file buffer from request body/stream
 */
export const uploadGuard = (maxSizeBytes = 5 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // If request contains raw file buffer in req.body or custom upload property
    const fileBuffer = (req as any).file?.buffer || (Buffer.isBuffer(req.body) ? req.body : null);

    if (!fileBuffer) {
      next();
      return;
    }

    if (fileBuffer.length > maxSizeBytes) {
      res.status(400).json({
        success: false,
        error: 'FILE_TOO_LARGE',
        message: `File size exceeds the allowed limit of ${maxSizeBytes / (1024 * 1024)}MB.`,
      });
      return;
    }

    const validation = validateMagicBytes(fileBuffer);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: 'INVALID_FILE_CONTENT',
        message: validation.error,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to safely serve uploaded files without script execution vulnerability
 */
export const serveSecureUploadedFile = (req: Request, res: Response, _next: NextFunction): void => {
  const rawParam = req.params.filename;
  const requestedFile = path.basename(Array.isArray(rawParam) ? rawParam[0] || '' : rawParam || '');
  const filePath = path.resolve(UPLOAD_DIR, requestedFile);

  // Directory traversal check
  if (!filePath.startsWith(UPLOAD_DIR)) {
    res.status(403).json({ success: false, error: 'ACCESS_DENIED', message: 'Invalid file path.' });
    return;
  }

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Requested file not found.' });
    return;
  }

  // Set Security Headers to PREVENT execution
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'none';");
  res.setHeader('Content-Disposition', 'inline');

  res.sendFile(filePath);
};
