const path = require('path');
const dotenv = require('dotenv');

for (const envFile of [path.join(__dirname, '.env.local'), path.join(__dirname, '.env')]) {
  dotenv.config({ path: envFile });
}

const http = require('http');
const fs = require('fs');
const { URL } = require('url');

const root = __dirname;
const port = process.env.PORT || 3000;

const chatHandler = require('./api/chat');
const refundHandler = require('./api/refund');
const getGeminiConfig = chatHandler.getGeminiConfig;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function healthStatus() {
  const geminiConfig = getGeminiConfig();
  const hasGeminiKey = Boolean(geminiConfig.key);
  const hasGmailCredentials = Boolean(String(process.env.GMAIL_EMAIL || '').trim() && String(process.env.GMAIL_APP_PASSWORD || '').trim());
  const hasSheetsWebhook = Boolean(String(process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.GOOGLE_SHEETS_WEBHOOK || '').trim());

  return {
    status: hasGeminiKey ? 'ok' : 'degraded',
    checks: {
      chatAi: hasGeminiKey,
      refundEmail: hasGmailCredentials,
      sheetsLogging: hasSheetsWebhook
    },
    aiKeySource: geminiConfig.source
  };
}

function attachResponseHelpers(res) {
  if (!res.status) {
    res.status = function (code) {
      this.statusCode = code;
      return this;
    };
  }

  if (!res.json) {
    res.json = function (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      this.writeHead(this.statusCode || 200, { 'Content-Type': 'application/json; charset=utf-8' });
      this.end(payload);
      return this;
    };
  }

  if (!res.send) {
    res.send = function (body) {
      this.writeHead(this.statusCode || 200, { 'Content-Type': 'text/plain; charset=utf-8' });
      this.end(body);
      return this;
    };
  }
}

function serveFile(res, filePath) {
  const safePath = path.normalize(filePath);
  if (!safePath.startsWith(root)) {
    sendJson(res, 403, { message: 'Forbidden' });
    return;
  }

  fs.readFile(safePath, (err, data) => {
    if (err) {
      sendJson(res, 404, { message: 'Not found' });
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (pathname === '/api/health' || pathname === '/api/health/') {
    if (req.method !== 'GET') return sendJson(res, 405, { message: 'Method not allowed.' });
    const health = healthStatus();
    return sendJson(res, health.status === 'ok' ? 200 : 503, health);
  }

  if (pathname === '/api/chat' || pathname === '/api/chat/') {
    attachResponseHelpers(res);
    if (req.method !== 'POST') return sendJson(res, 405, { message: 'Method not allowed.' });
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        req.body = parsed;
        await chatHandler(req, res);
      } catch (error) {
        res.statusCode = 400;
        res.json({ message: 'Invalid JSON body.' });
      }
    });
    return;
  }

  if (pathname === '/api/refund' || pathname === '/api/refund/') {
    attachResponseHelpers(res);
    if (req.method !== 'POST') return sendJson(res, 405, { message: 'Method not allowed.' });
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        req.body = parsed;
        await refundHandler(req, res);
      } catch (error) {
        res.statusCode = 400;
        res.json({ message: 'Invalid JSON body.' });
      }
    });
    return;
  }

  if (pathname === '/' || pathname === '/index.html') {
    return serveFile(res, path.join(root, 'techmart_alexa_ai_customer_support_workspace', 'code.html'));
  }

  if (pathname.startsWith('/techmart_alexa_ai_customer_support_workspace/')) {
    return serveFile(res, path.join(root, pathname.replace(/^\//, '')));
  }

  const normalizedPath = path.normalize(path.join(root, pathname.replace(/^\//, '')));
  if (normalizedPath.startsWith(root) && fs.existsSync(normalizedPath) && fs.statSync(normalizedPath).isFile()) {
    return serveFile(res, normalizedPath);
  }

  sendJson(res, 404, { message: 'Not found' });
});

server.listen(port, () => {
  console.log(`TechMart AI support server running at http://localhost:${port}`);
});
