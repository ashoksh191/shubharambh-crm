export interface Fast2SmsResult {
  success: boolean;
  message: string;
  statusCode?: number;
}

/**
 * Direct Client-Side Fast2SMS Real SMS Dispatcher
 */
export const dispatchRealSmsOtp = async (phone: string, otpCode: string, apiKey: string): Promise<Fast2SmsResult> => {
  try {
    const cleanPhone = phone.replace(/^\+91/, '').replace(/\s+/g, '').trim();

    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, message: 'Invalid 10-digit mobile number format.' };
    }

    // Attempt Fast2SMS Quick SMS Route first
    const msg = `Shubharambh CRM: Your 2FA Login OTP verification code is ${otpCode}. Valid for 10 mins.`;
    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}&route=q&message=${encodeURIComponent(msg)}&language=english&flash=0&numbers=${encodeURIComponent(cleanPhone)}`;

    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();

    if (data && data.return) {
      return { success: true, message: `✅ Real SMS sent to +91 ${cleanPhone}!` };
    }

    // Handle Fast2SMS specific error codes
    if (data && data.status_code === 999) {
      return {
        success: false,
        statusCode: 999,
        message: 'Fast2SMS API Note: Fast2SMS requires a 1-time ₹100 recharge on fast2sms.com before API route activates.',
      };
    }

    if (data && data.status_code === 996) {
      return {
        success: false,
        statusCode: 996,
        message: 'Fast2SMS API Note: Website domain verification needed in Fast2SMS dashboard.',
      };
    }

    return {
      success: false,
      message: data.message || 'Fast2SMS API dispatch failed.',
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error connecting to Fast2SMS.' };
  }
};
