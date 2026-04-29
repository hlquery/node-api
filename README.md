<div align="center">
  <img src="https://docs.hlquery.com/img/hlquery/2.png" alt="hlquery logo" width="200">
</div>

<div align="center">

**A modular Node.js client library for hlquery.**

[![Follow hlquery](https://img.shields.io/badge/Follow-%40hlquery-blue?logo=x&logoColor=white)](https://x.com/hlquery)
[![Commit Activity](https://img.shields.io/github/commit-activity/m/hlquery/node-api)](https://github.com/hlquery/node-api/pulse)
[![node-api](https://img.shields.io/badge/GitHub-node--api-181717?logo=github&logoColor=white)](https://github.com/hlquery/node-api/stargazers)
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
```

You can also set authentication later:

```javascript
client.setAuthToken('your_token_here', 'bearer');
client.setAuthToken('your_api_key_here', 'api-key');
```

### API Surface

Use nested API objects: `client -> resource -> action`, for example `client.collections().create(...)`.

```javascript
client.system().health();
client.system().stats();
client.system().info();
client.system().status();
client.system().metrics();
client.system().connections();
client.system().rocksdb();

client.collections().list(offset, limit);
client.collections().get(name);
client.collections().create(name, schema);
client.collections().update(name, schema);
client.collections().delete(name);
client.collections().getFields(name);

client.documents().list(collection, params);
client.documents().get(collection, id);
client.documents().add(collection, document);
client.documents().update(collection, id, document);
client.documents().delete(collection, id);
client.documents().import(collection, documents);
client.documents().export(collection, params);
client.documents().facetCounts(collection, params);
client.documents().addCSV(collection, filePath, options);

client.searchApi().search(collection, params);
client.searchApi().vectorSearch(collection, params);
client.searchApi().multiSearch(searches);
client.searchApi().globalSearch(params);
client.searchApi().sql(collection, sql);

client.aliases().create(name, params);
client.aliases().update(name, params);
client.aliases().delete(name);
client.synonyms().create(collection, id, synonym);
client.stopwords().create(collection, params);
client.overrides().create(collection, id, override);
client.keys().create(params);
client.executeRequest(method, path, body, query);
```

### Collections

```javascript
const collections = client.collections();

await collections.create('books', {
  fields: [
    { name: 'title', type: 'string' },
    { name: 'content', type: 'string' },
    { name: 'category', type: 'string', facet: true }
  ]
});

await collections.get('books');
await collections.getFields('books');
await collections.update('books', schema);
await collections.delete('books');
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

Talk shell example:

```text
localhost:9200> sql: select title,id from music LIMIT 2;

SQL rows for `select title,id from music LIMIT 2;`:
+--------------------------------+------------------------------------------+
| id                             | title                                    |
+--------------------------------+------------------------------------------+
| music_artist-profile-beyonce   | Artist Profile: Beyonce                  |
| music_artist-profile-kendrick- | Artist Profile: Kendrick Lamar           |
| lamar                          |                                          |
+--------------------------------+------------------------------------------+
2 results shown.
Search completed in 19 ms.
```

### Search Management

```javascript
const aliases = client.aliases();
const synonyms = client.synonyms();
const stopwords = client.stopwords();
const overrides = client.overrides();

await aliases.create('books_current', { collection_name: 'books_v2' });

await synonyms.create('books', 'cars', {
  root: 'car',
  synonyms: ['auto', 'automobile']
});

await stopwords.create('books', { word: 'the' });

await overrides.create('books', 'boost_featured', {
  rule: { query: 'featured', match: 'exact' },
  includes: [{ id: 'doc-1', position: 1 }],
  excludes: []
});
```

### Responses

All API methods return a `Response` object.

```javascript
const response = await client.system().health();

response.getStatusCode();
response.getBody();
response.isSuccess();
response.isError();
response.getError();
response.toArray();
```

