/**
 * hlquery Node.js Client - Synonyms API
 *
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 *
 * This file is part of hlquery, released under the BSD License version 3.
 */

const Validator = require('../utils/Validator');

/**
 * Synonyms API operations
 */
class Synonyms {
    constructor(request) {
        this.request = request;
    }

    async list(collectionName) {
        Validator.validateCollectionName(collectionName);
        return await this.request.execute('GET', `/collections/${encodeURIComponent(collectionName)}/synonyms`);
    }

    async get(collectionName, id) {
        Validator.validateCollectionName(collectionName);
        Validator.validateDocumentId(id);
        return await this.request.execute('GET', `/collections/${encodeURIComponent(collectionName)}/synonyms/${encodeURIComponent(id)}`);
    }

    async create(collectionName, id, synonym) {
        Validator.validateCollectionName(collectionName);
        Validator.validateDocumentId(id);
        return await this.request.execute('POST', `/collections/${encodeURIComponent(collectionName)}/synonyms/${encodeURIComponent(id)}`, synonym);
    }

    async update(collectionName, id, synonym) {
        Validator.validateCollectionName(collectionName);
        Validator.validateDocumentId(id);
        return await this.request.execute('PUT', `/collections/${encodeURIComponent(collectionName)}/synonyms/${encodeURIComponent(id)}`, synonym);
    }

    async upsert(collectionName, id, synonym) {
        return await this.create(collectionName, id, synonym);
    }

    async delete(collectionName, id) {
        Validator.validateCollectionName(collectionName);
        Validator.validateDocumentId(id);
        return await this.request.execute('DELETE', `/collections/${encodeURIComponent(collectionName)}/synonyms/${encodeURIComponent(id)}`);
    }

    async listAll() {
        return await this.request.execute('GET', '/synonyms');
    }

    async listGlobal() {
        return await this.request.execute('GET', '/synonyms/global');
    }

    async getGlobal(id) {
        Validator.validateDocumentId(id);
        return await this.request.execute('GET', `/synonyms/global/${encodeURIComponent(id)}`);
    }

    async createGlobal(id, synonym) {
        Validator.validateDocumentId(id);
        return await this.request.execute('POST', `/synonyms/global/${encodeURIComponent(id)}`, synonym);
    }

    async updateGlobal(id, synonym) {
        Validator.validateDocumentId(id);
        return await this.request.execute('PUT', `/synonyms/global/${encodeURIComponent(id)}`, synonym);
    }

    async upsertGlobal(id, synonym) {
        return await this.createGlobal(id, synonym);
    }

    async deleteGlobal(id) {
        Validator.validateDocumentId(id);
        return await this.request.execute('DELETE', `/synonyms/global/${encodeURIComponent(id)}`);
    }
}

module.exports = Synonyms;
