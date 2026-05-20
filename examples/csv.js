/**
 * CSV Parsing Example
 *
 * Usage:
 *   node examples/csv.js <collection> <csv-path> [base-url] [token]
 */

const path = require('path');
const Client = require('../lib/Client');

async function main() {
    const [, , collectionName, csvPath, baseUrlArg, tokenArg] = process.argv;

    if (!collectionName || !csvPath) {
        console.error('Usage: node examples/csv.js <collection> <csv-path> [base-url] [token]');
        process.exit(1);
    }

    const baseUrl = baseUrlArg || process.env.HLQ_BASE_URL || process.env.HLQUERY_BASE_URL || 'http://localhost:9200';
    const token = tokenArg || process.env.HLQUERY_TOKEN || null;
    const client = new Client(baseUrl);

    if (token) {
        client.setAuthToken(token, 'bearer');
    }

    const response = await client.documents().addCSV(collectionName, csvPath, {
        document: {
            source_type: 'csv',
            source_path: path.resolve(csvPath)
        }
    });

    console.log(`Status: ${response.getStatusCode()}`);
    console.log(JSON.stringify(response.getBody(), null, 2));
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
