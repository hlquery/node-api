/**
 * SQL Examples
 *
 * Demonstrates top-level and collection-bound SQL usage with the hlquery Node.js client
 */

const Client = require('../lib/Client');

async function main() {
    const client = new Client('http://localhost:9200');

    // Top-level SQL through /sql
    const rows = await client.sql('SHOW COLLECTIONS;');
    console.log('SHOW COLLECTIONS:', rows.getBody());

    // Top-level SQL statement execution through POST /sql
    const execResult = await client.execSql(
        "INSERT INTO logs_archive (id, title) VALUES ('row-1', 'warm cache');"
    );
    console.log('Exec result:', execResult.getBody());

    // Collection-bound SQL SELECT through /collections/{name}/documents/search
    const products = await client.sqlSearch(
        'products',
        'SELECT id, title, price FROM products WHERE price > 100 ORDER BY price DESC LIMIT 3;',
        { highlight: false }
    );
    console.log('Products SQL results:', products.getBody());
}

main().catch(console.error);
