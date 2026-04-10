/**
 * hlquery Node.js Client - Stopwords API
 *
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 *
 * This file is part of hlquery, released under the BSD License version 3.
 */

const Validator = require('../utils/Validator');
const { ValidationException } = require('./Exceptions');

function validateWord(word, fieldName = 'word') {
    if (!word || typeof word !== 'string' || word.trim() === '') {
        throw new ValidationException(`${fieldName} must be a non-empty string`);
    }
}

/**
 * Stopwords API operations
 */
class Stopwords {
    constructor(request) {
        this.request = request;
    }

    async list(collectionName) {
        Validator.validateCollectionName(collectionName);
        return await this.request.execute('GET', `/collections/${encodeURIComponent(collectionName)}/stopwords`);
    }

    async create(collectionName, params) {
        Validator.validateCollectionName(collectionName);
        return await this.request.execute('POST', `/collections/${encodeURIComponent(collectionName)}/stopwords`, params);
    }

    async delete(collectionName, word) {
        Validator.validateCollectionName(collectionName);
        validateWord(word);
        return await this.request.execute('DELETE', `/collections/${encodeURIComponent(collectionName)}/stopwords/${encodeURIComponent(word)}`);
    }

    async listAll() {
        return await this.request.execute('GET', '/stopwords');
    }

    async listGlobal() {
        return await this.request.execute('GET', '/stopwords/global');
    }

    async createGlobal(params) {
        return await this.request.execute('POST', '/stopwords/global', params);
    }

    async deleteGlobal(word) {
        validateWord(word);
        return await this.request.execute('DELETE', `/stopwords/global/${encodeURIComponent(word)}`);
    }
}

module.exports = Stopwords;
