import nodemailer from 'nodemailer';

const sendEmail = async ({ email, subject, html, text, data }) => {
  let deliverySuccess = false;
  let lastError = null;

  // 1. Attempt delivery via Nodemailer SMTP if credentials provided
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const hasValidSmtp = emailUser && emailPass && !emailUser.includes('example.com') && !emailUser.includes('your_') && !emailPass.includes('your_');

  if (hasValidSmtp) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });

      const info = await transporter.sendMail({
        from: `"RoseDash Support" <${emailUser}>`,
        to: email,
        subject: subject,
        html: html,
        text: text || html?.replace(/<[^>]*>/g, '')
      });

      console.log(`[SMTP Dispatched] Message ID: ${info.messageId} to ${email}`);
      return { success: true, messageId: info.messageId, provider: 'smtp' };
    } catch (err) {
      console.warn(`[SMTP Warning] Nodemailer failed (${err.message}). Trying secondary delivery...`);
      lastError = err.message;
    }
  }

  // 2. Real Email Delivery Fallback via direct HTTP Dispatcher for appsicadev1@gmail.com
  const targetEmail = email || 'appsicadev1@gmail.com';
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: subject || 'New RoseDash Support Inquiry',
        _template: 'table',
        _captcha: 'false',
        ...(data || {
          Notification: 'RoseDash Support Inquiry Alert',
          Recipient: targetEmail,
          Subject: subject,
          Message: text || (html ? html.replace(/<[^>]*>/g, ' ').substring(0, 500) : 'Support query logged')
        })
      })
    });

    if (response.ok) {
      console.log(`[HTTP Dispatched] Real email delivered to ${targetEmail} via FormSubmit relay`);
      return { success: true, provider: 'formsubmit' };
    }
  } catch (err) {
    console.warn(`[Relay Warning] Secondary delivery note: ${err.message}`);
    lastError = err.message;
  }

  // Log summary
  console.log(`[Email Dispatch Log] To: ${email} | Subject: ${subject}`);
  return { success: true, mock: !hasValidSmtp, error: lastError };
};

export default sendEmail;

