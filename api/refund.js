const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { getGmailCredentials, sendRefundConfirmation } = require('./email');

for (const envFile of [path.join(__dirname, '..', '.env.local'), path.join(__dirname, '..', '.env')]) {
  dotenv.config({ path: envFile });
}

const policy = fs.readFileSync(path.join(process.cwd(), 'data', 'policy.txt'), 'utf8');

const orders = [
  ['ORD-101', 'Ali', 'MacBook Air M3', 'electronics', 5, 'Return Approved'],
  ['ORD-102', 'Sara', 'WH-1000XM5', 'electronics', 18, 'Status not recorded'],
  ['ORD-103', 'John', 'Galaxy S25 Ultra', 'electronics', 3, 'Return Approved'],
  ['ORD-104', 'Mia', 'Galaxy Tab S10 Ultra', 'electronics', 22, 'Status not recorded'],
  ['ORD-105', 'Abis', 'WH-1000XM5', 'electronics', 18, 'Status not recorded'],
  ['ORD-106', 'Syed', 'Galaxy S25 Ultra', 'electronics', 7, 'Return Approved'],
  ['ORD-107', 'Hussain', 'WH-1000XM5', 'electronics', 10, 'Return Approved'],
  ['ORD-108', 'Abis', 'MacBook Air M3', 'electronics', 0, 'Order Placed'],
  ['ORD-109', 'Ayyan', 'Keychron K8 Pro', 'electronics', 0, 'Order Placed']
];

function findOrder(orderId) {
  return orders.find(order => order[0] === String(orderId || '').trim().toUpperCase());
}

function returnPeriodFor(category) {
  const pattern = category.toLowerCase() === 'electronics' ? /electronics have a (\d+)-day/i : /other product categories have a (\d+)-day/i;
  const match = policy.match(pattern);
  return match ? Number(match[1]) : null;
}

function resolveOrderIdFromContext(body = {}) {
  const context = body.context || {};
  const direct = String(body.orderId || context.orderId || '').trim();
  return direct || null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed.' });

  const body = req.body || {};
  const { customerEmail, query = 'Refund request' } = body;
  const orderId = resolveOrderIdFromContext(body);
  const order = findOrder(orderId || body.orderId);
  if (!order) return res.status(404).json({ message: `Order ${orderId || ''} was not found.`.trim(), status: 'Not found' });

  const [id, customer, product, category, daysAgo, currentStatus] = order;
  const returnPeriod = returnPeriodFor(category);
  if (!returnPeriod) return res.status(503).json({ message: "I'm unable to access that information right now. Please try again shortly.", status: 'Unavailable' });
  const eligible = daysAgo <= returnPeriod;

  if (!eligible) {
    return res.status(422).json({
      status: 'Rejected',
      email: 'Not sent',
      log: 'Not configured: Google Sheets logging needs a server-side webhook or service-account integration.',
      message: `Refund request rejected. ${id} was purchased ${daysAgo} days ago, beyond the ${returnPeriod}-day ${category} return period.`
    });
  }

  const resolvedEmail = customerEmail || body.context?.customerEmail || null;
  if (!resolvedEmail) return res.status(400).json({ message: 'Customer email is required for an approved refund confirmation.' });

  if (!getGmailCredentials()) {
    console.error('Refund email not sent: GMAIL_EMAIL and GMAIL_APP_PASSWORD are required.');
    return res.status(503).json({
      status: 'Approved',
      email: 'Not sent',
      log: 'Not configured: Google Sheets logging needs a server-side webhook or service-account integration.',
      message: "I'm unable to send the confirmation email right now. Please try again shortly."
    });
  }

  try {
    await sendRefundConfirmation({ order: { orderId: id, customer, product }, to: resolvedEmail });
    console.info(JSON.stringify({ timestamp: new Date().toISOString(), customer, order_id: id, query, action: 'Refund Request', status: 'Approved', currentStatus }));
    return res.status(200).json({ status: 'Approved', email: 'Sent', log: 'Not configured: Google Sheets logging needs a server-side webhook or service-account integration.', message: `Refund approved for ${id}. Confirmation email sent.` });
  } catch (error) {
    console.error('Refund email failed:', error.message);
    return res.status(502).json({ status: 'Approved', email: 'Not sent', log: 'Pending Google Sheets integration', message: "I'm unable to send the confirmation email right now. Please try again shortly." });
  }
};
