import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<void> {

  const resetUrl =
    `http://localhost:5173/reset-password?token=${resetToken}`;

  const info = await transporter.sendMail({
    from: `"IAM System" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset your IAM System password',

    text: `
You requested a password reset.

Click the link below to reset your password:

${resetUrl}

This link will expire in 30 minutes.

If you did not request this password reset, you can safely ignore this email.
    `,

    html: `
      <h2>Password Reset</h2>

      <p>You requested a password reset for your IAM System account.</p>

      <p>
        <a href="${resetUrl}">
          Reset your password
        </a>
      </p>

      <p>This link will expire in 30 minutes.</p>

      <p>
        If you did not request this password reset,
        you can safely ignore this email.
      </p>
    `
  });

  console.log('Password reset email sent:', info.messageId);

  console.log(
    'Ethereal preview URL:',
    nodemailer.getTestMessageUrl(info)
  );
}