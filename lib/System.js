/**
 * hlquery Node.js Client - System API
 *
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 *
 * This file is part of hlquery, released under the BSD License version 3.
 */

/**
 * System and operational API operations
 */
class System {
    constructor(request) {
        this.request = request;
    }

    async health() {
        return await this.request.execute('GET', '/health');
    }

    async status() {
        return await this.request.execute('GET', '/status');
    }

    async startup() {
        return await this.request.execute('GET', '/startup');
    }

    async bootStatus() {
        return await this.request.execute('GET', '/boot-status');
    }

    async ready() {
        return await this.request.execute('GET', '/ready');
    }

    async info() {
        return await this.request.execute('GET', '/');
    }

    async stats() {
        return await this.request.execute('GET', '/stats');
    }

    async metrics() {
        return await this.request.execute('GET', '/metrics');
    }

    async metricsJson() {
        return await this.request.execute('GET', '/metrics.json');
    }

    async metricsHistory() {
        return await this.request.execute('GET', '/metrics/history');
    }

    async metricsHistoryAlias() {
        return await this.request.execute('GET', '/metrics-history');
    }

    async connections() {
        return await this.request.execute('GET', '/connections');
    }

    async rocksdb() {
        return await this.request.execute('GET', '/rocksdb');
    }

    async rocksdbInternal() {
        return await this.request.execute('GET', '/_rocksdb');
    }

    async docTotal() {
        return await this.request.execute('GET', '/doctotal');
    }

    async etc() {
        return await this.request.execute('GET', '/etc');
    }

    async sql(sql, params = {}) {
        if (typeof sql !== 'string' || sql.trim() === '') {
            throw new Error('SQL query must be a non-empty string');
        }

        if (params === null || typeof params !== 'object' || Array.isArray(params)) {
            throw new Error('SQL params must be an object');
        }

        return await this.request.execute('GET', '/sql', null, { ...params, sql });
    }

    async execSql(sql) {
        if (typeof sql !== 'string' || sql.trim() === '') {
            throw new Error('SQL query must be a non-empty string');
        }

        return await this.request.execute('POST', '/sql', { exec: sql });
    }

    async ping() {
        return await this.request.execute('GET', '/ping');
    }

    async integrity() {
        return await this.request.execute('GET', '/integrity');
    }

    async consistency() {
        return await this.request.execute('GET', '/consistency');
    }

    async selfCheck() {
        return await this.request.execute('GET', '/self-check');
    }

    async storageStatus() {
        return await this.request.execute('GET', '/admin/storage_status');
    }

    async searchConfig() {
        return await this.request.execute('GET', '/search-config');
    }

    async llm() {
        return await this.request.execute('GET', '/llm');
    }

    async updateCounters(params = {}) {
        return await this.request.execute('POST', '/update-counters', null, params);
    }

    async debugCounters() {
        return await this.request.execute('GET', '/debug/counters');
    }

    async repair(params = {}) {
        return await this.request.execute('POST', '/repair', null, params);
    }
}

module.exports = System;
