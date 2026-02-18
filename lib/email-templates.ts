

export function getOtpEmailHtml(code: string, magicLink?: string): string {
  const brandColor = "#ea580c"; // Orange-600 (Tangerine)
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Login Code</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Inter', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <!-- Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #e4e4e7;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 30px; background-color: #ffffff; border-bottom: 1px solid #f4f4f5;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">Scan<span style="color: ${brandColor};">X</span></h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td align="center" style="padding: 40px 30px;">
              <p style="margin: 0 0 24px; font-size: 16px; color: #52525b; line-height: 1.5;">
                Hello,
              </p>
              <p style="margin: 0 0 32px; font-size: 16px; color: #52525b; line-height: 1.5;">
                Use the verification code below to securely sign in. Valid for <strong>5 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fff7ed; border-radius: 8px; border: 1px solid #fdba74; margin-bottom: 32px;">
                <tr>
                  <td align="center" style="padding: 24px;">
                    <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; color: ${brandColor}; letter-spacing: 8px; display: block; -webkit-user-select: all; user-select: all; cursor: pointer;">${code}</span>
                  </td>
                </tr>
              </table>

              <!-- Magic Link Button -->
              ${magicLink ? `
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${magicLink}" style="display: inline-block; padding: 14px 32px; background-color: ${brandColor}; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; box-shadow: 0 2px 4px rgba(234, 88, 12, 0.2);">
                      Sign In Instantly
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- Copy Hint (Only if no magic link used, or as secondary) -->
              <p style="margin: 0; font-size: 13px; color: #a1a1aa;">
                Or copy the code above and paste it in the login page.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px; background-color: #fafafa; border-top: 1px solid #f4f4f5;">
               <p style="margin: 0 0 8px; font-size: 12px; color: #71717a;">
                If you didn't request this email, you can safely ignore it.
              </p>
              <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                &copy; ${currentYear} ScanX Security. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

