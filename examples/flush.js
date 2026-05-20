/**
 * Flush Example
 *
 * Demonstrates the flush operation:
 * 1. Create a fake collection
 * 2. Create a fake document
 * 3. Check collection count
 * 4. Flush all data
 * 5. Re-check collection count (should be 0)
 */

const Client = require('../lib/Client');

async function main() {
    const baseUrl = process.argv[2] || process.env.HLQ_BASE_URL || process.env.HLQUERY_BASE_URL || 'http://localhost:9200';
    const token = process.argv[3] || process.env.HLQUERY_TOKEN || null;
    const client = new Client(baseUrl);

    if (token) {
        client.setAuthToken(token, 'bearer');
    }

    console.log('='.repeat(70));
    console.log('FLUSH EXAMPLE');
    console.log('='.repeat(70));
    console.log();

    // Step 1: Create a fake collection
    console.log('Step 1: Creating a fake collection...');
    const collection_name = 'flush_test_collection_' + Date.now();

    const schema = {
        fields: [
            { name: 'title', type: 'string' },
            { name: 'content', type: 'string' },
            { name: 'value', type: 'int' }
        ]
    };

    const create_result = await client.collections().create(collection_name, schema);
    if (create_result.isSuccess()) {
        console.log(`  ✓ Collection '${collection_name}' created successfully`);
    } else {
        console.log(`  ✗ Failed to create collection: ${create_result.getStatusCode()}`);
        console.log(`  Error: ${JSON.stringify(create_result.getBody(), null, 2)}`);
        process.exit(1);
    }

    console.log();

    // Step 2: Create a fake document
    console.log('Step 2: Creating a fake document...');
    const doc = {
        id: 'flush_test_doc_' + Date.now(),
        title: 'Flush Test Document',
        content: 'This is a test document for flush example',
        value: 42
    };

    const add_result = await client.documents().add(collection_name, doc);
    if (add_result.isSuccess()) {
        console.log(`  ✓ Document '${doc.id}' added successfully`);
    } else {
        console.log(`  ✗ Failed to add document: ${add_result.getStatusCode()}`);
        console.log(`  Error: ${JSON.stringify(add_result.getBody(), null, 2)}`);
    }

    console.log();

    // Step 3: Check collection count before flush
    console.log('Step 3: Checking collection count before flush...');
    const collections_before = await client.listCollections(0, 1000);
    let count_before = 0;
    if (collections_before.isSuccess()) {
        const body = collections_before.getBody();
        const collections_list = body.collections || [];
        count_before = collections_list.length;
        console.log(`  Collections before flush: ${count_before}`);
        if (count_before === 0) {
            console.log('  ⚠ Warning: No collections found before flush');
        }
    } else {
        console.log(`  ✗ Failed to list collections: ${collections_before.getStatusCode()}`);
    }

    console.log();

    // Step 4: Flush all data
    console.log('Step 4: Flushing all data...');
    const flush_result = await client.flush();
    if (flush_result.isSuccess()) {
        const body = flush_result.getBody();
        const collections_deleted = body.collections_deleted || 0;
        console.log('  ✓ Flush completed successfully');
        console.log(`  Collections deleted: ${collections_deleted}`);
        console.log(`  Message: ${body.message || 'N/A'}`);
    } else {
        console.log(`  ✗ Flush failed: ${flush_result.getStatusCode()}`);
        console.log(`  Error: ${JSON.stringify(flush_result.getBody(), null, 2)}`);
        process.exit(1);
    }

    console.log();

    // Step 5: Re-check collection count after flush
    console.log('Step 5: Checking collection count after flush...');
    const collections_after = await client.listCollections(0, 1000);
    let count_after = -1;
    if (collections_after.isSuccess()) {
        const body = collections_after.getBody();
        const collections_list = body.collections || [];
        count_after = collections_list.length;
        console.log(`  Collections after flush: ${count_after}`);
        
        if (count_after === 0) {
            console.log('  ✓ SUCCESS: All collections have been flushed');
        } else {
            console.log(`  ⚠ Warning: Expected 0 collections, but found ${count_after}`);
        }
    } else {
        console.log(`  ✗ Failed to list collections: ${collections_after.getStatusCode()}`);
    }

    console.log();
    console.log('='.repeat(70));
    console.log('FLUSH EXAMPLE COMPLETED');
    console.log('='.repeat(70));
    console.log('Summary:');
    console.log(`  Collections before flush: ${count_before}`);
    console.log(`  Collections after flush: ${count_after}`);
    console.log();
}

main().catch(console.error);
