const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Send OTP email for transaction verification
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {object} transaction - Transaction details
 */
exports.sendOTPEmail = async (email, otp, transaction) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'PayWatch <noreply@paywatch.com>',
    to: email,
    subject: '🔐 PayWatch - Transaction Verification Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .transaction-details { background: white; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px; }
          .warning { color: #dc2626; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Transaction Verification</h1>
            <p>Suspicious Activity Detected</p>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We detected a potentially fraudulent transaction on your account. For your security, please verify this transaction using the OTP below:</p>
            
            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 5 minutes</p>
            </div>

            <div class="transaction-details">
              <h3 style="margin-top: 0;">Transaction Details</h3>
              <p><strong>Amount:</strong> ₹${transaction.amount.toFixed(2)}</p>
              <p><strong>Transaction ID:</strong> ${transaction.transactionId}</p>
              <p><strong>Time:</strong> ${new Date(transaction.timestamp).toLocaleString()}</p>
              ${transaction.merchantName ? `<p><strong>Merchant:</strong> ${transaction.merchantName}</p>` : ''}
            </div>

            <p class="warning">⚠️ If you did not initiate this transaction, please contact us immediately.</p>
            
            <p><strong>Security Tips:</strong></p>
            <ul>
              <li>Never share your OTP with anyone</li>
              <li>PayWatch will never ask for your OTP via phone or email</li>
              <li>This OTP expires in 5 minutes</li>
            </ul>

            <div class="footer">
              <p>This is an automated email from PayWatch Fraud Detection System</p>
              <p>© 2025 PayWatch - BMSIT Project</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
};

/**
 * Send fraud alert email
 * @param {string} email - Recipient email
 * @param {object} transaction - Transaction details
 */
exports.sendFraudAlertEmail = async (email, transaction) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'PayWatch <noreply@paywatch.com>',
    to: email,
    subject: '🚨 PayWatch - Fraud Alert: Suspicious Transaction Detected',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .transaction-details { background: white; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Fraud Alert</h1>
            <p>Suspicious Transaction Blocked</p>
          </div>
          <div class="content">
            <div class="alert-box">
              <h3 style="margin-top: 0; color: #dc2626;">⚠️ Fraudulent Activity Detected</h3>
              <p>Our AI system has detected and blocked a suspicious transaction on your account.</p>
            </div>

            <div class="transaction-details">
              <h3>Transaction Details</h3>
              <p><strong>Amount:</strong> ₹${transaction.amount.toFixed(2)}</p>
              <p><strong>Transaction ID:</strong> ${transaction.transactionId}</p>
              <p><strong>Time:</strong> ${new Date(transaction.timestamp).toLocaleString()}</p>
              <p><strong>Fraud Score:</strong> ${(transaction.fraudScore * 100).toFixed(2)}%</p>
            </div>

            <p><strong>What should you do?</strong></p>
            <ul>
              <li>If this was you, please verify the transaction in your dashboard</li>
              <li>If this wasn't you, your account is safe - we've blocked the transaction</li>
              <li>Consider changing your password immediately</li>
              <li>Review your recent account activity</li>
            </ul>

            <p>Stay safe!</p>
            <p>- PayWatch Security Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Fraud alert email sent to ${email}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
};

/**
 * Send transaction confirmation email
 * @param {string} email - Recipient email
 * @param {object} transaction - Transaction details
 */
exports.sendTransactionConfirmation = async (email, transaction) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'PayWatch <noreply@paywatch.com>',
    to: email,
    subject: '✅ PayWatch - Transaction Approved',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Transaction Approved</h1>
          </div>
          <div class="content">
            <div class="success-box">
              <p><strong>Your transaction has been successfully processed!</strong></p>
            </div>
            <p><strong>Amount:</strong> ₹${transaction.amount.toFixed(2)}</p>
            <p><strong>Transaction ID:</strong> ${transaction.transactionId}</p>
            <p><strong>Time:</strong> ${new Date(transaction.timestamp).toLocaleString()}</p>
            <p>Thank you for using PayWatch!</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${email}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
  }
};
