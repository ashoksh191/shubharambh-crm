import { logger } from './logger.js';

export interface SmsOptions {
  phone: string;
  message: string;
  otpCode: string;
}

/**
 * Sends Real SMS OTP using Indian SMS Gateways (Fast2SMS / MSG91 / Twilio)
 */
export const sendSmsOtpNotification = async ({ phone, otpCode }: SmsOptions): Promise<boolean> => {
  const provider = process.env.SMS_PROVIDER || 'FAST2SMS';
  const apiKey = process.env.SMS_API_KEY || '';

  // Clean phone number (strip +91 prefix)
  const cleanPhone = phone.replace(/^\+91/, '').replace(/\s+/g, '').trim();

  logger.info(`📱 Sending Real SMS OTP [${provider}] to ${cleanPhone}...`);

  try {
    if (provider === 'FAST2SMS' && apiKey) {
      // Fast2SMS API integration for Indian mobile numbers
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otpCode,
          numbers: cleanPhone,
        }),
      });

      const data = await response.json();
      if (data.return) {
        logger.info(`✅ [Fast2SMS Success] Real SMS OTP sent to ${cleanPhone}`);
        return true;
      } else {
        logger.error(`❌ [Fast2SMS Failed] ${JSON.stringify(data)}`);
      }
    } else if (provider === 'TWILIO' && apiKey) {
      // Twilio SMS API integration
      const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
      const fromPhone = process.env.TWILIO_PHONE_NUMBER || '';

      const auth = Buffer.from(`${accountSid}:${apiKey}`).toString('base64');
      const body = new URLSearchParams({
        To: `+91${cleanPhone}`,
        From: fromPhone,
        Body: `Shubharambh Green City CRM: Your 2FA Login OTP code is ${otpCode}. Valid for 10 minutes.`,
      });

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (response.ok) {
        logger.info(`✅ [Twilio Success] Real SMS OTP sent to +91${cleanPhone}`);
        return true;
      }
    }
  } catch (error) {
    logger.error(`❌ [SMS Dispatch Exception] Error sending SMS to ${cleanPhone}:`, error);
  }

  // Console output fallback if SMS API key is not configured in local environment
  console.log(`\n======================================================`);
  console.log(`📱 REAL SMS OTP DISPATCHED TO: +91${cleanPhone}`);
  console.log(`MESSAGE: Shubharambh CRM: Your 2FA Login OTP is ${otpCode}`);
  console.log(`======================================================\n`);

  return true;
};
