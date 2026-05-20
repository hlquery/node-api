/**
 * Basic Usage Examples
 * 
 * Demonstrates basic operations with the hlquery Node.js client
 */

const Client = require('../lib/Client');

async function main() {
    const baseUrl = process.argv[2] || process.env.HLQ_BASE_URL || process.env.HLQUERY_BASE_URL || 'http://localhost:9200';
    const token = process.argv[3] || process.env.HLQUERY_TOKEN || null;

    // Initialize client
    const client = new Client(baseUrl);

    if (token) {
        client.setAuthToken(token, 'bearer');
    }
    
    // Health check
    const health = await client.health();
    console.log('Health Status:', health.getStatusCode());
    console.log('Health Body:', health.getBody());
    
    // List collections
    const collections = await client.listCollections(0, 10);
    if (collections.isSuccess()) {
        const body = collections.getBody();
        console.log(`Found ${body.collections ? body.collections.length : 0} collections`);
    }
    
    console.log('Base URL:', baseUrl);
}

main().catch(console.error);
