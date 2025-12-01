import pyotp
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config
from database import create_otp, verify_otp as db_verify_otp

def generate_otp():
    """Generate a 6-digit OTP"""
    totp = pyotp.TOTP(pyotp.random_base32(), digits=6, interval=300)  # 5 minutes
    return totp.now()

def send_otp_email(email, otp_code, transaction_amount=None):
    """Send OTP via email"""
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'PayWatch - Transaction Verification OTP'
        msg['From'] = Config.SMTP_USER
        msg['To'] = email
        
        # Email body
        if transaction_amount:
            text = f"""
            PayWatch Security Alert
            
            A potentially fraudulent transaction has been detected on your account.
            
            Transaction Amount: ${transaction_amount}
            
            Your verification code is: {otp_code}
            
            This code will expire in 5 minutes.
            
            If you did not initiate this transaction, please contact support immediately.
            
            - PayWatch Security Team
            """
            
            html = f"""
            <html>
              <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <h2 style="color: #667eea; margin-bottom: 20px;">🔒 PayWatch Security Alert</h2>
                  <p style="color: #333; font-size: 16px; line-height: 1.6;">
                    A potentially fraudulent transaction has been detected on your account.
                  </p>
                  <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #856404;"><strong>Transaction Amount:</strong> ${transaction_amount}</p>
                  </div>
                  <div style="background-color: #667eea; color: white; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px;">Your verification code is:</p>
                    <h1 style="margin: 10px 0; font-size: 36px; letter-spacing: 5px;">{otp_code}</h1>
                  </div>
                  <p style="color: #666; font-size: 14px;">
                    This code will expire in <strong>5 minutes</strong>.
                  </p>
                  <p style="color: #666; font-size: 14px; margin-top: 20px;">
                    If you did not initiate this transaction, please contact support immediately.
                  </p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                  <p style="color: #999; font-size: 12px; text-align: center;">
                    PayWatch Security Team<br>
                    This is an automated message, please do not reply.
                  </p>
                </div>
              </body>
            </html>
            """
        else:
            text = f"""
            PayWatch Verification Code
            
            Your verification code is: {otp_code}
            
            This code will expire in 5 minutes.
            
            - PayWatch Team
            """
            
            html = f"""
            <html>
              <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <h2 style="color: #667eea; margin-bottom: 20px;">PayWatch Verification</h2>
                  <div style="background-color: #667eea; color: white; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px;">Your verification code is:</p>
                    <h1 style="margin: 10px 0; font-size: 36px; letter-spacing: 5px;">{otp_code}</h1>
                  </div>
                  <p style="color: #666; font-size: 14px;">
                    This code will expire in <strong>5 minutes</strong>.
                  </p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                  <p style="color: #999; font-size: 12px; text-align: center;">
                    PayWatch Team
                  </p>
                </div>
              </body>
            </html>
            """
        
        # Attach both plain text and HTML versions
        part1 = MIMEText(text, 'plain')
        part2 = MIMEText(html, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        if Config.SMTP_USER and Config.SMTP_PASSWORD:
            with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT) as server:
                server.starttls()
                server.login(Config.SMTP_USER, Config.SMTP_PASSWORD)
                server.send_message(msg)
            
            print(f"✅ OTP sent to {email}")
            return True
        else:
            # For development without SMTP configured
            print(f"⚠️ SMTP not configured. OTP for {email}: {otp_code}")
            return True
            
    except Exception as e:
        print(f"❌ Error sending OTP email: {str(e)}")
        return False

def send_otp(email, transaction_amount=None):
    """Generate and send OTP"""
    otp_code = generate_otp()
    
    # Store OTP in database
    create_otp(email, otp_code)
    
    # Send email
    success = send_otp_email(email, otp_code, transaction_amount)
    
    return success

def verify_otp(email, otp_code):
    """Verify OTP code"""
    return db_verify_otp(email, otp_code)
