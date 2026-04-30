#!/usr/bin/env node
const https = require('https');
const http = require('http');
const crypto = require('crypto');

const urlArg = process.argv[2] || process.env.WEBHOOK_URL;
const secret = process.argv[3] || process.env.WEBHOOK_SECRET || '';
if (!urlArg) {
  console.error('Usage: node send_test_webhook.js <WEBHOOK_URL> [WEBHOOK_SECRET]');
  process.exit(2);
}

const payloadObj = {
  action: 'test.created',
  api_version: 'v1',
  application_id: '953127223334497',
  date_created: new Date().toISOString(),
  id: String(Math.floor(Math.random()*1000000)),
  live_mode: false,
  type: 'test',
  user_id: 138223822,
  data: { id: String(Math.floor(Math.random()*1000000)) }
};

const payload = JSON.stringify(payloadObj);
const sig = secret ? crypto.createHmac('sha256', secret).update(payload).digest('hex') : '';

const target = new URL(urlArg);
const isHttps = target.protocol === 'https:';
const options = {
  hostname: target.hostname,
  port: target.port || (isHttps ? 443 : 80),
  path: target.pathname + (target.search || ''),
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    ...(secret ? { 'x-hub-signature-256': `sha256=${sig}` } : {})
  }
};

const client = isHttps ? https : http;

const req = client.request(options, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log('HEADERS', res.headers);
    console.log('BODY', data);
    console.log('\nPayload sent:', payload);
  });
});

req.on('error', (err) => {
  console.error('Request error:', err.message);
});

req.write(payload);
req.end();
