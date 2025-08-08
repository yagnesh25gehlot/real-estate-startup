import mailgun from 'mailgun-js';

let mg: any = null;

// Initialize Mailgun only if API key is available
if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
  mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });
}

export interface DealerApprovalEmailData {
  dealerId: string;
  dealerName: string;
  dealerEmail: string;
}

export interface BookingConfirmationEmailData {
  bookingId: string;
  userEmail: string;
  userName: string;
  propertyTitle: string;
  startDate: string;
  endDate: string;
  amount: number;
}

export interface CommissionEarningsEmailData {
  dealerEmail: string;
  dealerName: string;
  propertyTitle: string;
  commissionAmount: number;
  level: number;
}

export const sendDealerApprovalEmail = async (data: DealerApprovalEmailData) => {
  try {
    if (!mg) {
      console.log('⚠️ Mailgun not configured, skipping email');
      return;
    }
    
    const adminEmail = 'admin@propertyplatform.com'; // This should be configurable
    
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
  } catch (error) {
    console.error('❌ Failed to send dealer approval email:', error);
  }
};

export const sendBookingConfirmationEmail = async (data: BookingConfirmationEmailData) => {
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
            <li><strong>Amount Paid:</strong> ₹${data.amount.toFixed(2)}</li>
            <li><strong>Booking ID:</strong> ${data.bookingId}</li>
          </ul>
        </div>
        <p>Thank you for choosing Property Platform!</p>
        <p>If you have any questions, please contact our support team.</p>
      `,
    };

    await mg.messages().send(emailData);
    console.log('✅ Booking confirmation email sent');
  } catch (error) {
    console.error('❌ Failed to send booking confirmation email:', error);
  }
};

export const sendCommissionEarningsEmail = async (data: CommissionEarningsEmailData) => {
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
            <li><strong>Commission Amount:</strong> ₹${data.commissionAmount.toFixed(2)}</li>
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
  } catch (error) {
    console.error('❌ Failed to send commission earnings email:', error);
  }
};

export const sendManualBookingSubmittedEmail = async (adminEmail: string, payload: { user: string; property: string; paymentRef: string; proofUrl?: string; start: string; end: string; }) => {
  try {
    if (!mg) { 
      // Log to console instead of sending email when Mailgun is not configured
      console.log('📧 ADMIN NOTIFICATION - New Booking Submitted:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`👤 User: ${payload.user}`);
      console.log(`🏠 Property: ${payload.property}`);
      console.log(`💳 UPI Ref: ${payload.paymentRef}`);
      console.log(`📅 Period: ${payload.start} - ${payload.end}`);
      if (payload.proofUrl) console.log(`📎 Proof: ${payload.proofUrl}`);
      console.log(`🔗 Review at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/bookings`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return; 
    }
    
    await mg.messages().send({
      from: `Property Platform <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: adminEmail,
      subject: 'New Booking Submitted - Approval Needed',
      html: `
        <h3>New Booking Submission</h3>
        <ul>
          <li><strong>User:</strong> ${payload.user}</li>
          <li><strong>Property:</strong> ${payload.property}</li>
          <li><strong>UPI Ref:</strong> ${payload.paymentRef}</li>
          <li><strong>Period:</strong> ${payload.start} - ${payload.end}</li>
          ${payload.proofUrl ? `<li><strong>Proof:</strong> ${payload.proofUrl}</li>` : ''}
        </ul>
        <p>Review in admin dashboard: ${process.env.FRONTEND_URL}/admin/bookings</p>
      `,
    });
  } catch (e) { console.error('Email failed:', e); }
};

export const sendWelcomeEmail = async (userEmail: string, userName: string, role: string) => {
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
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
  }
}; 