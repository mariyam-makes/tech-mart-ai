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

function createGmailTransport(credentials) {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: credentials,
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000
  });
}

function emailErrorDetails(error) {
  return {
    name: error?.name,
    code: error?.code,
    command: error?.command,
    responseCode: error?.responseCode,
    response: error?.response,
    message: error?.message
  };
}

async function sendRefundConfirmation({ order, to }) {
  const credentials = getGmailCredentials();
  if (!credentials) {
    const error = new Error('GMAIL_EMAIL and GMAIL_APP_PASSWORD are required to send email.');
    console.error('Refund email configuration missing:', {
      hasGmailEmail: Boolean(process.env.GMAIL_EMAIL),
      hasGmailAppPassword: Boolean(process.env.GMAIL_APP_PASSWORD)
    });
    throw error;
  }

  try {
    const transporter = createGmailTransport(credentials);

    const result = await transporter.sendMail({
      from: `TechMart Support <${credentials.user}>`,
      to,
      subject: `TechMart refund confirmation - ${order.orderId}`,
      text: `Hi ${order.customer},\n\nYour refund request for ${order.product} (${order.orderId}) has been approved. This confirms approval and does not claim funds have already transferred.\n\nTechMart Support`
    });

    console.info('Refund confirmation email sent:', {
      orderId: order.orderId,
      recipient: to,
      messageId: result.messageId || null
    });
    return result;
  } catch (error) {
    console.error('Refund email failed:', {
      orderId: order.orderId,
      recipient: to,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 465,
      secure: true,
      timeouts: {
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000
      },
      error: emailErrorDetails(error)
    });
    throw error;
  }
}

module.exports = { getGmailCredentials, sendRefundConfirmation, createGmailTransport };
