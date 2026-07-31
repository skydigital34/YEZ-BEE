import nodemailer from 'nodemailer';
import { logger } from '../utils/helpers';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
} as nodemailer.TransportOptions);

export const verifyTransporter = async (): Promise<void> => {
  try {
    await transporter.verify();
    logger.info('Email transporter is ready');
  } catch (error) {
    logger.warn('Email transporter verification failed:', error);
  }
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  attachments?: nodemailer.SendMailOptions['attachments'];
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  try {
    const mailOptions: nodemailer.SendMailOptions = {
      from: options.from || `"YEZ BEE Fashion" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

const getBaseStyles = (): string => `
  <style>
    body { font-family: 'Georgia', serif; margin: 0; padding: 0; background: #fafafa; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0; border-bottom: 2px solid #c9a96e; }
    .header h1 { color: #1a1a1a; font-size: 24px; letter-spacing: 3px; margin: 0; }
    .header p { color: #666; font-size: 12px; letter-spacing: 1px; }
    .content { padding: 30px 0; line-height: 1.8; }
    .button { display: inline-block; padding: 12px 30px; background: #1a1a1a; color: #fff; text-decoration: none; letter-spacing: 1px; }
    .footer { text-align: center; padding: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; }
  </style>
`;

export const getWelcomeEmailHtml = (name: string): string => `
  <html>${getBaseStyles()}
    <body>
      <div class="container">
        <div class="header"><h1>YEZ BEE</h1><p>FASHION</p></div>
        <div class="content">
          <h2>Welcome, ${name}!</h2>
          <p>Thank you for joining YEZ BEE Fashion. Explore our curated collection of luxury fashion.</p>
          <p>As a welcome gift, enjoy 10% off your first order.</p>
          <a href="${process.env.FRONTEND_URL}/shop" class="button">SHOP NOW</a>
        </div>
        <div class="footer"><p>&copy; 2024 YEZ BEE Fashion. All rights reserved.</p></div>
      </div>
    </body>
  </html>
`;

export const getOrderConfirmationEmailHtml = (
  name: string,
  orderNumber: string,
  items: { name: string; quantity: number; price: number }[],
  total: number
): string => {
  const itemsHtml = items
    .map(
      (item) =>
        `<tr><td>${item.name} x${item.quantity}</td><td style="text-align:right;">₹${(item.price * item.quantity).toFixed(2)}</td></tr>`
    )
    .join('');

  return `
    <html>${getBaseStyles()}
      <body>
        <div class="container">
          <div class="header"><h1>YEZ BEE</h1><p>FASHION</p></div>
          <div class="content">
            <h2>Order Confirmed</h2>
            <p>Dear ${name},</p>
            <p>Your order <strong>${orderNumber}</strong> has been placed successfully.</p>
            <table style="width:100%;border-collapse:collapse;">
              <thead><tr><th style="text-align:left;">Item</th><th style="text-align:right;">Total</th></tr></thead>
              <tbody>${itemsHtml}</tbody>
              <tfoot><tr><td><strong>Total</strong></td><td style="text-align:right;"><strong>₹${total.toFixed(2)}</strong></td></tr></tfoot>
            </table>
          </div>
          <div class="footer"><p>&copy; 2024 YEZ BEE Fashion. All rights reserved.</p></div>
        </div>
      </body>
    </html>
  `;
};

export const getPasswordResetEmailHtml = (resetUrl: string): string => `
  <html>${getBaseStyles()}
    <body>
      <div class="container">
        <div class="header"><h1>YEZ BEE</h1><p>FASHION</p></div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" class="button">RESET PASSWORD</a>
          <p style="margin-top:20px;">If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer"><p>&copy; 2024 YEZ BEE Fashion. All rights reserved.</p></div>
      </div>
    </body>
  </html>
`;

export const getAbandonedCartEmailHtml = (
  name: string,
  items: { name: string; image: string; price: number }[],
  cartUrl: string
): string => {
  const itemsHtml = items
    .map(
      (item) =>
        `<tr><td style="padding:10px 0;"><img src="${item.image}" width="60" style="vertical-align:middle;margin-right:10px;">${item.name}</td><td style="text-align:right;">₹${item.price.toFixed(2)}</td></tr>`
    )
    .join('');

  return `
    <html>${getBaseStyles()}
      <body>
        <div class="container">
          <div class="header"><h1>YEZ BEE</h1><p>FASHION</p></div>
          <div class="content">
            <h2>Your Cart is Waiting!</h2>
            <p>Hi ${name}, you left items in your cart. Complete your purchase now.</p>
            <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
            <a href="${cartUrl}" class="button">COMPLETE ORDER</a>
          </div>
          <div class="footer"><p>&copy; 2024 YEZ BEE Fashion. All rights reserved.</p></div>
        </div>
      </body>
    </html>
  `;
};

export default sendEmail;
