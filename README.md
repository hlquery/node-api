<div align="center">
  <img src="https://docs.hlquery.com/img/hlquery/2.png" alt="hlquery logo" width="200">
</div>

<div align="center">

**A sophisticated, modular Node.js client library for hlquery, designed with a familiar and intuitive API structure.**

[![Follow hlquery](https://img.shields.io/badge/Follow-%40hlquery-blue?logo=x&logoColor=white)](https://x.com/hlquery)
[![Commit Activity](https://img.shields.io/github/commit-activity/m/hlquery/node-api)](https://github.com/hlquery/node-api/pulse)
[![node-api](https://img.shields.io/badge/GitHub-node--api-181717?logo=github&logoColor=white)](https://github.com/hlquery/node-api/stargazers)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

</div>

# hlquery Node.js API Client

## Features

-  **Modular Architecture**: Clean separation of concerns with organized classes
-  **Intuitive API**: Familiar and easy-to-use structure
-  **Authentication Support**: Bearer token and X-API-Key authentication
-  **Flexible Parameters**: Support for multiple parameter formats
-  **Auto-detection**: Automatically detects searchable fields when not specified
-  **Type-safe Responses**: Response objects with helper methods
-  **Comprehensive Validation**: Input validation for all operations
-  **No External Dependencies**: Uses Node.js built-in `http` and `https` modules
-  **Professional Structure**: Well-organized and modular architecture
-  **Async/Await Support**: Modern async/await syntax throughout

## Installation

Core client usage has no external dependencies. PDF parsing uses the optional `pdf-parse` package.

Simply require the client:

```javascript
const Client = require('./lib/Client');
```

Or if installed via npm:

```javascript
const Client = require('hlquery-node-client');
```

### Optional PDF Support

Install the optional PDF parser when you want to index local PDF files directly through the Node client:

```bash
npm install pdf-parse
```

CSV support is built in and does not require any extra package.

## Quick Start

### Basic Usage

```javascript
const Client = require('./lib/Client');

// Initialize client
const client = new Client('http://localhost:9200');

// Health check
const health = await client.health();
console.log('Status:', health.getStatusCode());

// List collections
const collections = await client.listCollections(0, 10);
if (collections.isSuccess()) {
    const body = collections.getBody();
    console.log(`Found ${body.collections ? body.collections.length : 0} collections`);
}
```

### With Authentication

```javascript
// Method 1: Set token in constructor
const client = new Client('http://localhost:9200', {
    token: 'your_token_here',
    auth_method: 'bearer'  // or 'api-key'
});

// Method 2: Set token dynamically
const client = new Client('http://localhost:9200');
client.setAuthToken('your_token_here', 'bearer');

// Method 3: Use X-API-Key
client.setAuthToken('your_token_here', 'api-key');
```

### Reduce Text Example

If the `ai_search` module is enabled, you can use the raw request helper to ask hlquery to summarize a stored document:

```javascript
const summary = await client.executeRequest('GET', '/modules/ai_search/talk', null, {
    q: 'summarize onboarding guide in docs',
    run: 'true'
});

console.log(summary.getBody());
```

## Architecture

### Core Classes

#### `Client`
Main client class that provides access to all API operations.

#### `Request`
Handles HTTP requests, authentication, and error handling.

#### `Response`
Response wrapper with helper methods:
- `getStatusCode()` - Get HTTP status code
- `getBody()` - Get response body
- `isSuccess()` - Check if request was successful
- `isError()` - Check if request failed
- `getError()` - Get error message
- `toArray()` - Convert to array format

#### API Classes

`Collections` manages collections.
`Documents` handles document CRUD plus import/export and facet counts.
`Search` handles search and vector search; `search()` uses `/collections/{name}/search`, while `searchLegacy()` is only for older `/documents/search` callers.
`Aliases`, `Overrides`, `Synonyms`, and `Stopwords` wrap the search-management endpoints.
`System` exposes health, status, metrics, connections, RocksDB, and related node APIs.

### Utilities

`Utils.Auth` covers token helpers and validation.
`Utils.Config` handles defaults and URL/config normalization.
`Utils.Validator` validates request input.
`Utils.Ranker` computes `rank_signal` and attaches `sort_by=rank_signal:desc`.

### Exceptions

`HlqueryException` is the base type.
Use `AuthenticationException`, `RequestException`, `ValidationException`, `CollectionException`, `DocumentException`, and `SearchException` for specific failures.

## API Methods

### System APIs

#### `health()`
Check server health status.

```javascript
const health = await client.health();
if (health.isSuccess()) {
    const body = health.getBody();
    console.log('Status:', body.status);
}
```

#### `stats()`
Get server statistics.

```javascript
const stats = await client.stats();
```

#### `info()`
Get server information.

```javascript
const info = await client.info();
```

#### `status()`, `metrics()`, `connections()`, `rocksdb()`
Get operational node state without dropping to raw HTTP.

```javascript
const status = await client.status();
const metrics = await client.metrics();
const connections = await client.connections();
const rocks = await client.rocksdb();
```

### Collections API

#### Using the Collections API Object

```javascript
const collections = client.collections();

// List collections
const result = await collections.list(0, 10);

// Get collection
const result = await collections.get('my_collection');

// Create collection
const result = await collections.create('new_collection', schema);

// Delete collection
const result = await collections.delete('collection_name');

// Get formatted fields
const result = await collections.getFields('my_collection');
```

#### Convenience Methods

```javascript
// List collections
const collections = await client.listCollections(0, 10);

// Get collection details
const collection = await client.getCollection('my_collection');

// Get collection fields (formatted)
const fields = await client.getCollectionFields('my_collection');
```

### Documents API

#### Using the Documents API Object

```javascript
const documents = client.documents();

// List documents
const result = await documents.list('collection', { offset: 0, limit: 10 });

// Get document
const result = await documents.get('collection', 'doc_id');

// Add document
const result = await documents.add('collection', document);

// Update document
const result = await documents.update('collection', 'doc_id', document);

// Delete document
const result = await documents.delete('collection', 'doc_id');

// Bulk import
const result = await documents.import('collection', [doc1, doc2, doc3]);

// Facet counts
const facets = await documents.facetCounts('collection', {
  q: '*',
  facet_by: 'category'
});

// Export documents
const exported = await documents.export('collection', {
  filter_by: 'category:books'
});

// Parse and add a local PDF file
const result = await documents.addPDF('collection', './files/report.pdf');

// Parse and add a local CSV file
const result = await documents.addCSV('collection', './files/report.csv');
```

#### PDF Parsing

`documents.addPDF(collection, filePath, options)` parses a local PDF file, normalizes the extracted text, and submits it as a regular document to hlquery.

```javascript
const result = await client.documents().addPDF('reports', './files/q1-report.pdf', {
  id: 'report_q1',
  document: {
    source_type: 'pdf'
  }
});
```

The generated document includes:
- `title`
- `content`
- `file_name`
- `file_path`
- `mime_type`
- `page_count`
- `file_size_bytes`
- normalized PDF metadata fields such as `pdf_info_author`

Note: hlquery currently rejects commas in string field values. The PDF helper replaces commas with spaces before indexing so extracted text can be stored successfully.

#### CSV Parsing

`documents.addCSV(collection, filePath, options)` parses a local CSV file, flattens rows into normalized text, and submits it as a regular document to hlquery.

```javascript
const result = await client.documents().addCSV('reports', './files/metrics.csv', {
  id: 'metrics_q1',
  document: {
    source_type: 'csv'
  }
});
```

The generated document includes:
- `title`
- `content`
- `file_name`
- `file_path`
- `mime_type`
- `row_count`
- `column_count`
- `columns`

CSV parsing uses no external dependency. Cells are flattened into plain text, and commas are replaced with spaces before indexing to satisfy hlquery field restrictions.

#### Convenience Methods

```javascript
// List documents
const docs = await client.listDocuments('collection', { offset: 0, limit: 10 });

// Get document
const doc = await client.getDocument('collection', 'doc_id');
```

### Search API

#### Using the Search API Object

```javascript
const search = client.searchApi();

// Simple search
const results = await search.search('collection', {
    q: 'search query',
    query_by: 'title,content',
    limit: 10
});

// Multi-search
const results = await search.multiSearch([
    { collection: 'col1', q: 'query1' },
    { collection: 'col2', q: 'query2' }
]);

// Global search
const globalResults = await search.globalSearch({
    q: 'query',
    query_by: 'title,content'
});
```

#### Convenience Method

```javascript
// Search documents
const results = await client.search('collection', {
    q: 'search query',
    query_by: 'title,content',
    limit: 10
});
```

#### Search Management APIs

```javascript
await client.aliases().create('books_current', {
  collection_name: 'books_v2'
});

await client.synonyms().create('books', 'cars', {
  root: 'car',
  synonyms: ['auto', 'automobile']
});

await client.stopwords().create('books', {
  word: 'the'
});

await client.overrides().create('books', 'boost_featured', {
  rule: { query: 'featured', match: 'exact' },
  includes: [{ id: 'doc-1', position: 1 }],
  excludes: []
});
```

### Search Parameters

The `search()` method accepts flexible parameters:

#### Query Parameters
- `q` - Query string (supports field clauses, `OR`, `NOT`, phrases, and wildcards)
  - Examples: `q: "title:laptop"`, `q: "title:laptop OR title:notebook"`, `q: "title:laptop NOT title:refurbished"`, `q: "\"wireless keyboard\""`, `q: "laptop*"`
- `query_by` - Fields to search in (string or array)
- `query` - Structured query object

#### Pagination
- `from` / `offset` - Starting offset
- `size` / `limit` - Number of results
- `page` - Page number (alternative to offset)
- `per_page` - Results per page

#### Filtering & Sorting
- `filter_by` - Filter conditions (string), for example `filter_by: "price:>100&&category:electronics"`
- `filter` - Filter object
- `sort_by` - Sort fields (string or array)
- `sort` - Sort specification

#### Faceting
- `facet_by` - Facet fields (string or array)
- `facets` - Facet specification

### API Aliases

#### `indices(params = {})`
Alias for `listCollections()`.

```javascript
const collections = await client.indices({ offset: 0, limit: 10 });
```

#### `get(params)`
Alias for `getCollection()` or `getDocument()`.

```javascript
// Get document
const doc = await client.get({ index: 'collection', id: 'doc_id' });

// Get collection
const collection = await client.get({ index: 'collection' });
```

#### `cat(type = 'indices', params = {})`
Cat API for listing collections and system information.

```javascript
const indices = await client.cat('indices', { limit: 10 });
```

## Response Handling

All methods return a `Response` object (wrapped in a Promise):

```javascript
const response = await client.health();

// Check status
if (response.isSuccess()) {
    // Handle success
    const body = response.getBody();
}

// Or check status code
if (response.getStatusCode() === 200) {
    // Handle success
}

// Get error
if (response.isError()) {
    const error = response.getError();
    console.log('Error:', error);
}

// Convert to array
const array = response.toArray();
// Returns: { status: 200, body: {...} }
```

## Error Handling

The client throws exceptions for errors:

```javascript
const { RequestException, AuthenticationException, ValidationException } = require('./lib/Exceptions');

try {
    const result = await client.search('collection', { q: 'test' });
    
    if (result.isError()) {
        // Handle HTTP error
        console.log('Error:', result.getError());
    }
} catch (error) {
    if (error instanceof RequestException) {
        // Handle request errors
        console.log('Request failed:', error.message);
        console.log('Status:', error.statusCode);
    } else if (error instanceof AuthenticationException) {
        // Handle authentication errors
        console.log('Auth failed:', error.message);
    } else if (error instanceof ValidationException) {
        // Handle validation errors
        console.log('Validation failed:', error.message);
    } else {
        // Handle other errors
        console.log('Error:', error.message);
    }
}
```


## Requirements

- Node.js >= 12.0.0
- No external dependencies required

## npm Installation

This package can be installed via npm:

```bash
npm install hlquery-node-client
```

Or add to your `package.json`:

```json
{
    "dependencies": {
        "hlquery-node-client": "*"
    }
}
```
