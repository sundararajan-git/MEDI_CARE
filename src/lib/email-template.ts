export const getEmailTemplate = ({
  patientName,
  medicationName,
  dosage,
  time,
  type = "missed",
  caretakerName = "Caretaker",
}: {
  patientName: string;
  medicationName?: string;
  dosage?: string;
  time?: string;
  type?: "missed" | "test";
  caretakerName?: string;
}) => {
  const isMissed = type === "missed";

  const headerColor = isMissed ? "#dc2626" : "#2563eb";
  const headerBg = isMissed ? "#fef2f2" : "#eff6ff";
  const borderColor = isMissed ? "#fee2e2" : "#dbeafe";

  const darkHeaderBg = isMissed ? "#450a0a" : "#172554";
  const darkBorderColor = isMissed ? "#7f1d1d" : "#1e3a8a";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse !important; }
    * { box-sizing: border-box; }

    /* Dark Mode Styles */
    @media (prefers-color-scheme: dark) {
      .body-bg { background-color: #020617 !important; }
      .card-bg { background-color: #0f172a !important; border-color: #1e293b !important; }
      .text-main { color: #f1f5f9 !important; }
      .text-muted { color: #94a3b8 !important; }
      .text-heading { color: #ffffff !important; }
      .border-light { border-color: #1e293b !important; }
      .inner-card { background-color: #1e293b !important; border-color: ${darkBorderColor} !important; }
      .inner-header { background-color: ${darkHeaderBg} !important; border-color: ${darkBorderColor} !important; }
      .text-inner-heading { color: ${isMissed ? "#fecaca" : "#bfdbfe"} !important; }
      .text-inner-muted { color: ${isMissed ? "#ef4444" : "#60a5fa"} !important; }
    }
  </style>
</head>
<body class="body-bg" style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #334155; line-height: 1.5; margin: 0; padding: 0;">
  <div class="card-bg" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 0px; overflow: hidden;">
    
    <!-- Header -->
    <div class="border-light" style="padding: 24px; border-bottom: 1px dashed #e2e8f0; background-color: transparent;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align: middle;">
            <table cellpadding="0" cellspacing="0" border="0" style="display: inline-table;">
              <tr>
                <td style="width: 32px; height: 32px; background-color: #2563eb; border-radius: 8px; text-align: center; vertical-align: middle; color: #ffffff; font-size: 20px; font-weight: bold;">
                  ✚
                </td>
                <td style="padding-left: 8px; font-weight: 700; font-size: 18px; color: #0f172a; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;" class="text-heading">
                  Medi Care
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <p class="text-main" style="margin-top: 0; font-size: 16px; color: #334155; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Hello ${caretakerName},</p>
      
      ${
        isMissed
          ? `<p class="text-main" style="font-size: 16px; color: #334155; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">We detected that <strong class="text-heading" style="color: #0f172a; font-weight: 700;">${patientName}</strong> has missed a scheduled dose.</p>`
          : `<p class="text-main" style="font-size: 16px; color: #334155; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">This is a <strong>verification email</strong> to confirm that your MediCare notification settings for <strong class="text-heading" style="color: #0f172a; font-weight: 700;">${patientName}</strong> are correctly configured.</p>`
      }

      <div class="inner-card" style="margin-top: 24px; margin-bottom: 24px; border-radius: 16px; overflow: hidden; border: 1px solid ${borderColor}; background-color: #ffffff;">
        <div class="inner-header" style="background-color: ${headerBg}; padding: 16px; border-bottom: 1px solid ${borderColor};">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align: middle;">
                <h4 class="text-inner-heading" style="margin: 0; font-weight: 700; color: ${
                  isMissed ? "#7f1d1d" : "#1e3a8a"
                }; font-size: 14px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  ${isMissed ? "Missed Dose Details" : "System Status"}
                </h4>
                <p class="text-inner-muted" style="margin: 0; font-size: 12px; color: ${
                  isMissed ? "#b91c1c" : "#1d4ed8"
                }; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  ${
                    isMissed
                      ? `Recorded at ${time || "unknown time"} today`
                      : "All systems operational"
                  }
                </p>
              </td>
            </tr>
          </table>
        </div>

        <div style="padding: 16px;">
          ${
            isMissed
              ? `
              <table width="100%" style="font-size: 14px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="text-muted" style="padding-bottom: 8px; color: #64748b;">Medication:</td>
                  <td class="text-heading" style="padding-bottom: 8px; text-align: right; font-weight: 700; color: #0f172a;">${medicationName}</td>
                </tr>
                <tr>
                  <td class="text-muted" style="padding-bottom: 8px; color: #64748b;">Dosage:</td>
                  <td class="text-heading" style="padding-bottom: 8px; text-align: right; font-weight: 700; color: #0f172a;">${dosage}</td>
                </tr>
                <tr>
                  <td class="text-muted" style="color: #64748b;">Scheduled Time:</td>
                  <td class="text-heading" style="text-align: right; font-weight: 700; color: #0f172a;">${time}</td>
                </tr>
              </table>
            `
              : `
              <table width="100%" style="font-size: 14px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="text-muted" style="padding-bottom: 8px; color: #64748b;">Alerts:</td>
                  <td class="text-heading" style="padding-bottom: 8px; text-align: right; font-weight: 700; color: #0f172a;">Active</td>
                </tr>
                <tr>
                  <td class="text-muted" style="color: #64748b;">Role:</td>
                  <td class="text-heading" style="text-align: right; font-weight: 700; color: #0f172a;">Caretaker</td>
                </tr>
              </table>
            `
          }
        </div>
      </div>

      <p class="text-main" style="margin-bottom: 24px; color: #334155; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        ${
          isMissed
            ? "Please verify with the patient. You can log this dose manually via the dashboard if it was taken properly."
            : "You can now receive alerts for missed medications."
        }
      </p>

      <div class="border-light" style="padding-top: 32px; border-top: 1px solid #f1f5f9; text-align: center;">
        <a href="https://medi-care-app.vercel.app" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          Open Dashboard
        </a>
        <p class="text-muted" style="margin-top: 24px; font-size: 12px; color: #94a3b8; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          &copy; 2024 MediCare Inc. &bull; Automated Alert System
        </p>
      </div>

    </div>
  </div>
</body>
</html>
  `;
};
