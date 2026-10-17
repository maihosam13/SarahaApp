export const emailTemplate = ({ otp, subject }) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f5f7; padding:40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">

                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color:#4f46e5; padding:28px 24px;">
                            <h1 style="margin:0; color:#ffffff; font-size:24px; letter-spacing:1px;">Saraha App</h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:36px 32px 12px; color:#1f2937;">
                            <h2 style="margin:0 0 16px; font-size:20px; font-weight:bold;">${subject}</h2>
                            <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#4b5563;">
                                Use the verification code below to complete your request.
                            </p>
                        </td>
                    </tr>

                    <!-- OTP -->
                    <tr>
                        <td align="center" style="padding:0 32px 28px;">
                            <div style="display:inline-block; background-color:#eef2ff; border:2px dashed #4f46e5; border-radius:10px; padding:16px 32px; font-size:32px; font-weight:bold; letter-spacing:10px; color:#4f46e5;">
                                ${otp}
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:0 32px 36px; color:#6b7280; font-size:13px; line-height:1.6;">
                            <p style="margin:0 0 8px;">This code will expire shortly. Do not share it with anyone.</p>
                            <p style="margin:0;">If you didn't request this, you can safely ignore this email.</p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color:#f9fafb; padding:20px 24px; border-top:1px solid #e5e7eb; color:#9ca3af; font-size:12px;">
                            &copy; ${new Date().getFullYear()} Saraha App. All rights reserved.
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
}