/**
 * hlquery Node.js Example - API Keys Management
 * 
 * This example demonstrates how to create, list, and delete API keys.
 */

const Client = require('../index');

const ADMIN_TOKEN = process.argv[2] || process.env.HLQUERY_ADMIN_TOKEN || process.env.HLQUERY_TOKEN || null;
const BASE_URL = process.argv[3] || process.env.HLQ_BASE_URL || process.env.HLQUERY_BASE_URL || 'http://localhost:9200';

async function run() {
    try {
        const client = new Client(BASE_URL);
        if (!ADMIN_TOKEN) {
            throw new Error('Admin token required. Pass it as argv[2] or set HLQUERY_ADMIN_TOKEN.');
        }
        client.setAuthToken(ADMIN_TOKEN);

        console.log('1. Creating a scoped search key for "products" collection...');
        const createResp = await client.keys().create({
            description: 'Public search key for products',
            collections: ['products'],
            actions: ['search'],
            embedded_filters: 'is_public:=true'
        });

        if (createResp.getStatusCode() === 201) {
            const newKey = createResp.getBody().key;
            const keyId = createResp.getBody().id;
            console.log(`   ✓ Key created: ${newKey}`);
            console.log(`   ✓ Key ID: ${keyId}`);

            console.log('\n2. Listing all API keys...');
            const listResp = await client.keys().list();
            console.log(`   ✓ Found ${listResp.getBody().keys.length} keys`);

            console.log('\n3. Getting key details...');
            const getResp = await client.keys().get(keyId);
            console.log(`   ✓ Key description: ${getResp.getBody().description}`);

            console.log('\n4. Updating key permissions...');
            await client.keys().update(keyId, {
                actions: ['search', 'create']
            });
            console.log('   ✓ Permissions updated');

            console.log('\n5. Deleting the key...');
            await client.keys().delete(keyId);
            console.log('   ✓ Key deleted');
        } else {
            console.error('   ✗ Failed to create key:', createResp.getBody());
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

run();
