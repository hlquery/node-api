<div align="center">
  <img src="https://docs.hlquery.com/img/hlquery/2.png" alt="hlquery logo" width="200">
</div>

<div align="center">

**A modular Node.js client library for hlquery, designed with a familiar and intuitive API structure.**

[![Follow hlquery](https://img.shields.io/badge/Follow-%40hlquery-blue?logo=x&logoColor=white&labelColor=000000)](https://x.com/hlquery)
[![Node build](https://img.shields.io/badge/Node%20build-passing-brightgreen?logo=node.js&logoColor=white&labelColor=000000)](https://github.com/hlquery/node-api/actions/workflows/ci.yml)
[![node-api](https://img.shields.io/badge/GitHub-node--api-purple?logo=github&logoColor=white&labelColor=000000)](https://github.com/hlquery/node-api)
[![hlquery](https://img.shields.io/badge/GitHub-hlquery-blue?logo=github&logoColor=white&labelColor=000000)](https://github.com/hlquery/hlquery)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-a35a0f?logo=open-source-initiative&logoColor=white&labelColor=000000)](https://opensource.org/licenses/BSD-3-Clause)

</div>

### What is the hlquery Node.js API?

The hlquery Node.js API is the official Node.js client for [hlquery](https://github.com/hlquery/hlquery). It wraps the REST interface in a modular service-style client with helpers for collections, documents, search, and SQL.

It is a good fit for backend services, scripts, dashboards, and apps that want hlquery integration without repeating request code.

### Why use it?

Use the Node.js client when you want hlquery calls to read like regular application code. The client is organized around familiar modules such as `client.collections()` and `client.documents()`, with Redis-style dynamic route helpers for module APIs and custom endpoints.

It also keeps the repetitive parts in one place: authentication, request parameters, endpoint paths, and parsed responses are handled consistently across the client. Common hlquery workflows are covered by default, while raw request access is still available when you need a custom route.

### Install

```bash
$ npm install hlquery-node-client
```

For local development inside this repository:

```javascript
const Client = require('./lib/Client');
```

### Quick Start

```javascript
const Client = require('hlquery-node-client');

const client = new Client(process.env.HLQ_BASE_URL || process.env.HLQUERY_BASE_URL || 'http://localhost:9200', {
  token: process.env.HLQ_TOKEN,
  auth_method: 'bearer'
});

const health = await client.system().health();

/* Print the HTTP status code from the health response. */
console.log('status:', health.getStatusCode());

const collections = await client.collections().list(0, 10);

/* Print the collection list response body. */
console.log(collections.body);
```

### Auth

```javascript
const client = new Client('http://localhost:9200', {
  token: 'your_token_here',
  auth_method: 'bearer'
});

client.setAuthToken('your_token_here', 'bearer');
client.setAuthToken('your_api_key_here', 'api-key');
```

### Operational routes

The client includes wrappers for the common server and cluster routes used by dashboards, scripts, and maintenance jobs:

```javascript
const status = await client.status();
const health = await client.health();
const etc = await client.etc();

const links = await client.links();
const ping = await client.linksPing();
const connect = await client.linksConnect('http://node-b:9200');
const disconnect = await client.linksDisconnect('http://node-b:9200');

const flush = await client.flush();
```

Routes that do not have a dedicated wrapper can still be called through `executeRequest()`:

```javascript
const response = await client.executeRequest('GET', '/modules/<name>/<route>', null, {
  q: 'example query'
});

console.log(response.body);
```

For module routes and custom endpoints, the client also supports a Redis-style fluent API:

```javascript
const result = await client.module('<name>').route('<route>').get({
  q: 'example query'
});

console.log(result.body);

const indexed = await client.module('<name>').route('index').post({
  id: 'doc_1',
  title: 'Example'
});

const modules = await client.modules().list();
const syntax = await client.modules().syntax('<name>');
const raw = await client.route('etc').get();

console.log(indexed.body);
console.log(modules.body);
console.log(syntax.body);
console.log(raw.body);
```

### SQL

```javascript
const rows = await client.sql('SHOW COLLECTIONS;');
const execResult = await client.execSql(
  "INSERT INTO books (id, title) VALUES ('book_4', 'Inserted via SQL');"
);
const books = await client.sqlSearch(
  'books',
  'SELECT id, title FROM books ORDER BY title ASC LIMIT 3;'
);

/* Print the SQL query response body. */
console.log(rows.body);
/* Print the SQL execution response body. */
console.log(execResult.body);
/* Print the collection SQL search response body. */
console.log(books.body);
```

### Contributing

We welcome contributions from the community! All contributions must be released under the BSD 3-Clause license.

### How to Contribute

- Check existing [issues](https://github.com/hlquery/hlquery/issues) or create new ones
- Contribute to client libraries (Node.js, Go, Java, Python, PHP, Ruby, Rust, Perl, C++)
- Test and report bugs
- Improve documentation

### Community

- 📖 [Documentation](https://docs.hlquery.com)
- 🐦 [X (Twitter)](https://x.com/hlquery)
- 📦 [GitHub](https://github.com/hlquery/hlquery)

### License

hlquery is licensed under the [BSD 3-Clause License](https://opensource.org/licenses/BSD-3-Clause).
