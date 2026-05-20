/**
 * Collections Examples
 * 
 * Demonstrates collection management operations
 */

const Client = require('../lib/Client');

async function main() {
    const baseUrl = process.argv[2] || process.env.HLQ_BASE_URL || process.env.HLQUERY_BASE_URL || 'http://localhost:9200';
    const token = process.argv[3] || process.env.HLQUERY_TOKEN || null;
    const client = new Client(baseUrl);
    const collectionName = `node_collections_example_${process.pid}`;

    if (token) {
        client.setAuthToken(token, 'bearer');
    }
    
    // List collections
    const collections = await client.collections().list(0, 10);
    console.log('Collections:', collections.getBody());
    
    // Create collection
    const schema = {
        fields: [
            { name: 'title', type: 'string' },
            { name: 'content', type: 'string' },
            { name: 'embedding', type: 'float[]' }
        ]
    };
    const createResult = await client.collections().create(collectionName, schema);
    console.log('Create result:', createResult.getBody());

    // Get collection
    const collection = await client.collections().get(collectionName);
    console.log('Collection details:', collection.getBody());
    
    // Get formatted fields
    const fields = await client.collections().getFields(collectionName);
    console.log('Formatted fields:', fields.getBody());
    
    // Delete collection
    const deleteResult = await client.collections().delete(collectionName);
    console.log('Delete result:', deleteResult.getBody());
}

main().catch(console.error);
