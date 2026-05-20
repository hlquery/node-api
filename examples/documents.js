/**
 * Documents Examples
 * 
 * Demonstrates document CRUD operations
 */

const Client = require('../lib/Client');

async function main() {
    const baseUrl = process.argv[2] || process.env.HLQ_BASE_URL || process.env.HLQUERY_BASE_URL || 'http://localhost:9200';
    const token = process.argv[3] || process.env.HLQUERY_TOKEN || null;
    const client = new Client(baseUrl);
    const collectionName = `node_documents_example_${process.pid}`;

    if (token) {
        client.setAuthToken(token, 'bearer');
    }

    await client.collections().delete(collectionName);
    await client.collections().create(collectionName, {
        fields: [
            { name: 'title', type: 'string' },
            { name: 'content', type: 'string' }
        ]
    });

    // Add document
    const newDoc = {
        id: 'doc_1',
        title: 'New Document',
        content: 'Document content'
    };
    const addResult = await client.documents().add(collectionName, newDoc);
    console.log('Add result:', addResult.getBody());
    
    // List documents
    const docs = await client.documents().list(collectionName, {
        offset: 0,
        limit: 10
    });
    console.log('Documents:', docs.getBody());
    
    // Get document
    const doc = await client.documents().get(collectionName, 'doc_1');
    console.log('Document:', doc.getBody());
    
    // Update document
    const updatedDoc = {
        title: 'Updated Document',
        content: 'Updated content'
    };
    const updateResult = await client.documents().update(collectionName, 'doc_1', updatedDoc);
    console.log('Update result:', updateResult.getBody());
    
    // Delete document
    const deleteResult = await client.documents().delete(collectionName, 'doc_1');
    console.log('Delete result:', deleteResult.getBody());
    
    // Bulk import
    const bulkDocs = [
        { id: 'doc1', title: 'Doc 1' },
        { id: 'doc2', title: 'Doc 2' },
        { id: 'doc3', title: 'Doc 3' }
    ];
    const importResult = await client.documents().import(collectionName, bulkDocs);
    console.log('Import result:', importResult.getBody());

    const cleanup = await client.collections().delete(collectionName);
    console.log('Cleanup result:', cleanup.getBody());
}

main().catch(console.error);
