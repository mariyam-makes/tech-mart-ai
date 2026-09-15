const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getGmailCredentials, sendRefundConfirmation } = require('./email');

for (const envFile of [path.resolve(__dirname, '..', '.env.local'), path.resolve(__dirname, '..', '.env')]) {
  dotenv.config({ path: envFile });
}

const root = path.join(__dirname, '..', 'data');
const GEMINI_MODEL = 'gemini-3.6-flash';
const products = JSON.parse(fs.readFileSync(path.join(root, 'products.json'), 'utf8'));
const orders = JSON.parse(fs.readFileSync(path.join(root, 'orders.json'), 'utf8'));
const policy = fs.readFileSync(path.join(root, 'policy.txt'), 'utf8');

function findOrder(text) {
  const match = String(text).toUpperCase().match(/ORD-\d+/);
  return match ? orders.find(order => order.orderId === match[0]) : null;
}

function productMatches(text) {
  const query = String(text).toLowerCase();
  const terms = query.split(/[^a-z0-9]+/).filter(term => term.length > 2);
  return products.filter(product => [product.modelName, product.brand, product.category, product.bestFor, product.specifications]
    .some(value => terms.some(term => String(value).toLowerCase().includes(term))));
}

function productText(items) {
  return items.map(product => `${product.modelName} by ${product.brand}: $${product.price.toFixed(2)}, ${product.availability} (${product.stock} units), best for ${product.bestFor}. Specifications: ${product.specifications}.`).join('\n');
}

function orderText(order) {
  return `Order ID: ${order.orderId}\nCustomer: ${order.customer}\nProduct: ${order.product}\nCategory: ${order.category}\nDays since purchase: ${order.daysAgo}\nOrder status: ${order.status}`;
}

function returnPeriodFor(category) {
  const pattern = category.toLowerCase() === 'electronics' ? /electronics have a (\d+)-day/i : /other product categories have a (\d+)-day/i;
  const match = policy.match(pattern);
  return match ? Number(match[1]) : null;
}

function extractCustomerEmail(text) {
  const match = String(text).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : null;
}

function extractOrderId(text) {
  const match = String(text).match(/ORD-\d+/i);
  return match ? match[0].toUpperCase() : null;
}

function resolveContextFromRequest(payload = {}) {
  const history = Array.isArray(payload.conversationHistory) ? payload.conversationHistory : [];
  const context = { ...(payload.context || {}) };
  const combinedText = history.map(entry => `${entry?.role || ''} ${entry?.text || ''}`).join(' ');
  const mergedText = `${payload.query || ''} ${combinedText}`.trim();

  if (!context.orderId) {
    context.orderId = extractOrderId(mergedText) || extractOrderId(payload.query || '');
  }

  if (!context.customerEmail) {
    context.customerEmail = extractCustomerEmail(mergedText) || extractCustomerEmail(payload.query || '');
  }

  if (context.orderId && !context.approvedRefund) {
    const order = orders.find(item => item.orderId === context.orderId);
    if (order) {
      const period = returnPeriodFor(order.category);
      context.approvedRefund = !!period && order.daysAgo <= period;
    }
  }

  const recentHistoryText = history.map(entry => String(entry?.text || '')).join(' ');
  const recentIntent = /refund policy|return policy|refund|return/i.test(recentHistoryText) ? 'refund-policy' : null;
  context.lastIntent = recentIntent || context.lastIntent || null;

  return context;
}

function policyAnswerFor(text) {
  const lower = String(text).toLowerCase();
  const electronicsDays = Number((policy.match(/electronics have a (\d+)-day/i) || [])[1] || 15);
  const otherDays = Number((policy.match(/other product categories have a (\d+)-day/i) || [])[1] || 30);
  const isElectronicsQuestion = /(laptop|phone|tablet|macbook|iphone|android|electronics|device|computer)/i.test(lower);
  const hasDays = lower.match(/\b(\d+)\b/);
  const days = hasDays ? Number(hasDays[1]) : null;

  if (/(return policy|refund policy|policy)/i.test(lower)) {
    return `Our return policy is straightforward: electronics must be returned within ${electronicsDays} days of purchase, while other product categories have ${otherDays} days. Refunds are reviewed based on the item category and purchase date.`;
  }

  if (days !== null) {
    const limit = isElectronicsQuestion ? electronicsDays : otherDays;
    const subject = isElectronicsQuestion ? 'electronics' : 'other products';
    if (days > limit) {
      return `For ${subject}, ${days} days is outside the ${limit}-day return window. If the item is an electronic device such as a laptop, phone, or tablet, the return period is ${electronicsDays} days.`;
    }
    return `For ${subject}, ${days} days is within the ${limit}-day return window. The final decision depends on the product category and purchase details.`;
  }

  if (isElectronicsQuestion) {
    return `For electronic items such as laptops, phones, and tablets, the return window is ${electronicsDays} days from purchase. Other product categories have ${otherDays} days.`;
  }

  return `Our return policy depends on the product category. Electronics must be returned within ${electronicsDays} days, and other product categories have ${otherDays} days.`;
}

function getGeminiConfig() {
  const geminiKey = String(process.env.GEMINI_API_KEY || '').trim();
  if (geminiKey) return { key: geminiKey, source: 'GEMINI_API_KEY' };

  const googleKey = String(process.env.GOOGLE_API_KEY || '').trim();
  if (googleKey) return { key: googleKey, source: 'GOOGLE_API_KEY' };

  return { key: null, source: null };
}

function isProductQuestion(text) {
  return /product|catalog|stock|inventory|price|cost|available|in stock|headphones|laptop|phone|tablet|macbook|sony|apple/i.test(String(text));
}

function isPolicyQuestion(text) {
  return /(?:return|refund|company)\s+policy|policy|rules|how long|what(?: is| are) the?\s+(?:return|refund)|return window|eligible for a refund/i.test(String(text));
}

function isRefundRequest(text) {
  const value = String(text);
  return /refund|return|money back/i.test(value) && !isPolicyQuestion(value);
}

function isEmailActionRequest(text) {
  return /(?:send|email|mail).*(?:confirmation|order)|confirmation.*(?:email|mail)|send email/i.test(String(text));
}

async function geminiAnswer(query, context) {
  const { key } = getGeminiConfig();
  if (!key) return null;

  try {
    const client = new GoogleGenerativeAI(key);
    const model = client.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(`You are Alexa, TechMart customer support. Answer only from the verified context. Never invent prices, stock, order details, or policy. Informational policy questions must receive a text answer only and must never trigger email sending. Email sending is allowed only for an explicitly approved refund or an explicit confirmation-email request. If context does not answer the question, say that clearly.\n\nVerified context:\n${context}\n\nCustomer question: ${query}`);
    return result.response?.text?.() || null;
  } catch (error) {
    return null;
  }
}

async function logInteraction(record) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.GOOGLE_SHEETS_WEBHOOK;
  if (!webhookUrl) return 'Not configured: Google Sheets logging needs a server-side webhook or service-account integration.';

  try {
    const response = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) });
    return response.ok ? 'Saved' : 'Failed';
  } catch (error) {
    return 'Failed';
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed.' });
  const body = req.body || {};
  const { query, customerEmail } = body;
  const conversationContext = resolveContextFromRequest(body);
  if (!query || !String(query).trim()) return res.status(400).json({ message: 'A customer question is required.' });

  const text = String(query).trim();
  const order = findOrder(text) || (conversationContext.orderId ? orders.find(item => item.orderId === conversationContext.orderId) : null);
  const isPolicyQuestionIntent = isPolicyQuestion(text);
  const isRefund = isRefundRequest(text);
  const isPolicy = /return|refund|shipping|warranty|exchange|support|policy/i.test(text);
  const emailActionRequested = isEmailActionRequest(text);
  const policyTopic = text.match(/shipping|warranty|exchange|support|return|refund|policy/i)?.[0];
  const policyCoversTopic = !policyTopic || new RegExp(policyTopic, 'i').test(policy);
  const matches = productMatches(text);
  const context = [order ? orderText(order) : '', matches.length ? productText(matches) : '', isPolicy && policyCoversTopic ? policy : ''].filter(Boolean).join('\n\n');

  if (order && isRefund) {
    const period = returnPeriodFor(order.category);
    if (!period) return res.status(503).json({ message: "I'm unable to access that information right now. Please try again shortly.", status: 'Unavailable' });
    const eligible = order.daysAgo <= period;
    const log = { timestamp: new Date().toISOString(), customer: order.customer, order_id: order.orderId, query: text, action: 'Refund Request', status: eligible ? 'Approved' : 'Rejected' };
    const logStatus = await logInteraction(log);
    if (!eligible) return res.status(200).json({ message: `Refund request rejected for ${order.orderId}. It was purchased ${order.daysAgo} days ago, beyond the ${period}-day ${order.category} return period. No confirmation email was sent.`, status: 'Rejected', log: logStatus, context: { orderId: order.orderId, approvedRefund: false } });

    const resolvedEmail = customerEmail || conversationContext.customerEmail || null;
    if (!resolvedEmail) return res.status(200).json({ message: `Order ${order.orderId} is eligible for a refund. Please provide a customer email to send the confirmation.`, status: 'Approved', log: logStatus, context: { orderId: order.orderId, approvedRefund: true } });

    if (!getGmailCredentials()) return res.status(503).json({ message: "I'm unable to send the confirmation email right now. Please try again shortly.", status: 'Approved', email: 'Not sent', log: logStatus, context: { orderId: order.orderId, approvedRefund: true, customerEmail: resolvedEmail } });
    try {
      await sendRefundConfirmation({ order, to: resolvedEmail });
    } catch (error) {
      return res.status(502).json({ message: "I'm unable to send the confirmation email right now. Please try again shortly.", status: 'Approved', email: 'Not sent', log: logStatus, context: { orderId: order.orderId, approvedRefund: true, customerEmail: resolvedEmail } });
    }
    return res.status(200).json({ message: `Refund approved for ${order.orderId}. Confirmation email sent.`, status: 'Approved', email: 'Sent', log: logStatus, context: { orderId: order.orderId, customerEmail: resolvedEmail, approvedRefund: true } });
  }

  if (emailActionRequested || (/^yes$/i.test(text) && conversationContext.approvedRefund === true)) {
    const orderId = conversationContext.orderId || extractOrderId(text);
    if (!orderId) {
      return res.status(200).json({ message: 'Which order would you like the confirmation email for?', context: { orderId: null, approvedRefund: false } });
    }
    const order = orders.find(item => item.orderId === orderId);
    if (!order) return res.status(404).json({ message: `Order ${orderId} was not found.`, context: { orderId, approvedRefund: false } });
    const period = returnPeriodFor(order.category);
    const eligible = !!period && order.daysAgo <= period;
    const resolvedEmail = customerEmail || conversationContext.customerEmail || null;
    if (!eligible) return res.status(200).json({ message: `The refund for ${orderId} is not eligible, so no confirmation email can be sent.`, status: 'Rejected', context: { orderId, approvedRefund: false } });
    if (!resolvedEmail) return res.status(200).json({ message: `I can send the confirmation email for ${orderId} once a customer email is available.`, status: 'Approved', context: { orderId, approvedRefund: true } });
    if (!getGmailCredentials()) return res.status(503).json({ message: "I'm unable to send the confirmation email right now. Please try again shortly.", status: 'Approved', email: 'Not sent', context: { orderId, approvedRefund: true, customerEmail: resolvedEmail } });
    try {
      await sendRefundConfirmation({ order, to: resolvedEmail });
    } catch (error) {
      return res.status(502).json({ message: "I'm unable to send the confirmation email right now. Please try again shortly.", status: 'Approved', email: 'Not sent', context: { orderId, approvedRefund: true, customerEmail: resolvedEmail } });
    }
    return res.status(200).json({ message: `The confirmation email for ${order.orderId} has been sent.`, status: 'Approved', email: 'Sent', context: { orderId: order.orderId, customerEmail: resolvedEmail, approvedRefund: true } });
  }

  if (!isPolicy && /order|track|status|where is my|check my order/i.test(text) && !/ORD-\d+/i.test(text) && !conversationContext.orderId) {
    await logInteraction({ timestamp: new Date().toISOString(), customer: 'Website visitor', order_id: '', query: text, action: 'Order Lookup', status: 'Order ID Required' });
    return res.status(200).json({ message: 'Please provide your order ID, for example ORD-101, so I can check only that order.' });
  }

  if (!isPolicy && /order|track|status|where is my|check my order/i.test(text) && /ORD-\d+/i.test(text)) {
    if (!order) return res.status(404).json({ message: `Order ${text.match(/ORD-\d+/i)[0].toUpperCase()} was not found.` });
    await logInteraction({ timestamp: new Date().toISOString(), customer: order.customer, order_id: order.orderId, query: text, action: 'Order Lookup', status: order.status });
    return res.status(200).json({ message: orderText(order), status: order.status, context: { orderId: order.orderId } });
  }

  if (conversationContext.orderId && /what (about|did i order|is the order)|this order|how long.*(take|refund|return)|how long does it take/i.test(text)) {
    const currentOrder = orders.find(item => item.orderId === conversationContext.orderId);
    if (!currentOrder) return res.status(404).json({ message: `Order ${conversationContext.orderId} was not found.`, context: { orderId: conversationContext.orderId, approvedRefund: false } });
    if (/what (about|did i order|is the order)|this order/i.test(text)) {
      return res.status(200).json({ message: orderText(currentOrder), status: currentOrder.status, context: { orderId: currentOrder.orderId } });
    }
    if (/how long.*(take|refund|return)|how long does it take/i.test(text)) {
      return res.status(200).json({ message: policyAnswerFor('What is the refund policy?'), context: { orderId: currentOrder.orderId } });
    }
  }

  if (!isPolicy && /how long.*(take|refund|return)|how long does it take/i.test(text)) {
    const lastIntent = conversationContext.lastIntent || '';
    if (/refund|return|policy/.test(lastIntent) || /refund|return|policy/.test(String(query || ''))) {
      return res.status(200).json({ message: policyAnswerFor('What is the refund policy?'), context: { orderId: conversationContext.orderId || null, customerEmail: conversationContext.customerEmail || null, approvedRefund: conversationContext.approvedRefund || false, lastIntent: 'refund-policy' } });
    }
  }

  if (isPolicy || isPolicyQuestionIntent) {
    await logInteraction({ timestamp: new Date().toISOString(), customer: 'Website visitor', order_id: '', query: text, action: 'Policy Question', status: 'Answered' });
    return res.status(200).json({ message: policyAnswerFor(text) });
  }

  const productContext = isProductQuestion(text) ? productText(products) : matches.length ? productText(matches) : '';
  const verifiedContext = [order ? orderText(order) : '', productContext, isPolicy && policyCoversTopic ? policy : ''].filter(Boolean).join('\n\n');
  const answer = verifiedContext && (!isPolicy || policyCoversTopic) ? await geminiAnswer(text, verifiedContext).catch(() => null) : null;
  if (answer) {
    await logInteraction({ timestamp: new Date().toISOString(), customer: 'Website visitor', order_id: order?.orderId || '', query: text, action: 'AI Support Question', status: 'Answered' });
    return res.status(200).json({ message: answer, context: { orderId: conversationContext.orderId || order?.orderId || null, customerEmail: conversationContext.customerEmail || null, approvedRefund: conversationContext.approvedRefund || false } });
  }
  if (matches.length || isProductQuestion(text)) {
    await logInteraction({ timestamp: new Date().toISOString(), customer: 'Website visitor', order_id: '', query: text, action: 'Product Search', status: 'Answered' });
    return res.status(200).json({ message: productText(isProductQuestion(text) ? products : matches), context: { orderId: conversationContext.orderId || null, customerEmail: conversationContext.customerEmail || null, approvedRefund: conversationContext.approvedRefund || false } });
  }
  return res.status(200).json({ message: "I'm unable to access that information right now. Please try again shortly.", context: { orderId: conversationContext.orderId || null, customerEmail: conversationContext.customerEmail || null, approvedRefund: conversationContext.approvedRefund || false } });
};

module.exports.resolveContextFromRequest = resolveContextFromRequest;
module.exports.geminiAnswer = geminiAnswer;
module.exports.policyAnswerFor = policyAnswerFor;
module.exports.getGeminiConfig = getGeminiConfig;
module.exports.GEMINI_MODEL = GEMINI_MODEL;
module.exports.productMatches = productMatches;
module.exports.productText = productText;
module.exports.isProductQuestion = isProductQuestion;
module.exports.isPolicyQuestion = isPolicyQuestion;
module.exports.isRefundRequest = isRefundRequest;
module.exports.isEmailActionRequest = isEmailActionRequest;
