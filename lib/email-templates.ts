

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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

export function getRegistrationSuccessHtml(eventName: string, username: string, status: string, eventDate?: Date, venue?: string): string {
  const brandColor = "#ea580c";
  const currentYear = new Date().getFullYear();
  const dateStr = eventDate ? new Date(eventDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : "TBD";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 40px 0; margin: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { padding: 32px 30px; text-align: center; border-bottom: 1px solid #f4f4f5; background: #ffffff; }
    .content { padding: 40px 32px; color: #3f3f46; line-height: 1.6; }
    .welcome-badge { display: inline-block; padding: 4px 12px; background: #eff6ff; color: #2563eb; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
    .details-box { background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .detail-item { display: flex; align-items: start; gap: 12px; margin-bottom: 12px; font-size: 14px; }
    .detail-item:last-child { margin-bottom: 0; }
    .cred-box { background-color: #fafafa; border: 1px dashed #d4d4d8; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .username-label { font-size: 12px; color: #71717a; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
    .username-value { font-size: 28px; font-weight: 800; font-family: 'Courier New', monospace; color: ${brandColor}; margin: 0; }
    .instruction { font-size: 13px; color: #71717a; margin-top: 24px; padding-top: 24px; border-top: 1px solid #f4f4f5; }
    .btn { display: inline-block; width: 100%; padding: 14px 24px; background-color: ${brandColor}; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 12px; text-align: center; margin-top: 8px; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.2); }
    .footer { padding: 32px; text-align: center; background: #fafafa; border-top: 1px solid #f4f4f5; font-size: 11px; color: #a1a1aa; line-height: 1.8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size: 26px; font-weight: 800; color: #18181b; letter-spacing: -0.02em;">Scan<span style="color: ${brandColor};">X</span></h1>
    </div>
    <div class="content">
      <div class="welcome-badge">Welcome to the Community</div>
      <h2 style="color: #18181b; margin: 0 0 12px 0; font-size: 22px; font-weight: 800; tracking: tight;">Registration Received!</h2>
      <p style="margin: 0; font-size: 15px;">Hi there! We're excited to have you at <strong>${eventName}</strong>. Your registration is currently <strong>${status}</strong>.</p>
      
      <div class="cred-box">
        <div class="username-label">Your Guest Username</div>
        <p class="username-value">${username}</p>
        <p style="margin: 12px 0 0 0; font-size: 12px; color: #71717a;">Use this username on the ScanX Login (Guest Tab) to access your dashboard.</p>
      </div>

      <div class="details-box">
        <div class="detail-item">
          <span style="font-size: 18px;">📅</span>
          <div>
            <div style="font-weight: 700; color: #18181b;">Date & Time</div>
            <div style="color: #52525b; font-size: 13px;">${dateStr}</div>
          </div>
        </div>
        <div class="detail-item" style="margin-top: 16px;">
          <span style="font-size: 18px;">📍</span>
          <div>
            <div style="font-weight: 700; color: #18181b;">Venue</div>
            <div style="color: #52525b; font-size: 13px;">${venue || "To be announced"}</div>
          </div>
        </div>
      </div>

      <a href="${baseUrl}/auth/login" class="btn">Access Guest Dashboard</a>

      <div class="instruction">
        <strong>Instructions:</strong> On the event day, log in as a Guest using your username above to view your pass and mark attendance.
      </div>
    </div>
    <div class="footer">
      ScanX | Secure Campus Event Management<br/>
      If you didn't register for this event, please disregard this email.<br/>
      &copy; ${currentYear} ScanX Security Team.
    </div>
  </div>
</body>
</html>
  `;
}

export function getStudentRegistrationHtml(eventName: string, enrollmentNo: string, studentName: string, status: string, eventDate?: Date, venue?: string): string {
  const brandColor = "#ea580c";
  const currentYear = new Date().getFullYear();
  const dateStr = eventDate ? new Date(eventDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : "TBD";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 40px 0; margin: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { padding: 32px 30px; text-align: center; border-bottom: 1px solid #f4f4f5; background: #ffffff; }
    .content { padding: 40px 32px; color: #3f3f46; line-height: 1.6; }
    .student-badge { display: inline-block; padding: 4px 12px; background: #fef2f2; color: ${brandColor}; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
    .details-box { background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .detail-item { display: flex; align-items: start; gap: 12px; margin-bottom: 12px; font-size: 14px; }
    .detail-item:last-child { margin-bottom: 0; }
    .instruction-box { background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 16px; margin: 24px 0; font-size: 13px; color: #475569; }
    .btn { display: inline-block; width: 100%; padding: 14px 24px; background-color: ${brandColor}; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 12px; text-align: center; margin-top: 8px; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.2); }
    .footer { padding: 32px; text-align: center; background: #fafafa; border-top: 1px solid #f4f4f5; font-size: 11px; color: #a1a1aa; line-height: 1.8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size: 26px; font-weight: 800; color: #18181b; letter-spacing: -0.02em;">Scan<span style="color: ${brandColor};">X</span></h1>
    </div>
    <div class="content">
      <div class="student-badge">Student Portal</div>
      <h2 style="color: #18181b; margin: 0 0 12px 0; font-size: 22px; font-weight: 800; tracking: tight;">You're Registered!</h2>
      <p style="margin: 0; font-size: 15px;">Hi <strong>${studentName}</strong>, your registration for <strong>${eventName}</strong> is confirmed. This event is now linked to your enrollment number: <strong>${enrollmentNo}</strong>.</p>
      
      <div class="details-box">
        <div class="detail-item">
          <span style="font-size: 18px;">📅</span>
          <div>
            <div style="font-weight: 700; color: #18181b;">Date & Time</div>
            <div style="color: #52525b; font-size: 13px;">${dateStr}</div>
          </div>
        </div>
        <div class="detail-item" style="margin-top: 16px;">
          <span style="font-size: 18px;">📍</span>
          <div>
            <div style="font-weight: 700; color: #18181b;">Venue</div>
            <div style="color: #52525b; font-size: 13px;">${venue || "To be announced"}</div>
          </div>
        </div>
      </div>

      <div class="instruction-box">
        <strong>Quick Guide:</strong> On the day of the event, open your <strong>ScanX Dashboard</strong> on your phone and scan the organizer's QR code to mark attendance.
      </div>

      <a href="${baseUrl}/student/events" class="btn">View My Events Hub</a>
    </div>
    <div class="footer">
      ScanX | Secure Campus Event Management<br/>
      Sent to ${studentName} (${enrollmentNo})<br/>
      &copy; ${currentYear} ScanX Team.
    </div>
  </div>
</body>
</html>
  `;
}

export function getRegistrationStatusUpdateHtml(eventName: string, status: string, username: string): string {
  const brandColor = status === 'APPROVED' ? "#16a34a" : "#dc2626"; // Green for approve, Red for reject
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 40px 0; margin: 0; }
    .container { max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7; }
    .header { padding: 30px; text-align: center; border-bottom: 1px solid #f4f4f5; }
    .content { padding: 40px 30px; color: #52525b; line-height: 1.5; }
    .footer { padding: 24px; text-align: center; background: #fafafa; border-top: 1px solid #f4f4f5; font-size: 12px; color: #a1a1aa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size: 24px; font-weight: 700; color: #18181b;">Scan<span style="color: #ea580c;">X</span></h1>
    </div>
    <div class="content">
      <h2 style="color: #18181b; margin-top: 0;">Registration Update</h2>
      <p>Your registration for <strong>${eventName}</strong> has been updated.</p>
      
      <p>New Status: <strong style="color: ${brandColor};">${status}</strong></p>
      
      ${status === 'APPROVED' ? `
        <p>You can now use your username (<strong>${username}</strong>) to log in and participate in the event.</p>
      ` : `
        <p>Unfortunately, your registration could not be accommodated at this time.</p>
      `}
    </div>
    <div class="footer">
      &copy; ${currentYear} ScanX Security Team.
    </div>
  </div>
</body>
</html>
  `;
}
