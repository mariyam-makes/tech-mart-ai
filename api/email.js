const path = require('path');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

for (const envFile of [path.resolve(__dirname, '..', '.env.local'), path.resolve(__dirname, '..', '.env')]) {
  dotenv.config({ path: envFile });
}

function getGmailCredentials() {
  const user = String(process.env.GMAIL_EMAIL || '').trim();
  const pass = String(process.env.GMAIL_APP_PASSWORD || '').trim();
  return user && pass ? { user, pass } : null;
}

async function sendRefundConfirmation({ order, to }) {
  const credentials = getGmailCredentials();
  if (!credentials) {
    const error = new Error('GMAIL_EMAIL and GMAIL_APP_PASSWORD are required to send email.');
    console.error('Refund email not sent:', error.message);
    throw error;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: credentials
    });

    const result = await transporter.sendMail({
      from: `TechMart Support <${credentials.user}>`,
      to,
      subject: `TechMart refund confirmation - ${order.orderId}`,
      text: `Hi ${order.customer},\n\nYour refund request for ${order.product} (${order.orderId}) has been approved. This confirms approval and does not claim funds have already transferred.\n\nTechMart Support`
    });

    console.info(`Refund confirmation email sent for ${order.orderId} to ${to} (${result.messageId || 'no message id'}).`);
    return result;
  } catch (error) {
    console.error(`Refund email failed for ${order.orderId} to ${to}:`, error);
    throw error;
  }
}

module.exports = { getGmailCredentials, sendRefundConfirmation };
