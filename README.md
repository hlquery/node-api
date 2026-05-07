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

- Familiar modular layout such as `client.collections()`, `client.documents()`, and `client.sam()`.
- Consistent auth, params, and parsed responses.
- Good default coverage for common hlquery workflows.
- Raw request access for custom routes.

### Why choose it over raw HTTP?

Choose the Node.js client over raw HTTP when you want less repetitive `fetch` or `axios` boilerplate, cleaner handling for auth headers and endpoint paths, and search or indexing code that stays easier to read.

### Install

```bash
npm install hlquery-node-client
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
console.log('status:', health.getStatusCode());

const collections = await client.collections().list(0, 10);
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

### SAM

SAM is separate from vector search. It performs term and intent-style lookup, not vector similarity search.

```javascript
const sam = client.sam();

const status = await sam.status('books');
const history = await sam.history('books', 5);
const results = await sam.search('books', 'distributed systems', {
  limit: 10
});

console.log(status.getBody());
console.log(history.getBody());
console.log(results.getBody());
```

### SQL

```javascript
const sql = client.sql();

const rows = await sql.query('SHOW COLLECTIONS;');
const books = await sql.search(
  'books',
  'SELECT id, title FROM books ORDER BY title ASC LIMIT 3;'
);

console.log(rows.getBody());
console.log(books.getBody());
```

### Reduce Text Example

Use the raw request helper for custom module routes:

```javascript
const response = await client.executeRequest('GET', '/modules/<name>/<route>', null, {
  q: 'example query'
});

console.log(response.getBody());
```

### Notes

- CSV support is built in.
- Local PDF helpers and ranking helpers are available elsewhere in the client.
- See `etc/api/node/examples/` for runnable examples.
