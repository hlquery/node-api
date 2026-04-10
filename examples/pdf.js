/**
 * PDF Parsing Example
 *
 * Usage:
 *   npm install
 *   node examples/pdf.js <collection> <pdf-path> [token]
 */

const path = require('path');
const Client = require('../lib/Client');

async function main() {
    const [, , collectionName, pdfPath, token] = process.argv;

    if (!collectionName || !pdfPath) {
        console.error('Usage: node examples/pdf.js <collection> <pdf-path> [token]');
        process.exit(1);
    }

    const client = new Client('http://localhost:9200');

    if (token) {
        client.setAuthToken(token, 'bearer');
    }

    const response = await client.documents().addPDF(collectionName, pdfPath, {
        document: {
            source_type: 'pdf',
            source_path: path.resolve(pdfPath)
        }
    });

    console.log(`Status: ${response.getStatusCode()}`);
    console.log(JSON.stringify(response.getBody(), null, 2));
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
