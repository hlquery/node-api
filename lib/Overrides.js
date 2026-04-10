/**
 * hlquery Node.js Client - Overrides API
 *
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 *
 * This file is part of hlquery, released under the BSD License version 3.
 */

const Validator = require('../utils/Validator');

/**
 * Overrides API operations
 */
class Overrides {
    constructor(request) {
        this.request = request;
    }

    async list(collectionName) {
        Validator.validateCollectionName(collectionName);
        return await this.request.execute('GET', `/collections/${encodeURIComponent(collectionName)}/overrides`);
    }

    async get(collectionName, id) {
        Validator.validateCollectionName(collectionName);
        Validator.validateDocumentId(id);
        return await this.request.execute('GET', `/collections/${encodeURIComponent(collectionName)}/overrides/${encodeURIComponent(id)}`);
    }

    async create(collectionName, id, override) {
        Validator.validateCollectionName(collectionName);
        Validator.validateDocumentId(id);
        return await this.request.execute('POST', `/collections/${encodeURIComponent(collectionName)}/overrides/${encodeURIComponent(id)}`, override);
    }

    async update(collectionName, id, override) {
        Validator.validateCollectionName(collectionName);
        Validator.validateDocumentId(id);
        return await this.request.execute('PUT', `/collections/${encodeURIComponent(collectionName)}/overrides/${encodeURIComponent(id)}`, override);
    }

    async upsert(collectionName, id, override) {
        return await this.create(collectionName, id, override);
    }

    async delete(collectionName, id) {
        Validator.validateCollectionName(collectionName);
        Validator.validateDocumentId(id);
        return await this.request.execute('DELETE', `/collections/${encodeURIComponent(collectionName)}/overrides/${encodeURIComponent(id)}`);
    }
}

module.exports = Overrides;
