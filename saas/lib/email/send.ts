interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email via Resend REST API.
 * Requires RESEND_API_KEY environment variable.
 * Fails silently (logs) if key is missing — never throws in non-critical paths.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send");
    return false;
  }

  const from = payload.from ?? process.env.EMAIL_FROM ?? "Sales System <noreply@salessystem.uz>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[email] Resend error:", res.status, body);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[email] Network error:", err);
    return false;
  }
}

// ─── Email Templates ────────────────────────────────────────────────────────

export function trialExpiryEmail(orgName: string, daysLeft: number, upgradeUrl: string): string {
  const urgency = daysLeft <= 1 ? "🚨 Последний день!" : `⏰ Осталось ${daysLeft} ${daysLeft === 1 ? "день" : "дня"}`;

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Пробный период заканчивается</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="background:#7c3aed;padding:32px;text-align:center;">
            <p style="color:#e9d5ff;font-size:13px;margin:0 0 8px;">Sales System</p>
            <h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:700;">${urgency}</h1>
            <p style="color:#c4b5fd;font-size:14px;margin:8px 0 0;">Пробный период истекает</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
              Здравствуйте! Пробный период для организации <strong>${orgName}</strong> заканчивается
              ${daysLeft <= 1 ? "сегодня" : `через ${daysLeft} дня`}.
            </p>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px;">
              После окончания пробного периода аккаунт перейдёт в режим чтения.
              Все ваши данные сохранятся — выберите тариф чтобы продолжить работу.
            </p>
            <!-- CTA -->
            <div style="text-align:center;margin:24px 0;">
              <a href="${upgradeUrl}"
                 style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;
                        padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">
                Выбрать тариф →
              </a>
            </div>
            <!-- Plans summary -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
              <tr>
                <td style="padding:12px;background:#f5f3ff;border-radius:8px;width:50%;">
                  <p style="margin:0;font-size:13px;font-weight:600;color:#7c3aed;">Бизнес</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">10 сотр · 2 филиала</p>
                </td>
                <td width="12"></td>
                <td style="padding:12px;background:#f5f3ff;border-radius:8px;width:50%;">
                  <p style="margin:0;font-size:13px;font-weight:600;color:#7c3aed;">Про</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">25 сотр · 5 филиалов · AI</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">
              Если у вас есть вопросы — напишите нам или свяжитесь с менеджером.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
