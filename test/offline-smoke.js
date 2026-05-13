#!/usr/bin/env node

const assert = require('assert');
const http = require('http');

const Hlquery = require('..');
const Client = require('../lib/Client');
const Request = require('../lib/Request');
const Response = require('../lib/Response');
const Config = require('../utils/Config');
const Validator = require('../utils/Validator');

async function main() {
  assert.strictEqual(typeof Hlquery, 'function', 'default export should be the Client constructor');
  assert.strictEqual(Hlquery.Client, Client, 'named Client export should match default export');

  assert.strictEqual(Config.normalizeUrl('localhost:9200/'), 'http://localhost:9200');
  assert.strictEqual(Config.isValidUrl('http://localhost:9200'), true);
  assert.strictEqual(Config.isValidUrl('notaurl'), false);

  Validator.validateCollectionName('books');
  Validator.validateDocumentId('doc_123');
  Validator.validateSearchParams({ limit: 10, offset: 0 });

  assert.throws(() => Validator.validateCollectionName('123bad'), /letter or underscore/);
  assert.throws(() => Validator.validateDocumentFields({ title: 'bad,value' }), /comma/);

  const response = new Response(200, { ok: true }, { 'content-type': 'application/json' });
  assert.strictEqual(response.isSuccess(), true);
  assert.deepStrictEqual(response.getBody(), { ok: true });

  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    if (req.url === '/echo-auth') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        authorization: req.headers.authorization || null,
        apiKey: req.headers['x-api-key'] || null
      }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found' }));
  });

  await new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', (err) => (err ? reject(err) : resolve()));
  });

  const { port } = server.address();

  try {
    const request = new Request(`http://127.0.0.1:${port}`);
    const health = await request.execute('GET', '/health');
    assert.strictEqual(health.getStatusCode(), 200);
    assert.deepStrictEqual(health.getBody(), { status: 'ok' });

    request.setAuthToken('secret-token', 'bearer');
    const bearerEcho = await request.execute('GET', '/echo-auth');
    assert.strictEqual(bearerEcho.getBody().authorization, 'Bearer secret-token');

    request.setAuthToken('scoped-key', 'api-key');
    const apiKeyEcho = await request.execute('GET', '/echo-auth');
    assert.strictEqual(apiKeyEcho.getBody().apiKey, 'scoped-key');

    const client = new Client(`http://127.0.0.1:${port}`);
    const clientHealth = await client.health();
    assert.strictEqual(clientHealth.isSuccess(), true);
    assert.deepStrictEqual(clientHealth.getBody(), { status: 'ok' });

    assert.strictEqual(typeof client.sql, 'function');
    assert.strictEqual(typeof client.execSql, 'function');
    assert.strictEqual(typeof client.sqlSearch, 'function');
    assert.strictEqual(typeof client.sam().search, 'function');
    assert.strictEqual(typeof client.sam().searchAll, 'function');
    assert.strictEqual(typeof client.sam().rebuild, 'function');
    assert.strictEqual(typeof client.sam().status, 'function');
    assert.strictEqual(typeof client.sam().debug, 'function');
    assert.strictEqual(typeof client.sam().history, 'function');
    assert.strictEqual(typeof client.sam().pause, 'function');
    assert.strictEqual(typeof client.sam().clearPause, 'function');
    assert.strictEqual(typeof client.sam().listDocuments, 'function');
    assert.strictEqual(typeof client.sam().getDocument, 'function');
    assert.strictEqual(typeof client.sam().openDocument, 'function');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  process.stdout.write('Node offline smoke tests passed.\n');
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
