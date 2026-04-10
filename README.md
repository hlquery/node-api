<div align="center">
  <img src="https://docs.hlquery.com/img/hlquery/2.png" alt="hlquery logo" width="200">
</div>


# hlquery Node.js API Client

A sophisticated, modular Node.js client library for hlquery, designed with a familiar and intuitive API structure.

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

## Directory Structure

```
node/
├── index.js                  # Main entry point
├── example.js                # Main example file
├── README.md                 # This file
├── STRUCTURE.md              # Architecture documentation
├── LICENSE                   # BSD-3-Clause license
├── package.json              # npm package definition
│
├── lib/                      # Core library classes
│   ├── Client.js            # Main client class
│   ├── Request.js           # HTTP request handler
│   ├── Response.js          # Response wrapper
│   ├── Exceptions.js        # Custom exceptions
│   ├── Collections.js       # Collections API
│   ├── Documents.js         # Documents API
│   └── Search.js            # Search API
│
├── utils/                    # Utility classes
│   ├── Auth.js              # Authentication utilities
│   ├── Config.js            # Configuration utilities
│   └── Validator.js         # Input validation
│
├── examples/                 # Organized examples
│   ├── basic_usage.js       # Basic usage examples
│   ├── search.js   # Search examples
│   ├── collections.js  # Collection management
│   └── documents.js    # Document CRUD
│
├── tests/                    # Test files (for future use)
└── config/                   # Configuration files (for future use)
```

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

#### Field Value Character Restrictions

**Important**: String field values have character restrictions:

**❌ Invalid Characters** (not allowed):
- Commas (`,`) - Reserved for internal parsing

** Valid Characters** (allowed):
- Letters, numbers, underscores (`_`), hyphens (`-`), spaces, periods, and most punctuation (except commas)

**Examples:**

 **Valid:**
```javascript
const doc = {
  id: 'doc1',
  tags: 'tag1_tag2_tag3',        //  Use underscores
  cast: 'Actor1_Actor2',          //  Use underscores
  genre: 'Action_Drama'            //  Use underscores
};

// Or use arrays for multiple values:
const doc2 = {
  id: 'doc2',
  tags: ['tag1', 'tag2', 'tag3']  //  Arrays are fine
};
```

❌ **Invalid:**
```javascript
const doc = {
  id: 'doc1',
  tags: 'tag1,tag2,tag3',         // ❌ Commas not allowed
  cast: 'Actor1, Actor2',         // ❌ Commas not allowed
  genre: 'Action,Drama'           // ❌ Commas not allowed
};
```

**Workarounds:**
- Use underscores (`_`) or spaces instead of commas
- Use arrays for multiple values: `tags: ['tag1', 'tag2', 'tag3']`
- Use separate fields if you need comma-separated data

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

## Examples

### Complete Example

See `example.js` for a complete example demonstrating:
- Health checks
- Authentication (with and without token)
- Listing collections
- Getting collection fields
- Listing documents with pagination
- Multiple search methods
- Dynamic authentication

Run the example:

```bash
# Without authentication
node example.js

# With authentication
node example.js your_token_here
```

### Organized Examples

Check the `examples/` directory for organized examples:
- `basic_usage.js` - Basic operations
- `search.js` - Search patterns
- `collections.js` - Collection management
- `documents.js` - Document CRUD


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

## Architecture

For detailed information about the library architecture, design decisions, and internal structure, see [STRUCTURE.md](STRUCTURE.md).

## License

Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>

This software is licensed under the BSD-3-Clause License. See the [LICENSE](LICENSE) file for details.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
