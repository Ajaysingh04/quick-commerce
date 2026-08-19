import nodemailer from 'nodemailer';

const sendEmail = async ({ email, subject, html }) => {
  try {
    // If details are mock, print to console instead of throwing errors
    if (process.env.EMAIL_USER.includes('mock') || !process.env.EMAIL_USER) {
      console.log('---------------- MOCK EMAIL SENT ----------------');
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${html.replace(/<[^>]*>/g, '')}`);
      console.log('--------------------------------------------------');
      return { success: true, mock: true };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"RoseDash Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html
    });

    console.log(`Email dispatched: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Email dispatch error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export default sendEmail;
