// src/lib/email/sendEmail.ts
import { Resend } from 'resend';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    // In development without API key, log to console
    if (!process.env.RESEND_API_KEY) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const logger = require('../logger').default;
      logger.info('EMAIL (DEV MODE - NO API KEY)');
      logger.debug('To:', to);
      logger.debug('Subject:', subject);
      logger.debug('Content:', html);
      logger.warn('Set RESEND_API_KEY in .env.local to send real emails');
      return true;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });

    if (error) {
      const logger = require('../logger').default;
      logger.error('Resend error:', error);
      return false;
    }

    const logger = require('../logger').default;
    logger.info('Email sent successfully via Resend:', data?.id);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
}