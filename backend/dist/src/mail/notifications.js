"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = exports.sendCommissionEarningsEmail = exports.sendBookingConfirmationEmail = exports.sendDealerApprovalEmail = void 0;
const mailgun_js_1 = __importDefault(require("mailgun-js"));
let mg = null;
if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    mg = (0, mailgun_js_1.default)({
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
    });
}
const sendDealerApprovalEmail = async (data) => {
    try {
        if (!mg) {
            console.log('⚠️ Mailgun not configured, skipping email');
            return;
        }
        const adminEmail = 'admin@propertyplatform.com';
        const emailData = {
            from: `Property Platform <noreply@${process.env.MAILGUN_DOMAIN}>`,
            to: adminEmail,
            subject: 'New Dealer Registration - Approval Required',
            html: `
        <h2>New Dealer Registration</h2>
        <p>A new dealer has registered and requires your approval:</p>
        <ul>
          <li><strong>Dealer ID:</strong> ${data.dealerId}</li>
          <li><strong>Name:</strong> ${data.dealerName}</li>
          <li><strong>Email:</strong> ${data.dealerEmail}</li>
          <li><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</li>
        </ul>
        <p>Please review and approve this dealer registration through the admin dashboard.</p>
        <p>Admin Dashboard: ${process.env.FRONTEND_URL}/admin</p>
      `,
        };
        await mg.messages().send(emailData);
        console.log('✅ Dealer approval email sent to admin');
    }
    catch (error) {
        console.error('❌ Failed to send dealer approval email:', error);
    }
};
exports.sendDealerApprovalEmail = sendDealerApprovalEmail;
const sendBookingConfirmationEmail = async (data) => {
    try {
        if (!mg) {
            console.log('⚠️ Mailgun not configured, skipping email');
            return;
        }
        const emailData = {
            from: `Property Platform <noreply@${process.env.MAILGUN_DOMAIN}>`,
            to: data.userEmail,
            subject: 'Booking Confirmation - Property Platform',
            html: `
        <h2>Booking Confirmation</h2>
        <p>Dear ${data.userName},</p>
        <p>Your property booking has been confirmed!</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Booking Details</h3>
          <ul>
            <li><strong>Property:</strong> ${data.propertyTitle}</li>
            <li><strong>Start Date:</strong> ${data.startDate}</li>
            <li><strong>End Date:</strong> ${data.endDate}</li>
            <li><strong>Amount Paid:</strong> $${data.amount.toFixed(2)}</li>
            <li><strong>Booking ID:</strong> ${data.bookingId}</li>
          </ul>
        </div>
        <p>Thank you for choosing Property Platform!</p>
        <p>If you have any questions, please contact our support team.</p>
      `,
        };
        await mg.messages().send(emailData);
        console.log('✅ Booking confirmation email sent');
    }
    catch (error) {
        console.error('❌ Failed to send booking confirmation email:', error);
    }
};
exports.sendBookingConfirmationEmail = sendBookingConfirmationEmail;
const sendCommissionEarningsEmail = async (data) => {
    try {
        if (!mg) {
            console.log('⚠️ Mailgun not configured, skipping email');
            return;
        }
        const emailData = {
            from: `Property Platform <noreply@${process.env.MAILGUN_DOMAIN}>`,
            to: data.dealerEmail,
            subject: 'Commission Earnings - Property Platform',
            html: `
        <h2>Commission Earnings</h2>
        <p>Dear ${data.dealerName},</p>
        <p>Congratulations! You have earned a commission from a property sale.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Commission Details</h3>
          <ul>
            <li><strong>Property:</strong> ${data.propertyTitle}</li>
            <li><strong>Commission Amount:</strong> $${data.commissionAmount.toFixed(2)}</li>
            <li><strong>Level:</strong> ${data.level}</li>
            <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
        </div>
        <p>Your commission has been credited to your account.</p>
        <p>Thank you for being part of our network!</p>
      `,
        };
        await mg.messages().send(emailData);
        console.log('✅ Commission earnings email sent');
    }
    catch (error) {
        console.error('❌ Failed to send commission earnings email:', error);
    }
};
exports.sendCommissionEarningsEmail = sendCommissionEarningsEmail;
const sendWelcomeEmail = async (userEmail, userName, role) => {
    try {
        if (!mg) {
            console.log('⚠️ Mailgun not configured, skipping email');
            return;
        }
        const emailData = {
            from: `Property Platform <noreply@${process.env.MAILGUN_DOMAIN}>`,
            to: userEmail,
            subject: 'Welcome to Property Platform',
            html: `
        <h2>Welcome to Property Platform!</h2>
        <p>Dear ${userName},</p>
        <p>Thank you for joining Property Platform. Your account has been created successfully.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Account Details</h3>
          <ul>
            <li><strong>Email:</strong> ${userEmail}</li>
            <li><strong>Role:</strong> ${role}</li>
            <li><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
        </div>
        <p>You can now start exploring properties and making bookings.</p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
      `,
        };
        await mg.messages().send(emailData);
        console.log('✅ Welcome email sent');
    }
    catch (error) {
        console.error('❌ Failed to send welcome email:', error);
    }
};
exports.sendWelcomeEmail = sendWelcomeEmail;
//# sourceMappingURL=notifications.js.map