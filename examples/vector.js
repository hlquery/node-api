/**
 * Vector Search Example
 * 
 * Demonstrates vector search capabilities with multiple collections:
 * - Creates 4 collections with vector fields
 * - Inserts 10 documents per collection with random embeddings
 * - Performs vector searches to find relationships
 * - Shows similarity-based document retrieval
 * 
 * Usage: node examples/vector.js [token]
 */

const Client = require('../lib/Client');

// Configuration
const baseUrl = 'http://localhost:9200';
const testToken = process.argv[2] || null;

// Helper function to generate random vector
function generateRandomVector(dimensions = 128) {
    const vector = [];
    for (let i = 0; i < dimensions; i++) {
        vector.push(Math.random() * 2 - 1); // Random value between -1 and 1
    }
    // Normalize the vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / magnitude);
}

// Helper function to generate related vectors (similar to a base vector)
function generateRelatedVector(baseVector, similarity = 0.8) {
    const related = baseVector.map(val => val * similarity);
    const random = generateRandomVector(baseVector.length);
    const orthogonal = random.map((val, i) => val * (1 - similarity));
    return related.map((val, i) => val + orthogonal[i]);
}

// Helper function to print results
function printResult(title, response, printBody = true) {
    console.log('='.repeat(80));
    console.log(`TEST: ${title}`);
    console.log('-'.repeat(80));
    
    if (response) {
        const status = response.getStatusCode();
        const body = response.getBody();
        
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

// Helper function to print vector query
function printVectorQuery(collectionName, vectorQuery, params = {}) {
    console.log('\n' + '='.repeat(80));
    console.log('VECTOR QUERY');
    console.log('='.repeat(80));
    console.log(`Collection: ${collectionName}`);
    console.log(`Vector Dimensions: ${vectorQuery.length}`);
    console.log(`Vector (first 10 values): [${vectorQuery.slice(0, 10).map(v => v.toFixed(4)).join(', ')}...]`);
    console.log(`Limit: ${params.limit || 10}`);
    console.log(`Threshold: ${params.threshold || 0.0}`);
    console.log(`Normalize: ${params.normalize !== undefined ? params.normalize : true}`);
    if (params.field_name) {
        console.log(`Field Name: ${params.field_name}`);
    }
    console.log('='.repeat(80) + '\n');
}

// Main function
async function main() {
    console.log('=== hlquery Vector Search Example ===\n');
    
    // Create client
    const client = new Client(baseUrl);
    if (testToken) {
        client.setAuthToken(testToken, 'bearer');
        console.log(`Using authentication token: ${testToken.substring(0, 8)}...\n`);
    }
    
    // Collection names
    const collections = [
        'products',
        'articles',
        'images',
        'documents'
    ];
    
    // Collection schemas with vector fields
    const schemas = {
        products: {
            fields: [
                { name: 'name', type: 'string' },
                { name: 'description', type: 'string' },
                { name: 'embedding', type: 'float[]' }
            ]
        },
        articles: {
            fields: [
                { name: 'title', type: 'string' },
                { name: 'content', type: 'string' },
                { name: 'embedding', type: 'float[]' }
            ]
        },
        images: {
            fields: [
                { name: 'filename', type: 'string' },
                { name: 'caption', type: 'string' },
                { name: 'embedding', type: 'float[]' }
            ]
        },
        documents: {
            fields: [
                { name: 'title', type: 'string' },
                { name: 'text', type: 'string' },
                { name: 'embedding', type: 'float[]' }
            ]
        }
    };
    
    // Generate base vectors for each collection (for creating related documents)
    const baseVectors = {};
    collections.forEach(col => {
        baseVectors[col] = generateRandomVector(128);
    });
    
    // ----------------------------------------------------------------====================================
    // CREATE COLLECTIONS
    // ----------------------------------------------------------------====================================
    console.log('\n' + '#'.repeat(80));
    console.log('# CREATING COLLECTIONS');
    console.log('#'.repeat(80) + '\n');
    
    for (const collectionName of collections) {
        try {
            // Check if collection exists, delete if it does
            const existing = await client.getCollection(collectionName);
            if (existing.getStatusCode() === 200) {
                console.log(`Collection ${collectionName} exists, deleting...`);
                await client.collections().delete(collectionName);
            }
        } catch (e) {
            // Collection doesn't exist, that's fine
        }
        
        // Create collection
        const createResult = await client.collections().create(collectionName, schemas[collectionName]);
        if (createResult.isSuccess()) {
            console.log(`✓ Created collection: ${collectionName}`);
        } else {
            console.log(`✗ Failed to create collection: ${collectionName}`);
            console.log(`  Error: ${createResult.getError()}`);
        }
    }
    console.log('');
    
    // ----------------------------------------------------------------====================================
    // INSERT DOCUMENTS
    // ----------------------------------------------------------------====================================
    console.log('\n' + '#'.repeat(80));
    console.log('# INSERTING DOCUMENTS');
    console.log('#'.repeat(80) + '\n');
    
    const allDocuments = {};
    
    for (const collectionName of collections) {
        console.log(`Inserting documents into ${collectionName}...`);
        const documents = [];
        const baseVector = baseVectors[collectionName];
        
        for (let i = 1; i <= 10; i++) {
            // Create documents with varying similarity to base vector
            const similarity = 0.5 + (i / 10) * 0.4; // Range from 0.5 to 0.9
            const embedding = generateRelatedVector(baseVector, similarity);
            
            let doc;
            switch (collectionName) {
                case 'products':
                    doc = {
                        id: `product_${i}`,
                        name: `Product ${i}`,
                        description: `This is product number ${i} with similarity ${similarity.toFixed(2)}`,
                        embedding: embedding
                    };
                    break;
                case 'articles':
                    doc = {
                        id: `article_${i}`,
                        title: `Article ${i}`,
                        content: `This is article number ${i} with similarity ${similarity.toFixed(2)}`,
                        embedding: embedding
                    };
                    break;
                case 'images':
                    doc = {
                        id: `image_${i}`,
                        filename: `image_${i}.jpg`,
                        caption: `Image ${i} with similarity ${similarity.toFixed(2)}`,
                        embedding: embedding
                    };
                    break;
                case 'documents':
                    doc = {
                        id: `doc_${i}`,
                        title: `Document ${i}`,
                        text: `This is document number ${i} with similarity ${similarity.toFixed(2)}`,
                        embedding: embedding
                    };
                    break;
            }
            
            documents.push(doc);
        }
        
        // Bulk import
        const importResult = await client.documents().import(collectionName, documents);
        if (importResult.isSuccess()) {
            console.log(`✓ Inserted ${documents.length} documents into ${collectionName}`);
            allDocuments[collectionName] = documents;
        } else {
            console.log(`✗ Failed to insert documents into ${collectionName}`);
            console.log(`  Error: ${importResult.getError()}`);
        }
    }
    console.log('');
    
    // Wait a bit for indexing
    console.log('Waiting for documents to be indexed...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('');
    
    // ----------------------------------------------------------------====================================
    // VECTOR SEARCH - Find Similar Documents
    // ----------------------------------------------------------------====================================
    console.log('\n' + '#'.repeat(80));
    console.log('# VECTOR SEARCH - Finding Relationships');
    console.log('#'.repeat(80) + '\n');
    
    // Test 1: Search in products collection using base vector
    console.log('TEST 1: Search in products collection using base vector\n');
    const productsQuery = baseVectors.products;
    printVectorQuery('products', productsQuery, { limit: 5, threshold: 0.0, normalize: true });
    
    const productsSearch = await client.vectorSearch('products', {
        vector_query: productsQuery,
        limit: 5,
        threshold: 0.0,
        normalize: true
    });
    
    if (productsSearch.isSuccess()) {
        const body = productsSearch.getBody();
        console.log('RESULTS:');
        if (body.hits && body.hits.length > 0) {
            body.hits.forEach((hit, index) => {
                console.log(`\n  ${index + 1}. Document ID: ${hit.document?.id || hit.id}`);
                console.log(`     Name: ${hit.document?.name || 'N/A'}`);
                console.log(`     Similarity Score: ${hit.similarity_score !== undefined ? hit.similarity_score.toFixed(4) : 'N/A'}`);
                if (hit.document?.embedding) {
                    const emb = hit.document.embedding;
                    if (Array.isArray(emb) && emb.length > 0) {
                        console.log(`     Embedding (first 5): [${emb.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
                    }
                }
            });
        } else {
            console.log('  No results found');
        }
        console.log(`\nTotal found: ${body.found || 0}`);
    } else {
        console.log(`✗ Search failed: ${productsSearch.getError()}`);
    }
    console.log('');
    
    // Test 2: Search in articles collection using a related vector
    console.log('TEST 2: Search in articles collection using related vector\n');
    const articlesQuery = generateRelatedVector(baseVectors.articles, 0.85);
    printVectorQuery('articles', articlesQuery, { limit: 5, threshold: 0.5, normalize: true });
    
    const articlesSearch = await client.vectorSearch('articles', {
        vector_query: articlesQuery,
        limit: 5,
        threshold: 0.5,
        normalize: true
    });
    
    if (articlesSearch.isSuccess()) {
        const body = articlesSearch.getBody();
        console.log('RESULTS:');
        if (body.hits && body.hits.length > 0) {
            body.hits.forEach((hit, index) => {
                console.log(`\n  ${index + 1}. Document ID: ${hit.document?.id || hit.id}`);
                console.log(`     Title: ${hit.document?.title || 'N/A'}`);
                console.log(`     Similarity Score: ${hit.similarity_score !== undefined ? hit.similarity_score.toFixed(4) : 'N/A'}`);
            });
        } else {
            console.log('  No results found (threshold too high)');
        }
        console.log(`\nTotal found: ${body.found || 0}`);
    } else {
        console.log(`✗ Search failed: ${articlesSearch.getError()}`);
    }
    console.log('');
    
    // Test 3: Cross-collection search - find similar documents across collections
    console.log('TEST 3: Cross-collection search - Find similar documents in images collection\n');
    const imagesQuery = baseVectors.images;
    printVectorQuery('images', imagesQuery, { limit: 10, threshold: 0.0, normalize: true });
    
    const imagesSearch = await client.vectorSearch('images', {
        vector_query: imagesQuery,
        limit: 10,
        threshold: 0.0,
        normalize: true
    });
    
    if (imagesSearch.isSuccess()) {
        const body = imagesSearch.getBody();
        console.log('RESULTS:');
        if (body.hits && body.hits.length > 0) {
            body.hits.forEach((hit, index) => {
                console.log(`\n  ${index + 1}. Document ID: ${hit.document?.id || hit.id}`);
                console.log(`     Filename: ${hit.document?.filename || 'N/A'}`);
                console.log(`     Caption: ${hit.document?.caption || 'N/A'}`);
                console.log(`     Similarity Score: ${hit.similarity_score !== undefined ? hit.similarity_score.toFixed(4) : 'N/A'}`);
            });
        } else {
            console.log('  No results found');
        }
        console.log(`\nTotal found: ${body.found || 0}`);
    } else {
        console.log(`✗ Search failed: ${imagesSearch.getError()}`);
    }
    console.log('');
    
    // Test 4: Search with high threshold to find only very similar documents
    console.log('TEST 4: High threshold search - Find only very similar documents\n');
    const documentsQuery = baseVectors.documents;
    printVectorQuery('documents', documentsQuery, { limit: 5, threshold: 0.7, normalize: true });
    
    const documentsSearch = await client.vectorSearch('documents', {
        vector_query: documentsQuery,
        limit: 5,
        threshold: 0.7,
        normalize: true
    });
    
    if (documentsSearch.isSuccess()) {
        const body = documentsSearch.getBody();
        console.log('RESULTS:');
        if (body.hits && body.hits.length > 0) {
            body.hits.forEach((hit, index) => {
                console.log(`\n  ${index + 1}. Document ID: ${hit.document?.id || hit.id}`);
                console.log(`     Title: ${hit.document?.title || 'N/A'}`);
                console.log(`     Similarity Score: ${hit.similarity_score !== undefined ? hit.similarity_score.toFixed(4) : 'N/A'}`);
            });
        } else {
            console.log('  No results found (threshold too high - no documents with similarity > 0.7)');
        }
        console.log(`\nTotal found: ${body.found || 0}`);
    } else {
        console.log(`✗ Search failed: ${documentsSearch.getError()}`);
    }
    console.log('');
    
    // Test 5: Find relationships between collections
    console.log('TEST 5: Find relationships - Search products using articles base vector\n');
    const crossQuery = baseVectors.articles;
    printVectorQuery('products', crossQuery, { 
        limit: 3, 
        threshold: 0.0, 
        normalize: true,
        note: 'Using articles base vector to search products (cross-collection similarity)'
    });
    
    const crossSearch = await client.vectorSearch('products', {
        vector_query: crossQuery,
        limit: 3,
        threshold: 0.0,
        normalize: true
    });
    
    if (crossSearch.isSuccess()) {
        const body = crossSearch.getBody();
        console.log('RESULTS (Cross-collection similarity):');
        if (body.hits && body.hits.length > 0) {
            body.hits.forEach((hit, index) => {
                console.log(`\n  ${index + 1}. Document ID: ${hit.document?.id || hit.id}`);
                console.log(`     Name: ${hit.document?.name || 'N/A'}`);
                console.log(`     Similarity Score: ${hit.similarity_score !== undefined ? hit.similarity_score.toFixed(4) : 'N/A'}`);
                console.log(`     Note: Lower scores indicate less similarity across collections`);
            });
        } else {
            console.log('  No results found');
        }
        console.log(`\nTotal found: ${body.found || 0}`);
    } else {
        console.log(`✗ Search failed: ${crossSearch.getError()}`);
    }
    console.log('');
    
    // ----------------------------------------------------------------====================================
    // SUMMARY
    // ----------------------------------------------------------------====================================
    console.log('\n' + '#'.repeat(80));
    console.log('# SUMMARY');
    console.log('#'.repeat(80) + '\n');
    
    console.log('Created Collections:');
    collections.forEach(col => {
        console.log(`  - ${col}`);
    });
    console.log('');
    
    console.log('Documents Inserted:');
    collections.forEach(col => {
        const count = allDocuments[col] ? allDocuments[col].length : 0;
        console.log(`  - ${col}: ${count} documents`);
    });
    console.log('');
    
    console.log('Vector Search Tests Performed:');
    console.log('  1. Products collection search (base vector, threshold 0.0)');
    console.log('  2. Articles collection search (related vector, threshold 0.5)');
    console.log('  3. Images collection search (base vector, all results)');
    console.log('  4. Documents collection search (base vector, high threshold 0.7)');
    console.log('  5. Cross-collection search (articles vector → products collection)');
    console.log('');
    
    console.log('Key Observations:');
    console.log('  - Documents with higher similarity scores are more related');
    console.log('  - Threshold parameter filters results by minimum similarity');
    console.log('  - Vector normalization ensures consistent similarity calculations');
    console.log('  - Cross-collection searches can find relationships across different data types');
    console.log('');
    
    console.log('Usage: node examples/vector.js [token]');
    console.log('');
}

// Run main function
main().catch(error => {
    console.error('Fatal error:', error);
    if (error.stack) {
        console.error(error.stack);
    }
    process.exit(1);
});
