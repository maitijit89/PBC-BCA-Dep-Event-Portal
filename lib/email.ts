import nodemailer from 'nodemailer';
import { ContactFormData } from './types';

/**
 * Creates and returns a Nodemailer transporter.
 * Supports custom SMTP, Gmail, or Ethereal test accounts.
 */
export function getMailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export interface InvitationEmailPayload {
  name: string;
  email: string;
  semester: string;
  amountPaid: number;
  ticketId: string;
  paymentId: string;
}

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates a modern, responsive HTML Invitation Letter / Event Pass.
 */
export function generateInvitationEmailHtml(data: InvitationEmailPayload): string {
  const safeName = escapeHtml(data.name);
  const safeSemester = escapeHtml(data.semester);
  const safeTicketId = escapeHtml(data.ticketId);
  const safePaymentId = escapeHtml(data.paymentId);
  const formattedAmount = `₹${data.amountPaid}`;
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Event Invitation - BCA Department</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f1f5f9;
      margin: 0;
      padding: 24px 12px;
      color: #1e293b;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
      padding: 36px 24px;
      text-align: center;
      color: #ffffff;
    }
    .college-name {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #cbd5e1;
      margin-bottom: 6px;
      font-weight: 600;
    }
    .event-title {
      font-size: 24px;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.5px;
      color: #ffffff;
    }
    .department-badge {
      display: inline-block;
      margin-top: 12px;
      padding: 4px 14px;
      background-color: rgba(255, 255, 255, 0.15);
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      color: #e0e7ff;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .message-text {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    /* TICKET PASS CARD */
    .ticket-card {
      background: linear-gradient(145deg, #f8fafc, #f1f5f9);
      border: 2px dashed #6366f1;
      border-radius: 14px;
      padding: 24px;
      margin: 24px 0;
      text-align: center;
      position: relative;
    }
    .pass-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .pass-id {
      font-size: 38px;
      font-weight: 900;
      letter-spacing: 6px;
      color: #4338ca;
      font-family: 'Courier New', Courier, monospace;
      margin: 8px 0;
      text-shadow: 0 2px 4px rgba(67, 56, 202, 0.1);
    }
    .details-table {
      width: 100%;
      margin-top: 20px;
      border-collapse: collapse;
    }
    .details-table td {
      padding: 10px 12px;
      font-size: 13px;
      border-bottom: 1px solid #e2e8f0;
    }
    .details-table tr:last-child td {
      border-bottom: none;
    }
    .td-label {
      color: #64748b;
      font-weight: 600;
      width: 40%;
      text-align: left;
    }
    .td-value {
      color: #0f172a;
      font-weight: 700;
      text-align: right;
    }
    .badge-paid {
      display: inline-block;
      padding: 2px 8px;
      background-color: #dcfce7;
      color: #15803d;
      font-size: 11px;
      font-weight: 700;
      border-radius: 4px;
    }
    .instructions-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 14px 16px;
      border-radius: 6px;
      margin-top: 24px;
      font-size: 13px;
      color: #92400e;
      line-height: 1.5;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px 24px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="college-name">Panskura Banamali College (Autonomous)</div>
      <h1 class="event-title">BCA Department Event 2026</h1>
      <span class="department-badge">Official Invitation Pass</span>
    </div>

    <div class="content">
      <div class="greeting">Dear ${safeName},</div>
      <p class="message-text">
        Congratulations! Your payment for the <strong>BCA Department Annual Event</strong> has been successfully received and confirmed.
        We are thrilled to welcome you. Please find your official entry pass details below.
      </p>

      <div class="ticket-card">
        <div class="pass-label">YOUR UNIQUE ENTRY ID</div>
        <div class="pass-id">${safeTicketId}</div>
        <p style="margin: 0; font-size: 12px; color: #6366f1; font-weight: 600;">
          Save or present this 6-digit ID at the entry gate desk
        </p>

        <table class="details-table">
          <tr>
            <td class="td-label">Attendee Name:</td>
            <td class="td-value">${safeName}</td>
          </tr>
          <tr>
            <td class="td-label">Semester:</td>
            <td class="td-value">${safeSemester}</td>
          </tr>
          <tr>
            <td class="td-label">Amount Paid:</td>
            <td class="td-value" style="color: #16a34a; font-size: 15px;">${formattedAmount}</td>
          </tr>
          <tr>
            <td class="td-label">Payment Status:</td>
            <td class="td-value"><span class="badge-paid">PAID & VERIFIED</span></td>
          </tr>
          <tr>
            <td class="td-label">Razorpay Ref:</td>
            <td class="td-value" style="font-family: monospace; font-size: 11px;">${safePaymentId}</td>
          </tr>
          <tr>
            <td class="td-label">Issued On:</td>
            <td class="td-value">${currentDate}</td>
          </tr>
        </table>
      </div>

      <div class="instructions-box">
        <strong>Important Guidelines for Attendees:</strong>
        <ul style="margin: 6px 0 0 0; padding-left: 18px;">
          <li>Bring your College Student ID card along with this 6-digit Pass ID.</li>
          <li>Entry opens at 9:30 AM at the College Auditorium / Seminar Hall.</li>
          <li>Lunch and participation refreshments are included with your pass.</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0;">Department of Computer Application (BCA)</p>
      <p style="margin: 0;">Panskura Banamali College, Panskura R.S., Purba Medinipur, WB</p>
      <p style="margin: 8px 0 0 0; font-size: 11px; color: #cbd5e1;">This is an automated receipt and invitation ticket.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Sends the official HTML invitation email to the registered student.
 */
export async function sendInvitationEmail(data: InvitationEmailPayload): Promise<{ success: boolean; messageId?: string }> {
  try {
    const transporter = getMailTransporter();
    const fromAddress = process.env.SMTP_FROM || `"BCA Event Committee - PBC" <noreply@panskurbanamalicollege.edu.in>`;

    if (!transporter) {
      console.warn(
        `⚠️ SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) not configured. Email to ${data.email} for Ticket #${data.ticketId} simulated.`
      );
      return { success: true, messageId: 'simulated-local-id' };
    }

    const mailOptions = {
      from: fromAddress,
      to: data.email,
      subject: `🎉 Entry Pass: BCA Department Event - ID: ${data.ticketId}`,
      html: generateInvitationEmailHtml(data),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Invitation email dispatched to ${data.email}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send invitation email to ${data.email}:`, error);
    // Don't fail the registration if email fails
    return { success: false };
  }
}

/**
 * Sends a student support inquiry message to the admin email address.
 */
export async function sendContactEmail(contactData: ContactFormData): Promise<{ success: boolean; message?: string }> {
  try {
    const transporter = getMailTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@pbc-bca.edu.in';
    const fromAddress = process.env.SMTP_FROM || `"BCA Event Helpdesk" <noreply@panskurbanamalicollege.edu.in>`;

    const safeName = escapeHtml(contactData.name);
    const safeEmail = escapeHtml(contactData.email);
    const safeMessage = escapeHtml(contactData.message);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
        <h2 style="color: #312e81; margin-top: 0;">New Support / Helpdesk Inquiry</h2>
        <p><strong>From:</strong> ${safeName} (&lt;${safeEmail}&gt;)</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString('en-IN')}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
        <p style="white-space: pre-wrap; color: #334155; font-size: 15px; line-height: 1.6;">${safeMessage}</p>
      </div>
    `;

    if (!transporter) {
      console.warn(`⚠️ SMTP not configured. Contact query from ${contactData.email} logged:`, contactData);
      return { success: true, message: 'Message logged in dev mode (SMTP not configured)' };
    }

    await transporter.sendMail({
      from: fromAddress,
      to: adminEmail,
      replyTo: contactData.email,
      subject: `[BCA Event Inquiry] From ${contactData.name}`,
      html: htmlContent,
    });

    return { success: true, message: 'Inquiry sent to admin successfully.' };
  } catch (error: unknown) {
    console.error('❌ Error sending contact email:', error);
    const msg = error instanceof Error ? error.message : 'Failed to dispatch email';
    return { success: false, message: msg };
  }
}
