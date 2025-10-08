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

export default transporter;