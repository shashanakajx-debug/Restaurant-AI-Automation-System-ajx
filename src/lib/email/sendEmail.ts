// Simple email service for development
// In production, you would use a real email service like SendGrid, Mailgun, etc.

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  // In development, we'll just log the email
  if (process.env.NODE_ENV !== 'production') {
    console.log('=================== EMAIL SENT ===================');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('Content:');
    console.log(html);
    console.log('=================================================');
    return true;
  }

  // In production, you would integrate with a real email service
  try {
    // Example with a hypothetical email service:
    // const response = await emailServiceClient.send({
    //   to,
    //   subject,
    //   html,
    //   from: process.env.EMAIL_FROM
    // });
    
    // For now, we'll just simulate success
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}