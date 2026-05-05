<div align="center">
  <img src="https://docs.hlquery.com/img/hlquery/2.png" alt="hlquery logo" width="200">
</div>

<div align="center">

**A modular Node.js client library for hlquery.**

[![Follow hlquery](https://img.shields.io/badge/Follow-%40hlquery-blue?logo=x&logoColor=white)](https://x.com/hlquery)
[![Commit Activity](https://img.shields.io/github/commit-activity/m/hlquery/node-api)](https://github.com/hlquery/node-api/pulse)
[![node-api](https://img.shields.io/badge/Follow-%40hlquery-blue?logo=x&logoColor=white)](https://github.com/hlquery/node-api/stargazers)
[![GitHub](https://img.shields.io/badge/GitHub-hlquery-blue?logo=github&logoColor=white)](https://github.com/hlquery/hlquery/stargazers)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

</div>

### Installation

Core client usage has no external dependencies. CSV support is built in.

```bash
npm install hlquery-node-client
```

```javascript
const Client = require('hlquery-node-client');
```

For local development in this repository:

```javascript
const Client = require('./lib/Client');
```

### Quick Start

```javascript
const Client = require('hlquery-node-client');

const client = new Client(process.env.HLQ_BASE_URL || 'http://localhost:9200', {
  token: process.env.HLQ_TOKEN,
  auth_method: 'bearer' // or 'api-key'
});

const health = await client.system().health();
console.log('status:', health.getStatusCode());

const collections = await client.collections().list(0, 10);
console.log(collections.getBody());

await client.collections().create('books', {
  fields: [
    { name: 'title', type: 'string' },
    { name: 'content', type: 'string' }
  ]
});

await client.documents().add('books', {
  id: 'book-1',
  title: 'Designing Data-Intensive Applications',
  content: 'Distributed systems, data models, replication, and indexing.'
});

const results = await client.searchApi().search('books', {
  q: 'distributed systems',
  query_by: 'title,content',
  limit: 10
});
console.log(results.getBody());

const sam = client.sam();
const samStatus = await sam.status('books');
const samHistory = await sam.history('books', 5);
const samResults = await sam.search('books', 'distributed systems', {
  limit: 10
});

console.log(samStatus.getBody());
console.log(samHistory.getBody());
console.log(samResults.getBody());
```


### Documents

```javascript
const documents = client.documents();

await documents.add('books', {
  id: 'book-1',
  title: 'Designing Data-Intensive Applications',
  content: 'Distributed systems, data models, replication, and indexing.'
});

await documents.update('books', 'book-1', { title: 'DDIA' });
await documents.delete('books', 'book-1');

await documents.import('books', [
  { id: 'book-2', title: 'Database Internals', content: 'Storage engines and indexes.' }
]);

await documents.addCSV('reports', './files/metrics.csv', {
  id: 'metrics_q1',
  document: { source_type: 'csv' }
});
```

`addCSV()` parses a local CSV file, flattens rows into text, and indexes the generated document. It does not require extra packages.

### Search

```javascript
const search = client.searchApi();

await search.search('books', {
  q: 'title:database OR content:index*',
  query_by: 'title,content',
  filter_by: 'category:technical',
  sort_by: '_text_match:desc',
  facet_by: 'category',
  limit: 10,
  offset: 0
});

await search.multiSearch([
  { collection: 'books', q: 'database', query_by: 'title,content' },
  { collection: 'articles', q: 'database', query_by: 'title,body' }
]);

await search.vectorSearch('books', {
  vector_query: [0.12, 0.34, 0.56],
  vector_by: 'embedding',
  limit: 10
});
```

### SAM

```javascript
const sam = client.sam();

const status = await sam.status('music');
const history = await sam.history('music', 5);
const results = await sam.search('music', 'queen of pop', {
  limit: 10
});

console.log(status.getBody());
console.log(history.getBody());
console.log(results.getBody());
```

Common search parameters:

- `q`: query string, including field clauses, phrases, boolean operators, and wildcards.
- `query_by`: searchable fields as a string or array.
- `filter_by`: filter expression.
- `sort_by`: sort expression.
- `facet_by`: facet fields.
- `limit` / `offset`: pagination.
- `page` / `per_page`: alternate pagination.

### SQL

SQL queries are supported through the search API and through the interactive talk shell.

```javascript
const response = await client.searchApi().sql(
  'products',
  'SELECT id, title, price FROM products ORDER BY price DESC LIMIT 5;'
);

const rows = response.getBody().rows || [];

await client.sql('SHOW COLLECTIONS;');
await client.execSql("INSERT INTO products (id, title) VALUES ('sku-9', 'Camp Stove');");
```
