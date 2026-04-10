/**
 * Collections Examples
 * 
 * Demonstrates collection management operations
 */

const Client = require('../lib/Client');

async function main() {
    const client = new Client('http://localhost:9200');
    
    // List collections
    const collections = await client.collections().list(0, 10);
    console.log('Collections:', collections.getBody());
    
    // Get collection
    const collection = await client.collections().get('my_collection');
    console.log('Collection details:', collection.getBody());
    
    // Create collection
    const schema = {
        fields: [
            { name: 'title', type: 'string' },
            { name: 'content', type: 'string' },
            { name: 'embedding', type: 'float[]' }
        ]
    };
    const createResult = await client.collections().create('new_collection', schema);
    console.log('Create result:', createResult.getBody());
    
    // Get formatted fields
    const fields = await client.collections().getFields('my_collection');
    console.log('Formatted fields:', fields.getBody());
    
    // Delete collection
    const deleteResult = await client.collections().delete('collection_name');
    console.log('Delete result:', deleteResult.getBody());
}

main().catch(console.error);
