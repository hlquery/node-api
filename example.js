/**
 * hlquery Node.js API Comprehensive Example
 * 
 * This example demonstrates the main features of the hlquery Node.js client:
 * - Health checks
 * - Authentication (with and without token)
 * - Listing collections
 * - Getting collection fields
 * - Listing documents with pagination
 * - Multiple search methods
 * - Dynamic authentication
 * 
 * Usage: node example.js [command] [token]
 *   Commands:
 *     cols   - Run collections API examples
 *     docs   - Run documents API examples
 *     open   - List and open collections (interactive)
 *     status - Show server health and status information
 *     help   - Show this help message
 *     all    - Run all examples (default)
 */

const Client = require('./lib/Client');

// Configuration
const baseUrl = 'http://localhost:9200';

// Parse command line arguments
let command = 'all';
let testToken = null;
let offset = 0;
let limit = 1000;
let collectionName = null;

if (process.argv.length > 2) {
    const firstArg = process.argv[2];
    if (['cols', 'docs', 'open', 'status', 'help', 'all'].includes(firstArg)) {
        command = firstArg;
        // Parse pagination for cols command: cols [offset] [limit] [token]
        if (command === 'cols' && process.argv.length >= 4) {
            const offsetArg = parseInt(process.argv[3]);
            if (!isNaN(offsetArg)) {
                offset = offsetArg;
                if (process.argv.length >= 5) {
                    const limitArg = parseInt(process.argv[4]);
                    if (!isNaN(limitArg)) {
                        limit = limitArg;
                        testToken = process.argv[5] || null;
                    } else {
                        testToken = process.argv[4];
                    }
                }
            } else {
                testToken = process.argv[3];
            }
        } else if (command === 'docs' && process.argv.length >= 4) {
            // For docs command: docs [collection_name] [token]
            collectionName = process.argv[3];
            testToken = process.argv[4] || null;
        } else {
            // Look for token in remaining args (skip numeric args)
            for (let i = 3; i < process.argv.length; i++) {
                const arg = parseInt(process.argv[i]);
                if (isNaN(arg)) {
                    testToken = process.argv[i];
                    break;
                }
            }
        }
    } else {
        // First arg is token, use 'all' command
        testToken = firstArg;
    }
}

// Show help if requested
if (command === 'help') {
    console.log('=== hlquery Node.js API Example ===\n');
    console.log('Usage: node example.js [command] [args...] [token]\n');
    console.log('Commands:');
    console.log('  cols   - List collections (with pagination)');
    console.log('          Usage: cols [offset] [limit] [token]');
    console.log('          Example: cols 0 200 (list first 200 collections)');
    console.log('  docs   - Run documents API examples');
    console.log('          Usage: docs [collection_name] [token]');
    console.log('          Example: docs my_collection');
    console.log('  open   - List and open collections (interactive)');
    console.log('  status - Show server health and status information');
    console.log('  help   - Show this help message');
    console.log('  all    - Run all examples (default)\n');
    console.log('Authentication:');
    console.log('  Token is optional. Only provide if server requires authentication.');
    console.log('  Example: node example.js cols 0 200 my_token');
    console.log('  Example: node example.js docs my_collection my_token\n');
    console.log('Examples:');
    console.log('  node example.js');
    console.log('  node example.js cols');
    console.log('  node example.js cols 0 200');
    console.log('  node example.js docs my_collection');
    console.log('  node example.js status');
    process.exit(0);
}

console.log('=== hlquery Node.js API Example ===');
console.log(`Command: ${command}\n`);

// Helper function to print results
function printResult(title, response, printBody = true) {
    console.log('='.repeat(70));
    console.log(`TEST: ${title}`);
    console.log('-'.repeat(70));
    
    if (response) {
        const status = response.getStatusCode();
        const body = response.getBody();
        const headers = response.getHeaders();
        
        console.log(`Status Code: ${status}`);
        
        if (printBody && body) {
            console.log('Response Body:');
            if (typeof body === 'object') {
                console.log(JSON.stringify(body, null, 2));
            } else {
                console.log(body);
            }
        }
        
        if (status >= 200 && status < 300) {
            console.log('✓ SUCCESS');
        } else {
            console.log('✗ FAILED');
        }
    } else {
        console.log('Invalid response');
    }
    console.log('\n');
}

// Helper to get first collection name
async function getFirstCollection(client) {
    try {
        const collections = await client.listCollections(0, 1);
        if (collections.getStatusCode() === 200) {
            const body = collections.getBody();
            if (body.collections && body.collections.length > 0) {
                const first = body.collections[0];
                return typeof first === 'object' ? (first.name || first) : first;
            }
        }
    } catch (e) {
        // Ignore errors
    }
    return null;
}

// Main function
async function main() {
    // Create client
    const client = new Client(baseUrl);
    
    // Optional: Set authentication token if provided
    // Uncomment and set token if your server requires authentication:
    // const authToken = 'your_token_here';
    // client.setAuthToken(authToken, 'bearer');
    
    if (testToken) {
        client.setAuthToken(testToken, 'bearer');
        console.log(`Using authentication token: ${testToken.substring(0, 8)}...\n`);
    }
    
    // ----------------------------------------------------------------====================================
    // STATUS COMMAND
    // ----------------------------------------------------------------====================================
    if (command === 'status') {
        console.log('\n' + '#'.repeat(70));
        console.log('# SERVER STATUS');
        console.log('#'.repeat(70) + '\n');
        
        try {
            // GET /health
            printResult('GET /health', await client.health());
            
            // GET /stats
            printResult('GET /stats', await client.stats());
            
            // GET /etc (protocol codes)
            const etc = await client.executeRequest('GET', '/etc');
            printResult('GET /etc (Protocol Codes)', etc);
            
            // GET /status
            const status = await client.executeRequest('GET', '/status');
            printResult('GET /status', status);
            
            // GET / (Root Info) - show concise version
            const info = await client.info();
            console.log('='.repeat(70));
            console.log('TEST: GET / (Root Info)');
            console.log('-'.repeat(70));
            if (info) {
                const statusCode = info.getStatusCode();
                const body = info.getBody();
                console.log(`Status Code: ${statusCode}`);
                if (statusCode >= 200 && statusCode < 300 && body && typeof body === 'object') {
                    console.log(`Name: ${body.name || 'N/A'}`);
                    console.log(`Version: ${body.version || 'N/A'}`);
                    console.log(`Description: ${body.description || 'N/A'}`);
                    console.log('✓ SUCCESS');
                } else {
                    console.log('Response Body:');
                    console.log(JSON.stringify(body, null, 2));
                    console.log('✓ SUCCESS');
                }
            } else {
                console.log('Invalid response');
            }
            console.log('\n');
        } catch (error) {
            console.log(`Error getting status: ${error.message}\n`);
        }
        process.exit(0);
    }
    
    // ----------------------------------------------------------------====================================
    // System APIs (only for 'all' command)
    // ----------------------------------------------------------------====================================
    if (command === 'all') {
        console.log('\n' + '#'.repeat(70));
        console.log('# System APIs');
        console.log('#'.repeat(70) + '\n');
        
        try {
            // GET /health
            printResult('GET /health', await client.health());
            
            // GET /stats
            printResult('GET /stats', await client.stats());
            
            // GET /etc (protocol codes)
            const etc = await client.executeRequest('GET', '/etc');
            printResult('GET /etc (Protocol Codes)', etc);
            
            // GET /metrics (Prometheus-compatible)
            const metrics = await client.executeRequest('GET', '/metrics');
            printResult('GET /metrics', metrics);
            
            // GET /status
            const status = await client.executeRequest('GET', '/status');
            printResult('GET /status', status);
            
            // GET /
            printResult('GET / (Root)', await client.info());
            
        } catch (error) {
            console.log(`Error in system APIs: ${error.message}\n`);
        }
    }
    
    // ----------------------------------------------------------------====================================
    // COLLECTIONS API
    // ----------------------------------------------------------------====================================
    if (command === 'all' || command === 'cols' || command === 'open') {
        console.log('\n' + '#'.repeat(70));
        console.log('# COLLECTIONS API');
        console.log('#'.repeat(70) + '\n');
        
        try {
            // GET /collections with pagination
            const collections = await client.listCollections(offset, limit);
            
            if (command === 'cols') {
                // Simple list display for cols command
                if (collections.getStatusCode() === 200) {
                    const body = collections.getBody();
                    if (body.collections) {
                        const colsList = body.collections;
                        const total = colsList.length;
                        console.log(`Collections (showing ${total}, offset: ${offset}, limit: ${limit}):\n`);
                        colsList.forEach(col => {
                            const name = typeof col === 'object' ? (col.name || col) : col;
                            console.log(`  ${name}`);
                        });
                        console.log();
                    } else {
                        console.log('No collections found.\n');
                    }
                } else {
                    console.log(`Error: ${collections.getStatusCode()}\n`);
                    const body = collections.getBody();
                    if (body && body.message) {
                        console.log(`Message: ${body.message}\n`);
                    }
                }
            } else {
                // Full display for 'all' and 'open' commands
                printResult('GET /collections (List)', collections);
                
                // Get first collection for other tests
                const firstCollection = await getFirstCollection(client);
                
                if (firstCollection && command === 'all') {
                    console.log(`Using collection: ${firstCollection}\n`);
                    
                    // GET /collections/{name}
                    printResult(`GET /collections/${firstCollection}`, await client.getCollection(firstCollection));
                    
                    // GET /collections/{name} (fields formatted)
                    printResult(`GET /collections/${firstCollection}/fields (formatted)`, 
                        await client.getCollectionFields(firstCollection));
                    
                    // Test creating a temporary collection
                    const testCollectionName = `test_collection_${Date.now()}`;
                    const testSchema = {
                        fields: [
                            { name: 'title', type: 'string' },
                            { name: 'content', type: 'string' },
                            { name: 'embedding', type: 'float[]' }
                        ]
                    };
                    
                    // POST /collections
                    const createResult = await client.collections().create(testCollectionName, testSchema);
                    printResult('POST /collections (Create)', createResult);
                    
                    if (createResult.getStatusCode() === 200 || createResult.getStatusCode() === 201) {
                        // POST /collections/{name}/update
                        const updateSchema = {
                            fields: [
                                { name: 'title', type: 'string' },
                                { name: 'content', type: 'string' },
                                { name: 'embedding', type: 'float[]' },
                                { name: 'tags', type: 'string[]' }
                            ]
                        };
                        const updateResult = await client.collections().update(testCollectionName, updateSchema);
                        printResult('POST /collections/{name}/update', updateResult);
                        
                        // DELETE /collections/{name} (cleanup)
                        const deleteResult = await client.collections().delete(testCollectionName);
                        printResult('DELETE /collections/{name}', deleteResult);
                    }
                } else if (!firstCollection) {
                    console.log('No collections found - skipping collection-specific tests\n');
                }
            }
            
            // For 'open' command, list all collections
            if (command === 'open') {
                const collections = await client.listCollections(0, 1000);
                if (collections.getStatusCode() === 200) {
                    const body = collections.getBody();
                    if (body.collections) {
                        console.log('\nAvailable Collections:');
                        console.log('-'.repeat(70));
                        body.collections.forEach(col => {
                            const name = typeof col === 'object' ? (col.name || col) : col;
                            console.log(`  ${name}`);
                        });
                        console.log();
                    }
                }
            }
            
        } catch (error) {
            console.log(`Error in collections API: ${error.message}\n`);
        }
    }
    
    // ----------------------------------------------------------------====================================
    // DOCUMENTS API
    // ----------------------------------------------------------------====================================
    if (command === 'all' || command === 'docs' || command === 'open') {
        console.log('\n' + '#'.repeat(70));
        console.log('# DOCUMENTS API');
        console.log('#'.repeat(70) + '\n');
        
        // Use provided collection name or get first collection
        const testCollection = collectionName || await getFirstCollection(client);
        if (!testCollection) {
            if (command === 'docs' && !collectionName) {
                console.log('Error: No collection name provided and no collections found.');
                console.log('Usage: node example.js docs [collection_name] [token]\n');
            } else {
                console.log('No collections available - skipping document tests\n');
            }
        } else {
            if (command === 'docs' && collectionName) {
                console.log(`Using collection: ${testCollection}\n`);
            }
            try {
                // GET /collections/{name}/documents
                const documents = await client.listDocuments(testCollection, { offset: 0, limit: limit });
                
                if (command === 'docs') {
                    // Simple list display for docs command
                    if (documents.getStatusCode() === 200) {
                        const body = documents.getBody();
                        if (body.documents) {
                            const docsList = body.documents;
                            const total = docsList.length;
                            console.log(`Documents in '${testCollection}' (showing ${total}, limit: ${limit}):\n`);
                            docsList.forEach(doc => {
                                const docId = typeof doc === 'object' ? (doc.id || doc) : doc;
                                console.log(`  ${docId}`);
                            });
                            console.log();
                        } else {
                            console.log('No documents found.\n');
                        }
                    } else {
                        console.log(`Error: ${documents.getStatusCode()}\n`);
                        const body = documents.getBody();
                        if (body && body.message) {
                            console.log(`Message: ${body.message}\n`);
                        }
                    }
                } else {
                    // Full display for 'all' command
                    printResult('GET /collections/{name}/documents (List)', documents);
                }
                
                // Get a document ID if available (for 'all' command)
                let testDocId = null;
                if (command === 'all') {
                    const documents = await client.listDocuments(testCollection, { offset: 0, limit: 1 });
                    if (documents.getStatusCode() === 200) {
                        const body = documents.getBody();
                        if (body.documents && body.documents.length > 0) {
                            const doc = body.documents[0];
                            testDocId = typeof doc === 'object' ? (doc.id || null) : null;
                        }
                    }
                }
            
            if (testDocId) {
                // GET /collections/{name}/documents/{id}
                printResult(`GET /collections/${testCollection}/documents/${testDocId}`, 
                    await client.getDocument(testCollection, testDocId));
            }
            
            // POST /collections/{name}/documents (Add)
            const newDoc = {
                id: `test_doc_${Date.now()}`,
                title: 'Test Document',
                content: 'This is a test document for API testing',
                embedding: [0.1, 0.2, 0.3, 0.4, 0.5] // Sample vector
            };
            const addResult = await client.documents().add(testCollection, newDoc);
            printResult('POST /collections/{name}/documents (Add)', addResult);
            
            if (addResult.getStatusCode() === 200 || addResult.getStatusCode() === 201) {
                const addedDocId = newDoc.id;
                
                // PUT /collections/{name}/documents/{id}
                const updatedDoc = {
                    title: 'Updated Test Document',
                    content: 'This document has been updated'
                };
                const updateResult = await client.documents().update(testCollection, addedDocId, updatedDoc);
                printResult('PUT /collections/{name}/documents/{id} (Update)', updateResult);
                
                // POST /collections/{name}/documents/import
                const bulkDocs = [
                    { id: 'bulk_1', title: 'Bulk Doc 1', content: 'Content 1' },
                    { id: 'bulk_2', title: 'Bulk Doc 2', content: 'Content 2' },
                    { id: 'bulk_3', title: 'Bulk Doc 3', content: 'Content 3' }
                ];
                const importResult = await client.documents().import(testCollection, bulkDocs);
                printResult('POST /collections/{name}/documents/import (Bulk Import)', importResult);
                
                // DELETE /collections/{name}/documents/{id}
                const deleteResult = await client.documents().delete(testCollection, addedDocId);
                printResult('DELETE /collections/{name}/documents/{id}', deleteResult);
                
                // DELETE /collections/{name}/documents (by filter)
                const deleteByFilterResult = await client.documents().deleteByFilter(testCollection, 'title:Bulk*');
                printResult('DELETE /collections/{name}/documents (by filter)', deleteByFilterResult);
            }
            
            } catch (error) {
                console.log(`Error in documents API: ${error.message}\n`);
            }
        }
    }
    
    // ----------------------------------------------------------------====================================
    // SEARCH API (only for 'all' command)
    // ----------------------------------------------------------------====================================
    if (command === 'all') {
        console.log('\n' + '#'.repeat(70));
        console.log('# SEARCH API');
        console.log('#'.repeat(70) + '\n');
        
        const searchCollection = await getFirstCollection(client);
        if (!searchCollection) {
            console.log('No collections available - skipping search tests\n');
        } else {
            try {
            // GET/POST /collections/{name}/documents/search (Regular search)
            const searchParams = {
                q: 'test',
                query_by: 'title,content',
                limit: 5
            };
            printResult('GET /collections/{name}/documents/search (Regular Search)', 
                await client.search(searchCollection, searchParams));
            
            // Search with sorting examples
            console.log('\n--- Sorting Examples ---\n');
            
            // Sort by relevance (default)
            const searchRelevance = {
                q: 'test',
                query_by: 'title,content',
                sort_by: '_text_match:desc',
                limit: 5
            };
            printResult('Search sorted by Relevance (Best Match)', 
                await client.search(searchCollection, searchRelevance));
            
            // Sort by title alphabetically
            const searchTitle = {
                q: 'test',
                query_by: 'title,content',
                sort_by: 'title:asc',
                limit: 5
            };
            printResult('Search sorted by Title (A-Z)', 
                await client.search(searchCollection, searchTitle));
            
            // Search with highlighting
            console.log('\n--- Highlighting Examples ---\n');
            const searchHighlight = {
                q: 'test',
                query_by: 'title,content',
                highlight: true,
                highlight_fields: ['title', 'content'],
                limit: 5
            };
            printResult('Search with Highlighting', 
                await client.search(searchCollection, searchHighlight));
            
            // Sort by document ID
            const searchId = {
                q: 'test',
                query_by: 'title,content',
                sort_by: 'id:asc',
                limit: 5
            };
            printResult('Search sorted by Document ID (A-Z)', 
                await client.search(searchCollection, searchId));
            
            // Sort by date (if available)
            const searchDate = {
                q: 'test',
                query_by: 'title,content',
                sort_by: 'created_at:desc',
                limit: 5
            };
            printResult('Search sorted by Date (Newest First)', 
                await client.search(searchCollection, searchDate));
            
            // POST /collections/{name}/vector_search (Vector search body)
            const vectorQuery = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]; // Sample 10D vector
            const vectorParams = {
                body: {
                    vector: vectorQuery,
                    field_name: 'embedding',
                    topk: 5,
                    threshold: 0.0,
                    normalize: true,
                    include_vector: false
                }
            };
            printResult('POST /collections/{name}/vector_search (Vector Search)', 
                await client.vectorSearch(searchCollection, vectorParams));
            
            // POST /multi_search
            const multiSearchParams = {
                searches: [
                    {
                        collection: searchCollection,
                        q: 'test',
                        query_by: 'title'
                    },
                    {
                        collection: searchCollection,
                        q: 'document',
                        query_by: 'content'
                    }
                ]
            };
            printResult('POST /multi_search', 
                await client.searchApi().multiSearch(multiSearchParams.searches));
            
            } catch (error) {
                console.log(`Error in search API: ${error.message}\n`);
            }
        }
    }
    
    // ----------------------------------------------------------------====================================
    // SUMMARY (only show for 'all' command)
    // ----------------------------------------------------------------====================================
    if (command === 'all') {
        console.log('\n' + '#'.repeat(70));
        console.log('# TESTING COMPLETE');
        console.log('#'.repeat(70) + '\n');
        
        console.log('Routes have been tested. Check the output above for results.');
        console.log('Note: Some tests may fail if:');
        console.log('  - Authentication is required but no token was provided');
        console.log('  - Collections don\'t exist');
        console.log('  - Required data is missing');
        console.log('\n');
        console.log('Usage: node example.js [command] [args...] [token]');
        console.log('  Commands:');
        console.log('    cols   - List collections (with pagination)');
        console.log('             Usage: cols [offset] [limit] [token]');
        console.log('             Example: cols 0 200');
        console.log('    docs   - Run documents API examples');
        console.log('             Usage: docs [collection_name] [token]');
        console.log('             Example: docs my_collection');
        console.log('    open   - List and open collections');
        console.log('    status - Show server health and status information');
        console.log('    help   - Show help message');
        console.log('    all    - Run all examples (default)');
        console.log('\n');
    }
}

// Run main function
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
