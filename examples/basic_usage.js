/**
 * Basic Usage Examples
 * 
 * Demonstrates basic operations with the hlquery Node.js client
 */

const Client = require('../lib/Client');

async function main() {
    // Initialize client
    const client = new Client('http://localhost:9200');
    
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
    
    // With authentication
    const authenticatedClient = new Client('http://localhost:9200', {
        token: 'your_token_here',
        auth_method: 'bearer'
    });
    
    // Or set token dynamically
    client.setAuthToken('your_token_here', 'bearer');
}

main().catch(console.error);
