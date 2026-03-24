export const generateOtpTemplate = (otp) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            h2 { color: #333333; }
            .content { font-size: 16px; color: #555555; line-height: 1.6; }
            .otp { font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 5px; margin: 20px 0; display: inline-block; padding: 10px 20px; border: 2px dashed #4CAF50; border-radius: 5px; background-color: #f9fff9; }
            .footer { font-size: 14px; color: #999999; margin-top: 30px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Verify Your Email Address</h2>
            <div class="content">
                <p>Hello,</p>
                <p>Thank you for registering. Please use the following One-Time Password (OTP) to complete your signup process. This code is valid for 10 minutes.</p>
                <div style="text-align: center;">
                    <div class="otp">${otp}</div>
                </div>
                <p>If you did not request this, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Ecommerce Store. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
