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
      subject: `🚨 [New ${roleLabel} Query] #${ticketRef}: ${subject}`,
      data: {
        '🏷️ Ticket ID': `#${ticketRef}`,
        '👤 Sender Name': name,
        '📧 Sender Email': email,
        '🏢 User Category': roleLabel,
        '📌 Inquiry Subject': subject,
        '💬 Full Message': message,
        '⚡ Priority Level': 'High (< 60 Mins Response)',
        '🕒 Submission Time': new Date().toLocaleString()
      },
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0b1120; padding: 32px 20px; border-radius: 20px; color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="background: #f43f5e; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
              New Support Inquiry Alert
            </span>
            <h2 style="margin: 12px 0 4px; font-size: 24px; font-weight: 900; color: #ffffff;">RoseDash Central Helpdesk</h2>
            <p style="margin: 0; color: #94a3b8; font-size: 14px;">Ticket Ref: <strong style="color: #38bdf8;">#${ticketRef}</strong></p>
          </div>

          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <div style="display: grid; gap: 10px; font-size: 14px; margin-bottom: 16px; border-bottom: 1px solid #334155; pb: 16px;">
              <div><strong style="color: #94a3b8;">User Type:</strong> <span style="color: #34d399; font-weight: bold; background: rgba(52, 211, 153, 0.1); padding: 2px 8px; border-radius: 6px;">${roleLabel}</span></div>
              <div><strong style="color: #94a3b8;">Sender Name:</strong> <span style="color: #f1f5f9; font-weight: 600;">${name}</span></div>
              <div><strong style="color: #94a3b8;">Sender Email:</strong> <a href="mailto:${email}" style="color: #38bdf8; text-decoration: underline;">${email}</a></div>
              <div><strong style="color: #94a3b8;">Subject:</strong> <span style="color: #ffffff; font-weight: 700;">${subject}</span></div>
            </div>

            <div style="background: #0f172a; border-left: 4px solid #f43f5e; border-radius: 10px; padding: 16px; margin: 16px 0;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #f43f5e; margin-bottom: 6px;">Query Message:</div>
              <div style="font-size: 14px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap;">${message}</div>
            </div>

            <div style="text-align: center; margin-top: 20px;">
              <a href="mailto:${email}?subject=Re: [Ticket %23${ticketRef}] ${encodeURIComponent(subject)}" style="display: inline-block; background: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none;">
                Reply Directly to ${name}
              </a>
            </div>
          </div>

          <div style="text-align: center; font-size: 12px; color: #64748b;">
            Dispatched automatically to RoseDash Admin (<strong style="color: #94a3b8;">appsicadev1@gmail.com</strong>).
          </div>
        </div>
      `
    }).catch((err) => console.warn('Admin support alert dispatch notice:', err.message));

    // 2. Dispatched confirmation email to the user / partner / rider
    sendEmail({
      email,
      subject: `[Ticket #${ticketRef}] We received your inquiry: ${subject}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; padding: 32px 20px; border-radius: 24px; color: #ffffff;">
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="display: inline-block; padding: 8px 16px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; color: #34d399; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
              Support Request Registered
            </div>
            <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">RoseDash Care</h1>
            <p style="margin: 6px 0 0; font-size: 14px; color: #94a3b8; font-weight: 600;">Reference Ticket ID: <strong style="color: #38bdf8;">#${ticketRef}</strong></p>
          </div>

          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 24px; margin-bottom: 20px;">
            <p style="margin: 0 0 14px; font-size: 16px; color: #f1f5f9; font-weight: 700;">Hello ${name},</p>
            <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
              Thank you for reaching out to us. We have successfully registered your inquiry regarding <strong style="color: #ffffff;">"${subject}"</strong>.
            </p>

            <div style="background: #0f172a; border-left: 4px solid #10b981; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 6px; font-size: 11px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 0.5px;">Your Inquiry Details:</p>
              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #e2e8f0; font-style: italic;">"${message}"</p>
            </div>

            <div style="display: grid; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #334155;">
              <div style="font-size: 13px; color: #94a3b8;">
                <span style="color: #34d399; font-weight: bold;">⚡ Expected Response:</span> Under 1 hour
              </div>
              <div style="font-size: 13px; color: #94a3b8;">
                <span style="color: #38bdf8; font-weight: bold;">🎯 Assigned To:</span> Priority Experience Desk (appsicadev1@gmail.com)
              </div>
            </div>
          </div>

          <div style="text-align: center; padding: 12px 16px; background: rgba(255,255,255,0.03); border-radius: 14px; border: 1px dashed #334155;">
            <p style="margin: 0; font-size: 12px; color: #64748b;">
              For urgent order matters, you can also reach us directly at <strong style="color: #38bdf8;">appsicadev1@gmail.com</strong> or WhatsApp +91 98765 43210.
            </p>
          </div>
        </div>
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

