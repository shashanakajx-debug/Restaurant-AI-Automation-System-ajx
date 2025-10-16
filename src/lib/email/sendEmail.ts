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
      console.log('=================== EMAIL (DEV MODE - NO API KEY) ===================');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content:', html);
      console.log('=====================================================================');
      console.log('⚠️  Set RESEND_API_KEY in .env.local to send real emails');
      return true;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return false;
    }

    console.log('✅ Email sent successfully via Resend:', data?.id);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
}