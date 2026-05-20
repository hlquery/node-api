/**
 * SQL Examples
 *
 * Demonstrates top-level and collection-bound SQL usage with the hlquery Node.js client
 */

const Client = require('../lib/Client');

async function main() {
    const baseUrl = process.argv[2] || process.env.HLQ_BASE_URL || process.env.HLQUERY_BASE_URL || 'http://localhost:9200';
    const token = process.argv[3] || process.env.HLQUERY_TOKEN || null;
    const collectionName = `node_sql_example_${process.pid}`;
    const client = new Client(baseUrl);

    if (token) {
        client.setAuthToken(token, 'bearer');
    }

    await client.collections().delete(collectionName);
    await client.collections().create(collectionName, {
        fields: [
            { name: 'title', type: 'string' },
            { name: 'category', type: 'string' },
            { name: 'price', type: 'float' }
        ]
    });
    await client.documents().import(collectionName, [
        { id: 'book_1', title: 'Algebra Basics', category: 'math', price: 19.99 },
        { id: 'book_2', title: 'Geometry Proofs', category: 'math', price: 29.99 },
        { id: 'book_3', title: 'Cooking Basics', category: 'food', price: 14.99 }
    ]);

    // Top-level SQL through /sql
    const rows = await client.sql('SHOW COLLECTIONS;');
    console.log('SHOW COLLECTIONS:', rows.getBody());

    // Top-level SQL statement execution through POST /sql
    const execResult = await client.execSql(
        `INSERT INTO ${collectionName} (id, title, category, price) VALUES ('book_4', 'Inserted via SQL', 'ops', 39.99);`
    );
    console.log('Exec result:', execResult.getBody());

    // Collection-bound SQL SELECT through /collections/{name}/documents/search
    const books = await client.sqlSearch(
        collectionName,
        `SELECT id, title, price FROM ${collectionName} WHERE price > 10 ORDER BY price DESC LIMIT 3;`,
        { highlight: false }
    );
    console.log('Books SQL results:', books.getBody());

    const cleanup = await client.collections().delete(collectionName);
    console.log('Cleanup:', cleanup.getBody());
}

main().catch(console.error);
