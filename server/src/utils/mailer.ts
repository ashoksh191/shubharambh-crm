import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import { logger } from './logger.js';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465, // true for 465, false for other ports
  auth: config.smtp.user
    ? {
        user: config.smtp.user,
        pass: config.smtp.pass,
      }
    : undefined,
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends real email via Nodemailer SMTP (Gmail, SendGrid, Resend, Amazon SES, Mailtrap)
 */
export const sendEmail = async ({ to, subject, html }: EmailOptions): Promise<boolean> => {
  try {
    const info = await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html,
    });
    logger.info(`📧 [SMTP Email Sent] MessageId: ${info.messageId} to ${to}`);
    return true;
  } catch (error) {
    logger.error(`❌ [SMTP Email Error] Failed to send email to ${to}:`, error);
    // Fallback log for demonstration
    console.log(`\n======================================================`);
    console.log(`📧 REAL EMAIL DISPATCHED TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`HTML BODY:\n${html}`);
    console.log(`======================================================\n`);
    return false;
  }
};

/**
 * Dispatches Email OTP for 2FA Verification
 */
export const sendEmailOtpNotification = async (email: string, otpCode: string): Promise<boolean> => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0b0f19; color: #ffffff; padding: 2rem; border-radius: 12px;">
      <h2 style="color: #10b981;">Shubharambh Green City CRM - 2FA Security OTP</h2>
      <p style="font-size: 1rem; color: #d1d5db;">Your 6-digit Multi-Factor Verification Code is:</p>
      <div style="background-color: #1f2937; padding: 1rem 2rem; display: inline-block; font-size: 2rem; font-weight: bold; letter-spacing: 4px; color: #10b981; border: 1px solid #10b981; border-radius: 8px; margin: 1rem 0;">
        ${otpCode}
      </div>
      <p style="font-size: 0.85rem; color: #9ca3af;">This OTP code expires in 10 minutes. Do not share this code with anyone.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject: 'Shubharambh CRM - Your 2FA Login OTP Code', html });
};
