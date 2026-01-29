import nodemailer from 'nodemailer';
import logger from '../utils/logger';

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'placeholder@gmail.com',
                pass: process.env.EMAIL_PASS || 'placeholder_app_password',
            },
        });
    }

    async sendOTP(email: string, otp: string) {
        try {
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                logger.warn(`[Mock Email] To: ${email}, OTP: ${otp}`);
                logger.warn('Email credentials missing. Please set EMAIL_USER and EMAIL_PASS in .env');
                return;
            }

            const mailOptions = {
                from: `"ShopEase" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Your Verification Code',
                html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Welcome to ShopEase!</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
            };

            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Email sent: ${info.messageId}`);
        } catch (error) {
            logger.error('Error sending email:', error);
            // Don't throw logic error effectively allowing "mock" success even if email fails in dev
            // But in production you might want to throw
        }
    }

    async sendPasswordReset(email: string, otp: string) {
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const resetLink = `${frontendUrl}/reset-password?email=${encodeURIComponent(email)}&code=${otp}`;

            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                logger.warn(`[Mock Email] To: ${email}, Reset Link: ${resetLink}`);
                return;
            }

            const mailOptions = {
                from: `"ShopEase" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Reset Your Password',
                html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #4F46E5;">Password Reset Request</h2>
                <p>We received a request to reset your password. Use the link below to set a new one:</p>
                <div style="margin: 20px 0;">
                    <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset My Password</a>
                </div>
                <p>Or use this code manually:</p>
                <h2 style="letter-spacing: 4px; background: #f3f4f6; padding: 10px; display: inline-block; border-radius: 4px;">${otp}</h2>
                <p style="color: #64748b; font-size: 0.9em;">This link and code will expire in 10 minutes.</p>
                <p style="color: #64748b; font-size: 0.9em;">If you didn't request this, please ignore this email.</p>
              </div>
            `,
            };

            await this.transporter.sendMail(mailOptions);
            logger.info(`Password reset email sent to ${email}`);
        } catch (error) {
            logger.error('Error sending password reset email:', error);
        }
    }
    async sendManagerCredentials(email: string, key_code: string, temp_pass: string) {
        try {
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                logger.warn(`[Mock Email] To: ${email}, Key: ${key_code}, Pass: ${temp_pass}`);
                return;
            }

            const mailOptions = {
                from: `"ShopEase" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Your Manager Login Credentials',
                html: `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Welcome to ShopEase Management!</h2>
                <p>You have been invited as a Manager.</p>
                
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Login Key:</strong> <span style="font-family: monospace; font-size: 1.2em;">${key_code}</span></p>
                    <p><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 1.2em;">${temp_pass}</span></p>
                </div>
                
                <p>Please use the Login Key as your identifier.</p>
              </div>
            `,
            };

            await this.transporter.sendMail(mailOptions);
            logger.info(`Manager credentials sent to ${email}`);
        } catch (error) {
            logger.error('Error sending manager email:', error);
        }
    }
}

export const emailService = new EmailService();
