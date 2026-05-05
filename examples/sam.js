/**
 * Basic SAM example for the hlquery Node.js client.
 */

const Client = require('../index');

async function main() {
    const baseUrl = process.env.HLQ_BASE_URL || process.env.HLQUERY_BASE_URL || 'http://localhost:9200';
    const token = process.argv[2] || null;
    const collection = process.argv[3] || 'music';
    const query = process.argv[4] || 'queen of pop';

    const client = new Client(baseUrl);

    if (token) {
        client.setAuthToken(token, 'bearer');
    }

    const sam = client.sam();

    const status = await sam.status(collection);
    console.log('=== SAM STATUS ===');
    console.log(status.getBody());
    console.log('');

    const history = await sam.history(collection, 5);
    console.log('=== SAM HISTORY ===');
    console.log(history.getBody());
    console.log('');

    const results = await sam.search(collection, query, { limit: 10 });
    console.log('=== SAM SEARCH ===');
    console.log(results.getBody());
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
