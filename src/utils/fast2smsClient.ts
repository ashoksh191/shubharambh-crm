/**
 * Direct Client-Side Fast2SMS Real SMS Dispatcher
 */
export const dispatchRealSmsOtp = async (phone: string, otpCode: string, apiKey: string): Promise<boolean> => {
  try {
    const cleanPhone = phone.replace(/^\+91/, '').replace(/\s+/g, '').trim();

    if (!cleanPhone || cleanPhone.length < 10) {
      console.warn('⚠️ Invalid phone number format for SMS dispatch.');
      return false;
    }

    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}&route=otp&variables_values=${encodeURIComponent(otpCode)}&flash=0&numbers=${encodeURIComponent(cleanPhone)}`;

    console.log(`📱 Sending Real SMS OTP to +91 ${cleanPhone} via Fast2SMS API...`);

    const response = await fetch(url, {
      method: 'GET',
    });

    const data = await response.json();
    if (data && data.return) {
      console.log(`✅ Real SMS OTP sent successfully to +91 ${cleanPhone}`);
      return true;
    } else {
      console.warn('⚠️ Fast2SMS Response:', data);
    }
  } catch (err) {
    console.error('❌ Fast2SMS API Error:', err);
  }
  return false;
};
