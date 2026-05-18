#!/usr/bin/env node

const assert = require('assert');
const http = require('http');

const Hlquery = require('..');
const Client = require('../lib/Client');
const Request = require('../lib/Request');
const Response = require('../lib/Response');
const Config = require('../utils/Config');
const Validator = require('../utils/Validator');
const CSVParser = require('../utils/CSVParser');

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
  assert.throws(() => Validator.validateSearchParams(null), /object/);
  assert.throws(() => Validator.validateSearchParams({ limit: NaN }), /positive integer/);
  assert.throws(() => Validator.validateSearchParams({ offset: 1.5 }), /non-negative integer/);
  assert.throws(() => Validator.validateDocumentFields({ title: 'bad,value' }), /comma \(\,\)/);
  assert.throws(() => CSVParser.parseCSV('a||b', '||'), /single character/);

  const response = new Response(200, { ok: true }, { 'content-type': 'application/json' });
  assert.strictEqual(response.isSuccess(), true);
  assert.deepStrictEqual(response.getBody(), { ok: true });

  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    if (req.url === '/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ready' }));
      return;
    }

    if (req.url === '/etc') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ protocol: 'http' }));
      return;
    }

    if (req.url === '/links') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ links: [] }));
      return;
    }

    if (req.url === '/links/ping') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (req.url === '/links/connect' && req.method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ connected: true }));
      return;
    }

    if (req.url === '/links/disconnect' && req.method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ disconnected: true }));
      return;
    }

    if (req.url === '/flush' && req.method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ flushed: true }));
      return;
    }

    if (req.url.startsWith('/echo-auth')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        authorization: req.headers.authorization || null,
        apiKey: req.headers['x-api-key'] || null,
        contentType: req.headers['content-type'] || null,
        url: req.url
      }));
      return;
    }

    if (req.url === '/keys/key%2Fwith%20space') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: 'key/with space' }));
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

    const queryEcho = await request.execute('GET', '/echo-auth', undefined, {
      fields: ['title', 'body'],
      filter: { published: true },
      skip: null
    });
    assert.strictEqual(queryEcho.getBody().contentType, null);
    assert.match(queryEcho.getBody().url, /fields=title%2Cbody/);
    assert.match(queryEcho.getBody().url, /filter=%7B%22published%22%3Atrue%7D/);
    assert.doesNotMatch(queryEcho.getBody().url, /skip=/);

    const client = new Client(`http://127.0.0.1:${port}`);
    const clientHealth = await client.health();
    assert.strictEqual(clientHealth.isSuccess(), true);
    assert.deepStrictEqual(clientHealth.getBody(), { status: 'ok' });

    const clientStatus = await client.status();
    assert.deepStrictEqual(clientStatus.getBody(), { status: 'ready' });

    const clientEtc = await client.etc();
    assert.deepStrictEqual(clientEtc.getBody(), { protocol: 'http' });

    const clientLinks = await client.links();
    assert.deepStrictEqual(clientLinks.getBody(), { links: [] });

    const clientLinksPing = await client.linksPing();
    assert.deepStrictEqual(clientLinksPing.getBody(), { ok: true });

    const clientLinksConnect = await client.linksConnect('http://node-b:9200');
    assert.deepStrictEqual(clientLinksConnect.getBody(), { connected: true });

    const clientLinksDisconnect = await client.linksDisconnect('http://node-b:9200');
    assert.deepStrictEqual(clientLinksDisconnect.getBody(), { disconnected: true });

    const clientFlush = await client.flush();
    assert.deepStrictEqual(clientFlush.getBody(), { flushed: true });

    assert.strictEqual(typeof client.executeRequest, 'function');
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
    await assert.rejects(() => client.sam().history(null, 0), /positive integer/);
    await assert.rejects(() => client.sam().listDocuments('books', NaN, 20), /non-negative integer/);

    const keyResponse = await client.keys().get('key/with space');
    assert.deepStrictEqual(keyResponse.getBody(), { id: 'key/with space' });
    await assert.rejects(() => client.documents().import('books', { id: 'not-array' }), /array/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  process.stdout.write('Node offline smoke tests passed.\n');
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
