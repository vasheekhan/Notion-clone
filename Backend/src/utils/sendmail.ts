import nodemailer from "nodemailer";

const MAIL_HOST = process.env.MAIL_HOST;
const MAIL_PORT = Number(process.env.MAIL_PORT || 587);
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;
const MAIL_FROM = process.env.MAIL_FROM;

if (!MAIL_HOST || !MAIL_USER || !MAIL_PASS || !MAIL_FROM) {
  throw new Error("Required mail environment variables are missing");
}

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: MAIL_PORT === 465,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
  },
});

// Common email styles (Yellow & Black theme)
const getEmailStyles = () => `
<style>
body {
    margin: 0;
    padding: 0;
    background: #0f0f0f;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
}

.email-container {
    max-width: 600px;
    margin: 40px auto;
    background: #1a1a1a;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0,0,0,.3);
    border: 1px solid #333;
}

.header {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #000;
    text-align: center;
    padding: 40px 20px;
    position: relative;
}

.header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23000" fill-opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
}

.header h1 {
    margin: 0;
    font-size: 42px;
    font-weight: 800;
    position: relative;
    z-index: 1;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header p {
    margin: 10px 0 0 0;
    font-size: 16px;
    font-weight: 600;
    opacity: 0.8;
    position: relative;
    z-index: 1;
}

.content {
    padding: 40px;
    color: #e5e5e5;
    background: #1a1a1a;
}

.greeting {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #fbbf24;
}

.message {
    font-size: 16px;
    margin-bottom: 30px;
    color: #d1d5db;
}

.otp-container {
    text-align: center;
    margin: 40px 0;
}

.otp-code {
    display: inline-block;
    padding: 20px 40px;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #000;
    font-size: 36px;
    font-weight: 800;
    letter-spacing: 12px;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(251, 191, 36, 0.3);
    border: 2px solid #fbbf24;
    font-family: 'Courier New', monospace;
}

.warning-box {
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid #fbbf24;
    border-radius: 8px;
    padding: 20px;
    margin: 30px 0;
}

.warning-title {
    color: #fbbf24;
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 16px;
}

.warning-text {
    color: #d1d5db;
    font-size: 14px;
}

.footer {
    background: #0f0f0f;
    text-align: center;
    padding: 30px;
    border-top: 1px solid #333;
}

.footer-text {
    color: #6b7280;
    font-size: 14px;
    margin: 0;
}

.footer-link {
    color: #fbbf24;
    text-decoration: none;
}

.brand-tagline {
    color: #fbbf24;
    font-weight: 600;
    margin-top: 10px;
}

.timer {
    display: inline-flex;
    align-items: center;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid #ef4444;
    border-radius: 6px;
    padding: 8px 12px;
    margin-top: 15px;
    color: #fca5a5;
    font-size: 14px;
    font-weight: 600;
}
</style>
`;


export const sendOtpVerificationMail = async (
  email: string,
  name: string,
  otp: string
) => {
  const isDev = process.env.NODE_ENV !== "production";
  
  if (isDev) {
    console.log("\n" + "=".repeat(50));
    console.log(" OTP VERIFICATION EMAIL (DEV MODE)");
    console.log("=".repeat(50));
    console.log(` To: ${email}`);
    console.log(` Name: ${name}`);
    console.log(` OTP: ${otp}`);
    console.log(` Type: Account Verification`);
    console.log("=".repeat(50) + "\n");
  }

  try {
    const info = await transporter.sendMail({
      from: `Synapse <${MAIL_FROM}>`,
      to: email,
      subject: "🔐 Verify Your Synapse Account",
      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${getEmailStyles()}
</head>
<body>

<div class="email-container">

<div class="header">
<h1>🧠 Synapse</h1>
<p>Your Second Brain</p>
</div>

<div class="content">

<div class="greeting">Welcome, ${name}!</div>

<div class="message">
Thank you for joining <strong>Synapse</strong>. To complete your account setup and start building your second brain, please verify your email address with the code below:
</div>

<div class="otp-container">
<div class="otp-code">${otp}</div>
</div>

<div class="warning-box">
<div class="warning-title">⏰ Important:</div>
<div class="warning-text">
This verification code will expire in <strong>5 minutes</strong>. If you didn't create this account, you can safely ignore this email.
</div>
</div>

<div class="message">
Once verified, you'll be able to:
<br>• Create unlimited workspaces and pages
<br>• Organize your thoughts with our powerful editor  
<br>• Access your notes from anywhere
<br>• Use AI assistance for enhanced productivity
</div>

<div style="text-align: center; margin-top: 30px;">
<div style="color: #6b7280; font-size: 14px;">
Having trouble? Contact us at <a href="mailto:support@synapse.app" class="footer-link">support@synapse.app</a>
</div>
</div>

</div>

<div class="footer">
<p class="footer-text">
© ${new Date().getFullYear()} Synapse - Second Brain Platform
</p>
<p class="brand-tagline">
Think. Organize. Remember.
</p>
</div>

</div>

</body>
</html>
      `,
    });

    console.log(" OTP verification email sent successfully. ID:", info.messageId);
    return info;
  } catch (error) {
    console.error(" Failed to send OTP verification email:", error);
    
    if (isDev) {
      console.log("  Email failed in development. Use OTP from console above.");
      return { messageId: "console-dev-mode" };
    } else {
      throw new Error("Failed to send verification email. Please try again.");
    }
  }
};


export const sendPasswordResetMail = async (
  email: string,
  name: string,
  otp: string
) => {
  const isDev = process.env.NODE_ENV !== "production";
  
  if (isDev) {
    console.log("\n" + "=".repeat(50));
    console.log(" PASSWORD RESET EMAIL (DEV MODE)");
    console.log("=".repeat(50));
    console.log(` To: ${email}`);
    console.log(` Name: ${name}`);
    console.log(` Reset Code: ${otp}`);
    console.log(` Type: Password Reset`);
    console.log("=".repeat(50) + "\n");
  }

  try {
    const info = await transporter.sendMail({
      from: `Synapse Security <${MAIL_FROM}>`,
      to: email,
      subject: "🔒 Reset Your Synapse Password",
      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${getEmailStyles()}
</head>
<body>

<div class="email-container">

<div class="header">
<h1>🔐 Synapse</h1>
<p>Password Reset Request</p>
</div>

<div class="content">

<div class="greeting">Hello, ${name}</div>

<div class="message">
We received a request to reset the password for your <strong>Synapse</strong> account. Use the verification code below to proceed with resetting your password:
</div>

<div class="otp-container">
<div class="otp-code">${otp}</div>
</div>

<div class="warning-box">
<div class="warning-title">🔒 Security Notice:</div>
<div class="warning-text">
This reset code will expire in <strong>10 minutes</strong>. If you didn't request this password reset, please ignore this email or contact our support team immediately.
</div>
</div>

<div class="message">
After entering this code, you'll be able to:
<br>• Set a new secure password
<br>• Regain access to all your workspaces
<br>• Continue using Synapse securely
</div>

<div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0;">
<div style="color: #fca5a5; font-weight: 600; margin-bottom: 8px;">⚠️ Didn't request this?</div>
<div style="color: #d1d5db; font-size: 14px;">
Your account is still secure. This code cannot be used without access to this email. For extra security, consider updating your password anyway.
</div>
</div>

<div style="text-align: center; margin-top: 30px;">
<div style="color: #6b7280; font-size: 14px;">
Need help? Contact us at <a href="mailto:security@synapse.app" class="footer-link">security@synapse.app</a>
</div>
</div>

</div>

<div class="footer">
<p class="footer-text">
© ${new Date().getFullYear()} Synapse - Secure Knowledge Management
</p>
<p class="brand-tagline">
Your thoughts, protected.
</p>
</div>

</div>

</body>
</html>
      `,
    });

    console.log(" Password reset email sent successfully. ID:", info.messageId);
    return info;
  } catch (error) {
    console.error(" Failed to send password reset email:", error);
    
    if (isDev) {
      console.log("  Email failed in development. Use reset code from console above.");
      return { messageId: "console-dev-mode" };
    } else {
      throw new Error("Failed to send password reset email. Please try again.");
    }
  }
};


export const sendOtpMail = sendOtpVerificationMail;