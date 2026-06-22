'use strict';

const assert = require('assert');
const Request = require('../lib/Request');
const Search = require('../lib/Search');
const System = require('../lib/System');
const { NODE_CLIENT_ROUTE_COVERAGE } = require('../lib/conformance');

class RecordingRequest {
    constructor() {
        this.calls = [];
    }

    async execute(method, path, body = null, query = {}) {
        const call = { method, path, body, query };
        this.calls.push(call);
        return call;
    }

    last() {
        return this.calls[this.calls.length - 1];
    }
}

function route(path) {
    const matches = NODE_CLIENT_ROUTE_COVERAGE.filter(entry => entry.path === path);
    assert.strictEqual(matches.length, 1, `${path} must have exactly one conformance entry`);
    return matches[0];
}

async function main() {
    const routeKeys = new Set();
    for (const entry of NODE_CLIENT_ROUTE_COVERAGE) {
        assert.ok(entry.path.startsWith('/'), `route must be absolute-path scoped: ${entry.path}`);
        assert.ok(Array.isArray(entry.methods) && entry.methods.length > 0, `route must declare methods: ${entry.path}`);
        const key = `${entry.path}:${entry.methods.join(',')}`;
        assert.ok(!routeKeys.has(key), `duplicate conformance route: ${key}`);
        routeKeys.add(key);
    }

    const recorder = new RecordingRequest();
    const search = new Search(recorder, null);
    const system = new System(recorder);

    assert.deepStrictEqual(route('/multi_search').methods, ['GET', 'POST']);
    await search.multiSearch([], 'GET');
    assert.deepStrictEqual(recorder.last(), {
        method: 'GET', path: '/multi_search', body: { searches: [] }, query: {}
    });
    await search.multiSearch([], 'POST');
    assert.strictEqual(recorder.last().method, 'POST');

    for (const [path, invoke] of [
        ['/update-counters', method => system.updateCounters({ force: 1 }, method)],
        ['/repair', method => system.repair({ collection: 'books' }, method)]
    ]) {
        assert.deepStrictEqual(route(path).methods, ['GET', 'POST']);
        await invoke('GET');
        assert.strictEqual(recorder.last().method, 'GET');
        assert.strictEqual(recorder.last().path, path);
        await invoke('POST');
        assert.strictEqual(recorder.last().method, 'POST');
    }

    const request = new Request('https://search.example.test', {
        token: 'secret-token'
    });
    await assert.rejects(
        request.execute('GET', 'https://attacker.example.test/collect'),
        error => error && error.code === 'CROSS_ORIGIN_REQUEST'
    );
    await assert.rejects(
        request.execute('GET', '//attacker.example.test/collect'),
        error => error && error.code === 'CROSS_ORIGIN_REQUEST'
    );

    console.log(`route conformance passed (${NODE_CLIENT_ROUTE_COVERAGE.length} manifest entries)`);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
