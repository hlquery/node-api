/**
 * Documents Examples
 * 
 * Demonstrates document CRUD operations
 */

const Client = require('../lib/Client');

async function main() {
    const client = new Client('http://localhost:9200');
    
    // List documents
    const docs = await client.documents().list('collection', {
        offset: 0,
        limit: 10
    });
    console.log('Documents:', docs.getBody());
    
    // Get document
    const doc = await client.documents().get('collection', 'doc_id');
    console.log('Document:', doc.getBody());
    
    // Add document
    const newDoc = {
        id: 'doc_1',
        title: 'New Document',
        content: 'Document content'
    };
    const addResult = await client.documents().add('collection', newDoc);
    console.log('Add result:', addResult.getBody());
    
    // Update document
    const updatedDoc = {
        title: 'Updated Document',
        content: 'Updated content'
    };
    const updateResult = await client.documents().update('collection', 'doc_id', updatedDoc);
    console.log('Update result:', updateResult.getBody());
    
    // Delete document
    const deleteResult = await client.documents().delete('collection', 'doc_id');
    console.log('Delete result:', deleteResult.getBody());
    
    // Bulk import
    const bulkDocs = [
        { id: 'doc1', title: 'Doc 1' },
        { id: 'doc2', title: 'Doc 2' },
        { id: 'doc3', title: 'Doc 3' }
    ];
    const importResult = await client.documents().import('collection', bulkDocs);
    console.log('Import result:', importResult.getBody());
}

main().catch(console.error);
