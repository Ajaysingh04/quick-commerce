import SupportTicket from '../models/SupportTicket.js';
import sendEmail from '../utils/sendEmail.js';

export const createTicket = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const ticket = new SupportTicket({ name, email, subject, message });
    await ticket.save();

    const ticketRef = `RD-${String(ticket._id).slice(-6).toUpperCase()}`;

    // Dispatched confirmation email in background
    sendEmail({
      email,
      subject: `[Ticket #${ticketRef}] We received your inquiry: ${subject}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; padding: 32px 20px; border-radius: 24px; color: #ffffff;">
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="display: inline-block; padding: 8px 16px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; color: #34d399; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
              Support Request Received
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
                <span style="color: #38bdf8; font-weight: bold;">🎯 Assigned To:</span> Priority Customer Experience Desk
              </div>
            </div>
          </div>

          <div style="text-align: center; padding: 12px 16px; background: rgba(255,255,255,0.03); border-radius: 14px; border: 1px dashed #334155;">
            <p style="margin: 0; font-size: 12px; color: #64748b;">
              For urgent order matters, you can also reach us 24/7 on WhatsApp or support@rosedash.com.
            </p>
          </div>
        </div>
      `
    }).catch((err) => console.warn('Email notification dispatch notice:', err.message));

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

