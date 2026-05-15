<div align="center">
  <img src="https://docs.hlquery.com/img/hlquery/2.png" alt="hlquery logo" width="200">
</div>

<div align="center">

**A modular Node.js client library for hlquery, designed with a familiar and intuitive API structure.**

[![Follow hlquery](https://img.shields.io/badge/Follow-%40hlquery-blue?logo=x&logoColor=white)](https://x.com/hlquery)
[![Commit Activity](https://img.shields.io/github/commit-activity/m/hlquery/node-api)](https://github.com/hlquery/node-api/pulse)
[![GitHub](https://img.shields.io/badge/GitHub-node--api-181717?logo=github&logoColor=white)](https://github.com/hlquery/node-api/stargazers)
[![hlquery](https://img.shields.io/badge/GitHub-hlquery-blue?logo=github&logoColor=white)](https://github.com/hlquery/hlquery/stargazers)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

</div>

### What is the hlquery Node.js API?

The hlquery Node.js API is the official Node.js client for hlquery. It wraps the REST interface in a modular service-style client with helpers for collections, documents, search, SQL, and SAM.

It is a good fit for backend services, scripts, dashboards, and apps that want hlquery integration without repeating request code.

### Why use it?

Use the Node.js client when you want hlquery calls to read like regular application code. The client is organized around familiar modules such as `client.collections()`, `client.documents()`, and `client.sam()`, so collection management, document indexing, search, SQL, and SAM workflows stay easy to find.

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
console.log(collections.getBody());
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

/* Print the server status response body. */
console.log(status.getBody());
/* Print the health response body. */
console.log(health.getBody());
/* Print the runtime configuration response body. */
console.log(etc.getBody());
/* Print the configured cluster links response body. */
console.log(links.getBody());
/* Print the link ping response body. */
console.log(ping.getBody());
/* Print the link connect response body. */
console.log(connect.getBody());
/* Print the link disconnect response body. */
console.log(disconnect.getBody());
/* Print the flush response body. */
console.log(flush.getBody());
/* Print the custom route response body. */
console.log(response.getBody());
```

### SAM

SAM is separate from vector search. It performs term and intent-style lookup, not vector similarity search.

```javascript
const sam = client.sam();

const status = await sam.status('books');
const history = await sam.history('books', 5);
const results = await sam.search('books', 'distributed systems', {
  limit: 10
});

/* Print the SAM status response body. */
console.log(status.getBody());
/* Print the SAM search history response body. */
console.log(history.getBody());
/* Print the SAM search results response body. */
console.log(results.getBody());
```

### SQL

```javascript
const rows = await client.sql('SHOW COLLECTIONS;');
const execResult = await client.execSql(
  "INSERT INTO logs_archive (id, title) VALUES ('row-1', 'warm cache');"
);
const books = await client.sqlSearch(
  'books',
  'SELECT id, title FROM books ORDER BY title ASC LIMIT 3;'
);

/* Print the SQL query response body. */
console.log(rows.getBody());
/* Print the SQL execution response body. */
console.log(execResult.getBody());
/* Print the collection SQL search response body. */
console.log(books.getBody());
```

### Reduce Text Example

Use the raw request helper for custom module routes:

```javascript
const response = await client.executeRequest('GET', '/modules/<name>/<route>', null, {
  q: 'example query'
});

/* Print the custom module route response body. */
console.log(response.getBody());
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
