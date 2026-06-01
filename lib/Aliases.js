/**
 * hlquery Node.js Client - Aliases API
 *
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 *
 * This file is part of hlquery, released under the BSD License version 3.
 */

const Validator = require('../utils/Validator');

/**
 * Aliases API operations
 */
class Aliases {
    constructor(request) {
        this.request = request;
    }

    async list() {
        return await this.request.execute('GET', '/aliases');
    }

    async listCollection(collectionName) {
        Validator.validateCollectionName(collectionName);
        return await this.request.execute('GET', `/collections/${encodeURIComponent(collectionName)}/aliases`);
    }

    async get(name) {
        Validator.validateCollectionName(name);
        return await this.request.execute('GET', `/aliases/${encodeURIComponent(name)}`);
    }

    async create(name, params) {
        Validator.validateCollectionName(name);
        return await this.request.execute('POST', `/aliases/${encodeURIComponent(name)}`, params);
    }

    async update(name, params) {
        Validator.validateCollectionName(name);
        return await this.request.execute('PUT', `/aliases/${encodeURIComponent(name)}`, params);
    }

    async upsert(name, params) {
        return await this.create(name, params);
    }

    async delete(name) {
        Validator.validateCollectionName(name);
        return await this.request.execute('DELETE', `/aliases/${encodeURIComponent(name)}`);
    }
}

module.exports = Aliases;
