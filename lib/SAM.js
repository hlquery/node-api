/**
 * hlquery Node.js Client - SAM API
 *
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 *
 * This file is part of hlquery, released under the BSD License version 3.
 */

const Validator = require('../utils/Validator');

/**
 * SAM API operations
 */
class SAM {
    constructor(request) {
        this.request = request;
    }

    async search(collectionName, query, params = {}) {
        Validator.validateCollectionName(collectionName);

        if (typeof query !== 'string' || query.trim() === '') {
            throw new Error('SAM query must be a non-empty string');
        }

        if (params === null || typeof params !== 'object' || Array.isArray(params)) {
            throw new Error('SAM search params must be an object');
        }

        return await this.request.execute('GET', '/sam/search', null, {
            ...params,
            collection: collectionName,
            q: query
        });
    }

    async status(collectionName = null, params = {}) {
        if (params === null || typeof params !== 'object' || Array.isArray(params)) {
            throw new Error('SAM status params must be an object');
        }

        const queryParams = { ...params };

        if (collectionName !== null && collectionName !== undefined && collectionName !== '') {
            Validator.validateCollectionName(collectionName);
            queryParams.collection = collectionName;
        }

        return await this.request.execute('GET', '/sam/status', null, queryParams);
    }

    async history(collectionName = null, limit = 100, params = {}) {
        if (params === null || typeof params !== 'object' || Array.isArray(params)) {
            throw new Error('SAM history params must be an object');
        }

        const queryParams = {
            ...params,
            limit: Number(limit)
        };

        if (collectionName !== null && collectionName !== undefined && collectionName !== '') {
            Validator.validateCollectionName(collectionName);
            queryParams.collection = collectionName;
        }

        return await this.request.execute('GET', '/sam/history', null, queryParams);
    }
}

module.exports = SAM;
