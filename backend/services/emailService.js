const nodemailer = require('nodemailer');

/**
 * Email Service for StudySpirit
 * Uses Gmail SMTP with App Password for sending verification emails.
 * 
 * Required .env variables:
 *   EMAIL_USER=your_gmail@gmail.com
 *   EMAIL_APP_PASSWORD=your_16_char_app_password
 */

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });
};

/**
 * Send verification OTP email
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6-digit verification code
 * @param {string} userName - User's name for personalization
 */
const sendVerificationEmail = async (toEmail, otp, userName = 'Student') => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"StudySpirit 🚀" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: '🔐 Your StudySpirit Verification Code',
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0d0d15 0%, #1a1a2e 100%); border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; padding: 40px 30px 20px;">
                <div style="font-size: 60px; margin-bottom: 10px;">⚡</div>
                <h1 style="color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 2px; margin: 0;">
                    STUDYSPIRIT
                </h1>
                <p style="color: #8b8ba7; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; margin-top: 5px;">
                    Verify Your Email
                </p>
            </div>

            <!-- Body -->
            <div style="padding: 20px 40px 40px;">
                <p style="color: #c4c4d4; font-size: 16px; line-height: 1.6;">
                    Hey <strong style="color: #ffffff;">${userName}</strong>,
                </p>
                <p style="color: #8b8ba7; font-size: 14px; line-height: 1.6;">
                    Welcome to StudySpirit! Please use the verification code below to complete your registration:
                </p>

                <!-- OTP Box -->
                <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; background: rgba(139, 92, 246, 0.15); border: 2px solid rgba(139, 92, 246, 0.4); border-radius: 16px; padding: 20px 50px;">
                        <span style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #a78bfa; font-family: monospace;">
                            ${otp}
                        </span>
                    </div>
                </div>

                <p style="color: #8b8ba7; font-size: 13px; text-align: center;">
                    ⏰ This code expires in <strong style="color: #f59e0b;">10 minutes</strong>.
                </p>

                <!-- Divider -->
                <div style="border-top: 1px solid rgba(255,255,255,0.08); margin: 30px 0;"></div>

                <p style="color: #6b6b80; font-size: 12px; text-align: center; line-height: 1.6;">
                    If you didn't create an account on StudySpirit, you can safely ignore this email.
                </p>
            </div>

            <!-- Footer -->
            <div style="background: rgba(0,0,0,0.3); padding: 20px; text-align: center;">
                <p style="color: #4a4a5e; font-size: 11px; margin: 0; letter-spacing: 1px;">
                    © ${new Date().getFullYear()} StudySpirit — Level Up Your Learning
                </p>
            </div>
        </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent to ${toEmail} (Message ID: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Failed to send email to ${toEmail}:`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendVerificationEmail };
