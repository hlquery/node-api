/**
 * Search Examples
 * 
 * Demonstrates various search patterns with the hlquery Node.js client
 */

const Client = require('../lib/Client');

async function main() {
    const baseUrl = process.argv[2] || process.env.HLQ_BASE_URL || process.env.HLQUERY_BASE_URL || 'http://localhost:9200';
    const token = process.argv[3] || process.env.HLQUERY_TOKEN || null;
    const collectionName = process.argv[4] || `node_search_example_${process.pid}`;
    const client = new Client(baseUrl);
    const search = client.searchApi();

    if (token) {
        client.setAuthToken(token, 'bearer');
    }

    await client.collections().delete(collectionName);
    await client.collections().create(collectionName, {
        fields: [
            { name: 'title', type: 'string' },
            { name: 'content', type: 'string' },
            { name: 'category', type: 'string' },
            { name: 'price', type: 'float' },
            { name: 'embedding', type: 'float[]' }
        ]
    });
    await client.documents().import(collectionName, [
        { id: 'prod_laptop_001', title: 'Laptop Computer', content: 'Portable work machine', category: 'electronics', price: 1299.99, embedding: [0.1, 0.2, 0.3, 0.4, 0.5] },
        { id: 'prod_keyboard_001', title: 'Wireless Keyboard', content: 'Compact Bluetooth keyboard', category: 'electronics', price: 49.99, embedding: [0.2, 0.1, 0.4, 0.3, 0.5] },
        { id: 'prod_notebook_001', title: 'Paper Notebook', content: 'Plain paper writing notebook', category: 'office', price: 9.99, embedding: [0.5, 0.4, 0.3, 0.2, 0.1] }
    ]);
    
    // Simple search. The SDK uses the canonical /collections/{name}/search route.
    const results = await search.search(collectionName, {
        q: 'search query',
        query_by: 'title,content',
        limit: 10
    });
    
    // Search with filters
    const filteredResults = await client.search(collectionName, {
        q: 'query',
        query_by: 'title',
        filter_by: 'category:electronics',
        sort_by: 'price:asc',
        limit: 20
    });
    
    // Supported query semantics
    // Field-specific search
    const fieldResults = await client.search(collectionName, {
        q: 'title:laptop',
        query_by: 'title,content',
        limit: 10
    });
    
    // Boolean OR query
    const orResults = await client.search(collectionName, {
        q: 'title:laptop OR title:notebook',
        query_by: 'title,content',
        limit: 10
    });
    
    // Boolean NOT query
    const notResults = await client.search(collectionName, {
        q: 'title:laptop NOT title:refurbished',
        query_by: 'title,content',
        limit: 10
    });
    
    // Phrase search
    const phraseResults = await client.search(collectionName, {
        q: '"wireless keyboard"',
        query_by: 'title',
        limit: 10
    });
    
    // Wildcard search
    const wildcardResults = await client.search(collectionName, {
        q: 'laptop*',
        query_by: 'title,content',
        limit: 10
    });
    
    // query_by restriction
    const restrictedResults = await client.search(collectionName, {
        q: 'laptop',
        query_by: 'title',
        limit: 10
    });
    
    // Filter operators belong in filter_by
    const combinedResults = await client.search(collectionName, {
        q: '*',
        query_by: 'title,content',
        filter_by: 'price:>100&&category:electronics',
        limit: 10
    });
    
    // Vector search
    const vectorResults = await client.vectorSearch(collectionName, {
        body: {
            vector: [0.1, 0.2, 0.3, 0.4, 0.5],
            field_name: 'embedding',
            topk: 10,
            threshold: 0.5,
            include_distance: true,
            query_params: { ef: 64, nprobe: 4, is_linear: true }
        }
    });
    
    // Multi-search
    const multiResults = await search.multiSearch([
        { collection: collectionName, q: 'laptop', query_by: 'title' },
        { collection: collectionName, q: 'keyboard', query_by: 'content' }
    ]);
    
    console.log('Search results:', results.getBody());
    console.log('Filtered results:', filteredResults.getBody());
    console.log('Field results:', fieldResults.getBody());
    console.log('Boolean OR results:', orResults.getBody());
    console.log('Boolean NOT results:', notResults.getBody());
    console.log('Phrase results:', phraseResults.getBody());
    console.log('Wildcard results:', wildcardResults.getBody());
    console.log('Restricted results:', restrictedResults.getBody());
    console.log('Combined results:', combinedResults.getBody());
    console.log('Vector results:', vectorResults.getBody());
    console.log('Multi-search results:', multiResults.getBody());

    await client.collections().delete(collectionName);
}

main().catch(console.error);
