import SupportTicket from '../models/SupportTicket.js';
import sendEmail from '../utils/sendEmail.js';

export const createTicket = async (req, res) => {
  try {
    const { name, email, subject, message, role = 'user' } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const ticket = new SupportTicket({ name, email, role, subject, message });
    await ticket.save();

    const ticketRef = `RD-${String(ticket._id).slice(-6).toUpperCase()}`;
    ticket.ticketRef = ticketRef;
    await ticket.save();

    const adminEmail = process.env.ADMIN_SUPPORT_EMAIL || 'appsicadev1@gmail.com';
    const roleLabel = role === 'partner' ? 'Store Partner' : role === 'delivery' ? 'Delivery Rider' : role === 'admin' ? 'Administrator' : 'Customer';

    // 1. Send Admin Alert Email to appsicadev1@gmail.com
    sendEmail({
      email: adminEmail,
      subject: `🚨 [${roleLabel.toUpperCase()} INQUIRY] #${ticketRef}: ${subject}`,
      data: {
        '⚡ STATUS': '🔴 HIGH PRIORITY (< 60 Mins SLA)',
        '🎫 TICKET ID': `#${ticketRef}`,
        '🏢 USER CATEGORY': roleLabel,
        '👤 SENDER NAME': name,
        '📧 SENDER EMAIL': email,
        '📌 SUBJECT': subject,
        '💬 MESSAGE DETAILS': message,
        '⏰ SUBMITTED AT': new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        '⚡ DIRECT REPLY': `mailto:${email}?subject=Re:%20[Ticket%20%23${ticketRef}]%20${encodeURIComponent(subject)}`
      },
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @keyframes pulseGlow {
              0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7); }
              70% { box-shadow: 0 0 0 10px rgba(244, 63, 94, 0); }
              100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
            }
            .pulse-dot {
              display: inline-block;
              width: 10px;
              height: 10px;
              background-color: #ef4444;
              border-radius: 50%;
              animation: pulseGlow 2s infinite;
              margin-right: 6px;
              vertical-align: middle;
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030712; padding: 40px 10px;">
            <tr>
              <td align="center">
                <!-- Container Card -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background: linear-gradient(145deg, #111827, #0f172a); border-radius: 28px; border: 1px solid #1f2937; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
                  
                  <!-- Top Glowing Brand Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #e11d48, #be123c, #881337); padding: 32px 28px; text-align: center; border-bottom: 2px solid #f43f5e;">
                      <div style="display: inline-block; background: rgba(0, 0, 0, 0.3); backdrop-filter: blur(8px); padding: 6px 16px; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.2); margin-bottom: 12px;">
                        <span class="pulse-dot"></span>
                        <span style="color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">Live Priority Ticket</span>
                      </div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                        RoseDash Operations
                      </h1>
                      <p style="margin: 6px 0 0; color: #fecdd3; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">
                        Central Helpdesk &amp; Escalation Management
                      </p>
                    </td>
                  </tr>

                  <!-- Main Content Area -->
                  <tr>
                    <td style="padding: 32px 28px;">
                      
                      <!-- Ticket ID & Category Hero Banner -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1f2937; border-radius: 18px; border: 1px solid #374151; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 16px 20px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td>
                                  <div style="color: #9ca3af; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Ticket Reference</div>
                                  <div style="color: #38bdf8; font-size: 20px; font-weight: 900; font-family: monospace; margin-top: 2px;">#${ticketRef}</div>
                                </td>
                                <td align="right">
                                  <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3); padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                                    ${roleLabel}
                                  </span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Structured Info Table -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #111827; border-radius: 16px; border: 1px solid #1f2937; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 18px 20px; border-bottom: 1px solid #1f2937;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td width="35%" style="color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase;">Submitter Name</td>
                                <td style="color: #f3f4f6; font-size: 14px; font-weight: 700;">${name}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 18px 20px; border-bottom: 1px solid #1f2937;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td width="35%" style="color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase;">Submitter Email</td>
                                <td>
                                  <a href="mailto:${email}" style="color: #38bdf8; font-size: 14px; font-weight: 700; text-decoration: underline;">
                                    ${email}
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 18px 20px; border-bottom: 1px solid #1f2937;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td width="35%" style="color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase;">Inquiry Subject</td>
                                <td style="color: #ffffff; font-size: 14px; font-weight: 800;">${subject}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 18px 20px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td width="35%" style="color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase;">SLA Target</td>
                                <td style="color: #fbbf24; font-size: 13px; font-weight: 800;">⚡ Respond within 60 Minutes</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Message Box -->
                      <div style="background-color: #030712; border-left: 4px solid #f43f5e; border-radius: 14px; padding: 20px; margin-bottom: 28px; border-top: 1px solid #1f2937; border-right: 1px solid #1f2937; border-bottom: 1px solid #1f2937;">
                        <div style="color: #f43f5e; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                          💬 Detailed Query Content:
                        </div>
                        <div style="color: #e5e7eb; font-size: 15px; line-height: 1.6; font-style: italic; white-space: pre-wrap;">
                          "${message}"
                        </div>
                      </div>

                      <!-- 1-Click Interactive CTA Button -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center">
                            <a href="mailto:${email}?subject=Re:%20[Ticket%20%23${ticketRef}]%20${encodeURIComponent(subject)}" style="display: block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 16px 28px; border-radius: 16px; font-size: 15px; font-weight: 900; text-align: center; box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4); letter-spacing: 0.3px;">
                              ⚡ Reply Directly to ${name}
                            </a>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #030712; border-top: 1px solid #1f2937; padding: 20px 28px; text-align: center;">
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">
                        This alert was automatically routed to <strong style="color: #9ca3af;">appsicadev1@gmail.com</strong> from RoseDash Quick Commerce Platform.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    }).catch((err) => console.warn('Admin support alert dispatch notice:', err.message));

    // 2. Dispatched confirmation email to the user / partner / rider
    sendEmail({
      email,
      subject: `[Ticket #${ticketRef}] We received your inquiry: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030712; padding: 30px 10px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background: #0f172a; border-radius: 24px; border: 1px solid #1e293b; overflow: hidden;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #059669, #047857); padding: 26px; text-align: center;">
                      <h2 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 900;">RoseDash Customer Care</h2>
                      <p style="margin: 4px 0 0; color: #a7f3d0; font-size: 13px;">Ticket Registered: <strong style="color: #ffffff;">#${ticketRef}</strong></p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 24px;">
                      <p style="margin: 0 0 12px; color: #f3f4f6; font-size: 15px; font-weight: 700;">Hello ${name},</p>
                      <p style="margin: 0 0 16px; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                        We have successfully received your query regarding <strong style="color: #ffffff;">"${subject}"</strong>. Our support desk is reviewing your ticket and will respond within <strong style="color: #34d399;">1 hour</strong>.
                      </p>
                      <div style="background: #1e293b; border-left: 4px solid #10b981; border-radius: 10px; padding: 14px; margin: 16px 0; color: #e2e8f0; font-size: 13px; font-style: italic;">
                        "${message}"
                      </div>
                      <p style="margin: 16px 0 0; color: #6b7280; font-size: 12px; text-align: center;">
                        For emergency order updates, reply directly to this email or reach us at appsicadev1@gmail.com.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    }).catch((err) => console.warn('Email confirmation dispatch notice:', err.message));

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket,
      ticketRef
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['open', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

