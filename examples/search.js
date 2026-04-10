/**
 * Search Examples
 * 
 * Demonstrates various search patterns with the hlquery Node.js client
 */

const Client = require('../lib/Client');

async function main() {
    const client = new Client('http://localhost:9200');
    const search = client.searchApi();
    
    // Simple search. The SDK uses the canonical /collections/{name}/search route.
    const results = await search.search('collection_name', {
        q: 'search query',
        query_by: 'title,content',
        limit: 10
    });
    
    // Search with filters
    const filteredResults = await client.search('collection_name', {
        q: 'query',
        query_by: 'title',
        filter_by: 'category:electronics',
        sort_by: 'price:asc',
        limit: 20
    });
    
    // Supported query semantics
    // Field-specific search
    const fieldResults = await client.search('collection_name', {
        q: 'title:laptop',
        query_by: 'title,content',
        limit: 10
    });
    
    // Boolean OR query
    const orResults = await client.search('collection_name', {
        q: 'title:laptop OR title:notebook',
        query_by: 'title,content',
        limit: 10
    });
    
    // Boolean NOT query
    const notResults = await client.search('collection_name', {
        q: 'title:laptop NOT title:refurbished',
        query_by: 'title,content',
        limit: 10
    });
    
    // Phrase search
    const phraseResults = await client.search('collection_name', {
        q: '"wireless keyboard"',
        query_by: 'title',
        limit: 10
    });
    
    // Wildcard search
    const wildcardResults = await client.search('collection_name', {
        q: 'laptop*',
        query_by: 'title,content',
        limit: 10
    });
    
    // query_by restriction
    const restrictedResults = await client.search('collection_name', {
        q: 'laptop',
        query_by: 'title',
        limit: 10
    });
    
    // Filter operators belong in filter_by
    const combinedResults = await client.search('collection_name', {
        q: '*',
        query_by: 'title,content',
        filter_by: 'price:>100&&category:electronics',
        limit: 10
    });
    
    // Vector search
    const vectorResults = await client.vectorSearch('collection_name', {
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
        { collection: 'col1', q: 'query1', query_by: 'title' },
        { collection: 'col2', q: 'query2', query_by: 'content' }
    ]);
    
    console.log('Search results:', results.getBody());
}

main().catch(console.error);
