/**
 * Ascendra — Email Notification Server
 * Powered by Resend (https://resend.com)
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  PASTE YOUR RESEND API KEY ON THE LINE BELOW (line 18)      │
 * │  OR set environment variable: RESEND_API_KEY=re_...         │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Run with:  node server/notify.js
 * Requires:  Node 18+  (uses native fetch)
 */

import express from 'express';
import cors    from 'cors';

// ─────────────────────────────────────────────────────────────────
// ▼▼▼  PASTE YOUR RESEND API KEY HERE  ▼▼▼
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_Uoj7NQZv_AAXKkQNW37tE4zHzsdEDHn98';
// ▲▲▲  THAT IS THE ONLY LINE YOU NEED TO CHANGE  ▲▲▲
// ─────────────────────────────────────────────────────────────────

// The "from" address.
// If you verified a custom domain in Resend, change this to:
//   'Ascendra <noreply@yourdomain.com>'
// If you are using the Resend sandbox (no custom domain), keep:
//   'Ascendra <onboarding@resend.dev>'
// NOTE: sandbox emails only deliver to the address you signed up with.
const FROM_ADDRESS = 'Ascendra <onboarding@resend.dev>';

// The base URL of your running Vite app (used in email links)
const APP_URL = 'http://localhost:5173';

const PORT = 3001;

// ── EXPRESS SETUP ─────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: APP_URL }));
app.use(express.json());

// ── RESEND HELPER ─────────────────────────────────────────────────
async function sendEmail(to, subject, html) {
  if (!RESEND_API_KEY || RESEND_API_KEY === 're_PASTE_YOUR_KEY_HERE') {
    console.warn('[Ascendra Notify] ⚠️  No API key set — email skipped.');
    return { skipped: true };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, html }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('[Ascendra Notify] Resend error:', data);
  } else {
    console.log(`[Ascendra Notify] ✅  Email sent to ${to} — id: ${data.id}`);
  }
  return data;
}

// ── EMAIL TEMPLATES ───────────────────────────────────────────────
function baseTemplate(title, bodyHtml) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    body { margin:0; padding:0; background:#F4F6FA; font-family:'Segoe UI',Arial,sans-serif; }
    .wrapper { max-width:560px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,.08); }
    .header  { background:linear-gradient(135deg,#0A2A6E,#1A56DB); padding:32px 36px; display:flex; align-items:center; gap:14px; }
    .header-logo { width:40px; height:40px; }
    .header h1 { margin:0; color:#fff; font-size:22px; font-weight:800; letter-spacing:-.02em; }
    .header p  { margin:4px 0 0; color:rgba(255,255,255,.7); font-size:12px; text-transform:uppercase; letter-spacing:.1em; }
    .body    { padding:32px 36px; }
    .body p  { margin:0 0 16px; color:#374151; font-size:14px; line-height:1.6; }
    .cta     { display:inline-block; margin-top:8px; padding:12px 24px; background:linear-gradient(135deg,#1A56DB,#38BFFF); color:#fff; border-radius:10px; font-size:14px; font-weight:700; text-decoration:none; }
    .badge   { display:inline-block; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; }
    .badge-green  { background:#D1FAE5; color:#065F46; }
    .badge-orange { background:#FFEDD5; color:#92400E; }
    .badge-red    { background:#FEF2F2; color:#991B1B; }
    .badge-blue   { background:#DBEAFE; color:#1E40AF; }
    .divider { height:1px; background:#E5E7EB; margin:24px 0; }
    .footer  { padding:20px 36px; background:#F9FAFB; border-top:1px solid #E5E7EB; }
    .footer p { margin:0; color:#9CA3AF; font-size:12px; }
    table.goals { width:100%; border-collapse:collapse; margin:16px 0; }
    table.goals th { font-size:11px; font-weight:700; color:#6B7280; text-transform:uppercase; letter-spacing:.08em; padding:8px 12px; border-bottom:2px solid #E5E7EB; text-align:left; }
    table.goals td { font-size:13px; padding:10px 12px; border-bottom:1px solid #F3F4F6; color:#374151; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <svg class="header-logo" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="30,4 8,56 20,56 30,32" fill="#38BFFF" opacity="0.95"/>
        <polygon points="30,4 52,56 40,56 30,32" fill="#60A5FA" opacity="0.85"/>
        <polygon points="22,40 38,40 34,50 26,50" fill="#1E3A8A" opacity="0.5"/>
      </svg>
      <div>
        <h1>Ascendra</h1>
        <p>Enterprise Performance Management</p>
      </div>
    </div>
    <div class="body">
      <h2 style="margin:0 0 16px;font-size:18px;font-weight:800;color:#111827;">${title}</h2>
      ${bodyHtml}
    </div>
    <div class="footer">
      <p>This is an automated notification from Ascendra. Do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;
}

// ── ROUTES ────────────────────────────────────────────────────────

app.post('/notify/submission', async (req, res) => {
  const { employeeName, employeeEmail, managerName, managerEmail, goalCount, totalWeight } = req.body;
  const html = baseTemplate(
    `New Goal Sheet Submitted`,
    `<p>Hi ${managerName},</p>
     <p><strong>${employeeName}</strong> has submitted their goal sheet for your review.</p>
     <table class="goals">
       <tr><th>Employee</th><th>Goals</th><th>Total Weight</th><th>Status</th></tr>
       <tr><td>${employeeName}</td><td>${goalCount} goals</td><td>${totalWeight}%</td><td><span class="badge badge-orange">Pending Review</span></td></tr>
     </table>
     <p>Please review and approve or return the goal sheet at your earliest convenience.</p>
     <a href="${APP_URL}" class="cta">Review Goal Sheet →</a>`
  );
  const result = await sendEmail(managerEmail, `Goal Sheet Submitted — ${employeeName}`, html);
  res.json({ ok: true, result });
});

app.post('/notify/approval', async (req, res) => {
  const { employeeName, employeeEmail, managerName, comment, goalCount } = req.body;
  const html = baseTemplate(
    `Your Goal Sheet Has Been Approved ✅`,
    `<p>Hi ${employeeName},</p>
     <p>Your goal sheet with <strong>${goalCount} goals</strong> has been approved by <strong>${managerName}</strong>.</p>
     <p>Your goals are now <strong>locked</strong> for the performance cycle.</p>
     ${comment ? `<div class="divider"></div><p><strong>Manager's comment:</strong></p><p style="background:#F9FAFB;padding:12px 16px;border-radius:8px;border-left:3px solid #1A56DB;">${comment}</p>` : ''}
     <a href="${APP_URL}" class="cta">View My Goals →</a>`
  );
  const result = await sendEmail(employeeEmail, `Your Goal Sheet Has Been Approved — Ascendra`, html);
  res.json({ ok: true, result });
});

app.post('/notify/return', async (req, res) => {
  const { employeeName, employeeEmail, managerName, comment } = req.body;
  const html = baseTemplate(
    `Action Required: Goal Sheet Returned for Rework ↩️`,
    `<p>Hi ${employeeName},</p>
     <p>Your goal sheet has been returned for rework by <strong>${managerName}</strong>.</p>
     <div class="divider"></div>
     <p><strong>Manager's feedback:</strong></p>
     <p style="background:#FEF2F2;padding:12px 16px;border-radius:8px;border-left:3px solid #EF4444;color:#991B1B;">${comment}</p>
     <div class="divider"></div>
     <p>Please update your goal sheet and resubmit as soon as possible.</p>
     <a href="${APP_URL}" class="cta">Update My Goals →</a>`
  );
  const result = await sendEmail(employeeEmail, `Action Required: Goal Sheet Returned — Ascendra`, html);
  res.json({ ok: true, result });
});

app.post('/notify/checkin-reminder', async (req, res) => {
  const { employeeName, employeeEmail, quarter, deadline } = req.body;
  const html = baseTemplate(
    `Reminder: ${quarter} Check-in Due 📊`,
    `<p>Hi ${employeeName},</p>
     <p>The <strong>${quarter} check-in window</strong> is now open. Please log your actual achievements against your planned targets.</p>
     ${deadline ? `<p><strong>Deadline:</strong> ${deadline}</p>` : ''}
     <p>Keeping your progress up to date helps your manager provide timely feedback and support.</p>
     <a href="${APP_URL}" class="cta">Update My Achievements →</a>`
  );
  const result = await sendEmail(employeeEmail, `Reminder: ${quarter} Check-in Due — Ascendra`, html);
  res.json({ ok: true, result });
});

app.post('/notify/escalation', async (req, res) => {
  const { employeeName, employeeEmail, daysOverdue, adminName } = req.body;
  const html = baseTemplate(
    `Urgent: Goal Sheet Submission Overdue ⚠️`,
    `<p>Hi ${employeeName},</p>
     <p>Your goal sheet submission is <strong>${daysOverdue} day(s) overdue</strong>. This has been flagged by <strong>${adminName}</strong>.</p>
     <p>Please submit your goal sheet immediately to avoid further escalation.</p>
     <a href="${APP_URL}" class="cta">Submit My Goals Now →</a>`
  );
  const result = await sendEmail(employeeEmail, `Urgent: Goal Sheet Overdue — Ascendra`, html);
  res.json({ ok: true, result });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Ascendra Notification Server',
    apiKeySet: RESEND_API_KEY !== 're_PASTE_YOUR_KEY_HERE',
    from: FROM_ADDRESS,
    appUrl: APP_URL,
  });
});

app.listen(PORT, () => {
  console.log(`\n🔷 Ascendra Notification Server`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  if (!RESEND_API_KEY || RESEND_API_KEY === 're_PASTE_YOUR_KEY_HERE') {
    console.log(`\n   ⚠️  WARNING: No Resend API key set.`);
    console.log(`   Set RESEND_API_KEY env var or paste key on line 18.\n`);
  } else {
    console.log(`   ✅  Resend API key loaded. Emails will be sent.\n`);
  }
});
