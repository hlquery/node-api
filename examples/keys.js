/**
 * hlquery Node.js Example - API Keys Management
 * 
 * This example demonstrates how to create, list, and delete API keys.
 */

const Client = require('../index');

// Replace with your hlquery master admin token
const ADMIN_TOKEN = 'your_admin_token_here';
const BASE_URL = 'http://localhost:9200';

async function run() {
    try {
        const client = new Client(BASE_URL);
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
