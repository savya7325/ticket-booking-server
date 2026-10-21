import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('✓ Email server is ready to send messages');
  }
});

// Send booking confirmation email
export const sendBookingConfirmation = async (userEmail, bookingDetails) => {
  const { eventName, eventDate, eventTime, eventVenue, ticketCount, totalAmount, bookingId } = bookingDetails;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: `Booking Confirmed - ${eventName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .info-label { font-weight: bold; color: #667eea; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Your tickets are ready</p>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>Great news! Your booking has been confirmed. Here are your ticket details:</p>
            
            <div class="ticket-info">
              <h2 style="color: #667eea; margin-top: 0;">📋 Booking Details</h2>
              <div class="info-row">
                <span class="info-label">Booking ID:</span>
                <span><strong>${bookingId}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">Event:</span>
                <span>${eventName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date:</span>
                <span>${new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Time:</span>
                <span>${eventTime}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Venue:</span>
                <span>${eventVenue}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Number of Tickets:</span>
                <span>${ticketCount}</span>
              </div>
              <div class="info-row" style="border-bottom: none;">
                <span class="info-label">Total Amount:</span>
                <span style="font-size: 20px; color: #667eea;"><strong>₹${totalAmount}</strong></span>
              </div>
            </div>

            <p style="margin-top: 30px;">
              <strong>Important:</strong> Please carry a valid ID proof and this booking confirmation to the venue.
            </p>

            <p>We hope you have a wonderful time at the event! 🎊</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} Your Event Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Booking confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Error sending booking confirmation email:', error);
    throw error;
  }
};

// Send welcome email on registration
export const sendWelcomeEmail = async (userEmail, userName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: 'Welcome to Our Event Platform! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎊 Welcome Aboard!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>Welcome to our event booking platform! We're thrilled to have you join our community.</p>
            <p>With your new account, you can:</p>
            <ul>
              <li>🎫 Browse and book tickets for amazing events</li>
              <li>📅 Manage your bookings easily</li>
              <li>🔔 Get notified about upcoming events</li>
              <li>⭐ Enjoy exclusive offers and early access</li>
            </ul>
            <p>Start exploring events and book your next amazing experience!</p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Happy booking! 🎉</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your Event Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Error sending welcome email:', error);
    // Don't throw error for welcome email - it's not critical
    return { success: false, error: error.message };
  }
};

// Send booking cancellation email
export const sendCancellationEmail = async (userEmail, bookingDetails) => {
  const { eventName, bookingId, refundAmount } = bookingDetails;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: `Booking Cancelled - ${eventName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f56565; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Cancelled</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>Your booking has been cancelled successfully.</p>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>Event:</strong> ${eventName}</p>
            ${refundAmount ? `<p><strong>Refund Amount:</strong> ₹${refundAmount}</p>
            <p>The refund will be processed within 5-7 business days.</p>` : ''}
            <p>We're sorry to see you go. We hope to see you at our events in the future!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your Event Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Cancellation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Error sending cancellation email:', error);
    throw error;
  }
};

// ---------- Contact page ----------

// Where contact-form messages are delivered. Set CONTACT_INBOX in .env to change it.
const contactInbox = () => process.env.CONTACT_INBOX || "savyaak07@gmail.com";

// Visitor-typed text goes into HTML emails, so escape it.
const esc = (str = "") =>
  String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Notifies the admin. Reply-To is the visitor, so hitting "Reply" in Gmail answers them directly.
export const sendContactNotification = async ({ name, email, topic, message, createdAt }) => {
  const when = new Date(createdAt || Date.now()).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: contactInbox(),
    replyTo: { name, address: email },
    subject: `📩 New message: ${topic} — ${name}`,
    text: `New message from the Evenza contact page\n\nFrom: ${name} <${email}>\nTopic: ${topic}\nSent: ${when} IST\n\n${message}\n\nReply to this email to answer ${name} directly.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1f1830">
        <div style="background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;padding:24px 28px;border-radius:12px 12px 0 0">
          <div style="font-size:12px;letter-spacing:2px;opacity:.85">EVENZA · CONTACT PAGE</div>
          <h2 style="margin:6px 0 0;font-size:22px">New message: ${esc(topic)}</h2>
        </div>
        <div style="background:#f7f5fb;padding:24px 28px;border-radius:0 0 12px 12px">
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#7c6f8f;width:80px">From</td><td style="padding:6px 0"><b>${esc(name)}</b> &lt;<a href="mailto:${esc(email)}" style="color:#7c3aed">${esc(email)}</a>&gt;</td></tr>
            <tr><td style="padding:6px 0;color:#7c6f8f">Topic</td><td style="padding:6px 0">${esc(topic)}</td></tr>
            <tr><td style="padding:6px 0;color:#7c6f8f">Sent</td><td style="padding:6px 0">${esc(when)} IST</td></tr>
          </table>
          <div style="margin-top:16px;background:#fff;border-radius:10px;padding:18px;font-size:15px;line-height:1.6;white-space:pre-wrap;border:1px solid #ece7f5">${esc(message)}</div>
          <p style="font-size:13px;color:#7c6f8f;margin-top:18px">Just hit <b>Reply</b> to answer ${esc(name)} directly.</p>
        </div>
      </div>`,
  });
};

// Lets the visitor know their message arrived.
export const sendContactAutoReply = async ({ name, email, topic, message }) =>
  transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    replyTo: contactInbox(),
    subject: "We got your message 🎟️",
    text: `Hi ${name},\n\nThanks for reaching out to Evenza. We've received your message about "${topic}" and will reply to this address soon.\n\nYour message:\n${message}\n\n— Team Evenza`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1f1830">
        <div style="background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;padding:28px;border-radius:12px 12px 0 0;text-align:center">
          <h2 style="margin:0;font-size:22px">Thanks, ${esc(name)}! 🎟️</h2>
          <p style="margin:8px 0 0;opacity:.9">We got your message and will get back to you soon.</p>
        </div>
        <div style="background:#f7f5fb;padding:24px 28px;border-radius:0 0 12px 12px;font-size:14px;line-height:1.6">
          <p style="margin-top:0">Here's a copy of what you sent us about <b>${esc(topic)}</b>:</p>
          <div style="background:#fff;border-radius:10px;padding:16px;white-space:pre-wrap;border:1px solid #ece7f5">${esc(message)}</div>
          <p>Need to add something? Just reply to this email.</p>
          <p style="color:#7c6f8f;margin-bottom:0">— Team Evenza</p>
        </div>
      </div>`,
  });

export default transporter;