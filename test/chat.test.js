const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');

test('frontend context updater uses the active conversation state without a typo', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'techmart_alexa_ai_customer_support_workspace', 'code.html'), 'utf8');
  assert.ok(html.includes('Object.prototype.hasOwnProperty.call(data.context'));
  assert.ok(html.includes('conversationContext={...conversationContext,...data.context};'));
});

test('chat AI helper returns null when no Gemini key is configured', async () => {
  const chatMod = require('../api/chat');
  const original = process.env.GEMINI_API_KEY;
  const originalGoogleKey = process.env.GOOGLE_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GOOGLE_API_KEY;

  try {
    const result = await chatMod.geminiAnswer('What is the return policy?', 'Verified policy');
    assert.equal(result, null);
  } finally {
    if (original !== undefined) process.env.GEMINI_API_KEY = original;
    if (originalGoogleKey !== undefined) process.env.GOOGLE_API_KEY = originalGoogleKey;
  }
});

test('Gemini config prioritizes a non-empty GEMINI_API_KEY, then GOOGLE_API_KEY', () => {
  const chatMod = require('../api/chat');
  const original = process.env.GEMINI_API_KEY;
  const originalGoogleKey = process.env.GOOGLE_API_KEY;

  try {
    process.env.GEMINI_API_KEY = '  gemini-key  ';
    process.env.GOOGLE_API_KEY = 'google-key';
    assert.deepEqual(chatMod.getGeminiConfig(), { key: 'gemini-key', source: 'GEMINI_API_KEY' });

    process.env.GEMINI_API_KEY = '   ';
    assert.deepEqual(chatMod.getGeminiConfig(), { key: 'google-key', source: 'GOOGLE_API_KEY' });
  } finally {
    if (original !== undefined) process.env.GEMINI_API_KEY = original;
    else delete process.env.GEMINI_API_KEY;
    if (originalGoogleKey !== undefined) process.env.GOOGLE_API_KEY = originalGoogleKey;
    else delete process.env.GOOGLE_API_KEY;
  }
});

test('Gemini uses the requested Google AI Studio model', () => {
  const chatMod = require('../api/chat');
  assert.equal(chatMod.GEMINI_MODEL, 'gemini-3.6-flash');
});

test('policy questions never route as refund requests', () => {
  const chatMod = require('../api/chat');
  assert.equal(chatMod.isPolicyQuestion('What is the return policy?'), true);
  assert.equal(chatMod.isRefundRequest('What is the return policy for ORD-101?'), false);
  assert.equal(chatMod.isRefundRequest('I want a refund for ORD-101'), true);
});

test('email routing requires an explicit request or approved refund context', () => {
  const chatMod = require('../api/chat');
  assert.equal(chatMod.isEmailActionRequest('Please send the confirmation email'), true);
  assert.equal(chatMod.isEmailActionRequest('Tell me the refund policy'), false);
});