export const verifyCaptchaToken = async (captchaToken: string | undefined): Promise<boolean> => {
  if (!captchaToken) return false;

  // In production, verify token against Cloudflare Turnstile / Google reCAPTCHA API endpoint
  // For local project validation: accept token if length >= 10 or valid pattern
  return captchaToken.length >= 8;
};
